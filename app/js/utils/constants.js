/**
 * constants.js — Backward compatibility re-export
 * ────────────────────────────────────────────────
 * All constants are now defined in config.js (single source of truth).
 * This file re-exports them for existing imports.
 */

export {
  PM25_GRADES,
  WHO_GUIDELINE,
  CACHE_TTL,
  DATA_SOURCES,
  ML_CONFIG,
  getPM25Grade,
  aqiToPm25,
  getActionGuide,
  getBasePath as getDataBasePath,
} from './config.js';

// Legacy alias: AQI_COLORS for Three.js hex values
import { PM25_GRADES } from './config.js';
export const AQI_COLORS = {
  good:          PM25_GRADES[0].hex,
  moderate:      PM25_GRADES[1].hex,
  unhealthy1:    PM25_GRADES[2].hex,
  unhealthy2:    PM25_GRADES[3].hex,
  veryUnhealthy: PM25_GRADES[4].hex,
  hazardous:     PM25_GRADES[5].hex,
};
