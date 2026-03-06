/**
 * earthdataService.js — NASA Earthdata AOD 데이터 서비스
 * ────────────────────────────────────────────────────────
 * GitHub Actions가 생성한 app/data/earthdata/*.json 을 읽어
 * Globe·Policy 페이지에서 AOD 시각화에 사용
 */

import { earthdataUrl, getBasePath } from '../utils/config.js';

const BASE = getBasePath() + '/earthdata';

let _cache = {};

async function _load(file) {
  if (_cache[file]) return _cache[file];
  try {
    const res = await fetch(`${BASE}/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _cache[file] = await res.json();
    return _cache[file];
  } catch (e) {
    console.warn(`[earthdataService] Failed to load ${file}:`, e.message);
    return null;
  }
}

/** AOD 샘플 (도시별) */
export async function loadAodSamples() {
  return _load('aod_samples.json');
}

/** AOD 트렌드 요약 */
export async function loadAodTrend() {
  return _load('aod_trend.json');
}

/**
 * 특정 도시의 AOD 정보
 * @param {string} city
 * @returns {{city, aod_annual_avg, trend, timeseries} | null}
 */
export async function getCityAod(city) {
  const data = await loadAodSamples();
  if (!data) return null;
  return data.cities?.find(c =>
    c.city.toLowerCase() === city.toLowerCase()
  ) || null;
}

/**
 * 전체 도시 AOD 요약 (Globe용)
 * @returns {Array<{city, lat, lon, aod, trend}>}
 */
export async function getAllAodPoints() {
  const data = await loadAodTrend();
  if (!data) return [];
  return (data.data || []).map(d => ({
    city:    d.city,
    country: d.country,
    lat:     d.lat,
    lon:     d.lon,
    aod:     d.aod,
    trend:   d.trend,
  }));
}

/**
 * AOD 값 → 색상 코드 반환
 * (낮을수록 파랑, 높을수록 빨강)
 */
export function aodToColor(aod) {
  if (aod === null || aod === undefined) return '#888888';
  if (aod < 0.1)  return '#00e5ff';   // 매우 낮음
  if (aod < 0.2)  return '#69f0ae';   // 낮음
  if (aod < 0.35) return '#ffff00';   // 보통
  if (aod < 0.5)  return '#ff9800';   // 높음
  return '#f44336';                    // 매우 높음
}

/**
 * AOD 값 → 텍스트 설명
 */
export function aodToLabel(aod) {
  if (aod === null || aod === undefined) return 'N/A';
  if (aod < 0.1)  return 'Very Low';
  if (aod < 0.2)  return 'Low';
  if (aod < 0.35) return 'Moderate';
  if (aod < 0.5)  return 'High';
  return 'Very High';
}

export default {
  loadAodSamples,
  loadAodTrend,
  getCityAod,
  getAllAodPoints,
  aodToColor,
  aodToLabel,
};
