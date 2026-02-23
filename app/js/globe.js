/**
 * globe.js — Entry point (thin re-export)
 * ────────────────────────────────────────
 * 기존 3,131줄 모놀리스 → 6개 모듈로 분할됨.
 * 원본은 _archive/globe-monolith.js 에 보관.
 *
 * 모듈 구조:
 *   globe/globe-core.js     — 클래스 정의, init, animate
 *   globe/globe-earth.js    — 지구, 대기, 구름, 별, 조명
 *   globe/globe-markers.js  — 파티클, PM2.5 마커, 정책 마커
 *   globe/globe-data.js     — 데이터 로딩 전체
 *   globe/globe-ui.js       — 이벤트, 토글, 패널, 모달
 *   globe/globe-charts.js   — 차트 렌더링
 */

export { PolicyGlobe } from './globe/globe-core.js';
