export type WorkMode = 'Remote' | 'Hybrid' | 'Onsite' | 'On-site';

export type ApplicationStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offered' | 'Rejected' | 'INTERESTED' | 'APPLIED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

export interface Job {
  id: string;
  company: string;
  companyLogo?: string;
  role: string;
  location: string;
  salary: string;
  workMode: WorkMode;
  matchScore: number;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  postedDate?: string;
  experienceLevel?: string;
  department?: string;
  benefits?: string[];
  responsibilities?: string[];
  preferred_skills?: string[];
  source?: 'linkedin' | 'demo' | 'careerpilot';
  sourceUrl?: string;
}

export interface Application {
  id: string;
  jobId: string;
  company: string;
  companyLogo?: string;
  role: string;
  location: string;
  salary: string;
  workMode: WorkMode;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdated: string;
  notes: string;
  matchScore: number;
  interviewDate?: string;
  contactPerson?: string;
  coverLetter?: string;
  job?: Job;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  grade?: string;
}

export interface MissingSkillDetail {
  skill: string;
  reason: string;
}

export interface ImprovementSuggestion {
  section: string;
  original: string;
  improved: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface ResumeAnalysisData {
  resumeScore: number;
  scoreExplanation: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: MissingSkillDetail[];
  improvements: ImprovementSuggestion[];
  recommendedRoles: string[];
}

export interface ResumeProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  targetRole: string;
  yearsOfExperience: number;
  summary: string;
  skills: string[];
  experiences: WorkExperience[];
  education: Education[];
  updatedAt: string;
  fileName?: string;
  fileSize?: string;
  rawText?: string;
  college?: string;
  degree?: string;
  graduation_year?: string;
  projects?: Array<{
    title: string;
    tech_stack: string[];
    description: string;
    link?: string;
  }>;
  certifications?: string[];
  achievements?: string[];
  languages?: string[];
  analysisData?: ResumeAnalysisData;
}

export interface MatchAnalysis {
  matchScore: number;
  fitRating: 'Strong Match' | 'Moderate Match' | 'Growth Opportunity' | 'Low Match';
  summary: string;
  strengths: string[];
  missingSkills: string[];
  partialMatches: string[];
  recommendations: string[];
  skill_match?: number;
  experience_match?: number;
  education_match?: number;
  role_fit?: number;
}
