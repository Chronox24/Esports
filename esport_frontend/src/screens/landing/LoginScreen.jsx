import React, { useState, useEffect } from 'react';
import './LoginScreen.css';
import { apiFetch } from '../../utils/api';

const LoginScreen = ({ onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'forgot' | 'success'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [recoveryUrl, setRecoveryUrl] = useState('');

  // Prevent background scrolling kapag bukas ang modal
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`Server error (${response.status}): ${text.slice(0, 120) || 'Service unavailable'}`);
        }
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }
      if (!response.ok) {
        throw new Error(data?.error || 'Login failed');
      }
      if (data.session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        localStorage.setItem('token', data.session.access_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        const username = data.user.user_metadata?.username || data.user.user_metadata?.ign || (data.user.email ? data.user.email.split('@')[0] : 'Admin');
        localStorage.setItem('username', username);
        localStorage.setItem('user_ign', username);
      }
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        alert('Login Successful!');
        handleClose();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetKey = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    if (!newPassword) {
      setErrorMsg('Please enter your new security key.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Security key must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New security keys do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch('/api/reset-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to reset security key.');
      }
      setPassword(newPassword);
      setSuccessMsg(data.message || 'Security key successfully updated! You can now log in.');
      setAuthMode('success');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecoveryLink = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email) {
      setErrorMsg('Please enter your registered email address first.');
      return;
    }
    setIsSendingLink(true);
    try {
      const response = await apiFetch('/api/forgot-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send recovery link.');
      }
      setSuccessMsg(data.message || 'Recovery link sent! Please check your email.');
      if (data.recoveryUrl) {
        setRecoveryUrl(data.recoveryUrl);
      }
      setAuthMode('success');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSendingLink(false);
    }
  };

  const switchToForgot = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setNewPassword('');
    setConfirmPassword('');
    setAuthMode('forgot');
  };

  const switchToLogin = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setAuthMode('login');
  };

  return (
    <div className={`login-screen-overlay ${isAnimatingOut ? 'fade-out' : 'fade-in'}`}>
      <div className="login-overlay-backdrop" onClick={handleClose}></div>
      <div className={`login-screen-card ${isAnimatingOut ? 'slide-down' : 'slide-up'}`}>
        <button className="login-screen-close" onClick={handleClose} aria-label="Close">
          &times;
        </button>

        {/* ─────────────── LOGIN MODE ─────────────── */}
        {authMode === 'login' && (
          <>
            <div className="login-screen-header">
              <div className="brand-logo-login">ESPORT</div>
              <h2>ADMIN PORTAL</h2>
              <p>Enter your credentials to access the tournament management system.</p>
            </div>
            <form className="login-form" onSubmit={handleLogin}>
              {errorMsg && (
                <div className="login-error-badge">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="login-success-badge">
                  {successMsg}
                </div>
              )}
              <div className="login-input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="admin@esport.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="login-input-group">
                <label htmlFor="password">Security Key</label>
                <div className="login-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="#forgot" className="forgot-password" onClick={switchToForgot}>
                  Forgot Key?
                </a>
              </div>
              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? 'LOGGING IN...' : 'LOGIN'}
              </button>
              <button type="button" className="login-alt-btn" onClick={() => alert('Redirecting to Access Request form...')}>
                REQUEST ACCESS
              </button>
            </form>
          </>
        )}

        {/* ─────────────── FORGOT KEY MODE ─────────────── */}
        {authMode === 'forgot' && (
          <>
            <div className="login-screen-header">
              <div className="brand-logo-login">ESPORT</div>
              <h2>RECOVER KEY</h2>
              <p>Reset your security key or request recovery instructions for your admin account.</p>
            </div>
            <form className="login-form" onSubmit={handleResetKey}>
              {errorMsg && (
                <div className="login-error-badge">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="login-success-badge">
                  {successMsg}
                </div>
              )}

              <div className="login-input-group">
                <label htmlFor="recovery-email">Registered Email Address</label>
                <input
                  type="email"
                  id="recovery-email"
                  placeholder="admin@esport.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="login-input-group">
                <label htmlFor="new-password">New Security Key</label>
                <div className="login-password-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new-password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-toggle-password-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="login-input-group">
                <label htmlFor="confirm-password">Confirm Security Key</label>
                <div className="login-password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm-password"
                    placeholder="Re-enter security key"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading || isSendingLink}>
                {isLoading ? 'RESETTING KEY...' : 'RESET SECURITY KEY'}
              </button>

              <button
                type="button"
                className="login-secondary-link-btn"
                onClick={handleSendRecoveryLink}
                disabled={isLoading || isSendingLink}
              >
                {isSendingLink ? 'DISPATCHING EMAIL...' : 'SEND RECOVERY LINK VIA EMAIL'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="login-back-to-login-btn"
                  onClick={switchToLogin}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          </>
        )}

        {/* ─────────────── SUCCESS MODE ─────────────── */}
        {authMode === 'success' && (
          <div className="login-success-view">
            <div className="login-success-icon-wrapper">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00ffcc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="login-success-title">ACTION SUCCESSFUL</h2>
            <p className="login-success-desc">
              {successMsg || 'Your security key has been updated successfully.'}
            </p>
            {recoveryUrl && (
              <div className="login-recovery-box">
                <span className="login-recovery-label">Recovery Link Ready:</span>
                <a
                  href={recoveryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="login-recovery-url"
                >
                  Open Recovery Link ↗
                </a>
              </div>
            )}
            <button
              type="button"
              className="login-submit-btn"
              style={{ width: '100%', marginTop: '1.5rem' }}
              onClick={switchToLogin}
            >
              PROCEED TO LOGIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
