/**
 * AirLens Interactive 3D Globe - Earth.nullschool.net style
 * Enhanced with Our World in Data PM2.5 concentration data
 * Using Three.js for WebGL rendering
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class AirLensGlobe {
  constructor() {
    this.canvas = document.getElementById('globe-canvas');
    this.container = document.getElementById('globe-container');

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });

    // Data
    this.pm25Data = new Map();
    this.markers = [];
    this.selectedMarker = null;
    this.currentYear = 2019;
    this.dataLayer = 'pm25';

    // Performance
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();

    this.init();
  }

  async init() {
    this.setupRenderer();
    this.setupCamera();
    this.setupLights();
    await this.createEarth();
    this.setupControls();
    await this.loadOWIDData();
    this.setupEventListeners();
    this.setupDataPanel();
    this.animate();

    this.hideLoadingScreen();
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight - 48);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1);
  }

  setupCamera() {
    this.camera.position.set(0, 0, 2.5);
  }

  setupLights() {
    // Ambient light - softer for earth.nullschool.net style
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    // Main directional light
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    this.scene.add(sun);

    // Fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(0x4a90ff, 0.3);
    fillLight.position.set(-5, -3, -5);
    this.scene.add(fillLight);

    // Add stars
    this.createStarfield();
  }

  createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 0.8
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
  }

  async createEarth() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Earth.nullschool.net style - deep blue ocean color
    const material = new THREE.MeshPhongMaterial({
      color: 0x1a3a52,
      emissive: 0x0a1a2a,
      specular: 0x4a90c4,
      shininess: 15,
      transparent: true,
      opacity: 0.95
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);

    // Atmospheric glow - earth.nullschool.net style
    const glowGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a90ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    this.atmosphere = new THREE.Mesh(glowGeometry, glowMaterial);
    this.scene.add(this.atmosphere);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 5;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.3;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.8;
  }

  async loadOWIDData() {
    try {
      // Load Our World in Data PM2.5 concentration data
      const pm25Response = await fetch('data/pm25-data.json');
      const pm25Data = await pm25Response.json();

      // Process and store PM2.5 data
      pm25Data.countries.forEach(country => {
        this.pm25Data.set(country.code, country);
      });

      this.createPM25Markers();
      this.updateVisualization();
      this.updateStats();

      console.log('✅ Loaded PM2.5 data for', this.pm25Data.size, 'countries');
    } catch (error) {
      console.error('Failed to load Our World in Data:', error);
      console.log('📦 Using fallback sample data');
      // Fallback to sample data
      this.createSampleData();
    }
  }

  createSampleData() {
    // Sample countries with PM2.5 data
    const sampleCountries = [
      { code: 'CHN', name: 'China', lat: 35.8617, lon: 104.1954, pm25: 45.3 },
      { code: 'IND', name: 'India', lat: 20.5937, lon: 78.9629, pm25: 58.1 },
      { code: 'USA', name: 'United States', lat: 37.0902, lon: -95.7129, pm25: 7.4 },
      { code: 'KOR', name: 'South Korea', lat: 35.9078, lon: 127.7669, pm25: 24.8 },
      { code: 'JPN', name: 'Japan', lat: 36.2048, lon: 138.2529, pm25: 11.9 },
      { code: 'DEU', name: 'Germany', lat: 51.1657, lon: 10.4515, pm25: 10.7 },
      { code: 'GBR', name: 'United Kingdom', lat: 55.3781, lon: -3.4360, pm25: 9.7 },
      { code: 'FRA', name: 'France', lat: 46.2276, lon: 2.2137, pm25: 11.1 },
      { code: 'BRA', name: 'Brazil', lat: -14.2350, lon: -51.9253, pm25: 8.9 },
      { code: 'AUS', name: 'Australia', lat: -25.2744, lon: 133.7751, pm25: 5.4 }
    ];

    sampleCountries.forEach(country => {
      this.pm25Data.set(country.code, {
        code: country.code,
        name: country.name,
        latitude: country.lat,
        longitude: country.lon,
        data: [{ year: 2019, pm25: country.pm25 }]
      });
    });

    this.createPM25Markers();
    this.updateStats();
  }

  createPM25Markers() {
    // Clear existing markers
    this.markers.forEach(marker => this.earth.remove(marker));
    this.markers = [];

    const markerGeometry = new THREE.SphereGeometry(0.025, 16, 16);

    this.pm25Data.forEach(country => {
      const yearData = country.data?.find(d => d.year === this.currentYear) ||
                       country.data?.[country.data.length - 1];
      if (!yearData) return;

      // Color based on PM2.5 level
      const color = this.getPM25Color(yearData.pm25);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85
      });

      const marker = new THREE.Mesh(markerGeometry, material);

      // Position at country location
      const pos = this.latLonToVector3(country.latitude, country.longitude, 1.02);
      marker.position.copy(pos);
      marker.userData = {
        type: 'pm25',
        country: country.name,
        code: country.code,
        pm25: yearData.pm25,
        year: yearData.year
      };

      this.earth.add(marker);
      this.markers.push(marker);

      // Add glow effect for high pollution areas
      if (yearData.pm25 > 35) {
        this.addMarkerGlow(marker, color, pos);
      }
    });
  }

  addMarkerGlow(marker, color, position) {
    const glowGeometry = new THREE.SphereGeometry(0.035, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(marker.position);
    this.earth.add(glow);
  }

  latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  }

  getPM25Color(pm25) {
    // WHO Air Quality Guidelines based colors
    if (pm25 <= 5) return 0x00e400;       // Excellent (green)
    if (pm25 <= 10) return 0x92d050;      // Good (light green)
    if (pm25 <= 15) return 0xffff00;      // Moderate (yellow)
    if (pm25 <= 25) return 0xffc000;      // Fair (orange)
    if (pm25 <= 35) return 0xff7e00;      // Poor (dark orange)
    if (pm25 <= 50) return 0xff0000;      // Very Poor (red)
    return 0x99004c;                      // Extremely Poor (purple)
  }

  getAQILevel(pm25) {
    if (pm25 <= 5) return 'Excellent';
    if (pm25 <= 10) return 'Good';
    if (pm25 <= 15) return 'Moderate';
    if (pm25 <= 25) return 'Fair';
    if (pm25 <= 35) return 'Poor';
    if (pm25 <= 50) return 'Very Poor';
    return 'Extremely Poor';
  }

  setupDataPanel() {
    const panel = document.createElement('div');
    panel.id = 'owid-data-panel';
    panel.className = 'owid-panel';
    panel.innerHTML = `
      <div class="owid-header">
        <h2>🌍 PM2.5 Air Quality</h2>
        <p class="owid-subtitle">Global concentration levels</p>
      </div>
      <div class="owid-stats">
        <div class="owid-stat">
          <div class="stat-value" id="countries-count">0</div>
          <div class="stat-label">Countries</div>
        </div>
        <div class="owid-stat">
          <div class="stat-value" id="global-avg">0</div>
          <div class="stat-label">Global Avg μg/m³</div>
        </div>
      </div>
      <div class="owid-legend">
        <h3>WHO Air Quality Levels</h3>
        <div class="legend-item"><span class="legend-color" style="background: #00e400"></span> Excellent (0-5)</div>
        <div class="legend-item"><span class="legend-color" style="background: #92d050"></span> Good (5-10)</div>
        <div class="legend-item"><span class="legend-color" style="background: #ffff00"></span> Moderate (10-15)</div>
        <div class="legend-item"><span class="legend-color" style="background: #ffc000"></span> Fair (15-25)</div>
        <div class="legend-item"><span class="legend-color" style="background: #ff7e00"></span> Poor (25-35)</div>
        <div class="legend-item"><span class="legend-color" style="background: #ff0000"></span> Very Poor (35-50)</div>
        <div class="legend-item"><span class="legend-color" style="background: #99004c"></span> Extremely Poor (50+)</div>
      </div>
      <div class="owid-footer">
        <p>Data: <a href="https://ourworldindata.org" target="_blank">Our World in Data</a></p>
        <p class="data-note">PM2.5 = Fine particulate matter &lt; 2.5μm</p>
      </div>
    `;

    document.body.appendChild(panel);
  }

  updateVisualization() {
    this.createPM25Markers();
    this.updateGlobalStats();
  }

  updateGlobalStats() {
    const countries = Array.from(this.pm25Data.values());
    const countriesCount = countries.length;

    // Calculate global average PM2.5
    let totalPM25 = 0;
    let count = 0;

    countries.forEach(country => {
      const yearData = country.data?.find(d => d.year === this.currentYear) ||
                       country.data?.[country.data.length - 1];
      if (yearData) {
        totalPM25 += yearData.pm25;
        count++;
      }
    });

    const globalAvg = count > 0 ? (totalPM25 / count).toFixed(1) : '0';

    const countriesEl = document.getElementById('countries-count');
    const avgEl = document.getElementById('global-avg');

    if (countriesEl) countriesEl.textContent = countriesCount;
    if (avgEl) avgEl.textContent = globalAvg;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());
    this.canvas.addEventListener('click', (e) => this.onClick(e));

    const resetBtn = document.getElementById('reset-view');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.camera.position.set(0, 0, 2.5);
        this.controls.reset();
      });
    }

    // Panel toggle for Data Analysis
    const panelToggle = document.getElementById('panel-toggle');
    if (panelToggle) {
      panelToggle.addEventListener('click', () => {
        const panel = document.getElementById('data-panel');
        if (panel) {
          panel.classList.toggle('hidden');
        }
      });
    }

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar-menu');
        if (sidebar) {
          sidebar.classList.toggle('collapsed');
        }
      });
    }

    // Close info panel
    const closeInfo = document.getElementById('close-info');
    if (closeInfo) {
      closeInfo.addEventListener('click', () => {
        const panel = document.getElementById('info-panel');
        if (panel) {
          panel.style.display = 'none';
        }
      });
    }
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight - 48;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((event.clientY - 48) / (window.innerHeight - 48)) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.markers);

    if (intersects.length > 0) {
      const marker = intersects[0].object;
      this.showLocationInfo(marker.userData);
    }
  }

  showLocationInfo(data) {
    const panel = document.getElementById('info-panel');
    if (!panel) return;

    panel.style.display = 'block';

    const aqiLevel = this.getAQILevel(data.pm25);
    const color = this.getPM25Color(data.pm25);
    const colorHex = '#' + color.toString(16).padStart(6, '0');

    panel.innerHTML = `
      <button id="close-info" class="close-btn">×</button>
      <h3 id="station-name">${data.country}</h3>
      <div class="info-row">
        <span class="info-label">Country Code:</span>
        <span id="station-country">${data.code}</span>
      </div>
      <div class="info-row">
        <span class="info-label">PM2.5:</span>
        <span id="station-pm25" class="pm25-value" style="color: ${colorHex}">${data.pm25.toFixed(1)} μg/m³</span>
      </div>
      <div class="info-row">
        <span class="info-label">Air Quality:</span>
        <span id="station-aqi" style="color: ${colorHex}; font-weight: bold">${aqiLevel}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Year:</span>
        <span id="station-updated">${data.year}</span>
      </div>
      <div class="info-note">
        <p>WHO recommends annual PM2.5 levels below 5 μg/m³</p>
      </div>
    `;

    const closeBtn = document.getElementById('close-info');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.style.display = 'none';
      }, { once: true });
    }
  }

  updateStats() {
    const totalStations = document.getElementById('total-stations');
    const visibleStations = document.getElementById('visible-stations');

    if (totalStations) totalStations.textContent = this.pm25Data.size;
    if (visibleStations) visibleStations.textContent = this.markers.length;
  }

  calculateFPS() {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      const fpsElement = document.getElementById('fps-counter');
      if (fpsElement) {
        fpsElement.textContent = this.fps;
      }
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.controls.update();

    // Slow earth rotation for earth.nullschool.net effect
    this.earth.rotation.y += 0.0003;
    this.atmosphere.rotation.y += 0.0005;

    this.renderer.render(this.scene, this.camera);
    this.calculateFPS();
  }

  hideLoadingScreen() {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => {
        loading.style.display = 'none';
      }, 500);
    }
  }
}

// Initialize globe
new AirLensGlobe();

// Mobile menu toggle
function initMobileMenu() {
  const toggle = document.querySelector('.navbar-toggle');
  const menu = document.querySelector('.navbar-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // Close menu when clicking on a link
  const menuLinks = menu.querySelectorAll('.navbar-link');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    }
  });
}

// Initialize mobile menu
initMobileMenu();
