/**
 * color.js — PM2.5/AQI 색상 유틸리티
 * ────────────────────────────────────
 */

import { PM25_GRADES } from './constants.js';

/**
 * PM2.5 값 → 등급 정보 반환
 */
export function getGrade(pm25) {
  for (const grade of PM25_GRADES) {
    if (pm25 <= grade.max) return grade;
  }
  return PM25_GRADES[PM25_GRADES.length - 1];
}

/**
 * PM2.5 → hex 색상 문자열
 */
export function pm25ToColor(pm25) {
  return getGrade(pm25).color;
}

/**
 * PM2.5 → Three.js 색상 (0xRRGGBB)
 */
export function pm25ToHex(pm25) {
  return parseInt(pm25ToColor(pm25).replace('#', ''), 16);
}

/**
 * PM2.5 → 등급 라벨
 */
export function pm25ToLabel(pm25) {
  return getGrade(pm25).label;
}

/**
 * AQI → PM2.5 대략 변환 (US EPA 역산)
 */
export function aqiToPm25(aqi) {
  if (aqi <= 50)  return aqi * 0.24;
  if (aqi <= 100) return 12 + (aqi - 50) * 0.47;
  if (aqi <= 150) return 35.5 + (aqi - 100) * 0.40;
  if (aqi <= 200) return 55.5 + (aqi - 150) * 1.90;
  if (aqi <= 300) return 150.5 + (aqi - 200) * 1.00;
  return 250.5 + (aqi - 300) * 1.49;
}

/**
 * AOD → 색상 (Globe AOD 오버레이용)
 */
export function aodToColor(aod) {
  if (aod < 0.1) return '#4CAF50';
  if (aod < 0.3) return '#FFC107';
  if (aod < 0.6) return '#FF9800';
  if (aod < 1.0) return '#F44336';
  return '#9C27B0';
}

/**
 * AOD → 라벨
 */
export function aodToLabel(aod) {
  if (aod < 0.1) return 'Low';
  if (aod < 0.3) return 'Moderate';
  if (aod < 0.6) return 'High';
  if (aod < 1.0) return 'Very High';
  return 'Extreme';
}
