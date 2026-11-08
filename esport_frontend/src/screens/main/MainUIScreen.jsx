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
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay-enter" style={{ backgroundColor: 'rgba(2, 6, 13, 0.78)', backdropFilter: 'blur(10px)' }} onClick={() => setShowLogoutModal(false)}>
      <div
        className="modal-content-enter hud-card bg-bg-300 rounded-xl shrink-0 shadow-[0_25px_60px_rgba(0,0,0,0.65)] flex flex-col items-center"
        style={{ width: '380px', height: '290px', padding: '28px', boxSizing: 'border-box', justifyContent: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hud-chamfer-sm bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.2)]" style={{ width: '56px', height: '56px', marginBottom: '16px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>

        <h3 className="font-tactical font-extrabold text-theme-text-base text-center tracking-[0.16em] uppercase" style={{ fontSize: '20px', marginBottom: '8px' }}>
          End Session?
        </h3>

        <p className="text-theme-text-muted text-center leading-relaxed" style={{ fontSize: '13px', marginBottom: '22px' }}>
          You're about to log out of the dashboard. Any unsaved changes will be lost.
        </p>

        <div className="flex w-full" style={{ gap: '12px' }}>
          <button onClick={() => setShowLogoutModal(false)} className="flex-1 hud-chamfer-sm font-tactical font-bold text-theme-text-base bg-slate-800/70 border border-slate-600/50 hover:bg-slate-700/70 hover:border-cyan-400/40 transition-all duration-300 tracking-[0.14em] uppercase cursor-pointer" style={{ padding: '11px 0', fontSize: '12px' }}>
            Cancel
          </button>
          <button
            onClick={() => {
              setShowLogoutModal(false);
              onLogout();
            }}
            className="flex-1 hud-chamfer-sm font-tactical font-bold text-white bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 shadow-[0_4px_20px_rgba(239,68,68,0.35)] hover:shadow-[0_6px_28px_rgba(239,68,68,0.55)] transition-all duration-300 tracking-[0.14em] uppercase active:scale-95 cursor-pointer"
            style={{ padding: '11px 0', fontSize: '12px' }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )}
    <aside
      className={`bg-bg-200/95 light:bg-white border-cyan-500/15 light:border-slate-200 z-20 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] select-none relative
          ${isSidebarOpen ? 'w-[268px] border-r opacity-100' : 'w-0 border-r-0 opacity-0 overflow-hidden'}
        `}
    >
      {/* Top right corner subtle tactical accent line */}
      <div className="absolute top-0 right-0 w-[2px] h-16 bg-gradient-to-b from-cyan-400/60 to-transparent pointer-events-none" />

      <div className="w-full h-full flex flex-col font-sans select-none shrink-0" style={{ padding: 0 }}>

        {/* Brand Header */}
        <div
          onClick={() => setActiveTab('Dashboard')}
          className="shrink-0 flex items-center justify-between border-b border-slate-800/70 light:border-slate-200 group cursor-pointer relative overflow-hidden"
          style={{ padding: '20px 22px' }}
        >
          <div className="flex items-center gap-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-400/30 shadow-[0_0_18px_rgba(0,229,255,0.22)] relative overflow-hidden shrink-0 transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-[0_0_26px_rgba(0,229,255,0.45)]">
              <img src="/assets/weblogo.png" alt="Logo" className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <div className="flex flex-col">
              <h1 className="font-tactical text-xl font-extrabold text-theme-text-base light:text-slate-900 tracking-[0.18em] leading-none transition-colors duration-300 group-hover:text-cyan-400">
                ESPORTS
              </h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="hud-diamond" style={{ width: '5px', height: '5px' }} />
                <span className="font-tactical text-[9px] font-bold tracking-[0.22em] text-cyan-400/80 uppercase">
                  LEAGUE COMMAND
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation and Controls */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col custom-scrollbar" style={{ padding: '22px 18px 20px 18px' }}>

          <div className="flex flex-col gap-6 flex-1">
            {sidebarData.map((section, idx) => (
              <div
                key={idx}
                className="hud-enter"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Tactical Section Header */}
                <div style={{ margin: '0 0 10px 0', padding: '0 10px' }} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rotate-45 bg-cyan-400/70 shadow-[0_0_6px_rgba(0,229,255,0.6)]" />
                  <h2 className="font-tactical text-[10px] font-bold text-theme-text-muted tracking-[0.24em] uppercase">
                    {section.category}
                  </h2>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-800 to-transparent ml-1" />
                </div>

                <ul className="flex flex-col gap-1.5">
                  {section.links.map((link) => {
                    const isActive = activeTab === link.name;
                    const IconComponent = iconMap[link.name];

                    return (
                      <li key={link.name}>
                        <button
                          onClick={() => setActiveTab(link.name)}
                          style={{ padding: '11px 14px' }}
                          className={`nav-btn relative w-full flex items-center gap-3.5 hud-chamfer-sm transition-all duration-250 ease-out cursor-pointer group overflow-hidden ${isActive
                            ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-300 font-bold border border-cyan-400/40 shadow-[0_0_20px_rgba(0,229,255,0.12)] translate-x-1'
                            : 'text-theme-text-muted hover:bg-slate-800/50 hover:text-theme-text-base border border-transparent hover:border-slate-700/60 font-semibold hover:translate-x-1'
                            }`}
                        >
                          {/* Left active accent bar */}
                          {isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-cyan-400 shadow-[0_0_10px_#00e5ff] rounded-r" />
                          )}
                          {IconComponent && (
                            <IconComponent
                              size={18}
                              strokeWidth={isActive ? 2.3 : 1.7}
                              className={`nav-icon shrink-0 transition-colors duration-250 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]' : 'text-theme-text-muted group-hover:text-cyan-300'}`}
                            />
                          )}
                          <span className="font-tactical text-[13px] tracking-[0.1em] uppercase truncate">
                            {link.name}
                          </span>
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rotate-45 bg-cyan-400 shadow-[0_0_8px_#00e5ff] shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Action Controls */}
          <div style={{ marginTop: 'auto', paddingTop: '16px' }} className="flex flex-col gap-3 border-t border-slate-800/70 shrink-0">
            {/* Tactical Logout Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              style={{ padding: '11px 14px' }}
              className="group w-full flex items-center justify-between hud-chamfer-sm bg-red-500/5 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/45 text-theme-text-muted hover:text-red-400 transition-all duration-250 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <LogOut size={17} strokeWidth={2} className="text-red-400/80 group-hover:text-red-400 transition-colors" />
                <span className="font-tactical text-[12px] font-bold tracking-[0.16em] uppercase">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </aside>
    {/* MAIN CONTENT AREA */}
    <main className="flex-1 bg-bg-100 light:bg-slate-50 flex flex-col overflow-hidden relative">
      {/* Tactical HUD Header */}
      <header
        style={{ padding: '0 24px' }}
        className="h-16 border-b border-cyan-500/15 light:border-slate-200 flex items-center justify-between bg-bg-200/90 light:bg-white/90 backdrop-blur-xl z-10 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-all duration-300"
      >
        <div className="flex items-center gap-3.5">
          {/* Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ padding: '8px 10px' }}
            className="hud-chamfer-sm text-theme-text-muted hover:text-cyan-400 bg-slate-900/60 hover:bg-cyan-500/10 border border-slate-700/60 hover:border-cyan-400/50 outline-none cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0"
            aria-label="Toggle sidebar menu"
          >
            <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(0,229,255,0.6)]" />
            <h2 className="font-tactical text-sm sm:text-base md:text-lg font-extrabold text-theme-text-base light:text-slate-900 tracking-[0.16em] uppercase leading-none">
              {activeTab}
            </h2>
          </div>
        </div>
      </header>
      {/* Dynamic Rendering of Components */}
      <div className="flex-1 overflow-auto relative z-10 bg-bg-100 light:bg-slate-50 hud-canvas-bg flex flex-col">
        {renderContent()}
      </div>
    </main>

  </div>
  );
};
export default MainUIScreen;
