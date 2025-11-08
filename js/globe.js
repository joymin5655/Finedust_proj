/**
 * AirLens Newsroom Globe - Interactive 3D Earth Visualization
 * Global air quality policies and news on an interactive globe
 * With realistic Earth textures and country selection
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class NewsroomGlobe {
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
    this.dayNightEnabled = true;
    this.particleSpeed = 1.0;
    this.particlesEnabled = false;
    this.particleCount = 6000;

    // Data
    this.countryPolicies = this.loadCountryPolicies();
    this.pm25Data = new Map();

    // Animation
    this.clock = new THREE.Clock();
    this.time = 0;

    console.log('Newsroom Globe initialized');
    this.init();
  }

  async init() {
    try {
      this.createLights();
      this.createStars();
      await this.createRealisticEarth();
      this.createAtmosphere();
      this.createClouds();
      this.createParticles();
      this.createCountryBorders();

      await this.loadPM25Data();
      this.createPM25Markers();

      this.setupEventListeners();
      this.setupToggleSwitches();

      console.log('Newsroom Globe setup complete');
      this.animate();
    } catch (error) {
      console.error('Error initializing globe:', error);
    }
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

    // Create high-quality Earth texture
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

    // Add ocean noise for realism
    this.addOceanNoise(ctx, canvas.width, canvas.height);

    // Draw realistic continents
    ctx.fillStyle = '#2d5a3d';
    this.drawRealisticContinents(ctx, canvas.width, canvas.height);

    // Add land details and mountains
    this.addLandDetails(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

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
    console.log('Realistic Earth created');
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
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const colors = [];

    for (let i = 0; i < this.particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 1.02 + Math.random() * 0.02;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);

      const latitudeFactor = Math.sin(phi - Math.PI / 2);
      const baseSpeed = 0.001 + Math.random() * 0.001;
      const jetStream = Math.abs(latitudeFactor) > 0.3 ? 1.4 : 1.0;

      const vx = Math.cos(theta + Math.PI / 2) * baseSpeed * jetStream;
      const vy = Math.sin(theta + Math.PI / 2) * baseSpeed * jetStream;
      const vz = (Math.random() - 0.5) * 0.0003;

      velocities.push(vx, vy, vz);

      const color = new THREE.Color();
      color.setHSL(0.52 + latitudeFactor * 0.08, 0.75, 0.6);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.particles.visible = this.particlesEnabled;
    this.scene.add(this.particles);
  }

  updateParticles() {
    if (!this.particles || !this.particlesEnabled) return;

    const positions = this.particles.geometry.attributes.position.array;
    const velocities = this.particles.geometry.attributes.velocity.array;

    for (let i = 0; i < this.particleCount * 3; i += 3) {
      positions[i] += velocities[i] * this.particleSpeed;
      positions[i + 1] += velocities[i + 1] * this.particleSpeed;
      positions[i + 2] += velocities[i + 2] * this.particleSpeed;

      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      const radius = Math.sqrt(x * x + y * y + z * z);

      if (radius > 1.15 || radius < 0.97) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const newRadius = 1.02 + Math.random() * 0.02;

        positions[i] = newRadius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = newRadius * Math.cos(phi);
      }

      const turbulence = Math.sin(this.time * 0.0002 + x * 2) * 0.00002;
      velocities[i] += turbulence;
      velocities[i + 1] += turbulence * 0.6;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
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

  async loadPM25Data() {
    this.pm25Data = new Map([
      ['Seoul', { lat: 37.5665, lon: 126.9780, pm25: 45, aqi: 125, country: 'South Korea' }],
      ['Beijing', { lat: 39.9042, lon: 116.4074, pm25: 85, aqi: 165, country: 'China' }],
      ['Tokyo', { lat: 35.6762, lon: 139.6503, pm25: 25, aqi: 75, country: 'Japan' }],
      ['Delhi', { lat: 28.6139, lon: 77.2090, pm25: 150, aqi: 250, country: 'India' }],
      ['Los Angeles', { lat: 34.0522, lon: -118.2437, pm25: 55, aqi: 145, country: 'United States' }],
      ['London', { lat: 51.5074, lon: -0.1278, pm25: 30, aqi: 90, country: 'United Kingdom' }],
      ['Paris', { lat: 48.8566, lon: 2.3522, pm25: 28, aqi: 85, country: 'France' }],
      ['Mumbai', { lat: 19.0760, lon: 72.8777, pm25: 95, aqi: 180, country: 'India' }],
      ['São Paulo', { lat: -23.5505, lon: -46.6333, pm25: 40, aqi: 110, country: 'Brazil' }],
      ['Sydney', { lat: -33.8688, lon: 151.2093, pm25: 20, aqi: 60, country: 'Australia' }],
      ['Singapore', { lat: 1.3521, lon: 103.8198, pm25: 30, aqi: 88, country: 'Singapore' }],
      ['Moscow', { lat: 55.7558, lon: 37.6173, pm25: 35, aqi: 95, country: 'Russia' }]
    ]);
  }

  createPM25Markers() {
    if (!this.pm25Data || this.pm25Data.size === 0) return;

    const markerGroup = new THREE.Group();

    this.pm25Data.forEach((data, city) => {
      const { lat, lon, aqi } = data;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 1.05;

      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: this.getAQIColor(aqi),
        transparent: true,
        opacity: 0.9
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      marker.userData = { city, data };

      const ringGeometry = new THREE.RingGeometry(0.025, 0.032, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: this.getAQIColor(aqi),
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });

      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.lookAt(0, 0, 0);
      ring.position.set(x, y, z);

      markerGroup.add(marker);
      markerGroup.add(ring);
    });

    this.pm25Markers = markerGroup;
    this.pm25Markers.visible = this.showPM25;
    this.scene.add(this.pm25Markers);
  }

  getAQIColor(aqi) {
    if (aqi <= 50) return new THREE.Color(0x00e400);
    if (aqi <= 100) return new THREE.Color(0xffff00);
    if (aqi <= 150) return new THREE.Color(0xff7e00);
    if (aqi <= 200) return new THREE.Color(0xff0000);
    if (aqi <= 300) return new THREE.Color(0x8f3f97);
    return new THREE.Color(0x7e1946);
  }

  loadCountryPolicies() {
    return {
      'South Korea': {
        flag: '🇰🇷',
        region: 'East Asia',
        mainPolicy: {
          name: 'Fine Dust Special Act',
          description: 'Comprehensive legislation to reduce PM2.5 emissions through vehicle restrictions, industrial controls, and public health measures.',
          implementationDate: '2019-02-15',
          effectivenessRating: 8
        },
        news: [
          { title: 'Seoul implements emergency fine dust reduction measures', date: '2025-01-05', source: 'Yonhap News' },
          { title: 'New air purifier subsidy program launched', date: '2024-12-20', source: 'Korea Herald' },
          { title: 'Vehicle restrictions expanded in metropolitan areas', date: '2024-12-10', source: 'KBS News' }
        ],
        currentAQI: 125,
        currentPM25: 45
      },
      'China': {
        flag: '🇨🇳',
        region: 'East Asia',
        mainPolicy: {
          name: 'Blue Sky Protection Campaign',
          description: 'National initiative targeting industrial emissions, coal use reduction, and vehicle standards to improve air quality in major cities.',
          implementationDate: '2018-06-01',
          effectivenessRating: 7
        },
        news: [
          { title: 'Beijing achieves lowest PM2.5 levels in decade', date: '2025-01-10', source: 'Xinhua' },
          { title: 'Coal power plant shutdowns continue nationwide', date: '2024-12-28', source: 'China Daily' },
          { title: 'Red alert issued for heavy pollution in northern regions', date: '2024-12-15', source: 'CGTN' }
        ],
        currentAQI: 165,
        currentPM25: 85
      },
      'India': {
        flag: '🇮🇳',
        region: 'South Asia',
        mainPolicy: {
          name: 'National Clean Air Programme (NCAP)',
          description: 'Comprehensive strategy to reduce PM2.5 and PM10 concentrations by 20-30% by 2024 across 122 non-attainment cities.',
          implementationDate: '2019-01-10',
          effectivenessRating: 6
        },
        news: [
          { title: 'Delhi implements odd-even vehicle scheme', date: '2025-01-08', source: 'Times of India' },
          { title: 'Supreme Court mandates stubble burning penalties', date: '2024-12-22', source: 'Indian Express' },
          { title: 'Air quality monitoring network expanded', date: '2024-12-05', source: 'Hindustan Times' }
        ],
        currentAQI: 250,
        currentPM25: 150
      },
      'United States': {
        flag: '🇺🇸',
        region: 'North America',
        mainPolicy: {
          name: 'Clean Air Act Amendments',
          description: 'Federal regulations setting National Ambient Air Quality Standards (NAAQS) for PM2.5 and other pollutants.',
          implementationDate: '1990-11-15',
          effectivenessRating: 9
        },
        news: [
          { title: 'EPA strengthens PM2.5 standards', date: '2025-01-12', source: 'Reuters' },
          { title: 'California leads in zero-emission vehicle adoption', date: '2024-12-18', source: 'LA Times' },
          { title: 'Wildfire smoke prompts air quality alerts', date: '2024-11-30', source: 'AP News' }
        ],
        currentAQI: 145,
        currentPM25: 55
      },
      'United Kingdom': {
        flag: '🇬🇧',
        region: 'Europe',
        mainPolicy: {
          name: 'Clean Air Strategy 2019',
          description: 'Comprehensive plan to reduce air pollution from transport, farming, and industry with legally binding targets.',
          implementationDate: '2019-01-14',
          effectivenessRating: 8
        },
        news: [
          { title: 'London Ultra Low Emission Zone expanded', date: '2025-01-03', source: 'BBC News' },
          { title: 'Government announces wood burning restrictions', date: '2024-12-15', source: 'The Guardian' },
          { title: 'Air quality improving in major UK cities', date: '2024-11-28', source: 'Independent' }
        ],
        currentAQI: 90,
        currentPM25: 30
      },
      'Japan': {
        flag: '🇯🇵',
        region: 'East Asia',
        mainPolicy: {
          name: 'Air Pollution Control Act',
          description: 'Strict emission standards for vehicles and industries, focusing on PM2.5 reduction and transboundary pollution.',
          implementationDate: '1968-06-10',
          effectivenessRating: 9
        },
        news: [
          { title: 'Tokyo maintains world-class air quality standards', date: '2025-01-07', source: 'Japan Times' },
          { title: 'New diesel vehicle restrictions announced', date: '2024-12-20', source: 'NHK' },
          { title: 'Cross-border pollution monitoring enhanced', date: '2024-12-01', source: 'Asahi Shimbun' }
        ],
        currentAQI: 75,
        currentPM25: 25
      }
    };
  }

  showCountryPolicy(countryName) {
    const policy = this.countryPolicies[countryName];
    if (!policy) {
      console.log('No policy data for', countryName);
      return;
    }

    const card = document.getElementById('policy-card');
    card.style.display = 'block';

    document.getElementById('policy-flag').textContent = policy.flag;
    document.getElementById('policy-country').textContent = countryName;
    document.getElementById('policy-region').textContent = policy.region;
    document.getElementById('policy-name').textContent = policy.mainPolicy.name;
    document.getElementById('policy-desc').textContent = policy.mainPolicy.description;
    document.getElementById('policy-date').textContent = `Implemented: ${policy.mainPolicy.implementationDate}`;

    const aqiElement = document.getElementById('policy-aqi');
    aqiElement.textContent = policy.currentAQI;
    aqiElement.className = `text-2xl font-bold font-display ${this.getAQIClass(policy.currentAQI)}`;

    document.getElementById('policy-pm25').textContent = `${policy.currentPM25} µg/m³`;

    const newsContainer = document.getElementById('policy-news');
    newsContainer.innerHTML = '';
    policy.news.forEach(news => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item bg-black/20 rounded-lg p-3 cursor-pointer';
      newsItem.innerHTML = `
        <h6 class="text-sm font-medium text-white mb-1">${news.title}</h6>
        <div class="flex items-center justify-between text-xs text-white/60">
          <span>${news.source}</span>
          <span>${news.date}</span>
        </div>
      `;
      newsContainer.appendChild(newsItem);
    });
  }

  getAQIClass(aqi) {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-500';
    return 'text-red-900';
  }

  setupToggleSwitches() {
    const setupToggle = (switchId, checkboxId, callback) => {
      const switchEl = document.getElementById(switchId);
      const checkbox = document.getElementById(checkboxId);

      if (switchEl && checkbox) {
        const toggle = () => {
          checkbox.checked = !checkbox.checked;
          switchEl.classList.toggle('checked', checkbox.checked);
          callback(checkbox.checked);
        };

        switchEl.addEventListener('click', toggle);
      }
    };

    setupToggle('toggle-borders-switch', 'toggle-borders', (checked) => {
      this.showBorders = checked;
      if (this.countryBorders) this.countryBorders.visible = checked;
    });

    setupToggle('toggle-pm25-switch', 'toggle-pm25', (checked) => {
      this.showPM25 = checked;
      if (this.pm25Markers) this.pm25Markers.visible = checked;
    });

    setupToggle('toggle-particles-switch', 'toggle-particles', (checked) => {
      this.particlesEnabled = checked;
      if (this.particles) this.particles.visible = checked;
    });

    setupToggle('toggle-daynight-switch', 'toggle-daynight', (checked) => {
      this.dayNightEnabled = checked;
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

    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  onClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check PM2.5 markers first
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
        // Show a general message or closest country
        console.log('Clicked on Earth - implement country detection here');
      }
    }
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (this.pm25Markers && this.showPM25) {
      const intersects = this.raycaster.intersectObjects(this.pm25Markers.children, true);

      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
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

    this.controls.update();

    if (this.earth) this.earth.rotation.y += 0.0001;
    if (this.clouds) this.clouds.rotation.y += 0.00015;
    if (this.stars) this.stars.rotation.y += 0.00001;

    if (this.dayNightEnabled && this.sunLight) {
      const angle = this.time * 0.00005;
      this.sunLight.position.x = Math.cos(angle) * 5;
      this.sunLight.position.z = Math.sin(angle) * 5;
    }

    this.updateParticles();

    if (this.pm25Markers && this.showPM25) {
      this.pm25Markers.children.forEach((child, index) => {
        if (index % 2 === 0) {
          const pulse = Math.sin(this.time * 0.002 + index) * 0.15 + 1;
          child.scale.setScalar(pulse);
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NewsroomGlobe();
  });
} else {
  new NewsroomGlobe();
}
