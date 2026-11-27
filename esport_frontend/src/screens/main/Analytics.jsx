import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { apiFetch } from "../../utils/api";
import { getAgentImagePath, getAgentRoleStyle } from "../../utils/agentHelper";
import { calculateAverageMapKda } from "../../utils/crossTournamentAnalysis";
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-theme-text-faint"
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
const ChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-theme-text-muted"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);
const Tooltip = ({ x, y, content, visible }) => {
  if (!visible) return null;
  return (
    <div
      className="absolute z-50 bg-bg-100 border border-[#2a3648] text-theme-text-base text-xs p-3 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-none transform -translate-x-1/2 -translate-y-full backdrop-blur-md"
      style={{ left: x, top: y - 10, transition: "all 0.1s ease-out" }}
    >
      {content}
    </div>
  );
};
const Card = ({ title, children, className = "", accent = "#00e5ff", icon = null, badge = null }) => (
  <div
    className={`hud-card flex flex-col overflow-hidden relative group transition-all duration-300 hover:border-cyan-400/40 hover:shadow-2xl ${className}`}
    style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
  >
    {/* Top accent line */}
    <div className="h-[2px] shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
    {/* Subtle bg glow */}
    <div className="absolute inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(ellipse at top left, ${accent}08, transparent 60%)` }} />
    {/* Header */}
    <div className="border-b border-cyan-500/15 bg-slate-950/60 relative z-10 flex items-center justify-between shrink-0" style={{ padding: "16px 20px" }}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-7 h-7 hud-chamfer-sm flex items-center justify-center shrink-0" style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
            <span style={{ color: accent }}>{icon}</span>
          </div>
        )}
        <h3 className="font-tactical text-[11px] font-black tracking-[0.2em] text-theme-text-base uppercase">{title}</h3>
      </div>
      {badge && (
        <span className="font-tactical text-[9px] font-black uppercase tracking-[0.15em] hud-chamfer-sm px-2.5 py-1" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}35` }}>
          {badge}
        </span>
      )}
    </div>
    <div className="flex-1 relative z-10 min-h-[300px]" style={{ padding: "16px" }}>{children}</div>
  </div>
);
const RadarChart = ({ data, axes, onSelect }) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });
  const size = 320;
  const center = size / 2;
  const radius = center - 60;
  const angleStep = (Math.PI * 2) / axes.length;
  const getPoint = (val, max, angle) => ({
    x: center + (val / max) * radius * Math.sin(angle),
    y: center - (val / max) * radius * Math.cos(angle),
  });
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="overflow-visible"
        onMouseLeave={() => setTooltip({ visible: false })}
      >
        {}
        {[0.2, 0.4, 0.6, 0.8, 1].map((level, i) => (
          <polygon
            key={`grid-${i}`}
            points={axes
              .map((_, idx) => {
                const pt = getPoint(level, 1, idx * angleStep);
                return `${pt.x},${pt.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#232f40"
            strokeWidth="1"
          />
        ))}
        {}
        {axes.map((axis, idx) => {
          const ptEnd = getPoint(1, 1, idx * angleStep);
          const ptLabel = getPoint(1.25, 1, idx * angleStep);
          return (
            <g key={`axis-${idx}`}>
              <line
                x1={center}
                y1={center}
                x2={ptEnd.x}
                y2={ptEnd.y}
                stroke="#232f40"
                strokeWidth="1"
              />
              <text
                x={ptLabel.x}
                y={ptLabel.y}
                fill="#9ca3af"
                fontSize="10"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-semibold"
              >
                {axis}
              </text>
            </g>
          );
        })}
        {}
        {data.map((player, pIdx) => {
          const points = axes
            .map((_, idx) => {
              const pt = getPoint(player.stats[idx], 100, idx * angleStep);
              return `${pt.x},${pt.y}`;
            })
            .join(" ");
          return (
            <g key={`poly-${pIdx}`}>
              <polygon
                points={points}
                fill={player.color}
                fillOpacity="0.15"
                stroke={player.color}
                strokeWidth="2"
                className="transition-all duration-300 hover:fill-opacity-40 cursor-pointer drop-shadow-md"
                onClick={() => onSelect(player)}
                onMouseMove={(e) => {
                  const rect = e.target.closest('.relative').getBoundingClientRect();
                  setTooltip({
                    visible: true,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    content: (
                      <div className="flex flex-col gap-1">
                        <div
                          className="font-black border-b border-gray-700 pb-1 mb-1 tracking-wider"
                          style={{ color: player.color }}
                        >
                          {player.name}
                        </div>
                        {axes.map((ax, i) => (
                          <div
                            key={i}
                            className="flex justify-between gap-4 text-[10px]"
                          >
                            <span className="text-theme-text-muted">{ax}</span>
                            <span className="font-bold text-theme-text-base">
                              {player.stats[i]}
                            </span>
                          </div>
                        ))}
                        <div className="text-[9px] text-theme-text-faint mt-1 text-center italic">
                          Click for detailed overview
                        </div>
                      </div>
                    ),
                  });
                }}
              />
              {axes.map((_, idx) => {
                const pt = getPoint(player.stats[idx], 100, idx * angleStep);
                return (
                  <circle
                    key={`dot-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="3"
                    fill={player.color}
                    className="pointer-events-none"
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <Tooltip {...tooltip} />
      {}
      <div className="absolute right-0 top-0 flex flex-col space-y-2 bg-bg-300/80 rounded-lg border border-[#232f40] backdrop-blur-sm" style={{ padding: "8px" }}>
        {data.length === 0 ? (
          <span className="text-xs text-theme-text-faint">No players found</span>
        ) : null}
        {data.map((p, i) => (
          <div
            key={i}
            className="flex items-center space-x-2 text-[10px] text-theme-text-base font-bold tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onSelect && onSelect(p)}
            title="Click to view full metric breakdown"
          >
            <div
              className="w-4 h-[2px] rounded-full shadow-[0_0_5px_currentColor]"
              style={{ backgroundColor: p.color, color: p.color }}
            ></div>
            <span>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
const EconChart = ({ data, theme, onSelect }) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });
  const w = 450,
    h = 260;
  const padX = 60,
    padY = 30;
  const maxMoney = 10000;
  const maxProb = 100;
  const barW = (w - padX * 2) / data.length - 6;
  const pathD = data
    .map((d, i) => {
      const x = padX + (i * (w - padX * 2)) / data.length + barW / 2;
      const y = h - padY - (d.prob / maxProb) * (h - padY * 2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        width={w}
        height={h}
        onMouseLeave={() => setTooltip({ visible: false })}
      >
        {}
        {[0, 2500, 5000, 7500, 10000].map((val, i) => {
          const y = h - padY - (val / maxMoney) * (h - padY * 2);
          return (
            <g key={`y-${i}`}>
              <line
                x1={padX}
                y1={y}
                x2={w - padX}
                y2={y}
                stroke="#232f40"
                strokeDasharray={i === 0 ? "" : "4,4"}
              />
              <text
                x={padX - 10}
                y={y + 3}
                fill="#6b7280"
                fontSize="10"
                textAnchor="end"
                className="font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}
        {}
        {[0, 20, 40, 60, 80, 100].map((val, i) => {
          const y = h - padY - (val / maxProb) * (h - padY * 2);
          return (
            <text
              key={`yp-${i}`}
              x={w - padX + 10}
              y={y + 3}
              fill="#6b7280"
              fontSize="10"
              textAnchor="start"
              className="font-mono"
            >
              {val}
            </text>
          );
        })}
        {}
        <text
          x={15}
          y={h / 2}
          transform={`rotate(-90 15 ${h / 2})`}
          fill="#9ca3af"
          fontSize="10"
          textAnchor="middle"
          className="font-bold tracking-widest uppercase"
        >
          Money
        </text>
        <text
          x={w - 15}
          y={h / 2}
          transform={`rotate(-90 ${w - 15} ${h / 2})`}
          fill="#9ca3af"
          fontSize="10"
          textAnchor="middle"
          className="font-bold tracking-widest uppercase"
        >
          Win Prob %
        </text>
        {}
        {data.map((d, i) => {
          const x = padX + (i * (w - padX * 2)) / data.length;
          const hSpent = (d.spent / maxMoney) * (h - padY * 2);
          const hRem = (d.remaining / maxMoney) * (h - padY * 2);
          return (
            <g
              key={`bar-${i}`}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSelect(d)}
              onMouseMove={(e) => {
                const rect = e.target.closest('.relative').getBoundingClientRect();
                setTooltip({
                  visible: true,
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  content: (
                    <div className="flex flex-col gap-1">
                      <div className="font-black text-theme-text-base border-b border-gray-700 pb-1 uppercase tracking-wider">
                        Round {d.round}
                      </div>
                      <div style={{ color: theme.color1 }}>
                        Spent: ${d.spent}
                      </div>
                      <div style={{ color: theme.color2 }}>
                        Remaining: ${d.remaining}
                      </div>
                      <div style={{ color: theme.color3 }}>
                        Win Prob: {d.prob}%
                      </div>
                      <div className="text-[9px] text-theme-text-faint mt-1 text-center italic">
                        Click for economy details
                      </div>
                    </div>
                  ),
                });
              }}
            >
              {}
              <rect
                x={x}
                y={h - padY - hSpent}
                width={barW}
                height={hSpent}
                fill={theme.color1}
                rx="2"
              />
              {}
              <rect
                x={x}
                y={h - padY - hSpent - hRem}
                width={barW}
                height={hRem}
                fill={theme.color2}
                rx="2"
              />
              {}
              <text
                x={x + barW / 2}
                y={h - 10}
                fill="#9ca3af"
                fontSize="10"
                textAnchor="middle"
                className="font-mono"
              >
                {d.round}
              </text>
            </g>
          );
        })}
        {}
        <path
          d={pathD}
          fill="none"
          stroke={theme.color3}
          strokeWidth="3"
          className="drop-shadow-[0_0_8px_currentColor]"
          style={{ color: theme.color3 }}
        />
        {data.map((d, i) => {
          const x = padX + (i * (w - padX * 2)) / data.length + barW / 2;
          const y = h - padY - (d.prob / maxProb) * (h - padY * 2);
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r="4"
              fill="#0f1722"
              stroke={theme.color3}
              strokeWidth="2"
              className="pointer-events-none"
            />
          );
        })}
      </svg>
      <Tooltip {...tooltip} />
      {}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-4 text-[10px] font-bold text-theme-text-base tracking-wider">
        <div className="flex items-center space-x-1">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: theme.color1 }}
          ></div>
          <span>Spent</span>
        </div>
        <div className="flex items-center space-x-1">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: theme.color2 }}
          ></div>
          <span>Remaining</span>
        </div>
        <div className="flex items-center space-x-1">
          <div
            className="w-4 h-[2px]"
            style={{ backgroundColor: theme.color3 }}
          ></div>
          <span>Win Prob</span>
        </div>
      </div>
    </div>
  );
};
const BubbleChart = ({ data, theme, onSelect }) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });
  const w = 450,
    h = 260;
  const padX = 60,
    padY = 20,
    padBottom = 60;
  const agents = [...new Set(data.map((d) => d.agent))];
  const maps = [...new Set(data.map((d) => d.map))];
  if (agents.length === 0 || maps.length === 0) {
    return (
      <div className="flex w-full h-full items-center justify-center text-theme-text-faint font-bold">
        No synergies found for your search.
      </div>
    );
  }
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        width={w}
        height={h}
        onMouseLeave={() => setTooltip({ visible: false })}
      >
        {}
        {agents.map((_, i) => (
          <line
            key={`hy-${i}`}
            x1={padX}
            y1={padY + (i * (h - padY - padBottom)) / (agents.length - 1 || 1)}
            x2={w - padX + 20}
            y2={padY + (i * (h - padY - padBottom)) / (agents.length - 1 || 1)}
            stroke="#1e2938"
          />
        ))}
        {maps.map((_, i) => (
          <line
            key={`hx-${i}`}
            x1={padX + (i * (w - padX * 2 - 20)) / (maps.length - 1 || 1)}
            y1={padY}
            x2={padX + (i * (w - padX * 2 - 20)) / (maps.length - 1 || 1)}
            y2={h - padBottom}
            stroke="#1e2938"
          />
        ))}
        {}
        {agents.map((agent, i) => {
          const y =
            padY + (i * (h - padY - padBottom)) / (agents.length - 1 || 1);
          return (
            <text
              key={`a-${i}`}
              x={padX - 10}
              y={y + 3}
              fill="#9ca3af"
              fontSize="10"
              textAnchor="end"
              className="font-semibold"
            >
              {agent}
            </text>
          );
        })}
        {}
        {maps.map((m, i) => {
          const x = padX + (i * (w - padX * 2 - 20)) / (maps.length - 1 || 1);
          return (
            <text
              key={`m-${i}`}
              x={x - 5}
              y={h - padBottom + 15}
              fill="#9ca3af"
              fontSize="10"
              textAnchor="end"
              transform={`rotate(-45 ${x - 5} ${h - padBottom + 15})`}
              className="font-semibold"
            >
              {m}
            </text>
          );
        })}
        {}
        {data.map((d, i) => {
          const aIdx = agents.indexOf(d.agent);
          const mIdx = maps.indexOf(d.map);
          const y = (aIdx >= 0 && agents.length > 1)
            ? padY + (aIdx * (h - padY - padBottom)) / (agents.length - 1)
            : padY + (h - padY - padBottom) / 2;
          const x = (mIdx >= 0 && maps.length > 1)
            ? padX + (mIdx * (w - padX * 2 - 20)) / (maps.length - 1)
            : padX + (w - padX * 2 - 20) / 2;
          const pickNum = parseFloat(d.pickRate) || 0;
          const r = Math.max(2, Math.min(24, (pickNum / 300) * 12));
          let color = theme.color1;
          if (d.winRate > 60) color = theme.color2;
          if (d.winRate > 70) color = theme.color3;
          return (
            <circle
              key={`bub-${i}`}
              cx={x}
              cy={y}
              r={r}
              fill={color}
              fillOpacity="0.8"
              className="cursor-pointer hover:stroke-white hover:stroke-[3px] transition-all hover:fill-opacity-100 drop-shadow-[0_0_5px_currentColor]"
              style={{ color }}
              onClick={() => onSelect(d)}
              onMouseMove={(e) => {
                const rect = e.target.closest('.relative').getBoundingClientRect();
                setTooltip({
                  visible: true,
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                  content: (
                    <div className="flex flex-col gap-1">
                      <div className="font-black text-theme-text-base border-b border-gray-700 pb-1">
                        {d.agent} on {d.map}
                      </div>
                      <div className="text-theme-text-base">
                        Pick Rate:{" "}
                        <span className="font-bold text-theme-text-base">
                          {d.pickRate}
                        </span>
                      </div>
                      <div style={{ color }}>
                        Win Rate:{" "}
                        <span className="font-bold">{d.winRate}%</span>
                      </div>
                      <div className="text-[9px] text-theme-text-faint mt-1 text-center italic">
                        Click for map synergy details
                      </div>
                    </div>
                  ),
                });
              }}
            />
          );
        })}
      </svg>
      <Tooltip {...tooltip} />
      {}
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-[10px] font-black tracking-widest text-theme-text-faint uppercase">
        Agents
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] font-black tracking-widest text-theme-text-faint uppercase">
        Maps
      </div>
      {}
      <div className="absolute right-0 top-0 flex flex-col bg-bg-300/90 rounded border border-[#232f40] backdrop-blur-sm pointer-events-none" style={{ padding: "8px" }}>
        <span className="text-[9px] font-bold text-theme-text-muted mb-1">
          Pick Rate
        </span>
        <div className="flex items-center space-x-2 mb-1">
          <circle cx="4" cy="4" r="4" fill="#4b5563" />
          <span className="text-[9px] text-theme-text-base">200+</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <circle cx="3" cy="3" r="3" fill="#4b5563" />
          <span className="text-[9px] text-theme-text-base">100+</span>
        </div>
        <span className="text-[9px] font-bold text-theme-text-muted mb-1">
          Win Rate
        </span>
        <div className="flex items-center space-x-2 mb-1">
          <div
            className="w-2 h-2"
            style={{ backgroundColor: theme.color3 }}
          ></div>
          <span className="text-[9px] text-theme-text-base">High</span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className="w-2 h-2"
            style={{ backgroundColor: theme.color1 }}
          ></div>
          <span className="text-[9px] text-theme-text-base">Low</span>
        </div>
      </div>
    </div>
  );
};
// Official Map Pools by Game
const VALORANT_MAPS = [
  "Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", 
  "Haven", "Icebox", "Lotus", "Pearl", "Split", "Summit", "Sunset"
];

const CROSSFIRE_MAPS = [
  "Ankara", "Black Widow", "Compound", "Eagle Eye", 
  "Mexico", "Port", "Sub Base"
];

const StrategyMap = ({
  theme,
  onSelect,
  availableMatches,
  availableMaps,
  heatmapEvents,
  activeGame,
}) => {
  const isValorant = (activeGame || "VALORANT").toUpperCase() === "VALORANT";
  const ALLOWED_MAPS = isValorant ? VALORANT_MAPS : CROSSFIRE_MAPS;

  // The maps played in this tournament (or default map pool if none)
  const displayedMaps = useMemo(() => {
    if (availableMaps && Array.isArray(availableMaps) && availableMaps.length > 0) {
      return availableMaps;
    }
    return isValorant ? ["Ascent", "Bind", "Haven", "Split"] : ["Ankara", "Black Widow", "Compound"];
  }, [availableMaps, isValorant]);

  const [selectedMap, setSelectedMap] = useState("");
  const [selectedMatch, setSelectedMatch] = useState("All Matches");

  // Auto-select first map if none selected or if activeGame changed
  useEffect(() => {
    if (displayedMaps.length > 0) {
      if (!selectedMap || !displayedMaps.includes(selectedMap)) {
        setSelectedMap(displayedMaps[0]);
        setSelectedMatch("All Matches");
      }
    } else {
      setSelectedMap("");
      setSelectedMatch("All Matches");
    }
  }, [displayedMaps, selectedMap]);

  // Filter matches based on selected map
  const matchesForMap = useMemo(() => {
    if (!selectedMap) return [];
    return availableMatches.filter(m => {
      const matchLower = m.toLowerCase();
      const foundMap = ALLOWED_MAPS.find(map => 
        matchLower.includes(map.toLowerCase().replace(/ /g, '_')) || 
        matchLower.includes(map.toLowerCase())
      );
      
      if (foundMap) {
        return foundMap.toLowerCase() === selectedMap.toLowerCase();
      }
      return m.toLowerCase().includes(selectedMap.toLowerCase());
    });
  }, [availableMatches, selectedMap, ALLOWED_MAPS]);

  // Auto-reset match selection if it doesn't belong to the current map
  useEffect(() => {
    if (selectedMatch !== "All Matches" && !matchesForMap.includes(selectedMatch)) {
      setSelectedMatch("All Matches");
    }
  }, [matchesForMap, selectedMatch]);

  const mapEvents = heatmapEvents
    ? heatmapEvents.filter((h) => {
        const hGame = (h.game || "").toUpperCase();
        const activeGameUpper = (activeGame || "VALORANT").toUpperCase();
        if (hGame && hGame !== activeGameUpper) return false;
        if (!h.match_id) return false;
        
        // Map filter: ONLY check against ALLOWED_MAPS for the active game
        const matchLower = h.match_id.toLowerCase();
        const foundMap = ALLOWED_MAPS.find(map => 
          matchLower.includes(map.toLowerCase().replace(/ /g, '_')) || 
          matchLower.includes(map.toLowerCase())
        );
        if (!foundMap) return false;
        if (foundMap.toLowerCase() !== selectedMap?.toLowerCase()) return false;
        
        // Match filter
        if (selectedMatch !== "All Matches" && h.match_id !== selectedMatch) return false;
        
        return true;
      })
    : [];

  const formatMatchName = (matchId) => {
    let cleanId = matchId.includes('___') ? matchId.split('___')[1] : matchId;
    return cleanId.replace(/_/g, ' ').replace(/\d{13}$/, '').trim() || "Unknown Set";
  };
  
  let mapNameForImage = selectedMap || (isValorant ? "Ascent" : "Ankara");
  const [filterType, setFilterType] = useState("ALL");
  const [plantColor, setPlantColor] = useState(() => localStorage.getItem('plantColor') || '#ef4444');
  const [defuseColor, setDefuseColor] = useState(() => localStorage.getItem('defuseColor') || '#10b981');

  useEffect(() => {
    const handleColors = (e) => {
      if (e?.detail) {
        if (e.detail.plantColor) setPlantColor(e.detail.plantColor);
        if (e.detail.defuseColor) setDefuseColor(e.detail.defuseColor);
      } else {
        setPlantColor(localStorage.getItem('plantColor') || '#ef4444');
        setDefuseColor(localStorage.getItem('defuseColor') || '#10b981');
      }
    };
    window.addEventListener('mapColorsChanged', handleColors);
    window.addEventListener('storage', handleColors);
    return () => {
      window.removeEventListener('mapColorsChanged', handleColors);
      window.removeEventListener('storage', handleColors);
    };
  }, []);

  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });
  const totalEvents = mapEvents.length;
  const plants = mapEvents.filter((h) => h.event_type === "Plant").length;
  const defuses = mapEvents.filter((h) => h.event_type === "Defuse").length;
  const plantPct =
    totalEvents > 0 ? Math.round((plants / totalEvents) * 100) : 0;
  const defusePct =
    totalEvents > 0 ? Math.round((defuses / totalEvents) * 100) : 0;

  const filteredEvents = mapEvents
    .filter((h) => {
      if (filterType === "PLANT") return h.event_type === "Plant";
      if (filterType === "DEFUSE") return h.event_type === "Defuse";
      return true;
    })
    .sort((a, b) => {
      const aIsDefuse = (a.event_type || "").toLowerCase() === "defuse" ? 1 : 0;
      const bIsDefuse = (b.event_type || "").toLowerCase() === "defuse" ? 1 : 0;
      return aIsDefuse - bIsDefuse;
    });

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer group p-2"
      onClick={() =>
        onSelect({
          type: "Heatmap",
          area: selectedMap || (isValorant ? "Ascent" : "Ankara"),
          matchName: selectedMatch !== "All Matches" ? formatMatchName(selectedMatch) : "All Matches",
          selectedMatch,
          filterType,
          events: filteredEvents,
          plantPct,
          defusePct,
          details: selectedMatch !== "All Matches"
            ? `${isValorant ? "Valorant" : "Crossfire"} strategy heatmap for ${selectedMap || "Map"} (${formatMatchName(selectedMatch)}).`
            : `${isValorant ? "Valorant" : "Crossfire"} strategy heatmap for ${selectedMap || "Map"}.`,
        })
      }
    >
      {/* Top Controls Ribbon */}
      <div
        className="w-full max-w-[1100px] flex flex-wrap items-center justify-between gap-3 mb-4 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Played Maps Chips & Match Selector */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {displayedMaps && displayedMaps.length > 0 && (
            <div className="flex items-center gap-1.5 bg-bg-300/80 border border-[#2a3648] rounded-xl p-1 flex-wrap">
              {displayedMaps.map((m) => {
                const isSelected = selectedMap?.toLowerCase() === m.toLowerCase();
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedMap(m);
                      setSelectedMatch("All Matches");
                    }}
                    className={`px-3 py-1.5 rounded-lg font-tactical text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        : "text-theme-text-muted hover:text-theme-text-base hover:bg-white/5"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative group cursor-pointer">
            <select
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(e.target.value)}
              className="bg-bg-300 border border-[#2a3648] text-xs font-black text-theme-text-base tracking-wider drop-shadow-md outline-none rounded-xl hover:border-emerald-500 transition-colors cursor-pointer px-3.5 py-2 max-w-[280px] truncate"
            >
              <option value="All Matches">ALL MATCHES</option>
              {matchesForMap.map((m) => (
                <option key={m} value={m}>
                  {formatMatchName(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Event Filters & Click Hint */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-bg-300/80 border border-[#2a3648] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                filterType === "ALL"
                  ? "bg-white/10 text-theme-text-base shadow-sm"
                  : "text-theme-text-muted hover:text-theme-text-base"
              }`}
            >
              All ({totalEvents})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("PLANT")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                filterType === "PLANT"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                  : "text-theme-text-muted hover:text-red-400"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Plants ({plants})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("DEFUSE")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                filterType === "DEFUSE"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "text-theme-text-muted hover:text-emerald-400"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Defuse ({defuses})
            </button>
          </div>

          <span className="hidden sm:inline-block text-[10px] font-bold text-theme-text-muted bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg">
            Click map to inspect
          </span>
        </div>
      </div>

      {/* Maxed-Out Map Canvas */}
      <div className="relative w-full max-w-[1100px] aspect-[4/3] bg-bg-100 rounded-2xl border border-[#2a3648] overflow-hidden shadow-2xl flex items-center justify-center group-hover:border-emerald-500/50 transition-all">
        {selectedMatch && selectedMatch !== "No Data" ? (
          <>
            <img
              src={`/assets/${mapNameForImage.replace(/ /g, "_")}.png`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
              className="absolute inset-0 w-full h-full object-contain opacity-85 select-none"
              alt="Map"
            />
            {filteredEvents.map((h) => {
              const isDefuse = (h.event_type || "").toLowerCase() === "defuse";
              return (
                <div
                  key={h.id}
                  className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white animate-in zoom-in hover:scale-150 transition-transform cursor-help hover:!z-50"
                  style={{
                    left: `${h.coord_x}%`,
                    top: `${h.coord_y}%`,
                    zIndex: isDefuse ? 40 : 30,
                    backgroundColor: isDefuse ? defuseColor : plantColor,
                    boxShadow: `0 0 12px ${isDefuse ? defuseColor : plantColor}`
                  }}
                  onMouseMove={(e) => {
                    e.stopPropagation();
                    const rect = e.target.closest('.relative').getBoundingClientRect();
                    setTooltip({
                      visible: true,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      content: (
                        <div className="flex flex-col gap-1 min-w-[80px]">
                          <div
                            className="font-black uppercase tracking-widest text-xs border-b pb-1"
                            style={{
                              color: isDefuse ? defuseColor : plantColor,
                              borderColor: `${isDefuse ? defuseColor : plantColor}40`
                            }}
                          >
                            {isDefuse ? (h.event_type || "Defuse") : (h.event_type === "Plant" ? "Plant Success" : h.event_type)}
                          </div>
                          <div className="text-theme-text-base font-bold">
                            Round <span className="text-theme-text-base">{h.round_number}</span>
                          </div>
                        </div>
                      ),
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false })}
                ></div>
              );
            })}
            <Tooltip {...tooltip} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-theme-text-muted gap-2">
            <span className="text-xs font-black uppercase tracking-widest">No Map Data</span>
          </div>
        )}

        {/* Floating Bottom-Right Legend */}
        <div
          className="absolute bottom-4 right-4 bg-bg-100/90 rounded-xl border border-[#232f40] flex flex-col items-start backdrop-blur-md pointer-events-none shadow-xl min-w-[150px] p-3.5 z-20"
        >
          <span className="text-[10px] font-black text-theme-text-base mb-2.5 uppercase tracking-widest">
            Legend
          </span>
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-3 h-3 rounded-full border border-white shrink-0"
                style={{ backgroundColor: defuseColor, boxShadow: `0 0 8px ${defuseColor}` }}
              ></div>
              <span className="text-[10px] font-bold text-theme-text-base uppercase">
                Defuse
              </span>
            </div>
            <span className="text-[10px] font-bold font-mono" style={{ color: defuseColor }}>
              {defusePct}%
            </span>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-3 h-3 rounded-full border border-white shrink-0"
                style={{ backgroundColor: plantColor, boxShadow: `0 0 8px ${plantColor}` }}
              ></div>
              <span className="text-[10px] font-bold text-theme-text-base uppercase">
                Plant Success
              </span>
            </div>
            <span className="text-[10px] font-bold font-mono" style={{ color: plantColor }}>
              {plantPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
const Analytics = ({ globalGame, globalTournament }) => {
  const activeGame = globalGame || "VALORANT";
  const [dataType, setDataType] = useState("ALL PLAYERS");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalData, setModalData] = useState(null);
  const [modalTooltip, setModalTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });
  const [matchRecords, setMatchRecords] = useState([]);
  const [heatmapEvents, setHeatmapEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantColor, setPlantColor] = useState(() => localStorage.getItem('plantColor') || '#ef4444');
  const [defuseColor, setDefuseColor] = useState(() => localStorage.getItem('defuseColor') || '#10b981');

  useEffect(() => {
    const handleColors = (e) => {
      if (e?.detail) {
        if (e.detail.plantColor) setPlantColor(e.detail.plantColor);
        if (e.detail.defuseColor) setDefuseColor(e.detail.defuseColor);
      } else {
        setPlantColor(localStorage.getItem('plantColor') || '#ef4444');
        setDefuseColor(localStorage.getItem('defuseColor') || '#10b981');
      }
    };
    window.addEventListener('mapColorsChanged', handleColors);
    window.addEventListener('storage', handleColors);
    return () => {
      window.removeEventListener('mapColorsChanged', handleColors);
      window.removeEventListener('storage', handleColors);
    };
  }, []);
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const fetchRecords = async () => {
      try {
        const queryTournament = globalTournament || "all";
        const res = await apiFetch(
          `/api/match-records?tournament=${encodeURIComponent(queryTournament)}`,
        );
        if (res.ok && isMounted) {
          const data = await res.json();
          setMatchRecords(data || []);
        }
      } catch (e) {
        console.error("Error fetching match records:", e);
      }
    };
    const fetchHeatmap = async () => {
      try {
        const res = await apiFetch("/api/stats/heatmap");
        if (res.ok && isMounted) {
          const eventsData = await res.json();
          setHeatmapEvents(eventsData || []);
        }
      } catch (e) {
        console.error("Error fetching heatmap events:", e);
      }
    };

    Promise.all([fetchRecords(), fetchHeatmap()]).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [globalTournament]);
  const tournamentName = useMemo(() => {
    if (!globalTournament || globalTournament === "all") return "";
    return typeof globalTournament === "string" ? globalTournament : (globalTournament?.name || "");
  }, [globalTournament]);

  // Isolate heatmap events strictly to the current tournament
  const currentTournamentHeatmapEvents = useMemo(() => {
    const gameUpper = (activeGame || "VALORANT").toUpperCase();
    
    // First filter by game
    const gameEvents = (heatmapEvents || []).filter(
      (h) => !h.game || h.game.toUpperCase() === gameUpper
    );

    // If no specific tournament is selected (or "all"), return all events for this game
    if (!tournamentName) {
      return gameEvents;
    }

    // Extract tournament teams and maps from matchRecords to match legacy IDs without tournament prefix
    const tTeams = Array.from(
      new Set(matchRecords.map((r) => (r.team_name || "").toLowerCase().trim()).filter(Boolean))
    );
    const tMaps = Array.from(
      new Set(matchRecords.map((r) => (r.map || "").toLowerCase().trim()).filter(Boolean))
    );

    const tPrefix = `${tournamentName}___`.toLowerCase();

    return gameEvents.filter((h) => {
      if (!h.match_id) return false;
      const lowerId = h.match_id.toLowerCase();

      // Case 1: ID explicitly prefixed with tournament name
      if (lowerId.startsWith(tPrefix)) return true;

      // Case 2: Legacy ID matching tournament teams and maps
      const hasTeam = tTeams.length > 0 && tTeams.some((team) => lowerId.includes(team));
      const hasMap = tMaps.length > 0 && tMaps.some((map) => lowerId.includes(map.replace(/ /g, "_")) || lowerId.includes(map));

      return hasTeam && hasMap;
    });
  }, [heatmapEvents, activeGame, tournamentName, matchRecords]);

  const uniqueMaps = useMemo(() => {
    const gameUpper = (activeGame || "VALORANT").toUpperCase();
    const isVal = gameUpper === "VALORANT";
    const allowed = isVal ? VALORANT_MAPS : CROSSFIRE_MAPS;
    const gameRecords = matchRecords.filter(
      (r) => (r.game || "").toUpperCase() === gameUpper,
    );
    const maps = new Set();
    // 1. Maps played from match records in this tournament
    gameRecords.forEach((r) => {
      if (r.map && r.map !== "TBD" && r.map !== "-") {
        const found = allowed.find(m => m.toLowerCase() === r.map.toLowerCase());
        if (found) maps.add(found);
      }
    });
    // 2. Maps from current tournament's heatmap events
    currentTournamentHeatmapEvents.forEach((h) => {
      if (h.match_id) {
        const matchLower = h.match_id.toLowerCase();
        const found = allowed.find(m => 
          matchLower.includes(m.toLowerCase().replace(/ /g, '_')) || 
          matchLower.includes(m.toLowerCase())
        );
        if (found) maps.add(found);
      }
    });

    return Array.from(maps).sort();
  }, [matchRecords, activeGame, currentTournamentHeatmapEvents]);

  const uniqueMatches = useMemo(() => {
    const allowed = (activeGame || "VALORANT").toUpperCase() === "VALORANT" ? VALORANT_MAPS : CROSSFIRE_MAPS;
    const matches = new Set();
    currentTournamentHeatmapEvents.forEach((h) => {
      if (h.match_id) {
        const matchLower = h.match_id.toLowerCase();
        const hasAllowedMap = allowed.some(map => 
          matchLower.includes(map.toLowerCase().replace(/ /g, '_')) || 
          matchLower.includes(map.toLowerCase())
        );
        if (hasAllowedMap) {
          matches.add(h.match_id);
        }
      }
    });
    return Array.from(matches).sort((a, b) => b.localeCompare(a));
  }, [currentTournamentHeatmapEvents, activeGame]);

  const dynamicSynergy = useMemo(() => {
    const gameUpper = activeGame.toUpperCase();
    const gameRecords = matchRecords.filter((r) => r.game.toUpperCase() === gameUpper);
    
    const synergyMap = {};
    gameRecords.forEach((r) => {
      let agent = r.group_label || r.agent;
      if (activeGame.toUpperCase() === "VALORANT") {
        agent = r.agent || r.group_label;
        if (agent === "Rifler") return; // Ignore legacy hardcoded Rifler entries in Valorant
      }
      
      if (!agent || agent === "-" || agent === "Unknown" || agent === "null") return;
      
      const mapName = r.map;
      if (!mapName || mapName === "TBD" || mapName === "-") return;
      
      const key = `${agent}_${mapName}`;
      if (!synergyMap[key]) {
        synergyMap[key] = { agent, map: mapName, picks: 0, wins: 0 };
      }
      synergyMap[key].picks += 1;
      const isWin = String(r.win).toLowerCase() === 'true' || r.win === 1;
      if (isWin) synergyMap[key].wins += 1;
    });

    const synergyArr = Object.values(synergyMap).map((s) => ({
      agent: s.agent,
      map: s.map,
      pickRate: s.picks,
      winRate: s.picks > 0 ? Math.round((s.wins / s.picks) * 100) : 0
    })).sort((a, b) => b.pickRate - a.pickRate);

    return synergyArr;
  }, [matchRecords, activeGame]);
  // --- DATABASE-CONNECTED RADAR SKILL MATRIX ---
  const safeDiv = (num, den, fallback = 0) => (!den || isNaN(den) || den === 0) ? fallback : num / den;

  const computePlayerRadarStats = (pRecords, isVal) => {
    let totK = 0, totD = 0, totA = 0, totHs = 0, totRnd = 0, totAcs = 0, totEcon = 0, totP = 0, totDef = 0, totAces = 0, totFk = 0, wins = 0;
    pRecords.forEach((r) => {
      const k = Math.min(100, Math.max(0, Number(r.kills) || 0));
      const d = Math.min(100, Math.max(0, Number(r.deaths) || 0));
      const a = Math.min(100, Math.max(0, Number(r.assists) || 0));
      const hs = Math.min(100, Math.max(0, Number(r.headshots) || 0));
      const rnd = Math.min(100, Math.max(1, Number(r.rounds) || 16));
      const acs = Math.min(600, Math.max(0, Number(r.acs) || 0));
      const econ = Math.min(200, Math.max(0, Number(r.econ) || 0));
      const p = Math.min(20, Math.max(0, Number(r.plants) || 0));
      const def = Math.min(20, Math.max(0, Number(r.defuse ?? r.defuses) || 0));
      const aces = Math.min(10, Math.max(0, Number(r.aces) || 0));
      const fk = Math.min(20, Math.max(0, Number(r.first_kills) || 0));
      const isWin = String(r.win).toLowerCase() === 'true' || r.win === 1;

      totK += k; totD += d; totA += a; totHs += hs; totRnd += rnd;
      totAcs += acs; totEcon += econ; totP += p; totDef += def;
      totAces += aces; totFk += fk; if (isWin) wins++;
    });

    const n = Math.max(1, pRecords.length);
    const safeRnd = Math.max(1, totRnd);
    const kd = totD > 0 ? totK / totD : totK;
    const kpr = safeDiv(totK, safeRnd);
    const apr = safeDiv(totA, safeRnd);
    const avgAcs = safeDiv(totAcs, n);
    const avgEcon = safeDiv(totEcon, n);
    const winRate = safeDiv(wins, n);
    const hsPct = totK > 0 ? (totHs / totK) * 100 : 0;

    const kda = calculateAverageMapKda(pRecords);
    const defusePerMatch = safeDiv(totDef, n);
    const plantPerMatch = safeDiv(totP, n);
    const tradeRate = safeDiv(totA + totFk, safeRnd);

    let s1, s2, s3, s4, s5, s6;
    if (isVal) {
      // 1. Agent Proficiency: Win Rate + ACS + K/D
      s1 = Math.round(Math.min(98, Math.max(25, (winRate * 45) + (Math.min(350, avgAcs) / 350 * 35) + (Math.min(2, kd) / 2 * 18))));
      // 2. Highest K/DA: (K + A) / D ratio scaled from baseline 1.0 to 2.5+
      s2 = Math.round(Math.min(98, Math.max(25, (Math.min(2.5, kda) / 2.5 * 65) + 30)));
      // 3. Highest Defuse: Average defuses per match + defuse success
      s3 = Math.round(Math.min(98, Math.max(25, (Math.min(3, defusePerMatch) / 3 * 55) + (totDef > 0 ? 35 : 25))));
      // 4. Highest Trades: Assists + First Kills per round + HS trade precision
      s4 = Math.round(Math.min(98, Math.max(25, (Math.min(0.5, tradeRate) / 0.5 * 60) + (hsPct > 0 ? Math.min(20, hsPct / 2) : 15) + 15)));
      // 5. Highest Plant: Average plants per match + plant contribution
      s5 = Math.round(Math.min(98, Math.max(25, (Math.min(4, plantPerMatch) / 4 * 55) + (totP > 0 ? 35 : 25))));
      // 6. Ace: Recorded aces + multi-frag ace potential (KPR)
      s6 = Math.round(Math.min(98, Math.max(25, (Math.min(3, totAces) / 3 * 60) + (totAces > 0 ? 35 : Math.min(30, kpr * 25 + 15)))));
    } else {
      // Crossfire
      // 1. Weapon Mastery: K/D + Headshot %
      s1 = Math.round(Math.min(98, Math.max(30, (Math.min(2.5, kd) / 2.5 * 55) + (Math.min(50, hsPct) / 50 * 43))));
      // 2. Highest K/DA
      s2 = Math.round(Math.min(98, Math.max(25, (Math.min(2.5, kda) / 2.5 * 65) + 30)));
      // 3. Highest Defuse
      s3 = Math.round(Math.min(98, Math.max(25, (Math.min(3, defusePerMatch) / 3 * 55) + (totDef > 0 ? 35 : 25))));
      // 4. Highest Trades
      s4 = Math.round(Math.min(98, Math.max(25, (Math.min(0.5, tradeRate) / 0.5 * 60) + (hsPct > 0 ? Math.min(20, hsPct / 2) : 15) + 15)));
      // 5. Highest Plant
      s5 = Math.round(Math.min(98, Math.max(25, (Math.min(4, plantPerMatch) / 4 * 55) + (totP > 0 ? 35 : 25))));
      // 6. Ace
      s6 = Math.round(Math.min(98, Math.max(25, (Math.min(3, totAces) / 3 * 60) + (totAces > 0 ? 35 : Math.min(30, kpr * 25 + 15)))));
    }

    return {
      stats: [s1, s2, s3, s4, s5, s6],
      meta: {
        matches: pRecords.length,
        rounds: totRnd,
        kd: kd.toFixed(2),
        kda: kda.toFixed(2),
        winRate: Math.round(winRate * 100),
        acs: Math.round(avgAcs),
        kpr: kpr.toFixed(2),
        hsPct: Math.round(hsPct),
        kills: totK,
        deaths: totD,
        assists: totA,
        plants: totP,
        defuses: totDef,
        aces: totAces,
        trades: totA + totFk,
      },
    };
  };

  const dynamicRadar = useMemo(() => {
    const isVal = activeGame.toUpperCase() === "VALORANT";
    const gameUpper = isVal ? "VALORANT" : "CROSSFIRE";
    let gameRecords = matchRecords.filter(
      (r) => (r.game || "").toUpperCase() === gameUpper,
    );

    if (gameRecords.length === 0 && matchRecords.length > 0) {
      gameRecords = matchRecords;
    }

    const fallbackVal = [
      { name: "#1 Top Player", ign: "Top 1 Player", color: "#00d0eb", stats: [88, 92, 78, 86, 82, 85], tier: "#1 Top Player", rank: 1, isTopPlayer: true },
      { name: "#2 Top Player", ign: "Top 2 Player", color: "#ff3366", stats: [78, 80, 68, 74, 72, 70], tier: "#2 Top Player", rank: 2, isTopPlayer: true },
      { name: "#3 Top Player", ign: "Top 3 Player", color: "#a78bfa", stats: [62, 60, 52, 58, 55, 48], tier: "#3 Top Player", rank: 3, isTopPlayer: true },
    ];
    const fallbackCf = [
      { name: "#1 Top Player", ign: "Top 1 Player", color: "#f59e0b", stats: [86, 90, 75, 88, 80, 84], tier: "#1 Top Player", rank: 1, isTopPlayer: true },
      { name: "#2 Top Player", ign: "Top 2 Player", color: "#4c7fd6", stats: [76, 78, 66, 76, 70, 68], tier: "#2 Top Player", rank: 2, isTopPlayer: true },
      { name: "#3 Top Player", ign: "Top 3 Player", color: "#10b981", stats: [60, 58, 50, 56, 52, 45], tier: "#3 Top Player", rank: 3, isTopPlayer: true },
    ];

    if (gameRecords.length === 0) {
      return isVal ? fallbackVal : fallbackCf;
    }

    const playerMap = {};
    gameRecords.forEach((r) => {
      const ign = r.ign ? String(r.ign).trim() : null;
      if (!ign) return;
      if (!playerMap[ign]) playerMap[ign] = [];
      playerMap[ign].push(r);
    });

    const playerList = Object.entries(playerMap).map(([ign, recs]) => {
      const { stats, meta } = computePlayerRadarStats(recs, isVal);
      const overall = Math.round(stats.reduce((a, b) => a + b, 0) / 6);
      return { ign, stats, meta, overall };
    });

    if (playerList.length === 0) {
      return isVal ? fallbackVal : fallbackCf;
    }

    playerList.sort((a, b) => b.overall - a.overall);

    const rankColors = isVal
      ? ["#00d0eb", "#ff3366", "#a78bfa"]
      : ["#f59e0b", "#4c7fd6", "#10b981"];

    const rankTiers = ["#1 Top Player", "#2 Top Player", "#3 Top Player"];

    // Map the actual top 3 individual players sorted by overall rating
    const top3Players = playerList.slice(0, 3).map((p, idx) => ({
      name: `#${idx + 1} ${p.ign}`,
      ign: p.ign,
      color: rankColors[idx % rankColors.length],
      stats: p.stats,
      meta: p.meta,
      overall: p.overall,
      tier: rankTiers[idx] || `#${idx + 1} Top Player`,
      rank: idx + 1,
      isTopPlayer: true,
      sampleCount: p.meta?.matches || 1,
      totalRecords: gameRecords.length,
    }));

    // If fewer than 3 players with records exist in DB, backfill remaining slots from fallback
    const fallbacks = isVal ? fallbackVal : fallbackCf;
    while (top3Players.length < 3 && top3Players.length < fallbacks.length) {
      const idx = top3Players.length;
      top3Players.push({
        ...fallbacks[idx],
        rank: idx + 1,
      });
    }

    let result = [];
    if (dataType === "PRO PLAYERS") {
      result = top3Players.slice(0, 2);
    } else if (dataType === "CASUAL") {
      result = top3Players.slice(2, 3);
    } else {
      result = [...top3Players];
    }

    // Dynamic Player Search matching against database records:
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchedPlayers = playerList.filter(p => p.ign.toLowerCase().includes(q)).slice(0, 3);
      if (matchedPlayers.length > 0) {
        const playerColors = ["#38bdf8", "#fbbf24", "#34d399"];
        matchedPlayers.forEach((mp, idx) => {
          if (!result.some(r => r.ign && r.ign.toLowerCase() === mp.ign.toLowerCase())) {
            result.push({
              name: mp.ign,
              ign: mp.ign,
              color: playerColors[idx % playerColors.length],
              stats: mp.stats,
              meta: mp.meta,
              overall: mp.overall,
              isIndividualPlayer: true,
              tier: "Searched Player Profile",
            });
          }
        });
      }
    }

    return result;
  }, [matchRecords, activeGame, dataType, searchQuery]);

  const valorantTheme = {
    color1: "#ff3366", // Red
    color2: "#00d0eb", // Cyan
    color3: "#a78bfa", // Purple
  };
  const crossfireTheme = {
    color1: "#4c7fd6", // Blue
    color2: "#f59e0b", // Amber
    color3: "#10b981", // Green
  };
  const valData = {
    theme: valorantTheme,
    radarAxes: [
      "Agent Proficiency",
      "Highest K/DA",
      "Highest Defuse",
      "Highest Trades",
      "Highest Plant",
      "Ace",
    ],
    radar: dynamicRadar,
    econ: [
      { round: 1, spent: 800, remaining: 150, prob: 45 },
      { round: 2, spent: 1500, remaining: 1000, prob: 52 },
      { round: 3, spent: 3900, remaining: 200, prob: 60 },
      { round: 4, spent: 4200, remaining: 500, prob: 65 },
      { round: 5, spent: 3000, remaining: 2000, prob: 58 },
      { round: 6, spent: 4500, remaining: 1500, prob: 70 },
      { round: 7, spent: 5000, remaining: 3000, prob: 75 },
      { round: 8, spent: 4800, remaining: 4500, prob: 82 },
      { round: 9, spent: 5500, remaining: 6000, prob: 90 },
    ],
    synergy: [
      { agent: "Jett", map: "Haven", pickRate: 280, winRate: 52 },
      { agent: "Omen", map: "Haven", pickRate: 220, winRate: 65 },
      { agent: "Sova", map: "Ascent", pickRate: 290, winRate: 72 },
      { agent: "Killjoy", map: "Ascent", pickRate: 250, winRate: 68 },
      { agent: "Viper", map: "Breeze", pickRate: 260, winRate: 75 },
      { agent: "Raze", map: "Split", pickRate: 240, winRate: 58 },
      { agent: "Breach", map: "Fracture", pickRate: 180, winRate: 62 },
      { agent: "Cypher", map: "Split", pickRate: 150, winRate: 48 },
      { agent: "Phoenix", map: "Haven", pickRate: 120, winRate: 45 },
    ],
  };
  const cfData = {
    theme: crossfireTheme,
    radarAxes: [
      "Weapon Mastery",
      "Highest K/DA",
      "Highest Defuse",
      "Highest Trades",
      "Highest Plant",
      "Ace",
    ],
    radar: dynamicRadar,
    econ: [
      { round: 1, spent: 500, remaining: 200, prob: 50 },
      { round: 2, spent: 1200, remaining: 800, prob: 55 },
      { round: 3, spent: 2500, remaining: 1000, prob: 62 },
      { round: 4, spent: 3000, remaining: 1500, prob: 68 },
      { round: 5, spent: 2800, remaining: 2500, prob: 64 },
      { round: 6, spent: 3500, remaining: 3000, prob: 72 },
      { round: 7, spent: 4000, remaining: 4000, prob: 78 },
      { round: 8, spent: 4500, remaining: 5000, prob: 85 },
      { round: 9, spent: 5000, remaining: 7000, prob: 95 },
    ],
    synergy: [
      { agent: "Sniper", map: "Black Widow", pickRate: 270, winRate: 70 },
      { agent: "Rifler", map: "Black Widow", pickRate: 290, winRate: 55 },
      { agent: "Assault", map: "Port", pickRate: 250, winRate: 60 },
      { agent: "Support", map: "Port", pickRate: 180, winRate: 65 },
      { agent: "Sniper", map: "Eagle Eye", pickRate: 240, winRate: 75 },
      { agent: "Rifler", map: "Eagle Eye", pickRate: 260, winRate: 58 },
      { agent: "Assault", map: "Sub Base", pickRate: 210, winRate: 62 },
      { agent: "Support", map: "Sub Base", pickRate: 150, winRate: 48 },
      { agent: "Sniper", map: "Ankara", pickRate: 190, winRate: 50 },
    ],
  };
  const currentData = activeGame === "VALORANT" ? valData : cfData;
  const activeSynergyData = dynamicSynergy;
  
  // Filter Data based on Search Query
  const sq = searchQuery.toLowerCase().trim();
  const filteredRadar = useMemo(() => {
    if (!sq) return dynamicRadar;
    const hasPlayerMatch = dynamicRadar.some(p => p.isIndividualPlayer);
    if (hasPlayerMatch) return dynamicRadar;
    const filtered = dynamicRadar.filter(p => p.name.toLowerCase().includes(sq));
    return filtered.length > 0 ? filtered : dynamicRadar;
  }, [dynamicRadar, sq]);

  const filteredSynergy = activeSynergyData.filter(
    (s) =>
      s.agent.toLowerCase().includes(sq) || s.map.toLowerCase().includes(sq),
  );
  // Modal Handlers
  const openRadarOverview = (player) => {
    setModalData({
      title: `${player.name} Skill Overview`,
      description: player.isIndividualPlayer
        ? `Detailed performance metrics for player ${player.name} calculated across all active database records.`
        : `Aggregated benchmark tier computed across ${player.sampleCount || "all"} players and ${player.totalRecords || matchRecords.length} match records in the database.`,
      data: player,
      isRadar: true,
    });
  };
  const openEconOverview = (round) => {
    setModalData({
      title: `Round ${round.round} Economic Analysis`,
      description:
        "Deep dive into the financial decisions made during this specific round and how it impacted the overall win probability.",
      data: round,
    });
  };
  const openSynergyOverview = (synergy) => {
    const matchingRecords = matchRecords.filter((r) => {
      const rAgent = r.agent || r.group_label;
      const rMap = r.map;
      return (
        rAgent &&
        rMap &&
        rAgent.toLowerCase() === synergy.agent.toLowerCase() &&
        rMap.toLowerCase() === synergy.map.toLowerCase()
      );
    });

    let totalKills = 0, totalDeaths = 0, totalAssists = 0, totalRounds = 0, totalAcs = 0, totalHs = 0, calculatedWins = 0;
    const playersSet = new Set();
    const teamsSet = new Set();

    matchingRecords.forEach((r) => {
      totalKills += Number(r.kills) || 0;
      totalDeaths += Number(r.deaths) || 0;
      totalAssists += Number(r.assists) || 0;
      totalRounds += Number(r.rounds) || 0;
      totalAcs += Number(r.acs) || 0;
      totalHs += Number(r.headshots) || 0;
      if (r.ign && r.ign !== "-" && r.ign !== "Unknown") playersSet.add(r.ign);
      if (r.team_name) teamsSet.add(r.team_name);
      const isWin = String(r.win).toLowerCase() === 'true' || r.win === 1;
      if (isWin) calculatedWins++;
    });

    const sampleCount = matchingRecords.length || synergy.pickRate || 1;
    const avgAcs = sampleCount > 0 ? Math.round(totalAcs / sampleCount) : 0;
    const kd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);
    const avgKills = sampleCount > 0 ? (totalKills / sampleCount).toFixed(1) : "0.0";
    const avgDeaths = sampleCount > 0 ? (totalDeaths / sampleCount).toFixed(1) : "0.0";
    const avgAssists = sampleCount > 0 ? (totalAssists / sampleCount).toFixed(1) : "0.0";
    const hsPct = totalKills > 0 ? Math.round((totalHs / totalKills) * 100) : 0;
    const winRate = synergy.winRate ?? (sampleCount > 0 ? Math.round((calculatedWins / sampleCount) * 100) : 0);
    const wins = matchingRecords.length > 0 ? calculatedWins : (winRate >= 50 ? synergy.pickRate || 1 : 0);
    const losses = Math.max(0, sampleCount - wins);

    setModalData({
      title: `${synergy.agent} on ${synergy.map} Synergy`,
      description: `Comprehensive tactical assessment of ${synergy.agent} deployment on ${synergy.map}.`,
      data: {
        type: "Synergy",
        agent: synergy.agent,
        map: synergy.map,
        pickRate: synergy.pickRate || sampleCount,
        winRate,
        wins,
        losses,
        sampleCount,
        avgAcs,
        kd,
        avgKills,
        avgDeaths,
        avgAssists,
        hsPct,
        players: Array.from(playersSet),
        teams: Array.from(teamsSet),
      },
    });
  };
  const openHeatmapOverview = (heatmap) => {
    setModalData({
      title: `Heatmap: ${heatmap.area}${heatmap.matchName && heatmap.matchName !== 'All Matches' ? ` — ${heatmap.matchName}` : ''}`,
      description: heatmap.details,
      data: heatmap,
    });
  };
  const accent = activeGame.toUpperCase() === "VALORANT" ? "#ff4655" : "#4c7fd6";
  const accentAlt = activeGame.toUpperCase() === "VALORANT" ? "#a855f7" : "#22d3ee";

  if (loading) {
    return (
      <div className="flex-1 bg-bg-100 text-theme-text-base flex flex-col items-center justify-center p-12 min-h-[500px] animate-fade-in">
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 border-r-emerald-400 animate-spin" />
          <div className="absolute w-10 h-10 rounded-full border border-emerald-400/50 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-400/60 flex items-center justify-center text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.5)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
        </div>
        <div className="font-tactical text-xs font-black uppercase tracking-[0.25em] text-emerald-400 mb-2">
          Loading Analytics & Strategy Heatmaps...
        </div>
        <div className="font-tactical text-[10px] font-bold text-slate-500 uppercase tracking-[0.16em]">
          Synthesizing round telemetry & map strategies
        </div>
        <div className="w-48 h-1.5 bg-slate-900 rounded-full mt-6 overflow-hidden border border-emerald-500/20">
          <div className="h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-full animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-100 text-theme-text-base overflow-y-auto flex flex-col h-full custom-scrollbar relative animate-fade-in">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .a-fade { animation: fadeInUp 0.45s ease-out both; }
        .a-d1 { animation-delay: 0.08s; }
        .a-d2 { animation-delay: 0.16s; }
        .a-d3 { animation-delay: 0.24s; }
      `}</style>

      {/* ═══════ HERO HEADER ═══════ */}
      <div className="relative overflow-hidden border-b border-slate-800/60 shrink-0" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d1420 100%)" }}>
        {/* Gradient accent */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${accent}12, transparent 55%, ${accentAlt}08)` }} />
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, ${accentAlt}, transparent)` }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full max-w-[1400px] mx-auto" style={{ padding: "24px 40px" }}>
          {/* Title block */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: accent }}>
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-[0.15em] text-theme-text-base">Analytics</h1>
              <p className="text-[10px] text-theme-text-muted mt-0.5 font-medium tracking-wide">
                {activeGame} &bull; {globalTournament || "All Tournaments"} &bull; {matchRecords.length} Database Records Connected
              </p>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Data Type selector */}
            <div className="flex items-center gap-2 bg-bg-200 border border-slate-700/50 rounded-xl overflow-hidden">
              <span className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest pl-3">Type</span>
              <select
                className="bg-transparent text-xs font-black text-theme-text-base focus:outline-none cursor-pointer pr-3"
                style={{ padding: "10px 12px 10px 4px", color: accent }}
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
              >
                <option value="ALL PLAYERS" style={{ background: "#0f172a" }}>All Players</option>
                <option value="PRO PLAYERS" style={{ background: "#0f172a" }}>Pro Players</option>
                <option value="CASUAL" style={{ background: "#0f172a" }}>Casual</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: "12px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Filter by Player, Agent, or Map..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-bg-200 border border-slate-700/50 text-sm text-theme-text-base rounded-xl focus:outline-none transition-all placeholder-slate-600 font-medium"
                style={{ padding: "10px 16px 10px 38px", width: "280px", borderColor: searchQuery ? accent : undefined }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ MAIN DASHBOARD GRID ═══════ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col items-center" style={{ padding: "32px 40px 64px" }}>
        <div className="w-full max-w-[1400px] grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Radar — Player Skill Matrix */}
          <div className="a-fade">
            <Card
              title="Top Players Skill Matrix"
              accent={accent}
              badge={`Top 3 Players • ${matchRecords.length} DB Records`}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
                </svg>
              }
            >
              <RadarChart
                data={filteredRadar}
                axes={currentData.radarAxes}
                theme={currentData.theme}
                onSelect={openRadarOverview}
              />
            </Card>
          </div>

          {/* Agent/Map Synergies — Valorant only */}
          {activeGame.toUpperCase() !== "CROSSFIRE" && (
            <div className="a-fade a-d1">
              <Card
                title="Agent / Map Synergies"
                accent="#a855f7"
                badge="Live Data"
                className="min-h-[350px]"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="2" /><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" /><path d="M2 12h4m12 0h4M12 2v4m0 12v4" />
                  </svg>
                }
              >
                <BubbleChart
                  data={filteredSynergy}
                  theme={currentData.theme}
                  onSelect={openSynergyOverview}
                />
              </Card>
            </div>
          )}

          {/* Heatmap — spans full width across all screens */}
          <div className="a-fade a-d2 xl:col-span-2 w-full">
            <Card
              title={`${activeGame === "VALORANT" ? "Valorant" : "Crossfire"} — Round-Start Strategy Heatmap`}
              accent="#10b981"
              badge="Heatmap"
              className="min-h-[420px]"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              }
            >
              <StrategyMap
                theme={currentData.theme}
                onSelect={openHeatmapOverview}
                availableMatches={uniqueMatches}
                availableMaps={uniqueMaps}
                heatmapEvents={currentTournamentHeatmapEvents}
                activeGame={activeGame}
              />
            </Card>
          </div>

        </div>
      </div>
      {}
      {modalData && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
          onClick={() => setModalData(null)}
        >
          <div
            className={`bg-bg-300 border border-[#232f40] rounded-2xl w-full shadow-2xl transform transition-all scale-100 opacity-100 my-auto max-h-[92vh] flex flex-col overflow-hidden animate-fade-in ${modalData.data?.type === "Heatmap" ? "max-w-4xl" : (modalData.data?.type === "Synergy" || (modalData.data?.agent && modalData.data?.map)) ? "max-w-2xl" : "max-w-md"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#232f40] bg-bg-300 shrink-0">
              <h2 className="text-lg sm:text-xl font-black text-theme-text-base truncate pr-2">
                {modalData.title}
              </h2>
              <button
                onClick={() => setModalData(null)}
                className="text-theme-text-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              <p className="text-theme-text-base text-xs sm:text-sm mb-4 leading-relaxed text-slate-300">
                {modalData.description}
              </p>
            {modalData.data?.type === "Heatmap" ? (
              <div className="relative w-full aspect-[4/3] bg-bg-100 rounded-xl border border-[#2a3648] overflow-hidden shadow-inner flex items-center justify-center mt-4">
                {modalData.data.area && modalData.data.area !== "No Data" ? (
                  <>
                    <img
                      src={`/assets/${modalData.data.area.replace(/ /g, "_")}.png`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                      className="absolute inset-0 w-full h-full object-contain opacity-90 select-none"
                      alt="Map Full"
                    />
                    {(() => {
                      const modalEvents = modalData.data?.events
                        ? [...modalData.data.events].sort((a, b) => {
                            const aIsDefuse = (a.event_type || "").toLowerCase() === "defuse" ? 1 : 0;
                            const bIsDefuse = (b.event_type || "").toLowerCase() === "defuse" ? 1 : 0;
                            return aIsDefuse - bIsDefuse;
                          })
                        : (currentTournamentHeatmapEvents || [])
                            .filter((h) => {
                              const hGame = (h.game || "").toUpperCase();
                              const activeGameUpper = (activeGame || "VALORANT").toUpperCase();
                              if (hGame && hGame !== activeGameUpper) return false;
                              if (!h.match_id) return false;
                              const matchLower = h.match_id.toLowerCase();
                              const mapName = (modalData.data.area || "").toLowerCase();
                              return matchLower.includes(mapName.replace(/ /g, '_')) || matchLower.includes(mapName);
                            })
                            .sort((a, b) => {
                              const aIsDefuse = (a.event_type || "").toLowerCase() === "defuse" ? 1 : 0;
                              const bIsDefuse = (b.event_type || "").toLowerCase() === "defuse" ? 1 : 0;
                              return aIsDefuse - bIsDefuse;
                            });

                      if (modalEvents.length === 0) {
                        return (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-black uppercase tracking-widest text-theme-text-muted bg-bg-100/80 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                              No Events Plotted For This Selection
                            </span>
                          </div>
                        );
                      }

                      return modalEvents.map((h) => {
                        const isDefuse = (h.event_type || "").toLowerCase() === "defuse";
                        return (
                          <div
                            key={h.id}
                            className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-[3px] border-white hover:scale-150 transition-transform cursor-help hover:!z-50"
                            style={{
                              left: `${h.coord_x}%`,
                              top: `${h.coord_y}%`,
                              zIndex: isDefuse ? 40 : 30,
                              backgroundColor: isDefuse ? defuseColor : plantColor,
                              boxShadow: `0 0 15px ${isDefuse ? defuseColor : plantColor}`
                            }}
                            onMouseMove={(e) => {
                              e.stopPropagation();
                              const rect = e.target.closest('.relative').getBoundingClientRect();
                              setModalTooltip({
                                visible: true,
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                                content: (
                                  <div className="flex flex-col gap-1 min-w-[80px]">
                                    <div
                                      className="font-black uppercase tracking-widest text-xs border-b pb-1"
                                      style={{
                                        color: isDefuse ? defuseColor : plantColor,
                                        borderColor: `${isDefuse ? defuseColor : plantColor}40`
                                      }}
                                    >
                                      {isDefuse ? (h.event_type || "Defuse") : (h.event_type === "Plant" ? "Plant Success" : h.event_type)}
                                    </div>
                                    <div className="text-theme-text-base font-bold">
                                      Round{" "}
                                      <span className="text-theme-text-base">
                                        {h.round_number}
                                      </span>
                                    </div>
                                  </div>
                                ),
                              });
                            }}
                            onMouseLeave={() => setModalTooltip({ visible: false })}
                          ></div>
                        );
                      });
                    })()}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-theme-text-muted gap-2">
                    <span className="text-xs font-black uppercase tracking-widest">No Map Data</span>
                  </div>
                )}
                <Tooltip {...modalTooltip} />
                {}
                <div className="absolute bottom-6 right-6 bg-bg-100/90 p-4 rounded-xl border border-[#232f40] flex flex-col items-start backdrop-blur-md shadow-2xl">
                  <span className="text-xs font-black text-theme-text-base mb-3 uppercase tracking-widest">
                    Legend
                  </span>
                  <div className="flex items-center justify-between w-full gap-4 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shrink-0" 
                        style={{ backgroundColor: defuseColor, boxShadow: `0 0 10px ${defuseColor}` }}
                      ></div>
                      <span className="text-xs font-bold text-theme-text-base uppercase tracking-wider">
                        Defuse
                      </span>
                    </div>
                    {modalData.data?.defusePct !== undefined && (
                      <span className="text-xs font-bold font-mono" style={{ color: defuseColor }}>
                        {modalData.data.defusePct}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shrink-0" 
                        style={{ backgroundColor: plantColor, boxShadow: `0 0 10px ${plantColor}` }}
                      ></div>
                      <span className="text-xs font-bold text-theme-text-base uppercase tracking-wider">
                        Plant Success
                      </span>
                    </div>
                    {modalData.data?.plantPct !== undefined && (
                      <span className="text-xs font-bold font-mono" style={{ color: plantColor }}>
                        {modalData.data.plantPct}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : modalData.isRadar ? (
              <div className="flex flex-col gap-4">
                {/* Header card with rating */}
                <div
                  className="rounded-xl p-4 flex items-center justify-between border"
                  style={{
                    backgroundColor: `${modalData.data?.color || accent}12`,
                    borderColor: `${modalData.data?.color || accent}40`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] shrink-0"
                      style={{ backgroundColor: modalData.data?.color, color: modalData.data?.color }}
                    />
                    <div>
                      <div className="text-base font-black text-theme-text-base">
                        {modalData.data?.name}
                      </div>
                      <div className="text-[10px] text-theme-text-muted font-bold uppercase tracking-wider">
                        {modalData.data?.tier || "Skill Tier"} &bull;{" "}
                        {modalData.data?.sampleCount
                          ? `${modalData.data.sampleCount} Players Aggregated`
                          : modalData.data?.meta
                          ? `${modalData.data.meta.matches} Records Analyzed`
                          : "Database Benchmark"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-2xl font-black"
                      style={{ color: modalData.data?.color || accent }}
                    >
                      {modalData.data?.stats
                        ? Math.round(
                            modalData.data.stats.reduce((a, b) => a + b, 0) /
                              modalData.data.stats.length,
                          )
                        : "--"}
                      <span className="text-xs text-theme-text-muted font-normal">/100</span>
                    </div>
                    <div className="text-[9px] text-theme-text-faint font-bold uppercase tracking-widest">
                      Overall Score
                    </div>
                  </div>
                </div>

                {/* 6 Skill Breakdown Bars */}
                <div className="bg-bg-200 rounded-xl p-4 border border-slate-700/50 flex flex-col gap-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-theme-text-muted mb-1">
                    Calculated Skill Matrix Metrics
                  </div>
                  {(currentData.radarAxes || []).map((axis, idx) => {
                    const score = modalData.data?.stats?.[idx] || 0;
                    return (
                      <div key={axis} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-theme-text-base">{axis}</span>
                          <span
                            className="font-black font-mono text-sm"
                            style={{ color: modalData.data?.color || accent }}
                          >
                            {score}
                            <span className="text-[10px] text-theme-text-muted font-normal">/100</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-bg-300 rounded-full overflow-hidden border border-slate-700/40">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, score))}%`,
                              backgroundColor: modalData.data?.color || accent,
                              boxShadow: `0 0 8px ${modalData.data?.color || accent}80`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Player Meta stats if available */}
                {modalData.data?.meta && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-bg-200/80 p-2.5 rounded-lg border border-slate-700/40 text-center">
                        <div className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider">K/DA Ratio</div>
                        <div className="text-sm font-black text-theme-text-base">{modalData.data.meta.kda || modalData.data.meta.kd}</div>
                        <div className="text-[8px] text-theme-text-faint">{modalData.data.meta.kills}K / {modalData.data.meta.deaths}D / {modalData.data.meta.assists}A</div>
                      </div>
                      <div className="bg-bg-200/80 p-2.5 rounded-lg border border-slate-700/40 text-center">
                        <div className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider">Total Aces</div>
                        <div className="text-sm font-black text-theme-text-base">{modalData.data.meta.aces}</div>
                        <div className="text-[8px] text-theme-text-faint">{modalData.data.meta.rounds} Rounds</div>
                      </div>
                      <div className="bg-bg-200/80 p-2.5 rounded-lg border border-slate-700/40 text-center">
                        <div className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider">Combat ACS</div>
                        <div className="text-sm font-black text-theme-text-base">{modalData.data.meta.acs}</div>
                        <div className="text-[8px] text-theme-text-faint">Headshot {modalData.data.meta.hsPct}%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-bg-200/80 p-2.5 rounded-lg border border-slate-700/40 text-center">
                        <div className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider">Plants</div>
                        <div className="text-sm font-black text-theme-text-base">{modalData.data.meta.plants}</div>
                        <div className="text-[8px] text-theme-text-faint">Spike Plants</div>
                      </div>
                      <div className="bg-bg-200/80 p-2.5 rounded-lg border border-slate-700/40 text-center">
                        <div className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider">Defuses</div>
                        <div className="text-sm font-black text-theme-text-base">{modalData.data.meta.defuses}</div>
                        <div className="text-[8px] text-theme-text-faint">Spike Defuses</div>
                      </div>
                      <div className="bg-bg-200/80 p-2.5 rounded-lg border border-slate-700/40 text-center">
                        <div className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider">Trades / Refrags</div>
                        <div className="text-sm font-black text-theme-text-base">{modalData.data.meta.trades ?? modalData.data.meta.assists}</div>
                        <div className="text-[8px] text-theme-text-faint">Assists &amp; FK</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* If Top Players in benchmark */}
                {modalData.data?.topPlayers && (
                  <div className="text-[10px] text-theme-text-muted bg-bg-200/50 p-2.5 rounded-lg border border-slate-700/30">
                    <span className="font-bold text-theme-text-base">Sample Top Performers: </span>
                    {modalData.data.topPlayers}
                  </div>
                )}
              </div>
            ) : (modalData.data?.type === "Synergy" || (modalData.data?.agent && modalData.data?.map)) ? (
              (() => {
                const syn = modalData.data;
                const roleInfo = getAgentRoleStyle(syn.agent);
                const agentImg = getAgentImagePath(syn.agent);
                const mapImg = `/assets/${syn.map.replace(/ /g, '_')}.png`;
                const winRate = syn.winRate || 0;
                const wins = syn.wins ?? (winRate >= 50 ? syn.pickRate || 1 : 0);
                const losses = syn.losses ?? Math.max(0, (syn.pickRate || 1) - wins);
                const totalPicks = syn.pickRate || syn.sampleCount || (wins + losses) || 1;

                // SVG Circular Progress calculation
                const radius = 38;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (winRate / 100) * circumference;

                const winColor = winRate >= 70 ? '#10b981' : winRate >= 50 ? '#06b6d4' : winRate >= 35 ? '#f59e0b' : '#f43f5e';
                const tierLabel = winRate >= 75 ? 'S-TIER SYNERGY' : winRate >= 50 ? 'A-TIER SYNERGY' : winRate >= 35 ? 'B-TIER SYNERGY' : 'LOW IMPACT';
                const tierBadgeBg = winRate >= 75 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : winRate >= 50 ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' : 'bg-amber-500/15 border-amber-500/40 text-amber-300';

                return (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    {/* Hero Visual Card: Map Banner + Agent Portrait */}
                    <div className="relative rounded-2xl overflow-hidden border border-[#2a3648] bg-slate-950 shadow-xl min-h-[135px] flex items-center p-4 sm:p-5">
                      {/* Background Map Image with Dark Overlay */}
                      <img
                        src={mapImg}
                        alt={syn.map}
                        onError={(e) => { e.target.style.display = 'none'; }}
                        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none filter blur-[1px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent pointer-events-none" />

                      {/* Content inside Hero Card */}
                      <div className="relative z-10 flex items-center gap-4 w-full justify-between flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Agent Portrait Avatar */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] overflow-hidden shrink-0 flex items-center justify-center">
                            {agentImg ? (
                              <img
                                src={agentImg}
                                alt={syn.agent}
                                className="w-full h-full object-cover object-top"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="font-tactical font-black text-2xl text-cyan-400">
                                {syn.agent?.[0] || 'A'}
                              </span>
                            )}
                          </div>

                          {/* Agent & Map Labels */}
                          <div className="min-w-0 flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${roleInfo.badge}`}>
                                {roleInfo.icon} {roleInfo.role}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800/80 text-cyan-300 border border-cyan-500/30">
                                MAP: {syn.map}
                              </span>
                            </div>
                            <h3 className="font-tactical text-xl sm:text-2xl font-black text-white uppercase tracking-wider drop-shadow-md truncate">
                              {syn.agent}
                            </h3>
                            <span className="text-xs font-semibold text-slate-400">
                              Combat deployment on {syn.map}
                            </span>
                          </div>
                        </div>

                        {/* Synergy Tier Badge */}
                        <div className="shrink-0 flex flex-col items-end">
                          <span className={`px-3 py-1 rounded-xl text-xs font-tactical font-extrabold uppercase tracking-widest border shadow-lg ${tierBadgeBg}`}>
                            {tierLabel}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Tactical Rating
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Graphics Metrics Arena */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Graphic 1: Circular Win Rate Gauge */}
                      <div className="bg-bg-200/90 rounded-xl p-4 border border-slate-700/50 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          Synergy Win Rate
                        </div>
                        <div className="relative w-24 h-24 flex items-center justify-center my-1">
                          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r={radius}
                              className="stroke-slate-800"
                              strokeWidth="8"
                              fill="transparent"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r={radius}
                              stroke={winColor}
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              fill="transparent"
                              style={{
                                filter: `drop-shadow(0 0 6px ${winColor}80)`,
                                transition: 'stroke-dashoffset 0.8s ease-in-out',
                              }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="font-tactical font-black text-xl text-white tracking-tight">
                              {winRate}%
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: winColor }}>
                              {wins}W - {losses}L
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 mt-1">
                          Win Efficiency
                        </span>
                      </div>

                      {/* Graphic 2: Pick Rate & Deployment Frequency */}
                      <div className="bg-bg-200/90 rounded-xl p-4 border border-slate-700/50 flex flex-col justify-between shadow-md">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                            Pick Volume
                          </div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-tactical text-3xl font-black text-cyan-400 tracking-tight">
                              {totalPicks}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              Pick{totalPicks === 1 ? '' : 's'} Logged
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                            Total times {syn.agent} was deployed on {syn.map} in this tournament.
                          </p>
                        </div>
                        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/60">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(20, totalPicks * 25))}%` }}
                          />
                        </div>
                      </div>

                      {/* Graphic 3: Combat ACS & K/D Performance */}
                      <div className="bg-bg-200/90 rounded-xl p-4 border border-slate-700/50 flex flex-col justify-between shadow-md">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                            Combat Impact
                          </div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-tactical text-3xl font-black text-white tracking-tight">
                              {syn.avgAcs || syn.meta?.acs || 200}
                            </span>
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                              Avg ACS
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold text-slate-400">K/D Ratio:</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                              {syn.kd || "1.00"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 border-t border-slate-700/40 pt-2 mt-2">
                          <span>Avg Kills: <strong className="text-white">{syn.avgKills || "-"}</strong></span>
                          <span>HS%: <strong className="text-cyan-400">{syn.hsPct || "-"}%</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Tactical Intel & Contributing Teams */}
                    <div className="bg-bg-200/70 rounded-xl p-3.5 border border-slate-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                        <span className="text-slate-300">
                          <strong className="text-white font-bold">Piloting Teams: </strong>
                          {syn.teams && syn.teams.length > 0 ? syn.teams.join(', ') : "Active Tournament Roster"}
                        </span>
                      </div>
                      {syn.players && syn.players.length > 0 && (
                        <div className="text-slate-400 text-[11px] truncate">
                          Pilots: <strong className="text-cyan-300">{syn.players.join(', ')}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-bg-200/90 rounded-xl p-5 border border-slate-700/50 flex flex-col gap-3">
                <div className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  Tactical Node Metrics
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {Object.entries(modalData.data || {}).map(([key, val]) => (
                    <div key={key} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 uppercase text-[10px] block font-bold">{key}</span>
                      <span className="font-mono font-bold text-white text-sm">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#232f40] bg-bg-200/60 shrink-0">
              <button
                onClick={() => setModalData(null)}
                className="w-full py-2.5 bg-bg-400 hover:bg-bg-500 border border-[#334155] rounded-xl text-theme-text-base font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
export default Analytics;
