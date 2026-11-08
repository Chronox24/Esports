import React, { useState, useEffect, useRef } from 'react';
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

// Extract the 11-char YouTube video ID from an embed / watch / short URL
const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
};

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

const Home = ({ onLoginSuccess, isLoggedIn }) => {
  const userLoggedIn = isLoggedIn || (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isVideoClosing, setIsVideoClosing] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [highlightsInView, setHighlightsInView] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const previewTimerRef = useRef(null);
  const previewReadyTimerRef = useRef(null);
  const autoSlideTimerRef = useRef(null);
  const autoDirRef = useRef(1);
  const closeTimerRef = useRef(null);
  const highlightsSectionRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activePage, setActivePage] = useState('Home');
  const [showLogin, setShowLogin] = useState(false);

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
    stopHoverPreview();
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

  // Lock body scroll when mobile drawer or modal is open
  useEffect(() => {
    if (mobileMenuOpen || activeVideo || showLogin) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, activeVideo, showLogin]);

  // Reveal highlight cards (staggered) once the section scrolls into view
  useEffect(() => {
    const el = highlightsSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setHighlightsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHighlightsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Clear any pending close timer on unmount
  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  // Allow closing video modal with Escape key (animated)
  useEffect(() => {
    if (!activeVideo) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeVideo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVideo, isVideoClosing]);

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
    stopHoverPreview();
    clearTimeout(closeTimerRef.current);
    setIsVideoClosing(false);
    setIsVideoReady(false);
    setActiveVideo(slide);
  };

  // Play the exit animation first, then unmount the modal
  const closeVideo = () => {
    if (isVideoClosing) return;
    setIsVideoClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setActiveVideo(null);
      setIsVideoClosing(false);
    }, 280);
  };

  // ── Hover preview: a short muted "teaser" plays inside the card on mouse hover ──
  const stopHoverPreview = () => {
    clearTimeout(previewTimerRef.current);
    clearTimeout(previewReadyTimerRef.current);
    setPreviewId(null);
    setPreviewReady(false);
  };

  const startHoverPreview = (slide, e) => {
    // Only for real mouse pointers (never on touch screens)
    if (e && e.pointerType && e.pointerType !== 'mouse') return;
    if (activeVideo || !getYouTubeId(slide.videoUrl)) return;
    clearTimeout(previewTimerRef.current);
    // Small hover-intent delay so quick mouse passes don't spawn players
    previewTimerRef.current = setTimeout(() => {
      setPreviewReady(false);
      setPreviewId(slide.id);
    }, 450);
  };

  // Fade the teaser in only after the player had a moment to start playing
  const handlePreviewLoaded = () => {
    clearTimeout(previewReadyTimerRef.current);
    previewReadyTimerRef.current = setTimeout(() => setPreviewReady(true), 900);
  };

  // Stop any teaser when the carousel moves; clear timers on unmount
  useEffect(() => {
    stopHoverPreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide]);

  useEffect(() => () => {
    clearTimeout(previewTimerRef.current);
    clearTimeout(previewReadyTimerRef.current);
    clearTimeout(autoSlideTimerRef.current);
  }, []);

  // ── Auto slide: glides forward, then glides back (ping-pong) so the
  //    carousel never "rewinds" across all cards at once ──
  useEffect(() => {
    clearTimeout(autoSlideTimerRef.current);
    if (!highlightsInView || isCarouselPaused || activeVideo || showLogin || mobileMenuOpen || maxSlide === 0) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    autoSlideTimerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => {
        if (prev >= maxSlide) autoDirRef.current = -1;
        else if (prev <= 0) autoDirRef.current = 1;
        return Math.max(0, Math.min(maxSlide, prev + autoDirRef.current));
      });
    }, 4500);
    return () => clearTimeout(autoSlideTimerRef.current);
  }, [currentSlide, highlightsInView, isCarouselPaused, activeVideo, showLogin, mobileMenuOpen, maxSlide]);

  const pauseAutoSlide = (e) => {
    if (!e || !e.pointerType || e.pointerType === 'mouse') setIsCarouselPaused(true);
  };
  const resumeAutoSlide = (e) => {
    if (!e || !e.pointerType || e.pointerType === 'mouse') setIsCarouselPaused(false);
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

  return (
    <div className="maximized-home-wrapper">
      <div className="hero-trophy-bg" />
      <div className="hero-dark-overlay" />

      {/* Navigation Header */}
      <header className={`main-navbar ${isLoaded ? 'fade-in-down' : ''}`}>
        <div className="brand-logo" onClick={() => navigate('/')}>
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
              className="login-btn" 
              onClick={() => setShowLogin(true)}
            >
              LOGIN
            </button>
          )}
        </div>

        {/* Mobile Header Controls */}
        <div className="mobile-header-controls">
          {userLoggedIn ? (
            <button 
              type="button" 
              className="mobile-quick-login-btn"
              style={{ background: 'var(--accent-neon, #00e5ff)', color: '#040814', border: '1px solid var(--accent-neon, #00e5ff)' }}
              onClick={() => navigate('/dashboard')}
            >
              DASHBOARD
            </button>
          ) : (
            <button 
              type="button" 
              className="mobile-quick-login-btn"
              onClick={() => setShowLogin(true)}
            >
              LOGIN
            </button>
          )}
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
              className="mobile-login-drawer-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                if (userLoggedIn) {
                  navigate('/dashboard');
                } else {
                  setShowLogin(true);
                }
              }}
            >
              {userLoggedIn ? 'GO TO DASHBOARD' : 'LOGIN TO PORTAL'}
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
            <div className="hero-actions-container" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {userLoggedIn && (
                <button
                  type="button"
                  className="hero-cta-primary"
                  style={{ background: 'linear-gradient(135deg, #00ffcc, #06b6d4)', color: '#040814', fontWeight: 900 }}
                  onClick={() => navigate('/dashboard')}
                >
                  <span className="cta-icon">⚡</span> GO TO DASHBOARD
                </button>
              )}
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
        <section
          className={`featured-section ${highlightsInView ? 'highlights-in-view' : ''}`}
          id="game-highlights-section"
          ref={highlightsSectionRef}
        >
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
            onPointerEnter={pauseAutoSlide}
            onPointerLeave={resumeAutoSlide}
          >
            <div 
              className="carousel-track-max" 
              style={{ 
                transform: isMobile 
                  ? `translateX(-${currentSlide * 100}%)` 
                  : `translateX(calc(-${currentSlide * 50}% - ${currentSlide * 0.5}rem))` 
              }}
            >
              {displayedHighlights.map((slide, index) => (
                <div
                  className="carousel-slide-max"
                  key={`${activeGameFilter}-${slide.id}`}
                  style={{ '--card-index': index }}
                >
                  <div
                    className={`highlight-card-max ${previewId === slide.id ? 'is-previewing' : ''} ${previewId === slide.id && previewReady ? 'preview-ready' : ''}`}
                    onClick={() => openVideo(slide)}
                    onPointerEnter={(e) => startHoverPreview(slide, e)}
                    onPointerLeave={stopHoverPreview}
                  >
                    <div className="highlight-thumb-wrapper">
                      <div
                        className="highlight-thumb-image"
                        style={{ backgroundImage: `url(${slide.img})` }}
                      />
                      {/* Muted hover teaser: plays quietly while the cursor is over the card */}
                      {previewId === slide.id && getYouTubeId(slide.videoUrl) && (
                        <iframe
                          className="highlight-preview-frame"
                          title={`Preview of ${slide.subtitle || slide.title}`}
                          src={`https://www.youtube.com/embed/${getYouTubeId(slide.videoUrl)}?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${getYouTubeId(slide.videoUrl)}`}
                          allow="autoplay; encrypted-media"
                          tabIndex={-1}
                          aria-hidden="true"
                          onLoad={handlePreviewLoaded}
                        />
                      )}
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

                      {/* Centered Tactical Hexagon Play Button */}
                      <button type="button" className="play-button-massive" aria-label={`Play ${slide.title} highlight`}>
                        <svg className="play-hex-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polygon
                            className="play-hex-polygon"
                            points="32,3 59,18.5 59,45.5 32,61 5,45.5 5,18.5"
                            strokeWidth="2.2"
                          />
                        </svg>
                        <span className="play-icon-large" />
                      </button>
                    </div>

                    {/* Dedicated Dark Card Footer Beneath Thumbnail */}
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
        <div className={`video-modal-overlay ${isVideoClosing ? 'closing' : ''}`} onClick={closeVideo}>
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
            <div className={`video-player-frame ${isVideoReady ? 'is-ready' : ''}`}>
              <iframe
                key={activeVideo.id || activeVideo.videoUrl}
                onLoad={() => setIsVideoReady(true)}
                width="100%"
                height="100%"
                src={`${activeVideo.videoUrl || activeVideo}${(activeVideo.videoUrl || activeVideo).includes('?') ? '&' : '?'}autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={activeVideo.subtitle || "Esport highlight video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Login Screen Modal */}
      {showLogin && <LoginScreen onClose={() => setShowLogin(false)} onLoginSuccess={onLoginSuccess} />}
    </div>
  );
};

export default Home;
