/**
 * openaqService.js — OpenAQ PM2.5 timeseries 데이터 서비스
 * ──────────────────────────────────────────────────────────
 * GitHub Actions가 생성한 app/data/openaq/*.json 을 읽어
 * Today·Policy 페이지에서 연간/일간 트렌드를 제공
 */

import { openaqUrl, getBasePath } from '../utils/config.js';

const BASE = getBasePath() + '/openaq';

let _cache = {};

async function _load(file) {
  if (_cache[file]) return _cache[file];
  try {
    const res = await fetch(`${BASE}/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _cache[file] = await res.json();
    return _cache[file];
  } catch (e) {
    console.warn(`[openaqService] Failed to load ${file}:`, e.message);
    return null;
  }
}

/** 연평균 데이터 로드 */
export async function loadPm25Years() {
  return _load('pm25_years.json');
}

/** 일평균 데이터 로드 */
export async function loadPm25Days() {
  return _load('pm25_days.json');
}

/** 측정소 목록 */
export async function loadStations() {
  return _load('stations.json');
}

/**
 * 특정 도시의 연평균 시계열 반환
 * @param {string} city  e.g. "Seoul"
 * @param {string} country e.g. "KR"
 * @returns {Array<{year,avg}>}
 */
export async function getCityYearlyTrend(city, country = null) {
  const data = await loadPm25Years();
  if (!data) return [];

  const entry = data.data?.find(d =>
    d.city.toLowerCase() === city.toLowerCase() &&
    (!country || d.country === country)
  );
  return entry?.data || [];
}

/**
 * 특정 도시의 일평균 시계열 반환 (최근 N일)
 * @param {string} city
 * @param {number} days
 * @returns {Array<{date,avg}>}
 */
export async function getCityDailyTrend(city, days = 30) {
  const data = await loadPm25Days();
  if (!data) return [];

  const entry = data.data?.find(d =>
    d.city.toLowerCase() === city.toLowerCase()
  );
  const all = entry?.data || [];
  return all.slice(-days);
}

/**
 * 전체 데이터에서 국가 코드 목록 반환
 */
export async function getAvailableCountries() {
  const data = await loadPm25Years();
  if (!data) return [];
  const set = new Set(data.data?.map(d => d.country) || []);
  return Array.from(set);
}

/**
 * 국가별 최신 평균 PM2.5 (가장 최근 연도)
 */
export async function getCountryLatestPm25(countryCode) {
  const data = await loadPm25Years();
  if (!data) return null;

  const cities = data.data?.filter(d => d.country === countryCode) || [];
  if (!cities.length) return null;

  // 각 도시의 최신 연도 평균 → 전체 평균
  const latestValues = cities.flatMap(c => {
    const sorted = [...(c.data || [])].sort((a, b) =>
      parseInt(b.year) - parseInt(a.year)
    );
    return sorted[0]?.avg ? [sorted[0].avg] : [];
  });

  if (!latestValues.length) return null;
  return Math.round(latestValues.reduce((s, v) => s + v, 0) / latestValues.length * 10) / 10;
}

export default {
  loadPm25Years,
  loadPm25Days,
  loadStations,
  getCityYearlyTrend,
  getCityDailyTrend,
  getAvailableCountries,
  getCountryLatestPm25,
};
