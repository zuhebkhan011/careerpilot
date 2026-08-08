import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { Profile, Resume, Job, JobMatch, Application, AIFeedback } from '../types';

let supabaseClient: SupabaseClient | null = null;

if (config.supabaseUrl && (config.supabaseServiceRoleKey || config.supabaseAnonKey)) {
  const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
  supabaseClient = createClient(config.supabaseUrl, key);
  console.log('✅ Connected to Supabase PostgreSQL Database.');
} else {
  console.log('ℹ️ Supabase credentials not found. Operating in local memory mode for immediate hackathon execution.');
}

// In-memory fallback database for seamless zero-setup demo
export const memoryDb = {
  profiles: [] as Profile[],
  resumes: [] as Resume[],
  jobs: [] as Job[],
  jobMatches: [] as JobMatch[],
  applications: [] as Application[],
  aiFeedback: [] as AIFeedback[],
};

export const getSupabase = () => supabaseClient;
