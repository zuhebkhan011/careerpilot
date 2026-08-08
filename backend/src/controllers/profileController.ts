import { Request, Response, NextFunction } from 'express';
import { getSupabase, memoryDb } from '../db/supabase';
import { Profile, ApiResponse } from '../types';
import crypto from 'crypto';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profileId } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      try {
        // Fetch profile AND latest resume analysis in one go
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();

        if (!profileError && profileData) {
          // Also fetch the latest resume analysis for this profile
          let latestAnalysis = null;
          try {
            const { data: resumeData } = await supabase
              .from('resumes')
              .select('analysis_result, resume_score, created_at')
              .eq('profile_id', profileId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (resumeData?.analysis_result) {
              latestAnalysis = resumeData.analysis_result;
            }
          } catch {
            // No resume yet — that's fine
          }

          return res.status(200).json({
            success: true,
            data: { ...profileData, analysis_result: latestAnalysis },
          });
        }
      } catch {
        // Fallback to memoryDb below
      }
    }

    // Memory DB fallback
    const found = memoryDb.profiles.find(p => p.id === profileId);
    if (!found) {
      // Return 404 — do NOT auto-create fake profiles
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: `Profile not found: ${profileId}` },
      });
    }

    // Attach latest analysis from memory resumes
    const latestResume = memoryDb.resumes
      .filter(r => r.profile_id === profileId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    return res.status(200).json({
      success: true,
      data: { ...found, analysis_result: latestResume?.analysis_result || null },
    });
  } catch (error) {
    next(error);
  }
};

export const createProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profileData = req.body;
    const supabase = getSupabase();
    const id = profileData.id || crypto.randomUUID();

    const newProfile: Profile = {
      ...profileData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('profiles').upsert(newProfile).select().single();
        if (!error && data) {
          return res.status(201).json({ success: true, data });
        }
      } catch {}
    }

    const existing = memoryDb.profiles.findIndex(p => p.id === id);
    if (existing >= 0) {
      memoryDb.profiles[existing] = newProfile;
    } else {
      memoryDb.profiles.push(newProfile);
    }

    return res.status(201).json({ success: true, data: newProfile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profileId } = req.params;
    const updates = req.body;
    const supabase = getSupabase();
    const updatedAt = new Date().toISOString();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: updatedAt })
          .eq('id', profileId)
          .select()
          .single();
        if (!error && data) {
          return res.status(200).json({ success: true, data });
        }
      } catch {}
    }

    const idx = memoryDb.profiles.findIndex(p => p.id === profileId);
    if (idx >= 0) {
      memoryDb.profiles[idx] = { ...memoryDb.profiles[idx], ...updates, updated_at: updatedAt };
      return res.status(200).json({ success: true, data: memoryDb.profiles[idx] });
    }

    return res.status(404).json({
      success: false,
      error: { code: 'PROFILE_NOT_FOUND', message: `Profile not found: ${profileId}` },
    });
  } catch (error) {
    next(error);
  }
};

export const listProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('updated_at', { ascending: false });
        if (!error && data) return res.status(200).json({ success: true, data });
      } catch {}
    }
    return res.status(200).json({ success: true, data: memoryDb.profiles });
  } catch (error) {
    next(error);
  }
};
