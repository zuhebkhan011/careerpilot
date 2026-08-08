export interface Profile {
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
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    title: string;
    tech_stack: string[];
    description: string;
    link?: string;
  }>;
  certifications: string[];
  achievements: string[];
  languages: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Resume {
  id: string;
  profile_id: string;
  file_name: string;
  file_url?: string;
  raw_text?: string;
  parsed_data: Partial<Profile>;
  resume_score: number;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  work_mode: string; // 'On-site' | 'Remote' | 'Hybrid'
  employment_type: string; // 'Full-time' | 'Part-time' | 'Internship' | 'Contract'
  salary: string;
  experience_required: string;
  education_required: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  preferred_skills: string[];
  created_at?: string;
}

export interface JobMatch {
  id: string;
  profile_id: string;
  job_id: string;
  match_score: number; // 0 - 100
  skill_match: number;
  experience_match: number;
  education_match: number;
  role_fit: number;
  strengths: string[];
  missing_skills: string[];
  partial_matches: string[];
  reasoning: string;
  recommendations: string[];
  created_at?: string;
  job?: Job;
}

export type ApplicationStatus = 'INTERESTED' | 'APPLIED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

export interface Application {
  id: string;
  profile_id: string;
  job_id: string;
  status: ApplicationStatus;
  applied_at?: string;
  updated_at?: string;
  notes?: string;
  created_at?: string;
  job?: Job;
}

export type AIFeedbackType = 'RESUME_ANALYSIS' | 'JOB_MATCH' | 'COVER_LETTER' | 'RESUME_IMPROVEMENT' | 'CAREER_GUIDANCE';

export interface AIFeedback {
  id: string;
  profile_id: string;
  job_id?: string | null;
  type: AIFeedbackType;
  input_data: any;
  output_data: any;
  created_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}
