import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../utils/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [gameFilter, setGameFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/audit-logs');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Failed to fetch audit logs: ${res.status} ${errData.error || ''}`);
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getGameColor = (game) => {
    const g = (game || '').toLowerCase();
    if (g === 'valorant') return 'text-rose-300 bg-rose-500/15 border-rose-500/35';
    if (g === 'crossfire') return 'text-amber-300 bg-amber-500/15 border-amber-500/35';
    return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25';
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (gameFilter !== 'ALL') {
        if ((log.game || '').toUpperCase() !== gameFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const rawIgn = log.details?.ign || log.details?.account || log.details?.username || log.details?.email || '';
        const matchAction = (log.action_type || '').toLowerCase().includes(q);
        const matchDesc = (log.description || '').toLowerCase().includes(q);
        const matchIgn = String(rawIgn).toLowerCase().includes(q);
        const matchGame = (log.game || '').toLowerCase().includes(q);
        return matchAction || matchDesc || matchIgn || matchGame;
      }
      return true;
    });
  }, [logs, gameFilter, searchQuery]);

  const handleExportReport = () => {
    const rows = [
      ['ID', 'Timestamp', 'Action Type', 'Game', 'Actor', 'Description'],
      ...filteredLogs.map((log) => {
        const rawIgn = log.details?.ign || log.details?.account || log.details?.username || log.details?.email;
        const ign = (rawIgn && rawIgn !== 'System') ? rawIgn : (log.game === 'Admin' ? 'Admin' : (rawIgn || 'System'));
        return [
          log.id ?? '',
          log.created_at ? new Date(log.created_at).toISOString() : '',
          log.action_type ?? '',
          log.game ?? '',
          ign,
          (log.description ?? '').replace(/"/g, '""'),
        ];
      }),
    ];
    const csvContent = rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 text-theme-text-base light:text-slate-900 overflow-y-auto flex flex-col h-full relative font-sans custom-scrollbar" style={{ padding: '28px 32px 48px 32px' }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        .light-mode .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; }
        .light-mode .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
      <div className="max-w-[1440px] w-full mx-auto flex flex-col gap-6">
        
        {/* Top Action & Status Bar */}
        <div className="hud-card hud-enter rounded-xl bg-slate-900/60 flex flex-wrap items-center justify-between gap-4" style={{ padding: '18px 24px' }}>
          <div className="flex items-center gap-3">
            <span className="hud-diamond" />
            <div>
              <div className="font-tactical text-[10px] font-bold tracking-[0.22em] text-cyan-400/80 uppercase">
                SECURITY &amp; TELEMETRY LEDGER
              </div>
              <h1 className="font-tactical text-lg md:text-xl font-extrabold tracking-[0.16em] text-theme-text-base uppercase">
                Admin &amp; User Activity Audit Logs <span className="text-rose-400 text-xs ml-1">// PH CONTEXT</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={fetchLogs}
              style={{ padding: '9px 18px' }}
              className="hud-btn-secondary font-tactical text-xs font-extrabold tracking-[0.16em] uppercase flex items-center gap-2 cursor-pointer"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Logs
            </button>
            <button
              onClick={handleExportReport}
              style={{ padding: '9px 18px' }}
              className="hud-btn-primary font-tactical text-xs font-extrabold tracking-[0.16em] uppercase flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create Detailed Report
            </button>
          </div>
        </div>

        {error && (
          <div className="hud-chamfer-sm bg-red-500/10 border border-red-500/30 text-red-400 p-4 font-tactical text-xs tracking-wider uppercase">
            Error: {error}
          </div>
        )}

        {/* Main Ledger Card */}
        <div className="hud-card hud-enter hud-delay-1 rounded-xl flex flex-col mb-8 overflow-hidden">
           <div className="border-b border-slate-800/80 bg-slate-900/50 flex flex-col lg:flex-row lg:justify-between lg:items-center relative overflow-hidden" style={{ padding: '18px 24px', gap: '16px' }}>
               <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.5)]"></div>
               
               {/* Interactive Game Filter Pills */}
               <div className="flex flex-wrap items-center gap-2.5 ml-2">
                 <button
                   type="button"
                   onClick={() => setGameFilter('ALL')}
                   style={{ padding: '6px 14px' }}
                   className={`hud-chamfer-sm font-tactical text-[11px] font-extrabold tracking-[0.14em] uppercase transition-all cursor-pointer ${
                     gameFilter === 'ALL'
                       ? 'bg-cyan-400 text-slate-950 shadow-[0_0_14px_rgba(0,229,255,0.4)]'
                       : 'bg-slate-950/70 text-theme-text-muted border border-slate-800 hover:border-cyan-500/40 hover:text-white'
                   }`}
                 >
                   All Logs ({logs.length})
                 </button>
                 <button
                   type="button"
                   onClick={() => setGameFilter('VALORANT')}
                   style={{ padding: '6px 14px' }}
                   className={`hud-chamfer-sm flex items-center gap-2 font-tactical text-[11px] font-extrabold tracking-[0.14em] uppercase transition-all cursor-pointer border ${
                     gameFilter === 'VALORANT'
                       ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.35)]'
                       : 'bg-slate-950/70 border-slate-800 text-rose-400/80 hover:border-rose-500/40'
                   }`}
                 >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                    <span>Valorant</span>
                 </button>
                 <button
                   type="button"
                   onClick={() => setGameFilter('CROSSFIRE')}
                   style={{ padding: '6px 14px' }}
                   className={`hud-chamfer-sm flex items-center gap-2 font-tactical text-[11px] font-extrabold tracking-[0.14em] uppercase transition-all cursor-pointer border ${
                     gameFilter === 'CROSSFIRE'
                       ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.35)]'
                       : 'bg-slate-950/70 border-slate-800 text-amber-400/80 hover:border-amber-500/40'
                   }`}
                 >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                    <span>Crossfire</span>
                 </button>
               </div>

               {/* Search Input */}
               <div className="hud-chamfer-sm bg-slate-950/80 border border-slate-700/70 focus-within:border-cyan-400 flex items-center w-full lg:w-72 transition-colors" style={{ padding: '7px 12px' }}>
                 <svg className="w-4 h-4 text-cyan-400/70 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
                 <input
                   type="text"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Filter by action, user, or description..."
                   className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-full"
                 />
               </div>
           </div>
           
           <div className="flex flex-col" style={{ padding: '24px', gap: '12px' }}>
              {filteredLogs.length === 0 && !loading ? (
                 <div className="text-center text-theme-text-muted font-tactical tracking-widest uppercase text-xs py-14">
                   No audit logs match the current filter criteria.
                 </div>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const date = new Date(log.created_at);
                  const rawIgn = log.details?.ign || log.details?.account || log.details?.username || log.details?.email;
                  const ign = (rawIgn && rawIgn !== 'System') ? rawIgn : (log.game === 'Admin' ? 'Admin' : (rawIgn || 'System'));
                  const showGameBadge = log.game && log.game !== 'System' && log.game !== 'Admin';
                  return (
                    <React.Fragment key={log.id}>
                      <div className="hud-chamfer-sm bg-slate-900/65 hover:bg-slate-800/75 border border-slate-800 hover:border-cyan-500/40 flex flex-col transition-all duration-200 overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between cursor-pointer" style={{ padding: '16px 20px', gap: '20px' }} onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                           <div className="flex flex-col" style={{ gap: '6px', minWidth: '210px' }}>
                              <div className="flex items-center gap-2">
                                <span className="font-tactical text-[11px] font-extrabold text-cyan-400 uppercase tracking-[0.14em]">{log.action_type}</span>
                                {showGameBadge && (
                                  <span className={`hud-chamfer-sm font-tactical text-[9px] font-extrabold uppercase tracking-[0.14em] border ${getGameColor(log.game)}`} style={{ padding: '3px 8px' }}>
                                    {log.game}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-cyan-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm font-bold text-slate-100">{ign}</span>
                              </div>
                           </div>
                           <div className="flex-1 md:px-4">
                              <span className="text-xs text-slate-300 leading-relaxed">{log.description}</span>
                           </div>
                           <div className="flex items-center justify-end gap-5" style={{ minWidth: '165px' }}>
                              <div className="flex flex-col items-end">
                                <span className="text-theme-text-base font-mono font-bold tracking-wider text-xs">
                                  {!isNaN(date.getTime()) ? date.toLocaleDateString() : '-'}
                                </span>
                                <span className="text-[10px] text-theme-text-muted font-mono tracking-widest">
                                  {!isNaN(date.getTime()) ? date.toLocaleTimeString() : ''}
                                </span>
                              </div>
                              {log.details && (
                                <button
                                  className={`hud-chamfer-sm border font-tactical text-[10px] font-extrabold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                                    isExpanded
                                      ? 'bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                                      : 'bg-slate-950/80 border-slate-700 text-cyan-300 hover:border-cyan-400/60'
                                  }`}
                                  style={{ padding: '6px 14px' }}
                                  onClick={(e) => { e.stopPropagation(); setExpandedLogId(isExpanded ? null : log.id); }}
                                >
                                  {isExpanded ? 'Hide' : 'Inspect'}
                                </button>
                              )}
                           </div>
                        </div>

                        {isExpanded && log.details && (
                          <div className="bg-slate-950/80 border-t border-slate-800 relative overflow-hidden" style={{ padding: '20px 24px' }}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400/50"></div>
                            {log.details.matchHeader && (
                                <div className="mb-5 bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
                                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800">
                                    <span className="font-tactical text-[10px] font-extrabold text-cyan-400 uppercase tracking-[0.18em]">Main Match Header Configuration</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 text-center">
                                    <div className="flex flex-col">
                                      <span className="font-tactical text-[9px] text-theme-text-muted uppercase tracking-[0.16em] mb-1">League</span>
                                      <span className="text-theme-text-base font-bold text-xs">{log.details.matchHeader.league || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-tactical text-[9px] text-theme-text-muted uppercase tracking-[0.16em] mb-1">Week</span>
                                      <span className="text-theme-text-base font-bold text-xs">{log.details.matchHeader.week || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-tactical text-[9px] text-theme-text-muted uppercase tracking-[0.16em] mb-1">Day</span>
                                      <span className="text-theme-text-base font-bold text-xs">{log.details.matchHeader.day || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-tactical text-[9px] text-theme-text-muted uppercase tracking-[0.16em] mb-1">Match</span>
                                      <span className="text-theme-text-base font-bold text-xs">{log.details.matchHeader.match || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-tactical text-[9px] text-theme-text-muted uppercase tracking-[0.16em] mb-1">Set</span>
                                      <span className="text-theme-text-base font-bold text-xs">{log.details.matchHeader.setNum || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-tactical text-[9px] text-theme-text-muted uppercase tracking-[0.16em] mb-1">Map</span>
                                      <span className="text-theme-text-base font-bold text-xs">{log.details.matchHeader.mapName || '-'}</span>
                                    </div>
                                  </div>
                                </div>
                            )}
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto relative">
                              <div className="absolute top-0 right-0 px-3 py-1 bg-slate-900 font-tactical text-[9px] font-bold text-cyan-400 uppercase tracking-[0.16em] rounded-bl-lg border-l border-b border-slate-800">
                                Raw JSON Payload
                              </div>
                              <pre className="text-xs font-mono text-emerald-400 mt-2">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
export default AuditLogs;
