import React, { useState, useEffect, useMemo, useRef } from "react";
import { apiFetch } from "../../utils/api";

/* ──────────────────── SVG Icons ──────────────────── */
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const CrownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
  </svg>
);
const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 9H2v3a4 4 0 004 4M6 9v4a6 6 0 006 6m6-10h4v3a4 4 0 01-4 4m0-7v4a6 6 0 01-6 6m0 0v3m-4 0h8" />
  </svg>
);
const SkullIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12v3.5c0 1.38 1.12 2.5 2.5 2.5h1v-3H4v-3c0-4.42 3.58-8 8-8s8 3.58 8 8v3h-1.5v3h1c1.38 0 2.5-1.12 2.5-2.5V12c0-5.52-4.48-10-10-10zm-3 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
  </svg>
);
const HandshakeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 6H9v2H5V4h6v2zm8 0v4h-4V8h-2V6h6zM5 18v-4h4v2h2v2H5zm8 0v-2h2v-2h4v4h-6zm-1-6a2 2 0 100-4 2 2 0 000 4z"/>
  </svg>
);
const CrosshairIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" />
  </svg>
);
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
  </svg>
);

/* ──────────────── Animated Number ────────────────── */
const AnimatedNum = ({ value, suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) { setDisplay(value); return; }
    let startT = null;
    const dur = 600;
    const step = (ts) => {
      if (!startT) startT = ts;
      const p = Math.min((ts - startT) / dur, 1);
      setDisplay(Number.isInteger(num) ? Math.round(p * num) : (p * num).toFixed(2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display}{suffix}</>;
};

/* ──────────────── Rank Badge Component ───────────── */
const RankBadge = ({ rank, size = "md" }) => {
  const sizes = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };
  const getStyle = () => {
    if (rank === 1) return "bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]";
    if (rank === 2) return "bg-gradient-to-br from-slate-300 to-slate-500 text-black shadow-[0_0_12px_rgba(148,163,184,0.3)]";
    if (rank === 3) return "bg-gradient-to-br from-orange-400 to-orange-700 text-black shadow-[0_0_12px_rgba(234,88,12,0.3)]";
    return "bg-slate-800 text-theme-text-muted border border-slate-700";
  };
  return (
    <div className={`${sizes[size]} ${getStyle()} rounded-lg flex items-center justify-center font-black`}>
      {rank === 1 ? <CrownIcon /> : rank}
    </div>
  );
};

/* ──────────── Inline Stat Bar ──────────── */
const StatBar = ({ value, max, color, label }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider w-8 text-right">{label}</span>
      <div className="flex-1 h-[6px] rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      <span className="text-[10px] font-bold w-10 text-right" style={{ color }}>{value}</span>
    </div>
  );
};

/* ──────────── Top 3 Podium ──────────── */
const PodiumCard = ({ player, accent, maxKills, maxAp }) => {
  if (!player) return null;
  const isFirst = player.rank === 1;
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
        isFirst
          ? "border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-bg-200 shadow-[0_0_40px_rgba(245,158,11,0.12)]"
          : "border-slate-700/50 bg-bg-200"
      }`}
      style={{ padding: "24px" }}
    >
      {isFirst && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      )}
      <div className="flex items-start gap-4">
        <RankBadge rank={player.rank} size="lg" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-theme-text-base truncate tracking-wide">{player.name}</h4>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">K/D</span>
            <span className="text-sm font-black" style={{ color: accent }}>{player.kd}</span>
            <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest ml-2">K/R</span>
            <span className="text-sm font-black" style={{ color: accent }}>{player.kr}</span>
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <StatBar value={player.kills} max={maxKills} color={accent} label="K" />
            <StatBar value={player.ap} max={maxAp} color="#10b981" label="AP" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────── Category Ranking Card ──────────── */
const CategoryCard = ({ title, icon, data, valueKey, valueLabel, accent, accentBg }) => {
  // Always display at least 5 rows with clean placeholders if there are fewer or no records
  const displayRows = [...(data || [])];
  const minRows = 5;
  while (displayRows.length < minRows) {
    displayRows.push({
      rank: displayRows.length + 1,
      ign: "—",
      team: "—",
      [valueKey]: "—",
      isPlaceholder: true,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-bg-200 overflow-hidden hover:border-slate-600/60 transition-all duration-300 group">
      {/* Top accent line */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/60" style={{ padding: "16px 20px" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accentBg }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-theme-text-base">{title}</h3>
      </div>

      {/* Table */}
      <div className="overflow-y-auto max-h-[280px] custom-scrollbar">
        <table className="w-full text-[10px]">
          <thead className="sticky top-0 z-10 bg-bg-300/95 backdrop-blur-sm border-b border-slate-800">
            <tr>
              <th className="text-center font-bold text-theme-text-muted tracking-[0.15em] uppercase" style={{ padding: "10px 8px" }}>#</th>
              <th className="text-left font-bold text-theme-text-muted tracking-[0.15em] uppercase" style={{ padding: "10px 8px" }}>Player</th>
              <th className="text-left font-bold text-theme-text-muted tracking-[0.15em] uppercase" style={{ padding: "10px 8px" }}>Team</th>
              <th className="text-center font-bold tracking-[0.15em] uppercase" style={{ padding: "10px 8px", color: accent }}>{valueLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {displayRows.map((p, i) => (
              <tr key={i} className={`hover:bg-slate-800/30 transition-colors ${p.isPlaceholder ? "opacity-75" : ""}`}>
                <td className="text-center" style={{ padding: "10px 8px" }}>
                  <RankBadge rank={p.rank} size="sm" />
                </td>
                <td
                  className={`text-left font-bold truncate max-w-[100px] ${p.isPlaceholder ? "text-theme-text-muted/50" : "text-theme-text-base"}`}
                  style={{ padding: "10px 8px" }}
                  title={p.ign}
                >
                  {p.ign}
                </td>
                <td
                  className={`text-left text-[9px] truncate max-w-[80px] ${p.isPlaceholder ? "text-theme-text-muted/40" : "text-theme-text-muted"}`}
                  style={{ padding: "10px 8px" }}
                  title={p.team}
                >
                  {p.team}
                </td>
                <td
                  className={`text-center font-black ${p.isPlaceholder ? "text-theme-text-muted/40" : ""}`}
                  style={{ padding: "10px 8px", color: p.isPlaceholder ? undefined : accent }}
                >
                  {p[valueKey]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════ */
/*                MAIN COMPONENT                     */
/* ══════════════════════════════════════════════════ */
const PlayerRankings = ({ globalGame, globalTournament }) => {
  const activeGame = (globalGame || "VALORANT").toUpperCase();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("daily");
  const [sortCol, setSortCol] = useState("kills");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedWeek, setSelectedWeek] = useState(null); // null = latest
  const [selectedDay, setSelectedDay] = useState(null);   // null = latest
  const [dbValorantStats, setDbValorantStats] = useState([]);
  const [dbCrossfireStats, setDbCrossfireStats] = useState([]);
  const [matchRecords, setMatchRecords] = useState([]);
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [showAllRows, setShowAllRows] = useState(false);

  useEffect(() => {
    setMatchRecords([]);
    apiFetch(`/api/stats/valorant?tournament=${encodeURIComponent(globalTournament || 'Default')}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setDbValorantStats(data); else setDbValorantStats([]); })
      .catch(console.error);

    apiFetch(`/api/stats/crossfire?tournament=${encodeURIComponent(globalTournament || 'Default')}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setDbCrossfireStats(data); else setDbCrossfireStats([]); })
      .catch(console.error);

    apiFetch(`/api/match-records?tournament=${encodeURIComponent(globalTournament || 'Default')}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMatchRecords(data); else setMatchRecords([]); })
      .catch(console.error);
  }, [globalTournament]);

  /* ────── Data Processing ────── */
  const aggregateMatchRecords = (records) => {
    const playerStats = {};
    records.forEach((r) => {
      const ign = r.ign;
      if (!ign) return;
      if (!playerStats[ign]) {
        playerStats[ign] = { ign, team: r.team_name || "", kills: 0, deaths: 0, rounds: 0, headshots: 0, assists: 0, acs: 0, matchCount: 0 };
      }
      playerStats[ign].kills += Number(r.kills) || 0;
      playerStats[ign].deaths += Number(r.deaths) || 0;
      playerStats[ign].rounds += Number(r.rounds) || 0;
      playerStats[ign].headshots += Number(r.headshots) || 0;
      playerStats[ign].assists += Number(r.assists) || 0;
      playerStats[ign].acs += Number(r.acs) || 0;
      playerStats[ign].matchCount += 1;
    });
    return Object.values(playerStats)
      .sort((a, b) => b.kills - a.kills)
      .map((p, idx) => {
        const kd = p.deaths ? (p.kills / p.deaths).toFixed(2) : p.kills.toFixed(2);
        const kr = p.rounds ? (p.kills / p.rounds).toFixed(2) : "0.00";
        const sr = p.rounds ? ((p.rounds - p.deaths) / p.rounds).toFixed(2) : "0.00";
        const hk = p.kills ? (p.headshots / p.kills).toFixed(2) : "0.00";
        const ap = Math.round((p.kills / (p.rounds || 1)) * 100);
        return { rank: idx + 1, name: p.ign, team: p.team, kills: p.kills, death: p.deaths, round: p.rounds, assists: p.assists, acs: p.acs, matchCount: p.matchCount, kd, kr, sr, hk, ap };
      });
  };

  // ── Derive available weeks and days for the selector ──
  const { availableWeeks, availableDaysPerWeek } = useMemo(() => {
    if (!matchRecords || matchRecords.length === 0) return { availableWeeks: [], availableDaysPerWeek: {} };
    const gameRecords = matchRecords.filter((r) => !r.game || (r.game || "").toUpperCase() === activeGame);
    const weeksSet = new Set();
    const daysMap = {};
    gameRecords.forEach((r) => {
      const w = r.week;
      const d = r.day;
      if (w == null) return;
      weeksSet.add(String(w));
      if (!daysMap[w]) daysMap[w] = new Set();
      if (d != null) daysMap[w].add(String(d));
    });
    const sortedWeeks = [...weeksSet].sort((a, b) => Number(a) - Number(b));
    const sortedDays = {};
    Object.keys(daysMap).forEach((w) => {
      sortedDays[w] = [...daysMap[w]].sort((a, b) => Number(a) - Number(b));
    });
    return { availableWeeks: sortedWeeks, availableDaysPerWeek: sortedDays };
  }, [matchRecords, activeGame]);

  // ── Resolve effective week/day (latest if not manually selected) ──
  const effectiveWeek = useMemo(() => {
    if (availableWeeks.length === 0) return null;
    if (selectedWeek && availableWeeks.includes(selectedWeek)) return selectedWeek;
    // Default: highest week number
    return availableWeeks[availableWeeks.length - 1];
  }, [availableWeeks, selectedWeek]);

  const effectiveDay = useMemo(() => {
    if (!effectiveWeek) return null;
    const days = availableDaysPerWeek[effectiveWeek] || [];
    if (days.length === 0) return null;
    if (selectedDay && days.includes(selectedDay)) return selectedDay;
    // Default: highest day number in the effective week
    return days[days.length - 1];
  }, [effectiveWeek, availableDaysPerWeek, selectedDay]);

  const { displayDailyPlayers, displayWeeklyPlayers } = useMemo(() => {
    if (!matchRecords || matchRecords.length === 0) return { displayDailyPlayers: [], displayWeeklyPlayers: [] };
    const gameRecords = matchRecords.filter((r) => !r.game || (r.game || "").toUpperCase() === activeGame);
    if (gameRecords.length === 0) return { displayDailyPlayers: [], displayWeeklyPlayers: [] };
    if (!effectiveWeek) return { displayDailyPlayers: [], displayWeeklyPlayers: [] };
    const weeklyRecords = gameRecords.filter((r) => String(r.week) === effectiveWeek);
    const dailyRecords = weeklyRecords.filter((r) => effectiveDay == null || String(r.day) === effectiveDay);
    return {
      displayDailyPlayers: aggregateMatchRecords(dailyRecords),
      displayWeeklyPlayers: aggregateMatchRecords(weeklyRecords),
    };
  }, [matchRecords, activeGame, effectiveWeek, effectiveDay]);

  const categoryRankings = useMemo(() => {
    const emptyResult = {
      topKills: [],
      leastDeaths: [],
      topAssists: [],
      topKda: [],
      topAcs: [],
    };
    if (!matchRecords || matchRecords.length === 0) return emptyResult;
    const vRecords = matchRecords.filter(r => !r.game || (r.game || "").toUpperCase() === activeGame);
    if (vRecords.length === 0) return emptyResult;
    const stats = {};
    vRecords.forEach(r => {
      const ign = r.ign;
      if (!ign) return;
      if (!stats[ign]) stats[ign] = { ign, team: r.team_name || "—", kills: 0, deaths: 0, assists: 0, acs: 0, matchCount: 0 };
      stats[ign].kills += Number(r.kills) || 0;
      stats[ign].deaths += Number(r.deaths) || 0;
      stats[ign].assists += Number(r.assists) || 0;
      stats[ign].acs += Number(r.acs) || 0;
      stats[ign].matchCount += 1;
    });
    const players = Object.values(stats).map(p => {
      const kda = p.deaths === 0 ? p.kills + p.assists : (p.kills + p.assists) / p.deaths;
      const avgAcs = p.matchCount === 0 ? 0 : p.acs / p.matchCount;
      return { ...p, kda: kda.toFixed(2), avgAcs: Math.round(avgAcs) };
    });
    return {
      topKills: [...players].sort((a, b) => b.kills - a.kills).map((p, i) => ({ ...p, rank: i + 1 })),
      leastDeaths: [...players].sort((a, b) => a.deaths - b.deaths).map((p, i) => ({ ...p, rank: i + 1 })),
      topAssists: [...players].sort((a, b) => b.assists - a.assists).map((p, i) => ({ ...p, rank: i + 1 })),
      topKda: [...players].sort((a, b) => Number(b.kda) - Number(a.kda)).map((p, i) => ({ ...p, rank: i + 1 })),
      topAcs: [...players].sort((a, b) => b.avgAcs - a.avgAcs).map((p, i) => ({ ...p, rank: i + 1 })),
    };
  }, [matchRecords, activeGame]);

  /* ────── Sorting & Filtering ────── */
  const currentPlayers = activeTab === "daily" ? displayDailyPlayers : displayWeeklyPlayers;
  const accent = activeGame === "VALORANT" ? "#ff4655" : "#4c7fd6";
  const accentAlt = activeGame === "VALORANT" ? "#a855f7" : "#22d3ee";

  const columns = [
    { key: "kills", label: "Kills", highlight: true },
    { key: "death", label: "Deaths" },
    { key: "round", label: "Rounds" },
    { key: "kd", label: "K/D", accent: true },
    { key: "kr", label: "K/R", accent: true },
    { key: "sr", label: "S/R", accent: true },
    { key: "hk", label: "H/K", accent: true },
    { key: "ap", label: "ACS", special: true },
  ];

  const sortedPlayers = useMemo(() => {
    // 1. Sort all players based on sortCol & sortDir and assign overall ranks
    const allSorted = [...currentPlayers].sort((a, b) => {
      const aVal = parseFloat(a[sortCol]) || 0;
      const bVal = parseFloat(b[sortCol]) || 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    }).map((p, i) => ({ ...p, rank: i + 1 }));

    // 2. Filter by search query (case-insensitive on name / IGN, team, or rank)
    const q = search.trim().toLowerCase();
    if (!q) return allSorted;

    return allSorted.filter((p) => {
      const matchName = (p.name || "").toLowerCase().includes(q);
      const matchTeam = (p.team || "").toLowerCase().includes(q);
      const matchRank = String(p.rank) === q;
      return matchName || matchTeam || matchRank;
    });
  }, [currentPlayers, search, sortCol, sortDir]);

  const maxKills = sortedPlayers.length > 0 ? Math.max(...sortedPlayers.map(p => p.kills)) : 1;
  const maxAp = sortedPlayers.length > 0 ? Math.max(...sortedPlayers.map(p => p.ap)) : 1;
  const top3 = sortedPlayers.slice(0, 3);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  /* ────── Summary Stats ────── */
  const summaryStats = useMemo(() => {
    if (sortedPlayers.length === 0) return { totalPlayers: 0, totalKills: 0, avgKd: "0.00", totalRounds: 0 };
    const totalKills = sortedPlayers.reduce((s, p) => s + p.kills, 0);
    const avgKd = (sortedPlayers.reduce((s, p) => s + parseFloat(p.kd), 0) / sortedPlayers.length).toFixed(2);
    const totalRounds = sortedPlayers.reduce((s, p) => s + p.round, 0);
    return { totalPlayers: sortedPlayers.length, totalKills, avgKd, totalRounds };
  }, [sortedPlayers]);

  return (
    <div className="flex-1 bg-bg-100 text-theme-text-base overflow-y-auto flex flex-col custom-scrollbar">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .anim-fade { animation: fadeInUp 0.5s ease-out both; }
        .anim-delay-1 { animation-delay: 0.1s; }
        .anim-delay-2 { animation-delay: 0.2s; }
        .anim-delay-3 { animation-delay: 0.3s; }
        .sort-btn { cursor: pointer; user-select: none; transition: color 0.2s; }
        .sort-btn:hover { color: ${accent} !important; }
        .row-hover-glow:hover { box-shadow: inset 3px 0 0 ${accent}; }
      `}</style>

      <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto" style={{ padding: "32px 40px 64px 40px" }}>

        {/* ═══════════ HERO HEADER ═══════════ */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/40 anim-fade" style={{ marginBottom: "32px" }}>
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-30" style={{
            background: `linear-gradient(135deg, ${accent}22, transparent 50%, ${accentAlt}18)`,
          }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
            background: `linear-gradient(90deg, transparent, ${accent}, ${accentAlt}, transparent)`,
          }} />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ padding: "32px 40px" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
                <span style={{ color: accent }}><TrophyIcon /></span>
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-[0.15em] text-theme-text-base">
                  Player Rankings
                </h1>
                <p className="text-xs text-theme-text-muted mt-1 font-medium tracking-wide">
                  {activeGame} • {globalTournament || "Default Tournament"} • {activeTab === "daily" ? "Daily" : "Weekly"} View
                  {effectiveWeek && (
                    <span className="ml-2 font-black" style={{ color: accent }}>W{effectiveWeek}{activeTab === "daily" && effectiveDay ? ` D${effectiveDay}` : ""}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Summary pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-bg-200 border border-slate-700/50 rounded-xl flex items-center gap-2" style={{ padding: "8px 16px" }}>
                <span className="text-[10px] text-theme-text-muted uppercase tracking-widest font-bold">Players</span>
                <span className="text-sm font-black" style={{ color: accent }}>{summaryStats.totalPlayers}</span>
              </div>
              <div className="bg-bg-200 border border-slate-700/50 rounded-xl flex items-center gap-2" style={{ padding: "8px 16px" }}>
                <span className="text-[10px] text-theme-text-muted uppercase tracking-widest font-bold">Total Kills</span>
                <span className="text-sm font-black text-emerald-400">{summaryStats.totalKills}</span>
              </div>
              <div className="bg-bg-200 border border-slate-700/50 rounded-xl flex items-center gap-2" style={{ padding: "8px 16px" }}>
                <span className="text-[10px] text-theme-text-muted uppercase tracking-widest font-bold">Avg K/D</span>
                <span className="text-sm font-black text-amber-400">{summaryStats.avgKd}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ CONTROLS BAR ═══════════ */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 anim-fade anim-delay-1" style={{ marginBottom: "24px" }}>
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-slate-700/50 bg-bg-200">
            {[
              { key: "daily", label: "Daily", icon: "D" },
              { key: "weekly", label: "Weekly", icon: "W" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-200 ${
                  activeTab === tab.key
                    ? "text-theme-text-base"
                    : "text-theme-text-muted hover:text-theme-text-base hover:bg-slate-800/40"
                }`}
                style={{
                  padding: "12px 24px",
                  ...(activeTab === tab.key ? { background: `${accent}15`, borderBottom: `2px solid ${accent}` } : {}),
                }}
              >
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black"
                  style={activeTab === tab.key ? { background: `${accent}25`, color: accent } : { background: "transparent" }}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center text-theme-text-muted" style={{ paddingLeft: "14px" }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search player or team..."
              className="w-full bg-bg-200 border border-slate-700/50 text-sm text-theme-text-base rounded-xl focus:outline-none transition-all placeholder-slate-600 font-medium"
              style={{ padding: "12px 38px 12px 42px", borderColor: search ? accent : undefined }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Week Selector */}
          {availableWeeks.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-bg-200 border border-slate-700/50 rounded-xl overflow-hidden">
                <span className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest pl-3">Week</span>
                <select
                  value={selectedWeek || effectiveWeek || ""}
                  onChange={(e) => { setSelectedWeek(e.target.value); setSelectedDay(null); }}
                  className="bg-transparent text-xs font-black text-theme-text-base focus:outline-none cursor-pointer"
                  style={{ padding: "10px 12px 10px 4px", color: accent }}
                >
                  {availableWeeks.map((w) => (
                    <option key={w} value={w} style={{ background: "#0f172a" }}>
                      Week {w}{w === availableWeeks[availableWeeks.length - 1] ? " \u2605" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Selector - only for Daily tab */}
              {activeTab === "daily" && effectiveWeek && (availableDaysPerWeek[effectiveWeek] || []).length > 0 && (
                <div className="flex items-center gap-2 bg-bg-200 border border-slate-700/50 rounded-xl overflow-hidden">
                  <span className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest pl-3">Day</span>
                  <select
                    value={selectedDay || effectiveDay || ""}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="bg-transparent text-xs font-black text-theme-text-base focus:outline-none cursor-pointer"
                    style={{ padding: "10px 12px 10px 4px", color: accentAlt }}
                  >
                    {(availableDaysPerWeek[effectiveWeek] || []).map((d) => {
                      const days = availableDaysPerWeek[effectiveWeek] || [];
                      return (
                        <option key={d} value={d} style={{ background: "#0f172a" }}>
                          Day {d}{d === days[days.length - 1] ? " \u2605" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {!selectedWeek && !selectedDay ? (
                <span className="text-[9px] font-black uppercase tracking-widest rounded-md" style={{ padding: "4px 10px", background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
                  Latest
                </span>
              ) : (
                <button
                  onClick={() => { setSelectedWeek(null); setSelectedDay(null); }}
                  className="text-[9px] font-black uppercase tracking-widest rounded-md text-theme-text-muted hover:text-white transition-colors"
                  style={{ padding: "4px 10px", background: "#1e293b", border: "1px solid #334155" }}
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>


        {/* ═══════════ TOP 3 PODIUM ═══════════ */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 anim-fade anim-delay-2" style={{ marginBottom: "24px" }}>
            {top3.map((p) => (
              <PodiumCard key={p.rank} player={p} accent={accent} maxKills={maxKills} maxAp={maxAp} />
            ))}
          </div>
        )}

        {/* ═══════════ MAIN RANKING TABLE ═══════════ */}
        <div className="rounded-2xl border border-slate-700/40 bg-bg-200 overflow-hidden anim-fade anim-delay-3" style={{ marginBottom: "32px" }}>
          {/* Table accent line */}
          <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

          {/* Table Header Toolbar: Standings Title, Quick Search & View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 bg-bg-300/40" style={{ padding: "14px 20px" }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-theme-text-base">
                  Player Standings
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-700/60 bg-slate-800/60 text-theme-text-muted">
                {search.trim() ? (
                  <>Found <span style={{ color: accent }}>{sortedPlayers.length}</span> of {currentPlayers.length}</>
                ) : (
                  <>{sortedPlayers.length} Players</>
                )}
              </span>
              {!showAllRows && sortedPlayers.length > 5 && (
                <span className="hidden sm:inline-flex text-[9px] font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50 items-center gap-1">
                  <span>↓</span> Showing 1–5 (Scrollable)
                </span>
              )}
            </div>

            {/* Right side: Table Search & 5 Rows / All Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-text-muted">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search player or team..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl text-xs text-theme-text-base pl-9 pr-8 py-2 focus:outline-none transition-colors placeholder:text-slate-500 font-medium"
                  style={{ borderColor: search ? accent : undefined }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Toggle: 5 Rows vs Show All */}
              {sortedPlayers.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllRows(!showAllRows)}
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-700/60 text-theme-text-muted hover:text-white transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                  title={showAllRows ? "Collapse to 5 rows scrollable" : "Expand to show all rows"}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showAllRows ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    )}
                  </svg>
                  {showAllRows ? "Fit 5" : "All"}
                </button>
              )}
            </div>
          </div>
          
          {/* Scrollable table viewport: fixed to ~5 rows visible by default */}
          <div
            className={`overflow-x-auto custom-scrollbar relative ${
              showAllRows ? "overflow-y-visible" : "overflow-y-auto"
            }`}
            style={{
              maxHeight: showAllRows ? "none" : "355px",
              scrollBehavior: "smooth",
            }}
          >
            <table className="w-full text-[11px] relative">
              <thead className="sticky top-0 z-20 border-b border-slate-800 shadow-sm" style={{ backgroundColor: "#0f172a" }}>
                <tr>
                  <th className="text-center text-theme-text-muted font-bold text-[9px] tracking-[0.2em] uppercase sticky top-0" style={{ padding: "16px 12px", width: "56px", backgroundColor: "#0f172a" }}>
                    #
                  </th>
                  <th className="text-left text-theme-text-muted font-bold text-[9px] tracking-[0.2em] uppercase sticky top-0" style={{ padding: "16px 12px", backgroundColor: "#0f172a" }}>
                    Player
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-center sort-btn font-bold text-[9px] tracking-[0.2em] uppercase sticky top-0"
                      style={{
                        padding: "16px 8px",
                        backgroundColor: "#0f172a",
                        color: col.accent ? `${accent}99` : col.special ? "#10b981aa" : undefined,
                      }}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortCol === col.key && (
                          <span className="text-[8px]">{sortDir === "desc" ? "▼" : "▲"}</span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {sortedPlayers.length > 0 ? (
                  sortedPlayers.map((p, i) => (
                    <tr
                      key={p.name || i}
                      className="hover:bg-slate-800/25 transition-all duration-200 row-hover-glow cursor-pointer group"
                      onClick={() => setExpandedPlayer(expandedPlayer === p.name ? null : p.name)}
                    >
                      <td className="text-center" style={{ padding: "14px 12px" }}>
                        <RankBadge rank={p.rank} size="sm" />
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <div className="flex items-center gap-3">
                          {/* Avatar placeholder */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] border"
                            style={{
                              background: `${accent}10`,
                              borderColor: `${accent}20`,
                              color: accent,
                            }}
                          >
                            {p.name ? p.name[0].toUpperCase() : "?"}
                          </div>
                          <div className="min-w-0">
                            <span className="text-theme-text-base font-bold block truncate max-w-[140px] group-hover:text-white transition-colors" title={p.name}>
                              {p.name}
                            </span>
                            {p.team && (
                              <span className="text-[9px] text-theme-text-muted block truncate max-w-[120px]">{p.team}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center font-bold text-theme-text-base" style={{ padding: "14px 8px" }}>
                        {p.kills}
                      </td>
                      <td className="text-center text-theme-text-muted" style={{ padding: "14px 8px" }}>
                        {p.death}
                      </td>
                      <td className="text-center text-theme-text-muted" style={{ padding: "14px 8px" }}>
                        {p.round}
                      </td>
                      <td className="text-center font-black" style={{ padding: "14px 8px", color: accent }}>
                        {p.kd}
                      </td>
                      <td className="text-center font-black" style={{ padding: "14px 8px", color: accent }}>
                        {p.kr}
                      </td>
                      <td className="text-center font-black" style={{ padding: "14px 8px", color: accent }}>
                        {p.sr}
                      </td>
                      <td className="text-center font-black" style={{ padding: "14px 8px", color: accent }}>
                        {p.hk}
                      </td>
                      <td className="text-center" style={{ padding: "14px 8px" }}>
                        <span
                          className="inline-block rounded-md font-black text-[10px]"
                          style={{
                            padding: "3px 10px",
                            background: "#10b98118",
                            color: "#10b981",
                            border: "1px solid #10b98130",
                          }}
                        >
                          {p.ap}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 2} className="text-center text-theme-text-muted" style={{ padding: "48px 0" }}>
                      <div className="flex flex-col items-center gap-2">
                        <SearchIcon />
                        <span className="text-sm font-medium">No players found{search ? ` matching "${search}"` : ""}</span>
                        <span className="text-[10px]">Try adjusting your search or filters</span>
                        {search && (
                          <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="border-t border-slate-800/50 bg-bg-300/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ padding: "12px 20px" }}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest">
                {search.trim() ? `Found ${sortedPlayers.length} of ${currentPlayers.length} players` : `${sortedPlayers.length} player${sortedPlayers.length !== 1 ? "s" : ""}`} • Sorted by {columns.find(c => c.key === sortCol)?.label || sortCol} {sortDir === "desc" ? "↓" : "↑"}
              </span>
              {!showAllRows && sortedPlayers.length > 5 && (
                <span className="text-[10px] text-slate-500 font-medium">
                  • Showing 1–5 (Scroll table for more)
                </span>
              )}
            </div>
            <span className="text-[10px] text-theme-text-muted font-medium">
              {activeTab === "daily"
                ? `Week ${effectiveWeek || "?"} • Day ${effectiveDay || "?"}`
                : `Week ${effectiveWeek || "?"} — All Days`
              }
            </span>
          </div>
        </div>

        {/* ═══════════ CATEGORY LEADERS ═══════════ */}
        {categoryRankings && (
          <div className="anim-fade" style={{ animationDelay: "0.4s" }}>
            {/* Section title */}
            <div className="flex items-center gap-3" style={{ marginBottom: "20px" }}>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-theme-text-muted">
                Category Leaders
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" style={{ paddingBottom: "32px" }}>
              <CategoryCard
                title="Total Kills"
                icon={<CrosshairIcon />}
                data={categoryRankings.topKills}
                valueKey="kills"
                valueLabel="Kills"
                accent="#ef4444"
                accentBg="#ef444418"
              />
              <CategoryCard
                title="Least Deaths"
                icon={<SkullIcon />}
                data={categoryRankings.leastDeaths}
                valueKey="deaths"
                valueLabel="Deaths"
                accent="#10b981"
                accentBg="#10b98118"
              />
              <CategoryCard
                title="Top Assists"
                icon={<HandshakeIcon />}
                data={categoryRankings.topAssists}
                valueKey="assists"
                valueLabel="Assists"
                accent="#3b82f6"
                accentBg="#3b82f618"
              />
              <CategoryCard
                title="Best KDA"
                icon={<ChartIcon />}
                data={categoryRankings.topKda}
                valueKey="kda"
                valueLabel="KDA"
                accent="#a855f7"
                accentBg="#a855f718"
              />
              <CategoryCard
                title="Highest ACS"
                icon={<TrophyIcon />}
                data={categoryRankings.topAcs}
                valueKey="avgAcs"
                valueLabel="ACS"
                accent="#f97316"
                accentBg="#f9731618"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PlayerRankings;
