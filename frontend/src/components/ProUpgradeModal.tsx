import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const FREE_FEATURES = [
  'Resume upload & parsing',
  'Job search & listing',
  'AI match score per job',
  'Application tracker (Kanban)',
  'Basic cover letter generation',
  '5 AI match analyses per day',
];

const PRO_FEATURES = [
  { text: 'Unlimited AI match analyses', icon: 'psychology' },
  { text: 'Deep resume audit with rewrite suggestions', icon: 'edit_document' },
  { text: 'Personalised AI Career Coach', icon: 'school' },
  { text: 'Priority job recommendations', icon: 'bolt' },
  { text: 'Advanced interview prep questions', icon: 'record_voice_over' },
  { text: 'Application analytics & insights', icon: 'analytics' },
  { text: 'Unlimited cover letter generation', icon: 'description' },
  { text: 'Early access to new features', icon: 'star' },
];

export function ProUpgradeModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = orig;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return;
    setSubmitted(true);
  };

  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slideUp"
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.24)',
          fontFamily: 'Manrope, sans-serif',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ffffff',
            padding: 6,
            borderRadius: '50%',
            display: 'flex',
            zIndex: 10,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
        </button>

        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #002f66 100%)',
            color: '#ffffff',
            padding: '40px 32px 32px',
            borderRadius: '16px 16px 0 0',
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(244,162,97,0.2)',
              border: '1px solid rgba(244,162,97,0.4)',
              borderRadius: 9999,
              padding: '6px 16px',
              marginBottom: 16,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-accent-saffron)', fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent-saffron)' }}>
              Pro Preview
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 12, color: '#ffffff' }}>
            CareerPilot <span style={{ color: 'var(--color-accent-saffron)' }}>Pro</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', maxWidth: 480, margin: '0 auto' }}>
            Unlock the full power of AI-driven career guidance. Get deeper insights, smarter matches, and an unfair advantage in your job search.
          </p>
        </div>

        {/* Pricing comparison */}
        <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="pro-plan-grid">
          {/* Free */}
          <div
            style={{
              padding: 20,
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 12,
              backgroundColor: 'var(--color-surface-container-low)',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>Current</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>Free</p>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>Everything you need to start</p>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, listStyle: 'none' }}>
              {FREE_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-on-surface-variant)', flexShrink: 0, marginTop: 1 }}>
                    check
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--color-on-surface)' }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div
            style={{
              padding: 20,
              border: '2px solid var(--color-accent-saffron)',
              borderRadius: 12,
              backgroundColor: 'var(--color-surface-container-lowest)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--color-accent-saffron)',
                color: '#1c1b1b',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '4px 14px',
                borderRadius: 9999,
              }}
            >
              Coming Soon
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent-saffron)', marginBottom: 4 }}>Upgrade</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>Pro</p>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>For serious career movers</p>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, listStyle: 'none' }}>
              {PRO_FEATURES.map((f) => (
                <li key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-accent-saffron)', flexShrink: 0, marginTop: 1, fontVariationSettings: "'FILL' 1" }}>
                    {f.icon}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--color-on-surface)', fontWeight: 500 }}>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Waitlist form */}
        <div
          style={{
            margin: '0 32px 32px',
            padding: 24,
            backgroundColor: 'var(--color-surface-container)',
            borderRadius: 12,
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          {submitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', padding: '8px 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#2e7d32', fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-primary)', margin: 0 }}>You're on the waitlist!</p>
                <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', margin: 0 }}>We'll notify you when CareerPilot Pro launches.</p>
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4, margin: 0 }}>
                Get early access
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 16 }}>
                We're launching Pro soon. Join the waitlist and be first to know.
              </p>
              <form onSubmit={handleNotify} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    flex: 1,
                    minWidth: 180,
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--color-outline-variant)',
                    backgroundColor: 'var(--color-surface-container-lowest)',
                    fontSize: 14,
                    fontFamily: 'Manrope, sans-serif',
                    color: 'var(--color-on-surface)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--color-accent-saffron)',
                    color: '#1c1b1b',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Manrope, sans-serif',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Notify Me
                </button>
              </form>
            </>
          )}
        </div>

        <style>{`
          @media (max-width: 600px) {
            .pro-plan-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
