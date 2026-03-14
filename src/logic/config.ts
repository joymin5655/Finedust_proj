/**
 * AirLens Global Configuration
 * Centralized source of truth for constants, thresholds, and theme values.
 */

const getEnv = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  if (!value && !fallback) {
    throw new Error(`Missing environment variable: ${key}. Please check your .env file.`);
  }
  return value || fallback || '';
};

export const APP_CONFIG = {
  APP_NAME: 'AirLens',
  VERSION: '1.0.0',
  GITHUB_URL: 'https://github.com/joymin5655/AirLens',
  
  // API Configuration
  // 필수 변수들은 fallback 없이 에러를 던지도록 설정
  WAQI_TOKEN: getEnv('VITE_WAQI_TOKEN'), 
  SUPABASE_URL: getEnv('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY'),
  
  // Assets & Data
  BASE_DATA_URL: `${import.meta.env.BASE_URL}data`,
  PLACEHOLDER_HERO_IMAGE: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=1024',
  
  // Air Quality Thresholds (PM2.5 µg/m³) - 나중에 DB로 이전 예정
  AQI_THRESHOLDS: {
    GOOD: 12,
    MODERATE: 35,
    UNHEALTHY: 75,
  },
  
  // DQSS Scoring Parameters - 나중에 DB로 이전 예정
  DQSS: {
    BASE_SCORE: 40,
    FRESHNESS_MAX: 30,
    SOURCE_MULTIPLICITY_MAX: 20,
    VARIANCE_PENALTY_MAX: 20,
  },
  
  // Satellite Estimation Constants
  SATELLITE: {
    AOD_PM25_RATIO: 120,
    DEFAULT_HUMIDITY: 0.65,
    SEASONAL_CORRECTION: {
      WINTER_LATE: 0.12, // Nov-Feb
      SUMMER: -0.05,
    }
  },
  
  // Visual Theme (Three.js / Globe)
  GLOBE_THEME: {
    EARTH_COLOR: '#1a3a5a',
    EMISSIVE_COLOR: '#001122',
    ATMOSPHERE_COLOR: '#25e2f4',
    CLOUDS_COLOR: '#ffffff',
    UNITS_MARKER_COLOR: '#81c784',
    WAQI_MARKER_COLOR: '#60a5fa',
  }
};
