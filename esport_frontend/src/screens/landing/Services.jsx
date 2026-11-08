import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Crosshair, BarChart2, ShieldCheck } from 'lucide-react';
import LoginScreen from './LoginScreen';
import './Services.css';

const navItems = [
  { key: 'Home', label: 'HOME', path: '/' },
  { key: 'Projects', label: 'PROJECTS', path: '/projects' },
  { key: 'Services', label: 'SERVICES', path: '/services' },
  { key: 'AboutUs', label: 'ABOUT US', path: '/about' },
];

const HostingIcon = () => (
  <div className="tactical-icon-frame">
    <Trophy size={44} strokeWidth={1.75} className="tactical-svg-icon" />
  </div>
);

const TeamIcon = () => (
  <div className="tactical-icon-frame">
    <Crosshair size={44} strokeWidth={1.75} className="tactical-svg-icon" />
  </div>
);

const AnalyticsIcon = () => (
  <div className="tactical-icon-frame">
    <BarChart2 size={44} strokeWidth={1.75} className="tactical-svg-icon" />
  </div>
);

const PartnershipIcon = () => (
  <div className="tactical-icon-frame">
    <ShieldCheck size={44} strokeWidth={1.75} className="tactical-svg-icon" />
  </div>
);

const servicesData = [
  { id: 'hosting', title: 'TOURNAMENT HOSTING', icon: <HostingIcon />, description: 'Automated bracket generation, server provisioning, and match management for smooth competitive events.' },
  { id: 'team', title: 'TEAM MANAGEMENT', icon: <TeamIcon />, description: 'Roster registration, scrimmage scheduling, and detailed player analytics for collegiate teams.' },
  { id: 'analytics', title: 'ESPORT ANALYTICS', icon: <AnalyticsIcon />, description: 'Real-time telemetry and visualization of KDA, objective control, and in-game performance metrics.' },
  { id: 'partnership', title: 'ESPORT PARTNERSHIP', icon: <PartnershipIcon />, description: 'Connect with collegiate partners, view recruitment scouts, and monetize varsity event sponsorships.' },
];

const Services = ({ onLoginSuccess, isLoggedIn }) => {
  const userLoggedIn = isLoggedIn || (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Services');
  const [showLogin, setShowLogin] = useState(false);

  const handleNavigation = (item) => {
    setActivePage(item.key);
    navigate(item.path);
  };

  return (
    <div className="maximized-services-wrapper">
      <div className="hero-trophy-bg" />
      <div className="hero-dark-overlay" />
      <header className="main-navbar">
        <div className="brand-logo" onClick={() => navigate('/')}>ESPORT</div>
        <nav className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-btn ${activePage === item.key ? 'active' : ''}`}
              onClick={() => handleNavigation(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {userLoggedIn ? (
          <button 
            type="button" 
            className="login-btn glow-on-hover"
            style={{ background: 'var(--accent-neon, #00e5ff)', color: '#040814', border: '1.5px solid var(--accent-neon, #00e5ff)', boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)' }}
            onClick={() => navigate('/dashboard')}
          >
            DASHBOARD →
          </button>
        ) : (
          <button 
            type="button" 
            className="login-btn glow-on-hover"
            onClick={() => setShowLogin(true)}
          >
            LOGIN
          </button>
        )}
      </header>
      <main className="content-container z-relative">
        <section className="services-grid-section fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="services-grid-modern">
            {servicesData.map((service) => (
              <div
                key={service.id}
                className="service-card-modern glass-panel-dynamic"
              >
                <div className="icon-glow-backdrop" />
                <div className="service-icon-container">
                  {service.icon}
                </div>
                <div>
                  <h3 className="service-title-modern">{service.title}</h3>
                  <p className="service-description-text">
                    {service.description}
                  </p>
                </div>
                <div className="service-card-border-glow" />
              </div>
            ))}
          </div>
        </section>
      </main>
      {showLogin && (
        <LoginScreen
          onClose={() => setShowLogin(false)}
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
};

export default Services;
