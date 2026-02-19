/**
 * today.js  — Today view main logic
 * Uses window.t() from i18n.js for all user-facing strings.
 * Flow: location → WAQI stations → camera (optional) → merged PM2.5 → render
 */

(async function () {
  const locationService = new LocationService();
  const pmService       = new PMService();

  let stationPM25  = null;
  let cameraPM25   = null;
  let waqiCities   = [];

  // ── DOM refs ──────────────────────────────────────────────────
  const locationText    = document.getElementById('location-text');
  const citySelectWrap  = document.getElementById('city-select-wrap');
  const citySelect      = document.getElementById('city-select');
  const resultCard      = document.getElementById('result-card');
  const pmValueEl       = document.getElementById('pm-value');
  const pmGradeEl       = document.getElementById('pm-grade');
  const confidenceEl    = document.getElementById('confidence-info');
  const actionGuideEl   = document.getElementById('action-guide');
  const loadingOverlay  = document.getElementById('loading-overlay');
  const loadingText     = document.getElementById('loading-text');
  const cameraSection   = document.getElementById('camera-section');

  // ── Helpers ───────────────────────────────────────────────────
  const t = (key, vars) => (window.I18n ? window.I18n.t(key, vars) : key);

  function setLoading(msg) {
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    if (loadingText)    loadingText.textContent = msg;
  }
  function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }

  // ── Fetch WAQI latest.json ────────────────────────────────────
  async function loadWaqiData() {
    try {
      const base = location.pathname.includes('/Finedust_proj/')
        ? '/Finedust_proj/app/data/waqi/latest.json'
        : '/app/data/waqi/latest.json';
      const res = await fetch(base);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      return data.cities || [];
    } catch (e) {
      console.warn('WAQI data load failed:', e);
      return [];
    }
  }

  // ── Grade key mapping ─────────────────────────────────────────
  function gradeKey(pm25) {
    if (pm25 <= 15) return 'grade.good';
    if (pm25 <= 35) return 'grade.moderate';
    if (pm25 <= 55) return 'grade.unhealthy';
    return 'grade.very';
  }
  function guideKey(pm25) {
    if (pm25 <= 15) return 'guide.good';
    if (pm25 <= 35) return 'guide.moderate';
    if (pm25 <= 55) return 'guide.unhealthy';
    return 'guide.very';
  }

  // ── Render result card ────────────────────────────────────────
  function renderResult(integrated) {
    if (!integrated) return;
    const { value, confidence, stationPM25: sp, cameraPM25: cp } = integrated;

    const grade = pmService.getGrade(value);

    // Numbers + grade
    pmValueEl.textContent = value.toFixed(1);
    pmGradeEl.textContent = t(gradeKey(value));
    pmGradeEl.style.color = grade.color;

    // Card background
    resultCard.className = 'result-card rounded-2xl border-2 shadow-md text-center p-6 ' + grade.bgClass;

    // Confidence detail
    let confDetail = `${t('conf.' + confidence.toLowerCase())} `;
    if (sp != null && cp != null) {
      confDetail += t('conf.fused', { s: sp.toFixed(0), c: cp.toFixed(0) });
    } else if (sp != null) {
      confDetail += t('conf.station.only');
    } else {
      confDetail += t('conf.camera.only');
    }
    confidenceEl.innerHTML = confDetail;

    // Action guide
    actionGuideEl.textContent = t(guideKey(value));
    actionGuideEl.style.borderLeftColor = grade.color;

    // Reveal camera section
    if (cameraSection) cameraSection.style.display = 'block';
  }

  // ── Populate city select on GPS failure ──────────────────────
  function populateCitySelect(cities) {
    if (!citySelect) return;
    const placeholder = t('today.city.placeholder');
    citySelect.innerHTML = `<option value="">${placeholder}</option>`;
    cities.forEach((city, idx) => {
      const name = city.location?.name || city.city;
      const opt  = document.createElement('option');
      opt.value  = idx;
      opt.textContent = name;
      citySelect.appendChild(opt);
    });
    if (citySelectWrap) citySelectWrap.style.display = 'block';

    citySelect.addEventListener('change', () => {
      const idx = citySelect.value;
      if (idx === '') return;
      const city = cities[idx];
      const lat  = city.location?.geo[0];
      const lon  = city.location?.geo[1];
      if (lat && lon) renderStationResult(cities, lat, lon);
    });
  }

  // ── Station-based result ──────────────────────────────────────
  function renderStationResult(cities, lat, lon) {
    const nearby = locationService.findNearbyStations(cities, lat, lon, 3);
    if (!nearby.length) return null;

    stationPM25 = pmService.calcStationPM25(nearby);
    const stLabel = locationService.getLocationLabel(nearby[0]);

    if (locationText) {
      const now     = new Date();
      const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      locationText.textContent = `${stLabel} · ${dateStr} ${timeStr} · ${nearby.length} nearby stations`;
    }

    const integrated = pmService.integrate(stationPM25, cameraPM25);
    renderResult(integrated);
    return integrated;
  }

  // ── Camera PM2.5 callback (called by camera-today.js) ────────
  window.onCameraPM25 = function (camPM25) {
    cameraPM25 = camPM25;
    renderResult(pmService.integrate(stationPM25, cameraPM25));
  };

  // ── Main flow ─────────────────────────────────────────────────
  setLoading(t('today.loading.waqi'));
  waqiCities = await loadWaqiData();

  // Globe passthrough: ?lat=&lon=
  const params   = new URLSearchParams(location.search);
  const paramLat = params.get('lat');
  const paramLon = params.get('lon');

  if (paramLat && paramLon) {
    hideLoading();
    renderStationResult(waqiCities, parseFloat(paramLat), parseFloat(paramLon));
    if (cameraSection) cameraSection.style.display = 'block';
    return;
  }

  // GPS
  setLoading(t('today.loading.gps'));
  const loc = await locationService.getLocation();
  hideLoading();

  if (loc) {
    renderStationResult(waqiCities, loc.lat, loc.lon);
  } else {
    // GPS denied → show city picker
    if (locationText) locationText.textContent = t('today.location.select');
    populateCitySelect(waqiCities);
    if (cameraSection) cameraSection.style.display = 'block';
  }
})();
