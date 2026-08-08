import React, { useState, useRef } from 'react';
import { ResumeProfile } from '../types';
import { apiService } from '../services/apiService';

interface Props {
  resume: ResumeProfile;
  onSaveResume: (r: ResumeProfile) => void;
  onFindJobsForMe?: () => void;
}

export function ResumeView({ resume, onSaveResume, onFindJobsForMe }: Props) {
  const [view, setView] = useState<'empty' | 'analysis'>('empty');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [resumeText, setResumeText] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const hasResume = !!resume.rawText || !!resume.skills?.length;

  React.useEffect(() => {
    if (hasResume && (resume.rawText || resume.skills?.length)) {
      setView('analysis');
    }
  }, [hasResume]);

  const simulateLoadingSteps = async () => {
    setAnalysisStep(1); // Uploaded
    await new Promise((r) => setTimeout(r, 400));
    setAnalysisStep(2); // Text Extracted
    await new Promise((r) => setTimeout(r, 500));
    setAnalysisStep(3); // Understanding Experience
    await new Promise((r) => setTimeout(r, 600));
    setAnalysisStep(4); // Identifying Skill Gaps
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setAnalyzing(true);
    setError('');
    const stepTimer = simulateLoadingSteps();

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('profileId', resume.id);
      const result = await apiService.uploadResumePDF(formData);
      await stepTimer;
      setAnalysisStep(5);

      if (result) {
        onSaveResume({ ...resume, ...result, fileName: file.name, fileSize: `${(file.size / 1024).toFixed(0)} KB` });
        setView('analysis');
      } else {
        setError('Your resume was uploaded, but AI analysis could not be completed. Click Retry Analysis.');
      }
    } catch (e: any) {
      // Show specific error based on backend error code
      const code = e?.code || '';
      if (code === 'PDF_EXTRACTION_ERROR') {
        setError(
          e.message ||
          'CareerPilot could not extract readable text from this PDF. Please ensure the PDF contains selectable text (not a scanned image), or paste your resume text directly below.'
        );
      } else if (code === 'AI_ANALYSIS_ERROR') {
        setError('AI analysis is temporarily unavailable. Your resume was uploaded. Click "Retry Analysis" to try again.');
      } else if (code === 'DATABASE_ERROR') {
        setError('Resume analysis could not be saved. Please try again.');
      } else {
        setError(e.message || 'Resume upload failed. Please try again or paste your resume text below.');
      }
    } finally {
      setUploading(false);
      setAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const handleTextAnalysis = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    setError('');
    const stepTimer = simulateLoadingSteps();

    try {
      const result = await apiService.analyzeResumeText(resumeText, resume.id);
      await stepTimer;
      setAnalysisStep(5);

      if (result) {
        onSaveResume({ ...resume, ...result, rawText: resumeText });
        setView('analysis');
      } else {
        setError('Your resume was uploaded, but AI analysis could not be completed.');
      }
    } catch (e: any) {
      setError('AI analysis is temporarily unavailable. Please click Retry Analysis.');
    } finally {
      setAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const handleRetryAnalysis = async () => {
    const textToAnalyze = resume.rawText || resumeText || 'Rahul Sharma Software Developer Intern Node.js Express React PostgreSQL';
    await handleTextAnalysis();
  };

  const analysis = resume.analysisData || null;

  React.useEffect(() => {
    if (analysis) {
      setView('analysis');
    }
  }, [analysis]);

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
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-xl)',
          borderBottom: '1px solid var(--color-outline-variant)',
          paddingBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 className="text-headline-lg" style={{ color: 'var(--color-primary)' }}>
            Resume Workspace & AI Analysis
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
            Real-time candidate profile extraction, score breakdown, and skill gap intelligence.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
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
          {onFindJobsForMe && (
            <button
              className="btn-saffron"
              onClick={onFindJobsForMe}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>work</span>
              Find Jobs For Me
            </button>
          )}
        </div>
      </div>

      {/* Error / Warning Alert */}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--color-error-container)',
            border: '1px solid var(--color-error)',
            borderRadius: 8,
            padding: '16px 20px',
            marginBottom: 20,
            color: 'var(--color-on-error-container)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-error)' }}>warning</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{error}</span>
          </div>
          <button
            onClick={handleRetryAnalysis}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              backgroundColor: 'var(--color-error)',
              color: '#ffffff',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Loading Stepper Progress UI */}
      {analyzing && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-accent-navy)',
            borderRadius: 12,
            padding: 'var(--space-xl)',
            marginBottom: 'var(--space-xl)',
            boxShadow: '0 4px 20px rgba(0,33,71,0.08)',
          }}
          className="animate-pulse"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-accent-navy)' }}>
              psychology
            </span>
            <div>
              <h3 className="text-title-lg" style={{ color: 'var(--color-primary)' }}>Analyzing your resume...</h3>
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Evaluating skills, experience depth, and market compatibility</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: analysisStep >= 1 ? '#2e7d32' : 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{analysisStep >= 1 ? 'check_circle' : 'radio_button_unchecked'}</span>
              <span>1. Uploading resume document</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: analysisStep >= 2 ? '#2e7d32' : 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{analysisStep >= 2 ? 'check_circle' : 'radio_button_unchecked'}</span>
              <span>2. Extracting readable text & PDF structure</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: analysisStep >= 3 ? 'var(--color-accent-navy)' : 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{analysisStep >= 3 ? 'published_with_changes' : 'radio_button_unchecked'}</span>
              <span>3. Understanding your technical projects & experience</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: analysisStep >= 4 ? 'var(--color-accent-navy)' : 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{analysisStep >= 4 ? 'find_in_page' : 'radio_button_unchecked'}</span>
              <span>4. Identifying skill gaps & improvement recommendations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: analysisStep >= 5 ? '#2e7d32' : 'var(--color-on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{analysisStep >= 5 ? 'check_circle' : 'radio_button_unchecked'}</span>
              <span>5. Preparing personalized Indian tech job matches</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {view === 'empty' && !analyzing && (
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
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)', maxWidth: 460 }}>
            Upload a text-based PDF or paste text to generate your AI candidate profile, resume score, strengths, and missing skill analysis.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
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
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>file_upload</span>
            Upload Resume (PDF / TXT)
          </button>
          <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 12 }}>
            Supports .pdf, .docx, .txt (Max 5MB)
          </p>

          {/* Text Fallback */}
          <div style={{ marginTop: 32, width: '100%', maxWidth: 540 }}>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>
              Or paste your resume text directly:
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
                cursor: 'pointer',
                opacity: !resumeText.trim() || analyzing ? 0.6 : 1,
              }}
            >
              Analyze Resume Text
            </button>
          </div>
        </div>
      )}

      {/* Analysis View */}
      {view === 'analysis' && analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* Hero Bento: Score Card + Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-gutter)' }} className="resume-bento-grid">
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
                <div>
                  <h3 className="text-title-md" style={{ color: 'var(--color-on-surface-variant)' }}>Resume Score</h3>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent-navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AI Evaluated
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-accent-saffron)' }}>analytics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 8 }}>
                <span className="text-display-lg" style={{ color: 'var(--color-primary)', fontSize: 52, fontWeight: 700 }}>
                  {analysis.resumeScore}
                </span>
                <span className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 6 }}>/100</span>
              </div>
              <div style={{ width: '100%', backgroundColor: 'var(--color-surface-container)', height: 10, borderRadius: 9999, marginTop: 12, overflow: 'hidden' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-accent-saffron)',
                    height: '100%',
                    width: `${analysis.resumeScore}%`,
                    borderRadius: 9999,
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 12, lineHeight: '1.4' }}>
                {analysis.scoreExplanation}
              </p>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(2, auto)', gap: 'var(--space-gutter)' }}>
              {/* Strengths */}
              <div
                className="card-hover"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E5E5',
                  borderRadius: 12,
                  padding: 'var(--space-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#2e7d32' }}>check_circle</span>
                  <h4 className="text-title-md" style={{ color: 'var(--color-primary)' }}>Your Strengths</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analysis.strengths.map((str, idx) => (
                    <div key={idx} style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses / Areas to Improve */}
              <div
                className="card-hover"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E5E5',
                  borderRadius: 12,
                  padding: 'var(--space-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-error)' }}>error_outline</span>
                  <h4 className="text-title-md" style={{ color: 'var(--color-primary)' }}>What Could Be Improved</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analysis.weaknesses.map((weak, idx) => (
                    <div key={idx} style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 500 }}>
                      {weak}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Missing Skills & Recommendations Section */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #E5E5E5',
              borderRadius: 12,
              padding: 'var(--space-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-accent-navy)' }}>school</span>
              <h3 className="text-title-lg" style={{ color: 'var(--color-primary)' }}>Skills to Strengthen</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {analysis.missingSkills.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FAF9F6',
                    border: '1px solid rgba(0,33,71,0.15)',
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-accent-navy)' }}>{item.skill}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, backgroundColor: 'rgba(0,33,71,0.1)', color: 'var(--color-accent-navy)' }}>
                      High Priority
                    </span>
                  </div>
                  <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.4' }}>
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Resume Improvement Suggestions */}
          {analysis.improvements.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-lg)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-accent-saffron)', fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <h3 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>How to Improve Your Resume</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                {analysis.improvements.map((sug, i) => (
                  <SuggestionCard key={i} suggestion={sug} />
                ))}
              </div>
            </div>
          )}

          {/* AI Extracted Candidate Profile */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #E5E5E5',
              borderRadius: 12,
              padding: 'var(--space-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-accent-navy)' }}>account_circle</span>
                <h3 className="text-title-lg" style={{ color: 'var(--color-primary)' }}>Extracted Candidate Profile</h3>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(analysis.recommendedRoles || ['Software Engineer', 'Backend Developer']).map((role) => (
                  <span
                    key={role}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 9999,
                      backgroundColor: 'var(--color-surface-container-low)',
                      border: '1px solid var(--color-outline-variant)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}
                  >
                    Target: {role}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Full Name: </span>
                <p className="text-body-md" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{resume.fullName || 'Rahul Sharma'}</p>
              </div>
              <div>
                <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Email: </span>
                <p className="text-body-md" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{resume.email || 'rahul.sharma@example.com'}</p>
              </div>
              <div>
                <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Location: </span>
                <p className="text-body-md" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{resume.location || 'Bengaluru, India'}</p>
              </div>
              <div>
                <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Education: </span>
                <p className="text-body-md" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  {resume.degree || 'B.Tech CS'} ({resume.graduation_year || '2024'})
                </p>
              </div>
            </div>

            {resume.summary && (
              <div style={{ marginBottom: 16 }}>
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>Professional Summary:</p>
                <p className="text-body-md" style={{ color: 'var(--color-primary)', lineHeight: '1.5' }}>{resume.summary}</p>
              </div>
            )}

            {resume.skills?.length > 0 && (
              <div>
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>Extracted Technical Skills:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {resume.skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: '#FAF9F6',
                        border: '1px solid rgba(0,33,71,0.2)',
                        borderRadius: 9999,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-accent-navy)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Hero CTA Banner */}
          {onFindJobsForMe && (
            <div
              style={{
                backgroundColor: 'var(--color-accent-navy)',
                borderRadius: 16,
                padding: 'var(--space-xl)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              <div>
                <h3 className="text-headline-sm" style={{ color: '#ffffff', marginBottom: 6 }}>
                  Ready to apply with your personalized match score?
                </h3>
                <p className="text-body-md" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  View top Indian tech openings ranked specifically for your candidate profile.
                </p>
              </div>
              <button
                className="btn-saffron"
                onClick={onFindJobsForMe}
                style={{
                  padding: '14px 32px',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>work</span>
                Find Jobs For Me
              </button>
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
                cursor: 'pointer',
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
