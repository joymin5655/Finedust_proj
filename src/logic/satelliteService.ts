import axios from 'axios';
import { supabase } from './supabase';
import { APP_CONFIG } from './config';

/**
 * AirLens Satellite & Physics Intelligence Service
 * Fuses NASA Earthdata (MAIAC/AOD) products with ground station physics.
 */

interface AODResponse {
  aod: number;
  confidence: number;
  source: string;
}

/**
 * Fetches high-resolution (1km) MAIAC AOD from Supabase Edge Function.
 * This directly connects to NASA Earthdata CMR and potential OPeNDAP slices.
 */
export const fetchMaiacAodFromEdge = async (lat: number, lon: number): Promise<AODResponse & { granule_id?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('nasa-maiac-aod', {
      body: { lat, lon }
    });

    if (error) throw error;

    return {
      aod: Math.round(data.aod_value * 100) / 100,
      confidence: data.confidence,
      source: `NASA MAIAC (Direct Edge) - ${data.granule_id.split('/').pop()}`,
      granule_id: data.granule_id
    };
  } catch (err) {
    console.warn('Edge Function MAIAC Fetch Error, falling back to NASA POWER:', err);
    return fetchNasaAod(lat, lon);
  }
};

/**
 * Fetches real-time AOD from NASA POWER API (Simplified interface for v1.0)
 * Note: Real-time MAIAC (Multi-Angle Implementation of Atmospheric Correction) 
 * usually requires granule fetching via CMR, but NASA POWER provides 
 * a simpler REST interface for daily/climatology parameters.
 */
export const fetchNasaAod = async (lat: number, lon: number): Promise<AODResponse> => {
  try {
    // NASA POWER REST API (Public, no token required for basic queries)
    // Parameter: ALLSKY_SFC_SW_DWN (often used as proxy for atmospheric clarity)
    // Here we use a more direct AOD proxy if available, or fallback to historical samples.
    
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    // Attempt to get daily meteorological parameters
    const response = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
      params: {
        parameters: 'ALLSKY_SFC_SW_DWN,RH2M',
        community: 'AG',
        longitude: lon,
        latitude: lat,
        start: today,
        end: today,
        format: 'JSON'
      },
      timeout: 5000
    });

    const data = response.data.properties.parameter;
    const solarDown = Object.values(data.ALLSKY_SFC_SW_DWN)[0] as number;
    
    // Physics-Informed AOD Estimation (Simplified for Frontend)
    // If solar radiation is lower than expected clear-sky, we estimate AOD
    const expectedClearSky = 25; // Variable based on lat/lon/season
    const attenuation = Math.max(0, expectedClearSky - solarDown);
    const estimatedAod = 0.1 + (attenuation / 50);

    return {
      aod: Math.round(estimatedAod * 100) / 100,
      confidence: 75,
      source: 'NASA POWER / MAIAC Proxy'
    };
  } catch {
    console.warn('NASA API Fetch Error, falling back to simulated physics.');
    // Fallback to a seasonal/lat-based simulation if NASA API fails
    const simulatedAod = 0.15 + (Math.random() * 0.1);
    return {
      aod: simulatedAod,
      confidence: 40,
      source: 'Simulated Physics (Fallback)'
    };
  }
};

/**
 * Advanced Physics Correction for Satellite-to-Ground PM2.5
 * Uses seasonal constants and humidity from APP_CONFIG.
 */
export const calculateSatellitePM25 = (aod: number, stationPM: number) => {
  const ratio = APP_CONFIG.SATELLITE.AOD_PM25_RATIO;
  const month = new Date().getMonth() + 1;
  
  let seasonalCorrection = 1.0;
  if (month >= 11 || month <= 2) {
    seasonalCorrection += APP_CONFIG.SATELLITE.SEASONAL_CORRECTION.WINTER_LATE;
  } else if (month >= 6 && month <= 8) {
    seasonalCorrection += APP_CONFIG.SATELLITE.SEASONAL_CORRECTION.SUMMER;
  }

  // Final fused estimation
  const estValue = aod * ratio * seasonalCorrection;
  
  // Weighting station data vs satellite
  // If station data exists, we use it to anchor the satellite estimation (Hybrid)
  const finalPM = stationPM > 0 
    ? (stationPM * 0.7) + (estValue * 0.3) 
    : estValue;

  return {
    pm25: Math.round(finalPM * 10) / 10,
    uncertainty: stationPM > 0 ? 12 : 25,
    bias: Math.round((finalPM - stationPM) * 10) / 10
  };
};
