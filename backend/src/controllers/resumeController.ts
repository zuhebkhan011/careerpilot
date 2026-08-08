import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/GeminiService';
import { getSupabase, memoryDb } from '../db/supabase';
import { Resume, Profile } from '../types';
import crypto from 'crypto';

/**
 * Safely extract text from an uploaded file buffer.
 * Handles: PDF (via pdf-parse), TXT (UTF-8), DOCX (text fallback).
 * Returns { text, method, error } — NEVER throws.
 */
async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string
): Promise<{ text: string; method: string; error?: string }> {
  const fname = filename.toLowerCase();

  // 1. Try pdf-parse for .pdf files
  if (fname.endsWith('.pdf') || !fname.includes('.')) {
    try {
      // Use require to avoid ESModule default-is-not-function issue
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParseModule = require('pdf-parse');
      const pdfParse = typeof pdfParseModule === 'function'
        ? pdfParseModule
        : (pdfParseModule.default || pdfParseModule);

      if (typeof pdfParse !== 'function') {
        console.warn('[PDF] pdf-parse module loaded but not callable, trying text fallback');
      } else {
        const parsed = await pdfParse(buffer);
        const extractedText = (parsed.text || '').replace(/\0/g, '').trim();

        if (extractedText.length >= 30) {
          console.log(`[PDF] Extracted ${extractedText.length} chars via pdf-parse`);
          return { text: extractedText, method: 'pdf-parse' };
        }

        console.warn(`[PDF] pdf-parse returned only ${extractedText.length} chars — attempting UTF-8 fallback`);
      }
    } catch (pdfErr: any) {
      console.warn('[PDF] pdf-parse threw error:', pdfErr.message);
    }

    // UTF-8 fallback (works for text-embedded PDFs that pdf-parse misses)
    const utfText = buffer.toString('utf-8').replace(/\0/g, '').replace(/%PDF[\s\S]{0,200}/g, '').trim();
    if (utfText.length >= 30) {
      console.log(`[PDF] Fallback UTF-8 extracted ${utfText.length} chars`);
      return { text: utfText, method: 'utf8-fallback' };
    }

    return {
      text: '',
      method: 'pdf-parse+utf8-fallback',
      error: 'PDF_EXTRACTION_EMPTY',
    };
  }

  // 2. For .txt / .md files — direct UTF-8 decode
  if (fname.endsWith('.txt') || fname.endsWith('.md')) {
    const text = buffer.toString('utf-8').replace(/\0/g, '').trim();
    console.log(`[TXT] Extracted ${text.length} chars from text file`);
    return text.length >= 5 ? { text, method: 'utf8-text' } : { text: '', method: 'utf8-text', error: 'EMPTY_TEXT_FILE' };
  }

  // 3. DOCX / DOC — best-effort UTF-8 (extracts human-readable strings)
  if (fname.endsWith('.docx') || fname.endsWith('.doc')) {
    // Extract printable ASCII/Unicode text from binary DOCX
    const docxText = buffer
      .toString('utf-8')
      .replace(/[\x00-\x08\x0b\x0e-\x1f\x7f-\x9f]/g, ' ')
      .replace(/\s{3,}/g, '\n')
      .trim();
    console.log(`[DOCX] Best-effort extracted ${docxText.length} chars`);
    if (docxText.length >= 30) return { text: docxText, method: 'docx-utf8' };
    return { text: '', method: 'docx-utf8', error: 'DOCX_EXTRACTION_EMPTY' };
  }

  // 4. Unknown format — try UTF-8 anyway
  const fallbackText = buffer.toString('utf-8').replace(/\0/g, '').trim();
  if (fallbackText.length >= 30) return { text: fallbackText, method: 'generic-utf8' };
  return { text: '', method: 'generic-utf8', error: 'UNREADABLE_FORMAT' };
}

export const analyzeResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let rawText = '';
    let extractionMethod = 'direct-text';
    let profileId = req.body.profileId || req.body.profile_id;
    let extractionError: string | undefined;

    // === STEP 1: TEXT EXTRACTION ===
    if (req.file) {
      const { text, method, error } = await extractTextFromBuffer(
        req.file.buffer,
        req.file.originalname || 'upload.pdf'
      );
      rawText = text;
      extractionMethod = method;
      extractionError = error;

      console.log(`[UPLOAD] file="${req.file.originalname}" mime="${req.file.mimetype}" size=${req.file.size}bytes method="${method}" textLen=${rawText.length}`);
    } else if (req.body.text || req.body.resumeText || req.body.rawText) {
      rawText = (req.body.text || req.body.resumeText || req.body.rawText).trim();
      extractionMethod = 'text-body';
    } else if (req.body.base64) {
      try {
        const buffer = Buffer.from(req.body.base64, 'base64');
        const { text, method, error } = await extractTextFromBuffer(buffer, 'base64.pdf');
        rawText = text;
        extractionMethod = method;
        extractionError = error;
      } catch {
        rawText = '';
        extractionError = 'BASE64_DECODE_ERROR';
      }
    }

    // Clean NULL bytes and control characters
    rawText = rawText.replace(/\0/g, '').trim();

    // === STEP 2: VALIDATE TEXT — NEVER inject fake fallback ===
    if (!rawText || rawText.length < 20) {
      console.error(`[RESUME] PDF extraction failed: textLength=${rawText.length} error=${extractionError}`);
      return res.status(422).json({
        success: false,
        error: {
          code: 'PDF_EXTRACTION_ERROR',
          message:
            extractionError === 'PDF_EXTRACTION_EMPTY' || !rawText
              ? 'CareerPilot could not extract readable text from this PDF. Please ensure the PDF contains selectable text (not a scanned image), or paste your resume text directly below.'
              : 'The uploaded file appears to be empty or unreadable.',
          details: {
            extractionMethod,
            extractedLength: rawText.length,
            hint: 'Try uploading a different PDF or use the "Paste resume text" option.',
          },
        },
      });
    }

    // === STEP 3: CALL GEMINI AI — with real extracted text ===
    console.log(`[GEMINI] Sending resume to AI. textLength=${rawText.length} method=${extractionMethod}`);
    let analysis;
    try {
      analysis = await geminiService.analyzeResume(rawText);
    } catch (aiErr: any) {
      console.error('[GEMINI] AI analysis error:', aiErr.message);
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_ANALYSIS_ERROR',
          message: 'AI analysis is temporarily unavailable. Your resume was uploaded successfully.',
          resumeTextLength: rawText.length,
          hint: 'Click "Retry Analysis" to try again without re-uploading your resume.',
        },
      });
    }

    const { parsedData, resumeScore } = analysis;

    if (!profileId) {
      profileId = 'demo-profile-1';
    }

    // === STEP 4: BUILD PROFILE — use only AI-extracted data, no hardcoded defaults ===
    const newProfileData: Profile = {
      id: profileId,
      name: parsedData.name || 'Unknown Candidate',
      email: parsedData.email || '',
      phone: parsedData.phone || '',
      location: parsedData.location || '',
      education: parsedData.education || '',
      degree: parsedData.degree || '',
      college: parsedData.college || '',
      graduation_year: parsedData.graduation_year || '',
      summary: parsedData.summary || '',
      skills: parsedData.skills && parsedData.skills.length > 0 ? parsedData.skills : [],
      experience: parsedData.experience || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      achievements: parsedData.achievements || [],
      languages: parsedData.languages || [],
      preferred_roles: analysis.recommendedRoles || [],
      updated_at: new Date().toISOString(),
    };

    const resumeRecord: Resume = {
      id: crypto.randomUUID(),
      profile_id: profileId,
      file_name: req.file?.originalname || 'uploaded_resume.txt',
      raw_text: rawText,
      parsed_data: parsedData,
      resume_score: resumeScore,
      analysis_result: analysis,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // === STEP 5: PERSIST to Supabase or memoryDb ===
    const supabase = getSupabase();
    let updatedProfile: Profile = newProfileData;

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
            input_data: { textLength: rawText.length, fileName: resumeRecord.file_name, method: extractionMethod },
            output_data: analysis,
          });
        }
      } catch (dbErr: any) {
        console.warn('[DB] Supabase persistence failed, using memoryDb:', dbErr.message);
        updatedProfile = newProfileData;
      }
    }

    // Always persist to memoryDb regardless (so in-memory API works)
    const pIdx = memoryDb.profiles.findIndex(p => p.id === profileId);
    if (pIdx >= 0) {
      memoryDb.profiles[pIdx] = { ...memoryDb.profiles[pIdx], ...newProfileData };
    } else {
      memoryDb.profiles.push(newProfileData);
    }
    memoryDb.resumes.push(resumeRecord);

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        profile: updatedProfile,
        resume: {
          id: resumeRecord.id,
          profile_id: profileId,
          file_name: resumeRecord.file_name,
          resume_score: resumeScore,
          extraction_method: extractionMethod,
          text_length: rawText.length,
        },
        resumeScore,
        analysis,
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
