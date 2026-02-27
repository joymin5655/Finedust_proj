/**
 * globe-data.js — Data loading: PM2.5, policies, WAQI, statistics
 * ───────────────────────────────────────────────────────────────
 * v4.1: FusionService 통합 — WAQI+OpenAQ+AOD 데이터를 단일 소스로 사용
 */

import { waqiDataService } from '../services/waqi-data-service.js';
import { FusionService } from '../services/fusionService.js';
import { haversineDistance } from '../utils/geo.js';

export function mixData(Cls) {
  const P = Cls.prototype;

  // ── Background data loading orchestrator ───────────────────
  P.backgroundLoadData = async function () {
    try {
      console.log('📊 Loading background data (parallel)...');
      this.createCountryPolicyMarkers();

      const [pm25Result, policyResult] = await Promise.allSettled([
        this.loadPM25Data(),
        this.loadPoliciesData()
      ]);
      console.log(`✅ PM2.5: ${this.pm25Data.size} stations`);

      if (this.pm25Data.size > 0) {
        await this.createPM25MarkersAsync();
      }

      // ── 레이어 시스템 초기화 (globe-layers.js) ────────────
      if (typeof this.initLayerSystem === 'function') {
        this.initLayerSystem();
        this.setupLayerToggles();
        // 기본 ON 레이어는 즉시 빌드
        await this.buildSatelliteLayer(); // 기본 off지만 미리 빌드 생략 가능
      }

      // ── 인터랙션 강화 초기화 (globe-interaction.js) ────────
      if (typeof this.setupInteractionEnhancements === 'function') {
        this.setupInteractionEnhancements();
      }

      this.setupEventListeners();
      this.setupToggleSwitches();
      this.getUserLocationAndHighlight();

      if (typeof window.GlobeIntegration !== 'undefined') {
        try {
          this.globeIntegration = new window.GlobeIntegration(this.scene, this.camera, this);
          await this.globeIntegration.init();
        } catch (error) {
          console.warn('⚠️ Enhanced visualization:', error.message);
        }
      }

      // Enhancement 초기화 (globe-enhancement.js가 로드되었으면)
      if (typeof this._initEnhancement === 'function') {
        await this._initEnhancement();
      }

      console.log('✅ All background data loaded');
    } catch (error) {
      console.error('⚠️ Background load error:', error);
    }
  };

  // ── Load PM2.5 data (priority: FusionService → WAQI → Open-Meteo) ──
  P.loadPM25Data = async function () {
    console.log('🌍 Loading PM2.5 data...');

    // 1차: FusionService (WAQI + OpenAQ + AOD 통합)
    try {
      const fused = await FusionService.fuse();
      if (fused && fused.size > 0) {
        this.pm25Data = new Map();
        this._fusedData = fused; // 원본 보관 (레이어에서 활용)
        for (const [key, record] of fused) {
          const name = record.name || key;
          this.pm25Data.set(name, {
            lat: record.lat,
            lon: record.lon,
            pm25: record.pm25,
            aqi: record.aqi,
            country: record.country,
            stationName: record.name || name,
            source: record.source || 'Fused',
            lastUpdate: record.lastUpdated,
            dqss: record.dqss,
            sourceCount: record.sourceCount,
            aod: record.aod,
            openaqTrend: record.openaqTrend,
          });
        }
        console.log(`✅ FusionService: ${this.pm25Data.size} locations (${FusionService.getSize()} fused)`);
        return;
      }
    } catch (error) {
      console.warn('⚠️ FusionService failed, falling back:', error.message);
    }

    // 2차: WAQI JSON 직접 로드
    try {
      const waqiData = await waqiDataService.loadWAQIData();
      if (waqiData && waqiData.size > 0) {
        console.log(`✅ Loaded ${waqiData.size} cities from WAQI JSON`);
        this.pm25Data = waqiData;
        return;
      }
    } catch (error) {
      console.warn('⚠️ WAQI JSON load failed:', error.message);
    }

    // 3차: Open-Meteo API 직접 호출
    console.log('🔄 Falling back to Open-Meteo...');
    await this.loadPM25Data_OpenMeteo();
  };

  // ── Open-Meteo fallback ────────────────────────────────────
  P.loadPM25Data_OpenMeteo = async function () {
    let cities = [];
    try {
      const basePath = window.AirLensConfig?.getBasePath?.() || '/data';
      const res = await fetch(`${basePath}/major-cities.json`);
      if (res.ok) cities = await res.json();
    } catch (e) { console.warn('⚠️ Failed to load major-cities.json'); }

    if (cities.length === 0) {
      cities = [
        { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
        { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
        { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'United States' },
        { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom' }
      ];
    }

    console.log(`📍 Fetching data for ${cities.length} cities from EU Copernicus...`);
    this.pm25Data = new Map();
    let successCount = 0;

    for (const city of cities) {
      try {
        const params = new URLSearchParams({
          latitude: city.lat, longitude: city.lon,
          current: 'pm2_5,pm10,us_aqi', timezone: 'auto'
        });
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`;
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();

        if (data.current) {
          const pm25 = data.current.pm2_5 || null;
          const aqi = data.current.us_aqi || null;
          if (pm25 !== null || aqi !== null) {
            this.pm25Data.set(city.name, {
              lat: city.lat, lon: city.lon, pm25, aqi,
              country: city.country, stationName: city.name,
              source: 'EU Copernicus CAMS',
              lastUpdate: new Date().toISOString()
            });
            successCount++;
          }
        }
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`❌ ${city.name}:`, error.message);
      }
    }
    console.log(`✅ Loaded ${successCount} cities from Open-Meteo`);
  };

  // ── WAQI Map Bounds (enhanced, token required) ─────────────
  P.loadPM25Data_WAQI = async function (token) {
    console.log('🚀 Enhanced Mode: WAQI Map Bounds API...');
    this.pm25Data = new Map();
    const regions = [
      { name: 'Asia-Pacific', bounds: [-90, 60, 90, 180] },
      { name: 'Europe-Africa', bounds: [-90, -30, 90, 60] },
      { name: 'Americas', bounds: [-90, -180, 90, -30] }
    ];

    let totalStations = 0;
    for (const region of regions) {
      try {
        const [y1, x1, y2, x2] = region.bounds;
        const url = `https://api.waqi.info/map/bounds/?token=${token}&latlng=${y1},${x1},${y2},${x2}`;
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();

        if (data.status === 'ok' && data.data) {
          data.data.forEach(station => {
            if (station.lat && station.lon && station.aqi) {
              const stationId = station.uid || `${station.lat}_${station.lon}`;
              const aqi = parseFloat(station.aqi);
              const estimatedPM25 = aqi <= 50 ? aqi * 0.24 :
                aqi <= 100 ? 12 + (aqi - 50) * 0.7 :
                aqi <= 150 ? 35.5 + (aqi - 100) * 0.98 :
                aqi <= 200 ? 55.5 + (aqi - 150) * 1.38 :
                150.5 + (aqi - 200) * 2.0;

              this.pm25Data.set(stationId, {
                lat: station.lat, lon: station.lon,
                pm25: estimatedPM25, aqi,
                country: station.country || 'Unknown',
                stationName: station.station?.name || `Station ${stationId}`,
                source: 'WAQI',
                lastUpdate: station.station?.time || new Date().toISOString(),
                uid: station.uid
              });
              totalStations++;
            }
          });
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`❌ ${region.name}:`, error.message);
      }
    }
    console.log(`✅ Enhanced: ${totalStations} WAQI stations loaded`);
  };

  // ── User Location ──────────────────────────────────────────
  P.getUserLocationAndHighlight = async function () {
    if (!('geolocation' in navigator)) return;
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, timeout: 10000, maximumAge: 600000
        });
      });
      this.userLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
      console.log('📍 User location:', this.userLocation);
      this.highlightUserLocation();
    } catch (error) {
      console.log('📍 Location unavailable:', error.message);
    }
  };

  // calculateDistance → geo.js haversineDistance로 통합됨

  P.highlightUserLocation = function () {
    if (!this.userLocation || !this.pm25Data) return;
    let nearestCity = null;
    let minDistance = Infinity;
    this.pm25Data.forEach((data, city) => {
      const distance = haversineDistance(this.userLocation.lat, this.userLocation.lon, data.lat, data.lon);
      if (distance < minDistance) { minDistance = distance; nearestCity = { city, data, distance }; }
    });
    if (nearestCity && nearestCity.distance < 500) {
      console.log(`📍 Nearest: ${nearestCity.city} (${nearestCity.distance.toFixed(0)}km)`);
    }
  };

  // ── Country Policies from JSON ─────────────────────────────
  P.loadCountryPoliciesFromJSON = async function () {
    try {
      const basePath = window.AirLensConfig?.getBasePath?.() || '/data';
      const response = await fetch(`${basePath}/country-policies.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      console.log(`✅ Loaded policies for ${Object.keys(data).length} countries`);
      return data;
    } catch (error) {
      console.error('❌ Failed to load country policies:', error);
      return {};
    }
  };

  // ── Statistics ─────────────────────────────────────────────
  P.updateStatisticsFromCountryPolicies = async function () {
    const policyCountries = this.countryPolicies ? Object.keys(this.countryPolicies) : [];
    const policyRegions = new Set();
    let policyCount = 0;
    policyCountries.forEach(country => {
      const policy = this.countryPolicies[country];
      if (policy?.region) policyRegions.add(policy.region);
      if (policy?.mainPolicy) policyCount++;
    });

    let indexCountries = 0, indexPolicies = 0, indexRegions = [];
    try {
      const response = await fetch('data/policy-impact/index.json');
      if (response.ok) {
        const indexData = await response.json();
        indexCountries = indexData.countries?.length || 0;
        indexPolicies = indexData.statistics?.totalPolicies || 0;
        indexRegions = indexData.statistics?.regionsRepresented || [];
      }
    } catch (e) { /* ignore */ }

    const totalCountries = Math.max(policyCountries.length, indexCountries);
    const totalPolicies = Math.max(policyCount, indexPolicies);
    const totalRegions = Math.max(policyRegions.size, indexRegions.length);

    this.globalStats = { countries: totalCountries, policies: totalPolicies, regions: totalRegions };
    this.updateGlobalStatistics(this.globalStats);
  };

  P.updateGlobalStatistics = function (statistics) {
    const countriesEl = document.getElementById('stat-countries');
    const policiesEl = document.getElementById('stat-policies');
    const regionsEl = document.getElementById('stat-regions');
    if (countriesEl) countriesEl.textContent = statistics.countries;
    if (policiesEl) policiesEl.textContent = statistics.policies;
    if (regionsEl) regionsEl.textContent = statistics.regions;
  };

  // ── Policies Data ──────────────────────────────────────────
  P.loadPoliciesData = async function () {
    try {
      const policies = await this.policyDataService.loadAllPolicies();
      console.log(`✅ Loaded ${policies.size} policies`);
      this.updatePolicyUI();
      return policies;
    } catch (error) {
      console.error('❌ Failed to load policies:', error);
      return new Map();
    }
  };

  P.loadPolicyImpactData = async function () {
    // Delegate to policyDataService for impact data
    try {
      return await this.policyDataService.loadPolicyImpactData?.() || null;
    } catch (e) { return null; }
  };

  P.loadRealTimeAirQuality = async function () {
    // Refresh from WAQI/Open-Meteo
    await this.loadPM25Data();
    if (this.pm25Data.size > 0) {
      await this.createPM25MarkersAsync();
    }
  };

} // end mixData
