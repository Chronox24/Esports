import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import Home from './screens/landing/Home.jsx';
import AboutUs from './screens/landing/AboutUs.jsx';
import Projects from './screens/landing/Projects.jsx';
import Services from './screens/landing/Services.jsx';
import MainUIScreen from "./screens/main/MainUIScreen.jsx";

// 8 hours inactivity timeout threshold (8 hours * 60 min * 60 sec * 1000 ms = 28,800,000 ms)
const INACTIVITY_TIMEOUT_MS = 8 * 60 * 60 * 1000;

const App = () => {
  const navigate = useNavigate();

  // Session expiration toast state
  const [sessionNotice, setSessionNotice] = useState(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('session_expired_notice') === 'true') {
      sessionStorage.removeItem('session_expired_notice');
      return 'Your session ended after 8 hours of inactivity. You can log in again anytime.';
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) return false;
    const lastActiveStr = localStorage.getItem('lastActivityTime');
    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      if (Date.now() - lastActive >= INACTIVITY_TIMEOUT_MS) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        localStorage.removeItem('user_ign');
        localStorage.removeItem('lastActivityTime');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('session_expired_notice', 'true');
        }
        return false;
      }
    }
    return true;
  });

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setSessionNotice(null);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('lastActivityTime', Date.now().toString());
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = (isExpired = false) => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('user_ign');
    localStorage.removeItem('lastActivityTime');
    if (isExpired) {
      setSessionNotice('Your session ended after 8 hours of inactivity. You can log in again anytime.');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('session_expired_notice', 'true');
      }
    }
    navigate('/', { replace: true });
  };

  // 8-hour Inactivity Tracker: monitors mouse movement, clicks, keystrokes, touch, scroll
  useEffect(() => {
    if (!isLoggedIn) return;

    // Initialize lastActivityTime if not present
    if (!localStorage.getItem('lastActivityTime')) {
      localStorage.setItem('lastActivityTime', Date.now().toString());
    }

    const checkInactivity = () => {
      const lastActiveStr = localStorage.getItem('lastActivityTime');
      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (Date.now() - lastActive >= INACTIVITY_TIMEOUT_MS) {
          handleLogout(true);
        }
      }
    };

    // Run check immediately on mount
    checkInactivity();

    let lastThrottle = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle localStorage updates to at most once every 10 seconds to avoid unnecessary writes
      if (now - lastThrottle >= 10000) {
        lastThrottle = now;
        localStorage.setItem('lastActivityTime', now.toString());
      }
    };

    // User activity events: moving mouse, clicking, typing, scrolling, or touching on mobile
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Check periodically every 30 seconds
    const intervalId = setInterval(checkInactivity, 30000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  return (
    <>
      {/* Session Inactivity Timeout Toast Banner */}
      {sessionNotice && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1.5px solid rgba(239, 68, 68, 0.7)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(239, 68, 68, 0.35)',
            color: '#ffffff',
            padding: '14px 18px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '440px',
            fontFamily: "'Chakra Petch', 'Inter', sans-serif",
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div style={{ color: '#ef4444', fontSize: '22px', flexShrink: 0 }}>⏱️</div>
          <div style={{ flex: 1, fontSize: '13px', lineHeight: '1.4' }}>
            <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#f87171', fontSize: '11px', marginBottom: '2px' }}>
              Auto Logout Notice
            </div>
            {sessionNotice}
          </div>
          <button
            onClick={() => setSessionNotice(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '2px 6px',
            }}
            title="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              isLoggedIn={isLoggedIn}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/about"
          element={
            <AboutUs
              isLoggedIn={isLoggedIn}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <Projects
              isLoggedIn={isLoggedIn}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/services"
          element={
            <Services
              isLoggedIn={isLoggedIn}
              onLoginSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <ErrorBoundary>
                <MainUIScreen onLogout={handleLogout} />
              </ErrorBoundary>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
