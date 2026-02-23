/**
 * prediction-layer.js — Globe 위 예측 오버레이
 * ──────────────────────────────────────────────
 * ML Spec §2.6 기반: 예측 그리드를 Globe 위에 시각화
 *
 * 기능:
 *   - 예측 그리드 히트맵 오버레이
 *   - 불확실성 밴드 표시
 *   - 예측 vs 실측 비교 (마커 이중 링)
 *   - 토글 on/off
 */

import * as THREE from 'three';
import { DataService } from '../services/dataService.js';
import { pm25ToHex } from '../utils/color.js';

export class PredictionLayer {
  constructor(scene, earth) {
    this.scene = scene;
    this.earth = earth;
    this.group = new THREE.Group();
    this.group.name = 'prediction-layer';
    this.group.visible = false; // 기본: 숨김 (토글로 표시)
    this.scene.add(this.group);
    
    this._loaded = false;
  }

  /**
   * 예측 그리드 로드 및 시각화
   */
  async load() {
    if (this._loaded) return;

    const grid = await DataService.loadPredictionGrid();
    if (!grid || !grid.predictions) {
      console.warn('⚠️ [PredictionLayer] No prediction grid available');
      return;
    }

    console.log(`🗺️ [PredictionLayer] Rendering ${grid.predictions.length} grid points`);

    const points = grid.predictions;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    for (const p of points) {
      const pos = this._latLonToPos(p.lat, p.lon, 1.015);
      positions.push(pos.x, pos.y, pos.z);

      const color = new THREE.Color(pm25ToHex(p.predicted_pm25));
      colors.push(color.r, color.g, color.b);

      // 불확실성이 클수록 투명하게 (크기 작게)
      const certainty = Math.max(0.3, 1 - (p.uncertainty_rmse / 20));
      sizes.push(4 * certainty);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      size: 4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Points(geometry, material);
    this.group.add(mesh);
    this._loaded = true;

    console.log('✅ [PredictionLayer] Grid rendered');
  }

  /**
   * 토글 표시/숨김
   */
  toggle(visible) {
    this.group.visible = visible;
    if (visible && !this._loaded) {
      this.load();
    }
  }

  /**
   * 애니메이션 업데이트 (펄스 효과)
   */
  update(delta) {
    if (!this.group.visible) return;
    // 부드러운 opacity 펄스
    const mesh = this.group.children[0];
    if (mesh && mesh.material) {
      mesh.material.opacity = 0.4 + Math.sin(Date.now() * 0.001) * 0.15;
    }
  }

  // ── Private ────────────────────────────────────────────────
  _latLonToPos(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    );
  }
}
