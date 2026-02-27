/**
 * aod-correction.js — 위성 AOD → PM2.5 고급 보정 엔진
 * ──────────────────────────────────────────────────────
 * 고도화 전략 §2.① : IDW/Globe AOD → GTWR (지리적 시간 가중 회귀)
 *
 * 핵심 개선:
 *   1. 수직-습도 교정 (Vertical-Humidity Correction)
 *      - f(RH): 흡습 성장 보정 함수
 *      - PBLH: 경계층 높이 보정
 *   2. GTWR-lite: 지리적·시간적 가중 회귀 (경량 근사)
 *   3. 계절/시간 보정
 *
 * 기존: AOD × 120 (단순 선형) → r = 0.19~0.47
 * 개선: AOD × f(RH) × g(PBLH) × seasonal + intercept → 목표 r ≥ 0.6
 *
 * @module analysis/aod-correction
 */

// ── 흡습 성장 보정 f(RH) ─────────────────────────────────────

/**
 * 상대습도 기반 흡습 성장 보정 계수
 * 에어로졸은 습도가 높을수록 수분을 흡수하여 광학 깊이가 증가
 * 따라서 동일 AOD에서 실제 PM2.5는 더 낮을 수 있음
 *
 * f(RH) = 1 / (1 - RH/100)^γ  (Kotchenruther & Hobbs, 1998)
 * γ ≈ 0.3~0.5 (aerosol type dependent)
 *
 * @param {number} rh - 상대습도 (0–100%)
 * @param {number} [gamma=0.38] - 흡습 성장 지수
 * @returns {number} 보정 계수 (1.0 = 보정 없음, >1 = 습도로 AOD 과대추정)
 */
export function hygroscopicGrowthFactor(rh, gamma = 0.38) {
  if (rh == null || rh < 0) return 1.0;
  // RH > 95%면 포화 근처 → 상한 고정
  const rhClamped = Math.min(rh, 95);
  const denom = 1 - rhClamped / 100;
  if (denom <= 0.01) return 3.0; // 상한
  return Math.pow(1 / denom, gamma);
}

// ── PBLH (경계층 높이) 보정 ──────────────────────────────────

/**
 * 경계층 높이 보정
 * PBLH가 낮으면 오염물질이 지표면에 집중 → 같은 AOD에서 더 높은 PM2.5
 *
 * g(PBLH) = PBLH_ref / PBLH  (PBLH_ref ≈ 1500m, 표준 혼합층)
 *
 * @param {number} pblh - 경계층 높이 (m)
 * @param {number} [pblhRef=1500] - 기준 경계층 높이
 * @returns {number} 보정 계수
 */
export function pblhCorrectionFactor(pblh, pblhRef = 1500) {
  if (pblh == null || pblh <= 0) return 1.0;
  // 극단적 저PBLH (안개/역전층) 상한
  const pblhClamped = Math.max(pblh, 200);
  return Math.min(3.0, pblhRef / pblhClamped);
}

// ── 계절/시간 보정 ───────────────────────────────────────────

/**
 * 계절 보정 계수
 * 겨울: 난방+역전층 → PM2.5/AOD 비율 높음
 * 여름: 습도 높으나 대류 활발 → 비율 낮음
 *
 * @param {number} month - 월 (1–12)
 * @param {number} lat - 위도 (남반구 계절 반전)
 * @returns {number} 보정 계수
 */
export function seasonalFactor(month, lat = 0) {
  // 남반구는 6개월 시프트
  const adjustedMonth = lat < 0 ? ((month + 5) % 12) + 1 : month;

  // 겨울(12,1,2): 1.25, 여름(6,7,8): 0.85, 봄/가을: 1.0
  const factors = [1.25, 1.2, 1.05, 1.0, 0.95, 0.85, 0.85, 0.9, 1.0, 1.05, 1.1, 1.2];
  return factors[(adjustedMonth - 1) % 12] ?? 1.0;
}

// ── 통합 AOD → PM2.5 보정 함수 ──────────────────────────────

/**
 * 고급 AOD → PM2.5 변환 (수직-습도 교정 포함)
 *
 * PM2.5 = AOD × (baseCoeff / f(RH)) × g(PBLH) × seasonal × elevation_factor + intercept
 *
 * @param {Object} params
 * @param {number} params.aod - Aerosol Optical Depth
 * @param {number} [params.rh] - 상대습도 (%)
 * @param {number} [params.pblh] - 경계층 높이 (m)
 * @param {number} [params.temperature] - 기온 (°C)
 * @param {number} [params.windSpeed] - 풍속 (m/s)
 * @param {number} [params.elevation] - 고도 (m)
 * @param {number} [params.month] - 월 (1–12)
 * @param {number} [params.lat] - 위도
 * @param {number} [params.baseCoeff=120] - 기본 AOD→PM2.5 계수
 * @returns {Object} { pm25, uncertainty, corrections }
 */
export function correctedAodToPm25({
  aod,
  rh,
  pblh,
  temperature,
  windSpeed,
  elevation,
  month,
  lat = 0,
  baseCoeff = 120,
} = {}) {
  if (aod == null || aod < 0) return { pm25: null, uncertainty: null, corrections: {} };

  // 1. 흡습 보정: AOD가 습도에 의해 과대추정된 부분 제거
  const fRH = hygroscopicGrowthFactor(rh);
  const aodCorrected = aod / fRH;

  // 2. PBLH 보정: 혼합층 높이에 따른 지표 농도 보정
  const gPBLH = pblhCorrectionFactor(pblh);

  // 3. 계절 보정
  const sFactor = month != null ? seasonalFactor(month, lat) : 1.0;

  // 4. 고도 보정 (고도 높을수록 PM2.5 감소)
  const elevFactor = elevation != null ? Math.exp(-elevation / 8000) : 1.0;

  // 5. 풍속 보정 (강풍 → 오염물질 확산 → PM2.5 감소)
  const windFactor = windSpeed != null ? 1 / (1 + 0.05 * windSpeed) : 1.0;

  // 6. 기온 보정 (2차적 효과)
  const tempFactor = temperature != null ? 1 + 0.005 * (20 - temperature) : 1.0;

  // 종합
  const pm25 = aodCorrected * baseCoeff * gPBLH * sFactor * elevFactor * windFactor * tempFactor;

  // 불확실성 추정: 보정 계수가 많이 적용될수록 불확실성 증가
  const correctionMag = Math.abs(Math.log(fRH)) + Math.abs(Math.log(gPBLH))
    + Math.abs(Math.log(sFactor));
  const baseUncertainty = pm25 * 0.25; // 기본 25% 불확실성
  const uncertainty = baseUncertainty * (1 + correctionMag * 0.3);

  return {
    pm25: Math.max(0, Math.round(pm25 * 10) / 10),
    uncertainty: Math.round(uncertainty * 10) / 10,
    corrections: {
      fRH: Math.round(fRH * 1000) / 1000,
      gPBLH: Math.round(gPBLH * 1000) / 1000,
      seasonal: sFactor,
      elevation: Math.round(elevFactor * 1000) / 1000,
      wind: Math.round(windFactor * 1000) / 1000,
      temperature: Math.round(tempFactor * 1000) / 1000,
    },
    aodCorrected: Math.round(aodCorrected * 10000) / 10000,
  };
}

// ── GTWR-lite (지리적 시간 가중 회귀 근사) ───────────────────

/**
 * GTWR-lite: 공간-시간 가중 회귀 (경량 구현)
 *
 * 각 예측 지점에서 인근 관측소의 데이터를 공간-시간 가중으로 결합
 * 가중치 = exp(-dist²/h_s²) × exp(-timeDiff²/h_t²)
 *
 * @param {Object} target - { lat, lon, timestamp }
 * @param {Array<Object>} observations - [ { lat, lon, timestamp, pm25, aod, rh, ... } ]
 * @param {Object} [bandwidths] - { spatial: km, temporal: hours }
 * @returns {Object} { predicted_pm25, weight_sum, n_effective, r2_local }
 */
export function gtwrPredict(target, observations, bandwidths = {}) {
  const hS = bandwidths.spatial || 100;  // km
  const hT = bandwidths.temporal || 24;  // hours

  const targetTime = target.timestamp ? new Date(target.timestamp).getTime() : Date.now();

  // 1. 가중치 계산
  const weighted = [];
  for (const obs of observations) {
    if (obs.pm25 == null || obs.lat == null) continue;

    // 공간 거리 (km)
    const dLat = (obs.lat - target.lat) * 111.32;
    const dLon = (obs.lon - target.lon) * 111.32 * Math.cos(target.lat * Math.PI / 180);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);

    // 시간 거리 (hours)
    const obsTime = obs.timestamp ? new Date(obs.timestamp).getTime() : Date.now();
    const timeDiff = Math.abs(targetTime - obsTime) / 3_600_000;

    // Gaussian kernel
    const wS = Math.exp(-(dist * dist) / (hS * hS));
    const wT = Math.exp(-(timeDiff * timeDiff) / (hT * hT));
    const w = wS * wT;

    if (w > 0.001) { // 너무 먼 관측은 무시
      weighted.push({ ...obs, weight: w, dist, timeDiff });
    }
  }

  if (weighted.length === 0) {
    return { predicted_pm25: null, weight_sum: 0, n_effective: 0 };
  }

  // 2. 가중 평균 (0차 GTWR = Nadaraya-Watson)
  const wSum = weighted.reduce((s, o) => s + o.weight, 0);
  const wMean = weighted.reduce((s, o) => s + o.weight * o.pm25, 0) / wSum;

  // 유효 관측 수 (Kish's effective sample size)
  const w2Sum = weighted.reduce((s, o) => s + o.weight * o.weight, 0);
  const nEffective = (wSum * wSum) / w2Sum;

  // 3. 로컬 R² 근사 (가중 분산비)
  const wVar = weighted.reduce((s, o) => s + o.weight * (o.pm25 - wMean) ** 2, 0) / wSum;
  const globalMean = observations.reduce((s, o) => s + (o.pm25 || 0), 0) / observations.length;
  const totalVar = observations.reduce((s, o) => s + ((o.pm25 || 0) - globalMean) ** 2, 0) / observations.length;
  const r2Local = totalVar > 0 ? 1 - wVar / totalVar : 0;

  return {
    predicted_pm25: Math.round(wMean * 10) / 10,
    weight_sum: Math.round(wSum * 100) / 100,
    n_effective: Math.round(nEffective * 10) / 10,
    n_observations: weighted.length,
    r2_local: Math.round(Math.max(0, r2Local) * 1000) / 1000,
  };
}

// ── 격자 예측 (GTWR + AOD 보정 결합) ────────────────────────

/**
 * 전체 격자에 대한 PM2.5 예측
 * AOD 보정 + GTWR 보간을 결합하여 최적 추정
 */
export function predictGrid({
  gridPoints,       // [{ lat, lon, aod, rh, pblh, temperature, windSpeed, elevation, month }]
  observations,     // [{ lat, lon, pm25, timestamp }]
  bandwidths,
} = {}) {
  const results = [];

  for (const pt of gridPoints) {
    // 1. AOD 기반 추정 (있으면)
    let aodEstimate = null;
    if (pt.aod != null) {
      const aodResult = correctedAodToPm25(pt);
      aodEstimate = aodResult.pm25;
    }

    // 2. GTWR 보간 추정
    const gtwrResult = gtwrPredict(pt, observations, bandwidths);
    const gtwrEstimate = gtwrResult.predicted_pm25;

    // 3. 융합: AOD와 GTWR 가중 결합
    let pm25, source;
    if (aodEstimate != null && gtwrEstimate != null) {
      // 유효 관측이 많을수록 GTWR에 높은 가중치
      const gtwrWeight = Math.min(0.8, gtwrResult.n_effective / 10);
      const aodWeight = 1 - gtwrWeight;
      pm25 = aodEstimate * aodWeight + gtwrEstimate * gtwrWeight;
      source = 'fusion';
    } else if (gtwrEstimate != null) {
      pm25 = gtwrEstimate;
      source = 'gtwr';
    } else if (aodEstimate != null) {
      pm25 = aodEstimate;
      source = 'aod';
    } else {
      continue;
    }

    results.push({
      lat: pt.lat,
      lon: pt.lon,
      predicted_p50: Math.round(pm25 * 10) / 10,
      predicted_p10: Math.round(pm25 * 0.7 * 10) / 10,  // 근사
      predicted_p90: Math.round(pm25 * 1.4 * 10) / 10,   // 근사
      uncertainty: Math.round(pm25 * 0.3 * 10) / 10,
      source,
      n_effective: gtwrResult.n_effective,
      r2_local: gtwrResult.r2_local,
    });
  }

  return results;
}

export default {
  hygroscopicGrowthFactor, pblhCorrectionFactor, seasonalFactor,
  correctedAodToPm25, gtwrPredict, predictGrid,
};
