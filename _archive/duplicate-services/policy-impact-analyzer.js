/**
 * Policy Impact Analyzer - 정책별 미세먼지 변화도 분석 서비스
 * 
 * 주요 기능:
 * 1. WAQI 실시간 데이터와 정책 영향 데이터 통합
 * 2. 정책 시행 전후 PM2.5 변화 분석
 * 3. 효과도 점수 계산 및 시각화 지원
 * 
 * @version 2.0.0 - 최적화 버전
 */

import { waqiDataService } from './waqi-data-service.js';
import { globalDataService } from './shared-data-service.js';

export class PolicyImpactAnalyzer {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5분 캐시
    this.countryCoordinates = this.initCountryCoordinates();
  }

  /**
   * 국가별 좌표 데이터 초기화
   */
  initCountryCoordinates() {
    return new Map([
      ['South Korea', { lat: 37.5665, lon: 126.9780, flag: '🇰🇷' }],
      ['China', { lat: 39.9042, lon: 116.4074, flag: '🇨🇳' }],
      ['Japan', { lat: 35.6762, lon: 139.6503, flag: '🇯🇵' }],
      ['India', { lat: 28.6139, lon: 77.2090, flag: '🇮🇳' }],
      ['United States', { lat: 38.9072, lon: -77.0369, flag: '🇺🇸' }],
      ['United Kingdom', { lat: 51.5074, lon: -0.1278, flag: '🇬🇧' }],
      ['Germany', { lat: 52.5200, lon: 13.4050, flag: '🇩🇪' }],
      ['France', { lat: 48.8566, lon: 2.3522, flag: '🇫🇷' }],
      ['Australia', { lat: -35.2809, lon: 149.1300, flag: '🇦🇺' }],
      ['Canada', { lat: 45.4215, lon: -75.6972, flag: '🇨🇦' }],
      ['Brazil', { lat: -15.7801, lon: -47.9292, flag: '🇧🇷' }],
      ['Indonesia', { lat: -6.2088, lon: 106.8456, flag: '🇮🇩' }],
      ['Thailand', { lat: 13.7563, lon: 100.5018, flag: '🇹🇭' }],
      ['Vietnam', { lat: 21.0278, lon: 105.8342, flag: '🇻🇳' }],
      ['Singapore', { lat: 1.3521, lon: 103.8198, flag: '🇸🇬' }],
      ['Malaysia', { lat: 3.1390, lon: 101.6869, flag: '🇲🇾' }],
      ['Philippines', { lat: 14.5995, lon: 120.9842, flag: '🇵🇭' }]
    ]);
  }

  /**
   * 정책 영향 데이터 분석 및 WAQI 데이터 통합
   * @param {string} country - 국가명
   * @returns {Promise<Object>} 통합 분석 결과
   */
  async analyzeCountryPolicy(country) {
    const cacheKey = `analysis-${country}`;
    
    // 캐시 확인
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      // 1. 정책 영향 데이터 로드
      const policyData = await this.loadPolicyImpactData(country);
      
      // 2. WAQI 실시간 데이터 로드
      const waqiData = await this.getWAQIDataForCountry(country);
      
      // 3. 데이터 통합 분석
      const analysis = this.integrateData(country, policyData, waqiData);
      
      // 캐시 저장
      this.setCache(cacheKey, analysis);
      
      return analysis;
    } catch (error) {
      console.error(`❌ Policy analysis failed for ${country}:`, error);
      return this.getDefaultAnalysis(country);
    }
  }


  /**
   * 정책 영향 JSON 데이터 로드
   */
  async loadPolicyImpactData(country) {
    const fileName = country
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    try {
      const basePath = this.getBasePath();
      const response = await fetch(`${basePath}/policy-impact/${fileName}.json`);
      
      if (!response.ok) {
        throw new Error(`Policy data not found for ${country}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`⚠️ Policy data not available for ${country}`);
      return null;
    }
  }

  /**
   * WAQI 데이터에서 국가별 데이터 추출
   */
  async getWAQIDataForCountry(country) {
    try {
      const stations = await waqiDataService.loadWAQIData();
      const countryStations = [];
      
      stations.forEach((station, id) => {
        if (this.isStationInCountry(station, country)) {
          countryStations.push({
            id,
            name: station.name || station.city,
            pm25: station.pm25 || station.aqi,
            aqi: station.aqi,
            lat: station.lat || station.latitude,
            lon: station.lon || station.longitude,
            lastUpdated: station.lastUpdated
          });
        }
      });
      
      return {
        stations: countryStations,
        count: countryStations.length,
        averagePM25: this.calculateAverage(countryStations, 'pm25'),
        averageAQI: this.calculateAverage(countryStations, 'aqi'),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`⚠️ WAQI data not available for ${country}`);
      return { stations: [], count: 0, averagePM25: 0, averageAQI: 0 };
    }
  }

  /**
   * 측정소가 특정 국가에 속하는지 확인
   */
  isStationInCountry(station, country) {
    const stationCountry = (station.country || '').toLowerCase();
    const targetCountry = country.toLowerCase();
    
    // 국가명 매칭
    if (stationCountry.includes(targetCountry) || targetCountry.includes(stationCountry)) {
      return true;
    }
    
    // 특수 케이스 처리
    const aliases = {
      'south korea': ['korea', 'kr', 'republic of korea'],
      'united states': ['usa', 'us', 'united states of america'],
      'united kingdom': ['uk', 'britain', 'england'],
      'china': ['cn', 'prc']
    };
    
    const countryAliases = aliases[targetCountry] || [];
    return countryAliases.some(alias => stationCountry.includes(alias));
  }

  /**
   * 데이터 통합 분석
   */
  integrateData(country, policyData, waqiData) {
    const coords = this.countryCoordinates.get(country) || { lat: 0, lon: 0, flag: '🌍' };
    
    // 정책 영향 분석
    let policyImpact = null;
    let effectivenessScore = 0.5;
    let timeline = [];
    
    if (policyData && policyData.policies && policyData.policies.length > 0) {
      const mainPolicy = policyData.policies[0];
      
      if (mainPolicy.impact) {
        const impact = mainPolicy.impact;
        const beforePM25 = impact.beforePeriod?.meanPM25 || 0;
        const afterPM25 = impact.afterPeriod?.meanPM25 || 0;
        const percentChange = impact.analysis?.percentChange || 0;
        
        policyImpact = {
          beforePM25,
          afterPM25,
          absoluteChange: afterPM25 - beforePM25,
          percentChange,
          significant: impact.analysis?.significant || false,
          pValue: impact.analysis?.pValue || 1,
          effectSize: impact.analysis?.effectSize || 'none'
        };
        
        // 효과도 점수 계산 (0~1)
        effectivenessScore = this.calculateEffectivenessScore(policyImpact);
      }
      
      // 타임라인 데이터
      if (mainPolicy.timeline) {
        timeline = mainPolicy.timeline.map(item => ({
          date: item.date,
          event: item.event,
          pm25: item.pm25
        }));
      }
    }


    // 현재 대기질 상태 (WAQI 데이터 우선)
    const currentStatus = {
      pm25: waqiData.averagePM25 || policyData?.realTimeData?.currentPM25 || 0,
      aqi: waqiData.averageAQI || policyData?.realTimeData?.aqi || 0,
      stationCount: waqiData.count,
      trend: this.calculateTrend(policyImpact, waqiData),
      aqiLevel: this.getAQILevel(waqiData.averageAQI)
    };

    return {
      country,
      flag: coords.flag,
      coordinates: { lat: coords.lat, lon: coords.lon },
      region: policyData?.region || 'Unknown',
      
      // 정책 정보
      mainPolicy: policyData?.policies?.[0] || null,
      policyCount: policyData?.policies?.length || 0,
      
      // 정책 영향 분석
      policyImpact,
      effectivenessScore,
      effectivenessLabel: this.getEffectivenessLabel(effectivenessScore),
      timeline,
      
      // 현재 상태 (WAQI 데이터)
      currentStatus,
      waqiStations: waqiData.stations,
      
      // 뉴스 및 기타
      news: policyData?.news || [],
      lastUpdated: waqiData.lastUpdated || new Date().toISOString()
    };
  }

  /**
   * 효과도 점수 계산 (0~1)
   */
  calculateEffectivenessScore(impact) {
    if (!impact) return 0.5;
    
    const { percentChange, significant, pValue, effectSize } = impact;
    
    // 기본 점수 (PM2.5 감소율 기반)
    let score = 0.5;
    
    if (percentChange <= -30) score = 0.95;
    else if (percentChange <= -20) score = 0.85;
    else if (percentChange <= -15) score = 0.75;
    else if (percentChange <= -10) score = 0.65;
    else if (percentChange <= -5) score = 0.55;
    else if (percentChange < 0) score = 0.5;
    else if (percentChange < 10) score = 0.4;
    else if (percentChange < 20) score = 0.3;
    else score = 0.2;
    
    // 통계적 유의성 보정
    if (significant && pValue < 0.05) {
      score = Math.min(1, score + 0.1);
    } else if (pValue > 0.1) {
      score = Math.max(0, score - 0.1);
    }
    
    // 효과 크기 보정
    if (effectSize === 'large') score = Math.min(1, score + 0.05);
    else if (effectSize === 'medium') score = Math.min(1, score + 0.02);
    
    return Math.round(score * 100) / 100;
  }

  /**
   * 효과도 레이블 반환
   */
  getEffectivenessLabel(score) {
    if (score >= 0.9) return 'Exemplary';
    if (score >= 0.75) return 'Highly Effective';
    if (score >= 0.6) return 'Effective';
    if (score >= 0.45) return 'Moderate Progress';
    if (score >= 0.3) return 'Limited Progress';
    return 'Needs Improvement';
  }

  /**
   * 트렌드 계산
   */
  calculateTrend(policyImpact, waqiData) {
    if (!policyImpact) return 'stable';
    
    const { percentChange } = policyImpact;
    if (percentChange <= -5) return 'improving';
    if (percentChange >= 5) return 'worsening';
    return 'stable';
  }

  /**
   * AQI 레벨 반환
   */
  getAQILevel(aqi) {
    if (aqi <= 50) return { level: 'Good', color: '#00e400' };
    if (aqi <= 100) return { level: 'Moderate', color: '#ffff00' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#ff0000' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8f3f97' };
    return { level: 'Hazardous', color: '#7e0023' };
  }

  /**
   * 평균 계산
   */
  calculateAverage(items, field) {
    if (!items || items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + (item[field] || 0), 0);
    return Math.round((sum / items.length) * 10) / 10;
  }

  /**
   * 기본 분석 결과 반환
   */
  getDefaultAnalysis(country) {
    const coords = this.countryCoordinates.get(country) || { lat: 0, lon: 0, flag: '🌍' };
    
    return {
      country,
      flag: coords.flag,
      coordinates: { lat: coords.lat, lon: coords.lon },
      region: 'Unknown',
      mainPolicy: null,
      policyCount: 0,
      policyImpact: null,
      effectivenessScore: 0.5,
      effectivenessLabel: 'No Data',
      timeline: [],
      currentStatus: { pm25: 0, aqi: 0, stationCount: 0, trend: 'unknown' },
      waqiStations: [],
      news: [],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 기본 경로 반환
   */
  getBasePath() {
    const hostname = window.location.hostname;
    if (hostname.includes('github.io')) {
      return '/Finedust_proj/app/data';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/app/data';
    }
    return 'data';
  }


  /**
   * 캐시 유효성 확인
   */
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < this.cacheExpiry;
  }

  /**
   * 캐시 설정
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 모든 국가 분석 데이터 가져오기
   */
  async analyzeAllCountries() {
    const countries = Array.from(this.countryCoordinates.keys());
    const results = new Map();
    
    for (const country of countries) {
      try {
        const analysis = await this.analyzeCountryPolicy(country);
        results.set(country, analysis);
      } catch (error) {
        console.warn(`⚠️ Failed to analyze ${country}`);
      }
    }
    
    return results;
  }

  /**
   * 정책 효과 순위 반환
   */
  async getRankedPolicies() {
    const allAnalysis = await this.analyzeAllCountries();
    const ranked = Array.from(allAnalysis.values())
      .filter(a => a.policyImpact !== null)
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore);
    
    return ranked;
  }
}

// 싱글톤 인스턴스
export const policyImpactAnalyzer = new PolicyImpactAnalyzer();
export default PolicyImpactAnalyzer;
