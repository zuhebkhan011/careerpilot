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
  fileName?: string;
  fileSize?: string;
  updatedAt: string;
  rawText?: string;
  college?: string;
  degree?: string;
  graduation_year?: string;
  projects?: Array<{ title: string; description: string; tech_stack?: string[]; link?: string }>;
  certifications?: string[];
  achievements?: string[];
  languages?: string[];
}

export interface MatchAnalysis {
  matchScore: number;
  summary: string;
  strengths: string[];
  missingSkills: string[];
  partialMatches: string[];
  recommendations: string[];
  fitRating: 'Strong Match' | 'Moderate Match' | 'Growth Opportunity' | 'Low Match';
  skill_match?: number;
  experience_match?: number;
  education_match?: number;
  role_fit?: number;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  actionType?: 'match' | 'resume' | 'cover_letter' | 'general';
}

export interface FilterState {
  search: string;
  location: string;
  workMode: WorkMode | 'All';
  experienceLevel: string;
  minMatchScore: number;
}
