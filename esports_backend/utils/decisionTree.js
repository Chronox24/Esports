/**
 * Pure JavaScript CART (Classification and Regression Tree) Decision Tree classifier
 * using Gini Impurity splitting over continuous matchup features.
 */

const computeGini = (posCount, totalCount) => {
  if (!totalCount) return 0;
  const pPos = posCount / totalCount;
  const pNeg = 1 - pPos;
  return 1 - (pPos * pPos + pNeg * pNeg);
};

class DecisionTreeClassifier {
  constructor(options = {}) {
    this.maxDepth = options.maxDepth ?? 4;
    this.minSamplesSplit = options.minSamplesSplit ?? 2;
    this.minSamplesLeaf = options.minSamplesLeaf ?? 1;
    this.minGain = options.minGain ?? 1e-7;
    this.smoothingAlpha = options.smoothingAlpha ?? 3;
    this.root = null;
    this.depth = 0;
    this.featureSpecs = [];
  }

  /**
   * Trains the CART decision tree on labeled samples.
   * @param {Array<{ features: Record<string, number>, label: number }>} dataset
   * @param {Array<{ key: string, label: string }>} featureSpecs
   */
  fit(dataset, featureSpecs) {
    this.featureSpecs = featureSpecs || [];
    if (!Array.isArray(dataset) || dataset.length === 0) {
      this.root = {
        type: 'leaf',
        prediction: 1,
        wins: 0,
        losses: 0,
        total: 0,
        gini: 0.5,
        probPositive: 0.5,
      };
      this.depth = 0;
      return this;
    }

    this.depth = 0;
    this.root = this._buildNode(dataset, 0);
    return this;
  }

  _createLeaf(samples) {
    const total = samples.length;
    const wins = samples.reduce((acc, s) => acc + (s.label === 1 ? 1 : 0), 0);
    const losses = total - wins;
    const gini = computeGini(wins, total);
    const alpha = this.smoothingAlpha;
    const probPositive = (wins + 0.5 * alpha) / (total + alpha);
    return {
      type: 'leaf',
      prediction: wins >= losses ? 1 : 0,
      wins,
      losses,
      total,
      gini,
      probPositive,
    };
  }

  _findBestSplit(samples) {
    const n = samples.length;
    const wins = samples.reduce((acc, s) => acc + (s.label === 1 ? 1 : 0), 0);
    const parentGini = computeGini(wins, n);
    if (parentGini <= 0) return null;

    let bestSplit = null;

    for (const spec of this.featureSpecs) {
      const key = spec.key;
      const sorted = [...samples]
        .filter((s) => Number.isFinite(Number(s.features?.[key])))
        .sort((a, b) => Number(a.features[key]) - Number(b.features[key]));

      if (sorted.length < this.minSamplesSplit) continue;

      let leftCount = 0;
      let leftWins = 0;

      for (let i = 0; i < sorted.length - 1; i++) {
        const currVal = Number(sorted[i].features[key]);
        const nextVal = Number(sorted[i + 1].features[key]);
        leftCount += 1;
        if (sorted[i].label === 1) leftWins += 1;

        // Only consider midpoints between distinct feature values
        if (Math.abs(nextVal - currVal) < 1e-9) continue;

        const rightCount = sorted.length - leftCount;
        if (leftCount < this.minSamplesLeaf || rightCount < this.minSamplesLeaf) continue;

        const rightWins = wins - leftWins;
        const leftGini = computeGini(leftWins, leftCount);
        const rightGini = computeGini(rightWins, rightCount);
        const weightedGini = (leftCount / sorted.length) * leftGini + (rightCount / sorted.length) * rightGini;
        const gain = parentGini - weightedGini;

        if (gain > this.minGain && (!bestSplit || gain > bestSplit.gain)) {
          bestSplit = {
            featureKey: key,
            featureLabel: spec.label,
            threshold: (currVal + nextVal) / 2,
            gain,
            parentGini,
          };
        }
      }
    }

    return bestSplit;
  }

  _buildNode(samples, currentDepth) {
    if (currentDepth > this.depth) this.depth = currentDepth;

    const total = samples.length;
    const wins = samples.reduce((acc, s) => acc + (s.label === 1 ? 1 : 0), 0);

    if (
      currentDepth >= this.maxDepth ||
      total < this.minSamplesSplit ||
      wins === 0 ||
      wins === total
    ) {
      return this._createLeaf(samples);
    }

    const best = this._findBestSplit(samples);
    if (!best) {
      return this._createLeaf(samples);
    }

    const leftSamples = [];
    const rightSamples = [];
    for (const s of samples) {
      const val = Number(s.features?.[best.featureKey] ?? 0);
      if (val <= best.threshold) leftSamples.push(s);
      else rightSamples.push(s);
    }

    if (leftSamples.length < this.minSamplesLeaf || rightSamples.length < this.minSamplesLeaf) {
      return this._createLeaf(samples);
    }

    return {
      type: 'split',
      featureKey: best.featureKey,
      featureLabel: best.featureLabel,
      threshold: best.threshold,
      gain: best.gain,
      gini: best.parentGini,
      samples: total,
      left: this._buildNode(leftSamples, currentDepth + 1),
      right: this._buildNode(rightSamples, currentDepth + 1),
    };
  }

  /**
   * Predicts label + probability and returns exact root-to-leaf decision trace.
   */
  predictWithPath(features = {}) {
    if (!this.root) {
      return {
        prediction: 1,
        probPositive: 0.5,
        wins: 0,
        losses: 0,
        total: 0,
        leafGini: 0.5,
        path: [],
      };
    }

    let node = this.root;
    const path = [];

    while (node && node.type === 'split') {
      const rawVal = Number(features[node.featureKey] ?? 0);
      const val = Number.isFinite(rawVal) ? rawVal : 0;
      const goLeft = val <= node.threshold;

      path.push({
        feature: node.featureKey,
        label: node.featureLabel,
        value: Number(val.toFixed(3)),
        operator: goLeft ? '<=' : '>',
        threshold: Number(node.threshold.toFixed(3)),
        direction: goLeft ? 'left' : 'right',
        samples: node.samples,
        gini: Number(node.gini.toFixed(3)),
      });

      node = goLeft ? node.left : node.right;
    }

    const leaf = node || {
      prediction: 1,
      probPositive: 0.5,
      wins: 0,
      losses: 0,
      total: 0,
      gini: 0.5,
    };

    return {
      prediction: leaf.prediction,
      probPositive: leaf.probPositive,
      wins: leaf.wins,
      losses: leaf.losses,
      total: leaf.total,
      leafGini: Number((leaf.gini ?? 0).toFixed(3)),
      path,
    };
  }

  evaluate(dataset = []) {
    if (!Array.isArray(dataset) || dataset.length === 0) {
      return { accuracy: 0, total: 0, correct: 0 };
    }
    let correct = 0;
    for (const s of dataset) {
      const pred = this.predictWithPath(s.features);
      if (pred.prediction === s.label) correct += 1;
    }
    return {
      accuracy: Math.round((correct / dataset.length) * 100),
      total: dataset.length,
      correct,
    };
  }
}

module.exports = {
  DecisionTreeClassifier,
  computeGini,
};
