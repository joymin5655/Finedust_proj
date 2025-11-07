/**
 * AirLens Interactive 3D Globe - Enhanced with Our World in Data visualization
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
    this.markers = [];
    this.countryData = null;
    this.selectedMarker = null;
    this.currentYear = 2021;
    this.isAnimating = false;
    
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
    await this.loadData();
    this.setupEventListeners();
    this.setupDataPanel();
    this.animate();
    
    this.hideLoadingScreen();
  }
  
  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight - 48);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }
  
  setupCamera() {
    this.camera.position.z = 2.5;
  }
  
  setupLights() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    
    // Directional light (sun)
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(5, 3, 5);
    this.scene.add(sun);
  }
  
  async createEarth() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    const material = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      specular: 0x333333,
      shininess: 15,
      transparent: true,
      opacity: 0.9
    });
    
    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
    
    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x5ac8fa,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.scene.add(atmosphere);
  }
  
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 5;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
  }
  
  async loadData() {
    try {
      // Load Our World in Data style pollution data
      const response = await fetch('../data/air-pollution-deaths.json');
      this.countryData = await response.json();
      
      // Load stations data
      this.stations = this.generateSampleStations(500);
      
      // Create country markers with Our World in Data visualization
      this.createCountryMarkers();
      this.createStationMarkers();
      this.updateVisualization();
      this.updateStats();
    } catch (error) {
      console.error('Failed to load data:', error);
      // Fallback to sample data
      this.stations = this.generateSampleStations(500);
      this.createStationMarkers();
      this.updateStats();
    }
  }
  
  createCountryMarkers() {
    if (!this.countryData || !this.countryData.countries) return;
    
    const countryGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    
    this.countryData.countries.forEach(country => {
      const yearData = country.data.find(d => d.year === this.currentYear);
      if (!yearData) return;
      
      // Create marker with color based on PM2.5 exposure
      const color = this.getPM25ExposureColor(yearData.pm25Exposure);
      const material = new THREE.MeshBasicMaterial({ 
        color,
        transparent: true,
        opacity: 0.7
      });
      
      const marker = new THREE.Mesh(countryGeometry, material);
      
      // Position marker at country location
      const pos = this.latLonToVector3(country.latitude, country.longitude, 1.02);
      marker.position.copy(pos);
      marker.userData = { 
        type: 'country',
        country: country.name,
        data: country,
        yearData: yearData
      };
      
      this.earth.add(marker);
      this.markers.push(marker);
      
      // Add data label (floating text)
      this.createDataLabel(country, pos);
    });
  }
  
  createDataLabel(country, position) {
    const yearData = country.data.find(d => d.year === this.currentYear);
    if (!yearData) return;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Draw text
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    context.fillText(country.name, 128, 40);
    context.font = '18px Arial';
    context.fillText(`PM2.5: ${yearData.pm25Exposure.toFixed(1)}`, 128, 70);
    context.fillText(`Deaths: ${yearData.totalDeaths.toFixed(1)}/100k`, 128, 95);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.8
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position).multiplyScalar(1.15);
    sprite.scale.set(0.3, 0.15, 1);
    
    this.earth.add(sprite);
  }
  
  getPM25ExposureColor(exposure) {
    // Our World in Data style gradient
    if (exposure <= 10) return 0x00e400;     // Excellent (green)
    if (exposure <= 25) return 0xffff00;     // Good (yellow)
    if (exposure <= 50) return 0xff7e00;     // Moderate (orange)
    if (exposure <= 75) return 0xff0000;     // Unhealthy (red)
    return 0x99004c;                         // Hazardous (purple)
  }
  
  generateSampleStations(count) {
    const stations = [];
    for (let i = 0; i < count; i++) {
      const lat = (Math.random() - 0.5) * 180;
      const lon = (Math.random() - 0.5) * 360;
      const pm25 = Math.random() * 150;
      
      stations.push({
        id: `station_${i}`,
        name: `Station ${i}`,
        lat,
        lon,
        country: 'Sample',
        pm25,
        pm10: pm25 * 1.5,
        aqi: Math.floor(pm25 * 2),
        updated: new Date().toISOString()
      });
    }
    return stations;
  }
  
  createStationMarkers() {
    const markerGeometry = new THREE.SphereGeometry(0.008, 8, 8);
    
    this.stations.forEach(station => {
      const color = this.getPM25Color(station.pm25);
      const material = new THREE.MeshBasicMaterial({ color });
      const marker = new THREE.Mesh(markerGeometry, material);
      
      const pos = this.latLonToVector3(station.lat, station.lon, 1.01);
      marker.position.copy(pos);
      marker.userData = { type: 'station', ...station };
      
      this.earth.add(marker);
      this.markers.push(marker);
    });
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
    if (pm25 <= 12) return 0x00ff00;      // Green
    if (pm25 <= 35) return 0xffff00;      // Yellow
    if (pm25 <= 55) return 0xff8800;      // Orange
    if (pm25 <= 150) return 0xff0000;     // Red
    return 0x8b0000;                      // Dark red
  }
  
  setupDataPanel() {
    const panel = document.createElement('div');
    panel.id = 'owid-data-panel';
    panel.className = 'owid-panel';
    panel.innerHTML = `
      <div class="owid-header">
        <h2>🌍 Air Pollution Deaths</h2>
        <p class="owid-subtitle">Deaths per 100,000 people</p>
      </div>
      <div class="owid-timeline">
        <label>Year: <span id="current-year-display">2021</span></label>
        <input type="range" id="year-slider" min="0" max="4" value="4" step="1">
        <div class="year-labels">
          <span>1990</span><span>2000</span><span>2010</span><span>2019</span><span>2021</span>
        </div>
      </div>
      <div class="owid-stats">
        <div class="owid-stat">
          <div class="stat-value" id="global-deaths">0</div>
          <div class="stat-label">Global Deaths Rate</div>
        </div>
        <div class="owid-stat">
          <div class="stat-value" id="trend-indicator">-22%</div>
          <div class="stat-label">Since 1990</div>
        </div>
      </div>
      <div class="owid-legend">
        <h3>PM2.5 Exposure Levels</h3>
        <div class="legend-item"><span class="legend-color" style="background: #00e400"></span> Excellent (0-10)</div>
        <div class="legend-item"><span class="legend-color" style="background: #ffff00"></span> Good (10-25)</div>
        <div class="legend-item"><span class="legend-color" style="background: #ff7e00"></span> Moderate (25-50)</div>
        <div class="legend-item"><span class="legend-color" style="background: #ff0000"></span> Unhealthy (50-75)</div>
        <div class="legend-item"><span class="legend-color" style="background: #99004c"></span> Hazardous (75+)</div>
      </div>
      <div class="owid-footer">
        <p>Data source: Our World in Data / IHME</p>
        <button id="play-animation" class="owid-button">▶ Play Timeline</button>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Setup event listeners for panel
    document.getElementById('year-slider')?.addEventListener('input', (e) => {
      const years = [1990, 2000, 2010, 2019, 2021];
      this.currentYear = years[parseInt(e.target.value)];
      document.getElementById('current-year-display').textContent = this.currentYear;
      this.updateVisualization();
    });
    
    document.getElementById('play-animation')?.addEventListener('click', () => {
      this.playTimeline();
    });
  }
  
  updateVisualization() {
    if (!this.countryData) return;
    
    // Clear existing country markers
    this.markers.forEach(marker => {
      if (marker.userData.type === 'country') {
        this.earth.remove(marker);
      }
    });
    
    this.markers = this.markers.filter(m => m.userData.type !== 'country');
    
    // Recreate with new year data
    this.createCountryMarkers();
    this.updateGlobalStats();
  }
  
  updateGlobalStats() {
    if (!this.countryData || !this.countryData.globalTrends) return;
    
    const yearData = this.countryData.globalTrends[this.currentYear];
    if (!yearData) return;
    
    document.getElementById('global-deaths').textContent = 
      yearData.totalDeaths.toFixed(1);
    
    // Calculate trend since 1990
    const data1990 = this.countryData.globalTrends[1990];
    const percentChange = ((yearData.totalDeaths - data1990.totalDeaths) / data1990.totalDeaths * 100).toFixed(1);
    document.getElementById('trend-indicator').textContent = 
      `${percentChange > 0 ? '+' : ''}${percentChange}%`;
  }
  
  async playTimeline() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const button = document.getElementById('play-animation');
    button.textContent = '⏸ Pause';
    button.disabled = true;
    
    const years = [1990, 2000, 2010, 2019, 2021];
    const slider = document.getElementById('year-slider');
    
    for (let i = 0; i < years.length; i++) {
      if (!this.isAnimating) break;
      
      this.currentYear = years[i];
      slider.value = i;
      document.getElementById('current-year-display').textContent = this.currentYear;
      this.updateVisualization();
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    this.isAnimating = false;
    button.textContent = '▶ Play Timeline';
    button.disabled = false;
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    
    document.getElementById('reset-view')?.addEventListener('click', () => {
      this.camera.position.set(0, 0, 2.5);
      this.controls.reset();
    });
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
      } else {
        this.showStationInfo(marker.userData);
      }
    }
  }
  
  showCountryInfo(data) {
    const panel = document.getElementById('info-panel') || this.createInfoPanel();
    panel.style.display = 'block';
    
    const country = data.data;
    const yearData = data.yearData;
    
    panel.innerHTML = `
      <div class="info-header">
        <h3>${country.name}</h3>
        <button id="close-info" class="close-btn">✕</button>
      </div>
      <div class="info-content">
        <div class="info-row">
          <span class="info-label">Year:</span>
          <span class="info-value">${this.currentYear}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Deaths:</span>
          <span class="info-value">${yearData.totalDeaths.toFixed(1)}/100k</span>
        </div>
        <div class="info-row">
          <span class="info-label">Outdoor:</span>
          <span class="info-value">${yearData.outdoorDeaths.toFixed(1)}/100k</span>
        </div>
        <div class="info-row">
          <span class="info-label">Indoor:</span>
          <span class="info-value">${yearData.indoorDeaths.toFixed(1)}/100k</span>
        </div>
        <div class="info-row">
          <span class="info-label">PM2.5 Exposure:</span>
          <span class="info-value">${yearData.pm25Exposure.toFixed(1)} μg/m³</span>
        </div>
        <div class="info-row">
          <span class="info-label">GDP per capita:</span>
          <span class="info-value">$${country.gdpPerCapita.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Population:</span>
          <span class="info-value">${(country.population / 1000000).toFixed(1)}M</span>
        </div>
      </div>
    `;
    
    document.getElementById('close-info')?.addEventListener('click', () => {
      panel.style.display = 'none';
    }, { once: true });
  }
  
  createInfoPanel() {
    const panel = document.createElement('div');
    panel.id = 'info-panel';
    panel.className = 'info-panel';
    document.body.appendChild(panel);
    return panel;
  }
  
  showStationInfo(station) {
    const panel = document.getElementById('info-panel') || this.createInfoPanel();
    panel.style.display = 'block';
    
    panel.innerHTML = `
      <div class="info-header">
        <h3>${station.name}</h3>
        <button id="close-info" class="close-btn">✕</button>
      </div>
      <div class="info-content">
        <div class="info-row">
          <span class="info-label">Country:</span>
          <span class="info-value">${station.country}</span>
        </div>
        <div class="info-row">
          <span class="info-label">PM2.5:</span>
          <span class="info-value">${station.pm25.toFixed(1)} μg/m³</span>
        </div>
        <div class="info-row">
          <span class="info-label">PM10:</span>
          <span class="info-value">${station.pm10.toFixed(1)} μg/m³</span>
        </div>
        <div class="info-row">
          <span class="info-label">AQI:</span>
          <span class="info-value">${station.aqi}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Updated:</span>
          <span class="info-value">${new Date(station.updated).toLocaleDateString()}</span>
        </div>
      </div>
    `;
    
    document.getElementById('close-info')?.addEventListener('click', () => {
      panel.style.display = 'none';
    }, { once: true });
  }
  
  updateStats() {
    document.getElementById('total-stations')?.textContent = this.stations.length;
    document.getElementById('visible-stations')?.textContent = this.markers.length;
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
    this.earth.rotation.y += 0.0005;
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
