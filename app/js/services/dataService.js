/**
 * dataService.js — 통합 데이터 서비스 (리팩토링)
 * ────────────────────────────────────────────────
 * PRD v1.5 §3 기반: 단일 진입점으로 모든 데이터 소스 관리
 *
 * 기존 파일 통합:
 *   - waqi-data-service.js → loadStations()
 *   - openaqService.js → loadYearlyTrends()
 *   - earthdataService.js → loadAodData()
 *   - policy-data-service.js → loadPolicies()
 *   - shared-data-service.js → subscribe/notify
 *
 * 새로운 파일에서도 하위 호환성 유지:
 *   import { DataService } from './services/dataService.js';
 */

import { getDataBasePath, CACHE_TTL, DATA_SOURCES } from '../utils/constants.js';

class _DataService {
  constructor() {
    this._cache = new Map();
    this._subscribers = new Map();
    this._basePath = getDataBasePath();
  }

  // ── Cache Layer ─────────────────────────────────────────────
  _isFresh(key, ttl) {
    const entry = this._cache.get(key);
    return entry && (Date.now() - entry.ts < ttl);
  }
  _set(key, data) { this._cache.set(key, { data, ts: Date.now() }); }
  _get(key) { return this._cache.get(key)?.data ?? null; }
  clearCache() { this._cache.clear(); }

  // ── Pub/Sub ─────────────────────────────────────────────────
  subscribe(event, fn) {
    if (!this._subscribers.has(event)) this._subscribers.set(event, new Set());
    this._subscribers.get(event).add(fn);
    return () => this._subscribers.get(event)?.delete(fn);
  }
  _notify(event, data) {
    (this._subscribers.get(event) || []).forEach(fn => {
      try { fn(data, event); } catch (e) { console.error(`[DataService] subscriber error (${event}):`, e); }
    });
  }

  // ── Fetch helper ────────────────────────────────────────────
  async _fetch(path) {
    const url = `${this._basePath}/${path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return res.json();
  }

  // ── 1. Stations (WAQI) ─────────────────────────────────────
  async loadStations() {
    const KEY = 'stations';
    if (this._isFresh(KEY, CACHE_TTL.stations)) return this._get(KEY);

    try {
      const raw = await this._fetch('waqi/latest.json');
      const map = new Map();

      (raw.cities || []).forEach(city => {
        const id = city.city || city.location?.name || 'unknown';
        const geo = city.location?.geo || [0, 0];
        map.set(id, {
          id, name: city.location?.name || id, city: id,
          lat: geo[0], lon: geo[1],
          latitude: geo[0], longitude: geo[1],
          aqi:  city.aqi || 0,
          pm25: city.pollutants?.pm25 ?? city.aqi ?? 0,
          pm10: city.pollutants?.pm10 ?? null,
          dominentpol: city.dominentpol || 'pm25',
          source: 'WAQI',
          url: city.location?.url || '',
          weather:    city.weather    || {},
          pollutants: city.pollutants || {},
          lastUpdated: city.time?.s || raw.updated_at || new Date().toISOString(),
        });
      });

      this._set(KEY, map);
      this._notify('stations', map);
      console.log(`✅ [DataService] Loaded ${map.size} stations`);
      return map;
    } catch (e) {
      console.warn('[DataService] stations load failed:', e.message);
      return this._get(KEY) || new Map();
    }
  }

  getStations() { return this._get('stations') || new Map(); }

  // ── 2. Global Stations (WAQI full list) ────────────────────
  async loadGlobalStations() {
    const KEY = 'global-stations';
    if (this._isFresh(KEY, CACHE_TTL.stations)) return this._get(KEY);

    try {
      const data = await this._fetch('waqi/global-stations.json');
      this._set(KEY, data);
      return data;
    } catch (e) {
      console.warn('[DataService] global-stations failed:', e.message);
      return this._get(KEY) || { stations: [], count: 0 };
    }
  }

  // ── 3. OpenAQ Yearly Trends ────────────────────────────────
  async loadYearlyTrends() {
    const KEY = 'openaq-years';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return this._get(KEY);

    try {
      const data = await this._fetch('openaq/pm25_years.json');
      this._set(KEY, data);
      return data;
    } catch (e) {
      console.warn('[DataService] openaq years failed:', e.message);
      return this._get(KEY);
    }
  }

  async getCityYearlyTrend(city, country = null) {
    const data = await this.loadYearlyTrends();
    if (!data) return [];
    const entry = data.data?.find(d =>
      d.city.toLowerCase() === city.toLowerCase() &&
      (!country || d.country === country)
    );
    return entry?.data || [];
  }

  // ── 4. OpenAQ Daily Trends ─────────────────────────────────
  async loadDailyTrends() {
    const KEY = 'openaq-days';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return this._get(KEY);

    try {
      const data = await this._fetch('openaq/pm25_days.json');
      this._set(KEY, data);
      return data;
    } catch (e) {
      console.warn('[DataService] openaq days failed:', e.message);
      return this._get(KEY);
    }
  }

  // ── 5. Earthdata AOD ───────────────────────────────────────
  async loadAodSamples() {
    const KEY = 'aod-samples';
    if (this._isFresh(KEY, CACHE_TTL.prediction)) return this._get(KEY);

    try {
      const data = await this._fetch('earthdata/aod_samples.json');
      this._set(KEY, data);
      return data;
    } catch (e) {
      console.warn('[DataService] aod failed:', e.message);
      return this._get(KEY);
    }
  }

  async loadAodTrend() {
    const KEY = 'aod-trend';
    if (this._isFresh(KEY, CACHE_TTL.prediction)) return this._get(KEY);

    try {
      const data = await this._fetch('earthdata/aod_trend.json');
      this._set(KEY, data);
      return data;
    } catch (e) { return this._get(KEY); }
  }

  // ── 6. Country Policies ────────────────────────────────────
  async loadCountryPolicies() {
    const KEY = 'country-policies';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return this._get(KEY);

    try {
      const data = await this._fetch('country-policies.json');
      this._set(KEY, data);
      this._notify('policies', data);
      console.log(`✅ [DataService] Loaded ${Object.keys(data).length} country policies`);
      return data;
    } catch (e) {
      console.warn('[DataService] country-policies failed:', e.message);
      return this._get(KEY) || {};
    }
  }

  // ── 7. Policy Impact (per-country JSON) ────────────────────
  async loadPolicyIndex() {
    const KEY = 'policy-index';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return this._get(KEY);

    try {
      const data = await this._fetch('policy-impact/index.json');
      this._set(KEY, data);
      return data;
    } catch (e) { return this._get(KEY); }
  }

  async loadCountryImpact(dataFile) {
    try {
      return await this._fetch(`policy-impact/${dataFile}`);
    } catch (e) {
      console.warn(`[DataService] impact ${dataFile} failed:`, e.message);
      return null;
    }
  }

  // ── 8. Policies (flat list) ────────────────────────────────
  async loadPoliciesList() {
    const KEY = 'policies-list';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return this._get(KEY);

    try {
      const data = await this._fetch('policies.json');
      this._set(KEY, data);
      return data;
    } catch (e) { return this._get(KEY); }
  }

  // ── 9. Prediction Grid (ML Spec §2.6) ─────────────────────
  // 향후 ML 모델 결과물 로드용
  async loadPredictionGrid() {
    const KEY = 'prediction-grid';
    if (this._isFresh(KEY, CACHE_TTL.prediction)) return this._get(KEY);

    try {
      const data = await this._fetch('predictions/grid_latest.json');
      this._set(KEY, data);
      this._notify('predictions', data);
      return data;
    } catch (e) {
      // 아직 ML 모델 미배포 시 조용히 실패
      return null;
    }
  }

  // ── 10. Weather features (ML Spec §2.2) ────────────────────
  // Open-Meteo에서 기상 데이터 직접 fetch (브라우저용 fallback)
  async fetchWeatherForLocation(lat, lon) {
    try {
      const params = new URLSearchParams({
        latitude: lat, longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure',
        timezone: 'auto',
      });
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.current || null;
    } catch (e) { return null; }
  }

  // ── 11. Open-Meteo Air Quality (fallback PM2.5) ───────────
  async fetchAirQualityForCity(lat, lon) {
    try {
      const params = new URLSearchParams({
        latitude: lat, longitude: lon,
        current: 'pm2_5,pm10,us_aqi',
        timezone: 'auto',
      });
      const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.current || null;
    } catch (e) { return null; }
  }
}

// 싱글턴 인스턴스
export const DataService = new _DataService();

// 하위 호환성: window.DataService
if (typeof window !== 'undefined') {
  window.DataService = DataService;
}
