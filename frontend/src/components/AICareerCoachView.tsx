import React, { useState, useEffect } from 'react';
import { ResumeProfile } from '../types';
import { apiService } from '../services/apiService';

interface Props {
  resume: ResumeProfile;
}

interface CoachData {
  topRole: string;
  profileSummary: string;
  skillsToStrengthen: Array<{ skill: string; priority: 'High' | 'Medium' | 'Low' }>;
  recommendation: string;
  recommendedAction: string;
  actionPlan?: {
    next7Days: string[];
    next30Days: string[];
    next90Days: string[];
  };
  interviewQuestions: Array<{ category: 'Technical' | 'Behavioral'; question: string }>;
}

const PRIORITY_STYLES: Record<string, { bg: string; color: string }> = {
  High: { bg: 'var(--color-secondary-fixed)', color: 'var(--color-on-secondary-container)' },
  Medium: { bg: 'var(--color-surface-variant)', color: 'var(--color-on-surface-variant)' },
  Low: { bg: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)' },
};

export function AICareerCoachView({ resume }: Props) {
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasResumeData = !!resume?.skills?.length || !!resume?.fullName || !!resume?.rawText;
  const canonicalScore = resume?.analysisData?.resumeScore ?? 0;

  const loadInsights = async () => {
    if (!hasResumeData) return;

    setLoading(true);
    setError('');
    try {
      const result = await apiService.getCareerAdvice(resume.id, resume);
      if (result) {
        // Derive personalized guidance from API or resume analysisData
        const candidateSkills = resume.skills || [];
        const isJava = candidateSkills.some((s) => /java|spring/i.test(s));
        const isFrontend = candidateSkills.some((s) => /react|typescript|next/i.test(s));
        const topRole = result.topRole || (isJava ? 'Java Backend Developer' : isFrontend ? 'Frontend Engineer' : 'Full Stack Engineer');

        const missingFromAnalysis = (resume.analysisData?.missingSkills || []).map((m) =>
          typeof m === 'string' ? m : m.skill
        );

        const skillsToStrengthen = (
          result.skillsToStrengthen ||
          (result.skillGaps || missingFromAnalysis).map((s: string) => ({ skill: s, priority: 'High' as const }))
        ).slice(0, 5);

        if (skillsToStrengthen.length === 0) {
          if (isJava) {
            skillsToStrengthen.push({ skill: 'Docker', priority: 'High' }, { skill: 'Apache Kafka', priority: 'Medium' }, { skill: 'AWS EC2', priority: 'Medium' });
          } else if (isFrontend) {
            skillsToStrengthen.push({ skill: 'Node.js', priority: 'High' }, { skill: 'PostgreSQL', priority: 'Medium' }, { skill: 'WebSockets', priority: 'Medium' });
          } else {
            skillsToStrengthen.push({ skill: 'Docker', priority: 'High' }, { skill: 'AWS', priority: 'Medium' }, { skill: 'Redis', priority: 'Medium' });
          }
        }

        setCoachData({
          topRole,
          profileSummary:
            result.summary ||
            `Based on your resume, you have strong technical foundation in ${candidateSkills.slice(0, 4).join(', ') || 'software development'}. Adding containerization and system metrics will elevate your hiring chances for ${topRole} roles.`,
          skillsToStrengthen,
          recommendation:
            result.recommendation ||
            `Build and deploy a production-ready application using ${candidateSkills[0] || 'your core stack'} and containerize it.`,
          recommendedAction:
            result.actionDetail ||
            `Addressing your key skill gaps improves profile match score for ${topRole} roles by up to 20%.`,
          actionPlan: result.actionPlan || {
            next7Days: [
              'Quantify project descriptions with performance or throughput metrics',
              `Revise core concepts in ${candidateSkills[0] || 'your stack'}`,
            ],
            next30Days: [
              `Master ${skillsToStrengthen[0]?.skill || 'Docker'} fundamentals`,
              `Build a production-style ${topRole} portfolio project`,
            ],
            next90Days: [
              `Prepare for ${topRole} technical and coding interviews`,
              'Apply to high-compatibility roles on CareerPilot',
            ],
          },
          interviewQuestions: result.interviewQuestions || (isJava ? [
            { category: 'Technical', question: 'How does Spring Boot manage dependency injection and transaction isolation?' },
            { category: 'Behavioral', question: 'Describe a project where you optimized backend API throughput or SQL performance.' },
          ] : [
            { category: 'Technical', question: 'Explain React Virtual DOM reconciliation and key rendering optimizations in Next.js.' },
            { category: 'Behavioral', question: 'Describe how you structured state management in a complex web application.' },
          ]),
        });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load career insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [resume.id, resume.updatedAt]);

  // Clean empty state if no resume uploaded
  if (!hasResumeData) {
    return (
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '48px 24px',
          textAlign: 'center',
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--color-accent-navy)', marginBottom: 16 }}>
          psychology
        </span>
        <h1 className="text-headline-md" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>
          AI Career Intelligence
        </h1>
        <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', maxWidth: 500, margin: '0 auto 24px' }}>
          Upload your resume in the Resume tab to unlock personalized career coaching, target role guidance, skill gap roadmaps, and domain interview prep!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'var(--space-xl) var(--space-margin-mobile)',
        paddingBottom: 100,
        fontFamily: 'Manrope, sans-serif',
      }}
      className="md-coach-padding animate-fadeIn"
    >
      {/* Header */}
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="text-headline-lg" style={{ color: 'var(--color-on-surface)', marginBottom: 4 }}>
          AI Career Intelligence
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)' }}>
          Personalized guidance for {resume.fullName || 'Candidate'} — Aligned with your actual resume and target tech roles.
        </p>
      </header>

      {loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: 8,
            border: '1px solid var(--color-outline-variant)',
            marginBottom: 24,
          }}
        >
          <span className="material-symbols-outlined animate-pulse" style={{ fontSize: 24, color: 'var(--color-accent-navy)' }}>
            psychology
          </span>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface)' }}>
            Analyzing your resume profile and active tech market demand...
          </p>
        </div>
      )}

      {coachData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-lg)' }} className="coach-grid">
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Profile Strength Card */}
            <section
              className="card-hover"
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                borderRadius: 12,
                border: '1px solid var(--color-surface-variant)',
                padding: 'var(--space-lg)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-md)' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 24,
                    color: 'var(--color-accent-saffron)',
                    backgroundColor: 'var(--color-surface-container)',
                    padding: 8,
                    borderRadius: '50%',
                  }}
                >
                  target
                </span>
                <h2 className="text-title-lg" style={{ color: 'var(--color-on-surface)' }}>
                  Profile Alignment & Resume Score
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: 'var(--color-accent-navy)',
                    backgroundColor: 'var(--color-surface-container-low)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--color-outline-variant)',
                  }}
                >
                  {canonicalScore > 0 ? `${canonicalScore}/100` : 'AI Evaluated'}
                </div>
                <div>
                  <span className="text-label-md" style={{ display: 'block', color: 'var(--color-outline)', textTransform: 'uppercase' }}>
                    Target Role Alignment
                  </span>
                  <span className="text-title-md" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                    {coachData.topRole}
                  </span>
                </div>
              </div>

              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
                {coachData.profileSummary}
              </p>
            </section>

            {/* Skills to Strengthen */}
            <section
              className="card-hover"
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                borderRadius: 12,
                border: '1px solid var(--color-surface-variant)',
                padding: 'var(--space-lg)',
              }}
            >
              <h2 className="text-title-lg" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-md)' }}>
                Prioritized Skill Gaps to Close
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {coachData.skillsToStrengthen.map((item) => {
                  const style = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Medium;
                  return (
                    <div
                      key={item.skill}
                      style={{
                        backgroundColor: style.bg,
                        color: style.color,
                        padding: '8px 14px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span className="text-body-sm" style={{ fontWeight: 600 }}>
                        {item.skill}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          opacity: 0.8,
                        }}
                      >
                        {item.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Action Plan Roadmap */}
            {coachData.actionPlan && (
              <section
                className="card-hover"
                style={{
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  borderRadius: 12,
                  border: '1px solid var(--color-surface-variant)',
                  padding: 'var(--space-lg)',
                }}
              >
                <h2 className="text-title-lg" style={{ color: 'var(--color-on-surface)', marginBottom: 16 }}>
                  Personalized 90-Day Action Roadmap
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                  {[
                    { title: 'Next 7 Days', items: coachData.actionPlan.next7Days, badgeBg: '#e3f2fd', badgeColor: '#1565c0' },
                    { title: 'Next 30 Days', items: coachData.actionPlan.next30Days, badgeBg: '#fff3e0', badgeColor: '#e65100' },
                    { title: 'Next 60-90 Days', items: coachData.actionPlan.next90Days, badgeBg: '#e8f5e9', badgeColor: '#2e7d32' },
                  ].map((phase) => (
                    <div
                      key={phase.title}
                      style={{
                        padding: 16,
                        backgroundColor: 'var(--color-surface-container-low)',
                        borderRadius: 8,
                        border: '1px solid var(--color-outline-variant)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: phase.badgeBg,
                          color: phase.badgeColor,
                          padding: '3px 10px',
                          borderRadius: 4,
                          display: 'inline-block',
                          marginBottom: 8,
                        }}
                      >
                        {phase.title}
                      </span>
                      <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--color-on-surface)' }}>
                        {phase.items?.map((item, idx) => (
                          <li key={idx} className="text-body-sm" style={{ marginBottom: 4 }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Core Recommendation CTA */}
            <section
              style={{
                backgroundColor: 'var(--color-accent-navy)',
                color: '#ffffff',
                borderRadius: 12,
                padding: 'var(--space-lg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-accent-saffron)' }}>
                  rocket_launch
                </span>
                <h2 className="text-title-lg" style={{ color: '#ffffff' }}>
                  High-Impact Recommendation
                </h2>
              </div>
              <h3 className="text-title-md" style={{ color: '#ffffff', fontWeight: 700, marginBottom: 8 }}>
                {coachData.recommendation}
              </h3>
              <p className="text-body-sm" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                {coachData.recommendedAction}
              </p>
            </section>

            {/* Tailored Interview Questions */}
            <section
              className="card-hover"
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                borderRadius: 12,
                border: '1px solid var(--color-surface-variant)',
                padding: 'var(--space-lg)',
              }}
            >
              <h2 className="text-title-lg" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-md)' }}>
                Targeted Interview Prep ({coachData.topRole})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {coachData.interviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 12,
                      backgroundColor: 'var(--color-surface-container-low)',
                      borderRadius: 8,
                      border: '1px solid var(--color-outline-variant)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: q.category === 'Technical' ? 'var(--color-accent-navy)' : 'var(--color-accent-saffron)',
                        marginBottom: 4,
                        display: 'block',
                      }}
                    >
                      {q.category} Question
                    </span>
                    <p className="text-body-sm" style={{ color: 'var(--color-on-surface)', fontWeight: 600, margin: 0 }}>
                      "{q.question}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .coach-grid { grid-template-columns: 1fr 360px !important; }
        }
      `}</style>
    </div>
  );
}
