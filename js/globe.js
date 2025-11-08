/**
 * AirLens Policy Globe - Interactive 3D Earth Visualization
 * Explore global air quality policies and regulations on an interactive globe
 * With realistic Earth textures and comprehensive country policy data
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
    this.particleSpeed = 1.0;
    this.particlesEnabled = false;
    this.particleCount = 6000;

    // Data
    this.countryPolicies = this.loadCountryPolicies();
    this.pm25Data = new Map();

    // Air Quality API for real-time data
    this.airQualityAPI = typeof AirQualityAPI !== 'undefined' ? new AirQualityAPI() : null;

    // Animation
    this.clock = new THREE.Clock();
    this.time = 0;

    console.log('Policy Globe initialized');
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

      // Load policy impact data from JSON files
      this.policyImpactData = await this.loadPolicyImpactData();
      this.mergePolicyData();

      // Load real-time air quality data
      if (this.airQualityAPI) {
        this.loadRealTimeAirQuality();
      }

      this.setupEventListeners();
      this.setupToggleSwitches();

      console.log('Policy Globe setup complete');
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

  async loadPM25Data() {
    this.pm25Data = new Map([
      // East Asia
      ['Seoul', { lat: 37.5665, lon: 126.9780, pm25: 45, aqi: 125, country: 'South Korea' }],
      ['Busan', { lat: 35.1796, lon: 129.0756, pm25: 38, aqi: 108, country: 'South Korea' }],
      ['Beijing', { lat: 39.9042, lon: 116.4074, pm25: 85, aqi: 165, country: 'China' }],
      ['Shanghai', { lat: 31.2304, lon: 121.4737, pm25: 72, aqi: 155, country: 'China' }],
      ['Guangzhou', { lat: 23.1291, lon: 113.2644, pm25: 68, aqi: 148, country: 'China' }],
      ['Shenzhen', { lat: 22.5431, lon: 114.0579, pm25: 65, aqi: 145, country: 'China' }],
      ['Hong Kong', { lat: 22.3193, lon: 114.1694, pm25: 42, aqi: 118, country: 'China' }],
      ['Tokyo', { lat: 35.6762, lon: 139.6503, pm25: 25, aqi: 75, country: 'Japan' }],
      ['Osaka', { lat: 34.6937, lon: 135.5023, pm25: 28, aqi: 82, country: 'Japan' }],

      // South Asia
      ['Delhi', { lat: 28.6139, lon: 77.2090, pm25: 150, aqi: 250, country: 'India' }],
      ['Mumbai', { lat: 19.0760, lon: 72.8777, pm25: 95, aqi: 180, country: 'India' }],
      ['Kolkata', { lat: 22.5726, lon: 88.3639, pm25: 118, aqi: 205, country: 'India' }],
      ['Chennai', { lat: 13.0827, lon: 80.2707, pm25: 82, aqi: 162, country: 'India' }],
      ['Bangalore', { lat: 12.9716, lon: 77.5946, pm25: 88, aqi: 168, country: 'India' }],
      ['Dhaka', { lat: 23.8103, lon: 90.4125, pm25: 165, aqi: 280, country: 'Bangladesh' }],
      ['Lahore', { lat: 31.5204, lon: 74.3587, pm25: 142, aqi: 235, country: 'Pakistan' }],
      ['Karachi', { lat: 24.8607, lon: 67.0011, pm25: 128, aqi: 218, country: 'Pakistan' }],

      // Southeast Asia
      ['Bangkok', { lat: 13.7563, lon: 100.5018, pm25: 52, aqi: 142, country: 'Thailand' }],
      ['Hanoi', { lat: 21.0285, lon: 105.8542, pm25: 51, aqi: 138, country: 'Vietnam' }],
      ['Ho Chi Minh City', { lat: 10.8231, lon: 106.6297, pm25: 48, aqi: 132, country: 'Vietnam' }],
      ['Jakarta', { lat: -6.2088, lon: 106.8456, pm25: 62, aqi: 152, country: 'Indonesia' }],
      ['Singapore', { lat: 1.3521, lon: 103.8198, pm25: 18, aqi: 58, country: 'Singapore' }],
      ['Kuala Lumpur', { lat: 3.1390, lon: 101.6869, pm25: 35, aqi: 98, country: 'Malaysia' }],
      ['Manila', { lat: 14.5995, lon: 120.9842, pm25: 40, aqi: 112, country: 'Philippines' }],

      // North America
      ['Los Angeles', { lat: 34.0522, lon: -118.2437, pm25: 55, aqi: 145, country: 'United States' }],
      ['New York', { lat: 40.7128, lon: -74.0060, pm25: 32, aqi: 92, country: 'United States' }],
      ['Chicago', { lat: 41.8781, lon: -87.6298, pm25: 38, aqi: 105, country: 'United States' }],
      ['Houston', { lat: 29.7604, lon: -95.3698, pm25: 42, aqi: 118, country: 'United States' }],
      ['Phoenix', { lat: 33.4484, lon: -112.0740, pm25: 48, aqi: 132, country: 'United States' }],
      ['Toronto', { lat: 43.6532, lon: -79.3832, pm25: 22, aqi: 65, country: 'Canada' }],
      ['Vancouver', { lat: 49.2827, lon: -123.1207, pm25: 18, aqi: 58, country: 'Canada' }],
      ['Mexico City', { lat: 19.4326, lon: -99.1332, pm25: 50, aqi: 135, country: 'Mexico' }],

      // South America
      ['São Paulo', { lat: -23.5505, lon: -46.6333, pm25: 32, aqi: 95, country: 'Brazil' }],
      ['Rio de Janeiro', { lat: -22.9068, lon: -43.1729, pm25: 28, aqi: 85, country: 'Brazil' }],
      ['Buenos Aires', { lat: -34.6037, lon: -58.3816, pm25: 26, aqi: 78, country: 'Argentina' }],
      ['Santiago', { lat: -33.4489, lon: -70.6693, pm25: 39, aqi: 108, country: 'Chile' }],

      // Europe
      ['London', { lat: 51.5074, lon: -0.1278, pm25: 30, aqi: 90, country: 'United Kingdom' }],
      ['Manchester', { lat: 53.4808, lon: -2.2426, pm25: 28, aqi: 82, country: 'United Kingdom' }],
      ['Paris', { lat: 48.8566, lon: 2.3522, pm25: 28, aqi: 82, country: 'France' }],
      ['Berlin', { lat: 52.5200, lon: 13.4050, pm25: 24, aqi: 70, country: 'Germany' }],
      ['Munich', { lat: 48.1351, lon: 11.5820, pm25: 26, aqi: 75, country: 'Germany' }],
      ['Rome', { lat: 41.9028, lon: 12.4964, pm25: 38, aqi: 105, country: 'Italy' }],
      ['Milan', { lat: 45.4642, lon: 9.1900, pm25: 42, aqi: 118, country: 'Italy' }],
      ['Madrid', { lat: 40.4168, lon: -3.7038, pm25: 29, aqi: 88, country: 'Spain' }],
      ['Barcelona', { lat: 41.3851, lon: 2.1734, pm25: 32, aqi: 92, country: 'Spain' }],
      ['Warsaw', { lat: 52.2297, lon: 21.0122, pm25: 58, aqi: 148, country: 'Poland' }],
      ['Krakow', { lat: 50.0647, lon: 19.9450, pm25: 68, aqi: 155, country: 'Poland' }],
      ['Istanbul', { lat: 41.0082, lon: 28.9784, pm25: 42, aqi: 118, country: 'Turkey' }],
      ['Moscow', { lat: 55.7558, lon: 37.6173, pm25: 48, aqi: 130, country: 'Russia' }],

      // Oceania
      ['Sydney', { lat: -33.8688, lon: 151.2093, pm25: 20, aqi: 62, country: 'Australia' }],
      ['Melbourne', { lat: -37.8136, lon: 144.9631, pm25: 22, aqi: 68, country: 'Australia' }],
      ['Auckland', { lat: -36.8485, lon: 174.7633, pm25: 15, aqi: 48, country: 'New Zealand' }],

      // Africa
      ['Cairo', { lat: 30.0444, lon: 31.2357, pm25: 78, aqi: 168, country: 'Egypt' }],
      ['Lagos', { lat: 6.5244, lon: 3.3792, pm25: 82, aqi: 172, country: 'Nigeria' }],
      ['Johannesburg', { lat: -26.2041, lon: 28.0473, pm25: 41, aqi: 115, country: 'South Africa' }],
      ['Cape Town', { lat: -33.9249, lon: 18.4241, pm25: 28, aqi: 82, country: 'South Africa' }],

      // Middle East
      ['Riyadh', { lat: 24.7136, lon: 46.6753, pm25: 46, aqi: 128, country: 'Saudi Arabia' }],
      ['Dubai', { lat: 25.2048, lon: 55.2708, pm25: 36, aqi: 102, country: 'UAE' }],
      ['Abu Dhabi', { lat: 24.4539, lon: 54.3773, pm25: 38, aqi: 105, country: 'UAE' }],
      ['Tehran', { lat: 35.6892, lon: 51.3890, pm25: 95, aqi: 195, country: 'Iran' }]
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
        policyType: 'Comprehensive',
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
        policyType: 'Comprehensive',
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
      'Japan': {
        flag: '🇯🇵',
        region: 'East Asia',
        policyType: 'Industrial Controls',
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
      },
      'India': {
        flag: '🇮🇳',
        region: 'South Asia',
        policyType: 'Comprehensive',
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
      'Bangladesh': {
        flag: '🇧🇩',
        region: 'South Asia',
        policyType: 'Industrial Controls',
        mainPolicy: {
          name: 'Clean Air and Sustainable Environment',
          description: 'National policy focusing on brick kiln emissions, vehicle standards, and industrial pollution control in Dhaka.',
          implementationDate: '2020-03-15',
          effectivenessRating: 5
        },
        news: [
          { title: 'Dhaka battles severe air pollution crisis', date: '2025-01-11', source: 'Dhaka Tribune' },
          { title: 'Brick kiln modernization program launched', date: '2024-12-25', source: 'Daily Star' },
          { title: 'Air quality monitoring stations expanded', date: '2024-12-08', source: 'Bangladesh Post' }
        ],
        currentAQI: 280,
        currentPM25: 165
      },
      'United States': {
        flag: '🇺🇸',
        region: 'North America',
        policyType: 'Monitoring & Standards',
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
      'Canada': {
        flag: '🇨🇦',
        region: 'North America',
        policyType: 'Monitoring & Standards',
        mainPolicy: {
          name: 'Canadian Ambient Air Quality Standards',
          description: 'Federal and provincial standards for PM2.5 and other air pollutants with regular monitoring and reporting.',
          implementationDate: '2013-05-17',
          effectivenessRating: 8
        },
        news: [
          { title: 'Wildfire smoke affects air quality across provinces', date: '2025-01-09', source: 'CBC News' },
          { title: 'New emissions standards for oil sands sector', date: '2024-12-22', source: 'Globe and Mail' },
          { title: 'Clean fuel regulations come into effect', date: '2024-12-01', source: 'National Post' }
        ],
        currentAQI: 65,
        currentPM25: 22
      },
      'Mexico': {
        flag: '🇲🇽',
        region: 'North America',
        policyType: 'Vehicle Restrictions',
        mainPolicy: {
          name: 'Hoy No Circula Program',
          description: 'Vehicle restriction program in Mexico City limiting car use based on license plate numbers to reduce emissions.',
          implementationDate: '1989-11-20',
          effectivenessRating: 6
        },
        news: [
          { title: 'Mexico City air quality shows improvement', date: '2025-01-06', source: 'El Universal' },
          { title: 'New public transport expansion planned', date: '2024-12-19', source: 'Reforma' },
          { title: 'Industrial emissions regulations tightened', date: '2024-12-03', source: 'Milenio' }
        ],
        currentAQI: 135,
        currentPM25: 50
      },
      'Brazil': {
        flag: '🇧🇷',
        region: 'South America',
        policyType: 'Industrial Controls',
        mainPolicy: {
          name: 'National Air Quality Program',
          description: 'Federal program establishing air quality standards and monitoring requirements for major urban areas.',
          implementationDate: '2018-09-10',
          effectivenessRating: 7
        },
        news: [
          { title: 'São Paulo implements new emission zones', date: '2025-01-04', source: 'Folha de S.Paulo' },
          { title: 'Amazon deforestation affects regional air quality', date: '2024-12-20', source: 'O Globo' },
          { title: 'Biofuel adoption increases in transport sector', date: '2024-12-07', source: 'Estado' }
        ],
        currentAQI: 95,
        currentPM25: 32
      },
      'United Kingdom': {
        flag: '🇬🇧',
        region: 'Europe',
        policyType: 'Comprehensive',
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
      'Germany': {
        flag: '🇩🇪',
        region: 'Europe',
        policyType: 'Vehicle Restrictions',
        mainPolicy: {
          name: 'Diesel Driving Bans',
          description: 'City-specific bans on older diesel vehicles in environmental zones to reduce nitrogen dioxide and particulate matter.',
          implementationDate: '2018-02-27',
          effectivenessRating: 8
        },
        news: [
          { title: 'Berlin expands environmental zones', date: '2025-01-10', source: 'Deutsche Welle' },
          { title: 'Coal phase-out accelerates air quality improvements', date: '2024-12-18', source: 'Spiegel' },
          { title: 'Electric vehicle incentives extended', date: '2024-12-05', source: 'FAZ' }
        ],
        currentAQI: 70,
        currentPM25: 24
      },
      'France': {
        flag: '🇫🇷',
        region: 'Europe',
        policyType: 'Vehicle Restrictions',
        mainPolicy: {
          name: 'Crit\'Air Vignette System',
          description: 'Vehicle classification system restricting high-emission vehicles in low-emission zones across major cities.',
          implementationDate: '2016-07-01',
          effectivenessRating: 7
        },
        news: [
          { title: 'Paris strengthens low-emission zone rules', date: '2025-01-08', source: 'Le Monde' },
          { title: 'Air quality improvement in major cities', date: '2024-12-21', source: 'Le Figaro' },
          { title: 'Free public transport on high-pollution days', date: '2024-12-09', source: 'France 24' }
        ],
        currentAQI: 82,
        currentPM25: 28
      },
      'Italy': {
        flag: '🇮🇹',
        region: 'Europe',
        policyType: 'Vehicle Restrictions',
        mainPolicy: {
          name: 'Traffic Limitation Zones',
          description: 'ZTL (Zone a Traffico Limitato) system restricting vehicle access in historic city centers to reduce pollution.',
          implementationDate: '2000-01-15',
          effectivenessRating: 6
        },
        news: [
          { title: 'Milan implements stricter vehicle bans', date: '2025-01-07', source: 'Corriere della Sera' },
          { title: 'Po Valley faces persistent smog issues', date: '2024-12-23', source: 'La Repubblica' },
          { title: 'Rome expands pedestrian zones', date: '2024-12-11', source: 'ANSA' }
        ],
        currentAQI: 105,
        currentPM25: 38
      },
      'Spain': {
        flag: '🇪🇸',
        region: 'Europe',
        policyType: 'Vehicle Restrictions',
        mainPolicy: {
          name: 'Madrid Central Low Emission Zone',
          description: 'Restricted access zone in Madrid city center limiting entry to low-emission vehicles.',
          implementationDate: '2018-11-30',
          effectivenessRating: 7
        },
        news: [
          { title: 'Barcelona extends low-emission zones', date: '2025-01-05', source: 'El País' },
          { title: 'Air quality standards improved nationwide', date: '2024-12-17', source: 'ABC' },
          { title: 'Electric bus fleet expansion announced', date: '2024-12-02', source: 'El Mundo' }
        ],
        currentAQI: 88,
        currentPM25: 29
      },
      'Poland': {
        flag: '🇵🇱',
        region: 'Europe',
        policyType: 'Energy Transition',
        mainPolicy: {
          name: 'Anti-Smog Resolution',
          description: 'Regional regulations banning coal and wood burning in residential heating to combat severe winter pollution.',
          implementationDate: '2017-09-11',
          effectivenessRating: 5
        },
        news: [
          { title: 'Krakow continues fight against smog', date: '2025-01-09', source: 'Gazeta Wyborcza' },
          { title: 'Coal heating ban enforcement strengthened', date: '2024-12-24', source: 'Rzeczpospolita' },
          { title: 'Government subsidizes clean heating systems', date: '2024-12-06', source: 'TVN24' }
        ],
        currentAQI: 155,
        currentPM25: 68
      },
      'Turkey': {
        flag: '🇹🇷',
        region: 'Europe',
        policyType: 'Industrial Controls',
        mainPolicy: {
          name: 'Air Quality Management Regulation',
          description: 'National regulation setting emission limits for industries and vehicles, with monitoring in major cities.',
          implementationDate: '2008-06-06',
          effectivenessRating: 6
        },
        news: [
          { title: 'Istanbul air quality monitoring expanded', date: '2025-01-06', source: 'Hürriyet' },
          { title: 'Coal power plant emissions under scrutiny', date: '2024-12-19', source: 'Milliyet' },
          { title: 'Natural gas conversion program continues', date: '2024-12-04', source: 'Sabah' }
        ],
        currentAQI: 118,
        currentPM25: 42
      },
      'Russia': {
        flag: '🇷🇺',
        region: 'Europe',
        policyType: 'Industrial Controls',
        mainPolicy: {
          name: 'Clean Air Federal Project',
          description: 'National program targeting industrial emissions in 12 most polluted cities with mandatory emission reductions.',
          implementationDate: '2019-01-01',
          effectivenessRating: 6
        },
        news: [
          { title: 'Moscow air quality shows improvement', date: '2025-01-08', source: 'TASS' },
          { title: 'Industrial emission limits tightened', date: '2024-12-21', source: 'RIA Novosti' },
          { title: 'Siberian cities face winter pollution', date: '2024-12-10', source: 'Interfax' }
        ],
        currentAQI: 130,
        currentPM25: 48
      },
      'Thailand': {
        flag: '🇹🇭',
        region: 'Southeast Asia',
        policyType: 'Comprehensive',
        mainPolicy: {
          name: 'Clean Air Action Plan',
          description: 'Comprehensive plan addressing crop burning, vehicle emissions, and industrial pollution in Bangkok and northern regions.',
          implementationDate: '2019-02-01',
          effectivenessRating: 6
        },
        news: [
          { title: 'Bangkok implements emergency pollution measures', date: '2025-01-11', source: 'Bangkok Post' },
          { title: 'Northern Thailand battles seasonal smog', date: '2024-12-26', source: 'The Nation' },
          { title: 'Crop burning restrictions enforced', date: '2024-12-12', source: 'Thai PBS' }
        ],
        currentAQI: 142,
        currentPM25: 52
      },
      'Vietnam': {
        flag: '🇻🇳',
        region: 'Southeast Asia',
        policyType: 'Industrial Controls',
        mainPolicy: {
          name: 'National Air Quality Action Plan',
          description: 'Action plan targeting industrial emissions, transport pollution, and construction dust in Hanoi and Ho Chi Minh City.',
          implementationDate: '2020-07-01',
          effectivenessRating: 5
        },
        news: [
          { title: 'Hanoi air quality concerns rise', date: '2025-01-09', source: 'VnExpress' },
          { title: 'Industrial zone emissions regulated', date: '2024-12-23', source: 'Tuoi Tre' },
          { title: 'Motorcycle emission standards updated', date: '2024-12-08', source: 'Thanh Nien' }
        ],
        currentAQI: 138,
        currentPM25: 51
      },
      'Indonesia': {
        flag: '🇮🇩',
        region: 'Southeast Asia',
        policyType: 'Industrial Controls',
        mainPolicy: {
          name: 'Blue Sky Program',
          description: 'Government initiative focusing on vehicle emission standards and industrial pollution control in Jakarta.',
          implementationDate: '2012-08-15',
          effectivenessRating: 5
        },
        news: [
          { title: 'Jakarta air pollution reaches unhealthy levels', date: '2025-01-10', source: 'Jakarta Post' },
          { title: 'Coal plant emissions under review', date: '2024-12-24', source: 'Kompas' },
          { title: 'Public transport expansion planned', date: '2024-12-09', source: 'Tempo' }
        ],
        currentAQI: 152,
        currentPM25: 62
      },
      'Singapore': {
        flag: '🇸🇬',
        region: 'Southeast Asia',
        policyType: 'Comprehensive',
        mainPolicy: {
          name: 'Transboundary Haze Pollution Act',
          description: 'Comprehensive air quality management including vehicle quotas, industrial standards, and regional haze response.',
          implementationDate: '2014-09-25',
          effectivenessRating: 9
        },
        news: [
          { title: 'Singapore maintains excellent air quality', date: '2025-01-07', source: 'Straits Times' },
          { title: 'Regional haze monitoring enhanced', date: '2024-12-20', source: 'CNA' },
          { title: 'Electric vehicle adoption accelerates', date: '2024-12-05', source: 'Today' }
        ],
        currentAQI: 58,
        currentPM25: 18
      },
      'Malaysia': {
        flag: '🇲🇾',
        region: 'Southeast Asia',
        policyType: 'Monitoring & Standards',
        mainPolicy: {
          name: 'New Malaysian Air Quality Standards',
          description: 'Updated national standards for air pollutants with enhanced monitoring and enforcement mechanisms.',
          implementationDate: '2015-06-01',
          effectivenessRating: 7
        },
        news: [
          { title: 'Kuala Lumpur air quality improves', date: '2025-01-06', source: 'New Straits Times' },
          { title: 'Transboundary haze remains concern', date: '2024-12-21', source: 'Star' },
          { title: 'Industrial emission standards tightened', date: '2024-12-07', source: 'Malay Mail' }
        ],
        currentAQI: 98,
        currentPM25: 35
      },
      'Philippines': {
        flag: '🇵🇭',
        region: 'Southeast Asia',
        policyType: 'Vehicle Restrictions',
        mainPolicy: {
          name: 'Clean Air Act',
          description: 'National legislation controlling vehicle emissions, industrial pollution, and promoting clean fuel use in Metro Manila.',
          implementationDate: '1999-06-23',
          effectivenessRating: 6
        },
        news: [
          { title: 'Manila implements vehicle emission testing', date: '2025-01-08', source: 'Philippine Star' },
          { title: 'Jeepney modernization program continues', date: '2024-12-22', source: 'Inquirer' },
          { title: 'Air quality monitoring expanded', date: '2024-12-06', source: 'Manila Bulletin' }
        ],
        currentAQI: 112,
        currentPM25: 40
      },
      'Australia': {
        flag: '🇦🇺',
        region: 'Oceania',
        policyType: 'Monitoring & Standards',
        mainPolicy: {
          name: 'National Environment Protection Measure',
          description: 'Federal standards for ambient air quality including PM2.5 with state-level implementation and monitoring.',
          implementationDate: '2016-02-25',
          effectivenessRating: 8
        },
        news: [
          { title: 'Sydney air quality remains good', date: '2025-01-09', source: 'Sydney Morning Herald' },
          { title: 'Bushfire smoke impacts seasonal air quality', date: '2024-12-23', source: 'ABC News' },
          { title: 'Emission standards for industry updated', date: '2024-12-08', source: 'The Australian' }
        ],
        currentAQI: 62,
        currentPM25: 20
      },
      'New Zealand': {
        flag: '🇳🇿',
        region: 'Oceania',
        policyType: 'Energy Transition',
        mainPolicy: {
          name: 'National Environmental Standards for Air Quality',
          description: 'Regulations targeting domestic heating emissions and industrial pollution with focus on PM10 and PM2.5.',
          implementationDate: '2004-09-07',
          effectivenessRating: 8
        },
        news: [
          { title: 'Auckland air quality improvement continues', date: '2025-01-05', source: 'NZ Herald' },
          { title: 'Wood burner replacement program successful', date: '2024-12-19', source: 'Stuff' },
          { title: 'Winter air pollution targets met', date: '2024-12-03', source: 'Radio NZ' }
        ],
        currentAQI: 48,
        currentPM25: 15
      },
      'South Africa': {
        flag: '🇿🇦',
        region: 'Africa',
        policyType: 'Industrial Controls',
        mainPolicy: {
          name: 'National Ambient Air Quality Standards',
          description: 'National standards for air pollutants with priority areas in Highveld and industrial regions.',
          implementationDate: '2009-12-24',
          effectivenessRating: 6
        },
        news: [
          { title: 'Johannesburg tackles air pollution', date: '2025-01-07', source: 'Daily Maverick' },
          { title: 'Coal power plant emissions debated', date: '2024-12-20', source: 'News24' },
          { title: 'Air quality monitoring network expanded', date: '2024-12-05', source: 'Mail & Guardian' }
        ],
        currentAQI: 115,
        currentPM25: 41
      },
      'Egypt': {
        flag: '🇪🇬',
        region: 'Africa',
        policyType: 'Industrial Controls',
        mainPolicy: {
          name: 'National Air Quality Strategy',
          description: 'Strategy addressing industrial emissions, vehicle pollution, and agricultural burning in Greater Cairo.',
          implementationDate: '2018-03-15',
          effectivenessRating: 5
        },
        news: [
          { title: 'Cairo implements pollution reduction measures', date: '2025-01-10', source: 'Al-Ahram' },
          { title: 'Black cloud season monitoring begins', date: '2024-12-25', source: 'Egypt Today' },
          { title: 'Industrial zone emissions regulated', date: '2024-12-11', source: 'Daily News Egypt' }
        ],
        currentAQI: 168,
        currentPM25: 78
      },
      'Nigeria': {
        flag: '🇳🇬',
        region: 'Africa',
        policyType: 'Monitoring & Standards',
        mainPolicy: {
          name: 'National Air Quality Standards',
          description: 'Federal standards for air pollutants with monitoring in Lagos and major urban centers.',
          implementationDate: '2014-11-02',
          effectivenessRating: 4
        },
        news: [
          { title: 'Lagos air quality concerns addressed', date: '2025-01-08', source: 'Punch' },
          { title: 'Generator emissions regulation proposed', date: '2024-12-22', source: 'Vanguard' },
          { title: 'Air quality monitoring stations installed', date: '2024-12-07', source: 'Premium Times' }
        ],
        currentAQI: 172,
        currentPM25: 82
      },
      'Saudi Arabia': {
        flag: '🇸🇦',
        region: 'Middle East',
        policyType: 'Industrial Controls',
        mainPolicy: {
          name: 'Environmental Standards for Air Quality',
          description: 'National standards targeting industrial emissions and dust pollution in Riyadh and industrial cities.',
          implementationDate: '2012-07-15',
          effectivenessRating: 7
        },
        news: [
          { title: 'Riyadh air quality improvement initiatives', date: '2025-01-09', source: 'Arab News' },
          { title: 'Industrial emission limits enforced', date: '2024-12-23', source: 'Saudi Gazette' },
          { title: 'Dust storm monitoring enhanced', date: '2024-12-09', source: 'Okaz' }
        ],
        currentAQI: 128,
        currentPM25: 46
      },
      'UAE': {
        flag: '🇦🇪',
        region: 'Middle East',
        policyType: 'Comprehensive',
        mainPolicy: {
          name: 'National Air Quality Agenda',
          description: 'Comprehensive strategy including vehicle standards, industrial controls, and dust management in Dubai and Abu Dhabi.',
          implementationDate: '2017-04-10',
          effectivenessRating: 7
        },
        news: [
          { title: 'Dubai air quality monitoring upgraded', date: '2025-01-07', source: 'Gulf News' },
          { title: 'Clean energy transition continues', date: '2024-12-21', source: 'The National' },
          { title: 'Construction dust regulations tightened', date: '2024-12-06', source: 'Khaleej Times' }
        ],
        currentAQI: 102,
        currentPM25: 36
      },
      'Iran': {
        flag: '🇮🇷',
        region: 'Middle East',
        policyType: 'Vehicle Restrictions',
        mainPolicy: {
          name: 'Tehran Air Quality Control Plan',
          description: 'Traffic management and industrial emission controls in Tehran to address severe pollution episodes.',
          implementationDate: '2016-10-18',
          effectivenessRating: 5
        },
        news: [
          { title: 'Tehran schools closed due to pollution', date: '2025-01-11', source: 'Tehran Times' },
          { title: 'Vehicle restrictions extended', date: '2024-12-26', source: 'Press TV' },
          { title: 'Air quality emergency measures activated', date: '2024-12-13', source: 'IRNA' }
        ],
        currentAQI: 195,
        currentPM25: 95
      },
      'Pakistan': {
        flag: '🇵🇰',
        region: 'South Asia',
        policyType: 'Comprehensive',
        mainPolicy: {
          name: 'Pakistan Clean Air Program',
          description: 'National program addressing vehicle emissions, industrial pollution, and crop burning in Lahore and Karachi.',
          implementationDate: '2020-10-01',
          effectivenessRating: 5
        },
        news: [
          { title: 'Lahore battles severe smog season', date: '2025-01-10', source: 'Dawn' },
          { title: 'Crop burning ban enforcement increased', date: '2024-12-24', source: 'Express Tribune' },
          { title: 'Green lockdown measures implemented', date: '2024-12-11', source: 'The News' }
        ],
        currentAQI: 235,
        currentPM25: 142
      },
      'Argentina': {
        flag: '🇦🇷',
        region: 'South America',
        policyType: 'Monitoring & Standards',
        mainPolicy: {
          name: 'Air Quality Standards Law',
          description: 'National air quality standards with monitoring requirements in Buenos Aires and major cities.',
          implementationDate: '2007-11-28',
          effectivenessRating: 7
        },
        news: [
          { title: 'Buenos Aires air quality improving', date: '2025-01-06', source: 'La Nación' },
          { title: 'Vehicle emission testing program expanded', date: '2024-12-20', source: 'Clarín' },
          { title: 'Industrial emission regulations updated', date: '2024-12-05', source: 'Página 12' }
        ],
        currentAQI: 78,
        currentPM25: 26
      },
      'Chile': {
        flag: '🇨🇱',
        region: 'South America',
        policyType: 'Comprehensive',
        mainPolicy: {
          name: 'Santiago Air Quality Decontamination Plan',
          description: 'Comprehensive plan with vehicle restrictions, industrial controls, and wood burning bans in Santiago.',
          implementationDate: '2016-01-22',
          effectivenessRating: 7
        },
        news: [
          { title: 'Santiago air quality shows improvement', date: '2025-01-08', source: 'El Mercurio' },
          { title: 'Wood burning restrictions enforced', date: '2024-12-22', source: 'La Tercera' },
          { title: 'Pre-emergency alerts issued', date: '2024-12-09', source: 'Cooperativa' }
        ],
        currentAQI: 108,
        currentPM25: 39
      }
    };
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
    // Merge policy impact data with existing country policies
    if (!this.policyImpactData) return;

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
      }
    });
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

    // Display policy impact analysis if available
    const impactSection = document.getElementById('policy-impact-section');
    const timelineSection = document.getElementById('policy-timeline-section');

    if (policy.policyImpactData && policy.policyImpactData.policies && policy.policyImpactData.policies.length > 0) {
      const mainPolicy = policy.policyImpactData.policies[0];

      if (mainPolicy.impact) {
        impactSection.style.display = 'block';
        const impact = mainPolicy.impact;

        document.getElementById('impact-before').textContent = `${impact.beforePeriod.meanPM25.toFixed(1)} µg/m³`;
        document.getElementById('impact-after').textContent = `${impact.afterPeriod.meanPM25.toFixed(1)} µg/m³`;

        const changeElement = document.getElementById('impact-change');
        const percentChange = impact.analysis.percentChange;
        changeElement.textContent = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
        changeElement.className = `text-lg font-bold font-display ${percentChange < 0 ? 'text-green-400' : 'text-red-400'}`;

        const significanceText = impact.analysis.significant
          ? `✓ Statistically significant (p=${impact.analysis.pValue.toFixed(3)})`
          : `Not statistically significant (p=${impact.analysis.pValue.toFixed(3)})`;
        document.getElementById('impact-significance').textContent = significanceText;
      }

      // Render timeline chart if available
      if (mainPolicy.timeline && mainPolicy.timeline.length > 0) {
        timelineSection.style.display = 'block';
        this.renderPolicyTimeline(mainPolicy.timeline, mainPolicy.name);
      } else {
        timelineSection.style.display = 'none';
      }
    } else {
      impactSection.style.display = 'none';
      timelineSection.style.display = 'none';
    }

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

    // Set up "View Full Details" button
    const viewMoreBtn = document.getElementById('view-more-btn');
    if (viewMoreBtn) {
      // Remove old listeners by cloning
      const newBtn = viewMoreBtn.cloneNode(true);
      viewMoreBtn.parentNode.replaceChild(newBtn, viewMoreBtn);

      newBtn.addEventListener('click', () => {
        this.showFullDetails(countryName, policy);
      });
    }
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
          <span class="text-6xl">${policy.flag}</span>
          <div>
            <h2 class="text-3xl font-bold text-white font-display">${countryName}</h2>
            <p class="text-lg text-white/60 font-display">${policy.region}</p>
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
            <h3 class="text-2xl font-bold text-white font-display">Main Policy</h3>
          </div>
          <h4 class="text-xl font-bold text-primary font-display mb-3">${policy.mainPolicy.name}</h4>
          <p class="text-base text-white/90 font-display mb-4 leading-relaxed">${policy.mainPolicy.description}</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 font-display mb-1">Implementation Date</p>
              <p class="text-sm font-semibold text-white font-display">${policy.mainPolicy.implementationDate}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 font-display mb-1">Effectiveness Rating</p>
              <p class="text-sm font-semibold text-white font-display">${policy.mainPolicy.effectivenessRating}/10</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 font-display mb-1">Policy Type</p>
              <p class="text-sm font-semibold text-white font-display">${policy.policyType}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 font-display mb-1">Region</p>
              <p class="text-sm font-semibold text-white font-display">${policy.region}</p>
            </div>
          </div>
        </div>

        <!-- Current Air Quality Section -->
        <div class="bg-black/20 rounded-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary text-2xl">air</span>
            <h3 class="text-2xl font-bold text-white font-display">Current Air Quality</h3>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black/30 rounded-lg p-4 text-center">
              <p class="text-sm text-white/60 font-display mb-2">Air Quality Index</p>
              <p class="text-4xl font-bold font-display ${this.getAQIClass(policy.currentAQI)}">${policy.currentAQI}</p>
              <p class="text-xs text-white/60 font-display mt-2">${this.getAQILabel(policy.currentAQI)}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-4 text-center">
              <p class="text-sm text-white/60 font-display mb-2">PM2.5 Level</p>
              <p class="text-4xl font-bold text-primary font-display">${policy.currentPM25}</p>
              <p class="text-xs text-white/60 font-display mt-2">µg/m³</p>
            </div>
          </div>
        </div>

        <!-- Recent News Section -->
        <div class="bg-black/20 rounded-lg p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary text-2xl">newspaper</span>
            <h3 class="text-2xl font-bold text-white font-display">Recent News & Updates</h3>
          </div>
          <div class="space-y-3">
            ${policy.news.map(news => `
              <div class="bg-black/30 rounded-lg p-4 hover:bg-black/40 transition-colors cursor-pointer">
                <h5 class="text-base font-semibold text-white mb-2 font-display">${news.title}</h5>
                <div class="flex items-center justify-between text-sm text-white/60">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined !text-base">newspaper</span>
                    ${news.source}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined !text-base">calendar_today</span>
                    ${news.date}
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
            <h3 class="text-2xl font-bold text-white font-display">Policy Impact</h3>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-black/30 rounded-lg p-3 text-center">
              <span class="material-symbols-outlined text-primary text-3xl">trending_down</span>
              <p class="text-xs text-white/60 font-display mt-2">Emissions</p>
              <p class="text-lg font-bold text-white font-display">${policy.mainPolicy.effectivenessRating >= 7 ? '↓ 15%' : '↓ 8%'}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3 text-center">
              <span class="material-symbols-outlined text-primary text-3xl">groups</span>
              <p class="text-xs text-white/60 font-display mt-2">Lives Protected</p>
              <p class="text-lg font-bold text-white font-display">${policy.mainPolicy.effectivenessRating >= 7 ? '1M+' : '500K+'}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3 text-center">
              <span class="material-symbols-outlined text-primary text-3xl">local_hospital</span>
              <p class="text-xs text-white/60 font-display mt-2">Health Impact</p>
              <p class="text-lg font-bold text-white font-display">${policy.mainPolicy.effectivenessRating >= 7 ? 'High' : 'Medium'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

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
    allOption.className = 'px-4 py-2 text-white text-sm hover:bg-white/10 cursor-pointer font-display';
    allOption.textContent = 'All';
    allOption.addEventListener('click', () => {
      dropdown.remove();
      this.clearFilters();
    });
    dropdown.appendChild(allOption);

    // Add options
    options.sort().forEach(option => {
      const item = document.createElement('div');
      item.className = 'px-4 py-2 text-white text-sm hover:bg-white/10 cursor-pointer font-display border-t border-white/5';
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
    new PolicyGlobe();
  });
} else {
  new PolicyGlobe();
}
