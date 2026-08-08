import React from 'react';

export type Tab = 'dashboard' | 'jobs' | 'applications' | 'resume' | 'coach' | 'profile';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const navItems: { id: Tab; icon: string; label: string }[] = [
  { id: 'dashboard',    icon: 'home',             label: 'Home' },
  { id: 'jobs',         icon: 'work',             label: 'Jobs' },
  { id: 'applications', icon: 'assignment',       label: 'Apps' },
  { id: 'resume',       icon: 'description',      label: 'Resume' },
  { id: 'profile',      icon: 'person',           label: 'Profile' },
];

export function MobileBottomNav({ activeTab, setActiveTab }: Props) {
  return (
    <>
      <nav
        className="mobile-bottom-nav-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-outline-variant)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 64,
          padding: '0 var(--space-margin-mobile)',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: 8,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--color-surface-container-low)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                fontWeight: isActive ? 700 : 400,
                minWidth: 56,
                transition: 'all 0.1s ease',
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
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', lineHeight: '14px' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <style>{`
        .mobile-bottom-nav-bar { display: flex; }
        @media (min-width: 768px) {
          .mobile-bottom-nav-bar { display: none !important; }
        }
      `}</style>
    </>
  );
}
