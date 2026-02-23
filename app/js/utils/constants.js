/**
 * constants.js — AirLens 공통 상수
 * ─────────────────────────────────
 * PRD v1.5 §4, ML Spec §2.2 기반
 * 모든 페이지/모듈에서 공유하는 상수 정의
 */

// ── PM2.5 등급 기준 (US EPA) ────────────────────────────────
export const PM25_GRADES = [
  { max: 12,    label: 'Good',                    color: '#00e400', bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' },
  { max: 35.5,  label: 'Moderate',                color: '#ffff00', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
  { max: 55.5,  label: 'Unhealthy for Sensitive',  color: '#ff7e00', bg: 'linear-gradient(135deg,#ffedd5,#fed7aa)' },
  { max: 150.5, label: 'Unhealthy',               color: '#ff0000', bg: 'linear-gradient(135deg,#fee2e2,#fecaca)' },
  { max: 250.5, label: 'Very Unhealthy',           color: '#8f3f97', bg: 'linear-gradient(135deg,#f3e8ff,#e9d5ff)' },
  { max: Infinity, label: 'Hazardous',             color: '#7e0023', bg: 'linear-gradient(135deg,#fce4ec,#f8bbd0)' },
];

// WHO 연평균 기준선 (PRD §4 MVP)
export const WHO_GUIDELINE = {
  pm25_annual: 5,    // µg/m³ (2021 guidelines)
  pm25_24h:    15,   // µg/m³
  pm10_annual: 15,
  pm10_24h:    45,
};

// ── AQI 색상 (Globe 마커용) ─────────────────────────────────
export const AQI_COLORS = {
  good:       0x00e400,
  moderate:   0xffff00,
  unhealthy1: 0xff7e00,
  unhealthy2: 0xff0000,
  veryUnhealthy: 0x8f3f97,
  hazardous:  0x7e0023,
};

// ── 데이터 소스 설정 ────────────────────────────────────────
export const DATA_SOURCES = {
  waqi:      { name: 'WAQI',            ttl: 6 * 60 * 60 * 1000 },  // 6h
  openaq:    { name: 'OpenAQ',          ttl: 7 * 24 * 60 * 60 * 1000 },  // 1w
  earthdata: { name: 'NASA Earthdata',  ttl: 30 * 24 * 60 * 60 * 1000 }, // 1m
  openmeteo: { name: 'EU Copernicus',   ttl: 60 * 60 * 1000 },  // 1h
};

// ── ML 모델 설정 (ML Spec §2) ───────────────────────────────
export const ML_CONFIG = {
  // AOD + Weather → PM2.5 MLR 계수 (ML Spec §2.4)
  mlr_coefficients: {
    intercept: 5.2,
    aod:       40.0,
    pbl:       -0.003,
    rh:        0.18,
    temp:      -0.20,
    elevation: -0.005,
  },
  // 필수 입력 피처 (ML Spec §2.2)
  required_features: [
    'aod', 'temperature', 'relative_humidity', 'wind_speed',
    'latitude', 'longitude', 'month', 'elevation',
    'station_density', 'coverage_ratio',
  ],
  // 타깃 성능 (ML Spec §2.5)
  target_metrics: {
    r2:   0.6,
    rmse: 9.0,  // µg/m³
  },
  // 예측 JSON 포맷 (ML Spec §2.6)
  prediction_schema: {
    lat: 'number', lon: 'number', date: 'string',
    predicted_pm25: 'number', uncertainty_rmse: 'number',
    coverage_score: 'number',
  },
};

// ── 캐시 TTL ────────────────────────────────────────────────
export const CACHE_TTL = {
  stations:   5 * 60 * 1000,   // 5분
  policies:   10 * 60 * 1000,  // 10분
  prediction: 60 * 60 * 1000,  // 1시간
};

// ── API 베이스 URL 자동 감지 ────────────────────────────────
export function getDataBasePath() {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('github.io')) {
      return '/Finedust_proj/app/data';
    }
    return window.location.origin + '/data';
  }
  return '/data';
}
