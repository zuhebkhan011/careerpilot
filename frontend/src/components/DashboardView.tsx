import React, { useEffect, useState } from 'react';
import { Job, Application, ResumeProfile } from '../types';
import { apiService } from '../services/apiService';

interface Props {
  jobs: Job[];
  applications: Application[];
  resume: ResumeProfile;
  setActiveTab: (tab: string) => void;
  onSelectJob: (job: Job) => void;
  onTrackJob?: (job: Job) => void;
  onApplyJob: (job: Job) => void;
  onOpenProModal: () => void;
}

interface DashboardStats {
  totalJobsMatched: number;
  topMatch: number;
  totalApplications: number;
  interviews: number;
  resumeScore: number;
  topRecommendedJobs?: any[];
}

function getCompanyInitials(company: string): string {
  return company
    .split(/[\s\-&]+/)
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}

function getMatchColor(score: number): string {
  if (score >= 80) return 'var(--color-accent-saffron)';
  if (score >= 60) return '#F4A261';
  return 'var(--color-outline)';
}

export function DashboardView({
  jobs,
  applications,
  resume,
  setActiveTab,
  onSelectJob,
  onApplyJob,
  onOpenProModal,
}: Props) {
  const canonicalScore = resume?.analysisData?.resumeScore ?? 0;

  const [stats, setStats] = useState<DashboardStats>({
    totalJobsMatched: jobs.length,
    topMatch: 0,
    totalApplications: applications.length,
    interviews: 0,
    resumeScore: canonicalScore,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await apiService.getDashboard(resume.id);
        setStats({
          totalJobsMatched: data.totalJobsMatched ?? jobs.length,
          topMatch: data.topMatch ?? 0,
          totalApplications: data.totalApplications ?? applications.length,
          interviews: data.interviews ?? 0,
          resumeScore: canonicalScore || data.resumeScore || 0,
          topRecommendedJobs: data.topRecommendedJobs ?? [],
        });
      } catch {
        setStats({
          totalJobsMatched: jobs.length,
          topMatch: jobs.length > 0 ? Math.max(...jobs.map((j) => j.matchScore || 0)) : 0,
          totalApplications: applications.length,
          interviews: applications.filter((a) =>
            ['Interviewing', 'INTERVIEW', 'Interview'].includes(a.status)
          ).length,
          resumeScore: canonicalScore,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [resume?.id, resume?.analysisData?.resumeScore, jobs.length, applications.length]);

  const topJobs = jobs.slice(0, 3);
  const firstName = resume.fullName?.split(' ')[0] || 'there';

  const kpiCards = [
    { icon: 'check_circle', value: stats.totalJobsMatched, label: 'Jobs Matched', color: 'var(--color-secondary)', tab: 'jobs' },
    { icon: 'send', value: stats.totalApplications, label: 'Applications', color: 'var(--color-secondary)', tab: 'applications' },
    { icon: 'forum', value: stats.interviews, label: 'Interviews', color: 'var(--color-secondary)', tab: 'applications' },
    { icon: 'description', value: stats.resumeScore, label: 'Resume Score', color: 'var(--color-accent-saffron)', highlight: true, tab: 'resume' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('jobs');
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px var(--space-margin-mobile)',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
      className="md-px-desktop animate-fadeIn"
    >
      {/* Welcome Header + Search Bar */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 className="text-headline-lg" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>
            Good morning, {firstName}.
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)', maxWidth: 640 }}>
            Here are the opportunities and insights that matter most to you.
          </p>
        </div>

        {/* Responsive Search Area (Issue 7 Fix: Properly aligned in flow) */}
        <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: 600 }}>
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: 14,
                fontSize: 20,
                color: 'var(--color-outline)',
                pointerEvents: 'none',
              }}
            >
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles, skills, or companies (e.g. Backend, React)..."
              style={{
                width: '100%',
                paddingLeft: 44,
                paddingRight: 110,
                paddingTop: 12,
                paddingBottom: 12,
                backgroundColor: 'var(--color-surface-container-low)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 10,
                fontSize: 15,
                fontFamily: 'Manrope, sans-serif',
                color: 'var(--color-on-surface)',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                position: 'absolute',
                right: 6,
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Find Jobs
            </button>
          </div>
        </form>
      </section>

      {/* Bento Grid: KPI + AI Insight */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-gutter)',
        }}
        className="dashboard-bento-grid"
      >
        {/* KPI Grid (2x2) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-gutter)',
          }}
        >
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="card-hover"
              onClick={() => card.tab && setActiveTab(card.tab)}
              style={{
                backgroundColor: card.highlight ? 'var(--color-surface-container-low)' : '#ffffff',
                border: `1px solid ${card.highlight ? 'rgba(244,162,97,0.4)' : '#E5E5E5'}`,
                borderRadius: 12,
                padding: 'var(--space-lg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className="text-title-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {card.label}
                </span>
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 24,
                    color: card.color,
                    fontVariationSettings: card.highlight ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {card.icon}
                </span>
              </div>
              <div className="text-display-lg" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                {card.value}
                {card.label === 'Resume Score' && <span style={{ fontSize: 18, color: 'var(--color-on-surface-variant)', fontWeight: 400 }}>/100</span>}
              </div>
            </div>
          ))}
        </div>

        {/* AI Insight Card */}
        <div
          style={{
            backgroundColor: 'var(--color-accent-navy)',
            color: '#ffffff',
            borderRadius: 12,
            padding: 'var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="md-ai-insight-card"
        >
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 140,
              height: 140,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, color: 'var(--color-accent-saffron)', fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                AI Career Intelligence
              </span>
            </div>
            <h3 className="text-headline-md" style={{ marginBottom: 8 }}>
              Strong alignment for Backend roles
            </h3>
            <p className="text-body-sm" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, maxWidth: 500 }}>
              Your experience with Express & PostgreSQL matches 3 high-priority job listings in Bengaluru.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('coach')}
            className="btn-saffron"
            style={{
              alignSelf: 'flex-start',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 20,
            }}
          >
            View Career Advice
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              arrow_forward
            </span>
          </button>
        </div>
      </section>

      {/* Recommended Jobs Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>
              Top Matches for You
            </h2>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
              Based on your resume and skill profile
            </p>
          </div>
          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-secondary)',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            View All Jobs
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
          </button>
        </div>

        {/* Job Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {topJobs.map((job) => {
            const initials = getCompanyInitials(job.company);
            const score = job.matchScore || 85;
            const matchColor = getMatchColor(score);

            return (
              <div
                key={job.id}
                className="card-hover"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E5E5',
                  borderRadius: 12,
                  padding: 'var(--space-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        backgroundColor: 'var(--color-surface-container)',
                        border: '1px solid var(--color-outline-variant)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent-navy)' }}>
                        {initials}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-title-lg" style={{ color: 'var(--color-primary)', marginBottom: 2 }}>
                        {job.role}
                      </h3>
                      <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                        {job.company} · {job.location} ({job.workMode})
                      </p>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: 'var(--color-surface-container-low)',
                      border: `1px solid ${matchColor}`,
                      borderRadius: 9999,
                      padding: '6px 14px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: matchColor, fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                      {score}% Match
                    </span>
                  </div>
                </div>

                {/* Skills tags */}
                {job.skillsRequired && job.skillsRequired.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {job.skillsRequired.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 9999,
                          backgroundColor: 'var(--color-surface-container-low)',
                          border: '1px solid var(--color-outline-variant)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--color-on-surface)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-outline-variant)',
                    paddingTop: 14,
                  }}
                >
                  <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                    {job.salary || 'Competitive'}
                  </span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => onSelectJob(job)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid var(--color-outline-variant)',
                        backgroundColor: 'transparent',
                        color: 'var(--color-primary)',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontFamily: 'Manrope, sans-serif',
                      }}
                    >
                      Match Breakdown
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => onApplyJob(job)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Track Application
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style>{`
        @media (min-width: 768px) {
          .md-px-desktop { padding: 32px var(--space-margin-desktop) !important; }
        }
        @media (min-width: 1024px) {
          .dashboard-bento-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
