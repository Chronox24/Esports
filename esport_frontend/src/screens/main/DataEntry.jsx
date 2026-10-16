import React, { useState, useMemo, useEffect } from "react";
import { apiFetch } from "../../utils/api";
import { io } from "socket.io-client";
import { AgentBadge, getAgentImagePath } from "../../utils/agentHelper";

const SOCKET_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : undefined);
const socket = io(SOCKET_URL);
const IconBroadcast = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M8.111 16.404a5.5 5.5 0 010-8.808m7.778 8.808a5.5 5.5 0 000-8.808M12 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M4.929 19.071a10 10 0 010-14.142m14.142 0a10 10 0 010 14.142"
    />
  </svg>
);
const IconGame = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M15 5v2m-6-2v2M5 9h14l1 12H4L5 9zm4 5h2m2 0h2M9 14v2m6-2v2"
    />
  </svg>
);
const IconMap = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
  </svg>
);
const IconStats = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M3 10h4v10H3V10zm7-6h4v16h-4V4zm7 8h4v8h-4v-8z"
    />
  </svg>
);
const IconNotes = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const IconSave = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);
const SectionHeader = ({ icon, label, sub, accent = "#06b6d4" }) => (
  <div className="border-b border-slate-800/60 light:border-slate-200 flex items-center gap-4 sm:gap-6 bg-slate-900/30 light:bg-slate-50 px-5 py-4 sm:px-6 sm:py-5">
    <div
      className="rounded-xl flex-shrink-0 p-3 sm:p-3.5"
      style={{
        backgroundColor: accent + "18",
        border: `1px solid ${accent}30`,
      }}
    >
      <span style={{ color: accent }}>{icon}</span>
    </div>
    <div className="flex flex-col gap-1">
      {sub && (
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 light:text-slate-400">
          {sub}
        </div>
      )}
      <h2 className="text-sm font-black text-white light:text-slate-900 uppercase tracking-[0.2em]">
        {label}
      </h2>
    </div>
  </div>
);
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
      {label}
    </label>
    {children}
  </div>
);
const inputBase =
  "bg-slate-800/50 light:bg-slate-50 border border-slate-700/70 light:border-slate-300 text-white light:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-sm outline-none focus:border-cyan-500/70 light:focus:border-blue-500/70 focus:ring-2 focus:ring-cyan-500/10 light:focus:ring-blue-500/10 transition-all w-full placeholder-slate-600 light:placeholder-slate-400";
const selectBase =
  "bg-slate-800/50 light:bg-slate-50 border border-slate-700/70 light:border-slate-300 text-white light:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-sm outline-none focus:border-cyan-500/70 light:focus:border-blue-500/70 focus:ring-2 focus:ring-cyan-500/10 light:focus:ring-blue-500/10 transition-all w-full cursor-pointer appearance-none";
const tableInput =
  "bg-transparent w-full text-center outline-none focus:bg-slate-800/70 light:focus:bg-slate-200 focus:ring-1 focus:ring-cyan-500/50 light:focus:ring-blue-500/50 rounded-md py-0.5 px-0.5 transition-all text-xs font-bold text-white light:text-slate-900";
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
    const room = window.currentDataEntryRoom || "Default";
    const handleEdit = (data) => {
      if (data.field === key && data.room === room) {
        if (JSON.stringify(data.new_value) !== JSON.stringify(value)) {
          isRemote.current = true;
          setValue(data.new_value);
        }
      }
    };
    socket.on('cellEdit', handleEdit);
    return () => socket.off('cellEdit', handleEdit);
  }, [key, value]);

  return [value, setValue];
}
const DataEntry = ({ globalGame, globalTournament }) => {
  window.currentDataEntryRoom = `DataEntry_${globalTournament || "Default"}`;

  useEffect(() => {
    socket.emit('joinRoom', window.currentDataEntryRoom);
  }, [globalTournament]);

  const [broadcast, setBroadcast] = useStickyState(false, "de_broadcast");
  const game = globalGame === "CROSSFIRE" ? "Crossfire" : "Valorant";
  const [league, setLeague] = useStickyState("VCT Pacific", "de_league");
  const [week, setWeek] = useStickyState("1", "de_week");
  const [day, setDay] = useStickyState("1", "de_day");
  const [match, setMatch] = useStickyState("1", "de_match");
  const [setNum, setSetNum] = useStickyState("1", "de_setNum");
  const safeFolder = (globalTournament || "").replace(/\W+/g, "");
  const matchScope = `de_f${safeFolder}_w${week}_d${day}_m${match}`;
  const setScope = `${matchScope}_s${setNum}`;
  const [teamA, setTeamA] = useStickyState(
    { name: "WOLF ESPORT", logo: "" },
    `${matchScope}_teamA`,
  );
  const [teamB, setTeamB] = useStickyState(
    { name: "GOAT GAMING", logo: "" },
    `${matchScope}_teamB`,
  );
  const [winner, setWinner] = useStickyState("A", `${matchScope}_winner`);
  const [mapName, setMapName] = useStickyState("Bind", `${setScope}_mapName`);
  const [scoreA, setScoreA] = useStickyState(13, `${setScope}_scoreA`);
  const [scoreB, setScoreB] = useStickyState(11, `${setScope}_scoreB`);
  const [roundLogsA, setRoundLogsA] = useStickyState(
    Array(40).fill(""),
    `${setScope}_roundLogsA`,
  );
  const [roundLogsB, setRoundLogsB] = useStickyState(
    Array(40).fill(""),
    `${setScope}_roundLogsB`,
  );
  const [sideA, setSideA] = useStickyState("GR", `${setScope}_sideA`);
  const [sideB, setSideB] = useStickyState("BL", `${setScope}_sideB`);
  const [timeoutA, setTimeoutA] = useStickyState(
    "AVAILABLE",
    
    `${setScope}_timeoutA`,
  );
  const [timeoutB, setTimeoutB] = useStickyState(
    "AVAILABLE",
    `${setScope}_timeoutB`,
  );
  const [timeoutRowLogs, setTimeoutRowLogs] = useStickyState(
    Array(40).fill(""),
    `${setScope}_timeoutRowLogs`,
  );
  const [deadRoundRowLogs, setDeadRoundRowLogs] = useStickyState(
    Array(40).fill(""),
    `${setScope}_deadRoundRowLogs`,
  );
  const [matchWin, setMatchWin] = useStickyState("B", `${setScope}_matchWin`);
  const [playersA, setPlayersA] = useStickyState(() => {
    return Array(5).fill(null).map(() => ({
      ign: "",
      agent: "",
      k: 0,
      d: 0,
      a: 0,
      acs: 0,
      econ: 0,
      first_kills: 0,
      plants: 0,
      defuse: 0,
      ace: 0,
    }));
  }, `${setScope}_playersA`);
  const [playersB, setPlayersB] = useStickyState(() => {
    return Array(5).fill(null).map(() => ({
      ign: "",
      agent: "",
      k: 0,
      d: 0,
      a: 0,
      acs: 0,
      econ: 0,
      first_kills: 0,
      plants: 0,
      defuse: 0,
      ace: 0,
    }));
  }, `${setScope}_playersB`);
  const [notes, setNotes] = useStickyState(
    "Pause at 12:00 due to the technical issue",
    `${setScope}_notes`,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedRecords, setSubmittedRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const queryParams = new URLSearchParams({
          game: game
        }).toString();
        const res = await apiFetch(`/api/match_records?${queryParams}`);
        if (res.ok) {
          const data = await res.json();
          // Sort chronologically (newest first) so recently submitted sets appear at the top
          data.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            // 1. Most recently sent first
            if (dateA !== dateB) return dateB - dateA;
            // 1.5. If same time (e.g. null), sort by match number (highest/newest match first)
            const matchA = Number(a.match) || 0;
            const matchB = Number(b.match) || 0;
            if (matchA !== matchB) return matchB - matchA;
            // 2. If same time and match, sort by set number (highest/newest set first)
            const setA = Number(a.set_num) || 0;
            const setB = Number(b.set_num) || 0;
            if (setA !== setB) return setB - setA;
            // 3. Within the same set, keep Team 1 above Team 15
            if (a.team_name !== b.team_name) return (a.team_name || "").localeCompare(b.team_name || "");
            // 4. Finally, sort by player name
            return (a.ign || '').localeCompare(b.ign || '');
          });
          setSubmittedRecords(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecords();
  }, [submitSuccess, globalTournament, game, week, day, match]);
  const [activeTab, setActiveTab] = useStickyState("stats", "de_activeTab");
  const [heatmapData, setHeatmapData] = useStickyState(
    [],
    `${setScope}_heatmapData`,
  );
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedAction, setSelectedAction] = useState("Plant");
  const [manualX, setManualX] = useState("");
  const [manualY, setManualY] = useState("");
  const [heatmapNotif, setHeatmapNotif] = useState(null);

  const showHeatmapNotifMsg = (action, round) => {
    setHeatmapNotif(`Recorded ${action} for Round ${round}`);
    setTimeout(() => {
      setHeatmapNotif(null);
    }, 2000);
  };

  const handleManualAdd = () => {
    if (manualX !== "" && manualY !== "") {
      setHeatmapData((prev) => {
        const newEvents = [
          {
            id: Date.now(),
            round: selectedRound,
            type: selectedAction,
            x: parseFloat(manualX).toFixed(2),
            y: parseFloat(manualY).toFixed(2),
          }
        ];
        if (selectedAction === "Defuse") {
          newEvents.push({
            id: Date.now() + 1,
            round: selectedRound,
            type: "Plant",
            x: parseFloat(manualX).toFixed(2),
            y: parseFloat(manualY).toFixed(2),
          });
        }
        return [...prev, ...newEvents];
      });
      setManualX("");
      setManualY("");

      showHeatmapNotifMsg(selectedAction, selectedRound);

      const maxRounds = scoreA + scoreB || 1;
      if (selectedRound < maxRounds) {
        setSelectedRound((prev) => prev + 1);
      }
    }
  };
  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHeatmapData((prev) => {
      const newEvents = [
        {
          id: Date.now(),
          round: selectedRound,
          type: selectedAction,
          x: x.toFixed(2),
          y: y.toFixed(2),
        }
      ];
      if (selectedAction === "Defuse") {
        newEvents.push({
          id: Date.now() + 1,
          round: selectedRound,
          type: "Plant",
          x: x.toFixed(2),
          y: y.toFixed(2),
        });
      }
      return [...prev, ...newEvents];
    });

    showHeatmapNotifMsg(selectedAction, selectedRound);

    const maxRounds = scoreA + scoreB || 1;
    if (selectedRound < maxRounds) {
      setSelectedRound((prev) => prev + 1);
    }
  };
  const removeHeatmapEvent = (id) => {
    setHeatmapData((prev) => prev.filter((h) => h.id !== id));
  };
  // Crossfire Adaptive Columns State (Groups of K, D, A, H)
  const [cfStatsMode, setCfStatsMode] = useStickyState("adaptive", `${setScope}_cfStatsMode`); // "adaptive" | "perRound"

  const [cfGroups, setCfGroups] = useStickyState(
    [{ id: "g1", label: "TOTAL PLAYER STATS", isTotal: true }],
    `${setScope}_cfGroups`,
  );
  const handleAddCfGroup = () => {
    const newId = `g_${Date.now()}`;
    setCfGroups([...cfGroups, { id: newId, label: "NEW STATS" }]);
  };
  const handleRemoveCfGroup = (id) => {
    setCfGroups(cfGroups.filter((g) => g.id !== id));
  };
  const handleUpdateCfGroupLabel = (id, label) => {
    setCfGroups(cfGroups.map((g) => (g.id === id ? { ...g, label } : g)));
  };
  const updateRoundEvent = (team, idx, val) => {
    let value = val.toUpperCase().slice(-1);
    if (!["K", "D", "P", "T", ""].includes(value)) {
      value = "";
    }
    if (team === "A") {
      const logs = [...roundLogsA];
      logs[idx] = value;
      setRoundLogsA(logs);
      if (value !== "") {
        const logsB = [...roundLogsB];
        logsB[idx] = "";
        setRoundLogsB(logsB);
      }
    } else {
      const logs = [...roundLogsB];
      logs[idx] = value;
      setRoundLogsB(logs);
      if (value !== "") {
        const logsA = [...roundLogsA];
        logsA[idx] = "";
        setRoundLogsA(logsA);
      }
    }
  };
  const updatePlayer = (team, idx, field, value) => {
    if (team === "A") {
      const p = [...playersA];
      p[idx] = { ...p[idx], [field]: value };
      setPlayersA(p);
    } else {
      const p = [...playersB];
      p[idx] = { ...p[idx], [field]: value };
      setPlayersB(p);
    }
  };
  const handleStatChange = (team, idx, field, rawValue) => {
    if (rawValue === "" || rawValue === null || rawValue === undefined) {
      updatePlayer(team, idx, field, "");
      return;
    }
    let str = String(rawValue);
    if (str.length > 1 && str.startsWith("0")) {
      str = str.replace(/^0+/, "");
      if (str === "") str = "0";
    }
    const num = Number(str);
    updatePlayer(team, idx, field, isNaN(num) ? "" : num);
  };
  const handleStatBlur = (team, idx, field, e) => {
    if (e.target.value === "") {
      updatePlayer(team, idx, field, 0);
    }
  };
  const [lifetimeStats, setLifetimeStats] = useState({});
  const [dbTeams, setDbTeams] = useState([]);
  const [dbPlayers, setDbPlayers] = useState([]);
  const calculateWinProbability = () => {
    const totalRounds = scoreA + scoreB;
    if (totalRounds === 0) return { a: 50, b: 50 };
    const probA = Math.round((scoreA / totalRounds) * 100);
    return { a: probA, b: 100 - probA };
  };
  const winProb = calculateWinProbability();
  useEffect(() => {
    setPlayersA((prev) =>
      prev.map((p) => {
        if (p.ign && p.ign.startsWith("Player")) {
          return { ...p, ign: p.ign.split(": ")[1] || p.ign };
        }
        return p;
      }),
    );
    setPlayersB((prev) =>
      prev.map((p) => {
        if (p.ign && p.ign.startsWith("Player")) {
          return { ...p, ign: p.ign.split(": ")[1] || p.ign };
        }
        return p;
      }),
    );
  }, []);
  useEffect(() => {
    apiFetch(`/api/teams?tournament=${encodeURIComponent(globalTournament)}`)
      .then((r) => r.json())
      .then(setDbTeams)
      .catch(console.error);
    apiFetch(`/api/players?tournament=${encodeURIComponent(globalTournament)}`)
      .then((r) => r.json())
      .then(setDbPlayers)
      .catch(console.error);
  }, [globalTournament]);
  const handleTeamSelect = (side, teamName) => {
    if (side === "A") {
      setTeamA({ ...teamA, name: teamName });
    } else {
      setTeamB({ ...teamB, name: teamName });
    }
    setRoundLogsA(Array(40).fill(""));
    setRoundLogsB(Array(40).fill(""));
    setTimeoutRowLogs(Array(40).fill(""));
    setDeadRoundRowLogs(Array(40).fill(""));
    setTimeoutA("AVAILABLE");
    setTimeoutB("AVAILABLE");
    const team = dbTeams.find((t) => t.team_name === teamName);
    if (team) {
      const teamPlayers = dbPlayers.filter((p) => p.team_id === team.team_id);
      const updatedPlayers = Array(5)
        .fill(null)
        .map((_, i) => {
          const p = teamPlayers[i];
          return {
            ign: p ? p.player_name : "",
            agent: "Jett",
            k: 0,
            d: 0,
            a: 0,
            acs: 0,
            econ: 0,
            first_kills: 0,
            plants: 0,
            defuse: 0,
            ace: 0,
          };
        });
      if (side === "A") {
        setPlayersA(updatedPlayers);
      } else {
        setPlayersB(updatedPlayers);
      }
    }
  };
  useEffect(() => {
    if (game === "Crossfire") {
      apiFetch("/api/stats/crossfire")
        .then((res) => res.json())
        .then((data) => {
          const statsMap = {};
          if (Array.isArray(data)) {
            data.forEach((row) => {
              statsMap[row.ign] = row;
            });
          }
          setLifetimeStats(statsMap);
        })
        .catch((err) => console.error("Error fetching Crossfire stats:", err));
    }
  }, [game, submitSuccess]);
  const getCfTotal = (player, field) => {
    const history = lifetimeStats[player.ign] || {};
    let dbValue = 0;
    if (field === "k") dbValue = history.total_kills || 0;
    if (field === "d") dbValue = history.total_deaths || 0;
    if (field === "a") dbValue = history.total_assists || 0;
    if (field === "h") dbValue = history.total_headshots || 0;
    const newSum = cfGroups.reduce((sum, g) => {
      if (g.isTotal) return sum;
      const val = player[`${g.id}_${field}`];
      return sum + (Number(val) || 0);
    }, 0);
    return dbValue + newSum;
  };
  const calcRoundScore = (logs) => logs.filter((v) => v !== "").length;
  const autoScoreA = calcRoundScore(roundLogsA);
  const autoScoreB = calcRoundScore(roundLogsB);
  const currentRoundNo = Math.min(
    40,
    roundLogsA.filter((v) => v !== "").length +
    roundLogsB.filter((v) => v !== "").length +
    1,
  );
  const handleTimeoutChange = (team, val) => {
    if (team === "A") {
      setTimeoutA(val);
    } else {
      setTimeoutB(val);
    }
  };
  useEffect(() => {
    setScoreA(autoScoreA);
    setScoreB(autoScoreB);
    if (autoScoreA > autoScoreB) {
      setMatchWin("A");
    } else if (autoScoreB > autoScoreA) {
      setMatchWin("B");
    }
  }, [autoScoreA, autoScoreB, setMatchWin, setScoreA, setScoreB]);
  const agents = [
    "Jett",
    "Fade",
    "Neon",
    "Clove",
    "Chamber",
    "Viper",
    "Omen",
    "Gekko",
    "Reyna",
    "Sage",
    "Breach",
    "Phoenix",
    "Sova",
    "Killjoy",
    "Cypher",
    "Raze",
    "Skye",
    "Kay/O",
    "Astra",
    "Brimstone",
    "Harbor",
    "Deadlock",
    "Iso",
    "Vyse",
    "Yoru",
    "Tejo",
    "Veto",
    "Waylay",
    "Miks",
  ];
  const valorantMaps = [
    "Abyss",
    "Ascent",
    "Bind",
    "Breeze",
    "Corrode",
    "Fracture",
    "Haven",
    "Icebox",
    "Lotus",
    "Pearl",
    "Split",
    "Summit",
    "Sunset",
  ];
  const handleSubmit = async () => {
    const matchHeader = { league, week, day, match, setNum, mapName };
    if (game === "Crossfire") {
      setIsSubmitting(true);

      // Finish Live Match if broadcasting
      if (broadcast) {
        try {
          await apiFetch('/api/matches/finish-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tournament_name: globalTournament || "Default",
              team_a_name: teamA.name,
              team_b_name: teamB.name,
              team_a_score: scoreA,
              team_b_score: scoreB
            })
          });
        } catch (e) {
          console.error('Failed to finish live match', e);
        }
      }

      try {
        const payloadMap = {};
        const rawEntries = [];
        const extractNewStats = (p, teamName, isWin) => {
          let kills = 0,
            deaths = 0,
            assists = 0,
            headshots = 0;
          if (cfStatsMode === "perRound") {
            Array.from({ length: 40 }).forEach((_, i) => {
              const rK = Number(p[`r${i + 1}_k`]) || 0;
              const rD = Number(p[`r${i + 1}_d`]) || 0;
              const rA = Number(p[`r${i + 1}_a`]) || 0;
              const rH = Number(p[`r${i + 1}_h`]) || 0;
              if (p.ign) {
                rawEntries.push({
                  ign: p.ign, kills: rK, deaths: rD, assists: rA, headshots: rH, team_name: teamName, win: isWin
                });
                kills += rK; deaths += rD; assists += rA; headshots += rH;
              }
            });
          } else {
            cfGroups.forEach((g) => {
              if (!g.isTotal) {
                const k = Number(p[`${g.id}_k`]) || 0;
                const d = Number(p[`${g.id}_d`]) || 0;
                const a = Number(p[`${g.id}_a`]) || 0;
                const h = Number(p[`${g.id}_h`]) || 0;
                if (p.ign) {
                  rawEntries.push({
                    ign: p.ign,
                    kills: k,
                    deaths: d,
                    assists: a,
                    headshots: h,
                    team_name: teamName,
                    win: isWin,
                  });
                }
                kills += k;
                deaths += d;
                assists += a;
                headshots += h;
              }
            });
          }
          if (p.ign) {
            if (payloadMap[p.ign]) {
              payloadMap[p.ign].kills += kills;
              payloadMap[p.ign].deaths += deaths;
              payloadMap[p.ign].assists += assists;
              payloadMap[p.ign].headshots += headshots;
            } else {
              payloadMap[p.ign] = {
                ign: p.ign,
                kills,
                deaths,
                assists,
                headshots,
                rounds: scoreA + scoreB,
                team_name: teamName,
                win: isWin,
              };
            }
          }
        };
        playersA.forEach((p) =>
          extractNewStats(p, teamA.name, matchWin === "A"),
        );
        playersB.forEach((p) =>
          extractNewStats(p, teamB.name, matchWin === "B"),
        );
        const payloadPlayers = Object.values(payloadMap);
        if (payloadPlayers.length > 0) {
          const res = await apiFetch("/api/stats/crossfire/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              players: payloadPlayers,
              rawEntries,
              matchHeader,
              tournamentName: globalTournament,
            }),
          });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to submit stats");
          }
        }
        if (heatmapData.length > 0) {
          const match_id = `${teamA.name}_vs_${teamB.name}_${mapName}_Set${setNum}_${Date.now()}`;
          const formattedHeatmap = heatmapData.map((h) => ({
            game: "Crossfire",
            match_id,
            round_number: h.round,
            event_type: h.type,
            coord_x: h.x,
            coord_y: h.y,
          }));
          const heatmapRes = await apiFetch("/api/stats/heatmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ events: formattedHeatmap }),
          });
          if (!heatmapRes.ok) {
            const errData = await heatmapRes.json();
            throw new Error(errData.error || "Failed to submit heatmap data");
          }
        }
        setIsSubmitting(false);
        setSubmitSuccess(true);
        alert(
          `Match Submitted! ${matchWin === "A" ? teamA.name : teamB.name} has won the match!`,
        );
        setTimeout(() => setSubmitSuccess(false), 3000);
        setHeatmapData([]);
        setCfGroups([{ id: "g1", label: "TOTAL PLAYER STATS", isTotal: true }]);
      } catch (err) {
        console.error(err);
        setIsSubmitting(false);
        alert("Error submitting Crossfire stats: " + err.message);
      }
    } else {
      setIsSubmitting(true);

      // Finish Live Match if broadcasting
      if (broadcast) {
        try {
          await apiFetch('/api/matches/finish-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tournament_name: globalTournament || "Default",
              team_a_name: teamA.name,
              team_b_name: teamB.name,
              team_a_score: scoreA,
              team_b_score: scoreB
            })
          });
        } catch (e) {
          console.error('Failed to finish live match', e);
        }
      }

      try {
        const payloadMap = {};
        const extractNewStats = (p, teamName, isWin) => {
          if (p.ign) {
            if (payloadMap[p.ign]) {
              payloadMap[p.ign].kills += Number(p.k) || 0;
              payloadMap[p.ign].deaths += Number(p.d) || 0;
              payloadMap[p.ign].assists += Number(p.a) || 0;
              payloadMap[p.ign].acs += Number(p.acs) || 0;
              payloadMap[p.ign].econ += Number(p.econ) || 0;
              payloadMap[p.ign].first_kills = (payloadMap[p.ign].first_kills || 0) + (Number(p.first_kills) || 0);
              payloadMap[p.ign].plants = (payloadMap[p.ign].plants || 0) + (Number(p.plants) || 0);
              payloadMap[p.ign].defuse = (payloadMap[p.ign].defuse || 0) + (Number(p.defuse) || 0);
              payloadMap[p.ign].aces = (payloadMap[p.ign].aces || 0) + (Number(p.ace) || 0);
            } else {
              payloadMap[p.ign] = {
                ign: p.ign,
                kills: Number(p.k) || 0,
                deaths: Number(p.d) || 0,
                assists: Number(p.a) || 0,
                acs: Number(p.acs) || 0,
                econ: Number(p.econ) || 0,
                first_kills: Number(p.first_kills) || 0,
                plants: Number(p.plants) || 0,
                defuse: Number(p.defuse) || 0,
                aces: Number(p.ace) || 0,
                agent: p.agent || "",
                rounds: scoreA + scoreB,
                team_name: teamName,
                win: isWin,
              };
            }
          }
        };
        playersA.forEach((p) =>
          extractNewStats(p, teamA.name, matchWin === "A"),
        );
        playersB.forEach((p) =>
          extractNewStats(p, teamB.name, matchWin === "B"),
        );
        const payloadPlayers = Object.values(payloadMap);
        if (payloadPlayers.length > 0) {
          const res = await apiFetch("/api/stats/valorant/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              players: payloadPlayers,
              matchHeader,
              tournamentName: globalTournament,
            }),
          });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to submit stats");
          }
        }
        if (heatmapData.length > 0) {
          const match_id = `${teamA.name}_vs_${teamB.name}_${mapName}_Set${setNum}_${Date.now()}`;
          const formattedHeatmap = heatmapData.map((h) => ({
            game: "Valorant",
            match_id,
            round_number: h.round,
            event_type: h.type,
            coord_x: h.x,
            coord_y: h.y,
          }));
          const heatmapRes = await apiFetch("/api/stats/heatmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ events: formattedHeatmap }),
          });
          if (!heatmapRes.ok) {
            const errData = await heatmapRes.json();
            throw new Error(errData.error || "Failed to submit heatmap data");
          }
        }
        setIsSubmitting(false);
        setSubmitSuccess(true);
        alert(
          `Match Submitted! ${matchWin === "A" ? teamA.name : teamB.name} has won the match!`,
        );
        setTimeout(() => setSubmitSuccess(false), 3000);
        setHeatmapData([]);
      } catch (err) {
        console.error(err);
        setIsSubmitting(false);
        alert("Error submitting Valorant stats: " + err.message);
      }
    }
  };
  const handleCancel = () => {
    if (window.confirm("Clear all data? This cannot be undone.")) {
      setLeague("");
      setWeek("1");
      setDay("1");
      setMatch("1");
      setSetNum("1");
      setTeamA({ name: "", logo: "" });
      setTeamB({ name: "", logo: "" });
      setWinner("A");
      setMapName("Bind");
      setScoreA(0);
      setScoreB(0);
      setRoundLogsA(Array(40).fill(""));
      setRoundLogsB(Array(40).fill(""));
      setPlayersA(
        Array(5)
          .fill(null)
          .map((_, i) => ({
            ign: "",
            agent: "",
            k: 0,
            d: 0,
            a: 0,
            acs: 0,
            econ: 0,
            first_kills: 0,
            plants: 0,
            defuse: 0,
            ace: 0,
          })),
      );
      setPlayersB(
        Array(5)
          .fill(null)
          .map((_, i) => ({
            ign: "",
            agent: "",
            k: 0,
            d: 0,
            a: 0,
            acs: 0,
            econ: 0,
            first_kills: 0,
            plants: 0,
            defuse: 0,
            ace: 0,
          })),
      );
      setNotes("");
      setBroadcast(false);
      setHeatmapData([]);
      setCfGroups([{ id: "g1", label: "TOTAL PLAYER STATS", isTotal: true }]);
      setTimeoutARound(null);
      setTimeoutBRound(null);
      setTimeoutRowLogs(Array(40).fill(""));
    }
  };

  const handleGridNavigation = (e) => {
    if (e.defaultPrevented) return;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    
    const currentInput = e.target;
    if (currentInput.tagName !== 'INPUT' || currentInput.type !== 'number') return;

    const allInputs = Array.from(document.querySelectorAll('input[type="number"]')).filter(inp => inp.getBoundingClientRect().width > 0);
    const currentIndex = allInputs.indexOf(currentInput);
    if (currentIndex === -1) return;

    let nextInput = null;
    const currentRect = currentInput.getBoundingClientRect();

    if (e.key === 'ArrowLeft') {
      nextInput = allInputs[currentIndex - 1];
    } else if (e.key === 'ArrowRight') {
      nextInput = allInputs[currentIndex + 1];
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const isUp = e.key === 'ArrowUp';
      const candidateInputs = allInputs.filter(inp => {
         if (inp === currentInput) return false;
         const rect = inp.getBoundingClientRect();
         const isSameCol = Math.abs((rect.left + rect.width / 2) - (currentRect.left + currentRect.width / 2)) < (currentRect.width / 2 + 10);
         const isCorrectDir = isUp ? rect.top < currentRect.top : rect.top > currentRect.top;
         return isSameCol && isCorrectDir;
      });
      
      if (candidateInputs.length > 0) {
         candidateInputs.sort((a, b) => {
            const aRect = a.getBoundingClientRect();
            const bRect = b.getBoundingClientRect();
            return isUp ? bRect.top - aRect.top : aRect.top - bRect.top;
         });
         nextInput = candidateInputs[0];
      }
    }

    if (nextInput) {
      e.preventDefault();
      nextInput.focus();
      if (typeof nextInput.select === 'function') nextInput.select();
    }
  };

  const handleRoundInputKeyDown = (e, rowId, index) => {
    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      let nextRow = rowId;
      let nextIdx = index;

      if (e.key === 'ArrowRight') nextIdx = index + 1;
      else if (e.key === 'ArrowLeft') nextIdx = index - 1;
      else if (e.key === 'ArrowDown') {
        if (rowId === 'A') nextRow = 'B';
        else if (rowId === 'B') nextRow = 'T';
        else if (rowId === 'T') nextRow = 'D';
      } else if (e.key === 'ArrowUp') {
        if (rowId === 'D') nextRow = 'T';
        else if (rowId === 'T') nextRow = 'B';
        else if (rowId === 'B') nextRow = 'A';
      }

      let nextInput = document.getElementById(`round-input-${nextRow}-${nextIdx}`);
      if (!nextInput && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && nextIdx > 11 && (nextRow === 'T' || nextRow === 'D')) {
        nextInput = document.getElementById(`round-input-${nextRow}-11`);
      }
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  return (
    <div
      className="w-full min-h-full flex flex-col bg-[#090e14] light:bg-[#f8fafc] text-slate-200 light:text-slate-800"
      onKeyDown={handleGridNavigation}
    >
      <style>{`
        /* Hide number input spinners completely so no width is lost */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
          display: none !important;
        }
        input[type="number"] {
          -moz-appearance: textfield !important;
          appearance: textfield !important;
        }
        .de-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .de-scroll::-webkit-scrollbar-track { background: transparent; }
        .de-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        .de-scroll::-webkit-scrollbar-thumb:hover { background: #334155; }
        .de-scroll { scrollbar-width: thin; scrollbar-color: #1e293b transparent; }
        @keyframes submitPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(6,182,212,0.2); }
          50% { box-shadow: 0 0 30px rgba(6,182,212,0.5); }
        }
        @keyframes successFlash {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .submit-pulse { animation: submitPulse 2s ease-in-out infinite; }
        .success-flash { animation: successFlash 0.3s ease; }
        .round-btn { transition: all 0.15s ease; }
        .round-btn:active { transform: scale(0.88); }
      `}</style>
      {/* ── Content ── */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-[1720px] flex flex-col p-4 sm:p-6 lg:p-8 gap-6">
          {/* ── Top Bar: Broadcast Toggle ── */}
          <div className="flex items-center justify-end gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-sm" title="Your edits are instantly saved and synced with other admins">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Live Auto-Saving
              </span>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/40 light:bg-white border border-slate-700/50 light:border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Broadcast
              </span>
              <button
                onClick={() => setBroadcast(!broadcast)}
                className={`w-11 h-10 rounded-full p-0.5 transition-all duration-300 ${broadcast ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "bg-slate-700"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${broadcast ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span
                className={`text-[9px] font-black uppercase tracking-widest transition-colors ${broadcast ? "text-emerald-400" : "text-slate-600"}`}
              >
                {broadcast ? "ON AIR" : "OFF"}
              </span>
            </div>
          </div>
          {/* ── Row 1: Match Header & Win Probability (Left) + Teams (Right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: "24px" }}>
            {/* Left Side (Col 1 & 2): Match Header & Win Probability */}
            <div className="lg:col-span-2 flex flex-col" style={{ gap: "24px" }}>
              {/* Match Header */}
              <div className="bg-[#0d131c] light:bg-white rounded-2xl border border-slate-800/50 light:border-slate-200 overflow-hidden shadow-xl light:shadow-sm">
                <SectionHeader
                  icon={<IconGame />}
                  label="Main Match Header"
                  sub="Configuration"
                />
                <div className="grid grid-cols-2 lg:grid-cols-4" style={{ padding: "24px", gap: "20px" }}>

                  <Field label="Week:">
                    <input
                      type="number"
                      className={`${inputBase.replace('w-full', 'w-16 text-center')}`}
                      value={week}
                      onChange={(e) => setWeek(e.target.value)}
                    />
                  </Field>
                  <Field label="Day:">
                    <input
                      type="number"
                      className={`${inputBase.replace('w-full', 'w-16 text-center')}`}
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                    />
                  </Field>
                  <Field label="Match:">
                    <input
                      type="number"
                      className={`${inputBase.replace('w-full', 'w-16 text-center')}`}
                      value={match}
                      onChange={(e) => setMatch(e.target.value)}
                    />
                  </Field>
                  <Field label="Set:">
                    <input
                      type="number"
                      className={`${inputBase.replace('w-full', 'w-16 text-center')}`}
                      value={setNum}
                      onChange={(e) => setSetNum(e.target.value)}
                    />
                  </Field>
                  <Field label="Map:">
                    <div className="relative">
                      <select
                        className={selectBase}
                        value={mapName}
                        onChange={(e) => setMapName(e.target.value)}
                      >
                        {game === "Valorant" ? (
                          valorantMaps.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))
                        ) : (
                          <>
                            <option>Ankara</option>
                            <option>Black Widow</option>
                            <option>Compound</option>
                            <option>Eagle Eye</option>
                            <option>Mexico</option>
                            <option>Port</option>
                            <option>Sub Base</option>
                          </>
                        )}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        ▾
                      </div>
                    </div>
                  </Field>
                </div>
              </div>

              {/* ── Win Probability Module ── */}
              {game === "Valorant" && (
                <div className="bg-[#0d131c] light:bg-white rounded-2xl border border-slate-800/50 light:border-slate-200 overflow-hidden shadow-xl light:shadow-sm">
                  <SectionHeader
                    icon={<IconGame />}
                    label="Win Probability"
                    sub="Live Assessment"
                    accent="#f59e0b"
                  />
                  <div style={{ padding: "24px" }}>
                    <div className="w-full">
                      <div className="bg-slate-800/50 light:bg-slate-50 border border-slate-700/70 light:border-slate-300 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">{teamA.name || 'Team A'}</span>
                            <span className="text-3xl font-black text-blue-100">{Math.max(0, Math.min(100, Math.round(50 + ((scoreA - scoreB) * (50 / 13)))))}<span className="text-xl text-blue-500">%</span></span>
                          </div>
                          <div className="text-[11px] font-black text-slate-500 tracking-widest">VS</div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">{teamB.name || 'Team B'}</span>
                            <span className="text-3xl font-black text-red-100">{Math.max(0, Math.min(100, 100 - Math.round(50 + ((scoreA - scoreB) * (50 / 13)))))}<span className="text-xl text-red-500">%</span></span>
                          </div>
                        </div>

                        <div className="relative w-full h-4 rounded-full bg-slate-900 overflow-hidden mt-2 group shadow-inner">
                          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, Math.round(50 + ((scoreA - scoreB) * (50 / 13)))))}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {game === "Crossfire" && (
                <div className="bg-[#0d131c] rounded-2xl border border-slate-800/50 overflow-hidden shadow-xl">
                  <SectionHeader
                    icon={<IconGame />}
                    label="Win Probability"
                    sub="Live Assessment"
                    accent="#f59e0b"
                  />
                  <div style={{ padding: "24px" }}>
                    <div className="flex flex-wrap items-end gap-8">
                      <div className="w-full max-w-xl">
                        <div className="bg-slate-800/50 light:bg-slate-50 border border-slate-700/70 light:border-slate-300 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">{teamA.name || 'Team A'}</span>
                              <span className="text-3xl font-black text-blue-100">{scoreA}<span className="text-xl text-blue-500">%</span></span>
                            </div>
                            <div className="text-[11px] font-black text-slate-500 tracking-widest">VS</div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">{teamB.name || 'Team B'}</span>
                              <span className="text-3xl font-black text-red-100">{scoreB}<span className="text-xl text-red-500">%</span></span>
                            </div>
                          </div>

                          <div className="relative w-full h-4 rounded-full bg-slate-900 overflow-visible mt-2 group">
                            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-l-full pointer-events-none transition-all duration-150" style={{ width: `${scoreA}%` }} />
                            <div className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-600 to-red-400 rounded-r-full pointer-events-none transition-all duration-150" style={{ width: `${scoreB}%` }} />

                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={scoreA}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setScoreA(val);
                                setScoreB(100 - val);
                              }}
                              className="absolute top-1/2 left-0 w-full -translate-y-1/2 opacity-0 cursor-pointer h-10 z-10"
                            />

                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none transition-all duration-150 group-hover:scale-125 group-active:scale-95 border-2 border-slate-800"
                              style={{ left: `calc(${scoreA}% - 12px)` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 max-w-md">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                            Live Win Probability
                          </div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/70 rounded-lg p-3">
                          <div className="flex justify-between text-[10px] font-black tracking-widest mb-2">
                            <span className="text-blue-400">
                              {teamA.name || "Team A"} ({winProb.a}%)
                            </span>
                            <span className="text-red-400">
                              ({winProb.b}%) {teamB.name || "Team B"}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${winProb.a}%` }}
                            ></div>
                            <div
                              className="h-full bg-red-500 transition-all duration-500"
                              style={{ width: `${winProb.b}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Teams */}
            <div className="bg-[#0d131c] light:bg-white rounded-2xl border border-slate-800/50 light:border-slate-200 overflow-hidden shadow-xl light:shadow-sm">
              <SectionHeader
                icon={<IconGame />}
                label="Teams"
                sub="Matchup"
                accent="#6366f1"
              />
              <div className="flex flex-col" style={{ padding: "24px", gap: "24px" }}>
                {/* Team A & B side by side */}
                <div className="flex" style={{ display: 'flex', gap: '24px' }}>
                  <div className="flex-1 bg-blue-900/10 border border-blue-900/30 rounded-xl hover:border-blue-700/40 transition-colors" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <div className="bg-blue-900/30 border border-blue-800/40 text-blue-400 shrink-0 overflow-hidden font-black text-2xl" style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {dbTeams.find((t) => t.team_name === teamA.name)
                        ?.logo_url ? (
                        <img
                          src={
                            dbTeams.find((t) => t.team_name === teamA.name)
                              .logo_url
                          }
                          alt="Logo"
                          className="w-10 h-10 object-contain drop-shadow-md"
                        />
                      ) : teamA.name ? (
                        teamA.name[0]
                      ) : (
                        "A"
                      )}
                    </div>
                    <div className="text-center w-full" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                        Team A:
                      </div>
                      <select
                        className="bg-transparent text-xs font-black text-white w-full text-center outline-none border-b border-transparent focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                        style={{ paddingBottom: '8px' }}
                        value={teamA.name}
                        onChange={(e) => handleTeamSelect("A", e.target.value)}
                      >
                        <option value="" className="text-black">
                          Select Team A
                        </option>
                        {dbTeams.map((t) => (
                          <option
                            key={t.team_id}
                            value={t.team_name}
                            className="text-black"
                          >
                            {t.team_name}
                          </option>
                        ))}
                        <option value={teamA.name} className="hidden">
                          {teamA.name}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="flex-1 bg-red-900/10 border border-red-900/30 rounded-xl hover:border-red-700/40 transition-colors" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <div className="bg-red-900/30 border border-red-800/40 text-red-400 shrink-0 overflow-hidden font-black text-2xl" style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {dbTeams.find((t) => t.team_name === teamB.name)
                        ?.logo_url ? (
                        <img
                          src={
                            dbTeams.find((t) => t.team_name === teamB.name)
                              .logo_url
                          }
                          alt="Logo"
                          className="w-10 h-10 object-contain drop-shadow-md"
                        />
                      ) : teamB.name ? (
                        teamB.name[0]
                      ) : (
                        "B"
                      )}
                    </div>
                    <div className="text-center w-full" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-red-500">
                        Team B:
                      </div>
                      <select
                        className="bg-transparent text-xs font-black text-white w-full text-center outline-none border-b border-transparent focus:border-red-500 transition-colors appearance-none cursor-pointer"
                        style={{ paddingBottom: '8px' }}
                        value={teamB.name}
                        onChange={(e) => handleTeamSelect("B", e.target.value)}
                      >
                        <option value="" className="text-black">
                          Select Team B
                        </option>
                        {dbTeams.map((t) => (
                          <option
                            key={t.team_id}
                            value={t.team_name}
                            className="text-black"
                          >
                            {t.team_name}
                          </option>
                        ))}
                        <option value={teamB.name} className="hidden">
                          {teamB.name}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Detailed Round Log & Timeouts */}
          <div className="bg-[#0d131c] light:bg-white rounded-2xl border border-slate-800/50 light:border-slate-200 overflow-hidden shadow-xl light:shadow-sm mb-5">
            <SectionHeader
              icon={<IconBroadcast />}
              label="Detailed Round Log"
              sub="Tracker"
              accent="#ec4899"
            />
            <div style={{ padding: "28px 32px 32px" }}>
              <style>{`
                @keyframes pulse-beacon { 0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.5); } 50% { box-shadow: 0 0 0 10px rgba(251,191,36,0); } }
                .round-beacon { animation: pulse-beacon 1.8s ease-in-out infinite; }
                .round-dot-input { 
                  width: 100% !important;
                  height: 100% !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  text-align: center !important;
                  border: none !important;
                  outline: none !important;
                  box-sizing: border-box !important;
                  display: block !important;
                  letter-spacing: 0 !important;
                  line-height: 1 !important;
                }
                .round-dot-input:focus { 
                  outline: 2px solid #38bdf8 !important; 
                  outline-offset: 2px; 
                  background-color: rgba(56, 189, 248, 0.15) !important;
                  box-shadow: 0 0 12px rgba(56, 189, 248, 0.5) !important;
                }
              `}</style>

              {/* Live Round Beacon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', gap: '16px' }}>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.3))' }} />
                <div className="round-beacon" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(251,191,36,0.6)', background: 'rgba(251,191,36,0.08)' }}>
                  <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: 'rgba(251,191,36,0.7)', textTransform: 'uppercase' }}>Round</span>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>{currentRoundNo}</span>
                </div>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, rgba(251,191,36,0.3))' }} />
              </div>

              {/* Team A Panel */}
              <div style={{ marginBottom: '16px', borderRadius: '14px', border: '1px solid rgba(96,165,250,0.25)', background: 'rgba(59,130,246,0.05)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(96,165,250,0.15)', background: 'rgba(59,130,246,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }} />
                    <span style={{ fontWeight: 900, fontSize: '13px', color: '#93c5fd', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{teamA.name || 'Team A'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select value={sideA} onChange={(e) => setSideA(e.target.value)} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#93c5fd', fontSize: '10px', fontWeight: 900, borderRadius: '999px', padding: '4px 12px', outline: 'none', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', appearance: 'none' }}>
                      {game === 'Valorant' ? (<><option>ATK</option><option>DEF</option></>) : (<><option>GR</option><option>BL</option></>)}
                    </select>
                    <button onClick={() => setMatchWin(matchWin === 'A' ? 'B' : 'A')} style={{ background: matchWin === 'A' ? 'rgba(34,197,94,0.2)' : 'rgba(100,116,139,0.15)', border: matchWin === 'A' ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(100,116,139,0.3)', color: matchWin === 'A' ? '#4ade80' : '#64748b', fontSize: '10px', fontWeight: 900, borderRadius: '999px', padding: '4px 14px', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s' }}>
                      {matchWin === 'A' ? 'WIN' : 'LOSS'}
                    </button>
                    <div style={{ minWidth: '40px', textAlign: 'center', fontSize: '22px', fontWeight: 900, color: '#4ade80', textShadow: '0 0 12px rgba(74,222,128,0.5)' }}>{autoScoreA}</div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  {/* Top row: Half 1 & Half 2 side-by-side */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', marginBottom: '14px' }}>
                    {[{ label: game === 'Valorant' ? 'Half 1 - Rounds 1-12' : 'Half 1 - Rounds 1-9', count: game === 'Valorant' ? 12 : 9, offset: 0, size: 36 }, { label: game === 'Valorant' ? 'Half 2 - Rounds 13-24' : 'Half 2 - Rounds 10-18', count: game === 'Valorant' ? 12 : 9, offset: game === 'Valorant' ? 12 : 9, size: 36 }].map(({ label, count, offset, size }) => (
                      <div key={label}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {Array.from({ length: count }, (_, j) => {
                            const i = offset + j;
                            const val = roundLogsA[i] || '';
                            const colorMap = { K: { bg: 'rgba(74,222,128,0.2)', border: 'rgba(74,222,128,0.6)', text: '#4ade80', glow: '0 0 8px rgba(74,222,128,0.4)' }, D: { bg: 'rgba(248,113,113,0.2)', border: 'rgba(248,113,113,0.6)', text: '#f87171', glow: '0 0 8px rgba(248,113,113,0.4)' }, P: { bg: 'rgba(167,139,250,0.2)', border: 'rgba(167,139,250,0.6)', text: '#a78bfa', glow: '0 0 8px rgba(167,139,250,0.4)' }, T: { bg: 'rgba(251,191,36,0.2)', border: 'rgba(251,191,36,0.6)', text: '#fbbf24', glow: '0 0 8px rgba(251,191,36,0.4)' } };
                            const c = colorMap[val] || { bg: 'rgba(30,41,59,0.6)', border: 'rgba(51,65,85,0.5)', text: 'transparent', glow: 'none' };
                            return (
                              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(100,116,139,0.6)', letterSpacing: '0.05em' }}>R{i + 1}</div>
                                <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '10px', background: c.bg, border: `1px solid ${c.border}`, boxShadow: c.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', cursor: 'text' }}>
                                  <input id={`round-input-A-${i}`} className="round-dot-input" type="text" maxLength="1" value={val} onChange={(e) => updateRoundEvent('A', i, e.target.value)} onFocus={(e) => e.target.select()} onKeyDown={(e) => handleRoundInputKeyDown(e, 'A', i)} style={{ width: '100%', height: '100%', padding: 0, margin: 0, textAlign: 'center', background: 'transparent', color: c.text, fontSize: '13px', fontWeight: 900, letterSpacing: '0px', lineHeight: '1', textTransform: 'uppercase', border: 'none', outline: 'none', cursor: 'text', borderRadius: '10px', boxSizing: 'border-box' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Row 2: Overtime */}
                  {[{ label: game === 'Valorant' ? 'Overtime - Rounds 25+' : 'Overtime - Rounds 19+', count: game === 'Valorant' ? 16 : 22, offset: game === 'Valorant' ? 24 : 18, size: 36 }].map(({ label, count, offset, size }) => (
                    <div key={label}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {Array.from({ length: count }, (_, j) => {
                          const i = offset + j;
                          const val = roundLogsA[i] || '';
                          const colorMap = { K: { bg: 'rgba(74,222,128,0.2)', border: 'rgba(74,222,128,0.6)', text: '#4ade80', glow: '0 0 8px rgba(74,222,128,0.4)' }, D: { bg: 'rgba(248,113,113,0.2)', border: 'rgba(248,113,113,0.6)', text: '#f87171', glow: '0 0 8px rgba(248,113,113,0.4)' }, P: { bg: 'rgba(167,139,250,0.2)', border: 'rgba(167,139,250,0.6)', text: '#a78bfa', glow: '0 0 8px rgba(167,139,250,0.4)' }, T: { bg: 'rgba(251,191,36,0.2)', border: 'rgba(251,191,36,0.6)', text: '#fbbf24', glow: '0 0 8px rgba(251,191,36,0.4)' } };
                          const c = colorMap[val] || { bg: 'rgba(30,41,59,0.6)', border: 'rgba(51,65,85,0.5)', text: 'transparent', glow: 'none' };
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(100,116,139,0.6)', letterSpacing: '0.05em' }}>R{i + 1}</div>
                              <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '10px', background: c.bg, border: `1px solid ${c.border}`, boxShadow: c.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', cursor: 'text' }}>
                                <input id={`round-input-A-${i}`} className="round-dot-input" type="text" maxLength="1" value={val} onChange={(e) => updateRoundEvent('A', i, e.target.value)} onFocus={(e) => e.target.select()} onKeyDown={(e) => handleRoundInputKeyDown(e, 'A', i)} style={{ width: '100%', height: '100%', padding: 0, margin: 0, textAlign: 'center', background: 'transparent', color: c.text, fontSize: '13px', fontWeight: 900, letterSpacing: '0px', lineHeight: '1', textTransform: 'uppercase', border: 'none', outline: 'none', cursor: 'text', borderRadius: '10px', boxSizing: 'border-box' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team B Panel */}
              <div style={{ marginBottom: '20px', borderRadius: '14px', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(239,68,68,0.05)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(248,113,113,0.15)', background: 'rgba(239,68,68,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', boxShadow: '0 0 8px #f87171' }} />
                    <span style={{ fontWeight: 900, fontSize: '13px', color: '#fca5a5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{teamB.name || 'Team B'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select value={sideB} onChange={(e) => setSideB(e.target.value)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#fca5a5', fontSize: '10px', fontWeight: 900, borderRadius: '999px', padding: '4px 12px', outline: 'none', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', appearance: 'none' }}>
                      {game === 'Valorant' ? (<><option>ATK</option><option>DEF</option></>) : (<><option>GR</option><option>BL</option></>)}
                    </select>
                    <button onClick={() => setMatchWin(matchWin === 'B' ? 'A' : 'B')} style={{ background: matchWin === 'B' ? 'rgba(34,197,94,0.2)' : 'rgba(100,116,139,0.15)', border: matchWin === 'B' ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(100,116,139,0.3)', color: matchWin === 'B' ? '#4ade80' : '#64748b', fontSize: '10px', fontWeight: 900, borderRadius: '999px', padding: '4px 14px', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s' }}>
                      {matchWin === 'B' ? 'WIN' : 'LOSS'}
                    </button>
                    <div style={{ minWidth: '40px', textAlign: 'center', fontSize: '22px', fontWeight: 900, color: '#f87171', textShadow: '0 0 12px rgba(248,113,113,0.5)' }}>{autoScoreB}</div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  {/* Top row: Half 1 & Half 2 side-by-side */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', marginBottom: '14px' }}>
                    {[{ label: game === 'Valorant' ? 'Half 1 - Rounds 1-12' : 'Half 1 - Rounds 1-9', count: game === 'Valorant' ? 12 : 9, offset: 0, size: 36 }, { label: game === 'Valorant' ? 'Half 2 - Rounds 13-24' : 'Half 2 - Rounds 10-18', count: game === 'Valorant' ? 12 : 9, offset: game === 'Valorant' ? 12 : 9, size: 36 }].map(({ label, count, offset, size }) => (
                      <div key={label}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {Array.from({ length: count }, (_, j) => {
                            const i = offset + j;
                            const val = roundLogsB[i] || '';
                            const colorMap = { K: { bg: 'rgba(244,114,182,0.2)', border: 'rgba(244,114,182,0.6)', text: '#f472b6', glow: '0 0 8px rgba(244,114,182,0.4)' }, D: { bg: 'rgba(248,113,113,0.2)', border: 'rgba(248,113,113,0.6)', text: '#f87171', glow: '0 0 8px rgba(248,113,113,0.4)' }, P: { bg: 'rgba(167,139,250,0.2)', border: 'rgba(167,139,250,0.6)', text: '#a78bfa', glow: '0 0 8px rgba(167,139,250,0.4)' }, T: { bg: 'rgba(251,191,36,0.2)', border: 'rgba(251,191,36,0.6)', text: '#fbbf24', glow: '0 0 8px rgba(251,191,36,0.4)' } };
                            const c = colorMap[val] || { bg: 'rgba(30,41,59,0.6)', border: 'rgba(51,65,85,0.5)', text: 'transparent', glow: 'none' };
                            return (
                              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(100,116,139,0.6)', letterSpacing: '0.05em' }}>R{i + 1}</div>
                                <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '10px', background: c.bg, border: `1px solid ${c.border}`, boxShadow: c.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', cursor: 'text' }}>
                                  <input id={`round-input-B-${i}`} className="round-dot-input" type="text" maxLength="1" value={val} onChange={(e) => updateRoundEvent('B', i, e.target.value)} onFocus={(e) => e.target.select()} onKeyDown={(e) => handleRoundInputKeyDown(e, 'B', i)} style={{ width: '100%', height: '100%', padding: 0, margin: 0, textAlign: 'center', background: 'transparent', color: c.text, fontSize: '13px', fontWeight: 900, letterSpacing: '0px', lineHeight: '1', textTransform: 'uppercase', border: 'none', outline: 'none', cursor: 'text', borderRadius: '10px', boxSizing: 'border-box' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Row 2: Overtime */}
                  {[{ label: game === 'Valorant' ? 'Overtime - Rounds 25+' : 'Overtime - Rounds 19+', count: game === 'Valorant' ? 16 : 22, offset: game === 'Valorant' ? 24 : 18, size: 36 }].map(({ label, count, offset, size }) => (
                    <div key={label}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {Array.from({ length: count }, (_, j) => {
                          const i = offset + j;
                          const val = roundLogsB[i] || '';
                          const colorMap = { K: { bg: 'rgba(244,114,182,0.2)', border: 'rgba(244,114,182,0.6)', text: '#f472b6', glow: '0 0 8px rgba(244,114,182,0.4)' }, D: { bg: 'rgba(248,113,113,0.2)', border: 'rgba(248,113,113,0.6)', text: '#f87171', glow: '0 0 8px rgba(248,113,113,0.4)' }, P: { bg: 'rgba(167,139,250,0.2)', border: 'rgba(167,139,250,0.6)', text: '#a78bfa', glow: '0 0 8px rgba(167,139,250,0.4)' }, T: { bg: 'rgba(251,191,36,0.2)', border: 'rgba(251,191,36,0.6)', text: '#fbbf24', glow: '0 0 8px rgba(251,191,36,0.4)' } };
                          const c = colorMap[val] || { bg: 'rgba(30,41,59,0.6)', border: 'rgba(51,65,85,0.5)', text: 'transparent', glow: 'none' };
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(100,116,139,0.6)', letterSpacing: '0.05em' }}>R{i + 1}</div>
                              <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '10px', background: c.bg, border: `1px solid ${c.border}`, boxShadow: c.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', cursor: 'text' }}>
                                <input id={`round-input-B-${i}`} className="round-dot-input" type="text" maxLength="1" value={val} onChange={(e) => updateRoundEvent('B', i, e.target.value)} onFocus={(e) => e.target.select()} onKeyDown={(e) => handleRoundInputKeyDown(e, 'B', i)} style={{ width: '100%', height: '100%', padding: 0, margin: 0, textAlign: 'center', background: 'transparent', color: c.text, fontSize: '13px', fontWeight: 900, letterSpacing: '0px', lineHeight: '1', textTransform: 'uppercase', border: 'none', outline: 'none', cursor: 'text', borderRadius: '10px', boxSizing: 'border-box' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend + Timeouts + Special Rows */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '4px' }}>
                <div style={{ borderRadius: '12px', border: '1px solid rgba(51,65,85,0.5)', background: 'rgba(15,23,42,0.5)', padding: '16px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(100,116,139,0.8)', textTransform: 'uppercase', marginBottom: '12px' }}>Key Legend</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[['K', '#4ade80', 'Kill / Round Win'], ['D', '#f87171', 'Death / Round Loss'], ['P', '#a78bfa', 'Plant'], ['T', '#fbbf24', 'Time']].map(([key, color, label]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${color}22`, border: `1px solid ${color}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>{key}</div>
                        <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.8)', fontWeight: 600 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ borderRadius: '12px', border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(251,191,36,0.04)', padding: '16px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(251,191,36,0.7)', textTransform: 'uppercase', marginBottom: '12px' }}>Timeout Status</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[['A', timeoutA, teamA.name || 'Team A'], ['B', timeoutB, teamB.name || 'Team B']].map(([team, tval, tname]) => (
                      <div key={team} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: team === 'A' ? '#93c5fd' : '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tname}</span>
                        <button onClick={() => handleTimeoutChange(team, tval === 'AVAILABLE' ? 'USED' : 'AVAILABLE')} style={{ flexShrink: 0, borderRadius: '999px', padding: '5px 14px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', border: tval === 'AVAILABLE' ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(239,68,68,0.5)', background: tval === 'AVAILABLE' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: tval === 'AVAILABLE' ? '#4ade80' : '#f87171', transition: 'all 0.2s' }}>
                          {tval}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ borderRadius: '12px', border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.03)', padding: '16px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(167,139,250,0.7)', textTransform: 'uppercase', marginBottom: '12px' }}>Special Rounds</div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(251,191,36,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Timeouts</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Array.from({ length: 12 }, (_, i) => { const val = timeoutRowLogs[i] || ''; return (<div key={i} style={{ width: '26px', height: '26px', borderRadius: '6px', background: val ? 'rgba(251,191,36,0.2)' : 'rgba(30,41,59,0.5)', border: val ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(51,65,85,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><input id={`round-input-T-${i}`} className="round-dot-input" type="text" maxLength="1" value={val} onChange={(e) => { const logs = [...timeoutRowLogs]; logs[i] = e.target.value.toUpperCase().slice(-1); setTimeoutRowLogs(logs); }} onFocus={(e) => e.target.select()} onKeyDown={(e) => handleRoundInputKeyDown(e, 'T', i)} style={{ width: '100%', height: '100%', textAlign: 'center', background: 'transparent', color: val ? '#fbbf24' : 'transparent', fontSize: '11px', fontWeight: 900, border: 'none', outline: 'none', cursor: 'text', borderRadius: '6px' }} /></div>); })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(167,139,250,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Dead Rounds</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Array.from({ length: 12 }, (_, i) => { const val = deadRoundRowLogs[i] || ''; return (<div key={i} style={{ width: '26px', height: '26px', borderRadius: '6px', background: val ? 'rgba(167,139,250,0.2)' : 'rgba(30,41,59,0.5)', border: val ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(51,65,85,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><input id={`round-input-D-${i}`} className="round-dot-input" type="text" maxLength="1" value={val} onChange={(e) => { const logs = [...deadRoundRowLogs]; logs[i] = e.target.value.toUpperCase().slice(-1); setDeadRoundRowLogs(logs); }} onFocus={(e) => e.target.select()} onKeyDown={(e) => handleRoundInputKeyDown(e, 'D', i)} style={{ width: '100%', height: '100%', textAlign: 'center', background: 'transparent', color: val ? '#a78bfa' : 'transparent', fontSize: '11px', fontWeight: 900, border: 'none', outline: 'none', cursor: 'text', borderRadius: '6px' }} /></div>); })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Side-by-Side: Player Stats (Left) & Heatmap Entry + Submit (Right) ── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
            {/* ── Left Column: Player Stats ── */}
            <div className="xl:col-span-7 flex flex-col gap-6 w-full min-w-0">
              <div className="bg-[#0d131c] light:bg-white rounded-2xl border border-slate-800/50 light:border-slate-200 overflow-hidden shadow-xl light:shadow-sm w-full">
                <SectionHeader
                  icon={<IconStats />}
                  label="Player Stats"
                  sub="Per-Player Input Cards"
                  accent="#8b5cf6"
                />
                <div className="p-3 sm:p-4 md:p-5">
                  {/* ── Team A Players ── */}
                  <div className="flex flex-col gap-2">
                    {playersA.map((p, idx) => (
                      <div
                        key={`a-${idx}`}
                        className="rounded-xl border border-slate-700/40 light:border-slate-200 bg-slate-900/40 light:bg-slate-50 hover:border-slate-600 light:hover:border-slate-300 transition-all group px-3 py-2 sm:px-3.5 sm:py-2.5"
                      >
                        {game === "Valorant" ? (
                          <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2">
                            {/* Player IGN */}
                            <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
                              <div className="w-6 h-6 rounded-md bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[10px] font-black text-[#38bdf8] shrink-0">
                                {idx + 1}
                              </div>
                              <select
                                className="bg-transparent text-[#38bdf8] light:text-blue-600 text-xs font-black outline-none cursor-pointer appearance-none w-20 sm:w-24 md:w-28 truncate"
                                value={p.ign}
                                onChange={(e) => updatePlayer("A", idx, "ign", e.target.value)}
                              >
                                <option value="" className="text-black">Select Player</option>
                                {dbPlayers
                                  .filter((dbP) => {
                                    const team = dbTeams.find((t) => t.team_name === teamA.name);
                                    return team ? dbP.team_id === team.team_id : true;
                                  })
                                  .map((dbP) => (
                                    <option key={dbP.player_id} value={dbP.player_name} className="text-black">{dbP.player_name}</option>
                                  ))}
                                <option value={p.ign} className="hidden">{p.ign}</option>
                              </select>
                            </div>
                            {/* Agent */}
                            <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-700/50 border border-slate-600/40 flex items-center justify-center text-[8px] font-bold text-slate-400 shrink-0 shadow-sm">
                                {p.agent && getAgentImagePath(p.agent) ? (
                                  <img
                                    src={getAgentImagePath(p.agent)}
                                    alt={p.agent}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'inline';
                                    }}
                                  />
                                ) : null}
                                <span style={{ display: p.agent && getAgentImagePath(p.agent) ? 'none' : 'inline' }}>
                                  {p.agent ? p.agent[0] : ""}
                                </span>
                              </div>
                              <select
                                className="bg-transparent text-white light:text-slate-900 text-xs font-bold outline-none cursor-pointer appearance-none w-16 sm:w-20"
                                value={p.agent}
                                onChange={(e) => updatePlayer("A", idx, "agent", e.target.value)}
                              >
                                {agents.map((a) => (<option key={a} value={a}>{a}</option>))}
                              </select>
                            </div>
                            {/* Divider */}
                            <div className="w-px h-5 bg-slate-700/50 light:bg-slate-300 flex-shrink-0 hidden md:block"></div>
                            {/* Performance score */}
                            <div className="flex flex-col items-center w-9 sm:w-10 flex-shrink-0">
                              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center truncate w-full" title="Performance Score">Perf</span>
                              <input
                                type="number"
                                className={`${tableInput} text-emerald-400 light:text-emerald-600 !w-full text-center text-xs font-bold`}
                                value={p.acs !== undefined ? p.acs : ""}
                                placeholder="0"
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => e.target.select()}
                                onChange={(e) => handleStatChange("A", idx, "acs", e.target.value)}
                                onBlur={(e) => handleStatBlur("A", idx, "acs", e)}
                              />
                            </div>
                            {/* K / D / A */}
                            <div className="flex items-end rounded-lg bg-slate-800/40 light:bg-slate-100 border border-slate-700/30 light:border-slate-200 px-2 sm:px-2.5 py-1 gap-1 sm:gap-1.5 flex-shrink-0">
                              <div className="flex flex-col items-center w-10 sm:w-11">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-500 uppercase text-center tracking-wider">K</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs sm:text-sm font-bold`}
                                  value={p.k !== undefined ? p.k : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("A", idx, "k", e.target.value)}
                                  onBlur={(e) => handleStatBlur("A", idx, "k", e)}
                                />
                              </div>
                              <span className="text-slate-500 light:text-slate-400 text-xs sm:text-sm font-bold self-end mb-1">/</span>
                              <div className="flex flex-col items-center w-10 sm:w-11">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-500 uppercase text-center tracking-wider">D</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs sm:text-sm font-bold`}
                                  value={p.d !== undefined ? p.d : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("A", idx, "d", e.target.value)}
                                  onBlur={(e) => handleStatBlur("A", idx, "d", e)}
                                />
                              </div>
                              <span className="text-slate-500 light:text-slate-400 text-xs sm:text-sm font-bold self-end mb-1">/</span>
                              <div className="flex flex-col items-center w-10 sm:w-11">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-500 uppercase text-center tracking-wider">A</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs sm:text-sm font-bold`}
                                  value={p.a !== undefined ? p.a : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("A", idx, "a", e.target.value)}
                                  onBlur={(e) => handleStatBlur("A", idx, "a", e)}
                                />
                              </div>
                            </div>
                            {/* Divider */}
                            <div className="w-px h-5 bg-slate-700/50 light:bg-slate-300 flex-shrink-0 hidden md:block"></div>
                            {/* Trades / FB / Plant / Defuse (Equal 4-Column Sizing) */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                              <div className="flex flex-col items-center w-9 sm:w-10">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center">Trades</span>
                                <input
                                  type="number"
                                  className={`${tableInput} text-emerald-400 light:text-emerald-600 !w-full text-center text-xs font-bold`}
                                  value={p.econ !== undefined ? p.econ : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("A", idx, "econ", e.target.value)}
                                  onBlur={(e) => handleStatBlur("A", idx, "econ", e)}
                                />
                              </div>
                              <div className="flex flex-col items-center w-9 sm:w-10">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center">FB</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs font-bold`}
                                  value={p.first_kills !== undefined ? p.first_kills : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("A", idx, "first_kills", e.target.value)}
                                  onBlur={(e) => handleStatBlur("A", idx, "first_kills", e)}
                                />
                              </div>
                              <div className="flex flex-col items-center w-9 sm:w-10">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center">Plant</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs font-bold`}
                                  value={p.plants !== undefined ? p.plants : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("A", idx, "plants", e.target.value)}
                                  onBlur={(e) => handleStatBlur("A", idx, "plants", e)}
                                />
                              </div>
                              <div className="flex flex-col items-center w-9 sm:w-10">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center">Defuse</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs font-bold`}
                                  value={p.defuse !== undefined ? p.defuse : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("A", idx, "defuse", e.target.value)}
                                  onBlur={(e) => handleStatBlur("A", idx, "defuse", e)}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Crossfire card layout */
                          <div className="min-w-fit flex items-center gap-3">
                            {/* Player IGN */}
                            <div className="flex items-center gap-2 min-w-[130px] flex-shrink-0">
                              <div className="w-7 h-7 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[10px] font-black text-[#38bdf8] shrink-0">
                                {idx + 1}
                              </div>
                              <select
                                className="bg-transparent text-[#38bdf8] light:text-blue-600 text-xs font-black outline-none cursor-pointer appearance-none w-28 sm:w-32 truncate"
                                value={p.ign}
                                onChange={(e) => updatePlayer("A", idx, "ign", e.target.value)}
                              >
                                <option value="" className="text-black">Select Player</option>
                                {dbPlayers
                                  .filter((dbP) => {
                                    const team = dbTeams.find((t) => t.team_name === teamA.name);
                                    return team ? dbP.team_id === team.team_id : true;
                                  })
                                  .map((dbP) => (
                                    <option key={dbP.player_id} value={dbP.player_name} className="text-black">{dbP.player_name}</option>
                                  ))}
                                <option value={p.ign} className="hidden">{p.ign}</option>
                              </select>
                            </div>
                            <div className="w-px h-6 bg-slate-700/50 light:bg-slate-300 hidden md:block"></div>
                            {cfGroups.map((g) => {
                              if (g.isTotal) {
                                return (
                                  <div key={g.id} className="flex items-end rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 gap-1.5 flex-shrink-0">
                                    <div className="flex flex-col items-center min-w-[34px]">
                                      <span className="text-[8px] font-bold text-emerald-500/70 uppercase">K</span>
                                      <span className="text-xs font-black text-white text-center">{getCfTotal(p, "k")}</span>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[34px]">
                                      <span className="text-[8px] font-bold text-emerald-500/70 uppercase">D</span>
                                      <span className="text-xs font-black text-white text-center">{getCfTotal(p, "d")}</span>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[34px]">
                                      <span className="text-[8px] font-bold text-emerald-500/70 uppercase">A</span>
                                      <span className="text-xs font-black text-white text-center">{getCfTotal(p, "a")}</span>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[34px]">
                                      <span className="text-[8px] font-bold text-[#00ffcc]/70 uppercase">H</span>
                                      <span className="text-xs font-black text-[#00ffcc] text-center">{getCfTotal(p, "h")}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={g.id} className="flex items-end rounded-lg bg-slate-800/40 light:bg-slate-100 border border-slate-700/30 light:border-slate-200 px-2 py-1 gap-1 flex-shrink-0">
                                  <div className="text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider self-center mr-1 max-w-[70px] truncate" title={g.label}>{g.label}</div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">K</span>
                                    <input
                                      type="number"
                                      className={`${tableInput} !w-11 text-center`}
                                      value={p[`${g.id}_k`] !== undefined ? p[`${g.id}_k`] : ""}
                                      placeholder="0"
                                      onFocus={(e) => e.target.select()}
                                      onClick={(e) => e.target.select()}
                                      onChange={(e) => handleStatChange("A", idx, `${g.id}_k`, e.target.value)}
                                      onBlur={(e) => handleStatBlur("A", idx, `${g.id}_k`, e)}
                                    />
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">D</span>
                                    <input
                                      type="number"
                                      className={`${tableInput} !w-11 text-center`}
                                      value={p[`${g.id}_d`] !== undefined ? p[`${g.id}_d`] : ""}
                                      placeholder="0"
                                      onFocus={(e) => e.target.select()}
                                      onClick={(e) => e.target.select()}
                                      onChange={(e) => handleStatChange("A", idx, `${g.id}_d`, e.target.value)}
                                      onBlur={(e) => handleStatBlur("A", idx, `${g.id}_d`, e)}
                                    />
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">A</span>
                                    <input
                                      type="number"
                                      className={`${tableInput} !w-11 text-center`}
                                      value={p[`${g.id}_a`] !== undefined ? p[`${g.id}_a`] : ""}
                                      placeholder="0"
                                      onFocus={(e) => e.target.select()}
                                      onClick={(e) => e.target.select()}
                                      onChange={(e) => handleStatChange("A", idx, `${g.id}_a`, e.target.value)}
                                      onBlur={(e) => handleStatBlur("A", idx, `${g.id}_a`, e)}
                                    />
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-[#00ffcc]/70 uppercase">H</span>
                                    <input
                                      type="number"
                                      className={`${tableInput} text-[#00ffcc] !w-11 text-center`}
                                      value={p[`${g.id}_h`] !== undefined ? p[`${g.id}_h`] : ""}
                                      placeholder="0"
                                      onFocus={(e) => e.target.select()}
                                      onClick={(e) => e.target.select()}
                                      onChange={(e) => handleStatChange("A", idx, `${g.id}_h`, e.target.value)}
                                      onBlur={(e) => handleStatBlur("A", idx, `${g.id}_h`, e)}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* ── Separator ── */}
                  <div className="flex items-center my-4 gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">vs</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
                  </div>

                  {/* ── Team B Players ── */}
                  <div className="flex flex-col gap-2">
                    {playersB.map((p, idx) => (
                      <div
                        key={`b-${idx}`}
                        className="rounded-xl border border-slate-700/40 light:border-slate-200 bg-slate-900/40 light:bg-slate-50 hover:border-slate-600 light:hover:border-slate-300 transition-all group px-3 py-2 sm:px-3.5 sm:py-2.5"
                      >
                        {game === "Valorant" ? (
                          <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2">
                            {/* Player IGN */}
                            <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
                              <div className="w-6 h-6 rounded-md bg-[#f87171]/10 border border-[#f87171]/30 flex items-center justify-center text-[10px] font-black text-[#f87171] shrink-0">
                                {idx + 1}
                              </div>
                              <select
                                className="bg-transparent text-[#f87171] light:text-red-600 text-xs font-black outline-none cursor-pointer appearance-none w-20 sm:w-24 md:w-28 truncate"
                                value={p.ign}
                                onChange={(e) => updatePlayer("B", idx, "ign", e.target.value)}
                              >
                                <option value="" className="text-black">Select Player</option>
                                {dbPlayers
                                  .filter((dbP) => {
                                    const team = dbTeams.find((t) => t.team_name === teamB.name);
                                    return team ? dbP.team_id === team.team_id : true;
                                  })
                                  .map((dbP) => (
                                    <option key={dbP.player_id} value={dbP.player_name} className="text-black">{dbP.player_name}</option>
                                  ))}
                                <option value={p.ign} className="hidden">{p.ign}</option>
                              </select>
                            </div>
                            {/* Agent */}
                            <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-700/50 border border-slate-600/40 flex items-center justify-center text-[8px] font-bold text-slate-400 shrink-0 shadow-sm">
                                {p.agent && getAgentImagePath(p.agent) ? (
                                  <img
                                    src={getAgentImagePath(p.agent)}
                                    alt={p.agent}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'inline';
                                    }}
                                  />
                                ) : null}
                                <span style={{ display: p.agent && getAgentImagePath(p.agent) ? 'none' : 'inline' }}>
                                  {p.agent ? p.agent[0] : ""}
                                </span>
                              </div>
                              <select
                                className="bg-transparent text-white light:text-slate-900 text-xs font-bold outline-none cursor-pointer appearance-none w-16 sm:w-20"
                                value={p.agent}
                                onChange={(e) => updatePlayer("B", idx, "agent", e.target.value)}
                              >
                                {agents.map((a) => (<option key={a} value={a}>{a}</option>))}
                              </select>
                            </div>
                            {/* Divider */}
                            <div className="w-px h-5 bg-slate-700/50 light:bg-slate-300 flex-shrink-0 hidden md:block"></div>
                            {/* Performance score */}
                            <div className="flex flex-col items-center w-9 sm:w-10 flex-shrink-0">
                              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center truncate w-full" title="Performance Score">Perf</span>
                              <input
                                type="number"
                                className={`${tableInput} text-[#f87171] light:text-red-600 !w-full text-center text-xs font-bold`}
                                value={p.acs !== undefined ? p.acs : ""}
                                placeholder="0"
                                onFocus={(e) => e.target.select()}
                                onClick={(e) => e.target.select()}
                                onChange={(e) => handleStatChange("B", idx, "acs", e.target.value)}
                                onBlur={(e) => handleStatBlur("B", idx, "acs", e)}
                              />
                            </div>
                            {/* K / D / A */}
                            <div className="flex items-end rounded-lg bg-slate-800/40 light:bg-slate-100 border border-slate-700/30 light:border-slate-200 px-2 sm:px-2.5 py-1 gap-1 sm:gap-1.5 flex-shrink-0">
                              <div className="flex flex-col items-center w-10 sm:w-11">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-500 uppercase text-center tracking-wider">K</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs sm:text-sm font-bold`}
                                  value={p.k !== undefined ? p.k : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("B", idx, "k", e.target.value)}
                                  onBlur={(e) => handleStatBlur("B", idx, "k", e)}
                                />
                              </div>
                              <span className="text-slate-500 light:text-slate-400 text-xs sm:text-sm font-bold self-end mb-1">/</span>
                              <div className="flex flex-col items-center w-10 sm:w-11">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-500 uppercase text-center tracking-wider">D</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs sm:text-sm font-bold`}
                                  value={p.d !== undefined ? p.d : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("B", idx, "d", e.target.value)}
                                  onBlur={(e) => handleStatBlur("B", idx, "d", e)}
                                />
                              </div>
                              <span className="text-slate-500 light:text-slate-400 text-xs sm:text-sm font-bold self-end mb-1">/</span>
                              <div className="flex flex-col items-center w-10 sm:w-11">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-500 uppercase text-center tracking-wider">A</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs sm:text-sm font-bold`}
                                  value={p.a !== undefined ? p.a : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("B", idx, "a", e.target.value)}
                                  onBlur={(e) => handleStatBlur("B", idx, "a", e)}
                                />
                              </div>
                            </div>
                            {/* Divider */}
                            <div className="w-px h-5 bg-slate-700/50 light:bg-slate-300 flex-shrink-0 hidden md:block"></div>
                            {/* Trades / FB / Plant / Defuse (Equal 4-Column Sizing) */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                              <div className="flex flex-col items-center w-9 sm:w-10">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center">Trades</span>
                                <input
                                  type="number"
                                  className={`${tableInput} text-[#f87171] light:text-red-600 !w-full text-center text-xs font-bold`}
                                  value={p.econ !== undefined ? p.econ : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("B", idx, "econ", e.target.value)}
                                  onBlur={(e) => handleStatBlur("B", idx, "econ", e)}
                                />
                              </div>
                              <div className="flex flex-col items-center w-9 sm:w-10">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center">FB</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs font-bold`}
                                  value={p.first_kills !== undefined ? p.first_kills : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("B", idx, "first_kills", e.target.value)}
                                  onBlur={(e) => handleStatBlur("B", idx, "first_kills", e)}
                                />
                              </div>
                              <div className="flex flex-col items-center w-9 sm:w-10">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center">Plant</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs font-bold`}
                                  value={p.plants !== undefined ? p.plants : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("B", idx, "plants", e.target.value)}
                                  onBlur={(e) => handleStatBlur("B", idx, "plants", e)}
                                />
                              </div>
                              <div className="flex flex-col items-center w-9 sm:w-10">
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider text-center">Defuse</span>
                                <input
                                  type="number"
                                  className={`${tableInput} !w-full text-center text-xs font-bold`}
                                  value={p.defuse !== undefined ? p.defuse : ""}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  onClick={(e) => e.target.select()}
                                  onChange={(e) => handleStatChange("B", idx, "defuse", e.target.value)}
                                  onBlur={(e) => handleStatBlur("B", idx, "defuse", e)}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Crossfire card layout */
                          <div className="min-w-fit flex items-center gap-3">
                            {/* Player IGN */}
                            <div className="flex items-center gap-2 min-w-[130px] flex-shrink-0">
                              <div className="w-7 h-7 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 flex items-center justify-center text-[10px] font-black text-[#f87171] shrink-0">
                                {idx + 1}
                              </div>
                              <select
                                className="bg-transparent text-[#f87171] light:text-red-600 text-xs font-black outline-none cursor-pointer appearance-none w-28 sm:w-32 truncate"
                                value={p.ign}
                                onChange={(e) => updatePlayer("B", idx, "ign", e.target.value)}
                              >
                                <option value="" className="text-black">Select Player</option>
                                {dbPlayers
                                  .filter((dbP) => {
                                    const team = dbTeams.find((t) => t.team_name === teamB.name);
                                    return team ? dbP.team_id === team.team_id : true;
                                  })
                                  .map((dbP) => (
                                    <option key={dbP.player_id} value={dbP.player_name} className="text-black">{dbP.player_name}</option>
                                  ))}
                                <option value={p.ign} className="hidden">{p.ign}</option>
                              </select>
                            </div>
                            <div className="w-px h-6 bg-slate-700/50 light:bg-slate-300 hidden md:block"></div>
                            {cfGroups.map((g) => {
                              if (g.isTotal) {
                                return (
                                  <div key={g.id} className="flex items-end rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 gap-1.5 flex-shrink-0">
                                    <div className="flex flex-col items-center min-w-[34px]">
                                      <span className="text-[8px] font-bold text-emerald-500/70 uppercase">K</span>
                                      <span className="text-xs font-black text-white text-center">{getCfTotal(p, "k")}</span>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[34px]">
                                      <span className="text-[8px] font-bold text-emerald-500/70 uppercase">D</span>
                                      <span className="text-xs font-black text-white text-center">{getCfTotal(p, "d")}</span>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[34px]">
                                      <span className="text-[8px] font-bold text-emerald-500/70 uppercase">A</span>
                                      <span className="text-xs font-black text-white text-center">{getCfTotal(p, "a")}</span>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[34px]">
                                      <span className="text-[8px] font-bold text-[#00ffcc]/70 uppercase">H</span>
                                      <span className="text-xs font-black text-[#00ffcc] text-center">{getCfTotal(p, "h")}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={g.id} className="flex items-end rounded-lg bg-slate-800/40 light:bg-slate-100 border border-slate-700/30 light:border-slate-200 px-2 py-1 gap-1 flex-shrink-0">
                                  <div className="text-[9px] font-bold text-slate-400 light:text-slate-600 uppercase tracking-wider self-center mr-1 max-w-[70px] truncate" title={g.label}>{g.label}</div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">K</span>
                                    <input
                                      type="number"
                                      className={`${tableInput} !w-11 text-center`}
                                      value={p[`${g.id}_k`] !== undefined ? p[`${g.id}_k`] : ""}
                                      placeholder="0"
                                      onFocus={(e) => e.target.select()}
                                      onClick={(e) => e.target.select()}
                                      onChange={(e) => handleStatChange("B", idx, `${g.id}_k`, e.target.value)}
                                      onBlur={(e) => handleStatBlur("B", idx, `${g.id}_k`, e)}
                                    />
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">D</span>
                                    <input
                                      type="number"
                                      className={`${tableInput} !w-11 text-center`}
                                      value={p[`${g.id}_d`] !== undefined ? p[`${g.id}_d`] : ""}
                                      placeholder="0"
                                      onFocus={(e) => e.target.select()}
                                      onClick={(e) => e.target.select()}
                                      onChange={(e) => handleStatChange("B", idx, `${g.id}_d`, e.target.value)}
                                      onBlur={(e) => handleStatBlur("B", idx, `${g.id}_d`, e)}
                                    />
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">A</span>
                                    <input
                                      type="number"
                                      className={`${tableInput} !w-11 text-center`}
                                      value={p[`${g.id}_a`] !== undefined ? p[`${g.id}_a`] : ""}
                                      placeholder="0"
                                      onFocus={(e) => e.target.select()}
                                      onClick={(e) => e.target.select()}
                                      onChange={(e) => handleStatChange("B", idx, `${g.id}_a`, e.target.value)}
                                      onBlur={(e) => handleStatBlur("B", idx, `${g.id}_a`, e)}
                                    />
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-[#00ffcc]/70 uppercase">H</span>
                                    <input
                                      type="number"
                                      className={`${tableInput} text-[#00ffcc] !w-11 text-center`}
                                      value={p[`${g.id}_h`] !== undefined ? p[`${g.id}_h`] : ""}
                                      placeholder="0"
                                      onFocus={(e) => e.target.select()}
                                      onClick={(e) => e.target.select()}
                                      onChange={(e) => handleStatChange("B", idx, `${g.id}_h`, e.target.value)}
                                      onBlur={(e) => handleStatBlur("B", idx, `${g.id}_h`, e)}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Crossfire: Add Stats Group button */}
                  {game === "Crossfire" && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/40 light:border-slate-200">
                      <div className="flex items-center gap-2 flex-wrap">
                        {cfGroups.filter(g => !g.isTotal).map(g => (
                          <div key={g.id} className="flex items-center bg-slate-800/50 rounded-lg border border-slate-700/40 px-2.5 py-1.5 gap-1.5">
                            <input
                              type="text"
                              className="bg-transparent text-[10px] font-bold text-slate-300 uppercase tracking-wider outline-none w-20"
                              value={g.label}
                              onChange={(e) => handleUpdateCfGroupLabel(g.id, e.target.value)}
                            />
                            <button onClick={() => handleRemoveCfGroup(g.id)} className="text-red-500/60 hover:text-red-400 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleAddCfGroup}
                        className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-4 py-2 rounded-lg border border-slate-700 transition-colors whitespace-nowrap font-bold"
                      >
                        + ADD STATS GROUP
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right Column: Heatmap Entry & Submit ── */}
            <div className="xl:col-span-5 flex flex-col gap-6 w-full min-w-0">
              {/* Heatmap Entry Card */}
              <div className="bg-[#0d131c] light:bg-white rounded-2xl border border-slate-800/50 light:border-slate-200 overflow-hidden shadow-xl light:shadow-sm w-full">
                <SectionHeader
                  icon={<IconMap />}
                  label="Heatmap Entry"
                  sub="Event Coordinate Plotting"
                  accent="#06b6d4"
                />
                <div className="flex flex-col p-4 sm:p-6">
                  {/* ── Compact Toolbar ── */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 rounded-xl bg-slate-900/60 light:bg-slate-100 border border-slate-700/40 light:border-slate-200 backdrop-blur-sm p-3 sm:px-4 sm:py-3">
                    {/* Round Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Round</span>
                      <div className="relative">
                        <select
                          className="appearance-none bg-slate-800/70 light:bg-white border border-slate-600/50 light:border-slate-300 text-cyan-400 light:text-cyan-600 text-xs font-black rounded-lg outline-none focus:border-cyan-500 transition-colors cursor-pointer pl-3 pr-7 py-1.5"
                          value={selectedRound}
                          onChange={(e) => setSelectedRound(Number(e.target.value))}
                        >
                          {Array.from({ length: scoreA + scoreB || 1 }, (_, i) => i + 1).map((r) => (
                            <option key={r} value={r}>R{r}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▾</div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-slate-700/50 light:bg-slate-300 hidden sm:block"></div>

                    {/* Action Toggle */}
                    <div className="flex items-center rounded-lg overflow-hidden border border-slate-700/50 light:border-slate-300">
                      <button
                        onClick={() => setSelectedAction("Plant")}
                        className={`text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 sm:px-4 ${selectedAction === "Plant"
                          ? "bg-red-500/20 text-red-400 light:text-red-600 shadow-[inset_0_0_12px_rgba(239,68,68,0.15)]"
                          : "bg-transparent text-slate-500 hover:text-slate-300"}`}
                      >
                        ● Plant
                      </button>
                      <button
                        onClick={() => setSelectedAction("Defuse")}
                        className={`text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 sm:px-4 ${selectedAction === "Defuse"
                          ? "bg-blue-500/20 text-blue-400 light:text-blue-600 shadow-[inset_0_0_12px_rgba(59,130,246,0.15)]"
                          : "bg-transparent text-slate-500 hover:text-slate-300"}`}
                      >
                        ● Defuse
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-slate-700/50 light:bg-slate-300 hidden sm:block"></div>

                    {/* Manual Coords */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        className="bg-slate-800/60 light:bg-white border border-slate-700/50 light:border-slate-300 text-white light:text-slate-900 text-[10px] font-bold text-center rounded-md outline-none focus:border-cyan-500 transition-colors w-12 py-1 px-1"
                        placeholder="X%"
                        value={manualX}
                        onChange={(e) => setManualX(e.target.value)}
                      />
                      <input
                        type="number"
                        className="bg-slate-800/60 light:bg-white border border-slate-700/50 light:border-slate-300 text-white light:text-slate-900 text-[10px] font-bold text-center rounded-md outline-none focus:border-cyan-500 transition-colors w-12 py-1 px-1"
                        placeholder="Y%"
                        value={manualY}
                        onChange={(e) => setManualY(e.target.value)}
                      />
                      <button
                        onClick={handleManualAdd}
                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-black text-[9px] uppercase tracking-wider rounded-md border border-cyan-500/30 transition-all px-3 py-1"
                      >
                        +Add
                      </button>
                    </div>

                    {/* Events Counter Badge */}
                    {heatmapData.filter((h) => h.round === selectedRound).length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {heatmapData.filter((h) => h.round === selectedRound).map((h) => (
                          <button
                            key={h.id}
                            onClick={() => removeHeatmapEvent(h.id)}
                            className={`group/ev flex items-center rounded-full text-[8px] font-bold transition-all px-2 py-0.5 gap-1 ${h.type === "Plant"
                              ? "bg-red-500/15 text-red-400 border border-red-500/30"
                              : "bg-blue-500/15 text-blue-400 border border-blue-500/30"}`}
                            title={`${h.type} at (${Math.round(h.x)}%, ${Math.round(h.y)}%) — click to remove`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${h.type === "Plant" ? "bg-red-400" : "bg-blue-400"}`}></span>
                            {h.type[0]}
                            <span className="hidden group-hover/ev:inline text-red-400 ml-0.5">✕</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Map Area ── */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-700/40 light:border-slate-300 bg-[#080c12] light:bg-slate-100 shadow-[0_0_40px_rgba(6,182,212,0.06)] flex items-center justify-center p-2 sm:p-4">
                    {/* Subtle corner glow */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none rounded-tl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/5 to-transparent pointer-events-none rounded-br-xl"></div>

                    <div
                      className="relative cursor-crosshair w-full max-w-[620px] aspect-[4/3] rounded-lg overflow-hidden flex items-center justify-center"
                      onClick={handleMapClick}
                    >
                      {heatmapNotif && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-[0_4px_12px_rgba(16,185,129,0.4)] pointer-events-none animate-[slideUpFade_0.3s_ease]">
                          {heatmapNotif}
                        </div>
                      )}
                      <img
                        key={mapName}
                        src={`/assets/${mapName.replace(/\s+/g, "_")}.png`}
                        alt={`${mapName} Map`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/map_placeholder.png";
                        }}
                        className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-opacity select-none"
                      />
                      {heatmapData
                        .filter((h) => h.round === selectedRound)
                        .map((h) => (
                          <div
                            key={h.id}
                            className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white animate-in zoom-in ${h.type === "Plant" ? "bg-red-500 shadow-[0_0_12px_#ef4444]" : "bg-blue-500 shadow-[0_0_12px_#3b82f6]"}`}
                            style={{ left: `${h.x}%`, top: `${h.y}%` }}
                          ></div>
                        ))}

                      {/* Empty state overlay */}
                      {heatmapData.filter((h) => h.round === selectedRound).length === 0 && (
                        <div className="absolute inset-0 flex items-end justify-center pointer-events-none pb-4">
                          <span className="text-[10px] text-slate-400 font-medium bg-slate-900/80 light:bg-white/90 backdrop-blur-sm rounded-full border border-slate-700/50 light:border-slate-300 px-4 py-1.5 shadow-lg text-center">
                            Click anywhere on the map to plot a {selectedAction.toLowerCase()} event
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Submit Card ── */}
              <div className="bg-[#0d131c] light:bg-white rounded-2xl border border-slate-800/50 light:border-slate-200 overflow-hidden shadow-xl light:shadow-sm w-full">
                <SectionHeader
                  icon={<IconNotes />}
                  label="Submit"
                  sub="Match Data Submission"
                  accent="#10b981"
                />
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 p-6 sm:p-8">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-widest text-white transition-all active:scale-95 hover:-translate-y-0.5 ${submitSuccess
                      ? "bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)] success-flash"
                      : isSubmitting
                        ? "opacity-70 cursor-wait"
                        : "submit-pulse hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                      }`}
                    style={!submitSuccess ? { background: "linear-gradient(135deg, #0d9488, #2563eb)" } : {}}
                  >
                    {isSubmitting ? (
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <IconSave />
                    )}
                    {submitSuccess
                      ? "Submitted!"
                      : isSubmitting
                        ? "Submitting..."
                        : "Submit Data"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-widest text-white transition-all active:scale-95 hover:-translate-y-0.5 border border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    style={{
                      background: "linear-gradient(135deg, #991b1b, #dc2626)",
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        { }

        {submittedRecords.length > 0 && (
          <div className="bg-[#0d131c] light:bg-white rounded-2xl border border-slate-800/60 light:border-slate-200 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800/60 light:border-slate-200 bg-slate-900/50 light:bg-slate-50 flex flex-col gap-1">
              <h3 className="text-xl font-black text-white light:text-slate-900 tracking-wider">SUBMITTED RECORDS</h3>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{game.toUpperCase()} | REGULAR SEASON | W{week} D{day} M{match} (ALL SETS)</span>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] de-scroll">
              <table className="w-full text-left border-collapse text-sm text-slate-300 light:text-slate-700 whitespace-nowrap">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.1em] text-slate-500 border-b border-slate-800/60 light:border-slate-200 bg-slate-900/90 light:bg-slate-100">
                    <th className="px-3 py-3 font-bold text-center">STAGE #</th>
                    <th className="px-3 py-3 font-bold text-center">DAY #</th>
                    <th className="px-3 py-3 font-bold text-center">MATCH #</th>
                    <th className="px-3 py-3 font-bold text-center">MAP #</th>
                    <th className="px-4 py-3 font-bold text-left">TEAM</th>
                    <th className="px-4 py-3 font-bold text-left">PLAYER</th>
                    <th className="px-4 py-3 font-bold text-center">AGENTS</th>
                    <th className="px-3 py-3 font-bold text-center text-emerald-400">Win</th>
                    <th className="px-4 py-3 font-bold text-center text-emerald-400">PERFORMANCE SCORE</th>
                    <th className="px-3 py-3 font-bold text-center">KILLS</th>
                    <th className="px-3 py-3 font-bold text-center">DEATHS</th>
                    <th className="px-3 py-3 font-bold text-center">ASSIST</th>
                    <th className="px-4 py-3 font-bold text-center text-emerald-400">TRADES</th>
                    <th className="px-4 py-3 font-bold text-center">FIRST KILLS</th>
                    <th className="px-4 py-3 font-bold text-center">PLANTS</th>
                    <th className="px-4 py-3 font-bold text-center">DEFUSE</th>
                    <th className="px-4 py-3 font-bold text-center">ACE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30 light:divide-slate-200">
                  {submittedRecords.map((rec, idx) => {
                    const isTeamA = rec.team_name === (teamA.name || "Team A");
                    const teamColorClass = isTeamA ? "text-blue-400" : "text-red-400";

                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] light:hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-center text-xs font-bold">{rec.week}</td>
                        <td className="px-3 py-2 text-center text-xs font-bold">{rec.day}</td>
                        <td className="px-3 py-2 text-center text-xs font-bold">{rec.match}</td>
                        <td className="px-3 py-2 text-center text-xs font-bold">{rec.set_num}</td>
                        <td className={`px-4 py-2 text-left font-bold ${teamColorClass}`}>{rec.team_name}</td>
                        <td className={`px-4 py-2 text-left font-bold ${teamColorClass}`}>{rec.ign}</td>
                        <td className="px-4 py-2 text-center font-bold">
                          {rec.agent ? <AgentBadge agent={rec.agent} /> : '—'}
                        </td>
                        <td className={`px-3 py-2 text-center font-bold ${rec.win ? 'text-emerald-400' : 'text-red-500'}`}>{rec.win ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 text-center font-bold text-emerald-400">{rec.acs}</td>
                        <td className="px-3 py-2 text-center font-bold">{rec.kills}</td>
                        <td className="px-3 py-2 text-center font-bold">{rec.deaths}</td>
                        <td className="px-3 py-2 text-center font-bold">{rec.assists}</td>
                        <td className="px-4 py-2 text-center font-bold text-emerald-400">{rec.econ}</td>
                        <td className="px-4 py-2 text-center font-bold">{rec.first_kills || 0}</td>
                        <td className="px-4 py-2 text-center font-bold">{rec.plants || 0}</td>
                        <td className="px-4 py-2 text-center font-bold">{rec.defuse || 0}</td>
                        <td className="px-4 py-2 text-center font-bold">{rec.aces ?? rec.ace ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
      
      {submitSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-[0_8px_30px_rgba(16,185,129,0.4)] flex items-center gap-3 animate-[fadeIn_0.3s_ease]">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-bold tracking-wide">
            Data submitted successfully!
          </span>
        </div>
      )}
    </div>
  );
};
export default DataEntry;