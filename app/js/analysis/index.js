/**
 * analysis/index.js — AirLens Analysis Engine Public API
 * ──────────────────────────────────────────────────────
 * 모든 분석 모듈의 단일 진입점
 *
 * Usage (ES module):
 *   import { computeDQSS, reliabilityEngine, diagnoseAnomaly } from './analysis/index.js';
 *
 * Usage (window):
 *   window.AirLensAnalysis.computeDQSS(...)
 *
 * @module analysis
 */

// ── H3 Spatial Indexing ──────────────────────────────────────
export { latLonToH3, h3ToLatLon } from './h3-spatial-index.js';
export { getH3Neighbors } from './h3-neighbors.js';
export { aggregateToH3, h3SpatialSmooth, detectHotspots } from './h3-aggregation.js';

// ── Data Quality Scoring System ──────────────────────────────
export {
  scoreFreshness, scoreCompleteness, scoreConsistency,
  scoreStability, scoreModelResidual,
  computeDQSS, batchComputeDQSS, summarizeDQSS,
} from './dqss-engine.js';

// ── Bayesian Reliability ─────────────────────────────────────
export {
  SensorReliability,
  BayesianReliabilityEngine,
  reliabilityEngine,
} from './bayesian-reliability.js';

// ── Anomaly Detection ────────────────────────────────────────
export {
  detectByZScore, detectByMAD,
  LightIsolationForest,
  detectChangePointsCUSUM,
  diagnoseAnomaly,
} from './anomaly-detection.js';

// ── AOD → PM2.5 Correction ──────────────────────────────────
export {
  hygroscopicGrowthFactor, pblhCorrectionFactor, seasonalFactor,
  correctedAodToPm25, gtwrPredict, predictGrid,
} from './aod-correction.js';

// ── Synthetic Control / Policy Analysis ──────────────────────
export {
  prePostComparison, checkParallelTrend,
  didRegression, syntheticControl,
  analyzePolicy, recommendDonors,
} from './synthetic-control.js';

// ── Window export (IIFE 호환) ────────────────────────────────
import { computeDQSS, batchComputeDQSS, summarizeDQSS } from './dqss-engine.js';
import { reliabilityEngine } from './bayesian-reliability.js';
import { diagnoseAnomaly, LightIsolationForest } from './anomaly-detection.js';
import { correctedAodToPm25, gtwrPredict, predictGrid } from './aod-correction.js';
import { aggregateToH3, h3SpatialSmooth, detectHotspots } from './h3-aggregation.js';
import { latLonToH3, h3ToLatLon } from './h3-spatial-index.js';
import { analyzePolicy, recommendDonors, syntheticControl } from './synthetic-control.js';

if (typeof window !== 'undefined') {
  window.AirLensAnalysis = {
    // DQSS
    computeDQSS, batchComputeDQSS, summarizeDQSS,
    // Bayesian
    reliabilityEngine,
    // Anomaly
    diagnoseAnomaly, LightIsolationForest,
    // AOD
    correctedAodToPm25, gtwrPredict, predictGrid,
    // H3
    latLonToH3, h3ToLatLon, aggregateToH3, h3SpatialSmooth, detectHotspots,
    // Policy
    analyzePolicy, recommendDonors, syntheticControl,
  };
}
