/**
 * config.js — AirLens 중앙 설정
 * ──────────────────────────────────────────
 * 모든 파일에서 공유하는 설정을 한 곳에서 관리.
 * 하드코딩 제거 및 유지관리 용이성 확보.
 *
 * ES module + IIFE 양쪽 모두 지원:
 *   - ES module: import { getBasePath } from '../utils/config.js'
 *   - IIFE/script: window.AirLensConfig.getBasePath()
 */

// ── Base Path Detection ─────────────────────────────────────
function _detectBasePath() {
  if (typeof window === 'undefined') return '/data';
  const host = window.location.hostname;
  const path = window.location.pathname;

  // GitHub Pages
  if (host.includes('github.io')) {
    return '/AirLens/app/data';
  }

  // Local dev: /app/index.html → /app/data
  const appIdx = path.indexOf('/app/');
  if (appIdx !== -1) {
    return path.substring(0, appIdx) + '/app/data';
  }

  // Fallback (serve from root)
  return '/data';
}

// Cached base path (computed once)
const _basePath = _detectBasePath();

/** Get data base path (e.g., '/AirLens/app/data' or '/data') */
export function getBasePath() { return _basePath; }

/** Build full URL for a data file */
export function dataUrl(relativePath) {
  return `${_basePath}/${relativePath}`;
}

/** Sub-path helpers */
export function waqiUrl(file)      { return dataUrl(`waqi/${file}`); }
export function openaqUrl(file)    { return dataUrl(`openaq/${file}`); }
export function earthdataUrl(file) { return dataUrl(`earthdata/${file}`); }
export function policyUrl(file)    { return dataUrl(`policy-impact/${file}`); }

// ── PM2.5 Grade System (Single Source of Truth) ──────────────
// US EPA breakpoints, used everywhere: Today, Globe, Policy, services
export const PM25_GRADES = [
  { max: 12,    label: 'Good',                    labelKo: '좋음',     emoji: '😊', color: '#00e400', darkColor: '#10b981', bgClass: 'grade-good',           hex: 0x00e400 },
  { max: 35.5,  label: 'Moderate',                labelKo: '보통',     emoji: '🙂', color: '#ffff00', darkColor: '#f59e0b', bgClass: 'grade-moderate',       hex: 0xffff00 },
  { max: 55.5,  label: 'Unhealthy for Sensitive',  labelKo: '민감군 나쁨', emoji: '😷', color: '#ff7e00', darkColor: '#f97316', bgClass: 'grade-unhealthy',     hex: 0xff7e00 },
  { max: 150.5, label: 'Unhealthy',               labelKo: '나쁨',     emoji: '🚫', color: '#ff0000', darkColor: '#ef4444', bgClass: 'grade-very-unhealthy', hex: 0xff0000 },
  { max: 250.5, label: 'Very Unhealthy',           labelKo: '매우 나쁨', emoji: '🚨', color: '#8f3f97', darkColor: '#a855f7', bgClass: 'grade-very-unhealthy', hex: 0x8f3f97 },
  { max: Infinity, label: 'Hazardous',             labelKo: '위험',     emoji: '☠️', color: '#7e0023', darkColor: '#dc2626', bgClass: 'grade-very-unhealthy', hex: 0x7e0023 },
];

/** Get PM2.5 grade object for a given value */
export function getPM25Grade(pm25) {
  if (pm25 == null || isNaN(pm25)) return { label: 'N/A', color: '#888', bgClass: '', emoji: '❓' };
  for (const g of PM25_GRADES) {
    if (pm25 <= g.max) return g;
  }
  return PM25_GRADES[PM25_GRADES.length - 1];
}

// ── WHO Guidelines ──────────────────────────────────────────
export const WHO_GUIDELINE = {
  pm25_annual: 5,    // µg/m³ (2021)
  pm25_24h:    15,
  pm10_annual: 15,
  pm10_24h:    45,
};

// ── AQI ↔ PM2.5 Conversion (US EPA) ────────────────────────
export function aqiToPm25(aqi) {
  if (aqi <= 50)  return aqi * 0.24;
  if (aqi <= 100) return 12 + (aqi - 50) * 0.47;
  if (aqi <= 150) return 35.5 + (aqi - 100) * 0.40;
  if (aqi <= 200) return 55.5 + (aqi - 150) * 1.90;
  if (aqi <= 300) return 150.5 + (aqi - 200) * 1.00;
  return 250.5 + (aqi - 300) * 1.49;
}

// ── Action Guide (PM2.5 기반) ───────────────────────────────
export function getActionGuide(pm25) {
  if (pm25 == null) return '';
  if (pm25 <= 12)   return '✅ Air quality is excellent. Enjoy outdoor activities freely!';
  if (pm25 <= 35.5) return '😐 Moderate air quality. Sensitive groups should limit prolonged outdoor exertion.';
  if (pm25 <= 55.5) return '😷 Unhealthy for sensitive groups. Wear a mask if you have respiratory conditions.';
  if (pm25 <= 150.5) return '🚫 Unhealthy. Everyone should limit prolonged outdoor activities. Wear KF94/N95 mask.';
  return '☠️ Hazardous! Remain indoors. Use air purifier. Avoid all outdoor activity.';
}

// ── Cache TTLs ──────────────────────────────────────────────
export const CACHE_TTL = {
  stations:   5 * 60 * 1000,    // 5min
  policies:   10 * 60 * 1000,   // 10min
  prediction: 60 * 60 * 1000,   // 1hr
  weather:    60 * 60 * 1000,   // 1hr
  waqi:       6 * 60 * 60 * 1000, // 6hr
};

// ── Data Source Config ──────────────────────────────────────
export const DATA_SOURCES = {
  waqi:      { name: 'WAQI',            ttl: CACHE_TTL.waqi },
  openaq:    { name: 'OpenAQ',          ttl: 7 * 24 * 60 * 60 * 1000 },
  earthdata: { name: 'NASA Earthdata',  ttl: 30 * 24 * 60 * 60 * 1000 },
  openmeteo: { name: 'EU Copernicus',   ttl: CACHE_TTL.weather },
};

// ── ML Model Config ─────────────────────────────────────────
export const ML_CONFIG = {
  mlr_coefficients: {
    intercept: 5.2,
    aod:       40.0,
    pbl:       -0.003,
    rh:        0.18,
    temp:      -0.20,
    elevation: -0.005,
  },
  target_metrics: { r2: 0.6, rmse: 9.0 },
};

// ── Analysis Engine Config ──────────────────────────────────
export const ANALYSIS_CONFIG = {
  // DQSS weights / thresholds
  dqss: {
    badgeThresholds: { high: 75, medium: 50, low: 25 },
    anomalyPenalty: -20,
  },
  // Bayesian Reliability
  bayesian: {
    defaultAlpha: 5,
    defaultBeta: 3,
    tau: 8.0,           // µg/m³ residual threshold
    decayFactor: 0.995,
  },
  // AOD correction
  aod: {
    baseCoeff: 120,
    hygroscopicGamma: 0.38,
    pblhRef: 1500,      // m
  },
  // GTWR bandwidths
  gtwr: {
    spatialBandwidth: 100,  // km
    temporalBandwidth: 24,  // hours
  },
  // Anomaly detection
  anomaly: {
    zScoreThreshold: 3.0,
    madThreshold: 3.5,
    isolationForest: { nTrees: 50, maxSamples: 256, contamination: 0.03 },
  },
  // H3 spatial indexing
  h3: {
    defaultResolution: 5,   // ~8.5km edge
    globeResolution: 4,     // ~22.6km edge (for globe view)
  },
  // Policy analysis (SCM)
  policy: {
    minPreYears: 3,
    minDonors: 2,
    placeboAlpha: 0.1,
    maxDonors: 10,
  },
};

// ── Tailwind Config (shared across all pages) ───────────────
export const TAILWIND_CONFIG = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#25e2f4',
        'bg-dark': '#102122',
        'background-light': '#f5f8f8',
        'background-dark': '#102122',
      },
    },
  },
};

// ── Expose to window for IIFE scripts ───────────────────────
if (typeof window !== 'undefined') {
  window.AirLensConfig = {
    getBasePath,
    dataUrl,
    waqiUrl,
    openaqUrl,
    earthdataUrl,
    policyUrl,
    PM25_GRADES,
    getPM25Grade,
    getActionGuide,
    WHO_GUIDELINE,
    aqiToPm25,
    CACHE_TTL,
    DATA_SOURCES,
    ML_CONFIG,
    ANALYSIS_CONFIG,
    TAILWIND_CONFIG,
  };
}
