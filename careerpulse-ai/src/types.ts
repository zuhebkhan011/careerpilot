export type WorkMode = 'Remote' | 'Hybrid' | 'Onsite';

export type ApplicationStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';

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
  postedDate: string;
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior' | 'Lead' | 'Internship';
  department: string;
  benefits: string[];
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
}

export interface MatchAnalysis {
  matchScore: number;
  summary: string;
  strengths: string[];
  missingSkills: string[];
  partialMatches: string[];
  recommendations: string[];
  fitRating: 'Strong Match' | 'Moderate Match' | 'Growth Opportunity' | 'Low Match';
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
