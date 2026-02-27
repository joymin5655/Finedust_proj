/**
 * H3 Aggregation — 공간 집계 및 클러스터링
 */

import { latLonToH3, h3ToLatLon } from './h3-spatial-index.js';
import { getH3Neighbors } from './h3-neighbors.js';

/**
 * 관측 데이터를 H3 셀로 집계
 * @param {Array<{lat, lon, pm25, ...}>} observations
 * @param {number} resolution - H3 해상도 (0~9)
 * @returns {Map<string, Object>} h3Id → aggregated data
 */
export function aggregateToH3(observations, resolution = 5) {
  const cells = new Map();

  for (const obs of observations) {
    if (obs.lat == null || obs.lon == null || obs.pm25 == null) continue;

    const h3Id = latLonToH3(obs.lat, obs.lon, resolution);
    if (!cells.has(h3Id)) {
      const center = h3ToLatLon(h3Id);
      cells.set(h3Id, {
        h3Id,
        lat: center.lat,
        lon: center.lon,
        values: [],
        stations: [],
        sources: new Set(),
      });
    }

    const cell = cells.get(h3Id);
    cell.values.push(obs.pm25);
    cell.stations.push(obs.name || obs.id || 'unknown');
    if (obs.source) cell.sources.add(obs.source);
  }
  // 통계 계산
  for (const [, cell] of cells) {
    const vals = cell.values;
    const n = vals.length;
    const sorted = [...vals].sort((a, b) => a - b);

    cell.count = n;
    cell.mean = vals.reduce((s, v) => s + v, 0) / n;
    cell.median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    cell.std = Math.sqrt(
      vals.reduce((s, v) => s + (v - cell.mean) ** 2, 0) / n
    );
    cell.min = sorted[0];
    cell.max = sorted[n - 1];
    cell.p10 = sorted[Math.floor(n * 0.1)] ?? sorted[0];
    cell.p90 = sorted[Math.floor(n * 0.9)] ?? sorted[n - 1];
    cell.sourceCount = cell.sources.size;
    cell.sources = Array.from(cell.sources);

    // 커버리지 품질 인디케이터
    cell.coverageScore = Math.min(1.0,
      (n / 5) * 0.5 +                     // 관측 밀도
      (cell.sourceCount / 3) * 0.3 +       // 소스 다양성
      (cell.std < 10 ? 0.2 : 0.1)          // 안정성
    );
  }

  return cells;
}

/**
 * H3 셀 간 공간 가중 보간 (IDW 대체)
 * 육각형 이웃 기반으로 균일 거리 보간
 */
export function h3SpatialSmooth(cells, iterations = 1) {
  const smoothed = new Map(cells);

  for (let iter = 0; iter < iterations; iter++) {
    for (const [h3Id, cell] of smoothed) {
      const neighbors = getH3Neighbors(h3Id);
      const neighborVals = neighbors
        .map(nId => smoothed.get(nId)?.mean)
        .filter(v => v != null);

      if (neighborVals.length >= 2) {
        // 중심 가중 평균 (center 60%, neighbors 40%)
        const neighborMean = neighborVals.reduce((s, v) => s + v, 0) / neighborVals.length;
        cell.smoothed = cell.mean * 0.6 + neighborMean * 0.4;
      } else {
        cell.smoothed = cell.mean;
      }
    }
  }

  return smoothed;
}

/**
 * 핫스팟 클러스터 탐지 (H3 기반 Getis-Ord Gi* 근사)
 */
export function detectHotspots(cells, threshold = 1.96) {
  const allMeans = [];
  for (const [, cell] of cells) {
    allMeans.push(cell.mean);
  }
  const globalMean = allMeans.reduce((s, v) => s + v, 0) / allMeans.length;
  const globalStd = Math.sqrt(
    allMeans.reduce((s, v) => s + (v - globalMean) ** 2, 0) / allMeans.length
  );

  const hotspots = [];
  const coldspots = [];

  for (const [h3Id, cell] of cells) {
    const neighbors = getH3Neighbors(h3Id);
    const localVals = [cell.mean];
    for (const nId of neighbors) {
      const n = cells.get(nId);
      if (n) localVals.push(n.mean);
    }

    const localMean = localVals.reduce((s, v) => s + v, 0) / localVals.length;
    const zScore = globalStd > 0
      ? (localMean - globalMean) / (globalStd / Math.sqrt(localVals.length))
      : 0;

    cell.zScore = zScore;
    cell.isHotspot = zScore > threshold;
    cell.isColdspot = zScore < -threshold;

    if (cell.isHotspot) hotspots.push({ h3Id, ...cell, zScore });
    if (cell.isColdspot) coldspots.push({ h3Id, ...cell, zScore });
  }

  return { hotspots, coldspots, globalMean, globalStd };
}

export default { aggregateToH3, h3SpatialSmooth, detectHotspots };
