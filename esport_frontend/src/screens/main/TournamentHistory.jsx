import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Check, Trophy, Calendar, ChevronRight } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import Bracket from './Bracket';

const TournamentHistory = ({ setGlobalTournament, setActiveTab }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('ALL');
  const [selectedComplete, setSelectedComplete] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await apiFetch('/api/tournaments-dashboard');
        if (res.ok) {
          const data = await res.json();
          setTournaments(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch tournament history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments = useMemo(() => {
    let list = tournaments;
    if (currentTab !== 'ALL') {
      list = list.filter(t => t.status === currentTab);
    }
    if (searchQuery.trim()) {
      list = list.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [tournaments, currentTab, searchQuery]);

  const counts = useMemo(() => {
    const c = { ALL: tournaments.length, PENDING: 0, 'IN PROGRESS': 0, COMPLETE: 0, ARCHIVED: 0 };
    tournaments.forEach(t => {
      if (c[t.status] !== undefined) c[t.status]++;
    });
    return c;
  }, [tournaments]);

  const formatSafeDate = (dateVal) => {
    if (!dateVal) return 'COMPLETED';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'COMPLETED';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (selectedComplete) {
    return (
      <div className="w-full h-full flex flex-col relative animate-fade-in bg-slate-950">
        <div className="w-full h-16 bg-slate-900/90 border-b border-cyan-500/20 flex items-center px-8 z-50 shrink-0 backdrop-blur-xl">
          <button
            onClick={() => setSelectedComplete(null)}
            style={{ padding: '8px 16px' }}
            className="hud-btn-secondary flex items-center gap-2 font-tactical text-xs font-extrabold tracking-[0.16em] uppercase cursor-pointer"
          >
            <ChevronRight size={15} className="rotate-180" /> Back to History
          </button>
          <div className="ml-auto font-tactical text-sm font-extrabold tracking-[0.16em] uppercase text-slate-200 flex items-center gap-3">
            <Trophy size={16} className="text-cyan-400" />
            {selectedComplete.name}
            <span className="hud-chamfer-sm bg-cyan-500/15 text-cyan-300 border border-cyan-400/35 px-2.5 py-1 text-[10px] ml-2">
              ARCHIVE // READ ONLY
            </span>
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <Bracket globalGame={selectedComplete.game_title} globalTournament={selectedComplete.name} isReadOnly={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar relative" style={{ padding: '28px 32px 48px 32px', scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>

      <div className="max-w-[1440px] mx-auto flex flex-col gap-6 pb-20 relative z-10">

        {/* Tactical Command Header & Filter Bar */}
        <div className="hud-card hud-enter rounded-xl bg-slate-900/60 flex flex-col gap-5" style={{ padding: '22px 26px' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/70 pb-4">
            <div className="flex items-center gap-3">
              <span className="hud-diamond" />
              <div>
                <div className="font-tactical text-[10px] font-bold tracking-[0.22em] text-cyan-400/80 uppercase">
                  SEASON ARCHIVE VAULT
                </div>
                <h1 className="font-tactical text-lg md:text-xl font-extrabold tracking-[0.16em] text-theme-text-base uppercase">
                  Tournament History &amp; Records
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hud-chamfer-sm bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 flex items-center gap-2">
                <Trophy size={14} className="text-cyan-400" />
                <span className="font-tactical text-xs font-extrabold tracking-[0.14em] text-slate-300 uppercase">
                  TOTAL LOGGED: <span className="text-cyan-400">{counts.ALL}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'PENDING', 'IN PROGRESS', 'COMPLETE', 'ARCHIVED'].map(tab => {
                const isActive = currentTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setCurrentTab(tab)}
                    style={{ padding: '8px 14px' }}
                    className={`hud-chamfer-sm font-tactical text-[11px] font-extrabold uppercase tracking-[0.14em] flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_16px_rgba(0,229,255,0.4)]'
                        : 'bg-slate-950/70 text-theme-text-muted border border-slate-800 hover:border-cyan-500/40 hover:text-white'
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isActive ? 'bg-slate-950/25 text-slate-950' : 'bg-slate-800 text-cyan-300'
                      }`}
                    >
                      {counts[tab]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="hud-chamfer-sm bg-slate-950/80 border border-slate-700/70 flex items-center w-full lg:w-72 focus-within:border-cyan-400 transition-all" style={{ padding: '8px 14px' }}>
              <Search size={15} className="text-cyan-400/70 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search tournament records..."
                className="bg-transparent border-none outline-none text-xs text-slate-200 w-full placeholder-slate-500 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tournament List */}
        <div className="flex flex-col gap-3.5">
          {loading ? (
            <div className="hud-card rounded-xl flex justify-center py-20 text-cyan-400 animate-pulse">
              <span className="font-tactical text-sm font-extrabold tracking-[0.2em] uppercase flex items-center gap-2.5">
                <Trophy size={18} className="animate-bounce" /> Synchronizing Tournament Vault...
              </span>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="hud-card rounded-xl p-14 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 hud-chamfer bg-slate-900 border border-cyan-500/25 flex items-center justify-center text-cyan-400/50">
                <Trophy size={28} />
              </div>
              <div className="font-tactical text-sm font-extrabold uppercase tracking-[0.18em] text-theme-text-base">
                No Matching Tournaments Found
              </div>
              <div className="text-xs text-theme-text-muted max-w-sm">
                Try switching the status filter tab above or clearing your search query.
              </div>
            </div>
          ) : (
            filteredTournaments.map((t, idx) => (
              <div
                key={t.id || idx}
                onClick={() => {
                  if (t.status === 'COMPLETE') {
                    localStorage.setItem('activeFormat', t.format !== 'Unspecified Format' ? t.format : 'Single Elimination');
                    setSelectedComplete(t);
                  } else {
                    setGlobalTournament(t.name);
                    localStorage.setItem('activeFormat', t.format !== 'Unspecified Format' ? t.format : 'Single Elimination');
                    setActiveTab('Bracket');
                  }
                }}
                style={{ padding: '18px 24px', animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                className="group hud-card hud-card-interactive hud-enter rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 cursor-pointer relative overflow-hidden"
              >
                <div className="hud-sweep-overlay" />
                {/* Left Vertical Accent Bar */}
                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                  t.status === 'COMPLETE' ? 'bg-emerald-400' : t.status === 'IN PROGRESS' ? 'bg-amber-400' : 'bg-cyan-500/60 group-hover:bg-cyan-400'
                }`} />

                <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
                  <div className="w-12 h-12 hud-chamfer-sm bg-slate-950/90 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 group-hover:border-cyan-400 transition-all">
                    <Trophy size={20} />
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-tactical text-base font-extrabold text-theme-text-base uppercase tracking-[0.1em] group-hover:text-cyan-300 transition-colors leading-none">
                        {t.name}
                      </h3>
                      <span className="font-mono text-[10px] text-theme-text-muted">#{String(idx + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                      {t.format && t.format !== 'Unspecified Format' && (
                        <span className="hud-chamfer-sm bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 font-tactical tracking-[0.12em]">
                          {t.format}
                        </span>
                      )}
                      {t.game_title && (
                        <span className="hud-chamfer-sm bg-slate-800/90 text-slate-300 border border-slate-700 px-2.5 py-0.5 font-tactical tracking-[0.12em]">
                          {t.game_title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end relative z-10">
                  {/* Participant Count */}
                  <div className="hud-chamfer-sm flex items-center gap-2 text-slate-300 text-xs font-bold bg-slate-950/80 px-3.5 py-1.5 border border-slate-800">
                    <User size={13} className="text-cyan-400" />
                    <span className="font-mono">{t.participant_count ?? 0}</span>
                    <span className="font-tactical text-[9px] tracking-[0.14em] text-theme-text-muted uppercase">TEAMS</span>
                  </div>

                  {/* Readable Status Badge + Progress Indicator */}
                  <div className="flex items-center justify-end min-w-[150px]">
                    {t.status === 'COMPLETE' ? (
                      <div className="hud-chamfer-sm flex items-center gap-1.5 text-emerald-300 font-tactical text-[10px] font-extrabold uppercase tracking-[0.14em] bg-emerald-500/15 px-3 py-1.5 border border-emerald-500/35">
                        <Check size={13} />
                        <span>{formatSafeDate(t.date)}</span>
                      </div>
                    ) : t.status === 'IN PROGRESS' ? (
                      <div className="flex flex-col items-end gap-1.5 w-36">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span className="font-tactical text-[10px] font-extrabold tracking-[0.14em] text-amber-300 uppercase">
                            IN PROGRESS
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 w-[65%] shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                        </div>
                      </div>
                    ) : t.status === 'PENDING' ? (
                      <div className="hud-chamfer-sm flex items-center gap-1.5 text-cyan-300 font-tactical text-[10px] font-extrabold uppercase tracking-[0.14em] bg-cyan-500/10 px-3 py-1.5 border border-cyan-500/25">
                        <Calendar size={12} />
                        <span>PENDING</span>
                      </div>
                    ) : (
                      <div className="hud-chamfer-sm flex items-center gap-1.5 text-slate-400 font-tactical text-[10px] font-extrabold uppercase tracking-[0.14em] bg-slate-800/80 px-3 py-1.5 border border-slate-700">
                        <span>{t.status || 'ARCHIVED'}</span>
                      </div>
                    )}
                  </div>

                  <div className="hud-chamfer-sm w-8 h-8 bg-slate-900 border border-slate-800 group-hover:border-cyan-400/50 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 transition-all shrink-0">
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default TournamentHistory;
