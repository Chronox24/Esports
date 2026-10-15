import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../utils/api";
import { calculateStandings as generateStandingsFromBracket } from '../../utils/calculateStandings';

import { Users, Plus, Shield, Trash2, GripVertical, PanelLeftClose, PanelLeftOpen, Trophy, TrendingUp, Search, ChevronUp, ChevronDown } from 'lucide-react';
const TrophyIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
);
const CrownIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
);
const SwordsIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" x2="19" y1="19" y2="13" /><line x1="16" x2="20" y1="16" y2="20" /><line x1="19" x2="21" y1="21" y2="19" /><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" /><line x1="5" x2="9" y1="14" y2="18" /><line x1="7" x2="4" y1="17" y2="20" /><line x1="3" x2="5" y1="19" y2="21" /></svg>
);
const ShieldIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const UserIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const TrashIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);
const PlusIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
const ShuffleIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="16 3 21 3 21 8" /><line x1="4" x2="21" y1="20" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" x2="21" y1="15" y2="21" /><line x1="4" x2="9" y1="4" y2="9" /></svg>
);
const ExternalLinkIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
);
const SaveIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
);
const HashIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" /></svg>
);

function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// --- Dynamic Bracket Generators ---
const generateSingleElimBracket = (numTeams, teamPool) => {
  const n = Math.max(2, numTeams);
  const size = Math.pow(2, Math.ceil(Math.log2(n)));
  const numRounds = Math.log2(size);
  const bracket = [];
  let matchId = 1;

  for (let r = 0; r < numRounds; r++) {
    const matchesInRound = size / Math.pow(2, r + 1);
    const round = [];
    for (let m = 0; m < matchesInRound; m++) {
      round.push({
        id: matchId++,
        team1: "", team2: "", score1: 0, score2: 0,
        nextMatchId: null, nextSlot: null,
        isFinals: r === numRounds - 1
      });
    }
    bracket.push(round);
  }

  // Link matches and Auto Seed first round
  for (let r = 0; r < numRounds; r++) {
    for (let m = 0; m < bracket[r].length; m++) {
      const match = bracket[r][m];
      if (r < numRounds - 1) {
        match.nextMatchId = bracket[r + 1][Math.floor(m / 2)].id;
        match.nextSlot = m % 2 === 0 ? "team1" : "team2";
      }
      if (r === 0) {
        match.team1 = teamPool[m * 2] || "TBD";
        match.team2 = teamPool[m * 2 + 1] || "TBD";
      }
    }
  }
  return bracket;
};

const generateDoubleElimBracket = (numTeams, teamPool) => {
  const n = Math.max(2, numTeams);
  const size = Math.pow(2, Math.ceil(Math.log2(n)));
  const upperRoundsCount = Math.log2(size);
  const lowerRoundsCount = Math.max(0, 2 * upperRoundsCount - 2);

  const bracket = { upper: [], lower: [], finals: [] };
  let matchId = 1;

  // Upper Bracket Generation
  for (let r = 0; r < upperRoundsCount; r++) {
    const matchesInRound = size / Math.pow(2, r + 1);
    const round = [];
    for (let m = 0; m < matchesInRound; m++) {
      round.push({
        id: matchId++,
        team1: r === 0 ? (teamPool[m * 2] || "TBD") : "",
        team2: r === 0 ? (teamPool[m * 2 + 1] || "TBD") : "",
        score1: 0, score2: 0,
        nextMatchId: null, nextSlot: null,
        loserMatchId: null, loserSlot: null
      });
    }
    bracket.upper.push(round);
  }

  // Lower Bracket Generation
  for (let r = 0; r < lowerRoundsCount; r++) {
    const matchesInRound = size / Math.pow(2, Math.floor(r / 2) + 2);
    const round = [];
    for (let m = 0; m < matchesInRound; m++) {
      round.push({
        id: matchId++,
        team1: "", team2: "", score1: 0, score2: 0,
        nextMatchId: null, nextSlot: null, isLower: true
      });
    }
    bracket.lower.push(round);
  }

  // Finals Generation
  bracket.finals.push([{
    id: matchId++,
    team1: "", team2: "", score1: 0, score2: 0,
    nextMatchId: null, nextSlot: null, isFinals: true
  }]);

  // Link Upper Bracket
  for (let r = 0; r < upperRoundsCount; r++) {
    for (let m = 0; m < bracket.upper[r].length; m++) {
      const match = bracket.upper[r][m];

      if (r < upperRoundsCount - 1) {
        match.nextMatchId = bracket.upper[r + 1][Math.floor(m / 2)].id;
        match.nextSlot = m % 2 === 0 ? "team1" : "team2";
      } else {
        match.nextMatchId = bracket.finals[0][0].id;
        match.nextSlot = "team1";
      }

      if (r === 0) {
        if (bracket.lower[0]) {
          match.loserMatchId = bracket.lower[0][Math.floor(m / 2)].id;
          match.loserSlot = m % 2 === 0 ? "team1" : "team2";
        }
      } else {
        const targetLrIndex = r * 2 - 1;
        if (bracket.lower[targetLrIndex]) {
          match.loserMatchId = bracket.lower[targetLrIndex][m].id;
          match.loserSlot = "team1";
        }
      }
    }
  }

  // Link Lower Bracket
  for (let r = 0; r < lowerRoundsCount; r++) {
    for (let m = 0; m < bracket.lower[r].length; m++) {
      const match = bracket.lower[r][m];
      if (r < lowerRoundsCount - 1) {
        if (r % 2 === 0) {
          match.nextMatchId = bracket.lower[r + 1][m].id;
          match.nextSlot = "team2";
        } else {
          match.nextMatchId = bracket.lower[r + 1][Math.floor(m / 2)].id;
          match.nextSlot = m % 2 === 0 ? "team1" : "team2";
        }
      } else {
        match.nextMatchId = bracket.finals[0][0].id;
        match.nextSlot = "team2";
      }
    }
  }

  return bracket;
};

const generateRoundRobin = (teamPool, encounters = 1) => {
  let teams = teamPool.length >= 2 ? [...teamPool] : ["TBD", "TBD"];
  if (teams.length % 2 !== 0) {
    teams.push("BYE");
  }

  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const matches = [];
  let matchId = 1;
  let overallRound = 1;

  for (let e = 0; e < encounters; e++) {
    for (let round = 0; round < numRounds; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const homeIndex = (round + i) % (numTeams - 1);
        const awayIndex = (numTeams - 1 - i + round) % (numTeams - 1);

        let team1 = i === 0 ? teams[numTeams - 1] : teams[homeIndex];
        let team2 = teams[awayIndex];

        if (team1 !== "BYE" && team2 !== "BYE") {
          matches.push({
            id: matchId++,
            round: overallRound,
            team1: team1,
            team2: team2,
            score1: 0, score2: 0, played: false
          });
        }
      }
      overallRound++;
    }
  }
  return matches;
};

/* ── Match Card ─────────────────────────────────────────── */
const MatchCard = ({ match, onChange, matchNumber }) => {
  const s1 = parseInt(match.score1) || 0;
  const s2 = parseInt(match.score2) || 0;
  const isTeam1Winner = s1 > s2 && match.played !== false;
  const isTeam2Winner = s2 > s1 && match.played !== false;
  const hasWinner = isTeam1Winner || isTeam2Winner;

  const cardBorder = match.isFinals
    ? '1px solid rgba(234,179,8,0.4)'
    : hasWinner
      ? '1px solid rgba(6, 182, 212, 0.5)'
      : '1px solid rgba(51,65,85,0.4)';

  const rowStyle = (isWinner) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    position: 'relative',
    background: isWinner
      ? 'linear-gradient(90deg, color-mix(in srgb, var(--color-cyan-500) 20%, transparent) 0%, var(--color-bg-300) 100%)'
      : 'var(--color-bg-200)',
    transition: 'background 0.2s',
  });

  const teamNameStyle = (isWinner, hasName) => ({
    fontSize: '12px',
    fontWeight: 700,
    color: isWinner ? 'var(--theme-text-base)' : hasName ? 'var(--theme-text-base)' : 'var(--theme-text-muted)',
    fontStyle: hasName ? 'normal' : 'italic',
    textShadow: isWinner ? '0 0 6px rgba(255,255,255,0.3)' : 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  });

  const scoreStyle = (isWinner) => ({
    fontWeight: 900,
    textAlign: 'center',
    width: '36px',
    height: '28px',
    borderRadius: '4px',
    fontSize: '14px',
    padding: '0',
    border: isWinner ? '1px solid var(--color-cyan-500)' : '1px solid var(--color-bg-500)',
    background: isWinner ? 'color-mix(in srgb, var(--color-cyan-500) 20%, transparent)' : 'var(--color-bg-400)',
    color: isWinner ? 'var(--color-cyan-400)' : 'var(--theme-text-base)',
    outline: 'none',
    flexShrink: 0,
  });

  return (
    <div
      style={{
        width: 280,
        borderRadius: '8px',
        overflow: 'hidden',
        border: cardBorder,
        position: 'relative',
        transition: 'transform 0.3s, box-shadow 0.3s',
      }}
      className="hover:-translate-y-0.5"
    >
      {/* Finals glow */}
      {match.isFinals && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(90deg, transparent, rgba(234,179,8,0.1), transparent)',
          animation: 'pulse 2s infinite',
        }} />
      )}

      {/* ─── Team 1 Row ─── */}
      <div style={rowStyle(isTeam1Winner)}>
        {isTeam1Winner && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, #22d3ee, #0891b2)', boxShadow: '0 0 8px #06b6d4' }} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: isTeam1Winner ? 'color-mix(in srgb, var(--color-cyan-500) 20%, transparent)' : 'var(--color-bg-300)',
            border: isTeam1Winner ? '1px solid var(--color-cyan-500)' : '1px solid var(--color-bg-500)',
          }}>
            {isTeam1Winner
              ? <CrownIcon size={11} className="text-cyan-400" />
              : <SwordsIcon size={11} className="text-theme-text-muted" />
            }
          </div>
          <span style={teamNameStyle(isTeam1Winner, !!match.team1)}>
            {match.team1 || "TBD"}
          </span>
        </div>
        {matchNumber != null && (
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#475569', marginRight: 6, flexShrink: 0 }}>{matchNumber}</span>
        )}
        <input
          type="number"
          value={match.score1}
          onChange={(e) => onChange("score1", e.target.value)}
          style={scoreStyle(isTeam1Winner)}
        />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(51,65,85,0.3)' }} />

      {/* ─── Team 2 Row ─── */}
      <div style={rowStyle(isTeam2Winner)}>
        {isTeam2Winner && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, #22d3ee, #0891b2)', boxShadow: '0 0 8px #06b6d4' }} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: isTeam2Winner ? 'color-mix(in srgb, var(--color-cyan-500) 20%, transparent)' : 'var(--color-bg-300)',
            border: isTeam2Winner ? '1px solid var(--color-cyan-500)' : '1px solid var(--color-bg-500)',
          }}>
            {isTeam2Winner
              ? <CrownIcon size={11} className="text-cyan-400" />
              : <SwordsIcon size={11} className="text-theme-text-muted" />
            }
          </div>
          <span style={teamNameStyle(isTeam2Winner, !!match.team2)}>
            {match.team2 || "TBD"}
          </span>
        </div>
        {matchNumber != null && (
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#475569', marginRight: 6, flexShrink: 0 }}>{matchNumber}</span>
        )}
        <input
          type="number"
          value={match.score2}
          onChange={(e) => onChange("score2", e.target.value)}
          style={scoreStyle(isTeam2Winner)}
        />
      </div>
    </div>
  );
};

/* ── Main Bracket Component ─────────────────────────────── */
const Bracket = ({ globalGame, globalTournament, isReadOnly = false }) => {
  const [activeFormat, setActiveFormat] = useState(() => {
    const saved = localStorage.getItem('activeFormat') || 'Single Elimination';
    if (saved.toLowerCase() === 'round robin') return 'Round Robin';
    if (saved.toLowerCase() === 'single elimination') return 'Single Elimination';
    if (saved.toLowerCase() === 'double elimination') return 'Double Elimination';
    if (saved.toLowerCase() === 'results') return 'Results';
    return saved;
  });
  useEffect(() => { localStorage.setItem('activeFormat', activeFormat); }, [activeFormat]);
  const [isFormatLocked, setIsFormatLocked] = useState(false);
  const [roundRobinEncounters, setRoundRobinEncounters] = useState(1);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(true);

  const [lockedFormatName, setLockedFormatName] = useState("");

  useEffect(() => {
    if (isFormatLocked && activeFormat !== "Results") {
      setLockedFormatName(activeFormat);
    }
  }, [isFormatLocked, activeFormat]);

  const formats = (isFormatLocked
    ? [activeFormat !== "Results" ? activeFormat : lockedFormatName, "Results"].filter(Boolean)
    : ["Single Elimination", "Double Elimination", "Round Robin", "Results"]).filter(f => !isReadOnly || f !== "Results");

  const [allTeamsData, setAllTeamsData] = useState([]);
  const [teamPool, setTeamPool] = useState([]);
  const [newTeam, setNewTeam] = useState("");
  const [singleElimData, setSingleElimData] = useState(() => generateSingleElimBracket(0, []));
  const [doubleElimData, setDoubleElimData] = useState(() => generateDoubleElimBracket(0, []));
  const [roundRobinData, setRoundRobinData] = useState(() => generateRoundRobin([]));
  const [resultsData, setResultsData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isIdle, setIsIdle] = useState(false);





  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await apiFetch(`/api/teams`);
        if (res.ok) {
          const data = await res.json();
          setAllTeamsData(data);
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };
    fetchTeams();
  }, []);

  // Total bracket slots for seed indicator
  const totalSlots = 8;

  // Inactivity timer for UI fade
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsIdle(true), 2500); // 2.5 seconds
    };

    handleMouseMove();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const lastFetchedTournament = useRef(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const activeGame = (globalGame || 'VALORANT').toUpperCase();
        const tName = globalTournament?.name || 'Default';
        const tournamentKey = `${tName}-${activeGame}`;

        if (lastFetchedTournament.current === tournamentKey) {
          return;
        }
        lastFetchedTournament.current = tournamentKey;

        // 1. Fetch Teams
        const resTeams = await apiFetch(`/api/teams?tournament=${tName}`);
        let dbTeams = [];
        if (resTeams.ok) {
          const teamsData = await resTeams.json();
          dbTeams = teamsData.map(t => t.team_name);
        }

        // 2. Fetch Bracket State
        const resAll = await apiFetch(`/api/bracket-states-all`);
        if (resAll.ok) {
          const allStates = await resAll.json();
          const tName = globalTournament?.name || 'Default';
          const tournamentStates = allStates
            .filter(s => s.tournament_name === tName && s.game_title === activeGame)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

          const stateData = tournamentStates.length > 0 ? tournamentStates[0] : null;

          const currentTeamPool = stateData && stateData.team_pool 
            ? stateData.team_pool.map(t => typeof t === 'object' && t !== null ? (t.name || t.team_name || JSON.stringify(t)) : t) 
            : dbTeams;

          if (stateData && stateData.team_pool) {
            setTeamPool(currentTeamPool);
          } else {
            setTeamPool(dbTeams);
          }

          if (stateData && stateData.format) {
            const dbFormat = stateData.format.toLowerCase();
            const normalizedFormat = dbFormat === 'single elimination' ? 'Single Elimination' :
                                     dbFormat === 'double elimination' ? 'Double Elimination' :
                                     dbFormat === 'round robin' ? 'Round Robin' : stateData.format;
            if (activeFormat !== "Results") {
              setActiveFormat(normalizedFormat);
            }
            setIsFormatLocked(true);
            setSingleElimData(normalizedFormat === "Single Elimination" ? stateData.bracket_data : generateSingleElimBracket(currentTeamPool.length, currentTeamPool));
            setDoubleElimData(normalizedFormat === "Double Elimination" ? stateData.bracket_data : generateDoubleElimBracket(currentTeamPool.length, currentTeamPool));
            setRoundRobinData(normalizedFormat === "Round Robin" ? stateData.bracket_data : generateRoundRobin(currentTeamPool, roundRobinEncounters));
          } else {
            setIsFormatLocked(false);
            setSingleElimData(generateSingleElimBracket(dbTeams.length, dbTeams));
            setDoubleElimData(generateDoubleElimBracket(dbTeams.length, dbTeams));
            setRoundRobinData(generateRoundRobin(dbTeams, roundRobinEncounters));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setHasLoaded(true);
      }
    };
    fetchState();
  }, [globalTournament?.name, globalGame]);


  const [processedLiveMatches, setProcessedLiveMatches] = useStickyState([], "bracket_processed_live_matches");

  useEffect(() => {
    if (!isLiveConnected) return;
    let intervalId;

    const pollLiveMatches = async () => {
      try {
        const activeGame = (globalGame || 'VALORANT').toUpperCase();
        const tournament = globalTournament?.name || "Default";
        const res = await apiFetch(`/api/matches?status=finished&tournament=${tournament}`);
        if (!res.ok) return;
        const finishedMatches = await res.json();

        let updated = false;
        let newSingleElim = JSON.parse(JSON.stringify(singleElimData));
        let newDoubleElim = JSON.parse(JSON.stringify(doubleElimData));
        let newRoundRobin = JSON.parse(JSON.stringify(roundRobinData));
        let newProcessed = [...processedLiveMatches];

        for (const match of finishedMatches) {
          if (newProcessed.includes(match.match_id)) continue;

          // Resolve names
          const teamA = match.team_a?.team_name || "TBD";
          const teamB = match.team_b?.team_name || "TBD";
          const scoreA = match.team_a_score || 0;
          const scoreB = match.team_b_score || 0;
          let winner = null;
          if (scoreA > scoreB) winner = teamA;
          else if (scoreB > scoreA) winner = teamB;
          else continue; // Tie? Wait for actual winner

          // Traverse Single Elim Bracket
          if (activeFormat === "Single Elimination" && newSingleElim && newSingleElim.length > 0) {
            for (let r = 0; r < newSingleElim.length; r++) {
              for (let m = 0; m < newSingleElim[r].length; m++) {
                const bMatch = newSingleElim[r][m];

                // Match teams (could be flipped)
                const isDirectMatch = bMatch.team1 === teamA && bMatch.team2 === teamB;
                const isFlippedMatch = bMatch.team1 === teamB && bMatch.team2 === teamA;

                if (isDirectMatch || isFlippedMatch) {
                  bMatch.score1 = isDirectMatch ? scoreA : scoreB;
                  bMatch.score2 = isDirectMatch ? scoreB : scoreA;

                  // Auto advance winner
                  if (bMatch.nextMatchId && winner) {
                    // Find next match
                    for (let nr = r + 1; nr < newSingleElim.length; nr++) {
                      const nextMatch = newSingleElim[nr].find(nm => nm.id === bMatch.nextMatchId);
                      if (nextMatch) {
                        nextMatch[bMatch.nextSlot] = winner;
                        break;
                      }
                    }
                  }

                  updated = true;
                  newProcessed.push(match.match_id);
                }
              }
            }
          }

          // Traverse Double Elim Bracket
          if (activeFormat === "Double Elimination" && newDoubleElim) {
            ['upper', 'lower', 'finals'].forEach(bracketPart => {
              if (newDoubleElim[bracketPart]) {
                for (let r = 0; r < newDoubleElim[bracketPart].length; r++) {
                  for (let m = 0; m < newDoubleElim[bracketPart][r].length; m++) {
                    const bMatch = newDoubleElim[bracketPart][r][m];
                    const isDirectMatch = bMatch.team1 === teamA && bMatch.team2 === teamB;
                    const isFlippedMatch = bMatch.team1 === teamB && bMatch.team2 === teamA;

                    if (isDirectMatch || isFlippedMatch) {
                      bMatch.score1 = isDirectMatch ? scoreA : scoreB;
                      bMatch.score2 = isDirectMatch ? scoreB : scoreA;

                      // Auto advance winner (upper/lower)
                      if (bMatch.nextMatchId && winner) {
                        for (let nr = r + 1; nr < newDoubleElim[bracketPart].length; nr++) {
                          const nextMatch = newDoubleElim[bracketPart][nr].find(nm => nm.id === bMatch.nextMatchId);
                          if (nextMatch) {
                            nextMatch[bMatch.nextSlot] = winner;
                            break;
                          }
                        }
                      }

                      updated = true;
                      if (!newProcessed.includes(match.match_id)) newProcessed.push(match.match_id);
                    }
                  }
                }
              }
            });
          }

          // Traverse Round Robin Bracket
          if (activeFormat === "Round Robin" && newRoundRobin) {
            for (let r = 0; r < newRoundRobin.length; r++) {
              for (let m = 0; m < newRoundRobin[r].length; m++) {
                const bMatch = newRoundRobin[r][m];
                const isDirectMatch = bMatch.team1 === teamA && bMatch.team2 === teamB;
                const isFlippedMatch = bMatch.team1 === teamB && bMatch.team2 === teamA;

                if (isDirectMatch || isFlippedMatch) {
                  bMatch.score1 = isDirectMatch ? scoreA : scoreB;
                  bMatch.score2 = isDirectMatch ? scoreB : scoreA;
                  updated = true;
                  if (!newProcessed.includes(match.match_id)) newProcessed.push(match.match_id);
                }
              }
            }
          }

        }

        if (updated) {
          setProcessedLiveMatches(newProcessed);
          if (activeFormat === "Single Elimination") {
            setSingleElimData(newSingleElim);
          } else if (activeFormat === "Double Elimination") {
            setDoubleElimData(newDoubleElim);
          } else if (activeFormat === "Round Robin") {
            setRoundRobinData(newRoundRobin);
          }
          // Auto save
          setTimeout(() => {
            saveBracketState();
          }, 500);
        }

      } catch (err) {
        console.error("Failed to poll live matches:", err);
      }
    };

    pollLiveMatches();
    intervalId = setInterval(pollLiveMatches, 5000);
    return () => clearInterval(intervalId);
  }, [isLiveConnected, singleElimData, doubleElimData, roundRobinData, activeFormat, processedLiveMatches, globalTournament, globalGame]);

  const saveBracketState = async () => {
    if (activeFormat === "Results") return;
    setIsSaving(true);
    try {
      const activeGame = (globalGame || 'VALORANT').toUpperCase();
      let bracketData = null;
      if (activeFormat === "Single Elimination") bracketData = singleElimData;
      if (activeFormat === "Double Elimination") bracketData = doubleElimData;
      if (activeFormat === "Round Robin") bracketData = roundRobinData;

      const response = await apiFetch(`/api/bracket-state`, {
        method: 'POST',
        body: JSON.stringify({
          tournament_name: globalTournament?.name || 'Default',
          game_title: activeGame,
          format: activeFormat,
          team_pool: teamPool,
          bracket_data: bracketData
        })
      });

      if (!response.ok) {
        let errData = {};
        try { errData = await response.json(); } catch (e) { }
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }
      setIsFormatLocked(true);
      alert('Bracket saved successfully!');
    } catch (err) {
      console.error(err);
      alert(`Error saving bracket: ${err.message}`);
    }
    setIsSaving(false);
  };

  // Auto-seed brackets helper
  const rebuildBrackets = (pool) => {
    setSingleElimData(generateSingleElimBracket(pool.length, pool));
    setDoubleElimData(generateDoubleElimBracket(pool.length, pool));
    setRoundRobinData(generateRoundRobin(pool));
  };
  const addTeam = async (e) => {
    e.preventDefault();
    if (newTeam.trim() !== "") {
      const teamsToAdd = newTeam.split(/[,\n]+/).map(t => t.trim()).filter(t => t !== "" && !teamPool.includes(t));
      if (teamsToAdd.length > 0) {
        const token = localStorage.getItem('token');
        for (const tName of teamsToAdd) {
          const formData = new FormData();
          formData.append('team_name', tName);
          formData.append('tournament_name', globalTournament?.name || 'Default');
          await apiFetch('/api/teams', {
            method: 'POST',
            body: formData
          });
        }
        const newPool = [...teamPool, ...teamsToAdd];
        setTeamPool(newPool);
        rebuildBrackets(newPool);
      }
      setNewTeam("");
    }
  };
  const removeTeam = (teamToRemove) => {
    const newPool = teamPool.filter(t => t !== teamToRemove);
    setTeamPool(newPool);
    rebuildBrackets(newPool);
  };
  const shuffleTeams = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...teamPool].sort(() => Math.random() - 0.5);
      setTeamPool(shuffled);
      rebuildBrackets(shuffled);
      setIsShuffling(false);
    }, 400);
  };

  // Single Elimination Logic
  const updateSingleMatch = (roundIndex, matchIndex, field, value) => {
    const newBracket = [...singleElimData];
    newBracket[roundIndex][matchIndex][field] = value;
    const currentMatch = newBracket[roundIndex][matchIndex];
    if (field === "score1" || field === "score2") {
      const s1 = parseInt(currentMatch.score1) || 0;
      const s2 = parseInt(currentMatch.score2) || 0;
      let winner = "";
      if (s1 > s2) winner = currentMatch.team1;
      else if (s2 > s1) winner = currentMatch.team2;
      if (winner && currentMatch.nextMatchId) {
        for (let r = roundIndex + 1; r < newBracket.length; r++) {
          const nextMatch = newBracket[r].find(m => m.id === currentMatch.nextMatchId);
          if (nextMatch) {
            nextMatch[currentMatch.nextSlot] = winner;
            break;
          }
        }
      }
    }
    setSingleElimData(newBracket);
  };

  // Double Elimination Logic
  const updateDoubleMatch = (section, roundIndex, matchIndex, field, value) => {
    const newData = JSON.parse(JSON.stringify(doubleElimData)); // deep copy
    newData[section][roundIndex][matchIndex][field] = value;
    const currentMatch = newData[section][roundIndex][matchIndex];
    if (field === "score1" || field === "score2") {
      const s1 = parseInt(currentMatch.score1) || 0;
      const s2 = parseInt(currentMatch.score2) || 0;
      let winner = "";
      let loser = "";
      if (s1 > s2) { winner = currentMatch.team1; loser = currentMatch.team2; }
      else if (s2 > s1) { winner = currentMatch.team2; loser = currentMatch.team1; }
      // Advance winner
      if (winner && currentMatch.nextMatchId) {
        const findAndSet = (targetId, targetSlot, val) => {
          ['upper', 'lower', 'finals'].forEach(sec => {
            newData[sec].forEach(rnd => {
              const m = rnd.find(x => x.id === targetId);
              if (m) m[targetSlot] = val;
            });
          });
        };
        findAndSet(currentMatch.nextMatchId, currentMatch.nextSlot, winner);
      }
      // Drop loser to lower bracket
      if (loser && currentMatch.loserMatchId) {
        ['lower'].forEach(sec => {
          newData[sec].forEach(rnd => {
            const m = rnd.find(x => x.id === currentMatch.loserMatchId);
            if (m) m[currentMatch.loserSlot] = loser;
          });
        });
      }
    }
    setDoubleElimData(newData);
  };

  // Round Robin Logic
  const updateRoundRobinMatch = (matchIndex, field, value) => {
    const newData = [...roundRobinData];
    newData[matchIndex][field] = value;
    if (field === "score1" || field === "score2") {
      newData[matchIndex].played = true;
    }
    setRoundRobinData(newData);
  };

  const calculateStandings = () => {
    const teams = {};
    roundRobinData.forEach(m => {
      [m.team1, m.team2].forEach(t => {
        if (t && t !== "TBD" && !teams[t]) {
          teams[t] = { name: t, played: 0, wins: 0, losses: 0, points: 0, diff: 0 };
        }
      });
      if (m.played) {
        const s1 = parseInt(m.score1) || 0;
        const s2 = parseInt(m.score2) || 0;
        if (m.team1 && m.team1 !== "TBD") {
          teams[m.team1].played += 1;
          teams[m.team1].diff += (s1 - s2);
          if (s1 > s2) { teams[m.team1].wins += 1; teams[m.team1].points += 3; }
          else if (s1 < s2) { teams[m.team1].losses += 1; }
          else { teams[m.team1].points += 1; }
        }
        if (m.team2 && m.team2 !== "TBD") {
          teams[m.team2].played += 1;
          teams[m.team2].diff += (s2 - s1);
          if (s2 > s1) { teams[m.team2].wins += 1; teams[m.team2].points += 3; }
          else if (s2 < s1) { teams[m.team2].losses += 1; }
          else { teams[m.team2].points += 1; }
        }
      }
    });
    return Object.values(teams).sort((a, b) => b.points - a.points || b.diff - a.diff);
  };

  /* ── Round labels ──────────────────────────────────────── */
  const getRoundLabel = (roundIndex, totalRounds) => {
    if (roundIndex === totalRounds - 1) return "Finals";
    if (roundIndex === totalRounds - 2) return "Semi-Finals";
    if (roundIndex === totalRounds - 3) return "Quarter-Finals";
    return `Round ${roundIndex + 1}`;
  };

  /* ── Bracket Renderers ─────────────────────────────────── */

  /* Bracket connector component — draws elbow lines between rounds */
  const BracketConnector = ({ fromCount, roundGap, cardHeight, roundSpacing, isLower }) => {
    // fromCount = number of matches in the current round that feed into next round
    // Each pair of matches merges into one next-round match
    const pairCount = Math.floor(fromCount / 2);
    const connectors = [];
    const color = isLower ? "rgba(248,113,113,0.3)" : "var(--color-cyan-500)";
    const dotColor = isLower ? "rgba(248,113,113,0.4)" : "var(--color-cyan-400)";

    for (let i = 0; i < pairCount; i++) {
      const topMatchIdx = i * 2;
      const botMatchIdx = i * 2 + 1;

      // Calculate Y positions based on card heights and spacing
      const topY = topMatchIdx * (cardHeight + roundSpacing) + cardHeight / 2;
      const botY = botMatchIdx * (cardHeight + roundSpacing) + cardHeight / 2;
      const midY = (topY + botY) / 2;

      const hLen = roundGap * 0.4;  // horizontal segment length
      const startX = 0;
      const endX = roundGap;

      connectors.push(
        <g key={i}>
          {/* Top match → horizontal right */}
          <line x1={startX} y1={topY} x2={startX + hLen} y2={topY} stroke={color} strokeWidth="2" />
          {/* Bottom match → horizontal right */}
          <line x1={startX} y1={botY} x2={startX + hLen} y2={botY} stroke={color} strokeWidth="2" />
          {/* Vertical line connecting top and bottom */}
          <line x1={startX + hLen} y1={topY} x2={startX + hLen} y2={botY} stroke={color} strokeWidth="2" />
          {/* Middle → horizontal right to next match */}
          <line x1={startX + hLen} y1={midY} x2={endX} y2={midY} stroke={color} strokeWidth="2" />
          {/* Glow dot at merge point */}
          <circle cx={startX + hLen} cy={midY} r="3" fill={dotColor} />
        </g>
      );
    }

    const totalHeight = fromCount * cardHeight + (fromCount - 1) * roundSpacing;

    return (
      <svg
        width={roundGap}
        height={totalHeight}
        style={{ flexShrink: 0, display: 'block' }}
        className="pointer-events-none"
      >
        {connectors}
      </svg>
    );
  };

  const StraightConnector = ({ count, roundGap, cardHeight, roundSpacing, isLower }) => {
    const connectors = [];
    const color = isLower ? "rgba(248,113,113,0.3)" : "var(--color-cyan-500)";
    const dotColor = isLower ? "rgba(248,113,113,0.4)" : "var(--color-cyan-400)";

    for (let i = 0; i < count; i++) {
      const y = i * (cardHeight + roundSpacing) + cardHeight / 2;
      connectors.push(
        <g key={i}>
          <line x1={0} y1={y} x2={roundGap} y2={y} stroke={color} strokeWidth="2" />
          <circle cx={roundGap - 4} cy={y} r="3" fill={dotColor} />
        </g>
      );
    }
    const totalHeight = count * cardHeight + (count > 0 ? (count - 1) * roundSpacing : 0);
    return (
      <svg width={roundGap} height={totalHeight || cardHeight} style={{ flexShrink: 0, display: 'block' }} className="pointer-events-none">
        {connectors}
      </svg>
    );
  };

  const getSpacing = (rIndex, cardH) => {
    let s = 14;
    for (let i = 1; i <= rIndex; i++) {
      s = 2 * s + cardH;
    }
    return s;
  };


  const submitResults = async () => {
    try {
      setIsSaving(true);
      const res = await apiFetch(`/api/bracket-results`, {
        method: 'POST',
        body: JSON.stringify({
          tournament_name: globalTournament?.name || 'Default',
          game_title: (globalGame || 'VALORANT').toUpperCase(),
          format: "Results",
          results: resultsData
        })
      });
      if (res.ok) alert("Results officially submitted!");
    } catch (e) {
      console.error(e);
      alert("Failed to submit results.");
    } finally {
      setIsSaving(false);
    }
  };


  const renderResults = () => {
    return (
      <div className="flex flex-col w-full max-w-3xl gap-4 mx-auto pb-12">
        <h2 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-widest text-center">Calculated Tournament Standings</h2>
        <div className="text-center text-slate-400 text-sm mb-2 -mt-4">Please review the auto-generated standings before submitting.</div>
        <div className="flex flex-col gap-2 bg-bg-200/50 p-6 rounded-2xl border border-theme-input">
          {resultsData.length === 0 && <div className="text-center text-slate-500 py-4">No results calculated.</div>}
          {[...resultsData].sort((a, b) => a.placement_rank - b.placement_rank).map((resItem, idx) => (
            <div key={resItem.team_name} className="flex items-center gap-4 bg-bg-300 p-4 rounded-xl border border-slate-700/50 transition-colors">

              <div className="flex flex-col gap-1 items-center justify-center shrink-0 w-12">
                <div className={`text-center font-black text-xl ${resItem.placement_rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : resItem.placement_rank === 2 ? 'text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.3)]' : resItem.placement_rank === 3 ? 'text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.3)]' : 'text-slate-500'}`}>
                  #{resItem.placement_rank}
                </div>
              </div>

              <div className="flex items-center gap-3 ml-2 flex-1">
                {resItem.logo_url ? (
                  <img src={resItem.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded-full bg-bg-500/50 p-1" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-bg-500/50 flex items-center justify-center shrink-0">
                    <Shield size={20} className="text-slate-500" />
                  </div>
                )}
                <span className={`font-bold text-theme-text-base uppercase tracking-wider ${resItem.placement_rank === 1 ? 'text-yellow-400' : ''}`}>{resItem.team_name}</span>
              </div>

            </div>
          ))}
        </div>

        <button
          onClick={submitResults}
          disabled={resultsData.length === 0 || isSaving}
          className="mt-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {isSaving ? "Submitting..." : "Submit Official Results"}
        </button>
      </div>
    );
  };

  const renderSingleElimination = () => {
    if (!Array.isArray(singleElimData)) return null;
    const totalRounds = singleElimData.length;
    const CARD_H = 76;    // approximate card height (2 rows × ~38px)
    const ROUND_GAP = 60; // gap between columns for connector SVG

    return (
      <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 16, paddingTop: 8, paddingLeft: 32, paddingRight: 32, width: '100%', minHeight: 500 }}>
        {singleElimData.map((round, rIndex) => {
          const spacing = getSpacing(rIndex, CARD_H);

          return (
            <React.Fragment key={rIndex}>
              {/* Connector SVG between previous round and this round */}
              {rIndex > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <BracketConnector
                    fromCount={singleElimData[rIndex - 1].length}
                    roundGap={ROUND_GAP}
                    cardHeight={CARD_H}
                    roundSpacing={getSpacing(rIndex - 1, CARD_H)}
                  />
                </div>
              )}

              {/* Round column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 290 }}>
                {/* Round label */}
                <div style={{ marginBottom: 16, textAlign: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em',
                    padding: '4px 12px', borderRadius: 20,
                    color: rIndex === totalRounds - 1 ? '#facc15' : '#64748b',
                    background: rIndex === totalRounds - 1 ? 'rgba(250,204,21,0.08)' : 'rgba(30,41,59,0.4)',
                    border: rIndex === totalRounds - 1 ? '1px solid rgba(250,204,21,0.2)' : '1px solid rgba(51,65,85,0.3)',
                  }}>
                    {getRoundLabel(rIndex, totalRounds)}
                  </span>
                </div>

                {/* Match cards */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: spacing }}>
                  {round.map((match, mIndex) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      matchNumber={match.id}
                      onChange={(field, value) => updateSingleMatch(rIndex, mIndex, field, value)}
                    />
                  ))}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderDoubleElimination = () => {
    if (!doubleElimData || !Array.isArray(doubleElimData.upper)) return null;
    const CARD_H = 76;
    const ROUND_GAP = 60;

    // Connects Upper Bracket to Finals. Needs dynamic Y offset if sizes differ.
    // We'll center it roughly.
    const upperFinalsConnectorY = CARD_H / 2;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: 700, paddingBottom: 24, paddingTop: 16, paddingLeft: 32, paddingRight: 32, gap: 40, overflowX: 'auto' }}>
        {/* Upper Bracket */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 4, height: 20, borderRadius: 4, background: 'linear-gradient(180deg, #22d3ee, #3b82f6)' }} />
            <h3 style={{ color: '#22d3ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 13, display: 'flex', alignItems: 'center', margin: 0 }}>
              <CrownIcon size={14} className="mr-2" /> Upper Bracket
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {doubleElimData.upper.map((round, rIndex) => {
              const spacing = getSpacing(rIndex, CARD_H);
              return (
                <React.Fragment key={rIndex}>
                  {rIndex > 0 && (
                    <div style={{ flexShrink: 0 }}>
                      <BracketConnector
                        fromCount={doubleElimData.upper[rIndex - 1].length}
                        roundGap={ROUND_GAP}
                        cardHeight={CARD_H}
                        roundSpacing={getSpacing(rIndex - 1, CARD_H)}
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flexShrink: 0, minWidth: 290, gap: spacing }}>
                    {round.map((match, mIndex) => (
                      <MatchCard key={match.id} match={match} matchNumber={match.id}
                        onChange={(field, value) => updateDoubleMatch('upper', rIndex, mIndex, field, value)} />
                    ))}
                  </div>
                </React.Fragment>
              )
            })}
            {/* Connector to Grand Finals */}
            <div style={{ flexShrink: 0 }}>
              <svg width={ROUND_GAP} height={CARD_H} className="pointer-events-none">
                <line x1={0} y1={upperFinalsConnectorY} x2={ROUND_GAP} y2={upperFinalsConnectorY}
                  stroke="var(--color-cyan-500)" strokeWidth="2" />
                <circle cx={ROUND_GAP - 4} cy={upperFinalsConnectorY} r="3" fill="var(--color-cyan-400)" />
              </svg>
            </div>
            {/* Grand Finals */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0, minWidth: 290 }}>
              {doubleElimData.finals[0].map((match, mIndex) => (
                <MatchCard key={match.id} match={match} matchNumber="GF"
                  onChange={(field, value) => updateDoubleMatch('finals', 0, mIndex, field, value)} />
              ))}
            </div>
          </div>
        </div>

        {/* Lower Bracket */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 4, height: 20, borderRadius: 4, background: 'rgba(248,113,113,0.8)' }} />
            <h3 style={{ color: 'rgba(248,113,113,0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 13, display: 'flex', alignItems: 'center', margin: 0 }}>
              <SwordsIcon size={14} className="mr-2" /> Lower Bracket
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: ROUND_GAP, flexShrink: 0 }} />
            {doubleElimData.lower.map((round, rIndex) => {
              const abstractUpperRIndex = Math.floor(rIndex / 2);
              const spacing = getSpacing(abstractUpperRIndex, CARD_H);
              const prevSpacing = rIndex > 0 ? getSpacing(Math.floor((rIndex - 1) / 2), CARD_H) : 14;
              const prevCount = rIndex > 0 ? doubleElimData.lower[rIndex - 1].length : 0;
              const isStraight = rIndex % 2 === 1;

              return (
                <React.Fragment key={rIndex}>
                  {rIndex > 0 && (
                    <div style={{ flexShrink: 0 }}>
                      {isStraight ? (
                        <StraightConnector
                          count={prevCount}
                          roundGap={ROUND_GAP}
                          cardHeight={CARD_H}
                          roundSpacing={prevSpacing}
                          isLower={true}
                        />
                      ) : (
                        <BracketConnector
                          fromCount={prevCount}
                          roundGap={ROUND_GAP}
                          cardHeight={CARD_H}
                          roundSpacing={prevSpacing}
                          isLower={true}
                        />
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flexShrink: 0, minWidth: 290, gap: spacing }}>
                    {round.map((match, mIndex) => (
                      <MatchCard key={match.id} match={match} matchNumber={match.id}
                        onChange={(field, value) => updateDoubleMatch('lower', rIndex, mIndex, field, value)} />
                    ))}
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderRoundRobin = () => {
    if (!Array.isArray(roundRobinData)) return null;
    const standings = calculateStandings();
    return (
      <div className="flex flex-col w-full relative z-10" style={{ gap: "32px", padding: "16px" }}>
        {/* Standings */}
        <div className="w-full bg-bg-100/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl font-sans select-none overflow-hidden" style={{ padding: "32px" }}>
          {/* Header Component */}
          <div className="flex items-center justify-between" style={{ marginBottom: "32px" }}>
            <div className="flex items-center gap-3">
              <h2 className="text-theme-text-base font-black text-lg tracking-wider uppercase">LEAGUE STANDINGS</h2>
            </div>
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted" />
              <input
                type="text"
                placeholder="Search team"
                className="bg-transparent border border-slate-700/50 rounded-lg text-sm text-theme-text-base placeholder:text-theme-text-muted focus:outline-none focus:border-cyan-500/50 w-48 transition-colors"
                style={{ padding: "8px 16px 8px 40px" }}
              />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800/80 text-theme-text-muted text-xs font-bold uppercase tracking-[0.1em]">
                  <th className="text-center" style={{ padding: "12px 16px", width: "48px" }}>#</th>
                  <th style={{ padding: "12px 16px" }}>Team</th>
                  <th className="text-center" style={{ padding: "12px 16px", width: "48px" }}>P</th>
                  <th className="text-center" style={{ padding: "12px 16px", width: "48px" }}>W</th>
                  <th className="text-center" style={{ padding: "12px 16px", width: "48px" }}>L</th>
                  <th className="text-center" style={{ padding: "12px 16px", width: "64px" }}>Diff</th>
                  <th className="text-center" style={{ padding: "12px 16px", width: "48px" }}>Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {standings.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-10 text-theme-text-muted text-sm">No matches played yet</td></tr>
                ) : standings.map((team, idx) => (
                  <tr
                    key={team.name}
                    className={`${idx === 0 ? 'bg-cyan-500/[0.06]' : 'hover:bg-slate-800/30'} transition-colors`}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-theme-text-base font-bold">{idx + 1}</span>
                        {/* Mock Trend Indicators based on photo */}
                        {idx === 0 || idx === 3 ? (
                          <span className="text-theme-text-muted text-xs">–</span>
                        ) : idx === 1 ? (
                          <span className="text-emerald-400 text-xs font-bold">↑</span>
                        ) : (
                          <span className="text-rose-400 text-xs font-bold">↓</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-900/40 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                          {team.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-theme-text-base font-bold">{team.name}</span>
                      </div>
                    </td>
                    <td className="text-center text-theme-text-muted" style={{ padding: "12px 16px" }}>{team.played}</td>
                    <td className="text-center text-emerald-400 font-bold" style={{ padding: "12px 16px" }}>{team.wins}</td>
                    <td className="text-center text-rose-400 font-bold" style={{ padding: "12px 16px" }}>{team.losses}</td>
                    <td className={`text-center font-medium ${team.diff > 0 ? 'text-emerald-400' : team.diff < 0 ? 'text-rose-400' : 'text-theme-text-muted'}`} style={{ padding: "12px 16px" }}>
                      {team.diff > 0 ? `+${team.diff}` : team.diff}
                    </td>
                    <td className="text-center text-cyan-400 font-black" style={{ padding: "12px 16px" }}>{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Match Schedule */}
        <div className="w-full flex flex-col" style={{ padding: "0 32px" }}>
          <div className="flex items-center space-x-3" style={{ marginBottom: "24px" }}>
            <SwordsIcon size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold uppercase text-theme-text-base tracking-[0.1em]">Match Schedule</h3>
          </div>
          <div className="flex flex-col gap-10 pb-20">
            {(() => {
              const roundRobinGrouped = {};
              const isLegacy = roundRobinData.every(m => !m.round);
              if (isLegacy) {
                const matchesPerRound = Math.max(1, Math.floor(teamPool.length / 2));
                roundRobinData.forEach((match, idx) => {
                  const r = Math.floor(idx / matchesPerRound) + 1;
                  if (!roundRobinGrouped[r]) roundRobinGrouped[r] = [];
                  roundRobinGrouped[r].push(match);
                });
              } else {
                roundRobinData.forEach(match => {
                  const r = match.round || 1;
                  if (!roundRobinGrouped[r]) roundRobinGrouped[r] = [];
                  roundRobinGrouped[r].push(match);
                });
              }

              return Object.entries(roundRobinGrouped)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([roundNum, matches]) => (
                  <div key={roundNum} className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="lg:w-32 shrink-0 pt-2 lg:text-left text-center">
                      <h4 className="text-[16px] font-black uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Round {roundNum}</h4>
                    </div>
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {matches.map(match => {
                        const mIndex = roundRobinData.findIndex(m => m.id === match.id);
                        return (
                          <div key={match.id} className="relative group flex justify-center shrink-0 w-full">
                            <MatchCard match={match} matchNumber={match.id} onChange={(field, value) => updateRoundRobinMatch(mIndex, field, value)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
            })()}
          </div>
        </div>
      </div>
    );
  };

  /* ── Tournament ID shorthand ───────────────────────────── */
  const tournamentId = globalTournament?.id
    ? `${String(globalTournament.id).slice(0, 5)}...${String(globalTournament.id).slice(-5)}`
    : "56467...2300C";

  const tournamentName = globalTournament && typeof globalTournament === 'string'
    ? globalTournament
    : globalTournament?.name || "Default";


  if (!isFormatLocked && hasLoaded && !isReadOnly) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-12 h-full z-50">
        <div className="max-w-4xl w-full flex flex-col items-center gap-12">
          <div className="text-center">
            <h2 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">Setup Tournament</h2>
            <p className="text-slate-400 font-medium">This tournament does not have a bracket yet. Choose a format to get started.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              { id: 'Single Elimination', icon: <Trophy size={32} />, desc: 'Classic knockout format.' },
              { id: 'Double Elimination', icon: <Shield size={32} />, desc: 'Includes a loser bracket for a second chance.' },
              { id: 'Round Robin', icon: <Users size={32} />, desc: 'Every team plays against every other team.' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => { setActiveFormat(f.id); setIsFormatLocked(true); }}
                className="group flex flex-col items-center justify-center p-8 bg-slate-900/60 border border-slate-700/50 hover:border-cyan-500 rounded-3xl transition-all duration-300 hover:bg-slate-800 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-2 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-900/20 text-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-black uppercase text-slate-200 tracking-wide mb-2 group-hover:text-cyan-400 transition-colors text-center">{f.id}</h3>
                <p className="text-xs text-slate-500 text-center font-medium leading-relaxed">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-bg-100 h-full overflow-hidden relative">

      {/* ══ LEFT SIDEBAR — Team Roster ═══════════════════════ */}
      {!isReadOnly && (
      <div className={`bg-bg-200/95 border-theme-input flex flex-col z-20 shadow-2xl relative flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isRosterOpen ? 'w-[400px] border-r opacity-100' : 'w-0 border-r-0 opacity-0 overflow-hidden'}`}>
        <div className="w-[400px] h-full flex flex-col shrink-0">
          {/* Header */}
          <div className="border-b border-theme-input flex items-center justify-between" style={{ padding: "32px 40px" }}>
            <div>
              <h2 className="text-[16px] font-black uppercase tracking-[0.12em] text-theme-text-base flex items-center">
                <UserIcon size={18} className="text-cyan-400 mr-3" />
                Team Roster
              </h2>
              <p className="text-[12px] text-theme-text-muted mt-1.5 uppercase tracking-wider">Bracket Auto-Seeding</p>
            </div>
            <div className="bg-slate-800/70 text-[12px] font-bold px-4 py-2 text-cyan-400 border border-slate-700/50" style={{ borderRadius: "8px" }}>
              {teamPool.length} Teams
            </div>
          </div>

          {/* Add Team Input */}
          <div className="border-b border-theme-input" style={{ padding: "24px 40px" }}>
            <form onSubmit={addTeam} className="relative mb-0">
              <input
                type="text"
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                placeholder="Add teams (comma separated)..."
                className="w-full bg-theme-input border border-theme-input px-5 py-4 text-[13px] text-theme-text-base placeholder-theme-text-muted focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200 pr-14"
                style={{ borderRadius: "16px" }}
              />
              <button type="submit" disabled={!newTeam.trim()} className="absolute right-2 top-2 bottom-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderRadius: "12px" }}>
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </form>
          </div>

          {/* Auto-Seed Manual Trigger */}
          <div className="border-b border-theme-input bg-cyan-900/10" style={{ padding: "16px 40px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {activeFormat === "Round Robin" && (
              <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-700/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encounters per Opponent</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setRoundRobinEncounters(Math.max(1, roundRobinEncounters - 1))} className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center font-bold transition-colors cursor-pointer">-</button>
                  <span className="text-sm font-black text-cyan-400 w-4 text-center">{roundRobinEncounters}</span>
                  <button onClick={() => setRoundRobinEncounters(roundRobinEncounters + 1)} className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center font-bold transition-colors cursor-pointer">+</button>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                const num = teamPool.length;
                if (num < 2) {
                  alert("Please add at least 2 teams to generate a bracket.");
                  return;
                }
                setSingleElimData(generateSingleElimBracket(num, teamPool));
                setDoubleElimData(generateDoubleElimBracket(num, teamPool));
                setRoundRobinData(generateRoundRobin(teamPool, roundRobinEncounters));
              }}
              className="w-full py-2.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-black text-[11px] uppercase tracking-widest transition-all duration-300"
              style={{ borderRadius: "10px", textShadow: "none" }}
            >
              Apply Roster to Bracket
            </button>
            <button
              onClick={() => {
                const activeTeams = allTeamsData.filter(t => t.tournament_name === (globalTournament?.name || "Default")).map(t => t.team_name);
                if (activeTeams.length === 0) {
                  alert("No teams found for the active tournament in the database.");
                  return;
                }
                setTeamPool(activeTeams);
              }}
              className="w-full py-2.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500 hover:text-slate-950 font-black text-[11px] uppercase tracking-widest transition-all duration-300"
              style={{ borderRadius: "10px", textShadow: "none" }}
            >
              Import Database Teams
            </button>
          </div>

          {/* Team list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: "24px 24px 24px 40px" }}>
            <div className="flex flex-col gap-3">
              {/* Active Teams */}
              {teamPool.map((team, idx) => {
                const dbTeam = allTeamsData.find(t => t.team_name === team);
                return (
                  <div
                    key={team}
                    className="group flex items-center justify-between bg-bg-300 hover:bg-bg-400 border border-theme-input hover:border-cyan-500/30 px-4 py-3.5 transition-all duration-200"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[13px] font-bold text-theme-text-muted w-5 text-right flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-theme-input border border-theme-input flex items-center justify-center text-cyan-400 flex-shrink-0 overflow-hidden">
                        {dbTeam && dbTeam.logo_url ? (
                          <img src={dbTeam.logo_url} alt={team} className="w-full h-full object-cover" />
                        ) : (
                          <Shield size={16} />
                        )}
                      </div>
                      <span className="text-[14px] font-bold text-theme-text-base tracking-wide truncate">
                        {team}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button onClick={() => removeTeam(team)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1.5">
                        <Trash2 size={16} />
                      </button>
                      <div className="text-slate-600 cursor-grab active:cursor-grabbing p-1.5">
                        <GripVertical size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clean Empty Slot Placeholders */}
              {teamPool.length < totalSlots && Array.from({ length: totalSlots - teamPool.length }).map((_, idx) => {
                const slotNumber = teamPool.length + idx + 1;
                return (
                  <div
                    key={`empty-${slotNumber}`}
                    className="flex items-center justify-between border border-dashed border-theme-input px-4 py-3.5 opacity-50"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] font-medium text-slate-600 w-5 text-right">
                        {slotNumber}
                      </span>
                      <span className="text-[14px] italic text-theme-text-muted font-medium tracking-wide">
                        Available Slot
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="border-t border-theme-input" style={{ padding: "24px 40px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {teamPool.length > 0 && (
              <>
                <button
                  onClick={shuffleTeams}
                  disabled={isShuffling}
                  className={`w-full py-3.5 border border-cyan-700/60 text-cyan-400 flex justify-center items-center text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-cyan-900/25 transition-all duration-300 ${isShuffling ? 'opacity-60 animate-pulse' : ''}`}
                  style={{ borderRadius: "12px" }}
                >
                  <ShuffleIcon size={14} className="mr-2" />
                  {isShuffling ? 'Seed Shuffle Processing...' : 'Shuffle Seed'}
                </button>
                <button
                  onClick={() => setTeamPool([])}
                  className="w-full py-3.5 border border-theme-input text-theme-text-muted text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-theme-input hover:text-theme-text-base transition-colors"
                  style={{ borderRadius: "12px" }}
                >
                  Clear All Teams
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      {/* ══ MAIN CONTENT AREA ════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-auto custom-scrollbar relative z-10">
        {/* Toggle Button for Roster */}
        {!isReadOnly && (
          <button
            onClick={() => setIsRosterOpen(!isRosterOpen)}
            className={`absolute left-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-bg-200/90 backdrop-blur-md border border-theme-input rounded-full text-theme-text-muted hover:text-cyan-400 hover:bg-theme-input hover:border-cyan-500/50 shadow-xl hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-700 group ${isIdle ? 'opacity-20' : 'opacity-100 hover:opacity-100'}`}
          >
            {isRosterOpen ? <PanelLeftClose size={24} className="group-hover:scale-110 transition-transform" /> : <PanelLeftOpen size={24} className="group-hover:scale-110 transition-transform" />}
          </button>
        )}
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/15 via-[#090e14] to-[#090e14] pointer-events-none" />

        {/* Top bar: Title + Live Stats */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6" style={{ padding: "48px 64px 48px 96px" }}>
          {/* Left: Title area */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center space-x-3 mb-1">
              <p className="text-[10px] text-cyan-500 uppercase tracking-[0.2em] font-bold flex items-center">
                <TrophyIcon size={12} className="mr-1.5" />
                Tournament Bracket Management
              </p>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 leading-tight truncate">
              {tournamentName && !tournamentName.match(/^[0-9a-f]{8}-/i) ? tournamentName : "Active Tournament Bracket"}
            </h1>
          </div>

          {/* Right: Live Statistics toggle panel */}
          {!isReadOnly && (
          <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-start lg:items-end justify-center gap-3">
            <div className="flex items-center gap-4">
              <div className="text-left lg:text-right">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-theme-text-muted block mb-0.5">Live Statistics</span>
                <span className={`text-[10px] font-bold flex items-center lg:justify-end ${isLiveConnected ? "text-green-400" : "text-theme-text-muted"}`}>
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isLiveConnected ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" : "bg-slate-600"}`} />
                  {isLiveConnected ? "Status: Active" : "Status: Inactive"}
                </span>
              </div>
              <button
                onClick={() => setIsLiveConnected(!isLiveConnected)}
                className={`relative inline-flex h-6 w-11 items-center transition-colors focus:outline-none shadow-inner shrink-0 cursor-pointer ${isLiveConnected ? "bg-green-500" : "bg-slate-700"}`}
                style={{ borderRadius: "24px" }}
              >
                <span className={`inline-block h-4 w-4 transform bg-white transition-transform shadow-md ${isLiveConnected ? "translate-x-6" : "translate-x-1"}`} style={{ borderRadius: "50%" }} />
              </button>
            </div>
            {/* Action buttons row */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest shrink-0 ${isLiveConnected ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-slate-800/50 text-theme-text-muted border border-slate-700/30'}`}>
                {isLiveConnected ? "LIVE" : "OFFLINE"}
              </span>
              <button className="flex items-center justify-center gap-2 px-4 py-1.5 bg-slate-800/40 border border-slate-700/30 rounded text-[10px] font-bold text-theme-text-base uppercase tracking-wider hover:bg-slate-700/40 hover:text-theme-text-base transition-colors cursor-pointer" style={{ borderRadius: "8px" }}>
                <ExternalLinkIcon size={12} />
                <span>View Data</span>
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Format Tabs */}
        <div className="sticky top-0 z-50 w-full shrink-0" style={{ padding: "0 64px 24px 96px", marginTop: "-24px", marginBottom: "24px" }}>
          <div className="flex items-center w-full bg-bg-200/90 backdrop-blur-md border border-slate-800/80 shadow-2xl" style={{ padding: "8px", gap: "12px", borderRadius: "16px" }}>
            {formats.map(format => (
              <button
                key={format}
                onClick={() => setActiveFormat(format)}
                className={`flex-1 text-sm font-bold transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer
                  ${activeFormat === format
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-theme-text-base shadow-[0_0_16px_rgba(6,182,212,0.4)]"
                    : "bg-transparent text-theme-text-muted hover:text-theme-text-base hover:bg-theme-input"
                  } ${isReadOnly && activeFormat !== format ? 'hidden' : ''}`}
                style={{ padding: "16px", borderRadius: "12px" }}
              >
                {format}
              </button>
            ))}

            {isFormatLocked && !isReadOnly && (
              <button
                onClick={() => {
                  if (window.confirm("Changing the format will reset your current bracket. Are you sure you want to proceed?")) {
                    setIsFormatLocked(false);
                  }
                }}
                className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 px-6 py-4 rounded-xl border border-red-900/30 shrink-0 ml-4 cursor-pointer"
              >
                Change Format
              </button>
            )}
          </div>
        </div>

        {/* Bracket Area */}
        <div className="relative z-10 bg-bg-300 rounded-2xl border border-theme-input shadow-2xl shrink-0" style={{ minHeight: "fit-content", margin: "0 64px 24px 96px", overflowX: "auto" }}>
          <div className="p-6 flex items-start justify-center min-w-max">
            {activeFormat === "Single Elimination" && renderSingleElimination()}
            {activeFormat === "Double Elimination" && renderDoubleElimination()}
            {activeFormat === "Round Robin" && renderRoundRobin()}
            {activeFormat === "Results" && renderResults()}
          </div>
        </div>

        {/* Save bar */}
        {activeFormat !== "Results" && !isReadOnly && (
          <div className="relative z-10 flex justify-center w-full shrink-0" style={{ paddingBottom: "48px", gap: "16px" }}>
            <button
              onClick={() => {
                const standings = generateStandingsFromBracket(activeFormat, singleElimData, doubleElimData, teamPool, allTeamsData);
                setResultsData(standings);
                setActiveFormat('Results');
              }}
              className="flex items-center justify-center bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold uppercase tracking-[0.12em] shadow-lg transition-all duration-300 cursor-pointer"
              style={{ padding: "16px 48px", borderRadius: "16px", gap: "12px" }}
            >
              <Trophy size={18} />
              <span style={{ fontSize: "14px" }}>Finalize Standings</span>
            </button>

            <button
              onClick={saveBracketState}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-theme-text-base font-bold uppercase tracking-[0.12em] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 disabled:opacity-50 cursor-pointer"
              style={{ padding: "16px 48px", borderRadius: "16px", gap: "12px" }}
            >
              <SaveIcon size={18} />
              <span style={{ fontSize: "14px" }}>{isSaving ? 'Saving...' : 'Save Bracket'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Bracket;
