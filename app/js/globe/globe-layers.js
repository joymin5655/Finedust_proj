/**
 * globe-layers.js — Layer registry + Satellite/AOD/Prediction/DataQuality overlays
 * ─────────────────────────────────────────────────────────────────────────────────
 * PRD v2.0 Globe Upgrade: Phase G2 — Layer / UX
 *
 * Layers:
 *   stations   — PM2.5 마커 (기존, markerSystem)
 *   satellite  — AOD 히트맵 (earthdataService → aod_pm25_grid_*.json)
 *   prediction — 예측 그리드 (predicted_p50/p10/p90)
 *   policy     — 국가 경계 채색 (DID-lite 효과)
 *   quality    — DQSS 기반 데이터 품질 시각화
 */

import * as THREE from 'three';
import { getBasePath, earthdataUrl, PM25_GRADES, getPM25Grade } from '../utils/config.js';
import { getAllAodPoints, aodToColor } from '../services/earthdataService.js';

// ── 색상 팔레트 (PM2.5 → config 기반) ─────────────────────────────
function pm25Color(value, alpha = 0.75) {
  if (value == null) return `rgba(100,100,120,${alpha})`;
  const g = getPM25Grade(value);
  // color hex → rgb
  const hex = g.color;
  const r = parseInt(hex.slice(1,3), 16);
  const gv = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${gv},${b},${alpha})`;
}

function pm25ColorThree(value) {
  if (value == null) return new THREE.Color(0x4a4a6a);
  const g = getPM25Grade(value);
  return new THREE.Color(g.hex);
}

// DQSS 점수 → 색상
function dqssColor(score) {
  if (score >= 75) return new THREE.Color(0x00ff88);
  if (score >= 50) return new THREE.Color(0xffcc00);
  if (score >= 25) return new THREE.Color(0xff8800);
  return new THREE.Color(0xff2222);
}

// lat/lon → 지구 표면 Vector3
function latLonToVec3(lat, lon, radius = 1.005) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function mixLayers(Cls) {
  const P = Cls.prototype;

  // ═══════════════════════════════════════════════════════════
  // 1. Layer Registry
  // ═══════════════════════════════════════════════════════════

  P.initLayerSystem = function () {
    this.layers = {
      stations:   { group: null, visible: true,  label: 'Stations' },
      satellite:  { group: null, visible: false, label: 'Satellite AOD' },
      prediction: { group: null, visible: false, label: 'Predicted PM' },
      policy:     { group: null, visible: true,  label: 'Policy Effect' },
      quality:    { group: null, visible: false, label: 'Data Quality' },
    };
    console.log('✅ Layer system initialized');
  };

  P.setLayerVisible = function (layerName, visible) {
    const layer = this.layers?.[layerName];
    if (!layer) return;
    layer.visible = visible;
    if (layer.group) layer.group.visible = visible;

    // 'stations'는 markerSystem과 연동
    if (layerName === 'stations' && this.markerSystem) {
      this.markerSystem.markerGroups.pm25.visible = visible;
    }
    // 'policy'는 markerSystem policies와 연동
    if (layerName === 'policy' && this.markerSystem) {
      this.markerSystem.markerGroups.policies.visible = visible;
      if (this.layers.policy.group) this.layers.policy.group.visible = visible;
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 2. Satellite / AOD Layer
  // ═══════════════════════════════════════════════════════════

  P.buildSatelliteLayer = async function () {
    if (this.layers.satellite.group) {
      this.scene.remove(this.layers.satellite.group);
    }
    const group = new THREE.Group();
    group.visible = this.layers.satellite.visible;
    this.layers.satellite.group = group;
    this.scene.add(group);

    // 1차: 실제 AOD 데이터 (earthdataService)
    let aodPoints = [];
    try {
      aodPoints = await getAllAodPoints();
    } catch (e) { /* fallback */ }

    // 2차: 날짜별 grid JSON (GitHub Actions 생성)
    let gridData = null;
    if (aodPoints.length === 0) {
      try {
        const today = new Date();
        const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
        const basePath = getBasePath() + '/earthdata';
        const res = await fetch(`${basePath}/aod_pm25_grid_${dateStr}.json`);
        if (res.ok) gridData = await res.json();
      } catch (e) { /* 데이터 없음 */ }
    }

    // AOD 포인트가 있으면 주변 보간 격자 생성
    if (aodPoints.length > 0) {
      gridData = { grid: [] };
      for (const pt of aodPoints) {
        // 도시 주변 5×5 보간 격자 (AOD 기반)
        const estPm25 = pt.aod != null ? pt.aod * 120 : null;
        if (estPm25 == null) continue;
        for (let dlat = -2; dlat <= 2; dlat++) {
          for (let dlon = -2; dlon <= 2; dlon++) {
            const dist = Math.sqrt(dlat * dlat + dlon * dlon);
            const decay = Math.exp(-dist * 0.6);
            gridData.grid.push({
              lat: pt.lat + dlat * 0.5,
              lon: pt.lon + dlon * 0.5,
              value: estPm25 * decay,
              aod: pt.aod * decay,
              city: pt.city,
              source: 'aod_trend',
            });
          }
        }
      }
    }

    // 3차 fallback: pm25Data 기반 synthetic
    if (!gridData || !gridData.grid || gridData.grid.length === 0) {
      gridData = this._generateSyntheticAODGrid();
    }

    if (!gridData?.grid || gridData.grid.length === 0) {
      console.warn('⚠️ No satellite grid data available');
      return;
    }

    // 격자 점 렌더링
    const positions = [];
    const colors = [];

    for (const cell of gridData.grid) {
      const { lat, lon, value, aod } = cell;
      const pm25 = value ?? (aod != null ? aod * 120 : null);
      if (pm25 == null) continue;

      const vec = latLonToVec3(lat, lon, 1.008);
      positions.push(vec.x, vec.y, vec.z);
      const col = pm25ColorThree(pm25);
      colors.push(col.r, col.g, col.b);
    }

    if (positions.length === 0) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    points.userData.layerType = 'satellite';
    group.add(points);

    const src = aodPoints.length > 0 ? 'AOD data' : 'synthetic';
    console.log(`✅ Satellite layer: ${positions.length / 3} points (${src})`);
  };

  // pm25Data로부터 보간 그리드 생성 (AOD 데이터 없을 때)
  P._generateSyntheticAODGrid = function () {
    if (!this.pm25Data || this.pm25Data.size === 0) return null;
    const grid = [];
    for (const [, d] of this.pm25Data) {
      if (d.lat == null || d.lon == null) continue;
      // 도시 주변 5x5 격자
      for (let dlat = -2; dlat <= 2; dlat++) {
        for (let dlon = -2; dlon <= 2; dlon++) {
          const dist = Math.sqrt(dlat * dlat + dlon * dlon);
          const decay = Math.exp(-dist * 0.6);
          grid.push({
            lat: d.lat + dlat * 0.5,
            lon: d.lon + dlon * 0.5,
            value: (d.pm25 || 20) * decay
          });
        }
      }
    }
    return { grid };
  };

  // ═══════════════════════════════════════════════════════════
  // 3. Prediction Layer (predicted p10/p50/p90)
  // ═══════════════════════════════════════════════════════════

  P.buildPredictionLayer = async function () {
    if (this.layers.prediction.group) {
      this.scene.remove(this.layers.prediction.group);
    }
    const group = new THREE.Group();
    group.visible = this.layers.prediction.visible;
    this.layers.prediction.group = group;
    this.scene.add(group);

    let predData = null;
    try {
      const basePath = getBasePath();
      const res = await fetch(`${basePath}/predicted_grid.json`);
      if (res.ok) predData = await res.json();
    } catch (e) { /* 없으면 pm25Data 기반 생성 */ }

    // fallback: pm25Data 기반 예측 모사
    if (!predData) {
      predData = this._buildPredictionFromStations();
    }
    if (!predData || predData.length === 0) return;

    const positions = [], colors = [], sizes = [];

    for (const pt of predData) {
      const { lat, lon, predicted_p50, uncertainty } = pt;
      if (lat == null || lon == null || predicted_p50 == null) continue;

      const vec = latLonToVec3(lat, lon, 1.01);
      positions.push(vec.x, vec.y, vec.z);

      const col = pm25ColorThree(predicted_p50);
      colors.push(col.r, col.g, col.b);

      // 불확실성이 클수록 점 크기 크게
      const unc = uncertainty ?? 10;
      sizes.push(0.015 + Math.min(unc / 200, 0.025));
    }

    if (positions.length === 0) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    points.userData.layerType = 'prediction';
    group.add(points);

    // 불확실성 링 (p90-p10 범위가 큰 지점)
    this._addUncertaintyRings(group, predData);

    console.log(`✅ Prediction layer: ${positions.length / 3} points`);
  };

  P._buildPredictionFromStations = function () {
    if (!this.pm25Data || this.pm25Data.size === 0) return [];
    const result = [];
    for (const [, d] of this.pm25Data) {
      if (d.lat == null || d.lon == null) continue;
      const p50 = d.pm25 || 20;

      // DQSS 기반 불확실성: 품질 낮을수록 불확실성 높음
      const dqss = d.dqss ?? 0.5;
      const baseUnc = p50 * (1.2 - dqss); // dqss=1.0 → 20%, dqss=0.5 → 70%
      const sourceBonus = (d.sourceCount || 1) > 1 ? 0.8 : 1.0; // 다중 소스면 불확실성 감소
      const uncertainty = Math.max(2, baseUnc * sourceBonus);

      result.push({
        lat: d.lat, lon: d.lon,
        predicted_p50: p50,
        predicted_p10: Math.max(0, p50 - uncertainty * 0.8),
        predicted_p90: p50 + uncertainty * 1.2,
        uncertainty,
        source: d.source,
        dqss,
      });
    }
    return result;
  };

  P._addUncertaintyRings = function (group, predData) {
    // 불확실성 상위 20%만 링 표시
    const sorted = [...predData].sort((a, b) => (b.uncertainty || 0) - (a.uncertainty || 0));
    const top = sorted.slice(0, Math.ceil(sorted.length * 0.2));

    for (const pt of top) {
      const { lat, lon, uncertainty } = pt;
      if (!lat || !lon) continue;
      const vec = latLonToVec3(lat, lon, 1.012);
      const ringGeo = new THREE.RingGeometry(0.015, 0.025, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(vec);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.rotateX(Math.PI / 2);
      ring.userData = { uncertainty, lat, lon };
      group.add(ring);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 4. Data Quality (DQSS) Layer
  // ═══════════════════════════════════════════════════════════

  P.buildQualityLayer = async function () {
    if (this.layers.quality.group) {
      this.scene.remove(this.layers.quality.group);
    }
    const group = new THREE.Group();
    group.visible = this.layers.quality.visible;
    this.layers.quality.group = group;
    this.scene.add(group);

    // DQSS 데이터 로드
    let qualityData = null;
    try {
      const basePath = getBasePath();
      const res = await fetch(`${basePath}/data_quality.json`);
      if (res.ok) qualityData = await res.json();
    } catch (e) { /* 없으면 pm25Data 기반 모사 */ }

    // fallback: station별 간단 quality 점수 생성
    const stations = qualityData?.stations ?? this._buildQualityFromStations();

    const positions = [], colors = [];

    for (const st of stations) {
      const { lat, lon, score } = st;
      if (lat == null || lon == null) continue;
      const vec = latLonToVec3(lat, lon, 1.006);
      positions.push(vec.x, vec.y, vec.z);
      const col = dqssColor(score ?? 50);
      colors.push(col.r, col.g, col.b);
    }

    if (positions.length === 0) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    points.userData.layerType = 'quality';
    group.add(points);

    console.log(`✅ Quality layer: ${stations.length} stations`);
  };

  P._buildQualityFromStations = function () {
    const result = [];
    if (!this.pm25Data) return result;
    for (const [name, d] of this.pm25Data) {
      // FusionService에서 이미 계산된 DQSS가 있으면 사용
      if (d.dqss != null) {
        result.push({
          lat: d.lat, lon: d.lon,
          score: Math.round(d.dqss * 100),
          station: name,
          sourceCount: d.sourceCount || 1,
        });
      } else {
        // fallback: 간단한 점수 계산
        let score = 40;
        if (d.pm25 != null && d.pm25 >= 0) score += 25;
        if (d.aqi != null && d.aqi >= 0) score += 15;
        if (d.sourceCount > 1) score += 10;
        if (d.lastUpdate) {
          const age = (Date.now() - new Date(d.lastUpdate).getTime()) / 3600_000;
          if (age <= 1) score += 10;
          else if (age <= 6) score += 5;
        }
        result.push({ lat: d.lat, lon: d.lon, score: Math.min(100, score), station: name });
      }
    }
    return result;
  };

  // ═══════════════════════════════════════════════════════════
  // 5. Legend 생성 (DOM)
  // ═══════════════════════════════════════════════════════════

  P.renderLayerLegend = function (activeLayer) {
    const el = document.getElementById('layer-legend');
    if (!el) return;

    const legends = {
      satellite: {
        title: 'Satellite AOD → PM2.5 (Estimated)',
        items: [
          { color: '#00e400', label: 'Good (≤12 µg/m³)' },
          { color: '#ffff00', label: 'Moderate (≤35)' },
          { color: '#ff7e00', label: 'Unhealthy SG (≤55)' },
          { color: '#ff0000', label: 'Unhealthy (≤150)' },
          { color: '#8f3f97', label: 'Very Unhealthy (≤250)' },
        ],
        note: '위성 AOD + 기상 기반 추정치. 공식 측정 아님.'
      },
      prediction: {
        title: 'ML Predicted PM2.5 (p50)',
        items: [
          { color: '#00e400', label: 'Good (≤12 µg/m³)' },
          { color: '#ffff00', label: 'Moderate (≤35)' },
          { color: '#ff7e00', label: 'Unhealthy SG (≤55)' },
          { color: '#ff0000', label: 'Unhealthy (≤150)' },
          { color: '#ff8800', label: '⭕ High Uncertainty' },
        ],
        note: '주황 링 = 불확실성 높음(p90-p10 큰 지점)'
      },
      quality: {
        title: 'Data Quality Score (DQSS)',
        items: [
          { color: '#00ff88', label: 'High (≥75)' },
          { color: '#ffcc00', label: 'Medium (≥50)' },
          { color: '#ff8800', label: 'Low (≥25)' },
          { color: '#ff2222', label: 'Unreliable (<25)' },
        ],
        note: '신선도·완전성·교차소스 일관성 종합 점수'
      },
    };

    const info = legends[activeLayer];
    if (!info) { el.style.display = 'none'; return; }

    el.style.display = 'block';
    el.innerHTML = `
      <div class="text-white/70 text-[9px] font-bold uppercase tracking-wider mb-1.5">${info.title}</div>
      ${info.items.map(item => `
        <div class="flex items-center gap-1.5 mb-1">
          <span style="background:${item.color}; width:10px; height:10px; border-radius:50%; flex-shrink:0; display:inline-block;"></span>
          <span class="text-white/60 text-[9px]">${item.label}</span>
        </div>`).join('')}
      <p class="text-white/30 text-[8px] mt-1.5 leading-tight italic">${info.note}</p>
    `;
  };

  // ═══════════════════════════════════════════════════════════
  // 6. 레이어 토글 이벤트 바인딩
  // ═══════════════════════════════════════════════════════════

  P.setupLayerToggles = function () {
    const bind = (switchId, checkboxId, layerName) => {
      const sw  = document.getElementById(switchId);
      const cb  = document.getElementById(checkboxId);
      if (!sw || !cb) return;

      // 초기 상태 반영
      const init = this.layers?.[layerName]?.visible ?? false;
      cb.checked = init;
      sw.classList.toggle('checked', init);

      sw.addEventListener('click', () => {
        cb.checked = !cb.checked;
        sw.classList.toggle('checked', cb.checked);
        this.setLayerVisible(layerName, cb.checked);

        // 레이어가 켜지면 데이터 빌드
        if (cb.checked) this._ensureLayerBuilt(layerName);

        // 범례 업데이트: 마지막으로 켜진 비-기본 레이어 표시
        const active = ['satellite','prediction','quality'].find(l => this.layers[l]?.visible);
        this.renderLayerLegend(active);
      });
    };

    // 새 레이어만 여기서 바인딩 (stations/policy는 globe-ui.js setupToggleSwitches에서 처리)
    bind('toggle-satellite-switch',  'toggle-satellite',  'satellite');
    bind('toggle-prediction-switch', 'toggle-prediction', 'prediction');
    bind('toggle-quality-switch',    'toggle-quality',    'quality');
  };

  P._ensureLayerBuilt = async function (layerName) {
    const layer = this.layers?.[layerName];
    if (!layer || layer.group) return; // 이미 빌드됨
    if (layerName === 'satellite')  await this.buildSatelliteLayer();
    if (layerName === 'prediction') await this.buildPredictionLayer();
    if (layerName === 'quality')    await this.buildQualityLayer();
  };

} // end mixLayers
