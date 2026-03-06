/**
 * synthetic-control.js — 합성 통제 방법 (SCM/GSCM)
 * ──────────────────────────────────────────────────
 * 고도화 전략 §2.③ : DID-lite → GSCM (일반화 합성 통제 방법)
 *
 * "정책이 없었을 경우의 가상 시나리오" 생성:
 *   1. 정책 미시행 국가들의 데이터를 가중 결합
 *   2. 실제 측정값과 가상 시나리오의 차이 = 순수 정책 효과
 *   3. 기상 변화를 제외한 인과적 효과 추정
 *
 * 3단계 분석:
 *   Stage 1: Simple Pre/Post (DID-lite) — 기존
 *   Stage 2: DID with Fixed Effects — 회귀 기반
 *   Stage 3: Synthetic Control — 가상 시나리오
 *
 * @module analysis/synthetic-control
 */

// ══════════════════════════════════════════════════════════════
// Math Helpers
// ══════════════════════════════════════════════════════════════

function mean(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function std(arr) {
  if (!arr || arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

function round(val, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * Normal CDF 근사 (Abramowitz & Stegun)
 */
function normalCDF(x) {
  if (x < -8) return 0;
  if (x > 8) return 1;
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x / 2);
  return 0.5 * (1 + sign * y);
}

/**
 * Pearson 상관계수
 */
function pearsonCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom > 0 ? num / denom : 0;
}

// ══════════════════════════════════════════════════════════════
// Stage 1: Pre/Post Comparison (기존 DID-lite 강화)
// ══════════════════════════════════════════════════════════════

/**
 * 단순 Pre/Post 비교 + 통계적 유의성 검정
 * @param {Array<number>} prePeriod - 정책 시행 전 PM2.5 연간 평균들
 * @param {Array<number>} postPeriod - 정책 시행 후 PM2.5 연간 평균들
 * @returns {Object} 분석 결과
 */
export function prePostComparison(prePeriod, postPeriod) {
  if (!prePeriod?.length || !postPeriod?.length) {
    return { valid: false, reason: 'Insufficient data' };
  }

  const preMean = mean(prePeriod);
  const postMean = mean(postPeriod);
  const absoluteChange = postMean - preMean;
  const relativeChange = preMean !== 0 ? (absoluteChange / preMean) * 100 : 0;

  // Welch's t-test (unequal variance)
  const preStd = std(prePeriod);
  const postStd = std(postPeriod);
  const n1 = prePeriod.length;
  const n2 = postPeriod.length;

  const se = Math.sqrt((preStd ** 2) / n1 + (postStd ** 2) / n2);
  const tStat = se > 0 ? absoluteChange / se : 0;

  // Degrees of freedom (Welch-Satterthwaite)
  const v1 = (preStd ** 2) / n1;
  const v2 = (postStd ** 2) / n2;
  const df = (v1 + v2) ** 2 / ((v1 ** 2) / (n1 - 1) + (v2 ** 2) / (n2 - 1)) || 1;

  // p-value 근사 (t-distribution → normal 근사)
  const pValue = 2 * (1 - normalCDF(Math.abs(tStat)));

  // Effect size (Cohen's d)
  const pooledStd = Math.sqrt(((n1 - 1) * preStd ** 2 + (n2 - 1) * postStd ** 2) / (n1 + n2 - 2));
  const cohensD = pooledStd > 0 ? Math.abs(absoluteChange) / pooledStd : 0;

  return {
    valid: true,
    stage: 1,
    preMean: round(preMean),
    postMean: round(postMean),
    absoluteChange: round(absoluteChange),
    relativeChangePct: round(relativeChange),
    tStatistic: round(tStat),
    pValue: round(pValue, 4),
    degreesOfFreedom: round(df),
    significant: pValue < 0.05,
    effectSize: cohensD,
    effectLabel: cohensD >= 0.8 ? 'large'
      : cohensD >= 0.5 ? 'medium'
      : cohensD >= 0.2 ? 'small'
      : 'negligible',
    confidence: pValue < 0.01 ? 'high'
      : pValue < 0.05 ? 'medium'
      : 'low',
  };
}

// ══════════════════════════════════════════════════════════════
// Stage 2: DID with Fixed Effects
// ══════════════════════════════════════════════════════════════

/**
 * Parallel Trend 검정 (간이)
 * 정책 시행 전 기간에 처리군과 대조군의 PM2.5 추세가 유사한지 검증
 */
export function checkParallelTrend(treated, controls, policyYear) {
  // 처리군의 정책 전 연도별 PM2.5
  const treatedPreSeries = treated.timeseries
    .filter(t => t.year < policyYear)
    .sort((a, b) => a.year - b.year);

  if (treatedPreSeries.length < 3) {
    return { passed: false, reason: 'Insufficient pre-period data (need ≥3 years)', correlation: null };
  }

  // 대조군 평균 시계열 (같은 연도들)
  const years = treatedPreSeries.map(t => t.year);
  const controlAvgSeries = years.map(yr => {
    const vals = controls
      .map(c => c.timeseries.find(t => t.year === yr)?.pm25)
      .filter(v => v != null);
    return vals.length > 0 ? mean(vals) : null;
  });

  // null이 있으면 해당 연도 제거
  const validPairs = [];
  for (let i = 0; i < years.length; i++) {
    if (controlAvgSeries[i] != null) {
      validPairs.push({
        treatedPm25: treatedPreSeries[i].pm25,
        controlPm25: controlAvgSeries[i],
      });
    }
  }

  if (validPairs.length < 3) {
    return { passed: false, reason: 'Insufficient overlapping years', correlation: null };
  }

  // 변화량(차분) 상관 계산
  const treatedDiffs = [];
  const controlDiffs = [];
  for (let i = 1; i < validPairs.length; i++) {
    treatedDiffs.push(validPairs[i].treatedPm25 - validPairs[i - 1].treatedPm25);
    controlDiffs.push(validPairs[i].controlPm25 - validPairs[i - 1].controlPm25);
  }

  const corr = pearsonCorrelation(treatedDiffs, controlDiffs);

  // 상관 > 0.5이면 parallel trend 만족으로 간주
  return {
    passed: corr > 0.5,
    correlation: round(corr, 3),
    nYears: validPairs.length,
    reason: corr > 0.5
      ? 'Pre-period trends are sufficiently parallel'
      : 'Pre-period trends diverge — DID estimates may be biased',
  };
}

/**
 * Difference-in-Differences 회귀 분석
 * PM_it = α + β·Policy_it + γ_i + δ_t + ε_it
 *
 * @param {Object} treated - { name, timeseries: [{year, pm25}] }
 * @param {Array<Object>} controls - [{ name, timeseries: [{year, pm25}] }]
 * @param {number} policyYear - 정책 시행 연도
 * @returns {Object} DID 효과 추정
 */
export function didRegression(treated, controls, policyYear) {
  if (!treated?.timeseries?.length || !controls?.length) {
    return { valid: false, reason: 'Insufficient data for DID' };
  }

  const treatedPre = treated.timeseries
    .filter(t => t.year < policyYear)
    .map(t => t.pm25);
  const treatedPost = treated.timeseries
    .filter(t => t.year >= policyYear)
    .map(t => t.pm25);

  if (treatedPre.length < 2 || treatedPost.length < 2) {
    return { valid: false, reason: 'Need ≥2 years pre and post policy' };
  }

  const controlPre = [], controlPost = [];
  for (const ctrl of controls) {
    const pre = ctrl.timeseries.filter(t => t.year < policyYear).map(t => t.pm25);
    const post = ctrl.timeseries.filter(t => t.year >= policyYear).map(t => t.pm25);
    if (pre.length > 0) controlPre.push(mean(pre));
    if (post.length > 0) controlPost.push(mean(post));
  }

  if (controlPre.length === 0 || controlPost.length === 0) {
    return { valid: false, reason: 'No control data' };
  }

  const treatedDiff = mean(treatedPost) - mean(treatedPre);
  const controlDiff = mean(controlPost) - mean(controlPre);
  const didEffect = treatedDiff - controlDiff;

  const parallelTrend = checkParallelTrend(treated, controls, policyYear);

  return {
    valid: true,
    stage: 2,
    treatedPreMean: round(mean(treatedPre)),
    treatedPostMean: round(mean(treatedPost)),
    controlPreMean: round(mean(controlPre)),
    controlPostMean: round(mean(controlPost)),
    treatedDiff: round(treatedDiff),
    controlDiff: round(controlDiff),
    didEffect: round(didEffect),
    didEffectPct: round((didEffect / mean(treatedPre)) * 100),
    parallelTrend,
    nControls: controls.length,
    confidence: parallelTrend.passed ? 'medium' : 'low',
  };
}

// ══════════════════════════════════════════════════════════════
// Stage 3: Synthetic Control Method (SCM)
// ══════════════════════════════════════════════════════════════

/**
 * 최적 가중치 탐색 (Constrained optimization)
 * 정책 전 기간에 처리군과 가장 유사한 합성 대조군 가중치를 찾는다.
 *
 * 제약: w_j ≥ 0, Σw_j = 1
 * 목적: min Σ_t (Y_treated_t - Σ_j w_j·Y_control_j_t)²
 *
 * 경량 구현: 좌표 하강법 (coordinate descent) + simplex 사영
 *
 * @param {Array<number>} treatedPre - 처리군 정책 전 시계열
 * @param {Array<Array<number>>} controlsPre - 대조군들의 정책 전 시계열
 * @param {number} [maxIter=500]
 * @returns {Array<number>} 최적 가중치 벡터
 */
function findSyntheticWeights(treatedPre, controlsPre, maxIter = 500) {
  const J = controlsPre.length;
  const T = treatedPre.length;

  if (J === 0 || T === 0) return [];

  // 초기 가중치: 균등
  let weights = new Array(J).fill(1 / J);

  // simplex 사영: w ≥ 0, Σw = 1 (Duchi et al. 2008 간소화)
  function projectSimplex(w) {
    const sorted = [...w].sort((a, b) => b - a);
    let cumSum = 0, rho = 0;
    for (let i = 0; i < sorted.length; i++) {
      cumSum += sorted[i];
      if (sorted[i] > (cumSum - 1) / (i + 1)) {
        rho = i + 1;
      }
    }
    const theta = (w.reduce((s, v) => s + Math.max(0, v), 0) - 1) / rho;
    return w.map(v => Math.max(0, v - theta));
  }

  // 목적함수: Σ_t (y_t - Σ_j w_j * x_jt)²
  function objective(w) {
    let loss = 0;
    for (let t = 0; t < T; t++) {
      let synth = 0;
      for (let j = 0; j < J; j++) {
        synth += w[j] * (controlsPre[j][t] ?? 0);
      }
      loss += (treatedPre[t] - synth) ** 2;
    }
    return loss;
  }

  const lr = 0.01;
  let bestWeights = [...weights];
  let bestLoss = objective(weights);

  for (let iter = 0; iter < maxIter; iter++) {
    // Gradient 계산
    const grad = new Array(J).fill(0);
    for (let t = 0; t < T; t++) {
      let synth = 0;
      for (let j = 0; j < J; j++) {
        synth += weights[j] * (controlsPre[j][t] ?? 0);
      }
      const residual = treatedPre[t] - synth;
      for (let j = 0; j < J; j++) {
        grad[j] -= 2 * residual * (controlsPre[j][t] ?? 0);
      }
    }

    // Projected gradient step
    const newWeights = weights.map((w, j) => w - lr * grad[j]);
    weights = projectSimplex(newWeights);

    const loss = objective(weights);
    if (loss < bestLoss) {
      bestLoss = loss;
      bestWeights = [...weights];
    }
  }

  return bestWeights;
}

/**
 * 합성 대조군 시계열 생성
 */
function buildSyntheticSeries(weights, controlsTimeseries) {
  // 모든 연도 수집
  const allYears = new Set();
  for (const ctrl of controlsTimeseries) {
    for (const t of ctrl) allYears.add(t.year);
  }
  const years = [...allYears].sort((a, b) => a - b);

  return years.map(yr => {
    let synth = 0;
    let validWeight = 0;
    for (let j = 0; j < weights.length; j++) {
      const val = controlsTimeseries[j]?.find(t => t.year === yr)?.pm25;
      if (val != null) {
        synth += weights[j] * val;
        validWeight += weights[j];
      }
    }
    return {
      year: yr,
      pm25: validWeight > 0 ? synth / validWeight * (weights.reduce((s, w) => s + w, 0)) : null,
    };
  }).filter(t => t.pm25 != null);
}

/**
 * Synthetic Control Method — 합성 통제 방법
 *
 * @param {Object} treated - { name, timeseries: [{year, pm25}] }
 * @param {Array<Object>} donors - [{ name, timeseries: [{year, pm25}] }]
 *   대조군 풀 (정책 미시행 국가들)
 * @param {number} policyYear - 정책 시행 연도
 * @returns {Object} SCM 분석 결과
 */
export function syntheticControl(treated, donors, policyYear) {
  if (!treated?.timeseries?.length || !donors?.length) {
    return { valid: false, reason: 'Insufficient data for SCM' };
  }

  // 정책 전/후 분리
  const treatedAll = treated.timeseries.sort((a, b) => a.year - b.year);
  const treatedPreYears = treatedAll.filter(t => t.year < policyYear);
  const treatedPostYears = treatedAll.filter(t => t.year >= policyYear);

  if (treatedPreYears.length < 3) {
    return { valid: false, reason: 'Need ≥3 pre-policy years for SCM' };
  }
  if (treatedPostYears.length < 1) {
    return { valid: false, reason: 'Need ≥1 post-policy year' };
  }

  const preYears = treatedPreYears.map(t => t.year);
  const treatedPreVals = treatedPreYears.map(t => t.pm25);

  // 대조군 정책 전 시계열 정렬 (같은 연도 매칭)
  const validDonors = [];
  const donorsPre = [];
  for (const donor of donors) {
    const preVals = preYears.map(yr => {
      const entry = donor.timeseries.find(t => t.year === yr);
      return entry?.pm25 ?? null;
    });
    // 최소 70% 연도가 있어야 유효 대조군
    const nonNullCount = preVals.filter(v => v != null).length;
    if (nonNullCount >= preYears.length * 0.7) {
      // null 보간 (선형)
      const interpolated = interpolateNulls(preVals);
      donorsPre.push(interpolated);
      validDonors.push(donor);
    }
  }

  if (validDonors.length < 2) {
    return { valid: false, reason: 'Need ≥2 valid donor units' };
  }

  // 최적 가중치 탐색
  const weights = findSyntheticWeights(treatedPreVals, donorsPre);

  // 합성 시계열 생성 (전체 기간)
  const syntheticSeries = buildSyntheticSeries(
    weights,
    validDonors.map(d => d.timeseries)
  );

  // 정책 효과 계산: 처리군 - 합성 대조군
  const effects = [];
  for (const tYear of treatedPostYears) {
    const synthPoint = syntheticSeries.find(s => s.year === tYear.year);
    if (synthPoint) {
      effects.push({
        year: tYear.year,
        actual: tYear.pm25,
        synthetic: round(synthPoint.pm25),
        gap: round(tYear.pm25 - synthPoint.pm25),
      });
    }
  }

  // Pre-period fit 평가 (RMSPE)
  let preRmspe = 0;
  let preFitCount = 0;
  for (const tYear of treatedPreYears) {
    const synthPoint = syntheticSeries.find(s => s.year === tYear.year);
    if (synthPoint) {
      preRmspe += (tYear.pm25 - synthPoint.pm25) ** 2;
      preFitCount++;
    }
  }
  preRmspe = preFitCount > 0 ? Math.sqrt(preRmspe / preFitCount) : Infinity;

  // Post-period RMSPE
  let postRmspe = 0;
  if (effects.length > 0) {
    postRmspe = Math.sqrt(
      effects.reduce((s, e) => s + e.gap ** 2, 0) / effects.length
    );
  }

  // 평균 정책 효과
  const avgEffect = effects.length > 0
    ? mean(effects.map(e => e.gap))
    : 0;

  // 가중치 상위 기여 국가
  const donorWeights = validDonors.map((d, i) => ({
    name: d.name,
    weight: round(weights[i], 4),
  })).filter(d => d.weight > 0.01)
    .sort((a, b) => b.weight - a.weight);

  // Placebo test 결과 (대조군 각각에 대해 SCM 적용 시 효과 분포)
  const placeboEffects = runPlaceboTests(validDonors, policyYear, weights);

  // p-value 근사: 실제 효과가 placebo 분포에서 차지하는 위치
  let pValue = 1;
  if (placeboEffects.length > 0) {
    const extremeCount = placeboEffects.filter(pe =>
      Math.abs(pe) >= Math.abs(avgEffect)
    ).length;
    pValue = (extremeCount + 1) / (placeboEffects.length + 1);
  }

  return {
    valid: true,
    stage: 3,
    avgEffect: round(avgEffect),
    avgEffectPct: treatedPreVals.length > 0
      ? round((avgEffect / mean(treatedPreVals)) * 100)
      : 0,
    effects,
    preRmspe: round(preRmspe),
    postRmspe: round(postRmspe),
    rmspeRatio: preRmspe > 0 ? round(postRmspe / preRmspe) : null,
    donorWeights,
    nDonors: validDonors.length,
    syntheticSeries: syntheticSeries.map(s => ({ year: s.year, pm25: round(s.pm25) })),
    placeboTestPValue: round(pValue, 4),
    significant: pValue < 0.1,
    confidence: pValue < 0.05 ? 'high'
      : pValue < 0.1 ? 'medium'
      : 'low',
    fitQuality: preRmspe < 3 ? 'excellent'
      : preRmspe < 5 ? 'good'
      : preRmspe < 10 ? 'fair'
      : 'poor',
  };
}

// ── Placebo Tests (Permutation Inference) ────────────────────

/**
 * Placebo 검정: 각 대조군을 "가짜 처리군"으로 설정했을 때의 효과 분포
 * 실제 효과가 이 분포에서 극단적이면 통계적으로 유의
 */
function runPlaceboTests(donors, policyYear, originalWeights) {
  const placeboEffects = [];

  for (let i = 0; i < donors.length; i++) {
    const fakeTreated = donors[i];
    const fakeControls = donors.filter((_, j) => j !== i);

    if (fakeControls.length < 2) continue;

    const preYears = fakeTreated.timeseries
      .filter(t => t.year < policyYear)
      .sort((a, b) => a.year - b.year);
    const postYears = fakeTreated.timeseries
      .filter(t => t.year >= policyYear);

    if (preYears.length < 3 || postYears.length < 1) continue;

    const preVals = preYears.map(t => t.pm25);
    const years = preYears.map(t => t.year);

    const controlsPre = [];
    const validControls = [];
    for (const ctrl of fakeControls) {
      const vals = years.map(yr => ctrl.timeseries.find(t => t.year === yr)?.pm25 ?? null);
      const nonNull = vals.filter(v => v != null).length;
      if (nonNull >= years.length * 0.7) {
        controlsPre.push(interpolateNulls(vals));
        validControls.push(ctrl);
      }
    }

    if (validControls.length < 2) continue;

    const w = findSyntheticWeights(preVals, controlsPre, 200); // fewer iters for speed
    const synthSeries = buildSyntheticSeries(w, validControls.map(c => c.timeseries));

    // 정책 후 gap
    const gaps = [];
    for (const t of postYears) {
      const s = synthSeries.find(ss => ss.year === t.year);
      if (s) gaps.push(t.pm25 - s.pm25);
    }
    if (gaps.length > 0) {
      placeboEffects.push(mean(gaps));
    }
  }

  return placeboEffects;
}

// ══════════════════════════════════════════════════════════════
// Multi-Stage Pipeline: 자동 3단계 분석
// ══════════════════════════════════════════════════════════════

/**
 * 자동 다단계 정책 효과 분석
 * 데이터 가용성에 따라 Stage 1→2→3 순차 시도
 *
 * @param {Object} params
 * @param {Object} params.treated - { name, timeseries: [{year, pm25}] }
 * @param {Array<Object>} params.donors - 대조군 풀
 * @param {number} params.policyYear
 * @returns {Object} 최고 단계까지의 분석 결과
 */
export function analyzePolicy({ treated, donors = [], policyYear }) {
  const results = { stages: {} };

  // Stage 1: Pre/Post (항상 시도)
  const prePeriod = treated.timeseries
    .filter(t => t.year < policyYear)
    .map(t => t.pm25);
  const postPeriod = treated.timeseries
    .filter(t => t.year >= policyYear)
    .map(t => t.pm25);

  results.stages[1] = prePostComparison(prePeriod, postPeriod);

  // Stage 2: DID (대조군 있으면 시도)
  if (donors.length >= 1) {
    results.stages[2] = didRegression(treated, donors, policyYear);
  }

  // Stage 3: SCM (대조군 ≥2, 정책 전 ≥3년)
  if (donors.length >= 2 && prePeriod.length >= 3) {
    results.stages[3] = syntheticControl(treated, donors, policyYear);
  }

  // 최고 유효 단계 선택
  const maxStage = [3, 2, 1].find(s => results.stages[s]?.valid) || 1;
  results.bestStage = maxStage;
  results.bestResult = results.stages[maxStage];
  results.country = treated.name;
  results.policyYear = policyYear;

  return results;
}

// ══════════════════════════════════════════════════════════════
// 대조군 자동 추천
// ══════════════════════════════════════════════════════════════

/**
 * 처리군과 유사한 대조군 자동 선별
 * 기준: 정책 전 PM2.5 수준, 추세 유사도, 지리적 근접성
 *
 * @param {Object} treated - { name, region, timeseries }
 * @param {Array<Object>} allCountries - 모든 국가 데이터
 * @param {number} policyYear
 * @param {number} [maxDonors=10]
 * @returns {Array<Object>} 추천 대조군 (유사도 높은 순)
 */
export function recommendDonors(treated, allCountries, policyYear, maxDonors = 10) {
  const treatedPre = treated.timeseries
    .filter(t => t.year < policyYear)
    .map(t => t.pm25);

  if (treatedPre.length < 2) return [];

  const treatedMean = mean(treatedPre);
  const treatedStd = std(treatedPre);

  const candidates = [];

  for (const country of allCountries) {
    // 자기 자신 제외
    if (country.name === treated.name) continue;

    const pre = country.timeseries
      ?.filter(t => t.year < policyYear)
      ?.map(t => t.pm25);

    if (!pre || pre.length < 2) continue;

    const cMean = mean(pre);
    const cStd = std(pre);

    // 수준 유사도 (PM2.5 평균 차이)
    const levelSimilarity = 1 / (1 + Math.abs(cMean - treatedMean) / treatedMean);

    // 추세 유사도 (상관계수)
    const minLen = Math.min(treatedPre.length, pre.length);
    const corr = minLen >= 3
      ? Math.abs(pearsonCorrelation(treatedPre.slice(-minLen), pre.slice(-minLen)))
      : 0;

    // 분산 유사도
    const varSimilarity = treatedStd > 0 && cStd > 0
      ? 1 / (1 + Math.abs(cStd - treatedStd) / treatedStd)
      : 0.5;

    // 같은 지역 보너스
    const regionBonus = country.region === treated.region ? 0.15 : 0;

    const score = levelSimilarity * 0.4 + corr * 0.3 + varSimilarity * 0.15 + regionBonus;

    candidates.push({
      ...country,
      similarity: round(score, 4),
      levelSimilarity: round(levelSimilarity, 3),
      trendCorrelation: round(corr, 3),
    });
  }

  return candidates
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxDonors);
}

// ══════════════════════════════════════════════════════════════
// Utility: null 보간
// ══════════════════════════════════════════════════════════════

function interpolateNulls(arr) {
  const result = [...arr];
  // forward fill
  for (let i = 1; i < result.length; i++) {
    if (result[i] == null && result[i - 1] != null) result[i] = result[i - 1];
  }
  // backward fill
  for (let i = result.length - 2; i >= 0; i--) {
    if (result[i] == null && result[i + 1] != null) result[i] = result[i + 1];
  }
  // remaining nulls → 0
  return result.map(v => v ?? 0);
}

// ══════════════════════════════════════════════════════════════
// Exports
// ══════════════════════════════════════════════════════════════

export default {
  prePostComparison,
  checkParallelTrend,
  didRegression,
  syntheticControl,
  analyzePolicy,
  recommendDonors,
};
