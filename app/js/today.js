/**
 * today.js
 * Today 뷰 메인 로직
 * 위치 → 측정소 → 카메라(선택) → 통합 PM2.5 → 결과 표시
 */

(async function () {
  const locationService = new LocationService();
  const pmService = new PMService();

  let stationPM25 = null;
  let cameraPM25 = null;
  let nearestStation = null;
  let waqiCities = [];

  // ── DOM refs ──
  const locationCard = document.getElementById('location-card');
  const locationText = document.getElementById('location-text');
  const citySelect = document.getElementById('city-select');
  const citySelectWrap = document.getElementById('city-select-wrap');
  const resultCard = document.getElementById('result-card');
  const pmValueEl = document.getElementById('pm-value');
  const pmGradeEl = document.getElementById('pm-grade');
  const pmUnitEl = document.getElementById('pm-unit');
  const confidenceEl = document.getElementById('confidence-info');
  const actionGuideEl = document.getElementById('action-guide');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');
  const cameraSection = document.getElementById('camera-section');

  // ── 유틸 ──
  function setLoading(msg) {
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    if (loadingText) loadingText.textContent = msg;
  }
  function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }

  // ── latest.json 로드 ──
  async function loadWaqiData() {
    try {
      const basePath = location.pathname.includes('/Finedust_proj/')
        ? '/Finedust_proj/app/data/waqi/latest.json'
        : '/app/data/waqi/latest.json';
      const res = await fetch(basePath);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      return data.cities || [];
    } catch (e) {
      console.warn('WAQI latest.json load failed:', e);
      return [];
    }
  }

  // ── 결과 카드 렌더링 ──
  function renderResult(integrated) {
    if (!integrated) return;

    const { value, confidence, stationPM25: sp, cameraPM25: cp, source } = integrated;
    const grade = pmService.getGrade(value);
    const guide = pmService.getActionGuide(value);
    const confLabel = pmService.getConfidenceLabel(confidence);

    // 수치 + 등급
    pmValueEl.textContent = value.toFixed(1);
    pmGradeEl.textContent = grade.label;
    pmGradeEl.style.color = grade.color;
    pmUnitEl && (pmUnitEl.style.display = 'inline');

    // 결과 카드 배경 색상
    resultCard.className = 'result-card ' + grade.bgClass;

    // 신뢰도 상세
    let confDetail = `신뢰도: ${confLabel}`;
    if (sp != null && cp != null) {
      confDetail += ` &nbsp;(측정소 ${sp.toFixed(0)} / 사진 ${cp.toFixed(0)} µg/m³)`;
    } else if (sp != null) {
      confDetail += ` &nbsp;(측정소 데이터만 사용)`;
    } else {
      confDetail += ` &nbsp;(카메라 분석만 사용)`;
    }
    confidenceEl.innerHTML = confDetail;

    // 행동 가이드
    actionGuideEl.textContent = guide;
    actionGuideEl.style.borderLeftColor = grade.color;

    // 카메라 섹션 표시
    if (cameraSection) cameraSection.style.display = 'block';
  }

  // ── 측정소 기반 초기 렌더 ──
  function renderStationResult(cities, lat, lon) {
    const nearby = locationService.findNearbyStations(cities, lat, lon, 3);
    if (nearby.length === 0) return null;

    nearestStation = nearby[0];
    stationPM25 = pmService.calcStationPM25(nearby);

    const stLabel = locationService.getLocationLabel(nearestStation);
    if (locationText) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      locationText.textContent = `${stLabel} · ${dateStr} ${timeStr} · 인근 ${nearby.length}개 측정소`;
    }

    const integrated = pmService.integrate(stationPM25, cameraPM25);
    renderResult(integrated);
    return integrated;
  }

  // ── 도시 셀렉트 박스 채우기 ──
  function populateCitySelect(cities) {
    if (!citySelect) return;
    citySelect.innerHTML = '<option value="">-- 도시를 선택하세요 --</option>';
    cities.forEach((city, idx) => {
      const name = city.location?.name || city.city;
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = name;
      citySelect.appendChild(opt);
    });
    citySelectWrap && (citySelectWrap.style.display = 'block');

    citySelect.addEventListener('change', () => {
      const idx = citySelect.value;
      if (idx === '') return;
      const city = cities[idx];
      const lat = city.location?.geo[0];
      const lon = city.location?.geo[1];
      if (lat && lon) renderStationResult(cities, lat, lon);
    });
  }

  // ── 카메라 결과 수신 콜백 (camera.js에서 호출) ──
  window.onCameraPM25 = function (camPM25) {
    cameraPM25 = camPM25;
    const integrated = pmService.integrate(stationPM25, cameraPM25);
    renderResult(integrated);
  };

  // ── 메인 플로우 ──
  setLoading('📡 WAQI 데이터 로딩 중...');
  waqiCities = await loadWaqiData();

  // URL 파라미터 (Globe에서 넘어온 경우)
  const params = new URLSearchParams(location.search);
  const paramLat = params.get('lat');
  const paramLon = params.get('lon');

  if (paramLat && paramLon) {
    hideLoading();
    renderStationResult(waqiCities, parseFloat(paramLat), parseFloat(paramLon));
    return;
  }

  // GPS 시도
  setLoading('📍 위치 확인 중...');
  const loc = await locationService.getLocation();
  hideLoading();

  if (loc) {
    renderStationResult(waqiCities, loc.lat, loc.lon);
  } else {
    // GPS 실패 → 도시 선택 UI
    if (locationText) locationText.textContent = '위치를 선택해 주세요';
    populateCitySelect(waqiCities);
    if (cameraSection) cameraSection.style.display = 'block';
  }
})();
