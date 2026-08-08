import React, { useEffect, useRef, useState } from 'react';
import { Application, Job } from '../types';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  tab?: string;
  icon: string;
  iconColor: string;
}

interface Props {
  applications: Application[];
  jobs: Job[];
  setActiveTab: (tab: string) => void;
  align?: 'left' | 'right';
}

function buildNotifications(applications: Application[], jobs: Job[]): Notification[] {
  const notes: Notification[] = [];
  const now = new Date();

  // App status-based notifications
  applications.slice(0, 6).forEach((app) => {
    const isInterview = ['Interviewing', 'INTERVIEW', 'Interview'].includes(app.status);
    const isSelected = ['Offered', 'SELECTED', 'Selected'].includes(app.status);
    const isApplied = ['Applied', 'APPLIED'].includes(app.status);

    if (isInterview) {
      notes.push({
        id: `app-int-${app.id}`,
        title: `Interview stage — ${app.role}`,
        description: `Your application to ${app.company} has progressed to the interview stage. Prepare now.`,
        timestamp: app.lastUpdated || app.appliedDate,
        read: false,
        tab: 'applications',
        icon: 'forum',
        iconColor: 'var(--color-secondary)',
      });
    } else if (isSelected) {
      notes.push({
        id: `app-sel-${app.id}`,
        title: `🎉 Offer received — ${app.role}`,
        description: `Congratulations! ${app.company} has extended an offer for ${app.role}.`,
        timestamp: app.lastUpdated || app.appliedDate,
        read: false,
        tab: 'applications',
        icon: 'celebration',
        iconColor: '#2e7d32',
      });
    } else if (isApplied) {
      notes.push({
        id: `app-appl-${app.id}`,
        title: `Applied — ${app.role}`,
        description: `Application to ${app.company} is now being reviewed.`,
        timestamp: app.appliedDate,
        read: true,
        tab: 'applications',
        icon: 'send',
        iconColor: 'var(--color-on-surface-variant)',
      });
    }
  });

  // Jobs notifications
  if (jobs.length > 0) {
    notes.push({
      id: 'jobs-new',
      title: `${jobs.length} jobs matched to your profile`,
      description: `${jobs.slice(0, 2).map((j) => j.role).join(', ')} and more are waiting for you.`,
      timestamp: now.toISOString(),
      read: jobs.length < 3,
      tab: 'jobs',
      icon: 'work',
      iconColor: 'var(--color-accent-navy)',
    });
  }

  // Resume notification
  notes.push({
    id: 'resume-tip',
    title: 'Resume tip: Add quantified achievements',
    description: 'Adding numbers to your experience bullet points can increase match scores by up to 20%.',
    timestamp: now.toISOString(),
    read: false,
    tab: 'resume',
    icon: 'tips_and_updates',
    iconColor: 'var(--color-accent-saffron)',
  });

  return notes.slice(0, 8);
}

function relativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recently';
  }
}

export function NotificationPanel({ applications, jobs, setActiveTab, align = 'right' }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(buildNotifications(applications, jobs));
  }, [applications.length, jobs.length]);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (n: Notification) => {
    setNotifications((prev) => prev.map((p) => p.id === n.id ? { ...p, read: true } : p));
    if (n.tab) setActiveTab(n.tab);
    setOpen(false);
  };

  return (
    <div ref={panelRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount ? ` — ${unreadCount} unread` : ''}`}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: open ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
          padding: 4,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.15s ease',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>notifications</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              minWidth: 16,
              height: 16,
              backgroundColor: 'var(--color-error)',
              color: '#ffffff',
              borderRadius: 9999,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              border: '2px solid var(--color-surface)',
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown popover (BUG 2 FIX: Anchored properly within viewport) */}
      {open && (
        <div
          className="animate-slideUp"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            ...(align === 'left' ? { left: 0 } : { right: 0 }),
            width: 340,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 440,
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 12,
            boxShadow: '0 12px 36px rgba(0,0,0,0.16)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid var(--color-outline-variant)',
              backgroundColor: 'var(--color-surface-container-low)',
              flexShrink: 0,
            }}
          >
            <h3 className="text-title-md" style={{ color: 'var(--color-primary)', margin: 0 }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }} className="kanban-scroll">
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 8, opacity: 0.5 }}>
                  notifications_none
                </span>
                <p className="text-body-sm">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    border: 'none',
                    borderBottom: '1px solid var(--color-outline-variant)',
                    cursor: 'pointer',
                    backgroundColor: n.read ? 'transparent' : 'rgba(244,162,97,0.05)',
                    transition: 'background-color 0.12s ease',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-container-low)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = n.read ? 'transparent' : 'rgba(244,162,97,0.05)';
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface-container)',
                      border: `1px solid var(--color-outline-variant)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: n.iconColor }}>
                      {n.icon}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <p
                        className="text-body-sm"
                        style={{
                          color: 'var(--color-primary)',
                          fontWeight: n.read ? 400 : 600,
                          marginBottom: 2,
                        }}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-accent-saffron)',
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                      )}
                    </div>
                    <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 4, lineHeight: 1.4 }}>
                      {n.description}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-outline)', fontWeight: 500 }}>
                      {relativeTime(n.timestamp)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
