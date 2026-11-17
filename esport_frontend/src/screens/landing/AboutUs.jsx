import React, { useState } from 'react';
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
  const [activePage, setActivePage] = useState('AboutUs');
  const [showLogin, setShowLogin] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        type: 'error',
        text: 'Please fill out all required fields (Name, Email, Message).'
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
      setSubmitStatus({
        type: 'success',
        text: data?.message || `Thank you, ${formData.name}! Your message has been sent to esportsystem24@gmail.com.`
      });
      setFormData({ name: '', email: '', contact: '', message: '' });
    } catch (err) {
      setSubmitStatus({
        type: 'error',
        text: err.message || 'Unable to deliver message. Please contact us directly at esportsystem24@gmail.com.'
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
