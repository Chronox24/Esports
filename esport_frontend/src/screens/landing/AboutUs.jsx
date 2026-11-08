import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, Crosshair, Trophy } from 'lucide-react';
import LoginScreen from './LoginScreen';
import './AboutUs.css';

const navItems = [
  { key: 'Home', label: 'HOME', path: '/' },
  { key: 'Projects', label: 'PROJECTS', path: '/projects' },
  { key: 'Services', label: 'SERVICES', path: '/services' },
  { key: 'AboutUs', label: 'ABOUT US', path: '/about' },
];

const IntegrityIcon = () => (
  <ShieldCheck size={42} strokeWidth={1.75} />
);

const InnovationIcon = () => (
  <Cpu size={42} strokeWidth={1.75} />
);

const ExecutionIcon = () => (
  <Crosshair size={42} strokeWidth={1.75} />
);

const CommunityIcon = () => (
  <Trophy size={42} strokeWidth={1.75} />
);

const EmailIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-neon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const AboutUs = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', contact: '', message: '' });
  const [activePage, setActivePage] = useState('AboutUs');
  const [showLogin, setShowLogin] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill out the required fields (Name, Email, Message).");
      return;
    }
    alert(`Request Sent Successfully!\n\nThank you, ${formData.name}. Our team will review your message.`);
    setFormData({ name: '', email: '', contact: '', message: '' });
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
        <button type="button" className="login-btn" onClick={() => setShowLogin(true)}>
          LOGIN
        </button>
      </header>
      <main className="maximized-main-content">
        <div className="glass-about-panel fade-in-up">
          <div className="about-header-glow" />
          <h1 className="about-main-title">
            STUDENT <span className="text-highlight">CAPSTONE PROJECT</span>
          </h1>
          <p className="about-sub-desc">
            As students, our mission is to support our TNC Beneficiary by organizing tournaments, managing teams, and creating seamless content. This centralized dashboard helps us achieve those goals efficiently.
          </p>
          <div className="values-grid-modern">
            {[
              { icon: <IntegrityIcon />, label: 'INTEGRITY' },
              { icon: <InnovationIcon />, label: 'INNOVATION' },
              { icon: <ExecutionIcon />, label: 'EXECUTION' },
              { icon: <CommunityIcon />, label: 'COMMUNITY' }
            ].map((value, idx) => (
              <div key={idx} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <span>{value.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="contact-section-modern fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="contact-info-glass">
            <h2 className="contact-greeting-neon">GET IN TOUCH.</h2>
            <p className="contact-subtext">Have questions about our Capstone Project or want to collaborate? Send us a message.</p>
            <div className="contact-details-list">
              <div className="contact-row-modern">
                <div className="contact-icon-box"><EmailIcon /></div>
                <div className="contact-text-box">
                  <span className="contact-label">Email Us</span>
                  <a href="mailto:garcia.s.bsinfotech@gmail.com" className="contact-link">garcia.s.bsinfotech@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-form-glass">
            <h3 className="form-title">Send a Message</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-row-split-modern">
                <input type="text" name="name" className="modern-input" placeholder="Your Name" value={formData.name} onChange={handleInputChange} required />
                <input type="email" name="email" className="modern-input" placeholder="Your Email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <input type="text" name="contact" className="modern-input" placeholder="Contact Number (Optional)" value={formData.contact} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <textarea name="message" className="modern-textarea" placeholder="Your Message" rows="4" value={formData.message} onChange={handleInputChange} required></textarea>
              </div>
              <button type="submit" className="neon-submit-btn">SEND MESSAGE</button>
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
