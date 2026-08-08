import React from 'react';
import { Application, Job } from '../types';
import { NotificationPanel } from './NotificationPanel';

export type Tab = 'dashboard' | 'jobs' | 'applications' | 'resume' | 'coach' | 'profile';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  applications: Application[];
  jobs: Job[];
}

export function MobileHeader({ activeTab, setActiveTab, applications, jobs }: Props) {
  const titles: Record<Tab, string> = {
    dashboard: 'CareerPilot',
    jobs: 'CareerPilot',
    applications: 'CareerPilot',
    resume: 'CareerPilot',
    coach: 'CareerPilot',
    profile: 'CareerPilot',
  };

  return (
    <>
      <header
        className="mobile-header-bar"
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          zIndex: 40,
          backgroundColor: 'rgba(253, 248, 248, 0.80)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-outline-variant)',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 64,
          padding: '0 var(--space-margin-mobile)',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--color-primary)',
            letterSpacing: '-0.01em',
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          {titles[activeTab]}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--color-on-surface-variant)' }}>
          <NotificationPanel applications={applications} jobs={jobs} setActiveTab={setActiveTab as any} />
          <button
            onClick={() => setActiveTab('profile')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>account_circle</span>
          </button>
        </div>
      </header>
      <style>{`
        .mobile-header-bar { display: flex; }
        @media (min-width: 768px) {
          .mobile-header-bar { display: none !important; }
        }
      `}</style>
    </>
  );
}
