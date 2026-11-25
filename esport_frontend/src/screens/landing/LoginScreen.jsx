import React, { useState, useEffect } from 'react';
import './LoginScreen.css';
import { apiFetch, notifyUserUpdated } from '../../utils/api';

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
  const [recoveryToken, setRecoveryToken] = useState('');

  // Check if session previously expired due to inactivity
  useEffect(() => {
    if (sessionStorage.getItem('session_expired_notice') === 'true') {
      setErrorMsg('Your previous session expired after 8 hours of inactivity. Please enter your credentials to log in.');
      sessionStorage.removeItem('session_expired_notice');
    }
  }, []);

  // If already logged in, automatically proceed without requiring re-authentication
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      if (onLoginSuccess) onLoginSuccess();
    }
  }, [onLoginSuccess]);

  // Automatically detect recovery link redirect from email or direct recovery token
  useEffect(() => {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const hashParams = new URLSearchParams(hash.replace(/^#/, '?'));
      const searchParams = new URLSearchParams(search);

      // Handle any legacy redirect error
      const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
      const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
      if (errorDesc || errorCode) {
        setAuthMode('forgot');
        setErrorMsg('The recovery link has expired (8-hour limit exceeded) or is invalid. Please enter your email below to receive a fresh recovery link.');
        return;
      }

      if (hash.includes('type=recovery') || search.includes('type=recovery') || hashParams.get('token') || searchParams.get('token')) {
        setAuthMode('reset-password');
        const emailFromUrl = hashParams.get('email') || searchParams.get('email');
        const tokenFromUrl = hashParams.get('token') || searchParams.get('token');
        if (emailFromUrl) setEmail(decodeURIComponent(emailFromUrl));
        if (tokenFromUrl) setRecoveryToken(tokenFromUrl);
      }
    } catch (_) {}
  }, []);

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
      setEmail('');
      setPassword('');
      setErrorMsg('');
      setSuccessMsg('');
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
        const username = data.user.username || data.user.user_metadata?.username || data.user.user_metadata?.ign || (data.user.email ? data.user.email.split('@')[0] : 'Admin');
        localStorage.setItem('username', username);
        localStorage.setItem('user_ign', username);
        notifyUserUpdated();
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
        body: JSON.stringify({ email: email.trim(), newPassword, token: recoveryToken || undefined }),
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

  const handleSendRecoveryLink = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setAuthMode('forgot');
  };

  const switchToLogin = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setRecoveryToken('');
    setAuthMode('login');
    try {
      if (window.location.hash.includes('type=recovery') || window.location.hash.includes('error=')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (_) {}
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
                  placeholder="name@example.com"
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
            </form>
          </>
        )}

        {/* ─────────────── FORGOT KEY MODE ─────────────── */}
        {authMode === 'forgot' && (
          <>
            <div className="login-screen-header">
              <div className="brand-logo-login">ESPORT</div>
              <h2>RECOVER KEY</h2>
              <p>Enter your registered email address to receive a secure recovery link in your Gmail (valid for 8 hours).</p>
            </div>
            <form className="login-form" onSubmit={handleSendRecoveryLink}>
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
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="login-submit-btn" disabled={isSendingLink}>
                {isSendingLink ? 'SENDING RECOVERY LINK...' : 'SEND RECOVERY LINK VIA EMAIL'}
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

        {/* ─────────────── RESET KEY MODE (Via Email Link) ─────────────── */}
        {authMode === 'reset-password' && (
          <>
            <div className="login-screen-header">
              <div className="brand-logo-login">ESPORT</div>
              <h2>SET NEW SECURITY KEY</h2>
              <p>Enter your new security key for {email || 'your account'}.</p>
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
                <label htmlFor="new-password">New Security Key</label>
                <div className="login-password-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new-password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
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

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? 'UPDATING KEY...' : 'UPDATE SECURITY KEY'}
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
            <h2 className="login-success-title">RECOVERY LINK SENT</h2>
            <p className="login-success-desc">
              {successMsg || 'A recovery link (valid for 8 hours) has been dispatched to your Gmail. Please check your inbox or spam folder to reset your security key.'}
            </p>
            
            <button
              type="button"
              className="login-submit-btn"
              style={{ width: '100%', marginTop: '1.5rem' }}
              onClick={switchToLogin}
            >
              RETURN TO LOGIN
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginScreen;
