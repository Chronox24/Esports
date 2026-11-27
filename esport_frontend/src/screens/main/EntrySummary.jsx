import React, { useState, useEffect } from 'react';
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.sessionStorage.getItem(key);
      if (stickyValue !== null) return JSON.parse(stickyValue);
    } catch (e) {
      console.warn("Error reading sessionStorage", e);
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });
  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
const EntrySummary = ({ globalGame, globalTournament }) => {
  const [teamA] = useStickyState({ name: 'WOLF ESPORT', logo: '' }, 'de_teamA');
  const [teamB] = useStickyState({ name: 'GOAT GAMING', logo: '' }, 'de_teamB');
  const [scoreA] = useStickyState(13, 'de_scoreA');
  const [scoreB] = useStickyState(11, 'de_scoreB');
  const [playersA] = useStickyState(Array(5).fill(null).map(() => ({ ign: '', agent: 'Jett', k: 0, d: 0, a: 0, acs: 0, econ: 0 })), 'de_playersA');
  const [playersB] = useStickyState(Array(5).fill(null).map(() => ({ ign: '', agent: 'Jett', k: 0, d: 0, a: 0, acs: 0, econ: 0 })), 'de_playersB');
  const [cfGroups] = useStickyState([
    { id: 'total', label: 'TOTAL', isTotal: true },
    { id: 'set1', label: 'SET 1', isTotal: false },
    { id: 'set2', label: 'SET 2', isTotal: false }
  ], 'de_cfGroups');
  const totalRounds = Number(scoreA) + Number(scoreB);
  const totalRoundsSafe = totalRounds > 0 ? totalRounds : 1;
  const calculatePRS = (k, d, a, h) => {
    let prs = (k * 2.5 + a * 1.5 - d * 1.2 + h * 0.5) * 2;
    if (prs < 0) return 0;
    if (prs > 100) return 100;
    return prs;
  };
  const getSetStats = (player, setId) => {
    const k = Number(player[`${setId}_k`]) || 0;
    const d = Number(player[`${setId}_d`]) || 0;
    const a = Number(player[`${setId}_a`]) || 0;
    const h = Number(player[`${setId}_h`]) || 0;
    return { k, d, a, h, prs: calculatePRS(k, d, a, h) };
  };
  const calculateDerived = (p) => {
    const k = Number(p.total_k) || 0;
    const d = Number(p.total_d) || 0;
    const a = Number(p.total_a) || 0;
    const h = Number(p.total_h) || 0;
    const kd = d > 0 ? (k / d).toFixed(2) : k.toFixed(2);
    const kr = (k / totalRoundsSafe).toFixed(2);
    const hk = k > 0 ? (h / k).toFixed(2) : '0.00';
    const sr = totalRounds > 0 ? Math.max(0, 1 - d / totalRounds).toFixed(2) : '0.00';
    const plusMinus = k - d;
    const sets = cfGroups.filter(g => !g.isTotal);
    let totalPRS = 0;
    sets.forEach(g => {
      totalPRS += getSetStats(p, g.id).prs;
    });
    const avgPrs = sets.length > 0 ? totalPRS / sets.length : 0;
    return { 
      ign: p.ign || 'Unknown', 
      k, d, a, h, 
      kd, kr, hk, sr, 
      plusMinus, 
      prs: avgPrs 
    };
  };
  const statsA = playersA.map(calculateDerived);
  const statsB = playersB.map(calculateDerived);
  const allStats = [...statsA, ...statsB];
  const sortedByPrs = [...allStats].sort((a, b) => b.prs - a.prs);
  const matchMVP = sortedByPrs[0] || {};
  const renderTableRows = (statsArray, teamName, rowColorClass) => {
    return statsArray.map((st, i) => (
      <tr key={i} className={`border-b border-slate-800/40 light:border-slate-200 hover:bg-white/5 transition-colors ${rowColorClass}`}>
        <td className="py-3 px-4 font-bold">{st.ign}</td>
        <td className="py-3 px-4 text-center">{st.k}</td>
        <td className="py-3 px-4 text-center">{st.d}</td>
        <td className="py-3 px-4 text-center">{st.a}</td>
        <td className="py-3 px-4 text-center">{st.h}</td>
        <td className="py-3 px-4 text-center font-mono text-amber-400/90">{st.kd}</td>
        <td className="py-3 px-4 text-center font-mono text-emerald-400/90">{st.kr}</td>
        <td className="py-3 px-4 text-center font-mono text-cyan-400/90">{st.hk}</td>
        <td className="py-3 px-4 text-center font-mono text-purple-400/90">{st.sr}</td>
        <td className={`py-3 px-4 text-center font-bold ${st.plusMinus > 0 ? 'text-green-400' : st.plusMinus < 0 ? 'text-red-400' : 'text-theme-text-muted'}`}>
          {st.plusMinus > 0 ? `+${st.plusMinus}` : st.plusMinus}
        </td>
        <td className="py-3 px-4 text-center font-black text-cyan-400">{st.prs.toFixed(2)}</td>
      </tr>
    ));
  };
  return (
    <div className="h-full flex flex-col bg-bg-100 light:bg-slate-50 text-theme-text-base light:text-slate-800 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-[1500px] mx-auto px-8 py-10 flex flex-col gap-8">
        {}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-theme-text-base uppercase tracking-widest mb-2 drop-shadow-md">Entry Summary</h1>
            <p className="text-theme-text-muted text-sm tracking-wider uppercase">Live calculation based on Data Entry inputs</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-8 items-center shadow-lg">
            <div className="text-center">
              <p className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest mb-1">Total Round Score</p>
              <p className="text-2xl font-black text-theme-text-base">{totalRounds}</p>
            </div>
            <div className="w-px h-10 bg-slate-800"></div>
            <div className="text-center">
              <p className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest mb-1">{teamA.name}</p>
              <p className="text-2xl font-black text-blue-400">{scoreA}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest mb-1">{teamB.name}</p>
              <p className="text-2xl font-black text-red-400">{scoreB}</p>
            </div>
          </div>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/20 border border-amber-500/30 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.1)]">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
             <h3 className="text-amber-400 font-black tracking-[0.3em] uppercase text-sm mb-4">Match MVP</h3>
             <p className="text-3xl font-black text-theme-text-base mb-2">{matchMVP.ign || 'N/A'}</p>
             <div className="flex gap-6 mt-4">
               <div className="text-center"><p className="text-xs text-amber-500/80 font-bold">K/D</p><p className="text-lg font-mono text-theme-text-base">{matchMVP.kd || '-'}</p></div>
               <div className="text-center"><p className="text-xs text-amber-500/80 font-bold">K/R</p><p className="text-lg font-mono text-theme-text-base">{matchMVP.kr || '-'}</p></div>
               <div className="text-center"><p className="text-xs text-amber-500/80 font-bold">PRS</p><p className="text-2xl font-black text-cyan-400">{matchMVP.prs ? matchMVP.prs.toFixed(2) : '-'}</p></div>
             </div>
          </div>
        </div>
        {}
        <div className="bg-bg-200 border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900/80 py-4 border-b border-slate-800 flex items-center justify-center">
            <h2 className="text-theme-text-base font-black tracking-[0.4em] text-sm uppercase">Set Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-300">
                <tr className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest border-b border-slate-800/60">
                  <th className="py-4 px-4 text-left">Player</th>
                  <th className="py-4 px-4">Kills</th>
                  <th className="py-4 px-4">Deaths</th>
                  <th className="py-4 px-4">Assist</th>
                  <th className="py-4 px-4">Headshots</th>
                  <th className="py-4 px-4 text-amber-500/80">K/D</th>
                  <th className="py-4 px-4 text-emerald-500/80">K/R</th>
                  <th className="py-4 px-4 text-cyan-500/80">H/K</th>
                  <th className="py-4 px-4 text-purple-500/80">S/R</th>
                  <th className="py-4 px-4">+/-</th>
                  <th className="py-4 px-4 text-cyan-400">PRS</th>
                </tr>
              </thead>
              <tbody>
                {renderTableRows(statsA, teamA.name, "bg-blue-900/5")}
                {}
                <tr className="bg-slate-900/60 border-b border-t border-slate-800/80"><td colSpan={11} className="py-2"></td></tr>
                {renderTableRows(statsB, teamB.name, "bg-red-900/5")}
              </tbody>
            </table>
          </div>
        </div>
        {}
        <div className="bg-bg-200 border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl mt-4">
           <div className="bg-slate-900/80 py-4 border-b border-slate-800 flex items-center justify-center">
            <h2 className="text-theme-text-base font-black tracking-[0.4em] text-sm uppercase">PRS Breakdown Per Set</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-300">
                <tr className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest border-b border-slate-800/60">
                  <th className="py-4 px-4 text-left">Player</th>
                  {cfGroups.filter(g => !g.isTotal).map(g => (
                    <th key={g.id} className="py-4 px-4 text-center">{g.label}</th>
                  ))}
                  <th className="py-4 px-4 text-cyan-400 text-center">AVR PRS</th>
                </tr>
              </thead>
              <tbody>
                {allStats.map((st, i) => (
                  <tr key={i} className="border-b border-slate-800/40 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold">{st.ign}</td>
                    {cfGroups.filter(g => !g.isTotal).map(g => {
                       const origPlayer = [...playersA, ...playersB].find(p => (p.ign || 'Unknown') === st.ign) || {};
                       const setStat = getSetStats(origPlayer, g.id);
                       return (
                         <td key={g.id} className="py-3 px-4 text-center text-theme-text-base font-mono">
                           {setStat.prs.toFixed(2)}
                         </td>
                       );
                    })}
                    <td className="py-3 px-4 text-center font-black text-cyan-400 bg-cyan-400/5">{st.prs.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EntrySummary;
