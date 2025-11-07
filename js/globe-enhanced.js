/**
 * AirLens Enhanced Globe - Earth.Nullschool + Google Earth Design
 * Advanced 3D visualization with real OWID data
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OWIDDataService } from './data-service.js';

class EnhancedGlobe {
  constructor() {
    this.canvas = document.getElementById('globe-canvas');
    this.container = document.getElementById('globe-container');
    
    // Scene components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    // Data service
    this.dataService = new OWIDDataService();
    
    // Data storage
    this.pm25Data = [];
    this.historicalData = [];
    this.stations = [];
    this.markers = [];
    this.particles = [];
    
    // Current state
    this.currentYear = 2021;
    this.availableYears = [];
    this.dataLayer = 'pm25';
    this.isAnimating = false;
    this.showParticles = true;
    this.showStations = true;
    
    // Performance tracking
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    
    // Mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredMarker = null;
    
    this.init();
  }
  
  async init() {
    console.log('🌍 Initializing Enhanced Globe...');
    
    this.setupRenderer();
    this.setupCamera();
    this.setupLights();
    await this.createEarth();
    this.setupControls();
    this.createStarField();
    await this.loadRealData();
    this.createAtmosphericEffects();
    this.setupEventListeners();
    this.updateUI();
    this.animate();
    this.hideLoadingScreen();
    
    console.log('✅ Globe initialized successfully');
  }
  
  setupRenderer() {
    const width = window.innerWidth;
    const height = window.innerHeight - 48; // Navbar height
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000510, 1); // Deep space blue
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }
  
  setupCamera() {
    this.camera.position.set(0, 0, 3);
    this.camera.lookAt(0, 0, 0);
  }
  
  setupLights() {
    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0x5dbcd2, 0.3);
    this.scene.add(ambient);
    
    // Sun light (main directional light)
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 2, 5);
    sun.castShadow = true;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 50;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    this.scene.add(sun);
    
    // Hemisphere light for sky/ground
    const hemiLight = new THREE.HemisphereLight(0x5dbcd2, 0x0a1929, 0.5);
    this.scene.add(hemiLight);
    
    // Rim light for edge glow
    const rim = new THREE.DirectionalLight(0x5dbcd2, 0.5);
    rim.position.set(-5, 0, -5);
    this.scene.add(rim);
  }
  
  async createEarth() {
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    
    // Create realistic Earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // Deep ocean gradient
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 2048);
    oceanGradient.addColorStop(0, '#0a1929'); // Dark blue top
    oceanGradient.addColorStop(0.5, '#1a4d6b'); // Mid ocean
    oceanGradient.addColorStop(1, '#0a1929'); // Dark blue bottom
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 4096, 2048);
    
    // Land masses with realistic distribution
    ctx.fillStyle = '#1a3a2a';
    ctx.globalAlpha = 0.7;
    
    // Simulate continents with organic shapes
    const landMasses = [
      // North America
      { x: 700, y: 600, r: 250, count: 30 },
      // South America
      { x: 1000, y: 1200, r: 180, count: 25 },
      // Europe
      { x: 2100, y: 650, r: 120, count: 20 },
      // Africa
      { x: 2200, y: 1000, r: 220, count: 35 },
      // Asia
      { x: 2800, y: 700, r: 350, count: 45 },
      // Australia
      { x: 3400, y: 1300, r: 140, count: 20 }
    ];
    
    landMasses.forEach(land => {
      for (let i = 0; i < land.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * land.r;
        const x = land.x + Math.cos(angle) * distance;
        const y = land.y + Math.sin(angle) * distance;
        const size = Math.random() * 80 + 40;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Enhanced material with better lighting
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0xffffff,
      emissive: 0x0a1929,
      emissiveIntensity: 0.15,
      specular: 0x222222,
      shininess: 25,
      bumpScale: 0.002
    });
    
    this.earth = new THREE.Mesh(geometry, material);
    this.earth.receiveShadow = true;
    this.earth.castShadow = false;
    this.scene.add(this.earth);
    
    // Multi-layer atmosphere
    this.createAtmosphere();
  }
  
  createAtmosphere() {
    // Inner atmosphere glow
    const innerGeo = new THREE.SphereGeometry(1.015, 64, 64);
    const innerMat = new THREE.ShaderMaterial({
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.36, 0.74, 0.82, 1.0) * intensity;
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    
    const innerAtmo = new THREE.Mesh(innerGeo, innerMat);
    this.scene.add(innerAtmo);
    
    // Outer atmosphere glow
    const outerGeo = new THREE.SphereGeometry(1.08, 64, 64);
    const outerMat = new THREE.ShaderMaterial({
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
          float intensity = pow(0.8 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          gl_FragColor = vec4(0.3, 0.6, 0.9, 0.6) * intensity;
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    
    const outerAtmo = new THREE.Mesh(outerGeo, outerMat);
    this.scene.add(outerAtmo);
  }
  
  createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 15000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      // Position
      const radius = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color (slightly varied whites and blues)
      const colorVariation = Math.random();
      if (colorVariation > 0.95) {
        // Blue stars
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1.0;
      } else if (colorVariation > 0.90) {
        // Yellow stars
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 0.8;
      } else {
        // White stars
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      }
      
      // Size
      sizes[i] = Math.random() * 0.03 + 0.01;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }
  
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 10;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.2;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 0.8;
  }
  
  async loadRealData() {
    try {
      console.log('📡 Loading data from Our World In Data...');
      
      // Load PM2.5 data with coordinates
      this.pm25Data = await this.dataService.getEnrichedData();
      
      // Extract available years
      const yearsSet = new Set();
      this.pm25Data.forEach(country => {
        country.data.forEach(d => yearsSet.add(d.year));
      });
      this.availableYears = Array.from(yearsSet).sort((a, b) => a - b);
      
      // Set current year to latest available
      if (this.availableYears.length > 0) {
        this.currentYear = this.availableYears[this.availableYears.length - 1];
      }
      
      console.log(`✅ Loaded data for ${this.pm25Data.length} countries`);
      console.log(`📅 Years available: ${this.availableYears[0]} - ${this.availableYears[this.availableYears.length - 1]}`);
      
      // Create visualizations
      this.createDataMarkers();
      this.updateYearSlider();
      
    } catch (error) {
      console.error('❌ Failed to load data:', error);
    }
  }
  
  createDataMarkers() {
    // Clear existing markers
    this.markers.forEach(marker => this.earth.remove(marker));
    this.markers = [];
    
    if (!this.pm25Data || this.pm25Data.length === 0) {
      console.warn('⚠️  No data available to create markers');
      return;
    }
    
    // Create markers for each country
    this.pm25Data.forEach(country => {
      const yearData = country.data.find(d => d.year === this.currentYear);
      if (!yearData) return;
      
      const pm25 = yearData.pm25;
      if (pm25 <= 0) return;
      
      // Create marker geometry based on PM2.5 level
      const size = Math.max(0.015, Math.min(0.04, pm25 / 100));
      const geometry = new THREE.SphereGeometry(size, 16, 16);
      
      // Get color based on PM2.5 AQI scale
      const color = this.getPM25Color(pm25);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85
      });
      
      const marker = new THREE.Mesh(geometry, material);
      
      // Position on globe surface
      const pos = this.latLonToVector3(country.latitude, country.longitude, 1.01);
      marker.position.copy(pos);
      
      // Store data for interaction
      marker.userData = {
        type: 'country',
        name: country.name,
        code: country.code,
        pm25,
        year: this.currentYear,
        latitude: country.latitude,
        longitude: country.longitude
      };
      
      // Add glow for high pollution
      if (pm25 > 50) {
        const glowGeometry = new THREE.SphereGeometry(size * 1.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(pos);
        this.earth.add(glow);
        this.markers.push(glow);
      }
      
      this.earth.add(marker);
      this.markers.push(marker);
    });
    
    console.log(`✅ Created ${this.markers.length} data markers`);
  }
  
  createAtmosphericEffects() {
    if (!this.showParticles) return;
    
    // Create flowing particle system
    const particleCount = 8000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Position particles in atmosphere layer
      const radius = 1.05 + Math.random() * 0.15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Velocity simulation (wind-like flow)
      velocities.push({
        vx: (Math.random() - 0.5) * 0.001,
        vy: (Math.random() - 0.5) * 0.001,
        vz: (Math.random() - 0.5) * 0.001,
        speed: Math.random() * 0.002 + 0.001
      });
      
      // Color variation for particles
      const colorChoice = Math.random();
      if (colorChoice > 0.8) {
        // Cyan particles
        colors[i * 3] = 0.3;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1.0;
      } else {
        // White particles
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.004,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    this.particleSystem = new THREE.Points(geometry, material);
    this.particleVelocities = velocities;
    this.scene.add(this.particleSystem);
  }
  
  updateParticles() {
    if (!this.particleSystem || !this.showParticles) return;
    
    const positions = this.particleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      const vel = this.particleVelocities[i];
      
      // Update position based on velocity
      positions[i * 3] += vel.vx;
      positions[i * 3 + 1] += vel.vy;
      positions[i * 3 + 2] += vel.vz;
      
      // Calculate distance from center
      const dist = Math.sqrt(
        positions[i * 3] ** 2 +
        positions[i * 3 + 1] ** 2 +
        positions[i * 3 + 2] ** 2
      );
      
      // Reset particle if out of bounds
      if (dist > 1.25 || dist < 1.03) {
        const radius = 1.05 + Math.random() * 0.15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
      }
    }
    
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }
  
  latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }
  
  getPM25Color(pm25) {
    // WHO Air Quality Guidelines scale
    if (pm25 <= 12) return 0x00e400;      // Good
    if (pm25 <= 35.4) return 0xffff00;    // Moderate
    if (pm25 <= 55.4) return 0xff7e00;    // Unhealthy (Sensitive)
    if (pm25 <= 150.4) return 0xff0000;   // Unhealthy
    if (pm25 <= 250.4) return 0x8f3f97;   // Very Unhealthy
    return 0x7e0023;                       // Hazardous
  }
  
  colorToHex(color) {
    return `#${color.toString(16).padStart(6, '0')}`;
  }
  
  getAQIInfo(pm25) {
    if (pm25 <= 12) return { color: '#00e400', label: 'Good', description: 'Air quality is satisfactory' };
    if (pm25 <= 35.4) return { color: '#ffff00', label: 'Moderate', description: 'Acceptable for most people' };
    if (pm25 <= 55.4) return { color: '#ff7e00', label: 'Unhealthy (Sensitive)', description: 'Sensitive groups may experience effects' };
    if (pm25 <= 150.4) return { color: '#ff0000', label: 'Unhealthy', description: 'Everyone may begin to experience effects' };
    if (pm25 <= 250.4) return { color: '#8f3f97', label: 'Very Unhealthy', description: 'Health alert: everyone may experience serious effects' };
    return { color: '#7e0023', label: 'Hazardous', description: 'Health warning of emergency conditions' };
  }
  
  setupEventListeners() {
    // Window resize
    window.addEventListener('resize', () => this.onResize());
    
    // Mouse move for hover effects
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    
    // Click for details
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    
    // Data layer selection
    document.getElementById('data-layer')?.addEventListener('change', (e) => {
      this.dataLayer = e.target.value;
      this.createDataMarkers();
      this.updateUI();
    });
    
    // Overlay type
    document.getElementById('overlay-type')?.addEventListener('change', (e) => {
      const type = e.target.value;
      
      if (type === 'particles') {
        this.showParticles = true;
        if (this.particleSystem) this.particleSystem.visible = true;
      } else if (type === 'stations') {
        this.showParticles = false;
        if (this.particleSystem) this.particleSystem.visible = false;
      } else if (type === 'none') {
        this.showParticles = false;
        if (this.particleSystem) this.particleSystem.visible = false;
      }
    });
    
    // Year slider
    document.getElementById('year-slider')?.addEventListener('input', (e) => {
      const index = parseInt(e.target.value);
      if (this.availableYears[index]) {
        this.currentYear = this.availableYears[index];
        document.getElementById('current-year').textContent = this.currentYear;
        this.createDataMarkers();
        this.updateDataPanel();
      }
    });
    
    // Play/Pause timeline
    document.getElementById('play-pause')?.addEventListener('click', () => {
      this.toggleTimeline();
    });
    
    // Panel toggles
    document.getElementById('panel-toggle')?.addEventListener('click', () => {
      const panel = document.getElementById('data-panel');
      panel.classList.toggle('hidden');
    });
    
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar-menu');
      sidebar.classList.toggle('collapsed');
    });
  }
  
  updateYearSlider() {
    const slider = document.getElementById('year-slider');
    if (!slider || this.availableYears.length === 0) return;
    
    slider.min = 0;
    slider.max = this.availableYears.length - 1;
    slider.value = this.availableYears.length - 1; // Latest year
    
    // Update year display
    document.getElementById('current-year').textContent = this.currentYear;
  }
  
  async toggleTimeline() {
    if (this.isAnimating) {
      this.isAnimating = false;
      document.getElementById('play-pause').textContent = '▶';
      return;
    }
    
    this.isAnimating = true;
    document.getElementById('play-pause').textContent = '⏸';
    
    const slider = document.getElementById('year-slider');
    const startIndex = parseInt(slider.value);
    
    for (let i = startIndex; i < this.availableYears.length; i++) {
      if (!this.isAnimating) break;
      
      this.currentYear = this.availableYears[i];
      slider.value = i;
      document.getElementById('current-year').textContent = this.currentYear;
      this.createDataMarkers();
      this.updateDataPanel();
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    this.isAnimating = false;
    document.getElementById('play-pause').textContent = '▶';
  }
  
  updateUI() {
    this.updateDataPanel();
  }
  
  updateDataPanel() {
    if (!this.pm25Data || this.pm25Data.length === 0) return;
    
    // Calculate global statistics for current year
    const currentYearData = this.pm25Data.map(country => {
      const yearData = country.data.find(d => d.year === this.currentYear);
      return {
        name: country.name,
        pm25: yearData?.pm25 || 0
      };
    }).filter(d => d.pm25 > 0);
    
    // Global average
    const avgPM25 = currentYearData.reduce((sum, d) => sum + d.pm25, 0) / currentYearData.length;
    document.getElementById('global-pm25').textContent = `${avgPM25.toFixed(1)} μg/m³`;
    
    // Total countries with data
    document.getElementById('total-stations').textContent = currentYearData.length;
    
    // Most polluted regions
    const mostPolluted = currentYearData
      .sort((a, b) => b.pm25 - a.pm25)
      .slice(0, 5);
    
    const pollutedList = document.getElementById('polluted-list');
    if (pollutedList) {
      pollutedList.innerHTML = mostPolluted.map(d => `
        <div class="city-item">
          <span class="city-name">${d.name}</span>
          <span class="city-value" style="color: ${this.colorToHex(this.getPM25Color(d.pm25))}">${d.pm25.toFixed(1)}</span>
        </div>
      `).join('');
    }
    
    // Cleanest regions
    const cleanest = currentYearData
      .sort((a, b) => a.pm25 - b.pm25)
      .slice(0, 5);
    
    const cleanestList = document.getElementById('cleanest-list');
    if (cleanestList) {
      cleanestList.innerHTML = cleanest.map(d => `
        <div class="city-item">
          <span class="city-name">${d.name}</span>
          <span class="city-value" style="color: ${this.colorToHex(this.getPM25Color(d.pm25))}">${d.pm25.toFixed(1)}</span>
        </div>
      `).join('');
    }
  }
  
  onMouseMove(event) {
    // Update mouse position
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - 48) / (window.innerHeight - 48)) * 2 + 1;
    
    // Check for hover
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markers);
    
    if (intersects.length > 0) {
      const marker = intersects[0].object;
      if (marker !== this.hoveredMarker) {
        this.hoveredMarker = marker;
        this.canvas.style.cursor = 'pointer';
      }
    } else {
      if (this.hoveredMarker) {
        this.hoveredMarker = null;
        this.canvas.style.cursor = 'default';
      }
    }
  }
  
  onClick(event) {
    if (!this.hoveredMarker) return;
    
    const data = this.hoveredMarker.userData;
    if (data.type === 'country') {
      this.showCountryDetails(data);
    }
  }
  
  showCountryDetails(data) {
    const panel = document.getElementById('info-panel');
    const aqiInfo = this.getAQIInfo(data.pm25);
    
    panel.innerHTML = `
      <button id="close-info" class="close-btn">×</button>
      <h3>🌍 ${data.name}</h3>
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Year:</span>
          <span>${data.year}</span>
        </div>
        <div class="info-row">
          <span class="info-label">PM2.5:</span>
          <span style="color: ${aqiInfo.color}; font-weight: bold;">${data.pm25.toFixed(1)} μg/m³</span>
        </div>
        <div class="info-row">
          <span class="info-label">Air Quality:</span>
          <span style="color: ${aqiInfo.color}">${aqiInfo.label}</span>
        </div>
        <div class="info-description">
          ${aqiInfo.description}
        </div>
        <div class="info-row">
          <span class="info-label">Location:</span>
          <span>${data.latitude.toFixed(2)}°, ${data.longitude.toFixed(2)}°</span>
        </div>
      </div>
    `;
    
    panel.style.display = 'block';
    
    document.getElementById('close-info')?.addEventListener('click', () => {
      panel.style.display = 'none';
    }, { once: true });
  }
  
  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight - 48;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  calculateFPS() {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;
    
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      const fpsElement = document.getElementById('fps-counter');
      if (fpsElement) fpsElement.textContent = `${this.fps} FPS`;
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update controls
    this.controls.update();
    
    // Gentle Earth rotation
    if (this.earth) {
      this.earth.rotation.y += 0.0002;
    }
    
    // Subtle star field rotation
    if (this.stars) {
      this.stars.rotation.y += 0.00005;
    }
    
    // Update particles
    this.updateParticles();
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    // Calculate FPS
    this.calculateFPS();
  }
  
  hideLoadingScreen() {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      setTimeout(() => {
        loading.classList.add('fade-out');
        setTimeout(() => {
          loading.style.display = 'none';
        }, 500);
      }, 1000);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EnhancedGlobe();
    initMobileMenu();
  });
} else {
  new EnhancedGlobe();
  initMobileMenu();
}

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
