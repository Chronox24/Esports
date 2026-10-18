import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../utils/api";
import MapBpResults from "./MapBpResults";
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-theme-text-muted"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const DownloadIcon = () => (
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
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-theme-text-muted mb-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);
const ExclamationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-amber-500 mb-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);
const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shadow-inner ${enabled ? "bg-cyan-400" : "bg-slate-700"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);
const getStickyValue = (key, defaultVal) => {
  try {
    const val = window.sessionStorage.getItem(key);
    if (val !== null) return JSON.parse(val);
  } catch (e) {}
  return defaultVal;
};

const getInitialValMaps = () => [
  { id: "v1", name: "ABYSS", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Abyss1.png" },
  { id: "v2", name: "ASCENT", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Ascent1.png" },
  { id: "v3", name: "BIND", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Bind1.png" },
  { id: "v4", name: "BREEZE", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Breeze1.png" },
  { id: "v5", name: "CORRODE", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Corrode1.png" },
  { id: "v6", name: "FRACTURE", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Fracture1.png" },
  { id: "v7", name: "HAVEN", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Haven1.png" },
  { id: "v8", name: "ICEBOX", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Icebox1.png" },
  { id: "v9", name: "LOTUS", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Lotus1.png" },
  { id: "v10", name: "PEARL", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Pearl1.png" },
  { id: "v11", name: "SPLIT", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Split1.png" },
  { id: "v12", name: "SUMMIT", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Summit1.png" },
  { id: "v13", name: "SUNSET", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Sunset1.png" },
];

const getInitialCfMaps = () => [
  { id: "c1", name: "ANKARA", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Ankara1.png" },
  { id: "c2", name: "BLACK WIDOW", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Black_Widow1.png" },
  { id: "c3", name: "COMPOUND", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Compound1.png" },
  { id: "c4", name: "EAGLE EYE", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Eagle_Eye1.png" },
  { id: "c5", name: "MEXICO", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Mexico1.png" },
  { id: "c6", name: "PORT", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Port1.png" },
  { id: "c7", name: "SUB BASE", status: "none", byTeam: null, side: null, enabled: true, img: "/assets/Sub_Base1.png" },
];

const applyMapPoolConfig = (baseMaps, savedConfig) => {
  const cloned = baseMaps.map((m) => ({ ...m }));
  if (!Array.isArray(savedConfig) || savedConfig.length === 0) return cloned;
  const configMap = new Map();
  savedConfig.forEach((item) => {
    if (item && item.id) {
      configMap.set(String(item.id), item.enabled !== false);
    }
    if (item && item.name) {
      configMap.set(String(item.name).toUpperCase(), item.enabled !== false);
    }
  });
  return cloned.map((m) => {
    let isEnabled = m.enabled;
    if (configMap.has(String(m.id))) {
      isEnabled = configMap.get(String(m.id));
    } else if (configMap.has(String(m.name).toUpperCase())) {
      isEnabled = configMap.get(String(m.name).toUpperCase());
    }
    return { ...m, enabled: isEnabled };
  });
};

const Mapping = ({ globalGame, globalTournament }) => {
  const currentTournamentName = (
    typeof globalTournament === 'string'
      ? globalTournament
      : globalTournament?.name
  )?.trim() || "Default";

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const matchWeek = getStickyValue("de_week", "1");
  const matchDay = getStickyValue("de_day", "1");
  const matchNumber = getStickyValue("de_match", "1");
  const [activeTab, setActiveTab] = useState("CURRENT MATCH");
  const game = globalGame === "CROSSFIRE" ? "Crossfire" : "Valorant";
  const [teamA, setTeamA] = useState("Team A");
  const [teamB, setTeamB] = useState("Team B");
  const [dbTeams, setDbTeams] = useState([]);

  useEffect(() => {
    const tName = typeof globalTournament === 'string' ? globalTournament : (globalTournament?.name || "Default");
    apiFetch(`/api/teams?tournament=${encodeURIComponent(tName)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.length > 0) {
          setDbTeams(data);
          setTeamA(data[0].team_name);
          if (data.length > 1) {
            setTeamB(data[1].team_name);
          }
        } else {
          setDbTeams([{ team_name: "Team A" }, { team_name: "Team B" }]);
        }
      })
      .catch((err) => {
        console.error("Failed to load teams", err);
        setDbTeams([{ team_name: "Team A" }, { team_name: "Team B" }]);
      });
  }, [globalTournament]);

  const [vetoFormat, setVetoFormat] = useState("BO3");
  const [vetoActive, setVetoActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [showSideOverlay, setShowSideOverlay] = useState(false);
  const timerRef = useRef(null);
  const tabs = [
    "CURRENT MATCH",
    "MAP POOL SETTINGS",
    "BAN HISTORY",
    "ADMIN TOOLS",
  ];

  const [valMaps, setValMaps] = useState(() => {
    const key = `map_pool_${currentTournamentName}_Valorant`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return applyMapPoolConfig(getInitialValMaps(), JSON.parse(saved));
    } catch {}
    return getInitialValMaps();
  });

  const [cfMaps, setCfMaps] = useState(() => {
    const key = `map_pool_${currentTournamentName}_Crossfire`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return applyMapPoolConfig(getInitialCfMaps(), JSON.parse(saved));
    } catch {}
    return getInitialCfMaps();
  });

  const currentMaps = game === "Valorant" ? valMaps : cfMaps;
  const setCurrentMaps = game === "Valorant" ? setValMaps : setCfMaps;

  // Folder & Game specific map pool loading & synchronization
  useEffect(() => {
    let isMounted = true;
    const baseMaps = game === "Valorant" ? getInitialValMaps() : getInitialCfMaps();
    const key = `map_pool_${currentTournamentName}_${game}`;

    // 1. Immediately apply local cache for this specific tournament folder if present
    try {
      const local = localStorage.getItem(key);
      if (local) {
        const parsed = JSON.parse(local);
        const configured = applyMapPoolConfig(baseMaps, parsed);
        if (game === "Valorant") setValMaps(configured);
        else setCfMaps(configured);
      } else {
        if (game === "Valorant") setValMaps(baseMaps);
        else setCfMaps(baseMaps);
      }
    } catch (e) {
      console.warn("Failed reading local map pool cache:", e);
    }

    // 2. Fetch remote map pool configuration specifically for this tournament folder
    const fetchRemoteMapPool = async () => {
      if (!currentTournamentName || currentTournamentName === "Default") return;
      try {
        const tParam = encodeURIComponent(currentTournamentName);
        const gParam = encodeURIComponent(game);
        const res = await apiFetch(`/api/map-pool?tournament=${tParam}&game=${gParam}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && Array.isArray(data.maps) && data.maps.length > 0) {
            const configured = applyMapPoolConfig(baseMaps, data.maps);
            if (game === "Valorant") setValMaps(configured);
            else setCfMaps(configured);
            try {
              localStorage.setItem(key, JSON.stringify(data.maps));
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote map pool configuration:", err);
      }
    };

    fetchRemoteMapPool();

    // Reset veto when folder or game changes
    setVetoActive(false);
    setPhaseIndex(0);
    setTimeLeft(45);

    return () => {
      isMounted = false;
    };
  }, [currentTournamentName, game]);

  // Persist map pool for this specific folder both locally and to Supabase
  const persistMapPool = async (mapsToSave) => {
    if (!currentTournamentName || currentTournamentName === "Default") {
      return false;
    }
    const configToPersist = mapsToSave.map((m) => ({
      id: m.id,
      name: m.name,
      enabled: m.enabled !== false,
    }));
    const key = `map_pool_${currentTournamentName}_${game}`;

    // Save locally for this specific folder
    try {
      localStorage.setItem(key, JSON.stringify(configToPersist));
    } catch (e) {
      console.warn("Failed saving map pool locally", e);
    }

    // Save to database specifically for this folder
    try {
      const res = await apiFetch("/api/map-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_name: currentTournamentName,
          game_title: game,
          maps: configToPersist,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn("Failed saving map pool to server:", err);
      return false;
    }
  };

  // Toggle map availability in UI (does NOT auto-save; saves only on Save Configuration)
  const toggleMapEnabled = (id) => {
    setCurrentMaps((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  // Select all maps in UI (does NOT auto-save)
  const handleSelectAll = () => {
    setCurrentMaps((prev) => prev.map((m) => ({ ...m, enabled: true })));
  };

  // Deselect all maps in UI (does NOT auto-save)
  const handleDeselectAll = () => {
    setCurrentMaps((prev) => prev.map((m) => ({ ...m, enabled: false })));
  };

  // Explicit Save Configuration: Only saves in this specific folder!
  const handleSaveConfiguration = async () => {
    if (!currentTournamentName || currentTournamentName === "Default") {
      showToast("Please select a tournament folder first!");
      return;
    }
    setIsSaving(true);
    const success = await persistMapPool(currentMaps);
    setIsSaving(false);
    if (success) {
      showToast(`Configuration saved for folder "${currentTournamentName}"!`);
    } else {
      showToast(`Saved locally for folder "${currentTournamentName}".`);
    }
  };

  const vetoSequenceBO3 = [
    { team: "A", action: "ban", label: "BAN 1" },
    { team: "B", action: "ban", label: "BAN 2" },
    { team: "A", action: "pick", label: "PICK 1" },
    { team: "B", action: "side", label: "SIDE 1" },
    { team: "B", action: "pick", label: "PICK 2" },
    { team: "A", action: "side", label: "SIDE 2" },
    { team: "A", action: "ban", label: "BAN 3" },
    { team: "B", action: "ban", label: "BAN 4" },
    { team: "A", action: "side", label: "DECIDER SIDE" },
  ];
  const vetoSequenceBO5 = [
    { team: "A", action: "ban", label: "BAN 1" },
    { team: "B", action: "ban", label: "BAN 2" },
    { team: "A", action: "pick", label: "PICK 1" },
    { team: "B", action: "side", label: "SIDE 1" },
    { team: "B", action: "pick", label: "PICK 2" },
    { team: "A", action: "side", label: "SIDE 2" },
    { team: "A", action: "pick", label: "PICK 3" },
    { team: "B", action: "side", label: "SIDE 3" },
    { team: "B", action: "pick", label: "PICK 4" },
    { team: "A", action: "side", label: "SIDE 4" },
    { team: "B", action: "side", label: "DECIDER SIDE" },
  ];
  const vetoSequence = vetoFormat === "BO5" ? vetoSequenceBO5 : vetoSequenceBO3;
  const currentPhase =
    phaseIndex < vetoSequence.length ? vetoSequence[phaseIndex] : null;
  useEffect(() => {
    if (vetoActive && currentPhase?.action === "side") {
      const isDeciderPhase = phaseIndex === vetoSequence.length - 1;
      if (isDeciderPhase) {
        setShowSideOverlay(false);
        const timer = setTimeout(() => setShowSideOverlay(true), 800);
        return () => clearTimeout(timer);
      } else {
        setShowSideOverlay(true);
      }
    } else {
      setShowSideOverlay(false);
    }
  }, [vetoActive, currentPhase?.action, phaseIndex, vetoSequence.length]);
  useEffect(() => {
    if (vetoActive && timeLeft === 0 && currentPhase) {
      autoPlayTurn();
    }
  }, [timeLeft, vetoActive, currentPhase]);
  useEffect(() => {
    if (vetoActive && currentPhase) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [vetoActive, currentPhase]);
  const autoPlayTurn = () => {
    if (currentPhase.action === "side") {
      const sides = game === "Valorant" ? ["ATK", "DEF"] : ["BL", "GR"];
      const randomSide = sides[Math.floor(Math.random() * sides.length)];
      handleSidePick(randomSide);
      return;
    }
    const availableMaps = currentMaps.filter(
      (m) => m.status === "none" && m.enabled,
    );
    if (availableMaps.length > 0) {
      const randomMap =
        availableMaps[Math.floor(Math.random() * availableMaps.length)];
      handleMapClick(randomMap.id);
    }
  };
  const checkDecider = (maps) => {
    const availableMaps = maps.filter((m) => m.status === "none" && m.enabled);
    if (availableMaps.length === 1) {
      const updatedMaps = maps.map((m) =>
        m.id === availableMaps[0].id
          ? { ...m, status: "decider", byTeam: "none" }
          : m,
      );
      setCurrentMaps(updatedMaps);
    }
  };
  const handleMapClick = (mapId) => {
    if (!vetoActive || !currentPhase || currentPhase.action === "side") return;
    const map = currentMaps.find((m) => m.id === mapId);
    if (map.status !== "none" || !map.enabled) return;
    const updatedMaps = currentMaps.map((m) => {
      if (m.id === mapId) {
        return {
          ...m,
          status: currentPhase.action === "ban" ? "banned" : "picked",
          byTeam: currentPhase.team,
        };
      }
      return m;
    });
    setCurrentMaps(updatedMaps);
    const nextPhaseIndex = phaseIndex + 1;
    setPhaseIndex(nextPhaseIndex);
    setTimeLeft(45);
    checkDecider(updatedMaps);
  };
  const handleSidePick = (sideStr) => {
    if (!vetoActive || !currentPhase || currentPhase.action !== "side") return;
    const targetMap = currentMaps
      .slice()
      .reverse()
      .find(
        (m) =>
          (m.status === "picked" || m.status === "decider") && m.side === null,
      );
    if (targetMap) {
      const updatedMaps = currentMaps.map((m) => {
        if (m.id === targetMap.id) {
          return { ...m, side: sideStr, sideByTeam: currentPhase.team };
        }
        return m;
      });
      setCurrentMaps(updatedMaps);
    }
    const nextPhaseIndex = phaseIndex + 1;
    setPhaseIndex(nextPhaseIndex);
    setTimeLeft(45);
    if (nextPhaseIndex >= vetoSequence.length) {
      setVetoActive(false);
    }
  };
  const submitVetoResult = async (finalMaps) => {
    try {
      const bans = finalMaps.filter((m) => m.status === "banned");
      const picks = finalMaps.filter(
        (m) => m.status === "picked" || m.status === "decider",
      );
      const payload = {
        game,
        tournament_name: globalTournament?.name || globalTournament || "Default",
        stage: "",
        week: matchWeek,
        day: matchDay,
        match: matchNumber,
        series: "",
        team_a: teamA,
        team_b: teamB,
        ban_1: bans[0] ? bans[0].name : "",
        ban_2: bans[1] ? bans[1].name : "",
        ban_3: bans[2] ? bans[2].name : "",
        ban_4: bans[3] ? bans[3].name : "",
        map_1: picks[0] ? picks[0].name : "",
        map_2: picks[1] ? picks[1].name : "",
        map_3: picks[2] ? picks[2].name : "",
      };
      if (picks[3]) payload.map_4 = picks[3].name;
      if (picks[4]) payload.map_5 = picks[4].name;
      const res = await apiFetch("/api/vetoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resetVeto();
      } else {
        alert(
          "Failed to save veto result! Check the console or ensure your database schema is updated.",
        );
        console.error("Failed to save veto result");
      }
    } catch (err) {
      alert("Error connecting to backend!");
      console.error(err);
    }
  };
  const toggleVeto = () => {
    if (phaseIndex >= vetoSequence.length && !vetoActive) return;
    setVetoActive(!vetoActive);
  };
  const resetVeto = () => {
    setVetoActive(false);
    setPhaseIndex(0);
    setTimeLeft(45);
    setCurrentMaps((prev) =>
      prev.map((m) => ({
        ...m,
        status: "none",
        byTeam: null,
        side: null,
        sideByTeam: null,
      }))
    );
  };
  const renderCurrentMatch = () => {
    const circleRadius = 36;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const isTimeLow = timeLeft <= 5;
    const targetSideMap =
      vetoActive && currentPhase?.action === "side"
        ? currentMaps
            .slice()
            .reverse()
            .find(
              (m) =>
                (m.status === "picked" || m.status === "decider") &&
                m.side === null,
            )
        : null;
    return (
      <>
        {" "}
        {}{" "}
        <div className="flex flex-col xl:flex-row justify-center items-center border-b border-slate-800/60" style={{ gap: "32px", marginBottom: "24px", paddingBottom: "24px" }}>
          <div className="flex flex-col bg-slate-900/50 rounded-3xl border border-slate-800/50 shadow-lg" style={{ padding: "24px 32px", gap: "24px", alignSelf: "stretch", justifyContent: "center" }}>
            <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-cyan-400">Match Details</h3>
            <div className="flex gap-6">
               <div className="flex flex-col">
                  <span className="text-[9px] text-theme-text-muted font-bold tracking-widest uppercase mb-2">Week</span>
                  <div className="bg-slate-900 border border-slate-800/60 rounded-lg px-6 py-2 text-sm font-bold text-gray-300 shadow-inner">{matchWeek}</div>
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] text-theme-text-muted font-bold tracking-widest uppercase mb-2">Day</span>
                  <div className="bg-slate-900 border border-slate-800/60 rounded-lg px-6 py-2 text-sm font-bold text-gray-300 shadow-inner">{matchDay}</div>
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] text-theme-text-muted font-bold tracking-widest uppercase mb-2">Match</span>
                  <div className="bg-slate-900 border border-slate-800/60 rounded-lg px-6 py-2 text-sm font-bold text-gray-300 shadow-inner">{matchNumber}</div>
               </div>
            </div>
          </div>
          {" "}
          {}{" "}
          <div className="flex flex-col items-center" style={{ gap: "16px" }}>
            {" "}
            <div className="flex items-center bg-slate-900/50 rounded-3xl border border-slate-800/50 shadow-lg" style={{ padding: "32px 48px", gap: "48px" }}>
              {" "}
              {}{" "}
              <div className="flex flex-col items-center" style={{ gap: "12px" }}>
                {" "}
                <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase">
                  Team A
                </span>{" "}
                <select
                  value={teamA}
                  onChange={(e) => setTeamA(e.target.value)}
                  className="bg-blue-700/20 border border-[#1d4ed8]/50 text-theme-text-base text-base font-black rounded-xl outline-none text-center w-36 focus:border-[#60a5fa] transition-colors focus:bg-blue-700/40 shadow-[0_0_15px_rgba(29,78,216,0.2)]"
                  style={{ padding: "12px 16px" }}
                >
                  {" "}
                  {dbTeams.map((t) => (
                    <option
                      key={`a-${t.team_name}`}
                      value={t.team_name}
                      className="bg-slate-900 text-theme-text-base"
                    >
                      {t.team_name}
                    </option>
                  ))}{" "}
                </select>{" "}
              </div>{" "}
              {}{" "}
              <div className="relative flex flex-col items-center justify-center">
                {" "}
                <div
                  className={`relative flex items-center justify-center rounded-full ${isTimeLow && vetoActive ? "timer-pulse" : ""} bg-slate-900 shadow-inner`}
                >
                  {" "}
                  <svg
                    width="100"
                    height="100"
                    className="transform -rotate-90"
                  >
                    {" "}
                    <circle
                      cx="50"
                      cy="50"
                      r={40}
                      fill="transparent"
                      stroke="#1e293b"
                      strokeWidth="6"
                    />{" "}
                    <circle
                      cx="50"
                      cy="50"
                      r={40}
                      fill="transparent"
                      stroke={isTimeLow ? "#ef4444" : "#00ffcc"}
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={
                        2 * Math.PI * 40 - (timeLeft / 45) * (2 * Math.PI * 40)
                      }
                      className="transition-all duration-1000 ease-linear"
                      strokeLinecap="round"
                    />{" "}
                  </svg>{" "}
                  <div className="absolute flex flex-col items-center">
                    {" "}
                    <span
                      className={`text-3xl font-black ${isTimeLow ? "text-red-500" : "text-theme-text-base"}`}
                    >
                      {timeLeft}
                    </span>{" "}
                    <span className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest -mt-1">
                      Sec
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {}{" "}
              <div className="flex flex-col items-center" style={{ gap: "12px" }}>
                {" "}
                <span className="text-[10px] text-red-400 font-bold tracking-[0.2em] uppercase">
                  Team B
                </span>{" "}
                <select
                  value={teamB}
                  onChange={(e) => setTeamB(e.target.value)}
                  className="bg-red-700/20 border border-[#b91c1c]/50 text-theme-text-base text-base font-black rounded-xl outline-none text-center w-36 focus:border-[#f87171] transition-colors focus:bg-red-700/40 shadow-[0_0_15px_rgba(185,28,28,0.2)]"
                  style={{ padding: "12px 16px" }}
                >
                  {" "}
                  {dbTeams.map((t) => (
                    <option
                      key={`b-${t.team_name}`}
                      value={t.team_name}
                      className="bg-slate-900 text-theme-text-base"
                    >
                      {t.team_name}
                    </option>
                  ))}{" "}
                </select>{" "}
              </div>{" "}
            </div>{" "}
            {}{" "}
            <div className="whitespace-nowrap text-center">
              {" "}
              {currentPhase ? (
                <span className="text-[12px] font-black uppercase tracking-[0.25em]">
                  {" "}
                  <span className="text-theme-text-muted">TURN: </span>{" "}
                  <span
                    className={
                      currentPhase.team === "A"
                        ? "text-blue-400"
                        : "text-red-400"
                    }
                  >
                    {" "}
                    {currentPhase.team === "A" ? teamA : teamB}{" "}
                  </span>{" "}
                </span>
              ) : (
                <span className="text-[12px] font-black uppercase tracking-[0.25em] text-cyan-400">
                  DECIDER
                </span>
              )}{" "}
            </div>{" "}
          </div>{" "}
          {}{" "}
          <div className="flex flex-row xl:flex-col shrink-0" style={{ gap: "16px" }}>
            {" "}
            {!currentPhase && phaseIndex > 0 ? (
              <button
                onClick={() => submitVetoResult(currentMaps)}
                className="text-[13px] font-black uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 shadow-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                style={{ padding: "14px 32px", borderRadius: "12px" }}
              >
                {" "}
                SUBMIT RESULTS{" "}
              </button>
            ) : (
              <button
                onClick={toggleVeto}
                disabled={!currentPhase}
                className={`text-[13px] font-black uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 shadow-lg border ${!currentPhase ? "bg-slate-800 text-theme-text-muted border-slate-700 cursor-not-allowed" : vetoActive ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-cyan-400/10 text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]"}`}
                style={{ padding: "14px 32px", borderRadius: "12px" }}
              >
                {" "}
                {vetoActive
                  ? "PAUSE VETO"
                  : phaseIndex > 0 && currentPhase
                    ? "RESUME"
                    : "START VETO"}{" "}
              </button>
            )}{" "}
            <button
              onClick={resetVeto}
              className="text-[13px] font-black uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 bg-slate-800/50 text-theme-text-muted hover:text-theme-text-base hover:bg-slate-700 border border-slate-700/50"
              style={{ padding: "14px 32px", borderRadius: "12px" }}
            >
              {" "}
              RESET{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div className="flex justify-center w-full max-w-full overflow-x-auto pb-2 custom-scrollbar" style={{ marginBottom: "48px" }}>
          {" "}
          <div className="flex flex-wrap justify-center bg-slate-900/60 rounded-xl border border-slate-800/60 min-w-max" style={{ gap: "12px", padding: "16px" }}>
            {" "}
            {vetoSequence.map((seq, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center transition-colors border ${idx < phaseIndex ? "bg-slate-800 border-slate-700 opacity-50" : idx === phaseIndex ? "bg-white/[0.08] border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]" : "bg-transparent border-transparent opacity-40"}`}
                style={{ padding: "8px 16px", borderRadius: "12px" }}
              >
                {" "}
                <span
                  className={`text-[10px] font-bold tracking-widest ${seq.team === "A" ? "text-blue-400" : "text-red-400"}`}
                >
                  T-{seq.team}
                </span>{" "}
                <span
                  className={`text-[11px] font-black tracking-widest uppercase ${seq.action === "ban" ? "text-red-500" : "text-green-400"}`}
                >
                  {seq.action}
                </span>{" "}
              </div>
            ))}{" "}
            <div
              className={`flex items-center justify-center transition-colors border ${!currentPhase ? "bg-cyan-400/20 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "bg-transparent border-transparent opacity-40"}`}
              style={{ padding: "8px 16px", borderRadius: "12px" }}
            >
              {" "}
              <span className="text-[11px] font-black tracking-widest text-cyan-400">
                DECIDER
              </span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {}{" "}
        <div className="relative" style={{ marginBottom: "48px" }}>
          {" "}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: "24px" }}>
            {" "}
            {currentMaps.map((m) => {
              const isClickable =
                vetoActive && currentPhase && m.status === "none" && m.enabled;
              const teamColorStr =
                m.byTeam === "A" ? "blue" : m.byTeam === "B" ? "red" : "gray";
              const teamHex = m.byTeam === "A" ? "#3b82f6" : "#ef4444";
              if (!m.enabled) return null;
              return (
                <div
                  key={m.id}
                  onClick={() => isClickable && handleMapClick(m.id)}
                  className={`veto-card-enter relative aspect-[16/8] rounded-2xl overflow-hidden transition-all duration-400                   ${isClickable ? "cursor-pointer hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] group border-[2px] border-slate-700 hover:border-slate-400" : "border-[2px] border-slate-800/60"}                  ${m.status === "banned" ? `border-${teamColorStr}-500 shadow-[0_0_20px_rgba(${m.byTeam === "A" ? "59,130,246" : "239,68,68"},0.3)]` : ""}                  ${m.status === "picked" ? `border-${teamColorStr}-500 shadow-[0_0_20px_rgba(${m.byTeam === "A" ? "59,130,246" : "239,68,68"},0.3)]` : ""}                  ${m.status === "decider" ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)] scale-[1.02] z-10" : ""}                `}
                >
                  {" "}
                  {}{" "}
                  <div
                    className={`absolute inset-0 bg-cover bg-center transition-all duration-700                     ${m.status === "banned" ? "opacity-30 blur-[3px] grayscale" : m.status === "picked" ? "opacity-50" : m.status === "decider" ? "opacity-100 scale-105" : "opacity-60"}                    ${isClickable ? "group-hover:opacity-100 group-hover:scale-105" : ""}                  `}
                    style={{ backgroundImage: `url(${m.img})` }}
                  ></div>{" "}
                  {}{" "}
                  {m.status === "picked" && (
                    <div
                      className={`absolute inset-0 opacity-70 bg-gradient-to-t from-transparent ${m.byTeam === "A" ? "to-blue-900" : "to-red-900"}`}
                    ></div>
                  )}{" "}
                  {m.status === "banned" && (
                    <div
                      className={`absolute inset-0 opacity-50 bg-gradient-to-t from-transparent ${m.byTeam === "A" ? "to-blue-900" : "to-red-900"}`}
                    ></div>
                  )}{" "}
                  {}{" "}
                  <div className="absolute bottom-4 left-4 z-10">
                    {" "}
                    <span
                      className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-[0.3em] backdrop-blur-md shadow-lg border ${m.status === "decider" ? "bg-amber-400 text-amber-950 border-amber-300" : "bg-black/60 text-theme-text-base border-white/10"}`}
                    >
                      {" "}
                      {m.name}{" "}
                    </span>{" "}
                  </div>{" "}
                  {}{" "}
                  {isClickable &&
                    currentPhase &&
                    currentPhase.action !== "side" && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20">
                        {" "}
                        <div
                          className={`px-6 py-3 rounded-xl border-2 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ${currentPhase.action === "ban" ? (currentPhase.team === "A" ? "bg-blue-600/90 border-blue-400 text-theme-text-base" : "bg-red-600/90 border-red-400 text-theme-text-base") : currentPhase.team === "A" ? "bg-blue-500/90 border-blue-300 text-theme-text-base" : "bg-red-500/90 border-red-300 text-theme-text-base"}`}
                        >
                          {" "}
                          <span className="text-sm font-black uppercase tracking-[0.2em]">
                            {" "}
                            CLICK TO {currentPhase.action.toUpperCase()}{" "}
                          </span>{" "}
                        </div>{" "}
                      </div>
                    )}{" "}
                  {}{" "}
                  {m.side && (
                    <div className="absolute top-4 left-4 z-30">
                      {" "}
                      <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-900/90 border border-slate-700 text-theme-text-base shadow-lg">
                        {" "}
                        SIDE:{" "}
                        <span className="text-cyan-400">{m.side}</span>{" "}
                      </span>{" "}
                    </div>
                  )}{" "}
                  {}{" "}
                  {m.status === "banned" && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                      {" "}
                      <span
                        className="text-8xl font-black drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] opacity-90"
                        style={{ color: teamHex }}
                      >
                        ✕
                      </span>{" "}
                      <div className="absolute top-4 right-4">
                        {" "}
                        <span
                          className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-xl tracking-[0.2em] border ${m.byTeam === "A" ? "bg-blue-600/90 text-theme-text-base border-blue-400" : "bg-red-600/90 text-theme-text-base border-red-400"}`}
                        >
                          {" "}
                          BANNED BY {m.byTeam === "A" ? teamA : teamB}{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>
                  )}{" "}
                  {m.status === "picked" && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                      {" "}
                      <span
                        className="text-8xl font-black drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] opacity-90"
                        style={{ color: teamHex }}
                      >
                        ✓
                      </span>{" "}
                      <div className="absolute top-4 right-4">
                        {" "}
                        <span
                          className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-xl tracking-[0.2em] border ${m.byTeam === "A" ? "bg-blue-600/90 text-theme-text-base border-blue-400" : "bg-red-600/90 text-theme-text-base border-red-400"}`}
                        >
                          {" "}
                          PICKED BY {m.byTeam === "A" ? teamA : teamB}{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>
                  )}{" "}
                  {m.status === "decider" && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-amber-500/10">
                      {" "}
                      <div className="absolute top-4 right-4">
                        {" "}
                        <span className="bg-amber-400 text-amber-950 border border-amber-300 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-[0_0_15px_rgba(251,191,36,0.5)] tracking-[0.2em]">
                          {" "}
                          DECIDER MAP{" "}
                        </span>{" "}
                      </div>{" "}
                    </div>
                  )}{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
          {}{" "}
          {vetoActive && currentPhase?.action === "side" && showSideOverlay && (
            <div
              key={`side-overlay-${phaseIndex}`}
              className="absolute inset-0 z-50 flex items-center justify-center bg-bg-100/85 backdrop-blur-md rounded-2xl border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              {" "}
              <div className="bg-bg-200 border border-slate-700/60 p-8 rounded-3xl flex flex-col items-center shadow-2xl min-w-[550px] relative overflow-hidden">
                {" "}
                {}{" "}
                {targetSideMap && (
                  <div className="animate-reveal-map relative w-full aspect-[21/9] rounded-xl overflow-hidden mb-8 border border-slate-700/50">
                    {" "}
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${targetSideMap.img})` }}
                    ></div>{" "}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b121e] via-black/40 to-transparent"></div>{" "}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 z-10">
                      {" "}
                      <span className="text-xl font-black tracking-[0.4em] uppercase text-theme-text-base drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">
                        {" "}
                        {targetSideMap.name}{" "}
                      </span>{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                <div className="animate-slide-up-fade flex flex-col items-center gap-6 w-full">
                  {" "}
                  <h3 className="text-2xl font-black uppercase tracking-widest text-theme-text-base text-center">
                    {" "}
                    <span
                      className={
                        currentPhase.team === "A"
                          ? "text-blue-400"
                          : "text-red-400"
                      }
                    >
                      {currentPhase.team === "A" ? teamA : teamB}
                    </span>{" "}
                    <br />{" "}
                    <span className="text-theme-text-muted text-lg mt-1 inline-block">
                      SELECT STARTING SIDE
                    </span>{" "}
                  </h3>{" "}
                  <div className="flex gap-6 w-full">
                    {" "}
                    {game === "Valorant" ? (
                      <>
                        {" "}
                        <button
                          onClick={() => handleSidePick("ATK")}
                          className="flex-1 py-8 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/20 text-amber-500 font-black text-xl uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                        >
                          ATTACKER
                        </button>{" "}
                        <button
                          onClick={() => handleSidePick("DEF")}
                          className="flex-1 py-8 rounded-2xl bg-teal-500/10 border-2 border-teal-500/30 hover:border-teal-500 hover:bg-teal-500/20 text-teal-500 font-black text-xl uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                        >
                          DEFENDER
                        </button>{" "}
                      </>
                    ) : (
                      <>
                        {" "}
                        <button
                          onClick={() => handleSidePick("BL")}
                          className="flex-1 py-8 rounded-2xl bg-slate-900 border-2 border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10 text-yellow-500 font-black text-xl uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                        >
                          BL <br />
                          <span className="text-xs text-yellow-500/60">
                            Black List
                          </span>
                        </button>{" "}
                        <button
                          onClick={() => handleSidePick("GR")}
                          className="flex-1 py-8 rounded-2xl bg-slate-900 border-2 border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 text-blue-500 font-black text-xl uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                        >
                          GR <br />
                          <span className="text-xs text-blue-500/60">
                            Global Risk
                          </span>
                        </button>{" "}
                      </>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </>
    );
  };
  const renderMapPoolSettings = () => {
    return (
      <div className="animate-[fadeInScale_0.3s_ease-out]" style={{ padding: "32px" }}>
        {" "}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800/60 shrink-0" style={{ gap: "24px", marginBottom: "32px", paddingBottom: "24px" }}>
          {" "}
          <div>
            {" "}
            <h2 className="text-2xl font-black tracking-widest uppercase flex items-center gap-3">
              <span>Map Pool Settings</span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 uppercase tracking-widest">
                {currentTournamentName}
              </span>
            </h2>{" "}
            <p className="text-theme-text-muted text-sm mt-1">
              Configure which maps are available for the veto process in {game} for folder{" "}
              <span className="text-cyan-400 font-semibold">"{currentTournamentName}"</span>.
            </p>{" "}
          </div>{" "}
          <div className="flex flex-wrap items-center" style={{ gap: "16px" }}>
            <button
              onClick={handleSelectAll}
              style={{
                boxShadow: "0 4px 0 #1e293b, 0 6px 12px rgba(0,0,0,0.3)",
                transform: "translateY(0)",
                padding: "12px 24px",
                borderRadius: "12px",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(3px)";
                e.currentTarget.style.boxShadow =
                  "0 1px 0 #1e293b, 0 2px 4px rgba(0,0,0,0.3)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 0 #1e293b, 0 6px 12px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 0 #1e293b, 0 6px 12px rgba(0,0,0,0.3)";
              }}
              className="bg-slate-800 text-theme-text-base text-xs font-bold tracking-wide transition-all cursor-pointer border border-slate-600/50 hover:bg-slate-700"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              style={{
                boxShadow: "0 4px 0 #1e293b, 0 6px 12px rgba(0,0,0,0.3)",
                transform: "translateY(0)",
                padding: "12px 24px",
                borderRadius: "12px",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(3px)";
                e.currentTarget.style.boxShadow =
                  "0 1px 0 #1e293b, 0 2px 4px rgba(0,0,0,0.3)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 0 #1e293b, 0 6px 12px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 0 #1e293b, 0 6px 12px rgba(0,0,0,0.3)";
              }}
              className="bg-slate-800 text-theme-text-base text-xs font-bold tracking-wide transition-all cursor-pointer border border-slate-600/50 hover:bg-slate-700"
            >
              Deselect All
            </button>
            <button
              onClick={handleSaveConfiguration}
              disabled={isSaving}
              style={{
                boxShadow: "0 4px 0 #065f46, 0 6px 16px rgba(16,185,129,0.3)",
                transform: "translateY(0)",
                padding: "12px 24px",
                borderRadius: "12px",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(3px)";
                e.currentTarget.style.boxShadow =
                  "0 1px 0 #065f46, 0 2px 4px rgba(16,185,129,0.2)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 0 #065f46, 0 6px 16px rgba(16,185,129,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 0 #065f46, 0 6px 16px rgba(16,185,129,0.3)";
              }}
              className={`text-xs font-bold tracking-wide transition-all cursor-pointer border ${
                isSaving
                  ? "bg-cyan-500/30 text-cyan-200 border-cyan-400/60 cursor-wait"
                  : "bg-cyan-400/15 text-cyan-400 border-cyan-400/40 hover:bg-cyan-400/25"
              }`}
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>{" "}
        </div>{" "}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4" style={{ gap: "24px", paddingBottom: "32px" }}>
          {" "}
          {currentMaps.map((m) => (
            <div
              key={m.id}
              className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${m.enabled ? "border-slate-600" : "border-slate-800 opacity-60"}`}
            >
              {" "}
              <div
                className={`absolute inset-0 bg-cover bg-center ${!m.enabled ? "grayscale brightness-50" : ""}`}
                style={{ backgroundImage: `url(${m.img})` }}
              ></div>{" "}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>{" "}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                {" "}
                <span className="text-sm font-black uppercase tracking-widest">
                  {m.name}
                </span>{" "}
                <ToggleSwitch
                  enabled={m.enabled}
                  onChange={() => toggleMapEnabled(m.id)}
                />{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>
    );
  };
  const renderBanHistory = () => {
    return <MapBpResults globalGame={globalGame} globalTournament={globalTournament} />;
  };
    const renderAdminTools = () => {
    return (
      <div className="animate-[fadeInScale_0.3s_ease-out]">
        {" "}
        <div className="border-b border-slate-800/60" style={{ marginBottom: "32px", paddingBottom: "24px" }}>
          {" "}
          <h2 className="text-2xl font-black tracking-widest uppercase">
            Admin Veto Tools
          </h2>{" "}
          <p className="text-theme-text-muted text-sm mt-1">
            Powerful overrides and match controls. Use with caution.
          </p>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: "24px" }}>
          {" "}
          <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 transition-colors" style={{ padding: "24px", gap: "24px" }}>
            {" "}
            <div>
              {" "}
              <h3 className="text-sm font-bold text-theme-text-base uppercase tracking-wider mb-2">
                Reverse Last Action
              </h3>{" "}
              <p className="text-xs text-theme-text-muted mb-6">
                Undo the last map ban or pick. Restores the timer and phase
                state to the previous turn.
              </p>{" "}
            </div>{" "}
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-theme-text-base text-xs font-bold uppercase tracking-wider border border-slate-700 transition-colors" style={{ padding: "12px 24px", borderRadius: "12px" }}>
              Undo Action
            </button>{" "}
          </div>{" "}
          <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 transition-colors" style={{ padding: "24px", gap: "24px" }}>
            {" "}
            <div>
              {" "}
              <h3 className="text-sm font-bold text-theme-text-base uppercase tracking-wider mb-2">
                Override Turn Timer
              </h3>{" "}
              <p className="text-xs text-theme-text-muted mb-6">
                Manually adjust the current turn's timer countdown.
              </p>{" "}
              <div className="flex mb-4" style={{ gap: "12px" }}>
                {" "}
                <button className="flex-1 bg-slate-800 text-xs font-bold text-theme-text-base hover:bg-slate-700" style={{ padding: "10px", borderRadius: "8px" }}>
                  +10s
                </button>{" "}
                <button className="flex-1 bg-slate-800 text-xs font-bold text-theme-text-base hover:bg-slate-700" style={{ padding: "10px", borderRadius: "8px" }}>
                  +30s
                </button>{" "}
                <button className="flex-1 bg-slate-800 text-xs font-bold text-red-400 hover:bg-slate-700" style={{ padding: "10px", borderRadius: "8px" }}>
                  Force 0s
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}

          <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 transition-colors" style={{ padding: "24px", gap: "24px" }}>
            {" "}
            <div>
              {" "}
              <h3 className="text-sm font-bold text-theme-text-base uppercase tracking-wider mb-2">
                Match Format Setup
              </h3>{" "}
              <p className="text-xs text-theme-text-muted mb-6">
                Change the veto format sequence. This can only be changed before
                the veto starts.
              </p>{" "}
            </div>{" "}
            <div className="flex" style={{ gap: "12px", marginTop: "12px" }}>
              {" "}
              <button
                onClick={() => !vetoActive && setVetoFormat("BO3")}
                disabled={vetoActive && phaseIndex > 0}
                className={`flex-1 text-xs font-bold transition-colors ${vetoFormat === "BO3" ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30" : "bg-slate-800 text-theme-text-muted hover:text-theme-text-base border border-slate-700"} ${vetoActive && phaseIndex > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ padding: "10px", borderRadius: "8px" }}
              >
                {" "}
                BEST OF 3{" "}
              </button>{" "}
              <button
                onClick={() => !vetoActive && setVetoFormat("BO5")}
                disabled={vetoActive && phaseIndex > 0}
                className={`flex-1 text-xs font-bold transition-colors ${vetoFormat === "BO5" ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30" : "bg-slate-800 text-theme-text-muted hover:text-theme-text-base border border-slate-700"} ${vetoActive && phaseIndex > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ padding: "10px", borderRadius: "8px" }}
              >
                {" "}
                BEST OF 5{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}

        </div>{" "}
      </div>
    );
  };
  return (
    <div className={`flex-1 overflow-y-auto w-full h-full text-theme-text-base font-sans custom-scrollbar flex flex-col items-center ${activeTab === 'BAN HISTORY' ? 'bg-bg-base' : 'bg-bg-100'}`}>
      {" "}
      <div className={`w-full flex-1 flex flex-col ${activeTab === 'BAN HISTORY' ? 'max-w-full px-0 py-0' : 'max-w-[1400px] px-8 lg:px-12 py-6 lg:py-8'}`}>
        {" "}
        <style
          dangerouslySetInnerHTML={{
            __html: `        @keyframes pulse-red {          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }          50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }        }        .timer-pulse {          animation: pulse-red 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;        }        .veto-card-enter {          animation: fadeInScale 0.4s ease-out forwards;        }        @keyframes fadeInScale {          from { opacity: 0; transform: scale(0.95); }          to { opacity: 1; transform: scale(1); }        }        @keyframes revealMap {          0% { opacity: 0; transform: scale(1.05) translateY(10px); box-shadow: 0 0 0 rgba(0,0,0,0); }          100% { opacity: 1; transform: scale(1) translateY(0); box-shadow: 0 10px 40px rgba(0,0,0,0.8); }        }        @keyframes slideUpFade {          0% { opacity: 0; transform: translateY(15px); }          100% { opacity: 1; transform: translateY(0); }        }        .animate-reveal-map {          animation: revealMap 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;        }        .animate-slide-up-fade {          opacity: 0;          animation: slideUpFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s forwards;        }      `,
          }}
        />{" "}
        {}{" "}
        <div className={`mapping-tab-nav flex flex-wrap justify-between items-center bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-2xl ${activeTab === 'BAN HISTORY' ? 'mt-8 mx-8 lg:mx-12 shrink-0' : 'w-full'}`} style={{ padding: "8px", gap: "8px", marginBottom: "32px" }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 whitespace-nowrap transition-all duration-300 text-[11px] lg:text-[13px] font-black uppercase tracking-widest overflow-hidden ${
                activeTab === tab
                  ? "text-cyan-400 shadow-[0_8px_25px_rgba(6,182,212,0.35)] scale-[1.02] border border-cyan-400/30 bg-cyan-400/10 z-10"
                  : "text-theme-text-muted hover:text-theme-text-base hover:bg-slate-800/80 border border-transparent hover:border-slate-600/50"
              }`}
              style={{ padding: "12px 24px", borderRadius: "12px" }}
            >
              <span className="relative z-10">{tab}</span>
              {activeTab === tab && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent animate-[fadeInScale_0.3s_ease-out]"></div>
              )}
            </button>
          ))}
        </div>
        {}
        {activeTab === "BAN HISTORY" ? (
          <div className="flex-1 min-h-0 relative w-full overflow-hidden flex flex-col">
            {renderBanHistory()}
          </div>
        ) : (
          <div className="mapping-card-container bg-bg-200 rounded-2xl border border-slate-800/60 shadow-2xl mb-12 min-h-[600px]">
            {activeTab === "CURRENT MATCH" && renderCurrentMatch()}
            {activeTab === "MAP POOL SETTINGS" && renderMapPoolSettings()}
            {activeTab === "ADMIN TOOLS" && renderAdminTools()}
          </div>
        )}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-cyan-300 text-xs font-bold shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-md animate-[fadeInScale_0.2s_ease-out]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default Mapping;
