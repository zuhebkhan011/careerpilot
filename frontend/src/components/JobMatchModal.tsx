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
  const [error, setError] = useState('');

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

  const fetchMatchData = async () => {
    if (!job) { setMatch(null); return; }
    setLoading(true);
    setError('');
    const profileId = sessionStorage.getItem('cp_profile_id') || 'demo-profile-1';
    try {
      const result = await apiService.getJobMatch(job.id, profileId);
      if (result) setMatch(result);
    } catch (e: any) {
      setError(e.message || 'Recommendation could not be generated.');
    } finally {
      setLoading(false);
    }
  };

  // Load match data on job change
  useEffect(() => {
    fetchMatchData();
  }, [job?.id]);

  if (!job) return null;

  const score = match?.matchScore ?? job.matchScore ?? 0;
  const recDetails = match?.recommendationDetails;

  const handleTrack = async () => {
    setTracking(true);
    try {
      await onTrack(job);
    } finally {
      setTracking(false);
    }
  };

  const getReadinessStyle = (readiness?: string) => {
    if (readiness === 'Ready to apply') {
      return { bg: '#e8f5e9', color: '#1b5e20', border: '#a5d6a7' };
    }
    if (readiness === 'Apply while improving') {
      return { bg: '#fff3e0', color: '#e65100', border: '#ffe0b2' };
    }
    return { bg: '#ffebee', color: '#c62828', border: '#ffcdd2' };
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
          maxWidth: 820,
          maxHeight: '90vh',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.24)',
          border: '1px solid var(--color-outline-variant)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Fixed Header */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 0' }}>
              <div
                className="animate-pulse"
                style={{
                  height: 90,
                  borderRadius: 10,
                  backgroundColor: 'var(--color-surface-container-low)',
                }}
              />
              <div
                className="animate-pulse"
                style={{
                  height: 120,
                  borderRadius: 10,
                  backgroundColor: 'var(--color-surface-container-low)',
                }}
              />
              <p className="text-body-md" style={{ color: 'var(--color-on-surface)', textAlign: 'center', fontWeight: 600 }}>
                Generating CareerPilot recommendation & semantic fit breakdown...
              </p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                backgroundColor: 'var(--color-error-container)',
                borderRadius: 10,
                border: '1px solid rgba(186,26,26,0.2)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--color-error)', marginBottom: 8 }}>
                error
              </span>
              <p className="text-body-md" style={{ color: 'var(--color-on-error-container)', marginBottom: 16 }}>
                Recommendation could not be generated.
              </p>
              <button
                className="btn-primary"
                onClick={fetchMatchData}
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                Retry Recommendation
              </button>
            </div>
          ) : match ? (
            <>
              {/* AI Reasoning Overview */}
              <section
                style={{
                  backgroundColor: '#FAF9F6',
                  padding: 20,
                  borderRadius: 10,
                  border: '1px solid var(--color-outline-variant)',
                }}
              >
                <h3
                  className="text-label-md"
                  style={{
                    color: 'var(--color-outline)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 8,
                  }}
                >
                  Candidate Alignment Summary
                </h3>
                <p className="text-body-md" style={{ color: 'var(--color-primary)', lineHeight: 1.6, margin: 0 }}>
                  {match.summary}
                </p>
              </section>

              {/* Grid: Strengths vs Skill Gaps */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="modal-breakdown-grid">
                {/* Why You Match */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <section style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#2e7d32' }}>check_circle</span>
                      <h4 className="text-title-sm" style={{ color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>
                        Why You Match
                      </h4>
                    </div>
                    {match.strengths.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {match.strengths.map((s, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              backgroundColor: '#f1f8e9',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #c8e6c9',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#2e7d32', marginTop: 2, flexShrink: 0 }}>
                              check
                            </span>
                            <span className="text-body-sm" style={{ color: '#1b5e20', fontWeight: 600 }}>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>No direct tech matches.</p>
                    )}
                  </section>

                  {/* Partial Matches */}
                  {match.partialMatches && match.partialMatches.length > 0 && (
                    <section style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#e65100' }}>cloud_sync</span>
                        <h4 className="text-title-sm" style={{ color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>
                          Partial Matches
                        </h4>
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {match.partialMatches.map((pm, idx) => (
                          <li key={idx} className="text-body-sm" style={{ color: '#e65100', backgroundColor: '#fff3e0', padding: '6px 10px', borderRadius: 6, border: '1px solid #ffe0b2' }}>
                            ~ {pm}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

                {/* Skill Gaps */}
                <div>
                  <section style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#c62828' }}>cancel</span>
                      <h4 className="text-title-sm" style={{ color: 'var(--color-primary)', fontWeight: 700, margin: 0 }}>
                        Skill Gaps
                      </h4>
                    </div>
                    {match.missingSkills.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {match.missingSkills.map((s, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              backgroundColor: '#ffebee',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #ffcdd2',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#c62828', marginTop: 2, flexShrink: 0 }}>
                              block
                            </span>
                            <span className="text-body-sm" style={{ color: '#b71c1c', fontWeight: 600 }}>{s}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-body-sm" style={{ color: '#2e7d32', fontWeight: 600 }}>No major skill gaps identified!</p>
                    )}
                  </section>
                </div>
              </div>

              {/* RICH CAREERPILOT RECOMMENDATION CARD */}
              <section
                style={{
                  backgroundColor: 'var(--color-accent-navy)',
                  color: '#ffffff',
                  padding: 20,
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <h4
                    className="text-title-lg"
                    style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'var(--color-accent-saffron)' }}>rocket_launch</span>
                    CareerPilot Recommendation
                  </h4>

                  {recDetails?.applicationReadiness && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        backgroundColor: getReadinessStyle(recDetails.applicationReadiness).bg,
                        color: getReadinessStyle(recDetails.applicationReadiness).color,
                        border: `1px solid ${getReadinessStyle(recDetails.applicationReadiness).border}`,
                        padding: '4px 12px',
                        borderRadius: 9999,
                        letterSpacing: '0.02em',
                      }}
                    >
                      Readiness: {recDetails.applicationReadiness}
                    </span>
                  )}
                </div>

                {/* Summary / Why this role */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: 14, borderRadius: 8 }}>
                  <p className="text-body-sm" style={{ color: 'rgba(255,255,255,0.95)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                    {recDetails?.summary || match.recommendations[0] || `Personalized evaluation for ${job.role} at ${job.company}.`}
                  </p>
                  {recDetails?.whyThisRole && (
                    <p className="text-body-sm" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, marginBottom: 0, lineHeight: 1.5 }}>
                      <strong>Why this role:</strong> {recDetails.whyThisRole}
                    </p>
                  )}
                </div>

                {/* What to Highlight & What to Improve */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="rec-details-grid">
                  {recDetails?.whatToHighlight && recDetails.whatToHighlight.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-saffron)', display: 'block', marginBottom: 6 }}>
                        What to Highlight
                      </span>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
                        {recDetails.whatToHighlight.map((h, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recDetails?.whatToImprove && recDetails.whatToImprove.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#ff8a80', display: 'block', marginBottom: 6 }}>
                        What to Improve
                      </span>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
                        {recDetails.whatToImprove.map((imp, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Next Action */}
                {(recDetails?.nextAction || match.recommendations?.[0]) && (
                  <div style={{ backgroundColor: 'rgba(244,162,97,0.15)', border: '1px solid rgba(244,162,97,0.4)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-accent-saffron)', marginTop: 2, flexShrink: 0 }}>
                      flag
                    </span>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-accent-saffron)', display: 'block' }}>
                        Next Recommended Action
                      </span>
                      <p className="text-body-sm" style={{ color: '#ffffff', margin: 0, fontWeight: 600, marginTop: 2 }}>
                        {recDetails?.nextAction || match.recommendations[0]}
                      </p>
                    </div>
                  </div>
                )}
              </section>
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
          .rec-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
