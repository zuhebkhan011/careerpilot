import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Job } from '../types';
import { apiService } from '../services/apiService';

interface Props {
  job: Job | null;
  onClose: () => void;
}

export function CoverLetterModal({ job, onClose }: Props) {
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');

  // Body scroll lock & Escape key
  useEffect(() => {
    if (!job) return;
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
  }, [job, onClose]);

  useEffect(() => {
    if (!job) { setLetter(''); setEditing(false); return; }
    const generate = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await apiService.generateCoverLetter(job.id, 'demo-profile-1');
        if (result?.coverLetter) {
          setLetter(result.coverLetter);
          setEditText(result.coverLetter);
        }
      } catch {
        setError('Failed to generate cover letter. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [job?.id]);

  if (!job) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editing ? editText : letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText = editing ? editText : letter;

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
        padding: '16px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          width: '100%',
          maxWidth: 720,
          maxHeight: '85vh',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.24)',
          border: '1px solid var(--color-outline-variant)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="animate-slideUp"
      >
        {/* Header */}
        <header
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-accent-saffron)', fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>
                AI Cover Letter
              </span>
            </div>
            <h2 className="text-headline-md" style={{ color: 'var(--color-primary)', margin: 0 }}>
              {job.role} — {job.company}
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
              padding: 6,
              borderRadius: '50%',
              display: 'flex',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <main style={{ padding: '24px', flex: 1, overflowY: 'auto' }} className="kanban-scroll">
          {error && (
            <div
              style={{
                backgroundColor: 'var(--color-error-container)',
                border: '1px solid var(--color-error)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 16,
                color: 'var(--color-on-error-container)',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    height: i === 1 ? 24 : 16,
                    width: i === 4 ? '60%' : '100%',
                    borderRadius: 4,
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              ))}
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center', marginTop: 12 }}>
                Preparing tailored cover letter...
              </p>
            </div>
          ) : editing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{
                width: '100%',
                minHeight: 360,
                padding: 16,
                borderRadius: 8,
                border: '1px solid var(--color-outline-variant)',
                backgroundColor: 'var(--color-surface-container-lowest)',
                fontFamily: 'Manrope, sans-serif',
                fontSize: 15,
                lineHeight: 1.7,
                color: 'var(--color-on-surface)',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <div
              style={{
                backgroundColor: '#FAF9F6',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 8,
                padding: 20,
                fontSize: 15,
                lineHeight: 1.75,
                color: 'var(--color-on-surface)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {displayText}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--color-outline-variant)',
            backgroundColor: 'var(--color-surface-container-lowest)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => { setEditing(!editing); if (editing) setLetter(editText); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-on-surface)',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {editing ? 'check' : 'edit'}
            </span>
            {editing ? 'Save' : 'Edit'}
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 18px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-on-surface)',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              Close
            </button>
            <button
              className="btn-primary"
              onClick={handleCopy}
              disabled={loading || !displayText}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: loading || !displayText ? 0.6 : 1,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy Letter'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
