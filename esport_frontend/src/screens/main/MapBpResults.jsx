import React, { useState, useEffect } from 'react';
import { Map, Filter, ChevronDown, User } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const Card = ({ title, children, className = "" }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("Last 7 Days");

  return (
    <div className={`bg-bg-200/90 backdrop-blur-md rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] transition-all duration-500 flex flex-col overflow-hidden relative group ${className}`}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="border-b border-white/5 bg-bg-300/50 relative z-50 flex justify-end items-center shrink-0" style={{ padding: "24px 32px" }}>
        <div className="flex items-center relative">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-xs font-bold text-theme-text-base transition-colors shadow-sm cursor-pointer"
            style={{ padding: "10px 24px", borderRadius: "12px", gap: "8px" }}
          >
            <Filter size={14} /> {filterValue} <ChevronDown size={14} />
          </button>
          {filterOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
              {["Last 7 Days", "Last 30 Days", "All Time"].map(opt => (
                <button 
                  key={opt}
                  onClick={() => { setFilterValue(opt); setFilterOpen(false); }}
                  className="w-full text-left text-xs font-bold text-theme-text-base hover:bg-slate-700 hover:text-theme-text-base transition-colors cursor-pointer"
                  style={{ padding: "12px 16px" }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 p-0 relative z-10 min-h-[300px] flex flex-col">
        {children}
      </div>
    </div>
  );
};

const MapBpResults = ({ globalGame, globalTournament }) => {
  const activeGame = (globalGame || 'VALORANT').toUpperCase();
  const [dbVetoes, setDbVetoes] = useState([]);

  useEffect(() => {
    apiFetch(`/api/vetoes?tournament=${encodeURIComponent(globalTournament)}&game=${encodeURIComponent(activeGame === 'VALORANT' ? 'Valorant' : 'Crossfire')}`)
      .then(r => r.json())
      .then(data => setDbVetoes(data))
      .catch(console.error);
  }, [globalTournament, activeGame]);

  return (
    <div className="flex-1 bg-bg-base text-theme-text-base overflow-y-auto flex flex-col h-full custom-scrollbar relative" style={{ padding: "32px" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-10 bg-cyan-500 pointer-events-none z-0"></div>
      <div className="w-full pb-16 h-full flex flex-col relative z-10">
        <Card title="Map BP Results" className="w-full flex-1">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full table-fixed text-center text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold tracking-[0.2em] text-theme-text-muted uppercase bg-bg-100/80">
                  <th style={{ padding: "24px 16px" }}>Week</th>
                  <th style={{ padding: "24px 16px" }}>Day</th>
                  <th style={{ padding: "24px 16px" }}>Match</th>
                  <th style={{ padding: "24px 16px" }}>Team 1</th>
                  <th style={{ padding: "24px 16px" }}>Team 2</th>
                  <th className="bg-rose-500/5" style={{ padding: "24px 16px" }}>Ban 1</th>
                  <th className="bg-rose-500/5" style={{ padding: "24px 16px" }}>Ban 2</th>
                  <th className="bg-rose-500/5" style={{ padding: "24px 16px" }}>Ban 3</th>
                  <th className="bg-rose-500/5" style={{ padding: "24px 16px" }}>Ban 4</th>
                  <th className="bg-emerald-500/5" style={{ padding: "24px 16px" }}>Map 1</th>
                  <th className="bg-emerald-500/5" style={{ padding: "24px 16px" }}>Map 2</th>
                  <th className="bg-emerald-500/5" style={{ padding: "24px 16px" }}>Map 3</th>
                  <th className="bg-emerald-500/5" style={{ padding: "24px 16px" }}>Map 4</th>
                  <th className="bg-emerald-500/5" style={{ padding: "24px 16px" }}>Map 5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dbVetoes.map((v, i) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors bg-transparent">
                    <td className="text-theme-text-base font-bold" style={{ padding: "24px 16px" }}>{v.week || '-'}</td>
                    <td className="text-theme-text-base font-bold" style={{ padding: "24px 16px" }}>{v.day || '-'}</td>
                    <td className="text-theme-text-base font-bold" style={{ padding: "24px 16px" }}>{v.match || '-'}</td>
                    <td className="font-black text-blue-400 truncate" style={{ padding: "24px 16px" }}>{v.team_a}</td>
                    <td className="font-black text-red-400 truncate" style={{ padding: "24px 16px" }}>{v.team_b}</td>
                    <td className="text-rose-400/80 font-semibold bg-rose-500/[0.02]" style={{ padding: "24px 16px" }}>{v.ban_1 || '-'}</td>
                    <td className="text-rose-400/80 font-semibold bg-rose-500/[0.02]" style={{ padding: "24px 16px" }}>{v.ban_2 || '-'}</td>
                    <td className="text-rose-400/80 font-semibold bg-rose-500/[0.02]" style={{ padding: "24px 16px" }}>{v.ban_3 || '-'}</td>
                    <td className="text-rose-400/80 font-semibold bg-rose-500/[0.02]" style={{ padding: "24px 16px" }}>{v.ban_4 || '-'}</td>
                    <td className="text-emerald-400 font-bold bg-emerald-500/[0.02]" style={{ padding: "24px 16px" }}>{v.map_1 || '-'}</td>
                    <td className="text-emerald-400 font-bold bg-emerald-500/[0.02]" style={{ padding: "24px 16px" }}>{v.map_2 || '-'}</td>
                    <td className="text-emerald-400 font-bold bg-emerald-500/[0.02]" style={{ padding: "24px 16px" }}>{v.map_3 || '-'}</td>
                    <td className="text-emerald-400 font-bold bg-emerald-500/[0.02]" style={{ padding: "24px 16px" }}>{v.map_4 || '-'}</td>
                    <td className="text-emerald-400 font-bold bg-emerald-500/[0.02]" style={{ padding: "24px 16px" }}>{v.map_5 || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dbVetoes.length === 0 && (
            <div className="absolute top-[80px] left-0 right-0 bottom-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center justify-center pointer-events-auto">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-cyan-500/20 to-transparent flex items-center justify-center border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.25)]" style={{ marginBottom: "32px" }}>
                  <Map size={48} strokeWidth={1.5} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                </div>
                <div className="text-theme-text-base text-xl font-black tracking-wider uppercase mb-2 text-center">No Map Veto Results Found</div>
                <div className="text-theme-text-muted text-sm font-medium max-w-md mx-auto text-center">The veto data for this tournament is either unavailable or the matches have not yet concluded. Check back soon.</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MapBpResults;
