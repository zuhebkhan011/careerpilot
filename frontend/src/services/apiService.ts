import { Job, Application, ResumeProfile, MatchAnalysis, ApplicationStatus } from '../types';

const API_BASE = '/api';

// Status mapper between Backend SQL Enums and Frontend UI labels
export const statusToUI = (status: string): ApplicationStatus => {
  switch (status) {
    case 'INTERESTED': return 'Saved';
    case 'APPLIED': return 'Applied';
    case 'INTERVIEW': return 'Interviewing';
    case 'SELECTED': return 'Offered';
    case 'REJECTED': return 'Rejected';
    default: return (status as ApplicationStatus) || 'Applied';
  }
};

export const statusToBackend = (status: string): string => {
  switch (status) {
    case 'Saved': return 'INTERESTED';
    case 'Applied': return 'APPLIED';
    case 'Interviewing': return 'INTERVIEW';
    case 'Offered': return 'SELECTED';
    case 'Rejected': return 'REJECTED';
    default: return status;
  }
};

// Map backend job schema to frontend Job interface
const mapBackendJobToUI = (bJob: any): Job => {
  return {
    id: bJob.id,
    company: bJob.company,
    role: bJob.role,
    location: bJob.location,
    salary: bJob.salary,
    workMode: bJob.work_mode || bJob.workMode || 'Hybrid',
    matchScore: bJob.match_score || bJob.matchScore || 85,
    description: bJob.description || '',
    requirements: bJob.responsibilities || bJob.requirements || [],
    skillsRequired: bJob.skills || bJob.skillsRequired || [],
    postedDate: 'Recently',
    experienceLevel: bJob.experience_required || '0-2 Years',
    department: 'Engineering',
    benefits: ['Health Insurance', 'Flexible Working', 'Performance Bonus'],
    source: bJob.source || 'demo',
    sourceUrl: bJob.source_url || bJob.sourceUrl || (bJob.source === 'linkedin' ? `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(bJob.company + ' ' + bJob.role)}` : undefined),
  };
};

export const apiService = {
  // 1. Health Check
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  },

  // 2. Candidate Profile APIs
  getProfile: async (profileId: string = 'demo-profile-1'): Promise<ResumeProfile> => {
    const res = await fetch(`${API_BASE}/profiles/${profileId}`);
    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to fetch candidate profile');
    }
    const p = body.data;
    return {
      id: p.id,
      fullName: p.name || 'Candidate Name',
      email: p.email || 'candidate@example.com',
      phone: p.phone || '+91 9876543210',
      location: p.location || 'Bengaluru, India',
      targetRole: p.degree || 'Full Stack Developer',
      yearsOfExperience: 1,
      summary: `${p.degree || 'Engineering Graduate'} from ${p.college || 'University'} with core skills in ${p.skills?.slice(0, 4).join(', ')}.`,
      skills: p.skills || [],
      experiences: (p.experience || []).map((e: any, idx: number) => ({
        id: `exp-${idx}`,
        title: e.title || 'Developer Intern',
        company: e.company || 'Tech Company',
        period: e.duration || '2024',
        description: e.description || '',
      })),
      education: [
        {
          id: 'edu-1',
          degree: p.education || p.degree || 'B.Tech CS',
          institution: p.college || 'University',
          year: p.graduation_year || '2024',
        },
      ],
      updatedAt: p.updated_at || new Date().toISOString(),
      college: p.college,
      degree: p.degree,
      graduation_year: p.graduation_year,
      projects: p.projects || [],
      certifications: p.certifications || [],
      achievements: p.achievements || [],
      languages: p.languages || [],
    };
  },

  // 3. Job Listing & Search APIs
  getJobs: async (filters?: any, profileId?: string): Promise<Job[]> => {
    const queryParams = new URLSearchParams(filters || {});
    if (profileId) queryParams.set('profileId', profileId);
    const query = queryParams.toString() ? '?' + queryParams.toString() : '';
    const res = await fetch(`${API_BASE}/jobs${query}`);
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Failed to fetch jobs');
    return (body.data || []).map(mapBackendJobToUI);
  },

  // 4. Semantic Job Matching API
  matchJob: async (jobId: string, profileId: string = 'demo-profile-1'): Promise<MatchAnalysis> => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Job match failed');
    const data = body.data;

    let fitRating: MatchAnalysis['fitRating'] = 'Moderate Match';
    if (data.match_score >= 85) fitRating = 'Strong Match';
    else if (data.match_score >= 70) fitRating = 'Moderate Match';
    else if (data.match_score >= 50) fitRating = 'Growth Opportunity';
    else fitRating = 'Low Match';

    return {
      matchScore: data.match_score || 85,
      fitRating,
      summary: data.reasoning || 'Candidate demonstrates good core alignment for role.',
      strengths: data.strengths || [],
      missingSkills: data.missing_skills || [],
      partialMatches: data.partial_matches || [],
      recommendations: data.recommendations || [],
      skill_match: data.skill_match,
      experience_match: data.experience_match,
      education_match: data.education_match,
      role_fit: data.role_fit,
    };
  },

  // 5. Tailored Cover Letter Generator API
  generateCoverLetter: async (jobId: string, profileId: string = 'demo-profile-1'): Promise<{ coverLetter: string }> => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Failed to generate cover letter');
    return { coverLetter: body.data.coverLetter };
  },

  // 6. Resume Upload & Analysis APIs
  // Helper to map backend profile & analysis to ResumeProfile
  _mapProfileResponse: (body: any, fallbackProfileId: string = 'demo-profile-1', text?: string): ResumeProfile => {
    const p = body.data?.profile || body.data;
    const analysis = body.data?.analysis || body.data?.resume?.analysis_result;
    return {
      id: p?.id || fallbackProfileId,
      fullName: p?.name || '',
      email: p?.email || '',
      phone: p?.phone || '',
      location: p?.location || '',
      targetRole: (analysis?.recommendedRoles || [])[0] || '',
      yearsOfExperience: 0,
      summary: p?.summary || '',
      skills: p?.skills || [],
      experiences: (p?.experience || []).map((e: any, idx: number) => ({
        id: `exp-${idx}`,
        title: e.title || '',
        company: e.company || '',
        period: e.duration || '',
        description: e.description || '',
      })),
      education: p?.education ? [{
        id: 'edu-1',
        degree: p?.education || p?.degree || '',
        institution: p?.college || '',
        year: p?.graduation_year || '',
      }] : [],
      updatedAt: p?.updated_at || new Date().toISOString(),
      rawText: text || body.data?.resume?.raw_text || '',
      college: p?.college,
      degree: p?.degree,
      graduation_year: p?.graduation_year,
      projects: p?.projects || [],
      certifications: p?.certifications || [],
      achievements: p?.achievements || [],
      languages: p?.languages || [],
      analysisData: analysis
        ? {
            resumeScore: typeof analysis.resumeScore === 'number' ? analysis.resumeScore : 0,
            scoreExplanation: analysis.scoreExplanation || '',
            strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
            weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
            missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [],
            improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
            recommendedRoles: Array.isArray(analysis.recommendedRoles) ? analysis.recommendedRoles : [],
          }
        : undefined,
    };
  },

  uploadResumeFile: async (file: File, profileId: string = 'demo-profile-1'): Promise<ResumeProfile> => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('profileId', profileId);

    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData,
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Resume upload failed');
    return apiService._mapProfileResponse(body, profileId);
  },

  // Alias for ResumeView component
  uploadResumePDF: async (formData: FormData): Promise<ResumeProfile | null> => {
    const profileId = (formData.get('profileId') as string) || 'demo-profile-1';
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData,
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      const errCode = body.error?.code || 'UPLOAD_FAILED';
      const errMsg = body.error?.message || 'Resume upload failed';
      const err: any = new Error(errMsg);
      err.code = errCode;
      throw err;
    }
    return apiService._mapProfileResponse(body, profileId);
  },

  analyzeResumeText: async (text: string, profileId: string = 'demo-profile-1'): Promise<ResumeProfile> => {
    const res = await fetch(`${API_BASE}/resumes/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, profileId }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Resume text analysis failed');
    return apiService._mapProfileResponse(body, profileId, text);
  },

  // Alias for ResumeView
  analyzeResume: async (opts: { profileId: string; resumeText: string }): Promise<ResumeProfile | null> => {
    return apiService.analyzeResumeText(opts.resumeText, opts.profileId).catch(() => null);
  },

  reviewResume: async (opts: { profileId?: string; resumeText?: string } | string): Promise<any> => {
    const profileId = typeof opts === 'string' ? opts : (opts.profileId || 'demo-profile-1');
    const res = await fetch(`${API_BASE}/resumes/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Resume review failed');
    return body.data;
  },

  // 7. Applications Tracking APIs (Persisted in Supabase PostgreSQL)
  getApplications: async (profileId: string = 'demo-profile-1'): Promise<Application[]> => {
    const res = await fetch(`${API_BASE}/applications/${profileId}`);
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Failed to fetch applications');
    return (body.data || []).map((app: any) => ({
      id: app.id,
      jobId: app.job_id,
      company: app.job?.company || 'Company',
      role: app.job?.role || 'Role',
      location: app.job?.location || 'Location',
      salary: app.job?.salary || 'Competitive',
      workMode: app.job?.work_mode || 'Hybrid',
      status: statusToUI(app.status),
      appliedDate: app.applied_at ? app.applied_at.split('T')[0] : app.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      lastUpdated: app.updated_at ? app.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: app.notes || '',
      matchScore: 88,
      job: app.job ? mapBackendJobToUI(app.job) : undefined,
    }));
  },

  saveApplication: async (appData: { profileId?: string; jobId: string; status: ApplicationStatus; notes?: string }): Promise<Application> => {
    const profileId = appData.profileId || 'demo-profile-1';
    const backendStatus = statusToBackend(appData.status);

    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profileId,
        job_id: appData.jobId,
        status: backendStatus,
        notes: appData.notes || '',
      }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Failed to save application');
    const app = body.data;
    return {
      id: app.id,
      jobId: app.job_id,
      company: app.job?.company || 'Company',
      role: app.job?.role || 'Role',
      location: app.job?.location || 'Location',
      salary: app.job?.salary || 'Competitive',
      workMode: app.job?.work_mode || 'Hybrid',
      status: statusToUI(app.status),
      appliedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: app.notes || '',
      matchScore: 88,
    };
  },

  updateApplicationStatus: async (appId: string, status: ApplicationStatus, notes?: string): Promise<void> => {
    const backendStatus = statusToBackend(status);
    const res = await fetch(`${API_BASE}/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: backendStatus, notes }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Failed to update status');
  },

  deleteApplication: async (appId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/applications/${appId}`, {
      method: 'DELETE',
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Failed to delete application');
  },

  // 8. Dashboard Aggregated Stats API
  getDashboard: async (profileId: string = 'demo-profile-1'): Promise<any> => {
    const res = await fetch(`${API_BASE}/dashboard/${profileId}`);
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Failed to load dashboard metrics');
    return body.data;
  },

  // 9. Job Match alias (used by JobMatchModal)
  getJobMatch: async (jobId: string, profileId: string = 'demo-profile-1'): Promise<any> => {
    return apiService.matchJob(jobId, profileId);
  },

  // 10. AI Career Coach Advice (uses resume review endpoint or fallback)
  getCareerAdvice: async (profileId: string, resume: any): Promise<any | null> => {
    try {
      const res = await fetch(`${API_BASE}/resumes/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) return null;
      return body.data;
    } catch {
      return null;
    }
  },
};
