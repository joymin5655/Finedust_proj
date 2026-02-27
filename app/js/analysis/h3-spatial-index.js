/**
 * h3-spatial-index.js — H3 Hexagonal Spatial Indexing System
 * ──────────────────────────────────────────────────────────
 * Production Spec §1.② H3 육각형 계층형 인덱싱
 *
 * H3 인덱싱의 핵심 장점:
 *   - 모든 인접 셀과의 거리가 균일 → 확산 모델링 정확도 향상
 *   - 계층적 해상도 (res 0~15) → 줌 레벨별 적응형 집계
 *   - GPU 가속 렌더링과 호환 (Deck.gl H3HexagonLayer)
 *
 * 순수 JavaScript 구현 (외부 h3-js 라이브러리 불필요)
 * 참고: Uber H3 알고리즘의 경량 근사 구현
 *
 * @module analysis/h3-spatial-index
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const EARTH_RADIUS_KM = 6371.0;

// H3 해상도별 육각형 변 길이 (km, 근사값)
const H3_RESOLUTIONS = [
  { res: 0, edgeKm: 1107.71, areaKm2: 4250547 },
  { res: 1, edgeKm: 418.68,  areaKm2: 607221 },
  { res: 2, edgeKm: 158.24,  areaKm2: 86746 },
  { res: 3, edgeKm: 59.81,   areaKm2: 12393 },
  { res: 4, edgeKm: 22.61,   areaKm2: 1770 },
  { res: 5, edgeKm: 8.54,    areaKm2: 253 },
  { res: 6, edgeKm: 3.23,    areaKm2: 36.1 },
  { res: 7, edgeKm: 1.22,    areaKm2: 5.16 },
  { res: 8, edgeKm: 0.461,   areaKm2: 0.737 },
  { res: 9, edgeKm: 0.174,   areaKm2: 0.105 },
];

/**
 * H3-like 셀 ID 생성 (경량 근사)
 * 실제 H3는 icosahedron 기반이지만, 여기서는 위경도 그리드 기반 근사 사용
 */
export function latLonToH3(lat, lon, resolution = 5) {
  const meta = H3_RESOLUTIONS[resolution] || H3_RESOLUTIONS[5];
  const edgeDeg = meta.edgeKm / 111.32; // km → 위도 도(degree)

  // 육각형 그리드 좌표
  const row = Math.floor(lat / (edgeDeg * 1.5));
  const offset = (row % 2 === 0) ? 0 : edgeDeg * 0.866;
  const col = Math.floor((lon + offset) / (edgeDeg * 1.732));

  // 정수 인코딩
  const rowEnc = ((row + 90000) & 0xFFFFF).toString(16).padStart(5, '0');
  const colEnc = ((col + 180000) & 0xFFFFF).toString(16).padStart(5, '0');
  return `${resolution.toString(16)}${rowEnc}${colEnc}`;
}

/**
 * H3 셀 ID → 중심 좌표 역산
 */
export function h3ToLatLon(h3Id) {
  const res = parseInt(h3Id[0], 16);
  const rowEnc = parseInt(h3Id.slice(1, 6), 16) - 90000;
  const colEnc = parseInt(h3Id.slice(6, 11), 16) - 180000;

  const meta = H3_RESOLUTIONS[res] || H3_RESOLUTIONS[5];
  const edgeDeg = meta.edgeKm / 111.32;

  const lat = rowEnc * edgeDeg * 1.5 + edgeDeg * 0.75;
  const offset = (rowEnc % 2 === 0) ? 0 : edgeDeg * 0.866;
  const lon = colEnc * edgeDeg * 1.732 - offset + edgeDeg * 0.866;

  return { lat, lon };
}
