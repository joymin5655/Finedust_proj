/**
 * anomaly-detection.js — 이상치 탐지 엔진
 * ──────────────────────────────────────────
 * Production Spec §12: Isolation Forest 경량 구현
 *
 * 브라우저 환경에서 실행 가능한 경량 이상치 탐지:
 *   1. Z-Score 기반 빠른 필터링
 *   2. Modified Z-Score (MAD 기반) — 로버스트
 *   3. Isolation Forest 근사 (경량)
 *   4. 시계열 변화점 탐지 (CUSUM)
 *
 * @module analysis/anomaly-detection
 */

// ── 1. Z-Score 기반 이상치 탐지 ──────────────────────────────

/**
 * Standard Z-Score 이상치 탐지
 * @param {Array<number>} values
 * @param {number} threshold - Z-score 임계값 (기본 3.0)
 * @returns {Array<{index, value, zScore, isAnomaly}>}
 */
export function detectByZScore(values, threshold = 3.0) {
  const n = values.length;
  if (n < 3) return values.map((v, i) => ({ index: i, value: v, zScore: 0, isAnomaly: false }));

  const mean = values.reduce((s, v) => s + v, 0) / n;
  const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n);

  return values.map((v, i) => {
    const zScore = std > 0 ? (v - mean) / std : 0;
    return { index: i, value: v, zScore, isAnomaly: Math.abs(zScore) > threshold };
  });
}

// ── 2. Modified Z-Score (MAD 기반, 로버스트) ─────────────────

/**
 * Median Absolute Deviation 기반 이상치 탐지
 * 극값에 강건한 방법
 */
export function detectByMAD(values, threshold = 3.5) {
  const n = values.length;
  if (n < 3) return values.map((v, i) => ({ index: i, value: v, modifiedZ: 0, isAnomaly: false }));

  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(n / 2)];

  // MAD = median(|x_i - median(x)|)
  const absDevs = values.map(v => Math.abs(v - median));
  const sortedDevs = [...absDevs].sort((a, b) => a - b);
  const mad = sortedDevs[Math.floor(n / 2)];

  const k = 0.6745; // consistency constant for normal dist

  return values.map((v, i) => {
    const modifiedZ = mad > 0 ? (k * (v - median)) / mad : 0;
    return { index: i, value: v, modifiedZ, isAnomaly: Math.abs(modifiedZ) > threshold };
  });
}

// ── 3. Isolation Forest (경량 근사) ──────────────────────────

/**
 * 경량 Isolation Forest
 * 각 데이터 포인트의 "isolation depth"를 계산
 * depth가 작을수록 이상치일 가능성이 높음
 */
export class LightIsolationForest {
  constructor({ nTrees = 50, maxSamples = 256, contamination = 0.03 } = {}) {
    this.nTrees = nTrees;
    this.maxSamples = maxSamples;
    this.contamination = contamination;
    this.trees = [];
    this.threshold = null;
  }

  /**
   * 학습 (Isolation Tree 구축)
   * @param {Array<Array<number>>} data - 2D feature matrix
   */
  fit(data) {
    const n = data.length;
    if (n === 0) return;
    const sampleSize = Math.min(this.maxSamples, n);
    const maxDepth = Math.ceil(Math.log2(sampleSize));

    this.trees = [];
    for (let t = 0; t < this.nTrees; t++) {
      const sample = this._subsample(data, sampleSize);
      this.trees.push(this._buildTree(sample, 0, maxDepth));
    }

    // anomaly threshold 설정
    const scores = data.map(point => this.anomalyScore(point));
    scores.sort((a, b) => b - a);
    const cutoff = Math.ceil(n * this.contamination);
    this.threshold = scores[Math.max(0, cutoff - 1)] || 0.5;
  }

  /**
   * 단일 포인트의 anomaly score (0~1, 1에 가까울수록 이상치)
   */
  anomalyScore(point) {
    if (this.trees.length === 0) return 0;
    const avgDepth = this.trees.reduce((sum, tree) =>
      sum + this._pathLength(point, tree, 0), 0
    ) / this.trees.length;

    const n = this.maxSamples;
    const c = n > 2 ? 2 * (Math.log(n - 1) + 0.5772) - 2 * (n - 1) / n : 1;
    return Math.pow(2, -avgDepth / c);
  }

  /**
   * 이상치 여부 판정
   */
  predict(point) {
    return this.anomalyScore(point) >= (this.threshold || 0.5);
  }

  _subsample(data, size) {
    const indices = [];
    const n = data.length;
    for (let i = 0; i < size; i++) {
      indices.push(Math.floor(Math.random() * n));
    }
    return indices.map(i => data[i]);
  }

  _buildTree(data, depth, maxDepth) {
    if (data.length <= 1 || depth >= maxDepth) {
      return { isLeaf: true, size: data.length };
    }

    const dim = data[0].length;
    const feature = Math.floor(Math.random() * dim);
    const values = data.map(d => d[feature]);
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) return { isLeaf: true, size: data.length };

    const splitValue = min + Math.random() * (max - min);
    const left = data.filter(d => d[feature] < splitValue);
    const right = data.filter(d => d[feature] >= splitValue);

    return {
      isLeaf: false,
      feature,
      splitValue,
      left: this._buildTree(left, depth + 1, maxDepth),
      right: this._buildTree(right, depth + 1, maxDepth),
    };
  }

  _pathLength(point, node, depth) {
    if (node.isLeaf) {
      const n = node.size;
      return depth + (n > 2
        ? 2 * (Math.log(n - 1) + 0.5772) - 2 * (n - 1) / n
        : n - 1);
    }
    if (point[node.feature] < node.splitValue) {
      return this._pathLength(point, node.left, depth + 1);
    }
    return this._pathLength(point, node.right, depth + 1);
  }
}

// ── 4. CUSUM 변화점 탐지 ─────────────────────────────────────

/**
 * Cumulative Sum (CUSUM) 변화점 탐지
 * 시계열에서 평균이 급변하는 지점 탐색
 *
 * @param {Array<number>} values - 시계열 데이터
 * @param {number} delta - 탐지 민감도 (기본 5 µg/m³)
 * @param {number} threshold - CUSUM 한계 (기본 50)
 * @returns {Array<{index, type, cumSum}>} 변화점 목록
 */
export function detectChangePointsCUSUM(values, delta = 5, threshold = 50) {
  const n = values.length;
  if (n < 10) return [];

  const mean = values.reduce((s, v) => s + v, 0) / n;
  const changePoints = [];
  let sPlus = 0;    // 상승 탐지
  let sMinus = 0;   // 하강 탐지

  for (let i = 0; i < n; i++) {
    sPlus = Math.max(0, sPlus + (values[i] - mean - delta));
    sMinus = Math.max(0, sMinus + (mean - delta - values[i]));

    if (sPlus > threshold) {
      changePoints.push({ index: i, type: 'increase', cumSum: sPlus });
      sPlus = 0;
    }
    if (sMinus > threshold) {
      changePoints.push({ index: i, type: 'decrease', cumSum: sMinus });
      sMinus = 0;
    }
  }

  return changePoints;
}

// ── 5. 통합 이상치 탐지 파이프라인 ──────────────────────────

/**
 * PM2.5 관측 데이터에 대한 종합 이상치 탐지
 *
 * @param {Object} params
 * @param {number} params.pm25 - 현재 PM2.5 관측값
 * @param {Array<number>} params.recentValues - 최근 시계열 (예: 24시간)
 * @param {number} [params.predicted] - 모델 예측값
 * @param {number} [params.neighborMean] - 인근 관측소 평균
 * @returns {Object} 이상치 진단 결과
 */
export function diagnoseAnomaly({
  pm25,
  recentValues = [],
  predicted,
  neighborMean,
} = {}) {
  const flags = [];
  let anomalyScore = 0;

  // 1. 절대값 체크
  if (pm25 < 0) {
    flags.push('negative_value');
    anomalyScore += 0.4;
  }
  if (pm25 > 500) {
    flags.push('extreme_high');
    anomalyScore += 0.3;
  }

  // 2. 시계열 context 대비 체크
  if (recentValues.length >= 5) {
    const results = detectByMAD([...recentValues, pm25]);
    const lastResult = results[results.length - 1];
    if (lastResult.isAnomaly) {
      flags.push('mad_outlier');
      anomalyScore += 0.3;
    }
  }

  // 3. 모델 잔차 체크
  if (predicted != null) {
    const residual = Math.abs(pm25 - predicted);
    if (residual > 30) {
      flags.push('large_model_residual');
      anomalyScore += 0.2;
    } else if (residual > 15) {
      flags.push('moderate_model_residual');
      anomalyScore += 0.1;
    }
  }

  // 4. 이웃 대비 체크
  if (neighborMean != null) {
    const diff = Math.abs(pm25 - neighborMean);
    if (diff > 40) {
      flags.push('spatial_outlier');
      anomalyScore += 0.2;
    }
  }

  const isAnomaly = anomalyScore >= 0.4;

  return {
    isAnomaly,
    anomalyScore: Math.min(1, anomalyScore),
    flags,
    severity: anomalyScore >= 0.7 ? 'high'
      : anomalyScore >= 0.4 ? 'medium'
      : 'low',
    recommendation: isAnomaly
      ? 'Flag for review — possible sensor malfunction or localized event'
      : 'Normal observation',
  };
}

export default {
  detectByZScore, detectByMAD,
  LightIsolationForest,
  detectChangePointsCUSUM,
  diagnoseAnomaly,
};
