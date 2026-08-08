import { Request, Response, NextFunction } from 'express';
import { getSupabase, memoryDb } from '../db/supabase';
import { Profile, ApiResponse } from '../types';
import crypto from 'crypto';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profileId } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single();
        if (!error && data) {
          return res.status(200).json({ success: true, data });
        }
      } catch {
        // Fallback to memoryDb below
      }
    }

    const found = memoryDb.profiles.find(p => p.id === profileId);
    if (!found) {
      // If default demo request and memory is empty, auto-create initial default profile
      if (profileId === 'default' || profileId === 'demo-profile-1') {
        const defaultProfile: Profile = {
          id: profileId,
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          phone: '+91 9876543210',
          location: 'Bengaluru, India',
          education: 'B.Tech in Computer Science & Engineering',
          degree: 'B.Tech',
          college: 'Vellore Institute of Technology (VIT)',
          graduation_year: '2024',
          skills: ['JavaScript', 'TypeScript', 'Node.js', 'Express.js', 'React', 'PostgreSQL', 'Git', 'REST APIs'],
          experience: [
            {
              title: 'Software Developer Intern',
              company: 'Tech Solutions India',
              duration: 'Jan 2024 - Jun 2024',
              description: 'Designed REST microservices in Node.js and Express with PostgreSQL backend.'
            }
          ],
          projects: [
            {
              title: 'CareerPilot AI Agent',
              tech_stack: ['React', 'Node.js', 'Express', 'Supabase'],
              description: 'AI-assisted job match and application tracking platform.',
              link: 'https://github.com/example/careerpilot'
            }
          ],
          certifications: ['AWS Certified Cloud Practitioner', 'Meta Front-End Developer'],
          achievements: ['1st Runner Up - National AI Hackathon 2024'],
          languages: ['English', 'Hindi'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        memoryDb.profiles.push(defaultProfile);
        return res.status(200).json({ success: true, data: defaultProfile });
      }

      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: `Profile with ID ${profileId} not found` },
      });
    }

    return res.status(200).json({ success: true, data: found });
  } catch (error) {
    next(error);
  }
};

export const createProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profileData = req.body;
    const supabase = getSupabase();
    const id = profileData.id || crypto.randomUUID();

    const newProfile: Profile = {
      id,
      ...profileData,
      skills: profileData.skills || [],
      experience: profileData.experience || [],
      projects: profileData.projects || [],
      certifications: profileData.certifications || [],
      achievements: profileData.achievements || [],
      languages: profileData.languages || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from('profiles').insert(newProfile).select().single();
      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    memoryDb.profiles.push(newProfile);
    return res.status(201).json({ success: true, data: newProfile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profileId } = req.params;
    const updates = req.body;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', profileId)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: `Profile ${profileId} not found` },
        });
      }
      return res.status(200).json({ success: true, data });
    }

    const idx = memoryDb.profiles.findIndex(p => p.id === profileId);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: `Profile ${profileId} not found` },
      });
    }

    memoryDb.profiles[idx] = {
      ...memoryDb.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return res.status(200).json({ success: true, data: memoryDb.profiles[idx] });
  } catch (error) {
    next(error);
  }
};
