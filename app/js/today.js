/**
 * today.js — Today view entrypoint (index.html)
 * ──────────────────────────────────────────────
 * Flow:
 *   1. Check URL params ?lat=&lon= (passed from Globe)
 *   2. If not present → request GPS via browser
 *   3. If GPS denied  → show city selector from WAQI data
 *   4. Find nearest stations → weighted PM2.5 (StationService)
 *   5. Render result card + action guide
 *   6. Optional: camera photo upload → CameraService.fuse()
 *
 * Depends on (window globals):
 *   DataService, StationService, CameraService, PMService, UIService, I18n
 */

(async function TodayPage() {
  'use strict';

  // ── DOM refs ─────────────────────────────────────────────────
  const locationText   = document.getElementById('location-text');
  const citySelectWrap = document.getElementById('city-select-wrap');
  const citySelect     = document.getElementById('city-select');
  const resultCard     = document.getElementById('result-card');
  const pmValueEl      = document.getElementById('pm-value');
  const pmGradeEl      = document.getElementById('pm-grade');
  const confidenceEl   = document.getElementById('confidence-info');
  const actionGuideEl  = document.getElementById('action-guide');
  const cameraSection  = document.getElementById('camera-section');

  // ── State ─────────────────────────────────────────────────────
  let stationPM25 = null;
  let cameraPM25  = null;

  // ── i18n helper ───────────────────────────────────────────────
  const t = (key, vars) => window.I18n ? window.I18n.t(key, vars) : key;

  // ── PM2.5 grade / guide key helpers ──────────────────────────
  function gradeKey(v) {
    if (v <= 15) return 'grade.good';
    if (v <= 35) return 'grade.moderate';
    if (v <= 55) return 'grade.unhealthy';
    return 'grade.very';
  }
  function guideKey(v) {
    if (v <= 15) return 'guide.good';
    if (v <= 35) return 'guide.moderate';
    if (v <= 55) return 'guide.unhealthy';
    return 'guide.very';
  }

  // ── Render result card ────────────────────────────────────────
  function renderResult(fusedResult) {
    if (!fusedResult) return;
    const { value, confidence, stationVal, cameraVal } = fusedResult;

    const g = window.UIService ? window.UIService.grade(value) : { label: '—', color: '#888', bg: '' };

    pmValueEl.textContent = value.toFixed(1);
    pmGradeEl.textContent  = g.label;
    pmGradeEl.style.color  = g.color;

    // Card background
    resultCard.className = `result-card rounded-2xl border-2 shadow-md text-center p-6 ${g.bg}`;

    // Confidence detail
    let confParts = t('conf.' + confidence.toLowerCase()) + ' ';
    if (stationVal != null && cameraVal != null) {
      confParts += t('conf.fused', { s: stationVal.toFixed(0), c: cameraVal.toFixed(0) });
    } else if (stationVal != null) {
      confParts += t('conf.station.only');
    } else {
      confParts += t('conf.camera.only');
    }
    confidenceEl.textContent = confParts;

    // Action guide
    actionGuideEl.textContent  = t(guideKey(value));
    actionGuideEl.style.borderLeftColor = g.color;

    // Reveal camera section
    if (cameraSection) cameraSection.style.display = 'block';
  }

  // ── Station-based render ──────────────────────────────────────
  async function renderFromLocation(lat, lon) {
    const nearby = await window.StationService.findNearest(lat, lon, 3);
    if (!nearby.length) {
      locationText && (locationText.textContent = 'No nearby stations found.');
      return;
    }

    stationPM25 = window.StationService.weightedPM25(nearby);

    // Location label
    if (locationText) {
      const label   = nearby[0].name || nearby[0].id;
      const dateStr = new Date().toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      locationText.textContent = `${label} · ${dateStr} · ${nearby.length} station${nearby.length > 1 ? 's' : ''}`;
    }

    // Use PMService for fusing if available, otherwise direct fuse
    let fused;
    if (window.PMService) {
      fused = window.PMService.integrate(stationPM25, cameraPM25);
    } else if (window.CameraService) {
      fused = window.CameraService.fuse(cameraPM25, stationPM25);
    } else {
      fused = { value: stationPM25, confidence: 'Medium', stationVal: stationPM25, cameraVal: null };
    }
    renderResult(fused);
  }

  // ── Camera PM2.5 callback (from camera-today.js) ──────────────
  window.onCameraPM25 = function(camVal) {
    cameraPM25 = camVal;
    let fused;
    if (window.PMService) {
      fused = window.PMService.integrate(stationPM25, cameraPM25);
    } else if (window.CameraService) {
      fused = window.CameraService.fuse(camVal, stationPM25);
    } else {
      fused = { value: camVal, confidence: 'Low', stationVal: stationPM25, cameraVal: camVal };
    }
    renderResult(fused);
  };

  // ── City select fallback ──────────────────────────────────────
  async function showCitySelect() {
    if (!citySelectWrap || !citySelect) return;
    citySelectWrap.style.display = 'block';

    const stations = await window.StationService.getAll();
    const placeholder = t('today.city.placeholder');
    citySelect.innerHTML = `<option value="">${placeholder}</option>`;
    stations.forEach((s, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = s.name;
      citySelect.appendChild(opt);
    });

    // Store stations array for index lookup
    citySelect._stations = stations;

    citySelect.addEventListener('change', () => {
      const idx = citySelect.value;
      if (idx === '') return;
      const s = citySelect._stations[parseInt(idx)];
      if (s?.lat != null) renderFromLocation(s.lat, s.lon);
    });
  }

  // ── GPS location ──────────────────────────────────────────────
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

  // Allow StationService to pre-warm cache
  try { await window.DataService.loadStations(); } catch (_) {}

  window.UIService?.hideLoading();

  // Globe passthrough: index.html?lat=xx&lon=yy
  const params   = new URLSearchParams(location.search);
  const paramLat = parseFloat(params.get('lat'));
  const paramLon = parseFloat(params.get('lon'));

  if (!isNaN(paramLat) && !isNaN(paramLon)) {
    await renderFromLocation(paramLat, paramLon);
    if (cameraSection) cameraSection.style.display = 'block';
    return;
  }

  // GPS
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
