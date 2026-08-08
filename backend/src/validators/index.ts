import { z } from 'zod';

export const createProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  education: z.string().optional(),
  degree: z.string().optional(),
  college: z.string().optional(),
  graduation_year: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(z.any()).default([]),
  projects: z.array(z.any()).default([]),
  certifications: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});

export const updateProfileSchema = createProfileSchema.partial();

export const applicationStatusEnum = z.enum(['INTERESTED', 'APPLIED', 'INTERVIEW', 'SELECTED', 'REJECTED']);

export const createApplicationSchema = z.object({
  profile_id: z.string().uuid('Invalid profile_id UUID').or(z.string().min(1)),
  job_id: z.string().uuid('Invalid job_id UUID').or(z.string().min(1)),
  status: applicationStatusEnum,
  notes: z.string().optional(),
});

export const updateApplicationSchema = z.object({
  status: applicationStatusEnum,
  notes: z.string().optional(),
});

export const resumeAnalyzeTextSchema = z.object({
  profileId: z.string().optional(),
  text: z.string().min(20, 'Resume text must be at least 20 characters'),
});
