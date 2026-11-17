import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, Crosshair, Trophy } from 'lucide-react';
import LoginScreen from './LoginScreen';
import { apiFetch } from '../../utils/api';
import './AboutUs.css';

const navItems = [
  { key: 'Home', label: 'HOME', path: '/' },
  { key: 'Projects', label: 'PROJECTS', path: '/projects' },
  { key: 'Services', label: 'SERVICES', path: '/services' },
  { key: 'AboutUs', label: 'ABOUT US', path: '/about' },
];
const EmailIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-neon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const AboutUs = ({ onLoginSuccess, isLoggedIn }) => {
  const userLoggedIn = isLoggedIn || (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', contact: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [systemModal, setSystemModal] = useState(null);
  const [activePage, setActivePage] = useState('AboutUs');
  const [showLogin, setShowLogin] = useState(false);

  
  // Auto-dismiss and keyboard escape/enter handler for tactical system notification
  useEffect(() => {
    if (!systemModal) return;
    const timer = setTimeout(() => {
      setSystemModal(null);
    }, 6000);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        setSystemModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [systemModal]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    if (!formData.name || !formData.email || !formData.message) {
      setSystemModal({
        type: 'warning',
        title: 'INCOMPLETE DATA',
        message: 'Please complete all required fields (Name, Email, and Message).'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to dispatch message.');
      }
      
      const cleanName = formData.name.trim();
      setSystemModal({
        type: 'success',
        title: 'REQUEST SENT SUCCESSFULLY!',
        message: `Thank you, ${cleanName}. Our team will review your message.`,
        recipient: 'esportsystem24@gmail.com',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setFormData({ name: '', email: '', contact: '', message: '' });
    } catch (err) {
      setSystemModal({
        type: 'error',
        title: 'TRANSMISSION FAILED',
        message: err.message || 'Unable to deliver message. Please contact us directly at esportsystem24@gmail.com.',
        recipient: 'esportsystem24@gmail.com'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigation = (item) => {
    setActivePage(item.key);
    navigate(item.path);
  };

  return (
    <div className="maximized-about-wrapper">
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
          <button type="button" className="login-btn" onClick={() => setShowLogin(true)}>
            LOGIN
          </button>
        )}
      </header>
      <main className="maximized-main-content">
        <div className="contact-section-modern fade-in-up">
          <div className="contact-info-glass">
            <h2 className="contact-greeting-neon">GET IN TOUCH.</h2>
            <p className="contact-subtext">Have questions about our Capstone Project or want to collaborate? Send us a message.</p>
            <div className="contact-details-list">
              <div className="contact-row-modern">
                <div className="contact-icon-box"><EmailIcon /></div>
                <div className="contact-text-box">
                  <span className="contact-label">Email Us</span>
                  <a href="mailto:esportsystem24@gmail.com" className="contact-link">esportsystem24@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-form-glass">
            <h3 className="form-title">Send a Message</h3>
            {submitStatus && (
              <div
                style={{
                  padding: '0.9rem 1.25rem',
                  marginBottom: '1.5rem',
                  borderRadius: '4px',
                  border: submitStatus.type === 'success' ? '1px solid rgba(0, 255, 204, 0.5)' : '1px solid rgba(255, 70, 85, 0.5)',
                  backgroundColor: submitStatus.type === 'success' ? 'rgba(0, 255, 204, 0.08)' : 'rgba(255, 70, 85, 0.08)',
                  color: submitStatus.type === 'success' ? '#00ffcc' : '#ff4655',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {submitStatus.type === 'success' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                )}
                <span>{submitStatus.text}</span>
              </div>
            )}
            <form onSubmit={handleFormSubmit}>
              <div className="form-row-split-modern">
                <input
                  type="text"
                  name="name"
                  className="modern-input"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="email"
                  name="email"
                  className="modern-input"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="contact"
                  className="modern-input"
                  placeholder="Contact Number (Optional)"
                  value={formData.contact}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  className="modern-textarea"
                  placeholder="Your Message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>
              <button
                type="submit"
                className="neon-submit-btn"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'SENDING MESSAGE...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>
        </div>
      </main>
      
      {/* ─────────────── TACTICAL HUD SYSTEM NOTIFICATION MODAL ─────────────── */}
      {systemModal && (
        <div className="tactical-notification-overlay" onClick={() => setSystemModal(null)}>
          <div
            className={`tactical-notification-card ${systemModal.type === 'error' ? 'is-error' : systemModal.type === 'warning' ? 'is-warning' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hud-corner-tr"></div>
            <div className="hud-corner-bl"></div>

            <div className="tactical-header-strip">
              <span className="tactical-system-tag">
                ESPORT // SYSTEM NOTIFICATION
              </span>
              <button
                type="button"
                className="tactical-close-btn"
                onClick={() => setSystemModal(null)}
                aria-label="Close notification"
              >
                &times;
              </button>
            </div>

            <div className="tactical-content-body">
              <div className="tactical-icon-badge">
                {systemModal.type === 'error' ? (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                ) : systemModal.type === 'warning' ? (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                )}
              </div>

              <h3 className="tactical-title">{systemModal.title}</h3>
              <p className="tactical-desc">{systemModal.message}</p>

              {systemModal.recipient && (
                <div className="tactical-meta-box">
                  <div className="tactical-meta-row">
                    <span className="tactical-meta-label">Dispatched To:</span>
                    <span className="tactical-meta-val">{systemModal.recipient}</span>
                  </div>
                  {systemModal.timestamp && (
                    <div className="tactical-meta-row">
                      <span className="tactical-meta-label">Timestamp:</span>
                      <span className="tactical-meta-val">{systemModal.timestamp}</span>
                    </div>
                  )}
                  <div className="tactical-meta-row">
                    <span className="tactical-meta-label">Status:</span>
                    <span className="tactical-meta-val">
                      {systemModal.type === 'success' ? 'TRANSMITTED // 200 OK' : 'FAILED // ERROR'}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="tactical-action-btn"
                onClick={() => setSystemModal(null)}
                autoFocus
              >
                ACKNOWLEDGE
              </button>
            </div>

            <div className="tactical-progress-track">
              <div className="tactical-progress-bar"></div>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <LoginScreen
          onClose={() => setShowLogin(false)}
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
};

export default AboutUs;
