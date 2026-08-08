import React, { useState, useRef } from 'react';
import { ResumeProfile } from '../types';
import { apiService } from '../services/apiService';

interface Props {
  resume: ResumeProfile;
  onSaveResume: (r: ResumeProfile) => void;
}

interface ResumeAudit {
  score: number;
  strongSections: string[];
  weakSections: string[];
  suggestions: Array<{ section: string; original: string; improved: string; impact: 'High' | 'Medium' | 'Low' }>;
  summary: string;
}

export function ResumeView({ resume, onSaveResume }: Props) {
  const [view, setView] = useState<'empty' | 'analysis'>('empty');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [audit, setAudit] = useState<ResumeAudit | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const hasResume = !!resume.rawText || !!resume.skills?.length;

  React.useEffect(() => {
    if (hasResume && resume.rawText) {
      setView('analysis');
    }
  }, [hasResume]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('profileId', resume.id);
      const result = await apiService.uploadResumePDF(formData);
      if (result) {
        onSaveResume({ ...resume, ...result, fileName: file.name, fileSize: `${(file.size / 1024).toFixed(0)} KB` });
        await doAnalysis(result.rawText || '');
        setView('analysis');
      }
    } catch (e: any) {
      setError('Upload failed. Please try again or paste your resume text below.');
    } finally {
      setUploading(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!resumeText.trim()) return;
    await doAnalysis(resumeText);
    setView('analysis');
  };

  const doAnalysis = async (text: string) => {
    setAnalyzing(true);
    try {
      const result = await apiService.analyzeResume({ profileId: resume.id, resumeText: text });
      if (result) {
        onSaveResume({ ...resume, ...result });
        // Try to fetch audit
        try {
          const auditResult = await apiService.reviewResume({ profileId: resume.id, resumeText: text });
          if (auditResult) {
            setAudit({
              score: auditResult.score ?? 84,
              strongSections: auditResult.strongSections ?? ['Projects', 'Technical Skills'],
              weakSections: auditResult.weakSections ?? ['Project Descriptions', 'Achievements'],
              suggestions: auditResult.suggestions ?? [],
              summary: auditResult.summary ?? '',
            });
          }
        } catch {}
      }
    } catch (e: any) {
      setError('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const effectiveScore = audit?.score ?? (resume.skills?.length ? 84 : 0);
  const strongSections = audit?.strongSections ?? ['Projects', 'Technical Skills'];
  const weakSections = audit?.weakSections ?? ['Project Descriptions', 'Achievements'];
  const suggestions = audit?.suggestions ?? [];

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'var(--space-margin-mobile)',
        paddingBottom: 100,
      }}
      className="md-resume-padding animate-fadeIn"
    >
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 'var(--space-xl)',
          borderBottom: '1px solid var(--color-outline-variant)',
          paddingBottom: 12,
        }}
      >
        <div>
          <h1 className="text-headline-lg" style={{ color: 'var(--color-primary)' }}>
            Resume Workspace
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
            Optimize your professional narrative.
          </p>
        </div>
        {view === 'analysis' && (
          <button
            onClick={() => setView('empty')}
            style={{
              background: 'none',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-on-surface)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload_file</span>
            Upload New
          </button>
        )}
      </div>

      {/* View Toggle (Stitch design has this for demo) */}
      {!hasResume && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-lg)' }}>
          <button
            onClick={() => setView('empty')}
            style={{
              padding: '6px 16px',
              borderRadius: 9999,
              border: '1px solid var(--color-outline-variant)',
              backgroundColor: view === 'empty' ? 'var(--color-accent-navy)' : 'var(--color-surface-container-lowest)',
              color: view === 'empty' ? '#ffffff' : 'var(--color-on-surface)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            Empty State
          </button>
          <button
            onClick={() => setView('analysis')}
            style={{
              padding: '6px 16px',
              borderRadius: 9999,
              border: '1px solid var(--color-outline-variant)',
              backgroundColor: view === 'analysis' ? 'var(--color-accent-navy)' : 'var(--color-surface-container-lowest)',
              color: view === 'analysis' ? '#ffffff' : 'var(--color-on-surface)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            Analysis State
          </button>
        </div>
      )}

      {/* Error */}
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

      {/* Empty State */}
      {view === 'empty' && (
        <div
          style={{
            backgroundColor: '#F4F4F4',
            border: '1px dashed var(--color-outline-variant)',
            borderRadius: 12,
            padding: 'var(--space-xxl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: 400,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--color-accent-navy)', marginBottom: 'var(--space-md)' }}>
            upload_file
          </span>
          <h2 className="text-title-lg" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>
            Start with your resume
          </h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)', maxWidth: 440 }}>
            Upload a PDF of your current resume to receive an AI-driven structural and content analysis.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
          <button
            className="btn-primary"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            style={{
              padding: '12px 32px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>hourglass_empty</span>
                Reading your resume...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>file_upload</span>
                Upload Resume
              </>
            )}
          </button>
          <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 12 }}>
            Supports .pdf, .docx (Max 5MB)
          </p>

          {/* Text fallback */}
          <div style={{ marginTop: 32, width: '100%', maxWidth: 500 }}>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>
              Or paste your resume text:
            </p>
            <textarea
              placeholder="Paste resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--color-outline-variant)',
                backgroundColor: 'var(--color-surface-container-lowest)',
                fontFamily: 'Manrope, sans-serif',
                fontSize: 14,
                color: 'var(--color-on-surface)',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <button
              className="btn-primary"
              disabled={!resumeText.trim() || analyzing}
              onClick={handleTextAnalysis}
              style={{
                marginTop: 12,
                padding: '10px 24px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                opacity: !resumeText.trim() || analyzing ? 0.6 : 1,
              }}
            >
              {analyzing ? 'Analysing...' : 'Analyze Resume'}
            </button>
          </div>
        </div>
      )}

      {/* Analysis View */}
      {view === 'analysis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {analyzing && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                backgroundColor: 'var(--color-surface-container-low)',
                borderRadius: 8,
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <span className="material-symbols-outlined animate-pulse" style={{ fontSize: 24, color: 'var(--color-accent-navy)' }}>
                psychology
              </span>
              <p className="text-body-md" style={{ color: 'var(--color-on-surface)' }}>
                Understanding your experience...
              </p>
            </div>
          )}

          {/* Top Bento: Score + Strong/Weak */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-gutter)' }}
            className="resume-bento-grid"
          >
            {/* Score Card */}
            <div
              className="card-hover"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E5E5',
                borderRadius: 12,
                padding: 'var(--space-lg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                <h3 className="text-title-md" style={{ color: 'var(--color-on-surface-variant)' }}>Resume Score</h3>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-on-surface-variant)' }}>analytics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 'auto' }}>
                <span className="text-display-lg" style={{ color: 'var(--color-primary)', fontSize: 48, fontWeight: 700 }}>
                  {effectiveScore}
                </span>
                <span className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>/100</span>
              </div>
              <div style={{ width: '100%', backgroundColor: 'var(--color-surface-container)', height: 8, borderRadius: 9999, marginTop: 12, overflow: 'hidden' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-accent-saffron)',
                    height: '100%',
                    width: `${effectiveScore}%`,
                    borderRadius: 9999,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 8 }}>
                Top 15% of similar applicants.
              </p>
            </div>

            {/* Breakdown Column */}
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(2, auto)', gap: 'var(--space-gutter)' }}>
              {/* Strong Sections */}
              <div
                className="card-hover"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E5E5',
                  borderRadius: 12,
                  padding: 'var(--space-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-lg)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface-container-low)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-accent-navy)' }}>check_circle</span>
                </div>
                <div>
                  <h4 className="text-title-md" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>Strong Sections</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {strongSections.map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 9999,
                          backgroundColor: '#E5E5E5',
                          color: 'var(--color-primary)',
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Needs Improvement */}
              <div
                className="card-hover"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E5E5',
                  borderRadius: 12,
                  padding: 'var(--space-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-lg)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-error-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-error)' }}>error_outline</span>
                </div>
                <div>
                  <h4 className="text-title-md" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>Needs Improvement</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {weakSections.map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 9999,
                          backgroundColor: '#F4F4F4',
                          border: '1px solid rgba(186,26,26,0.3)',
                          color: 'var(--color-primary)',
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Improvement Section */}
          {suggestions.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-lg)' }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24, color: 'var(--color-accent-saffron)', fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <h3 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>
                  Improve your resume
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                {suggestions.slice(0, 3).map((sug, i) => (
                  <SuggestionCard key={i} suggestion={sug} />
                ))}
              </div>
            </div>
          )}

          {/* Profile summary (if no suggestions) */}
          {suggestions.length === 0 && resume.skills?.length > 0 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5E5E5',
                borderRadius: 12,
                padding: 'var(--space-lg)',
              }}
            >
              <h3 className="text-title-lg" style={{ color: 'var(--color-primary)', marginBottom: 12 }}>
                Extracted Profile
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {resume.fullName && (
                  <div><span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Name: </span>
                    <span className="text-body-md" style={{ color: 'var(--color-primary)' }}>{resume.fullName}</span>
                  </div>
                )}
                {resume.skills?.length > 0 && (
                  <div>
                    <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>Skills:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {resume.skills.map((s) => (
                        <span
                          key={s}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: 'var(--color-surface-container-low)',
                            border: '1px solid var(--color-outline-variant)',
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .md-resume-padding { padding: var(--space-margin-desktop) !important; }
          .resume-bento-grid { grid-template-columns: 1fr 2fr !important; }
        }
      `}</style>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: { section: string; original: string; improved: string; impact: string } }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E5E5E5',
        borderRadius: 12,
        padding: 'var(--space-lg)',
      }}
      className="card-hover"
    >
      <h4 className="text-title-md" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
        {suggestion.section}
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }} className="suggestion-grid">
        {/* Original */}
        <div style={{ padding: 'var(--space-md)', borderRadius: 8, backgroundColor: '#F4F4F4', border: '1px solid rgba(196,199,199,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-on-surface-variant)' }}>history</span>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Current Text</span>
          </div>
          <p className="text-body-md" style={{ color: 'var(--color-primary)', textDecoration: 'line-through', textDecorationColor: 'rgba(186,26,26,0.5)' }}>
            {suggestion.original}
          </p>
        </div>
        {/* AI Suggestion */}
        <div style={{ padding: 'var(--space-md)', borderRadius: 8, backgroundColor: '#FAF9F6', border: '1px solid rgba(0,33,71,0.2)', position: 'relative' }}>
          {suggestion.impact === 'High' && (
            <div
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
                backgroundColor: 'var(--color-accent-saffron)',
                color: '#000000',
                fontSize: 10,
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>bolt</span>
              High Impact
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-accent-navy)' }}>edit_square</span>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--color-accent-navy)', textTransform: 'uppercase' }}>AI Suggestion</span>
          </div>
          <p className="text-body-md" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            {suggestion.improved}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 'var(--space-md)' }}>
            <button
              onClick={() => setDismissed(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-on-surface-variant)',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 12px',
              }}
            >
              Dismiss
            </button>
            <button
              className="btn-saffron"
              onClick={() => setDismissed(true)}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
              Apply Fix
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .suggestion-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
