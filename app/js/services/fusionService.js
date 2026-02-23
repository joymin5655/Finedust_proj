/**
 * fusionService.js — 통합 데이터 Aggregator
 * ──────────────────────────────────────────────
 * PRD v2.0 §6: Data Harmonization (fusion.service)
 *
 * 역할:
 *   1. OpenAQ + WAQI + Open-Meteo를 단일 인터페이스로 통합
 *   2. 소스 간 중복 제거 (같은 도시/좌표 → 우선순위 기반 선택)
 *   3. 데이터 품질 점수(DQSS-lite) 부착
 *   4. 캐싱 + TTL 관리
 *   5. 정적 JSON API 인터페이스 제공 (/api/air-quality 시뮬레이션)
 *
 * 의존:
 *   - dataService.js (하위 소스별 fetch)
 *   - constants.js (basePath, TTL)
 */

import { DataService } from './dataService.module.js';
import { getDataBasePath, CACHE_TTL } from '../utils/constants.js';

class _FusionService {
  constructor() {
    this._fused = new Map();       // city/stationId → fused record
    this._lastFusion = 0;
    this._fusionTTL = 5 * 60_000;  // 5분
    this._basePath = getDataBasePath();
  }

  // ── 핵심: 통합 데이터 생성 ──────────────────────────────────
  async fuse({ forceRefresh = false } = {}) {
    if (!forceRefresh && this._fused.size > 0 && (Date.now() - this._lastFusion < this._fusionTTL)) {
      return this._fused;
    }

    console.log('[FusionService] Starting data fusion...');
    const fused = new Map();

    // 1. WAQI stations (우선순위 1: 가장 신뢰, 실시간)
    try {
      const stations = await DataService.loadStations();
      if (stations?.size > 0) {
        for (const [id, s] of stations) {
          const key = this._normalizeKey(s.name || id, s.lat, s.lon);
          fused.set(key, {
            id: key,
            name: s.name || s.city || id,
            lat: s.lat, lon: s.lon,
            pm25: s.pm25 ?? null,
            aqi: s.aqi ?? null,
            source: 'WAQI',
            sourceCount: 1,
            lastUpdated: s.lastUpdated || new Date().toISOString(),
            dqss: this._computeDQSS(s),
          });
        }
        console.log(`[FusionService] WAQI: ${stations.size} stations`);
      }
    } catch (e) {
      console.warn('[FusionService] WAQI load failed:', e.message);
    }

    // 2. OpenAQ yearly trends (보조: 시계열 풍부)
    try {
      const openaqData = await DataService.loadYearlyTrends();
      if (openaqData?.data) {
        for (const entry of openaqData.data) {
          const key = this._normalizeKey(entry.city, entry.lat, entry.lon);
          const existing = fused.get(key);
          if (existing) {
            // Merge: add source, cross-check
            existing.sourceCount++;
            existing.openaqTrend = entry.data;
            existing.dqss = Math.min(1, existing.dqss + 0.1); // cross-source bonus
          } else {
            // Latest year value
            const latest = entry.data?.[entry.data.length - 1];
            fused.set(key, {
              id: key, name: entry.city,
              lat: entry.lat, lon: entry.lon,
              pm25: latest?.pm25_avg ?? null,
              aqi: null, source: 'OpenAQ',
              sourceCount: 1,
              lastUpdated: latest?.year ? `${latest.year}-12-31` : null,
              openaqTrend: entry.data,
              dqss: 0.6,
            });
          }
        }
        console.log(`[FusionService] OpenAQ: ${openaqData.data.length} cities merged`);
      }
    } catch (e) {
      console.warn('[FusionService] OpenAQ load failed:', e.message);
    }

    // 3. AOD samples (위성 보조)
    try {
      const aodData = await DataService.loadAodSamples();
      if (aodData?.samples) {
        for (const sample of aodData.samples) {
          const key = this._normalizeKey(null, sample.lat, sample.lon);
          const existing = fused.get(key);
          if (existing) {
            existing.aod = sample.aod;
            existing.sourceCount++;
          }
          // AOD-only points는 현재 무시 (PM2.5 예측 모델 필요)
        }
        console.log(`[FusionService] AOD: ${aodData.samples.length} points checked`);
      }
    } catch (e) { /* AOD는 선택적 */ }

    this._fused = fused;
    this._lastFusion = Date.now();
    console.log(`[FusionService] ✅ Fused total: ${fused.size} unique locations`);
    return fused;
  }

  // ── 정적 API 시뮬레이션 ────────────────────────────────────
  // /api/air-quality?lat=&lon= 형태의 인터페이스 제공
  async getAirQuality({ lat, lon, city, country } = {}) {
    const fused = await this.fuse();

    if (city) {
      // 이름 검색
      for (const [, record] of fused) {
        if (record.name?.toLowerCase() === city.toLowerCase()) return this._formatResponse(record);
      }
    }

    if (lat != null && lon != null) {
      // 가장 가까운 스테이션 찾기
      let nearest = null, minDist = Infinity;
      for (const [, record] of fused) {
        const dist = this._haversine(lat, lon, record.lat, record.lon);
        if (dist < minDist) { minDist = dist; nearest = record; }
      }
      if (nearest && minDist < 100) { // 100km 이내
        return this._formatResponse(nearest, minDist);
      }
    }

    return null;
  }

  // /api/country-summary?country=KR
  async getCountrySummary(countryCode) {
    try {
      const impact = await DataService.loadCountryImpact(`${countryCode.toLowerCase()}.json`);
      if (impact) return impact;

      const policies = await DataService.loadCountryPolicies();
      // Search by code in policies
      for (const [name, data] of Object.entries(policies)) {
        if (data.countryCode === countryCode) {
          return { country: countryCode, name, ...data };
        }
      }
    } catch (e) { console.warn('[FusionService] country summary failed:', e.message); }
    return null;
  }

  // ── DQSS-lite (간이 데이터 품질 점수) ──────────────────────
  _computeDQSS(record) {
    let score = 0.5; // base

    // Freshness: 최근 1시간 이내 → 높은 점수
    if (record.lastUpdated) {
      const age = (Date.now() - new Date(record.lastUpdated).getTime()) / 3600_000;
      if (age <= 1) score += 0.25;
      else if (age <= 6) score += 0.15;
      else if (age <= 24) score += 0.05;
    }

    // PM2.5 존재 여부
    if (record.pm25 != null && record.pm25 >= 0) score += 0.15;

    // AQI 존재 여부
    if (record.aqi != null && record.aqi >= 0) score += 0.1;

    return Math.min(1.0, score);
  }

  // ── Helpers ────────────────────────────────────────────────
  _normalizeKey(name, lat, lon) {
    // 같은 좌표(소수 2자리) → 같은 키
    if (lat != null && lon != null) {
      const latR = Math.round(lat * 100) / 100;
      const lonR = Math.round(lon * 100) / 100;
      return `${latR}_${lonR}`;
    }
    return name?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
  }

  _haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  _formatResponse(record, distance = null) {
    return {
      location: { lat: record.lat, lon: record.lon },
      nearest_station: record.name,
      pm25: record.pm25,
      aqi: record.aqi,
      source: record.source,
      timestamp: record.lastUpdated,
      data_quality_score: Math.round(record.dqss * 100),
      quality_badge: record.dqss >= 0.8 ? 'High' : record.dqss >= 0.6 ? 'Medium' : 'Low',
      distance_km: distance ? Math.round(distance) : null,
      source_count: record.sourceCount
    };
  }

  // ── Public getters ─────────────────────────────────────────
  getFused() { return this._fused; }
  getSize() { return this._fused.size; }
  clearCache() { this._fused.clear(); this._lastFusion = 0; }
}

// 싱글턴 export
export const FusionService = new _FusionService();

if (typeof window !== 'undefined') {
  window.FusionService = FusionService;
}
