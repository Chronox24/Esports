import React, { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../../utils/api";
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
const Card = ({ title, children, className = "", accent = "#06b6d4", icon = null, badge = null }) => (
  <div
    className={`rounded-2xl border border-slate-700/40 bg-bg-200 flex flex-col overflow-hidden relative group transition-all duration-300 hover:border-slate-600/60 hover:shadow-2xl ${className}`}
    style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
  >
    {/* Top accent line */}
    <div className="h-[2px] shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
    {/* Subtle bg glow */}
    <div className="absolute inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(ellipse at top left, ${accent}08, transparent 60%)` }} />
    {/* Header */}
    <div className="border-b border-slate-800/60 bg-bg-300/60 relative z-10 flex items-center justify-between shrink-0" style={{ padding: "16px 20px" }}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}18`, border: `1px solid ${accent}28` }}>
            <span style={{ color: accent }}>{icon}</span>
          </div>
        )}
        <h3 className="text-[11px] font-black tracking-[0.2em] text-theme-text-base uppercase">{title}</h3>
      </div>
      {badge && (
        <span className="text-[9px] font-black uppercase tracking-[0.15em] rounded-md px-2 py-1" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
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

  // Extract unique maps from heatmapEvents directly, STRICTLY adhering to the active game's map pool
  const availableMapsFromEvents = useMemo(() => {
    const maps = new Set();
    const activeGameUpper = (activeGame || "VALORANT").toUpperCase();

    if (heatmapEvents) {
      heatmapEvents.forEach(h => {
        const hGame = (h.game || "").toUpperCase();
        // If event specifies a game, it must strictly match the active game
        if (hGame && hGame !== activeGameUpper) return;

        if (h.match_id) {
          const matchLower = h.match_id.toLowerCase();
          // STRICT: Only look for maps that belong to this game!
          const foundMap = ALLOWED_MAPS.find(m => 
            matchLower.includes(m.toLowerCase().replace(/ /g, '_')) || 
            matchLower.includes(m.toLowerCase())
          );
          
          if (foundMap) {
            maps.add(foundMap);
          }
        }
      });
    }

    // Also include availableMaps from records if valid for this game
    if (availableMaps && Array.isArray(availableMaps)) {
      availableMaps.forEach(m => {
        const found = ALLOWED_MAPS.find(gm => gm.toLowerCase() === m.toLowerCase());
        if (found) maps.add(found);
      });
    }

    // Filter strictly to ensure no map outside ALLOWED_MAPS can ever be present
    const result = Array.from(maps).filter(m => 
      ALLOWED_MAPS.some(am => am.toLowerCase() === m.toLowerCase())
    ).sort();

    // Default map pool if no events exist yet for this game
    if (result.length === 0) {
      return isValorant ? ["Ascent", "Bind", "Haven", "Split"] : ["Ankara", "Black Widow", "Compound"];
    }

    return result;
  }, [heatmapEvents, activeGame, availableMaps, ALLOWED_MAPS, isValorant]);

  const [selectedMap, setSelectedMap] = useState("");
  const [selectedMatch, setSelectedMatch] = useState("All Matches");

  // Auto-select first map if none selected or if activeGame changed
  useEffect(() => {
    if (availableMapsFromEvents.length > 0) {
      if (!selectedMap || !availableMapsFromEvents.includes(selectedMap)) {
        setSelectedMap(availableMapsFromEvents[0]);
        setSelectedMatch("All Matches");
      }
    } else {
      setSelectedMap("");
      setSelectedMatch("All Matches");
    }
  }, [availableMapsFromEvents, selectedMap]);

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
      return m.toLowerCase() === selectedMap.toLowerCase();
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
    return matchId.replace(/_/g, ' ').replace(/\d{13}$/, '').trim() || "Unknown Set";
  };
  
  let mapNameForImage = selectedMap || (isValorant ? "Ascent" : "Ankara");
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
  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer group"
      style={{ padding: "8px" }}
      onClick={() =>
        onSelect({
          type: "Heatmap",
          area: selectedMap || (isValorant ? "Ascent" : "Ankara"),
          details: `${isValorant ? "Valorant" : "Crossfire"} strategy heatmap for ${selectedMap || "Map"}.`,
        })
      }
    >
      {availableMapsFromEvents && availableMapsFromEvents.length > 0 && (
        <div
          className="absolute top-2 left-4 z-20 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative group cursor-pointer">
            <select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              className="bg-bg-300 border border-[#2a3648] text-sm font-black text-theme-text-base tracking-widest drop-shadow-md outline-none rounded hover:border-blue-500 transition-colors cursor-pointer max-w-[150px] truncate"
              style={{ padding: "4px 8px" }}
            >
              {availableMapsFromEvents.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="relative group cursor-pointer">
            <select
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(e.target.value)}
              className="bg-bg-300 border border-[#2a3648] text-sm font-black text-theme-text-base tracking-widest drop-shadow-md outline-none rounded hover:border-blue-500 transition-colors cursor-pointer max-w-[250px] truncate"
              style={{ padding: "4px 8px" }}
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
      )}
      <div className="relative w-full max-w-[800px] aspect-[4/3] bg-bg-100 rounded-xl border border-[#2a3648] overflow-hidden shadow-2xl flex items-center justify-center group-hover:border-blue-500 transition-all">
        {selectedMatch && selectedMatch !== "No Data" ? (
          <>
            <img
              src={`/assets/${mapNameForImage.replace(/ /g, "_")}.png`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
              className="absolute inset-0 w-full h-full object-contain opacity-80"
              alt="Map"
            />
        {mapEvents.map((h) => (
          <div
            key={h.id}
            className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white animate-in zoom-in hover:scale-150 transition-transform cursor-help z-30 ${h.event_type === "Plant" ? "bg-red-500 shadow-[0_0_12px_#ef4444]" : "bg-blue-500 shadow-[0_0_12px_#3b82f6]"}`}
            style={{ left: `${h.coord_x}%`, top: `${h.coord_y}%` }}
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
                      className={`font-black uppercase tracking-widest text-xs border-b pb-1 ${h.event_type === "Plant" ? "text-red-400 border-red-900/50" : "text-blue-400 border-blue-900/50"}`}
                    >
                      {h.event_type === "Plant" ? "Plant Success" : h.event_type}
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
        ))}
        <Tooltip {...tooltip} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-theme-text-muted gap-2">
            <span className="text-xs font-black uppercase tracking-widest">No Map Data</span>
          </div>
        )}
      </div>
      {}
      <div
        className="absolute bottom-4 right-4 bg-bg-100/90 rounded-lg border border-[#232f40] flex flex-col items-start backdrop-blur-md pointer-events-none shadow-xl min-w-[140px]"
        style={{ padding: "12px" }}
      >
        <span className="text-[10px] font-bold text-theme-text-base mb-3 uppercase tracking-widest">
          Legend
        </span>
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] border border-white shrink-0"></div>
            <span className="text-[10px] font-bold text-theme-text-base uppercase">
              Plant Success
            </span>
          </div>
          <span className="text-[10px] font-bold text-theme-text-muted">
            {plantPct}%
          </span>
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] border border-white shrink-0"></div>
            <span className="text-[10px] font-bold text-theme-text-base uppercase">
              Defuse
            </span>
          </div>
          <span className="text-[10px] font-bold text-theme-text-muted">
            {defusePct}%
          </span>
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
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const queryTournament = globalTournament || "all";
        const res = await apiFetch(
          `/api/match-records?tournament=${encodeURIComponent(queryTournament)}`,
        );
        if (res.ok) {
          const data = await res.json();
          // Fallback to all tournament records if specific tournament has no records
          if ((!data || data.length === 0) && queryTournament !== "all") {
            const fallbackRes = await apiFetch(`/api/match-records?tournament=all`);
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              setMatchRecords(fallbackData || []);
              return;
            }
          }
          setMatchRecords(data || []);
        }
      } catch (e) {
        console.error("Error fetching match records:", e);
      }
    };
    const fetchHeatmap = async () => {
      try {
        const res = await apiFetch("/api/stats/heatmap");
        if (res.ok) {
          const eventsData = await res.json();
          setHeatmapEvents(eventsData || []);
        }
      } catch (e) {
        console.error("Error fetching heatmap events:", e);
      }
    };

    fetchRecords();
    fetchHeatmap();
  }, [globalTournament]);
  const uniqueMaps = useMemo(() => {
    const gameUpper = (activeGame || "VALORANT").toUpperCase();
    const isVal = gameUpper === "VALORANT";
    const allowed = isVal ? VALORANT_MAPS : CROSSFIRE_MAPS;
    const gameRecords = matchRecords.filter(
      (r) => (r.game || "").toUpperCase() === gameUpper,
    );
    const maps = new Set();
    gameRecords.forEach((r) => {
      if (r.map && r.map !== "TBD" && r.map !== "-") {
        const found = allowed.find(m => m.toLowerCase() === r.map.toLowerCase());
        if (found) maps.add(found);
      }
    });
    return Array.from(maps);
  }, [matchRecords, activeGame]);

  const uniqueMatches = useMemo(() => {
    const gameUpper = (activeGame || "VALORANT").toUpperCase();
    const isVal = gameUpper === "VALORANT";
    const allowed = isVal ? VALORANT_MAPS : CROSSFIRE_MAPS;
    const gameEvents = heatmapEvents.filter(
      (h) => !h.game || h.game.toUpperCase() === gameUpper,
    );
    const matches = new Set();
    gameEvents.forEach((h) => {
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
  }, [heatmapEvents, activeGame]);

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
      const def = Math.min(20, Math.max(0, Number(r.defuse) || 0));
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

    let s1, s2, s3, s4, s5, s6;
    if (isVal) {
      // 1. Agent Proficiency: Win Rate + ACS + K/D
      s1 = Math.round(Math.min(98, Math.max(25, (winRate * 45) + (Math.min(350, avgAcs) / 350 * 35) + (Math.min(2, kd) / 2 * 18))));
      // 2. Reaction Time: KPR + First Kills + K/D
      s2 = Math.round(Math.min(98, Math.max(30, (Math.min(1.2, kpr) / 1.2 * 50) + (Math.min(0.2, safeDiv(totFk, safeRnd)) / 0.2 * 25) + (Math.min(2, kd) / 2 * 23))));
      // 3. Econ Management: Econ spending efficiency + ACS per round
      const econScore = avgEcon > 10 ? Math.min(95, (avgEcon / 100) * 75 + 20) : Math.min(95, (avgAcs / 250) * 50 + (kd > 1 ? 30 : 20));
      s3 = Math.round(Math.min(98, Math.max(30, econScore)));
      // 4. Headshot %
      const hsScore = hsPct > 0 ? Math.min(98, Math.max(25, (hsPct / 40) * 70 + 25)) : Math.min(92, Math.max(35, (kpr / 1.2) * 50 + 35));
      s4 = Math.round(hsScore);
      // 5. Utility Usage: APR + plants + defuses
      const utilRate = apr + safeDiv(totP + totDef, safeRnd);
      s5 = Math.round(Math.min(98, Math.max(25, (Math.min(0.8, utilRate) / 0.8) * 70 + 25)));
      // 6. Clutch %: Survival rate + win rate + aces
      const survRate = Math.max(0, safeDiv(safeRnd - totD, safeRnd));
      s6 = Math.round(Math.min(98, Math.max(25, (winRate * 40) + (survRate * 40) + (Math.min(2, totAces) * 9) + 10)));
    } else {
      // Crossfire
      // 1. Weapon Mastery
      s1 = Math.round(Math.min(98, Math.max(30, (Math.min(2.5, kd) / 2.5 * 55) + (Math.min(50, hsPct) / 50 * 43))));
      // 2. Reaction Time
      s2 = Math.round(Math.min(98, Math.max(30, (Math.min(1.2, kpr) / 1.2 * 70) + (Math.min(2, kd) / 2 * 28))));
      // 3. Positioning
      const surv = Math.max(0, safeDiv(safeRnd - totD, safeRnd));
      s3 = Math.round(Math.min(98, Math.max(25, surv * 80 + 18)));
      // 4. Headshot %
      s4 = Math.round(Math.min(98, Math.max(25, (hsPct / 45) * 75 + 20)));
      // 5. Utility Usage
      s5 = Math.round(Math.min(98, Math.max(25, (Math.min(0.6, apr) / 0.6) * 70 + 25)));
      // 6. Clutch %
      s6 = Math.round(Math.min(98, Math.max(25, (winRate * 45) + (surv * 35) + 18)));
    }

    return {
      stats: [s1, s2, s3, s4, s5, s6],
      meta: {
        matches: pRecords.length,
        rounds: totRnd,
        kd: kd.toFixed(2),
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
      { name: "Elite Player", color: "#00d0eb", stats: [80, 64, 85, 83, 59, 63], tier: "Elite Benchmark" },
      { name: "Pro Player", color: "#ff3366", stats: [67, 57, 76, 75, 44, 53], tier: "Pro Benchmark" },
      { name: "Average Player", color: "#a78bfa", stats: [55, 49, 68, 66, 46, 50], tier: "Average Benchmark" },
    ];
    const fallbackCf = [
      { name: "CF Elite", color: "#f59e0b", stats: [79, 77, 63, 79, 69, 68], tier: "Elite Benchmark" },
      { name: "CF Pro", color: "#4c7fd6", stats: [60, 56, 61, 73, 56, 71], tier: "Pro Benchmark" },
      { name: "Average Player", color: "#10b981", stats: [61, 65, 59, 67, 60, 58], tier: "Average Benchmark" },
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

    const calcBenchmark = (players) => {
      if (!players || players.length === 0) return [50, 50, 50, 50, 50, 50];
      const sum = [0, 0, 0, 0, 0, 0];
      players.forEach((p) => {
        p.stats.forEach((s, i) => {
          sum[i] += s;
        });
      });
      return sum.map((x) => Math.round(x / players.length));
    };

    const eliteCount = Math.max(1, Math.ceil(playerList.length * 0.15));
    const elitePlayers = playerList.slice(0, eliteCount);
    const proPlayers = playerList.slice(eliteCount, Math.max(eliteCount + 1, Math.ceil(playerList.length * 0.5)));
    const avgPlayers = playerList;

    const eliteStats = calcBenchmark(elitePlayers);
    const proStats = calcBenchmark(proPlayers.length > 0 ? proPlayers : elitePlayers);
    const avgStats = calcBenchmark(avgPlayers);

    const eliteColor = isVal ? "#00d0eb" : "#f59e0b";
    const proColor = isVal ? "#ff3366" : "#4c7fd6";
    const avgColor = isVal ? "#a78bfa" : "#10b981";

    const eliteTier = {
      name: isVal ? "Elite Player" : "CF Elite",
      color: eliteColor,
      stats: eliteStats,
      tier: "Elite Benchmark",
      sampleCount: elitePlayers.length,
      totalRecords: gameRecords.length,
      topPlayers: elitePlayers.slice(0, 5).map(p => p.ign).join(", "),
    };

    const proTier = {
      name: isVal ? "Pro Player" : "CF Pro",
      color: proColor,
      stats: proStats,
      tier: "Pro Benchmark",
      sampleCount: proPlayers.length,
      totalRecords: gameRecords.length,
    };

    const avgTier = {
      name: "Average Player",
      color: avgColor,
      stats: avgStats,
      tier: "Average Benchmark",
      sampleCount: avgPlayers.length,
      totalRecords: gameRecords.length,
    };

    let result = [];
    if (dataType === "PRO PLAYERS") {
      result = [eliteTier, proTier];
    } else if (dataType === "CASUAL") {
      result = [avgTier];
    } else {
      result = [eliteTier, proTier, avgTier];
    }

    // Dynamic Player Search matching against database records:
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchedPlayers = playerList.filter(p => p.ign.toLowerCase().includes(q)).slice(0, 3);
      if (matchedPlayers.length > 0) {
        const playerColors = ["#38bdf8", "#fbbf24", "#34d399"];
        matchedPlayers.forEach((mp, idx) => {
          result.push({
            name: mp.ign,
            color: playerColors[idx % playerColors.length],
            stats: mp.stats,
            meta: mp.meta,
            isIndividualPlayer: true,
            tier: "Individual Player Profile",
          });
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
      "Reaction Time",
      "Econ Management",
      "Headshot %",
      "Utility Usage",
      "Clutch %",
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
      "Reaction Time",
      "Positioning",
      "Headshot %",
      "Utility Usage",
      "Clutch %",
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
    setModalData({
      title: `${synergy.agent} on ${synergy.map} Synergy`,
      description:
        "Detailed metrics explaining the effectiveness of this specific agent pick on this map.",
      data: synergy,
    });
  };
  const openHeatmapOverview = (heatmap) => {
    setModalData({
      title: `Heatmap: ${heatmap.area}`,
      description: heatmap.details,
      data: heatmap,
    });
  };
  const accent = activeGame.toUpperCase() === "VALORANT" ? "#ff4655" : "#4c7fd6";
  const accentAlt = activeGame.toUpperCase() === "VALORANT" ? "#a855f7" : "#22d3ee";

  return (
    <div className="flex-1 bg-bg-100 text-theme-text-base overflow-y-auto flex flex-col h-full custom-scrollbar relative">
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
              title="Global Player Skill Matrix"
              accent={accent}
              badge={`Radar • ${matchRecords.length} DB Records`}
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

          {/* Heatmap — spans full width when Crossfire (no synergy card) */}
          <div className={`a-fade a-d2 ${activeGame.toUpperCase() === "CROSSFIRE" ? "xl:col-span-2" : ""}`}>
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
                heatmapEvents={heatmapEvents}
                activeGame={activeGame}
              />
            </Card>
          </div>

        </div>
      </div>
      {}
      {modalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          style={{ padding: "16px" }}
          onClick={() => setModalData(null)}
        >
          <div
            className={`bg-bg-300 border border-[#232f40] rounded-xl w-full shadow-2xl transform transition-all scale-100 opacity-100 ${modalData.data?.type === "Heatmap" ? "max-w-4xl" : "max-w-md"}`}
            style={{ padding: "32px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b border-[#232f40] pb-2">
              <h2 className="text-xl font-black text-theme-text-base">
                {modalData.title}
              </h2>
              <button
                onClick={() => setModalData(null)}
                className="text-theme-text-muted hover:text-theme-text-base transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
            <p className="text-theme-text-base text-sm mb-6 leading-relaxed">
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
                      className="absolute inset-0 w-full h-full object-contain opacity-90"
                      alt="Map Full"
                    />
                    {heatmapEvents &&
                      heatmapEvents
                        .filter(
                          (h) =>
                            h.match_id &&
                            h.match_id.includes(modalData.data.area) &&
                            h.game &&
                            h.game.toUpperCase() === activeGame.toUpperCase(),
                        )
                    .map((h) => (
                      <div
                        key={h.id}
                        className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-[3px] border-white hover:scale-150 transition-transform cursor-help z-30 ${h.event_type === "Plant" ? "bg-red-500 shadow-[0_0_15px_#ef4444]" : "bg-blue-500 shadow-[0_0_15px_#3b82f6]"}`}
                        style={{ left: `${h.coord_x}%`, top: `${h.coord_y}%` }}
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
                                  className={`font-black uppercase tracking-widest text-xs border-b pb-1 ${h.event_type === "Plant" ? "text-red-400 border-red-900/50" : "text-blue-400 border-blue-900/50"}`}
                                >
                                  {h.event_type}
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
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-theme-text-muted gap-2">
                    <span className="text-xs font-black uppercase tracking-widest">No Map Data</span>
                  </div>
                )}
                <Tooltip {...modalTooltip} />
                {}
                <div className="absolute bottom-6 right-6 bg-bg-100/90 p-4 rounded-xl border border-[#232f40] flex flex-col items-start backdrop-blur-md shadow-2xl">
                  <span className="text-xs font-black text-theme-text-base mb-4 uppercase tracking-widest">
                    Legend
                  </span>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] border-2 border-white shrink-0"></div>
                    <span className="text-xs font-bold text-theme-text-base uppercase tracking-wider">
                      Plant
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] border-2 border-white shrink-0"></div>
                    <span className="text-xs font-bold text-theme-text-base uppercase tracking-wider">
                      Defuse
                    </span>
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
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-bg-200/80 p-2.5 rounded-lg border border-slate-700/40 text-center">
                      <div className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider">K/D Ratio</div>
                      <div className="text-sm font-black text-theme-text-base">{modalData.data.meta.kd}</div>
                      <div className="text-[8px] text-theme-text-faint">{modalData.data.meta.kills}K / {modalData.data.meta.deaths}D</div>
                    </div>
                    <div className="bg-bg-200/80 p-2.5 rounded-lg border border-slate-700/40 text-center">
                      <div className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider">Win Rate</div>
                      <div className="text-sm font-black text-theme-text-base">{modalData.data.meta.winRate}%</div>
                      <div className="text-[8px] text-theme-text-faint">{modalData.data.meta.rounds} Rounds</div>
                    </div>
                    <div className="bg-bg-200/80 p-2.5 rounded-lg border border-slate-700/40 text-center">
                      <div className="text-[9px] text-theme-text-muted font-bold uppercase tracking-wider">Combat ACS</div>
                      <div className="text-sm font-black text-theme-text-base">{modalData.data.meta.acs}</div>
                      <div className="text-[8px] text-theme-text-faint">Headshot {modalData.data.meta.hsPct}%</div>
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
            ) : (
              <div className="bg-bg-300 rounded-lg border border-[#1c2532] overflow-x-auto" style={{ padding: "16px" }}>
                <div className="text-[10px] font-black tracking-widest text-theme-text-faint mb-2 uppercase">
                  Raw Analytic Node Data
                </div>
                <pre className="text-xs font-mono text-blue-400">
                  {JSON.stringify(modalData.data, null, 2)}
                </pre>
              </div>
            )}
            <button
              onClick={() => setModalData(null)}
              className="mt-6 w-full py-3 bg-bg-400 hover:bg-bg-500 border border-[#334155] rounded-lg text-theme-text-base font-bold tracking-wider transition-colors"
            >
              Close Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Analytics;
