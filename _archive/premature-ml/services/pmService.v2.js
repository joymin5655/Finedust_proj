/**
 * pmService.v2.js — PM2.5 통합 서비스 (리팩토링)
 * ─────────────────────────────────────────────────
 * PRD v1.5 §3, ML Spec §2 기반
 *
 * 기존 pmService.js 완전 대체:
 *   - calcStationPM25 (IDW 보간)
 *   - estimateSatPM25 (AOD MLR / 시뮬레이션)
 *   - integrate (3소스 융합)
 *   - getGrade / getActionGuide
 *
 * 새로운 기능:
 *   - PredictionService 연동 (ML 예측 결과 활용)
 *   - DataService 연동 (통합 캐시)
 *   - 하위 호환성 유지 (window.PMService)
 */

import { getGrade, pm25ToLabel } from '../utils/color.js';
import { findNearestStations, idwInterpolate } from '../utils/geo.js';
import { PredictionService } from './predictionService.js';

const PMService = (() => {
  'use strict';

  // ── 1. 측정소 기반 PM2.5 (IDW) ────────────────────────────
  function calcStationPM25(stations) {
    if (!stations || !stations.length) return null;
    const valid = stations.filter(s =>
      (s.pollutants?.pm25 ?? s.pm25 ?? s.aqi) != null
    );
    if (!valid.length) return null;

    return idwInterpolate(valid.map(s => ({
      pm25: s.pollutants?.pm25 ?? s.pm25 ?? s.aqi ?? 0,
      distance: s.distance || 1,
    })));
  }

  // ── 2. 위성 PM2.5 추정 ─────────────────────────────────────
  function estimateSatPM25(stationPM, ctx = {}) {
    return PredictionService.estimateSatellite(stationPM, ctx);
  }

  // ── 3. MLR 추정 (AOD 있을 때) ──────────────────────────────
  function estimateMLR(features) {
    return PredictionService.estimateMLR(features);
  }

  // ── 4. ML 모델 예측 (서버사이드 결과) ──────────────────────
  async function getModelPrediction(lat, lon) {
    return PredictionService.getPredictionAt(lat, lon);
  }

  // ── 5. 3소스 통합 ──────────────────────────────────────────
  function integrate(sources) {
    return PredictionService.integrate(sources);
  }

  // ── 6. 등급/행동가이드 ─────────────────────────────────────
  function _getGrade(pm25) {
    const g = getGrade(pm25);
    return {
      label: g.label,
      color: g.color,
      bg: g.bg,
    };
  }

  function getActionGuide(pm25) {
    if (pm25 <= 12) return {
      emoji: '😊', text: 'Air quality is satisfactory. Enjoy outdoor activities!',
      outdoor: true,
    };
    if (pm25 <= 35.5) return {
      emoji: '🙂', text: 'Acceptable. Unusually sensitive people should limit prolonged outdoor exertion.',
      outdoor: true,
    };
    if (pm25 <= 55.5) return {
      emoji: '😷', text: 'Sensitive groups should reduce outdoor exertion. Others OK for short periods.',
      outdoor: false,
    };
    if (pm25 <= 150.5) return {
      emoji: '🚫', text: 'Everyone should reduce prolonged outdoor exertion. Wear N95 mask if outside.',
      outdoor: false,
    };
    return {
      emoji: '⚠️', text: 'Health alert: everyone may experience serious effects. Stay indoors.',
      outdoor: false,
    };
  }

  function getConfidenceLabel(score) {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    calcStationPM25,
    estimateSatPM25,
    estimateMLR,
    getModelPrediction,
    integrate,
    getGrade: _getGrade,
    getActionGuide,
    getConfidenceLabel,
  };
})();

export default PMService;

// 하위 호환성
if (typeof window !== 'undefined') {
  window.PMService = PMService;
}
