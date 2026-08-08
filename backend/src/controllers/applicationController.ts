import { Request, Response, NextFunction } from 'express';
import { getSupabase, memoryDb } from '../db/supabase';
import { Application, ApplicationStatus } from '../types';
import crypto from 'crypto';

const ALLOWED_STATUSES: ApplicationStatus[] = ['INTERESTED', 'APPLIED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

export const getApplicationsByProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profileId } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, job:jobs(*)')
          .eq('profile_id', profileId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          return res.status(200).json({ success: true, count: data.length, data });
        }
      } catch {
        // Fallback to memoryDb below
      }
    }

    const apps = memoryDb.applications.filter(a => a.profile_id === profileId);
    const enriched = apps.map(app => ({
      ...app,
      job: memoryDb.jobs.find(j => j.id === app.job_id),
    }));

    return res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profile_id, job_id, status, notes } = req.body;

    if (!ALLOWED_STATUSES.includes(status as ApplicationStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Invalid application status '${status}'. Must be one of: ${ALLOWED_STATUSES.join(', ')}`,
        },
      });
    }

    const supabase = getSupabase();

    // Check for duplicate application record
    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('applications')
          .select('id')
          .eq('profile_id', profile_id)
          .eq('job_id', job_id)
          .single();

        if (existing) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'DUPLICATE_APPLICATION',
              message: 'Application record already exists for this candidate profile and job.',
            },
          });
        }

        const newApp: Application = {
          id: crypto.randomUUID(),
          profile_id,
          job_id,
          status: status as ApplicationStatus,
          notes: notes || '',
          applied_at: status === 'APPLIED' ? new Date().toISOString() : undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase.from('applications').insert(newApp).select('*, job:jobs(*)').single();
        if (!error && data) {
          return res.status(201).json({ success: true, data });
        }
      } catch {
        // Fallback to memoryDb below
      }
    }

    // In-memory check
    const existing = memoryDb.applications.find(a => a.profile_id === profile_id && a.job_id === job_id);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_APPLICATION',
          message: 'Application record already exists for this candidate profile and job.',
        },
      });
    }

    const newApp: Application = {
      id: crypto.randomUUID(),
      profile_id,
      job_id,
      status: status as ApplicationStatus,
      notes: notes || '',
      applied_at: status === 'APPLIED' ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryDb.applications.push(newApp);

    const job = memoryDb.jobs.find(j => j.id === job_id);
    return res.status(201).json({ success: true, data: { ...newApp, job } });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    if (status && !ALLOWED_STATUSES.includes(status as ApplicationStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Invalid application status '${status}'. Must be one of: ${ALLOWED_STATUSES.join(', ')}`,
        },
      });
    }

    const supabase = getSupabase();
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updatePayload.status = status;
      if (status === 'APPLIED') {
        updatePayload.applied_at = new Date().toISOString();
      }
    }
    if (notes !== undefined) updatePayload.notes = notes;

    if (supabase) {
      const { data, error } = await supabase
        .from('applications')
        .update(updatePayload)
        .eq('id', applicationId)
        .select('*, job:jobs(*)')
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: { code: 'APPLICATION_NOT_FOUND', message: `Application ${applicationId} not found` },
        });
      }
      return res.status(200).json({ success: true, data });
    }

    const idx = memoryDb.applications.findIndex(a => a.id === applicationId);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: `Application ${applicationId} not found` },
      });
    }

    memoryDb.applications[idx] = {
      ...memoryDb.applications[idx],
      ...updatePayload,
    };

    const job = memoryDb.jobs.find(j => j.id === memoryDb.applications[idx].job_id);

    return res.status(200).json({
      success: true,
      data: { ...memoryDb.applications[idx], job },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.params;
    const supabase = getSupabase();

    if (supabase) {
      const { error } = await supabase.from('applications').delete().eq('id', applicationId);
      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Application deleted successfully' });
    }

    const idx = memoryDb.applications.findIndex(a => a.id === applicationId);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: `Application ${applicationId} not found` },
      });
    }

    memoryDb.applications.splice(idx, 1);
    return res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    next(error);
  }
};
