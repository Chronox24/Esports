import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginScreen from './LoginScreen'; 
import { apiFetch } from '../../utils/api';
import './Home.css';

const navItems = [
  { key: 'Home', label: 'HOME', path: '/' },
  { key: 'Projects', label: 'PROJECTS', path: '/projects' },
  { key: 'Services', label: 'SERVICES', path: '/services' },
  { key: 'AboutUs', label: 'ABOUT US', path: '/about' },
];

const defaultHighlights = [
  {
    id: 'ErGWTnWIHcI',
    game: 'CROSSFIRE',
    title: 'CROSSFIRE',
    subtitle: 'They pushed together. They fell together. AT_DREE stood alone as he held the site against FV. 👑',
    img: 'https://i.ytimg.com/vi/ErGWTnWIHcI/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/ErGWTnWIHcI',
    author: 'Crossfire Philippines',
    authorUrl: 'https://www.youtube.com/@CrossfirePhilippines',
    watchUrl: 'https://www.youtube.com/watch?v=ErGWTnWIHcI'
  },
  {
    id: '8Xerjgf8wLY',
    game: 'VALORANT',
    title: 'VALORANT',
    subtitle: 'Can VALORANT pros survive the spiciest hot pot?',
    img: 'https://i.ytimg.com/vi/8Xerjgf8wLY/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/8Xerjgf8wLY',
    author: 'VALORANT Champions Tour',
    authorUrl: 'https://www.youtube.com/@ValorantEsports',
    watchUrl: 'https://www.youtube.com/watch?v=8Xerjgf8wLY'
  },
  {
    id: 'mqCnE46-WZo',
    game: 'CROSSFIRE',
    title: 'CROSSFIRE',
    subtitle: 'Making lightwork of a 4v2 situation VP_XETRA and VP_ELV1N with the duo clutch! 😱',
    img: 'https://i.ytimg.com/vi/mqCnE46-WZo/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/mqCnE46-WZo',
    author: 'Crossfire Philippines',
    authorUrl: 'https://www.youtube.com/@CrossfirePhilippines',
    watchUrl: 'https://www.youtube.com/watch?v=mqCnE46-WZo'
  },
  {
    id: '1L9InxtBiI0',
    game: 'VALORANT',
    title: 'VALORANT',
    subtitle: 'G2 vs. T1 | MATCH HIGHLIGHTS | VALORANT Champions Shanghai - Playoffs Stage',
    img: 'https://i.ytimg.com/vi/1L9InxtBiI0/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/1L9InxtBiI0',
    author: 'VALORANT Champions Tour',
    authorUrl: 'https://www.youtube.com/@ValorantEsports',
    watchUrl: 'https://www.youtube.com/watch?v=1L9InxtBiI0'
  },
  {
    id: 'hgAD40XLhOs',
    game: 'CROSSFIRE',
    title: 'CROSSFIRE',
    subtitle: 'Crosshair on autopilot, TB_eLcom.pe deleted 4 players of XCTN! 🎬',
    img: 'https://i.ytimg.com/vi/hgAD40XLhOs/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/hgAD40XLhOs',
    author: 'Crossfire Philippines',
    authorUrl: 'https://www.youtube.com/@CrossfirePhilippines',
    watchUrl: 'https://www.youtube.com/watch?v=hgAD40XLhOs'
  },
  {
    id: '2EzWX2VemjM',
    game: 'VALORANT',
    title: 'VALORANT',
    subtitle: 'G2 vs. T1 — FULL MATCH — VALORANT Champions Shanghai — Playoffs Stage',
    img: 'https://i.ytimg.com/vi/2EzWX2VemjM/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/2EzWX2VemjM',
    author: 'VALORANT Champions Tour',
    authorUrl: 'https://www.youtube.com/@ValorantEsports',
    watchUrl: 'https://www.youtube.com/watch?v=2EzWX2VemjM'
  }
];

const Home = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activePage, setActivePage] = useState('Home');
  const [showLogin, setShowLogin] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ reporter: '', reported: '', reason: 'Aimbot', statement: '' });
  const [evidenceFile, setEvidenceFile] = useState(null);

  // Live YouTube Highlights state
  const [highlights, setHighlights] = useState(defaultHighlights);
  const [activeGameFilter, setActiveGameFilter] = useState('ALL');
  const [channelData, setChannelData] = useState({
    crossfire: [],
    valorant: []
  });
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);

  // Fetch newly updated uploads from connected YouTube channels
  useEffect(() => {
    let isMounted = true;
    const fetchLatestHighlights = async () => {
      try {
        setIsLoadingHighlights(true);
        const res = await apiFetch('/api/highlights');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.highlights && data.highlights.length > 0) {
            setHighlights(data.highlights);
            setChannelData({
              crossfire: data.crossfire || [],
              valorant: data.valorant || []
            });
          }
        }
      } catch (err) {
        console.warn('Highlights fallback to default YouTube videos:', err);
      } finally {
        if (isMounted) setIsLoadingHighlights(false);
      }
    };

    fetchLatestHighlights();
    return () => { isMounted = false; };
  }, []);

  // Filter highlights based on game tab
  const displayedHighlights = activeGameFilter === 'CROSSFIRE'
    ? (channelData.crossfire.length > 0 ? channelData.crossfire : highlights.filter(h => h.game === 'CROSSFIRE'))
    : activeGameFilter === 'VALORANT'
    ? (channelData.valorant.length > 0 ? channelData.valorant : highlights.filter(h => h.game === 'VALORANT'))
    : highlights;

  const handleFilterChange = (filter) => {
    setActiveGameFilter(filter);
    setCurrentSlide(0);
  };

  // Touch swipe support for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 45;

  const maxSlide = isMobile 
    ? Math.max(0, displayedHighlights.length - 1) 
    : Math.max(0, displayedHighlights.length - 2);

  useEffect(() => {
    setIsLoaded(true);
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setCurrentSlide((prev) => Math.min(prev, Math.max(0, displayedHighlights.length - 1)));
      } else {
        setCurrentSlide((prev) => Math.min(prev, Math.max(0, displayedHighlights.length - 2)));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [displayedHighlights.length]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavigation = (item) => {
    setActivePage(item.key);
    setMobileMenuOpen(false);
    navigate(item.path);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < maxSlide ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : maxSlide));
  };

  const openVideo = (slide) => {
    setActiveVideo(slide);
  };

  const closeVideo = () => {
    setActiveVideo(null);
  };

  const onTouchStartHandler = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveHandler = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.reported || !reportForm.reason) return alert("Reported IGN and Reason are required!");
    
    const formData = new FormData();
    formData.append('reporter', reportForm.reporter);
    formData.append('reported', reportForm.reported);
    formData.append('reason', reportForm.reason);
    formData.append('statement', reportForm.statement);
    if (evidenceFile) {
      formData.append('evidence', evidenceFile);
    }

    try {
      const res = await apiFetch('/api/settings/reports', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert('Report submitted successfully! Thank you for keeping our community clean.');
        setShowReportModal(false);
        setReportForm({ reporter: '', reported: '', reason: 'Aimbot', statement: '' });
        setEvidenceFile(null);
      } else {
        alert('Error submitting report.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit report.');
    }
  };

  return (
    <div className="maximized-home-wrapper">
      <div className="hero-trophy-bg" />
      <div className="hero-dark-overlay" />

      {/* Navigation Header */}
      <header className={`main-navbar ${isLoaded ? 'fade-in-down' : ''}`}>
        <div className="brand-logo" onClick={() => navigate('/')}>
          <span className="brand-logo-icon">⚡</span>
          <span className="brand-logo-text">ESPORT</span>
        </div>

        {/* Desktop Links */}
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

        {/* Desktop Actions */}
        <div className="navbar-actions">
          <button 
            type="button" 
            className="report-nav-btn"
            onClick={() => setShowReportModal(true)}
          >
            Report Cheater
          </button>
          <button 
            type="button" 
            className="login-btn" 
            onClick={() => setShowLogin(true)}
          >
            LOGIN
          </button>
        </div>

        {/* Mobile Header Controls */}
        <div className="mobile-header-controls">
          <button 
            type="button" 
            className="mobile-quick-login-btn"
            onClick={() => setShowLogin(true)}
          >
            LOGIN
          </button>
          <button 
            type="button" 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-line top-line" />
            <span className="hamburger-line mid-line" />
            <span className="hamburger-line bot-line" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'drawer-visible' : ''}`}>
        <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)} />
        <div className="mobile-drawer-sheet">
          <div className="mobile-drawer-header">
            <div className="brand-logo">
              <span className="brand-logo-icon">⚡</span>
              <span className="brand-logo-text">ESPORT</span>
            </div>
            <button 
              type="button" 
              className="mobile-drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>

          <div className="mobile-nav-list">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`mobile-nav-link ${activePage === item.key ? 'active' : ''}`}
                onClick={() => handleNavigation(item)}
              >
                <span>{item.label}</span>
                <span className="mobile-nav-arrow">›</span>
              </button>
            ))}
          </div>

          <div className="mobile-drawer-footer">
            <button 
              type="button" 
              className="mobile-report-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowReportModal(true);
              }}
            >
              <span className="shield-icon">🛡️</span> Report Cheater
            </button>
            <button 
              type="button" 
              className="mobile-login-drawer-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLogin(true);
              }}
            >
              LOGIN TO PORTAL
            </button>
            <div className="mobile-drawer-badge">
              <span className="pulse-indicator" /> Official League Platform
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Content */}
      <main className="maximized-main-content">
        {/* Hero Section */}
        <section className="glass-hero-panel">
          <div className="hero-content-core">
            <div className="hero-status-pill">
              <span className="live-pulse-dot" />
              <span className="pill-text">SEASON 2026 • LEAGUE HUB</span>
            </div>

            <h1 className="hero-main-text">
              ESPORT LEAGUE <span className="neon-gradient-text">TOURNAMENT</span>
            </h1>

            <p className="hero-sub-text">
              with Integration of Player Statistics and Leaderboard Rankings
            </p>

            {/* Mobile Call To Action Buttons */}
            <div className="hero-actions-container">
              <button 
                type="button" 
                className="hero-cta-primary"
                onClick={() => {
                  const el = document.getElementById('game-highlights-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="cta-icon">▶</span> WATCH GAME HIGHLIGHTS
              </button>
              <button 
                type="button" 
                className="hero-cta-secondary"
                onClick={() => setShowReportModal(true)}
              >
                REPORT VIOLATION
              </button>
            </div>

            {/* Quick Esports Feature Chips */}
            <div className="hero-stats-bar">
              <div className="stat-chip">
                <span className="stat-chip-num">12+</span>
                <span className="stat-chip-label">Tournaments</span>
              </div>
              <div className="stat-chip-divider" />
              <div className="stat-chip">
                <span className="stat-chip-num">500+</span>
                <span className="stat-chip-label">Active Players</span>
              </div>
              <div className="stat-chip-divider" />
              <div className="stat-chip">
                <span className="stat-chip-num">100%</span>
                <span className="stat-chip-label">Fair Play</span>
              </div>
            </div>
          </div>
        </section>

        {/* Game Highlights Carousel Section */}
        <section className="featured-section" id="game-highlights-section">
          <div className="section-header-wide">
            <div className="section-title-wrapper">
              <span className="neon-title-dot" />
              <p className="section-label">GAME HIGHLIGHTS</p>
              <span className="yt-sync-pill" title="Synchronized with official YouTube channels">
                <span className="yt-dot" /> YOUTUBE UPDATED
              </span>
            </div>

            {/* Game Channel Filter Tabs */}
            <div className="game-filter-tabs">
              <button 
                type="button" 
                className={`filter-tab-btn ${activeGameFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => handleFilterChange('ALL')}
              >
                ALL
              </button>
              <button 
                type="button" 
                className={`filter-tab-btn ${activeGameFilter === 'CROSSFIRE' ? 'active' : ''}`}
                onClick={() => handleFilterChange('CROSSFIRE')}
              >
                CROSSFIRE
              </button>
              <button 
                type="button" 
                className={`filter-tab-btn ${activeGameFilter === 'VALORANT' ? 'active' : ''}`}
                onClick={() => handleFilterChange('VALORANT')}
              >
                VALORANT
              </button>
            </div>

            <div className="carousel-controls-top">
              {isMobile && (
                <span className="carousel-slide-counter">
                  {String(currentSlide + 1).padStart(2, '0')} / {String(maxSlide + 1).padStart(2, '0')}
                </span>
              )}
              <button 
                type="button" 
                className="nav-arrow" 
                onClick={handlePrev} 
                aria-label="Previous slide"
              >
                ‹
              </button>
              <button 
                type="button" 
                className="nav-arrow" 
                onClick={handleNext} 
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          </div>

          {/* Carousel Viewport with touch swipe handlers */}
          <div 
            className="carousel-viewport-max"
            onTouchStart={onTouchStartHandler}
            onTouchMove={onTouchMoveHandler}
            onTouchEnd={onTouchEndHandler}
          >
            <div 
              className="carousel-track-max" 
              style={{ 
                transform: isMobile 
                  ? `translateX(-${currentSlide * 100}%)` 
                  : `translateX(calc(-${currentSlide * 50}% - ${currentSlide * 0.5}rem))` 
              }}
            >
              {displayedHighlights.map((slide) => (
                <div className="carousel-slide-max" key={slide.id}>
                  <div
                    className="highlight-card-max"
                    style={{ backgroundImage: `url(${slide.img})` }}
                    onClick={() => openVideo(slide)}
                  >
                    <div className="card-gradient-vignette" />

                    {/* Top Game & Official Channel Badge */}
                    <div className="card-top-badge">
                      <span className="card-game-title">{slide.game || slide.title}</span>
                      <span className="card-highlight-pill">NEW UPLOAD</span>
                      {slide.author && (
                        <span className="card-author-pill">
                          {slide.author}
                        </span>
                      )}
                    </div>

                    {/* Centered Modern Play Button */}
                    <button type="button" className="play-button-massive" aria-label={`Play ${slide.title} highlight`}>
                      <span className="play-icon-large" />
                    </button>

                    {/* Bottom Card Title Info */}
                    <div className="card-bottom-info">
                      <p className="card-stream-title" title={slide.subtitle}>{slide.subtitle}</p>
                      <span className="card-tap-cue">Watch Clip ▷</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators / Dots */}
          <div className="carousel-indicators-wide">
            {Array.from({ length: maxSlide + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={`nav-dot ${currentSlide === index ? 'active-dot' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Video Modal with YouTube Channel link */}
      {activeVideo && (
        <div className="video-modal-overlay" onClick={closeVideo}>
          <div className="video-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="video-modal-top-bar">
              <div className="video-modal-info">
                <span className="video-modal-game-badge">{activeVideo.game || activeVideo.title}</span>
                <span className="video-modal-title">{activeVideo.subtitle}</span>
              </div>
              <div className="video-modal-actions-top">
                {activeVideo.watchUrl && (
                  <a 
                    href={activeVideo.watchUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="watch-on-yt-link"
                    title="Watch on official YouTube channel"
                  >
                    Open in YouTube ↗
                  </a>
                )}
                <button type="button" className="close-modal-btn" onClick={closeVideo} aria-label="Close video player">
                  ×
                </button>
              </div>
            </div>
            <div className="video-player-frame">
              <iframe
                width="100%"
                height="100%"
                src={`${activeVideo.videoUrl || activeVideo}?autoplay=1`}
                title={activeVideo.subtitle || "Esport highlight video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Report Cheater Modal */}
      {showReportModal && (
        <div className="video-modal-overlay report-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="report-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <div className="report-modal-title-row">
                <span className="report-alert-icon">⚠️</span>
                <h2>Report a Cheater</h2>
              </div>
              <button 
                type="button" 
                className="report-modal-close-btn"
                onClick={() => setShowReportModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <p className="report-modal-subtitle">
              Fair play is strictly enforced. Submit suspect player info and match evidence for official review.
            </p>

            <form onSubmit={handleReportSubmit} className="report-form-body">
              <div className="report-field-group">
                <label>Your IGN / Name (Optional)</label>
                <input 
                  type="text" 
                  value={reportForm.reporter} 
                  onChange={e => setReportForm({...reportForm, reporter: e.target.value})} 
                  placeholder="Anonymous" 
                />
              </div>

              <div className="report-field-group">
                <label>Suspect IGN <span className="report-required-star">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={reportForm.reported} 
                  onChange={e => setReportForm({...reportForm, reported: e.target.value})} 
                  placeholder="Enter exact in-game name" 
                />
              </div>

              <div className="report-field-group">
                <label>Infraction Reason</label>
                <select 
                  value={reportForm.reason} 
                  onChange={e => setReportForm({...reportForm, reason: e.target.value})}
                >
                  <option value="Aimbot">Aimbot / Auto-Aim</option>
                  <option value="Wallhack">Wallhack / ESP</option>
                  <option value="Griefing">Griefing / Toxicity</option>
                  <option value="Boosting">Elo Boosting / Smurfing</option>
                  <option value="Other">Other Exploits</option>
                </select>
              </div>

              <div className="report-field-group">
                <label>Statement & Evidence Links</label>
                <textarea 
                  rows="3" 
                  value={reportForm.statement} 
                  onChange={e => setReportForm({...reportForm, statement: e.target.value})} 
                  placeholder="Describe the incident, match time, or paste YouTube/Streamable links..."
                />
              </div>

              <div className="report-field-group">
                <label>Upload Screenshot / Clip</label>
                <input 
                  type="file" 
                  onChange={e => setEvidenceFile(e.target.files[0])} 
                  accept="video/*,image/*" 
                  className="report-file-control"
                />
              </div>

              <div className="report-form-footer">
                <button 
                  type="button" 
                  onClick={() => setShowReportModal(false)} 
                  className="report-cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="report-submit-btn"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Screen Modal */}
      {showLogin && <LoginScreen onClose={() => setShowLogin(false)} onLoginSuccess={onLoginSuccess} />}
    </div>
  );
};

export default Home;
