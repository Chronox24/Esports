import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import './Projects.css';

const navItems = [
  { key: 'Home', label: 'HOME', path: '/' },
  { key: 'Projects', label: 'PROJECTS', path: '/projects' },
  { key: 'Services', label: 'SERVICES', path: '/services' },
  { key: 'AboutUs', label: 'ABOUT US', path: '/about' },
];

const sidebarCategories = [
  'All Projects',
  'Team Management',
  'Tournament Scheduler',
  'Performance Tracker',
  'Data Recording'
];

const mockProjects = [
  {
    id: 1,
    title: 'Bracket Management',
    category: 'Team Management',
    status: '',
    desc: 'Varsity roster management, scrimmage logistics, and real-time player availability tracking.',
    img: '/assets/bracket_management.png'
  },
  {
    id: 2,
    title: 'Map Veto Management',
    category: 'Tournament Scheduler',
    status: 'Map Veto',
    desc: 'Competitive turn-based map veto and ban/pick management system with timed turns, team selection, and decider map protocols.',
    img: '/assets/map_veto_management.jpg'
  },
  {
    id: 3,
    title: 'Player Analytics',
    category: 'Performance Tracker',
    status: '',
    desc: 'Advanced telemetry dashboard tracking metrics like KDA ratios, objective control, and gold graphs.',
    img: '/assets/player_analytics.jpg'
  },
  {
    id: 4,
    title: 'Player Leaderboard Algorithm',
    category: 'Performance Tracker',
    status: '',
    desc: 'Automated leaderboard ranking algorithm with head-to-head player duels, performance telemetry, and statistical metrics.',
    img: '/assets/player_leaderboard.jpg'
  },
  {
    id: 5,
    title: 'Audit Log Checker',
    category: 'Performance Tracker',
    status: '',
    desc: 'Administrative and user activity audit logging system for tracking match entries, roster updates, and security logs.',
    img: '/assets/audit_log_checker.png'
  },
  {
    id: 6,
    title: 'Tournament Scheduling',
    category: 'Tournament Scheduler',
    status: '',
    desc: 'Interactive tournament calendar and match scheduler with live countdowns, game filters, and fixture synchronization.',
    img: '/assets/tournament_scheduling.jpg'
  },
  {
    id: 7,
    title: 'Data Management',
    category: 'Data Recording',
    status: '',
    desc: 'Comprehensive match data recording system supporting round-by-round event logging, player stats entry, and heatmap coordinate plotting.',
    img: '/assets/data_management.png'
  }
];

const Projects = ({ onLoginSuccess, isLoggedIn }) => {
  const userLoggedIn = isLoggedIn || (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [activePage, setActivePage] = useState('Projects');
  const [showLogin, setShowLogin] = useState(false);

  const filteredProjects = mockProjects.filter((p) => {
    const matchesCategory = activeCategory === 'All Projects' || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNavigation = (item) => {
    setActivePage(item.key);
    navigate(item.path);
  };

  return (
    <div className="projects-app-wrapper">
      <div className="bg-image-layer" />
      <div className="bg-gradient-overlay" />
      <div className="app-content-flow">
        <header className="main-navbar">
          <div className="brand-logo">ESPORT</div>
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

        <section className="hero-section">
          <h1 className="hero-title">PROJECTS & SCHEMES</h1>
          <p className="hero-subtitle">Explore our comprehensive esports management initiatives</p>
        </section>

        <div className="projects-layout">
          <aside className="projects-sidebar">
            <h3 className="sidebar-title">FILTER BY CATEGORY</h3>
            {sidebarCategories.map((category) => (
              <button
                key={category}
                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </aside>

          <main className="projects-main">
            <div className="projects-header">
              <h2>Displaying {filteredProjects.length} Projects</h2>
              <input
                type="text"
                placeholder="Search projects..."
                className="search-bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="projects-grid">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="project-image" style={{ backgroundImage: `url(${project.img})` }} />
                  <div className="project-content">
                    <p className="project-category">{project.category}</p>
                    <h3>{project.title}</h3>
                    <p className="project-desc">{project.desc}</p>
                    {project.status && (
                      <span className={`status-badge status-${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {project.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="no-results">
                <p>No projects match your search criteria.</p>
              </div>
            )}
          </main>
        </div>

        {selectedProject && (
          <div className="project-modal-overlay" onClick={() => setSelectedProject(null)}>
            <div className="project-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedProject(null)}>&times;</button>
              <div className="modal-image" style={{ backgroundImage: `url(${selectedProject.img})` }} />
              <div className="modal-content">
                <h2>{selectedProject.title}</h2>
                <p className="modal-category">{selectedProject.category}</p>
                <p className="modal-desc">{selectedProject.desc}</p>
                {selectedProject.status && (
                  <span className={`status-badge status-${selectedProject.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedProject.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showLogin && (
        <LoginScreen
          onClose={() => setShowLogin(false)}
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
};

export default Projects;
