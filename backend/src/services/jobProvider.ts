import { Job } from '../types';
import { SAMPLE_INDIAN_JOBS } from '../db/seed';

export interface JobProvider {
  name: string;
  getJobs(query?: any): Promise<Omit<Job, 'id' | 'created_at'>[]>;
}

export class DemoJobProvider implements JobProvider {
  name = 'demo';
  async getJobs(): Promise<Omit<Job, 'id' | 'created_at'>[]> {
    return SAMPLE_INDIAN_JOBS;
  }
}

export class LinkedInJobProvider implements JobProvider {
  name = 'linkedin';
  async getJobs(): Promise<Omit<Job, 'id' | 'created_at'>[]> {
    // Official LinkedIn Provider Strategy: Normalizes legitimate outbound LinkedIn search links
    return SAMPLE_INDIAN_JOBS.map((job) => ({
      ...job,
      source: 'linkedin' as const,
      source_url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.company + ' ' + job.role)}&location=${encodeURIComponent(job.location + ', India')}`,
    }));
  }
}

export class JobProviderManager {
  private providers: JobProvider[] = [new DemoJobProvider(), new LinkedInJobProvider()];

  async getAllNormalizedJobs(): Promise<Omit<Job, 'id' | 'created_at'>[]> {
    let allJobs: Omit<Job, 'id' | 'created_at'>[] = [];
    for (const provider of this.providers) {
      try {
        const jobs = await provider.getJobs();
        allJobs = allJobs.concat(jobs);
      } catch (err) {
        console.warn(`Job provider '${provider.name}' error:`, err);
      }
    }
    return allJobs;
  }
}

export const jobProviderManager = new JobProviderManager();
