/**
 * WAQI Data Service - WAQI JSON 데이터 로드 및 관리
 * GitHub Actions에서 수집된 데이터를 활용하여 API 호출 최소화
 * 
 * 최적화 포인트:
 * 1. 로컬 JSON 파일 우선 사용 (app/data/waqi/)
 * 2. 캐싱으로 중복 로드 방지
 * 3. 정책 데이터와 자동 연동
 */

import { globalDataService } from './shared-data-service.js';

export class WAQIDataService {
  constructor() {
    this.baseURL = '/Finedust_proj/app/data';
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10분
    this.lastLoadTime = null;
    this.isLoading = false;
  }

  /**
   * WAQI 최신 데이터 로드 (로컬 JSON 우선)
   * @returns {Promise<Map>} 도시별 대기질 데이터
   */
  async loadWAQIData() {
    const cacheKey = 'waqi-latest';
    
    // 캐시 확인
    if (this.isCacheValid(cacheKey)) {
      console.log('✅ Using cached WAQI data');
      return this.cache.get(cacheKey);
    }

    this.isLoading = true;

    try {
      console.log('📊 Loading WAQI data from local JSON...');
      
      // 1차: 로컬 JSON 파일에서 로드
      const response = await fetch(`${this.baseURL}/waqi/latest.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load WAQI data`);
      }
      
      const data = await response.json();
      const stationsMap = this.processWAQIData(data);
      
      // 캐시에 저장
      this.setCache(cacheKey, stationsMap);
      
      // 전역 데이터 서비스에 업데이트
      globalDataService.setStations(stationsMap);
      
      console.log(`✅ Loaded ${stationsMap.size} cities from WAQI JSON`);
      console.log(`📅 Data updated: ${data.updated_at || 'Unknown'}`);
      
      this.isLoading = false;
      return stationsMap;
      
    } catch (error) {
      console.warn('⚠️ WAQI JSON load failed:', error.message);
      console.log('🔄 Falling back to global stations...');
      
      // 2차: 글로벌 스테이션 데이터에서 로드
      try {
        const fallbackData = await this.loadGlobalStations();
        this.isLoading = false;
        return fallbackData;
      } catch (fallbackError) {
        console.error('❌ All data sources failed:', fallbackError);
        this.isLoading = false;
        return new Map();
      }
    }
  }

  /**
   * WAQI 데이터 처리 및 정규화
   */
  processWAQIData(data) {
    const stationsMap = new Map();
    
    if (!data.cities || !Array.isArray(data.cities)) {
      console.warn('⚠️ Invalid WAQI data format');
      return stationsMap;
    }

    data.cities.forEach(city => {
      const cityId = city.city || city.location?.name || 'unknown';
      const geo = city.location?.geo || [0, 0];
      
      stationsMap.set(cityId, {
        id: cityId,
        name: city.location?.name || cityId,
        city: cityId,
        lat: geo[0],
        lon: geo[1],
        latitude: geo[0],
        longitude: geo[1],
        aqi: city.aqi || 0,
        pm25: city.pollutants?.pm25 || city.aqi || 0,
        pm10: city.pollutants?.pm10 || null,
        dominentpol: city.dominentpol || 'pm25',
        country: this.extractCountry(city),
        source: 'WAQI',
        url: city.location?.url || '',
        weather: city.weather || {},
        pollutants: city.pollutants || {},
        lastUpdated: city.time?.s || data.updated_at || new Date().toISOString()
      });
    });

    return stationsMap;
  }

  /**
   * 국가명 추출
   */
  extractCountry(city) {
    // attribution에서 국가 추출 시도
    if (city.attribution && city.attribution.length > 0) {
      const attribution = city.attribution[0].name || '';
      if (attribution.includes('Korea')) return 'South Korea';
      if (attribution.includes('China')) return 'China';
      if (attribution.includes('Japan')) return 'Japan';
      if (attribution.includes('Taiwan')) return 'Taiwan';
    }
    
    // 도시명으로 추정
    const cityName = city.city?.toLowerCase() || '';
    const koreanCities = ['seoul', 'busan', 'incheon', 'daegu', 'daejeon', 'gwangju', 'ulsan', 'suwon'];
    if (koreanCities.some(c => cityName.includes(c))) return 'South Korea';
    
    return 'Unknown';
  }

  /**
   * 글로벌 스테이션 데이터 로드 (대체 데이터)
   */
  async loadGlobalStations() {
    const response = await fetch(`${this.baseURL}/waqi/global-stations.json`);
    
    if (!response.ok) {
      throw new Error('Global stations data not available');
    }
    
    const data = await response.json();
    const stationsMap = new Map();
    
    if (data.stations && Array.isArray(data.stations)) {
      data.stations.forEach(station => {
        stationsMap.set(station.id || station.name, {
          ...station,
          source: 'WAQI-Global'
        });
      });
    }
    
    this.setCache('waqi-latest', stationsMap);
    globalDataService.setStations(stationsMap);
    
    return stationsMap;
  }

  /**
   * 정책 영향 데이터와 병합
   */
  async mergeWithPolicyImpact() {
    try {
      const stations = await this.loadWAQIData();
      const policyIndex = await this.loadPolicyImpactIndex();
      
      if (!policyIndex || !policyIndex.countries) {
        return stations;
      }

      // 국가별로 스테이션 그룹화
      const countryStations = new Map();
      stations.forEach((station, id) => {
        const country = station.country || 'Unknown';
        if (!countryStations.has(country)) {
          countryStations.set(country, []);
        }
        countryStations.get(country).push(station);
      });

      // 정책 영향 데이터와 병합
      policyIndex.countries.forEach(countryInfo => {
        const countryStationList = countryStations.get(countryInfo.country);
        if (countryStationList) {
          countryStationList.forEach(station => {
            station.policyInfo = {
              policyCount: countryInfo.policyCount,
              region: countryInfo.region,
              flag: countryInfo.flag,
              dataFile: countryInfo.dataFile
            };
          });
        }
      });

      console.log('✅ WAQI data merged with policy impact info');
      return stations;
      
    } catch (error) {
      console.error('❌ Error merging policy data:', error);
      return this.loadWAQIData();
    }
  }

  /**
   * 정책 영향 인덱스 로드
   */
  async loadPolicyImpactIndex() {
    try {
      const response = await fetch(`${this.baseURL}/policy-impact/index.json`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn('⚠️ Policy impact index not available');
      return null;
    }
  }

  /**
   * 특정 국가의 정책 영향 상세 데이터 로드
   */
  async loadCountryPolicyImpact(countryCode) {
    const cacheKey = `policy-${countryCode}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 국가 코드를 파일명으로 변환
      const fileName = this.getCountryFileName(countryCode);
      const response = await fetch(`${this.baseURL}/policy-impact/${fileName}.json`);
      
      if (!response.ok) {
        throw new Error(`Policy data not found for ${countryCode}`);
      }
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      
      console.log(`✅ Loaded policy impact for ${countryCode}`);
      return data;
      
    } catch (error) {
      console.warn(`⚠️ Policy impact data not available for ${countryCode}`);
      return null;
    }
  }

  /**
   * 국가명을 파일명으로 변환
   */
  getCountryFileName(country) {
    return country
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * 캐시 유효성 확인
   */
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.cacheExpiry;
  }

  /**
   * 캐시에 저장
   */
  setCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * 캐시에서 가져오기
   */
  getCache(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ WAQI cache cleared');
  }

  /**
   * 데이터 통계 반환
   */
  getStats() {
    const stations = this.getCache('waqi-latest');
    if (!stations) return null;

    const stats = {
      totalStations: stations.size,
      byCountry: new Map(),
      averageAQI: 0,
      maxAQI: 0,
      minAQI: Infinity
    };

    let totalAQI = 0;
    stations.forEach((station) => {
      const country = station.country || 'Unknown';
      stats.byCountry.set(country, (stats.byCountry.get(country) || 0) + 1);
      
      const aqi = station.aqi || 0;
      totalAQI += aqi;
      if (aqi > stats.maxAQI) stats.maxAQI = aqi;
      if (aqi < stats.minAQI) stats.minAQI = aqi;
    });

    stats.averageAQI = Math.round(totalAQI / stations.size);
    
    return stats;
  }
}

// 싱글톤 인스턴스
export const waqiDataService = new WAQIDataService();
