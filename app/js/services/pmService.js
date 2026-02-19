/**
 * PMService
 * PM2.5 통합 계산 + 등급 + 행동 가이드
 */

class PMService {
  /**
   * 측정소 목록에서 거리 가중 평균 PM2.5 계산
   * @param {Array} stations - distance 필드 포함된 측정소 배열
   * @returns {number|null}
   */
  calcStationPM25(stations) {
    if (!stations || stations.length === 0) return null;

    const validStations = stations.filter(
      st => (st.pollutants?.pm25 ?? st.aqi) != null
    );
    if (validStations.length === 0) return null;

    const totalWeight = validStations.reduce(
      (sum, st) => sum + (1 / Math.max(st.distance, 0.1)), 0
    );
    const weightedSum = validStations.reduce((sum, st) => {
      const pm = st.pollutants?.pm25 ?? st.aqi ?? 0;
      return sum + pm * (1 / Math.max(st.distance, 0.1));
    }, 0);

    return weightedSum / totalWeight;
  }

  /**
   * 카메라 PM2.5 + 측정소 PM2.5 통합
   * @param {number|null} stationPM25
   * @param {number|null} cameraPM25
   * @returns {{ value, confidence, stationPM25, cameraPM25, source }}
   */
  integrate(stationPM25, cameraPM25) {
    if (stationPM25 == null && cameraPM25 == null) return null;

    if (stationPM25 == null) {
      return { value: cameraPM25, confidence: 'Low', source: 'camera',
               stationPM25: null, cameraPM25 };
    }
    if (cameraPM25 == null) {
      return { value: stationPM25, confidence: 'Medium', source: 'station',
               stationPM25, cameraPM25: null };
    }

    const fused = stationPM25 * 0.6 + cameraPM25 * 0.4;
    const diff = Math.abs(stationPM25 - cameraPM25);
    const confidence = diff <= 10 ? 'High' : diff <= 25 ? 'Medium' : 'Low';

    return { value: fused, confidence, source: 'fusion', stationPM25, cameraPM25 };
  }

  /**
   * PM2.5 → 등급 정보
   * @param {number} pm25
   * @returns {{ label, labelEn, color, bgClass }}
   */
  getGrade(pm25) {
    if (pm25 <= 15) return {
      label: '좋음', labelEn: 'Good',
      color: '#10b981', bgClass: 'grade-good'
    };
    if (pm25 <= 35) return {
      label: '보통', labelEn: 'Moderate',
      color: '#f59e0b', bgClass: 'grade-moderate'
    };
    if (pm25 <= 55) return {
      label: '나쁨', labelEn: 'Unhealthy',
      color: '#f97316', bgClass: 'grade-unhealthy'
    };
    return {
      label: '매우 나쁨', labelEn: 'Very Unhealthy',
      color: '#ef4444', bgClass: 'grade-very-unhealthy'
    };
  }

  /**
   * PM2.5 → 행동 가이드 문구
   * @param {number} pm25
   * @returns {string}
   */
  getActionGuide(pm25) {
    if (pm25 <= 15) return '야외 활동에 적합한 공기입니다. 마음껏 즐기세요.';
    if (pm25 <= 35) return '민감군(어린이, 노약자, 호흡기 질환자)은 마스크 착용을 권장합니다.';
    if (pm25 <= 55) return 'KF94 마스크 착용을 권장합니다. 장시간 야외 운동은 자제하세요.';
    return 'KF94 마스크 필수 착용. 장시간 야외 활동을 피하고 환기를 최소화하세요.';
  }

  /**
   * 신뢰도 문구
   */
  getConfidenceLabel(confidence) {
    if (confidence === 'High') return '높음 ✅';
    if (confidence === 'Medium') return '보통 ⚠️';
    return '낮음 ❗';
  }
}

window.PMService = PMService;
