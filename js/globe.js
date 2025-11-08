/**
 * AirLens Globe - Enhanced 3D Visualization
 * earth.nullschool.net inspired atmospheric flow simulation
 * With PM2.5 data integration and country labels
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class AirLensGlobeAdvanced {
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

    // Camera setup - positioned to show full globe
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 2.5); // Optimal distance to see full globe

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.3; // Minimum zoom
    this.controls.maxDistance = 4; // Maximum zoom
    this.controls.enablePan = false;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.5;

    // Enhanced particle system
    this.particles = null;
    this.particleCount = 8000; // Increased for better coverage
    this.particleSpeed = 1.0;
    this.particlesEnabled = false;

    // Globe objects
    this.earth = null;
    this.atmosphere = null;
    this.clouds = null;
    this.grid = null;
    this.stars = null;
    this.pm25Markers = null;
    this.sunLight = null;
    this.countryLabels = null;

    // PM2.5 data
    this.pm25Data = new Map();

    // Country data for labels
    this.countryData = [];

    // State
    this.showGrid = false;
    this.showPM25 = true;
    this.dayNightEnabled = true;

    // Animation
    this.clock = new THREE.Clock();
    this.time = 0;

    console.log('AirLens Globe initialized');
    this.init();
  }

  async init() {
    try {
      this.createLights();
      this.createStars();
      this.createEarth();
      this.createAtmosphere();
      this.createClouds();
      this.createEnhancedParticles();
      this.createGrid();

      await this.loadPM25Data();
      this.createPM25Markers();
      this.loadCountryLabels();

      this.setupEventListeners();
      this.setupToggleSwitches();

      console.log('Globe setup complete');
      this.animate();
    } catch (error) {
      console.error('Error initializing globe:', error);
    }
  }

  createLights() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sunLight.position.set(5, 3, 5);
    this.scene.add(this.sunLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0x6495ed, 0.3);
    fillLight.position.set(-5, -3, -5);
    this.scene.add(fillLight);
  }

  createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: true
    });

    const starsVertices = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
  }

  createEarth() {
    const geometry = new THREE.SphereGeometry(1, 128, 128); // Higher resolution

    // Create enhanced earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 4096; // Higher resolution
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Ocean blue with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a2e4a');
    gradient.addColorStop(0.5, '#1a4d6f');
    gradient.addColorStop(1, '#0a2e4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Land masses (more detailed continents)
    ctx.fillStyle = '#2d6b3f';
    this.drawDetailedContinents(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpScale: 0.03,
      specular: new THREE.Color(0x333333),
      shininess: 15,
      emissive: new THREE.Color(0x112233),
      emissiveIntensity: 0.1
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
    console.log('Earth created');
  }

  drawDetailedContinents(ctx, width, height) {
    // North America
    ctx.beginPath();
    ctx.ellipse(width * 0.22, height * 0.28, width * 0.09, height * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Alaska
    ctx.beginPath();
    ctx.ellipse(width * 0.12, height * 0.18, width * 0.03, height * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.ellipse(width * 0.28, height * 0.62, width * 0.045, height * 0.14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Europe
    ctx.beginPath();
    ctx.ellipse(width * 0.52, height * 0.25, width * 0.04, height * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Africa
    ctx.beginPath();
    ctx.ellipse(width * 0.52, height * 0.48, width * 0.055, height * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Asia
    ctx.beginPath();
    ctx.ellipse(width * 0.7, height * 0.32, width * 0.15, height * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    // India
    ctx.beginPath();
    ctx.ellipse(width * 0.65, height * 0.42, width * 0.025, height * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.ellipse(width * 0.8, height * 0.68, width * 0.05, height * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antarctica
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.92, width * 0.25, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Greenland
    ctx.beginPath();
    ctx.ellipse(width * 0.35, height * 0.15, width * 0.025, height * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  createAtmosphere() {
    const geometry = new THREE.SphereGeometry(1.1, 128, 128);
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
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

    this.atmosphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.atmosphere);
    console.log('Atmosphere created');
  }

  createClouds() {
    const geometry = new THREE.SphereGeometry(1.012, 128, 128);

    // Create realistic cloud texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // More realistic clouds with varying sizes and opacity
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 40 + 20;
      const opacity = 0.2 + Math.random() * 0.3;

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add smaller clouds for detail
      if (Math.random() > 0.5) {
        ctx.beginPath();
        ctx.arc(x + radius * 0.7, y, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });

    this.clouds = new THREE.Mesh(geometry, material);
    this.scene.add(this.clouds);
    console.log('Clouds created');
  }

  createEnhancedParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const colors = [];
    const lifetimes = [];

    for (let i = 0; i < this.particleCount; i++) {
      // Random position on sphere surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 1.02 + Math.random() * 0.03; // Varying heights

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);

      // Enhanced velocity with wind patterns
      // Create more realistic wind patterns based on latitude
      const latitudeFactor = Math.sin(phi - Math.PI / 2);
      const baseSpeed = 0.001 + Math.random() * 0.002;

      // Jet stream effect at mid-latitudes
      const jetStreamBoost = Math.abs(latitudeFactor) > 0.3 ? 1.5 : 1.0;

      // Prevailing westerlies in mid-latitudes
      const vx = Math.cos(theta + Math.PI / 2) * baseSpeed * jetStreamBoost;
      const vy = Math.sin(theta + Math.PI / 2) * baseSpeed * jetStreamBoost;
      const vz = (Math.random() - 0.5) * 0.0005;

      velocities.push(vx, vy, vz);

      // Color based on latitude (cooler air blue, warmer air cyan)
      const color = new THREE.Color();
      const hue = 0.5 + latitudeFactor * 0.1; // 0.5 = cyan, varies slightly
      color.setHSL(hue, 0.8, 0.6);
      colors.push(color.r, color.g, color.b);

      // Lifetime for particle recycling
      lifetimes.push(Math.random() * 1000);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.012,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.visible = this.particlesEnabled;
    this.scene.add(this.particles);
    console.log('Enhanced particles created');
  }

  updateParticles() {
    if (!this.particles || !this.particlesEnabled) return;

    const positions = this.particles.geometry.attributes.position.array;
    const velocities = this.particles.geometry.attributes.velocity.array;
    const lifetimes = this.particles.geometry.attributes.lifetime.array;

    for (let i = 0; i < this.particleCount * 3; i += 3) {
      const particleIndex = i / 3;

      // Update lifetime
      lifetimes[particleIndex] -= this.particleSpeed;

      // Update position
      positions[i] += velocities[i] * this.particleSpeed;
      positions[i + 1] += velocities[i + 1] * this.particleSpeed;
      positions[i + 2] += velocities[i + 2] * this.particleSpeed;

      // Calculate radius
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      const radius = Math.sqrt(x * x + y * y + z * z);

      // Reset particles that go too far or lifetime expired
      if (radius > 1.2 || radius < 0.95 || lifetimes[particleIndex] <= 0) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const newRadius = 1.02 + Math.random() * 0.03;

        positions[i] = newRadius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = newRadius * Math.cos(phi);

        // Reset lifetime
        lifetimes[particleIndex] = 800 + Math.random() * 400;

        // Recalculate velocity with enhanced wind patterns
        const latitudeFactor = Math.sin(phi - Math.PI / 2);
        const baseSpeed = 0.001 + Math.random() * 0.002;
        const jetStreamBoost = Math.abs(latitudeFactor) > 0.3 ? 1.5 : 1.0;

        velocities[i] = Math.cos(theta + Math.PI / 2) * baseSpeed * jetStreamBoost;
        velocities[i + 1] = Math.sin(theta + Math.PI / 2) * baseSpeed * jetStreamBoost;
        velocities[i + 2] = (Math.random() - 0.5) * 0.0005;
      }

      // Add turbulence and Coriolis effect
      const turbulence = Math.sin(this.time * 0.0003 + positions[i] * 3) * 0.00003;
      const coriolisEffect = Math.cos(Math.asin(z / radius)) * 0.00001; // Based on latitude

      velocities[i] += turbulence + coriolisEffect;
      velocities[i + 1] += turbulence * 0.7;
      velocities[i + 2] += turbulence * 0.3;

      // Limit velocity
      const vLength = Math.sqrt(
        velocities[i] ** 2 + velocities[i + 1] ** 2 + velocities[i + 2] ** 2
      );

      if (vLength > 0.003) {
        const scale = 0.003 / vLength;
        velocities[i] *= scale;
        velocities[i + 1] *= scale;
        velocities[i + 2] *= scale;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  createGrid() {
    const gridGroup = new THREE.Group();
    const latMaterial = new THREE.LineBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.4
    });

    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
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
      const line = new THREE.Line(geometry, latMaterial);
      gridGroup.add(line);
    }

    // Longitude lines
    for (let lon = 0; lon < 180; lon += 20) {
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
      const line = new THREE.Line(geometry, latMaterial);
      gridGroup.add(line);
    }

    this.grid = gridGroup;
    this.grid.visible = this.showGrid;
    this.scene.add(this.grid);
    console.log('Grid created');
  }

  createPM25Markers() {
    if (!this.pm25Data || this.pm25Data.size === 0) {
      console.warn('No PM2.5 data available');
      return;
    }

    const markerGroup = new THREE.Group();

    this.pm25Data.forEach((data, city) => {
      const { lat, lon, aqi } = data;

      // Convert lat/lon to 3D coordinates
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 1.05;

      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      // Create marker with pulsing effect
      const markerGeometry = new THREE.SphereGeometry(0.025, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: this.getAQIColor(aqi),
        transparent: true,
        opacity: 0.95
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      marker.userData = { city, data, initialScale: 1 };

      // Create enhanced glow ring
      const ringGeometry = new THREE.RingGeometry(0.03, 0.04, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: this.getAQIColor(aqi),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.lookAt(0, 0, 0);
      ring.position.set(x, y, z);
      ring.userData = { initialScale: 1 };

      markerGroup.add(marker);
      markerGroup.add(ring);
    });

    this.pm25Markers = markerGroup;
    this.pm25Markers.visible = this.showPM25;
    this.scene.add(this.pm25Markers);
    console.log('PM2.5 markers created');
  }

  async loadPM25Data() {
    // Extended PM2.5 data with more cities
    this.pm25Data = new Map([
      ['Seoul', { lat: 37.5665, lon: 126.9780, pm25: 45, aqi: 125 }],
      ['Beijing', { lat: 39.9042, lon: 116.4074, pm25: 85, aqi: 165 }],
      ['Tokyo', { lat: 35.6762, lon: 139.6503, pm25: 25, aqi: 75 }],
      ['Los Angeles', { lat: 34.0522, lon: -118.2437, pm25: 55, aqi: 145 }],
      ['New York', { lat: 40.7128, lon: -74.0060, pm25: 35, aqi: 95 }],
      ['London', { lat: 51.5074, lon: -0.1278, pm25: 30, aqi: 90 }],
      ['Paris', { lat: 48.8566, lon: 2.3522, pm25: 28, aqi: 85 }],
      ['Delhi', { lat: 28.6139, lon: 77.2090, pm25: 150, aqi: 250 }],
      ['Mumbai', { lat: 19.0760, lon: 72.8777, pm25: 95, aqi: 180 }],
      ['São Paulo', { lat: -23.5505, lon: -46.6333, pm25: 40, aqi: 110 }],
      ['Sydney', { lat: -33.8688, lon: 151.2093, pm25: 20, aqi: 60 }],
      ['Singapore', { lat: 1.3521, lon: 103.8198, pm25: 30, aqi: 88 }],
      ['Hong Kong', { lat: 22.3193, lon: 114.1694, pm25: 50, aqi: 135 }],
      ['Bangkok', { lat: 13.7563, lon: 100.5018, pm25: 75, aqi: 160 }],
      ['Moscow', { lat: 55.7558, lon: 37.6173, pm25: 35, aqi: 95 }],
      ['Cairo', { lat: 30.0444, lon: 31.2357, pm25: 110, aqi: 190 }],
      ['Mexico City', { lat: 19.4326, lon: -99.1332, pm25: 65, aqi: 155 }],
      ['Toronto', { lat: 43.6532, lon: -79.3832, pm25: 25, aqi: 78 }]
    ]);

    console.log('PM2.5 data loaded for', this.pm25Data.size, 'locations');
  }

  loadCountryLabels() {
    // Major country labels
    this.countryData = [
      { name: 'USA', lat: 37.09, lon: -95.71 },
      { name: 'CANADA', lat: 56.13, lon: -106.35 },
      { name: 'RUSSIA', lat: 61.52, lon: 105.32 },
      { name: 'CHINA', lat: 35.86, lon: 104.19 },
      { name: 'BRAZIL', lat: -14.24, lon: -51.93 },
      { name: 'AUSTRALIA', lat: -25.27, lon: 133.78 },
      { name: 'INDIA', lat: 20.59, lon: 78.96 },
      { name: 'ARGENTINA', lat: -38.42, lon: -63.62 },
      { name: 'KAZAKHSTAN', lat: 48.02, lon: 66.92 }
    ];

    console.log('Country labels loaded');
  }

  getAQIColor(aqi) {
    if (aqi <= 50) return new THREE.Color(0x00e400); // Green
    if (aqi <= 100) return new THREE.Color(0xffff00); // Yellow
    if (aqi <= 150) return new THREE.Color(0xff7e00); // Orange
    if (aqi <= 200) return new THREE.Color(0xff0000); // Red
    if (aqi <= 300) return new THREE.Color(0x8f3f97); // Purple
    return new THREE.Color(0x7e1946); // Maroon
  }

  getAQILevel(aqi) {
    if (aqi <= 50) return { level: 'Good', color: 'text-green-500' };
    if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-400' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-500' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-500' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'text-purple-500' };
    return { level: 'Hazardous', color: 'text-red-900' };
  }

  setupToggleSwitches() {
    // Custom toggle switch handler
    const setupToggle = (switchId, checkboxId, callback) => {
      const switchEl = document.getElementById(switchId);
      const checkbox = document.getElementById(checkboxId);

      if (switchEl && checkbox) {
        const toggle = () => {
          checkbox.checked = !checkbox.checked;
          if (checkbox.checked) {
            switchEl.classList.add('checked');
          } else {
            switchEl.classList.remove('checked');
          }
          callback(checkbox.checked);
        };

        switchEl.addEventListener('click', toggle);
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            switchEl.classList.add('checked');
          } else {
            switchEl.classList.remove('checked');
          }
          callback(checkbox.checked);
        });
      }
    };

    setupToggle('toggle-particles-switch', 'toggle-particles', (checked) => {
      this.particlesEnabled = checked;
      if (this.particles) {
        this.particles.visible = this.particlesEnabled;
      }
    });

    setupToggle('toggle-pm25-switch', 'toggle-pm25', (checked) => {
      this.showPM25 = checked;
      if (this.pm25Markers) {
        this.pm25Markers.visible = this.showPM25;
      }
    });

    setupToggle('toggle-grid-switch', 'toggle-grid', (checked) => {
      this.showGrid = checked;
      if (this.grid) {
        this.grid.visible = this.showGrid;
      }
    });

    setupToggle('toggle-daynight-switch', 'toggle-daynight', (checked) => {
      this.dayNightEnabled = checked;
    });
  }

  setupEventListeners() {
    // Window resize
    window.addEventListener('resize', () => this.onResize());

    // Zoom controls
    const zoomIn = document.getElementById('zoom-in');
    if (zoomIn) {
      zoomIn.addEventListener('click', () => {
        this.camera.position.multiplyScalar(0.85);
        this.camera.position.clampLength(this.controls.minDistance, this.controls.maxDistance);
      });
    }

    const zoomOut = document.getElementById('zoom-out');
    if (zoomOut) {
      zoomOut.addEventListener('click', () => {
        this.camera.position.multiplyScalar(1.15);
        this.camera.position.clampLength(this.controls.minDistance, this.controls.maxDistance);
      });
    }

    const resetView = document.getElementById('reset-view');
    if (resetView) {
      resetView.addEventListener('click', () => {
        this.camera.position.set(0, 0, 2.5);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      });
    }

    // Click on globe
    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => this.onClick(e));
    }

    console.log('Event listeners setup complete');
  }

  onClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    if (!this.earth) return;

    const intersects = raycaster.intersectObject(this.earth);

    if (intersects.length > 0) {
      const stationInfo = document.getElementById('station-info');
      if (stationInfo) {
        stationInfo.style.display = 'block';

        // Sample data - in production, this would be based on the clicked location
        document.getElementById('station-name').textContent = 'Seoul Station';
        document.getElementById('station-location').textContent = 'South Korea';
        document.getElementById('station-aqi').textContent = '125';
        document.getElementById('station-pm25').textContent = '45 µg/m³';
        document.getElementById('station-pm10').textContent = '75 µg/m³';
        document.getElementById('station-o3').textContent = '34 ppb';
        document.getElementById('station-time').textContent = 'Last updated: 5 minutes ago';

        const aqiInfo = this.getAQILevel(125);
        const levelElement = document.getElementById('station-level');
        levelElement.textContent = aqiInfo.level;
        levelElement.className = `text-sm font-medium font-display ${aqiInfo.color}`;

        const aqiElement = document.getElementById('station-aqi');
        aqiElement.className = `text-3xl font-bold font-display ${aqiInfo.color}`;
      }
    }
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

    // Update controls
    this.controls.update();

    // Rotate earth slowly
    if (this.earth) {
      this.earth.rotation.y += 0.0002;
    }

    // Rotate clouds slightly faster
    if (this.clouds) {
      this.clouds.rotation.y += 0.0003;
    }

    // Subtle star rotation
    if (this.stars) {
      this.stars.rotation.y += 0.00001;
    }

    // Day/Night cycle - rotate sun light
    if (this.dayNightEnabled && this.sunLight) {
      const angle = this.time * 0.00008;
      this.sunLight.position.x = Math.cos(angle) * 5;
      this.sunLight.position.z = Math.sin(angle) * 5;
    }

    // Update particles with enhanced movement
    this.updateParticles();

    // Animate PM2.5 markers with pulse effect
    if (this.pm25Markers && this.showPM25) {
      this.pm25Markers.children.forEach((child) => {
        if (child.userData.initialScale) {
          const pulse = Math.sin(this.time * 0.003) * 0.1 + 1;
          child.scale.setScalar(pulse);
        }
      });
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AirLensGlobeAdvanced();
  });
} else {
  new AirLensGlobeAdvanced();
}
