import React, { useState, useRef, useCallback, useEffect } from "react";
import { apiFetch } from "../../utils/api.js";
import { ErrorBoundary } from "../../ErrorBoundary.jsx";
import Dashboard from "./Dashboard.jsx";
import TournamentHistory from "./TournamentHistory.jsx";
import Tournament from "./Tournament.jsx";
import Mapping from "./Mapping.jsx";
import DataEntry from "./DataEntry.jsx";
import PRSEntry from "./PRSEntry.jsx";
import Leaderboards from "./Leaderboards.jsx";
import Analytics from "./Analytics.jsx";
import Admin from "./Admin.jsx";
import PlayerManagement from "./PlayerManagement.jsx";
import AuditLogs from "./AuditLogs.jsx";
import PlayerRankings from "./PlayerRankings.jsx";
import PlayerStatsTab from "./PlayerStatsTab.jsx";
import RawRecords from "./RawRecords.jsx";


import Predictions from "./Predictions.jsx";
import Settings from "./Settings.jsx";

import {
  LayoutDashboard, Trophy, GitMerge, LineChart,
  Map, FileEdit, Users, BarChart2,
  ListOrdered, TrendingUp, Archive,
  ShieldCheck, ScrollText, Settings as SettingsIcon,
  LogOut, Sun, FileSpreadsheet, Moon, PieChart, UserPlus, PanelLeftClose,
  Trash2
} from 'lucide-react';

const iconMap = {
  'Dashboard': LayoutDashboard,
  'Tournament': Trophy,
  'Bracket': GitMerge,
  'Tournament History': Archive,
  'Predictions': LineChart,
  'Map Vetoes': Map,
  'Data Entry': FileEdit,
  'PRS Entry': UserPlus,
  'Player Management': Users,
  'Leaderboards': ListOrdered,
  'Analytics': PieChart,
  'Player Rankings': TrendingUp,
  'Player Stats': Users,
  'Raw Records': Archive,
  'Admin': ShieldCheck,
  'Audit Logs': ScrollText,
  'Settings': SettingsIcon,
};
const MainUIScreen = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [theme, setTheme] = useState('dark');
  const [themeBg, setThemeBg] = useState(() => localStorage.getItem('themeBg') || '#090e14');
  const [themeAccent, setThemeAccent] = useState(() => localStorage.getItem('themeAccent') || '#06b6d4');
  const [globalGame, setGlobalGame] = useState('VALORANT');
  const [globalTournament, setGlobalTournament] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);

  useEffect(() => {
    localStorage.setItem('themeBg', themeBg);
    document.documentElement.style.setProperty('--theme-bg-base', themeBg);

    // Calculate contrast text colors based on background
    let r = 9, g = 14, b = 20; // default #090e14
    if (themeBg && themeBg.startsWith('#')) {
      const hex = themeBg.replace('#', '');
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    }
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    if (yiq >= 128) {
      // Light background -> Dark text
      document.documentElement.style.setProperty('--theme-text-base', '#000000');
    } else {
      // Dark background -> Light text
      document.documentElement.style.setProperty('--theme-text-base', '#ffffff');
    }
  }, [themeBg]);

  useEffect(() => {
    localStorage.setItem('themeAccent', themeAccent);
    document.documentElement.style.setProperty('--theme-accent-base', themeAccent);
  }, [themeAccent]);

  useEffect(() => {
    const pColor = localStorage.getItem('plantColor') || '#ef4444';
    const dColor = localStorage.getItem('defuseColor') || '#10b981';
    document.documentElement.style.setProperty('--color-plant', pColor);
    document.documentElement.style.setProperty('--color-defuse', dColor);
  }, []);

  // Core functional logic for system-wide Light/Dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light-mode');
    }
  }, [theme]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderGame, setNewFolderGame] = useState('VALORANT');
  const [logoutHovered, setLogoutHovered] = useState(false);
  const logoutBtnRef = useRef(null);
  const handleRipple = useCallback((e, ref) => {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'logout-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);
  const loadTournaments = useCallback(async () => {
    try {
      const res = await apiFetch('/api/tournaments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTournaments(data);
          if (data.length > 0) {
            setGlobalTournament(prev => prev || data[0].name);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch tournaments:', err);
    }
  }, []);
  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    setIsDeletingFolder(true);
    try {
      const targetIdentifier = folderToDelete.id || folderToDelete.name;
      const res = await apiFetch(`/api/tournaments/${encodeURIComponent(targetIdentifier)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (globalTournament === folderToDelete.name) {
          setGlobalTournament('');
        }
        await loadTournaments();
        setFolderToDelete(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to delete tournament folder. Please check your permissions.");
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
      alert("Error connecting to server while deleting folder.");
    } finally {
      setIsDeletingFolder(false);
    }
  };
  useEffect(() => {
    if (globalTournament && tournaments.length > 0) {
      const selected = tournaments.find(t => t.name === globalTournament);
      if (selected && selected.game) {
        setGlobalGame(selected.game);
      }
    }
  }, [globalTournament, tournaments]);
  const sidebarData = [
    {
      category: 'Main',
      links: [
        { name: 'Dashboard' },
        { name: 'Tournament' },
        { name: 'Tournament History' }
      ]
    },
    {
      category: 'System',
      links: [
        { name: 'Admin' },
        { name: 'Audit Logs' },
        { name: 'Settings' }
      ]
    }
  ];
  const renderContent = () => {
    const currentTournObj = tournaments.find(t => t.name === globalTournament) || (globalTournament ? { name: globalTournament, game: globalGame } : null);

    switch (activeTab) {
      case 'Dashboard': return <ErrorBoundary><Dashboard globalGame={globalGame} globalTournament={globalTournament} /></ErrorBoundary>;
      case 'Tournament': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} />;
      case 'Tournament History': return <TournamentHistory setGlobalTournament={setGlobalTournament} setActiveTab={setActiveTab} />;
      case 'Predictions': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="predictions" />;
      case 'Map Vetoes': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="mapping" />;
      case 'Data Entry': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="data-entry" />;
      case 'PRS Entry': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="prs-entry" />;
      case 'Player Management': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="player-management" />;
      case 'Leaderboards': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="leaderboards" />;
      case 'Analytics': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="analytics" />;
      case 'Player Rankings': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="player-rankings" />;
      case 'Player Stats': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="player-stats" />;
      case 'Raw Records': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="TOURNAMENT HUB" initialHubSubTab="raw-records" />;
      case 'Bracket': return <Tournament globalGame={globalGame} globalTournament={currentTournObj} setGlobalTournament={setGlobalTournament} initialTab="BRACKET MANAGEMENT" />;
      case 'Admin': return <Admin globalGame={globalGame} globalTournament={globalTournament} />;
      case 'Audit Logs': return <AuditLogs globalGame={globalGame} globalTournament={globalTournament} />;
      case 'Settings': return <Settings globalGame={globalGame} globalTournament={globalTournament} themeBg={themeBg} setThemeBg={setThemeBg} themeAccent={themeAccent} setThemeAccent={setThemeAccent} />;
      default: return (<div className="h-full flex flex-col items-center justify-center p-10 bg-bg-100">            <div className="border border-slate-800 bg-slate-900/40 rounded-[2rem] p-12 text-center animate-fade-in shadow-2xl backdrop-blur-sm max-w-lg w-full">              <h2 className="text-2xl font-black text-theme-text-base mb-3 uppercase tracking-[0.2em]">{activeTab}</h2>              <p className="text-sm font-medium text-theme-text-muted tracking-wider">This module is currently under active development.</p>            </div>          </div>);
    }
  }; return (<div className="flex h-screen bg-bg-100 text-theme-text-base font-sans overflow-hidden selection:bg-cyan-500/30">      <style dangerouslySetInnerHTML={{ __html: `        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }         .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }        .custom-scrollbar::-webkit-scrollbar { width: 5px; }        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }        /* Toggle Switch */        .toggle-switch { position: relative; width: 48px; height: 26px; border-radius: 13px; cursor: pointer; transition: background-color 0.35s ease; }        .toggle-switch.off { background-color: #1e293b; }        .toggle-switch.on { background-color: #00ffcc; box-shadow: 0 0 16px rgba(0, 255, 204, 0.4); }        .toggle-knob { position: absolute; top: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left 0.35s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 2px 6px rgba(0,0,0,0.3); }        .toggle-switch.off .toggle-knob { left: 3px; }        .toggle-switch.on .toggle-knob { left: 25px; }        /* Nav item underline indicator */        .nav-underline {          position: absolute;          bottom: 4px;          left: 50%;          transform: translateX(-50%) scaleX(0);          width: 40%;          height: 2px;          border-radius: 2px;          background: linear-gradient(90deg, transparent, #00ffcc, transparent);          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease;          opacity: 0;        }        .nav-underline.active {          transform: translateX(-50%) scaleX(1);          opacity: 1;        }        /* Active nav glow pulse */        @keyframes glowPulse {          0%, 100% { box-shadow: 0 0 12px rgba(0, 255, 204, 0.3), inset 0 0 12px rgba(0, 255, 204, 0.3); }          50% { box-shadow: 0 0 24px rgba(0, 255, 204, 0.6), inset 0 0 20px rgba(0, 255, 204, 0.5); }        }        .nav-active-glow { animation: glowPulse 3s ease-in-out infinite; }        /* Title gradient animation */        @keyframes gradientShift {          0% { background-position: 0% 50%; }          50% { background-position: 100% 50%; }          100% { background-position: 0% 50%; }        }        .title-gradient {          background: linear-gradient(135deg, #00ffcc, #3b82f6, #00ffcc, #60a5fa);          background-size: 300% 300%;          -webkit-background-clip: text;          background-clip: text;          -webkit-text-fill-color: transparent;          animation: gradientShift 6s ease-in-out infinite;        }        /* Title underline */        @keyframes underlineGlow {          0% { transform: scaleX(0.3); opacity: 0.4; }          50% { transform: scaleX(1); opacity: 1; }          100% { transform: scaleX(0.3); opacity: 0.4; }        }        .title-underline {          height: 2px;          border-radius: 2px;          background: linear-gradient(90deg, transparent, #00ffcc, #3b82f6, transparent);          animation: underlineGlow 4s ease-in-out infinite;        }        /* Logout button ripple */        .logout-ripple {          position: absolute;          border-radius: 50%;          background: rgba(255,255,255,0.3);          width: 10px; height: 10px;          transform: translate(-50%, -50%) scale(0);          animation: rippleOut 0.6s ease-out forwards;          pointer-events: none;        }        @keyframes rippleOut {          to { transform: translate(-50%, -50%) scale(20); opacity: 0; }        }        /* Logout shimmer sweep */        @keyframes logoutShimmer {          0% { transform: translateX(-100%); }          100% { transform: translateX(250%); }        }        .logout-btn-styled::after {          content: '';          position: absolute;          top: 0; left: 0;          width: 40%; height: 100%;          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);          transform: translateX(-100%);        }        .logout-btn-styled:hover::after {          animation: logoutShimmer 0.8s ease-in-out;        }        /* Subtle glow pulse on logout */        @keyframes logoutGlow {          0%, 100% { box-shadow: 0 0 0px rgba(220,38,38,0), 0 4px 12px rgba(0,0,0,0.3); }          50% { box-shadow: 0 0 18px rgba(220,38,38,0.25), 0 4px 12px rgba(0,0,0,0.3); }        }        .logout-btn-styled { animation: logoutGlow 3s ease-in-out infinite; }        /* Modal overlay */        @keyframes modalOverlayIn { from { opacity: 0; } to { opacity: 1; } }        @keyframes modalOverlayOut { from { opacity: 1; } to { opacity: 0; } }        @keyframes modalScaleIn { from { opacity: 0; transform: scale(0.85) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }        @keyframes modalScaleOut { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.85) translateY(20px); } }        .modal-overlay-enter { animation: modalOverlayIn 0.3s ease forwards; }        .modal-content-enter { animation: modalScaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }        /* Hover icon bounce */        @keyframes iconBounce {          0%, 100% { transform: scale(1); }          50% { transform: scale(1.15); }        }        .nav-btn:hover .nav-icon { animation: iconBounce 0.35s ease; }      ` }} />      { }      {showLogoutModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay-enter" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setShowLogoutModal(false)}>
      <div
        className="modal-content-enter bg-bg-300 border border-slate-700/60 rounded-3xl w-full max-w-md mx-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col items-center"
        style={{ padding: '40px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0" style={{ width: '80px', height: '80px', marginBottom: '24px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>

        <h3 className="font-black text-theme-text-base text-center tracking-widest uppercase" style={{ fontSize: '24px', marginBottom: '16px' }}>
          End Session?
        </h3>

        <p className="text-theme-text-muted text-center leading-relaxed" style={{ fontSize: '15px', marginBottom: '40px' }}>
          You're about to log out of the dashboard. Any unsaved changes will be lost.
        </p>

        <div className="flex w-full" style={{ gap: '16px' }}>
          <button onClick={() => setShowLogoutModal(false)} className="flex-1 rounded-xl font-bold text-theme-text-base bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 hover:text-theme-text-base transition-all duration-300 tracking-wider uppercase" style={{ padding: '16px 0' }}>
            Cancel
          </button>
          <button
            onClick={() => {
              setShowLogoutModal(false);
              onLogout();
            }}
            className="flex-1 rounded-xl font-bold text-theme-text-base bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.5)] transition-all duration-300 tracking-wider uppercase active:scale-95"
            style={{ padding: '16px 0' }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )}
    <aside
      className={`bg-bg-200 light:bg-white border-slate-800/50 light:border-slate-200 z-20 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] select-none
          ${isSidebarOpen ? 'w-[320px] border-r opacity-100' : 'w-0 border-r-0 opacity-0 overflow-hidden'}
        `}
    >
      {/* Added pt-14 to lower the whole sidebar contents away from the browser top */}
      <div className="w-full h-full flex flex-col font-sans select-none shrink-0" style={{ padding: 0 }}>

        {/* Brand Header - Padded away from all borders */}
        <div className="shrink-0 flex items-center animate-fade-in-down group cursor-pointer" style={{ padding: "32px 32px 16px 32px" }}>
          <div className="flex items-center gap-4 transition-transform duration-500 ease-out group-hover:translate-x-2">
            {/* Rounded Image Container */}
            <div className="flex items-center justify-center min-w-[48px] h-12 rounded-full bg-cyan-950/40 light:bg-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.3)] light:shadow-sm relative overflow-hidden shrink-0 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] group-hover:scale-110">
              <img src="/assets/weblogo.png" alt="Logo" className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <h1 className="text-2xl font-black text-theme-text-base light:text-slate-900 tracking-[0.15em] drop-shadow-lg transition-colors duration-500 group-hover:text-cyan-400">
              ESPORTS
            </h1>
          </div>
        </div>

        {/* FIX 2: A dedicated invisible spacer block that forces 48px of empty height */}
        <div className="w-full h-8 shrink-0"></div>

        {/* Maximized Scrollable Navigation and Controls */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col custom-scrollbar mt-2" style={{ padding: "0 32px 32px 32px" }}>

          <div className="flex flex-col gap-8 flex-1">
            {sidebarData.map((section, idx) => (
              <div
                key={idx}
                className="animate-slide-in-right"
                style={{ animationDelay: `${idx * 100}ms`, opacity: 1 }}
              >
                {/* Softened Section Header */}
                <h2 style={{ margin: "0 0 8px 0", padding: "0 8px" }} className="text-[11px] font-bold text-theme-text-muted tracking-[0.25em] uppercase">
                  {section.category}
                </h2>

                <ul className="flex flex-col gap-1.5">
                  {section.links.map((link) => {
                    const isActive = activeTab === link.name;
                    const IconComponent = iconMap[link.name];

                    return (
                      <li key={link.name}>
                        <button
                          onClick={() => setActiveTab(link.name)} style={{ padding: "8px 12px" }}
                          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ease-out transform ${isActive
                            ? 'bg-gradient-to-r from-cyan-900/50 to-cyan-900/10 light:from-cyan-100 light:to-white text-cyan-400 light:text-cyan-600 font-bold border border-cyan-500/30 light:border-cyan-300 shadow-[inset_0_0_20px_rgba(6,182,212,0.25)] light:shadow-sm translate-x-1'
                            : 'text-theme-text-muted light:text-slate-600 hover:bg-slate-800/40 light:hover:bg-slate-100 hover:text-theme-text-base light:hover:text-slate-900 font-medium hover:translate-x-1'
                            }`}
                        >
                          {IconComponent && (
                            <IconComponent
                              size={20}
                              strokeWidth={isActive ? 2.5 : 1.5}
                              className={`transition-colors duration-300 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-theme-text-muted'}`}
                            />
                          )}
                          <span className="text-[15px] tracking-wide">{link.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Action Controls */}
          <div style={{ marginTop: "auto", padding: 0 }} className="flex flex-col gap-3 animate-fade-in-up shrink-0">

            {/* Animated Logout */}
            <button
              onClick={() => setShowLogoutModal(true)} style={{ padding: "8px 12px" }}
              className="group w-full flex items-center gap-4 px-4 py-3 rounded-xl text-theme-text-muted hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 transform hover:-translate-y-1"
            >
              <LogOut size={20} strokeWidth={2} className="text-theme-text-muted group-hover:text-red-500 transition-colors" />
              <span className="text-[15px] font-bold">Logout</span>
            </button>

          </div>
        </div>
      </div>
    </aside>
    {/* MAIN CONTENT AREA */}
    <main className="flex-1 bg-bg-100 light:bg-slate-50 flex flex-col overflow-hidden relative">
      {/* Modern Glassmorphism Header */}
      <header
        style={{ padding: '0 28px' }}
        className="h-14 border-b border-slate-800/40 light:border-slate-200 flex items-center justify-between px-6 sm:px-10 md:px-16 lg:px-20 bg-bg-200/80 light:bg-white/80 backdrop-blur-xl z-10 shrink-0 shadow-sm transition-all duration-300"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sidebar Toggle Button - Clean 3-line icon, no container */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ padding: '8px' }}
            className="p-2 text-theme-text-muted hover:text-cyan-400 hover:bg-slate-800/40 rounded-lg bg-transparent border-none outline-none cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0"
            aria-label="Toggle sidebar menu"
          >
            <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]"></div>
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-theme-text-base light:text-slate-900 tracking-[0.14em] uppercase drop-shadow-sm">
              {activeTab}
            </h2>
          </div>
        </div>
      </header>
      {/* Dynamic Rendering of Components */}
      <div className="flex-1 overflow-auto relative z-10 bg-bg-100 light:bg-slate-50 flex flex-col">
        {renderContent()}
      </div>
    </main>

  </div>
  );
};
export default MainUIScreen;
