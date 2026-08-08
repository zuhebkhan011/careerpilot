import React, { useState } from 'react';
import { Application, Job } from '../types';

interface Props {
  applications: Application[];
  onUpdateApplication: (app: Application) => void;
  onDeleteApplication: (id: string) => void;
  onOpenCoverLetter: (job: Job) => void;
  jobs: Job[];
  onOpenNewAppModal: () => void;
}

type KanbanStatus = 'Interested' | 'Applied' | 'Interview' | 'Selected' | 'Rejected';

const COLUMNS: {
  id: KanbanStatus;
  label: string;
  dotColor: string;
  headerBg: string;
  headerTextColor: string;
  backendStatuses: string[];
}[] = [
  {
    id: 'Interested',
    label: 'Interested',
    dotColor: 'var(--color-outline)',
    headerBg: 'var(--color-surface-container)',
    headerTextColor: 'var(--color-primary)',
    backendStatuses: ['Saved', 'INTERESTED', 'Interested'],
  },
  {
    id: 'Applied',
    label: 'Applied',
    dotColor: 'var(--color-secondary)',
    headerBg: 'var(--color-surface-container)',
    headerTextColor: 'var(--color-primary)',
    backendStatuses: ['Applied', 'APPLIED'],
  },
  {
    id: 'Interview',
    label: 'Interview',
    dotColor: 'var(--color-secondary)',
    headerBg: 'var(--color-secondary-fixed)',
    headerTextColor: 'var(--color-on-secondary-fixed)',
    backendStatuses: ['Interviewing', 'INTERVIEW', 'Interview'],
  },
  {
    id: 'Selected',
    label: 'Selected',
    dotColor: '#2e7d32',
    headerBg: 'var(--color-surface-container)',
    headerTextColor: 'var(--color-primary)',
    backendStatuses: ['Offered', 'SELECTED', 'Selected'],
  },
  {
    id: 'Rejected',
    label: 'Rejected',
    dotColor: 'var(--color-error)',
    headerBg: 'var(--color-surface-container)',
    headerTextColor: 'var(--color-primary)',
    backendStatuses: ['Rejected', 'REJECTED'],
  },
];

function mapStatusToColumn(status: string): KanbanStatus {
  for (const col of COLUMNS) {
    if (col.backendStatuses.includes(status)) return col.id;
  }
  return 'Interested';
}

function mapColumnToStatus(col: KanbanStatus): string {
  const map: Record<KanbanStatus, string> = {
    Interested: 'Saved',
    Applied: 'Applied',
    Interview: 'Interviewing',
    Selected: 'Offered',
    Rejected: 'Rejected',
  };
  return map[col];
}

function getCompanyInitials(company: string): string {
  return company.split(/[\s\-&]+/).slice(0, 3).map((w) => w[0]).join('').toUpperCase().slice(0, 3);
}

export function ApplicationsView({ applications, onUpdateApplication, onDeleteApplication, onOpenCoverLetter, jobs, onOpenNewAppModal }: Props) {
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);

  const getAppsInColumn = (col: typeof COLUMNS[0]) =>
    applications.filter((a) => col.backendStatuses.includes(a.status));

  const handleStatusChange = (app: Application, newCol: KanbanStatus) => {
    const newStatus = mapColumnToStatus(newCol);
    onUpdateApplication({ ...app, status: newStatus as any });
    setShowStatusMenu(null);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background)',
        overflow: 'hidden',
      }}
      className="animate-fadeIn"
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 64,
          padding: '0 var(--space-margin-mobile)',
          borderBottom: '1px solid var(--color-outline-variant)',
          backgroundColor: 'rgba(253,248,248,0.8)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
        className="md-apps-header"
      >
        <h2 className="text-headline-md block" style={{ color: 'var(--color-primary)' }}>
          Applications Tracker
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            className="btn-primary"
            onClick={onOpenNewAppModal}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            New Application
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div
        className="kanban-scroll"
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: 'var(--space-margin-mobile)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-lg)',
            height: '100%',
            minWidth: 'max-content',
            paddingBottom: 'var(--space-lg)',
          }}
        >
          {COLUMNS.map((col) => {
            const colApps = getAppsInColumn(col);
            return (
              <div
                key={col.id}
                style={{
                  width: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--color-surface-container-low)',
                  borderRadius: 12,
                  border: '1px solid var(--color-outline-variant)',
                  maxHeight: '100%',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-outline-variant)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: col.headerBg,
                    borderRadius: '12px 12px 0 0',
                  }}
                >
                  <h3
                    className="text-title-md"
                    style={{ color: col.headerTextColor, display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: col.dotColor,
                        display: 'inline-block',
                      }}
                    />
                    {col.label}
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--color-on-surface-variant)',
                      backgroundColor: 'var(--color-surface)',
                      padding: '2px 8px',
                      borderRadius: 9999,
                      border: '1px solid var(--color-outline-variant)',
                    }}
                  >
                    {colApps.length}
                  </span>
                </div>

                {/* Cards */}
                <div
                  className="kanban-scroll"
                  style={{
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    overflowY: 'auto',
                    flex: 1,
                  }}
                >
                  {colApps.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        minHeight: 120,
                        opacity: 0.5,
                        textAlign: 'center',
                        padding: 16,
                      }}
                    >
                      {col.id === 'Selected' && (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: 36, marginBottom: 6 }}>celebration</span>
                          <p className="text-body-sm">Offers will appear here</p>
                        </>
                      )}
                      {col.id === 'Rejected' && (
                        <p className="text-body-sm">No rejections yet.</p>
                      )}
                      {!['Selected', 'Rejected'].includes(col.id) && (
                        <p className="text-body-sm">No applications here yet.</p>
                      )}
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        colId={col.id}
                        showStatusMenu={showStatusMenu === app.id}
                        onToggleMenu={() => setShowStatusMenu(showStatusMenu === app.id ? null : app.id)}
                        onStatusChange={(newCol) => handleStatusChange(app, newCol)}
                        onDelete={() => onDeleteApplication(app.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-apps-header { padding: 0 var(--space-margin-desktop) !important; }
        }
      `}</style>
    </div>
  );
}

function AppCard({
  app,
  colId,
  showStatusMenu,
  onToggleMenu,
  onStatusChange,
  onDelete,
}: {
  app: Application;
  colId: KanbanStatus;
  showStatusMenu: boolean;
  onToggleMenu: () => void;
  onStatusChange: (col: KanbanStatus) => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const initials = getCompanyInitials(app.company);
  const isInterview = colId === 'Interview';
  const appliedDate = app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${hovered ? 'var(--color-accent-navy)' : isInterview ? 'var(--color-accent-navy)' : 'var(--color-outline-variant)'}`,
        borderRadius: 8,
        padding: 'var(--space-lg)',
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'border-color 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Interview left accent bar */}
      {isInterview && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: '100%',
            backgroundColor: 'var(--color-accent-navy)',
          }}
        />
      )}

      {/* Header: logo + match badge + menu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 6,
            backgroundColor: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)' }}>{initials}</span>
        </div>

        {app.matchScore > 0 ? (
          <span
            style={{
              backgroundColor: 'var(--color-accent-saffron)',
              color: '#2f1400',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '4px 8px',
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
            {app.matchScore}% Match
          </span>
        ) : (
          appliedDate && (
            <span
              style={{
                backgroundColor: 'var(--color-surface-variant)',
                color: 'var(--color-on-surface)',
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: 9999,
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              {appliedDate}
            </span>
          )
        )}
      </div>

      <h4 className="text-title-md" style={{ color: 'var(--color-primary)', marginBottom: 4 }}>
        {app.role}
      </h4>
      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
        {app.company}
      </p>

      {/* Footer info */}
      <div
        style={{
          borderTop: '1px solid var(--color-outline-variant)',
          paddingTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--color-on-surface-variant)',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
          {app.location || app.workMode || 'N/A'}
        </span>

        {/* Status change menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 4px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>more_horiz</span>
          </button>
          {showStatusMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: 28,
                right: 0,
                zIndex: 100,
                backgroundColor: 'var(--color-surface-container-lowest)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                minWidth: 160,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-outline-variant)' }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-on-surface-variant)' }}>
                  MOVE TO
                </p>
              </div>
              {COLUMNS.filter((c) => c.id !== colId).map((c) => (
                <button
                  key={c.id}
                  onClick={(e) => { e.stopPropagation(); onStatusChange(c.id); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: 'Manrope, sans-serif',
                    backgroundColor: 'transparent',
                    color: 'var(--color-on-surface)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-container-low)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  → {c.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: 'Manrope, sans-serif',
                    backgroundColor: 'transparent',
                    color: 'var(--color-error)',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
