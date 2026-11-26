const roundNum = (val, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(val || 0) + Number.EPSILON) * factor) / factor;
};

const normalizeStr = (val) => (val ? String(val).trim() : '');

export const summarizePlayerRecords = (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const perMap = new Map();
  const tournaments = new Set();
  const teams = new Set();

  for (const r of rows) {
    const tName = normalizeStr(r.tournament_name);
    if (tName) tournaments.add(tName);
    const teamName = normalizeStr(r.team_name);
    if (teamName) teams.add(teamName);

    const mapKey = [
      tName.toLowerCase(),
      normalizeStr(r.game).toLowerCase(),
      normalizeStr(r.match).toLowerCase(),
      normalizeStr(r.set_num).toLowerCase(),
      normalizeStr(r.map).toLowerCase(),
      normalizeStr(r.created_at),
    ].join('|');

    if (!perMap.has(mapKey)) {
      perMap.set(mapKey, {
        win: false,
        kills: 0,
        deaths: 0,
        assists: 0,
        acsSum: 0,
        acsCount: 0,
        rounds: 0,
      });
    }
    const bucket = perMap.get(mapKey);
    bucket.win = bucket.win || String(r.win).toLowerCase() === 'true' || r.win === true || r.win === 1;
    bucket.kills += Number(r.kills || 0);
    bucket.deaths += Number(r.deaths || 0);
    bucket.assists += Number(r.assists || 0);
    if (r.acs !== null && r.acs !== undefined && Number(r.acs) > 0) {
      bucket.acsSum += Number(r.acs);
      bucket.acsCount += 1;
    }
    bucket.rounds = Math.max(bucket.rounds, Number(r.rounds || 0));
  }

  let kills = 0;
  let deaths = 0;
  let assists = 0;
  let rounds = 0;
  let acsSum = 0;
  let acsCount = 0;
  let wins = 0;

  perMap.forEach((m) => {
    kills += m.kills;
    deaths += m.deaths;
    assists += m.assists;
    acsSum += m.acsSum;
    acsCount += m.acsCount;
    rounds += m.rounds > 0 ? m.rounds : 1;
    if (m.win) wins += 1;
  });

  const maps = Math.max(1, perMap.size);
  const kd = deaths > 0 ? kills / deaths : kills > 0 ? Math.min(kills, 10) : 0;
  const kda = deaths > 0 ? (kills + assists) / deaths : kills + assists;

  return {
    tournaments: [...tournaments],
    teams: [...teams],
    maps: perMap.size,
    wins,
    win_rate: Math.round((wins / maps) * 100),
    kd: roundNum(kd, 2),
    kda: roundNum(kda, 2),
    kpr: roundNum(kills / Math.max(1, rounds), 2),
    avg_acs: acsCount > 0 ? Math.round(acsSum / acsCount) : 0,
    kills,
    deaths,
  };
};

const computeBlockDeltas = (prevBlock, currBlock) => {
  if (!prevBlock || !currBlock) return null;
  const kd_delta = roundNum(currBlock.kd - prevBlock.kd, 2);
  const win_rate_delta = currBlock.win_rate - prevBlock.win_rate;
  const kpr_delta = roundNum(currBlock.kpr - prevBlock.kpr, 2);
  const acs_delta = currBlock.avg_acs && prevBlock.avg_acs ? currBlock.avg_acs - prevBlock.avg_acs : null;

  let trend = 'steady';
  if (win_rate_delta >= 10 || kd_delta >= 0.1) trend = 'improved';
  else if (win_rate_delta <= -10 || kd_delta <= -0.1) trend = 'declined';

  return { kd_delta, win_rate_delta, kpr_delta, acs_delta, trend };
};

export const buildPlayerCrossTournamentComparison = (allRecords = [], ign, currentTournamentName = '', currentTeamName = '') => {
  const ignNorm = normalizeStr(ign).toLowerCase();
  if (!ignNorm || ignNorm === '—') return null;

  const currTournNorm = normalizeStr(currentTournamentName).toLowerCase();
  const playerRows = allRecords.filter((r) => normalizeStr(r.ign).toLowerCase() === ignNorm);
  if (playerRows.length === 0) return null;

  let prevRows = [];
  let currRows = [];

  if (currTournNorm) {
    currRows = playerRows.filter((r) => normalizeStr(r.tournament_name).toLowerCase() === currTournNorm);
    prevRows = playerRows.filter((r) => normalizeStr(r.tournament_name).toLowerCase() !== currTournNorm);
  } else {
    const distinctTourns = [];
    for (const r of playerRows) {
      const k = normalizeStr(r.tournament_name).toLowerCase();
      if (k && !distinctTourns.includes(k)) distinctTourns.push(k);
    }
    if (distinctTourns.length > 1) {
      const latest = distinctTourns[0]; // /api/match-records is ordered created_at desc
      currRows = playerRows.filter((r) => normalizeStr(r.tournament_name).toLowerCase() === latest);
      prevRows = playerRows.filter((r) => normalizeStr(r.tournament_name).toLowerCase() !== latest);
    }
  }

  if (prevRows.length === 0) return null;

  const prevBlock = summarizePlayerRecords(prevRows);
  const currBlock = summarizePlayerRecords(currRows);
  const deltas = computeBlockDeltas(prevBlock, currBlock);

  return {
    ign: playerRows[0]?.ign || ign,
    team_name: currentTeamName || currBlock?.teams?.[0] || prevBlock?.teams?.[0] || 'Roster',
    previous_tournaments: prevBlock?.tournaments || [],
    previous_teams: prevBlock?.teams || [],
    previous: prevBlock,
    current: currBlock,
    kd_delta: deltas ? deltas.kd_delta : null,
    win_rate_delta: deltas ? deltas.win_rate_delta : null,
    acs_delta: deltas ? deltas.acs_delta : null,
    trend: deltas ? deltas.trend : 'prior_only',
  };
};

export const buildLeaderboardHistoricalAnalysis = (
  allRecords = [],
  currentTournamentName = '',
  player1Ign = '',
  team1Name = '',
  player2Ign = '',
  team2Name = ''
) => {
  if (!Array.isArray(allRecords) || allRecords.length === 0) return null;

  const p1 = buildPlayerCrossTournamentComparison(allRecords, player1Ign, currentTournamentName, team1Name);
  const p2 = buildPlayerCrossTournamentComparison(allRecords, player2Ign, currentTournamentName, team2Name);

  // Check if these two players directly fought each other on opposing sides in a previous tournament
  const currTournNorm = normalizeStr(currentTournamentName).toLowerCase();
  const ign1Norm = normalizeStr(player1Ign).toLowerCase();
  const ign2Norm = normalizeStr(player2Ign).toLowerCase();

  const encounters = [];
  let p1Wins = 0;
  let p2Wins = 0;
  const rematchTournaments = new Set();

  if (ign1Norm && ign2Norm && ign1Norm !== ign2Norm) {
    const byMatch = new Map();
    for (const r of allRecords) {
      const tNorm = normalizeStr(r.tournament_name).toLowerCase();
      if (currTournNorm && tNorm === currTournNorm) continue;

      const rIgn = normalizeStr(r.ign).toLowerCase();
      if (rIgn !== ign1Norm && rIgn !== ign2Norm) continue;

      const key = [
        tNorm,
        normalizeStr(r.game).toLowerCase(),
        normalizeStr(r.match).toLowerCase(),
        normalizeStr(r.set_num).toLowerCase(),
        normalizeStr(r.map).toLowerCase(),
      ].join('|');

      if (!byMatch.has(key)) byMatch.set(key, {});
      byMatch.get(key)[rIgn] = r;
    }

    byMatch.forEach((pair) => {
      const rec1 = pair[ign1Norm];
      const rec2 = pair[ign2Norm];
      if (!rec1 || !rec2) return;
      const w1 = String(rec1.win).toLowerCase() === 'true' || rec1.win === true || rec1.win === 1;
      const w2 = String(rec2.win).toLowerCase() === 'true' || rec2.win === true || rec2.win === 1;
      if (w1 === w2) return;

      if (w1) p1Wins += 1;
      else p2Wins += 1;

      const tLabel = normalizeStr(rec1.tournament_name) || 'Previous Tournament';
      rematchTournaments.add(tLabel);

      encounters.push({
        tournament: tLabel,
        map: normalizeStr(rec1.map) || 'Match Series',
        team_a_prior: rec1.team_name,
        team_b_prior: rec2.team_name,
        players_a: [rec1.ign],
        players_b: [rec2.ign],
        winner_side: w1 ? 'team_a' : 'team_b',
      });
    });
  }

  const returningPlayers = [];
  if (p1) returningPlayers.push({ ...p1, team_side: 'team_a' });
  if (p2) returningPlayers.push({ ...p2, team_side: 'team_b' });

  if (returningPlayers.length === 0 && encounters.length === 0) return null;

  const prevTourns = [...new Set([
    ...(p1?.previous_tournaments || []),
    ...(p2?.previous_tournaments || []),
    ...rematchTournaments,
  ])];

  const summaryParts = [];
  if (encounters.length > 0) {
    summaryParts.push(
      `${p1?.ign || player1Ign} and ${p2?.ign || player2Ign} previously faced off ${encounters.length} time${encounters.length === 1 ? '' : 's'} across ${[...rematchTournaments].join(', ')} (${p1Wins}W vs ${p2Wins}W).`
    );
  }
  [p1, p2].forEach((p) => {
    if (!p?.previous) return;
    if (p.current) {
      const kdSign = p.kd_delta > 0 ? `+${p.kd_delta}` : `${p.kd_delta}`;
      const wrSign = p.win_rate_delta > 0 ? `+${p.win_rate_delta}%` : `${p.win_rate_delta}%`;
      summaryParts.push(
        `${p.ign} shifted from ${p.previous.kd} K/D (${p.previous.win_rate}% WR) in prior tournament(s) to ${p.current.kd} K/D (${p.current.win_rate}% WR) currently (${kdSign} K/D, ${wrSign} WR).`
      );
    } else {
      summaryParts.push(
        `${p.ign} has prior tournament records in ${p.previous_tournaments.join(', ')} (${p.previous.kd} K/D, ${p.previous.win_rate}% WR).`
      );
    }
  });

  return {
    has_previous_records: true,
    rematch_detected: encounters.length > 0,
    current_tournament: currentTournamentName || null,
    previous_tournaments: prevTourns,
    team_a: p1 ? {
      team_name: `${p1.ign} (${p1.team_name})`,
      previous: p1.previous,
      current: p1.current,
      deltas: p1.current ? { kd_delta: p1.kd_delta, win_rate_delta: p1.win_rate_delta, trend: p1.trend } : null,
    } : null,
    team_b: p2 ? {
      team_name: `${p2.ign} (${p2.team_name})`,
      previous: p2.previous,
      current: p2.current,
      deltas: p2.current ? { kd_delta: p2.kd_delta, win_rate_delta: p2.win_rate_delta, trend: p2.trend } : null,
    } : null,
    head_to_head: {
      prior_encounters: encounters.length,
      team_a_wins: p1Wins,
      team_b_wins: p2Wins,
      tournaments: [...rematchTournaments],
      pair_details: encounters.slice(0, 6),
      summary: encounters.length > 0 ? summaryParts[0] : null,
    },
    returning_players: returningPlayers,
    summary: summaryParts.join(' '),
  };
};
