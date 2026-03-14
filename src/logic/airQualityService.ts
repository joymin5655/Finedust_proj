import axios from 'axios';
import { supabase } from './supabase';
import type { AirQualityData } from './types';
import { APP_CONFIG } from './config';
import { fetchMaiacAodFromEdge, calculateSatellitePM25 } from './satelliteService';

// 런타임에 업데이트될 수 있는 설정값들
let dynamicParams = {
  AQI_THRESHOLDS: APP_CONFIG.AQI_THRESHOLDS,
  DQSS: APP_CONFIG.DQSS
};

/**
 * Supabase에서 원격 설정(Remote Config)을 가져와 dynamicParams를 업데이트합니다.
 */
export const fetchRemoteSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'scientific_params')
      .single();
    
    if (!error && data) {
      dynamicParams = data.value;
      console.log('✅ Remote settings applied:', dynamicParams);
    }
  } catch {
    console.warn('Failed to fetch remote settings, using local fallback.');
  }
};

export const getAQIGrade = (pm25: number): AirQualityData['grade'] => {
  const { GOOD, MODERATE, UNHEALTHY } = dynamicParams.AQI_THRESHOLDS;
  if (pm25 <= GOOD) return 'Good';
  if (pm25 <= MODERATE) return 'Moderate';
  if (pm25 <= UNHEALTHY) return 'Unhealthy';
  return 'Very Unhealthy';
};

export const getMarkerColor = (pm25: number) => {
  const { GOOD, MODERATE, UNHEALTHY } = dynamicParams.AQI_THRESHOLDS;
  if (pm25 <= GOOD) return '#10b981';
  if (pm25 <= MODERATE) return '#f59e0b';
  if (pm25 <= UNHEALTHY) return '#f97316';
  return '#ef4444';
};

/**
 * v1.0 DQSS (Data Quality Security Score)
 * Evaluates reliability based on freshness, source count, and variance.
 */
export const calculateDQSS = (data: {
  lastUpdated: string;
  sourceCount: number;
  variance?: number;
}) => {
  const { BASE_SCORE, FRESHNESS_MAX, SOURCE_MULTIPLICITY_MAX, VARIANCE_PENALTY_MAX } = dynamicParams.DQSS;
  let score = BASE_SCORE;

  // 1. Freshness (Max +FRESHNESS_MAX)
  const ageInHours = (Date.now() - new Date(data.lastUpdated).getTime()) / 3600000;
  if (ageInHours <= 1) score += FRESHNESS_MAX;
  else if (ageInHours <= 6) score += FRESHNESS_MAX / 2;
  else if (ageInHours <= 24) score += FRESHNESS_MAX / 6;

  // 2. Source Multiplicity (Max +SOURCE_MULTIPLICITY_MAX)
  if (data.sourceCount >= 3) score += SOURCE_MULTIPLICITY_MAX;
  else if (data.sourceCount === 2) score += SOURCE_MULTIPLICITY_MAX / 2;

  // 3. Data Consistency (Penalty for high variance)
  if (data.variance && data.variance > 10) {
    score -= Math.min(VARIANCE_PENALTY_MAX, data.variance);
  }

  return Math.min(100, Math.max(0, score));
};


/**
 * OpenAQ API를 통해 주변 관측소 데이터를 실시간으로 가져옵니다.
 * 이는 위성 데이터와 융합하여 데이터 신뢰도(DQSS)를 높이는 데 사용됩니다.
 */
export const fetchNearbyOpenAQ = async (lat: number, lon: number, radius = 25000) => {
  try {
    const response = await axios.get('https://api.openaq.org/v2/measurements', {
      params: {
        coordinates: `${lat},${lon}`,
        radius: radius,
        parameter: 'pm25',
        limit: 10,
        order_by: 'datetime'
      }
    });
    return response.data.results;
  } catch (error) {
    console.warn('OpenAQ API Fetch Error:', error);
    return [];
  }
};

/**
 * 실시간 위성 AOD 및 지상 관측소 데이터를 융합한 통합 공기질 분석
 */
export const fetchIntegratedAirQuality = async (lat: number, lon: number) => {
  try {
    // 1. WAQI (기본 관측소 데이터) 가져오기
    const waqiData = await fetchAirQuality(lat, lon);
    
    // 2. OpenAQ (추가 관측소 데이터) 가져오기
    const openaqResults = await fetchNearbyOpenAQ(lat, lon);
    
    // 3. 데이터 소스 다양성 확인 (Source Multiplicity)
    const uniqueSources = new Set(openaqResults.map((r: any) => r.sourceName));
    uniqueSources.add('WAQI');
    
    // 4. NASA Satellite AOD Fetch (MCD19A2 High-Res via Edge Function)
    const nasaData = await fetchMaiacAodFromEdge(lat, lon);
    const stationPM = waqiData.iaqi.pm25?.v || 0;
    const satEstimation = {
      ...calculateSatellitePM25(nasaData.aod, stationPM),
      source: nasaData.source,
      confidence: nasaData.confidence,
      granule_id: nasaData.granule_id
    };

    if (nasaData.source) {
      uniqueSources.add(nasaData.source);
    }

    // 5. 통합 DQSS 재계산
    const finalDqss = calculateDQSS({
      lastUpdated: waqiData.time.iso,
      sourceCount: uniqueSources.size,
      variance: openaqResults.length > 0 ? 5 : 15 
    });

    return {
      ...waqiData,
      satellite: satEstimation,
      sources: Array.from(uniqueSources),
      dqss: finalDqss,
      isMultiSource: uniqueSources.size > 1
    };
  } catch (error) {
    console.error('Integrated AQI Error:', error);
    throw error;
  }
};

/**
 * (Legacy Fallback) Fetches pre-processed Satellite AOD samples.
 * Now primarily used for historical comparison or fallback.
 */
export const fetchAodSamples = async () => {
  try {
    const res = await axios.get(`${APP_CONFIG.BASE_DATA_URL}/earthdata/aod_samples.json`);
    return res.data;
  } catch {
    return null;
  }
};

/**
 * Advanced Satellite PM2.5 Estimation
 * Fuses station data with AOD physics (Legacy, use calculateSatellitePM25 instead).
 */
export const estimateSatPM25 = (stationPM: number, aodValue: number | null = null) => {
  if (stationPM == null) return null;

  const baseValue = aodValue !== null ? aodValue * APP_CONFIG.SATELLITE.AOD_PM25_RATIO : stationPM;
  
  const season = new Date().getMonth() + 1;
  const humidity = APP_CONFIG.SATELLITE.DEFAULT_HUMIDITY;
  
  const correction = 1 + (season > 10 || season < 3 ? APP_CONFIG.SATELLITE.SEASONAL_CORRECTION.WINTER_LATE : APP_CONFIG.SATELLITE.SEASONAL_CORRECTION.SUMMER) - (humidity * 0.08);
  const finalPM = Math.max(1, Math.round(baseValue * correction * 10) / 10);
  
  return {
    pm25: finalPM,
    uncertainty: aodValue ? 8 : 15,
    bias: Math.round((finalPM - stationPM) * 10) / 10
  };
};

export const fetchAirQuality = async (lat: number, lon: number) => {
  try {
    const response = await axios.get(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${APP_CONFIG.WAQI_TOKEN}`
    );
    if (response.data.status === 'ok') {
      const d = response.data.data;
      return {
        ...d,
        dqss: calculateDQSS({
          lastUpdated: d.time.iso,
          sourceCount: d.attributions?.length || 1
        })
      };
    }
    throw new Error(response.data.data || 'Failed to fetch AQI');
  } catch (error) {
    console.error('AQI Fetch Error:', error);
    throw error;
  }
};
