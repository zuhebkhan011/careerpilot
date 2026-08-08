import React, { useState } from 'react';

interface Props {
  onLoginSuccess: (profileId: string) => void;
}

const DEMO_CREDENTIALS = [
  { email: 'rahul.sharma@example.com', password: 'demo1234', profileId: 'demo-profile-1', name: 'Rahul Sharma' },
  { email: 'demo@careerpilot.ai', password: 'careerpilot', profileId: 'demo-profile-1', name: 'Demo User' },
];

export function LoginView({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = touched.email && !email.trim() ? 'Email is required'
    : touched.email && !/^\S+@\S+\.\S+$/.test(email) ? 'Enter a valid email' : '';
  const passwordError = touched.password && !password ? 'Password is required'
    : touched.password && password.length < 6 ? 'Minimum 6 characters' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email || !password || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return;

    setLoading(true);
    setError('');

    // Try real backend auth first
    try {
      const res = await fetch('/api/profiles/demo-profile-1');
      const body = await res.json();

      if (body.success) {
        // Backend is up — check credentials against demo list
        const match = DEMO_CREDENTIALS.find(
          (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
        );
        if (match) {
          // Store session
          sessionStorage.setItem('cp_profile_id', match.profileId);
          sessionStorage.setItem('cp_user_email', match.email);
          sessionStorage.setItem('cp_user_name', match.name);
          onLoginSuccess(match.profileId);
          return;
        }
        setError('Invalid email or password. Try: rahul.sharma@example.com / demo1234');
      } else {
        throw new Error('Backend error');
      }
    } catch {
      // Backend down — still allow demo login
      const match = DEMO_CREDENTIALS.find(
        (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );
      if (match) {
        sessionStorage.setItem('cp_profile_id', match.profileId);
        sessionStorage.setItem('cp_user_email', match.email);
        sessionStorage.setItem('cp_user_name', match.name);
        onLoginSuccess(match.profileId);
        return;
      }
      setError('Invalid email or password. Try: rahul.sharma@example.com / demo1234');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('rahul.sharma@example.com');
    setPassword('demo1234');
    setError('');
    setTouched({ email: false, password: false });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px var(--space-margin-mobile)',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            backgroundColor: 'var(--color-primary)',
            borderRadius: 16,
            marginBottom: 16,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#ffffff', fontVariationSettings: "'FILL' 1" }}>
            flight_takeoff
          </span>
        </div>
        <h1
          className="text-headline-lg"
          style={{ color: 'var(--color-primary)', marginBottom: 8 }}
        >
          CareerPilot
        </h1>
        <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
          Professional Precision with Human Warmth
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 16,
          padding: '32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        <h2 className="text-title-lg" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>
          Sign in to your account
        </h2>
        <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 28 }}>
          Access your personalised career intelligence.
        </p>

        {/* Error banner */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              backgroundColor: 'var(--color-error-container)',
              border: '1px solid rgba(186,26,26,0.2)',
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: 20,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-error)', flexShrink: 0, marginTop: 1 }}>
              error
            </span>
            <p className="text-body-sm" style={{ color: 'var(--color-on-error-container)' }}>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="login-email"
              className="text-label-md"
              style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 6, textTransform: 'uppercase' }}
            >
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 18,
                  color: emailError ? 'var(--color-error)' : 'var(--color-outline)',
                  pointerEvents: 'none',
                }}
              >
                mail
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  paddingLeft: 40,
                  paddingRight: 16,
                  paddingTop: 12,
                  paddingBottom: 12,
                  backgroundColor: 'var(--color-surface-container-low)',
                  border: `1px solid ${emailError ? 'var(--color-error)' : 'var(--color-outline-variant)'}`,
                  borderRadius: 8,
                  fontSize: 16,
                  fontFamily: 'Manrope, sans-serif',
                  color: 'var(--color-on-surface)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => {
                  if (!emailError) (e.target as HTMLInputElement).style.borderColor = 'var(--color-primary)';
                }}
                onBlurCapture={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = emailError ? 'var(--color-error)' : 'var(--color-outline-variant)';
                }}
              />
            </div>
            {emailError && (
              <p className="text-body-sm" style={{ color: 'var(--color-error)', marginTop: 4 }}>{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label
              htmlFor="login-password"
              className="text-label-md"
              style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 6, textTransform: 'uppercase' }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 18,
                  color: passwordError ? 'var(--color-error)' : 'var(--color-outline)',
                  pointerEvents: 'none',
                }}
              >
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  paddingLeft: 40,
                  paddingRight: 48,
                  paddingTop: 12,
                  paddingBottom: 12,
                  backgroundColor: 'var(--color-surface-container-low)',
                  border: `1px solid ${passwordError ? 'var(--color-error)' : 'var(--color-outline-variant)'}`,
                  borderRadius: 8,
                  fontSize: 16,
                  fontFamily: 'Manrope, sans-serif',
                  color: 'var(--color-on-surface)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-outline)',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {passwordError && (
              <p className="text-body-sm" style={{ color: 'var(--color-error)', marginTop: 4 }}>{passwordError}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: loading ? 'rgba(0,0,0,0.4)' : 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'Manrope, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.15s ease',
            }}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-pulse" style={{ fontSize: 20 }}>
                  autorenew
                </span>
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Demo credentials helper */}
        <div
          style={{
            marginTop: 24,
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface-container)',
            borderRadius: 8,
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <p className="text-label-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 8, textTransform: 'uppercase' }}>
            Demo credentials
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface)' }}>
                <strong>Email:</strong> rahul.sharma@example.com
              </p>
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface)' }}>
                <strong>Password:</strong> demo1234
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                backgroundColor: 'var(--color-accent-saffron)',
                color: '#1c1b1b',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Manrope, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              Fill
            </button>
          </div>
        </div>
      </div>

      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 24, textAlign: 'center' }}>
        © 2024 CareerPilot · Professional Precision with Human Warmth
      </p>
    </div>
  );
}
