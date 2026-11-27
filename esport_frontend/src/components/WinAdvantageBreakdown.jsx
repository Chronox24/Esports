import React from 'react';
import { TrendingUp, Trophy, Layers, Crosshair, Target, CheckCircle2 } from 'lucide-react';

/**
 * Shared HUD panel explaining why the Decision Tree assigns higher win %
 * to the favored team, alongside all tournaments tracked for both teams.
 */
const WinAdvantageBreakdown = ({ analysis, teamAName = 'Team A', teamBName = 'Team B', compact = false }) => {
  if (!analysis || (!analysis.why_higher_summary && (!analysis.key_factors || analysis.key_factors.length === 0))) {
    return null;
  }

  const keyFactors = Array.isArray(analysis.key_factors) ? analysis.key_factors : [];
  const teamATournaments = Array.isArray(analysis.team_a_tournaments) ? analysis.team_a_tournaments : [];
  const teamBTournaments = Array.isArray(analysis.team_b_tournaments) ? analysis.team_b_tournaments : [];

  const renderTournamentTrackList = (tournaments, name, career, accentClass) => {
    const careerWr = career?.overall_win_rate !== null && career?.overall_win_rate !== undefined
      ? `${career.overall_win_rate}% WR`
      : null;
    const careerKd = career?.kd !== null && career?.kd !== undefined ? `${career.kd} K/D` : null;

    return (
      <div className={`rounded-lg border p-2.5 flex flex-col gap-2 ${accentClass}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-tactical text-[10px] font-extrabold uppercase tracking-wider truncate">
            {name} • {tournaments.length} Tournament{tournaments.length === 1 ? '' : 's'} Tracked
          </span>
          {(careerWr || careerKd) && (
            <span className="text-[10px] font-mono font-bold text-slate-200">
              {[careerWr, careerKd].filter(Boolean).join(' • ')}
            </span>
          )}
        </div>

        {tournaments.length === 0 ? (
          <div className="text-[10px] text-slate-500">No historical tournament records tracked yet.</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {tournaments.map((t, idx) => {
              const recordParts = [];
              if (t.maps_played > 0) recordParts.push(`${t.maps_won}W-${t.maps_played - t.maps_won}L maps (${t.win_rate}%)`);
              else if (t.matches_played > 0) recordParts.push(`${t.matches_won}W-${t.matches_played - t.matches_won}L matches`);
              if (t.kd !== null && t.kd !== undefined) recordParts.push(`${t.kd} K/D`);
              if (t.placement_rank) recordParts.push(`Rank #${t.placement_rank}`);

              return (
                <div
                  key={`${t.tournament_name}-${idx}`}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-950/75 border border-slate-800/80 text-[10px]"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 border ${
                        t.is_current
                          ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-300'
                          : 'bg-indigo-500/15 border-indigo-500/35 text-indigo-300'
                      }`}
                    >
                      {t.is_current ? 'Current' : 'Other'}
                    </span>
                    <span className="text-slate-200 font-semibold truncate" title={t.tournament_name}>
                      {t.tournament_name}
                    </span>
                  </div>
                  <span className="font-mono text-slate-300 shrink-0 text-[9px]">
                    {recordParts.length > 0 ? recordParts.join(' • ') : 'Registered'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`rounded-lg bg-slate-950/65 border border-cyan-500/20 ${compact ? 'p-3' : 'p-3.5'} flex flex-col gap-2.5`}>
      {/* Why Favored Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-tactical font-extrabold uppercase tracking-[0.16em] text-emerald-300">
          <TrendingUp size={13} className="text-emerald-400" />
          Why {analysis.favored_team_name || 'Favored Team'} Has Higher Win %
          {analysis.favored_probability ? ` (${analysis.favored_probability}% vs ${analysis.underdog_probability}%)` : ''}
        </div>
        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[9px] font-bold uppercase tracking-wider text-slate-300 inline-flex items-center gap-1">
          <Layers size={10} className="text-cyan-400" />
          All-Tournament Breakdown
        </span>
      </div>

      {analysis.why_higher_summary && (
        <p className="text-[11px] text-slate-300 leading-relaxed">{analysis.why_higher_summary}</p>
      )}

      {/* Concrete Key Advantage Factors */}
      {keyFactors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {keyFactors.map((kf, idx) => (
            <div
              key={`${kf.factor}-${idx}`}
              className="rounded-lg bg-slate-900/75 border border-slate-800 px-2.5 py-2 flex flex-col gap-1 text-[10px]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[9px] flex items-center gap-1">
                  {idx === 0 ? <CheckCircle2 size={10} className="text-emerald-400" /> : idx === 1 ? <Trophy size={10} className="text-amber-400" /> : idx === 2 ? <Crosshair size={10} className="text-rose-400" /> : <Target size={10} className="text-indigo-400" />}
                  {kf.factor}
                </span>
                <span className="font-mono text-[10px] font-bold">
                  <span className="text-emerald-300">{kf.favored_value}</span>
                  <span className="text-slate-500 mx-1">vs</span>
                  <span className="text-slate-400">{kf.underdog_value}</span>
                </span>
              </div>
              {kf.detail && (
                <p className="text-[10px] text-slate-400 leading-snug">{kf.detail}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Tracked Tournaments per Team */}
      {(teamATournaments.length > 0 || teamBTournaments.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
          {renderTournamentTrackList(
            teamATournaments,
            teamAName,
            analysis.team_a_career,
            'border-cyan-500/25 bg-cyan-950/10 text-cyan-300'
          )}
          {renderTournamentTrackList(
            teamBTournaments,
            teamBName,
            analysis.team_b_career,
            'border-rose-500/25 bg-rose-950/10 text-rose-300'
          )}
        </div>
      )}
    </div>
  );
};

export default WinAdvantageBreakdown;
