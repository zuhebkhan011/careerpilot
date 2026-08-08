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
  summary?: string;
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
  preferred_roles?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ResumeAnalysisResult {
  parsedData: Partial<Profile>;
  resumeScore: number;
  scoreExplanation: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: Array<{ skill: string; reason: string }>;
  improvements: Array<{ section: string; original: string; improved: string; impact: 'High' | 'Medium' | 'Low' }>;
  recommendedRoles: string[];
}

export interface Resume {
  id: string;
  profile_id: string;
  file_name: string;
  file_url?: string;
  raw_text?: string;
  parsed_data: Partial<Profile>;
  resume_score: number;
  analysis_result?: ResumeAnalysisResult;
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
  source?: 'linkedin' | 'demo' | 'careerpilot';
  source_url?: string;
  created_at?: string;
}

export interface JobMatch {
  id?: string;
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
  created_at?: string;
}

export type ApplicationStatus = 'INTERESTED' | 'APPLIED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

export interface Application {
  id: string;
  profile_id: string;
  job_id: string;
  status: ApplicationStatus;
  notes?: string;
  applied_at?: string;
  created_at?: string;
  updated_at?: string;
  job?: Job;
}

export interface AIFeedback {
  id?: string;
  profile_id: string;
  type: 'RESUME_ANALYSIS' | 'JOB_MATCH' | 'COVER_LETTER' | 'CAREER_GUIDANCE';
  input_data: any;
  output_data: any;
  created_at?: string;
}
