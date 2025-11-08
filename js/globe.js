/**
 * AirLens Globe - Advanced 3D Visualization
 * Earth.nullschool.net inspired atmospheric flow simulation
 * With PM2.5 data integration
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class AirLensGlobeAdvanced {
  constructor() {
    this.canvas = document.getElementById('globe-canvas');
    this.container = document.getElementById('globe-container');

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000005);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 3);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 5;
    this.controls.enablePan = false;

    // Particle system
    this.particles = null;
    this.particleCount = 5000;
    this.particleSpeed = 1.0;
    this.particlesEnabled = true;

    // Globe objects
    this.earth = null;
    this.atmosphere = null;
    this.clouds = null;
    this.grid = null;

    // PM2.5 data
    this.pm25Data = new Map();
    this.pm25Overlay = null;

    // State
    this.showGrid = false;
    this.showPM25 = true;
    this.dayNightEnabled = true;

    // Animation
    this.clock = new THREE.Clock();
    this.time = 0;

    this.init();
  }

  async init() {
    this.createEarth();
    this.createAtmosphere();
    this.createClouds();
    this.createStars();
    this.createLights();
    this.createParticles();
    this.createGrid();

    this.setupEventListeners();
    await this.loadPM25Data();

    this.animate();
  }

  createEarth() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Earth texture (simple blue marble for now)
    const textureLoader = new THREE.TextureLoader();

    // Create a procedural earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Ocean blue
    ctx.fillStyle = '#0a4f7c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Land masses (simplified)
    ctx.fillStyle = '#2d5a3d';
    this.drawSimplifiedContinents(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpScale: 0.05,
      specular: new THREE.Color(0x333333),
      shininess: 5
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
  }

  drawSimplifiedContinents(ctx, width, height) {
    // North America
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.3, width * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.arc(width * 0.25, height * 0.6, width * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Europe
    ctx.beginPath();
    ctx.arc(width * 0.52, height * 0.28, width * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Africa
    ctx.beginPath();
    ctx.arc(width * 0.52, height * 0.5, width * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Asia
    ctx.beginPath();
    ctx.arc(width * 0.7, height * 0.35, width * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.7, width * 0.03, 0, Math.PI * 2);
    ctx.fill();
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
          gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0) * intensity;
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
    const geometry = new THREE.SphereGeometry(1.01, 64, 64);

    // Create cloud texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 30 + 20;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });

    this.clouds = new THREE.Mesh(geometry, material);
    this.scene.add(this.clouds);
  }

  createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
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
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // Sun light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 3, 5);
    this.scene.add(sunLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, -3, -5);
    this.scene.add(fillLight);
  }

  createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const colors = [];

    for (let i = 0; i < this.particleCount; i++) {
      // Random position on sphere surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 1.02;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);

      // Random velocity (tangent to sphere)
      const vx = Math.random() * 0.001 - 0.0005;
      const vy = Math.random() * 0.001 - 0.0005;
      const vz = Math.random() * 0.001 - 0.0005;

      velocities.push(vx, vy, vz);

      // Color based on PM2.5 (cyan to red gradient)
      const color = new THREE.Color();
      color.setHSL(0.5, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  updateParticles() {
    if (!this.particles || !this.particlesEnabled) return;

    const positions = this.particles.geometry.attributes.position.array;
    const velocities = this.particles.geometry.attributes.velocity.array;

    for (let i = 0; i < this.particleCount * 3; i += 3) {
      // Update position based on velocity
      positions[i] += velocities[i] * this.particleSpeed * 0.1;
      positions[i + 1] += velocities[i + 1] * this.particleSpeed * 0.1;
      positions[i + 2] += velocities[i + 2] * this.particleSpeed * 0.1;

      // Get current position
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      const radius = Math.sqrt(x * x + y * y + z * z);

      // If particle goes too far or too close, reset it
      if (radius > 1.1 || radius < 0.95) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const newRadius = 1.02;

        positions[i] = newRadius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = newRadius * Math.cos(phi);
      }

      // Add some curl to make it look more natural (simplified wind simulation)
      const curl = Math.sin(this.time * 0.001 + positions[i]) * 0.00001;
      velocities[i] += curl;
      velocities[i + 1] += curl;

      // Normalize velocity to maintain speed
      const vLength = Math.sqrt(
        velocities[i] * velocities[i] +
        velocities[i + 1] * velocities[i + 1] +
        velocities[i + 2] * velocities[i + 2]
      );

      if (vLength > 0.001) {
        velocities[i] = (velocities[i] / vLength) * 0.001;
        velocities[i + 1] = (velocities[i + 1] / vLength) * 0.001;
        velocities[i + 2] = (velocities[i + 2] / vLength) * 0.001;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  createGrid() {
    // Latitude lines
    const latMaterial = new THREE.LineBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.3
    });

    const gridGroup = new THREE.Group();

    // Latitude circles
    for (let lat = -80; lat <= 80; lat += 20) {
      const radius = Math.cos((lat * Math.PI) / 180);
      const y = Math.sin((lat * Math.PI) / 180);

      const geometry = new THREE.CircleGeometry(radius, 64);
      geometry.vertices.shift(); // Remove center vertex
      const circle = new THREE.LineLoop(geometry, latMaterial);
      circle.rotation.x = Math.PI / 2;
      circle.position.y = y;
      gridGroup.add(circle);
    }

    // Longitude lines
    for (let lon = 0; lon < 360; lon += 20) {
      const curve = new THREE.EllipseCurve(
        0, 0,
        1, 1,
        0, 2 * Math.PI,
        false,
        0
      );
      const points = curve.getPoints(64);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, latMaterial);
      line.rotation.y = (lon * Math.PI) / 180;
      gridGroup.add(line);
    }

    this.grid = gridGroup;
    this.grid.visible = this.showGrid;
    this.scene.add(this.grid);
  }

  async loadPM25Data() {
    // Mock PM2.5 data - in production, this would fetch from an API
    // Using sample data for major cities
    this.pm25Data = new Map([
      ['Seoul', { lat: 37.5665, lon: 126.9780, pm25: 45, aqi: 125 }],
      ['Beijing', { lat: 39.9042, lon: 116.4074, pm25: 85, aqi: 165 }],
      ['Tokyo', { lat: 35.6762, lon: 139.6503, pm25: 25, aqi: 75 }],
      ['Los Angeles', { lat: 34.0522, lon: -118.2437, pm25: 55, aqi: 145 }],
      ['London', { lat: 51.5074, lon: -0.1278, pm25: 30, aqi: 90 }],
      ['Delhi', { lat: 28.6139, lon: 77.2090, pm25: 150, aqi: 250 }],
      ['Mumbai', { lat: 19.0760, lon: 72.8777, pm25: 95, aqi: 180 }],
      ['São Paulo', { lat: -23.5505, lon: -46.6333, pm25: 40, aqi: 110 }]
    ]);

    console.log('PM2.5 data loaded for', this.pm25Data.size, 'locations');
  }

  getAQIColor(aqi) {
    if (aqi <= 50) return new THREE.Color(0x00e400); // Good - Green
    if (aqi <= 100) return new THREE.Color(0xffff00); // Moderate - Yellow
    if (aqi <= 150) return new THREE.Color(0xff7e00); // Unhealthy SG - Orange
    if (aqi <= 200) return new THREE.Color(0xff0000); // Unhealthy - Red
    if (aqi <= 300) return new THREE.Color(0x8f3f97); // Very Unhealthy - Purple
    return new THREE.Color(0x7e1946); // Hazardous - Maroon
  }

  getAQILevel(aqi) {
    if (aqi <= 50) return { level: 'Good', color: 'text-green-500' };
    if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-400' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-500' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-500' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'text-purple-500' };
    return { level: 'Hazardous', color: 'text-red-900' };
  }

  setupEventListeners() {
    // Window resize
    window.addEventListener('resize', () => this.onResize());

    // Toggle controls
    document.getElementById('toggle-particles')?.addEventListener('change', (e) => {
      this.particlesEnabled = e.target.checked;
      if (this.particles) {
        this.particles.visible = this.particlesEnabled;
      }
    });

    document.getElementById('toggle-pm25')?.addEventListener('change', (e) => {
      this.showPM25 = e.target.checked;
    });

    document.getElementById('toggle-grid')?.addEventListener('change', (e) => {
      this.showGrid = e.target.checked;
      if (this.grid) {
        this.grid.visible = this.showGrid;
      }
    });

    document.getElementById('toggle-daynight')?.addEventListener('change', (e) => {
      this.dayNightEnabled = e.target.checked;
    });

    // Particle speed
    document.getElementById('particle-speed')?.addEventListener('input', (e) => {
      this.particleSpeed = parseFloat(e.target.value);
    });

    // Zoom controls
    document.getElementById('zoom-in')?.addEventListener('click', () => {
      const distance = this.camera.position.length();
      this.camera.position.multiplyScalar(0.9);
    });

    document.getElementById('zoom-out')?.addEventListener('click', () => {
      const distance = this.camera.position.length();
      this.camera.position.multiplyScalar(1.1);
    });

    document.getElementById('reset-view')?.addEventListener('click', () => {
      this.camera.position.set(0, 0, 3);
      this.controls.reset();
    });

    // Click on globe to show station info
    this.canvas.addEventListener('click', (e) => this.onClick(e));
  }

  onClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObject(this.earth);

    if (intersects.length > 0) {
      // Show sample station data
      const stationInfo = document.getElementById('station-info');
      if (stationInfo) {
        stationInfo.style.display = 'block';

        // Use sample data for demonstration
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

    // Update particles
    this.updateParticles();

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
