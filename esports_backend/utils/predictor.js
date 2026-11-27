const { DecisionTreeClassifier } = require('./decisionTree');

const FEATURE_SPECS = [
  { key: 'kd_diff', label: 'K/D Ratio Diff' },
  { key: 'kpr_diff', label: 'Kills/Round Diff' },
  { key: 'survival_diff', label: 'Survival Efficiency Diff' },
  { key: 'fk_diff', label: 'First Kills/Round Diff' },
  { key: 'obj_diff', label: 'Objectives/Round Diff' },
  { key: 'assist_diff', label: 'Assists/Round Diff' },
  { key: 'hs_diff', label: 'Headshot Rate Diff' },
];

const DEFAULT_BASELINE_PROFILE = {
  kd: 1.0,
  kda: 1.3,
  kpr: 3.4,
  dpr: 3.4,
  survival: 0.0,
  fk_rate: 0.35,
  obj_rate: 0.25,
  assist_rate: 1.5,
  hs_rate: 0.15,
  win_rate: 0.5,
  avg_acs: 0,
  maps_played: 0,
  wins: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
  first_kills: 0,
  objectives: 0,
  rounds: 0,
};

const roundNum = (val, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(val || 0) + Number.EPSILON) * factor) / factor;
};

const summarizeRowsIntoProfile = (rows, fallbackMaps = 1) => {
  if (!rows || rows.length === 0) return null;

  // Group by map/match first so map rounds aren't counted once per player row
  const perMap = new Map();
  for (const r of rows) {
    const mapKey = [
      (r.tournament_name || '').trim().toLowerCase(),
      (r.game || '').trim().toLowerCase(),
      (r.match || '').trim().toLowerCase(),
      (r.set_num || '').trim().toLowerCase(),
      (r.map || '').trim().toLowerCase(),
    ].join('|');

    if (!perMap.has(mapKey)) {
      perMap.set(mapKey, {
        win: false,
        kills: 0,
        deaths: 0,
        assists: 0,
        hs: 0,
        fk: 0,
        obj: 0,
        acsSum: 0,
        acsCount: 0,
        rounds: 0,
      });
    }
    const bucket = perMap.get(mapKey);
    bucket.win = bucket.win || Boolean(r.win);
    bucket.kills += Number(r.kills || 0);
    bucket.deaths += Number(r.deaths || 0);
    bucket.assists += Number(r.assists || 0);
    bucket.hs += Number(r.headshots || 0);
    bucket.fk += Number(r.first_kills || 0);
    bucket.obj += Number(r.plants || 0) + Number(r.defuse || 0);
    if (r.acs !== null && r.acs !== undefined && Number(r.acs) > 0) {
      bucket.acsSum += Number(r.acs);
      bucket.acsCount += 1;
    }
    bucket.rounds = Math.max(bucket.rounds, Number(r.rounds || 0));
  }

  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalHs = 0;
  let totalFk = 0;
  let totalObj = 0;
  let totalRounds = 0;
  let totalAcs = 0;
  let totalAcsCount = 0;
  let mapWins = 0;
  let mapKdaSum = 0;

  perMap.forEach((m) => {
    totalKills += m.kills;
    totalDeaths += m.deaths;
    totalAssists += m.assists;
    totalHs += m.hs;
    totalFk += m.fk;
    totalObj += m.obj;
    totalAcs += m.acsSum;
    totalAcsCount += m.acsCount;
    totalRounds += m.rounds > 0 ? m.rounds : 1;
    if (m.win) mapWins += 1;
    mapKdaSum += m.deaths > 0 ? (m.kills + m.assists) / m.deaths : m.kills + m.assists;
  });

  const safeRounds = Math.max(1, totalRounds);
  const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills > 0 ? Math.min(totalKills, 10) : 0;
  const mapsCount = Math.max(1, perMap.size || fallbackMaps);
  const kda = mapKdaSum / mapsCount;
  const kpr = totalKills / safeRounds;
  const dpr = totalDeaths / safeRounds;

  return {
    kd,
    kda,
    kpr,
    dpr,
    survival: kpr - dpr,
    fk_rate: totalFk / safeRounds,
    obj_rate: totalObj / safeRounds,
    assist_rate: totalAssists / safeRounds,
    hs_rate: totalKills > 0 ? totalHs / totalKills : 0,
    win_rate: mapWins / mapsCount,
    avg_acs: totalAcsCount > 0 ? totalAcs / totalAcsCount : 0,
    maps_played: perMap.size,
    wins: mapWins,
    kills: totalKills,
    deaths: totalDeaths,
    assists: totalAssists,
    first_kills: totalFk,
    objectives: totalObj,
    rounds: totalRounds,
  };
};

const blendProfiles = (primary, secondary, weightPrimary = 0.6) => {
  if (!primary) return secondary;
  if (!secondary) return primary;
  const w1 = weightPrimary;
  const w2 = 1 - w1;
  const mix = (k) => (primary[k] ?? 0) * w1 + (secondary[k] ?? 0) * w2;
  return {
    kd: mix('kd'),
    kda: mix('kda'),
    kpr: mix('kpr'),
    dpr: mix('dpr'),
    survival: mix('survival'),
    fk_rate: mix('fk_rate'),
    obj_rate: mix('obj_rate'),
    assist_rate: mix('assist_rate'),
    hs_rate: mix('hs_rate'),
    win_rate: mix('win_rate'),
    avg_acs: mix('avg_acs'),
    maps_played: (primary.maps_played || 0) + (secondary.maps_played || 0),
    wins: (primary.wins || 0) + (secondary.wins || 0),
    kills: (primary.kills || 0) + (secondary.kills || 0),
    deaths: (primary.deaths || 0) + (secondary.deaths || 0),
    assists: (primary.assists || 0) + (secondary.assists || 0),
    first_kills: (primary.first_kills || 0) + (secondary.first_kills || 0),
    objectives: (primary.objectives || 0) + (secondary.objectives || 0),
    rounds: (primary.rounds || 0) + (secondary.rounds || 0),
  };
};

const computePairDiffFeatures = (profileA, profileB) => ({
  kd_diff: (profileA.kd ?? 1) - (profileB.kd ?? 1),
  kpr_diff: (profileA.kpr ?? 0) - (profileB.kpr ?? 0),
  survival_diff: (profileA.survival ?? 0) - (profileB.survival ?? 0),
  fk_diff: (profileA.fk_rate ?? 0) - (profileB.fk_rate ?? 0),
  obj_diff: (profileA.obj_rate ?? 0) - (profileB.obj_rate ?? 0),
  assist_diff: (profileA.assist_rate ?? 0) - (profileB.assist_rate ?? 0),
  hs_diff: (profileA.hs_rate ?? 0) - (profileB.hs_rate ?? 0),
});

const median = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
};

const buildBaselineFromProfiles = (teamProfiles) => {
  const vals = Object.values(teamProfiles);
  if (vals.length === 0) return DEFAULT_BASELINE_PROFILE;
  // Conservative 85% of league median so unrecorded opponents do not outrank proven teams due to outliers
  const med = (key) => median(vals.map((p) => p[key] ?? 0));
  const medKd = med('kd') || 1.0;
  const medKpr = med('kpr') || 3.4;
  const medDpr = med('dpr') || 3.4;
  return {
    kd: medKd * 0.85,
    kda: med('kda') * 0.85,
    kpr: medKpr * 0.85,
    dpr: medDpr,
    survival: medKpr * 0.85 - medDpr,
    fk_rate: med('fk_rate') * 0.85,
    obj_rate: med('obj_rate') * 0.85,
    assist_rate: med('assist_rate') * 0.85,
    hs_rate: med('hs_rate') * 0.85,
    win_rate: 0.4,
    avg_acs: med('avg_acs') * 0.85,
    maps_played: 0,
    wins: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    first_kills: 0,
    objectives: 0,
    rounds: 0,
  };
};

const formatRuleStep = (step) => {
  const valStr = step.value > 0 ? `+${step.value}` : `${step.value}`;
  const thrStr = step.threshold > 0 ? `+${step.threshold}` : `${step.threshold}`;
  return `${step.label} (${valStr}) ${step.operator} ${thrStr}`;
};

const dedupeRecords = (rows) => {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const key =
      r.id ||
      [
        r.tournament_name || '',
        r.match || '',
        r.set_num || '',
        r.map || '',
        r.team_name || '',
        r.ign || '',
        r.kills || 0,
        r.deaths || 0,
      ].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
};

const resolveTournamentMeta = (tournamentMetaMap, rawName) => {
  const trimmed = (rawName || '').trim();
  if (!trimmed) return { key: '', label: 'Unassigned Tournament' };
  const lower = trimmed.toLowerCase();
  const mapped = tournamentMetaMap.get(lower);
  if (mapped) return mapped;
  return { key: lower, label: trimmed };
};

const toPublicStatBlock = (profile, tournamentsSet) => {
  if (!profile) return null;
  return {
    tournaments: [...tournamentsSet],
    maps: profile.maps_played,
    wins: profile.wins,
    win_rate: Math.round(profile.win_rate * 100),
    kd: roundNum(profile.kd, 2),
    kda: roundNum(profile.kda, 2),
    kpr: roundNum(profile.kpr, 2),
    fk_rate: roundNum(profile.fk_rate, 2),
    obj_rate: roundNum(profile.obj_rate, 2),
    avg_acs: Math.round(profile.avg_acs || 0),
    kills: profile.kills,
    deaths: profile.deaths,
  };
};

const computeDeltas = (prevBlock, currBlock) => {
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

/**
 * Fetches match_records, players, tournaments, teams, matches, and bracket_results,
 * builds cross-tournament team & player indices, and trains a CART Decision Tree classifier.
 */
const buildPredictorContext = async (supabase) => {
  const [
    { data: rawRecords, error },
    { data: rawPlayers },
    { data: rawTourns },
    { data: rawTeams },
    { data: rawMatches },
    { data: rawBracketResults },
  ] = await Promise.all([
    supabase
      .from('match_records')
      .select(
        'id, tournament_name, game, match, set_num, map, team_name, ign, win, kills, deaths, assists, headshots, acs, econ, rounds, first_kills, plants, defuse, created_at'
      )
      .order('created_at', { ascending: true }),
    supabase.from('players').select('player_id, team_id, player_name'),
    supabase.from('tournaments').select('id, name'),
    supabase.from('teams').select('team_id, team_name, tournament_name'),
    supabase.from('matches').select('match_id, tournament_name, status, team_a_id, team_b_id, team_a_score, team_b_score, team1_score, team2_score'),
    supabase.from('bracket_results').select('tournament_name, team_name, placement_rank'),
  ]);

  if (error) {
    console.error('Predictor DB Error fetching match_records:', error);
    return null;
  }

  const records = rawRecords || [];
  const tournamentMetaMap = new Map();
  (rawTourns || []).forEach((t) => {
    if (!t?.name) return;
    const label = t.name.trim();
    const key = label.toLowerCase();
    const meta = { key, label };
    tournamentMetaMap.set(key, meta);
    if (t.id) tournamentMetaMap.set(String(t.id).trim().toLowerCase(), meta);
  });

  // Map team_id <-> team_name and track all tournaments where teams are registered
  const teamNameById = new Map();
  const registeredTournsByTeam = new Map();
  (rawTeams || []).forEach((tm) => {
    const tName = (tm?.team_name || '').trim();
    if (!tName) return;
    const tKey = tName.toLowerCase();
    if (tm.team_id) teamNameById.set(String(tm.team_id), tName);

    const tournMeta = resolveTournamentMeta(tournamentMetaMap, tm.tournament_name);
    if (tournMeta.key && tournMeta.key !== 'default') {
      if (!registeredTournsByTeam.has(tKey)) registeredTournsByTeam.set(tKey, new Map());
      registeredTournsByTeam.get(tKey).set(tournMeta.key, tournMeta.label);
    }
  });

  // Track matches W/L across all tournaments per team_name
  const matchStatsByTeamTourn = new Map();
  (rawMatches || []).forEach((m) => {
    const tournMeta = resolveTournamentMeta(tournamentMetaMap, m.tournament_name);
    if (!tournMeta.key) return;

    const statusLower = String(m.status || '').trim().toLowerCase();
    const isFinished = statusLower === 'finished' || statusLower === 'completed';
    const scoreA = Number(m.team_a_score ?? m.team1_score ?? 0);
    const scoreB = Number(m.team_b_score ?? m.team2_score ?? 0);

    const addMatchForSide = (teamId, won, played) => {
      const name = teamId ? teamNameById.get(String(teamId)) : null;
      if (!name) return;
      const tKey = name.toLowerCase();
      if (!matchStatsByTeamTourn.has(tKey)) matchStatsByTeamTourn.set(tKey, new Map());
      const byTourn = matchStatsByTeamTourn.get(tKey);
      if (!byTourn.has(tournMeta.key)) {
        byTourn.set(tournMeta.key, { label: tournMeta.label, matches_played: 0, matches_won: 0 });
      }
      const bucket = byTourn.get(tournMeta.key);
      if (played) {
        bucket.matches_played += 1;
        if (won) bucket.matches_won += 1;
      }
    };

    if (isFinished && scoreA !== scoreB) {
      addMatchForSide(m.team_a_id, scoreA > scoreB, true);
      addMatchForSide(m.team_b_id, scoreB > scoreA, true);
    } else {
      addMatchForSide(m.team_a_id, false, false);
      addMatchForSide(m.team_b_id, false, false);
    }
  });

  // Track official podium placements from bracket_results across all tournaments
  const placementsByTeamTourn = new Map();
  (rawBracketResults || []).forEach((br) => {
    const tName = (br?.team_name || '').trim();
    if (!tName || !br?.tournament_name) return;
    const tournMeta = resolveTournamentMeta(tournamentMetaMap, br.tournament_name);
    if (!tournMeta.key) return;
    const tKey = tName.toLowerCase();
    if (!placementsByTeamTourn.has(tKey)) placementsByTeamTourn.set(tKey, new Map());
    const existingRank = placementsByTeamTourn.get(tKey).get(tournMeta.key)?.rank;
    const rankNum = Number(br.placement_rank) || null;
    if (!existingRank || (rankNum && rankNum < existingRank)) {
      placementsByTeamTourn.get(tKey).set(tournMeta.key, {
        label: tournMeta.label,
        rank: rankNum,
      });
    }
  });

  const playersByTeamId = new Map();
  (rawPlayers || []).forEach((p) => {
    if (!p?.team_id || !p?.player_name) return;
    const tid = String(p.team_id);
    if (!playersByTeamId.has(tid)) playersByTeamId.set(tid, []);
    playersByTeamId.get(tid).push(p.player_name.trim());
  });

  const rowsByTeam = new Map();
  const rowsByIgn = new Map();
  const ignDisplay = new Map();
  const rowsByMatchMap = new Map();
  const matchEncounters = [];

  for (const r of records) {
    const teamName = (r.team_name || '').trim();
    const ignRaw = (r.ign || '').trim();

    if (teamName) {
      const teamKey = teamName.toLowerCase();
      if (!rowsByTeam.has(teamKey)) rowsByTeam.set(teamKey, []);
      rowsByTeam.get(teamKey).push(r);
    }

    if (ignRaw && ignRaw !== '-' && ignRaw.toLowerCase() !== 'unknown') {
      const ignKey = ignRaw.toLowerCase();
      if (!ignDisplay.has(ignKey)) ignDisplay.set(ignKey, ignRaw);
      if (!rowsByIgn.has(ignKey)) rowsByIgn.set(ignKey, []);
      rowsByIgn.get(ignKey).push(r);
    }

    if (!teamName) continue;
    const tournMeta = resolveTournamentMeta(tournamentMetaMap, r.tournament_name);
    const matchMapKey = [
      tournMeta.key,
      (r.game || '').trim().toLowerCase(),
      (r.match || '').trim().toLowerCase(),
      (r.set_num || '').trim().toLowerCase(),
      (r.map || '').trim().toLowerCase(),
    ].join('|');

    if (!rowsByMatchMap.has(matchMapKey)) {
      rowsByMatchMap.set(matchMapKey, {
        tournMeta,
        map: (r.map || '').trim() || 'Match Series',
        teams: new Map(),
      });
    }
    const group = rowsByMatchMap.get(matchMapKey);
    const tKey = teamName.toLowerCase();
    if (!group.teams.has(tKey)) group.teams.set(tKey, []);
    group.teams.get(tKey).push(r);
  }

  const teamProfiles = {};
  rowsByTeam.forEach((rows, teamKey) => {
    const profile = summarizeRowsIntoProfile(rows);
    if (profile) teamProfiles[teamKey] = profile;
  });

  const baselineProfile = buildBaselineFromProfiles(teamProfiles);

  const trainingData = [];
  rowsByMatchMap.forEach((group) => {
    const entries = [];
    group.teams.forEach((rows, teamKey) => {
      const won = rows.some((r) => Boolean(r.win));
      const profile = summarizeRowsIntoProfile(rows, 1);
      const igns = new Set();
      rows.forEach((r) => {
        const ign = (r.ign || '').trim().toLowerCase();
        if (ign && ign !== '-') igns.add(ign);
      });
      if (profile) {
        entries.push({
          teamKey,
          teamLabel: (rows[0]?.team_name || '').trim(),
          won,
          profile,
          igns,
        });
      }
    });

    if (entries.length >= 2) {
      matchEncounters.push({
        tournKey: group.tournMeta.key,
        tournLabel: group.tournMeta.label,
        map: group.map,
        sides: entries,
      });

      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const a = entries[i];
          const b = entries[j];
          if (a.won === b.won) continue;
          trainingData.push({
            features: computePairDiffFeatures(a.profile, b.profile),
            label: a.won ? 1 : 0,
          });
          trainingData.push({
            features: computePairDiffFeatures(b.profile, a.profile),
            label: b.won ? 1 : 0,
          });
        }
      }
    }
  });

  if (trainingData.length < 4) {
    Object.values(teamProfiles).forEach((profile) => {
      const won = profile.win_rate >= 0.5;
      trainingData.push({
        features: computePairDiffFeatures(profile, baselineProfile),
        label: won ? 1 : 0,
      });
      trainingData.push({
        features: computePairDiffFeatures(baselineProfile, profile),
        label: won ? 0 : 1,
      });
    });
  }

  const tree = new DecisionTreeClassifier({
    maxDepth: 4,
    minSamplesSplit: 2,
    minSamplesLeaf: 1,
    smoothingAlpha: 6,
  });
  tree.fit(trainingData, FEATURE_SPECS);
  const evalResult = tree.evaluate(trainingData);

  return {
    tree,
    teamProfiles,
    baselineProfile,
    trainingSamples: trainingData.length,
    trainingAccuracy: evalResult.accuracy,
    tournamentMetaMap,
    playersByTeamId,
    rowsByTeam,
    rowsByIgn,
    ignDisplay,
    matchEncounters,
    registeredTournsByTeam,
    matchStatsByTeamTourn,
    placementsByTeamTourn,
  };
};

/**
 * Collects per-tournament breakdown across match_records, matches, bracket_results,
 * registered team folders, and returning players' other tournaments.
 */
const buildAllTournamentBreakdownForSide = (context, teamKey, combinedRows, currentTournMeta) => {
  const byTournKey = new Map();
  const ensureTournBucket = (tKey, label) => {
    if (!tKey) return null;
    if (!byTournKey.has(tKey)) {
      byTournKey.set(tKey, {
        tournament_name: label,
        is_current: Boolean(currentTournMeta.key && tKey === currentTournMeta.key),
        rows: [],
        matches_played: 0,
        matches_won: 0,
        placement_rank: null,
      });
    }
    return byTournKey.get(tKey);
  };

  combinedRows.forEach((r) => {
    const meta = resolveTournamentMeta(context.tournamentMetaMap, r.tournament_name);
    const bucket = ensureTournBucket(meta.key, meta.label);
    if (bucket) bucket.rows.push(r);
  });

  const regTourns = context.registeredTournsByTeam.get(teamKey);
  if (regTourns) {
    regTourns.forEach((label, tKey) => {
      ensureTournBucket(tKey, label);
    });
  }

  const matchTourns = context.matchStatsByTeamTourn.get(teamKey);
  if (matchTourns) {
    matchTourns.forEach((info, tKey) => {
      const bucket = ensureTournBucket(tKey, info.label);
      if (bucket) {
        bucket.matches_played = info.matches_played;
        bucket.matches_won = info.matches_won;
      }
    });
  }

  const placementTourns = context.placementsByTeamTourn.get(teamKey);
  if (placementTourns) {
    placementTourns.forEach((info, tKey) => {
      const bucket = ensureTournBucket(tKey, info.label);
      if (bucket) bucket.placement_rank = info.rank;
    });
  }

  const list = [];
  byTournKey.forEach((b) => {
    const prof = b.rows.length > 0 ? summarizeRowsIntoProfile(b.rows) : null;
    const mapsPlayed = prof ? prof.maps_played : 0;
    const mapsWon = prof ? prof.wins : 0;
    const winRate = mapsPlayed > 0
      ? Math.round(prof.win_rate * 100)
      : b.matches_played > 0
      ? Math.round((b.matches_won / b.matches_played) * 100)
      : null;

    list.push({
      tournament_name: b.tournament_name,
      is_current: b.is_current,
      maps_played: mapsPlayed,
      maps_won: mapsWon,
      matches_played: b.matches_played,
      matches_won: b.matches_won,
      win_rate: winRate,
      kd: prof ? roundNum(prof.kd, 2) : null,
      kda: prof ? roundNum(prof.kda, 2) : null,
      kpr: prof ? roundNum(prof.kpr, 2) : null,
      fk_rate: prof ? roundNum(prof.fk_rate, 2) : null,
      obj_rate: prof ? roundNum(prof.obj_rate, 2) : null,
      placement_rank: b.placement_rank,
    });
  });

  // Sort current tournament first, then tournaments with map/match stats
  return list.sort((a, b) => {
    if (a.is_current !== b.is_current) return a.is_current ? -1 : 1;
    return (b.maps_played + b.matches_played) - (a.maps_played + a.matches_played);
  });
};

const analyzeTeamHistory = (context, team, currentTournMeta) => {
  const teamName = (team?.team_name || '').trim();
  const teamKey = teamName.toLowerCase();
  const teamIdStr = team?.team_id ? String(team.team_id) : '';

  const rosterSet = new Set();
  const rosterLabels = new Map();

  if (teamIdStr && context.playersByTeamId.has(teamIdStr)) {
    for (const pName of context.playersByTeamId.get(teamIdStr)) {
      const k = pName.toLowerCase();
      rosterSet.add(k);
      rosterLabels.set(k, pName);
    }
  }

  const directTeamRows = context.rowsByTeam.get(teamKey) || [];
  for (const r of directTeamRows) {
    const ign = (r.ign || '').trim();
    if (ign && ign !== '-' && ign.toLowerCase() !== 'unknown') {
      const k = ign.toLowerCase();
      rosterSet.add(k);
      if (!rosterLabels.has(k)) rosterLabels.set(k, ign);
    }
  }

  const playerHistoryRows = [];
  rosterSet.forEach((ignKey) => {
    const pRows = context.rowsByIgn.get(ignKey) || [];
    playerHistoryRows.push(...pRows);
  });
  const combinedRows = dedupeRecords([...directTeamRows, ...playerHistoryRows]);
  const careerProfile = summarizeRowsIntoProfile(combinedRows);
  const allTournaments = buildAllTournamentBreakdownForSide(context, teamKey, combinedRows, currentTournMeta);

  const partitionByTournament = (rows) => {
    const currRows = [];
    const prevRows = [];
    const currTournNames = new Set();
    const prevTournNames = new Set();

    for (const r of rows) {
      const meta = resolveTournamentMeta(context.tournamentMetaMap, r.tournament_name);
      if (currentTournMeta.key && meta.key === currentTournMeta.key) {
        currRows.push(r);
        currTournNames.add(meta.label);
      } else {
        prevRows.push(r);
        if (meta.label) prevTournNames.add(meta.label);
      }
    }

    if (!currentTournMeta.key && rows.length > 0) {
      const seenKeys = [];
      for (const r of rows) {
        const meta = resolveTournamentMeta(context.tournamentMetaMap, r.tournament_name);
        if (meta.key && !seenKeys.includes(meta.key)) seenKeys.push(meta.key);
      }
      if (seenKeys.length > 1) {
        const latestKey = seenKeys[seenKeys.length - 1];
        currRows.length = 0;
        prevRows.length = 0;
        currTournNames.clear();
        prevTournNames.clear();
        for (const r of rows) {
          const meta = resolveTournamentMeta(context.tournamentMetaMap, r.tournament_name);
          if (meta.key === latestKey) {
            currRows.push(r);
            currTournNames.add(meta.label);
          } else {
            prevRows.push(r);
            if (meta.label) prevTournNames.add(meta.label);
          }
        }
      }
    }

    return { currRows, prevRows, currTournNames, prevTournNames };
  };

  const directSplit = partitionByTournament(directTeamRows);
  const rosterSplit = partitionByTournament(combinedRows);

  const currRowsToUse = directSplit.currRows.length > 0 ? directSplit.currRows : rosterSplit.currRows;
  const prevRowsToUse = rosterSplit.prevRows;

  const currProfile = summarizeRowsIntoProfile(currRowsToUse);
  const prevProfile = summarizeRowsIntoProfile(prevRowsToUse);
  const effectiveProfile = blendProfiles(currProfile, prevProfile, 0.6);

  const currStatBlock = toPublicStatBlock(
    currProfile,
    directSplit.currRows.length > 0 ? directSplit.currTournNames : rosterSplit.currTournNames
  );
  const prevStatBlock = toPublicStatBlock(prevProfile, rosterSplit.prevTournNames);
  const deltas = computeDeltas(prevStatBlock, currStatBlock);

  const returningPlayers = [];
  rosterSet.forEach((ignKey) => {
    const pRows = context.rowsByIgn.get(ignKey) || [];
    if (pRows.length === 0) return;

    const pSplit = partitionByTournament(pRows);
    if (pSplit.prevRows.length === 0) return;

    const prevPlayerTeams = new Set();
    pSplit.prevRows.forEach((r) => {
      if (r.team_name) prevPlayerTeams.add(r.team_name.trim());
    });

    const pPrevProf = summarizeRowsIntoProfile(pSplit.prevRows);
    const pCurrProf = summarizeRowsIntoProfile(pSplit.currRows);
    const pPrevBlock = toPublicStatBlock(pPrevProf, pSplit.prevTournNames);
    const pCurrBlock = toPublicStatBlock(pCurrProf, pSplit.currTournNames);
    const pDeltas = computeDeltas(pPrevBlock, pCurrBlock);

    returningPlayers.push({
      ign: context.ignDisplay.get(ignKey) || rosterLabels.get(ignKey) || ignKey,
      team_name: teamName,
      previous_tournaments: [...pSplit.prevTournNames],
      previous_teams: [...prevPlayerTeams],
      previous: pPrevBlock,
      current: pCurrBlock,
      kd_delta: pDeltas ? pDeltas.kd_delta : null,
      win_rate_delta: pDeltas ? pDeltas.win_rate_delta : null,
      acs_delta: pDeltas ? pDeltas.acs_delta : null,
      trend: pDeltas ? pDeltas.trend : 'prior_only',
    });
  });

  const otherTournamentsCount = allTournaments.filter((t) => !t.is_current).length;

  return {
    teamName,
    teamKey,
    rosterSet,
    effectiveProfile,
    careerProfile,
    allTournaments,
    hasPreviousRecords: Boolean(prevStatBlock || returningPlayers.length > 0 || otherTournamentsCount > 0),
    previousTournaments: [...rosterSplit.prevTournNames],
    teamSummary: {
      team_name: teamName,
      previous: prevStatBlock,
      current: currStatBlock,
      deltas,
    },
    returningPlayers,
  };
};

const findCrossTournamentRematches = (context, sideA, sideB, currentTournMeta) => {
  const encounters = [];
  let teamAWins = 0;
  let teamBWins = 0;
  const tournamentsSet = new Set();

  for (const enc of context.matchEncounters) {
    if (currentTournMeta.key && enc.tournKey === currentTournMeta.key) continue;

    let matchSideA = null;
    let matchSideB = null;

    for (const s of enc.sides) {
      const sameTeamA = s.teamKey === sideA.teamKey;
      const sharedPlayerA = [...s.igns].filter((ign) => sideA.rosterSet.has(ign));
      const sameTeamB = s.teamKey === sideB.teamKey;
      const sharedPlayerB = [...s.igns].filter((ign) => sideB.rosterSet.has(ign));

      if (!matchSideA && (sameTeamA || sharedPlayerA.length > 0)) {
        matchSideA = { side: s, sharedIgns: sharedPlayerA };
      } else if (!matchSideB && (sameTeamB || sharedPlayerB.length > 0)) {
        matchSideB = { side: s, sharedIgns: sharedPlayerB };
      }
    }

    if (matchSideA && matchSideB && matchSideA.side.won !== matchSideB.side.won) {
      const winnerSide = matchSideA.side.won ? 'team_a' : 'team_b';
      if (winnerSide === 'team_a') teamAWins += 1;
      else teamBWins += 1;
      if (enc.tournLabel) tournamentsSet.add(enc.tournLabel);

      encounters.push({
        tournament: enc.tournLabel,
        map: enc.map,
        team_a_prior: matchSideA.side.teamLabel,
        team_b_prior: matchSideB.side.teamLabel,
        players_a: matchSideA.sharedIgns.map((k) => context.ignDisplay.get(k) || k),
        players_b: matchSideB.sharedIgns.map((k) => context.ignDisplay.get(k) || k),
        winner_side: winnerSide,
      });
    }
  }

  let summary = null;
  if (encounters.length > 0) {
    summary = `Players from ${sideA.teamName} and ${sideB.teamName} previously clashed ${encounters.length} time${encounters.length === 1 ? '' : 's'} across ${[...tournamentsSet].join(', ')} (${sideA.teamName} won ${teamAWins}, ${sideB.teamName} won ${teamBWins}).`;
  }

  return {
    prior_encounters: encounters.length,
    team_a_wins: teamAWins,
    team_b_wins: teamBWins,
    tournaments: [...tournamentsSet],
    pair_details: encounters.slice(0, 6),
    summary,
  };
};

const buildNarrativeSummary = (sideA, sideB, h2h) => {
  const parts = [];
  if (h2h.summary) parts.push(h2h.summary);

  const summarizeSide = (side) => {
    const prev = side.teamSummary.previous;
    const curr = side.teamSummary.current;
    const deltas = side.teamSummary.deltas;
    if (prev && curr && deltas) {
      const kdSign = deltas.kd_delta > 0 ? `+${deltas.kd_delta}` : `${deltas.kd_delta}`;
      const wrSign = deltas.win_rate_delta > 0 ? `+${deltas.win_rate_delta}%` : `${deltas.win_rate_delta}%`;
      parts.push(
        `${side.teamName} returning players shifted from ${prev.kd} K/D (${prev.win_rate}% WR) in prior tournament(s) to ${curr.kd} K/D (${curr.win_rate}% WR) currently (${kdSign} K/D, ${wrSign} WR).`
      );
    } else if (prev && !curr) {
      parts.push(
        `${side.teamName} carries prior tournament experience (${prev.kd} K/D, ${prev.win_rate}% WR across ${prev.maps} map${prev.maps === 1 ? '' : 's'} in ${prev.tournaments.join(', ')}).`
      );
    }
  };

  summarizeSide(sideA);
  summarizeSide(sideB);

  return parts.join(' ');
};

const summarizeCareerBlock = (side) => {
  const cp = side.careerProfile;
  const matchWins = side.allTournaments.reduce((s, t) => s + (t.matches_won || 0), 0);
  const matchPlayed = side.allTournaments.reduce((s, t) => s + (t.matches_played || 0), 0);
  const wr = cp && cp.maps_played > 0
    ? Math.round(cp.win_rate * 100)
    : matchPlayed > 0
    ? Math.round((matchWins / matchPlayed) * 100)
    : null;

  return {
    tournaments_count: side.allTournaments.length,
    maps_played: cp?.maps_played || 0,
    maps_won: cp?.wins || 0,
    matches_played: matchPlayed,
    matches_won: matchWins,
    overall_win_rate: wr,
    kd: cp ? roundNum(cp.kd, 2) : null,
    kpr: cp ? roundNum(cp.kpr, 2) : null,
    fk_rate: cp ? roundNum(cp.fk_rate, 2) : null,
    obj_rate: cp ? roundNum(cp.obj_rate, 2) : null,
    first_kills: cp?.first_kills || 0,
    objectives: cp?.objectives || 0,
    assists: cp?.assists || 0,
  };
};

/**
 * Generates plain-English & data-backed reasons explaining why the Decision Tree
 * assigned a higher win probability to the favored side across all tracked tournaments.
 */
const buildWinAdvantageAnalysis = (sideA, sideB, effA, effB, probA, probB, treePath, leafTotal) => {
  const aFavored = probA >= probB;
  const favSide = aFavored ? sideA : sideB;
  const undSide = aFavored ? sideB : sideA;
  const favEff = aFavored ? effA : effB;
  const undEff = aFavored ? effB : effA;
  const favProb = aFavored ? probA : probB;
  const undProb = aFavored ? probB : probA;

  const favCareer = summarizeCareerBlock(favSide);
  const undCareer = summarizeCareerBlock(undSide);

  const keyFactors = [];
  const rootStep = Array.isArray(treePath) && treePath.length > 0 ? treePath[0] : null;

  // 1. Primary Decision Tree Split Driver
  if (rootStep) {
    let favMetric = '';
    let undMetric = '';
    if (rootStep.feature === 'kpr_diff') {
      favMetric = `${roundNum(favEff.kpr, 2)} K/Rd`;
      undMetric = `${roundNum(undEff.kpr, 2)} K/Rd`;
    } else if (rootStep.feature === 'kd_diff') {
      favMetric = `${roundNum(favEff.kd, 2)} K/D`;
      undMetric = `${roundNum(undEff.kd, 2)} K/D`;
    } else if (rootStep.feature === 'fk_diff') {
      favMetric = `${roundNum(favEff.fk_rate, 2)} FK/Rd`;
      undMetric = `${roundNum(undEff.fk_rate, 2)} FK/Rd`;
    } else if (rootStep.feature === 'obj_diff') {
      favMetric = `${roundNum(favEff.obj_rate, 2)} Obj/Rd`;
      undMetric = `${roundNum(undEff.obj_rate, 2)} Obj/Rd`;
    } else if (rootStep.feature === 'assist_diff') {
      favMetric = `${roundNum(favEff.assist_rate, 2)} Ast/Rd`;
      undMetric = `${roundNum(undEff.assist_rate, 2)} Ast/Rd`;
    } else {
      favMetric = `${roundNum(favEff.survival, 2)}`;
      undMetric = `${roundNum(undEff.survival, 2)}`;
    }
    keyFactors.push({
      factor: `${rootStep.label.replace(' Diff', '')} (Tree Split)`,
      favored_value: favMetric,
      underdog_value: undMetric,
      detail: `Primary CART split node routed ${favSide.teamName} ahead across ${leafTotal} similar historical map outcome${leafTotal === 1 ? '' : 's'}.`,
    });
  }

  // 2. Overall Win Rate Across All Tracked Tournaments
  if (favCareer.overall_win_rate !== null || undCareer.overall_win_rate !== null) {
    const fWr = favCareer.overall_win_rate !== null ? `${favCareer.overall_win_rate}% (${favCareer.maps_won}W-${Math.max(0, favCareer.maps_played - favCareer.maps_won)}L)` : 'Unrecorded';
    const uWr = undCareer.overall_win_rate !== null ? `${undCareer.overall_win_rate}% (${undCareer.maps_won}W-${Math.max(0, undCareer.maps_played - undCareer.maps_won)}L)` : 'Unrecorded';
    keyFactors.push({
      factor: 'All-Tournament Win Rate',
      favored_value: fWr,
      underdog_value: uWr,
      detail: favCareer.overall_win_rate !== null && undCareer.overall_win_rate !== null && favCareer.overall_win_rate > undCareer.overall_win_rate
        ? `${favSide.teamName} won ${favCareer.overall_win_rate}% of tracked maps vs ${undSide.teamName}'s ${undCareer.overall_win_rate}%.`
        : `Overall win record compared across ${Math.max(1, favCareer.tournaments_count)} tournament(s) for ${favSide.teamName} and ${Math.max(1, undCareer.tournaments_count)} for ${undSide.teamName}.`,
    });
  }

  // 3. K/D Ratio Comparison
  if (favEff.kd !== undEff.kd) {
    keyFactors.push({
      factor: 'Team K/D Efficiency',
      favored_value: `${roundNum(favEff.kd, 2)} K/D`,
      underdog_value: `${roundNum(undEff.kd, 2)} K/D`,
      detail: favEff.kd > undEff.kd
        ? `${favSide.teamName} sustains positive duel trades (+${roundNum(favEff.kd - undEff.kd, 2)} K/D edge).`
        : `${undSide.teamName} trails in overall blended K/D efficiency vs the matchup profile.`,
    });
  }

  // 4. First Kills & Objective Execution
  if ((favCareer.first_kills || 0) > 0 || (undCareer.first_kills || 0) > 0) {
    keyFactors.push({
      factor: 'Opening Duels (First Kills)',
      favored_value: `${favCareer.first_kills} FK (${roundNum(favEff.fk_rate, 2)}/rd)`,
      underdog_value: `${undCareer.first_kills} FK (${roundNum(undEff.fk_rate, 2)}/rd)`,
      detail: favCareer.first_kills >= undCareer.first_kills
        ? `${favSide.teamName} secures more opening picks to create early round advantages.`
        : `${undSide.teamName} had ${undCareer.first_kills} opening picks across recorded maps.`,
    });
  } else if ((favCareer.objectives || 0) > 0 || (undCareer.objectives || 0) > 0) {
    keyFactors.push({
      factor: 'Objectives & Teamplay',
      favored_value: `${favCareer.objectives} Obj / ${favCareer.assists} Ast`,
      underdog_value: `${undCareer.objectives} Obj / ${undCareer.assists} Ast`,
      detail: `Plants, defuses, and assists contributing to round conversions.`,
    });
  }

  // 5. Additional Multi-Tournament Context if either team tracked across > 1 tournament
  if (favSide.allTournaments.length > 1 || undSide.allTournaments.length > 1) {
    keyFactors.push({
      factor: 'Multi-Tournament Track Record',
      favored_value: `${favSide.allTournaments.length} Tourney(s)`,
      underdog_value: `${undSide.allTournaments.length} Tourney(s)`,
      detail: `${favSide.teamName} brings data across ${favSide.allTournaments.map((t) => t.tournament_name).slice(0, 3).join(', ')}.`,
    });
  }

  const summaryBits = [];
  if (favCareer.overall_win_rate !== null && undCareer.overall_win_rate !== null && favCareer.overall_win_rate > undCareer.overall_win_rate) {
    summaryBits.push(
      `${favSide.teamName} holds a higher win probability (${favProb}% vs ${undProb}%) backed by a ${favCareer.overall_win_rate}% map win rate (${favCareer.maps_won}W-${Math.max(0, favCareer.maps_played - favCareer.maps_won)}L across ${favCareer.tournaments_count} tournament${favCareer.tournaments_count === 1 ? '' : 's'}) compared to ${undSide.teamName}'s ${undCareer.overall_win_rate}%`
    );
  } else {
    summaryBits.push(
      `${favSide.teamName} holds a higher win probability (${favProb}% vs ${undProb}%) across ${favCareer.tournaments_count} tracked tournament${favCareer.tournaments_count === 1 ? '' : 's'}`
    );
  }

  if (favEff.kpr > undEff.kpr || favEff.kd > undEff.kd) {
    const statNotes = [];
    if (favEff.kpr > undEff.kpr) statNotes.push(`${roundNum(favEff.kpr, 2)} vs ${roundNum(undEff.kpr, 2)} team kills/round`);
    if (favEff.kd > undEff.kd) statNotes.push(`${roundNum(favEff.kd, 2)} vs ${roundNum(undEff.kd, 2)} K/D`);
    if (favCareer.first_kills > undCareer.first_kills) statNotes.push(`${favCareer.first_kills} vs ${undCareer.first_kills} first kills`);
    summaryBits.push(`led by stronger combat metrics (${statNotes.join(', ')})`);
  }

  return {
    favored_team_id: favSide.teamName === sideA.teamName ? 'team_a' : 'team_b',
    favored_team_name: favSide.teamName,
    favored_probability: favProb,
    underdog_team_name: undSide.teamName,
    underdog_probability: undProb,
    why_higher_summary: `${summaryBits.join(', ')}.`,
    key_factors: keyFactors.slice(0, 4),
    team_a_tournaments: sideA.allTournaments,
    team_b_tournaments: sideB.allTournaments,
    team_a_career: summarizeCareerBlock(sideA),
    team_b_career: summarizeCareerBlock(sideB),
  };
};

const generatePredictionFromContext = (context, teamA, teamB, tournamentName = '') => {
  if (!context || !teamA || !teamB) return null;

  const currentTournMeta = resolveTournamentMeta(context.tournamentMetaMap, tournamentName);
  const sideA = analyzeTeamHistory(context, teamA, currentTournMeta);
  const sideB = analyzeTeamHistory(context, teamB, currentTournMeta);

  const profileA = sideA.effectiveProfile;
  const profileB = sideB.effectiveProfile;

  if (!profileA && !profileB) return null;

  const effA = profileA || context.baselineProfile;
  const effB = profileB || context.baselineProfile;

  const diffAB = computePairDiffFeatures(effA, effB);
  const diffBA = computePairDiffFeatures(effB, effA);

  const resAB = context.tree.predictWithPath(diffAB);
  const resBA = context.tree.predictWithPath(diffBA);

  const rawProbA = ((resAB.probPositive + (1 - resBA.probPositive)) / 2) * 100;
  let probA = Math.round(rawProbA);
  probA = Math.max(1, Math.min(99, probA));
  let probB = 100 - probA;

  if (probA === 50 && resAB.prediction !== resBA.prediction) {
    if (resAB.prediction === 1) {
      probA = 55;
      probB = 45;
    } else {
      probA = 45;
      probB = 55;
    }
  }

  const predicted_winner_id =
    probA > probB ? teamA.team_id : probB > probA ? teamB.team_id : null;
  const predicted_winner_name =
    probA > probB ? teamA.team_name : probB > probA ? teamB.team_name : 'Tie';

  const ruleText =
    resAB.path.length > 0
      ? resAB.path.map(formatRuleStep).join(' -> ')
      : 'Root Decision Node';

  let missingNote = '';
  if (profileA && !profileB) missingNote = ` (league baseline used for ${teamB.team_name})`;
  else if (!profileA && profileB) missingNote = ` (league baseline used for ${teamA.team_name})`;

  const headToHead = findCrossTournamentRematches(context, sideA, sideB, currentTournMeta);
  const returningPlayers = [
    ...sideA.returningPlayers.map((p) => ({ ...p, team_side: 'team_a' })),
    ...sideB.returningPlayers.map((p) => ({ ...p, team_side: 'team_b' })),
  ];
  const prevTourns = [...new Set([...sideA.previousTournaments, ...sideB.previousTournaments])];
  const hasPreviousRecords = sideA.hasPreviousRecords || sideB.hasPreviousRecords;
  const analysisSummary = hasPreviousRecords || headToHead.prior_encounters > 0
    ? buildNarrativeSummary(sideA, sideB, headToHead)
    : '';

  const winAdvantageAnalysis = buildWinAdvantageAnalysis(
    sideA,
    sideB,
    effA,
    effB,
    probA,
    probB,
    resAB.path,
    resAB.total
  );

  const reasoning = `Decision Tree (CART): ${ruleText}. Leaf favors ${predicted_winner_name} across ${context.trainingSamples} historical matchup vectors (${context.trainingAccuracy}% tree fit)${missingNote}.${analysisSummary ? ` ${analysisSummary}` : ''}`;

  return {
    model_type: 'Decision Tree (CART)',
    predicted_winner_id,
    predicted_winner_name,
    probability_a: probA,
    probability_b: probB,
    reasoning,
    decision_path: resAB.path,
    tree_stats: {
      algorithm: 'CART (Gini Impurity)',
      depth: context.tree.depth,
      leaf_samples: resAB.total,
      leaf_wins_a: resAB.wins,
      leaf_losses_a: resAB.losses,
      training_samples: context.trainingSamples,
      training_accuracy: context.trainingAccuracy,
    },
    win_advantage_analysis: winAdvantageAnalysis,
    historical_analysis: {
      has_previous_records: hasPreviousRecords,
      rematch_detected: headToHead.prior_encounters > 0,
      current_tournament: currentTournMeta.label || null,
      previous_tournaments: prevTourns,
      team_a: sideA.teamSummary,
      team_b: sideB.teamSummary,
      head_to_head: headToHead,
      returning_players: returningPlayers,
      summary: analysisSummary || null,
    },
  };
};

const generatePrediction = async (supabase, teamA, teamB, tournamentName = '') => {
  if (!teamA || !teamB) return null;
  const context = await buildPredictorContext(supabase);
  if (!context) return null;
  return generatePredictionFromContext(context, teamA, teamB, tournamentName);
};

module.exports = {
  buildPredictorContext,
  generatePredictionFromContext,
  generatePrediction,
  FEATURE_SPECS,
};
