import { Job, Application, ResumeProfile, CoachMessage } from '../types';
import { INITIAL_JOBS, INITIAL_APPLICATIONS, INITIAL_RESUME } from '../data/mockData';

const KEYS = {
  JOBS: 'cp_jobs_v1',
  APPLICATIONS: 'cp_applications_v1',
  RESUME: 'cp_resume_v1',
  COACH_MESSAGES: 'cp_coach_messages_v1',
  USER_PREFERENCES: 'cp_user_prefs_v1'
};

export const storageService = {
  getJobs(): Job[] {
    try {
      const data = localStorage.getItem(KEYS.JOBS);
      if (!data) {
        this.saveJobs(INITIAL_JOBS);
        return INITIAL_JOBS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_JOBS;
    }
  },

  saveJobs(jobs: Job[]): void {
    try {
      localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
    } catch (err) {
      console.warn('Failed to save jobs to storage:', err);
    }
  },

  getApplications(): Application[] {
    try {
      const data = localStorage.getItem(KEYS.APPLICATIONS);
      if (!data) {
        this.saveApplications(INITIAL_APPLICATIONS);
        return INITIAL_APPLICATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_APPLICATIONS;
    }
  },

  saveApplications(apps: Application[]): void {
    try {
      localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
    } catch (err) {
      console.warn('Failed to save applications:', err);
    }
  },

  getResume(): ResumeProfile {
    try {
      const data = localStorage.getItem(KEYS.RESUME);
      if (!data) {
        this.saveResume(INITIAL_RESUME);
        return INITIAL_RESUME;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_RESUME;
    }
  },

  saveResume(resume: ResumeProfile): void {
    try {
      localStorage.setItem(KEYS.RESUME, JSON.stringify(resume));
    } catch (err) {
      console.warn('Failed to save resume:', err);
    }
  },

  getCoachMessages(): CoachMessage[] {
    try {
      const data = localStorage.getItem(KEYS.COACH_MESSAGES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveCoachMessages(messages: CoachMessage[]): void {
    try {
      localStorage.setItem(KEYS.COACH_MESSAGES, JSON.stringify(messages));
    } catch (err) {
      console.warn('Failed to save chat messages:', err);
    }
  },

  resetAllData(): void {
    try {
      localStorage.removeItem(KEYS.JOBS);
      localStorage.removeItem(KEYS.APPLICATIONS);
      localStorage.removeItem(KEYS.RESUME);
      localStorage.removeItem(KEYS.COACH_MESSAGES);
      this.saveJobs(INITIAL_JOBS);
      this.saveApplications(INITIAL_APPLICATIONS);
      this.saveResume(INITIAL_RESUME);
    } catch (err) {
      console.warn('Error resetting storage:', err);
    }
  }
};
