import React, { useState, useMemo } from 'react';
import { Job, Application } from '../types';

interface Props {
  jobs: Job[];
  applications: Application[];
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
  hasResume?: boolean;
}

const WORK_MODES = ['All', 'Remote', 'Hybrid', 'Onsite', 'On-site'] as const;
const LOCATIONS = ['All', 'Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi NCR', 'Chennai', 'Remote'];

function getCompanyInitials(company: string): string {
  return company
    .split(/[\s\-&]+/)
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}

export function JobsView({ jobs, applications, onSelectJob, onApplyJob, hasResume }: Props) {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [workModeFilter, setWorkModeFilter] = useState<string>('All');
  const [showLocationDrop, setShowLocationDrop] = useState(false);
  const [showWorkModeDrop, setShowWorkModeDrop] = useState(false);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((a) => a.jobId)),
    [applications]
  );

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.role.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        (job.skillsRequired || []).some((s) => s.toLowerCase().includes(q));
      const matchesLoc =
        locationFilter === 'All' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesMode =
        workModeFilter === 'All' ||
        job.workMode?.toLowerCase() === workModeFilter.toLowerCase();
      return matchesSearch && matchesLoc && matchesMode;
    });
  }, [jobs, search, locationFilter, workModeFilter]);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 'var(--space-lg) var(--space-margin-mobile)',
      }}
      className="animate-fadeIn"
    >
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="text-headline-lg" style={{ color: 'var(--color-primary)', marginBottom: 12 }}>
          Find opportunities that fit your profile.
        </h1>

        {/* Personalization Banner */}
        {hasResume ? (
          <div
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-accent-navy)', fontSize: 22 }}>
              psychology
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>
              Jobs matched to your profile — Ranked by AI compatibility with your resume
            </span>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#FAF9F6',
              border: '1px dashed var(--color-outline-variant)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--color-accent-saffron)', fontSize: 22 }}>
              info
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-primary)' }}>
              Upload your resume in the Resume tab to unlock personalized job matching and explainable AI fit scores!
            </span>
          </div>
        )}

        {/* BUG 1 FIX: Single Primary Search Bar directly below page heading */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 640, marginBottom: 20 }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 20,
              color: 'var(--color-outline)',
              pointerEvents: 'none',
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search roles, skills or companies"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 44,
              paddingRight: 16,
              paddingTop: 12,
              paddingBottom: 12,
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 10,
              fontSize: 16,
              fontFamily: 'Manrope, sans-serif',
              outline: 'none',
              color: 'var(--color-on-surface)',
              boxSizing: 'border-box',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, position: 'relative' }}>
          {/* Location filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowLocationDrop(!showLocationDrop); setShowWorkModeDrop(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                border: locationFilter !== 'All'
                  ? '1px solid var(--color-primary)'
                  : '1px solid var(--color-outline-variant)',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Manrope, sans-serif',
                cursor: 'pointer',
                backgroundColor: locationFilter !== 'All' ? 'rgba(0,0,0,0.05)' : 'var(--color-surface-container-lowest)',
                color: locationFilter !== 'All' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              }}
            >
              {locationFilter === 'All' ? 'Location' : locationFilter}
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {locationFilter !== 'All' ? 'close' : 'arrow_drop_down'}
              </span>
            </button>
            {showLocationDrop && (
              <div
                style={{
                  position: 'absolute',
                  top: 42,
                  left: 0,
                  zIndex: 100,
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 160,
                  overflow: 'hidden',
                }}
              >
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setLocationFilter(loc); setShowLocationDrop(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontFamily: 'Manrope, sans-serif',
                      backgroundColor: locationFilter === loc ? 'var(--color-surface-container-low)' : 'transparent',
                      color: 'var(--color-on-surface)',
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Work Mode filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowWorkModeDrop(!showWorkModeDrop); setShowLocationDrop(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                border: workModeFilter !== 'All'
                  ? '1px solid var(--color-primary)'
                  : '1px solid var(--color-outline-variant)',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Manrope, sans-serif',
                cursor: 'pointer',
                backgroundColor: workModeFilter !== 'All' ? 'rgba(0,0,0,0.05)' : 'var(--color-surface-container-lowest)',
                color: workModeFilter !== 'All' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              }}
            >
              {workModeFilter === 'All' ? 'Work Mode' : workModeFilter}
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {workModeFilter !== 'All' ? 'close' : 'arrow_drop_down'}
              </span>
            </button>
            {showWorkModeDrop && (
              <div
                style={{
                  position: 'absolute',
                  top: 42,
                  left: 0,
                  zIndex: 100,
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 160,
                  overflow: 'hidden',
                }}
              >
                {WORK_MODES.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setWorkModeFilter(mode); setShowWorkModeDrop(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontFamily: 'Manrope, sans-serif',
                      backgroundColor: workModeFilter === mode ? 'var(--color-surface-container-low)' : 'transparent',
                      color: 'var(--color-on-surface)',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 20, fontWeight: 600 }}>
        {filtered.length} opportunities found
      </p>

      {/* Job Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: 'var(--space-md)',
        }}
        className="jobs-cards-grid"
      >
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: 'var(--color-on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>
              search_off
            </span>
            <p className="text-body-md">No jobs match your search or filters.</p>
          </div>
        ) : (
          filtered.map((job) => (
            <FindJobCard
              key={job.id}
              job={job}
              isApplied={appliedJobIds.has(job.id)}
              onViewMatch={onSelectJob}
              onApply={onApplyJob}
            />
          ))
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .jobs-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1280px) {
          .jobs-cards-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function FindJobCard({
  job,
  isApplied,
  onViewMatch,
  onApply,
}: {
  job: Job;
  isApplied: boolean;
  onViewMatch: (j: Job) => void;
  onApply: (j: Job) => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const initials = getCompanyInitials(job.company);
  const matchScore = job.matchScore || 0;
  const matchHigh = matchScore >= 80;
  const matchMed = matchScore >= 60;

  const matchBg = matchHigh
    ? 'rgba(244,162,97,0.1)'
    : 'var(--color-surface-container-low)';
  const matchBadgeBg = matchHigh ? 'var(--color-accent-saffron)' : 'var(--color-surface-container-high)';
  const matchBadgeColor = matchHigh ? '#1c1b1b' : 'var(--color-on-surface-variant)';
  const matchText = matchHigh
    ? 'Strong match for your profile.'
    : matchMed
    ? 'Moderate match. Some skills align well.'
    : 'Partial match. Some transferable skills.';

  return (
    <div
      className="card-hover animate-fadeIn"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: `1px solid ${hovered ? 'var(--color-accent-navy)' : 'var(--color-outline-variant)'}`,
        borderRadius: 12,
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* Header: logo + title + bookmark */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              backgroundColor: 'var(--color-surface-container)',
              borderRadius: 8,
              border: '1px solid var(--color-outline-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent-navy)' }}>{initials}</span>
          </div>
          <div>
            <h3
              className="text-title-md"
              style={{ color: hovered ? 'var(--color-accent-navy)' : 'var(--color-primary)', transition: 'color 0.15s ease' }}
            >
              {job.role}
            </h3>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              {job.company}
            </p>
          </div>
        </div>
        <button
          aria-label="Bookmark job"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)', padding: 4 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            {isApplied ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {[job.location, job.salary, job.workMode].filter(Boolean).map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 13,
              color: 'var(--color-on-surface-variant)',
              backgroundColor: 'var(--color-surface-container)',
              padding: '3px 10px',
              borderRadius: 4,
              fontWeight: 500,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* AI Match insight */}
      {matchScore > 0 && (
        <div
          style={{
            backgroundColor: matchBg,
            border: `1px solid ${matchHigh ? 'rgba(244,162,97,0.2)' : 'var(--color-outline-variant)'}`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <div
            style={{
              backgroundColor: matchBadgeBg,
              color: matchBadgeColor,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '4px 8px',
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>psychology</span>
            {matchScore}%
          </div>
          <p className="text-body-sm" style={{ color: 'var(--color-primary)' }}>
            {matchText}
          </p>
        </div>
      )}

      {/* Action */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
        <button
          className="btn-primary"
          onClick={() => onViewMatch(job)}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          View Match
        </button>

        {job.source === 'linkedin' && job.sourceUrl ? (
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: '#0a66c2',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            LinkedIn
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
          </a>
        ) : (
          <button
            onClick={() => onApply(job)}
            disabled={isApplied}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: isApplied ? 'var(--color-surface-container-high)' : 'var(--color-accent-saffron)',
              color: isApplied ? 'var(--color-on-surface-variant)' : '#000000',
              border: 'none',
              cursor: isApplied ? 'default' : 'pointer',
            }}
          >
            {isApplied ? 'Applied' : 'Apply'}
          </button>
        )}
      </div>
    </div>
  );
}
