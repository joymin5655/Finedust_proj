/**
 * predictionService.js — ML 예측 서비스
 * ──────────────────────────────────────
 * ML Spec v1 §2, §3 기반
 *
 * 역할:
 *   1. AOD + Weather → PM2.5 예측 (MLR / RF / XGBoost)
 *   2. Policy DID 효과 추정
 *   3. 예측 그리드 로드 및 Globe 오버레이 제공
 *
 * 현재 Phase:
 *   - MLR 시뮬레이션 (브라우저)
 *   - 서버사이드 모델 결과 로드 (JSON)
 *   향후: ONNX 브라우저 추론 (PRD v2.0)
 */

import { ML_CONFIG } from '../utils/constants.js';
import { DataService } from './dataService.js';

class _PredictionService {
  constructor() {
    this._gridCache = null;
    this._gridTimestamp = null;
  }

  // ── 1. MLR 시뮬레이션 (브라우저 내) ───────────────────────
  /**
   * AOD + Weather features → PM2.5 추정 (ML Spec §2.4 baseline)
   *
   * @param {Object} features
   *   - aod: number (Aerosol Optical Depth, 0-3)
   *   - temperature: number (°C)
   *   - relative_humidity: number (%)
   *   - wind_speed: number (m/s)
   *   - elevation: number (m)
   *   - pbl: number (Planetary Boundary Layer height, m)
   * @returns {{ predicted_pm25, uncertainty_rmse, method }}
   */
  estimateMLR(features) {
    const c = ML_CONFIG.mlr_coefficients;
    const {
      aod = 0.3,
      pbl = 800,
      relative_humidity: rh = 60,
      temperature: temp = 15,
      elevation = 50,
    } = features;

    const predicted = c.intercept
      + c.aod * aod
      + c.pbl * pbl
      + c.rh * rh
      + c.temp * temp
      + c.elevation * elevation;

    return {
      predicted_pm25: Math.max(1, Math.round(predicted * 10) / 10),
      uncertainty_rmse: ML_CONFIG.target_metrics.rmse,
      method: 'MLR_browser',
      coverage_score: this._calcCoverage(features),
    };
  }

  /**
   * 측정소 PM2.5 기반 위성 추정 시뮬레이션 (AOD 없을 때)
   * 계절/시간/위도 보정 포함
   */
  estimateSatellite(stationPM25, ctx = {}) {
    const { lat = 37, month = new Date().getMonth() + 1, hour = 12 } = ctx;

    // 시간대 보정 (위성 통과 시각 기준)
    const hourBias = (hour >= 10 && hour <= 14) ? 0 : 0.05;
    // 계절 보정
    const seasonBias = (month >= 12 || month <= 2) ? 0.10
      : (month >= 3 && month <= 5) ? 0.05
      : (month >= 6 && month <= 8) ? -0.05 : 0;
    // 위도 보정
    const latBias = Math.abs(lat) < 23 ? -0.08 : 0;

    const totalBias = hourBias + seasonBias + latBias;
    const estimated = stationPM25 * (1 + totalBias);

    return {
      pm25: Math.round(estimated * 10) / 10,
      method: 'satellite_simulation',
      bias: Math.round(totalBias * 100),
      confidence: 0.6,
    };
  }

  // ── 2. 서버사이드 예측 그리드 로드 ────────────────────────
  /**
   * ML 모델이 생성한 예측 그리드 JSON 로드
   * (scripts/python/ml/ 에서 생성, app/data/predictions/ 에 저장)
   *
   * 포맷 (ML Spec §2.6):
   *   [{ lat, lon, date, predicted_pm25, uncertainty_rmse, coverage_score }]
   */
  async loadPredictionGrid() {
    return DataService.loadPredictionGrid();
  }

  /**
   * 특정 위치의 예측값 조회 (가장 가까운 그리드 포인트)
   */
  async getPredictionAt(lat, lon) {
    const grid = await this.loadPredictionGrid();
    if (!grid || !grid.predictions) return null;

    let nearest = null;
    let minDist = Infinity;

    for (const point of grid.predictions) {
      const dist = Math.sqrt((point.lat - lat) ** 2 + (point.lon - lon) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = point;
      }
    }

    return nearest;
  }

  // ── 3. 3소스 통합 (PRD §3.2 Triple Verification) ─────────
  /**
   * Station + Satellite + Camera 통합 PM2.5
   *
   * @param {Object} sources
   *   - station: { pm25, confidence }
   *   - satellite: { pm25, confidence }
   *   - camera: { pm25, confidence } (optional)
   * @returns {{ value, confidence, confScore, stationVal, satVal, cameraVal }}
   */
  integrate(sources) {
    const { station, satellite, camera } = sources;
    const entries = [];

    if (station?.pm25 != null)   entries.push({ val: station.pm25,   w: station.confidence ?? 0.8 });
    if (satellite?.pm25 != null) entries.push({ val: satellite.pm25, w: satellite.confidence ?? 0.5 });
    if (camera?.pm25 != null)    entries.push({ val: camera.pm25,    w: camera.confidence ?? 0.3 });

    if (!entries.length) return null;

    const totalW = entries.reduce((s, e) => s + e.w, 0);
    const fused = entries.reduce((s, e) => s + e.val * e.w, 0) / totalW;

    // 신뢰도 점수: 소스 수 + 소스 간 일관성
    const sourceCount = entries.length;
    const variance = entries.length > 1
      ? entries.reduce((s, e) => s + (e.val - fused) ** 2, 0) / entries.length
      : 0;
    const consistency = Math.max(0, 1 - variance / 500);
    const confScore = Math.min(1, (sourceCount * 0.3 + consistency * 0.4 + (totalW / sourceCount) * 0.3));

    return {
      value: Math.round(fused * 10) / 10,
      confidence: confScore > 0.7 ? 'High' : confScore > 0.4 ? 'Medium' : 'Low',
      confScore: Math.round(confScore * 100),
      stationVal:   station?.pm25 ?? null,
      satVal:       satellite?.pm25 ?? null,
      cameraVal:    camera?.pm25 ?? null,
      biasSat:      satellite?.bias ?? null,
      sourceCount,
    };
  }

  // ── 4. Policy DID 효과 추정 (ML Spec §3) ──────────────────
  /**
   * 정책 전후 평균 비교 (Stage 1 MVP)
   */
  calcPolicyEffect(timeseries, policyYear, window = 3) {
    const before = timeseries.filter(d =>
      d.year && +d.year < policyYear && +d.year >= policyYear - window && d.avg > 0
    );
    const after = timeseries.filter(d =>
      d.year && +d.year > policyYear && +d.year <= policyYear + window && d.avg > 0
    );

    if (!before.length || !after.length) return null;

    const avgBefore = before.reduce((s, d) => s + d.avg, 0) / before.length;
    const avgAfter  = after.reduce((s, d) => s + d.avg, 0) / after.length;

    return {
      avgBefore: Math.round(avgBefore * 100) / 100,
      avgAfter:  Math.round(avgAfter * 100) / 100,
      absoluteChange: Math.round((avgAfter - avgBefore) * 100) / 100,
      relativeChange: Math.round(((avgAfter - avgBefore) / avgBefore) * 10000) / 100,
      window,
      policyYear,
    };
  }

  // ── Private helpers ────────────────────────────────────────
  _calcCoverage(features) {
    const required = ML_CONFIG.required_features;
    const present = required.filter(f => features[f] != null).length;
    return Math.round((present / required.length) * 100) / 100;
  }
}

export const PredictionService = new _PredictionService();

// 하위 호환성
if (typeof window !== 'undefined') {
  window.PredictionService = PredictionService;
}
