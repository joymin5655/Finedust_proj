/**
 * globe/globe-data.js — Globe 데이터 로딩 모듈
 * ──────────────────────────────────────────────
 * PRD v1.5 §3, ML Spec §2 기반
 *
 * Responsibilities:
 *  - Country policies JSON 로드
 *  - PM2.5 station 데이터 (WAQI → Open-Meteo fallback)
 *  - Policy impact 데이터 병합
 *  - 예측 그리드 로드
 *  - 통합 통계 계산
 */

import { DataService } from '../services/dataService.js';
import { PredictionService } from '../services/predictionService.js';

// ── Country Policies 로드 ──────────────────────────────────
export async function loadCountryPolicies() {
  return DataService.loadCountryPolicies();
}

// ── PM2.5 데이터 로드 (WAQI 우선 → Open-Meteo fallback) ────
export async function loadPM25Data() {
  console.log('🌍 [globe-data] Loading PM2.5 data...');

  // 1차: WAQI JSON (GitHub Actions 수집)
  try {
    const stations = await DataService.loadStations();
    if (stations && stations.size > 0) {
      console.log(`✅ [globe-data] ${stations.size} cities from WAQI JSON`);
      return stations;
    }
  } catch (e) {
    console.warn('⚠️ [globe-data] WAQI load failed:', e.message);
  }

  // 2차: Open-Meteo (무료, 토큰 불필요)
  console.log('🔄 [globe-data] Falling back to Open-Meteo...');
  return loadPM25FromOpenMeteo();
}

// ── Open-Meteo Fallback ──────────────────────────────────────
async function loadPM25FromOpenMeteo() {
  let cities = [];

  // major-cities.json 로드 시도
  try {
    const basePath = DataService._basePath || '/data';
    const res = await fetch(`${basePath}/major-cities.json`);
    if (res.ok) cities = await res.json();
  } catch (e) {
    console.warn('⚠️ major-cities.json load failed');
  }

  // 최소 fallback
  if (cities.length === 0) {
    cities = FALLBACK_CITIES;
  }

  const pm25Data = new Map();
  let success = 0;

  for (const city of cities) {
    try {
      const aq = await DataService.fetchAirQualityForCity(city.lat, city.lon);
      if (aq && (aq.pm2_5 != null || aq.us_aqi != null)) {
        pm25Data.set(city.name, {
          id: city.name,
          name: city.name,
          lat: city.lat, lon: city.lon,
          latitude: city.lat, longitude: city.lon,
          pm25: aq.pm2_5 || 0,
          aqi: aq.us_aqi || 0,
          country: city.country,
          source: 'EU Copernicus CAMS',
          lastUpdated: new Date().toISOString(),
        });
        success++;
      }
      // API 부담 감소
      await new Promise(r => setTimeout(r, 50));
    } catch (e) { /* skip */ }
  }

  console.log(`✅ [globe-data] Open-Meteo: ${success}/${cities.length} cities loaded`);
  return pm25Data;
}

// ── Policy Impact 데이터 로드 및 병합 ────────────────────────
export async function loadAndMergePolicyImpact(countryPolicies) {
  try {
    const index = await DataService.loadPolicyIndex();
    if (!index || !index.countries) return countryPolicies;

    for (const countryInfo of index.countries) {
      const data = await DataService.loadCountryImpact(countryInfo.dataFile);
      if (!data) continue;

      const name = data.country;
      const existing = countryPolicies[name];

      if (existing && data.policies?.length > 0) {
        existing.policyImpactData = {
          policies: data.policies,
          realTimeData: data.realTimeData,
          news: data.news,
        };
        if (data.realTimeData) {
          existing.currentAQI = data.realTimeData.aqi || existing.currentAQI;
          existing.currentPM25 = data.realTimeData.currentPM25 || existing.currentPM25;
        }
        if (data.news?.length > 0) existing.news = data.news;
      } else if (!existing && data.policies?.length > 0) {
        const mainPolicy = data.policies[0];
        const rt = data.realTimeData || {};
        countryPolicies[name] = {
          flag: data.flag || '🌍',
          region: data.region || 'Unknown',
          policyType: mainPolicy.type || 'Air Quality Policy',
          mainPolicy: {
            name: mainPolicy.name,
            description: mainPolicy.description,
            implementationDate: mainPolicy.implementationDate,
            effectivenessRating: calcEffectivenessRating(mainPolicy.impact),
          },
          news: data.news || [],
          currentAQI: rt.aqi || 0,
          currentPM25: rt.currentPM25 || 0,
          policyImpactData: { policies: data.policies, realTimeData: data.realTimeData, news: data.news },
        };
      }
    }

    return countryPolicies;
  } catch (e) {
    console.warn('⚠️ [globe-data] Policy impact load failed:', e.message);
    return countryPolicies;
  }
}

// ── 통합 통계 계산 ───────────────────────────────────────────
export async function computeUnifiedStats(countryPolicies) {
  const policyCountries = countryPolicies ? Object.keys(countryPolicies) : [];
  const policyRegions = new Set();
  let policyCount = 0;

  policyCountries.forEach(country => {
    const p = countryPolicies[country];
    if (p?.region) policyRegions.add(p.region);
    if (p?.mainPolicy) policyCount++;
  });

  // index.json 보강
  let indexCountries = 0, indexPolicies = 0, indexRegions = [];
  try {
    const index = await DataService.loadPolicyIndex();
    if (index) {
      indexCountries = index.countries?.length || 0;
      indexPolicies = index.statistics?.totalPolicies || 0;
      indexRegions = index.statistics?.regionsRepresented || [];
    }
  } catch (_) {}

  // WAQI cities
  let waqiCities = 0;
  try {
    const stations = DataService.getStations();
    waqiCities = stations.size;
  } catch (_) {}

  const allRegions = new Set([...policyRegions, ...indexRegions]);

  return {
    countries: Math.max(policyCountries.length, indexCountries),
    policies: Math.max(policyCount, indexPolicies),
    regions: allRegions.size,
    cities: waqiCities,
    regionList: Array.from(allRegions),
  };
}

// ── Helpers ──────────────────────────────────────────────────
function calcEffectivenessRating(impact) {
  if (!impact?.analysis) return 5;
  const pct = impact.analysis.percentChange;
  const sig = impact.analysis.significant;
  if (pct <= -30) return sig ? 10 : 9;
  if (pct <= -20) return sig ? 9 : 8;
  if (pct <= -10) return sig ? 8 : 7;
  if (pct < 0)    return sig ? 7 : 6;
  if (pct < 10)   return sig ? 5 : 4;
  if (pct < 20)   return sig ? 4 : 3;
  return sig ? 3 : 2;
}

// ── 최소 Fallback 도시 목록 ─────────────────────────────────
const FALLBACK_CITIES = [
  { name: 'Seoul', lat: 37.5665, lon: 126.978, country: 'South Korea' },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
  { name: 'Delhi', lat: 28.6139, lon: 77.209, country: 'India' },
  { name: 'New York', lat: 40.7128, lon: -74.006, country: 'United States' },
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt' },
  { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
];
