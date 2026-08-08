const API_BASE = '/api';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  education?: string;
  degree?: string;
  college?: string;
  graduation_year?: string;
  skills: string[];
  experience: any[];
  projects: any[];
  certifications: string[];
  achievements: string[];
  languages: string[];
}

export interface JobData {
  id: string;
  company: string;
  role: string;
  location: string;
  work_mode: string;
  employment_type: string;
  salary: string;
  experience_required: string;
  education_required: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  preferred_skills: string[];
}

export interface JobMatchData {
  id: string;
  profile_id: string;
  job_id: string;
  match_score: number;
  skill_match: number;
  experience_match: number;
  education_match: number;
  role_fit: number;
  strengths: string[];
  missing_skills: string[];
  partial_matches: string[];
  reasoning: string;
  recommendations: string[];
  job?: JobData;
}

export interface ApplicationData {
  id: string;
  profile_id: string;
  job_id: string;
  status: 'INTERESTED' | 'APPLIED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';
  applied_at?: string;
  updated_at?: string;
  notes?: string;
  job?: JobData;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error?.message || body.message || 'API Request failed');
  }
  return body.data !== undefined ? body.data : body;
}

export const api = {
  // Health
  checkHealth: () => request<{ message: string }>('/health'),

  // Profiles
  getProfile: (id: string = 'default') => request<ProfileData>(`/profiles/${id}`),
  createProfile: (profile: Partial<ProfileData>) =>
    request<ProfileData>('/profiles', { method: 'POST', body: JSON.stringify(profile) }),
  updateProfile: (id: string, updates: Partial<ProfileData>) =>
    request<ProfileData>(`/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  // Resumes
  analyzeResumeText: (text: string, profileId?: string) =>
    request<{ profile: ProfileData; resumeScore: number }>('/resumes/analyze', {
      method: 'POST',
      body: JSON.stringify({ text, profileId }),
    }),
  analyzeResumeFile: async (file: File, profileId?: string) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (profileId) formData.append('profileId', profileId);

    const res = await fetch(`${API_BASE}/resumes/analyze`, {
      method: 'POST',
      body: formData,
    });
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Resume upload failed');
    return body.data;
  },
  reviewResume: (profileId: string) =>
    request<any>('/resumes/review', { method: 'POST', body: JSON.stringify({ profileId }) }),

  // Jobs
  getJobs: (filters?: Record<string, string>) => {
    const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request<JobData[]>(`/jobs${query}`);
  },
  getJobById: (id: string) => request<JobData>(`/jobs/${id}`),
  matchJob: (jobId: string, profileId: string) =>
    request<JobMatchData>(`/jobs/${jobId}/match`, {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    }),
  getRecommendedJobs: (profileId: string) =>
    request<JobMatchData[]>(`/jobs/recommended/${profileId}`),
  generateCoverLetter: (jobId: string, profileId: string) =>
    request<{ coverLetter: string; company: string; role: string }>(`/jobs/${jobId}/cover-letter`, {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    }),

  // Applications
  getApplications: (profileId: string) => request<ApplicationData[]>(`/applications/${profileId}`),
  createApplication: (app: { profile_id: string; job_id: string; status: string; notes?: string }) =>
    request<ApplicationData>('/applications', { method: 'POST', body: JSON.stringify(app) }),
  updateApplicationStatus: (id: string, status: string, notes?: string) =>
    request<ApplicationData>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
  deleteApplication: (id: string) =>
    request<{ message: string }>(`/applications/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: (profileId: string) =>
    request<{
      totalJobsMatched: number;
      topMatch: number;
      totalApplications: number;
      interviews: number;
      selected: number;
      rejected: number;
      resumeScore: number;
      topRecommendedJobs: JobMatchData[];
    }>(`/dashboard/${profileId}`),
};
