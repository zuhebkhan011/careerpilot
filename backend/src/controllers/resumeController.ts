import { Request, Response, NextFunction } from 'express';
import pdfParse from 'pdf-parse';
import { geminiService } from '../services/GeminiService';
import { getSupabase, memoryDb } from '../db/supabase';
import { Resume, Profile } from '../types';
import crypto from 'crypto';

export const analyzeResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let rawText = '';
    let profileId = req.body.profileId || req.body.profile_id;

    // Check if file uploaded via multer or base64 or raw text provided
    if (req.file) {
      const pdfBuffer = req.file.buffer;
      const parsedPdf = await pdfParse(pdfBuffer);
      rawText = parsedPdf.text;
    } else if (req.body.text) {
      rawText = req.body.text;
    } else if (req.body.base64) {
      const buffer = Buffer.from(req.body.base64, 'base64');
      const parsedPdf = await pdfParse(buffer);
      rawText = parsedPdf.text;
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'No resume PDF file or text provided' },
      });
    }

    if (!rawText || rawText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_RESUME', message: 'Could not extract readable text from resume document' },
      });
    }

    // Call Gemini AI Service to parse structured JSON
    const { parsedData, resumeScore } = await geminiService.analyzeResume(rawText);

    const supabase = getSupabase();
    let updatedProfile: Profile;

    if (!profileId) {
      profileId = crypto.randomUUID();
    }

    const newProfileData: Profile = {
      id: profileId,
      name: parsedData.name || 'Candidate',
      email: parsedData.email || 'candidate@example.com',
      phone: parsedData.phone || '',
      location: parsedData.location || '',
      education: parsedData.education || '',
      degree: parsedData.degree || '',
      college: parsedData.college || '',
      graduation_year: parsedData.graduation_year || '',
      skills: parsedData.skills || [],
      experience: parsedData.experience || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      achievements: parsedData.achievements || [],
      languages: parsedData.languages || [],
      updated_at: new Date().toISOString(),
    };

    const resumeRecord: Resume = {
      id: crypto.randomUUID(),
      profile_id: profileId,
      file_name: req.file?.originalname || 'uploaded_resume.pdf',
      raw_text: rawText,
      parsed_data: parsedData,
      resume_score: resumeScore,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      // Upsert profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .upsert(newProfileData)
        .select()
        .single();
      if (profErr) throw profErr;
      updatedProfile = prof;

      // Save resume record
      await supabase.from('resumes').insert(resumeRecord);

      // Audit AI Feedback log
      await supabase.from('ai_feedback').insert({
        profile_id: profileId,
        type: 'RESUME_ANALYSIS',
        input_data: { textLength: rawText.length, fileName: resumeRecord.file_name },
        output_data: { parsedData, resumeScore },
      });
    } else {
      const pIdx = memoryDb.profiles.findIndex(p => p.id === profileId);
      if (pIdx >= 0) {
        memoryDb.profiles[pIdx] = { ...memoryDb.profiles[pIdx], ...newProfileData };
      } else {
        memoryDb.profiles.push(newProfileData);
      }
      memoryDb.resumes.push(resumeRecord);
      memoryDb.aiFeedback.push({
        id: crypto.randomUUID(),
        profile_id: profileId,
        type: 'RESUME_ANALYSIS',
        input_data: { textLength: rawText.length },
        output_data: { parsedData, resumeScore },
        created_at: new Date().toISOString(),
      });
      updatedProfile = newProfileData;
    }

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        profile: updatedProfile,
        resume: resumeRecord,
        resumeScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const reviewResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profileId, rawText } = req.body;
    const supabase = getSupabase();
    let profile: Partial<Profile> = req.body.profile || {};

    if (profileId && !profile.skills) {
      if (supabase) {
        const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single();
        if (data) profile = data;
      } else {
        const found = memoryDb.profiles.find(p => p.id === profileId);
        if (found) profile = found;
      }
    }

    const review = await geminiService.reviewResume(profile, rawText);

    if (supabase && profileId) {
      await supabase.from('ai_feedback').insert({
        profile_id: profileId,
        type: 'RESUME_IMPROVEMENT',
        input_data: { profile, rawText: rawText ? 'provided' : undefined },
        output_data: review,
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumesByProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profileId } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase.from('resumes').select('*').eq('profile_id', profileId);
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    const list = memoryDb.resumes.filter(r => r.profile_id === profileId);
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeId } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase.from('resumes').select('*').eq('id', resumeId).single();
      if (error || !data) {
        return res.status(404).json({ success: false, error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' } });
      }
      return res.status(200).json({ success: true, data });
    }

    const found = memoryDb.resumes.find(r => r.id === resumeId);
    if (!found) {
      return res.status(404).json({ success: false, error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' } });
    }
    return res.status(200).json({ success: true, data: found });
  } catch (error) {
    next(error);
  }
};
