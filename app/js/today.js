/**
 * today.js — Today view entrypoint (index.html) 강화 버전
 * ──────────────────────────────────────────────────────────
 * PRD §3 기반:
 *   · 측정소 PM (station)
 *   · 위성/AOD 기반 PM 추정 (satellite) — PMService.estimateSatPM25
 *   · 카메라 AI PM (camera, 선택)
 *   → PMService.integrate() 3소스 통합 + 신뢰도 점수
 *
 * UI:
 *   · result-card: 통합 PM값 + 신뢰도 progress bar
 *   · sources-card: Station / Satellite est. / Camera 3소스 비교
 *   · action-guide: 등급별 행동 가이드
 */
(async function TodayPage() {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────────
  const locationText   = document.getElementById('location-text');
  const citySelectWrap = document.getElementById('city-select-wrap');
  const citySelect     = document.getElementById('city-select');
  const resultCard     = document.getElementById('result-card');
  const pmValueEl      = document.getElementById('pm-value');
  const pmGradeEl      = document.getElementById('pm-grade');
  const confidenceEl   = document.getElementById('confidence-info');
  const actionGuideEl  = document.getElementById('action-guide');
  const cameraSection  = document.getElementById('camera-section');

  // 신뢰도 bar
  const confBarWrap    = document.getElementById('conf-bar-wrap');
  const confScoreText  = document.getElementById('conf-score-text');
  const confScoreBar   = document.getElementById('conf-score-bar');

  // 소스 카드
  const sourcesCard    = document.getElementById('sources-card');
  const srcStation     = document.getElementById('src-station');
  const srcSatellite   = document.getElementById('src-satellite');
  const srcSatBias     = document.getElementById('src-sat-bias');
  const srcCamera      = document.getElementById('src-camera');
  const sourcesNote    = document.getElementById('sources-note');

  // ── State ─────────────────────────────────────────────────────
  let stationPM25  = null;
  let satPM25      = null;   // 위성 추정값
  let cameraPM25   = null;
  let userLocation = null;   // { lat, lon }

  // ── i18n helper ───────────────────────────────────────────────
  const t = (key, vars) => window.I18n ? window.I18n.t(key, vars) : key;

  // ── Render result card ────────────────────────────────────────
  function renderResult(fusedResult) {
    if (!fusedResult) return;
    const { value, confidence, confScore, stationVal, satVal, cameraVal, biasSat } = fusedResult;

    const g = window.PMService ? window.PMService.getGrade(value)
            : window.UIService ? window.UIService.grade(value)
            : { label: '—', color: '#888', bg: '' };

    // ── 메인 카드 ────────────────────────────────────────────────
    pmValueEl.textContent  = value.toFixed(1);
    pmGradeEl.textContent  = g.labelEn || g.label;
    pmGradeEl.style.color  = g.color;
    resultCard.className   = `result-card rounded-2xl border-2 shadow-md text-center p-6 ${g.bgClass || g.bg || ''}`;

    // 신뢰도 텍스트
    const confLabel = window.PMService ? window.PMService.getConfidenceLabel(confidence)
                    : confidence;
    const srcCount  = [stationVal, satVal, cameraVal].filter(v => v != null).length;
    const srcLabel  = srcCount === 3 ? '3 sources fused'
                    : srcCount === 2 ? '2 sources fused' : '1 source';
    confidenceEl.textContent = `Confidence: ${confLabel} · ${srcLabel}`;

    // 신뢰도 Progress Bar
    if (confBarWrap && confScore != null) {
      confBarWrap.style.display = 'block';
      if (confScoreText) confScoreText.textContent = `${confScore}%`;
      setTimeout(() => {
        if (confScoreBar) confScoreBar.style.width = `${confScore}%`;
      }, 100);
    }

    // ── 소스 비교 카드 ────────────────────────────────────────────
    if (sourcesCard) {
      sourcesCard.style.display = 'block';

      // Station
      if (srcStation) srcStation.textContent = stationVal != null ? stationVal.toFixed(1) : '--';

      // Satellite
      if (srcSatellite) srcSatellite.textContent = satVal != null ? satVal.toFixed(1) + ' µg/m³' : '--';
      if (srcSatBias && biasSat != null) {
        const sign = biasSat >= 0 ? '+' : '';
        srcSatBias.textContent = `vs station: ${sign}${biasSat.toFixed(1)}`;
        srcSatBias.style.color = Math.abs(biasSat) > 10 ? '#f97316' : '#6b7280';
      }

      // Camera
      if (srcCamera) {
        srcCamera.textContent = cameraVal != null ? cameraVal.toFixed(1) : '--';
        srcCamera.className   = `text-lg font-black ${cameraVal != null ? 'text-amber-400' : 'text-gray-400'}`;
      }

      // 소스 안내 문구
      if (sourcesNote) {
        if (satVal != null && biasSat != null) {
          const sign = biasSat >= 0 ? '+' : '';
          sourcesNote.textContent =
            `Satellite estimate based on AOD-MLR model (${sign}${biasSat.toFixed(1)} µg/m³ vs station). ` +
            (cameraVal == null ? 'Upload a sky photo to add camera data.' : '');
        } else {
          sourcesNote.textContent = cameraVal == null
            ? 'Upload a sky photo to improve confidence.' : '';
        }
      }
    }

    // ── Action Guide ──────────────────────────────────────────────
    if (actionGuideEl) {
      const guide = window.PMService ? window.PMService.getActionGuide(value) : t('guide.' + confidence.toLowerCase());
      actionGuideEl.textContent        = guide;
      actionGuideEl.style.borderLeftColor = g.color;
    }

    // Camera 섹션 노출
    if (cameraSection) cameraSection.style.display = 'block';
  }

  // ── Station + Satellite → 통합 렌더 ──────────────────────────
  async function renderFromLocation(lat, lon) {
    const nearby = await window.StationService.findNearest(lat, lon, 3);
    if (!nearby.length) {
      if (locationText) locationText.textContent = 'No nearby stations found.';
      return;
    }

    // 측정소 PM
    stationPM25 = window.StationService.weightedPM25
      ? window.StationService.weightedPM25(nearby)
      : window.PMService.calcStationPM25(nearby);

    // 위성 PM 추정 (PRD §5.1 — AOD MLR 시뮬레이션)
    const satResult = window.PMService.estimateSatPM25(stationPM25, {
      lat,
      month: new Date().getMonth() + 1,
      hour:  new Date().getHours()
    });
    satPM25 = satResult ? satResult.pm25 : null;

    // Location label
    if (locationText) {
      const label   = nearby[0].name || nearby[0].id;
      const dateStr = new Date().toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      locationText.textContent = `${label} · ${dateStr} · ${nearby.length} station${nearby.length > 1 ? 's' : ''}`;
    }

    // 3소스 통합 (camera는 아직 null)
    const fused = window.PMService.integrate(stationPM25, satPM25, cameraPM25);
    renderResult(fused);
  }

  // ── Camera PM2.5 callback (camera-today.js에서 호출) ──────────
  window.onCameraPM25 = function(camVal) {
    cameraPM25 = camVal;
    const fused = window.PMService.integrate(stationPM25, satPM25, cameraPM25);
    renderResult(fused);
  };

  // ── City select fallback ──────────────────────────────────────
  async function showCitySelect() {
    if (!citySelectWrap || !citySelect) return;
    citySelectWrap.style.display = 'block';

    const stations = await window.StationService.getAll();
    citySelect.innerHTML = `<option value="">${t('today.city.placeholder')}</option>`;
    stations.forEach((s, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = s.name;
      citySelect.appendChild(opt);
    });
    citySelect._stations = stations;
    citySelect.addEventListener('change', () => {
      const idx = citySelect.value;
      if (idx === '') return;
      const s = citySelect._stations[parseInt(idx)];
      if (s?.lat != null) renderFromLocation(s.lat, s.lon);
    });
  }

  // ── GPS ───────────────────────────────────────────────────────
  function getGPS() {
    return new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        ()  => resolve(null),
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }

  // ── Main flow ─────────────────────────────────────────────────
  window.UIService?.showLoading(t('today.loading.waqi'));
  try { await window.DataService.loadStations(); } catch (_) {}
  window.UIService?.hideLoading();

  const params    = new URLSearchParams(location.search);
  const paramLat  = parseFloat(params.get('lat'));
  const paramLon  = parseFloat(params.get('lon'));
  const paramCity = params.get('city') || '';

  if (!isNaN(paramLat) && !isNaN(paramLon)) {
    if (paramCity && locationText)
      locationText.textContent = `📍 ${decodeURIComponent(paramCity)}`;
    await renderFromLocation(paramLat, paramLon);
    if (cameraSection) cameraSection.style.display = 'block';
    return;
  }

  if (locationText) locationText.textContent = t('today.loading.gps');
  const loc = await getGPS();
  if (loc) {
    await renderFromLocation(loc.lat, loc.lon);
  } else {
    if (locationText) locationText.textContent = t('today.location.select');
    await showCitySelect();
    if (cameraSection) cameraSection.style.display = 'block';
  }
})();
