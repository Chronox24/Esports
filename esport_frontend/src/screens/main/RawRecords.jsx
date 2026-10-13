import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../utils/api';

const RawRecords = ({ globalTournament }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameFilter, setGameFilter] = useState('All');
  const [selectedTournament, setSelectedTournament] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper for agent role categorization and badges
  const getAgentRoleStyle = (agentName) => {
    const agent = (agentName || '').toLowerCase().trim();
    if (['jett', 'reyna', 'raze', 'phoenix', 'yoru', 'neon', 'iso'].includes(agent)) {
      return { role: 'Duelist', icon: '🎯', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
    }
    if (['sova', 'breach', 'skye', 'kay/o', 'kayo', 'fade', 'gekko'].includes(agent)) {
      return { role: 'Initiator', icon: '⚡', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
    }
    if (['omen', 'brimstone', 'viper', 'astra', 'harbor', 'clove'].includes(agent)) {
      return { role: 'Controller', icon: '☁️', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
    }
    if (['killjoy', 'cypher', 'sage', 'chamber', 'deadlock', 'vyse'].includes(agent)) {
      return { role: 'Sentinel', icon: '🛡️', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
    }
    return { role: agentName || 'Flex', icon: '⚔️', badge: 'bg-slate-900 text-slate-300 border-slate-700' };
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Fetch all match records across tournaments without restricting parameter
      const res = await apiFetch('/api/match_records');
      if (!res.ok) throw new Error('Failed to fetch match records');
      const data = await res.json();
      setRecords(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching match records:', err);
      // Fallback try hyphen endpoint with tournament=all
      try {
        const fallbackRes = await apiFetch('/api/match-records?tournament=all');
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          setRecords(fbData || []);
          setError(null);
          return;
        }
      } catch (_) {}
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Distinct tournament options
  const tournamentOptions = useMemo(() => {
    const set = new Set();
    records.forEach(r => {
      if (r.tournament_name) set.add(r.tournament_name);
    });
    return ['All', ...Array.from(set)];
  }, [records]);

  // Comprehensive client-side multi-filter & search
  const filteredRecords = useMemo(() => {
    let list = records;

    // Game filter (case-insensitive)
    if (gameFilter !== 'All') {
      const g = gameFilter.toLowerCase();
      list = list.filter(r => (r.game || '').toLowerCase() === g);
    }

    // Tournament filter
    if (selectedTournament !== 'All') {
      list = list.filter(r => (r.tournament_name || '').toLowerCase() === selectedTournament.toLowerCase());
    }

    // Search query across all pertinent fields
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        (r.ign || '').toLowerCase().includes(q) ||
        (r.team_name || '').toLowerCase().includes(q) ||
        (r.map || '').toLowerCase().includes(q) ||
        (r.tournament_name || '').toLowerCase().includes(q) ||
        (r.game || '').toLowerCase().includes(q) ||
        (r.agent || '').toLowerCase().includes(q) ||
        (r.group_label || '').toLowerCase().includes(q) ||
        String(r.week || '').toLowerCase().includes(q) ||
        String(r.day || '').toLowerCase().includes(q) ||
        String(r.match || '').toLowerCase().includes(q) ||
        String(r.set_num || '').toLowerCase().includes(q)
      );
    }

    // Column sorting
    if (sortField) {
      list = [...list].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Numerical comparison for metrics
        if (['kills', 'deaths', 'assists', 'acs', 'econ', 'rounds', 'headshots', 'set_num', 'match', 'week', 'day'].includes(sortField)) {
          const numA = Number(valA) || 0;
          const numB = Number(valB) || 0;
          return sortOrder === 'asc' ? numA - numB : numB - numA;
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA === valB) return 0;
        if (valA === null || valA === undefined || valA === '') return 1;
        if (valB === null || valB === undefined || valB === '') return -1;
        const cmp = valA > valB ? 1 : -1;
        return sortOrder === 'asc' ? cmp : -cmp;
      });
    }

    return list;
  }, [records, gameFilter, selectedTournament, searchQuery, sortField, sortOrder]);

  // Paginated subset
  const paginatedRecords = useMemo(() => {
    if (pageSize === 'All') return filteredRecords;
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalPages = pageSize === 'All' ? 1 : Math.ceil(filteredRecords.length / pageSize) || 1;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const isValFilter = gameFilter === 'Valorant';
  const isCfFilter = gameFilter === 'Crossfire';

  // Statistics summaries
  const stats = useMemo(() => {
    const total = records.length;
    const valCount = records.filter(r => (r.game || '').toLowerCase() === 'valorant').length;
    const cfCount = records.filter(r => (r.game || '').toLowerCase() === 'crossfire').length;
    const teamsCount = new Set(records.map(r => r.team_name).filter(Boolean)).size;
    const playersCount = new Set(records.map(r => r.ign).filter(Boolean)).size;
    return { total, valCount, cfCount, teamsCount, playersCount };
  }, [records]);

  return (
    <div className="flex-1 bg-bg-base text-theme-text-base overflow-y-auto flex flex-col h-full relative font-sans custom-scrollbar">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #070c14; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        .spreadsheet-table th, .spreadsheet-table td {
          white-space: nowrap;
        }
        .spreadsheet-table th { padding: 12px 14px !important; }
        .spreadsheet-table td { padding: 11px 14px !important; }
        .title-gradient {
          background: linear-gradient(135deg, #00d0eb, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* ════════ HEADER BAR & CONTROLS ════════ */}
      <div className="border-b border-slate-800/80 bg-bg-200/90 backdrop-blur-md sticky top-0 z-20 flex flex-col gap-5 flex-shrink-0 shadow-xl px-6 py-5 lg:px-10 lg:py-6">
        
        {/* Top Row: Title & Action Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest title-gradient">Raw Match Records</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {records.length} Records
              </span>
            </div>
            <p className="text-theme-text-muted text-xs sm:text-sm tracking-wide font-medium mt-1">
              Complete database view of all submitted match and player performance records.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total:</span>
              <span className="font-mono font-black text-xs text-white">{stats.total}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-cyan-400">Valorant:</span>
              <span className="font-mono font-black text-xs text-cyan-300">{stats.valCount}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-blue-400">Crossfire:</span>
              <span className="font-mono font-black text-xs text-blue-300">{stats.cfCount}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Teams:</span>
              <span className="font-mono font-black text-xs text-amber-300">{stats.teamsCount}</span>
            </div>
            <button 
              onClick={fetchRecords}
              disabled={loading}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold tracking-widest uppercase px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 ml-auto sm:ml-0"
              title="Refresh all records from database"
            >
              <svg className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Search Bar, Game Filters & Tournament Dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 pt-1">
          
          {/* SEARCH BAR (Prominent & Real-time) */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by player IGN, team, map, tournament, week, day..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                title="Clear search"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Pills & Tournament Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Game Filter Pills */}
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner">
              {['All', 'Valorant', 'Crossfire'].map(filter => (
                <button
                  key={filter}
                  onClick={() => { setGameFilter(filter); setCurrentPage(1); }}
                  className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                    gameFilter === filter 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Tournament Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tournament:</span>
              <select
                value={selectedTournament}
                onChange={(e) => { setSelectedTournament(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-cyan-300 font-bold text-xs focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                {tournamentOptions.map(t => (
                  <option key={t} value={t} className="bg-slate-900 text-white">{t === 'All' ? 'All Tournaments' : t}</option>
                ))}
              </select>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value === 'All' ? 'All' : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-200 font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value={25} className="bg-slate-900 text-white">25</option>
                <option value={50} className="bg-slate-900 text-white">50</option>
                <option value={100} className="bg-slate-900 text-white">100</option>
                <option value="All" className="bg-slate-900 text-white">All</option>
              </select>
            </div>

          </div>

        </div>

        {/* Filter results info badge */}
        {(searchQuery || selectedTournament !== 'All' || gameFilter !== 'All') && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Filtered results:</span>
            <span className="font-mono font-bold text-cyan-300">{filteredRecords.length} of {records.length} records</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-[10px]">
                Query: "{searchQuery}"
              </span>
            )}
            <button
              onClick={() => { setSearchQuery(''); setGameFilter('All'); setSelectedTournament('All'); setCurrentPage(1); }}
              className="text-[11px] text-rose-400 hover:underline ml-2"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 mx-6 my-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Error loading match records:</span>
            <span>{error}</span>
          </div>
          <button onClick={fetchRecords} className="underline text-xs font-bold hover:text-white">Retry</button>
        </div>
      )}

      {/* ════════ MAIN TABLE CONTAINER ════════ */}
      <div className="flex-1 overflow-hidden flex flex-col p-6 lg:p-10">
        <div className="flex-1 overflow-auto custom-scrollbar rounded-2xl border border-slate-800 bg-bg-200/95 shadow-2xl relative">
          <table className="min-w-full text-left border-collapse spreadsheet-table">
            <thead className="bg-slate-950 sticky top-0 z-10 shadow-md">
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th onClick={() => handleSort('tournament_name')} className="cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-1">Tournament {sortField === 'tournament_name' && (sortOrder === 'asc' ? '▲' : '▼')}</div>
                </th>
                <th onClick={() => handleSort('game')} className="cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center gap-1">Game {sortField === 'game' && (sortOrder === 'asc' ? '▲' : '▼')}</div>
                </th>
                <th onClick={() => handleSort('week')} className="cursor-pointer hover:text-white transition-colors text-center">Wk</th>
                <th onClick={() => handleSort('day')} className="cursor-pointer hover:text-white transition-colors text-center">Day</th>
                <th onClick={() => handleSort('match')} className="cursor-pointer hover:text-white transition-colors text-center">Match</th>
                <th onClick={() => handleSort('set_num')} className="cursor-pointer hover:text-white transition-colors text-center">Set</th>
                <th onClick={() => handleSort('map')} className="cursor-pointer hover:text-white transition-colors">Map</th>
                <th onClick={() => handleSort('team_name')} className="cursor-pointer hover:text-white transition-colors bg-slate-900/90">
                  <div className="flex items-center gap-1">Team {sortField === 'team_name' && (sortOrder === 'asc' ? '▲' : '▼')}</div>
                </th>
                <th onClick={() => handleSort('ign')} className="cursor-pointer hover:text-white transition-colors bg-slate-900/90">
                  <div className="flex items-center gap-1">Player IGN {sortField === 'ign' && (sortOrder === 'asc' ? '▲' : '▼')}</div>
                </th>
                {!isCfFilter && <th>Agent</th>}
                <th onClick={() => handleSort('win')} className="cursor-pointer hover:text-white transition-colors text-center">Result</th>
                <th onClick={() => handleSort('kills')} className="cursor-pointer hover:text-white transition-colors text-center">Kills</th>
                <th onClick={() => handleSort('deaths')} className="cursor-pointer hover:text-white transition-colors text-center">Deaths</th>
                <th onClick={() => handleSort('assists')} className="cursor-pointer hover:text-white transition-colors text-center">Assists</th>
                <th className="text-center">K/D</th>
                {(!isValFilter) && (
                  <th onClick={() => handleSort('headshots')} className="cursor-pointer hover:text-white transition-colors text-center">Headshots</th>
                )}
                {(!isCfFilter) && (
                  <>
                    <th onClick={() => handleSort('acs')} className="cursor-pointer hover:text-white transition-colors text-center">ACS</th>
                    <th onClick={() => handleSort('econ')} className="cursor-pointer hover:text-white transition-colors text-center">Econ</th>
                  </>
                )}
                <th onClick={() => handleSort('rounds')} className="cursor-pointer hover:text-white transition-colors text-center">Rounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan="18" className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold text-sm">Loading all match records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="18" className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-slate-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-bold text-slate-300">No matching records found.</p>
                      <p className="text-xs text-slate-500">
                        {searchQuery ? `Try adjusting your search query "${searchQuery}"` : 'No records match the current filter selection.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((row, idx) => {
                  const isVal = (row.game || '').toLowerCase() === 'valorant';
                  const kills = Number(row.kills) || 0;
                  const deaths = Number(row.deaths) || 0;
                  const assists = Number(row.assists) || 0;
                  const kdRatio = deaths > 0 ? (kills / deaths).toFixed(2) : kills > 0 ? kills.toFixed(2) : '0.00';

                  return (
                    <tr key={row.id || `${row.ign}-${row.set_num}-${idx}`} className="hover:bg-slate-800/40 transition-colors group">
                      
                      {/* Tournament Name */}
                      <td className="px-4 py-3 text-xs border-r border-slate-800/40 text-slate-400 font-medium max-w-[130px] truncate" title={row.tournament_name || 'Regular'}>
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 truncate max-w-full">
                          {row.tournament_name || 'Regular'}
                        </span>
                      </td>

                      {/* Game Badge */}
                      <td className="px-4 py-3 text-xs border-r border-slate-800/40">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                          isVal 
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' 
                            : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                        }`}>
                          {row.game || 'Valorant'}
                        </span>
                      </td>

                      {/* Week / Day / Match / Set */}
                      <td className="px-3 py-3 text-xs border-r border-slate-800/40 text-center font-mono text-slate-400">{row.week || '-'}</td>
                      <td className="px-3 py-3 text-xs border-r border-slate-800/40 text-center font-mono text-slate-400">{row.day || '-'}</td>
                      <td className="px-3 py-3 text-xs border-r border-slate-800/40 text-center font-mono text-slate-400">{row.match || '-'}</td>
                      <td className="px-3 py-3 text-xs border-r border-slate-800/40 text-center font-mono font-bold text-cyan-400">{row.set_num || '-'}</td>

                      {/* Map */}
                      <td className="px-4 py-3 text-xs border-r border-slate-800/40 text-slate-300 font-semibold truncate max-w-[110px]" title={row.map || '-'}>
                        {row.map || '-'}
                      </td>

                      {/* Team Name */}
                      <td className="px-4 py-3 text-xs border-r border-slate-800/40 font-bold text-white bg-slate-900/30 truncate max-w-[140px]" title={row.team_name || '-'}>
                        {row.team_name || '-'}
                      </td>

                      {/* Player IGN */}
                      <td className="px-4 py-3 text-sm border-r border-slate-800/40 font-black text-white bg-slate-900/30 tracking-wide">
                        <span className="group-hover:text-cyan-300 transition-colors">{row.ign}</span>
                      </td>

                      {/* Agent (for Valorant or All) */}
                      {!isCfFilter && (
                        <td className="px-3 py-3 text-xs border-r border-slate-800/40 text-center">
                          {row.agent ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-200 border border-slate-700/60">
                              {row.agent}
                            </span>
                          ) : row.group_label ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                              {row.group_label}
                            </span>
                          ) : (
                            <span className="text-slate-600 font-mono">-</span>
                          )}
                        </td>
                      )}

                      {/* Win / Loss Result */}
                      <td className="px-3 py-3 text-xs border-r border-slate-800/40 text-center">
                        {row.win === true || String(row.win) === '1' || String(row.win).toLowerCase() === 'true' ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            WIN
                          </span>
                        ) : row.win === false || String(row.win) === '0' || String(row.win).toLowerCase() === 'false' ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            LOSS
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Kills, Deaths, Assists */}
                      <td className="px-3 py-3 text-sm border-r border-slate-800/40 text-center font-mono font-bold text-white bg-slate-900/20">{row.kills ?? 0}</td>
                      <td className="px-3 py-3 text-sm border-r border-slate-800/40 text-center font-mono font-bold text-slate-300 bg-slate-900/20">{row.deaths ?? 0}</td>
                      <td className="px-3 py-3 text-sm border-r border-slate-800/40 text-center font-mono font-bold text-slate-400 bg-slate-900/20">{row.assists ?? 0}</td>

                      {/* Calculated K/D */}
                      <td className="px-3 py-3 text-sm border-r border-slate-800/40 text-center font-mono font-black">
                        <span className={Number(kdRatio) >= 1.5 ? 'text-emerald-400' : Number(kdRatio) >= 1.0 ? 'text-cyan-400' : 'text-slate-300'}>
                          {kdRatio}
                        </span>
                      </td>

                      {/* Headshots (for Crossfire or All) */}
                      {!isValFilter && (
                        <td className="px-3 py-3 text-sm border-r border-slate-800/40 text-center font-mono text-slate-300">
                          {row.headshots !== undefined && row.headshots !== null ? row.headshots : '-'}
                        </td>
                      )}

                      {/* ACS & Econ (for Valorant or All) */}
                      {!isCfFilter && (
                        <>
                          <td className="px-3 py-3 text-sm border-r border-slate-800/40 text-center font-mono font-bold text-emerald-400">
                            {row.acs || '-'}
                          </td>
                          <td className="px-3 py-3 text-sm border-r border-slate-800/40 text-center font-mono text-slate-400">
                            {row.econ || '-'}
                          </td>
                        </>
                      )}

                      {/* Rounds */}
                      <td className="px-3 py-3 text-sm border-r border-slate-800/40 text-center font-mono font-semibold text-slate-300">
                        {row.rounds || '-'}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ════════ PAGINATION CONTROLS ════════ */}
        {filteredRecords.length > 0 && pageSize !== 'All' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
            <span className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-white">{Math.min((currentPage - 1) * pageSize + 1, filteredRecords.length)}</strong> to{' '}
              <strong className="text-white">{Math.min(currentPage * pageSize, filteredRecords.length)}</strong> of{' '}
              <strong className="text-cyan-400 font-mono">{filteredRecords.length}</strong> records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 7) {
                    if (currentPage <= 4) {
                      p = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      p = totalPages - 6 + i;
                    } else {
                      p = currentPage - 3 + i;
                    }
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                        currentPage === p
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RawRecords;
