import React from 'react';
import {
  Trophy,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Shield,
  Lock,
  Clock,
} from 'lucide-react';
import CrossTournamentAnalysis from './CrossTournamentAnalysis.jsx';
import WinAdvantageBreakdown from './WinAdvantageBreakdown.jsx';

/**
 * Read-only HUD card displaying pre-match AI predictions, community votes,
 * final match scores, and the user's locked pick for concluded matches.
 */
const ConcludedPredictionCard = ({ match, userPrediction = null, compact = false }) => {
  if (!match) return null;

  const teamA = match.team_a || {};
  const teamB = match.team_b || {};
  const teamAId = teamA.team_id;
  const teamBId = teamB.team_id;
  const teamAName = teamA.team_name || 'Team A';
  const teamBName = teamB.team_name || 'Team B';

  const hasScores = match.score_a !== null && match.score_a !== undefined && match.score_b !== null && match.score_b !== undefined;
  const scoreA = hasScores ? Number(match.score_a) : null;
  const scoreB = hasScores ? Number(match.score_b) : null;

  let winnerId = match.actual_winner_team_id || null;
  if (!winnerId && hasScores && scoreA !== scoreB) {
    winnerId = scoreA > scoreB ? teamAId : teamBId;
  }

  const isTeamAWinner = Boolean(winnerId && teamAId && String(winnerId) === String(teamAId));
  const isTeamBWinner = Boolean(winnerId && teamBId && String(winnerId) === String(teamBId));
  const actualWinnerName =
    match.actual_winner_name ||
    (isTeamAWinner ? teamAName : isTeamBWinner ? teamBName : null);

  const aiPred = match.system_prediction || null;
  const probA = typeof aiPred?.probability_a === 'number' ? aiPred.probability_a : null;
  const probB = typeof aiPred?.probability_b === 'number' ? aiPred.probability_b : null;
  const aiFavoredId = aiPred?.predicted_winner_id || null;
  const aiFavoredName =
    aiPred?.predicted_winner_name ||
    (aiFavoredId && String(aiFavoredId) === String(teamAId)
      ? teamAName
      : aiFavoredId && String(aiFavoredId) === String(teamBId)
      ? teamBName
      : null);

  const aiCorrect = Boolean(aiPred && winnerId && aiFavoredId && String(aiFavoredId) === String(winnerId));
  const isUpset = Boolean(aiPred && winnerId && aiFavoredId && String(aiFavoredId) !== String(winnerId));

  const pickedId = userPrediction?.predicted_winner_team_id || null;
  const pickedTeamA = Boolean(pickedId && teamAId && String(pickedId) === String(teamAId));
  const pickedTeamB = Boolean(pickedId && teamBId && String(pickedId) === String(teamBId));
  const pickedTeamName = pickedTeamA ? teamAName : pickedTeamB ? teamBName : pickedId ? 'Recorded Pick' : null;

  const userWon = Boolean(pickedId && winnerId && String(pickedId) === String(winnerId));
  const userLost = Boolean(pickedId && winnerId && String(pickedId) !== String(winnerId));

  const votesA = Number(match.votes_a || 0);
  const votesB = Number(match.votes_b || 0);
  const totalVotes = Number(match.total_votes ?? votesA + votesB);
  const votePctA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 50;
  const votePctB = totalVotes > 0 ? 100 - votePctA : 50;

  let statusBadge = {
    label: 'Concluded',
    className: 'bg-slate-800/80 border-slate-600/50 text-slate-300',
    icon: Clock,
  };

  if (userWon) {
    statusBadge = {
      label: 'Your Pick Won',
      className: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      icon: CheckCircle2,
    };
  } else if (userLost) {
    statusBadge = {
      label: 'Pick Missed',
      className: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
      icon: XCircle,
    };
  } else if (aiCorrect) {
    statusBadge = {
      label: 'AI Correct',
      className: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      icon: CheckCircle2,
    };
  } else if (isUpset) {
    statusBadge = {
      label: 'Upset',
      className: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      icon: AlertTriangle,
    };
  }

  const StatusIcon = statusBadge.icon;
  const scheduleLabel =
    match.match_day && match.match_time
      ? `${match.match_day} • ${match.match_time}${match.match_timezone ? ` ${match.match_timezone}` : ''}`
      : match.match_schedule || 'Concluded Match';

  const renderTeamTile = (team, name, score, isWinner, isUserPick, isAiFavored, alignRight = false) => (
    <div
      className={`hud-chamfer-sm relative flex items-center gap-3 px-3 py-2.5 border transition-colors ${
        isWinner
          ? 'bg-emerald-950/30 border-emerald-500/45 shadow-[0_0_16px_rgba(16,185,129,0.12)]'
          : 'bg-slate-900/75 border-slate-800/90'
      } ${alignRight ? 'flex-row-reverse text-right' : ''}`}
    >
      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
        {team?.logo_url ? (
          <img src={team.logo_url} alt={name} className="w-8 h-8 object-contain" />
        ) : (
          <Shield size={18} className={isWinner ? 'text-emerald-400' : 'text-slate-500'} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className={`flex items-center gap-1.5 flex-wrap ${alignRight ? 'justify-end' : ''}`}>
          <span className={`font-tactical font-extrabold text-sm uppercase tracking-wider truncate ${isWinner ? 'text-white' : 'text-slate-300'}`}>
            {name}
          </span>
          {isWinner && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
              <Trophy size={10} /> Winner
            </span>
          )}
        </div>

        <div className={`flex items-center gap-1.5 mt-1 flex-wrap ${alignRight ? 'justify-end' : ''}`}>
          {isAiFavored && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-cyan-400">
              <Cpu size={10} /> AI Pick
            </span>
          )}
          {isUserPick && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-300">
              <Lock size={9} /> Your Pick
            </span>
          )}
        </div>
      </div>

      {hasScores && (
        <div
          className={`px-2.5 py-1 rounded font-tactical font-black text-base tabular-nums shrink-0 ${
            isWinner
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-950/90 text-slate-400 border border-slate-800'
          }`}
        >
          {score}
        </div>
      )}
    </div>
  );

  return (
    <div className={`hud-card border border-slate-800/90 bg-slate-950/80 ${compact ? 'p-4' : 'p-5'} flex flex-col gap-3.5`}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/70 text-[10px] font-bold uppercase tracking-widest text-slate-300">
            {match.stage || match.game_title || 'Final Result'}
          </span>
          <span className="text-[11px] text-slate-400 truncate">{scheduleLabel}</span>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-tactical font-extrabold uppercase tracking-wider ${statusBadge.className}`}>
          <StatusIcon size={12} />
          {statusBadge.label}
        </span>
      </div>

      {/* Matchup & Final Score */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        {renderTeamTile(
          teamA,
          teamAName,
          scoreA,
          isTeamAWinner,
          pickedTeamA,
          Boolean(aiFavoredId && teamAId && String(aiFavoredId) === String(teamAId)),
          false
        )}

        <div className="flex flex-col items-center justify-center px-2 py-1 text-center">
          <span className="text-[10px] font-tactical font-black uppercase tracking-[0.2em] text-slate-500">
            {hasScores ? 'FINAL' : 'VS'}
          </span>
          {hasScores && (
            <span className="text-xs font-tactical font-extrabold text-white mt-0.5 tabular-nums">
              {scoreA} : {scoreB}
            </span>
          )}
        </div>

        {renderTeamTile(
          teamB,
          teamBName,
          scoreB,
          isTeamBWinner,
          pickedTeamB,
          Boolean(aiFavoredId && teamBId && String(aiFavoredId) === String(teamBId)),
          true
        )}
      </div>

      {/* Pre-Match AI Forecast */}
      {aiPred ? (
        <div className="rounded-lg bg-slate-900/70 border border-cyan-500/20 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[10px] font-tactical font-extrabold uppercase tracking-[0.16em] text-cyan-300">
                <Cpu size={13} className="text-cyan-400" />
                Decision Tree Prediction
              </div>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                {aiPred.model_type || 'CART Decision Tree'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {aiFavoredName && (
                <span className="text-[11px] font-bold text-slate-200">
                  Favored: <span className="text-cyan-300">{aiFavoredName}</span>
                </span>
              )}
              {winnerId && (aiCorrect || isUpset) && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                    aiCorrect
                      ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                      : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                  }`}
                >
                  {aiCorrect ? 'AI Correct' : 'Upset'}
                </span>
              )}
            </div>
          </div>

          {probA !== null && probB !== null && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-cyan-300 truncate max-w-[46%]">
                  {teamAName} <span className="text-white tabular-nums">{probA}%</span>
                </span>
                <span className="text-rose-300 truncate max-w-[46%] text-right">
                  <span className="text-white tabular-nums">{probB}%</span> {teamBName}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, probA))}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, probB))}%` }}
                />
              </div>
            </div>
          )}

          {aiPred.reasoning && (
            <p className="text-[11px] text-slate-400 leading-relaxed">{aiPred.reasoning}</p>
          )}

          {Array.isArray(aiPred.decision_path) && aiPred.decision_path.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {aiPred.decision_path.map((step, idx) => {
                const valFormatted = step.value > 0 ? `+${step.value}` : `${step.value}`;
                const thrFormatted = step.threshold > 0 ? `+${step.threshold}` : `${step.threshold}`;
                return (
                  <span
                    key={`${step.feature || 'rule'}-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700/80 text-[10px] text-slate-300 font-mono"
                  >
                    <span className="text-cyan-300 font-semibold">{step.label}:</span>
                    <span>{valFormatted}</span>
                    <span className="text-amber-300">{step.operator}</span>
                    <span>{thrFormatted}</span>
                  </span>
                );
              })}
              {aiPred.tree_stats && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold">
                  Depth {aiPred.tree_stats.depth} • {aiPred.tree_stats.leaf_samples} leaf sample{aiPred.tree_stats.leaf_samples === 1 ? '' : 's'}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-slate-900/50 border border-slate-800/80 px-3 py-2 text-[11px] text-slate-500 flex items-center gap-2">
          <Cpu size={13} className="text-slate-600 shrink-0" />
          Pre-match AI prediction data unavailable for this matchup.
        </div>
      )}

      {/* Why Favored Team Has Higher Win % + All-Tournament Tracking */}
      {aiPred?.win_advantage_analysis && (
        <WinAdvantageBreakdown
          analysis={aiPred.win_advantage_analysis}
          teamAName={teamAName}
          teamBName={teamBName}
          compact={compact}
        />
      )}

      {/* Cross-Tournament Returning Players & Rematch History */}
      {aiPred?.historical_analysis && (
        <CrossTournamentAnalysis
          analysis={aiPred.historical_analysis}
          teamAName={teamAName}
          teamBName={teamBName}
          compact={compact}
        />
      )}

      {/* Footer: User Pick + Community Picks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/70 text-[11px]">
        <div className="flex items-center gap-2 flex-wrap">
          <Lock size={12} className="text-slate-500 shrink-0" />
          {pickedTeamName ? (
            <span className="text-slate-300">
              Your Locked Pick: <span className="font-bold text-white">{pickedTeamName}</span>
              {actualWinnerName && (
                <span className={`ml-1.5 font-semibold ${userWon ? 'text-emerald-400' : userLost ? 'text-rose-400' : 'text-slate-400'}`}>
                  ({userWon ? 'Won' : userLost ? `Winner: ${actualWinnerName}` : 'Finalized'})
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-500">No user pick recorded before match lock.</span>
          )}
        </div>

        {totalVotes > 0 && (
          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            <Users size={12} className="text-cyan-400" />
            <span>
              Community: <span className="text-slate-200 font-semibold">{votePctA}%</span> ({votesA}) vs{' '}
              <span className="text-slate-200 font-semibold">{votePctB}%</span> ({votesB}) • {totalVotes} vote{totalVotes === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConcludedPredictionCard;
