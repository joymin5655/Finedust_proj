/**
 * waqi-data-service.js — Backward-compatible wrapper
 * ────────────────────────────────────────────────────
 * This file wraps the new DataService / StationService so
 * that existing code (globe.js etc.) that still imports
 * WAQIDataService continues to work without modification.
 *
 * New code should use DataService + StationService directly.
 */

import { globalDataService } from './shared-data-service.js';

export class WAQIDataService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000;
  }

  // ── Public surface (delegating to window.DataService) ────────

  async loadWAQIData() {
    const KEY = 'waqi-latest';
    if (this._isFresh(KEY)) return this.cache.get(KEY).data;

    try {
      // Prefer the new DataService if loaded
      const raw = window.DataService
        ? await window.DataService.loadStations()
        : await this._fetchDirect();

      const stationsMap = this._processRaw(raw);
      this._set(KEY, stationsMap);
      globalDataService.setStations(stationsMap);
      return stationsMap;
    } catch (err) {
      console.error('WAQIDataService.loadWAQIData failed:', err);
      return new Map();
    }
  }

  async _fetchDirect() {
    const base = window.AirLensConfig?.getBasePath?.() || '/data';
    const res = await fetch(`${base}/waqi/latest.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  _processRaw(data) {
    const map = new Map();
    (data.cities || []).forEach(city => {
      const id  = city.city || city.location?.name || 'unknown';
      const geo = city.location?.geo || [0, 0];
      map.set(id, {
        id, name: city.location?.name || id,
        city: id,
        lat: geo[0], lon: geo[1],
        latitude: geo[0], longitude: geo[1],
        aqi:  city.aqi || 0,
        pm25: city.pollutants?.pm25 ?? city.aqi ?? 0,
        pm10: city.pollutants?.pm10 ?? null,
        dominentpol: city.dominentpol || 'pm25',
        source: 'WAQI',
        url: city.location?.url || '',
        weather:     city.weather     || {},
        pollutants:  city.pollutants  || {},
        lastUpdated: city.time?.s || data.updated_at || new Date().toISOString()
      });
    });
    return map;
  }

  _isFresh(key) {
    const e = this.cache.get(key);
    return e && (Date.now() - e.ts) < this.cacheExpiry;
  }
  _set(key, data) { this.cache.set(key, { data, ts: Date.now() }); }

  clearCache() { this.cache.clear(); }
}

export const waqiDataService = new WAQIDataService();
