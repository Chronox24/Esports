import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);
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
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getGameColor = (game) => {
    if (game === 'Valorant') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (game === 'Crossfire') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-theme-text-muted bg-slate-500/10 border-slate-500/20';
  };
  return (
    <div className="flex-1 bg-bg-100 light:bg-slate-50 text-theme-text-base light:text-slate-900 overflow-y-auto flex flex-col h-full relative font-sans custom-scrollbar" style={{ padding: '32px' }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        .light-mode .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; }
        .light-mode .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
      <div className="max-w-[1400px] w-full mx-auto">
        <div className="flex items-center justify-end" style={{ marginBottom: '32px' }}>
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-6 py-3 bg-bg-300 light:bg-white hover:bg-bg-400 light:hover:bg-slate-50 border border-[#2a3648] light:border-slate-300 rounded-xl text-cyan-400 light:text-cyan-600 text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]" style={{ padding: "12px 24px", borderRadius: "9999px" }}
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Logs
          </button>
        </div>
        {error && (
          <div className="bg-red-500/10 light:bg-red-50 border border-red-500/20 light:border-red-200 text-red-400 light:text-red-600 p-4 rounded-xl mb-6">
            Error: {error}
          </div>
        )}

        <div className="bg-bg-300 light:bg-white rounded-xl border border-[#1c2532] light:border-slate-200 shadow-xl flex flex-col mb-8">
           <div className="border-b border-[#1c2532] light:border-slate-200 bg-bg-300 light:bg-slate-50 flex flex-col md:flex-row md:justify-between md:items-center relative overflow-hidden" style={{ padding: "24px 32px", gap: "16px" }}>
               <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"></div>
               <h2 className="text-sm font-black text-theme-text-base light:text-slate-700 tracking-widest uppercase ml-3">Admin and User Activity Audit Logs <span className="text-red-500 light:text-red-600">(PH Context)</span></h2>
               <div className="flex flex-wrap items-center gap-4 ml-3 md:ml-0">
                 <div className="flex items-center gap-2 px-3 py-1 bg-bg-400 light:bg-white rounded-lg border border-[#2a3648] light:border-slate-200 shadow-sm" style={{ padding: "8px 16px", borderRadius: "9999px" }}>
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                    <span className="text-[10px] font-black tracking-wider text-rose-400 light:text-rose-600 uppercase">Valorant</span>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-bg-400 light:bg-white rounded-lg border border-[#2a3648] light:border-slate-200 shadow-sm" style={{ padding: "8px 16px", borderRadius: "9999px" }}>
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                    <span className="text-[10px] font-black tracking-wider text-amber-400 light:text-amber-600 uppercase">Crossfire</span>
                 </div>
                 <button className="bg-bg-400 light:bg-slate-100 border border-[#2a3648] light:border-slate-300 text-cyan-400 light:text-cyan-600 text-xs font-bold hover:bg-bg-500 light:hover:bg-slate-200 transition-colors" style={{ padding: "12px 32px", borderRadius: "9999px" }}>Create Detailed Report</button>
               </div>
           </div>
           
           <div className="flex flex-col" style={{ padding: "32px", gap: "16px" }}>
              {logs.length === 0 && !loading ? (
                 <div className="text-center text-theme-text-muted light:text-theme-text-muted italic text-sm py-12">No audit logs found.</div>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const date = new Date(log.created_at);
                  const rawIgn = log.details?.ign || log.details?.account || log.details?.username || log.details?.email;
                  const ign = (rawIgn && rawIgn !== 'System') ? rawIgn : (log.game === 'Admin' ? 'Admin' : (rawIgn || 'System'));
                  const showGameBadge = log.game && log.game !== 'System' && log.game !== 'Admin';
                  return (
                    <React.Fragment key={log.id}>
                      <div className="bg-bg-300 light:bg-white rounded-xl border border-[#1c2532] light:border-slate-200 flex flex-col transition-colors hover:border-cyan-500/30 light:hover:border-cyan-500/30 hover:bg-bg-400 light:hover:bg-slate-50 overflow-hidden shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between cursor-pointer" style={{ padding: "20px 24px", gap: "24px" }} onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                           <div className="flex flex-col" style={{ gap: "8px", minWidth: "200px" }}>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-cyan-400 light:text-cyan-600 uppercase tracking-widest">{log.action_type}</span>
                                {showGameBadge && (
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${getGameColor(log.game)}`} style={{ padding: "4px 8px", borderRadius: "9999px" }}>
                                    {log.game}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-cyan-400/80 light:text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm font-bold text-gray-200 light:text-slate-800">{ign}</span>
                              </div>
                           </div>
                           <div className="flex-1 md:px-4">
                              <span className="text-xs text-theme-text-muted light:text-slate-600 leading-relaxed">{log.description}</span>
                           </div>
                           <div className="flex items-center justify-end gap-6" style={{ minWidth: "150px" }}>
                              <div className="flex flex-col items-end">
                                <span className="text-theme-text-base light:text-slate-700 font-mono tracking-wider text-xs">
                                  {date.toLocaleDateString()}
                                </span>
                                <span className="text-[9px] text-theme-text-faint light:text-theme-text-muted font-mono tracking-widest">
                                  {date.toLocaleTimeString()}
                                </span>
                              </div>
                              {log.details && (
                                <button className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-cyan-500/20 light:bg-cyan-50 border-cyan-500/50 light:border-cyan-300 text-cyan-400 light:text-cyan-600 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-bg-300 light:bg-white border-[#2a3648] light:border-slate-300 text-theme-text-muted light:text-theme-text-muted hover:text-cyan-400 light:hover:text-cyan-600 hover:border-cyan-500/30'}`} style={{ padding: "8px 16px", borderRadius: "9999px" }} onClick={(e) => { e.stopPropagation(); setExpandedLogId(isExpanded ? null : log.id); }}>
                                  {isExpanded ? 'Hide' : 'View'}
                                </button>
                              )}
                           </div>
                        </div>

                        {isExpanded && log.details && (
                          <div className="bg-bg-200 light:bg-slate-50 border-t border-[#1c2532] light:border-slate-200 relative overflow-hidden" style={{ padding: "24px 32px" }}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/30"></div>
                            {log.details.matchHeader && (
                                <div className="mb-6 bg-bg-300 light:bg-white border border-[#2a3648] light:border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                  <div className="px-4 py-2 bg-bg-300 light:bg-slate-100 border-b border-[#2a3648] light:border-slate-200">
                                    <span className="text-[10px] font-black text-cyan-400 light:text-cyan-600 uppercase tracking-widest">Main Match Header Configuration</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 text-center">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-theme-text-faint light:text-theme-text-muted uppercase tracking-widest mb-1">League</span>
                                      <span className="text-theme-text-base light:text-slate-800 font-bold text-xs">{log.details.matchHeader.league || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-theme-text-faint light:text-theme-text-muted uppercase tracking-widest mb-1">Week</span>
                                      <span className="text-theme-text-base light:text-slate-800 font-bold text-xs">{log.details.matchHeader.week || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-theme-text-faint light:text-theme-text-muted uppercase tracking-widest mb-1">Day</span>
                                      <span className="text-theme-text-base light:text-slate-800 font-bold text-xs">{log.details.matchHeader.day || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-theme-text-faint light:text-theme-text-muted uppercase tracking-widest mb-1">Match</span>
                                      <span className="text-theme-text-base light:text-slate-800 font-bold text-xs">{log.details.matchHeader.match || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-theme-text-faint light:text-theme-text-muted uppercase tracking-widest mb-1">Set</span>
                                      <span className="text-theme-text-base light:text-slate-800 font-bold text-xs">{log.details.matchHeader.setNum || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-theme-text-faint light:text-theme-text-muted uppercase tracking-widest mb-1">Map</span>
                                      <span className="text-theme-text-base light:text-slate-800 font-bold text-xs">{log.details.matchHeader.mapName || '-'}</span>
                                    </div>
                                  </div>
                                </div>
                            )}
                            <div className="bg-bg-base light:bg-slate-800 border border-slate-800/80 light:border-slate-700 rounded-xl p-5 overflow-x-auto relative shadow-inner">
                              <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800/50 light:bg-slate-700/50 text-[9px] font-black text-theme-text-muted light:text-theme-text-muted uppercase tracking-widest rounded-bl-lg">
                                Raw JSON Payload
                              </div>
                              <pre className="text-xs font-mono text-emerald-400 light:text-emerald-300 mt-2">
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
