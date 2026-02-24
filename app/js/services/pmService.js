/**
 * PMService — PM2.5 통합 계산 모듈 (강화 버전)
 * ─────────────────────────────────────────────────────
 * PRD §3 기반:
 *   · calcStationPM25  — 거리 역가중 평균
 *   · estimateSatPM25  — AOD MLR 시뮬레이션 (§5.1)
 *   · integrate        — 3소스(station/satellite/camera) 통합 + 신뢰도 점수 (§3.2)
 *   · getGrade / getActionGuide / getConfidenceLabel
 *
 * AOD → PM2.5 MLR 수식 (한국 기반 논문 참조):
 *   PM̂ᵢ,ₜ = β₀ + β₁·AOD + β₂·PBL + β₃·RH + β₄·T + β₅·H + ε
 *   R² ~0.6–0.7, RMSE ~9 µg/m³ (MAIAC MODIS, 한국/동아시아 연구 기준)
 *
 * 위성 PM은 실제 AOD가 없는 경우 기상 기반 시뮬레이션으로 추정.
 */

const PMService = (() => {

  // ─────────────────────────────────────────────────────────────
  // § 1. 측정소 기반 PM2.5 (거리 역가중 평균)
  // ─────────────────────────────────────────────────────────────
  /**
   * @param {Array} stations — distance 필드 포함된 측정소 배열
   * @returns {number|null}
   */
  function calcStationPM25(stations) {
    if (!stations || stations.length === 0) return null;
    const valid = stations.filter(s => (s.pollutants?.pm25 ?? s.pm25 ?? s.aqi) != null);
    if (!valid.length) return null;
    const totalW = valid.reduce((s, st) => s + 1 / Math.max(st.distance || 1, 0.1), 0);
    const wSum   = valid.reduce((s, st) => {
      const pm = st.pollutants?.pm25 ?? st.pm25 ?? st.aqi ?? 0;
      return s + pm / Math.max(st.distance || 1, 0.1);
    }, 0);
    return wSum / totalW;
  }

  // ─────────────────────────────────────────────────────────────
  // § 2. 위성/AOD 기반 PM2.5 추정 (MLR 시뮬레이션)
  // PRD §5.1 — 한국 연구 MAIAC AOD + 기상 MLR 구조 참조
  //
  //   PM̂ = β₀ + β₁·AOD + β₂·PBL + β₃·RH + β₄·T + β₅·H
  //
  // AOD가 없는 경우 → 측정소 PM2.5와 계절/시간 보정으로 시뮬레이션.
  // ─────────────────────────────────────────────────────────────

  // 회귀 계수 (한국/동아시아 논문 기반 근사치)
  const _MLR_COEF = {
    β0:   5.2,   // intercept
    β1:  40.0,   // AOD (µg/m³ per unit AOD)
    β2:  -0.003, // PBL height (m) → 높을수록 PM 희석
    β3:   0.18,  // 상대습도 RH (%) → 높을수록 입자 성장
    β4:  -0.20,  // 기온 T (°C) → 여름철 희석 효과
    β5:  -0.005  // 고도 H (m) → 높을수록 PM 낮음
  };

  /**
   * 실제 AOD 값으로 PM2.5 추정 (MLR)
   * @param {{ aod, pbl, rh, temp, elevation }} params
   * @returns {number}
   */
  function _mlrEstimate({ aod = 0.3, pbl = 800, rh = 60, temp = 15, elevation = 50 }) {
    const c = _MLR_COEF;
    const est = c.β0 + c.β1 * aod + c.β2 * pbl + c.β3 * rh + c.β4 * temp + c.β5 * elevation;
    return Math.max(1, Math.round(est * 10) / 10);
  }

  /**
   * AOD 없을 때 — 측정소 PM2.5 + 계절/시간 보정으로 위성값 시뮬레이션
   * (실제 MAIAC/GOCI 없이도 "위성 기반 추정" 개념을 보여주는 근사)
   *
   * 보정 요인:
   *   · 시간대: 위성 통과 시각(오전 10시, 오후 1시) 기준 ±5%
   *   · 계절:   겨울(12~2월) +10%, 봄(3~5월) +5%, 여름 -5%
   *   · 위도:   35°N 이상(한국/동아시아) → 0%, 저위도(열대) -8%
   * @param {number} stationPM — 측정소 PM2.5
   * @param {{ lat?: number, month?: number, hour?: number }} ctx
   * @returns {{ pm25: number, method: string, bias: number }}
   */
  function estimateSatPM25(stationPM, ctx = {}) {
    if (stationPM == null) return null;

    const { lat = 37, month = new Date().getMonth() + 1, hour = new Date().getHours() } = ctx;

    // 계절 보정
    let seasonAdj = 0;
    if (month === 12 || month <= 2)  seasonAdj =  0.10;  // 겨울 — 경계층 얕음, PM 높게 나옴
    else if (month <= 5)             seasonAdj =  0.05;  // 봄   — 황사
    else if (month <= 8)             seasonAdj = -0.05;  // 여름 — 강수 세정
    else                             seasonAdj =  0.02;  // 가을

    // 위도 보정 (열대는 광산란으로 AOD-PM 비율 달라짐)
    const latAdj = Math.abs(lat) < 23 ? -0.08 : 0;

    // 시간 보정 (위성 통과 전후 차이)
    const timeAdj = (hour >= 9 && hour <= 14) ? -0.03 : 0.04;

    // 랜덤 노이즈 시뮬레이션 (실 위성은 구름·각도 오차 포함)
    const noise = (Math.random() - 0.5) * 0.06;

    const factor = 1 + seasonAdj + latAdj + timeAdj + noise;
    const satPM  = Math.max(1, Math.round(stationPM * factor * 10) / 10);

    // 편향 추정: 위성이 지상보다 평균 +X µg/m³ 높게 나오는 경향
    const bias = Math.round((satPM - stationPM) * 10) / 10;

    return { pm25: satPM, method: 'AOD-MLR-sim', bias };
  }

  // ─────────────────────────────────────────────────────────────
  // § 3. 3소스 통합 + 신뢰도 점수
  // PRD §3.2
  //
  //   ŷ_final = w_s·ŷ_station + w_sat·ŷ_sat + w_img·ŷ_img
  //   Conf    = max(0, 100 − α·Δ_max)   (α = 2)
  // ─────────────────────────────────────────────────────────────

  // 기본 가중치 (PRD §3.2)
  const WEIGHTS = { station: 0.5, satellite: 0.3, camera: 0.2 };
  const CONF_ALPHA = 2; // 신뢰도 패널티 계수

  /**
   * 3소스 통합 PM2.5 계산
   * @param {number|null} stationPM  — 측정소 가중 평균
   * @param {number|null} satPM      — 위성/AOD 기반 추정
   * @param {number|null} cameraPM   — 카메라 AI 추정
   * @returns {{ value, confidence, confScore, stationVal, satVal, cameraVal,
   *             source, breakdown, biasSat }}
   */
  function integrate(stationPM, satPM = null, cameraPM = null) {
    // 소스별 가용성
    const hasSta = stationPM != null;
    const hasSat = satPM     != null;
    const hasCam = cameraPM  != null;

    if (!hasSta && !hasSat && !hasCam) return null;

    // ── 단일 소스 ─────────────────────────────────────────────
    if (!hasSat && !hasCam)
      return { value: _round(stationPM), confidence: 'Medium', confScore: 60,
               source: 'station', stationVal: stationPM, satVal: null, cameraVal: null,
               breakdown: null };
    if (!hasSta && !hasCam)
      return { value: _round(satPM),     confidence: 'Low',    confScore: 45,
               source: 'satellite', stationVal: null, satVal: satPM, cameraVal: null,
               breakdown: null };
    if (!hasSta && !hasSat)
      return { value: _round(cameraPM),  confidence: 'Low',    confScore: 40,
               source: 'camera', stationVal: null, satVal: null, cameraVal: cameraPM,
               breakdown: null };

    // ── 다중 소스 통합 ────────────────────────────────────────
    // 가용 소스에 따라 가중치 재정규화
    let w = {};
    if (hasSta && hasSat && hasCam) {
      w = { ...WEIGHTS };
    } else if (hasSta && hasSat) {
      const tot = WEIGHTS.station + WEIGHTS.satellite;
      w = { station: WEIGHTS.station / tot, satellite: WEIGHTS.satellite / tot, camera: 0 };
    } else if (hasSta && hasCam) {
      const tot = WEIGHTS.station + WEIGHTS.camera;
      w = { station: WEIGHTS.station / tot, satellite: 0, camera: WEIGHTS.camera / tot };
    } else {
      const tot = WEIGHTS.satellite + WEIGHTS.camera;
      w = { station: 0, satellite: WEIGHTS.satellite / tot, camera: WEIGHTS.camera / tot };
    }

    const vals = [
      hasSta ? stationPM : null,
      hasSat ? satPM     : null,
      hasCam ? cameraPM  : null
    ].filter(v => v != null);

    const fused = (hasSta ? w.station * stationPM : 0)
                + (hasSat ? w.satellite * satPM    : 0)
                + (hasCam ? w.camera  * cameraPM   : 0);

    // 신뢰도: PRD §3.2 Conf = max(0, 100 − α·Δ_max)
    const Δmax    = Math.max(...vals) - Math.min(...vals);
    const confScore = Math.max(0, Math.round(100 - CONF_ALPHA * Δmax));
    const confidence = confScore >= 75 ? 'High' : confScore >= 50 ? 'Medium' : 'Low';

    // 소스 수에 따른 레이블
    const srcCount = [hasSta, hasSat, hasCam].filter(Boolean).length;
    const source = srcCount === 3 ? 'triple-fusion'
                 : srcCount === 2 ? 'dual-fusion' : 'fusion';

    // 위성 편향 (측정소 대비)
    const biasSat = hasSta && hasSat ? _round(satPM - stationPM) : null;

    return {
      value:      _round(fused),
      confidence, confScore,
      source,
      stationVal: hasSta ? _round(stationPM) : null,
      satVal:     hasSat ? _round(satPM)     : null,
      cameraVal:  hasCam ? _round(cameraPM)  : null,
      breakdown:  { weights: w, deltaMax: _round(Δmax) },
      biasSat
    };
  }

  // ─────────────────────────────────────────────────────────────
  // § 4. 등급 / 행동 가이드 / UI 헬퍼
  // ─────────────────────────────────────────────────────────────
  function getGrade(pm25) {
    // Use centralized config if available
    if (window.AirLensConfig?.getPM25Grade) {
      const g = window.AirLensConfig.getPM25Grade(pm25);
      return {
        label: g.labelKo || g.label,
        labelEn: g.label,
        color: g.darkColor || g.color,
        bgClass: g.bgClass || '',
        emoji: g.emoji
      };
    }
    // Fallback (config.js not loaded yet)
    if (pm25 == null) return { label: '—', labelEn: '—', color: '#888', bgClass: '' };
    if (pm25 <= 12)   return { label: '좋음',     labelEn: 'Good',          color: '#10b981', bgClass: 'grade-good' };
    if (pm25 <= 35.5) return { label: '보통',     labelEn: 'Moderate',      color: '#f59e0b', bgClass: 'grade-moderate' };
    if (pm25 <= 55.5) return { label: '나쁨',     labelEn: 'Unhealthy',     color: '#f97316', bgClass: 'grade-unhealthy' };
    return             { label: '매우 나쁨', labelEn: 'Very Unhealthy', color: '#ef4444', bgClass: 'grade-very-unhealthy' };
  }

  function getActionGuide(pm25) {
    if (window.AirLensConfig?.getActionGuide) return window.AirLensConfig.getActionGuide(pm25);
    if (pm25 == null) return '';
    if (pm25 <= 12) return '야외 활동에 적합한 공기입니다. 마음껏 즐기세요. 🌿';
    if (pm25 <= 35.5) return '민감군(어린이, 노약자, 호흡기 질환자)은 마스크 착용을 권장합니다.';
    if (pm25 <= 55.5) return 'KF94 마스크 착용을 권장합니다. 장시간 야외 운동은 자제하세요. 😷';
    return '⚠️ KF94 마스크 필수 착용. 야외 활동을 최소화하고 환기를 자제하세요.';
  }

  function getConfidenceLabel(confidence) {
    if (confidence === 'High')   return '높음 ✅';
    if (confidence === 'Medium') return '보통 ⚠️';
    return '낮음 ❗';
  }

  /** 단순 통합 (camera + station, 하위 호환) */
  function fuse(cameraPM, stationPM) {
    return integrate(stationPM, null, cameraPM);
  }

  function _round(v) { return v == null ? null : Math.round(v * 10) / 10; }

  // ─────────────────────────────────────────────────────────────
  // § 5. 정책 효과 분석 (PRD §6.1~6.2)
  // ─────────────────────────────────────────────────────────────

  /**
   * Before/After ΔPM2.5 계산
   * @param {{ before, after, pct, significant }} impact
   * @returns {{ delta, pct, significant, label }}
   */
  function calcPolicyEffect(impact) {
    if (!impact) return null;
    const { before, after, pct, significant } = impact;
    const delta = _round(after - before);
    const label = pct < 0
      ? `${Math.abs(pct)}% 감소`
      : `${pct}% 증가`;
    return { delta, pct, significant, label, before: _round(before), after: _round(after) };
  }

  /**
   * 지역 그룹 평균 대비 상대 효과 계산 (PRD §6.2)
   * @param {number} thisPct      — 이 정책의 변화율 (%)
   * @param {string} region       — 지역명
   * @param {object} regionAvgMap — { 지역명: 평균변화율 } (policy-analytics.json)
   * @returns {{ regionAvg, relative, label }}
   */
  function calcRelativeEffect(thisPct, region, regionAvgMap) {
    const regionAvg = regionAvgMap?.[region];
    if (regionAvg == null) return null;
    const relative = _round(thisPct - regionAvg);
    let label;
    if (relative < -3)      label = `지역 평균보다 ${Math.abs(relative)}%p 더 큰 효과 👍`;
    else if (relative > 3)  label = `지역 평균보다 ${Math.abs(relative)}%p 낮은 효과`;
    else                    label = `지역 평균과 유사한 효과`;
    return { regionAvg, relative, label };
  }

  return {
    // PM 계산
    calcStationPM25,
    estimateSatPM25,
    integrate,
    fuse,
    // 등급 / 가이드
    getGrade,
    getActionGuide,
    getConfidenceLabel,
    // 정책 분석
    calcPolicyEffect,
    calcRelativeEffect,
    // 상수 노출
    WEIGHTS,
  };
})();

window.PMService = PMService;
// 하위 호환 alias
if (!window.PMService.grade) window.PMService.grade = window.PMService.getGrade;
