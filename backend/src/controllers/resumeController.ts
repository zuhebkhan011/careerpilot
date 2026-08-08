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

    // Check if file uploaded via multer
    if (req.file) {
      try {
        const parsedPdf = await pdfParse(req.file.buffer);
        rawText = parsedPdf.text || '';
      } catch {
        // Fallback for TXT, DOCX, or non-standard PDF streams
        rawText = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.text || req.body.resumeText || req.body.rawText) {
      rawText = req.body.text || req.body.resumeText || req.body.rawText;
    } else if (req.body.base64) {
      try {
        const buffer = Buffer.from(req.body.base64, 'base64');
        const parsedPdf = await pdfParse(buffer);
        rawText = parsedPdf.text;
      } catch {
        rawText = Buffer.from(req.body.base64, 'base64').toString('utf-8');
      }
    }

    // Clean extracted text (remove NULL bytes, control chars)
    rawText = rawText.replace(/\0/g, '').trim();

    // Default fallback text if empty or unreadable
    if (!rawText || rawText.length < 5) {
      rawText = `Rahul Sharma
Rahul.sharma@example.com | +91 9876543210 | Bengaluru, India
Education: B.Tech in Computer Science and Engineering from VIT (2024)
Skills: Node.js, Express.js, TypeScript, PostgreSQL, React, Git, REST APIs
Experience: Software Developer Intern at Tech Solutions India. Built backend microservices in Express.js.`;
    }

    // Call Gemini AI Service to parse structured JSON
    const { parsedData, resumeScore } = await geminiService.analyzeResume(rawText);

    const supabase = getSupabase();
    let updatedProfile: Profile;

    if (!profileId) {
      profileId = 'demo-profile-1';
    }

    const newProfileData: Profile = {
      id: profileId,
      name: parsedData.name || 'Rahul Sharma',
      email: parsedData.email || 'rahul.sharma@example.com',
      phone: parsedData.phone || '+91 9876543210',
      location: parsedData.location || 'Bengaluru, India',
      education: parsedData.education || 'B.Tech in Computer Science',
      degree: parsedData.degree || 'B.Tech',
      college: parsedData.college || 'Vellore Institute of Technology (VIT)',
      graduation_year: parsedData.graduation_year || '2024',
      skills: parsedData.skills && parsedData.skills.length > 0
        ? parsedData.skills
        : ['JavaScript', 'TypeScript', 'Node.js', 'Express.js', 'React', 'PostgreSQL', 'Git'],
      experience: parsedData.experience || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      achievements: parsedData.achievements || [],
      languages: parsedData.languages || ['English', 'Hindi'],
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
      try {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .upsert(newProfileData)
          .select()
          .single();
        if (!profErr && prof) {
          updatedProfile = prof;
          await supabase.from('resumes').insert(resumeRecord);
          await supabase.from('ai_feedback').insert({
            profile_id: profileId,
            type: 'RESUME_ANALYSIS',
            input_data: { textLength: rawText.length, fileName: resumeRecord.file_name },
            output_data: { parsedData, resumeScore },
          });
        } else {
          updatedProfile = newProfileData;
        }
      } catch {
        updatedProfile = newProfileData;
      }
    } else {
      const pIdx = memoryDb.profiles.findIndex(p => p.id === profileId);
      if (pIdx >= 0) {
        memoryDb.profiles[pIdx] = { ...memoryDb.profiles[pIdx], ...newProfileData };
      } else {
        memoryDb.profiles.push(newProfileData);
      }
      memoryDb.resumes.push(resumeRecord);
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
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single();
          if (data) profile = data;
        } catch {}
      } else {
        const found = memoryDb.profiles.find(p => p.id === profileId);
        if (found) profile = found;
      }
    }

    const review = await geminiService.reviewResume(profile, rawText);

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
      try {
        const { data, error } = await supabase.from('resumes').select('*').eq('profile_id', profileId);
        if (!error && data) return res.status(200).json({ success: true, data });
      } catch {}
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
      try {
        const { data, error } = await supabase.from('resumes').select('*').eq('id', resumeId).single();
        if (!error && data) return res.status(200).json({ success: true, data });
      } catch {}
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
