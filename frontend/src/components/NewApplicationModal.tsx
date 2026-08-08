import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Job, ApplicationStatus } from '../types';
import { apiService } from '../services/apiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  profileId: string;
  onApplicationCreated: () => void;
}

export function NewApplicationModal({ isOpen, onClose, jobs, profileId, onApplicationCreated }: Props) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = orig;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      setError('Please select a job position.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await apiService.saveApplication({
        profileId,
        jobId: selectedJobId,
        status,
        notes: notes.trim() || `Applied for ${selectedJob?.role} at ${selectedJob?.company}`,
      });
      onApplicationCreated();
      onClose();
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        setError(`You have already tracked an application for ${selectedJob?.role} at ${selectedJob?.company}.`);
      } else {
        setError(err.message || 'Failed to create application.');
      }
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slideUp"
        style={{
          width: '100%',
          maxWidth: 540,
          maxHeight: '85vh',
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.24)',
          fontFamily: 'Manrope, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-outline-variant)',
            backgroundColor: 'var(--color-surface-container-low)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-secondary)' }}>
              add_task
            </span>
            <h2 className="text-title-lg" style={{ color: 'var(--color-primary)', margin: 0 }}>
              Track New Application
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-on-surface-variant)',
              padding: 4,
              borderRadius: '50%',
              display: 'flex',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                backgroundColor: 'var(--color-error-container)',
                border: '1px solid rgba(186,26,26,0.2)',
                borderRadius: 8,
                fontSize: 14,
                color: 'var(--color-on-error-container)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-error)' }}>
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* Job select */}
          <div>
            <label
              className="text-label-md"
              style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 6, textTransform: 'uppercase' }}
            >
              Select Job Position
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid var(--color-outline-variant)',
                backgroundColor: 'var(--color-surface-container-low)',
                fontSize: 15,
                fontFamily: 'Manrope, sans-serif',
                color: 'var(--color-on-surface)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.role} — {job.company} ({job.location})
                </option>
              ))}
            </select>
          </div>

          {/* Job summary preview */}
          {selectedJob && (
            <div
              style={{
                padding: 14,
                backgroundColor: 'var(--color-surface-container)',
                borderRadius: 8,
                border: '1px solid var(--color-outline-variant)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p className="text-title-md" style={{ color: 'var(--color-primary)', margin: 0 }}>
                  {selectedJob.company}
                </p>
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
                  {selectedJob.workMode} · {selectedJob.salary || 'Competitive Salary'}
                </p>
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  backgroundColor: 'var(--color-accent-saffron)',
                  color: '#1c1b1b',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {selectedJob.matchScore || 85}% Match
              </span>
            </div>
          )}

          {/* Initial Status */}
          <div>
            <label
              className="text-label-md"
              style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 6, textTransform: 'uppercase' }}
            >
              Application Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid var(--color-outline-variant)',
                backgroundColor: 'var(--color-surface-container-low)',
                fontSize: 15,
                fontFamily: 'Manrope, sans-serif',
                color: 'var(--color-on-surface)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            >
              <option value="Saved">Saved / Interested</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interview</option>
              <option value="Offered">Selected / Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label
              className="text-label-md"
              style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 6, textTransform: 'uppercase' }}
            >
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Applied via LinkedIn, referral from Ankit"
              rows={3}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--color-outline-variant)',
                backgroundColor: 'var(--color-surface-container-low)',
                fontSize: 14,
                fontFamily: 'Manrope, sans-serif',
                color: 'var(--color-on-surface)',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid var(--color-outline-variant)',
                background: 'none',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-on-surface)',
                cursor: 'pointer',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    check
                  </span>
                  Add Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
