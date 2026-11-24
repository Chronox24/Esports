import React, { useState, useEffect, useRef } from 'react';
import { apiFetch, isTournamentAdminUser, canUserFullAccess, canUserEdit, canUserManageFolders } from '../../utils/api';
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ClipboardCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const RefreshIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const MailIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const EyeIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
  </svg>
);
const CheckCircleIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ShieldCheckIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const AnimatedAdminNumber = ({ value, isLoading, accent = '#22d3ee' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [scrambleDigits, setScrambleDigits] = useState('00');

  // Loading animation: rapid cycling of random digits with cyberpunk telemetry effect
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      const rand = Math.floor(10 + Math.random() * 89);
      setScrambleDigits(String(rand));
    }, 60);
    return () => clearInterval(interval);
  }, [isLoading]);

  // When database query completes / stats change: smoothly count up to real-time number
  useEffect(() => {
    if (isLoading) return;

    const target = typeof value === 'number'
      ? value
      : parseInt(String(value ?? 0).replace(/,/g, ''), 10);

    if (isNaN(target)) {
      setDisplayValue(value ?? 0);
      return;
    }

    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 650;
    const startTime = performance.now();
    let frameId;

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * ease);
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        setDisplayValue(target);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [value, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 h-9">
        <span
          className="font-tactical font-mono text-4xl font-extrabold tracking-wider animate-pulse inline-block leading-none text-cyan-400"
          style={{
            textShadow: `0 0 16px ${accent}80`,
          }}
        >
          {scrambleDigits}
        </span>
        <span
          className="w-1.5 h-6 rounded-xs animate-ping"
          style={{ backgroundColor: accent }}
        />
      </div>
    );
  }

  const formatted = typeof displayValue === 'number'
    ? displayValue.toLocaleString()
    : displayValue;

  return (
    <span
      className="font-tactical text-4xl font-extrabold text-cyan-400 leading-none transition-all duration-300"
      style={{
        textShadow: `0 0 16px ${accent}40`,
      }}
    >
      {formatted}
    </span>
  );
};

const Card = ({ title, children, className = "" }) => (
  <div
    className={`bg-bg-300 light:bg-white rounded-xl border border-theme-input light:border-slate-200 shadow-xl light:shadow-sm flex flex-col overflow-hidden relative group ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.01] light:from-blue-100/[0.1] to-transparent pointer-events-none z-0"></div>
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 light:via-blue-300 to-transparent"></div>
    <div className="border-b border-theme-input light:border-slate-200 bg-bg-300 light:bg-slate-50 relative z-10 flex justify-between items-center group-hover:bg-bg-300 light:group-hover:bg-slate-100 transition-colors" style={{ padding: "24px 32px" }}>
      <h3 className="text-sm font-bold tracking-wider text-theme-text-base light:text-slate-700">
        {title}
      </h3>
    </div>
    <div className="flex-1 relative z-10" style={{ padding: "32px" }}>{children}</div>
  </div>
);
const Toggle = ({ enabled, onChange, label, sublabel }) => (
  <div className="flex items-center justify-between border-b border-gray-800/50 light:border-slate-200 last:border-0 hover:bg-white/[0.02] light:hover:bg-black/[0.02] rounded transition-colors" style={{ padding: "12px 16px", gap: "24px" }}>
    <div className="flex flex-col">
      <span className="text-xs font-bold text-theme-text-base light:text-slate-700">
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] text-theme-text-faint light:text-theme-text-muted">
          {sublabel}
        </span>
      )}
    </div>
    <button
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" : "bg-bg-400 light:bg-slate-300"}`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  </div>
);
const Select = ({ label, options, value, onChange, ...props }) => (
  <div className="flex flex-col w-full">
    {label && (
      <label className="block text-[10px] font-bold text-theme-text-muted light:text-theme-text-muted tracking-wider uppercase" style={{ marginBottom: "8px" }}>
        {label}
      </label>
    )}
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
        className="appearance-none w-full bg-theme-input border border-theme-input text-theme-text-base text-xs font-medium rounded-lg focus:outline-none focus:border-blue-500 transition-colors shadow-inner cursor-pointer"
        style={{ padding: "12px 32px 12px 16px" }}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
        <svg className="w-4 h-4 text-theme-text-muted light:text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);
const Input = ({ label, placeholder, type = "text", ...props }) => (
  <div className="flex flex-col w-full">
    {label && (
      <label className="block text-[10px] font-bold text-theme-text-muted light:text-theme-text-muted tracking-wider uppercase" style={{ marginBottom: "8px" }}>
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      {...props}
      className="w-full bg-theme-input border border-theme-input text-theme-text-base text-xs font-medium rounded-lg focus:outline-none focus:border-blue-500 transition-colors shadow-inner placeholder:text-theme-text-muted"
      style={{ padding: "12px 16px" }}
    />
  </div>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative bg-bg-300 light:bg-white w-full ${maxWidth} rounded-2xl border border-theme-input light:border-slate-200 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] my-auto`}>
        <div className="border-b border-theme-input light:border-slate-200 flex justify-between items-center bg-bg-300 light:bg-slate-50 p-4 sm:px-8 sm:py-6 shrink-0">
          <h2 className="text-lg sm:text-xl font-black tracking-wider text-theme-text-base light:text-slate-900 uppercase truncate" style={{ margin: 0, letterSpacing: "0.05em" }}>{title}</h2>
          <button onClick={onClose} className="text-theme-text-muted hover:text-theme-text-base transition-colors p-1.5 flex items-center justify-center shrink-0">
            <CloseIcon />
          </button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden custom-scrollbar p-4 sm:p-7 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
const userDirectoryData = [
  { ign: 'Argie', team: 'Valorant', location: 'Quezon City', country: 'PH', contact: '09xx-xxx-xxxx', verified: true },
  { ign: 'Argie', team: 'Valorant', location: 'Cebu City', country: 'PH', contact: '09xx-xxx-xxxx', verified: false, pending: true },
  { ign: 'Crossfire', team: 'Crossfire', location: 'Cebu City', country: 'PH', contact: '09xx-xxx-xxxx', verified: false, rejected: true },
  { ign: 'Sarah', team: 'Crossfire', location: 'Davao City', country: 'PH', contact: '09xx-xxx-xxxx', verified: false, info: 'Linked PH ID/Facebook Profile' },
  { ign: 'EliteSniper', team: 'TNC South', location: 'Makati', country: 'PH', contact: '09xx-xxx-xxxx', verified: true },
];

const modes = ['Single Elimination', 'Round Robin'];
const ToggleSwitch = ({ enabled, onChange }) => (
  <button 
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-cyan-500' : 'bg-bg-400 border border-theme-input'}`}
    onClick={() => onChange(!enabled)}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);
const SelectDropdown = ({ label, options, defaultValue, value, onChange }) => (
  <div className="relative">
    <select 
      value={value !== undefined ? value : defaultValue} 
      onChange={onChange} 
      className="appearance-none w-full bg-bg-300 border border-theme-input text-theme-text-base font-medium text-xs rounded py-2 pl-3 pr-8 focus:outline-none focus:border-cyan-500 transition-colors"
    >
      {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      <ChevronDownIcon />
    </div>
  </div>
);
const LiveMatchManager = ({ globalTournament, globalGame, teams }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMatch, setNewMatch] = useState({ team_a_id: '', team_b_id: '', map_name: '' });
  const fetchMatches = async () => {
    if (!globalTournament) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/matches?tournament=${encodeURIComponent(globalTournament)}`);
      if (res.ok) setMatches(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };
  React.useEffect(() => { fetchMatches(); }, [globalTournament]);
  const handleCreateMatch = async () => {
    if (!newMatch.team_a_id || !newMatch.team_b_id) return console.warn('Select both teams');
    try {
      const res = await apiFetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_name: globalTournament,
          game_title: globalGame,
          team_a_id: newMatch.team_a_id,
          team_b_id: newMatch.team_b_id,
          map_name: newMatch.map_name || 'TBD',
          status: 'live'
        })
      });
      if (res.ok) {
        setNewMatch({ team_a_id: '', team_b_id: '', map_name: '' });
        fetchMatches();
      }
    } catch (e) { console.error(e); }
  };
  const updateScore = async (matchId, team, currentScore, delta) => {
    const field = team === 'a' ? 'team_a_score' : 'team_b_score';
    const newScore = Math.max(0, currentScore + delta);
    try {
      const res = await apiFetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newScore })
      });
      if (res.ok) fetchMatches();
    } catch (e) { console.error(e); }
  };
  const updateStatus = async (matchId, status) => {
    try {
      const res = await apiFetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchMatches();
    } catch (e) { console.error(e); }
  };
  return (
    <div className="mt-4 border border-theme-input bg-bg-300 rounded-lg p-4 relative">
      <span className="absolute -top-2 left-3 bg-bg-300 px-1 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Live Match Controller</span>
      <div className="flex items-center gap-2 mb-4 mt-1">
        <select value={newMatch.team_a_id} onChange={e => setNewMatch({...newMatch, team_a_id: e.target.value})} className="flex-1 bg-bg-300 border border-theme-input rounded px-2 py-1 text-xs text-theme-text-base">
          <option value="">Select Team A</option>
          {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
        </select>
        <span className="text-xs text-theme-text-faint font-black">VS</span>
        <select value={newMatch.team_b_id} onChange={e => setNewMatch({...newMatch, team_b_id: e.target.value})} className="flex-1 bg-bg-300 border border-theme-input rounded px-2 py-1 text-xs text-theme-text-base">
          <option value="">Select Team B</option>
          {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
        </select>
        <input placeholder="Map..." value={newMatch.map_name} onChange={e => setNewMatch({...newMatch, map_name: e.target.value})} className="w-20 bg-bg-300 border border-theme-input rounded px-2 py-1 text-xs text-theme-text-base" />
        <button type="button" onClick={handleCreateMatch} className="hud-btn-primary px-4 py-1.5 text-xs font-tactical font-extrabold">+</button>
      </div>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
        {loading && <div className="text-center text-xs text-theme-text-faint">Loading matches...</div>}
        {matches.map(m => (
          <div key={m.match_id} className="bg-bg-300 border border-theme-input rounded p-2 flex flex-col gap-2">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{m.map_name || 'TBD'}</span>
               <select value={m.status} onChange={e => updateStatus(m.match_id, e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none border border-gray-700 rounded px-1" style={{ color: m.status === 'live' ? '#ef4444' : '#64748b' }}>
                 <option value="scheduled">Scheduled</option>
                 <option value="live">Live</option>
                 <option value="finished">Finished</option>
               </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => updateScore(m.match_id, 'a', m.team_a_score, -1)} className="text-theme-text-faint hover:text-theme-text-base px-1">-</button>
                <span className="text-lg font-black w-6 text-center text-theme-text-base">{m.team_a_score || 0}</span>
                <button onClick={() => updateScore(m.match_id, 'a', m.team_a_score, 1)} className="text-theme-text-faint hover:text-theme-text-base px-1">+</button>
                <span className="text-xs font-bold w-24 truncate text-theme-text-base">{m.team_a?.team_name || 'TBD'}</span>
              </div>
              <span className="text-xs text-gray-600 font-black">VS</span>
              <div className="flex items-center gap-2 flex-row-reverse">
                <button onClick={() => updateScore(m.match_id, 'b', m.team_b_score, -1)} className="text-theme-text-faint hover:text-theme-text-base px-1">-</button>
                <span className="text-lg font-black w-6 text-center text-theme-text-base">{m.team_b_score || 0}</span>
                <button onClick={() => updateScore(m.match_id, 'b', m.team_b_score, 1)} className="text-theme-text-faint hover:text-theme-text-base px-1">+</button>
                <span className="text-xs font-bold w-24 truncate text-right text-theme-text-base">{m.team_b?.team_name || 'TBD'}</span>
              </div>
            </div>
          </div>
        ))}
        {!loading && matches.length === 0 && <div className="text-center text-xs text-theme-text-faint italic py-2">No matches created for this tournament.</div>}
      </div>
    </div>
  );
};
const Admin = ({ globalGame, globalTournament, onLogout }) => {
  const hasAccess = isTournamentAdminUser();
  const [activeTab, setActiveTab] = React.useState(() => localStorage.getItem('admin_activeTab') || "League Quick Stats");

  React.useEffect(() => {
    if (activeTab === 'Admin Accounts & User Directory' && !canUserFullAccess()) {
      setActiveTab('League Quick Stats');
      localStorage.setItem('admin_activeTab', 'League Quick Stats');
      return;
    }
    if (activeTab) {
      localStorage.setItem('admin_activeTab', activeTab);
    }
  }, [activeTab]);

  // Upper-Right System Toast Notification
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

// Dynamic Formula State
  const [formulas, setFormulas] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Global');
  
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcTarget, setCalcTarget] = useState('excel_formula');
  const [calcString, setCalcString] = useState('');

  const activeFormula = formulas.find(f => f.role === selectedRole) || {
    id: null, kill_weight: 1.0, death_weight: 1.0, assist_weight: 0.5, acs_weight: 1.0, econ_weight: 1.0, first_kill_weight: 1.0, plants_weight: 1.0, defuse_weight: 1.0, ace_weight: 1.0, excel_formula: "", acs_formula: "", kda_formula: "", base_multiplier: 78.0, base_rating: 60.0
  };

  const fetchFormulas = async () => {
    try {
      const res = await apiFetch('/api/settings/formula');
      const data = await res.json();
      if (Array.isArray(data)) setFormulas(data);
    } catch (e) { console.error(e); }
  };

  const handleFormulaUpdate = async (field, value) => {
    let finalValue = value;
    if (field !== 'excel_formula' && field !== 'acs_formula' && field !== 'kda_formula') {
      finalValue = parseFloat(value) || 0;
    }
    const updated = { ...activeFormula, [field]: finalValue };
    setFormulas(prev => prev.map(f => f.role === selectedRole ? updated : f));
  };

  const saveFormula = async () => {
    if (!canUserFullAccess()) return showToast('Permission Denied: Full access permission required to save formulas.', 'warning');
    if (!activeFormula.id) return showToast('Cannot save default formula directly. Ensure database is seeded.', 'warning');
    try {
      const res = await apiFetch(`/api/settings/formula/${activeFormula.id}`, {
        method: 'PUT',
        body: JSON.stringify(activeFormula)
      });
      if (res.ok) showToast('Formula successfully saved to the database!', 'success');
      else showToast('Failed to save formula.', 'error');
    } catch (e) {
      console.error(e);
      showToast('Error saving formula.', 'error');
    }
  };

    const [adminGame, setAdminGame] = useState('Game (VAL/CF)');
  const effectiveGame = adminGame === 'Game (VAL/CF)' ? (globalGame || 'VALORANT') : adminGame;
  const maps = (effectiveGame.toUpperCase() === 'VALORANT')
    ? ['Ascent', 'Fracture', 'Pearl', 'Haven']
    : ['Crossfire', 'Crossfire(Luzon)', 'Crossfire(Visayas)'];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState('Super Admin');
  const [isCreating, setIsCreating] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'verifying' | 'verified'
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [modalFeedback, setModalFeedback] = useState(null); // { type: 'error' | 'success' | 'info', message: '' }

  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetCreateModal = () => {
    setShowCreateModal(false);
    setNewEmail('');
    setNewPassword('');
    setShowPassword(false);
    setNewRole('Super Admin');
    setEmailVerificationStatus('idle');
    setVerificationCode('');
    setModalFeedback(null);
    setResendCooldown(0);
    setIsCreating(false);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-gray-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-blue-500' };
    if (score === 4) return { score, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 0, label: 'Weak', color: 'bg-red-500' };
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setShowPassword(true);
    setModalFeedback({ type: 'info', message: 'Strong security key generated! Be sure to copy and save it.' });
  };

  const handleSendVerification = async () => {
    const cleanEmail = (newEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setModalFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    setEmailVerificationStatus('sending');
    setModalFeedback(null);
    try {
      const res = await apiFetch('/api/admin/send-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, role: newRole })
      });
      if (res.ok) {
        const data = await res.json();
        setEmailVerificationStatus('sent');
        setResendCooldown(60);
        setModalFeedback({ 
          type: 'success', 
          message: data.message || `Verification code sent to ${cleanEmail}. Please check your email inbox and enter the 6-digit code below.` 
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        setEmailVerificationStatus('idle');
        setModalFeedback({ type: 'error', message: errData.error || 'Failed to dispatch verification email.' });
      }
    } catch (e) {
      console.error(e);
      setEmailVerificationStatus('idle');
      setModalFeedback({ type: 'error', message: 'Failed to communicate with verification server. Please try again.' });
    }
  };

  const handleVerifyCode = async () => {
    const cleanEmail = (newEmail || '').trim().toLowerCase();
    const cleanCode = (verificationCode || '').trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setModalFeedback({ type: 'error', message: 'Please enter the complete 6-digit verification code.' });
      return;
    }
    setEmailVerificationStatus('verifying');
    setModalFeedback(null);
    try {
      const res = await apiFetch('/api/admin/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode })
      });
      if (res.ok) {
        setEmailVerificationStatus('verified');
        setModalFeedback({ type: 'success', message: 'Email address verified successfully! You may now create the Admin account.' });
      } else {
        const errData = await res.json().catch(() => ({}));
        setEmailVerificationStatus('sent');
        setModalFeedback({ type: 'error', message: errData.error || 'Invalid or expired verification code.' });
      }
    } catch (e) {
      setEmailVerificationStatus('sent');
      setModalFeedback({ type: 'error', message: 'Verification failed. Please check the code and try again.' });
    }
  };

  const handleCreateUser = async () => {
    const cleanEmail = (newEmail || '').trim().toLowerCase();
    if (!cleanEmail) {
      setModalFeedback({ type: 'error', message: 'Email address is required.' });
      return;
    }
    if (emailVerificationStatus !== 'verified') {
      setModalFeedback({ type: 'error', message: 'Please verify the email address with the verification code before creating an Admin account.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setModalFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsCreating(true);
    setModalFeedback(null);
    try {
      const res = await apiFetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          password: newPassword, 
          role: newRole,
          verificationCode,
          isVerifiedDirect: true
        })
      });
      if (res.ok) {
        setModalFeedback({ type: 'success', message: `Admin account for ${cleanEmail} created successfully!` });
        const resUsers = await apiFetch(`/api/users?t=${Date.now()}`);
        if (resUsers.ok) setAccounts(await resUsers.json());
        fetchData();
        setTimeout(() => {
          resetCreateModal();
        }, 1200);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setModalFeedback({ type: 'error', message: 'Error creating user: ' + (errorData.error || 'Unknown error') });
        setIsCreating(false);
      }
    } catch (e) {
      console.error(e);
      setModalFeedback({ type: 'error', message: 'Failed to create user. Please try again.' });
      setIsCreating(false);
    }
  };
  const [isBroadcasting, setIsBroadcasting] = useState(() => {
    const saved = localStorage.getItem('isBroadcasting');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const handleBroadcastChange = (val) => {
    setIsBroadcasting(val);
    localStorage.setItem('isBroadcasting', JSON.stringify(val));
  };
  const [banOverride, setBanOverride] = useState(false);
  const [seasonReset, setSeasonReset] = useState(true);
  const [activeMap, setActiveMap] = useState('Ascent');
  const [teams, setTeams] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [reports, setReports] = useState([]);
  const [dashboardTournaments, setDashboardTournaments] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [lastStatsSync, setLastStatsSync] = useState(null);
  const [statsModal, setStatsModal] = useState(null);
  const [statsSearch, setStatsSearch] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [accountRoleFilter, setAccountRoleFilter] = useState('All Roles');
  const [rulebookUrl, setRulebookUrl] = useState(null);
  const [rulebookRecord, setRulebookRecord] = useState(null);
  const [allRulebooks, setAllRulebooks] = useState([]);
  const [showRulebookPreview, setShowRulebookPreview] = useState(true);
  const [rulebookLoading, setRulebookLoading] = useState(false);
  const [isUploadingRulebook, setIsUploadingRulebook] = useState(false);
  const [rulebookTournament, setRulebookTournament] = useState(globalTournament || '');

  React.useEffect(() => {
    if (globalTournament) {
      setRulebookTournament(globalTournament);
    } else if (tournaments.length > 0 && !rulebookTournament) {
      setRulebookTournament(tournaments[0].name);
    }
  }, [globalTournament, tournaments]);

  const fetchRulebook = React.useCallback(async (targetTourney) => {
    setRulebookLoading(true);
    const activeTourney = targetTourney !== undefined ? targetTourney : (rulebookTournament || globalTournament || '');
    try {
      const tourneyParam = activeTourney ? `?tournament=${encodeURIComponent(activeTourney)}` : '';
      const res = await apiFetch(`/api/admin/rulebook${tourneyParam}`);
      if (res.ok) {
        const data = await res.json();
        setRulebookRecord(data);
        if (data && data.file_url) {
          const finalUrl = data.file_url.startsWith('http')
            ? data.file_url
            : `${window.location.origin}${data.file_url}`;
          setRulebookUrl(finalUrl);
        } else {
          setRulebookUrl(null);
        }
      } else {
        setRulebookRecord(null);
        setRulebookUrl(null);
      }
      const allRes = await apiFetch('/api/admin/rulebook?all=true');
      if (allRes.ok) {
        const allData = await allRes.json();
        if (Array.isArray(allData)) setAllRulebooks(allData);
      }
    } catch (err) {
      console.error('Failed to fetch rulebook from database:', err);
    } finally {
      setRulebookLoading(false);
    }
  }, [rulebookTournament, globalTournament]);

  React.useEffect(() => {
    fetchRulebook();
  }, [fetchRulebook]);

  const handleRulebookUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const activeTourney = rulebookTournament || globalTournament;
    if (!activeTourney) {
      showToast('Please select a tournament first to assign this rulebook.', 'warning');
      return;
    }
    const formData = new FormData();
    formData.append('rulebook', file);
    formData.append('tournament_name', activeTourney);
    setIsUploadingRulebook(true);
    try {
      const res = await apiFetch('/api/admin/rulebook', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setRulebookRecord(data);
        const finalUrl = data.file_url.startsWith('http')
          ? data.file_url
          : `${window.location.origin}${data.file_url}`;
        setRulebookUrl(finalUrl);
        showToast(`Rulebook uploaded and bound strictly to "${activeTourney}"!`, 'success');
        fetchRulebook(activeTourney);
      } else {
        showToast('Rulebook upload failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Rulebook upload failed.', 'error');
    } finally {
      setIsUploadingRulebook(false);
    }
  };

  const handleAssignRulebookTournament = async (rulebookId, targetTournament) => {
    if (!targetTournament) return;
    try {
      const res = await apiFetch(`/api/admin/rulebook/${rulebookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament_name: targetTournament })
      });
      if (res.ok) {
        showToast(`Rulebook #${rulebookId} assigned strictly to "${targetTournament}"!`, 'success');
        fetchRulebook();
      } else {
        showToast('Failed to reassign tournament', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error reassigning rulebook tournament', 'error');
    }
  };

  const handleDeleteRulebook = async (id) => {
    if (!window.confirm('Are you sure you want to remove this rulebook from the database?')) return;
    try {
      const res = await apiFetch(`/api/admin/rulebook/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Rulebook deleted from database', 'info');
        fetchRulebook();
      } else {
        showToast('Failed to delete rulebook', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete rulebook', 'error');
    }
  };
  const activeTournamentObj = tournaments.find(t => t.id == globalTournament);
  const handleUpdateFolderGame = async (newGame) => {
    if (!activeTournamentObj) return;
    try {
      const res = await apiFetch('/api/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: activeTournamentObj.name, game: newGame })
      });
      if (res.ok) {
        window.location.reload(); 
      } else {
        const errorData = await res.json();
        showToast('Error updating folder: ' + (errorData.error || 'Unknown error'), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to update folder game title.', 'error');
    }
  };
  const [editingUser, setEditingUser] = useState(null);
  const [editPermissions, setEditPermissions] = useState({ view: false, edit: false, full: false, manage_folders: false });
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);
  const handleOpenEdit = (user) => {
    if (!canUserFullAccess()) {
      showToast("Permission Denied: Full access permission required to alter permissions.", "warning");
      return;
    }
    if (user.is_super_admin) {
      showToast("Cannot manually alter permissions for the Super Admin.", "warning");
      return;
    }
    setEditingUser(user);
    const p = user.permissions || {};
    const isFull = Boolean(p.full);
    setEditPermissions({
      view: isFull ? true : Boolean(p.view),
      edit: isFull ? true : Boolean(p.edit),
      full: isFull,
      manage_folders: isFull ? true : Boolean(p.manage_folders),
    });
  };
  const handleUpdatePermissions = async () => {
    if (!canUserFullAccess()) {
      showToast("Permission Denied: Full access permission required to alter permissions.", "warning");
      return;
    }
    if (!editingUser) return;
    setIsUpdatingPermissions(true);
    try {
      const res = await apiFetch(`/api/admin/user/${editingUser.user_id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: editPermissions })
      });
      if (res.ok) {
        showToast('Permissions updated successfully!', 'success');
        setEditingUser(null);
        const resUsers = await apiFetch(`/api/users?t=${Date.now()}`);
        if (resUsers.ok) setAccounts(await resUsers.json());
      } else {
        const data = await res.json();
        showToast('Error: ' + data.error, 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to update permissions.', 'error');
    }
    setIsUpdatingPermissions(false);
  };

  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const handlePromptDelete = (user) => {
    if (!user) return;
    if (user.username?.toLowerCase() === 'admin') {
      showToast('The primary root system "admin" account cannot be deleted.', 'warning');
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const res = await apiFetch(`/api/admin/user/${userToDelete.user_id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Account "${userToDelete.username}" deleted successfully!`, 'success');
        setUserToDelete(null);
        // Refresh account list and live stats
        const resUsers = await apiFetch(`/api/users?t=${Date.now()}`);
        if (resUsers.ok) {
          const uData = await resUsers.json();
          if (Array.isArray(uData)) setAccounts(uData);
        }
        fetchData();
      } else {
        showToast(data.error || 'Failed to delete account.', 'error');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      showToast('Network error while deleting account.', 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const fetchData = async () => {
    setLoadingStats(true);
    try {
      // 1. Try unified stats endpoint
      try {
        const resQuick = await apiFetch('/api/admin/quick-stats');
        if (resQuick.ok) {
          const qData = await resQuick.json();
          if (qData) {
            if (Array.isArray(qData.players?.list)) setPlayers(qData.players.list);
            if (Array.isArray(qData.teams?.list)) setTeams(qData.teams.list);
            if (Array.isArray(qData.tournaments?.list)) setTournaments(qData.tournaments.list);
            if (Array.isArray(qData.verifications?.list)) setReports(qData.verifications.list);
            if (Array.isArray(qData.admins?.list)) {
              setAdminsList(qData.admins.list);
              setAccounts(qData.admins.list);
            }
          }
        }
      } catch (err) {
        // Fallback gracefully
      }

      // 2. Teams
      const resTeams = await apiFetch('/api/teams');
      if (resTeams.ok) {
        const tData = await resTeams.json();
        if (Array.isArray(tData)) setTeams(tData);
      }

      // 3. Users / Admins
      const resUsers = await apiFetch(`/api/users?t=${Date.now()}`);
      if (resUsers.ok) {
        const uData = await resUsers.json();
        if (Array.isArray(uData)) setAccounts(uData);
      }
      const resAdmins = await apiFetch('/api/settings/admins');
      if (resAdmins.ok) {
        const aData = await resAdmins.json();
        if (Array.isArray(aData)) setAdminsList(aData);
      }

      // 4. Tournaments
      const resTournaments = await apiFetch('/api/tournaments');
      if (resTournaments.ok) {
        const trData = await resTournaments.json();
        if (Array.isArray(trData)) setTournaments(trData);
      }
      const resDashTourns = await apiFetch('/api/tournaments-dashboard');
      if (resDashTourns.ok) {
        const dtData = await resDashTourns.json();
        if (Array.isArray(dtData)) setDashboardTournaments(dtData);
      }

      // 5. Players
      const resPlayers = await apiFetch('/api/players?all=true');
      if (resPlayers.ok) {
        const pData = await resPlayers.json();
        if (Array.isArray(pData) && pData.length > 0) setPlayers(pData);
      }

      // 6. Reports / Verifications
      const resReports = await apiFetch('/api/settings/reports');
      if (resReports.ok) {
        const rData = await resReports.json();
        if (Array.isArray(rData)) setReports(rData);
      }

      fetchFormulas();
      setLastStatsSync(new Date());
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const totalPlayersCount = players.length;
  const totalTeamsCount = teams.length;
  const activeTournamentsCount = (dashboardTournaments.length > 0 ? dashboardTournaments.length : tournaments.length);
  const pendingReportsCount = reports.filter(r => (r.status || '').toLowerCase() === 'pending').length;
  const totalReportsCount = reports.length;
  const totalAdminsCount = (accounts.length > 0 ? accounts.length : adminsList.length);

  const filteredPlayers = players.filter(p => {
    const q = (statsSearch || '').toLowerCase();
    const name = (p.player_name || '').toLowerCase();
    const role = (p.role_in_game || '').toLowerCase();
    const team = (p.teams?.team_name || '').toLowerCase();
    return name.includes(q) || role.includes(q) || team.includes(q);
  });

  const filteredTeams = teams.filter(t => {
    const q = (statsSearch || '').toLowerCase();
    const name = (t.team_name || '').toLowerCase();
    const tourney = (t.tournament_name || '').toLowerCase();
    return name.includes(q) || tourney.includes(q);
  });

  const displayTournaments = dashboardTournaments.length > 0 ? dashboardTournaments : tournaments.map(t => ({
    name: t.name,
    game_title: t.game || 'VALORANT',
    format: 'Standard',
    status: 'ACTIVE',
    date: t.created_at
  }));

  const filteredTournaments = displayTournaments.filter(t => {
    const q = (statsSearch || '').toLowerCase();
    const name = (t.name || '').toLowerCase();
    const game = (t.game_title || '').toLowerCase();
    const status = (t.status || '').toLowerCase();
    return name.includes(q) || game.includes(q) || status.includes(q);
  });

  const filteredReports = reports.filter(r => {
    const q = (statsSearch || '').toLowerCase();
    const reporter = (r.reporter || '').toLowerCase();
    const reported = (r.reported || '').toLowerCase();
    const reason = (r.reason || '').toLowerCase();
    const statement = (r.statement || '').toLowerCase();
    const status = (r.status || '').toLowerCase();
    return reporter.includes(q) || reported.includes(q) || reason.includes(q) || statement.includes(q) || status.includes(q);
  });

  if (!hasAccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-bg-100 min-h-screen">
        <div className="border border-red-500/30 bg-slate-900/60 rounded-2xl p-10 text-center animate-fade-in shadow-2xl backdrop-blur-sm max-w-md w-full">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <LockIcon />
          </div>
          <h2 className="text-xl font-black text-theme-text-base mb-2 uppercase tracking-[0.16em]">Access Restricted</h2>
          <p className="text-xs text-theme-text-muted leading-relaxed">
            This module is restricted to Tournament Administrators only. Tournament moderators and observers do not have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-100 text-theme-text-base flex flex-col min-h-full relative font-sans custom-scrollbar">
      {/* Upper-Right System Toast Notification */}
      {toast && (
        <div 
          className="fixed top-6 right-6 z-[99999] max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-200 flex items-start gap-3.5 p-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all"
          style={{
            backgroundColor: toast.type === 'error' 
              ? 'rgba(127, 29, 29, 0.95)' 
              : toast.type === 'warning' 
              ? 'rgba(120, 53, 15, 0.95)'
              : toast.type === 'success' 
              ? 'rgba(6, 78, 59, 0.95)' 
              : 'rgba(15, 23, 42, 0.95)',
            borderColor: toast.type === 'error'
              ? 'rgba(239, 68, 68, 0.6)'
              : toast.type === 'warning'
              ? 'rgba(245, 158, 11, 0.6)'
              : toast.type === 'success'
              ? 'rgba(16, 185, 129, 0.6)'
              : 'rgba(56, 189, 248, 0.5)',
            color: '#ffffff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'error' ? (
              <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : toast.type === 'warning' ? (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : toast.type === 'success' ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 pr-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-0.5">
              {toast.type === 'error' ? 'Security Action' : toast.type === 'warning' ? 'Access Restricted' : toast.type === 'success' ? 'Success' : 'System Notice'}
            </div>
            <div className="text-xs text-white leading-relaxed font-medium">
              {toast.message}
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setToast(null)} 
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
            title="Dismiss notification"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
      {}
      <div className="flex-1 pb-16 flex flex-col items-center w-full max-w-full overflow-x-hidden px-3 sm:px-6 md:px-8 py-4 sm:py-7">
        <div className="w-full max-w-[1440px] flex flex-col gap-6 overflow-x-hidden min-w-0 max-w-full">
          {/* Active Folder Tactical Banner */}
          {activeTournamentObj && (
            <div className="hud-card hud-enter rounded-xl w-full max-w-full flex flex-wrap items-center justify-between gap-3 bg-slate-900/65 p-3.5 sm:p-5">
              <div className="flex items-center gap-3.5">
                <span className="hud-diamond" />
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-tactical text-xs font-extrabold text-theme-text-muted uppercase tracking-[0.2em]">Active Folder //</span>
                  <span className="font-tactical text-cyan-400 font-extrabold text-lg md:text-xl tracking-[0.14em] uppercase">{activeTournamentObj.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-tactical text-[11px] text-theme-text-muted font-bold uppercase tracking-[0.18em]">Game Title:</span>
                <div className="relative">
                  <select 
                    value={activeTournamentObj.game.toUpperCase()} 
                    onChange={(e) => handleUpdateFolderGame(e.target.value)}
                    className="hud-chamfer-sm appearance-none bg-slate-950/90 border border-cyan-500/40 hover:border-cyan-400 font-tactical text-cyan-300 text-xs font-extrabold tracking-[0.14em] focus:outline-none cursor-pointer transition-colors"
                    style={{ padding: "8px 38px 8px 16px" }}
                  >
                    <option value="VALORANT" className="bg-slate-900">VALORANT</option>
                    <option value="CROSSFIRE" className="bg-slate-900">CROSSFIRE</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-tactical text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)] ml-auto"
                    title="Logout Admin Session"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>LOGOUT</span>
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Tactical Sub-Navigation Tabs */}
          <div className="flex justify-center items-center gap-3 flex-wrap">
            <div 
              className="flex flex-wrap items-center justify-center bg-slate-950/80 border border-cyan-500/20 hud-chamfer shadow-xl backdrop-blur-md max-w-full p-1 gap-1 sm:gap-1.5"
            >
              {[
                {
                  id: 'League Quick Stats',
                  label: 'League Quick Stats',
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
                ...(canUserFullAccess() ? [{
                  id: 'Admin Accounts & User Directory',
                  label: 'Admin Accounts & User Directory',
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )
                }] : []),
                {
                  id: 'Rulebook Viewer',
                  label: 'Rulebook Viewer',
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )
                }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`hud-chamfer-sm flex items-center justify-center font-tactical text-[10px] sm:text-xs font-extrabold tracking-wider sm:tracking-[0.14em] uppercase transition-all duration-200 cursor-pointer px-3 sm:px-5 py-2 sm:py-2.5 gap-1.5 sm:gap-2 text-center max-w-full ${
                      isActive
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_18px_rgba(0,229,255,0.45)]'
                        : 'text-theme-text-muted hover:text-white hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <span className={isActive ? "text-slate-950" : "text-cyan-400/70"}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            {onLogout && !activeTournamentObj && (
              <button
                type="button"
                onClick={onLogout}
                className="sm:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-tactical text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                title="Logout Admin Session"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>LOGOUT</span>
              </button>
            )}
          </div>

          {activeTab === 'League Quick Stats' && (
            <div className="hud-card hud-enter hud-delay-1 rounded-xl shadow-xl overflow-hidden flex flex-col w-full max-w-full">
              <div className="border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between p-3.5 sm:p-5 gap-3 sm:gap-4">
                 <div className="flex items-center gap-2.5 flex-wrap">
                   <span className="hud-diamond shrink-0" />
                   <h2 className="font-tactical text-sm sm:text-base font-extrabold text-theme-text-base tracking-[0.16em] uppercase">
                     League Quick Stats <span className="text-cyan-400/80 text-[10px] sm:text-xs">// PH LOCAL CONTEXT</span>
                   </h2>
                   <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 hud-chamfer-sm bg-cyan-500/10 border border-cyan-500/30 font-tactical text-cyan-300 text-[10px] font-bold tracking-widest uppercase">
                     <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                     Live Sync Active
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                   {lastStatsSync && (
                     <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                       SYNC // {lastStatsSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                     </span>
                   )}
                   <button
                     onClick={fetchData}
                     disabled={loadingStats}
                     className="hud-btn-secondary flex items-center gap-2 font-tactical text-xs font-extrabold tracking-[0.14em] uppercase disabled:opacity-50 cursor-pointer px-3.5 py-2"
                     title="Refresh stats from database"
                   >
                     <RefreshIcon className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                     <span>{loadingStats ? 'Syncing...' : 'Sync Live Stats'}</span>
                   </button>
                 </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 flex-1 p-3.5 sm:p-6 gap-4 sm:gap-5">
                 {/* Card 1: Total Registered Players */}
                 <div 
                   onClick={() => { setStatsModal('players'); setStatsSearch(''); }}
                   className="hud-card hud-card-interactive rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer group relative overflow-hidden"
                 >
                    <div className="hud-sweep-overlay" />
                    <span className="font-tactical text-xs font-extrabold tracking-[0.18em] uppercase text-theme-text-base mb-3 text-center group-hover:text-cyan-300 transition-colors">
                      Total Registered Players
                    </span>
                    <div className="flex items-center gap-4 mb-2">
                       <div className="hud-chamfer-sm bg-cyan-500/10 border border-cyan-400/25 p-3 group-hover:scale-110 transition-transform duration-200">
                         <UsersIcon />
                       </div>
                       <div className="flex flex-col">
                         <AnimatedAdminNumber value={totalPlayersCount} isLoading={loadingStats} />
                         <span className="font-tactical text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[0.18em]">Players</span>
                       </div>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 text-center">Verified (PH: 100%)</span>
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity font-tactical text-[10px] text-cyan-400 font-bold uppercase tracking-[0.14em] flex items-center gap-1 mt-2">
                      Click to inspect player directory →
                    </span>
                 </div>

                 {/* Card 2: Total Teams */}
                 <div 
                   onClick={() => { setStatsModal('teams'); setStatsSearch(''); }}
                   className="hud-card hud-card-interactive rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer group relative overflow-hidden"
                 >
                    <div className="hud-sweep-overlay" />
                    <span className="font-tactical text-xs font-extrabold tracking-[0.18em] uppercase text-theme-text-base mb-3 text-center group-hover:text-cyan-300 transition-colors">
                      Total Teams
                    </span>
                    <div className="flex items-center gap-4 mb-2">
                       <div className="hud-chamfer-sm bg-cyan-500/10 border border-cyan-400/25 p-3 group-hover:scale-110 transition-transform duration-200">
                         <TrophyIcon />
                       </div>
                       <div className="flex flex-col">
                         <AnimatedAdminNumber value={totalTeamsCount} isLoading={loadingStats} />
                         <span className="font-tactical text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[0.18em]">Teams</span>
                       </div>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 text-center">Active Teams (Local Leagues)</span>
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity font-tactical text-[10px] text-cyan-400 font-bold uppercase tracking-[0.14em] flex items-center gap-1 mt-2">
                      Click to inspect teams →
                    </span>
                 </div>

                 {/* Card 3: Active Tournaments */}
                 <div 
                   onClick={() => { setStatsModal('tournaments'); setStatsSearch(''); }}
                   className="hud-card hud-card-interactive rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer group relative overflow-hidden"
                 >
                    <div className="hud-sweep-overlay" />
                    <span className="font-tactical text-xs font-extrabold tracking-[0.18em] uppercase text-theme-text-base mb-3 text-center group-hover:text-cyan-300 transition-colors">
                      Active Tournaments
                    </span>
                    <div className="flex items-center gap-4 mb-2">
                       <div className="hud-chamfer-sm bg-cyan-500/10 border border-cyan-400/25 p-3 group-hover:scale-110 transition-transform duration-200">
                         <CalendarIcon />
                       </div>
                       <div className="flex flex-col">
                         <AnimatedAdminNumber value={activeTournamentsCount} isLoading={loadingStats} />
                         <span className="font-tactical text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[0.18em]">Tournaments</span>
                       </div>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 text-center">Ongoing (Metro Manila, Cebu, etc.)</span>
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity font-tactical text-[10px] text-cyan-400 font-bold uppercase tracking-[0.14em] flex items-center gap-1 mt-2">
                      Click to inspect tournaments →
                    </span>
                 </div>

                 {/* Card 4: Pending Verifications */}
                 <div 
                   onClick={() => { setStatsModal('reports'); setStatsSearch(''); }}
                   className="hud-card hud-card-interactive rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer group relative overflow-hidden"
                 >
                    <div className="hud-sweep-overlay" />
                    <span className="font-tactical text-xs font-extrabold tracking-[0.18em] uppercase text-theme-text-base mb-3 text-center group-hover:text-cyan-300 transition-colors">
                      Pending Verifications
                    </span>
                    <div className="flex items-center gap-4 mb-2">
                       <div className="hud-chamfer-sm bg-cyan-500/10 border border-cyan-400/25 p-3 group-hover:scale-110 transition-transform duration-200">
                         <ClipboardCheckIcon />
                       </div>
                       <div className="flex flex-col">
                         <AnimatedAdminNumber value={pendingReportsCount > 0 ? pendingReportsCount : totalReportsCount} isLoading={loadingStats} />
                         <span className="font-tactical text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[0.18em]">Verifications</span>
                       </div>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 text-center">
                      {totalReportsCount > 0 ? `${totalReportsCount} Reports (${pendingReportsCount} Pending Review)` : 'New Player IDs to review'}
                    </span>
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity font-tactical text-[10px] text-cyan-400 font-bold uppercase tracking-[0.14em] flex items-center gap-1 mt-2">
                      Click to review reports &amp; verifications →
                    </span>
                 </div>

                 {/* Card 5: New Admin Logins */}
                 <div 
                   onClick={() => setActiveTab('Admin Accounts & User Directory')}
                   className="md:col-span-2 hud-card hud-card-interactive rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer group relative overflow-hidden"
                 >
                    <div className="hud-sweep-overlay" />
                    <span className="font-tactical text-xs font-extrabold tracking-[0.18em] uppercase text-theme-text-base mb-3 text-center group-hover:text-cyan-300 transition-colors">
                      New Admin Logins
                    </span>
                    <div className="flex items-center gap-4 mb-2">
                       <div className="hud-chamfer-sm bg-cyan-500/10 border border-cyan-400/25 p-3 group-hover:scale-110 transition-transform duration-200">
                         <LockIcon />
                       </div>
                       <div className="flex flex-col">
                         <AnimatedAdminNumber value={totalAdminsCount} isLoading={loadingStats} />
                         <span className="font-tactical text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[0.18em]">Admins</span>
                       </div>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 text-center">Admins (Central &amp; Local PH)</span>
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity font-tactical text-[10px] text-cyan-400 font-bold uppercase tracking-[0.14em] flex items-center gap-1 mt-2">
                      Open Admin Accounts &amp; Directory Tab →
                    </span>
                 </div>
               </div>
            </div>
          )}
          {activeTab === 'Admin Accounts & User Directory' && (
            <div className="hud-card hud-enter rounded-xl shadow-xl overflow-hidden flex flex-col">
              <div className="border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap justify-between items-center p-3.5 sm:p-5 gap-3.5 sm:gap-5">
                 <div className="flex items-center gap-3 flex-shrink-0">
                   <span className="hud-diamond" />
                   <div className="flex flex-col">
                     <h2 className="font-tactical text-base font-extrabold text-theme-text-base tracking-[0.16em] uppercase">Admin Accounts &amp; User Directory</h2>
                     <span className="text-[10px] text-cyan-400/70 font-mono uppercase tracking-widest">// SYSTEM ACCESS HUB</span>
                   </div>
                 </div>
                 <div className="flex items-center flex-wrap" style={{ gap: "12px" }}>
                    <div className="relative flex-1 min-w-[180px] sm:w-[260px] sm:flex-initial">
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: "12px" }}>
                        <SearchIcon />
                      </div>
                      <input 
                        type="text" 
                        value={accountSearch}
                        onChange={(e) => setAccountSearch(e.target.value)}
                        placeholder="Search username or role..." 
                        className="hud-chamfer-sm w-full bg-slate-950/80 border border-slate-700/70 text-theme-text-base text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                        style={{ padding: "9px 14px 9px 38px" }}
                      />
                    </div>
                    <div className="flex-1 min-w-[160px] sm:w-[210px] sm:flex-initial">
                      <SelectDropdown
                        options={['All Roles', 'Super Admin', 'Tournament Admin', 'Tournament Mod', 'Observer', 'Standard Admin']}
                        value={accountRoleFilter}
                        onChange={(e) => setAccountRoleFilter(e.target.value)}
                      />
                    </div>
                 </div>
              </div>
              <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar w-full max-w-full">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 font-tactical text-[11px] uppercase tracking-[0.18em] text-cyan-400/80 sticky top-0 shadow-sm z-10 border-b border-slate-800">
                    <tr>
                      <th className="font-bold w-1/4" style={{ padding: "18px 26px" }}>Username</th>
                      <th className="font-bold" style={{ padding: "18px 26px" }}>Role</th>
                      <th className="font-bold" style={{ padding: "18px 26px" }}>Super Admin</th>
                      <th className="font-bold" style={{ padding: "18px 26px" }}>Permissions</th>
                      <th className="font-bold text-center w-24" style={{ padding: "18px 26px" }}>Active</th>
                      <th className="font-bold text-center w-28" style={{ padding: "18px 26px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {(() => {
                      const filteredAccounts = accounts.filter((user) => {
                        const uRole = (user.role || '').toLowerCase();
                        if (accountRoleFilter === 'Super Admin' && !user.is_super_admin && uRole !== 'super admin') return false;
                        if (accountRoleFilter === 'Tournament Admin' && !uRole.includes('tournament admin')) return false;
                        if (accountRoleFilter === 'Tournament Mod' && !uRole.includes('mod')) return false;
                        if (accountRoleFilter === 'Observer' && !uRole.includes('observer')) return false;
                        if (accountRoleFilter === 'Standard Admin' && (user.is_super_admin || uRole === 'super admin')) return false;
                        if (accountSearch.trim()) {
                          const q = accountSearch.toLowerCase();
                          const matchName = (user.username || '').toLowerCase().includes(q);
                          const matchRole = uRole.includes(q);
                          return matchName || matchRole;
                        }
                        return true;
                      });
                      if (filteredAccounts.length === 0) {
                        return (
                          <tr>
                            <td colSpan="6" className="text-center py-10 text-theme-text-muted font-tactical tracking-widest uppercase text-xs">
                              No matching admin accounts found.
                            </td>
                          </tr>
                        );
                      }
                      return filteredAccounts.map((user, idx) => (
                        <tr key={idx} onClick={() => handleOpenEdit(user)} className="hover:bg-cyan-500/[0.05] transition-colors cursor-pointer group">
                          <td className="text-theme-text-base font-bold group-hover:text-cyan-300" style={{ padding: "18px 26px" }}>
                             <div className="flex flex-col gap-0.5">
                               <span>{user.username}</span>
                               <span className={`text-[9px] text-cyan-400/70 font-mono transition-opacity duration-200 ${!user.is_super_admin ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                 Click to configure access →
                               </span>
                             </div>
                          </td>
                          <td className="text-slate-300 font-semibold" style={{ padding: "18px 26px" }}>{user.role || 'N/A'}</td>
                          <td className="text-theme-text-muted" style={{ padding: "18px 26px" }}>
                             {user.is_super_admin ? (
                               <span className="hud-chamfer-sm bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-tactical text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ padding: "5px 16px" }}>Yes</span>
                             ) : (
                               <span className="hud-chamfer-sm bg-slate-800/80 text-slate-400 font-tactical text-[10px] font-extrabold uppercase tracking-[0.14em] border border-slate-700" style={{ padding: "5px 16px" }}>No</span>
                             )}
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {[
                                {
                                  key: 'view',
                                  label: 'View',
                                  activeStyle: 'bg-blue-500/15 border-blue-500/40 text-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.18)]',
                                  activeBadge: 'bg-blue-500 text-slate-950',
                                },
                                {
                                  key: 'edit',
                                  label: 'Edit',
                                  activeStyle: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.18)]',
                                  activeBadge: 'bg-emerald-500 text-slate-950',
                                },
                                {
                                  key: 'full',
                                  label: 'Full',
                                  activeStyle: 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.22)]',
                                  activeBadge: 'bg-purple-500 text-slate-950',
                                },
                                {
                                  key: 'manage_folders',
                                  label: 'Folders',
                                  activeStyle: 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.18)]',
                                  activeBadge: 'bg-amber-500 text-slate-950',
                                },
                              ].map((box) => {
                                const isSuper = Boolean(user.is_super_admin || user.role === 'Super Admin');
                                const hasFull = isSuper || Boolean(user.permissions?.full);
                                const isGranted = box.key === 'full'
                                  ? hasFull
                                  : (isSuper || hasFull || Boolean(user.permissions?.[box.key]));

                                return (
                                  <div
                                    key={box.key}
                                    title={`${box.label}: ${isGranted ? 'Permission Granted' : 'No Permission'}`}
                                    className={`hud-chamfer-sm inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-tactical font-black uppercase tracking-wider border transition-all ${
                                      isGranted
                                        ? box.activeStyle
                                        : 'bg-slate-900/60 border-slate-800 text-slate-500/60 opacity-40'
                                    }`}
                                  >
                                    <span
                                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-black shrink-0 transition-colors ${
                                        isGranted
                                          ? box.activeBadge
                                          : 'bg-slate-800 text-slate-600'
                                      }`}
                                    >
                                      {isGranted ? (
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                      ) : (
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      )}
                                    </span>
                                    <span>{box.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="text-center" style={{ padding: "18px 26px" }}>
                            <div className="flex items-center justify-center w-full h-full">
                              <svg className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            </div>
                          </td>
                          <td className="text-center" style={{ padding: "14px 20px" }} onClick={(e) => e.stopPropagation()}>
                            {user.username?.toLowerCase() === 'admin' ? (
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded inline-block">
                                Protected
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePromptDelete(user);
                                }}
                                className="hud-chamfer-sm inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-tactical font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/60 transition-all cursor-pointer group/del shadow-sm hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                title={`Delete ${user.username}`}
                              >
                                <TrashIcon className="w-3.5 h-3.5 text-red-400 group-hover/del:scale-110 transition-transform" />
                                <span>Delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-800/80 bg-slate-900/50 flex justify-between items-center" style={{ padding: "18px 26px" }}>
                 <div className="flex items-center gap-3 font-tactical font-extrabold text-xl italic tracking-wider text-orange-500 drop-shadow-md">
                    <img 
                      src="/assets/tnc_logo.png" 
                      alt="TNC Logo" 
                      className="w-9 h-9 object-contain filter drop-shadow-[0_2px_8px_rgba(234,88,12,0.45)]"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/blaze_eagle.png';
                      }}
                    />
                    <span>TNC</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="hud-btn-primary font-tactical text-xs font-extrabold uppercase tracking-[0.16em] cursor-pointer"
                      style={{ padding: "10px 26px" }}
                    >
                      + Create Admin
                    </button>
                 </div>
              </div>
            </div>
          )}
          {activeTab === 'Rulebook Viewer' && (
            <div className="flex flex-col gap-6 w-full max-w-full animate-fade-in">
              {/* Header & Scoping HUD Card */}
              <div className="hud-card hud-enter rounded-xl shadow-xl flex flex-col gap-4 p-4 sm:p-6 w-full max-w-full">
                {/* Header Bar */}
                <div className="border-b border-slate-800/80 pb-4 flex flex-wrap justify-between items-center gap-4 max-w-full">
                  <div className="min-w-0 max-w-full">
                    <div className="flex items-center gap-2.5 flex-wrap max-w-full">
                      <span className="hud-diamond shrink-0" />
                      <h2 className="font-tactical text-base sm:text-lg font-extrabold text-theme-text-base tracking-[0.16em] uppercase">
                        Rulebook Viewer
                      </h2>
                      <span className="hud-chamfer-sm inline-flex items-center gap-1.5 px-2.5 py-1 font-tactical text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.14em] bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 max-w-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="truncate">Connected to Database (public.rulebooks)</span>
                      </span>
                    </div>
                    <p className="text-xs text-theme-text-muted mt-1.5 break-words">
                      Official League Rulebook stored in Supabase Cloud Storage &amp; PostgreSQL. Synced across all player &amp; tournament screens.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap max-w-full shrink-0">
                    <button
                      type="button"
                      onClick={fetchRulebook}
                      disabled={rulebookLoading}
                      className="hud-btn-secondary flex items-center gap-2 font-tactical text-[11px] sm:text-xs font-extrabold tracking-[0.14em] uppercase cursor-pointer px-3.5 sm:px-4 py-2"
                      title="Refresh database records"
                    >
                      <RefreshIcon className={`w-3.5 h-3.5 ${rulebookLoading ? 'animate-spin text-cyan-400' : ''}`} />
                      <span>Refresh DB</span>
                    </button>
                    <label className="hud-btn-primary font-tactical text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.14em] cursor-pointer flex items-center gap-2 px-3.5 sm:px-4 py-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>{isUploadingRulebook ? 'Uploading to DB...' : 'Upload New Rulebook'}</span>
                      <input type="file" className="hidden" accept="application/pdf,image/*" onChange={handleRulebookUpload} disabled={isUploadingRulebook} />
                    </label>
                  </div>
                </div>

                {/* Tournament Scoping Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-cyan-500/25 p-3.5 sm:px-5 sm:py-3.5 rounded-xl shadow-inner max-w-full">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap max-w-full w-full sm:w-auto min-w-0">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 shrink-0">
                      <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      Managing Rulebook For:
                    </span>
                    <select
                      value={rulebookTournament}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRulebookTournament(val);
                        fetchRulebook(val);
                      }}
                      className="bg-slate-950 border border-cyan-500/40 text-cyan-400 font-tactical font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm max-w-full w-full sm:w-auto min-w-0"
                    >
                      {tournaments.map((t) => (
                        <option key={t.id || t.name} value={t.name} className="bg-[#0b1017] text-white">
                          {t.name} ({t.game || 'Tournament'})
                        </option>
                      ))}
                      {tournaments.length === 0 && (
                        <option value={globalTournament || 'Default'} className="bg-[#0b1017] text-white">
                          {globalTournament || 'Default'}
                        </option>
                      )}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 max-w-full break-words">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    <span>Rulebooks strictly stay in <strong className="text-cyan-300 font-mono">{rulebookTournament || 'this tournament'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Active Rulebook Details Card */}
              {rulebookUrl ? (
                <>
                  <div className="hud-card hud-enter rounded-xl shadow-xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 sm:gap-6 border-l-4 border-l-cyan-400 relative overflow-hidden max-w-full">
                    <div className="flex items-center gap-3 sm:gap-5 min-w-0 max-w-full">
                      <div className="hud-chamfer-sm flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-inner">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex flex-col gap-1.5 min-w-0 max-w-full">
                        <div className="flex items-center gap-2 flex-wrap max-w-full">
                          <span className="font-tactical text-sm sm:text-base font-extrabold uppercase tracking-wider text-theme-text-base">
                            Official League Rulebook
                          </span>
                          <span className="hud-chamfer-sm px-2.5 py-0.5 font-tactical text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 truncate max-w-full">
                            Tournament: {rulebookRecord?.tournament_name || rulebookTournament}
                          </span>
                          <span className="hud-chamfer-sm px-2.5 py-0.5 font-tactical text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700 shrink-0">
                            DB Record #{rulebookRecord?.id || 'Active'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-theme-text-faint font-mono flex-wrap">
                          <span className="truncate max-w-md text-slate-300">{rulebookUrl.split('/').pop()}</span>
                          <span>•</span>
                          <span>{rulebookRecord?.created_at ? new Date(rulebookRecord.created_at).toLocaleString() : 'Active'}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">Supabase Cloud CDN Verified</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowRulebookPreview(!showRulebookPreview)}
                        className={`font-tactical text-xs font-extrabold uppercase tracking-wider transition-all px-4 py-2.5 cursor-pointer ${
                          showRulebookPreview ? 'hud-btn-primary' : 'hud-btn-secondary'
                        }`}
                      >
                        {showRulebookPreview ? 'Hide Inline Preview' : 'Show Inline Preview'}
                      </button>
                      <a
                        href={rulebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hud-btn-secondary font-tactical text-xs font-extrabold uppercase tracking-wider whitespace-nowrap flex items-center gap-2 px-4 py-2.5 cursor-pointer"
                      >
                        <span>Open PDF in Browser</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <a
                        href={rulebookUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hud-btn-secondary font-tactical text-xs font-extrabold uppercase tracking-wider whitespace-nowrap px-4 py-2.5 cursor-pointer"
                      >
                        Download
                      </a>
                    </div>
                  </div>

                  {/* Inline PDF Preview Frame */}
                  {showRulebookPreview && (
                    <div className="hud-card hud-enter rounded-xl shadow-2xl p-3 sm:p-4 flex flex-col gap-3 w-full max-w-full">
                      <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800/80 flex-wrap gap-2">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 font-tactical">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          Live Document Preview ({rulebookRecord?.tournament_name || rulebookTournament})
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Use PDF controls to scroll, zoom, or print</span>
                          <a
                            href={rulebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-tactical uppercase tracking-wider flex items-center gap-1 font-bold"
                          >
                            <span>Full Window</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                      <iframe
                        src={rulebookUrl}
                        title="Official League Rulebook Preview"
                        className="w-full h-[74vh] min-h-[520px] max-h-[880px] rounded-lg border border-slate-800/80 bg-slate-950 shadow-inner"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="hud-card rounded-xl p-12 flex flex-col items-center justify-center text-center gap-4 bg-slate-950/60 border border-slate-800">
                  <div className="hud-chamfer-sm w-16 h-16 bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-tactical text-base sm:text-lg font-extrabold uppercase text-white tracking-[0.16em]">
                      No Rulebook Uploaded for "{rulebookTournament || 'This Tournament'}"
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                      Rulebooks are isolated per tournament. Click the <strong>Upload New Rulebook</strong> button above to publish a PDF strictly for {rulebookTournament || 'this tournament'}.
                    </p>
                  </div>
                </div>
              )}

              {/* Database Records Archive Table */}
              {allRulebooks.length > 0 && (
                <div className="hud-card rounded-xl shadow-xl p-4 sm:p-6 flex flex-col gap-4 w-full max-w-full">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="hud-diamond" />
                      <h3 className="font-tactical text-xs sm:text-sm font-extrabold uppercase tracking-[0.18em] text-theme-text-base">
                        Database Records History ({allRulebooks.length})
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400/80 font-bold uppercase tracking-wider">
                      Table // public.rulebooks
                    </span>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar border border-slate-800/80 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950 text-cyan-400/90 uppercase font-tactical font-extrabold text-[10px] tracking-[0.16em]">
                          <th className="py-3.5 px-4">Record ID</th>
                          <th className="py-3.5 px-4">Assigned Tournament</th>
                          <th className="py-3.5 px-4">File Name / Path</th>
                          <th className="py-3.5 px-4">Date Uploaded</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-theme-text-base">
                        {allRulebooks.map((rb) => {
                          const isActive = rulebookRecord?.id === rb.id;
                          const cdnUrl = rb.file_url?.startsWith('http') ? rb.file_url : `${window.location.origin}${rb.file_url}`;
                          return (
                            <tr key={rb.id} className={`hover:bg-cyan-500/5 transition-colors ${isActive ? 'bg-cyan-950/20' : ''}`}>
                              <td className="py-3 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                                #{rb.id} {isActive && <span className="hud-chamfer-sm ml-1.5 font-tactical text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Active</span>}
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={rb.tournament_name || 'Default'}
                                  onChange={(e) => handleAssignRulebookTournament(rb.id, e.target.value)}
                                  className="hud-chamfer-sm bg-slate-950 border border-cyan-500/35 hover:border-cyan-400 text-cyan-300 font-tactical text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 focus:outline-none cursor-pointer"
                                  title="Change assigned tournament"
                                >
                                  <option value="Default" className="bg-[#0d1420] text-slate-400">Default (Unassigned)</option>
                                  {tournaments.map((t) => (
                                    <option key={t.id || t.name} value={t.name} className="bg-[#0d1420] text-white">
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">{rb.file_url?.split('/').pop()}</td>
                              <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{rb.created_at ? new Date(rb.created_at).toLocaleString() : 'N/A'}</td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRulebookRecord(rb);
                                      setRulebookUrl(cdnUrl);
                                      setShowRulebookPreview(true);
                                      if (rb.tournament_name && rb.tournament_name !== 'Default') {
                                        setRulebookTournament(rb.tournament_name);
                                      }
                                    }}
                                    className="hud-btn-secondary px-3 py-1.5 font-tactical text-[10px] font-extrabold uppercase tracking-[0.14em] cursor-pointer"
                                  >
                                    Preview
                                  </button>
                                  <a
                                    href={cdnUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hud-btn-secondary px-3 py-1.5 font-tactical text-[10px] font-extrabold uppercase tracking-[0.14em] inline-flex items-center cursor-pointer"
                                  >
                                    Open
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRulebook(rb.id)}
                                    className="hud-chamfer-sm px-3 py-1.5 font-tactical text-[10px] font-extrabold uppercase tracking-[0.14em] bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 border-l-2 border-l-red-500 transition-all cursor-pointer"
                                    title="Delete from database"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}



        </div>
      </div>
      {}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <style>{`
            .formal-admin-input:-webkit-autofill,
            .formal-admin-input:-webkit-autofill:hover, 
            .formal-admin-input:-webkit-autofill:focus, 
            .formal-admin-input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 1000px #0b111a inset !important;
              -webkit-text-fill-color: #f8fafc !important;
              transition: background-color 5000s ease-in-out 0s;
            }
          `}</style>
          <div 
            className="w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col overflow-hidden relative max-h-[92vh]"
            style={{ backgroundColor: '#131b26', borderColor: '#26354a' }}
          >
            {/* Modal Header */}
            <div 
              className="px-8 py-5 border-b flex items-center justify-between"
              style={{ backgroundColor: '#101721', borderColor: '#1f2c3f' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center p-2 border shadow-sm shrink-0"
                  style={{ backgroundColor: '#0d1522', borderColor: '#26354a' }}
                >
                  <img 
                    src="/assets/tnc_logo.png" 
                    alt="TNC Logo" 
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,88,12,0.35)]"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/blaze_eagle.png';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 tracking-tight">Create Administrator Account</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Provision a verified administrator profile and configure access permissions.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={resetCreateModal} 
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative">
              {/* Hidden dummy inputs to divert aggressive browser credential autofill */}
              <div 
                style={{ 
                  position: 'absolute', 
                  opacity: 0, 
                  height: 0, 
                  width: 0, 
                  pointerEvents: 'none', 
                  overflow: 'hidden',
                  zIndex: -9999
                }} 
                tabIndex={-1} 
                aria-hidden="true"
              >
                <input type="text" name="chrome_autofill_username_prevent" tabIndex={-1} autoComplete="off" />
                <input type="password" name="chrome_autofill_password_prevent" tabIndex={-1} autoComplete="new-password" />
              </div>

              {/* Inline Feedback Banner */}
              {modalFeedback && (
                <div 
                  className={`p-4 rounded-xl border flex items-start gap-3.5 text-sm ${
                    modalFeedback.type === 'error'
                      ? 'bg-red-950/30 border-red-500/40 text-red-200'
                      : modalFeedback.type === 'success'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
                  }`}
                >
                  <span className="font-semibold">{modalFeedback.type === 'error' ? 'Error:' : modalFeedback.type === 'success' ? 'Success:' : 'Notice:'}</span>
                  <div className="flex-1 text-slate-300 font-normal leading-relaxed">{modalFeedback.message}</div>
                  <button 
                    type="button"
                    onClick={() => setModalFeedback(null)} 
                    className="text-slate-400 hover:text-white text-xs ml-2 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Email Address Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-200">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  {emailVerificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/30">
                      ✓ Email Verified
                    </span>
                  ) : emailVerificationStatus === 'sent' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/30">
                      Code Sent
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                      Verification Required
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <input 
                    type="text"
                    inputMode="email"
                    name="admin_new_invite_email"
                    id="admin_new_invite_email"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    value={newEmail}
                    disabled={emailVerificationStatus === 'verified'}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      if (emailVerificationStatus !== 'idle') {
                        setEmailVerificationStatus('idle');
                        setVerificationCode('');
                        setDevPreviewCode('');
                        setDevPreviewUrl('');
                      }
                    }}
                    style={{
                      backgroundColor: '#0b111a',
                      color: '#f8fafc',
                      borderColor: '#26354a',
                      borderRadius: '10px'
                    }}
                    className="formal-admin-input flex-1 border text-sm px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed placeholder:text-slate-500 shadow-inner"
                    placeholder=""
                  />

                  {emailVerificationStatus === 'verified' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEmailVerificationStatus('idle');
                        setVerificationCode('');
                        setModalFeedback({ type: 'info', message: 'Enter a new email address to verify.' });
                      }}
                      className="hud-btn-secondary px-5 py-3 text-xs font-tactical font-extrabold uppercase tracking-wider whitespace-nowrap"
                    >
                      Change Email
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={emailVerificationStatus === 'sending' || !newEmail || resendCooldown > 0}
                      className="hud-btn-primary px-6 py-3 text-xs font-tactical font-extrabold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                    >
                      {emailVerificationStatus === 'sending' ? (
                        <span>Sending...</span>
                      ) : resendCooldown > 0 ? (
                        <span>Resend ({resendCooldown}s)</span>
                      ) : (
                        <span>{emailVerificationStatus === 'sent' ? 'Resend Code' : 'Send Verification Code'}</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Verification Code Box (Visible when code was sent and not yet verified) */}
                {emailVerificationStatus !== 'idle' && emailVerificationStatus !== 'verified' && (
                  <div 
                    className="mt-3 rounded-xl p-5 flex flex-col gap-3.5 border"
                    style={{ backgroundColor: '#0d1522', borderColor: '#203046' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-100">Email Verification Code</span>
                      <span className="text-xs text-slate-400">Valid for 10 minutes</span>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      Please enter the 6-digit confirmation code dispatched to <strong className="text-white font-mono">{newEmail}</strong>.
                    </p>

                    <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 rounded-lg px-4 py-2.5">
                      <span className="text-cyan-400 font-bold text-sm">✉</span>
                      <span>The single-use verification code was sent to your email. Check your inbox or spam folder.</span>
                    </div>

                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{
                          backgroundColor: '#0b111a',
                          color: '#f8fafc',
                          borderColor: '#26354a',
                          borderRadius: '10px'
                        }}
                        className="formal-admin-input flex-1 border text-center font-mono text-xl tracking-[0.35em] font-bold py-2.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                        placeholder="000000"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={emailVerificationStatus === 'verifying' || verificationCode.length !== 6}
                        className="hud-btn-primary px-6 py-2.5 text-xs font-tactical font-extrabold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {emailVerificationStatus === 'verifying' ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-200">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Generate Random Password
                  </button>
                </div>

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="admin_new_invite_pwd"
                    id="admin_new_invite_pwd"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      backgroundColor: '#0b111a',
                      color: '#f8fafc',
                      borderColor: '#26354a',
                      borderRadius: '10px'
                    }}
                    className="formal-admin-input w-full border text-sm px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 transition-colors font-mono placeholder:text-slate-500 shadow-inner"
                    placeholder="Minimum 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-200 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {newPassword && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Password complexity:</span>
                      <span className={`font-bold ${
                        getPasswordStrength(newPassword).score >= 3 ? 'text-emerald-400' :
                        getPasswordStrength(newPassword).score === 2 ? 'text-blue-400' : 'text-amber-400'
                      }`}>
                        {getPasswordStrength(newPassword).label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div 
                          key={step}
                          className={`flex-1 h-full rounded-full transition-all duration-300 ${
                            step <= getPasswordStrength(newPassword).score 
                              ? getPasswordStrength(newPassword).color 
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Role Picker Section */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold text-slate-200">
                  Administrative Role <span className="text-red-400">*</span>
                </label>

                <div className="flex flex-col gap-2.5">
                  {[
                    {
                      id: 'Super Admin',
                      name: 'Super Administrator',
                      badge: 'Full Access',
                      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                      desc: 'Unrestricted system authority, administrator management, and platform configuration.'
                    },
                    {
                      id: 'Tournament Admin',
                      name: 'Tournament Administrator',
                      badge: 'Admin Access',
                      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                      desc: 'Full administrative access to tournaments, system parameters, formulas, and rulebooks.'
                    },
                    {
                      id: 'Tournament Mod',
                      name: 'Tournament Moderator',
                      badge: 'Operations',
                      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      desc: 'Operational permissions for bracket coordination, match vetoes, scorekeeper input, and live match records.'
                    },
                    {
                      id: 'Observer',
                      name: 'League Observer',
                      badge: 'Read-Only',
                      badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
                      desc: 'Spectator and broadcast access, telemetry observation, and read-only audit logs.'
                    }
                  ].map((roleOpt) => {
                    const isSelected = newRole === roleOpt.id;
                    return (
                      <div
                        key={roleOpt.id}
                        onClick={() => setNewRole(roleOpt.id)}
                        style={{
                          backgroundColor: isSelected ? '#162436' : '#0e1520',
                          borderColor: isSelected ? '#3b82f6' : '#223042'
                        }}
                        className="px-4.5 py-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-start gap-3.5 hover:border-slate-500 hover:bg-bg-200"
                      >
                        <div className="mt-0.5">
                          <div 
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? 'border-blue-500 bg-blue-600' : 'border-slate-600 bg-transparent'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                              {roleOpt.name}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${roleOpt.badgeColor}`}>
                              {roleOpt.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {roleOpt.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="px-8 py-5 border-t flex items-center justify-between"
              style={{ backgroundColor: '#101721', borderColor: '#1f2c3f' }}
            >
              <div className="text-sm text-slate-400">
                {emailVerificationStatus !== 'verified' ? (
                  <span className="text-amber-400/90 flex items-center gap-1.5 font-medium">
                    <span>*</span> Email verification required before provisioning.
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span>✓</span> Ready to provision account.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetCreateModal}
                  disabled={isCreating}
                  className="hud-btn-secondary px-5 py-2.5 text-xs font-tactical font-extrabold uppercase tracking-wider"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateUser}
                  disabled={isCreating || emailVerificationStatus !== 'verified' || !newPassword}
                  className="hud-btn-primary px-6 py-2.5 text-xs font-tactical font-extrabold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title={emailVerificationStatus !== 'verified' ? "Please verify email first" : ""}
                >
                  {isCreating ? (
                    <>
                      <RefreshIcon className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {}
      {editingUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-300 rounded-xl border border-theme-input shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200" style={{ padding: "32px" }}>
            <button onClick={() => setEditingUser(null)} className="absolute text-theme-text-faint hover:text-theme-text-base transition-colors" style={{ top: "16px", right: "16px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center" style={{ gap: "12px", marginBottom: "24px" }}>
              <LockIcon />
              <h3 className="text-xl font-black text-theme-text-base uppercase tracking-widest">Edit Permissions</h3>
            </div>
            <div className="flex flex-col" style={{ gap: "24px" }}>
              <div className="bg-bg-300 rounded-lg border border-theme-input" style={{ padding: "16px" }}>
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest block" style={{ marginBottom: "4px" }}>User</label>
                <div className="text-cyan-400 font-bold text-base">{editingUser.username} <span className="text-theme-text-faint text-sm font-normal ml-1">({editingUser.role})</span></div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest block" style={{ marginBottom: "12px" }}>Permissions</label>
                <div className="grid grid-cols-2" style={{ gap: "12px" }}>
                   {[
                      { key: 'view', label: 'View' },
                      { key: 'edit', label: 'Edit' },
                      { key: 'full', label: 'Full' },
                      { key: 'manage_folders', label: 'Manage Folders' }
                   ].map(({ key: perm, label }) => {
                      const isChecked = !!editPermissions[perm];
                      return (
                        <label
                          key={perm}
                          className={`flex items-center cursor-pointer group bg-bg-300 rounded-lg border transition-all ${
                            isChecked ? 'border-cyan-500/70 bg-cyan-950/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]' : 'border-theme-input hover:border-cyan-500/40'
                          }`}
                          style={{ padding: "12px", gap: "12px" }}
                        >
                          <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded border transition-colors ${
                            isChecked ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-bg-300 border-gray-600 group-hover:border-gray-500'
                          }`}>
                             {isChecked && (
                               <svg className="w-3.5 h-3.5 text-[#090e14]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                               </svg>
                             )}
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (perm === 'full') {
                                if (checked) {
                                  setEditPermissions({ view: true, edit: true, full: true, manage_folders: true });
                                } else {
                                  setEditPermissions(prev => ({ ...prev, full: false }));
                                }
                              } else {
                                setEditPermissions(prev => {
                                  const updated = { ...prev, [perm]: checked };
                                  if (!checked) {
                                    updated.full = false;
                                  }
                                  return updated;
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <span className={`text-sm font-semibold transition-colors whitespace-nowrap ${
                            isChecked ? 'text-cyan-300' : 'text-theme-text-base group-hover:text-cyan-400'
                          }`}>
                            {label}
                          </span>
                        </label>
                      );
                   })}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                {editingUser.username?.toLowerCase() !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      const u = editingUser;
                      setEditingUser(null);
                      handlePromptDelete(u);
                    }}
                    className="hud-chamfer-sm px-4 py-3 font-tactical text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/40 hover:bg-red-500/20 hover:border-red-500/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                    title="Delete this account"
                  >
                    <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleUpdatePermissions}
                  disabled={isUpdatingPermissions}
                  className="hud-btn-primary flex-1 py-3.5 font-tactical text-xs font-extrabold uppercase tracking-[0.18em] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUpdatingPermissions ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="hud-card bg-slate-950 rounded-xl border border-red-500/40 shadow-[0_20px_50px_rgba(239,68,68,0.25)] w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200 p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-tactical text-base sm:text-lg font-extrabold uppercase tracking-[0.14em] text-red-400">
                  Delete Admin Account
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  Permanent Action // Irreversible
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 mb-5 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Username:</span>
                <span className="text-white font-tactical font-bold text-sm tracking-wide">{userToDelete.username}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Role:</span>
                <span className="text-cyan-400 font-bold uppercase tracking-wider">{userToDelete.role || 'Admin'}</span>
              </div>
              {userToDelete.user_id && (
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-slate-500 font-mono text-[10px]">User ID:</span>
                  <span className="text-slate-400 font-mono text-[10px] truncate max-w-[200px]">{userToDelete.user_id}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
              Are you sure you want to permanently delete account <strong className="text-white font-mono">{userToDelete.username}</strong>? This user will immediately lose all system privileges and login access.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="hud-btn-secondary px-4 py-2.5 font-tactical text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingUser}
                className="hud-chamfer-sm px-5 py-2.5 font-tactical text-xs font-extrabold uppercase tracking-[0.16em] bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingUser ? (
                  <>
                    <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <Modal isOpen={calculatorOpen} onClose={() => setCalculatorOpen(false)} title="Advanced Formula Editor" maxWidth="max-w-4xl">
        <div className="flex flex-col gap-6 p-4">
          <Select 
            label="Target Calculation" 
            options={['Performance Score Calculation', 'ACS Calculation', 'K/DA Calculation']}
            value={calcTarget === 'excel_formula' ? 'Performance Score Calculation' : calcTarget === 'acs_formula' ? 'ACS Calculation' : 'K/DA Calculation'}
            onChange={(val) => {
              const tgt = val === 'Performance Score Calculation' ? 'excel_formula' : val === 'ACS Calculation' ? 'acs_formula' : 'kda_formula';
              setCalcTarget(tgt);
              setCalcString(activeFormula[tgt] || '');
            }}
          />
          
          <textarea 
            className="w-full bg-theme-input light:bg-white rounded-lg border border-theme-input focus:border-blue-500 focus:outline-none p-4 text-theme-text-base font-mono text-lg min-h-[100px] shadow-inner resize-y transition-colors"
            placeholder="Select variables and operations or type to build formula..."
            value={calcString}
            onChange={(e) => setCalcString(e.target.value)}
          />

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3 grid grid-cols-3 gap-3">
               {['kills', 'deaths', 'assists', 'acs', 'econ', 'first_kills', 'plants', 'defuse', 'ace', 'rounds', '(', ')'].map(btn => (
                 <button key={btn} onClick={() => setCalcString(prev => prev + btn)} className="bg-bg-400 hover:bg-bg-500 text-theme-text-base py-3 rounded text-sm font-bold shadow-md transition-colors border border-theme-input">
                   {btn}
                 </button>
               ))}
               {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.'].map(btn => (
                 <button key={btn} onClick={() => setCalcString(prev => prev + btn)} className="bg-theme-input hover:bg-blue-900/30 text-theme-text-base py-3 rounded text-xl font-bold shadow-md transition-colors border border-theme-input">
                   {btn}
                 </button>
               ))}
            </div>
            <div className="flex flex-col gap-3">
               {['+', '-', '*', '/'].map(btn => (
                 <button key={btn} onClick={() => setCalcString(prev => prev + ' ' + btn + ' ')} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 py-4 rounded text-xl font-bold shadow-md border border-blue-500/30 transition-colors">
                   {btn}
                 </button>
               ))}
               <button onClick={() => setCalcString(prev => prev.slice(0, -1))} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 py-4 rounded font-bold shadow-md border border-red-500/30 transition-colors">
                 Backspace
               </button>
               <button onClick={() => setCalcString('')} className="bg-red-600 hover:bg-red-700 text-white py-4 rounded font-bold shadow-md border border-red-500 transition-colors">
                 Clear
               </button>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-theme-input">
             <button type="button" onClick={() => {
                handleFormulaUpdate(calcTarget, calcString);
                setCalculatorOpen(false);
             }} className="hud-btn-primary py-3 px-8 font-tactical text-xs font-extrabold uppercase tracking-[0.18em]">
                Apply Formula
             </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal for Quick Stats Inspection */}
      <Modal 
        isOpen={!!statsModal} 
        onClose={() => { setStatsModal(null); setStatsSearch(''); }} 
        title={
          statsModal === 'players' ? `League Registered Players (${filteredPlayers.length})` :
          statsModal === 'teams' ? `Registered Teams (${filteredTeams.length})` :
          statsModal === 'tournaments' ? `Tournaments & Leagues (${filteredTournaments.length})` :
          statsModal === 'reports' ? `Reports & Verifications (${filteredReports.length})` :
          'League Stats'
        }
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col gap-4">
          {/* Search bar inside modal */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3 text-gray-400">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              value={statsSearch}
              onChange={(e) => setStatsSearch(e.target.value)}
              placeholder={
                statsModal === 'players' ? "Search by player name, role, or team..." :
                statsModal === 'teams' ? "Search by team name or tournament..." :
                statsModal === 'tournaments' ? "Search by tournament name, game title, or status..." :
                "Search by reporter, player, reason, or status..."
              }
              className="w-full bg-bg-400 border border-theme-input text-theme-text-base text-xs rounded-xl focus:outline-none focus:border-cyan-500 transition-colors py-2.5 pl-10 pr-4"
            />
          </div>

          {/* PLAYERS LIST */}
          {statsModal === 'players' && (
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar border border-theme-input rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-400/80 text-theme-text-faint sticky top-0 border-b border-theme-input">
                  <tr>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Player Name</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Team</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Role</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-400 italic">No players found.</td>
                    </tr>
                  ) : filteredPlayers.map((p, idx) => (
                    <tr key={p.player_id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-theme-text-base font-bold flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px] border border-emerald-500/30">
                          {(p.player_name || 'P')[0]?.toUpperCase()}
                        </span>
                        <span>{p.player_name}</span>
                      </td>
                      <td className="py-3 px-4 text-cyan-400 font-medium">
                        {p.teams?.team_name || 'Free Agent'}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 font-mono">
                          {p.role_in_game || 'Rifler'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ✓ Verified PH
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TEAMS LIST */}
          {statsModal === 'teams' && (
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar border border-theme-input rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-400/80 text-theme-text-faint sticky top-0 border-b border-theme-input">
                  <tr>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Team</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Tournament Folder</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredTeams.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-gray-400 italic">No teams found.</td>
                    </tr>
                  ) : filteredTeams.map((t, idx) => (
                    <tr key={t.team_id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-theme-text-base font-bold flex items-center gap-3">
                        {t.logo_url ? (
                          <img src={t.logo_url} alt={t.team_name} className="w-7 h-7 rounded-full object-cover border border-cyan-500/30" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[11px] border border-cyan-500/30">
                            {(t.team_name || 'T')[0]?.toUpperCase()}
                          </span>
                        )}
                        <span>{t.team_name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-mono text-[11px]">
                        {t.tournament_name || 'Default'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TOURNAMENTS LIST */}
          {statsModal === 'tournaments' && (
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar border border-theme-input rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-400/80 text-theme-text-faint sticky top-0 border-b border-theme-input">
                  <tr>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Tournament Name</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Game Title</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Format</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredTournaments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-400 italic">No tournaments found.</td>
                    </tr>
                  ) : filteredTournaments.map((t, idx) => (
                    <tr key={t.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-theme-text-base font-bold">
                        {t.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase">
                          {t.game_title || 'VALORANT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {t.format || 'Standard'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          t.status === 'COMPLETE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          t.status === 'IN PROGRESS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                          {t.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORTS / VERIFICATIONS LIST */}
          {statsModal === 'reports' && (
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar border border-theme-input rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-400/80 text-theme-text-faint sticky top-0 border-b border-theme-input">
                  <tr>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Reported Player</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Reason</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Reporter</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Statement</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-400 italic">No reports or verifications found.</td>
                    </tr>
                  ) : filteredReports.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-orange-400 font-bold">
                        {r.reported || 'Unknown Player'}
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] border border-slate-700">
                          {r.reason || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {r.reporter || 'Anonymous'}
                      </td>
                      <td className="py-3 px-4 text-gray-300 max-w-xs truncate" title={r.statement}>
                        {r.statement || 'No statement provided'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          (r.status || '').toLowerCase() === 'pending'
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {r.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
export default Admin;
