import axios from 'axios';
import type { AirQualityData } from './types';

const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN || 'demo';
const BASE_DATA_URL = `${import.meta.env.BASE_URL}data`;

export const getAQIGrade = (pm25: number): AirQualityData['grade'] => {
  if (pm25 <= 12) return 'Good';
  if (pm25 <= 35) return 'Moderate';
  if (pm25 <= 75) return 'Unhealthy';
  return 'Very Unhealthy';
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
  let score = 40; // Base score

  // 1. Freshness (Max +30)
  const ageInHours = (Date.now() - new Date(data.lastUpdated).getTime()) / 3600000;
  if (ageInHours <= 1) score += 30;
  else if (ageInHours <= 6) score += 15;
  else if (ageInHours <= 24) score += 5;

  // 2. Source Multiplicity (Max +20)
  if (data.sourceCount >= 3) score += 20;
  else if (data.sourceCount === 2) score += 10;

  // 3. Data Consistency (Penalty for high variance)
  if (data.variance && data.variance > 10) {
    score -= Math.min(20, data.variance);
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * Fetches pre-processed Satellite AOD samples from public storage.
 */
export const fetchAodSamples = async () => {
  try {
    const res = await axios.get(`${BASE_DATA_URL}/earthdata/aod_samples.json`);
    return res.data;
  } catch (e) {
    console.warn('AOD Samples not available, using fallback simulation');
    return null;
  }
};

/**
 * Advanced Satellite PM2.5 Estimation
 * Fuses station data with AOD physics (Simulated for v1.0).
 */
export const estimateSatPM25 = (stationPM: number, aodValue: number | null = null) => {
  if (stationPM == null) return null;

  // If we have actual AOD, use physics-informed multiplier (AOD * 120 is a common rule of thumb)
  const baseValue = aodValue !== null ? aodValue * 120 : stationPM;
  
  const season = new Date().getMonth() + 1;
  const humidity = 0.65; // Simulated
  
  // Correction factor (Simplified version of XGBoost-GTWR logic)
  const correction = 1 + (season > 10 || season < 3 ? 0.12 : -0.05) - (humidity * 0.08);
  const finalPM = Math.max(1, Math.round(baseValue * correction * 10) / 10);
  
  return {
    pm25: finalPM,
    uncertainty: aodValue ? 8 : 15, // Lower uncertainty with real AOD
    bias: Math.round((finalPM - stationPM) * 10) / 10
  };
};

export const fetchAirQuality = async (lat: number, lon: number) => {
  try {
    const response = await axios.get(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`
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