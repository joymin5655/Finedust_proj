/**
 * AirLens Globe - Improved Version
 * Interactive 3D Earth with country boundaries and real-time air quality data
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class GlobeImproved {
  constructor() {
    this.canvas = document.getElementById('globe-canvas');
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000005);

    // 카메라
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 2.5);

    // 렌더러
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 컨트롤
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.3;
    this.controls.maxDistance = 4;
    this.controls.enablePan = false;

    // 상태
    this.showBorders = true;
    this.showMarkers = true;
    this.showParticles = false;

    // 데이터
    this.stationData = new Map();
    this.markers = [];
    this.borderGroup = new THREE.Group();
    this.markerGroup = new THREE.Group();

    this.scene.add(this.borderGroup);
    this.scene.add(this.markerGroup);

    // 레이캐스터
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  async init() {
    this.createLights();
    this.createEarth();
    await this.loadCountryBoundaries();
    await this.loadAirQualityData();
    this.setupEventListeners();
    this.setupToggleControls();
    this.animate();
    this.hideLoadingIndicator();
  }

  createLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(5, 3, 5);
    this.scene.add(sun);

    const ambient = new THREE.AmbientLight(0x333366, 1.5);
    this.scene.add(ambient);
  }

  createEarth() {
    // 지구 텍스처 (단색으로 시작)
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 지구 기본 색상
    ctx.fillStyle = '#1a4d3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 대양
    ctx.fillStyle = '#0a1f2e';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 100, 100);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.SphereGeometry(1, 256, 128);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 5
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);

    // 기하학
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x25e2f4, linewidth: 0.5, transparent: true, opacity: 0.1 })
    );
    this.earth.add(wireframe);
  }

  async loadCountryBoundaries() {
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      const world = await response.json();
      
      const countries = topojson.feature(world, world.objects.countries).features;
      
      countries.forEach(country => {
        this.drawCountryBorder(country);
      });

      console.log(`✅ Loaded ${countries.length} country boundaries`);
    } catch (error) {
      console.warn('⚠️  Could not load country boundaries:', error.message);
    }
  }

  drawCountryBorder(feature) {
    const coordinates = feature.geometry.coordinates;
    const color = new THREE.Color(0x25e2f4);
    const material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 1,
      transparent: true,
      opacity: 0.4
    });

    const processGeometry = (coords, depth = 0) => {
      if (depth === 0 && coords[0][0] instanceof Array) {
        coords.forEach(polygon => processGeometry(polygon, depth + 1));
      } else if (depth === 1 && coords[0][0] instanceof Array) {
        coords.forEach(ring => processGeometry(ring, depth + 1));
      } else {
        const points = [];
        coords.forEach(([lon, lat]) => {
          const phi = (lon + 180) / 360 * Math.PI * 2;
          const theta = (90 - lat) / 180 * Math.PI;
          const x = Math.sin(theta) * Math.cos(phi);
          const y = Math.cos(theta);
          const z = Math.sin(theta) * Math.sin(phi);
          points.push(new THREE.Vector3(x, y, z));
        });

        if (points.length > 1) {
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.LineSegments(geometry, material);
          this.borderGroup.add(line);
        }
      }
    };

    processGeometry(coordinates);
  }

  async loadAirQualityData() {
    try {
      // 로컬 데이터 로드
      const response = await fetch('data/stations.json');
      const data = await response.json();

      if (data.stations && Array.isArray(data.stations)) {
        data.stations.forEach(station => {
          this.stationData.set(station.id, station);
          this.createMarker(station);
        });
        console.log(`✅ Loaded ${data.stations.length} stations`);
      }

      // 통계 업데이트
      this.updateStatistics(data);
    } catch (error) {
      console.warn('⚠️  Could not load air quality data:', error.message);
    }
  }

  createMarker(station) {
    // 위도/경도를 3D 좌표로 변환
    const lat = station.latitude;
    const lon = station.longitude;
    const phi = (lon + 180) / 360 * Math.PI * 2;
    const theta = (90 - lat) / 180 * Math.PI;

    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.cos(theta);
    const z = Math.sin(theta) * Math.sin(phi);

    // PM2.5 값에 따른 색상
    const color = this.getAQIColor(station.pm25);

    // 마커 생성
    const geometry = new THREE.SphereGeometry(0.03, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const marker = new THREE.Mesh(geometry, material);

    marker.position.set(x, y, z);
    marker.userData = station;
    marker.userData.color = color;

    this.markerGroup.add(marker);
    this.markers.push(marker);

    // 글로우 효과
    const glowGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3
    });
    const glowMarker = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMarker.position.copy(marker.position);
    this.markerGroup.add(glowMarker);
  }

  getAQIColor(pm25) {
    if (pm25 <= 12) return 0x50C878;      // 녹색 - 좋음
    if (pm25 <= 35) return 0xFFD700;      // 노랑 - 보통
    if (pm25 <= 55) return 0xFF8C00;      // 주황 - 나쁨
    if (pm25 <= 150) return 0xC41E3A;     // 빨강 - 매우 나쁨
    return 0x8B0000;                      // 진한빨강 - 위험
  }

  getAQILabel(pm25) {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35) return 'Moderate';
    if (pm25 <= 55) return 'Unhealthy';
    if (pm25 <= 150) return 'Very Unhealthy';
    return 'Hazardous';
  }

  updateStatistics(data) {
    const stationCount = data.stations?.length || 0;
    const countries = new Set(data.stations?.map(s => s.country) || []);

    document.getElementById('stat-stations').textContent = stationCount;
    document.getElementById('stat-countries').textContent = countries.size;
  }

  setupEventListeners() {
    this.canvas.addEventListener('click', (event) => this.onCanvasClick(event));
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onCanvasClick(event) {
    // 클릭 위치를 정규화
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 마커 선택
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markers);

    if (intersects.length > 0) {
      const marker = intersects[0].object;
      const station = marker.userData;
      this.showStationInfo(station);
    }
  }

  showStationInfo(station) {
    const card = document.getElementById('policy-card');
    
    document.getElementById('policy-flag').textContent = '📍';
    document.getElementById('policy-country').textContent = station.country;
    document.getElementById('policy-region').textContent = station.city;
    document.getElementById('policy-aqi').textContent = station.aqi || '-';
    document.getElementById('policy-pm25').textContent = (station.pm25 || '-').toFixed(1);
    document.getElementById('policy-station').textContent = station.name;
    document.getElementById('policy-lat').textContent = station.latitude.toFixed(2) + '°';
    document.getElementById('policy-lon').textContent = station.longitude.toFixed(2) + '°';
    
    const date = new Date(station.updated);
    document.getElementById('policy-update').textContent = date.toLocaleTimeString();

    card.style.display = 'flex';
  }

  setupToggleControls() {
    document.getElementById('toggle-borders')?.addEventListener('change', (e) => {
      this.borderGroup.visible = e.target.checked;
    });

    document.getElementById('toggle-markers')?.addEventListener('change', (e) => {
      this.markerGroup.visible = e.target.checked;
    });

    document.getElementById('toggle-particles')?.addEventListener('change', (e) => {
      this.showParticles = e.target.checked;
    });

    document.getElementById('reset-view')?.addEventListener('click', () => {
      this.camera.position.set(0, 0, 2.5);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    });

    document.getElementById('zoom-in')?.addEventListener('click', () => {
      this.camera.position.multiplyScalar(0.9);
    });

    document.getElementById('zoom-out')?.addEventListener('click', () => {
      this.camera.position.multiplyScalar(1.1);
    });

    document.getElementById('refresh-data')?.addEventListener('click', () => {
      this.loadAirQualityData();
      const icon = document.getElementById('refresh-icon');
      icon.style.animation = 'spin 1s linear';
      setTimeout(() => { icon.style.animation = ''; }, 1000);
    });
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
      indicator.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => {
        indicator.style.display = 'none';
      }, 300);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // 지구 회전
    if (this.earth) {
      this.earth.rotation.y += 0.0001;
    }

    // 마커 애니메이션
    this.markers.forEach((marker, index) => {
      marker.scale.set(
        1 + Math.sin(Date.now() * 0.001 + index * 0.5) * 0.1,
        1 + Math.sin(Date.now() * 0.001 + index * 0.5) * 0.1,
        1
      );
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// 인스턴스 생성
const globe = new GlobeImproved();
