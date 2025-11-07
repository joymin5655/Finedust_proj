/**
 * AirLens Interactive 3D Globe
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
    this.selectedMarker = null;
    
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
    await this.loadStations();
    this.setupEventListeners();
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
    
    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    
    // For now, use a simple color. Later we can add actual Earth texture
    const material = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      specular: 0x333333,
      shininess: 15
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
  
  async loadStations() {
    try {
      // For demo, create sample data
      // In production, fetch from: data/stations.json
      this.stations = this.generateSampleStations(500);
      this.createMarkers();
      this.updateStats();
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
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
  
  createMarkers() {
    const markerGeometry = new THREE.SphereGeometry(0.008, 8, 8);
    
    this.stations.forEach(station => {
      const color = this.getPM25Color(station.pm25);
      const material = new THREE.MeshBasicMaterial({ color });
      const marker = new THREE.Mesh(markerGeometry, material);
      
      // Convert lat/lon to 3D position
      const pos = this.latLonToVector3(station.lat, station.lon, 1.01);
      marker.position.copy(pos);
      marker.userData = station;
      
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
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    
    // Controls
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
      this.showStationInfo(marker.userData);
    }
  }
  
  showStationInfo(station) {
    const panel = document.getElementById('info-panel');
    panel.style.display = 'block';
    
    document.getElementById('station-name').textContent = station.name;
    document.getElementById('station-country').textContent = station.country;
    document.getElementById('station-pm25').textContent = `${station.pm25.toFixed(1)} μg/m³`;
    document.getElementById('station-pm10').textContent = `${station.pm10.toFixed(1)} μg/m³`;
    document.getElementById('station-aqi').textContent = station.aqi;
    document.getElementById('station-updated').textContent = new Date(station.updated).toLocaleDateString();
    
    document.getElementById('close-info')?.addEventListener('click', () => {
      panel.style.display = 'none';
    }, { once: true });
  }
  
  updateStats() {
    document.getElementById('total-stations').textContent = this.stations.length;
    document.getElementById('visible-stations').textContent = this.markers.length;
  }
  
  calculateFPS() {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;
    
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      document.getElementById('fps-counter').textContent = this.fps;
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
    loading.classList.add('hidden');
    setTimeout(() => {
      loading.style.display = 'none';
    }, 500);
  }
}

// Initialize globe
new AirLensGlobe();
