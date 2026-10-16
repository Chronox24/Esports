import React, { useState, useRef, useEffect, useMemo } from "react";
import Bracket from "./Bracket.jsx";
import { apiFetch } from "../../utils/api";
import {
  Calendar,
  Clock,
  Swords,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Sparkles,
  Search,
  Layers,
  X,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";

function useStickyState(defaultValue, key) {
  const [value, setValue] = React.useState(() => {
    try {
      const stickyValue = window.sessionStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  });
  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Could not save sticky state (quota exceeded?):', key);
    }
  }, [key, value]);
  return [value, setValue];
}

const IconChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);
const IconChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);
const IconPlay = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);
const IconTrophy = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 21h8m-4-4v4M7 3H4a1 1 0 00-1 1v3a4 4 0 004 4h.5M17 3h3a1 1 0 011 1v3a4 4 0 01-4 4h-.5M7 3h10v5a5 5 0 01-10 0V3z"
    />
  </svg>
);
const IconCalendar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const IconBell = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);
const IconTrend = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);
const IconReplay = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);
const DATA = {
  VALORANT: {
    color: "#ff4655",
    colorClass: "from-[#ff4655]/20",
    borderClass: "border-[#ff4655]/40",
    textClass: "text-[#ff4655]",
    liveMatches: [
      {
        id: 1,
        title: "VCT Pacific — Grand Finals",
        team1: "LOUD",
        team2: "Fnatic",
        score: "2–1",
        viewers: "112K",
        isLive: true,
        type: "match",
      },
      {
        id: 2,
        title: "VCT Challengers",
        team1: "Sentinels",
        team2: "100 Thieves",
        score: "0–0",
        viewers: "95K",
        isLive: true,
        type: "match",
      },
      {
        id: 3,
        title: "VCT Americas — Semi Finals",
        team1: "NRG",
        team2: "Cloud9",
        score: "1–1",
        viewers: "85K",
        isLive: true,
        type: "match",
      },
      {
        id: 4,
        title: "VCT EMEA — Group Stage",
        team1: "NAVI",
        team2: "Team Liquid",
        score: "0–2",
        viewers: "70K",
        isLive: true,
        type: "match",
      },
      {
        id: 5,
        title: "VCT Pacific",
        team1: "Paper Rex",
        team2: "ZETA DIVISION",
        score: "",
        isLive: false,
        type: "match",
      },
      {
        id: 6,
        title: "VCT Americas",
        team1: "Leviatán",
        team2: "KRÜ Esports",
        score: "",
        isLive: false,
        type: "match",
      },
    ],
    rankings: [
      { rank: 1, name: "Fnatic", abbr: "FNC", color: "#f97316" },
      { rank: 2, name: "Team Liquid", abbr: "TL", color: "#3b82f6" },
      { rank: 3, name: "LOUD", abbr: "LDN", color: "#22c55e" },
      { rank: 4, name: "DRX", abbr: "DRX", color: "#60a5fa" },
      { rank: 5, name: "Imperial", abbr: "IMP", color: "#10b981" },
      { rank: 6, name: "Paper Rex", abbr: "PRX", color: "#e11d48" },
      { rank: 7, name: "Sentinels", abbr: "SEN", color: "#dc2626" },
      { rank: 8, name: "Cloud9", abbr: "C9", color: "#0ea5e9" },
      { rank: 9, name: "NRG", abbr: "NRG", color: "#000000" },
      { rank: 10, name: "NAVI", abbr: "NAV", color: "#eab308" },
      { rank: 11, name: "ZETA DIVISION", abbr: "ZET", color: "#737373" },
      { rank: 12, name: "100 Thieves", abbr: "100T", color: "#ef4444" },
    ],
    circuit: [
      {
        event: "VCT EMEA",
        match: "FNATIC vs. NAVI",
        time: "In 1h 30m",
        hot: true,
      },
      {
        event: "VCT Americas",
        match: "LOUD vs. Cloud9",
        time: "Starts tomorrow",
        hot: false,
      },
    ],
    qualifier: {
      title: "Valorant Open Qualifier: 5v5 Tactical",
      prize: "$5,000",
      deadline: "June 15th",
      slots: "24 / 64",
    },
    results: {
      table: [
        {
          rank: 1,
          team: "Team Liquid",
          abbr: "TL",
          color: "#3b82f6",
          prize: "$5,000",
          record: "15-22",
          pts: 25,
        },
        {
          rank: 2,
          team: "ONIC",
          abbr: "ON",
          color: "#a855f7",
          prize: "$2,500",
          record: "15-17",
          pts: 20,
        },
        {
          rank: 3,
          team: "Blacklist",
          abbr: "BL",
          color: "#f59e0b",
          prize: "$1,000",
          record: "10-10",
          pts: 20,
        },
        {
          rank: 4,
          team: "ONIEG",
          abbr: "OG",
          color: "#ef4444",
          prize: "—",
          record: "9-9",
          pts: 13,
        },
        {
          rank: 5,
          team: "Team Lavar",
          abbr: "LV",
          color: "#64748b",
          prize: "—",
          record: "6-8",
          pts: 13,
        },
        {
          rank: 6,
          team: "Lmipreot",
          abbr: "LP",
          color: "#06b6d4",
          prize: "—",
          record: "6-5",
          pts: 10,
        },
        {
          rank: 7,
          team: "Team Aqua",
          abbr: "AQ",
          color: "#0ea5e9",
          prize: "—",
          record: "3-3",
          pts: 9,
        },
      ],
      brackets: [
        {
          round: "Semi-Finals",
          bestOf: "Best of 3",
          team1: "Team Liquid",
          team2: "Fnatic",
          score1: 3,
          score2: 1,
          map: "Map 2: 7-9",
        },
        {
          round: "Semi-Finals",
          bestOf: "Best of 5",
          team1: "Fnatic",
          team2: "LOUD",
          score1: 3,
          score2: 0,
          map: "Map 2: 7-9",
        },
        {
          round: "Semi-Finals",
          bestOf: "Best of 5",
          team1: "Fnatic",
          team2: "NRG",
          score1: 3,
          score2: 0,
          map: "Map 2: 7-9",
        },
      ],
      timeline: [
        {
          league: "VCT",
          stage: "Final",
          team1: "Ascent",
          team2: "Fnatic",
          score: "3–1",
        },
        {
          league: "CFPL",
          stage: "Final",
          team1: "AG",
          team2: "Black Widow",
          score: "10–0",
        },
        {
          league: "VCT",
          stage: "Semi-Final",
          team1: "NRG",
          team2: "Cloud9",
          score: "2–1",
        },
        {
          league: "CFPL",
          stage: "Quarter-Final",
          team1: "Q9",
          team2: "BD",
          score: "3–2",
        },
      ],
    },
    schedule: [
      {
        id: 1,
        team: "Fnatic",
        abbr: "FNC",
        color: "#f97316",
        time: "13:00",
        timezone: "19:00 PST",
        reminded: false,
      },
      {
        id: 2,
        team: "Team Liquid",
        abbr: "TL",
        color: "#3b82f6",
        time: "23:00",
        timezone: "19:00 PST",
        reminded: false,
      },
      {
        id: 3,
        team: "AG",
        abbr: "AG",
        color: "#22c55e",
        time: "24:00",
        timezone: "19:00 PST",
        reminded: false,
      },
      {
        id: 4,
        team: "AG",
        abbr: "AG",
        color: "#22c55e",
        time: "28:00",
        timezone: "19:00 PST",
        reminded: true,
      },
    ],
  },
  CROSSFIRE: {
    color: "#4c7fd6",
    colorClass: "from-[#4c7fd6]/20",
    borderClass: "border-[#4c7fd6]/40",
    textClass: "text-[#4c7fd6]",
    liveMatches: [
      {
        id: 1,
        title: "CFS Grand Finals",
        team1: "All Gamers",
        team2: "Baisha",
        score: "3–0",
        viewers: "150K",
        isLive: true,
        type: "match",
      },
      {
        id: 2,
        title: "CFPL Summer",
        team1: "Q9",
        team2: "eStar",
        score: "1–2",
        viewers: "65K",
        isLive: true,
        type: "match",
      },
      {
        id: 3,
        title: "CFS Invitational",
        team1: "Black Dragons",
        team2: "Imperial",
        score: "1–1",
        viewers: "45K",
        isLive: true,
        type: "match",
      },
      {
        id: 4,
        title: "CFPL Autumn",
        team1: "WE",
        team2: "R.LGD",
        score: "",
        isLive: false,
        type: "match",
      },
      {
        id: 5,
        title: "CFS Qualifier",
        team1: "Vincit",
        team2: "Anubis",
        score: "",
        isLive: false,
        type: "match",
      },
    ],
    rankings: [
      { rank: 1, name: "All Gamers", abbr: "AG", color: "#ef4444" },
      { rank: 2, name: "Baisha Gaming", abbr: "BS", color: "#eab308" },
      { rank: 3, name: "Q9", abbr: "Q9", color: "#3b82f6" },
      { rank: 4, name: "Imperial", abbr: "IMP", color: "#10b981" },
      { rank: 5, name: "Black Dragons", abbr: "BD", color: "#6b7280" },
      { rank: 6, name: "eStar", abbr: "EST", color: "#f97316" },
      { rank: 7, name: "R.LGD", abbr: "LGD", color: "#dc2626" },
      { rank: 8, name: "Team WE", abbr: "WE", color: "#ef4444" },
      { rank: 9, name: "Vincit Gaming", abbr: "VIN", color: "#8b5cf6" },
      { rank: 10, name: "Anubis Gaming", abbr: "ANU", color: "#d946ef" },
      { rank: 11, name: "Extenzy", abbr: "EXT", color: "#14b8a6" },
      { rank: 12, name: "Lazarus", abbr: "LZR", color: "#06b6d4" },
    ],
    circuit: [
      {
        event: "CFPL",
        match: "AG vs. BaiSha",
        time: "Starts tomorrow",
        hot: true,
      },
      {
        event: "CFS Invitational",
        match: "Q9 vs. BD",
        time: "In 2 days",
        hot: false,
      },
    ],
    qualifier: {
      title: "Crossfire Open Qualifier: 5v5 Tactical",
      prize: "$10,000",
      deadline: "July 1st",
      slots: "18 / 64",
    },
    results: {
      table: [
        {
          rank: 1,
          team: "All Gamers",
          abbr: "AG",
          color: "#ef4444",
          prize: "$10,000",
          record: "18-5",
          pts: 36,
        },
        {
          rank: 2,
          team: "Baisha Gaming",
          abbr: "BS",
          color: "#eab308",
          prize: "$5,000",
          record: "15-8",
          pts: 30,
        },
        {
          rank: 3,
          team: "Q9",
          abbr: "Q9",
          color: "#3b82f6",
          prize: "$2,500",
          record: "12-11",
          pts: 24,
        },
        {
          rank: 4,
          team: "Imperial",
          abbr: "IMP",
          color: "#10b981",
          prize: "—",
          record: "10-13",
          pts: 20,
        },
        {
          rank: 5,
          team: "Black Dragons",
          abbr: "BD",
          color: "#6b7280",
          prize: "—",
          record: "7-16",
          pts: 14,
        },
      ],
      brackets: [
        {
          round: "Grand Finals",
          bestOf: "Best of 5",
          team1: "All Gamers",
          team2: "Baisha",
          score1: 3,
          score2: 2,
          map: "Map 5: 16-14",
        },
        {
          round: "Semi-Finals",
          bestOf: "Best of 3",
          team1: "Q9",
          team2: "Baisha",
          score1: 1,
          score2: 2,
          map: "Map 3: 12-16",
        },
      ],
      timeline: [
        {
          league: "CFPL",
          stage: "Grand Final",
          team1: "AG",
          team2: "Baisha",
          score: "3–2",
        },
        {
          league: "CFS",
          stage: "Semi-Final",
          team1: "Q9",
          team2: "BD",
          score: "2–0",
        },
      ],
    },
    schedule: [
      {
        id: 1,
        team: "All Gamers",
        abbr: "AG",
        color: "#ef4444",
        time: "14:00",
        timezone: "20:00 PST",
        reminded: false,
      },
      {
        id: 2,
        team: "Baisha Gaming",
        abbr: "BS",
        color: "#eab308",
        time: "17:00",
        timezone: "23:00 PST",
        reminded: false,
      },
      {
        id: 3,
        team: "Q9",
        abbr: "Q9",
        color: "#3b82f6",
        time: "20:00",
        timezone: "02:00 PST",
        reminded: true,
      },
    ],
  },
};
const ValorantLogo = ({ size = 20, color = "#ff4655" }) => (
  <svg
    viewBox="0 0 100 100"
    style={{ width: size, height: size, fill: color }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M99 0L35.2 61.2 53.6 100zM0 0l31.2 65.6L19 100 0 60z" />
  </svg>
);
const CrossfireLogo = ({ size = 20, color = "#4c7fd6" }) => (
  <svg
    viewBox="0 0 100 100"
    style={{ width: size, height: size }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke={color}
      strokeWidth="14"
      fill="none"
    />
    <circle cx="50" cy="50" r="10" fill={color} />
    <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeWidth="8" />
    <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth="8" />
  </svg>
);

const getMatchCountdown = (match) => {
  if (match.countdown) return match.countdown;
  if (!match.day || !match.time) return 'TBD';

  const now = new Date();

  // Parse time like "8:51 PM" or "20:51"
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;
  const matchTimeStr = String(match.time).trim();
  const timeMatch = matchTimeStr.match(timeRegex);

  if (!timeMatch) return `Starts at ${match.time}`;

  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3]?.toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const matchDate = new Date(now.getFullYear(), now.getMonth(), parseInt(match.day, 10));
  matchDate.setHours(hours, minutes, 0, 0);

  const diffMs = matchDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours > 0 && diffHours <= 24) {
    const h = Math.floor(diffHours);
    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (h > 0) return `Starts in ${h}h ${m}m`;
    return `Starts in ${m}m`;
  }

  return `Starts at ${match.time}`;
};

const MatchCard = ({ match, showCountdown, game, index = 0 }) => {
  const isLive = match.isLive;
  return (
    <div
      className="match-card snap-center animate-slide-in-right shrink-0 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-pointer"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Header Row */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          Day {match.day || 2}
        </span>
        {isLive ? (
          <div className="live-indicator">
            <span className="live-dot"></span> LIVE
          </div>
        ) : showCountdown ? (
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-slate-200 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-inner group-hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {match.countdown || getMatchCountdown(match)}
          </div>
        ) : null}
      </div>

      {/* Team 1 Row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          {match.team1Logo ? (
            <img src={match.team1Logo} alt={match.team1} className="team-logo" />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full font-bold text-white text-xs shadow-md">{match.team1?.[0]}</div>
          )}
          <span className="text-white font-semibold truncate max-w-[120px]">{match.team1}</span>
        </div>
        <span className="text-xl text-white font-bold">{match.score?.split("–")[0]}</span>
      </div>

      {/* VS Divider */}
      <div className="text-center text-[10px] text-slate-500 mb-3 font-semibold relative flex items-center justify-center">
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700/50 z-0"></div>
        <span className="bg-[#182029] px-2 relative z-10">VS</span>
      </div>

      {/* Team 2 Row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {match.team2Logo ? (
            <img src={match.team2Logo} alt={match.team2} className="team-logo" />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full font-bold text-white text-xs shadow-md">{match.team2?.[0]}</div>
          )}
          <span className="text-white font-semibold truncate max-w-[120px]">{match.team2}</span>
        </div>
        <span className="text-xl text-white font-bold">{match.score?.split("–")[1]}</span>
      </div>
    </div>
  );
};
const LiveUpcomingTab = ({ game, globalTournament, onOpenCreateModal }) => {
  const [tournaments, setTournaments] = React.useState([]);
  const [expandedTournament, setExpandedTournament] = React.useState(null);
  const [matchesByTournament, setMatchesByTournament] = React.useState({});
  const [showBracket, setShowBracket] = React.useState(false);
  
  React.useEffect(() => {
    apiFetch('/api/tournaments')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setTournaments(data.filter(t => (t.game || 'VALORANT').toUpperCase() === game.toUpperCase()));
        }
      })
      .catch(e => console.error(e));
  }, [game]);

  const toggleTournament = async (tName) => {
    if (expandedTournament === tName) {
      setExpandedTournament(null);
      return;
    }
    setExpandedTournament(tName);
    setShowBracket(false);
    if (!matchesByTournament[tName]) {
      try {
        const res = await apiFetch(`/api/matches?tournament=${tName}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(m => ({
            id: m.id,
            team1: m.team_a?.team_name || "TBD",
            team1Logo: m.team_a?.logo_url || null,
            team2: m.team_b?.team_name || "TBD",
            team2Logo: m.team_b?.logo_url || null,
            score1: m.score_a || 0,
            score2: m.score_b || 0,
            isLive: m.status === "in_progress",
            day: m.match_day,
            time: m.match_time
          }));
          mapped.sort((a, b) => {
             if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
             const dayA = a.day || 999;
             const dayB = b.day || 999;
             if (dayA !== dayB) return dayA - dayB;
             return 0;
          });
          setMatchesByTournament(prev => ({ ...prev, [tName]: mapped }));
        }
      } catch(e) { console.error(e); }
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#0d131c] rounded-3xl p-6 border border-slate-700/40 shadow-lg relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white relative z-10 flex items-center gap-3">
          <IconCalendar /> Live & Upcoming Tournaments
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {tournaments.length === 0 ? (
           <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest bg-[#0d131c] rounded-2xl border border-slate-800">No tournaments found. Create one to get started.</div>
        ) : (
           <div className="flex flex-col gap-8 w-full">
             {/* Row of vertical cards */}
             <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar snap-x snap-mandatory">
               {tournaments.map(t => {
                  const isExpanded = expandedTournament === t.name;
                  
                  return (
                  <div 
                    key={t.id} 
                    className={`flex-1 min-w-[130px] max-w-[320px] h-[220px] md:min-w-[150px] md:h-[250px] shrink-0 snap-center rounded-2xl flex flex-col overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 group border-[3px]
                      ${isExpanded ? 'border-cyan-500 bg-slate-800 shadow-[0_0_25px_rgba(6,182,212,0.3)]' : 'border-slate-700 bg-[#0d131c] hover:border-cyan-400 hover:bg-slate-800/80'}`}
                    onClick={() => toggleTournament(t.name)}
                  >
                     <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-5 text-center overflow-hidden">
                         <span className="text-xs md:text-sm font-semibold text-slate-400 drop-shadow-sm capitalize">{(t.game || game).toLowerCase()}</span>
                         <h3 className="text-base md:text-xl font-black text-white uppercase leading-tight drop-shadow-md line-clamp-4 mt-1">{t.name}</h3>
                     </div>
                     
                     <div className={`h-[45px] md:h-[55px] border-t-[3px] flex items-center justify-center transition-colors shrink-0
                        ${isExpanded ? 'border-cyan-500 bg-cyan-900/30' : 'border-slate-700 bg-[#0a0f16] group-hover:bg-slate-800'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 md:w-8 md:h-8 transition-transform duration-300 ${isExpanded ? 'text-cyan-400 rotate-180' : 'text-slate-400 group-hover:text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                     </div>
                  </div>
                  );
               })}
             </div>

             {/* Expanded Matches Container (Appears below the row) */}
             {expandedTournament && (
               <div className="p-6 md:p-8 border-[3px] border-slate-700 bg-[#0a0f16] rounded-3xl shadow-2xl animate-fade-in-up relative mt-2">
                  <div className="absolute -top-[14px] left-[50px] w-6 h-6 bg-[#0a0f16] border-t-[3px] border-l-[3px] border-slate-700 rotate-45 hidden md:block"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest">{expandedTournament} <span className="text-cyan-500">MATCHES</span></h3>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowBracket(!showBracket)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold uppercase tracking-widest transition-colors shadow-inner text-xs md:text-sm cursor-pointer
                           ${showBracket ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-cyan-500 hover:text-cyan-400'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                           {showBracket ? <><path d="M18 15l-6-6-6 6"/></> : <><path d="M6 9l6 6 6-6"/></>}
                        </svg>
                        {showBracket ? 'Hide Bracket' : 'View Bracket'}
                      </button>
                    </div>
                  </div>

                  {(!matchesByTournament[expandedTournament] || matchesByTournament[expandedTournament].length === 0) ? (
                     <div className="text-center py-16 text-slate-500 font-bold tracking-widest uppercase">
                       No upcoming matches for this tournament
                     </div>
                  ) : (
                     <div className="match-scroll-container snap-x snap-mandatory flex gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-6 custom-scrollbar">
                       {matchesByTournament[expandedTournament].map((match, idx) => (
                         <MatchCard key={match.id || idx} match={{...match, day: match.day || "TBD"}} showCountdown={false} game={game} index={idx} />
                       ))}
                     </div>
                  )}

                  {showBracket && (
                    <div className="w-full border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl mt-4 animate-fade-in-up">
                       <Bracket globalGame={game} globalTournament={{ name: expandedTournament }} isReadOnly={true} />
                    </div>
                  )}
               </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};
const ResultTab = ({ game, globalTournament }) => {
  const d = DATA[game];
  const medalColors = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  const [liveBrackets, setLiveBrackets] = useState([]);
  const [bracketResults, setBracketResults] = useState([]);
  useEffect(() => {
    apiFetch(
      `/api/brackets?tournament=${globalTournament?.name || "Default"}&game_title=${game}`,
    )
      .then((res) => res.json())
      .then((data) =>
        setLiveBrackets(
          data.map((b) => ({
            round: b.round,
            bestOf: b.best_of,
            team1: b.team_a?.team_name || "TBD",
            team2: b.team_b?.team_name || "TBD",
            score1: b.score_a,
            score2: b.score_b,
            map: b.map_info,
            team1Logo: b.team_a?.logo_url,
            team2Logo: b.team_b?.logo_url,
          })),
        ),
      )
      .catch(console.error);

    apiFetch(`/api/bracket-results?tournament_name=${globalTournament?.name || "Default"}&game_title=${game}&format=Results`)
      .then(res => res.json())
      .then(data => setBracketResults(data || []))
      .catch(console.error);
  }, [game, globalTournament?.name]);

  // Dynamically group matches by their league property
  const groupedTimeline = (d.results?.timeline || []).reduce((acc, match) => {
    const league = match.league || 'OTHER';
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(match);
    return acc;
  }, {});

  return (
    <div className="dashboard-wrapper" style={{ gridTemplateColumns: '1fr' }}>

      {/* Top Left: Leaderboard Panel */}
      <div className="glass-panel">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <span className="text-yellow-500"><IconTrophy /></span> FINAL RESULTS & KEY STATS
        </h2>

        <table className="stats-table">
          <thead>
            <tr>
              <th className="text-left w-16">RANK</th>
              <th className="text-left">TEAM</th>
              <th className="text-center">PRIZE</th>
              <th className="text-center">RECORD</th>
              <th className="text-center">PTS</th>
            </tr>
          </thead>
          <tbody>
            {(bracketResults.length > 0 ? bracketResults : d.results.table).map((row, i) => {
              const rank = row.placement_rank || row.rank;
              const teamName = row.team_name || row.team;
              const abbr = row.abbr || teamName.substring(0, 2).toUpperCase();
              const logo = row.logo_url;
              const prize = row.prize_money || row.prize || '—';
              const record = row.series_score || row.record || '—';
              const pts = row.total_points || row.pts || '—';
              const rankClass = rank <= 3 ? `rank-${rank}` : 'text-gray-400';

              return (
                <tr key={row.id || row.rank || i} className="rounded-lg">
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`rank-pill ${rankClass}`}>{rank}</span>
                      {rank === 1 && <span className="text-yellow-500 text-sm">🏆</span>}
                      {rank === 2 && <span className="text-gray-300 text-sm">🥈</span>}
                      {rank === 3 && <span className="text-orange-400 text-sm">🥉</span>}
                    </div>
                  </td>
                  <td className="text-white font-semibold flex items-center gap-3">
                    {logo ? (
                      <img src={logo} alt={teamName} className="w-8 h-8 rounded-full border border-slate-600 object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px] shadow-sm">
                        {abbr}
                      </div>
                    )}
                    {teamName}
                  </td>
                  <td className="text-center text-emerald-400 font-mono">
                    {prize}
                  </td>
                  <td className="text-center text-slate-300 font-mono">{record}</td>
                  <td className="text-center text-white font-bold">{pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Full Width: Timeline Section */}
      <div className="glass-panel w-full">
        <div className="flex justify-between items-center" style={{ marginBottom: "40px" }}>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-purple-400">🗓️</span> TOURNAMENT MATCH TIMELINE
          </h2>
        </div>

        {/* Dynamically render a separate row for each league */}
        <div className="flex flex-col gap-8">
          {Object.entries(groupedTimeline).map(([league, matches]) => (
            <div key={league} className="timeline-category">
              {/* League Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`league-indicator indicator-${league.toLowerCase()}`}></span>
                <h3 className="text-sm text-slate-300 font-bold uppercase tracking-widest">
                  {league} Timeline
                </h3>
              </div>

              {/* Independent Horizontal Scroll */}
              <div className="timeline-scroll-row">
                {matches.map((match, idx) => (
                  <div key={idx} className="timeline-card">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mb-2 block">
                      {match.stage}
                    </span>
                    <div className="flex items-center gap-4 text-white font-bold text-xl">
                      <div className="team-circle">{match.team1[0]}</div>
                      <span className="text-cyan-400">{match.score}</span>
                      <div className="team-circle">{match.team2[0]}</div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 mt-2 flex flex-col items-end">
                      <span>{match.team1} vs {match.team2}</span>
                      <span>Map: {match.map}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
const MiniCalendar = ({ highlightDays = [], selectedDay, onSelectDay }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  let startDay = new Date(year, month, 1).getDay();
  startDay = startDay === 0 ? 6 : startDay - 1; // Make Monday first day

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayObj = new Date();
  const today = month === todayObj.getMonth() && year === todayObj.getFullYear() ? todayObj.getDate() : null;

  return (
    <div className="calendar-card">
      <div className="calendar-header-wrapper">
        {/* Subtitle */}
        <div className="calendar-subtitle">
          <IconCalendar /> SCHEDULE
        </div>

        {/* Month Navigation */}
        <div className="calendar-month-nav">
          <button onClick={prevMonth} className="nav-arrow">
            <IconChevronLeft />
          </button>
          <h2 className="calendar-month-title">{monthName} {year}</h2>
          <button onClick={nextMonth} className="nav-arrow">
            <IconChevronRight />
          </button>
        </div>

        {/* Days of the Week */}
        <div className="calendar-days-row">
          {daysOfWeek.map((day, idx) => (
            <span key={idx}>{day}</span>
          ))}
        </div>
      </div>

      {/* Dates Grid */}
      <div className="calendar-grid">
        {cells.map((date, idx) => {
          if (!date) return <div key={idx} className="date-cell empty"></div>;

          const isSelected = date === selectedDay;
          const isToday = date === today;
          const isMatchDay = highlightDays.includes(date);

          return (
            <div
              key={idx}
              onClick={() => onSelectDay(date === selectedDay ? null : date)}
              className={`date-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
            >
              {date}
              {isMatchDay && <div className="match-dot"></div>}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-slate-700/50 my-4"></div>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        <div className="legend-item">
          <div className="legend-dot bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
          TODAY
        </div>
        <div className="legend-item">
          <div className="legend-dot bg-[#ff0055] shadow-[0_0_8px_#ff0055]"></div>
          MATCH DAY
        </div>
        <div className="legend-item">
          <div className="legend-dot bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
          SELECTED
        </div>
      </div>
    </div>
  );
};
const ManageBracketTab = ({ globalGame, globalTournament }) => {
  const activeGame = (globalGame || "VALORANT").toUpperCase();
  const safeFolder = globalTournament?.name
    ? globalTournament.name.replace(/[^a-zA-Z0-9]/g, "_")
    : "default";
  const key = `tourney_bracket_${safeFolder}_${activeGame}`;

  const [brackets, setBrackets] = useState([]);

  const [teamA, setTeamA] = useStickyState("", `${key}_teamA`);
  const [teamALogo, setTeamALogo] = useStickyState("", `${key}_teamALogo`);
  const [teamAFile, setTeamAFile] = useState(null);
  const [scoreA, setScoreA] = useStickyState(0, `${key}_scoreA`);

  const [teamB, setTeamB] = useStickyState("", `${key}_teamB`);
  const [teamBLogo, setTeamBLogo] = useStickyState("", `${key}_teamBLogo`);
  const [teamBFile, setTeamBFile] = useState(null);
  const [scoreB, setScoreB] = useStickyState(0, `${key}_scoreB`);

  const [round, setRound] = useStickyState("Semi-Finals", `${key}_round`);
  const [bestOf, setBestOf] = useStickyState("Best of 3", `${key}_bestOf`);
  const [mapInfo, setMapInfo] = useStickyState("Map 2: 7-9", `${key}_mapInfo`);

  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBrackets = async () => {
    try {
      const res = await apiFetch(
        `/api/brackets?tournament=${globalTournament?.name || "Default"}&game_title=${activeGame}`,
      );
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((b) => ({
          id: b.id,
          teamA: b.team_a?.team_name || "TBD",
          teamALogo: b.team_a?.logo_url || null,
          teamB: b.team_b?.team_name || "TBD",
          teamBLogo: b.team_b?.logo_url || null,
          scoreA: b.score_a,
          scoreB: b.score_b,
          round: b.round,
          bestOf: b.best_of,
          mapInfo: b.map_info,
        }));
        setBrackets(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBrackets();
  }, [globalTournament?.name, activeGame]);

  const getOrCreateTeam = async (teamName, teamLogoUrl, teamFile) => {
    const res = await apiFetch(
      `/api/teams?tournament=${globalTournament?.name || "Default"}`,
    );
    const teams = await res.json();
    const existing = teams.find(
      (t) => t.team_name.toLowerCase() === teamName.toLowerCase(),
    );
    if (existing) return existing.team_id;

    const formData = new FormData();
    formData.append("team_name", teamName);
    formData.append("tournament_name", globalTournament?.name || "Default");

    if (teamFile) {
      formData.append("logo", teamFile);
    } else if (teamLogoUrl && teamLogoUrl.startsWith("data:")) {
      const res = await fetch(teamLogoUrl);
      const blob = await res.blob();
      formData.append("logo", blob, "logo.png");
    }

    const createRes = await apiFetch("/api/teams", {
      method: "POST",
      body: formData,
    });
    if (createRes.ok) {
      const newTeam = await createRes.json();
      return newTeam.team_id;
    }
    return null;
  };

  const addBracket = async () => {
    if (!teamA || !teamB || !round || !bestOf || !mapInfo) {
      setShowErrors(true);
      return;
    }

    setIsSubmitting(true);

    const teamAId = await getOrCreateTeam(teamA, teamALogo, teamAFile);
    const teamBId = await getOrCreateTeam(teamB, teamBLogo, teamBFile);

    if (teamAId && teamBId) {
      await apiFetch("/api/brackets", {
        method: "POST",
        body: JSON.stringify({
          tournament_name: globalTournament?.name || "Default",
          game_title: activeGame,
          round,
          best_of: bestOf,
          team_a_id: teamAId,
          team_b_id: teamBId,
          score_a: parseInt(scoreA, 10),
          score_b: parseInt(scoreB, 10),
          map_info: mapInfo,
        }),
      });
      await fetchBrackets();

      setTeamA("");
      setTeamALogo("");
      setTeamAFile(null);
      setScoreA(0);
      setTeamB("");
      setTeamBLogo("");
      setTeamBFile(null);
      setScoreB(0);
      setShowErrors(false);
    }
    setIsSubmitting(false);
  };

  const removeBracket = async (id) => {
    await apiFetch(`/api/brackets/${id}`, {
      method: "DELETE",
    });
    setBrackets(brackets.filter((b) => b.id !== id));
  };

  const inputClass = (val) =>
    `w-full bg-slate-900/50 rounded-xl px-4 py-3 text-white transition-all ${showErrors && !val && val !== 0 ? "border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "border border-slate-800 focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] outline-none"}`;

  return (
    <div className="flex justify-center w-full mb-10">
      <div className="flex flex-col w-full px-4 lg:px-8">
        <div
          className="bg-[#0b1017] light:bg-white rounded-3xl border border-slate-800/60 light:border-slate-200 shadow-2xl w-full"
          style={{ padding: '32px', boxSizing: 'border-box', marginBottom: '24px', marginTop: '24px' }}
        >
          <h2 className="text-2xl font-black uppercase text-white light:text-slate-900 text-center tracking-widest m-0" style={{ marginBottom: '32px' }}>
            Manage Brackets
          </h2>

          <div className="flex flex-col gap-8 mb-10 w-full">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500  text-left" style={{ marginBottom: "12px", paddingLeft: "16px" }}>
                  ROUND
                </label>
                <input
                  type="text"
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  className={inputClass(round)}
                  placeholder="e.g. Semi-Finals"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500  text-left" style={{ marginBottom: "12px", paddingLeft: "16px" }}>
                  BEST OF
                </label>
                <input
                  type="text"
                  value={bestOf}
                  onChange={(e) => setBestOf(e.target.value)}
                  className={inputClass(bestOf)}
                  placeholder="e.g. Best of 3"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500  text-left" style={{ marginBottom: "12px", paddingLeft: "16px" }}>
                  MAP INFO
                </label>
                <input
                  type="text"
                  value={mapInfo}
                  onChange={(e) => setMapInfo(e.target.value)}
                  className={inputClass(mapInfo)}
                  placeholder="e.g. Map 2: 7-9"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 border border-slate-800/80 rounded-2xl relative mt-4" style={{ padding: '24px' }}>
              <div className="absolute -top-3 left-6 bg-[#0d131c] px-3 font-bold text-cyan-500 text-sm uppercase tracking-widest">Team A</div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-[2]">
                  <label className="block text-xs font-bold text-slate-500  text-left" style={{ marginBottom: "12px", paddingLeft: "16px" }}>
                    NAME
                  </label>
                  <input
                    type="text"
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                    className={inputClass(teamA)}
                    placeholder="e.g. All Gamers"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex-[3]">
                  <label className="block text-xs font-bold text-slate-500  text-left" style={{ marginBottom: "12px", paddingLeft: "16px" }}>
                    LOGO
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isSubmitting}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setTeamAFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setTeamALogo(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-slate-900 hover:file:bg-cyan-400 cursor-pointer"
                    />
                    {teamALogo && (
                      <img
                        src={teamALogo}
                        alt="Preview"
                        className="w-10 h-10 object-contain rounded bg-slate-800 shrink-0"
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500  text-left" style={{ marginBottom: "12px", paddingLeft: "16px" }}>
                    SCORE
                  </label>
                  <input
                    type="number"
                    value={scoreA}
                    onChange={(e) => setScoreA(e.target.value)}
                    className={inputClass(scoreA)}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 border border-slate-800/80 rounded-2xl relative mt-4" style={{ padding: '24px' }}>
              <div className="absolute -top-3 left-6 bg-[#0d131c] px-3 font-bold text-cyan-500 text-sm uppercase tracking-widest">Team B</div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-[2]">
                  <label className="block text-xs font-bold text-slate-500  text-left" style={{ marginBottom: "12px", paddingLeft: "16px" }}>
                    NAME
                  </label>
                  <input
                    type="text"
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                    className={inputClass(teamB)}
                    placeholder="e.g. Baisha Gaming"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex-[3]">
                  <label className="block text-xs font-bold text-slate-500  text-left" style={{ marginBottom: "12px", paddingLeft: "16px" }}>
                    LOGO
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isSubmitting}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setTeamBFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setTeamBLogo(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-slate-900 hover:file:bg-cyan-400 cursor-pointer"
                    />
                    {teamBLogo && (
                      <img
                        src={teamBLogo}
                        alt="Preview"
                        className="w-10 h-10 object-contain rounded bg-slate-800 shrink-0"
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500  text-left" style={{ marginBottom: "12px", paddingLeft: "16px" }}>
                    SCORE
                  </label>
                  <input
                    type="number"
                    value={scoreB}
                    onChange={(e) => setScoreB(e.target.value)}
                    className={inputClass(scoreB)}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
          {showErrors && (
            <div className="text-red-500 text-xs font-bold mb-6 text-center uppercase animate-pulse">
              Please fill in all required fields.
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button
              onClick={addBracket}
              disabled={isSubmitting}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 uppercase rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] disabled:opacity-50"
              style={{ padding: '12px 32px', fontWeight: 'bold', letterSpacing: '0.5px', fontSize: '12px' }}
            >
              {isSubmitting ? "Saving..." : "Add Bracket"}
            </button>
          </div>
        </div>

        <div
          className="bg-[#0d131c] light:bg-white rounded-3xl border border-slate-800/50 light:border-slate-200 shadow-2xl mt-6"
          style={{ padding: '32px', boxSizing: 'border-box' }}
        >
          <h3 className="text-sm font-black uppercase text-slate-400 mb-4 mt-0">
            Current Brackets
          </h3>
          <div className="flex flex-col gap-2">
            {brackets.length === 0 && (
              <div className="text-slate-500 text-sm">No bracket data found.</div>
            )}
            {brackets.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between bg-slate-900/30 p-3 rounded border border-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  {b.teamALogo ? (
                    <img
                      src={b.teamALogo}
                      alt="Team A"
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                      ?
                    </div>
                  )}
                  <div className="text-white font-bold text-sm">
                    {b.teamA} {b.scoreA} - {b.scoreB} {b.teamB}
                  </div>
                  {b.teamBLogo ? (
                    <img
                      src={b.teamBLogo}
                      alt="Team B"
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                      ?
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-slate-400 text-xs">
                    {b.round} | {b.mapInfo}
                  </div>
                  <button
                    onClick={() => removeBracket(b.id)}
                    className="text-red-500 hover:text-red-400 text-[10px] font-bold uppercase"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageScheduleTab = ({ readOnly, globalGame, globalTournament, embedded, onOpenCreateModal }) => {
  const activeGame = (globalGame || "VALORANT").toUpperCase();
  const safeFolder = globalTournament?.name
    ? globalTournament.name.replace(/[^a-zA-Z0-9]/g, "_")
    : "default";
  const key = `tourney_schedule_${safeFolder}_${activeGame}`;

  const [schedule, setSchedule] = useState([]);
  const [searchSchedule, setSearchSchedule] = useState("");
  const [successToast, setSuccessToast] = useState(null);

  const [teamA, setTeamA] = useStickyState("", `${key}_teamA`);
  const [teamALogo, setTeamALogo] = useStickyState("", `${key}_teamALogo`);
  const [teamAFile, setTeamAFile] = useState(null);
  const teamAInputRef = useRef(null);

  const [teamB, setTeamB] = useStickyState("", `${key}_teamB`);
  const [teamBLogo, setTeamBLogo] = useStickyState("", `${key}_teamBLogo`);
  const [teamBFile, setTeamBFile] = useState(null);
  const teamBInputRef = useRef(null);

  const [day, setDay] = useStickyState(new Date().toISOString().split("T")[0], `${key}_day`);
  const [time, setTime] = useStickyState("14:00", `${key}_time_v2`);

  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const formatScheduleTime = (timeStr) => {
    if (!timeStr) return "TBD";
    const clean = String(timeStr).trim();
    // Normalize format like "17:00 AM" or "14:00"
    const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      let hours = parseInt(match24[1], 10);
      const minutes = match24[2];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    const matchBad = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (matchBad) {
      let hours = parseInt(matchBad[1], 10);
      const minutes = matchBad[2];
      if (hours > 12) {
        return `${hours - 12}:${minutes} PM`;
      } else if (hours === 12) {
        return `12:${minutes} PM`;
      } else if (hours === 0) {
        return `12:${minutes} AM`;
      }
      return `${hours}:${minutes} ${matchBad[3] ? matchBad[3].toUpperCase() : (hours >= 12 ? 'PM' : 'AM')}`;
    }
    return clean;
  };

  const formatScheduleDay = (dayVal) => {
    if (!dayVal) return "Day 1";
    const str = String(dayVal);
    if (str.includes("-")) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
    return `Day ${str}`;
  };

  const getTeamInitials = (name) => {
    if (!name || name === "TBD") return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 3).toUpperCase();
  };

  const fetchMatches = async () => {
    try {
      const res = await apiFetch(
        `/api/matches?tournament=${encodeURIComponent(globalTournament?.name || "Default")}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((m) => ({
            id: m.match_id,
            teamA: m.team_a?.team_name || "TBD",
            teamALogo: m.team_a?.logo_url || null,
            teamB: m.team_b?.team_name || "TBD",
            teamBLogo: m.team_b?.logo_url || null,
            day: m.match_day || (day ? parseInt(day.split("-")[2], 10) : 1),
            time: m.match_time || "00:00",
            timezone: m.match_timezone || "PST",
            reminded: false,
          }));
          setSchedule(formatted);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [globalTournament?.name]);

  const getOrCreateTeam = async (teamName, teamLogoUrl, teamFile) => {
    try {
      const res = await apiFetch(
        `/api/teams?tournament=${encodeURIComponent(globalTournament?.name || "Default")}`,
      );
      if (res.ok) {
        const teams = await res.json();
        if (Array.isArray(teams)) {
          const existing = teams.find(
            (t) => t.team_name.toLowerCase() === teamName.toLowerCase(),
          );
          if (existing) return existing.team_id;
        }
      }
    } catch (e) {
      console.warn("Could not fetch teams list:", e);
    }

    const formData = new FormData();
    formData.append("team_name", teamName);
    formData.append("tournament_name", globalTournament?.name || "Default");

    if (teamFile) {
      formData.append("logo", teamFile);
    } else if (teamLogoUrl && teamLogoUrl.startsWith("data:")) {
      try {
        const res = await fetch(teamLogoUrl);
        const blob = await res.blob();
        formData.append("logo", blob, "logo.png");
      } catch (e) {}
    }

    try {
      const createRes = await apiFetch("/api/teams", {
        method: "POST",
        body: formData,
      });
      if (createRes.ok) {
        const newTeam = await createRes.json();
        return newTeam.team_id;
      }
    } catch (e) {
      console.error("Failed to create team:", e);
    }
    return null;
  };

  const addMatch = async () => {
    if (!teamA.trim() || !teamB.trim() || !day || !time) {
      setShowErrors(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const teamAId = await getOrCreateTeam(teamA.trim(), teamALogo, teamAFile);
      const teamBId = await getOrCreateTeam(teamB.trim(), teamBLogo, teamBFile);

      if (teamAId && teamBId) {
        const parsedDay = day.includes("-")
          ? parseInt(day.split("-")[2], 10)
          : parseInt(day, 10);

        const matchRes = await apiFetch("/api/matches", {
          method: "POST",
          body: JSON.stringify({
            tournament_name: globalTournament?.name || "Default",
            team_a_id: teamAId,
            team_b_id: teamBId,
            game_title: activeGame,
            status: "scheduled",
            match_day: parsedDay.toString(),
            match_time: time,
            match_timezone: "Local",
          }),
        });

        if (!matchRes.ok) {
          const errText = await matchRes.text();
          console.error("Failed to create match:", errText);
        }
        await fetchMatches();

        setTeamA("");
        setTeamALogo("");
        setTeamAFile(null);
        setTeamB("");
        setTeamBLogo("");
        setTeamBFile(null);
        setShowErrors(false);
        showToast("Match successfully added to tournament schedule!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMatch = async (id) => {
    try {
      await apiFetch(`/api/matches/${id}`, {
        method: "DELETE",
      });
      setSchedule(prev => prev.filter((m) => m.id !== id));
      showToast("Match removed from schedule.");
    } catch (e) {
      console.error("Failed to delete match:", e);
    }
  };

  // Filtered schedule list
  const filteredSchedule = useMemo(() => {
    if (!searchSchedule.trim()) return schedule;
    const q = searchSchedule.toLowerCase();
    return schedule.filter(m =>
      (m.teamA && m.teamA.toLowerCase().includes(q)) ||
      (m.teamB && m.teamB.toLowerCase().includes(q))
    );
  }, [schedule, searchSchedule]);

  const setDateOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDay(d.toISOString().split("T")[0]);
  };

  return (
    <div className="flex justify-center w-full mb-10 relative">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-8 z-50 animate-bounce flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-[0_10px_35px_rgba(6,182,212,0.3)] backdrop-blur-md text-sm font-bold text-cyan-300">
          <CheckCircle2 size={18} className="text-cyan-400" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-[1400px] px-2 sm:px-4 lg:px-8 mt-4">
        
        {/* LEFT COLUMN: SETUP & SCHEDULE FORM */}
        <div className="flex-1 flex flex-col gap-6">

          {/* ── Top Tournament Setup Banner ── */}
          {!readOnly && !embedded && onOpenCreateModal && (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 sm:p-7 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
              {/* Top ambient highlight line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] shrink-0">
                  <Trophy size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                      Tournament Hub
                    </span>
                    <span className="text-xs font-bold text-slate-500">•</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {globalTournament?.name || "Default Tournament"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-['Outfit'] tracking-wider">
                    Tournament Setup
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure tournament fixtures, register team rosters, and manage match schedules.
                  </p>
                </div>
              </div>

              <button 
                onClick={onOpenCreateModal}
                className="group relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus size={16} strokeWidth={3} className="transition-transform group-hover:rotate-90" />
                <span>+ Create Tournament</span>
              </button>
            </div>
          )}

          {/* ── Manage Schedule Form ── */}
          {!readOnly && (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-8 backdrop-blur-xl flex flex-col gap-7">
              {/* Top ambient highlight line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/30 via-slate-700 to-rose-500/30" />

              {/* Form Title & Subtitle */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 shadow-inner">
                    <Swords size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase text-white font-['Outfit'] tracking-wider">
                      Schedule Match Showdown
                    </h2>
                    <p className="text-xs text-slate-400">
                      Enter competing team details, customize team emblems, and set the battle time.
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-800/60 text-slate-300 border border-slate-700/60">
                  <Sparkles size={12} className="text-cyan-400" />
                  Auto-Syncs With Predictions
                </span>
              </div>

              {/* ── Versus Teams Arena (Team A vs Team B) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                
                {/* TEAM A CARD */}
                <div className="relative rounded-2xl bg-slate-950/50 border border-slate-800/90 hover:border-cyan-500/40 p-5 flex flex-col gap-4 transition-all shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                      <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                        Team A (Home / Blue)
                      </span>
                    </div>
                    {teamALogo && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Emblem Loaded
                      </span>
                    )}
                  </div>

                  {/* Team A Name Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={teamA}
                      onChange={(e) => setTeamA(e.target.value)}
                      placeholder="e.g. Sentinels, All Gamers..."
                      disabled={isSubmitting}
                      className={`w-full bg-[#060a12] border rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all ${
                        showErrors && !teamA.trim()
                          ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "border-slate-800 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                      }`}
                    />
                  </div>

                  {/* Team A Custom Logo Uploader */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Team Logo (Optional)
                    </label>
                    <input
                      type="file"
                      ref={teamAInputRef}
                      accept="image/*"
                      disabled={isSubmitting}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setTeamAFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setTeamALogo(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    {teamALogo ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/80">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={teamALogo}
                            alt="Team A"
                            className="w-10 h-10 object-contain rounded-lg bg-slate-950 p-1 border border-slate-700 shrink-0"
                          />
                          <div className="truncate text-xs font-bold text-slate-200">
                            {teamAFile ? teamAFile.name : "Custom Logo"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => teamAInputRef.current?.click()}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTeamALogo("");
                              setTeamAFile(null);
                            }}
                            className="p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => teamAInputRef.current?.click()}
                        className="cursor-pointer border border-dashed border-slate-800 hover:border-cyan-400/60 bg-slate-900/40 hover:bg-cyan-500/5 rounded-xl p-3 flex items-center justify-center gap-2.5 transition-all text-slate-400 hover:text-cyan-300 text-xs font-bold"
                      >
                        <Upload size={15} className="text-cyan-400" />
                        <span>Upload Team A Emblem</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TEAM B CARD */}
                <div className="relative rounded-2xl bg-slate-950/50 border border-slate-800/90 hover:border-rose-500/40 p-5 flex flex-col gap-4 transition-all shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                      <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                        Team B (Away / Red)
                      </span>
                    </div>
                    {teamBLogo && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Emblem Loaded
                      </span>
                    )}
                  </div>

                  {/* Team B Name Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={teamB}
                      onChange={(e) => setTeamB(e.target.value)}
                      placeholder="e.g. Fnatic, BaiSha Gaming..."
                      disabled={isSubmitting}
                      className={`w-full bg-[#060a12] border rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all ${
                        showErrors && !teamB.trim()
                          ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "border-slate-800 focus:border-rose-400 focus:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                      }`}
                    />
                  </div>

                  {/* Team B Custom Logo Uploader */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Team Logo (Optional)
                    </label>
                    <input
                      type="file"
                      ref={teamBInputRef}
                      accept="image/*"
                      disabled={isSubmitting}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setTeamBFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setTeamBLogo(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    {teamBLogo ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-700/80">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={teamBLogo}
                            alt="Team B"
                            className="w-10 h-10 object-contain rounded-lg bg-slate-950 p-1 border border-slate-700 shrink-0"
                          />
                          <div className="truncate text-xs font-bold text-slate-200">
                            {teamBFile ? teamBFile.name : "Custom Logo"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => teamBInputRef.current?.click()}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTeamBLogo("");
                              setTeamBFile(null);
                            }}
                            className="p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => teamBInputRef.current?.click()}
                        className="cursor-pointer border border-dashed border-slate-800 hover:border-rose-400/60 bg-slate-900/40 hover:bg-rose-500/5 rounded-xl p-3 flex items-center justify-center gap-2.5 transition-all text-slate-400 hover:text-rose-300 text-xs font-bold"
                      >
                        <Upload size={15} className="text-rose-400" />
                        <span>Upload Team B Emblem</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* ── Date & Time Scheduling Section ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-800/60">
                {/* Date Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={13} className="text-cyan-400" />
                      <span>Match Date *</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDateOffset(0)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateOffset(1)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateOffset(2)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        +2 Days
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full bg-[#060a12] border rounded-xl px-4 py-3 text-white text-sm [color-scheme:dark] focus:outline-none transition-all ${
                      showErrors && !day
                        ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        : "border-slate-800 focus:border-cyan-400"
                    }`}
                  />
                </div>

                {/* Time Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={13} className="text-cyan-400" />
                      <span>Kickoff Time *</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {["14:00", "17:00", "20:00"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTime(preset)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                          {preset === "14:00" ? "2 PM" : preset === "17:00" ? "5 PM" : "8 PM"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full bg-[#060a12] border rounded-xl px-4 py-3 text-white text-sm [color-scheme:dark] cursor-pointer focus:outline-none transition-all ${
                      showErrors && !time
                        ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        : "border-slate-800 focus:border-cyan-400"
                    }`}
                  />
                </div>
              </div>

              {/* Validation Error Feedback */}
              {showErrors && (!teamA.trim() || !teamB.trim() || !day || !time) && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                  <AlertCircle size={15} />
                  <span>Please fill in both Team Names, Match Date, and Kickoff Time.</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={addMatch}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin text-slate-950" />
                      <span>Scheduling Match...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} strokeWidth={3} />
                      <span>Add Match To Schedule</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN: CURRENT SCHEDULE SIDEBAR ── */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-7 backdrop-blur-xl h-full flex flex-col min-h-[560px]">
            {/* Top ambient highlight line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-cyan-400" />
                <h3 className="text-sm font-black uppercase text-white font-['Outfit'] tracking-wider">
                  Current Schedule
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-cyan-400 border border-slate-700/60">
                {schedule.length} {schedule.length === 1 ? "Match" : "Matches"}
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchSchedule}
                onChange={(e) => setSearchSchedule(e.target.value)}
                placeholder="Filter by team..."
                className="w-full bg-[#060a12] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            {/* Schedule Items List */}
            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[620px]">
              {filteredSchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/30">
                  <Calendar size={32} className="text-slate-600 mb-3" />
                  <div className="text-sm font-bold text-slate-300">
                    {searchSchedule ? "No matching fixtures" : "No matches scheduled yet"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 max-w-[220px]">
                    {searchSchedule ? "Try another team search." : "Add your first matchup using the form on the left!"}
                  </div>
                </div>
              ) : (
                filteredSchedule.map((m, index) => (
                  <div
                    key={m.id}
                    className="group relative flex flex-col bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all shadow-md hover:shadow-xl gap-3.5"
                  >
                    {/* Top Meta Strip */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-300 border border-slate-700/40">
                        Match #{index + 1}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1 font-semibold">
                        <Clock size={11} className="text-slate-500" />
                        {formatScheduleDay(m.day)} • {formatScheduleTime(m.time)}
                      </span>
                    </div>

                    {/* Team Showdown Row */}
                    <div className="flex items-center justify-between w-full gap-2">
                      {/* Team A */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {m.teamALogo ? (
                          <img
                            src={m.teamALogo}
                            alt={m.teamA}
                            className="w-8 h-8 object-contain rounded-lg bg-slate-900 border border-slate-700/60 p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[10px] font-black text-cyan-400 shrink-0">
                            {getTeamInitials(m.teamA)}
                          </div>
                        )}
                        <span className="text-white font-bold text-xs truncate" title={m.teamA}>
                          {m.teamA}
                        </span>
                      </div>

                      {/* VS Center */}
                      <div className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black text-cyan-400 tracking-wider shrink-0">
                        VS
                      </div>

                      {/* Team B */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                        <span className="text-white font-bold text-xs truncate text-right" title={m.teamB}>
                          {m.teamB}
                        </span>
                        {m.teamBLogo ? (
                          <img
                            src={m.teamBLogo}
                            alt={m.teamB}
                            className="w-8 h-8 object-contain rounded-lg bg-slate-900 border border-slate-700/60 p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-[10px] font-black text-rose-400 shrink-0">
                            {getTeamInitials(m.teamB)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-end pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => removeMatch(m.id)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-[11px] font-bold uppercase tracking-wider transition-colors px-2.5 py-1 rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const ScheduleTab = ({ game, globalTournament }) => {
  const d = DATA[game];
  const [activeGame, setActiveGame] = useState(game);
  const [filterByGame, setFilterByGame] = useState(true);
  const [reminders, setReminders] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  const safeFolder = globalTournament?.name
    ? globalTournament.name.replace(/[^a-zA-Z0-9]/g, "_")
    : "default";
  const key = `tourney_schedule_${safeFolder}_${activeGame}`;
  const [scheduleData, setScheduleData] = React.useState([]);

  React.useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await apiFetch(`/api/matches?tournament=${globalTournament?.name || "Default"}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((m) => {
            let dayNum = 1;
            if (m.match_day) {
              if (m.match_day.includes("-")) {
                dayNum = parseInt(m.match_day.split("-")[2], 10);
              } else {
                dayNum = parseInt(m.match_day, 10);
              }
            }
            return {
              id: m.match_id,
              teamA: m.team_a?.team_name || "TBD",
              teamALogo: m.team_a?.logo_url,
              teamB: m.team_b?.team_name || "TBD",
              teamBLogo: m.team_b?.logo_url,
              score: `${m.score_a || 0}-${m.score_b || 0}`,
              isLive: m.is_live,
              day: dayNum,
              time: m.match_time || "00:00",
              timezone: m.match_timezone || "PST",
              reminded: false,
              stage: m.round || "Match",
              map: m.map_info || "TBD",
            };
          });
          setScheduleData(mapped);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMatches();
  }, [globalTournament?.name]);

  const highlightDays = useMemo(
    () => scheduleData.map((m) => m.day),
    [scheduleData],
  );

  const filteredSchedule = useMemo(() => {
    if (!selectedDay) return scheduleData;
    return scheduleData.filter((m) => m.day === selectedDay);
  }, [scheduleData, selectedDay]);

  const toggleReminder = (id) =>
    setReminders((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="dashboard-section flex flex-col lg:flex-row gap-8 h-full">
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
        <MiniCalendar
          highlightDays={highlightDays}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
        <div className="glass-panel">
          <div className="filter-container">
            {/* Header Row */}
            <div className="filter-header-row">
              <h3 className="filter-title">FILTER BY GAME</h3>
              <button
                onClick={() => setFilterByGame(!filterByGame)}
                className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${filterByGame ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-slate-700 light:bg-slate-300"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${filterByGame ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Game List */}
            <div className="filter-list">
              {["VALORANT", "CROSSFIRE"].map((g) => {
                const isActive = activeGame === g;
                return (
                  <div
                    key={g}
                    onClick={() => setActiveGame(g)}
                    className={`game-filter-item ${isActive ? "active" : ""}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: DATA[g].color, boxShadow: `0 0 8px ${DATA[g].color}` }}
                    />
                    <span className={`font-bold text-sm tracking-wide ${isActive ? "text-white" : "text-slate-400"}`}>
                      {g}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="glass-panel flex-1 min-w-0 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="pb-1 border-b-2 border-slate-700/50 flex-1">
            <span
              className="text-xl font-black uppercase tracking-widest"
              style={{ color: DATA[activeGame].color }}
            >
              {activeGame}
            </span>
          </div>
        </div>
        { }
        <div className="flex flex-col gap-3">
          {filteredSchedule.map((s) => {
            const reminded =
              reminders[s.id] !== undefined ? reminders[s.id] : s.reminded;
            return (
              <div
                key={s.id}
                className="bg-[#0d131c] light:bg-white rounded-2xl border border-slate-800/50 light:border-slate-200 hover:border-slate-700/70 light:hover:border-slate-300 transition-all duration-300 p-4 flex items-center gap-4 group shadow-sm"
              >
                { }

                { }
                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-3 py-1">
                  <div className="flex items-center gap-2">
                    {s.teamALogo ? (
                      <img
                        src={s.teamALogo}
                        alt={s.teamA}
                        className="w-6 h-6 object-contain drop-shadow-md"
                      />
                    ) : null}
                    <span className="font-bold text-sm text-white light:text-slate-900 group-hover:text-slate-100">
                      {s.teamA}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-black px-1 hidden md:block">
                    VS
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white light:text-slate-900 group-hover:text-slate-100">
                      {s.teamB}
                    </span>
                    {s.teamBLogo ? (
                      <img
                        src={s.teamBLogo}
                        alt={s.teamB}
                        className="w-6 h-6 object-contain drop-shadow-md"
                      />
                    ) : null}
                  </div>
                </div>
                { }
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-sm font-black text-white light:text-slate-900">
                    {s.time}
                  </div>
                  <div className="text-[9px] text-slate-500 light:text-slate-400 font-mono">
                    {s.timezone}
                  </div>
                </div>
                { }
                <button
                  onClick={() => toggleReminder(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all active:scale-95 shrink-0 ${reminded
                      ? "bg-cyan-500/15 border border-cyan-500/40 text-cyan-400"
                      : "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                    }`}
                >
                  <IconBell />
                  {reminded ? "Reminded" : "Set Reminder"}
                </button>
              </div>
            );
          })}
        </div>
        { }
        {scheduleData.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-20 text-slate-600 text-sm font-bold tracking-widest uppercase">
            No scheduled matches
          </div>
        )}
      </div>
    </div>
  );
};
const Tournament = ({ globalGame, globalTournament }) => {
  const activeGame = (globalGame || "VALORANT").toUpperCase();
  const [activeTab, setActiveTab] = useState("LIVE & UPCOMING");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [step, setStep] = useState(1);
  const [tournData, setTournData] = useState({
    name: "",
    game: activeGame,
    prizePool: "$5,000",
    startDate: "",
    region: "NA",
    isPublic: true
  });
  const [isCreated, setIsCreated] = useState(false);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef({});

  useEffect(() => {
    const activeTabElement = tabsRef.current[activeTab];
    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab]);

  const tabs = [
    {
      key: "LIVE & UPCOMING",
      icon: (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></span>
        </span>
      ),
      label: "LIVE & UPCOMING"
    },
    {
      key: "RESULT",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
      label: "RESULT"
    },
    {
      key: "SCHEDULE",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
      label: "SCHEDULE"
    },
    {
      key: "CREATE TOURNAMENT",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
      label: "CREATE TOURNAMENT"
    },
    { 
      key: "BRACKET MANAGEMENT", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
      label: "BRACKET MANAGEMENT" 
    },

  ];

  const renderTab = () => {
    switch (activeTab) {
      case "LIVE & UPCOMING":
        return <LiveUpcomingTab game={activeGame} globalTournament={globalTournament} onOpenCreateModal={() => { setStep(1); setShowCreateModal(true); }} />;
      case "RESULT":
        return (
          <ResultTab game={activeGame} globalTournament={globalTournament} />
        );
      case "SCHEDULE":
        return (
          <ScheduleTab game={activeGame} globalTournament={globalTournament} />
        );
      case "CREATE TOURNAMENT":
        return (
          <ManageScheduleTab
            globalGame={globalGame}
            globalTournament={globalTournament}
            onOpenCreateModal={() => { setStep(1); setShowCreateModal(true); }}
          />
        );
      case "BRACKET MANAGEMENT":
        if (!globalTournament) {
           return (
             <div className="flex flex-col items-center justify-center p-16 text-slate-500 font-bold uppercase tracking-widest text-lg">
               Select a tournament first to manage its bracket
             </div>
           );
        }
        return (
          <div className="w-full border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl mt-4 animate-fade-in-up">
             <Bracket globalGame={activeGame} globalTournament={globalTournament} isReadOnly={false} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-[#090e14] light:bg-[#f8fafc] text-white light:text-slate-900 flex flex-col h-full overflow-hidden">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
      { }
      <div className="shrink-0 px-8 md:px-12 pt-6 pb-0 bg-gradient-to-b from-[#0a1018] to-[#090e14] light:from-white light:to-[#f8fafc] flex flex-col items-center relative overflow-hidden">
        {/* Subtle ambient glow behind header */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[200px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[150px] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="w-full max-w-[1400px] relative z-10">
          { }
          <div className="flex justify-center items-center w-full mb-6" style={{ padding: '16px 0' }}>
            <div className="relative flex items-center justify-between max-w-[1200px] w-full gap-4 md:gap-12 overflow-x-auto scrollbar-hide pb-2 border-b border-slate-800/60 light:border-slate-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  ref={(el) => (tabsRef.current[tab.key] = el)}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-8 py-3 text-[0.85rem] md:text-[0.95rem] font-bold tracking-[0.1em] uppercase border-none bg-transparent cursor-pointer transition-all duration-300 shrink-0 z-10 ${activeTab === tab.key
                      ? "text-white"
                      : "text-[#94a3b8] hover:text-white"
                    }`}
                >
                  <span className="opacity-80">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}

              {/* The Sliding Bar */}
              <div
                className="absolute bottom-[-1px] h-[3px] bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(0,240,255,1)] pointer-events-none"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
      { }
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 py-6 flex flex-col items-center">
        <div className="w-full max-w-[1400px]">{renderTab()}</div>
      </div>

      {/* 4-Step Create Tournament Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-[#090e17] border border-slate-800 rounded-3xl w-full max-w-4xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col relative transition-all duration-300 max-h-[92vh] overflow-hidden">
            {/* Top glowing ambient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent z-20" />

            {/* Modal Header Bar with Close Button */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Trophy size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase text-white font-['Outfit'] tracking-wider leading-tight">
                    Create Tournament
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    {step === 1 && "Step 1 of 4 • Basic Information & Rules"}
                    {step === 2 && "Step 2 of 4 • Match Scheduling & Lineups"}
                    {step === 3 && "Step 3 of 4 • Tournament Bracket Generation"}
                    {step === 4 && "Step 4 of 4 • Review & Launch Tournament"}
                  </p>
                </div>
              </div>

              {/* Dedicated Close Button */}
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                title="Close modal"
              >
                <X size={17} strokeWidth={2.5} />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 sm:px-12 pt-6 pb-4 bg-slate-950/40 border-b border-slate-800/60 shrink-0">
              <div className="flex items-center justify-between w-full max-w-2xl mx-auto relative">
                {/* Background Connecting Line */}
                <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-800 -translate-y-1/2 z-0" />
                {/* Active Connecting Line */}
                <div
                  className="absolute top-5 left-0 h-[2px] bg-gradient-to-r from-cyan-500 to-cyan-400 -translate-y-1/2 transition-all duration-500 z-0"
                  style={{ width: step === 1 ? '0%' : step === 2 ? '33.33%' : step === 3 ? '66.66%' : '100%' }}
                />

                {[
                  { s: 1, label: "Basic Info" },
                  { s: 2, label: "Schedule" },
                  { s: 3, label: "Brackets" },
                  { s: 4, label: "Confirm" }
                ].map(({ s, label }) => (
                  <div key={s} className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 ${
                        step > s
                          ? "bg-slate-900 border-2 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                          : step === s
                          ? "bg-gradient-to-br from-cyan-400 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] font-black scale-110"
                          : "bg-slate-900 border-2 border-slate-800 text-slate-500"
                      }`}
                    >
                      {step > s ? <Check size={16} strokeWidth={3} /> : s}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-2 transition-colors ${
                        step === s ? "text-cyan-400 font-black" : step > s ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 sm:p-8 flex flex-col items-center flex-1 overflow-y-auto custom-scrollbar">
              {step === 1 && (
                <div className="w-full max-w-2xl bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-inner flex flex-col gap-5">
                  <div className="text-center pb-2 border-b border-slate-800/60">
                    <h3 className="text-lg font-black uppercase text-white font-['Outfit'] tracking-wider">
                      Tournament Specifications
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter the tournament title, game title, and championship settings.
                    </p>
                  </div>

                  {/* Tournament Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Tournament Name *
                    </label>
                    <input
                      type="text"
                      value={tournData.name}
                      onChange={(e) => setTournData({ ...tournData, name: e.target.value })}
                      disabled={isCreated}
                      className="w-full bg-[#060a12] border border-slate-800 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all disabled:opacity-50"
                      placeholder="e.g. VCT Champions 2026, CFS Masters..."
                    />
                  </div>

                  {/* Game Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Game Title *
                    </label>
                    <select
                      value={tournData.game}
                      onChange={(e) => setTournData({ ...tournData, game: e.target.value })}
                      disabled={isCreated}
                      className="w-full bg-[#060a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all cursor-pointer disabled:opacity-50"
                    >
                      <option value="VALORANT" className="bg-[#0b1017] text-white">VALORANT</option>
                      <option value="CROSSFIRE" className="bg-[#0b1017] text-white">CROSSFIRE</option>
                    </select>
                  </div>

                  {/* Prize Pool & Start Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Prize Pool
                      </label>
                      <input
                        type="text"
                        value={tournData.prizePool}
                        onChange={(e) => setTournData({ ...tournData, prizePool: e.target.value })}
                        className="w-full bg-[#060a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all"
                        placeholder="e.g. $10,000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={tournData.startDate}
                        onChange={(e) => setTournData({ ...tournData, startDate: e.target.value })}
                        className="w-full bg-[#060a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white text-sm [color-scheme:dark] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Region
                    </label>
                    <select
                      value={tournData.region}
                      onChange={(e) => setTournData({ ...tournData, region: e.target.value })}
                      className="w-full bg-[#060a12] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="NA" className="bg-[#0b1017] text-white">North America (NA)</option>
                      <option value="EU" className="bg-[#0b1017] text-white">Europe (EU)</option>
                      <option value="APAC" className="bg-[#0b1017] text-white">Asia Pacific (APAC)</option>
                      <option value="LATAM" className="bg-[#0b1017] text-white">Latin America (LATAM)</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="w-full">
                  <ManageScheduleTab globalGame={tournData.game} globalTournament={{ name: tournData.name }} embedded={true} />
                </div>
              )}

              {step === 3 && (
                <div className="w-full" style={{ minHeight: '600px' }}>
                  <Bracket globalGame={tournData.game} globalTournament={{ name: tournData.name }} />
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-6 w-full max-w-3xl">
                  <div className="text-center mb-2">
                    <h3 className="text-2xl font-black text-white uppercase font-['Outfit'] tracking-wider">
                      Review Tournament Configuration
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Verify tournament specifications and schedule before final publication.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
                      <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-5 border-b border-slate-800 pb-3 flex items-center gap-1.5">
                        <Trophy size={13} />
                        <span>Basic Information</span>
                      </h4>
                      <div className="flex flex-col gap-4">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                            Tournament Name
                          </span>
                          <span className="text-lg font-black text-white font-['Outfit']">
                            {tournData.name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                            Game Title
                          </span>
                          <span className="text-xs font-black text-cyan-400 px-3 py-1 bg-cyan-500/10 border border-cyan-500/25 rounded-md inline-block uppercase tracking-wider">
                            {tournData.game}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-5 border-b border-slate-800 pb-3 flex items-center gap-1.5">
                        <Sparkles size={13} />
                        <span>Tournament Details</span>
                      </h4>
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                              Prize Pool
                            </span>
                            <span className="text-sm font-black text-emerald-400">
                              {tournData.prizePool || "None"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                              Region
                            </span>
                            <span className="text-sm font-bold text-slate-200">
                              {tournData.region}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                            Start Date
                          </span>
                          <span className="text-sm font-bold text-slate-200">
                            {tournData.startDate || "TBD"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <label className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/25 rounded-2xl p-6 shadow-lg flex items-center justify-between cursor-pointer group transition-all hover:bg-cyan-500/15">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                        Make Tournament Public
                      </span>
                      <span className="text-xs text-slate-400 font-medium mt-0.5">
                        Broadcast this tournament on public match viewers and fan pick'em pages.
                      </span>
                    </div>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={tournData.isPublic}
                        onChange={(e) => setTournData({ ...tournData, isPublic: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${tournData.isPublic ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${tournData.isPublic ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                  </label>

                  {/* Show Schedule in Confirmation Step */}
                  <div className="mt-2 w-full">
                    <ManageScheduleTab globalGame={tournData.game} globalTournament={{ name: tournData.name }} embedded={true} readOnly={true} />
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Fixed Modal Footer */}
            <div className="bg-[#060a12] border-t border-slate-800/80 px-6 sm:px-8 py-4 flex items-center justify-between shrink-0 z-10">
              {step > 1 ? (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Previous Step
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {step < 4 ? (
                <button 
                  type="button"
                  onClick={async () => {
                    if (step === 1 && !isCreated) {
                      if (!tournData.name.trim()) {
                        alert("Tournament Name is required");
                        return;
                      }
                      try {
                        await apiFetch("/api/tournaments", {
                           method: "POST",
                           body: JSON.stringify({ name: tournData.name, game: tournData.game }),
                        });
                        setIsCreated(true);
                        setStep(2);
                      } catch (e) {
                        console.error(e);
                        alert("Failed to create tournament");
                      }
                    } else {
                      setStep(step + 1);
                    }
                  }}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Next Step
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setStep(1);
                    alert("Tournament creation finalized! Refresh the page to see it in the sidebar.");
                  }}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Submit & Finalize
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
export default Tournament;

