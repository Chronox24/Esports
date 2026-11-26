import React, { useState } from 'react';
import {
  History,
  Swords,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';

const formatDelta = (value, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}${suffix}`;
};

const TrendPill = ({ trend }) => {
  if (trend === 'improved') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
        <TrendingUp size={10} /> Improved
      </span>
    );
  }
  if (trend === 'declined') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/35 text-[9px] font-bold uppercase tracking-wider text-rose-300">
        <TrendingDown size={10} /> Declined
      </span>
    );
  }
  if (trend === 'prior_only') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-[9px] font-bold uppercase tracking-wider text-amber-300">
        <History size={10} /> Prior Record
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-bold uppercase tracking-wider text-slate-300">
      <Minus size={10} /> Steady
    </span>
  );
};

/**
 * Shared HUD panel analyzing returning players' and teams' previous tournament records
 * against their current tournament records, including cross-tournament rematch history.
 */
const CrossTournamentAnalysis = ({
  analysis,
  teamAName = 'Team A',
  teamBName = 'Team B',
  compact = false,
}) => {
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  if (!analysis || (!analysis.has_previous_records && !analysis.rematch_detected)) {
    return null;
  }

  const h2h = analysis.head_to_head || {};
  const returningPlayers = Array.isArray(analysis.returning_players) ? analysis.returning_players : [];
  const visiblePlayers = showAllPlayers ? returningPlayers : returningPlayers.slice(0, compact ? 4 : 6);
  const sides = [
    { side: analysis.team_a, fallbackName: teamAName, accentClass: 'border-cyan-500/30 bg-cyan-950/15 text-cyan-300' },
    { side: analysis.team_b, fallbackName: teamBName, accentClass: 'border-amber-500/30 bg-amber-950/15 text-amber-300' },
  ].filter((item) => item.side && item.side.previous);

  return (
    <div className={`rounded-xl border border-indigo-500/30 bg-slate-950/75 ${compact ? 'p-3' : 'p-4'} flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[10px] font-tactical font-extrabold uppercase tracking-[0.16em] text-indigo-300">
            <History size={13} className="text-indigo-400" />
            Previous vs Current Tournament Analysis
          </div>
          {analysis.rematch_detected && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-[9px] font-bold uppercase tracking-wider text-amber-300">
              <Swords size={10} /> Cross-Tournament Rematch
            </span>
          )}
        </div>

        {Array.isArray(analysis.previous_tournaments) && analysis.previous_tournaments.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {analysis.previous_tournaments.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[9px] font-semibold text-slate-300 truncate max-w-[170px]"
                title={t}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Narrative summary */}
      {analysis.summary && (
        <p className="text-[11px] text-slate-300 leading-relaxed">{analysis.summary}</p>
      )}

      {/* Prior Cross-Tournament Clashes */}
      {h2h.prior_encounters > 0 && (
        <div className="rounded-lg bg-amber-950/20 border border-amber-500/30 px-3 py-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">
              Prior Cross-Tournament Head-to-Head ({h2h.prior_encounters} Map{h2h.prior_encounters === 1 ? '' : 's'})
            </span>
            <span className="font-mono font-bold text-slate-200">
              <span className="text-cyan-300">{teamAName}: {h2h.team_a_wins}W</span>
              <span className="text-slate-500 mx-1.5">vs</span>
              <span className="text-rose-300">{teamBName}: {h2h.team_b_wins}W</span>
            </span>
          </div>

          {Array.isArray(h2h.pair_details) && h2h.pair_details.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {h2h.pair_details.map((enc, idx) => (
                <span
                  key={`${enc.tournament}-${enc.map}-${idx}`}
                  className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300"
                >
                  {enc.map} ({enc.winner_side === 'team_a' ? teamAName : teamBName} W)
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team Previous vs Current Comparison */}
      {sides.length > 0 && (
        <div className={`grid grid-cols-1 ${sides.length > 1 ? 'md:grid-cols-2' : ''} gap-2.5`}>
          {sides.map(({ side, fallbackName, accentClass }) => {
            const prev = side.previous;
            const curr = side.current;
            const deltas = side.deltas;
            return (
              <div key={side.team_name || fallbackName} className={`rounded-lg border p-2.5 flex flex-col gap-1.5 ${accentClass}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-tactical text-[11px] font-extrabold uppercase tracking-wider truncate">
                    {side.team_name || fallbackName}
                  </span>
                  {deltas ? <TrendPill trend={deltas.trend} /> : <TrendPill trend="prior_only" />}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded bg-slate-950/75 border border-slate-800/90 px-2 py-1.5">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Previous Record</div>
                    <div className="text-slate-200 font-mono font-bold mt-0.5">
                      {prev.kd} K/D • {prev.win_rate}% WR
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {prev.wins}W / {prev.maps} Map{prev.maps === 1 ? '' : 's'}
                    </div>
                  </div>

                  <div className="rounded bg-slate-950/75 border border-slate-800/90 px-2 py-1.5">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Current Record</div>
                    {curr ? (
                      <>
                        <div className="text-white font-mono font-bold mt-0.5">
                          {curr.kd} K/D • {curr.win_rate}% WR
                        </div>
                        <div className="text-[9px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className={deltas?.kd_delta >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {formatDelta(deltas?.kd_delta, ' K/D')}
                          </span>
                          <span className={deltas?.win_rate_delta >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {formatDelta(deltas?.win_rate_delta, '% WR')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-500 text-[10px] mt-1">Awaiting current match data</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Individual Returning Players Comparison */}
      {returningPlayers.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-tactical font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users size={11} className="text-indigo-400" />
              Returning Players ({returningPlayers.length})
            </span>
            {returningPlayers.length > (compact ? 4 : 6) && (
              <button
                type="button"
                onClick={() => setShowAllPlayers((prev) => !prev)}
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {showAllPlayers ? (
                  <>Show Less <ChevronUp size={11} /></>
                ) : (
                  <>Show All ({returningPlayers.length}) <ChevronDown size={11} /></>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visiblePlayers.map((p, idx) => (
              <div
                key={`${p.team_side || 's'}-${p.ign}-${idx}`}
                className="rounded-lg bg-slate-900/70 border border-slate-800 px-2.5 py-2 flex flex-col gap-1 text-[10px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`font-bold truncate ${p.team_side === 'team_b' ? 'text-amber-300' : 'text-cyan-300'}`}>
                      {p.ign}
                    </span>
                    <span className="text-[9px] text-slate-500 truncate">
                      ({p.previous_teams?.length ? `prev: ${p.previous_teams.join('/')}` : p.team_name})
                    </span>
                  </div>
                  <TrendPill trend={p.trend} />
                </div>

                <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                  <span className="text-slate-400">
                    Prev: <strong className="text-slate-200">{p.previous?.kd ?? 0}</strong> K/D ({p.previous?.win_rate ?? 0}%)
                  </span>
                  <span className="text-slate-400">
                    {p.current ? (
                      <>
                        Curr: <strong className="text-white">{p.current.kd}</strong> K/D ({p.current.win_rate}%)
                      </>
                    ) : (
                      <span className="text-slate-500">No current maps</span>
                    )}
                  </span>
                </div>

                {p.current && p.kd_delta !== null && (
                  <div className="flex items-center gap-2 text-[9px] font-mono">
                    <span className={p.kd_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      K/D {formatDelta(p.kd_delta)}
                    </span>
                    {p.win_rate_delta !== null && (
                      <span className={p.win_rate_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        WR {formatDelta(p.win_rate_delta, '%')}
                      </span>
                    )}
                    {p.acs_delta !== null && (
                      <span className={p.acs_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        ACS {formatDelta(p.acs_delta)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossTournamentAnalysis;
