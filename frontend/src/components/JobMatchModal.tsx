import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Job, MatchAnalysis } from '../types';
import { apiService } from '../services/apiService';

interface Props {
  job: Job | null;
  onClose: () => void;
  onTrack: (job: Job) => void;
  onApply: (job: Job) => void;
}

function getCompanyInitials(company: string): string {
  return company.split(/[\s\-&]+/).slice(0, 3).map((w) => w[0]).join('').toUpperCase().slice(0, 3);
}

function CircleScore({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const dashArray = `${pct}, 100`;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 16px',
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        minWidth: 100,
        flexShrink: 0,
      }}
    >
      <div style={{ position: 'relative', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="52" height="52" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--color-surface-variant)"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--color-accent-saffron)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={dashArray}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 13 }}>
            {pct}%
          </span>
        </div>
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: 'var(--color-on-surface-variant)',
          marginTop: 4,
        }}
      >
        Match
      </span>
    </div>
  );
}

export function JobMatchModal({ job, onClose, onTrack, onApply }: Props) {
  const [match, setMatch] = useState<MatchAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);

  // Body scroll lock & Escape key listener
  useEffect(() => {
    if (!job) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [job, onClose]);

  // Load match data
  useEffect(() => {
    if (!job) { setMatch(null); return; }
    const doMatch = async () => {
      setLoading(true);
      try {
        const result = await apiService.getJobMatch(job.id, 'demo-profile-1');
        if (result) setMatch(result);
      } catch {
        setMatch({
          matchScore: job.matchScore || 0,
          summary: `You are a competitive candidate for ${job.role} at ${job.company}.`,
          strengths: job.skillsRequired?.slice(0, 3) ?? [],
          missingSkills: [],
          partialMatches: [],
          recommendations: ['Keep building real-world projects.'],
          fitRating: 'Moderate Match',
        });
      } finally {
        setLoading(false);
      }
    };
    doMatch();
  }, [job?.id]);

  if (!job) return null;

  const initials = getCompanyInitials(job.company);
  const score = match?.matchScore ?? job.matchScore ?? 0;

  const handleTrack = async () => {
    setTracking(true);
    try {
      await onTrack(job);
    } finally {
      setTracking(false);
    }
  };

  const modalContent = (
    /* BUG 3 FIX: Viewport-level Backdrop Overlay */
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
      {/* Modal Outer Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slideUp"
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          width: '100%',
          maxWidth: 780,
          maxHeight: '85vh',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.24)',
          border: '1px solid var(--color-outline-variant)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Fixed Header (Does not scroll, content stays inside) */}
        <header
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-outline-variant)',
            backgroundColor: 'var(--color-surface-container-low)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ color: 'var(--color-on-surface-variant)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Match Analysis
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-secondary)' }}>psychology</span>
            </div>
            {/* Title wrapping naturally inside header */}
            <h2
              className="text-headline-md"
              style={{
                color: 'var(--color-primary)',
                margin: 0,
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {job.role}
            </h2>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
              {job.company} · {job.location} ({job.workMode})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <CircleScore score={score} />
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-on-surface-variant)',
                padding: 6,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
          className="kanban-scroll"
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    height: 80,
                    borderRadius: 8,
                    backgroundColor: 'var(--color-surface-container-low)',
                  }}
                />
              ))}
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center' }}>
                Analyzing profile alignment...
              </p>
            </div>
          ) : match ? (
            <>
              {/* AI Evaluation */}
              <section
                style={{
                  backgroundColor: '#FAF9F6',
                  padding: 20,
                  borderRadius: 10,
                  border: '1px solid var(--color-outline-variant)',
                }}
              >
                <h3
                  className="text-title-md"
                  style={{ color: 'var(--color-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20, color: 'var(--color-accent-saffron)', fontVariationSettings: "'FILL' 1" }}
                  >
                    lightbulb
                  </span>
                  AI Evaluation
                </h3>
                <p className="text-body-md" style={{ color: 'var(--color-on-surface)', margin: 0, lineHeight: 1.6 }}>
                  {match.summary}
                </p>
              </section>

              {/* Detailed Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="modal-breakdown-grid">
                {/* Strengths */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3
                    className="text-title-md"
                    style={{
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      borderBottom: '1px solid var(--color-outline-variant)',
                      paddingBottom: 8,
                      margin: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-secondary)' }}>check_circle</span>
                    Why you're a strong match
                  </h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, padding: 0, listStyle: 'none' }}>
                    {match.strengths?.length > 0 ? (
                      match.strengths.map((s, i) => (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            backgroundColor: 'var(--color-surface-container-low)',
                            padding: 12,
                            borderRadius: 6,
                            border: '1px solid var(--color-outline-variant)',
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18, color: 'var(--color-accent-navy)', marginTop: 2, flexShrink: 0 }}
                          >
                            verified
                          </span>
                          <span className="text-body-md" style={{ color: 'var(--color-primary)' }}>{s}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Core technical skills align well with job requirement.</li>
                    )}
                  </ul>
                </section>

                {/* Right column: Partial + Skill Gaps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Partial matches */}
                  {match.partialMatches?.length > 0 && (
                    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <h3
                        className="text-title-md"
                        style={{
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          borderBottom: '1px solid var(--color-outline-variant)',
                          paddingBottom: 8,
                          margin: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-accent-saffron)' }}>warning</span>
                        Partial Match
                      </h3>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, listStyle: 'none' }}>
                        {match.partialMatches.map((s, i) => (
                          <li
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              backgroundColor: '#FAF9F6',
                              padding: 10,
                              borderRadius: 6,
                              border: '1px solid var(--color-outline-variant)',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-accent-saffron)', marginTop: 2, flexShrink: 0 }}>cloud</span>
                            <span className="text-body-md" style={{ color: 'var(--color-primary)' }}>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Missing Skills */}
                  {match.missingSkills?.length > 0 && (
                    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <h3
                        className="text-title-md"
                        style={{
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          borderBottom: '1px solid var(--color-outline-variant)',
                          paddingBottom: 8,
                          margin: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-error)' }}>cancel</span>
                        Skill Gaps
                      </h3>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, listStyle: 'none' }}>
                        {match.missingSkills.map((s, i) => (
                          <li
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              backgroundColor: '#FAF9F6',
                              padding: 10,
                              borderRadius: 6,
                              border: '1px solid var(--color-outline-variant)',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-outline)', marginTop: 2, flexShrink: 0 }}>block</span>
                            <span className="text-body-md" style={{ color: 'var(--color-primary)' }}>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>

              {/* Recommendation CTA */}
              {match.recommendations?.length > 0 && (
                <section
                  style={{
                    backgroundColor: 'var(--color-accent-navy)',
                    color: '#ffffff',
                    padding: 20,
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <h4
                    className="text-title-lg"
                    style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-accent-saffron)' }}>rocket_launch</span>
                    CareerPilot Recommendation
                  </h4>
                  <p className="text-body-sm" style={{ color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>
                    {match.recommendations[0]}
                  </p>
                </section>
              )}
            </>
          ) : null}
        </main>

        {/* Fixed Footer */}
        <footer
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--color-outline-variant)',
            backgroundColor: 'var(--color-surface-container-lowest)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-outline-variant)',
              color: 'var(--color-on-surface)',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            Close
          </button>

          <button
            className="btn-primary"
            disabled={tracking}
            onClick={handleTrack}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              opacity: tracking ? 0.7 : 1,
            }}
          >
            {tracking ? 'Saving...' : 'Track Application'}
          </button>

          {job.sourceUrl && (
            <button
              onClick={() => onApply(job)}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                backgroundColor: 'var(--color-accent-saffron)',
                color: '#000000',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Apply <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
            </button>
          )}
        </footer>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .modal-breakdown-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
