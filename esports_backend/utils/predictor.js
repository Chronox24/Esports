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
  kpr: 3.4,
  dpr: 3.4,
  survival: 0.0,
  fk_rate: 0.35,
  obj_rate: 0.25,
  assist_rate: 1.5,
  hs_rate: 0.15,
  win_rate: 0.5,
  maps_played: 0,
};

const summarizeRowsIntoProfile = (rows, mapsPlayed = 1) => {
  if (!rows || rows.length === 0) return null;

  // Group by map/match first so map rounds aren't counted once per player row
  const perMap = new Map();
  for (const r of rows) {
    const mapKey = [
      r.tournament_name || '',
      r.game || '',
      r.match || '',
      r.set_num || '',
      r.map || '',
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
    bucket.rounds = Math.max(bucket.rounds, Number(r.rounds || 0));
  }

  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalHs = 0;
  let totalFk = 0;
  let totalObj = 0;
  let totalRounds = 0;
  let mapWins = 0;

  perMap.forEach((m) => {
    totalKills += m.kills;
    totalDeaths += m.deaths;
    totalAssists += m.assists;
    totalHs += m.hs;
    totalFk += m.fk;
    totalObj += m.obj;
    totalRounds += m.rounds > 0 ? m.rounds : 1;
    if (m.win) mapWins += 1;
  });

  const safeRounds = Math.max(1, totalRounds);
  const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills > 0 ? Math.min(totalKills, 10) : 1.0;
  const kpr = totalKills / safeRounds;
  const dpr = totalDeaths / safeRounds;

  return {
    kd,
    kpr,
    dpr,
    survival: kpr - dpr,
    fk_rate: totalFk / safeRounds,
    obj_rate: totalObj / safeRounds,
    assist_rate: totalAssists / safeRounds,
    hs_rate: totalKills > 0 ? totalHs / totalKills : 0,
    win_rate: mapWins / Math.max(1, perMap.size || mapsPlayed),
    maps_played: perMap.size,
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
  // Use conservative 85% of league median so unrecorded teams do not unfairly outrank proven teams due to outliers
  const med = (key) => median(vals.map((p) => p[key] ?? 0));
  const medKd = med('kd') || 1.0;
  const medKpr = med('kpr') || 3.4;
  const medDpr = med('dpr') || 3.4;
  return {
    kd: medKd * 0.85,
    kpr: medKpr * 0.85,
    dpr: medDpr,
    survival: medKpr * 0.85 - medDpr,
    fk_rate: med('fk_rate') * 0.85,
    obj_rate: med('obj_rate') * 0.85,
    assist_rate: med('assist_rate') * 0.85,
    hs_rate: med('hs_rate') * 0.85,
    win_rate: 0.4,
    maps_played: 0,
  };
};

/**
 * Fetches match_records, builds team profiles + paired training samples,
 * and trains a CART Decision Tree classifier once per batch request.
 */
const buildPredictorContext = async (supabase) => {
  const { data: rawRecords, error } = await supabase
    .from('match_records')
    .select('tournament_name, game, match, set_num, map, team_name, win, kills, deaths, assists, headshots, rounds, first_kills, plants, defuse');

  if (error) {
    console.error('Predictor DB Error fetching match_records:', error);
    return null;
  }

  const records = rawRecords || [];
  if (records.length === 0) return null;

  const rowsByTeam = new Map();
  const rowsByMatchMap = new Map();

  for (const r of records) {
    const teamName = (r.team_name || '').trim();
    if (!teamName) continue;
    const teamKey = teamName.toLowerCase();

    if (!rowsByTeam.has(teamKey)) rowsByTeam.set(teamKey, []);
    rowsByTeam.get(teamKey).push(r);

    const matchMapKey = [
      (r.tournament_name || '').trim().toLowerCase(),
      (r.game || '').trim().toLowerCase(),
      (r.match || '').trim().toLowerCase(),
      (r.set_num || '').trim().toLowerCase(),
      (r.map || '').trim().toLowerCase(),
    ].join('|');

    if (!rowsByMatchMap.has(matchMapKey)) rowsByMatchMap.set(matchMapKey, new Map());
    const mapTeams = rowsByMatchMap.get(matchMapKey);
    if (!mapTeams.has(teamKey)) mapTeams.set(teamKey, []);
    mapTeams.get(teamKey).push(r);
  }

  const teamProfiles = {};
  rowsByTeam.forEach((rows, teamKey) => {
    const profile = summarizeRowsIntoProfile(rows);
    if (profile) teamProfiles[teamKey] = profile;
  });

  const baselineProfile = buildBaselineFromProfiles(teamProfiles);

  // Build unbiased paired training set from historical matchups in match_records
  const trainingData = [];
  rowsByMatchMap.forEach((teamMap) => {
    const entries = [];
    teamMap.forEach((rows) => {
      const won = rows.some((r) => Boolean(r.win));
      const profile = summarizeRowsIntoProfile(rows, 1);
      if (profile) entries.push({ won, profile });
    });

    if (entries.length >= 2) {
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

  // Fallback only if fewer than 4 paired records exist
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
  };
};

const formatRuleStep = (step) => {
  const valStr = step.value > 0 ? `+${step.value}` : `${step.value}`;
  const thrStr = step.threshold > 0 ? `+${step.threshold}` : `${step.threshold}`;
  return `${step.label} (${valStr}) ${step.operator} ${thrStr}`;
};

const generatePredictionFromContext = (context, teamA, teamB) => {
  if (!context || !teamA || !teamB) return null;

  const keyA = (teamA.team_name || '').trim().toLowerCase();
  const keyB = (teamB.team_name || '').trim().toLowerCase();
  const profileA = context.teamProfiles[keyA] || null;
  const profileB = context.teamProfiles[keyB] || null;

  if (!profileA && !profileB) return null;

  const effA = profileA || context.baselineProfile;
  const effB = profileB || context.baselineProfile;

  const diffAB = computePairDiffFeatures(effA, effB);
  const diffBA = computePairDiffFeatures(effB, effA);

  const resAB = context.tree.predictWithPath(diffAB);
  const resBA = context.tree.predictWithPath(diffBA);

  // Symmetrize leaf probability across A-vs-B and B-vs-A traversals
  const rawProbA = ((resAB.probPositive + (1 - resBA.probPositive)) / 2) * 100;
  let probA = Math.round(rawProbA);
  probA = Math.max(1, Math.min(99, probA));
  let probB = 100 - probA;

  // Deterministic tie-breaker if Decision Tree leaf sits right at 50/50
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

  const reasoning = `Decision Tree (CART): ${ruleText}. Leaf favors ${predicted_winner_name} across ${context.trainingSamples} historical matchup vectors (${context.trainingAccuracy}% tree fit)${missingNote}.`;

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
  };
};

const generatePrediction = async (supabase, teamA, teamB) => {
  if (!teamA || !teamB) return null;
  const context = await buildPredictorContext(supabase);
  if (!context) return null;
  return generatePredictionFromContext(context, teamA, teamB);
};

module.exports = {
  buildPredictorContext,
  generatePredictionFromContext,
  generatePrediction,
  FEATURE_SPECS,
};
