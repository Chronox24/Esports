import React, { useState, useEffect, useMemo, useRef } from 'react';
import { apiFetch } from '../../utils/api';
import {
  Shield,
  Users,
  UserPlus,
  Trash2,
  Search,
  Upload,
  X,
  Check,
  Crown,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Image as ImageIcon,
  Crosshair,
  Filter,
  Plus,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

const ROLE_PRESETS = [
  'IGL',
  'Duelist',
  'Initiator',
  'Controller',
  'Sentinel',
  'Sniper',
  'Rifler',
  'Support',
  'Sub'
];

const getRoleBadgeStyle = (role) => {
  if (!role) return 'bg-slate-800 text-slate-300 border-slate-700/60';
  const r = role.toLowerCase();
  if (r.includes('igl') || r.includes('captain') || r.includes('leader')) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
  }
  if (r.includes('duel') || r.includes('entry') || r.includes('slayer')) {
    return 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
  }
  if (r.includes('init') || r.includes('recon')) {
    return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.15)]';
  }
  if (r.includes('control') || r.includes('smoke')) {
    return 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]';
  }
  if (r.includes('sentinel') || r.includes('anchor') || r.includes('defense')) {
    return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]';
  }
  if (r.includes('sniper') || r.includes('awp') || r.includes('marksman')) {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
  }
  if (r.includes('rifle') || r.includes('assault')) {
    return 'bg-orange-500/15 text-orange-300 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)]';
  }
  if (r.includes('coach') || r.includes('analyst')) {
    return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]';
  }
  if (r.includes('sub') || r.includes('bench') || r.includes('reserve')) {
    return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
  }
  return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
};

const getTeamInitials = (name) => {
  if (!name) return 'TM';
  const clean = name.trim();
  const words = clean.split(/\s+/);
  if (words.length === 1) return clean.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getTeamGradient = (name) => {
  const gradients = [
    'from-cyan-600 to-blue-700',
    'from-violet-600 to-indigo-700',
    'from-rose-600 to-pink-700',
    'from-amber-600 to-orange-700',
    'from-emerald-600 to-teal-700',
    'from-fuchsia-600 to-purple-800',
    'from-blue-600 to-cyan-700',
    'from-teal-600 to-emerald-800'
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const PlayerManagement = ({ globalGame, globalTournament }) => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Studio tabs: 'team' | 'player' | 'bulk'
  const [studioTab, setStudioTab] = useState('team');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRosterStatus, setFilterRosterStatus] = useState('all'); // 'all' | 'ready' | 'incomplete'

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const teamFileInputRef = useRef(null);
  const teamNameInputRef = useRef(null);

  // New Player Form State
  const [newPlayerTeamId, setNewPlayerTeamId] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState('');
  const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false);
  const playerNameInputRef = useRef(null);

  // Bulk Roster Form State (6 Slots)
  const [bulkTeamId, setBulkTeamId] = useState('');
  const [bulkSlots, setBulkSlots] = useState([
    { ign: '', role: 'IGL' },
    { ign: '', role: 'Duelist' },
    { ign: '', role: 'Initiator' },
    { ign: '', role: 'Controller' },
    { ign: '', role: 'Sentinel' },
    { ign: '', role: 'Sub' }
  ]);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'team' | 'player'
    id: null,
    name: '',
    detail: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch teams & players
  const fetchTeams = async () => {
    try {
      const res = await apiFetch(`/api/teams?tournament=${encodeURIComponent(globalTournament || '')}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setTeams(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await apiFetch(`/api/players?tournament=${encodeURIComponent(globalTournament || '')}&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setPlayers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch players:', err);
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchTeams(), fetchPlayers()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTeams(), fetchPlayers()]).finally(() => setLoading(false));
  }, [globalTournament]);

  // Handle Logo file selection with preview
  const handleLogoFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo file size must be under 5MB', 'error');
      return;
    }
    setNewTeamLogo(file);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const clearLogoFile = () => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setNewTeamLogo(null);
    setLogoPreviewUrl(null);
    if (teamFileInputRef.current) {
      teamFileInputRef.current.value = '';
    }
  };

  // Add Team
  const handleAddTeam = async (e) => {
    e.preventDefault();
    const cleanName = newTeamName.trim();
    if (!cleanName) {
      showToast('Please enter a team name', 'error');
      return;
    }
    if (!globalTournament) {
      showToast('No active tournament selected', 'error');
      return;
    }

    setIsSubmittingTeam(true);
    try {
      const formData = new FormData();
      formData.append('team_name', cleanName);
      formData.append('tournament_name', globalTournament);
      if (newTeamLogo) {
        formData.append('logo', newTeamLogo);
      }

      const res = await apiFetch('/api/teams', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const createdTeam = await res.json();
        showToast(`Team "${cleanName}" registered successfully!`, 'success');
        setNewTeamName('');
        clearLogoFile();
        await fetchTeams();

        // Auto-select this newly created team in player & bulk tabs
        if (createdTeam && createdTeam.team_id) {
          setNewPlayerTeamId(createdTeam.team_id);
          setBulkTeamId(createdTeam.team_id);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || 'Failed to create team', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while adding team', 'error');
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  // Add Single Player
  const handleAddPlayer = async (e) => {
    e.preventDefault();
    const cleanIGN = newPlayerName.trim();
    if (!newPlayerTeamId) {
      showToast('Please select a team for this player', 'error');
      return;
    }
    if (!cleanIGN) {
      showToast('Please enter a player IGN', 'error');
      return;
    }

    setIsSubmittingPlayer(true);
    try {
      const res = await apiFetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: cleanIGN,
          team_id: newPlayerTeamId,
          role_in_game: newPlayerRole.trim()
        })
      });

      if (res.ok) {
        const selectedTeam = teams.find(t => String(t.team_id) === String(newPlayerTeamId));
        const teamName = selectedTeam ? selectedTeam.team_name : 'Team';
        showToast(`Player "${cleanIGN}" added to ${teamName}!`, 'success');
        setNewPlayerName('');
        setNewPlayerRole('');
        await fetchPlayers();
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || 'Failed to add player', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while adding player', 'error');
    } finally {
      setIsSubmittingPlayer(false);
    }
  };

  // Add Bulk Roster (6 Slots)
  const handleAddBulkRoster = async (e) => {
    e.preventDefault();
    if (!bulkTeamId) {
      showToast('Please select a team for the roster', 'error');
      return;
    }

    const validSlots = bulkSlots
      .map(s => ({ ign: s.ign.trim(), role: s.role.trim() }))
      .filter(s => s.ign.length > 0);

    if (validSlots.length === 0) {
      showToast('Please enter at least one player IGN', 'error');
      return;
    }

    setIsSubmittingBulk(true);
    try {
      const results = await Promise.allSettled(
        validSlots.map(s =>
          apiFetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              player_name: s.ign,
              team_id: bulkTeamId,
              role_in_game: s.role
            })
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      if (successful > 0) {
        const team = teams.find(t => String(t.team_id) === String(bulkTeamId));
        showToast(`Successfully enrolled ${successful} players into ${team ? team.team_name : 'team'}!`, 'success');
        setBulkSlots([
          { ign: '', role: 'IGL' },
          { ign: '', role: 'Duelist' },
          { ign: '', role: 'Initiator' },
          { ign: '', role: 'Controller' },
          { ign: '', role: 'Sentinel' },
          { ign: '', role: 'Sub' }
        ]);
        await fetchPlayers();
      } else {
        showToast('Failed to add players. Please check connection.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error during bulk roster submission', 'error');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Open Delete Modal
  const promptDeleteTeam = (team) => {
    const teamPlayerCount = players.filter(p => String(p.team_id) === String(team.team_id)).length;
    setDeleteModal({
      isOpen: true,
      type: 'team',
      id: team.team_id,
      name: team.team_name,
      detail: teamPlayerCount > 0
        ? `This will also permanently delete all ${teamPlayerCount} players assigned to this roster.`
        : 'This team has no assigned players.'
    });
  };

  const promptDeletePlayer = (player) => {
    setDeleteModal({
      isOpen: true,
      type: 'player',
      id: player.player_id,
      name: player.player_name,
      detail: player.role_in_game ? `Role: ${player.role_in_game}` : ''
    });
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      if (deleteModal.type === 'team') {
        const res = await apiFetch(`/api/teams/${deleteModal.id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast(`Team "${deleteModal.name}" was deleted.`, 'info');
          await Promise.all([fetchTeams(), fetchPlayers()]);
          // Reset team selections if deleted team was active
          if (String(newPlayerTeamId) === String(deleteModal.id)) setNewPlayerTeamId('');
          if (String(bulkTeamId) === String(deleteModal.id)) setBulkTeamId('');
        } else {
          showToast('Failed to delete team.', 'error');
        }
      } else if (deleteModal.type === 'player') {
        const res = await apiFetch(`/api/players/${deleteModal.id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast(`Player "${deleteModal.name}" was removed.`, 'info');
          await fetchPlayers();
        } else {
          showToast('Failed to delete player.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error executing delete operation.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, type: null, id: null, name: '', detail: '' });
    }
  };

  // Group players by team_id
  const playersByTeam = useMemo(() => {
    const map = {};
    teams.forEach(t => {
      map[t.team_id] = [];
    });
    players.forEach(p => {
      const tid = p.team_id;
      if (!map[tid]) map[tid] = [];
      map[tid].push(p);
    });
    return map;
  }, [teams, players]);

  // Summary Metrics
  const totalTeams = teams.length;
  const totalPlayers = players.length;
  const readyRostersCount = useMemo(() => {
    return teams.filter(t => (playersByTeam[t.team_id]?.length || 0) >= 5).length;
  }, [teams, playersByTeam]);

  // Filtered Teams based on search and status
  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return teams.filter(team => {
      const teamPlayers = playersByTeam[team.team_id] || [];
      const matchesSearch =
        !query ||
        team.team_name.toLowerCase().includes(query) ||
        teamPlayers.some(p => p.player_name.toLowerCase().includes(query) || (p.role_in_game && p.role_in_game.toLowerCase().includes(query)));

      const matchesStatus =
        filterRosterStatus === 'all' ||
        (filterRosterStatus === 'ready' && teamPlayers.length >= 5) ||
        (filterRosterStatus === 'incomplete' && teamPlayers.length < 5);

      return matchesSearch && matchesStatus;
    });
  }, [teams, playersByTeam, searchQuery, filterRosterStatus]);

  // Quick Action: Pre-select team for player addition
  const handleQuickAddPlayerToTeam = (teamId) => {
    setNewPlayerTeamId(teamId);
    setStudioTab('player');
    setTimeout(() => {
      playerNameInputRef.current?.focus();
    }, 100);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-bg-100 light:bg-slate-50 text-theme-text-base light:text-slate-900">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 animate-pulse flex items-center justify-center text-cyan-400">
            <Shield className="w-8 h-8 animate-bounce" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-xl"></div>
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-cyan-400 mb-2">Initializing Roster Hub</h3>
        <p className="text-xs text-theme-text-muted light:text-slate-500 font-medium tracking-wider">Syncing tournament teams and verified rosters...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-100 light:bg-slate-50 text-theme-text-base light:text-slate-900 overflow-hidden relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 animate-fade-in flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10"
          style={{
            backgroundColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : toast.type === 'info' ? 'rgba(59, 130, 246, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            color: '#ffffff'
          }}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner / Tournament Context & Quick Metrics Bar */}
      <div className="border-b border-slate-800/80 light:border-slate-200 bg-bg-200/90 light:bg-white/90 backdrop-blur-md px-6 lg:px-10 py-4 shrink-0 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tournament Identity & Status */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/90 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  {globalGame || 'Tournament Roster'}
                </span>
                <span className="text-xs text-theme-text-muted light:text-slate-400">•</span>
                <span className="text-[11px] font-bold text-theme-text-muted light:text-slate-500 flex items-center gap-1">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                  {globalTournament || 'General Tournament'}
                </span>
              </div>
              <h1 className="text-lg lg:text-xl font-black text-theme-text-base light:text-slate-900 tracking-wider uppercase mt-0.5">
                Roster & Team Management Hub
              </h1>
            </div>
          </div>

          {/* Quick Stat Badges & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Stat Pill: Total Teams */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800/80 light:border-slate-200">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-theme-text-muted light:text-slate-500">Teams</span>
                <span className="text-xs font-black text-theme-text-base light:text-slate-800 leading-tight">{totalTeams} Registered</span>
              </div>
            </div>

            {/* Stat Pill: Total Players */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800/80 light:border-slate-200">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-theme-text-muted light:text-slate-500">Players</span>
                <span className="text-xs font-black text-theme-text-base light:text-slate-800 leading-tight">{totalPlayers} Enrolled</span>
              </div>
            </div>

            {/* Stat Pill: Ready Lineups */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800/80 light:border-slate-200">
              <div className={`w-2 h-2 rounded-full ${readyRostersCount === totalTeams && totalTeams > 0 ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-theme-text-muted light:text-slate-500">Complete (5+)</span>
                <span className="text-xs font-black text-theme-text-base light:text-slate-800 leading-tight">{readyRostersCount} / {totalTeams} Ready</span>
              </div>
            </div>

            {/* Sync Refresh Button */}
            <button
              onClick={refreshAll}
              disabled={refreshing}
              title="Refresh Roster Data"
              className="p-2.5 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-800/80 light:border-slate-200 hover:border-cyan-500/50 text-theme-text-muted hover:text-cyan-400 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Split Workspace */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT PANE: Active Teams & Roster Explorer (60% Desktop) */}
        <section className="flex-1 lg:w-7/12 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800/80 light:border-slate-200 bg-bg-100 light:bg-slate-50/50 overflow-hidden">
          {/* Controls Bar: Search & Status Filters */}
          <div className="p-4 lg:p-6 border-b border-slate-800/60 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-200/50 light:bg-white/50 backdrop-blur-sm shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-theme-text-muted light:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search teams, players or roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/70 light:bg-slate-100 border border-slate-800/90 light:border-slate-300 rounded-xl pl-10 pr-9 py-2.5 text-xs font-bold text-theme-text-base light:text-slate-800 placeholder-slate-500 outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-muted hover:text-theme-text-base transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900/60 light:bg-slate-200/60 p-1 rounded-xl border border-slate-800/60 light:border-slate-300">
              <button
                onClick={() => setFilterRosterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterRosterStatus === 'all'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-theme-text-muted light:text-slate-600 hover:text-theme-text-base'
                }`}
              >
                All ({totalTeams})
              </button>
              <button
                onClick={() => setFilterRosterStatus('ready')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterRosterStatus === 'ready'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-theme-text-muted light:text-slate-600 hover:text-theme-text-base'
                }`}
              >
                Ready ({readyRostersCount})
              </button>
              <button
                onClick={() => setFilterRosterStatus('incomplete')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterRosterStatus === 'incomplete'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-theme-text-muted light:text-slate-600 hover:text-theme-text-base'
                }`}
              >
                Incomplete ({totalTeams - readyRostersCount})
              </button>
            </div>
          </div>

          {/* Teams List Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
            {teams.length === 0 ? (
              /* EMPTY STATE: When tournament has 0 teams */
              <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800/80 light:border-slate-300 rounded-3xl bg-slate-900/20 light:bg-slate-50/50">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl">
                    <Shield className="w-10 h-10 opacity-80" />
                  </div>
                  <div className="absolute -inset-2 rounded-3xl bg-cyan-400/10 blur-xl -z-10 animate-pulse"></div>
                </div>

                <h3 className="text-lg font-black text-theme-text-base light:text-slate-900 tracking-wider uppercase mb-2">
                  No Teams Registered Yet
                </h3>
                <p className="text-xs text-theme-text-muted light:text-slate-600 max-w-md mb-6 leading-relaxed">
                  Start building your tournament bracket and competitive rosters. Register your first team in the Studio panel on the right to assign players and configure match lineups.
                </p>

                <button
                  onClick={() => {
                    setStudioTab('team');
                    setTimeout(() => teamNameInputRef.current?.focus(), 100);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#090e14] font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Create First Team
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-xl w-full text-left">
                  <div className="p-3.5 rounded-xl bg-slate-900/40 light:bg-white border border-slate-800/60 light:border-slate-200">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5" /> Custom Branding
                    </div>
                    <p className="text-[11px] text-theme-text-muted light:text-slate-500">Upload team logos with automatic monogram fallbacks.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/40 light:bg-white border border-slate-800/60 light:border-slate-200">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
                      <Crown className="w-3.5 h-3.5" /> Role Tagging
                    </div>
                    <p className="text-[11px] text-theme-text-muted light:text-slate-500">Designate IGL, Duelist, Controller, and Sub slots.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/40 light:bg-white border border-slate-800/60 light:border-slate-200">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Match Ready
                    </div>
                    <p className="text-[11px] text-theme-text-muted light:text-slate-500">Automatic validation for complete 5+ player rosters.</p>
                  </div>
                </div>
              </div>
            ) : filteredTeams.length === 0 ? (
              /* EMPTY STATE: Search returned no results */
              <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-8">
                <Search className="w-10 h-10 text-theme-text-muted mb-3 opacity-40" />
                <h4 className="text-sm font-bold text-theme-text-base light:text-slate-800 uppercase tracking-wider mb-1">No Matching Teams or Players</h4>
                <p className="text-xs text-theme-text-muted light:text-slate-500 mb-4">No results matched your search query "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterRosterStatus('all');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 light:bg-slate-200 text-xs font-bold text-theme-text-base light:text-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* POPULATED TEAMS LIST */
              <div className="space-y-4">
                {filteredTeams.map((team) => {
                  const teamPlayers = playersByTeam[team.team_id] || [];
                  const isReady = teamPlayers.length >= 5;

                  return (
                    <div
                      key={team.team_id}
                      className="group rounded-2xl bg-bg-200/80 light:bg-white border border-slate-800/80 light:border-slate-200 hover:border-slate-700/80 light:hover:border-slate-300 transition-all duration-200 shadow-lg overflow-hidden flex flex-col"
                    >
                      {/* Team Card Header */}
                      <div className="p-4 lg:p-5 flex items-center justify-between gap-4 border-b border-slate-800/60 light:border-slate-100 bg-slate-900/30 light:bg-slate-50/50">
                        {/* Team Avatar & Name */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {team.logo_url ? (
                            <img
                              src={team.logo_url}
                              alt={team.team_name}
                              className="w-11 h-11 object-contain rounded-xl bg-slate-950/80 p-1 border border-slate-800/80 shrink-0 shadow-sm"
                              onError={(e) => {
                                // fallback to initials if image link breaks
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}

                          <div
                            style={{ display: team.logo_url ? 'none' : 'flex' }}
                            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getTeamGradient(team.team_name)} border border-white/20 items-center justify-center text-white font-black text-sm tracking-wider shadow-inner shrink-0`}
                          >
                            {getTeamInitials(team.team_name)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-theme-text-base light:text-slate-900 tracking-wide truncate">
                                {team.team_name}
                              </h3>
                              {/* Ready / Incomplete Status Badge */}
                              {isReady ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                  {teamPlayers.length} Players
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                                  {teamPlayers.length}/5 (Incomplete)
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-theme-text-muted light:text-slate-400 uppercase tracking-wider">
                              Tournament Lineup
                            </span>
                          </div>
                        </div>

                        {/* Team Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleQuickAddPlayerToTeam(team.team_id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95"
                            title="Add player to this team"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add Player</span>
                          </button>

                          <button
                            onClick={() => promptDeleteTeam(team)}
                            className="p-2 rounded-xl text-theme-text-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                            title="Delete Team"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Team Card Roster Body */}
                      <div className="p-4 lg:p-5">
                        {teamPlayers.length === 0 ? (
                          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/30 light:bg-slate-50 border border-dashed border-slate-800/80 light:border-slate-200">
                            <div className="flex items-center gap-2 text-theme-text-muted light:text-slate-500 text-xs font-medium">
                              <Users className="w-4 h-4 opacity-50" />
                              <span>No players assigned yet.</span>
                            </div>
                            <button
                              onClick={() => handleQuickAddPlayerToTeam(team.team_id)}
                              className="text-xs font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Enroll First Player
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {teamPlayers.map((player) => {
                              const roleBadgeClass = getRoleBadgeStyle(player.role_in_game);
                              const isIGL = (player.role_in_game || '').toLowerCase().includes('igl');

                              return (
                                <div
                                  key={player.player_id}
                                  className="group/player flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900/50 light:bg-slate-50 border border-slate-800/60 light:border-slate-200 hover:border-slate-700/80 light:hover:border-slate-300 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-6 h-6 rounded-lg bg-slate-800 light:bg-slate-200 flex items-center justify-center text-theme-text-muted light:text-slate-600 text-[10px] font-black shrink-0">
                                      {isIGL ? (
                                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                                      ) : (
                                        player.player_name.slice(0, 1).toUpperCase()
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-black text-theme-text-base light:text-slate-800 tracking-wide truncate">
                                        {player.player_name}
                                      </div>
                                      {player.role_in_game ? (
                                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${roleBadgeClass} mt-0.5`}>
                                          {player.role_in_game}
                                        </span>
                                      ) : (
                                        <span className="text-[9px] text-theme-text-muted light:text-slate-400 font-semibold uppercase">
                                          Unassigned
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => promptDeletePlayer(player)}
                                    className="opacity-60 group-hover/player:opacity-100 p-1 text-theme-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    title={`Remove ${player.player_name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANE: Creation & Management Studio (40% Desktop) */}
        <section className="flex-1 lg:w-5/12 flex flex-col bg-bg-200/40 light:bg-slate-100/50 overflow-hidden">
          {/* Studio Tab Switcher */}
          <div className="p-4 lg:p-6 border-b border-slate-800/80 light:border-slate-200 bg-bg-200/90 light:bg-white/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-theme-text-base light:text-slate-800">
                Management Studio
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-1.5 bg-slate-900/70 light:bg-slate-200/70 p-1.5 rounded-2xl border border-slate-800/80 light:border-slate-300">
              <button
                type="button"
                onClick={() => setStudioTab('team')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  studioTab === 'team'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-theme-text-muted light:text-slate-600 hover:text-theme-text-base'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Add Team</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioTab('player')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  studioTab === 'player'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-[#090e14] shadow-md shadow-cyan-500/20'
                    : 'text-theme-text-muted light:text-slate-600 hover:text-theme-text-base'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Single Player</span>
              </button>

              <button
                type="button"
                onClick={() => setStudioTab('bulk')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  studioTab === 'bulk'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-theme-text-muted light:text-slate-600 hover:text-theme-text-base'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Bulk Roster</span>
              </button>
            </div>
          </div>

          {/* Studio Tab Forms Scrollable Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-7">
            {/* TAB 1: ADD TEAM */}
            {studioTab === 'team' && (
              <form onSubmit={handleAddTeam} className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-theme-text-base light:text-slate-900 mb-1">
                    Register New Team
                  </h3>
                  <p className="text-xs text-theme-text-muted light:text-slate-500 font-medium">
                    Add a competing organization to the active tournament ({globalTournament || 'General'}).
                  </p>
                </div>

                {/* Team Name Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted light:text-slate-600 ml-1">
                    Team Name <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-theme-text-muted light:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={teamNameInputRef}
                      type="text"
                      placeholder="e.g. Sentinels, Paper Rex, Fnatic"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      required
                      className="w-full bg-slate-900/80 light:bg-white border border-slate-700/80 light:border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-theme-text-base light:text-slate-800 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Modern Team Logo Dropzone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted light:text-slate-600">
                      Team Crest / Logo
                    </label>
                    <span className="text-[9px] font-bold text-theme-text-muted light:text-slate-400 uppercase">Optional</span>
                  </div>

                  <input
                    ref={teamFileInputRef}
                    id="team-logo-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleLogoFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {logoPreviewUrl ? (
                    /* Selected Image Preview Card */
                    <div className="relative rounded-2xl border border-cyan-500/40 bg-slate-900/70 light:bg-white p-4 flex items-center justify-between gap-4 shadow-lg shadow-cyan-500/5">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={logoPreviewUrl}
                          alt="Logo Preview"
                          className="w-14 h-14 object-contain rounded-xl bg-slate-950 p-1.5 border border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-theme-text-base light:text-slate-800 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{newTeamLogo?.name}</span>
                          </div>
                          <span className="text-[10px] text-theme-text-muted light:text-slate-400 font-medium">
                            {(newTeamLogo?.size ? newTeamLogo.size / 1024 : 0).toFixed(1)} KB • Ready for upload
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => teamFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-theme-text-base transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={clearLogoFile}
                          className="p-1.5 rounded-lg text-theme-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove logo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Interactive Drag and Drop Area */
                    <div
                      onClick={() => teamFileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingLogo(true);
                      }}
                      onDragLeave={() => setIsDraggingLogo(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingLogo(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleLogoFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-6 flex flex-col items-center justify-center text-center ${
                        isDraggingLogo
                          ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                          : 'border-slate-700/80 light:border-slate-300 hover:border-cyan-500/60 bg-slate-900/40 light:bg-slate-50/70 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-800/80 light:bg-white border border-slate-700/70 light:border-slate-200 flex items-center justify-center text-theme-text-muted group-hover:text-cyan-400 group-hover:scale-110 transition-all mb-3 shadow-inner">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-theme-text-base light:text-slate-800 mb-1">
                        Click to browse or drag & drop logo
                      </p>
                      <p className="text-[10px] text-theme-text-muted light:text-slate-400 font-medium">
                        PNG, JPG, SVG or WEBP (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingTeam}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingTeam ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registering Team...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Register Team</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: ADD SINGLE PLAYER */}
            {studioTab === 'player' && (
              <form onSubmit={handleAddPlayer} className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-theme-text-base light:text-slate-900 mb-1">
                    Add Player to Roster
                  </h3>
                  <p className="text-xs text-theme-text-muted light:text-slate-500 font-medium">
                    Assign a competitor to a team with designated tactical roles.
                  </p>
                </div>

                {/* Team Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted light:text-slate-600 ml-1">
                    Select Target Team <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={newPlayerTeamId}
                      onChange={(e) => setNewPlayerTeamId(e.target.value)}
                      required
                      className="w-full bg-slate-900/80 light:bg-white border border-slate-700/80 light:border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-theme-text-base light:text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Choose a team from active roster...</option>
                      {teams.map((t) => {
                        const count = (playersByTeam[t.team_id] || []).length;
                        return (
                          <option key={t.team_id} value={t.team_id}>
                            {t.team_name} ({count} player{count === 1 ? '' : 's'})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-theme-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {teams.length === 0 && (
                    <p className="text-[11px] text-amber-400 font-medium ml-1">
                      No teams created yet. Please switch to the "Add Team" tab first.
                    </p>
                  )}
                </div>

                {/* Player In-Game Name (IGN) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted light:text-slate-600 ml-1">
                    Player IGN (In-Game Name) <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Crosshair className="w-4 h-4 text-theme-text-muted light:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={playerNameInputRef}
                      type="text"
                      placeholder="e.g. TenZ, Jinggg, Boaster, Aspas"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      required
                      className="w-full bg-slate-900/80 light:bg-white border border-slate-700/80 light:border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-theme-text-base light:text-slate-800 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Tactical Role Quick Chips & Custom Input */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted light:text-slate-600">
                      Tactical Role
                    </label>
                    <span className="text-[9px] font-bold text-theme-text-muted light:text-slate-400 uppercase">Optional</span>
                  </div>

                  {/* Preset Role Quick Click Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_PRESETS.map((preset) => {
                      const isSelected = newPlayerRole === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNewPlayerRole(isSelected ? '' : preset)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            isSelected
                              ? 'bg-cyan-500 text-[#090e14] shadow-md shadow-cyan-500/30 scale-105'
                              : 'bg-slate-900/60 light:bg-slate-200/70 text-theme-text-muted light:text-slate-700 border border-slate-800/80 light:border-slate-300 hover:border-slate-600 hover:text-theme-text-base'
                          }`}
                        >
                          {preset === 'IGL' && '👑 '}
                          {preset}
                        </button>
                      );
                    })}
                  </div>

                  {/* Optional Custom Input for Specific Roles */}
                  <input
                    type="text"
                    placeholder="Or enter custom role (e.g. Head Coach, Flex, Sixth Man)..."
                    value={newPlayerRole}
                    onChange={(e) => setNewPlayerRole(e.target.value)}
                    className="w-full bg-slate-900/80 light:bg-white border border-slate-700/80 light:border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-text-base light:text-slate-800 placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                  />
                </div>

                {/* Submit Player Button */}
                <button
                  type="submit"
                  disabled={isSubmittingPlayer || teams.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-[#090e14] font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingPlayer ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Enrolling Player...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Add Player to Roster</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: BULK ROSTER (6 SLOTS) */}
            {studioTab === 'bulk' && (
              <form onSubmit={handleAddBulkRoster} className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-theme-text-base light:text-slate-900 mb-1">
                    Bulk Roster Enrollment
                  </h3>
                  <p className="text-xs text-theme-text-muted light:text-slate-500 font-medium">
                    Quickly configure a full 5-player starting squad + 1 substitute.
                  </p>
                </div>

                {/* Team Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted light:text-slate-600 ml-1">
                    Select Target Team <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={bulkTeamId}
                      onChange={(e) => setBulkTeamId(e.target.value)}
                      required
                      className="w-full bg-slate-900/80 light:bg-white border border-slate-700/80 light:border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-theme-text-base light:text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Choose a team from active roster...</option>
                      {teams.map((t) => {
                        const count = (playersByTeam[t.team_id] || []).length;
                        return (
                          <option key={t.team_id} value={t.team_id}>
                            {t.team_name} ({count} current player{count === 1 ? '' : 's'})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-theme-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 6 Structured Roster Slots */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted light:text-slate-600">
                      Roster Lineup Slots
                    </label>
                    <span className="text-[10px] font-bold text-cyan-400">
                      {bulkSlots.filter(s => s.ign.trim()).length} of 6 slots filled
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {bulkSlots.map((slot, index) => {
                      const isCaptain = index === 0;
                      const isSub = index === 5;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 light:bg-white border border-slate-800/80 light:border-slate-200"
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isCaptain
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : isSub
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            {isCaptain ? '👑' : `${index + 1}`}
                          </div>

                          <input
                            type="text"
                            placeholder={isCaptain ? 'Captain / IGL IGN *' : isSub ? 'Substitute / 6th Player' : `Starter ${index + 1} IGN`}
                            value={slot.ign}
                            onChange={(e) => {
                              const updated = [...bulkSlots];
                              updated[index].ign = e.target.value;
                              setBulkSlots(updated);
                            }}
                            className="flex-1 bg-transparent border-none text-xs font-bold text-theme-text-base light:text-slate-800 placeholder-slate-500 outline-none"
                          />

                          <input
                            type="text"
                            placeholder="Role"
                            value={slot.role}
                            onChange={(e) => {
                              const updated = [...bulkSlots];
                              updated[index].role = e.target.value;
                              setBulkSlots(updated);
                            }}
                            className="w-24 bg-slate-800/70 light:bg-slate-100 border border-slate-700/60 light:border-slate-300 rounded-lg px-2.5 py-1 text-[11px] font-bold text-theme-text-base light:text-slate-800 outline-none focus:border-cyan-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bulk Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingBulk || !bulkTeamId}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingBulk ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Importing Roster Lineup...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>
                        Enroll {bulkSlots.filter(s => s.ign.trim()).length || 0} Players
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => {
            if (!isDeleting) setDeleteModal({ isOpen: false, type: null, id: null, name: '', detail: '' });
          }}
        >
          <div
            className="w-full max-w-md bg-bg-300 light:bg-white border border-red-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500"></div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 mb-5 shadow-lg shadow-red-500/10">
                <Trash2 className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 mb-1">
                Confirm Deletion
              </span>
              <h3 className="text-xl font-black text-theme-text-base light:text-slate-900 uppercase tracking-wide mb-2">
                Delete {deleteModal.type === 'team' ? 'Team' : 'Player'}?
              </h3>

              <p className="text-xs text-theme-text-muted light:text-slate-600 mb-4 leading-relaxed">
                Are you sure you want to permanently remove <strong className="text-theme-text-base light:text-slate-800">"{deleteModal.name}"</strong>?
              </p>

              {deleteModal.detail && (
                <div className="w-full p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-left mb-6 font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{deleteModal.detail}</span>
                </div>
              )}

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteModal({ isOpen: false, type: null, id: null, name: '', detail: '' })}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800/80 light:bg-slate-200 hover:bg-slate-700 text-theme-text-base light:text-slate-800 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManagement;
