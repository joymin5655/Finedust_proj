import axios from 'axios';
import type { AirQualityData } from './types';

const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN || 'demo';

export const getAQIGrade = (pm25: number): AirQualityData['grade'] => {
  if (pm25 <= 15) return 'Good';
  if (pm25 <= 35) return 'Moderate';
  if (pm25 <= 75) return 'Unhealthy';
  return 'Very Unhealthy';
};

export const getActionGuide = (pm25: number): string => {
  if (pm25 <= 15) return 'Air quality is excellent. Great day for outdoor activities!';
  if (pm25 <= 35) return 'Air quality is acceptable. Sensitive individuals should consider reducing heavy exertion.';
  if (pm25 <= 75) return 'Health alert: everyone may begin to experience health effects. Avoid prolonged outdoor exertion.';
  return 'Health warnings of emergency conditions. The entire population is more likely to be affected. Stay indoors.';
};

/**
 * Calculates weighted PM2.5 from nearby stations based on inverse distance.
 */
export const calcWeightedPM25 = (stations: any[]) => {
  if (!stations || stations.length === 0) return null;
  const valid = stations.filter(s => (s.pm25 || s.aqi) != null);
  if (!valid.length) return null;
  
  const totalW = valid.reduce((s, st) => s + 1 / Math.max(st.distance || 1, 0.1), 0);
  const wSum = valid.reduce((s, st) => {
    const pm = st.pm25 || st.aqi || 0;
    return s + pm / Math.max(st.distance || 1, 0.1);
  }, 0);
  
  return wSum / totalW;
};

/**
 * Simulates satellite PM2.5 based on station PM and environmental factors.
 */
export const estimateSatPM25 = (stationPM: number, ctx: { lat?: number, month?: number, hour?: number } = {}) => {
  if (stationPM == null) return null;

  const { lat = 37, month = new Date().getMonth() + 1, hour = new Date().getHours() } = ctx;

  let seasonAdj = 0;
  if (month === 12 || month <= 2) seasonAdj = 0.10;
  else if (month <= 5) seasonAdj = 0.05;
  else if (month <= 8) seasonAdj = -0.05;
  else seasonAdj = 0.02;

  const latAdj = Math.abs(lat) < 23 ? -0.08 : 0;
  const timeAdj = (hour >= 9 && hour <= 14) ? -0.03 : 0.04;
  const noise = (Math.random() - 0.5) * 0.06;

  const factor = 1 + seasonAdj + latAdj + timeAdj + noise;
  const satPM = Math.max(1, Math.round(stationPM * factor * 10) / 10);
  const bias = Math.round((satPM - stationPM) * 10) / 10;

  return { pm25: satPM, bias };
};

/**
 * Integrates multiple sources into a final PM2.5 value with confidence scoring.
 */
export const integrateSources = (stationPM: number | null, satPM: number | null, cameraPM: number | null) => {
  const WEIGHTS = { station: 0.5, satellite: 0.3, camera: 0.2 };
  
  const sources = [
    { val: stationPM, w: WEIGHTS.station },
    { val: satPM, w: WEIGHTS.satellite },
    { val: cameraPM, w: WEIGHTS.camera }
  ].filter(s => s.val !== null);

  if (sources.length === 0) return null;

  const totalW = sources.reduce((sum, s) => sum + s.w, 0);
  const finalValue = sources.reduce((sum, s) => sum + (s.val! * (s.w / totalW)), 0);

  // Confidence scoring logic
  let confScore = 0;
  if (sources.length === 3) confScore = 92;
  else if (sources.length === 2) confScore = 75;
  else confScore = 55;

  // Penalty for high variance between sources
  if (sources.length > 1) {
    const vals = sources.map(s => s.val!);
    const maxDiff = Math.max(...vals) - Math.min(...vals);
    confScore = Math.max(10, confScore - maxDiff * 1.5);
  }

  return {
    value: Math.round(finalValue * 10) / 10,
    confScore: Math.round(confScore),
    stationVal: stationPM,
    satVal: satPM,
    cameraVal: cameraPM
  };
};

export const fetchAirQuality = async (lat: number, lon: number) => {
  try {
    const response = await axios.get(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`
    );
    if (response.data.status === 'ok') {
      return response.data.data;
    }
    throw new Error(response.data.data || 'Failed to fetch AQI');
  } catch (error) {
    console.error('AQI Fetch Error:', error);
    throw error;
  }
};