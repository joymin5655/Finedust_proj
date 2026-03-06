/**
 * H3 Spatial Index — Part 2: 이웃 탐색 + 집계 + 클러스터링
 */

import { latLonToH3, h3ToLatLon } from './h3-spatial-index.js';

const H3_RESOLUTIONS_EDGE = [
  1107.71, 418.68, 158.24, 59.81, 22.61,
  8.54, 3.23, 1.22, 0.461, 0.174
];

/**
 * H3 셀의 6개 이웃 셀 ID 반환
 */
export function getH3Neighbors(h3Id) {
  const center = h3ToLatLon(h3Id);
  const res = parseInt(h3Id[0], 16);
  const edgeDeg = (H3_RESOLUTIONS_EDGE[res] || 8.54) / 111.32;

  // 육각형 6방향 오프셋 (dx, dy)
  const directions = [
    [0, edgeDeg * 1.732],
    [0, -edgeDeg * 1.732],
    [edgeDeg * 1.5, edgeDeg * 0.866],
    [edgeDeg * 1.5, -edgeDeg * 0.866],
    [-edgeDeg * 1.5, edgeDeg * 0.866],
    [-edgeDeg * 1.5, -edgeDeg * 0.866],
  ];

  return directions.map(([dlat, dlon]) =>
    latLonToH3(center.lat + dlat, center.lon + dlon, res)
  );
}
