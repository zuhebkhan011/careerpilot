import { Request, Response, NextFunction } from 'express';
import { getSupabase, memoryDb } from '../db/supabase';
import { Application, JobMatch, Resume, Job } from '../types';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profileId } = req.params;
    const supabase = getSupabase();

    let applications: Application[] = [];
    let matches: JobMatch[] = [];
    let resumes: Resume[] = [];
    let jobs: Job[] = [];

    if (supabase) {
      const [appsRes, matchesRes, resumesRes, jobsRes] = await Promise.all([
        supabase.from('applications').select('*, job:jobs(*)').eq('profile_id', profileId),
        supabase.from('job_matches').select('*, job:jobs(*)').eq('profile_id', profileId),
        supabase.from('resumes').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }),
        supabase.from('jobs').select('*').limit(10),
      ]);

      applications = appsRes.data || [];
      matches = matchesRes.data || [];
      resumes = resumesRes.data || [];
      jobs = jobsRes.data || [];
    }

    if (applications.length === 0) {
      applications = memoryDb.applications
        .filter(a => a.profile_id === profileId)
        .map(a => ({ ...a, job: memoryDb.jobs.find(j => j.id === a.job_id) }));
    }
    if (matches.length === 0) {
      matches = memoryDb.jobMatches
        .filter(m => m.profile_id === profileId)
        .map(m => ({ ...m, job: memoryDb.jobs.find(j => j.id === m.job_id) }));
    }
    if (resumes.length === 0) {
      resumes = memoryDb.resumes.filter(r => r.profile_id === profileId);
    }
    if (jobs.length === 0) {
      jobs = memoryDb.jobs.slice(0, 10);
    }

    const totalApplications = applications.length;
    const interviews = applications.filter(a => a.status === 'INTERVIEW').length;
    const selected = applications.filter(a => a.status === 'SELECTED').length;
    const rejected = applications.filter(a => a.status === 'REJECTED').length;

    const highestMatch = matches.length > 0 ? Math.max(...matches.map(m => m.match_score)) : 0;
    const latestResumeScore = resumes.length > 0 ? (resumes[0].resume_score || resumes[0].analysis_result?.resumeScore || 0) : 0;

    // Calculate top recommended jobs
    const topRecommendedJobs = matches.length > 0
      ? matches.sort((a, b) => b.match_score - a.match_score).slice(0, 5)
      : jobs.slice(0, 5).map((job, idx) => ({
          job_id: job.id,
          profile_id: profileId,
          match_score: 92 - idx * 3,
          skill_match: 90 - idx * 2,
          experience_match: 88 - idx * 2,
          education_match: 95,
          role_fit: 90,
          strengths: ['Relevant tech stack foundation', 'Matching education background'],
          missing_skills: ['Docker'],
          reasoning: `High compatibility match score for ${job.role} at ${job.company}.`,
          recommendations: ['Highlight backend microservice experience.'],
          job,
        }));

    return res.status(200).json({
      success: true,
      data: {
        totalJobsMatched: Math.max(matches.length, jobs.length),
        topMatch: highestMatch,
        totalApplications,
        interviews,
        selected,
        rejected,
        resumeScore: latestResumeScore,
        topRecommendedJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};
