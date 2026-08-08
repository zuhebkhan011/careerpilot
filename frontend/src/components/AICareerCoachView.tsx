import React, { useState } from 'react';
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
  interviewQuestions: Array<{ category: 'Technical' | 'Behavioral'; question: string }>;
}

const DEFAULT_COACH: CoachData = {
  topRole: 'Backend Developer',
  profileSummary: 'Based on your recent projects in Node.js and database optimizations, you have a strong foundation for mid-level backend roles.',
  skillsToStrengthen: [
    { skill: 'Docker', priority: 'High' },
    { skill: 'AWS', priority: 'Medium' },
    { skill: 'Redis', priority: 'Medium' },
  ],
  recommendation: 'Build and deploy one REST API using Docker.',
  recommendedAction: 'This action directly addresses your highest priority skill gap. Completing this project will increase your profile match score for top-tier backend roles by an estimated 15%.',
  interviewQuestions: [
    { category: 'Technical', question: 'Explain the difference between SQL and NoSQL databases.' },
    { category: 'Behavioral', question: 'Describe a time you had to learn a new technology quickly.' },
  ],
};

const PRIORITY_STYLES: Record<string, { bg: string; color: string }> = {
  High: { bg: 'var(--color-secondary-fixed)', color: 'var(--color-on-secondary-container)' },
  Medium: { bg: 'var(--color-surface-variant)', color: 'var(--color-on-surface-variant)' },
  Low: { bg: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)' },
};

export function AICareerCoachView({ resume }: Props) {
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const result = await apiService.getCareerAdvice(resume.id, resume);
      if (result) {
        setCoachData({
          topRole: result.topRole ?? DEFAULT_COACH.topRole,
          profileSummary: result.summary ?? DEFAULT_COACH.profileSummary,
          skillsToStrengthen: result.skillGaps?.map((s: string) => ({ skill: s, priority: 'Medium' as const })) ?? DEFAULT_COACH.skillsToStrengthen,
          recommendation: result.recommendation ?? DEFAULT_COACH.recommendation,
          recommendedAction: result.actionDetail ?? DEFAULT_COACH.recommendedAction,
          interviewQuestions: result.interviewQuestions ?? DEFAULT_COACH.interviewQuestions,
        });
      } else {
        setCoachData(DEFAULT_COACH);
      }
    } catch {
      setCoachData(DEFAULT_COACH);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  React.useEffect(() => {
    loadInsights();
  }, []);

  const data = coachData ?? DEFAULT_COACH;

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'var(--space-xl) var(--space-margin-mobile)',
        paddingBottom: 100,
      }}
      className="md-coach-padding animate-fadeIn"
    >
      {/* Header */}
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 className="text-headline-lg" style={{ color: 'var(--color-on-surface)', marginBottom: 4 }}>
          AI Career Intelligence
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)' }}>
          Strategic insights aligned with your current profile and market demand.
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
            Analysing your profile and market demand...
          </p>
        </div>
      )}

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
                Your Profile Strength
              </h2>
            </div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'var(--color-on-surface-variant)',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Top Aligned Role
              </div>
              <div className="text-headline-md" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                {data.topRole}
              </div>
            </div>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              {data.profileSummary}
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
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-md)' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 24,
                  color: 'var(--color-secondary)',
                  backgroundColor: 'var(--color-secondary-fixed)',
                  padding: 8,
                  borderRadius: '50%',
                }}
              >
                fitness_center
              </span>
              <h2 className="text-title-lg" style={{ color: 'var(--color-on-surface)' }}>
                Skills to Strengthen
              </h2>
            </div>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
              Market analysis shows these skills appear in 78% of your target job descriptions.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.skillsToStrengthen.map((item) => {
                const style = PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.Medium;
                return (
                  <li
                    key={item.skill}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      backgroundColor: 'var(--color-surface-container-low)',
                      borderRadius: 8,
                      border: '1px solid var(--color-surface-variant)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }}>
                        terminal
                      </span>
                      <span className="text-title-md" style={{ color: 'var(--color-on-surface)' }}>
                        {item.skill}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        backgroundColor: style.bg,
                        color: style.color,
                        padding: '4px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {item.priority} Priority
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Strategic Recommendation Hero */}
          <section
            style={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              borderRadius: 12,
              padding: 'var(--space-lg)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              border: '1px solid rgba(196,199,199,0.2)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: 16,
                opacity: 0.08,
                pointerEvents: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 120 }}>rocket_launch</span>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20, color: 'var(--color-accent-saffron)', fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-surface-variant)',
                  }}
                >
                  Strategic Recommendation
                </span>
              </div>
              <h2 className="text-headline-lg" style={{ marginBottom: 12 }}>
                {data.recommendation}
              </h2>
              <p className="text-body-lg" style={{ color: 'var(--color-primary-fixed-dim)', marginBottom: 'var(--space-lg)', maxWidth: 600 }}>
                {data.recommendedAction}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn-saffron"
                  style={{
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>play_arrow</span>
                  View Project Guide
                </button>
                <button
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-outline-variant)',
                    color: 'var(--color-on-primary)',
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={loadInsights}
                >
                  Refresh
                </button>
              </div>
            </div>
          </section>

          {/* Interview Prep */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 24,
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-surface-container)',
                    padding: 8,
                    borderRadius: '50%',
                  }}
                >
                  record_voice_over
                </span>
                <h2 className="text-title-lg" style={{ color: 'var(--color-on-surface)' }}>
                  Interview Prep
                </h2>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary)', fontSize: 16, fontWeight: 600 }}>
                View All
              </button>
            </div>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
              Common behavioral and technical questions expected for junior roles.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)' }} className="interview-grid">
              {data.interviewQuestions.map((q, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid var(--color-surface-variant)',
                    borderRadius: 8,
                    padding: 'var(--space-md)',
                    backgroundColor: 'var(--color-surface)',
                    transition: 'box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                      color: q.category === 'Technical' ? 'var(--color-secondary)' : 'var(--color-accent-saffron)',
                    }}
                  >
                    {q.category}
                  </div>
                  <h3 className="text-title-md" style={{ color: 'var(--color-on-surface)', marginBottom: 12 }}>
                    {q.question}
                  </h3>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-on-surface-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 14,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>model_training</span>
                    Practice Answer
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-coach-padding { padding: var(--space-xl) var(--space-margin-desktop) !important; }
        }
        @media (min-width: 1024px) {
          .coach-grid { grid-template-columns: 1fr 2fr !important; }
          .interview-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
