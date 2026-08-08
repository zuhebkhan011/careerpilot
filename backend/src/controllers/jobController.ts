import { Request, Response, NextFunction } from 'express';
import { getSupabase, memoryDb } from '../db/supabase';
import { geminiService } from '../services/GeminiService';
import { Job, JobMatch, Profile } from '../types';
import crypto from 'crypto';

// Helper to fetch profile
async function fetchProfile(profileId: string): Promise<Profile | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single();
      if (!error && data) return data;
    } catch {
      // Ignore and fallback
    }
  }
  return memoryDb.profiles.find(p => p.id === profileId) || null;
}

// Helper to fetch single job
async function fetchJob(jobId: string): Promise<Job | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).single();
      if (!error && data) return data;
    } catch {
      // Ignore and fallback
    }
  }
  return memoryDb.jobs.find(j => j.id === jobId) || null;
}

// Helper to fetch all jobs
async function fetchAllJobs(): Promise<Job[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch {
      // Ignore and fallback
    }
  }
  return memoryDb.jobs;
}

export const getJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, workMode, employmentType, experience, skill, search } = req.query;
    let jobs = await fetchAllJobs();

    // Ensure sample jobs exist if list is empty
    if (jobs.length === 0 && !getSupabase()) {
      const { seedJobs } = require('../db/seed');
      await seedJobs();
      jobs = memoryDb.jobs;
    }

    // Apply filtering
    if (location) {
      const locStr = String(location).toLowerCase();
      jobs = jobs.filter(j => j.location.toLowerCase().includes(locStr));
    }

    if (workMode) {
      const modeStr = String(workMode).toLowerCase();
      jobs = jobs.filter(j => j.work_mode.toLowerCase().includes(modeStr));
    }

    if (employmentType) {
      const typeStr = String(employmentType).toLowerCase();
      jobs = jobs.filter(j => j.employment_type.toLowerCase().includes(typeStr));
    }

    if (skill) {
      const skillStr = String(skill).toLowerCase();
      jobs = jobs.filter(j => j.skills.some(s => s.toLowerCase().includes(skillStr)));
    }

    if (search) {
      const q = String(search).toLowerCase();
      jobs = jobs.filter(
        j =>
          j.role.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.jobId as string;
    const job = await fetchJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: `Job with ID ${jobId} not found` },
      });
    }

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const matchJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.jobId as string;
    const profileId = req.body.profileId as string;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'profileId is required for job matching' },
      });
    }

    const [profile, job] = await Promise.all([fetchProfile(profileId), fetchJob(jobId)]);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: `Profile ${profileId} not found` },
      });
    }

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: `Job ${jobId} not found` },
      });
    }

    const supabase = getSupabase();
    // Check cache in job_matches table
    if (supabase) {
      const { data: cached } = await supabase
        .from('job_matches')
        .select('*')
        .eq('profile_id', profileId)
        .eq('job_id', jobId)
        .single();
      if (cached) {
        return res.status(200).json({ success: true, data: cached });
      }
    } else {
      const cached = memoryDb.jobMatches.find(m => m.profile_id === profileId && m.job_id === jobId);
      if (cached) {
        return res.status(200).json({ success: true, data: cached });
      }
    }

    // Call Gemini AI for semantic matching
    const matchData = await geminiService.matchCandidateToJob(profile, job);

    const fullMatchRecord: JobMatch = {
      id: crypto.randomUUID(),
      ...matchData,
      created_at: new Date().toISOString(),
      job,
    };

    // Store match record
    if (supabase) {
      await supabase.from('job_matches').upsert(fullMatchRecord);
      await supabase.from('ai_feedback').insert({
        profile_id: profileId,
        job_id: jobId,
        type: 'JOB_MATCH',
        input_data: { profileId, jobId },
        output_data: matchData,
      });
    } else {
      const existingIdx = memoryDb.jobMatches.findIndex(m => m.profile_id === profileId && m.job_id === jobId);
      if (existingIdx >= 0) {
        memoryDb.jobMatches[existingIdx] = fullMatchRecord;
      } else {
        memoryDb.jobMatches.push(fullMatchRecord);
      }
    }

    return res.status(200).json({
      success: true,
      data: fullMatchRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profileId = req.params.profileId as string;
    const profile = await fetchProfile(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: `Profile ${profileId} not found` },
      });
    }

    let allJobs = await fetchAllJobs();
    if (allJobs.length === 0 && !getSupabase()) {
      const { seedJobs } = require('../db/seed');
      await seedJobs();
      allJobs = memoryDb.jobs;
    }

    const matches: (JobMatch & { job: Job })[] = [];

    // Analyze top 8 jobs for maximum speed and freshness
    const targetJobs = allJobs.slice(0, 8);

    for (const job of targetJobs) {
      const matchData = await geminiService.matchCandidateToJob(profile, job);
      matches.push({
        id: `rec-match-${profileId}-${job.id}`,
        ...matchData,
        job,
      });
    }

    // Sort by highest match score descending
    matches.sort((a, b) => b.match_score - a.match_score);

    return res.status(200).json({
      success: true,
      count: matches.length,
      topMatches: matches.slice(0, 5),
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = req.params.jobId as string;
    const profileId = req.body.profileId as string;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'profileId is required to generate cover letter' },
      });
    }

    const [profile, job] = await Promise.all([fetchProfile(profileId), fetchJob(jobId)]);

    if (!profile || !job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Profile or Job not found' },
      });
    }

    const coverLetterText = await geminiService.generateCoverLetter(profile, job);

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('ai_feedback').insert({
        profile_id: profileId,
        job_id: jobId,
        type: 'COVER_LETTER',
        input_data: { profileId, jobId },
        output_data: { coverLetter: coverLetterText },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        coverLetter: coverLetterText,
        company: job.company,
        role: job.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
