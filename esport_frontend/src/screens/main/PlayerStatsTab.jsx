import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../utils/api';
const PlayerStatsTab = ({ globalGame, globalTournament }) => {
  const activeGame = (globalGame || 'VALORANT').toUpperCase();
  const [stats, setStats] = useState([]);
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    const playersUrl = globalTournament ? `/api/players?tournament=${encodeURIComponent(globalTournament)}` : '/api/players';
    apiFetch(playersUrl)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPlayers(data);
      })
      .catch(console.error);
    const endpoint = activeGame === 'VALORANT' ? 'valorant' : 'crossfire';
    apiFetch(`/api/stats/${endpoint}?tournament=${encodeURIComponent(globalTournament || 'Default')}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setStats(data);
      })
      .catch(console.error);
  }, [activeGame, globalTournament]);
  const mergedData = useMemo(() => {
    const dataToUse = stats || [];
    return dataToUse.map(stat => {
      const playerInfo = players.find(p => p.player_name.toLowerCase() === stat.ign.toLowerCase());
      const role = playerInfo?.role_in_game || 'Unknown';
      const team = playerInfo?.teams?.team_name || 'Free Agent';
      const kills = stat.total_kills || 0;
      const deaths = stat.total_deaths || 0;
      const rounds = stat.total_rounds_played || 0;
      const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
      const kr = rounds > 0 ? (kills / rounds).toFixed(2) : '0.00';
      const sr = rounds > 0 ? ((rounds - deaths) / rounds).toFixed(2) : '0.00';
      const plusMinus = kills - deaths;
      let hk = '0.00';
      if (activeGame === 'CROSSFIRE' && stat.total_headshots && kills > 0) {
        hk = (stat.total_headshots / kills).toFixed(2);
      }
      return {
        ...stat,
        role,
        team,
        kd,
        kr,
        sr,
        plusMinus,
        hk
      };
    }).sort((a, b) => b.total_kills - a.total_kills);
  }, [stats, players, activeGame]);
  return (
    <div className="flex-1 bg-bg-100 light:bg-slate-50 text-theme-text-base light:text-slate-900 flex flex-col h-full">
      <style>{`
        .spreadsheet-container::-webkit-scrollbar { width: 8px; height: 8px; }
        .spreadsheet-container::-webkit-scrollbar-track { background: #0a0f16; border-radius: 8px; }
        .spreadsheet-container::-webkit-scrollbar-thumb { background: #2a3648; border-radius: 8px; border: 2px solid #0a0f16; }
        .spreadsheet-container::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        .spreadsheet-container {
          border-radius: 16px;
          border: 1px solid var(--color-bg-500);
          background: var(--color-bg-200);
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
          margin: 16px 24px;
          overflow: auto;
        }
        .light-mode .spreadsheet-container {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .spreadsheet-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .spreadsheet-table th, .spreadsheet-table td {
          padding: 14px 20px;
          white-space: nowrap;
          text-align: center;
          border-bottom: 1px solid var(--color-bg-500);
        }
        .light-mode .spreadsheet-table th, .light-mode .spreadsheet-table td {
          border-bottom: 1px solid #f1f5f9;
        }
        .spreadsheet-table th {
          background: var(--color-bg-300);
          font-weight: 900;
          font-size: 10px;
          color: var(--theme-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .light-mode .spreadsheet-table th {
          background: #f8fafc;
          color: #94a3b8;
        }
        .spreadsheet-table th::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--color-bg-500);
        }
        .light-mode .spreadsheet-table th::after {
          background: #e2e8f0;
        }
        .spreadsheet-table tbody tr {
          transition: all 0.2s ease;
        }
        .spreadsheet-table tbody tr:hover td {
          background-color: var(--color-bg-400);
        }
        .light-mode .spreadsheet-table tbody tr:hover td {
          background-color: #f1f5f9;
        }
        .spreadsheet-table td {
          font-size: 13px;
          color: var(--theme-text-base);
          font-weight: 600;
        }
        .light-mode .spreadsheet-table td {
          color: #334155;
        }
        .col-highlight {
          background-color: rgba(255, 255, 255, 0.015);
        }
        .light-mode .col-highlight {
          background-color: rgba(0, 0, 0, 0.015);
        }
      `}</style>
      <div className="p-6 border-b border-theme-input light:border-slate-200 flex justify-between items-center bg-bg-200 light:from-white light:to-slate-50">
        <div>
          <h1 className="text-xl font-black tracking-widest text-theme-text-base light:text-slate-900 uppercase">{activeGame} Player Stats</h1>
          <p className="text-xs text-theme-text-faint light:text-theme-text-muted mt-1">Comprehensive spreadsheet view of all player records</p>
        </div>
      </div>
      <div className="flex-1 spreadsheet-container">
        <table className="spreadsheet-table">
          <thead>
            <tr>
              <th className="sticky left-0 z-30" style={{background: 'var(--color-bg-300)'}}>POS</th>
              <th className="sticky left-[72px] z-30 text-left" style={{background: 'var(--color-bg-300)'}}>PLAYER IGN</th>
              <th>ROLE</th>
              <th>TEAM</th>
              <th>ROUNDS PLAYED</th>
              {activeGame === 'VALORANT' && <th>TOTAL SETS</th>}
              <th className="text-cyan-500">TOTAL KILLS</th>
              <th className="text-red-500">TOTAL DEATHS</th>
              <th className="text-emerald-500">TOTAL ASSIST</th>
              {activeGame === 'CROSSFIRE' && <th>TOTAL HEADSHOTS</th>}
              {activeGame === 'VALORANT' && <th>TOTAL ACS</th>}
              {activeGame === 'VALORANT' && <th>TOTAL ECON</th>}
              <th className="col-highlight text-orange-400">K/D</th>
              <th className="col-highlight text-orange-400">K/R</th>
              {activeGame === 'CROSSFIRE' && <th className="col-highlight text-orange-400">H/K</th>}
              <th className="col-highlight text-orange-400">S/R</th>
              <th className="col-highlight text-purple-400">+/-</th>
              {activeGame === 'CROSSFIRE' && <th className="text-yellow-500">PRS</th>}
            </tr>
          </thead>
          <tbody>
            {mergedData.length > 0 ? mergedData.map((row, idx) => (
              <tr key={idx} className="group">
                <td className="sticky left-0 z-10" style={{background: 'var(--color-bg-200)'}}>
                  <div className="bg-theme-input light:bg-slate-100 text-theme-text-muted light:text-theme-text-muted text-[10px] font-bold min-w-[24px] h-6 px-1 rounded flex items-center justify-center mx-auto group-hover:bg-blue-500/20 light:group-hover:bg-blue-100 group-hover:text-blue-400 light:group-hover:text-blue-600 transition-colors">
                    {idx + 1}
                  </div>
                </td>
                <td className="sticky left-[72px] z-10 text-left" style={{background: 'var(--color-bg-200)'}}>
                  <span className="font-bold text-theme-text-base light:text-slate-900 group-hover:text-blue-400 light:group-hover:text-blue-600 transition-colors">{row.ign}</span>
                </td>
                <td>
                  <span className="bg-theme-input light:bg-slate-100 border border-theme-input light:border-slate-200 text-theme-text-base light:text-slate-700 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {row.role}
                  </span>
                </td>
                <td>
                  <span className="font-bold text-theme-text-base light:text-slate-700 tracking-wide">{row.team}</span>
                </td>
                <td><span className="text-theme-text-muted light:text-theme-text-muted">{row.total_rounds_played || 0}</span></td>
                {activeGame === 'VALORANT' && <td><span className="text-theme-text-muted light:text-theme-text-muted">{row.matches_played || 0}</span></td>}
                <td className="font-black text-theme-text-base light:text-slate-900">{row.total_kills || 0}</td>
                <td className="font-bold text-theme-text-muted light:text-slate-600">{row.total_deaths || 0}</td>
                <td className="font-bold text-theme-text-muted light:text-slate-600">{row.total_assists || 0}</td>
                {activeGame === 'CROSSFIRE' && <td><span className="text-theme-text-muted light:text-theme-text-muted">{row.total_headshots || 0}</span></td>}
                {activeGame === 'VALORANT' && <td><span className="text-theme-text-muted light:text-theme-text-muted">{row.total_acs || 0}</span></td>}
                {activeGame === 'VALORANT' && <td><span className="text-theme-text-muted light:text-theme-text-muted">{row.total_econ || 0}</span></td>}
                <td className="col-highlight font-black text-theme-text-base light:text-slate-800">{row.kd}</td>
                <td className="col-highlight font-black text-theme-text-base light:text-slate-800">{row.kr}</td>
                {activeGame === 'CROSSFIRE' && <td className="col-highlight font-black text-theme-text-base light:text-slate-800">{row.hk}</td>}
                <td className="col-highlight font-black text-theme-text-base light:text-slate-800">{row.sr}</td>
                <td className={`col-highlight font-black ${row.plusMinus > 0 ? 'text-emerald-400 light:text-emerald-600' : row.plusMinus < 0 ? 'text-red-400 light:text-red-600' : 'text-theme-text-muted light:text-theme-text-muted'}`}>
                  {row.plusMinus > 0 ? `+${row.plusMinus}` : row.plusMinus}
                </td>
                {activeGame === 'CROSSFIRE' && (
                  <td>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-black py-1 px-3 rounded inline-block shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                      {Math.round(row.performance_score || 0)}
                    </div>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan="20" className="py-12 text-theme-text-faint text-center">No player stats available yet. Submit a match in Data Entry!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default PlayerStatsTab;
