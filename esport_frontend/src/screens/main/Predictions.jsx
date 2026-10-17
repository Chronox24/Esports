import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarX,
  Swords,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Trophy,
  TrendingUp,
  BrainCircuit,
  Filter,
  Check,
  Zap,
  Clock,
  Shield,
  Layers
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const DEFAULT_VALORANT_MATCHES = [
  {
    match_id: 101,
    match_schedule: new Date(Date.now() + 3600000 * 4).toISOString(),
    status: 'scheduled',
    tournament_name: 'Champions Tour',
    stage: 'Upper Bracket Final',
    format: 'BO3',
    team_a: {
      team_id: 1,
      team_name: 'Sentinels',
      logo_url: null,
      region: 'Americas',
      seed: '#1 Seed'
    },
    team_b: {
      team_id: 2,
      team_name: 'Fnatic',
      logo_url: null,
      region: 'EMEA',
      seed: '#2 Seed'
    },
    system_prediction: {
      predicted_winner_id: 1,
      predicted_winner_name: 'Sentinels',
      probability_a: 58,
      probability_b: 42,
      reasoning: 'Sentinels show a 78% win-rate on Bind & Sunset with superior opening duel conversions.'
    }
  },
  {
    match_id: 102,
    match_schedule: new Date(Date.now() + 3600000 * 18).toISOString(),
    status: 'scheduled',
    tournament_name: 'Champions Tour',
    stage: 'Lower Semifinal',
    format: 'BO3',
    team_a: {
      team_id: 3,
      team_name: 'Paper Rex',
      logo_url: null,
      region: 'Pacific',
      seed: '#1 Seed'
    },
    team_b: {
      team_id: 4,
      team_name: 'Team Liquid',
      logo_url: null,
      region: 'EMEA',
      seed: '#3 Seed'
    },
    system_prediction: {
      predicted_winner_id: 3,
      predicted_winner_name: 'Paper Rex',
      probability_a: 64,
      probability_b: 36,
      reasoning: 'PRX aggressive pace and first blood differential gives them strong momentum advantage.'
    }
  },
  {
    match_id: 103,
    match_schedule: new Date(Date.now() + 3600000 * 32).toISOString(),
    status: 'scheduled',
    tournament_name: 'Champions Tour',
    stage: 'Grand Final',
    format: 'BO5',
    team_a: {
      team_id: 5,
      team_name: 'Gen.G Esports',
      logo_url: null,
      region: 'Pacific',
      seed: '#2 Seed'
    },
    team_b: {
      team_id: 6,
      team_name: 'DRX',
      logo_url: null,
      region: 'Pacific',
      seed: '#4 Seed'
    },
    system_prediction: {
      predicted_winner_id: 5,
      predicted_winner_name: 'Gen.G Esports',
      probability_a: 52,
      probability_b: 48,
      reasoning: 'Extremely balanced Pacific matchup with clutch percentage favoring Gen.G by a slight margin.'
    }
  }
];

const DEFAULT_CROSSFIRE_MATCHES = [
  {
    match_id: 201,
    match_schedule: new Date(Date.now() + 3600000 * 5).toISOString(),
    status: 'scheduled',
    tournament_name: 'CFS World Championship',
    stage: 'Grand Final',
    format: 'BO5',
    team_a: {
      team_id: 11,
      team_name: 'All Gamers',
      logo_url: null,
      region: 'China',
      seed: '#1 Seed'
    },
    team_b: {
      team_id: 12,
      team_name: 'BaiSha Gaming',
      logo_url: null,
      region: 'China',
      seed: '#2 Seed'
    },
    system_prediction: {
      predicted_winner_id: 11,
      predicted_winner_name: 'All Gamers',
      probability_a: 57,
      probability_b: 43,
      reasoning: 'AG holds an 82% defensive round conversion across Black Widow and Sub Base.'
    }
  },
  {
    match_id: 202,
    match_schedule: new Date(Date.now() + 3600000 * 20).toISOString(),
    status: 'scheduled',
    tournament_name: 'CFS World Championship',
    stage: 'Third Place Match',
    format: 'BO3',
    team_a: {
      team_id: 13,
      team_name: 'Pacific Macta',
      logo_url: null,
      region: 'Philippines',
      seed: '#1 PH'
    },
    team_b: {
      team_id: 14,
      team_name: 'Wolves Esports',
      logo_url: null,
      region: 'China',
      seed: '#3 Seed'
    },
    system_prediction: {
      predicted_winner_id: 13,
      predicted_winner_name: 'Pacific Macta',
      probability_a: 51,
      probability_b: 49,
      reasoning: 'PM boasts superior sniper impact frags leading to higher trade efficiency.'
    }
  }
];

const Predictions = ({ globalGame, globalTournament }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [myPredictions, setMyPredictions] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'unpredicted' | 'predicted'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Silently resolve username from auth or fallback
  const [username] = useState(() => {
    try {
      const sessionStr = localStorage.getItem('supabase.auth.token');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.user?.user_metadata?.username) return session.user.user_metadata.username;
        if (session?.user?.email) return session.user.email.split('@')[0];
      }
    } catch {}
    return localStorage.getItem('username') || 'Player1';
  });

  const activeGame = (globalGame || 'VALORANT').toLowerCase();
  const isValorant = activeGame === 'valorant';
  const accent = isValorant ? '#06b6d4' : '#f59e0b';
  const accentSecondary = isValorant ? '#3b82f6' : '#ef4444';

  useEffect(() => {
    fetchMatches();
    loadUserPredictions();
  }, [activeGame, username, globalTournament]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const loadUserPredictions = async () => {
    const storageKey = `predictions_${username}_${globalTournament || 'default'}`;
    let cached = [];
    try {
      const local = localStorage.getItem(storageKey);
      if (local) cached = JSON.parse(local);
    } catch (e) {
      console.warn('Failed parsing local predictions cache', e);
    }
    setMyPredictions(cached);

    if (!globalTournament) return;

    try {
      const tourneyParam = encodeURIComponent(globalTournament.trim());
      const res = await apiFetch(`/api/predictions/user/${encodeURIComponent(username)}?tournament=${tourneyParam}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMyPredictions(data);
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Could not fetch user predictions from server, using local cache:', err);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    if (!globalTournament) {
      setMatches([]);
      setLoading(false);
      return;
    }

    try {
      const tourneyParam = encodeURIComponent(globalTournament.trim());
      const gameParam = encodeURIComponent(activeGame);
      const res = await apiFetch(
        `/api/predictions/matches?tournament=${tourneyParam}&game=${gameParam}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMatches(data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Matches API error:', err);
    }

    setMatches([]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchMatches(), loadUserPredictions()]);
    setTimeout(() => setIsRefreshing(false), 500);
    showToast('Match list and prediction odds refreshed!');
  };

  const handlePredict = async (match, team) => {
    const matchId = match.match_id;
    const teamId = team.team_id;
    const teamName = team.team_name;
    const storageKey = `predictions_${username}_${globalTournament || 'default'}`;

    // Optimistic UI state update
    const newPrediction = {
      username,
      match_id: matchId,
      predicted_winner_team_id: teamId,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setMyPredictions(prev => {
      const filtered = prev.filter(p => p.match_id !== matchId);
      const updated = [...filtered, newPrediction];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast(`Locked pick: ${teamName} for Match #${matchId}!`);

    // Sync to backend
    try {
      await apiFetch(`/api/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          match_id: matchId,
          predicted_winner_team_id: teamId
        })
      });
    } catch (err) {
      console.warn('Backend sync failed, pick saved locally:', err);
    }
  };

  const getPredictionForMatch = (matchId) => {
    return myPredictions.find(p => p.match_id === matchId);
  };

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const prediction = getPredictionForMatch(match.match_id);
      const hasPredicted = Boolean(prediction);

      if (filterMode === 'unpredicted' && hasPredicted) return false;
      if (filterMode === 'predicted' && !hasPredicted) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const a = match.team_a?.team_name?.toLowerCase() || '';
        const b = match.team_b?.team_name?.toLowerCase() || '';
        const stage = (match.stage || '').toLowerCase();
        return a.includes(q) || b.includes(q) || stage.includes(q);
      }
      return true;
    });
  }, [matches, myPredictions, filterMode, searchQuery]);

  // Statistics
  const totalMatchesCount = matches.length;
  const pickedMatchesCount = matches.filter(m => getPredictionForMatch(m.match_id)).length;
  const completionPercentage = totalMatchesCount > 0 ? Math.round((pickedMatchesCount / totalMatchesCount) * 100) : 0;

  // Average AI confidence
  const avgConfidence = useMemo(() => {
    if (matches.length === 0) return 65;
    const valid = matches.filter(m => m.system_prediction);
    if (valid.length === 0) return 65;
    const sum = valid.reduce((acc, m) => {
      const pA = m.system_prediction.probability_a || 50;
      const pB = m.system_prediction.probability_b || 50;
      return acc + Math.max(pA, pB);
    }, 0);
    return Math.round(sum / valid.length);
  }, [matches]);

  return (
    <div className="w-full h-full bg-[#040814] text-slate-100 flex flex-col items-center overflow-y-auto relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Background Ambient Light Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full blur-[160px] opacity-15 transition-all duration-700"
          style={{ backgroundColor: accent }}
        />
        <div
          className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10"
          style={{ backgroundColor: accentSecondary }}
        />
        <div
          className="absolute bottom-10 -right-48 w-[600px] h-[600px] rounded-full blur-[170px] opacity-10"
          style={{ backgroundColor: isValorant ? '#3b82f6' : '#f43f5e' }}
        />
        {/* Subtle grid mesh overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-8 z-50 animate-bounce flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-[0_10px_35px_rgba(6,182,212,0.3)] backdrop-blur-md text-sm font-bold text-cyan-300">
          <CheckCircle2 size={18} className="text-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1400px] px-6 sm:px-10 py-8 flex flex-col gap-8 pb-28">
        
        {/* ── Top Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/50 border border-slate-800/80 p-7 sm:p-9 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Subtle glow border top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-500"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, ${accentSecondary}, transparent)`
            }}
          />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${accent}25, rgba(15,23,42,0.9))`
                }}
              >
                <Swords size={32} style={{ color: accent }} />
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    AI Prediction Engine
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">•</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {globalTournament || 'All Tournament Brackets'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase text-white font-['Outfit',sans-serif]">
                  Match Predictions
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Cast your winner votes before matches begin. AI analytics continuously evaluate player kill ratios, map performance, and win probability.
                </p>
              </div>
            </div>

            {/* Quick Action & Controls */}
            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
                <span>Refresh Odds</span>
              </button>
            </div>
          </div>

          {/* ── Progress & Overview Strip ── */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Matches */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Matches</span>
                <Clock size={16} className="text-slate-500" />
              </div>
              <div className="text-2xl font-black text-white font-['Outfit']">
                {totalMatchesCount} <span className="text-xs text-slate-500 font-normal">Scheduled</span>
              </div>
            </div>

            {/* Picks Locked In */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Your Picks</span>
                <CheckCircle2 size={16} style={{ color: accent }} />
              </div>
              <div className="text-2xl font-black text-white font-['Outfit']">
                {pickedMatchesCount} <span className="text-xs font-bold text-slate-500">/ {totalMatchesCount} Locked</span>
              </div>
            </div>

            {/* Pick'em Completion */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Progress</span>
                <span className="text-xs font-black" style={{ color: accent }}>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{
                    width: `${completionPercentage}%`,
                    background: `linear-gradient(90deg, ${accent}, ${accentSecondary})`
                  }}
                />
              </div>
            </div>

            {/* AI Model Rating */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">AI Confidence</span>
                <BrainCircuit size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-1.5">
                <span>{avgConfidence}%</span>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Calibrated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Toolbar: Filters & Search ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center p-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filterMode === 'all'
                  ? 'bg-gradient-to-r from-slate-800 to-slate-700/80 text-white shadow-md border border-slate-600/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>All ({matches.length})</span>
            </button>
            <button
              onClick={() => setFilterMode('unpredicted')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filterMode === 'unpredicted'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle size={13} />
              <span>Needs Pick ({matches.length - pickedMatchesCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('predicted')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filterMode === 'predicted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Picks Locked ({pickedMatchesCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team or stage..."
              className="w-full bg-slate-900/60 border border-slate-800/80 focus:border-cyan-500/50 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* ── Match Cards Arena ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw size={32} className="animate-spin text-cyan-400" />
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Calculating Showdown Analytics & Odds...
            </div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-4">
              <CalendarX size={32} />
            </div>
            <h3 className="text-lg font-black uppercase text-white tracking-wider">No Matches Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
              {searchQuery || filterMode !== 'all'
                ? 'No matches match your current search or filter criteria.'
                : `There are no upcoming matches scheduled for "${globalTournament || 'this tournament'}".`}
            </p>
            {(searchQuery || filterMode !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterMode('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-wider text-slate-200 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredMatches.map((match) => {
              const userPrediction = getPredictionForMatch(match.match_id);
              const predictedTeamId = userPrediction?.predicted_winner_team_id;

              const teamA = match.team_a;
              const teamB = match.team_b;

              const pA = match.system_prediction?.probability_a ?? 50;
              const pB = match.system_prediction?.probability_b ?? 50;
              const aiFavorsTeamA = pA > pB;
              const aiFavorsTeamB = pB > pA;

              const isTeamAPicked = predictedTeamId === teamA.team_id;
              const isTeamBPicked = predictedTeamId === teamB.team_id;

              const formattedDate = match.match_schedule
                ? new Date(match.match_schedule).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                : 'Upcoming';

              return (
                <div
                  key={match.match_id}
                  className="group relative overflow-hidden rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                >
                  {/* Glowing ambient rim */}
                  <div
                    className="absolute inset-x-0 top-0 h-[1.5px] opacity-30 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: isTeamAPicked
                        ? `linear-gradient(90deg, ${accent}, transparent)`
                        : isTeamBPicked
                        ? 'linear-gradient(90deg, transparent, #f43f5e)'
                        : 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent)'
                    }}
                  />

                  {/* ── Card Header Strip ── */}
                  <div className="px-6 py-3.5 border-b border-slate-800/60 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-800/80 text-slate-300 border border-slate-700/60 text-[10px]">
                        {match.format || 'BO3'}
                      </span>
                      <span className="text-slate-400 font-bold uppercase tracking-wide text-[11px]">
                        {match.stage || match.tournament_name || 'Tournament Playoff'}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-500" />
                        {formattedDate}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {predictedTeamId ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          <span>
                            Pick Locked: {isTeamAPicked ? teamA.team_name : teamB.team_name}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          <AlertCircle size={13} className="text-amber-400" />
                          <span>Vote Needed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Match Arena Showdown Grid ── */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* ── TEAM A (Left Side) ── */}
                    <div className="md:col-span-4 flex flex-col items-center text-center">
                      <div
                        onClick={() => handlePredict(match, teamA)}
                        className={`w-full group/btn relative cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col items-center gap-4 ${
                          isTeamAPicked
                            ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)] scale-[1.02]'
                            : 'bg-slate-950/40 hover:bg-slate-800/50 border-slate-800/80 hover:border-cyan-500/50'
                        }`}
                      >
                        {/* Team Avatar Badge */}
                        <div
                          className={`relative w-20 h-20 rounded-2xl flex items-center justify-center font-black text-xl tracking-wider transition-all shadow-xl ${
                            isTeamAPicked
                              ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                              : 'bg-slate-900 text-slate-200 border border-slate-700 group-hover/btn:border-cyan-400/60'
                          }`}
                        >
                          {teamA.logo_url ? (
                            <img
                              src={teamA.logo_url}
                              alt={teamA.team_name}
                              className="w-14 h-14 object-contain"
                            />
                          ) : (
                            <span>{teamA.team_name.substring(0, 3).toUpperCase()}</span>
                          )}

                          {isTeamAPicked && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md animate-scale">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        {/* Team Name & Meta */}
                        <div className="flex flex-col items-center">
                          <h3 className="text-lg font-black uppercase text-white font-['Outfit'] tracking-wide">
                            {teamA.team_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {teamA.seed && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                                {teamA.seed}
                              </span>
                            )}
                            {teamA.region && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">
                                {teamA.region}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Selection Button */}
                        <button
                          type="button"
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            isTeamAPicked
                              ? 'bg-cyan-400 text-slate-950 shadow-md font-extrabold'
                              : 'bg-slate-800/90 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-slate-700/60 group-hover/btn:border-cyan-400'
                          }`}
                        >
                          {isTeamAPicked ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Selected Winner</span>
                            </>
                          ) : (
                            <span>Pick {teamA.team_name}</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ── CENTER: PROBABILITY & AI INTEL (Center Column) ── */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center px-2 py-3 gap-4">
                      {/* VS Hex Badge */}
                      <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-700/70 flex items-center justify-center font-black italic text-sm text-slate-400 shadow-inner group-hover:scale-110 transition-transform">
                          VS
                        </div>
                      </div>

                      {/* Odds Numbers Comparison */}
                      <div className="w-full flex items-baseline justify-between px-2">
                        <div className="flex flex-col items-start">
                          <span className="text-2xl font-black text-cyan-400 font-['Outfit']">{pA}%</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Win Probability
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-black text-rose-400 font-['Outfit']">{pB}%</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Win Probability
                          </span>
                        </div>
                      </div>

                      {/* Dual Win Probability Bar */}
                      <div className="w-full h-3 rounded-full bg-slate-950/80 border border-slate-800 overflow-hidden flex shadow-inner">
                        <div
                          className="h-full transition-all duration-700 rounded-l-full shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                          style={{
                            width: `${pA}%`,
                            background: `linear-gradient(90deg, ${accent}, #38bdf8)`
                          }}
                        />
                        <div
                          className="h-full transition-all duration-700 rounded-r-full shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                          style={{
                            width: `${pB}%`,
                            background: 'linear-gradient(90deg, #fb7185, #f43f5e)'
                          }}
                        />
                      </div>

                      {/* AI Intel Callout Pill */}
                      {match.system_prediction && (
                        <div className="w-full rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 flex flex-col gap-1.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                            <Sparkles size={13} className="text-amber-400 animate-pulse" />
                            <span>
                              AI Model Favors:{' '}
                              <strong className="text-white underline decoration-amber-400/60">
                                {match.system_prediction.predicted_winner_name}
                              </strong>
                            </span>
                          </div>
                          {match.system_prediction.reasoning && (
                            <p className="text-[11px] text-slate-400 font-normal leading-relaxed line-clamp-2 italic">
                              "{match.system_prediction.reasoning}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── TEAM B (Right Side) ── */}
                    <div className="md:col-span-4 flex flex-col items-center text-center">
                      <div
                        onClick={() => handlePredict(match, teamB)}
                        className={`w-full group/btn relative cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col items-center gap-4 ${
                          isTeamBPicked
                            ? 'bg-gradient-to-b from-rose-950/40 to-slate-900/90 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.35)] scale-[1.02]'
                            : 'bg-slate-950/40 hover:bg-slate-800/50 border-slate-800/80 hover:border-rose-500/50'
                        }`}
                      >
                        {/* Team Avatar Badge */}
                        <div
                          className={`relative w-20 h-20 rounded-2xl flex items-center justify-center font-black text-xl tracking-wider transition-all shadow-xl ${
                            isTeamBPicked
                              ? 'bg-rose-500/20 text-rose-300 border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                              : 'bg-slate-900 text-slate-200 border border-slate-700 group-hover/btn:border-rose-400/60'
                          }`}
                        >
                          {teamB.logo_url ? (
                            <img
                              src={teamB.logo_url}
                              alt={teamB.team_name}
                              className="w-14 h-14 object-contain"
                            />
                          ) : (
                            <span>{teamB.team_name.substring(0, 3).toUpperCase()}</span>
                          )}

                          {isTeamBPicked && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md animate-scale">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        {/* Team Name & Meta */}
                        <div className="flex flex-col items-center">
                          <h3 className="text-lg font-black uppercase text-white font-['Outfit'] tracking-wide">
                            {teamB.team_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {teamB.seed && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                                {teamB.seed}
                              </span>
                            )}
                            {teamB.region && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400/80">
                                {teamB.region}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Selection Button */}
                        <button
                          type="button"
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            isTeamBPicked
                              ? 'bg-rose-500 text-white shadow-md font-extrabold'
                              : 'bg-slate-800/90 hover:bg-rose-500 hover:text-white text-slate-300 border border-slate-700/60 group-hover/btn:border-rose-400'
                          }`}
                        >
                          {isTeamBPicked ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Selected Winner</span>
                            </>
                          ) : (
                            <span>Pick {teamB.team_name}</span>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* ── Match Card Footer Hint ── */}
                  <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Zap size={12} className="text-amber-400/70" />
                      Tap either team card to lock or change your prediction anytime before start.
                    </span>
                    <span className="font-semibold text-slate-400 hidden sm:inline">
                      Showdown ID: #{match.match_id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions;
