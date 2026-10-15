import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : undefined);
const socket = io(SOCKET_URL);

function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.sessionStorage.getItem(key);
      if (stickyValue !== null) return JSON.parse(stickyValue);
    } catch (e) {
      console.warn("Error reading sessionStorage", e);
    }
    return typeof defaultValue === "function" ? defaultValue() : defaultValue;
  });

  const isRemote = React.useRef(false);
  
  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(value));
    const room = window.currentDataEntryRoom || "Default";
    if (!isRemote.current) {
      socket.emit('cellEdit', { room, field: key, new_value: value });
    }
    isRemote.current = false;
  }, [key, value]);

  useEffect(() => {
    const handleRemoteEdit = (data) => {
      if (data.field === key) {
        isRemote.current = true;
        setValue(data.new_value);
      }
    };
    socket.on('cellEdit', handleRemoteEdit);
    return () => {
      socket.off('cellEdit', handleRemoteEdit);
    };
  }, [key]);

  return [value, setValue];
}

const SectionHeader = ({ icon, label, sub, accent = "#00ffcc" }) => (
  <div className="px-6 py-4 border-b border-theme-input flex items-center gap-4 bg-bg-300 backdrop-blur-md relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accent, boxShadow: `0 0 15px ${accent}80` }}></div>
    <div
      className="p-2 rounded-xl flex-shrink-0"
      style={{
        backgroundColor: accent + "15",
        border: `1px solid ${accent}30`,
      }}
    >
      <span style={{ color: accent }}>{icon}</span>
    </div>
    <div>
      {sub && (
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-theme-text-muted mb-0.5">
          {sub}
        </div>
      )}
      <h2 className="text-sm font-black text-theme-text-base uppercase tracking-[0.15em] drop-shadow-sm">
        {label}
      </h2>
    </div>
  </div>
);

const PRSEntry = ({ globalGame, globalTournament }) => {
  const setScope = `${globalTournament}_${globalGame}`;
  const [playersA, setPlayersA] = useStickyState([], `${setScope}_de_playersA`);
  const [playersB, setPlayersB] = useStickyState([], `${setScope}_de_playersB`);
  
  // Try to get match header data if available (this assumes DataEntry also uses useStickyState for this)
  const [matchHeader] = useStickyState("Match 1", "de_match");
  const [setNum] = useStickyState("1", "de_setNum");

  if (globalGame !== "CROSSFIRE") {
    return (
      <div className="p-8 w-full h-full flex flex-col items-center justify-center animate-fade-in text-theme-text-base bg-bg-100">
        <div className="p-6 border border-theme-input bg-bg-200 rounded-3xl backdrop-blur-sm text-center">
          <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-theme-text-muted">Not Available</h2>
          <p className="text-sm text-theme-text-muted mt-3 font-medium tracking-wide">PRS Per-Round Entry is only available for CROSSFIRE matches.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (team, pIdx, roundNum, statKey, val) => {
    const numericVal = val === "" ? "" : Number(val);
    if (team === 'A') {
      const newP = [...playersA];
      newP[pIdx] = { ...newP[pIdx], [`r${roundNum}_${statKey}`]: numericVal };
      setPlayersA(newP);
    } else {
      const newP = [...playersB];
      newP[pIdx] = { ...newP[pIdx], [`r${roundNum}_${statKey}`]: numericVal };
      setPlayersB(newP);
    }
  };

  const getTeamPlayers = (playersArr) => {
    return Array.from({ length: 5 }).map((_, i) => playersArr[i] || { ign: `Player ${i+1}` });
  };

  const displayPlayersA = getTeamPlayers(playersA);
  const displayPlayersB = getTeamPlayers(playersB);

  return (
    <div className="p-8 w-full h-full flex flex-col items-center animate-fade-in text-theme-text-base bg-bg-100 overflow-y-auto custom-scrollbar">
      <div className="w-full">
        {/* Header Section */}
        <div className="flex flex-col items-start w-full mb-8">
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-transparent mb-4 opacity-70"></div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.2em] drop-shadow-lg text-theme-text-base mb-2">
            PRS System
          </h1>
          <p className="text-theme-text-muted font-bold tracking-widest text-xs uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Advanced Per-Round Analytics
          </p>
        </div>

        {/* Spreadsheet Container */}
        <div className="bg-bg-200/80 backdrop-blur-xl rounded-3xl border border-theme-input overflow-hidden shadow-2xl mb-10">
          <SectionHeader
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }
            label="Statistical Grid"
            sub="Comprehensive Round-by-Round Data"
            accent="#00ffcc"
          />
          
          <div className="overflow-x-auto custom-scrollbar relative p-1 pb-4">
            <table className="w-full text-center border-collapse min-w-[2200px]">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted border-b border-theme-input bg-bg-200 relative z-20">
                  <th className="px-4 py-4 border-r border-theme-input sticky left-0 bg-bg-200 z-30 min-w-[90px]">Match</th>
                  <th className="px-3 py-4 border-r border-theme-input sticky left-[90px] bg-bg-200 z-30 min-w-[70px]">Team</th>
                  <th className="px-6 py-4 border-r border-theme-input sticky left-[160px] bg-bg-200 z-30 min-w-[130px] text-cyan-400">Player</th>
                  <th className="px-3 py-4 border-r-4 border-theme-input sticky left-[290px] bg-bg-200 z-30 min-w-[70px]">Stat</th>
                  
                  {Array.from({length: 25}).map((_, i) => (
                    <th key={i} className={`px-1 py-4 ${(i === 8 || i === 17 || i === 24) ? 'border-r-2 border-theme-input' : 'border-r border-theme-input'} text-theme-text-base w-[55px]`}>
                      R{i+1}
                    </th>
                  ))}
                  
                  {/* Right Side Calculated Headers */}
                  <th className="px-3 py-4 border-r border-theme-input bg-bg-200 text-theme-text-base min-w-[60px]">TOTAL</th>
                  <th className="px-3 py-4 border-r border-theme-input bg-bg-200 text-yellow-400 min-w-[70px]">ROUNDS</th>
                  <th className="px-3 py-4 border-r border-theme-input text-theme-text-base min-w-[60px]">+/-</th>
                  <th className="px-3 py-4 border-r border-theme-input text-emerald-400 min-w-[60px]">K/D</th>
                  <th className="px-3 py-4 border-r border-theme-input text-blue-400 min-w-[60px]">K/R</th>
                  <th className="px-3 py-4 border-r border-theme-input text-purple-400 min-w-[60px]">H/K</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { teamKey: 'A', name: 'Team 1', players: displayPlayersA, bgTheme: 'bg-blue-900/10 hover:bg-blue-900/20', textTheme: 'text-blue-400' },
                  { teamKey: 'B', name: 'Team 2', players: displayPlayersB, bgTheme: 'bg-red-900/10 hover:bg-red-900/20', textTheme: 'text-red-400' }
                ].map((group, groupIdx) => (
                  <React.Fragment key={group.teamKey}>
                    {group.players.map((p, pIdx) => {
                      
                      // Calculate formulas for the current player
                      const totals = { k: 0, d: 0, a: 0, h: 0 };
                      let roundsPlayed = 0;
                      
                      for (let i = 1; i <= 25; i++) {
                        const k = p[`r${i}_k`];
                        const d = p[`r${i}_d`];
                        const a = p[`r${i}_a`];
                        const h = p[`r${i}_h`];
                        
                        const hasK = k !== undefined && k !== "";
                        const hasD = d !== undefined && d !== "";
                        const hasA = a !== undefined && a !== "";
                        const hasH = h !== undefined && h !== "";
                        
                        if (hasK) totals.k += Number(k);
                        if (hasD) totals.d += Number(d);
                        if (hasA) totals.a += Number(a);
                        if (hasH) totals.h += Number(h);
                        
                        if (hasK || hasD || hasA || hasH) roundsPlayed++;
                      }
                      
                      const diff = totals.k - totals.d;
                      let kd = "-";
                      if (totals.d > 0) kd = (totals.k / totals.d).toFixed(2);
                      else if (totals.k > 0) kd = totals.k.toString();
                      else if (totals.k === 0 && totals.d === 0 && roundsPlayed > 0) kd = "0";

                      let kr = "-";
                      if (roundsPlayed > 0) kr = (totals.k / roundsPlayed).toFixed(2);
                      else if (totals.k === 0 && roundsPlayed === 0) kr = "0";

                      let hk = "-";
                      if (totals.k > 0) hk = (totals.h / totals.k).toFixed(2);
                      else if (totals.h === 0 && totals.k === 0 && roundsPlayed > 0) hk = "0";

                      // Clean up decimals
                      if (kd.endsWith(".00")) kd = kd.split(".")[0];
                      if (kr.endsWith(".00")) kr = kr.split(".")[0];
                      if (hk.endsWith(".00")) hk = hk.split(".")[0];

                      return ['Kill', 'Death', 'Assist', 'Headshot'].map((statName, statIdx) => {
                        const statKey = statName === 'Kill' ? 'k' : statName === 'Death' ? 'd' : statName === 'Assist' ? 'a' : 'h';
                        const isFirstStat = statIdx === 0;
                        const isFirstPlayer = pIdx === 0;
                        const isFirstGroup = groupIdx === 0;

                        // Stat visual styling
                        const statColor = statName === 'Kill' ? 'text-emerald-400' : statName === 'Death' ? 'text-red-400' : statName === 'Assist' ? 'text-amber-400' : 'text-cyan-400';

                        return (
                          <tr key={`${group.teamKey}-${pIdx}-${statName}`} className={`border-b border-theme-input transition-colors ${group.bgTheme}`}>
                            
                            {/* Match (Row span entire table = 40 rows) */}
                            {isFirstGroup && isFirstPlayer && isFirstStat && (
                              <td rowSpan={40} className="border-r border-theme-input sticky left-0 bg-bg-100 z-10 p-4">
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">Match</span>
                                  <span className="text-sm font-black text-theme-text-base">{matchHeader}</span>
                                  <span className="text-[9px] font-bold text-theme-text-muted uppercase tracking-widest mt-2">Set</span>
                                  <span className="text-xs font-black text-theme-text-base">{setNum}</span>
                                </div>
                              </td>
                            )}

                            {/* Team (Row span half table = 20 rows) */}
                            {isFirstPlayer && isFirstStat && (
                              <td rowSpan={20} className="border-r border-theme-input sticky left-[90px] bg-bg-200 z-10">
                                <div className="flex items-center justify-center h-full w-full">
                                  <span className={`text-sm font-black uppercase tracking-wider ${group.textTheme} transform -rotate-90 whitespace-nowrap`}>
                                    {group.name}
                                  </span>
                                </div>
                              </td>
                            )}

                            {/* Player (Row span 4 rows) */}
                            {isFirstStat && (
                              <td rowSpan={4} className="border-r border-theme-input sticky left-[160px] bg-bg-300 z-10 px-4">
                                <span className="text-xs font-bold text-theme-text-base tracking-wide block truncate max-w-[100px]">
                                  {p.ign}
                                </span>
                              </td>
                            )}

                            {/* Stat Name */}
                            <td className={`border-r-4 border-theme-input sticky left-[290px] bg-bg-300 z-10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${statColor}`}>
                              {statName}
                            </td>

                            {/* R1-R25 Inputs */}
                            {Array.from({length: 25}).map((_, i) => {
                              const val = p[`r${i+1}_${statKey}`];
                              const hasVal = val !== undefined && val !== "";
                              return (
                              <td key={i} className={`p-0 ${(i === 8 || i === 17 || i === 24) ? 'border-r-2 border-theme-input' : 'border-r border-theme-input'}`}>
                                  <input 
                                    type="text"
                                    className={`w-[55px] h-10 text-center text-[13px] font-bold rounded-md outline-none transition-all duration-200 bg-transparent ${hasVal ? 'text-theme-text-base' : 'text-theme-text-muted'} focus:bg-cyan-400/10 focus:text-cyan-400 focus:shadow-[inset_0_0_8px_var(--color-cyan-500)]`}
                                    value={val !== undefined ? val : ""}
                                    onChange={(e) => handleInputChange(group.teamKey, pIdx, i+1, statKey, e.target.value)}
                                  />
                                </td>
                              );
                            })}

                            {/* Stat Total */}
                            <td className="border-l-4 border-theme-input border-r border-theme-input bg-bg-400">
                              <span className="text-xs font-black text-theme-text-base">{totals[statKey]}</span>
                            </td>

                            {/* Merged Calculated Columns */}
                            {isFirstStat && (
                              <>
                                <td rowSpan={4} className="border-r border-theme-input bg-bg-400">
                                  <span className="text-[13px] font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]">{roundsPlayed}</span>
                                </td>
                                <td rowSpan={4} className="border-r border-theme-input">
                                  <span className={`text-xs font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-theme-text-muted'}`}>
                                    {diff > 0 ? `+${diff}` : diff}
                                  </span>
                                </td>
                                <td rowSpan={4} className="border-r border-theme-input">
                                  <span className="text-xs font-bold text-emerald-300">{kd}</span>
                                </td>
                                <td rowSpan={4} className="border-r border-theme-input">
                                  <span className="text-xs font-bold text-blue-300">{kr}</span>
                                </td>
                                <td rowSpan={4} className="border-r border-theme-input">
                                  <span className="text-xs font-bold text-purple-300">{hk}</span>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      });
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRSEntry;
