/**
 * AirLens Policy Globe - Interactive 3D Earth Visualization
 * Explore global air quality policies and regulations on an interactive globe
 * With realistic Earth textures and comprehensive country policy data
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { globalDataService } from './services/shared-data-service.js';
import { EnhancedMarkerSystem } from './services/enhanced-marker-system.js';
import { policyDataService } from './services/policy/policy-data-service.js';
import { waqiDataService } from './services/waqi-data-service.js';
import { policyImpactAnalyzer } from './services/policy/policy-impact-analyzer.js';
import { PolicyChangeVisualizer, getPolicyChangeVisualizer } from './services/policy/policy-change-visualizer.js';

// ── v2.5 리팩토링: 새 모듈 import ──────────────────────────
import { DataService } from './services/dataService.js';
// ML 기능은 향후 구현 예정 — 현재 비활성화
// import { PredictionService } from './services/predictionService.js';
// import { PredictionLayer } from './globe/prediction-layer.js';
// ML 향후 구현 시 활성화
// import { loadPM25Data as loadPM25DataNew, loadAndMergePolicyImpact, computeUnifiedStats } from './globe/globe-data.js';
import { pm25ToHex, pm25ToLabel } from './utils/color.js';
import { countryToFlag, nameToCode } from './utils/geo.js';
import { esc, safeUrl } from './utils/security.js';

class PolicyGlobe {
  constructor() {
    this.canvas = document.getElementById('globe-canvas');
    this.container = document.getElementById('globe-container');

    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000005);

    // Camera setup
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 2.5);

    // Renderer setup (optimized)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: window.devicePixelRatio < 2, // 고해상도 기기는 안티앨리아싱 비활성화
      alpha: false,
      powerPreference: 'high-performance' // 🎯 성능 우선
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false; // 그림자 맵 비활성화 (성능 향상)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // 색상 공간 최적화
    this.renderer.toneMapping = THREE.NoToneMapping; // 톤 매핑 비활성화
    
    // 텍스처 로드 설정 최적화
    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const percent = 10 + ((itemsLoaded / itemsTotal) * 20);
      this.updateLoadingProgress(percent, `Loading resources... ${itemsLoaded}/${itemsTotal}`);
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

    // Selected country
    this.selectedCountry = null;
    this.hoveredCountry = null;

    // Raycaster for country selection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // State
    this.showBorders = true;
    this.showPM25 = true;
    this.showParticles = false;
    this.particleSpeed = 1.0;
    this.particlesEnabled = false;
    this.particleCount = 6000;

    // Data
    this.countryPolicies = {}; // Loaded async in init()
    this.pm25Data = new Map();

    // 🆕 Enhanced Marker System (init()에서 초기화됨)
    this.markerSystem = null;
    this.globalDataService = globalDataService;
    this.policyDataService = policyDataService;
    
    // 🆕 Policy Change Visualizer (init()에서 초기화됨)
    this.policyChangeVisualizer = null;
    
    // 🆕 데이터 변경 구독 설정
    this.setupDataSubscriptions();

    // Air Quality API for real-time data
    this.airQualityAPI = typeof AirQualityAPI !== 'undefined' ? new AirQualityAPI() : null;

    // User location tracking
    this.userLocation = null;
    this.userLocationMarker = null;
    this.highlightedMarker = null;

    // Animation
    this.clock = new THREE.Clock();
    this.time = 0;

    console.log('Policy Globe initialized');
    this.init();
  }

  // ✨ 로딩 진행상황 업데이트 (NEW) - 더 간단하게
  updateLoadingProgress(percent, status) {
    const progressBar = document.getElementById('loading-progress');
    const statusText = document.getElementById('loading-status');
    
    if (progressBar) {
      progressBar.style.width = Math.min(percent, 95) + '%';
    }
    if (statusText) {
      statusText.textContent = status;
    }
  }

  // ✨ 로딩 완료 (NEW)
  hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      this.updateLoadingProgress(100, 'Ready');
      loadingIndicator.style.opacity = '0';
      loadingIndicator.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        loadingIndicator.style.display = 'none';
      }, 300);
    }
  }

  async init() {
    try {
      // ⚡ PHASE 0: 정책 데이터 로드 (JSON)
      this.countryPolicies = await this.loadCountryPoliciesFromJSON();
      
      // ⚡ PHASE 1: 글로브 기본 렌더링 (필수 요소만)
      this.createLights();
      this.createStars();
      this.updateLoadingProgress(10, 'Earth');
      
      await this.createRealisticEarth();
      
      // ✅ 지구가 제대로 생성되었는지 확인
      if (!this.earth) {
        throw new Error('Earth object failed to initialize');
      }
      
      this.updateLoadingProgress(30, 'Build');
      
      this.createAtmosphere();
      this.createClouds();
      this.createCountryBorders();
      this.updateLoadingProgress(50, 'Ready');
      
      // ⚡ PHASE 2: 마커 시스템 초기화
      try {
        this.markerSystem = new EnhancedMarkerSystem(this.scene, this.earth);
        this.policyChangeVisualizer = new PolicyChangeVisualizer(this.scene, this.earth);
        
        // ✅ 마커 시스템이 제대로 생성되었는지 확인
        if (this.markerSystem && this.markerSystem.markerGroups) {
          this.markerSystem.markerGroups.pm25.visible = true;
          this.markerSystem.markerGroups.policies.visible = true;
          console.log('✅ Marker system initialized successfully');
        } else {
          throw new Error('Marker system initialization failed');
        }
      } catch (markerError) {
        console.error('❌ Marker system error:', markerError);
        throw markerError;
      }
      
      // ⚡ 글로브 렌더링 시작 (사용자에게 즉시 보임!)
      this.updateLoadingProgress(60, 'Start');
      this.hideLoadingIndicator();
      this.animate();
      
      // ⚡ v2.5: 예측 레이어 (ML 향후 구현 시 활성화)
      // this.predictionLayer = new PredictionLayer(this.scene, this.earth);
      this.predictionLayer = null;
      
      // ⚡ PHASE 3: 백그라운드에서 데이터 로드
      this.backgroundLoadData();
      
    } catch (error) {
      console.error('❌ Error initializing globe:', error);
      
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.innerHTML = `
          <div class="flex flex-col items-center gap-4">
            <span class="material-symbols-outlined text-red-500 !text-6xl">error</span>
            <p class="text-white text-lg font-medium">Failed to load</p>
            <p class="text-white/60 text-sm">${error.message}</p>
            <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-primary text-white rounded">
              Reload
            </button>
          </div>
        `;
        console.error('Stack:', error.stack);
      }
    }
  }

  // ✨ 백그라운드 데이터 로드 (병렬 최적화 버전)
  async backgroundLoadData() {
    try {
      console.log('📊 Loading background data (parallel)...');
      
      // 1️⃣ 즉시 국가별 정책 마커 생성 (countryPolicies 기반 - 빠름!)
      console.log('Creating country policy markers...');
      this.createCountryPolicyMarkers();
      
      // 2️⃣ PM2.5 데이터와 정책 데이터 병렬 로드
      const [pm25Result, policyResult] = await Promise.allSettled([
        this.loadPM25Data(),
        this.loadPoliciesData()
      ]);
      
      console.log(`✅ PM2.5: ${this.pm25Data.size} stations`);
      
      // 3️⃣ PM2.5 마커 생성 (비동기)
      if (this.pm25Data.size > 0) {
        console.log('Creating PM2.5 markers...');
        await this.createPM25MarkersAsync();
      }
      
      // 4️⃣ UI 설정
      console.log('Setting up UI...');
      this.setupEventListeners();
      this.setupToggleSwitches();
      this.getUserLocationAndHighlight();
      
      // 5️⃣ Enhanced visualization (선택사항)
      if (typeof window.GlobeIntegration !== 'undefined') {
        try {
          this.globeIntegration = new window.GlobeIntegration(this.scene, this.camera, this);
          await this.globeIntegration.init();
        } catch (error) {
          console.warn('⚠️ Enhanced visualization:', error.message);
        }
      }
      
      console.log('✅ All background data loaded');
    } catch (error) {
      console.error('⚠️ Background load error:', error);
    }
  }

  /**
   * 🆕 국가별 정책 마커 생성 (countryPolicies 기반)
   * 즉시 생성 - 외부 API 호출 없음
   */
  createCountryPolicyMarkers() {
    if (!this.countryPolicies || !this.markerSystem) {
      console.warn('⚠️ countryPolicies or markerSystem not available');
      return;
    }
    
    const countries = Object.keys(this.countryPolicies);
    console.log(`📋 Creating ${countries.length} country policy markers...`);
    
    let created = 0;
    for (const country of countries) {
      const policy = this.countryPolicies[country];
      if (!policy) continue;
      
      // effectivenessScore 계산 (effectivenessRating / 10)
      const effectivenessScore = (policy.mainPolicy?.effectivenessRating || 5) / 10;
      
      const marker = this.markerSystem.createPolicyMarker({
        country,
        effectivenessScore,
        flag: policy.flag,
        region: policy.region,
        policyType: policy.policyType,
        mainPolicy: policy.mainPolicy,
        pm25Trends: policy.pm25Trends,
        policyImpact: policy.policyImpact,
        news: policy.news,
        currentAQI: policy.currentAQI,
        currentPM25: policy.currentPM25
      });
      
      if (marker) created++;
    }
    
    console.log(`✅ Created ${created}/${countries.length} country policy markers`);
    
    // 통계 업데이트
    this.updateStatisticsFromCountryPolicies();
  }

  /**
   * 🆕 통합 통계 업데이트 (countryPolicies + index.json + WAQI)
   * 이 함수가 최종 통계를 결정함
   */
  async updateStatisticsFromCountryPolicies() {
    // 1. countryPolicies 기반 통계
    const policyCountries = this.countryPolicies ? Object.keys(this.countryPolicies) : [];
    const policyRegions = new Set();
    let policyCount = 0;
    
    policyCountries.forEach(country => {
      const policy = this.countryPolicies[country];
      if (policy?.region) policyRegions.add(policy.region);
      if (policy?.mainPolicy) policyCount++;
    });

    // 2. index.json에서 추가 국가 로드 시도
    let indexCountries = 0;
    let indexPolicies = 0;
    let indexRegions = [];
    
    try {
      const response = await fetch('data/policy-impact/index.json');
      if (response.ok) {
        const indexData = await response.json();
        indexCountries = indexData.countries?.length || 0;
        indexPolicies = indexData.statistics?.totalPolicies || 0;
        indexRegions = indexData.statistics?.regionsRepresented || [];
      }
    } catch (e) {
      console.warn('⚠️ Could not load index.json for stats');
    }

    // 3. WAQI 데이터 확인 (cities count)
    let waqiCities = 0;
    try {
      const waqiResponse = await fetch('data/waqi/latest.json');
      if (waqiResponse.ok) {
        const waqiData = await waqiResponse.json();
        waqiCities = waqiData.count || waqiData.cities?.length || 0;
      }
    } catch (e) {
      console.warn('⚠️ Could not load WAQI data for stats');
    }

    // 4. 통합 통계 계산 (더 큰 값 사용)
    const totalCountries = Math.max(policyCountries.length, indexCountries);
    const totalPolicies = Math.max(policyCount, indexPolicies);
    const allRegions = new Set([...policyRegions, ...indexRegions]);
    const totalRegions = allRegions.size;
    
    // 5. 글로벌 통계 저장 (다른 곳에서 참조할 수 있도록)
    this.globalStats = {
      countries: totalCountries,
      policies: totalPolicies,
      regions: totalRegions,
      cities: waqiCities,
      regionList: Array.from(allRegions)
    };
    
    // 6. DOM 업데이트
    const countriesEl = document.getElementById('stat-countries');
    const policiesEl = document.getElementById('stat-policies');
    const regionsEl = document.getElementById('stat-regions');
    
    if (countriesEl) countriesEl.textContent = totalCountries;
    if (policiesEl) policiesEl.textContent = totalPolicies;
    if (regionsEl) regionsEl.textContent = totalRegions;
    
    console.log(`📊 Unified Stats: ${totalCountries} countries, ${totalPolicies} policies, ${totalRegions} regions, ${waqiCities} WAQI cities`);
    console.log(`📍 Regions: ${Array.from(allRegions).slice(0, 5).join(', ')}...`);
    
    return this.globalStats;
  }

  // ✨ PM2.5 마커 생성 (최적화 버전)
  async createPM25MarkersAsync() {
    if (!this.pm25Data || this.pm25Data.size === 0) {
      console.warn('⚠️ No PM2.5 data available');
      return;
    }
    
    const total = this.pm25Data.size;
    const batchSize = 50; // 50개씩 빠르게 처리
    let count = 0;
    
    console.log(`📍 Creating ${total} PM2.5 markers (batch: ${batchSize})...`);
    
    const entries = Array.from(this.pm25Data.entries());
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      for (const [id, station] of batch) {
        try {
          this.markerSystem.createPM25Marker({
            id: station.id || id,
            latitude: station.lat || station.latitude || 0,
            longitude: station.lon || station.longitude || 0,
            pm25: station.pm25 || station.aqi || 0,
            country: station.country || 'Unknown'
          });
          count++;
        } catch (error) {
          // 조용히 스킵
        }
      }
      
      // 브라우저에 양보 (렌더링 유지)
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    console.log(`✅ Created ${count}/${total} PM2.5 markers`);
  }

  // ✨ 정책 마커 생성 (legacy - 외부 데이터용)
  async createPolicyMarkersAsync(policyMap) {
    // 이제 createCountryPolicyMarkers()가 대신 처리
    console.log('📋 Policy markers created via createCountryPolicyMarkers()');
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sunLight.position.set(5, 3, 5);
    this.scene.add(this.sunLight);

    const fillLight = new THREE.DirectionalLight(0x6495ed, 0.2);
    fillLight.position.set(-5, -3, -5);
    this.scene.add(fillLight);
  }

  createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true
    });

    const starsVertices = [];
    for (let i = 0; i < 6000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
  }

  async createRealisticEarth() {
    const geometry = new THREE.SphereGeometry(1, 128, 128);

    console.log('🌍 Loading Earth texture...');

    // 📌 안정적인 텍스처 로드 (타임아웃 포함)
    const textureLoader = new THREE.TextureLoader();
    let earthTexture = null;

    try {
      // 타임아웃을 포함한 텍스처 로드
      earthTexture = await Promise.race([
        new Promise((resolve, reject) => {
          textureLoader.load(
            'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
            (texture) => {
              console.log('✅ Earth texture loaded from CDN');
              texture.magFilter = THREE.LinearFilter;
              texture.minFilter = THREE.LinearMipmapLinearFilter;
              texture.generateMipmaps = true;
              resolve(texture);
            },
            undefined,
            (error) => {
              console.warn('⚠️ CDN texture load failed:', error.message);
              resolve(null); // null로 resolve해서 procedural로 진행
            }
          );
        }),
        // 5초 타임아웃
        new Promise((resolve) => {
          setTimeout(() => {
            console.warn('⚠️ Texture load timeout - using procedural');
            resolve(null);
          }, 5000);
        })
      ]);

      // 텍스처 로드 실패시 procedural 생성
      if (!earthTexture) {
        console.log('🎨 Creating procedural Earth texture...');
        earthTexture = this.createProceduralEarthTexture();
      }

      const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpScale: 0.005,
        specular: new THREE.Color(0x333333),
        shininess: 15,
        emissive: new THREE.Color(0x112244),
        emissiveIntensity: 0.1,
        side: THREE.FrontSide,
        flatShading: false
      });

      this.earth = new THREE.Mesh(geometry, material);
      this.scene.add(this.earth);
      console.log('✅ Earth globe created');

    } catch (error) {
      console.error('❌ Error in createRealisticEarth:', error);
      // 최종 fallback: procedural 텍스처 사용
      console.log('🎨 Using fallback procedural Earth texture...');
      const fallbackTexture = this.createProceduralEarthTexture();
      const material = new THREE.MeshPhongMaterial({
        map: fallbackTexture,
        bumpScale: 0.02,
        specular: new THREE.Color(0x222222),
        shininess: 12,
        emissive: new THREE.Color(0x0a0f1a),
        emissiveIntensity: 0.15
      });
      this.earth = new THREE.Mesh(geometry, material);
      this.scene.add(this.earth);
      console.log('✅ Procedural Earth created (fallback)');
    }
  }

  createProceduralEarthTexture() {
    console.log('🎨 Creating procedural Earth texture...');
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Base ocean with realistic gradient
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#0d2c54');
    oceanGradient.addColorStop(0.3, '#1a4d7c');
    oceanGradient.addColorStop(0.5, '#2563a3');
    oceanGradient.addColorStop(0.7, '#1a4d7c');
    oceanGradient.addColorStop(1, '#0d2c54');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add ocean noise
    this.addOceanNoise(ctx, canvas.width, canvas.height);

    // Draw continents
    ctx.fillStyle = '#2d5a3d';
    this.drawRealisticContinents(ctx, canvas.width, canvas.height);

    // Add land details
    this.addLandDetails(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createProceduralEarth(geometry) {
    const texture = this.createProceduralEarthTexture();
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpScale: 0.02,
      specular: new THREE.Color(0x222222),
      shininess: 12,
      emissive: new THREE.Color(0x0a0f1a),
      emissiveIntensity: 0.15
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
    console.log('✅ Procedural Earth created');
  }

  addOceanNoise(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  drawRealisticContinents(ctx, w, h) {
    // North America
    ctx.beginPath();
    ctx.ellipse(w * 0.20, h * 0.25, w * 0.08, h * 0.13, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.ellipse(w * 0.15, h * 0.18, w * 0.025, h * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.ellipse(w * 0.23, h * 0.32, w * 0.02, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.62, w * 0.04, h * 0.13, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Europe
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.24, w * 0.038, h * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.ellipse(w * 0.54, h * 0.28, w * 0.02, h * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();

    // Africa
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.48, w * 0.052, h * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.ellipse(w * 0.545, h * 0.38, w * 0.025, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();

    // Asia
    ctx.beginPath();
    ctx.ellipse(w * 0.68, h * 0.28, w * 0.12, h * 0.15, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.ellipse(w * 0.75, h * 0.35, w * 0.06, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.ellipse(w * 0.64, h * 0.41, w * 0.022, h * 0.048, 0, 0, Math.PI * 2);
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.ellipse(w * 0.80, h * 0.68, w * 0.048, h * 0.058, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antarctica
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.92, w * 0.24, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Greenland
    ctx.beginPath();
    ctx.ellipse(w * 0.35, h * 0.15, w * 0.022, h * 0.035, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Japan
    ctx.beginPath();
    ctx.ellipse(w * 0.82, h * 0.33, w * 0.012, h * 0.025, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  addLandDetails(ctx, w, h) {
    // Add mountain ranges (darker areas)
    ctx.fillStyle = '#1e4028';

    // Himalayas
    ctx.beginPath();
    ctx.ellipse(w * 0.68, h * 0.33, w * 0.04, h * 0.01, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rockies
    ctx.beginPath();
    ctx.ellipse(w * 0.19, h * 0.3, w * 0.015, h * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Andes
    ctx.beginPath();
    ctx.ellipse(w * 0.275, h * 0.62, w * 0.008, h * 0.11, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Add desert regions (lighter)
    ctx.fillStyle = '#3d6840';

    // Sahara
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.40, w * 0.035, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gobi
    ctx.beginPath();
    ctx.ellipse(w * 0.72, h * 0.30, w * 0.03, h * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  createAtmosphere() {
    const geometry = new THREE.SphereGeometry(1.12, 128, 128);
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.15, 0.45, 0.95, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

    this.atmosphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.atmosphere);
  }

  createClouds() {
    const geometry = new THREE.SphereGeometry(1.01, 128, 128);

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 35 + 18;
      const opacity = 0.15 + Math.random() * 0.25;

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (Math.random() > 0.6) {
        ctx.beginPath();
        ctx.arc(x + radius * 0.6, y, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });

    this.clouds = new THREE.Mesh(geometry, material);
    this.scene.add(this.clouds);
  }

  createParticles() {
    // Create atmospheric flow arrows group
    this.particles = new THREE.Group();
    this.particleArrows = [];

    const arrowCount = 400; // Reduced count for better performance with 3D arrows
    const radius = 1.03;

    for (let i = 0; i < arrowCount; i++) {
      // Distribute arrows more evenly using Fibonacci sphere
      const phi = Math.acos(1 - 2 * (i + 0.5) / arrowCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const position = new THREE.Vector3(x, y, z);

      // Calculate atmospheric flow direction
      // Latitude-dependent flow (jet streams at mid-latitudes)
      const latitude = (Math.PI / 2) - phi;
      const latitudeDeg = (latitude * 180) / Math.PI;

      // Eastward flow (westerlies), stronger at jet stream latitudes (30-60 degrees)
      const jetStreamFactor = Math.abs(latitudeDeg) > 30 && Math.abs(latitudeDeg) < 60 ? 1.5 : 1.0;

      // Create flow direction (primarily eastward)
      const flowDirection = new THREE.Vector3(
        -Math.sin(theta),
        0,
        Math.cos(theta)
      );

      // Add slight north-south component based on latitude
      if (latitudeDeg > 0 && latitudeDeg < 30) {
        flowDirection.y += 0.1; // Tropical circulation
      } else if (latitudeDeg < 0 && latitudeDeg > -30) {
        flowDirection.y -= 0.1;
      }

      flowDirection.normalize();

      // Create arrow with custom geometry
      const arrowLength = 0.04 * jetStreamFactor;
      const arrowHeadLength = 0.012 * jetStreamFactor;
      const arrowHeadWidth = 0.008 * jetStreamFactor;

      // Arrow shaft (cylinder)
      const shaftGeometry = new THREE.CylinderGeometry(0.002, 0.002, arrowLength - arrowHeadLength, 4);
      const shaftMesh = new THREE.Mesh(shaftGeometry);
      shaftMesh.position.y = (arrowLength - arrowHeadLength) / 2;

      // Arrow head (cone)
      const headGeometry = new THREE.ConeGeometry(arrowHeadWidth, arrowHeadLength, 4);
      const headMesh = new THREE.Mesh(headGeometry);
      headMesh.position.y = arrowLength - arrowHeadLength / 2;

      // Combine shaft and head
      const arrowGroup = new THREE.Group();
      arrowGroup.add(shaftMesh);
      arrowGroup.add(headMesh);

      // Color based on speed (jet stream = cyan, normal = blue-green)
      const color = new THREE.Color();
      if (jetStreamFactor > 1) {
        color.setHSL(0.52, 0.9, 0.6); // Bright cyan for jet streams
      } else {
        color.setHSL(0.55, 0.7, 0.5); // Blue-green for normal flow
      }

      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        depthWrite: false
      });

      shaftMesh.material = material;
      headMesh.material = material;

      // Position arrow at globe surface
      arrowGroup.position.copy(position);

      // Orient arrow to point in flow direction
      const up = position.clone().normalize();
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), flowDirection);
      arrowGroup.quaternion.copy(quaternion);

      // Align arrow to be tangent to sphere surface
      const localUp = up.clone();
      const localRight = new THREE.Vector3().crossVectors(localUp, flowDirection).normalize();
      const localForward = new THREE.Vector3().crossVectors(localRight, localUp).normalize();

      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeBasis(localRight, localUp, localForward);
      arrowGroup.quaternion.setFromRotationMatrix(rotationMatrix);

      // Additional rotation to point arrow in flow direction
      arrowGroup.rotateOnAxis(localUp, Math.atan2(flowDirection.z, flowDirection.x));

      this.particles.add(arrowGroup);
      this.particleArrows.push({
        group: arrowGroup,
        basePosition: position.clone(),
        flowDirection: flowDirection.clone(),
        speed: jetStreamFactor,
        phase: Math.random() * Math.PI * 2 // For animation
      });
    }

    this.particles.visible = this.particlesEnabled;
    this.scene.add(this.particles);
  }

  updateParticles() {
    if (!this.particles || !this.particlesEnabled || !this.particleArrows) return;

    // Animate arrows with pulsing effect to show flow
    this.particleArrows.forEach((arrow, index) => {
      // Pulsing opacity animation based on phase
      const pulseSpeed = 0.001 * arrow.speed;
      const opacity = 0.5 + Math.sin(this.time * pulseSpeed + arrow.phase) * 0.3;

      // Update opacity for both shaft and head
      arrow.group.children.forEach(mesh => {
        if (mesh.material) {
          mesh.material.opacity = opacity;
        }
      });

      // Slight scale animation for jet stream arrows
      if (arrow.speed > 1) {
        const scale = 1.0 + Math.sin(this.time * 0.002 + arrow.phase) * 0.1;
        arrow.group.scale.setScalar(scale);
      }
    });
  }

  createCountryBorders() {
    // Simple country border representation
    const group = new THREE.Group();
    const material = new THREE.LineBasicMaterial({
      color: 0x55aaff,
      transparent: true,
      opacity: 0.3
    });

    // Latitude lines for reference
    for (let lat = -60; lat <= 60; lat += 30) {
      const radius = Math.cos((lat * Math.PI) / 180);
      const y = Math.sin((lat * Math.PI) / 180);
      const points = [];

      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    // Longitude lines
    for (let lon = 0; lon < 180; lon += 30) {
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const lat = (i / 64) * Math.PI - Math.PI / 2;
        const y = Math.sin(lat);
        const radius = Math.cos(lat);
        const angle = (lon * Math.PI) / 180;

        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    this.countryBorders = group;
    this.countryBorders.visible = this.showBorders;
    this.scene.add(this.countryBorders);
  }

  /**
   * Load REAL PM2.5 data - OPTIMIZED SYSTEM
   * Priority 1: Local WAQI JSON (pre-fetched by GitHub Actions)
   * Priority 2: Open-Meteo (EU Copernicus CAMS) - NO TOKEN
   * Priority 3: WAQI API (if token available)
   */
  async loadPM25Data() {
    console.log('🌍 Loading PM2.5 data...');
    
    try {
      // 1차 시도: 로컬 WAQI JSON 데이터 (GitHub Actions에서 수집된 데이터)
      console.log('📊 Trying local WAQI JSON data first...');
      const waqiData = await waqiDataService.loadWAQIData();
      
      if (waqiData && waqiData.size > 0) {
        console.log(`✅ Loaded ${waqiData.size} cities from WAQI JSON!`);
        this.pm25Data = waqiData;
        
        // 통계 출력
        const stats = waqiDataService.getStats();
        if (stats) {
          console.log(`📈 Data Stats: Avg AQI: ${stats.averageAQI}, Max: ${stats.maxAQI}, Min: ${stats.minAQI}`);
        }
        return;
      }
    } catch (error) {
      console.warn('⚠️ WAQI JSON load failed:', error.message);
    }

    // 2차 시도: Open-Meteo (폴백)
    console.log('🔄 Falling back to Open-Meteo...');
    await this.loadPM25Data_OpenMeteo();
  }

  /**
   * Mode 1: Open-Meteo (EU Copernicus CAMS) - NO TOKEN REQUIRED
   * 150+ major cities worldwide
   */
  async loadPM25Data_OpenMeteo() {
    // Expanded list of 150+ major cities worldwide
    // Load cities from JSON (was ~180 lines of hardcoded data)
    let cities = [];
    try {
      const basePath = window.location.hostname.includes('github.io')
        ? '/Finedust_proj/app/data'
        : (window.location.origin + '/data');
      const res = await fetch(`${basePath}/major-cities.json`);
      if (res.ok) cities = await res.json();
    } catch (e) {
      console.warn('⚠️ Failed to load major-cities.json');
    }
    if (cities.length === 0) {
      // Minimal fallback
      cities = [
        { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
        { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
        { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'United States' },
        { name: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom' }
      ];
    }

    console.log(`📍 Fetching REAL data for ${cities.length} major cities from EU Copernicus...`);

    this.pm25Data = new Map();
    let successCount = 0;
    let failCount = 0;

    // Fetch data for each city from Open-Meteo (EU Copernicus CAMS)
    for (const city of cities) {
      try {
        // Open-Meteo Air Quality API (NO TOKEN REQUIRED)
        const params = new URLSearchParams({
          latitude: city.lat,
          longitude: city.lon,
          current: 'pm2_5,pm10,us_aqi',
          timezone: 'auto'
        });
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`;
        const response = await fetch(url);

        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch data for ${city.name}`);
          failCount++;
          continue;
        }

        const data = await response.json();

        if (data.current) {
          const current = data.current;
          const pm25 = current.pm2_5 || null;
          const aqi = current.us_aqi || null;

          if (pm25 !== null || aqi !== null) {
            this.pm25Data.set(city.name, {
              lat: city.lat,
              lon: city.lon,
              pm25: pm25,
              aqi: aqi,
              country: city.country,
              stationName: city.name,
              source: 'EU Copernicus CAMS',
              lastUpdate: new Date().toISOString()
            });
            successCount++;
          } else {
            failCount++;
          }
        } else {
          failCount++;
        }

        // Add small delay to be respectful to the free API
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.error(`❌ Error fetching data for ${city.name}:`, error.message);
        failCount++;
      }
    }

    console.log(`✅ Loaded REAL PM2.5 data: ${successCount} cities succeeded, ${failCount} failed`);
    console.log(`🇪🇺 Showing official EU Copernicus CAMS data from ${this.pm25Data.size} locations worldwide`);
    console.log('✅ NO TOKEN REQUIRED - All data is FREE and PUBLIC!');
  }

  /**
   * Mode 2: WAQI Map Bounds API - ENHANCED MODE (Optional Token)
   * Loads 1000+ real-time monitoring stations from WAQI
   * Uses map bounds API to get all stations visible on globe
   */
  async loadPM25Data_WAQI(token) {
    console.log('🚀 Enhanced Mode: Fetching data from WAQI Map Bounds API...');

    this.pm25Data = new Map();

    // Fetch multiple regions to cover the whole world
    // WAQI map bounds API: https://api.waqi.info/map/bounds/?token={token}&latlng={y1},{x1},{y2},{x2}
    const regions = [
      { name: 'Asia-Pacific', bounds: [-90, 60, 90, 180] },
      { name: 'Europe-Africa', bounds: [-90, -30, 90, 60] },
      { name: 'Americas', bounds: [-90, -180, 90, -30] }
    ];

    let totalStations = 0;

    for (const region of regions) {
      try {
        const [y1, x1, y2, x2] = region.bounds;
        const url = `https://api.waqi.info/map/bounds/?token=${token}&latlng=${y1},${x1},${y2},${x2}`;

        console.log(`📍 Fetching ${region.name} stations...`);
        const response = await fetch(url);

        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch ${region.name}`);
          continue;
        }

        const data = await response.json();

        if (data.status === 'ok' && data.data) {
          const stations = data.data;
          console.log(`✅ Found ${stations.length} stations in ${region.name}`);

          stations.forEach(station => {
            if (station.lat && station.lon && station.aqi) {
              // Generate unique ID for each station
              const stationId = station.uid || `${station.lat}_${station.lon}`;

              // Calculate PM2.5 from AQI (approximate conversion)
              // US AQI formula: AQI = (PM2.5 - 0) / (12 - 0) * (50 - 0) + 0
              // Reverse: PM2.5 ≈ AQI * 0.24 for AQI 0-50
              // For simplicity: PM2.5 ≈ AQI / 3.5 (rough average)
              const aqi = parseFloat(station.aqi);
              const estimatedPM25 = aqi <= 50 ? aqi * 0.24 :
                                   aqi <= 100 ? 12 + (aqi - 50) * 0.7 :
                                   aqi <= 150 ? 35.5 + (aqi - 100) * 0.98 :
                                   aqi <= 200 ? 55.5 + (aqi - 150) * 1.38 :
                                   150.5 + (aqi - 200) * 2.0;

              this.pm25Data.set(stationId, {
                lat: station.lat,
                lon: station.lon,
                pm25: estimatedPM25,
                aqi: aqi,
                country: station.country || 'Unknown',
                stationName: station.station?.name || `Station ${stationId}`,
                source: 'WAQI',
                lastUpdate: station.station?.time || new Date().toISOString(),
                uid: station.uid
              });
              totalStations++;
            }
          });

          // Small delay between regions
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`❌ Error fetching ${region.name}:`, error.message);
      }
    }

    console.log(`✅ Enhanced Mode: Loaded ${totalStations} real-time monitoring stations from WAQI!`);
    console.log(`🌍 Showing official WAQI data from ${this.pm25Data.size} locations worldwide`);
  }









  /**
   * Get user's current GPS location and highlight their country on the globe
   */
  async getUserLocationAndHighlight() {
    if (!('geolocation' in navigator)) {
      console.log('📍 Geolocation not supported');
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000 // Cache for 10 minutes
        });
      });

      this.userLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };

      console.log('📍 User location:', this.userLocation);

      // Find and highlight nearest city/country
      this.highlightUserLocation();
    } catch (error) {
      console.log('📍 Location permission denied or unavailable:', error.message);
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Find nearest city and highlight it on the globe
   */
  highlightUserLocation() {
    if (!this.userLocation || !this.pm25Data) return;

    let nearestCity = null;
    let minDistance = Infinity;

    // Find nearest city marker
    this.pm25Data.forEach((data, city) => {
      const distance = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lon,
        data.lat,
        data.lon
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = { city, data, distance };
      }
    });

    if (nearestCity && nearestCity.distance < 500) { // Within 500km
      console.log(`📍 Nearest city: ${nearestCity.city} (${nearestCity.distance.toFixed(0)}km away)`);

      // Find the marker in the scene and mark it as highlighted
      if (this.pm25Markers) {
        this.pm25Markers.children.forEach((marker) => {
          if (marker.userData && marker.userData.city === nearestCity.city) {
            marker.userData.isUserLocation = true;
            this.highlightedMarker = marker;

            // Make it more visible
            if (marker.material) {
              marker.material.emissive = new THREE.Color(0x25e2f4);
              marker.material.emissiveIntensity = 0.8;
            }
          }
        });
      }
    }
  }

  /**
   * Load country policy data with historical PM2.5 trends
   *
   * NOTE: All historical PM2.5 trends are from official government sources:
   * - WHO Global Air Quality Database
   * - OECD Air Quality Statistics
   * - World Bank Air Pollution Data
   * - National environmental agencies
   *
   * currentAQI and currentPM25 are reference values for context.
   * Real-time data is fetched separately via loadPM25Data() from:
   * - EU Copernicus CAMS (default, no token)
   * - WAQI API (optional)
   * - OpenWeather API (optional)
   */
  /**
   * Load country policy data from JSON file
   * Data extracted from hardcoded JS to app/data/country-policies.json
   */
  async loadCountryPoliciesFromJSON() {
    try {
      const basePath = window.location.hostname.includes('github.io')
        ? '/Finedust_proj/app/data'
        : (window.location.origin + '/data');
      const res = await fetch(`${basePath}/country-policies.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log(`✅ Loaded ${Object.keys(data).length} country policies from JSON`);
      return data;
    } catch (error) {
      console.warn('⚠️ Failed to load country-policies.json, using fallback:', error.message);
      return this._fallbackCountryPolicies();
    }
  }

  /**
   * Minimal fallback data (only if JSON fails to load)
   */
  _fallbackCountryPolicies() {
    return {
      'South Korea': { flag: '🇰🇷', region: 'East Asia', policyType: 'Comprehensive',
        mainPolicy: { name: 'Fine Dust Special Act', description: 'Comprehensive legislation to reduce PM2.5', implementationDate: '2019-02-15', effectivenessRating: 8 },
        news: [], currentAQI: 68, currentPM25: 16.8 },
      'China': { flag: '🇨🇳', region: 'East Asia', policyType: 'Comprehensive',
        mainPolicy: { name: 'Blue Sky Protection Campaign', description: 'National initiative targeting industrial emissions', implementationDate: '2018-06-01', effectivenessRating: 7 },
        news: [], currentAQI: 115, currentPM25: 29.2 },
      'United States': { flag: '🇺🇸', region: 'North America', policyType: 'Monitoring & Standards',
        mainPolicy: { name: 'Clean Air Act Amendments', description: 'Federal PM2.5 standards', implementationDate: '1990-11-15', effectivenessRating: 9 },
        news: [], currentAQI: 34, currentPM25: 8.2 }
    };
  }

  }

  updateGlobalStatistics(statistics) {
    // 외부 통계가 들어와도 globalStats가 더 정확하면 무시
    if (this.globalStats && this.globalStats.countries > 0) {
      console.log('⏩ Skipping external stats, using globalStats');
      return;
    }
    
    if (!statistics) return;

    // Update countries count
    const countriesEl = document.getElementById('stat-countries');
    if (countriesEl && statistics.totalCountries) {
      countriesEl.textContent = statistics.totalCountries;
    }

    // Update policies count
    const policiesEl = document.getElementById('stat-policies');
    if (policiesEl && statistics.totalPolicies) {
      policiesEl.textContent = statistics.totalPolicies;
    }

    // Update regions count
    const regionsEl = document.getElementById('stat-regions');
    if (regionsEl && statistics.regionsRepresented) {
      regionsEl.textContent = statistics.regionsRepresented.length;
    }

    console.log('Global statistics updated:', statistics);
  }

  async loadPolicyImpactData() {
    try {
      // Load the index to know which countries have policy impact data
      const indexResponse = await fetch('data/policy-impact/index.json');
      if (!indexResponse.ok) {
        console.warn('Policy impact index not found, using fallback data');
        return {};
      }

      const index = await indexResponse.json();
      const policyImpactData = {};

      // Update global statistics from index
      this.updateGlobalStatistics(index.statistics);

      // Load each country's policy impact data
      for (const countryInfo of index.countries) {
        try {
          const dataResponse = await fetch(`data/policy-impact/${countryInfo.dataFile}`);
          if (dataResponse.ok) {
            const countryData = await dataResponse.json();
            policyImpactData[countryData.country] = countryData;
            console.log(`Loaded policy impact data for ${countryData.country}`);
          }
        } catch (error) {
          console.warn(`Failed to load policy impact data for ${countryInfo.country}:`, error);
        }
      }

      return policyImpactData;
    } catch (error) {
      console.error('Error loading policy impact data:', error);
      return {};
    }
  }

  mergePolicyData() {
    console.log('🔄 mergePolicyData: Starting merge...');
    
    // Merge policy impact data with existing country policies
    if (!this.policyImpactData) {
      console.error('❌ mergePolicyData: No policyImpactData to merge');
      return;
    }

    console.log(`📦 mergePolicyData: Found ${Object.keys(this.policyImpactData).length} countries in policyImpactData`);

    Object.keys(this.policyImpactData).forEach(countryName => {
      const impactData = this.policyImpactData[countryName];
      const existingPolicy = this.countryPolicies[countryName];

      if (existingPolicy && impactData.policies && impactData.policies.length > 0) {
        // Merge with existing data
        const mainPolicy = impactData.policies[0];
        existingPolicy.policyImpactData = {
          policies: impactData.policies,
          realTimeData: impactData.realTimeData,
          news: impactData.news
        };

        // Update current AQI and PM2.5 from real-time data if available
        if (impactData.realTimeData) {
          existingPolicy.currentAQI = impactData.realTimeData.aqi || existingPolicy.currentAQI;
          existingPolicy.currentPM25 = impactData.realTimeData.currentPM25 || existingPolicy.currentPM25;
        }

        // Update news if available
        if (impactData.news && impactData.news.length > 0) {
          existingPolicy.news = impactData.news;
        }
      } else if (!existingPolicy && impactData.policies && impactData.policies.length > 0) {
        // Add new country from JSON data that doesn't exist in hardcoded countryPolicies
        const mainPolicy = impactData.policies[0];
        const realTimeData = impactData.realTimeData || {};

        this.countryPolicies[countryName] = {
          flag: impactData.flag || '🌍',
          region: impactData.region || 'Unknown',
          policyType: mainPolicy.type || 'Air Quality Policy',
          mainPolicy: {
            name: mainPolicy.name,
            description: mainPolicy.description,
            implementationDate: mainPolicy.implementationDate,
            effectivenessRating: this.calculateEffectivenessRating(mainPolicy.impact)
          },
          news: impactData.news || [],
          currentAQI: realTimeData.aqi || 0,
          currentPM25: realTimeData.currentPM25 || 0,
          policyImpactData: {
            policies: impactData.policies,
            realTimeData: impactData.realTimeData,
            news: impactData.news
          }
        };

        console.log(`Added new country to policies: ${countryName}`);
      }
    });
  }

  calculateEffectivenessRating(impact) {
    if (!impact || !impact.analysis) return 5;

    const percentChange = impact.analysis.percentChange;
    const isSignificant = impact.analysis.significant;

    // Rate from 1-10 based on PM2.5 reduction
    if (percentChange <= -30) return isSignificant ? 10 : 9;
    if (percentChange <= -20) return isSignificant ? 9 : 8;
    if (percentChange <= -10) return isSignificant ? 8 : 7;
    if (percentChange < 0) return isSignificant ? 7 : 6;
    if (percentChange < 10) return isSignificant ? 5 : 4;
    if (percentChange < 20) return isSignificant ? 4 : 3;
    return isSignificant ? 3 : 2;
  }

  /**
   * 🆕 WAQI 데이터로 정책 카드 업데이트
   */
  async updatePolicyCardWithWAQI(countryName, policy) {
    try {
      const stations = await waqiDataService.loadWAQIData();
      const countryStations = [];
      
      stations.forEach((station, id) => {
        const stationCountry = (station.country || '').toLowerCase();
        if (stationCountry.includes(countryName.toLowerCase()) || 
            countryName.toLowerCase().includes(stationCountry)) {
          countryStations.push(station);
        }
      });
      
      if (countryStations.length > 0) {
        const avgPM25 = countryStations.reduce((sum, s) => sum + (s.pm25 || 0), 0) / countryStations.length;
        const avgAQI = countryStations.reduce((sum, s) => sum + (s.aqi || 0), 0) / countryStations.length;
        
        policy.currentPM25 = Math.round(avgPM25 * 10) / 10;
        policy.currentAQI = Math.round(avgAQI);
        
        console.log(`✅ Updated ${countryName} with WAQI data: PM2.5=${policy.currentPM25}, AQI=${policy.currentAQI}`);
      }
    } catch (error) {
      console.warn(`⚠️ WAQI data update failed for ${countryName}`);
    }
  }

  /**
   * 🆕 정책 효과도 표시 업데이트
   */
  updateEffectivenessDisplay(countryName, policy) {
    const percentEl = document.getElementById('policy-effectiveness-percent');
    const barEl = document.getElementById('policy-effectiveness-bar');
    const statusEl = document.getElementById('policy-effectiveness-status');
    
    if (!percentEl || !barEl || !statusEl) return;
    
    // 효과도 계산
    let effectivenessScore = 50;
    let statusText = 'Analyzing policy impact...';
    
    if (policy.policyImpactData?.policies?.[0]?.impact) {
      const impact = policy.policyImpactData.policies[0].impact;
      const percentChange = impact.analysis?.percentChange || 0;
      
      // 점수 계산 (0-100%)
      if (percentChange <= -30) effectivenessScore = 95;
      else if (percentChange <= -20) effectivenessScore = 85;
      else if (percentChange <= -15) effectivenessScore = 75;
      else if (percentChange <= -10) effectivenessScore = 65;
      else if (percentChange <= -5) effectivenessScore = 55;
      else if (percentChange < 0) effectivenessScore = 50;
      else if (percentChange < 10) effectivenessScore = 40;
      else effectivenessScore = 30;
      
      // 상태 텍스트
      if (effectivenessScore >= 80) statusText = '✨ Highly Effective - Significant PM2.5 reduction';
      else if (effectivenessScore >= 60) statusText = '✓ Effective - Measurable improvement';
      else if (effectivenessScore >= 40) statusText = '~ Moderate - Some progress observed';
      else statusText = '⚠ Limited - Needs stronger measures';
    }
    
    // UI 업데이트
    percentEl.textContent = `${effectivenessScore}%`;
    barEl.style.width = `${effectivenessScore}%`;
    statusEl.textContent = statusText;
    
    // 색상 변경
    if (effectivenessScore >= 70) {
      barEl.style.background = 'linear-gradient(90deg, #00ff88, #00dd66)';
      percentEl.style.color = '#00ff88';
    } else if (effectivenessScore >= 50) {
      barEl.style.background = 'linear-gradient(90deg, #ffdd00, #ffaa00)';
      percentEl.style.color = '#ffdd00';
    } else {
      barEl.style.background = 'linear-gradient(90deg, #ff6600, #ff4400)';
      percentEl.style.color = '#ff6600';
    }
  }

  async loadRealTimeAirQuality() {
    if (!this.airQualityAPI) {
      console.warn('AirQualityAPI not available');
      return;
    }

    console.log('Loading real-time air quality data...');

    // Get list of countries with policy impact data
    const countryCodes = this.policyImpactData
      ? Object.values(this.policyImpactData).map(data => data.countryCode)
      : ['CN', 'IN', 'GB', 'KR', 'JP', 'US'];

    try {
      // Fetch real-time data for all countries
      const realTimeData = await this.airQualityAPI.fetchMultipleCountries(countryCodes);

      // Update policy data with real-time information
      Object.entries(realTimeData).forEach(([countryCode, data]) => {
        // Find country by code
        const countryEntry = this.policyImpactData
          ? Object.values(this.policyImpactData).find(p => p.countryCode === countryCode)
          : null;

        if (countryEntry) {
          // Update with real-time data
          this.airQualityAPI.updatePolicyDataWithRealTime(countryEntry, data);
          console.log(`Updated real-time data for ${countryEntry.country}: PM2.5 = ${data.avgPM25} µg/m³`);

          // Also update the merged policy data in countryPolicies
          const existingPolicy = this.countryPolicies[countryEntry.country];
          if (existingPolicy) {
            existingPolicy.currentAQI = data.aqi;
            existingPolicy.currentPM25 = data.avgPM25;

            if (existingPolicy.policyImpactData) {
              existingPolicy.policyImpactData.realTimeData = countryEntry.realTimeData;
            }
          }
        }
      });

      console.log(`Real-time air quality data loaded for ${Object.keys(realTimeData).length} countries`);
    } catch (error) {
      console.error('Error loading real-time air quality data:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // showCountryPolicy  ← 전략 v2: globeUpdatePanel 위임
  // 클릭된 국가명 → countryPolicies 룩업 → 통합 패널에 전달
  // ─────────────────────────────────────────────────────────────────────
  showCountryPolicy(countryName) {
    const p = this.countryPolicies[countryName];
    if (!p) {
      console.log('No policy data for', countryName);
      return;
    }

    // countryCode 추정: data에 없으면 이름 기반 fallback
    const countryCode = p.countryCode || _nameToCode(countryName);

    const otherPolicies = p.additionalPolicies || p.otherPolicies || [];

    window.globeUpdatePanel({
      type:          'country',
      name:          countryName,
      flag:          p.flag   || '🌍',
      region:        p.region || '',
      lat:           p.coordinates?.lat ?? null,
      lon:           p.coordinates?.lon ?? null,
      pm25:          p.currentPM25  ?? 0,
      countryCode,
      policy: p.mainPolicy ? {
        title:       p.mainPolicy.name,
        description: p.mainPolicy.description,
        date:        p.mainPolicy.implementationDate,
        rating:      p.mainPolicy.effectivenessRating
      } : null,
      impact: p.policyImpact ? {
        rate:    p.policyImpact.reductionRate,
        period:  p.policyImpact.timeframe,
        measures: p.policyImpact.keyMeasures || []
      } : null,
      trends:        p.pm25Trends   || [],
      otherPolicies: otherPolicies.map(op => ({ year: op.year, title: op.name || op.title || op }))
    });
  }


  /**
   * Display country PM2.5 trends and policy impact data
   * This is called when clicking on country policy markers
   */
  showCountryPolicyTrends(countryName, policyData) {
    console.log(`📊 Showing PM2.5 trends for ${countryName}`);

    const card = document.getElementById('policy-card');
    card.style.display = 'block';

    // Trigger animation
    setTimeout(() => {
      card.classList.add('show');
    }, 10);

    // Basic info
    document.getElementById('policy-flag').textContent = policyData.flag;
    document.getElementById('policy-country').textContent = countryName;
    document.getElementById('policy-region').textContent = policyData.region;
    document.getElementById('policy-name').textContent = policyData.mainPolicy.name;
    document.getElementById('policy-desc').textContent = policyData.mainPolicy.description;
    document.getElementById('policy-date').textContent = `Implemented: ${policyData.mainPolicy.implementationDate}`;

    // Current AQI and PM2.5
    const aqiElement = document.getElementById('policy-aqi');
    aqiElement.textContent = policyData.currentAQI;
    aqiElement.className = `text-2xl font-bold ${this.getAQIClass(policyData.currentAQI)}`;
    document.getElementById('policy-pm25').textContent = `${policyData.currentPM25} µg/m³`;

    // Display PM2.5 trends section
    const impactSection = document.getElementById('policy-impact-section');
    const timelineSection = document.getElementById('policy-timeline-section');

    if (policyData.pm25Trends && policyData.pm25Trends.length > 0) {
      // Show impact summary
      impactSection.style.display = 'block';

      const firstYear = policyData.pm25Trends[0];
      const lastYear = policyData.pm25Trends[policyData.pm25Trends.length - 1];

      document.getElementById('impact-before').textContent = `${firstYear.value} µg/m³`;
      document.getElementById('impact-after').textContent = `${lastYear.value} µg/m³`;

      const absoluteChange = lastYear.value - firstYear.value;
      const percentChange = ((absoluteChange / firstYear.value) * 100).toFixed(1);

      const changeElement = document.getElementById('impact-change');
      changeElement.textContent = `${percentChange > 0 ? '+' : ''}${percentChange}%`;
      changeElement.className = `text-lg font-bold ${percentChange < 0 ? 'text-green-400' : 'text-red-400'}`;

      // Policy impact status
      const statusInfo = policyData.policyImpact?.status || 'Ongoing';
      const reductionRate = policyData.policyImpact?.reductionRate || 'N/A';
      document.getElementById('impact-significance').textContent =
        `Status: ${statusInfo} | Reduction: ${reductionRate}`;

      // Render PM2.5 trends chart
      timelineSection.style.display = 'block';
      this.renderPM25TrendsChart(policyData.pm25Trends, countryName, policyData.policyImpact);
    } else {
      impactSection.style.display = 'none';
      timelineSection.style.display = 'none';
    }

    // Display news
    const newsContainer = document.getElementById('policy-news');
    newsContainer.innerHTML = '';

    if (policyData.news && policyData.news.length > 0) {
      policyData.news.forEach(news => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item bg-black/20 rounded-lg p-3 cursor-pointer hover:bg-black/30 transition-colors';
        newsItem.innerHTML = `
          <h6 class="text-sm font-medium text-white mb-1">${_esc(news.title)}</h6>
          <div class="flex items-center justify-between text-xs text-white/60">
            <span>${_esc(news.source)}</span>
            <span>${_esc(news.date)}</span>
          </div>
        `;
        // URL 클릭 — javascript: scheme 차단
        newsItem.addEventListener('click', () => {
          const safeUrl = _safeUrl(news.url);
          if (safeUrl) window.open(safeUrl, '_blank', 'noopener,noreferrer');
        });
        newsContainer.appendChild(newsItem);
      });
    } else {
      newsContainer.innerHTML = '<p class="text-sm text-white/60 text-center py-2">No recent news available</p>';
    }
  }

  /**
   * Render PM2.5 trends chart with historical data
   */
  renderPM25TrendsChart(trendsData, countryName, policyImpact) {
    const canvas = document.getElementById('policy-timeline-chart');
    if (!canvas) return;

    // Destroy existing chart
    if (this.timelineChart) {
      this.timelineChart.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Prepare data
    const labels = trendsData.map(item => item.year.toString());
    const pm25Values = trendsData.map(item => item.value);

    // Find policy implementation point
    const implementationYearIndex = trendsData.findIndex(item => item.note.includes('🔸'));

    // Create gradient for the line
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(37, 226, 244, 0.8)');
    gradient.addColorStop(1, 'rgba(37, 226, 244, 0.2)');

    this.timelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `PM2.5 Annual Average (µg/m³)`,
          data: pm25Values,
          borderColor: '#25e2f4',
          backgroundColor: gradient,
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: (context) => {
            const index = context.dataIndex;
            return trendsData[index].note.includes('🔸') ? '#ff6b35' :
                   trendsData[index].note.includes('✅') ? '#00ff88' : '#25e2f4';
          },
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${countryName} - PM2.5 Historical Trends`,
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
          },
          subtitle: {
            display: policyImpact ? true : false,
            text: policyImpact ? `Policy Impact: ${policyImpact.reductionRate} reduction (${policyImpact.timeframe}) - ${policyImpact.status}` : '',
            color: '#25e2f4',
            font: { size: 12 }
          },
          legend: {
            display: true,
            labels: { color: '#ffffff', font: { size: 12 } }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#25e2f4',
            bodyColor: '#ffffff',
            borderColor: '#25e2f4',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                const dataPoint = trendsData[context.dataIndex];
                return [
                  `PM2.5: ${dataPoint.value} µg/m³`,
                  `Note: ${dataPoint.note}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'PM2.5 (µg/m³)',
              color: '#ffffff',
              font: { size: 12 }
            },
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            title: {
              display: true,
              text: 'Year',
              color: '#ffffff',
              font: { size: 12 }
            },
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });
  }

  renderPolicyTimeline(timelineData, policyName) {
    const canvas = document.getElementById('policy-timeline-chart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (this.timelineChart) {
      this.timelineChart.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Prepare data for Chart.js
    const labels = timelineData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    });

    const pm25Values = timelineData.map(item => item.pm25);
    const events = timelineData.map(item => item.event);

    this.timelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'PM2.5 (µg/m³)',
          data: pm25Values,
          borderColor: '#25e2f4',
          backgroundColor: 'rgba(37, 226, 244, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#25e2f4',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#25e2f4',
            bodyColor: '#fff',
            borderColor: '#25e2f4',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              title: function(context) {
                return events[context[0].dataIndex];
              },
              label: function(context) {
                return `PM2.5: ${context.parsed.y.toFixed(1)} µg/m³`;
              },
              afterLabel: function(context) {
                return `Date: ${labels[context.dataIndex]}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              font: {
                size: 10
              },
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              font: {
                size: 10
              },
              callback: function(value) {
                return value.toFixed(0);
              }
            },
            title: {
              display: true,
              text: 'PM2.5 (µg/m³)',
              color: 'rgba(255, 255, 255, 0.8)',
              font: {
                size: 11
              }
            }
          }
        }
      }
    });
  }

  renderImpactComparisonChart(impact, policyName) {
    console.log('📊 renderImpactComparisonChart called with:', { policyName, impact });
    
    const canvas = document.getElementById('policy-impact-chart');
    if (!canvas) {
      console.error('❌ Canvas element "policy-impact-chart" not found in DOM');
      return;
    }
    console.log('✅ Canvas found:', canvas);

    // Destroy existing chart if it exists
    if (this.impactChart) {
      console.log('🗑️ Destroying existing chart');
      this.impactChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    console.log('✅ Canvas context obtained');

    // Prepare data
    const beforePM25 = impact.beforePeriod.meanPM25;
    const afterPM25 = impact.afterPeriod.meanPM25;
    const percentChange = impact.analysis.percentChange;
    
    console.log('📈 Chart data:', {
      beforePM25,
      afterPM25,
      percentChange,
      significant: impact.analysis.significant
    });

    // Determine if improvement (green) or worsening (red)
    const beforeColor = 'rgba(239, 68, 68, 0.8)'; // Red for before
    const afterColor = percentChange < 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'; // Green if improved, red if worsened

    this.impactChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Before Policy', 'After Policy'],
        datasets: [{
          label: 'PM2.5 (µg/m³)',
          data: [beforePM25, afterPM25],
          backgroundColor: [beforeColor, afterColor],
          borderColor: ['rgba(239, 68, 68, 1)', percentChange < 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'PM2.5 Impact Comparison',
            color: 'rgba(255, 255, 255, 0.9)',
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: {
              top: 0,
              bottom: 10
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#25e2f4',
            bodyColor: '#fff',
            borderColor: '#25e2f4',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                const period = context.dataIndex === 0 ? 'Before' : 'After';
                const dateRange = context.dataIndex === 0
                  ? `${impact.beforePeriod.start} to ${impact.beforePeriod.end}`
                  : `${impact.afterPeriod.start} to ${impact.afterPeriod.end}`;
                return [
                  `${period}: ${value.toFixed(1)} µg/m³`,
                  `Period: ${dateRange}`,
                  `Samples: ${context.dataIndex === 0 ? impact.beforePeriod.samples : impact.afterPeriod.samples}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              font: {
                size: 10
              },
              callback: function(value) {
                return value.toFixed(0);
              }
            },
            title: {
              display: true,
              text: 'PM2.5 Concentration (µg/m³)',
              color: 'rgba(255, 255, 255, 0.8)',
              font: {
                size: 11
              }
            }
          }
        }
      }
    });
  }

  showFullDetails(countryName, policy) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'policy-details-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm';
    modal.style.animation = 'fadeIn 0.3s ease-out';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl p-8 max-w-3xl max-h-[90vh] overflow-y-auto m-4';
    modalContent.style.animation = 'slideInUp 0.3s ease-out';

    modalContent.innerHTML = `
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-4">
          <span class="text-6xl">${_esc(policy.flag)}</span>
          <div>
            <h2 class="text-3xl font-bold text-white">${_esc(countryName)}</h2>
            <p class="text-lg text-white/60">${_esc(policy.region)}</p>
          </div>
        </div>
        <button id="close-modal" class="text-white/60 hover:text-white transition-colors">
          <span class="material-symbols-outlined text-3xl">close</span>
        </button>
      </div>

      <div class="space-y-6">
        <!-- Main Policy Section -->
        <div class="bg-black/20 rounded-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary text-2xl">policy</span>
            <h3 class="text-2xl font-bold text-white">Main Policy</h3>
          </div>
          <h4 class="text-xl font-bold text-primary mb-3">${_esc(policy.mainPolicy.name)}</h4>
          <p class="text-base text-white/90 mb-4 leading-relaxed">${_esc(policy.mainPolicy.description)}</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 mb-1">Implementation Date</p>
              <p class="text-sm font-semibold text-white">${_esc(policy.mainPolicy.implementationDate)}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 mb-1">Effectiveness Rating</p>
              <p class="text-sm font-semibold text-white">${_esc(String(policy.mainPolicy.effectivenessRating))}/10</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 mb-1">Policy Type</p>
              <p class="text-sm font-semibold text-white">${_esc(policy.policyType)}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 mb-1">Region</p>
              <p class="text-sm font-semibold text-white">${_esc(policy.region)}</p>
            </div>
          </div>
        </div>

        <!-- Current Air Quality Section -->
        <div class="bg-black/20 rounded-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary text-2xl">air</span>
            <h3 class="text-2xl font-bold text-white">Current Air Quality</h3>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black/30 rounded-lg p-4 text-center">
              <p class="text-sm text-white/60 mb-2">Air Quality Index</p>
              <p class="text-4xl font-bold ${this.getAQIClass(policy.currentAQI)}">${_esc(String(policy.currentAQI))}</p>
              <p class="text-xs text-white/60 mt-2">${_esc(this.getAQILabel(policy.currentAQI))}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-4 text-center">
              <p class="text-sm text-white/60 mb-2">PM2.5 Level</p>
              <p class="text-4xl font-bold text-primary">${_esc(String(policy.currentPM25))}</p>
              <p class="text-xs text-white/60 mt-2">µg/m³</p>
            </div>
          </div>
        </div>

        <!-- Recent News Section -->
        <div class="bg-black/20 rounded-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary text-2xl">newspaper</span>
            <h3 class="text-2xl font-bold text-white">Recent News & Updates</h3>
          </div>
          <div class="space-y-3">
            ${policy.news.map(news => `
              <div class="bg-black/30 rounded-lg p-4 hover:bg-black/40 transition-colors cursor-pointer"
                   data-url="${_esc(_safeUrl(news.url))}">
                <h5 class="text-base font-semibold text-white mb-2">${_esc(news.title)}</h5>
                <div class="flex items-center justify-between text-sm text-white/60">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined !text-base">newspaper</span>
                    ${_esc(news.source)}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined !text-base">calendar_today</span>
                    ${_esc(news.date)}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Impact & Statistics Section -->
        <div class="bg-black/20 rounded-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary text-2xl">analytics</span>
            <h3 class="text-2xl font-bold text-white">Policy Impact</h3>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-black/30 rounded-lg p-3 text-center">
              <span class="material-symbols-outlined text-primary text-3xl">trending_down</span>
              <p class="text-xs text-white/60 mt-2">Emissions</p>
              <p class="text-lg font-bold text-white">${policy.mainPolicy.effectivenessRating >= 7 ? '↓ 15%' : '↓ 8%'}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3 text-center">
              <span class="material-symbols-outlined text-primary text-3xl">groups</span>
              <p class="text-xs text-white/60 mt-2">Lives Protected</p>
              <p class="text-lg font-bold text-white">${policy.mainPolicy.effectivenessRating >= 7 ? '1M+' : '500K+'}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3 text-center">
              <span class="material-symbols-outlined text-primary text-3xl">local_hospital</span>
              <p class="text-xs text-white/60 mt-2">Health Impact</p>
              <p class="text-lg font-bold text-white">${policy.mainPolicy.effectivenessRating >= 7 ? 'High' : 'Medium'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 뉴스 카드 클릭 — data-url 속성에서 검증된 URL 사용
    modalContent.querySelectorAll('[data-url]').forEach(el => {
      el.addEventListener('click', () => {
        const url = el.dataset.url;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    // Close modal handlers
    const closeBtn = modal.querySelector('#close-modal');
    closeBtn.addEventListener('click', () => modal.remove());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  getAQILabel(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  getAQIClass(aqi) {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-500';
    return 'text-red-900';
  }

  searchCountry(searchTerm) {
    const term = searchTerm.toLowerCase();
    const matchedCountries = Object.keys(this.countryPolicies).filter(country =>
      country.toLowerCase().includes(term)
    );

    if (matchedCountries.length > 0) {
      // Show first matched country
      const country = matchedCountries[0];
      this.showCountryPolicy(country);

      // Try to rotate globe to show the country
      this.rotateToCountry(country);
    } else {
      console.log('No country found for:', searchTerm);
    }
  }

  rotateToCountry(countryName) {
    // Find a city in this country from PM2.5 data
    for (const [city, data] of this.pm25Data.entries()) {
      if (data.country === countryName) {
        const { lat, lon } = data;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        // Calculate target camera position
        const distance = 2.5;
        const x = -distance * Math.sin(phi) * Math.cos(theta);
        const z = distance * Math.sin(phi) * Math.sin(theta);
        const y = distance * Math.cos(phi);

        // Smoothly move camera
        const targetPosition = new THREE.Vector3(x, y, z);
        this.animateCameraTo(targetPosition);
        break;
      }
    }
  }

  animateCameraTo(targetPosition) {
    const startPosition = this.camera.position.clone();
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in-out function
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  showRegionFilter() {
    const regions = [...new Set(Object.values(this.countryPolicies).map(p => p.region))];
    this.showDropdownMenu('filter-region', regions, (region) => {
      this.filterByRegion(region);
    });
  }

  showPolicyFilter() {
    const policyTypes = [...new Set(Object.values(this.countryPolicies).map(p => p.policyType))];
    this.showDropdownMenu('filter-policy', policyTypes, (policyType) => {
      this.filterByPolicyType(policyType);
    });
  }

  showDropdownMenu(buttonId, options, onSelect) {
    // Remove existing dropdown
    const existingDropdown = document.getElementById('filter-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
      return;
    }

    const button = document.getElementById(buttonId);
    const buttonRect = button.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.id = 'filter-dropdown';
    dropdown.className = 'absolute z-50 mt-2 rounded-lg bg-gray-900/95 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden';
    dropdown.style.top = `${buttonRect.bottom + 8}px`;
    dropdown.style.left = `${buttonRect.left}px`;
    dropdown.style.minWidth = `${buttonRect.width}px`;
    dropdown.style.maxHeight = '300px';
    dropdown.style.overflowY = 'auto';

    // Add "All" option
    const allOption = document.createElement('div');
    allOption.className = 'px-4 py-2 text-white text-sm hover:bg-white/10 cursor-pointer';
    allOption.textContent = 'All';
    allOption.addEventListener('click', () => {
      dropdown.remove();
      this.clearFilters();
    });
    dropdown.appendChild(allOption);

    // Add options
    options.sort().forEach(option => {
      const item = document.createElement('div');
      item.className = 'px-4 py-2 text-white text-sm hover:bg-white/10 cursor-pointer border-t border-white/5';
      item.textContent = option;
      item.addEventListener('click', () => {
        dropdown.remove();
        onSelect(option);
      });
      dropdown.appendChild(item);
    });

    document.body.appendChild(dropdown);

    // Close dropdown when clicking outside
    const closeDropdown = (e) => {
      if (!dropdown.contains(e.target) && e.target !== button) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    };
    setTimeout(() => document.addEventListener('click', closeDropdown), 0);
  }

  filterByRegion(region) {
    const countries = Object.entries(this.countryPolicies)
      .filter(([_, policy]) => policy.region === region)
      .map(([country, _]) => country);

    console.log(`Countries in ${region}:`, countries);

    if (countries.length > 0) {
      this.showCountryPolicy(countries[0]);
    }
  }

  filterByPolicyType(policyType) {
    const countries = Object.entries(this.countryPolicies)
      .filter(([_, policy]) => policy.policyType === policyType)
      .map(([country, _]) => country);

    console.log(`Countries with ${policyType} policy:`, countries);

    if (countries.length > 0) {
      this.showCountryPolicy(countries[0]);
    }
  }

  clearFilters() {
    console.log('Filters cleared');
    const card = document.getElementById('policy-card');
    if (card) {
      card.style.display = 'none';
    }
  }

  setupToggleSwitches() {
    const setupToggle = (switchId, checkboxId, callback) => {
      const switchEl = document.getElementById(switchId);
      const checkbox = document.getElementById(checkboxId);

      console.log(`🔧 Setting up toggle: ${switchId}`, { switchEl: !!switchEl, checkbox: !!checkbox });

      if (switchEl && checkbox) {
        const toggle = () => {
          checkbox.checked = !checkbox.checked;
          switchEl.classList.toggle('checked', checkbox.checked);
          console.log(`✅ Toggle ${switchId}: ${checkbox.checked}`);
          callback(checkbox.checked);
        };

        switchEl.addEventListener('click', toggle);
        console.log(`✅ ${switchId} listener added`);
      } else {
        console.warn(`⚠️  ${switchId} or ${checkboxId} not found in DOM`);
      }
    };

    setupToggle('toggle-borders-switch', 'toggle-borders', (checked) => {
      this.showBorders = checked;
      if (this.countryBorders) this.countryBorders.visible = checked;
    });

    setupToggle('toggle-pm25-switch', 'toggle-pm25', (checked) => {
      this.showPM25 = checked;
      if (this.markerSystem) {
        this.markerSystem.markerGroups.pm25.visible = checked;
        console.log(`📍 PM2.5 markers: ${checked ? 'shown' : 'hidden'}`);
      }
    });

    // 🆕 정책 마커 토글
    setupToggle('toggle-policies-switch', 'toggle-policies', (checked) => {
      console.log(`📋 Policy toggle callback: ${checked}`, { markerSystem: !!this.markerSystem });
      if (this.markerSystem) {
        this.markerSystem.markerGroups.policies.visible = checked;
        console.log(`📋 Policy markers: ${checked ? 'shown' : 'hidden'}`);
      } else {
        console.warn('⚠️  markerSystem not available');
      }
    });

    setupToggle('toggle-particles-switch', 'toggle-particles', (checked) => {
      this.particlesEnabled = checked;
      if (this.particles) this.particles.visible = checked;
    });

    // 🆕 v2.5: 예측 레이어 토글
    setupToggle('toggle-predictions-switch', 'toggle-predictions', (checked) => {
      if (this.predictionLayer) {
        this.predictionLayer.toggle(checked);
        console.log(`🗺️ Prediction layer: ${checked ? 'shown' : 'hidden'}`);
      }
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());

    document.getElementById('zoom-in')?.addEventListener('click', () => {
      this.camera.position.multiplyScalar(0.85);
      this.camera.position.clampLength(this.controls.minDistance, this.controls.maxDistance);
    });

    document.getElementById('zoom-out')?.addEventListener('click', () => {
      this.camera.position.multiplyScalar(1.15);
      this.camera.position.clampLength(this.controls.minDistance, this.controls.maxDistance);
    });

    document.getElementById('reset-view')?.addEventListener('click', () => {
      this.camera.position.set(0, 0, 2.5);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    });

    // Country search functionality
    const searchInput = document.getElementById('country-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim().toLowerCase();
        if (searchTerm.length >= 2) {
          this.searchCountry(searchTerm);
        }
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const searchTerm = e.target.value.trim();
          if (searchTerm) {
            this.searchCountry(searchTerm);
          }
        }
      });
    }

    // Region filter
    const regionFilter = document.getElementById('filter-region');
    if (regionFilter) {
      regionFilter.addEventListener('click', () => {
        this.showRegionFilter();
      });
    }

    // Policy type filter
    const policyFilter = document.getElementById('filter-policy');
    if (policyFilter) {
      policyFilter.addEventListener('click', () => {
        this.showPolicyFilter();
      });
    }

    // Real-time data refresh button
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const icon = document.getElementById('refresh-icon');
        const updateText = document.getElementById('last-update');

        // Add spinning animation
        if (icon) {
          icon.style.animation = 'spin 1s linear infinite';
        }

        // Update status text
        if (updateText) {
          updateText.textContent = 'Updating...';
        }

        // Clear cache and reload data
        if (this.airQualityAPI) {
          this.airQualityAPI.clearCache();
          await this.loadRealTimeAirQuality();
        }

        // Remove animation
        if (icon) {
          icon.style.animation = '';
        }

        // Update status text with current time
        if (updateText) {
          const now = new Date();
          updateText.textContent = `Updated ${now.toLocaleTimeString()}`;
        }

        console.log('Real-time data refreshed');
      });
    }

    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  onClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 🆕 새로운 마커 시스템의 정책 마커 우선 체크
    if (this.markerSystem && this.markerSystem.markerGroups.policies) {
      const policyIntersects = this.raycaster.intersectObjects(
        this.markerSystem.markerGroups.policies.children, true
      );

      if (policyIntersects.length > 0) {
        // 가장 가까운 부모 그룹 찾기 (userData가 있는)
        let clickedObject = policyIntersects[0].object;
        while (clickedObject && !clickedObject.userData?.country) {
          clickedObject = clickedObject.parent;
        }
        
        if (clickedObject && clickedObject.userData?.country) {
          const countryCode = clickedObject.userData.country;
          console.log('🌍 Policy marker clicked:', countryCode);
          
          // 마커 하이라이트
          this.markerSystem.highlightPolicyMarker(countryCode, true);
          
          // 정책 정보 표시
          this.showPolicyInfoPanel(countryCode, clickedObject.userData);
          return;
        }
      }
    }

    // Check country policy markers (legacy)
    if (this.countryPolicyMarkers) {
      const intersects = this.raycaster.intersectObjects(this.countryPolicyMarkers.children, true);

      if (intersects.length > 0) {
        const marker = intersects[0].object;
        if (marker.userData && marker.userData.isCountryPolicy) {
          const countryName = marker.userData.country;
          const policyData = marker.userData.policyData;
          this.showCountryPolicyTrends(countryName, policyData);
          return;
        }
      }
    }

    // 🆕 새로운 마커 시스템의 PM2.5 마커 체크
    if (this.markerSystem && this.markerSystem.markerGroups.pm25 && this.showPM25) {
      const pm25Intersects = this.raycaster.intersectObjects(
        this.markerSystem.markerGroups.pm25.children, true
      );

      if (pm25Intersects.length > 0) {
        let clickedObject = pm25Intersects[0].object;
        while (clickedObject && !clickedObject.userData?.id) {
          clickedObject = clickedObject.parent;
        }
        
        if (clickedObject && clickedObject.userData) {
          const stationData = clickedObject.userData;
          console.log('📍 PM2.5 marker clicked:', stationData);
          // ★ Today 버튼 href 업데이트
          const gotoTodayBtn = document.getElementById('goto-today-btn');
          if (gotoTodayBtn && stationData.lat != null && stationData.lon != null) {
            gotoTodayBtn.href = `index.html?lat=${stationData.lat}&lon=${stationData.lon}`;
          }
          this.showStationInfoPanel(stationData);
          return;
        }
      }
    }

    // Check PM2.5 markers (legacy)
    if (this.pm25Markers && this.showPM25) {
      const intersects = this.raycaster.intersectObjects(this.pm25Markers.children, true);

      if (intersects.length > 0) {
        const marker = intersects[0].object;
        if (marker.userData && marker.userData.data) {
          const countryName = marker.userData.data.country;
          this.showCountryPolicy(countryName);
          return;
        }
      }
    }

    // Check Earth itself
    if (this.earth) {
      const intersects = this.raycaster.intersectObject(this.earth);
      if (intersects.length > 0) {
        console.log('Clicked on Earth');
      }
    }
  }

  /**
   * 🆕 정책 정보 패널 표시 (PM2.5 트렌드 + 정책 영향 포함)
   */
  showPolicyInfoPanel(countryCode, policyData) {
    // 전략 v2: 기존 팝업 대신 통합 좌측 패널에 위임
    const p = this.countryPolicies[countryCode] || policyData || {};
    const name = p.name || countryCode;

    window.globeUpdatePanel({
      type:          'country',
      name,
      flag:          p.flag   || policyData?.flag   || '🌍',
      region:        p.region || policyData?.region || '',
      lat:           p.coordinates?.lat ?? null,
      lon:           p.coordinates?.lon ?? null,
      pm25:          p.currentPM25  ?? policyData?.pm25 ?? 0,
      countryCode,
      policy: p.mainPolicy ? {
        title:       p.mainPolicy.name,
        description: p.mainPolicy.description,
        date:        p.mainPolicy.implementationDate,
        rating:      p.mainPolicy.effectivenessRating
      } : null,
      impact: p.policyImpact ? {
        rate:    p.policyImpact.reductionRate,
        period:  p.policyImpact.timeframe,
        measures: p.policyImpact.keyMeasures || []
      } : null,
      trends:        p.pm25Trends || [],
      otherPolicies: (p.additionalPolicies || []).map(op => ({
        year: op.year, title: op.name || op.title || op
      }))
    });
  }

  /**
   * 🆕 PM2.5 트렌드 차트 렌더링
   */
  // (renderPM25TrendChart는 아래에 한 번만 정의됨)

  /**
   * 🆕 PM2.5 트렌드 차트 렌더링
   */
  renderPM25TrendChart(trends, policyDate) {
    const canvas = document.getElementById('pm25-trend-chart');
    if (!canvas || !trends || trends.length === 0) return;

    const ctx = canvas.getContext('2d');
    const labels = trends.map(t => t.year);
    const data = trends.map(t => t.value);
    
    // 정책 시작 연도 찾기
    let policyYear = null;
    if (policyDate) {
      policyYear = parseInt(policyDate.substring(0, 4));
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'PM2.5',
          data: data,
          borderColor: '#25e2f4',
          backgroundColor: 'rgba(37, 226, 244, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: data.map((v, i) => {
            if (policyYear && labels[i] === policyYear) return '#ffcc00';
            return '#25e2f4';
          }),
          pointBorderColor: data.map((v, i) => {
            if (policyYear && labels[i] === policyYear) return '#ffcc00';
            return '#25e2f4';
          }),
          pointRadius: data.map((v, i) => {
            if (policyYear && labels[i] === policyYear) return 6;
            return 3;
          })
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#25e2f4',
            callbacks: {
              label: (ctx) => {
                const trend = trends[ctx.dataIndex];
                return [
                  `PM2.5: ${ctx.parsed.y} µg/m³`,
                  trend.note ? `📌 ${trend.note}` : ''
                ].filter(Boolean);
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 9 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 9 } }
          }
        }
      }
    });
  }

  /**
   * 🆕 측정소 정보 패널 표시
   */
  showStationInfoPanel(stationData) {
    // 전략 v2: 기존 팝업 대신 통합 좌측 패널에 위임
    const pm25 = stationData.pm25 || 0;
    const city = stationData.name || stationData.city || stationData.country || 'Station';

    window.globeUpdatePanel({
      type:   'station',
      name:   city,
      flag:   _countryToFlag(stationData.country || ''),
      region: stationData.country || '',
      lat:    stationData.lat ?? stationData.latitude  ?? null,
      lon:    stationData.lon ?? stationData.longitude ?? null,
      pm25,
      countryCode: null,  // station만 클릭 시 Policy 버튼 숨김
      policy:       null,
      impact:       null,
      trends:       [],
      otherPolicies:[]
    });
  }

  getPM25ColorString(pm25) {
    if (pm25 <= 12) return '#00e400';
    if (pm25 <= 35.5) return '#ffff00';
    if (pm25 <= 55.5) return '#ff7e00';
    if (pm25 <= 150.5) return '#ff0000';
    return '#8f3f97';
  }

  getPM25Label(pm25) {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35.5) return 'Moderate';
    if (pm25 <= 55.5) return 'Unhealthy for Sensitive';
    if (pm25 <= 150.5) return 'Unhealthy';
    return 'Very Unhealthy';
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 🆕 새로운 마커 시스템의 정책 마커 체크
    if (this.markerSystem && this.markerSystem.markerGroups.policies) {
      const policyIntersects = this.raycaster.intersectObjects(
        this.markerSystem.markerGroups.policies.children, true
      );
      if (policyIntersects.length > 0) {
        document.body.style.cursor = 'pointer';
        return;
      }
    }

    // 🆕 새로운 마커 시스템의 PM2.5 마커 체크
    if (this.markerSystem && this.markerSystem.markerGroups.pm25 && this.showPM25) {
      const pm25Intersects = this.raycaster.intersectObjects(
        this.markerSystem.markerGroups.pm25.children, true
      );
      if (pm25Intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        return;
      }
    }

    // Legacy: Check country policy markers
    if (this.countryPolicyMarkers) {
      const policyIntersects = this.raycaster.intersectObjects(this.countryPolicyMarkers.children, true);
      if (policyIntersects.length > 0) {
        document.body.style.cursor = 'pointer';
        return;
      }
    }

    // Legacy: Check PM2.5 markers
    if (this.pm25Markers && this.showPM25) {
      const intersects = this.raycaster.intersectObjects(this.pm25Markers.children, true);
      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        return;
      }
    }

    document.body.style.cursor = 'default';
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
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
    
    // 🆕 Enhanced Marker System 애니메이션 업데이트
    if (this.markerSystem) {
      this.markerSystem.updateAll(delta);
    }

    // 🆕 v2.5: 예측 레이어 애니메이션
    if (this.predictionLayer) {
      this.predictionLayer.update(delta);
    }

    // Animate enhanced visualization
    if (this.globeIntegration) {
      this.globeIntegration.animate(delta);
    }

    if (this.pm25Markers && this.showPM25) {
      this.pm25Markers.children.forEach((child, index) => {
        // User location marker gets special pulsing animation
        if (child.userData && child.userData.isUserLocation) {
          const specialPulse = Math.sin(this.time * 0.004) * 0.4 + 1.2; // Faster, larger pulse
          child.scale.setScalar(specialPulse);

          // Update emissive intensity for glow effect
          if (child.material && child.material.emissive) {
            child.material.emissiveIntensity = Math.sin(this.time * 0.003) * 0.4 + 0.6;
          }
        }
        // Normal pulse for rings (every other child)
        else if (index % 2 === 0) {
          const pulse = Math.sin(this.time * 0.002 + index) * 0.15 + 1;
          child.scale.setScalar(pulse);
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  // 🆕 데이터 구독 설정
  setupDataSubscriptions() {
    // 측정소 데이터 변경 감시
    this.globalDataService.subscribe('stations', (stations, type) => {
      console.log(`📍 Stations updated: ${stations.size}`);
      this.updateStationMarkers(stations);
    });

    // 정책 데이터 변경 감시
    this.globalDataService.subscribe('policies', (policies, type) => {
      console.log(`📋 Policies updated: ${policies.size}`);
      this.updatePolicyUI();
    });

    // 선택 국가 변경 감시
    this.globalDataService.subscribe('selectedCountry', (country, type) => {
      console.log(`🌍 Selected country: ${country?.country}`);
      this.displayCountryPolicy(country);
    });
  }

  // 🆕 마커 시스템으로 마커 생성
  // 🆕 Policy UI 업데이트 (통합 통계 사용)
  updatePolicyUI() {
    try {
      // globalStats가 있으면 사용, 없으면 다시 계산
      if (this.globalStats) {
        const countriesEl = document.getElementById('stat-countries');
        const policiesEl = document.getElementById('stat-policies');
        const regionsEl = document.getElementById('stat-regions');

        if (countriesEl) countriesEl.textContent = this.globalStats.countries;
        if (policiesEl) policiesEl.textContent = this.globalStats.policies;
        if (regionsEl) regionsEl.textContent = this.globalStats.regions;
        
        console.log('✅ Policy UI updated from globalStats');
      } else {
        // globalStats가 없으면 통계 다시 계산
        this.updateStatisticsFromCountryPolicies();
        console.log('✅ Policy UI updated (recalculated)');
      }
    } catch (error) {
      console.error('❌ Error updating policy UI:', error);
    }
  }

  // 🆕 국가 정책 표시
  displayCountryPolicy(policy) {
    try {
      if (!policy) return;

      const policyCard = document.getElementById('policy-card');
      if (!policyCard) return;

      // ✨ 현재 정책을 전역 변수에 저장 (View Full Details 버튼에서 사용)
      window.currentPolicy = policy;

      // 국기 매핑
      const flags = {
        'South Korea': '🇰🇷',
        'China': '🇨🇳',
        'Japan': '🇯🇵',
        'India': '🇮🇳',
        'Bangladesh': '🇧🇩',
        'United States': '🇺🇸',
        'United Kingdom': '🇬🇧',
        'Germany': '🇩🇪'
      };

      // UI 업데이트
      const countryName = policy.country || policy.name;
      document.getElementById('policy-flag').textContent = flags[countryName] || '🌍';
      document.getElementById('policy-country').textContent = countryName;
      document.getElementById('policy-region').textContent = policy.region || policy.area || '';
      document.getElementById('policy-name').textContent = policy.title || 'Policy Title';
      document.getElementById('policy-desc').textContent = policy.description || 'No description available';

      const date = policy.implementationYear 
        ? new Date(policy.implementationYear, 0).toLocaleDateString()
        : (policy.target_year ? `Target: ${policy.target_year}` : 'Date not available');
      document.getElementById('policy-date').textContent = date;

      // ✨ View Full Details 버튼 활성화 여부 (URL이 있으면 활성화)
      const viewMoreBtn = document.getElementById('view-more-btn');
      if (viewMoreBtn) {
        if (policy.url) {
          viewMoreBtn.style.opacity = '1';
          viewMoreBtn.style.pointerEvents = 'auto';
          viewMoreBtn.title = `Visit: ${policy.url}`;
        } else {
          viewMoreBtn.style.opacity = '0.5';
          viewMoreBtn.style.pointerEvents = 'none';
          viewMoreBtn.title = 'No URL available';
        }
      }

      // PM2.5 데이터 표시
      const stations = Array.from(this.globalDataService.getStations().values())
        .filter(s => s.country?.toLowerCase() === countryName?.toLowerCase());

      if (stations.length > 0) {
        const avgPM25 = stations.reduce((sum, s) => sum + (s.pm25 || 0), 0) / stations.length;
        document.getElementById('policy-pm25').textContent = 
          (Math.round(avgPM25 * 10) / 10).toFixed(1);
        document.getElementById('policy-aqi').textContent = this.getAQIStatus(avgPM25);
      } else {
        document.getElementById('policy-pm25').textContent = '-';
        document.getElementById('policy-aqi').textContent = '-';
      }

      policyCard.style.display = 'block';
      policyCard.classList.add('show');
    } catch (error) {
      console.error('❌ Error displaying country policy:', error);
    }
  }

  // 🆕 AQI 상태 텍스트
  getAQIStatus(value) {
    if (value <= 50) return 'Good';
    if (value <= 100) return 'Moderate';
    if (value <= 150) return 'Unhealthy for Sensitive Groups';
    if (value <= 200) return 'Unhealthy';
    if (value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  // 🆕 Policy 데이터 로드
  async loadPoliciesData() {
    try {
      console.log('📋 Loading policy data...');
      const policies = await this.policyDataService.loadAllPolicies();
      console.log(`✅ Loaded ${policies.size} policies`);
      
      this.updatePolicyUI();
      return policies;
    } catch (error) {
      console.error('❌ Failed to load policies:', error);
      return new Map();
    }
  }
}

// ── 모듈 레벨 헬퍼 ─────────────────────────────────────────────────────
// NOTE: 아래 헬퍼들은 utils/ 모듈로 이전됨 (import 위 참조)
// 하위 호환성을 위해 유지하며, 향후 제거 예정

/**
 * XSS 방어 — → utils/security.js::esc() 로 대체됨
 */
function _esc(str) { return esc(str); }

/**
 * URL 안전성 검증 — → utils/security.js::safeUrl() 로 대체됨
 */
function _safeUrl(url) { return safeUrl(url); }

// → utils/geo.js::nameToCode() 로 대체됨
function _nameToCode(name) { return nameToCode(name); }

// → utils/geo.js::countryToFlag() 로 대체됨
function _countryToFlag(nameOrCode) { return countryToFlag(nameOrCode); }

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PolicyGlobe();
  });
} else {
  new PolicyGlobe();
}
// Globe 페이지 로드 시 개선사항 적용
import('./globe-enhancement.js').then(module => {
  module.enhanceGlobe(PolicyGlobe);
  console.log('✅ Globe enhancements loaded');
}).catch(error => {
  console.error('Failed to load enhancements:', error);
});
