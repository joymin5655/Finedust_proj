/**
 * AirLens Interactive 3D Globe - Earth.Nullschool + Google Earth Style
 * Real-time PM2.5 visualization with particle effects and smooth interactions
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class AirLensGlobe {
  constructor() {
    this.canvas = document.getElementById('globe-canvas');
    this.container = document.getElementById('globe-container');
    
    // Scene setup
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
      alpha: true
    });
    
    // Data
    this.stations = [];
    this.pm25Data = null;
    this.markers = [];
    this.particles = [];
    this.currentYear = 2021;
    this.isAnimating = false;
    
    // Settings
    this.showParticles = true;
    this.showHeatmap = true;
    this.showStations = true;
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
    this.createStarField();
    await this.loadAllData();
    this.createParticleSystem();
    this.setupEventListeners();
    this.updateDataPanel();
    this.animate();
    this.hideLoadingScreen();
  }
  
  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight - 48);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  
  setupCamera() {
    this.camera.position.set(0, 0, 2.8);
  }
  
  setupLights() {
    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);
    
    // Sun light (directional)
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(5, 3, 5);
    sun.castShadow = true;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 50;
    this.scene.add(sun);
    
    // Hemisphere light for realistic sky illumination
    const hemiLight = new THREE.HemisphereLight(0x5dbcd2, 0x0a1929, 0.6);
    this.scene.add(hemiLight);
  }
  
  async createEarth() {
    // Earth sphere with realistic texture
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    
    // Load earth texture (blue/green for now, can be replaced with actual texture)
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create gradient for ocean
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
    gradient.addColorStop(0, '#0a1929');
    gradient.addColorStop(0.5, '#1a3a52');
    gradient.addColorStop(1, '#0a1929');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2048, 1024);
    
    // Add land masses (simplified)
    ctx.fillStyle = '#2a4a3a';
    ctx.globalAlpha = 0.6;
    // Add some random land masses for visual appeal
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 2048,
        Math.random() * 1024,
        Math.random() * 100 + 50,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0xffffff,
      emissive: 0x0a1929,
      emissiveIntensity: 0.2,
      specular: 0x333333,
      shininess: 10,
      transparent: false
    });
    
    this.earth = new THREE.Mesh(geometry, material);
    this.earth.receiveShadow = true;
    this.scene.add(this.earth);
    
    // Atmosphere glow effect
    this.createAtmosphere();
  }
  
  createAtmosphere() {
    const geometry = new THREE.SphereGeometry(1.05, 64, 64);
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
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.36, 0.74, 0.82, 1.0) * intensity;
        }
      `,
      transparent: true,
      side: THREE.BackSide
    });
    
    const atmosphere = new THREE.Mesh(geometry, material);
    this.scene.add(atmosphere);
  }
  
  createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
  }
  
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 8;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.3;
    this.controls.enablePan = false;
  }
  
  async loadAllData() {
    try {
      // Load stations
      const stationsResponse = await fetch('data/stations.json');
      const stationsData = await stationsResponse.json();
      this.stations = stationsData.stations;
      
      // Load PM2.5 country data
      const pm25Response = await fetch('data/pm25-data.json');
      this.pm25Data = await pm25Response.json();
      
      // Create visualizations
      this.createStationMarkers();
      this.createCountryMarkers();
      this.updateStats();
      
      console.log(`✅ Loaded ${this.stations.length} stations`);
      console.log(`✅ Loaded ${this.pm25Data.countries.length} countries`);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }
  
  createStationMarkers() {
    if (!this.showStations) return;
    
    // Clear existing markers
    this.markers.forEach(m => {
      if (m.userData.type === 'station') {
        this.earth.remove(m);
      }
    });
    
    const geometry = new THREE.SphereGeometry(0.01, 8, 8);
    
    this.stations.forEach(station => {
      const color = this.getPM25Color(station.pm25);
      const material = new THREE.MeshBasicMaterial({ 
        color,
        transparent: true,
        opacity: 0.9
      });
      const marker = new THREE.Mesh(geometry, material);
      
      const pos = this.latLonToVector3(station.latitude, station.longitude, 1.01);
      marker.position.copy(pos);
      marker.userData = { type: 'station', ...station };
      
      this.earth.add(marker);
      this.markers.push(marker);
    });
  }
  
  createCountryMarkers() {
    if (!this.pm25Data) return;
    
    // Clear existing country markers
    this.markers = this.markers.filter(m => {
      if (m.userData.type === 'country') {
        this.earth.remove(m);
        return false;
      }
      return true;
    });
    
    const geometry = new THREE.SphereGeometry(0.025, 16, 16);
    
    this.pm25Data.countries.forEach(country => {
      const yearData = country.data.find(d => d.year === this.currentYear);
      if (!yearData) return;
      
      const pm25Value = this.dataLayer === 'pm25' ? yearData.pm25 : yearData.pm10;
      const color = this.getPM25Color(pm25Value);
      const material = new THREE.MeshBasicMaterial({ 
        color,
        transparent: true,
        opacity: 0.85
      });
      
      const marker = new THREE.Mesh(geometry, material);
      const pos = this.latLonToVector3(country.latitude, country.longitude, 1.02);
      marker.position.copy(pos);
      marker.userData = { type: 'country', country, yearData, pm25Value };
      
      // Add glow effect for high PM2.5
      if (pm25Value > 50) {
        const glowGeometry = new THREE.SphereGeometry(0.03, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(pos);
        this.earth.add(glow);
      }
      
      this.earth.add(marker);
      this.markers.push(marker);
    });
  }
  
  createParticleSystem() {
    if (!this.showParticles) return;
    
    // Create particle flow effect (wind simulation)
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.08 + Math.random() * 0.1;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      velocities.push({
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.002,
        vz: (Math.random() - 0.5) * 0.002
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x5dbcd2,
      size: 0.005,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
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
      
      positions[i * 3] += vel.vx;
      positions[i * 3 + 1] += vel.vy;
      positions[i * 3 + 2] += vel.vz;
      
      // Reset if too far
      const dist = Math.sqrt(
        positions[i * 3] ** 2 +
        positions[i * 3 + 1] ** 2 +
        positions[i * 3 + 2] ** 2
      );
      
      if (dist > 1.3 || dist < 1.05) {
        const radius = 1.08 + Math.random() * 0.1;
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
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
  }
  
  getPM25Color(pm25) {
    // AQI Color scale
    if (pm25 <= 12) return 0x00e400; // Good
    if (pm25 <= 35.4) return 0xffff00; // Moderate
    if (pm25 <= 55.4) return 0xff7e00; // Unhealthy for Sensitive
    if (pm25 <= 150.4) return 0xff0000; // Unhealthy
    if (pm25 <= 250.4) return 0x99004c; // Very Unhealthy
    return 0x7e0023; // Hazardous
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    
    // Data layer selection
    document.getElementById('data-layer')?.addEventListener('change', (e) => {
      this.dataLayer = e.target.value;
      this.createCountryMarkers();
      this.updateDataPanel();
    });
    
    // Overlay selection
    document.getElementById('overlay-type')?.addEventListener('change', (e) => {
      const type = e.target.value;
      this.showParticles = type === 'particles' || type === 'none';
      this.showStations = type === 'stations' || type === 'none';
      
      if (type === 'particles') {
        if (!this.particleSystem) this.createParticleSystem();
        this.particleSystem.visible = true;
      } else if (this.particleSystem) {
        this.particleSystem.visible = false;
      }
      
      this.createStationMarkers();
    });
    
    // Auto-rotate toggle
    document.getElementById('auto-rotate')?.addEventListener('change', (e) => {
      this.controls.autoRotate = e.target.checked;
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
    
    // Year slider
    document.getElementById('year-slider')?.addEventListener('input', (e) => {
      const years = [1990, 2000, 2010, 2019, 2021];
      this.currentYear = years[parseInt(e.target.value)];
      document.getElementById('current-year')?.textContent = this.currentYear;
      this.createCountryMarkers();
      this.updateDataPanel();
    });
    
    // Play/Pause animation
    document.getElementById('play-pause')?.addEventListener('click', () => {
      this.playTimeline();
    });
  }
  
  async playTimeline() {
    if (this.isAnimating) {
      this.isAnimating = false;
      document.getElementById('play-pause').textContent = '▶';
      return;
    }
    
    this.isAnimating = true;
    document.getElementById('play-pause').textContent = '⏸';
    
    const years = [1990, 2000, 2010, 2019, 2021];
    const slider = document.getElementById('year-slider');
    
    for (let i = 0; i < years.length; i++) {
      if (!this.isAnimating) break;
      
      this.currentYear = years[i];
      if (slider) slider.value = i;
      document.getElementById('current-year').textContent = this.currentYear;
      this.createCountryMarkers();
      this.updateDataPanel();
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    this.isAnimating = false;
    document.getElementById('play-pause').textContent = '▶';
  }
  
  updateDataPanel() {
    if (!this.pm25Data) return;
    
    // Calculate global average
    const yearData = this.pm25Data.globalTrends[this.currentYear];
    if (yearData) {
      document.getElementById('global-pm25').textContent = 
        `${yearData.avgPM25.toFixed(1)} μg/m³`;
    }
    
    // Update station count
    document.getElementById('total-stations').textContent = this.stations.length;
    
    // Update polluted and clean cities lists
    const currentYearCountries = this.pm25Data.countries.map(country => {
      const data = country.data.find(d => d.year === this.currentYear);
      return { ...country, pm25: data?.pm25 || 0 };
    });
    
    // Most polluted
    const polluted = currentYearCountries
      .sort((a, b) => b.pm25 - a.pm25)
      .slice(0, 5);
    
    const pollutedList = document.getElementById('polluted-list');
    if (pollutedList) {
      pollutedList.innerHTML = polluted.map(c => `
        <div class="city-item">
          <span class="city-name">${c.name}</span>
          <span class="city-value">${c.pm25.toFixed(1)}</span>
        </div>
      `).join('');
    }
    
    // Cleanest cities
    const cleanest = currentYearCountries
      .sort((a, b) => a.pm25 - b.pm25)
      .slice(0, 5);
    
    const cleanestList = document.getElementById('cleanest-list');
    if (cleanestList) {
      cleanestList.innerHTML = cleanest.map(c => `
        <div class="city-item">
          <span class="city-name">${c.name}</span>
          <span class="city-value">${c.pm25.toFixed(1)}</span>
        </div>
      `).join('');
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
      if (marker.userData.type === 'country') {
        this.showCountryInfo(marker.userData);
      } else if (marker.userData.type === 'station') {
        this.showStationInfo(marker.userData);
      }
    }
  }
  
  showCountryInfo(data) {
    const panel = document.getElementById('info-panel');
    const { country, yearData, pm25Value } = data;
    
    const aqiInfo = this.getAQIInfo(pm25Value);
    
    panel.innerHTML = `
      <button id="close-info" class="close-btn">×</button>
      <h3>${country.name}</h3>
      <div class="info-row">
        <span class="info-label">Year:</span>
        <span>${this.currentYear}</span>
      </div>
      <div class="info-row">
        <span class="info-label">PM2.5:</span>
        <span style="color: ${this.colorToHex(this.getPM25Color(yearData.pm25))}">${yearData.pm25.toFixed(1)} μg/m³</span>
      </div>
      <div class="info-row">
        <span class="info-label">PM10:</span>
        <span>${yearData.pm10.toFixed(1)} μg/m³</span>
      </div>
      <div class="info-row">
        <span class="info-label">Air Quality:</span>
        <span style="color: ${aqiInfo.color}">${aqiInfo.label}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Population:</span>
        <span>${(country.population / 1000000).toFixed(1)}M</span>
      </div>
    `;
    
    panel.style.display = 'block';
    
    document.getElementById('close-info')?.addEventListener('click', () => {
      panel.style.display = 'none';
    }, { once: true });
  }
  
  showStationInfo(station) {
    const panel = document.getElementById('info-panel');
    const aqiInfo = this.getAQIInfo(station.pm25);
    
    panel.innerHTML = `
      <button id="close-info" class="close-btn">×</button>
      <h3>📍 ${station.name}</h3>
      <div class="info-row">
        <span class="info-label">Country:</span>
        <span>${station.country}</span>
      </div>
      <div class="info-row">
        <span class="info-label">PM2.5:</span>
        <span style="color: ${this.colorToHex(this.getPM25Color(station.pm25))}">${station.pm25.toFixed(1)} μg/m³</span>
      </div>
      <div class="info-row">
        <span class="info-label">PM10:</span>
        <span>${station.pm10.toFixed(1)} μg/m³</span>
      </div>
      <div class="info-row">
        <span class="info-label">Air Quality:</span>
        <span style="color: ${aqiInfo.color}">${aqiInfo.label}</span>
      </div>
      <div class="info-row">
        <span class="info-label">AQI:</span>
        <span>${station.aqi}</span>
      </div>
    `;
    
    panel.style.display = 'block';
    
    document.getElementById('close-info')?.addEventListener('click', () => {
      panel.style.display = 'none';
    }, { once: true });
  }
  
  getAQIInfo(pm25) {
    const scale = this.pm25Data?.aqi_scale;
    if (!scale) return { color: '#5dbcd2', label: 'Unknown' };
    
    if (pm25 <= 12) return { color: '#00e400', label: 'Good' };
    if (pm25 <= 35.4) return { color: '#ffff00', label: 'Moderate' };
    if (pm25 <= 55.4) return { color: '#ff7e00', label: 'Unhealthy (Sensitive)' };
    if (pm25 <= 150.4) return { color: '#ff0000', label: 'Unhealthy' };
    if (pm25 <= 250.4) return { color: '#99004c', label: 'Very Unhealthy' };
    return { color: '#7e0023', label: 'Hazardous' };
  }
  
  colorToHex(color) {
    return `#${color.toString(16).padStart(6, '0')}`;
  }
  
  updateStats() {
    const totalElement = document.getElementById('total-stations');
    if (totalElement) totalElement.textContent = this.stations.length;
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
    
    this.controls.update();
    
    // Smooth earth rotation
    this.earth.rotation.y += 0.0003;
    
    // Update particles
    this.updateParticles();
    
    this.renderer.render(this.scene, this.camera);
    this.calculateFPS();
  }
  
  hideLoadingScreen() {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      setTimeout(() => {
        loading.classList.add('hidden');
        setTimeout(() => loading.style.display = 'none', 500);
      }, 1000);
    }
  }
}

// Initialize globe when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AirLensGlobe());
} else {
  new AirLensGlobe();
}
