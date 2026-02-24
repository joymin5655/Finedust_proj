/**
 * waqiService.js — WAQI 실시간 데이터 서비스 (프론트엔드용)
 * ────────────────────────────────────────────────────────────
 * GitHub Actions가 생성한 app/data/waqi/*.json 을 읽어
 * Today·Globe 페이지에 실시간 AQI 데이터를 제공
 *
 * ⚠️  이 파일은 토큰을 사용하지 않음 — 오직 Actions가 만든 JSON만 fetch
 */

import { waqiUrl, getBasePath } from '../utils/config.js';

const BASE = getBasePath() + '/waqi';

let _cache = {};

async function _load(file) {
  if (_cache[file]) return _cache[file];
  try {
    const res = await fetch(`${BASE}/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _cache[file] = await res.json();
    return _cache[file];
  } catch (e) {
    console.warn(`[waqiService] Failed to load ${file}:`, e.message);
    return null;
  }
}

/** 최신 도시별 WAQI 데이터 로드 */
export async function loadWaqiLatest() {
  return _load('latest.json');
}

/** 전 세계 측정소 데이터 로드 (Globe용) */
export async function loadGlobalStations() {
  return _load('global-stations.json');
}

/** 통계 파일 로드 */
export async function loadStats() {
  return _load('stats.json');
}

/**
 * 좌표 기준 가장 가까운 WAQI 도시 반환
 * @param {number} lat
 * @param {number} lon
 * @returns {{aqi, city, pollutants, weather, location} | null}
 */
export async function findNearestCity(lat, lon) {
  const data = await loadWaqiLatest();
  if (!data?.cities?.length) return null;

  let best = null, bestDist = Infinity;
  for (const c of data.cities) {
    const geo = c.location?.geo;
    if (!geo || geo[0] == null || geo[1] == null) continue;
    const d = (lat - geo[0]) ** 2 + (lon - geo[1]) ** 2;
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best;
}

/**
 * 특정 도시명으로 WAQI 데이터 검색
 * @param {string} cityName  e.g. "seoul", "tokyo"
 * @returns {object | null}
 */
export async function getCityData(cityName) {
  const data = await loadWaqiLatest();
  if (!data?.cities?.length) return null;
  const lower = cityName.toLowerCase();
  return data.cities.find(c =>
    c.city?.toLowerCase() === lower ||
    c.location?.name?.toLowerCase().includes(lower)
  ) || null;
}

/**
 * AQI 수치 → 등급 정보 반환
 * @param {number} aqi
 * @returns {{ label, color, bg, guide, emoji }}
 */
export function getAqiInfo(aqi) {
  if (aqi == null || isNaN(aqi)) return {
    label: 'N/A', color: '#888', bg: 'rgba(128,128,128,0.1)',
    guide: 'No data available.', emoji: '❓'
  };
  if (aqi <= 50)  return {
    label: 'Good',
    color: '#00e400', bg: 'rgba(0,228,64,0.1)',
    guide: '✅ Air quality is Good. Enjoy outdoor activities freely.', emoji: '😊'
  };
  if (aqi <= 100) return {
    label: 'Moderate',
    color: '#ffff00', bg: 'rgba(255,255,0,0.1)',
    guide: '😐 Moderate air quality. Unusually sensitive people should limit outdoor exertion.', emoji: '😐'
  };
  if (aqi <= 150) return {
    label: 'Unhealthy (Sensitive)',
    color: '#ff7e00', bg: 'rgba(255,126,0,0.1)',
    guide: '⚠️ Unhealthy for sensitive groups. Wear a mask if you have respiratory conditions.', emoji: '😷'
  };
  if (aqi <= 200) return {
    label: 'Unhealthy',
    color: '#ff0000', bg: 'rgba(255,0,0,0.1)',
    guide: '🚫 Unhealthy. Everyone should limit prolonged outdoor activities.', emoji: '🚫'
  };
  if (aqi <= 300) return {
    label: 'Very Unhealthy',
    color: '#8f3f97', bg: 'rgba(143,63,151,0.1)',
    guide: '🚨 Very Unhealthy. Avoid outdoor activities. Stay indoors.', emoji: '🚨'
  };
  return {
    label: 'Hazardous',
    color: '#7e0023', bg: 'rgba(126,0,35,0.1)',
    guide: '☠️ Hazardous! Remain indoors and use an air purifier.', emoji: '☠️'
  };
}

/**
 * 모든 도시 데이터를 Globe 마커용 포맷으로 반환
 * @returns {Array<{city, aqi, lat, lon, color}>}
 */
export async function getAllCitiesForGlobe() {
  const data = await loadWaqiLatest();
  if (!data?.cities?.length) return [];

  return data.cities
    .filter(c => c.location?.geo && c.aqi != null)
    .map(c => {
      const info = getAqiInfo(c.aqi);
      return {
        city:    c.city || c.location?.name || 'Unknown',
        aqi:     c.aqi,
        lat:     c.location.geo[0],
        lon:     c.location.geo[1],
        pm25:    c.pollutants?.pm25,
        pm10:    c.pollutants?.pm10,
        color:   info.color,
        label:   info.label,
        emoji:   info.emoji,
        time:    c.time?.s,
      };
    });
}

/**
 * 캐시 초기화 (강제 새로고침 시 사용)
 */
export function clearCache() {
  _cache = {};
}

export default {
  loadWaqiLatest,
  loadGlobalStations,
  loadStats,
  findNearestCity,
  getCityData,
  getAqiInfo,
  getAllCitiesForGlobe,
  clearCache,
};
