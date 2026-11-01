import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import Home from './screens/landing/Home.jsx';
import AboutUs from './screens/landing/AboutUs.jsx';
import Projects from './screens/landing/Projects.jsx';
import Services from './screens/landing/Services.jsx';
import MainUIScreen from "./screens/main/MainUIScreen.jsx";

const App = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
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
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('user_ign');
    navigate('/', { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            isLoggedIn={isLoggedIn}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />
      <Route
        path="/about"
        element={
          <AboutUs
            isLoggedIn={isLoggedIn}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />
      <Route
        path="/projects"
        element={
          <Projects
            isLoggedIn={isLoggedIn}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />
      <Route
        path="/services"
        element={
          <Services
            isLoggedIn={isLoggedIn}
            onLoginSuccess={handleLoginSuccess}
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
  );
};

export default App;
