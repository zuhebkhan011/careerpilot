import React from 'react';
import { Application, Job } from '../types';
import { NotificationPanel } from './NotificationPanel';

export type Tab = 'dashboard' | 'jobs' | 'applications' | 'resume' | 'coach' | 'profile';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenProModal: () => void;
  applications: Application[];
  jobs: Job[];
}

const navItems: { id: Tab; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'jobs', icon: 'work', label: 'Find Jobs' },
  { id: 'applications', icon: 'assignment_turned_in', label: 'Applications' },
  { id: 'resume', icon: 'description', label: 'Resume' },
  { id: 'coach', icon: 'psychology', label: 'AI Career Coach' },
];

export function DesktopSidebar({ activeTab, setActiveTab, onOpenProModal, applications, jobs }: Props) {
  return (
    <nav
      style={{
        width: 260,
        minWidth: 260,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-outline-variant)',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'var(--space-lg)',
        paddingBottom: 'var(--space-lg)',
        zIndex: 50,
      }}
      className="hidden md:flex"
    >
      {/* Logo + Header Actions */}
      <div style={{ padding: '0 var(--space-lg)', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="text-headline-md" style={{ color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '-0.01em' }}>
            CareerPilot
          </div>
          <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
            Professional Precision
          </div>
        </div>
        <NotificationPanel applications={applications} jobs={jobs} setActiveTab={setActiveTab} align="left" />
      </div>

      {/* Primary Nav Items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 16px' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingTop: 12,
                paddingRight: 16,
                paddingBottom: 12,
                paddingLeft: isActive ? 12 : 16,
                borderRadius: 8,
                borderLeft: isActive ? '4px solid var(--color-accent-saffron)' : '4px solid transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background-color 0.15s ease, color 0.15s ease',
                backgroundColor: isActive ? 'var(--color-surface-container-low)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                fontWeight: isActive ? 700 : 400,
                fontFamily: 'Manrope, sans-serif',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-container)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-on-surface-variant)';
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 24,
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span className="text-title-md">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Upgrade Button */}
      <div style={{ padding: '0 16px', marginTop: 'auto', marginBottom: 16 }}>
        <button
          className="btn-primary"
          onClick={onOpenProModal}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            lineHeight: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-accent-saffron)', fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          Upgrade to Pro
        </button>
      </div>

      {/* Bottom links (Profile, Settings) */}
      <div
        style={{
          borderTop: '1px solid var(--color-outline-variant)',
          padding: '16px 16px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {[
          { id: 'profile' as Tab, icon: 'person', label: 'Profile' },
          { id: 'dashboard' as Tab, icon: 'settings', label: 'Settings', isSettings: true },
        ].map((item) => {
          const isActive = activeTab === item.id && !item.isSettings;
          return (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--color-surface-container-low)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                fontWeight: isActive ? 700 : 400,
                fontFamily: 'Manrope, sans-serif',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-on-surface-variant)';
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {item.icon}
              </span>
              <span className="text-body-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
