import React, { useState } from 'react';
import { apiFetch } from '../../utils/api';
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/w0000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/w0000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/w0000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ClipboardCheckIcon = () => (
  <svg xmlns="http://www.w3.org/w0000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/w0000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/w0000/svg" className="h-4 w-4 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/w0000/svg" className="h-4 w-4 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const Card = ({ title, children, className = "" }) => (
  <div
    className={`bg-bg-300 light:bg-white rounded-xl border border-[#1c2532] light:border-slate-200 shadow-xl light:shadow-sm flex flex-col overflow-hidden relative group ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.01] light:from-blue-100/[0.1] to-transparent pointer-events-none z-0"></div>
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 light:via-blue-300 to-transparent"></div>
    <div className="border-b border-[#1c2532] light:border-slate-200 bg-bg-300 light:bg-slate-50 relative z-10 flex justify-between items-center group-hover:bg-bg-300 light:group-hover:bg-slate-100 transition-colors" style={{ padding: "24px 32px" }}>
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
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? "bg-blue-600 shadow-[0_0_8px_color-mix(in_srgb,var(--color--)_%,transparent)]" : "bg-bg-400 light:bg-slate-300"}`}
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
  <svg xmlns="http://www.w3.org/w0000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative bg-bg-300 light:bg-white w-full ${maxWidth} rounded-2xl border border-[#1c2532] light:border-slate-200 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]`}>
        <div className="p-5 border-b border-[#1c2532] light:border-slate-200 flex justify-between items-center bg-bg-300 light:bg-slate-50">
          <h2 className="text-xl font-black tracking-wider text-theme-text-base light:text-slate-900 uppercase">{title}</h2>
          <button onClick={onClose} className="text-theme-text-muted hover:text-theme-text-base transition-colors">
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
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
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-cyan-500' : 'bg-bg-400 border border-[#2a3648]'}`}
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
      className="appearance-none w-full bg-bg-300 border border-[#2a3648] text-theme-text-base font-medium text-xs rounded py-2 pl-3 pr-8 focus:outline-none focus:border-cyan-500 transition-colors"
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
    if (!newMatch.team_a_id || !newMatch.team_b_id) return alert('Select both teams');
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
    <div className="mt-4 border border-[#2a3648] bg-bg-300 rounded-lg p-4 relative">
      <span className="absolute -top-2 left-3 bg-bg-300 px-1 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Live Match Controller</span>
      <div className="flex items-center gap-2 mb-4 mt-1">
        <select value={newMatch.team_a_id} onChange={e => setNewMatch({...newMatch, team_a_id: e.target.value})} className="flex-1 bg-bg-300 border border-[#2a3648] rounded px-2 py-1 text-xs text-theme-text-base">
          <option value="">Select Team A</option>
          {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
        </select>
        <span className="text-xs text-theme-text-faint font-black">VS</span>
        <select value={newMatch.team_b_id} onChange={e => setNewMatch({...newMatch, team_b_id: e.target.value})} className="flex-1 bg-bg-300 border border-[#2a3648] rounded px-2 py-1 text-xs text-theme-text-base">
          <option value="">Select Team B</option>
          {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
        </select>
        <input placeholder="Map..." value={newMatch.map_name} onChange={e => setNewMatch({...newMatch, map_name: e.target.value})} className="w-20 bg-bg-300 border border-[#2a3648] rounded px-2 py-1 text-xs text-theme-text-base" />
        <button onClick={handleCreateMatch} className="bg-cyan-600 text-theme-text-base font-bold text-xs hover:bg-cyan-500" style={{ padding: "12px 24px", borderRadius: "9999px" }}>+</button>
      </div>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
        {loading && <div className="text-center text-xs text-theme-text-faint">Loading matches...</div>}
        {matches.map(m => (
          <div key={m.match_id} className="bg-bg-300 border border-[#2a3648] rounded p-2 flex flex-col gap-2">
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
const Admin = ({ globalGame, globalTournament }) => {
  const [activeTab, setActiveTab] = React.useState("League Quick Stats");
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
      const res = await fetch('/api/settings/formula');
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
    if (!activeFormula.id) return alert('Cannot save default formula directly. Ensure database is seeded.');
    try {
      const res = await fetch(`/api/settings/formula/${activeFormula.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeFormula)
      });
      if (res.ok) alert('Formula successfully saved to the database!');
      else alert('Failed to save formula.');
    } catch (e) {
      console.error(e);
      alert('Error saving formula.');
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
  const [newRole, setNewRole] = useState('Super Admin');
  const [isCreating, setIsCreating] = useState(false);
  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) return alert('Email and password required');
    setIsCreating(true);
    try {
      const res = await apiFetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole })
      });
      if (res.ok) {
        alert('User created successfully!');
        setShowCreateModal(false);
        setNewEmail('');
        setNewPassword('');
        // Refresh the accounts list (using timestamp to bypass the 60s backend cache)
        const resUsers = await apiFetch(`/api/users?t=${Date.now()}`);
        if (resUsers.ok) setAccounts(await resUsers.json());
      } else {
        const errorData = await res.json();
        alert('Error creating user: ' + (errorData.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Failed to create user.');
    }
    setIsCreating(false);
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
  const [rulebookUrl, setRulebookUrl] = useState(null);

  React.useEffect(() => {
    const fetchRulebook = async () => {
      try {
        const res = await fetch('/api/admin/rulebook');
        if (res.ok) {
          const data = await res.json();
          if (data && data.file_url) setRulebookUrl(data.file_url);
        }
      } catch (err) { console.error(err); }
    };
    fetchRulebook();
  }, []);

  const handleRulebookUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('rulebook', file);
    try {
      const res = await fetch('/api/admin/rulebook', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setRulebookUrl(data.file_url);
        alert('Rulebook uploaded successfully!');
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
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
        alert('Error updating folder: ' + (errorData.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update folder game title.');
    }
  };
  const [editingUser, setEditingUser] = useState(null);
  const [editPermissions, setEditPermissions] = useState({ view: false, edit: false, full: false, manage_folders: false });
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);
  const handleOpenEdit = (user) => {
    if (user.is_super_admin) return alert("Cannot manually alter permissions for the Super Admin.");
    setEditingUser(user);
    setEditPermissions(user.permissions || { view: false, edit: false, full: false, manage_folders: false });
  };
  const handleUpdatePermissions = async () => {
    if (!editingUser) return;
    setIsUpdatingPermissions(true);
    try {
      const res = await apiFetch(`/api/admin/user/${editingUser.user_id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: editPermissions })
      });
      if (res.ok) {
        alert('Permissions updated successfully!');
        setEditingUser(null);
        const resUsers = await apiFetch(`/api/users?t=${Date.now()}`);
        if (resUsers.ok) setAccounts(await resUsers.json());
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update permissions.');
    }
    setIsUpdatingPermissions(false);
  };
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const resTeams = await apiFetch('/api/teams');
        if (resTeams.ok) setTeams(await resTeams.json());
        const resUsers = await apiFetch(`/api/users?t=${Date.now()}`);
        if (resUsers.ok) setAccounts(await resUsers.json());
        const resTournaments = await apiFetch('/api/tournaments');
        if (resTournaments.ok) setTournaments(await resTournaments.json());
        fetchFormulas();
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="flex-1 bg-bg-100 text-theme-text-base overflow-y-auto flex flex-col h-full relative font-sans custom-scrollbar">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
      {}
      <div className="flex-1 pb-16 flex flex-col items-center" style={{ padding: "32px" }}>
        <div className="w-full max-w-[1400px] flex flex-col gap-6">
          {}
          {activeTournamentObj && (
            <div className="w-full flex items-center justify-between mb-4" style={{ borderRadius: "9999px", border: "1px solid #00c8c8", padding: "16px 48px", backgroundColor: "transparent" }}>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-theme-text-muted uppercase tracking-widest">Active Folder:</span>
                <span className="text-cyan-400 font-black text-xl tracking-wider">{activeTournamentObj.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-theme-text-faint font-bold uppercase tracking-widest">Game Title:</span>
                <div className="relative">
                  <select 
                    value={activeTournamentObj.game.toUpperCase()} 
                    onChange={(e) => handleUpdateFolderGame(e.target.value)}
                    className="appearance-none bg-transparent border border-[#00c8c8] text-cyan-400 text-sm font-bold focus:outline-none cursor-pointer"
                    style={{ borderRadius: "9999px", padding: "8px 48px 8px 24px" }}
                  >
                    <option value="VALORANT" className="bg-bg-300">VALORANT</option>
                    <option value="CROSSFIRE" className="bg-bg-300">CROSSFIRE</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-cyan-400">
                    <svg xmlns="http://www.w3.org/w0000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
          {}
          
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-6 p-2">
              {['League Quick Stats', 'Admin Accounts & User Directory', 'Rulebook Viewer'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-green-500/20 text-green-500' : 'text-gray-400 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'League Quick Stats' && (
            <>
            {}
            <div className="bg-[#1c2532]/30 rounded-xl shadow-xl overflow-hidden flex flex-col border border-gray-800/40">
              <div className="border-b border-gray-800/40 bg-transparent" style={{ padding: "24px 32px" }}>
                 <h2 className="text-base font-bold text-white tracking-wide">League Quick Stats (PH Local Context)</h2>
              </div>
               <div className="grid grid-cols-2 flex-1" style={{ padding: "32px", gap: "24px" }}>
                 {}
                 <div className="flex flex-col items-center justify-center bg-transparent border border-gray-800/60 rounded-2xl p-6 shadow-inner">
                    <span className="text-sm font-bold text-gray-300 mb-2 text-center">Total Registered Players</span>
                    <div className="flex items-center gap-4 mb-2">
                       <UsersIcon />
                       <div className="flex flex-col">
                         <span className="text-4xl font-black text-green-500 leading-none">12,500</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Players</span>
                       </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 text-center">Verified (PH: 98%)</span>
                 </div>
                 <div className="flex flex-col items-center justify-center bg-transparent border border-gray-800/60 rounded-2xl p-6 shadow-inner">
                    <span className="text-sm font-bold text-gray-300 mb-2 text-center">Total Teams</span>
                    <div className="flex items-center gap-4 mb-2">
                       <TrophyIcon />
                       <div className="flex flex-col">
                         <span className="text-4xl font-black text-green-500 leading-none">620</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Teams</span>
                       </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 text-center text-balance">Active Teams (Local Leagues)</span>
                 </div>
                 <div className="flex flex-col items-center justify-center bg-transparent border border-gray-800/60 rounded-2xl p-6 shadow-inner">
                    <span className="text-sm font-bold text-gray-300 mb-2 text-center">Active Tournaments</span>
                    <div className="flex items-center gap-4 mb-2">
                       <CalendarIcon />
                       <div className="flex flex-col">
                         <span className="text-4xl font-black text-orange-400 leading-none">15</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Tournaments</span>
                       </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 text-center text-balance">Ongoing (Metro Manila, Cebu, etc.)</span>
                 </div>
                 <div className="flex flex-col items-center justify-center bg-transparent border border-gray-800/60 rounded-2xl p-6 shadow-inner">
                    <span className="text-sm font-bold text-gray-300 mb-2 text-center">Pending Verifications</span>
                    <div className="flex items-center gap-4 mb-2">
                       <ClipboardCheckIcon />
                       <div className="flex flex-col">
                         <span className="text-4xl font-black text-orange-400 leading-none">45</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Verifications</span>
                       </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 text-center">New Player IDs to review</span>
                 </div>
                 {}
                 <div className="col-span-2 flex flex-col items-center justify-center bg-transparent border border-gray-800/60 rounded-2xl p-6 shadow-inner">
                    <span className="text-sm font-bold text-gray-300 mb-2 text-center">New Admin Logins</span>
                    <div className="flex items-center gap-4 mb-2">
                       <LockIcon />
                       <div className="flex flex-col">
                         <span className="text-4xl font-black text-green-500 leading-none">12</span>
                         <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Admins</span>
                       </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 text-center text-balance">Admins (Central & Local PH)</span>
                 </div>
               </div>
            </div>
            </>
          )}
          {activeTab === 'Admin Accounts & User Directory' && (
            <><div className="bg-bg-300 rounded-xl border border-[#1c2532] shadow-xl overflow-hidden flex flex-col">
              <div className="border-b border-[#1c2532] bg-bg-300 flex flex-wrap justify-between items-center" style={{ padding: "24px 32px", gap: "24px" }}>
                 <div className="flex flex-col flex-shrink-0 whitespace-nowrap" style={{ gap: "4px" }}>
                   <h2 className="text-sm font-bold text-theme-text-base tracking-wide">Admin Accounts & User Directory</h2>
                   <span className="text-[10px] text-theme-text-faint font-mono italic">(System Access Hub)</span>
                 </div>
                 <div className="flex items-center flex-wrap" style={{ gap: "16px" }}>
                    <div className="relative flex-shrink-0" style={{ width: "256px" }}>
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: "12px" }}>
                        <SearchIcon />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Search (IGN, Team, Location)" 
                        className="w-full bg-bg-300 border border-[#2a3648] text-theme-text-base text-xs rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
                        style={{ padding: "10px 16px 10px 40px" }}
                      />
                    </div>
                    <div className="flex-shrink-0" style={{ width: "224px" }}>
                      <SelectDropdown options={['Verification Status', 'Verified', 'Pending', 'Rejected']} />
                    </div>
                 </div>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg-300 text-theme-text-faint sticky top-0 shadow-sm z-10 border-b border-[#1c2532]">
                    <tr>
                      <th className="font-semibold w-1/5" style={{ padding: "24px 32px" }}>Username</th>
                      <th className="font-semibold" style={{ padding: "24px 32px" }}>Role</th>
                      <th className="font-semibold" style={{ padding: "24px 32px" }}>Super Admin</th>
                      <th className="font-semibold" style={{ padding: "24px 32px" }}>Permissions</th>
                      <th className="font-semibold text-center w-20" style={{ padding: "24px 32px" }}>Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c2532]">
                    {accounts.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-6 text-theme-text-faint italic">No accounts found or loading...</td></tr>
                    ) : accounts.map((user, idx) => (
                      <tr key={idx} onClick={() => handleOpenEdit(user)} className="hover:bg-bg-300/50 transition-colors cursor-pointer group">
                        <td className="text-theme-text-base font-medium group-hover:text-cyan-400" style={{ padding: "20px 32px" }}>
                           <div className="flex flex-col gap-1">
                             <span>{user.username}</span>
                             <span className={`text-[9px] text-cyan-600/70 italic transition-opacity duration-200 ${!user.is_super_admin ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'}`}>
                               Click to edit
                             </span>
                           </div>
                        </td>
                        <td className="text-theme-text-muted" style={{ padding: "20px 32px" }}>{user.role || 'N/A'}</td>
                        <td className="text-theme-text-muted" style={{ padding: "20px 32px" }}>
                           {user.is_super_admin ? (
                             <span className="bg-cyan-500/20 text-cyan-400 rounded text-[10px] font-black uppercase tracking-wider" style={{ padding: "8px 24px", borderRadius: "9999px" }}>Yes</span>
                           ) : (
                             <span className="bg-bg-400/50 text-theme-text-faint rounded text-[10px] font-black uppercase tracking-wider border border-[#2a3648]/50" style={{ padding: "8px 24px", borderRadius: "9999px" }}>No</span>
                           )}
                        </td>
                        <td className="text-theme-text-muted font-mono text-[9px] tracking-wide max-w-[150px] truncate" style={{ padding: "20px 32px" }}>
                           {user.permissions ? JSON.stringify(user.permissions) : 'None'}
                        </td>
                        <td className="text-center" style={{ padding: "20px 32px" }}>
                          <div className="flex items-center justify-center w-full h-full">
                            <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {}
              <div className="border-t border-[#1c2532] bg-bg-300 flex justify-between items-center" style={{ padding: "24px 32px" }}>
                 <div className="flex items-center gap-3 font-black text-xl italic tracking-wider text-orange-500 drop-shadow-md">
                    <svg viewBox="0 0 100 100" className="w-8 h-8 fill-orange-500"><path d="M50 0L90 20v50L50 100 10 70V20z"/></svg>
                    <span>TNC Hub</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => setShowCreateModal(true)} className="bg-cyan-600 hover:bg-cyan-500 text-theme-text-base text-xs font-bold transition-colors shadow-lg shadow-cyan-900/20" style={{ padding: "12px 32px", borderRadius: "9999px" }}>Create Admin</button>
                    <button className="bg-transparent border border-cyan-700/50 text-cyan-500 text-xs font-bold hover:bg-cyan-900/30 transition-colors" style={{ padding: "12px 32px", borderRadius: "9999px" }}>Create New Player</button>
                    <button className="bg-transparent border border-cyan-700/50 text-cyan-500 text-xs font-bold hover:bg-cyan-900/30 transition-colors" style={{ padding: "12px 32px", borderRadius: "9999px" }}>Import Teams via CSV</button>
                 </div>
              </div>
            </div>
          </>
          )}
          {activeTab === 'Rulebook Viewer' && (
            <><div className="bg-bg-300 rounded-xl border border-[#1c2532] shadow-xl flex flex-col">
<div className="border-b border-[#1c2532] bg-bg-300 flex justify-between items-center" style={{ padding: "24px 32px" }}>
                 <h2 className="text-sm font-bold text-theme-text-base tracking-wide">Rulebook Viewer</h2>
                 <label className="bg-transparent border border-[#2a3648] text-cyan-400 text-[10px] font-bold hover:bg-bg-400 transition-colors cursor-pointer" style={{ padding: "12px 24px", borderRadius: "9999px" }}>
                    Upload New Rulebook
                    <input type="file" className="hidden" accept="application/pdf,image/*" onChange={handleRulebookUpload} />
                 </label>
             </div>
             <div style={{ padding: "32px" }}>
                 {rulebookUrl ? (
                   <div className="bg-bg-300 rounded-lg border border-[#1c2532] flex flex-wrap items-center justify-between" style={{ padding: "24px", gap: "16px" }}>
                     <div className="flex items-center" style={{ gap: "16px" }}>
                       <div className="flex-shrink-0 w-12 h-12 rounded flex items-center justify-center bg-cyan-500/20 text-cyan-400">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       </div>
                       <div className="flex flex-col" style={{ gap: "4px" }}>
                         <span className="text-sm font-bold text-theme-text-base">Official League Rulebook</span>
                         <span className="text-[10px] text-theme-text-faint font-mono">{rulebookUrl.split('/').pop()}</span>
                       </div>
                     </div>
                     <div className="flex items-center" style={{ gap: "12px" }}>
                       <a href={rulebookUrl} target="_blank" rel="noopener noreferrer" className="bg-transparent border border-cyan-700/50 text-cyan-400 text-xs font-bold hover:bg-cyan-900/30 transition-colors whitespace-nowrap" style={{ padding: "10px 24px", borderRadius: "9999px" }}>Open PDF in Browser</a>
                     </div>
                   </div>
                 ) : (
                   <div className="flex items-center justify-center text-theme-text-faint font-mono text-sm border-2 border-dashed border-[#1c2532] rounded-lg" style={{ padding: "48px" }}>
                      No rulebook uploaded yet.
                   </div>
                 )}
             </div>
          </div>
</>
          )}



        </div>
      </div>
      {}
      {showCreateModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-300 p-8 rounded-xl border border-[#1c2532] shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-theme-text-faint hover:text-theme-text-base transition-colors">
              <svg xmlns="http://www.w3.org/w0000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center space-x-3 mb-6">
              <LockIcon />
              <h3 className="text-xl font-black text-theme-text-base uppercase tracking-widest">Create Admin Account</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-bg-300 border border-[#2a3648] text-theme-text-base text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="admin@esport.ph"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest block mb-1.5">Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-bg-300 border border-[#2a3648] text-theme-text-base text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest block mb-1.5">Role</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-bg-300 border border-[#2a3648] text-theme-text-base text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Tournament Mod">Tournament Mod</option>
                  <option value="Observer">Observer</option>
                </select>
              </div>
              <button
                onClick={handleCreateUser}
                disabled={isCreating}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#090e14] font-black uppercase tracking-widest py-3 rounded-lg mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                {isCreating ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
      {}
      {editingUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-300 rounded-xl border border-[#1c2532] shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200" style={{ padding: "32px" }}>
            <button onClick={() => setEditingUser(null)} className="absolute text-theme-text-faint hover:text-theme-text-base transition-colors" style={{ top: "16px", right: "16px" }}>
              <svg xmlns="http://www.w3.org/w0000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex items-center" style={{ gap: "12px", marginBottom: "24px" }}>
              <LockIcon />
              <h3 className="text-xl font-black text-theme-text-base uppercase tracking-widest">Edit Permissions</h3>
            </div>
            <div className="flex flex-col" style={{ gap: "24px" }}>
              <div className="bg-bg-300 rounded-lg border border-[#1c2532]" style={{ padding: "16px" }}>
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest block" style={{ marginBottom: "4px" }}>User</label>
                <div className="text-cyan-400 font-bold text-base">{editingUser.username} <span className="text-theme-text-faint text-sm font-normal ml-1">({editingUser.role})</span></div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest block" style={{ marginBottom: "12px" }}>Permissions</label>
                <div className="grid grid-cols-2" style={{ gap: "12px" }}>
                   {['view', 'edit', 'full', 'manage_folders'].map((perm) => (
                      <label key={perm} className="flex items-center cursor-pointer group bg-bg-300 rounded-lg border border-[#1c2532] hover:border-cyan-500/50 transition-all" style={{ padding: "12px", gap: "12px" }}>
                        <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded border ${editPermissions[perm] ? 'bg-cyan-500 border-cyan-500' : 'bg-bg-300 border-gray-600 group-hover:border-gray-500'} transition-colors`}>
                           {editPermissions[perm] && <svg className="w-3.5 h-3.5 text-[#090e14]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input
                          type="checkbox"
                          checked={editPermissions[perm] || false}
                          onChange={(e) => setEditPermissions({...editPermissions, [perm]: e.target.checked})}
                          className="hidden"
                        />
                        <span className="text-sm font-medium text-theme-text-base capitalize group-hover:text-cyan-400 transition-colors whitespace-nowrap">{perm.replace('_', ' ')}</span>
                      </label>
                   ))}
                </div>
              </div>
              <button
                onClick={handleUpdatePermissions}
                disabled={isUpdatingPermissions}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#090e14] font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                style={{ padding: "14px", marginTop: "8px" }}
              >
                {isUpdatingPermissions ? 'Saving...' : 'Save Permissions'}
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
                 <button key={btn} onClick={() => setCalcString(prev => prev + btn)} className="bg-bg-400 hover:bg-bg-500 text-theme-text-base py-3 rounded text-sm font-bold shadow-md transition-colors border border-[#1c2532]">
                   {btn}
                 </button>
               ))}
               {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.'].map(btn => (
                 <button key={btn} onClick={() => setCalcString(prev => prev + btn)} className="bg-theme-input hover:bg-blue-900/30 text-theme-text-base py-3 rounded text-xl font-bold shadow-md transition-colors border border-[#1c2532]">
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
          
          <div className="flex justify-end pt-4 border-t border-[#1c2532]">
             <button onClick={() => {
                handleFormulaUpdate(calcTarget, calcString);
                setCalculatorOpen(false);
             }} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
                Apply Formula
             </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Admin;
