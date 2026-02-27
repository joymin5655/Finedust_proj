/**
 * globe-core.js — PolicyGlobe class (core shell + animation loop)
 * ───────────────────────────────────────────────────────────────
 * 리팩토링: globe.js 3,131줄 → 6개 모듈로 분할
 *
 *   globe-core.js     — 클래스 정의, constructor, init, animate
 *   globe-earth.js    — 지구, 대기, 구름, 별, 조명, 국경선
 *   globe-markers.js  — 파티클, PM2.5 마커, 정책 마커
 *   globe-data.js     — 데이터 로딩 (PM2.5, 정책, WAQI, 통계)
 *   globe-ui.js       — 이벤트, 토글, 검색, 필터, 패널, 모달
 *   globe-charts.js   — 차트 렌더링 (트렌드, 타임라인)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { globalDataService } from '../services/shared-data-service.js';
import { EnhancedMarkerSystem } from '../services/enhanced-marker-system.js';
import { policyDataService } from '../services/policy/policy-data-service.js';
import { waqiDataService } from '../services/waqi-data-service.js';
import { policyImpactAnalyzer } from '../services/policy/policy-impact-analyzer.js';
import { PolicyChangeVisualizer, getPolicyChangeVisualizer } from '../services/policy/policy-change-visualizer.js';
import { DataService } from '../services/dataService.module.js';
import { pm25ToHex, pm25ToLabel } from '../utils/color.js';
import { countryToFlag, nameToCode } from '../utils/geo.js';
import { esc, safeUrl } from '../utils/security.js';

// ── Mixin imports ────────────────────────────────────────────
import { mixEarth } from './globe-earth.js';
import { mixMarkers } from './globe-markers.js';
import { mixData } from './globe-data.js';
import { mixUI } from './globe-ui.js';
import { mixCharts } from './globe-charts.js';
import { mixLayers } from './globe-layers.js';
import { mixInteraction } from './globe-interaction.js';

class PolicyGlobe {
  constructor() {
    this.canvas = document.getElementById('globe-canvas');
    this.container = document.getElementById('globe-container');
    if (!this.canvas) { console.error('Canvas element not found'); return; }

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000005);

    // Camera
    const width = window.innerWidth, height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 2.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: window.devicePixelRatio < 2,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;

    // Texture loading progress
    THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
      this.updateLoadingProgress(10 + ((loaded / total) * 20), `Loading resources... ${loaded}/${total}`);
    };

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.3;
    this.controls.maxDistance = 4;
    this.controls.enablePan = false;
    this.controls.autoRotate = false;

    // Globe objects
    this.earth = null;
    this.atmosphere = null;
    this.clouds = null;
    this.stars = null;
    this.particles = null;
    this.pm25Markers = null;
    this.countryBorders = null;
    this.sunLight = null;

    // State
    this.selectedCountry = null;
    this.hoveredCountry = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.showBorders = true;
    this.showPM25 = true;
    this.showParticles = false;
    this.particleSpeed = 1.0;
    this.particlesEnabled = false;
    this.particleCount = 6000;

    // Data
    this.countryPolicies = {};
    this.pm25Data = new Map();
    this.markerSystem = null;
    this.globalDataService = globalDataService;
    this.policyDataService = policyDataService;
    this.policyChangeVisualizer = null;
    this.setupDataSubscriptions();
    this.airQualityAPI = typeof AirQualityAPI !== 'undefined' ? new AirQualityAPI() : null;
    this.userLocation = null;
    this.userLocationMarker = null;
    this.highlightedMarker = null;
    this.predictionLayer = null;

    // Animation
    this.clock = new THREE.Clock();
    this.time = 0;

    console.log('PolicyGlobe initialized');
    this.init();
  }

  async init() {
    try {
      this.countryPolicies = await this.loadCountryPoliciesFromJSON();

      this.createLights();
      this.createStars();
      this.updateLoadingProgress(10, 'Earth');

      await this.createRealisticEarth();
      if (!this.earth) throw new Error('Earth object failed to initialize');
      this.updateLoadingProgress(30, 'Build');

      this.createAtmosphere();
      this.createClouds();
      this.createCountryBorders();
      this.updateLoadingProgress(50, 'Ready');

      // Marker system
      try {
        this.markerSystem = new EnhancedMarkerSystem(this.scene, this.earth);
        this.policyChangeVisualizer = new PolicyChangeVisualizer(this.scene, this.earth);
        if (this.markerSystem?.markerGroups) {
          this.markerSystem.markerGroups.pm25.visible = true;
          this.markerSystem.markerGroups.policies.visible = true;
        }
      } catch (markerError) {
        console.error('❌ Marker system error:', markerError);
        throw markerError;
      }

      // Particles (atmospheric flow arrows) — 토글 기본 off
      this.createParticles();

      this.updateLoadingProgress(60, 'Start');
      this.hideLoadingIndicator();
      this.animate();

      this.backgroundLoadData();

    } catch (error) {
      console.error('❌ Error initializing globe:', error);
      const el = document.getElementById('loading-indicator');
      if (el) {
        el.innerHTML = `
          <div class="flex flex-col items-center gap-4">
            <span class="material-symbols-outlined text-red-500 !text-6xl">error</span>
            <p class="text-white text-lg font-medium">Failed to load</p>
            <p class="text-white/60 text-sm">${error.message}</p>
            <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded">Reload</button>
          </div>`;
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    this.time += delta * 1000;
    this.controls.update();

    if (this.earth) this.earth.rotation.y += 0.0001;
    if (this.clouds) this.clouds.rotation.y += 0.00015;
    if (this.stars) this.stars.rotation.y += 0.00001;

    this.updateParticles();
    if (this.markerSystem) this.markerSystem.updateAll?.(delta);
    if (this.predictionLayer) this.predictionLayer.update?.(delta);
    if (this.globeIntegration) this.globeIntegration.animate?.(delta);

    // Enhancement LOD (safe — method may not exist yet)
    if (typeof this._updateEnhancementLOD === 'function') {
      this._updateEnhancementLOD();
    }
    // Enhanced policy visualization update
    if (this.enhancedPolicyViz?.update) {
      this.enhancedPolicyViz.update(this.time * 0.001);
    }

    // PM2.5 marker pulse animation
    if (this.pm25Markers && this.showPM25) {
      this.pm25Markers.children.forEach((child, index) => {
        if (child.userData?.isUserLocation) {
          const pulse = Math.sin(this.time * 0.004) * 0.4 + 1.2;
          child.scale.setScalar(pulse);
          if (child.material?.emissive) {
            child.material.emissiveIntensity = Math.sin(this.time * 0.003) * 0.4 + 0.6;
          }
        } else if (index % 2 === 0) {
          child.scale.setScalar(Math.sin(this.time * 0.002 + index) * 0.15 + 1);
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// ── Apply mixins ──────────────────────────────────────────────
mixEarth(PolicyGlobe);
mixMarkers(PolicyGlobe);
mixData(PolicyGlobe);
mixUI(PolicyGlobe);
mixCharts(PolicyGlobe);
mixLayers(PolicyGlobe);
mixInteraction(PolicyGlobe);

// ── Bootstrap ─────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PolicyGlobe());
} else {
  new PolicyGlobe();
}

// Load enhancements (safe — no method overrides)
import('../globe-enhancement.js').then(module => {
  module.enhanceGlobe(PolicyGlobe);
  console.log('✅ Globe enhancement methods registered');
  // Enhancement init will be called after backgroundLoadData
}).catch(error => {
  console.warn('⚠️ Globe enhancements unavailable:', error.message);
});

export { PolicyGlobe };
