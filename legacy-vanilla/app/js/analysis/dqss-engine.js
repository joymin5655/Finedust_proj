/**
 * dqss-engine.js — Data Quality Scoring System (Advanced)
 * ──────────────────────────────────────────────────────────
 * Production Spec §10: DQSS — 수학·실행·UI 반영
 *
 * 5-component weighted scoring (0–100):
 *   1. Freshness     (0–25) : 데이터 갱신 시각 기반
 *   2. Completeness  (0–20) : 최근 24시간 데이터 가용률
 *   3. Consistency   (0–20) : 교차 소스 일치도
 *   4. Stability     (0–20) : 시계열 안정성 (rolling std)
 *   5. ModelResidual (0–15) : 예측-관측 잔차 크기
 *
 * + Bayesian Reliability 연동 (§11)
 * + Anomaly Detection 연동 (§12)
 *
 * @module analysis/dqss-engine
 */

// ── Component Scoring Functions ──────────────────────────────

/**
 * Freshness Score (0–25)
 * 데이터가 얼마나 최근인지
 */
export function scoreFreshness(ageHours) {
  if (ageHours == null || isNaN(ageHours)) return 0;
  if (ageHours <= 1) return 25;
  if (ageHours <= 3) return 20;
  if (ageHours <= 6) return 15;
  if (ageHours <= 12) return 10;
  if (ageHours <= 24) return 5;
  if (ageHours <= 48) return 2;
  return 0;
}

/**
 * Completeness Score (0–20)
 * 최근 24시간 중 사용 가능한 데이터 비율
 */
export function scoreCompleteness(percentAvailable) {
  if (percentAvailable == null) return 2;
  if (percentAvailable >= 95) return 20;
  if (percentAvailable >= 90) return 18;
  if (percentAvailable >= 80) return 16;
  if (percentAvailable >= 70) return 14;
  if (percentAvailable >= 60) return 10;
  if (percentAvailable >= 50) return 8;
  if (percentAvailable >= 30) return 4;
  return 2;
}

/**
 * Cross-source Consistency Score (0–20)
 * 같은 위치에서 다른 소스(OpenAQ, WAQI 등) 간 PM2.5 차이
 * @param {number} deltaAbs - |소스1_pm25 - 소스2_pm25| (µg/m³)
 * @param {number} sourceCount - 비교 가능한 소스 수
 */
export function scoreConsistency(deltaAbs, sourceCount = 1) {
  if (sourceCount < 2) return 10; // 단일 소스면 중간값
  if (deltaAbs == null) return 10;
  // Sigmoid mapping: 차이가 작을수록 높은 점수
  const score = 20 / (1 + Math.exp(0.3 * (deltaAbs - 10)));
  return Math.round(Math.min(20, Math.max(0, score)));
}

/**
 * Stability Score (0–20)
 * 최근 48시간 rolling std 기반 — 갑작스러운 spike 감점
 * @param {number} rollingStd48h - 48시간 표준편차
 * @param {number} spikeCount - 최근 24시간 내 spike 횟수
 */
export function scoreStability(rollingStd48h, spikeCount = 0) {
  if (rollingStd48h == null) return 10;
  // std 낮을수록 안정적
  let score = 20;
  if (rollingStd48h > 5)  score -= 2;
  if (rollingStd48h > 10) score -= 4;
  if (rollingStd48h > 20) score -= 6;
  if (rollingStd48h > 40) score -= 4;
  // spike 감점
  score -= Math.min(6, spikeCount * 2);
  return Math.max(0, Math.round(score));
}

/**
 * Model Residual Score (0–15)
 * 최근 관측값과 모델 예측값의 잔차
 * @param {number} meanAbsResidual - 평균 |obs - pred| (µg/m³)
 */
export function scoreModelResidual(meanAbsResidual) {
  if (meanAbsResidual == null) return 7; // 예측 없으면 중간값
  if (meanAbsResidual < 3) return 15;
  if (meanAbsResidual < 5) return 13;
  if (meanAbsResidual < 8) return 10;
  if (meanAbsResidual < 12) return 7;
  if (meanAbsResidual < 20) return 4;
  return 1;
}

// ── DQSS Composite Calculator ────────────────────────────────

/**
 * 전체 DQSS 점수 계산 (0–100)
 * @param {Object} params
 * @param {number} params.ageHours - 데이터 경과 시간
 * @param {number} params.percentAvailable - 24시간 가용률 (0–100)
 * @param {number} params.crossSourceDelta - 교차소스 차이 (µg/m³)
 * @param {number} params.sourceCount - 소스 수
 * @param {number} params.rollingStd48h - 48시간 표준편차
 * @param {number} params.spikeCount - 최근 spike 수
 * @param {number} params.meanAbsResidual - 평균 잔차
 * @param {number} [params.bayesianReliability] - Bayesian 신뢰도 (0–1)
 * @param {boolean} [params.anomalyFlag] - 이상치 플래그
 * @returns {Object} DQSS breakdown + final score + badge
 */
export function computeDQSS({
  ageHours,
  percentAvailable,
  crossSourceDelta,
  sourceCount = 1,
  rollingStd48h,
  spikeCount = 0,
  meanAbsResidual,
  bayesianReliability,
  anomalyFlag = false,
} = {}) {
  const freshness   = scoreFreshness(ageHours);
  const completeness = scoreCompleteness(percentAvailable);
  const consistency  = scoreConsistency(crossSourceDelta, sourceCount);
  const stability    = scoreStability(rollingStd48h, spikeCount);
  const modelResid   = scoreModelResidual(meanAbsResidual);

  let total = freshness + completeness + consistency + stability + modelResid;

  // Bayesian Reliability 보너스/감점 (±5)
  let reliabilityAdj = 0;
  if (bayesianReliability != null) {
    reliabilityAdj = Math.round((bayesianReliability - 0.5) * 10);
    total = Math.min(100, Math.max(0, total + reliabilityAdj));
  }

  // Anomaly 감점 (−20)
  let anomalyPenalty = 0;
  if (anomalyFlag) {
    anomalyPenalty = -20;
    total = Math.max(0, total + anomalyPenalty);
  }

  // Badge 분류
  const badge = total >= 75 ? 'High'
    : total >= 50 ? 'Medium'
    : total >= 25 ? 'Low'
    : 'Unreliable';

  const badgeColor = total >= 75 ? '#00ff88'
    : total >= 50 ? '#ffcc00'
    : total >= 25 ? '#ff8800'
    : '#ff2222';

  return {
    components: {
      freshness,
      completeness,
      consistency,
      stability,
      modelResidual: modelResid,
    },
    adjustments: {
      reliabilityAdj,
      anomalyPenalty,
    },
    total,
    normalized: total / 100,  // 0–1 스케일
    badge,
    badgeColor,
  };
}

// ── Batch DQSS for Station Array ─────────────────────────────

/**
 * 여러 관측소에 대해 DQSS 일괄 계산
 * @param {Array<Object>} stations - 관측소 배열
 * @param {Map<string, number>} predictions - station_id → predicted_pm25
 * @returns {Map<string, Object>} station_id → DQSS result
 */
export function batchComputeDQSS(stations, predictions = new Map()) {
  const results = new Map();

  for (const st of stations) {
    const stId = st.id || st.station_id || st.name;

    // 경과 시간 계산
    let ageHours = null;
    if (st.lastUpdated || st.timestamp) {
      const ts = new Date(st.lastUpdated || st.timestamp);
      ageHours = (Date.now() - ts.getTime()) / 3_600_000;
    }

    // 잔차 계산
    let meanAbsResidual = null;
    const pred = predictions.get(stId);
    if (pred != null && st.pm25 != null) {
      meanAbsResidual = Math.abs(st.pm25 - pred);
    }

    const dqss = computeDQSS({
      ageHours,
      percentAvailable: st.completeness ?? st.percentAvailable,
      crossSourceDelta: st.crossSourceDelta,
      sourceCount: st.sourceCount ?? 1,
      rollingStd48h: st.rollingStd48h ?? st.std,
      spikeCount: st.spikeCount ?? 0,
      meanAbsResidual,
      bayesianReliability: st.bayesianReliability ?? st.reliability,
      anomalyFlag: st.anomalyFlag ?? false,
    });

    results.set(stId, {
      ...dqss,
      station_id: stId,
      lat: st.lat,
      lon: st.lon,
    });
  }

  return results;
}

/**
 * DQSS 결과 요약 통계
 */
export function summarizeDQSS(dqssResults) {
  const scores = [];
  let highCount = 0, medCount = 0, lowCount = 0, unreliableCount = 0;

  for (const [, d] of dqssResults) {
    scores.push(d.total);
    if (d.badge === 'High') highCount++;
    else if (d.badge === 'Medium') medCount++;
    else if (d.badge === 'Low') lowCount++;
    else unreliableCount++;
  }

  const n = scores.length;
  const sorted = [...scores].sort((a, b) => a - b);

  return {
    count: n,
    mean: n > 0 ? scores.reduce((s, v) => s + v, 0) / n : 0,
    median: n > 0 ? sorted[Math.floor(n / 2)] : 0,
    min: sorted[0] ?? 0,
    max: sorted[n - 1] ?? 0,
    distribution: { high: highCount, medium: medCount, low: lowCount, unreliable: unreliableCount },
    coverageAbove60: n > 0 ? (scores.filter(s => s >= 60).length / n * 100) : 0,
  };
}

export default {
  scoreFreshness, scoreCompleteness, scoreConsistency,
  scoreStability, scoreModelResidual,
  computeDQSS, batchComputeDQSS, summarizeDQSS,
};
