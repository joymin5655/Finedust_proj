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

    // Particle system
    this.particles = null;
    this.particleCount = 3000; // Reduced for better performance
    this.particleSpeed = 1.0;
    this.particlesEnabled = true;

    // Globe objects
    this.earth = null;
    this.atmosphere = null;
    this.clouds = null;
    this.grid = null;
    this.stars = null;

    // PM2.5 data
    this.pm25Data = new Map();

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
      this.createParticles();
      this.createGrid();

      this.setupEventListeners();
      await this.loadPM25Data();

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
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(5, 3, 5);
    this.scene.add(sunLight);

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
    for (let i = 0; i < 3000; i++) {
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
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Create procedural earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Ocean blue
    ctx.fillStyle = '#1a4d6f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Land masses (simplified continents)
    ctx.fillStyle = '#2d6b3f';
    this.drawContinents(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpScale: 0.02,
      specular: new THREE.Color(0x444444),
      shininess: 10
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
    console.log('Earth created');
  }

  drawContinents(ctx, width, height) {
    // North America
    ctx.beginPath();
    ctx.ellipse(width * 0.22, height * 0.28, width * 0.09, height * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.ellipse(width * 0.28, height * 0.62, width * 0.045, height * 0.12, 0, 0, Math.PI * 2);
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
    ctx.ellipse(width * 0.7, height * 0.32, width * 0.14, height * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.ellipse(width * 0.8, height * 0.68, width * 0.04, height * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antarctica
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.92, width * 0.25, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  createAtmosphere() {
    const geometry = new THREE.SphereGeometry(1.08, 64, 64);
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
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
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
    const geometry = new THREE.SphereGeometry(1.01, 64, 64);

    // Create cloud texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 25 + 15;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });

    this.clouds = new THREE.Mesh(geometry, material);
    this.scene.add(this.clouds);
    console.log('Clouds created');
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

      // Random velocity tangent to sphere
      const vx = (Math.random() - 0.5) * 0.002;
      const vy = (Math.random() - 0.5) * 0.002;
      const vz = (Math.random() - 0.5) * 0.002;

      velocities.push(vx, vy, vz);

      // Cyan color for particles
      const color = new THREE.Color();
      color.setHSL(0.55, 0.8, 0.6);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    console.log('Particles created');
  }

  updateParticles() {
    if (!this.particles || !this.particlesEnabled) return;

    const positions = this.particles.geometry.attributes.position.array;
    const velocities = this.particles.geometry.attributes.velocity.array;

    for (let i = 0; i < this.particleCount * 3; i += 3) {
      // Update position
      positions[i] += velocities[i] * this.particleSpeed;
      positions[i + 1] += velocities[i + 1] * this.particleSpeed;
      positions[i + 2] += velocities[i + 2] * this.particleSpeed;

      // Calculate radius
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      const radius = Math.sqrt(x * x + y * y + z * z);

      // Reset particles that go too far
      if (radius > 1.15 || radius < 0.95) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const newRadius = 1.02;

        positions[i] = newRadius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = newRadius * Math.cos(phi);
      }

      // Add curl for natural wind patterns
      const curl = Math.sin(this.time * 0.0005 + positions[i] * 2) * 0.00002;
      velocities[i] += curl;
      velocities[i + 1] += curl * 0.5;

      // Normalize velocity
      const vLength = Math.sqrt(
        velocities[i] ** 2 + velocities[i + 1] ** 2 + velocities[i + 2] ** 2
      );

      if (vLength > 0.002) {
        const scale = 0.002 / vLength;
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
      color: 0x555555,
      transparent: true,
      opacity: 0.3
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

  async loadPM25Data() {
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
    if (aqi <= 50) return new THREE.Color(0x00e400);
    if (aqi <= 100) return new THREE.Color(0xffff00);
    if (aqi <= 150) return new THREE.Color(0xff7e00);
    if (aqi <= 200) return new THREE.Color(0xff0000);
    if (aqi <= 300) return new THREE.Color(0x8f3f97);
    return new THREE.Color(0x7e1946);
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
    const toggleParticles = document.getElementById('toggle-particles');
    if (toggleParticles) {
      toggleParticles.addEventListener('change', (e) => {
        this.particlesEnabled = e.target.checked;
        if (this.particles) {
          this.particles.visible = this.particlesEnabled;
        }
      });
    }

    const togglePM25 = document.getElementById('toggle-pm25');
    if (togglePM25) {
      togglePM25.addEventListener('change', (e) => {
        this.showPM25 = e.target.checked;
      });
    }

    const toggleGrid = document.getElementById('toggle-grid');
    if (toggleGrid) {
      toggleGrid.addEventListener('change', (e) => {
        this.showGrid = e.target.checked;
        if (this.grid) {
          this.grid.visible = this.showGrid;
        }
      });
    }

    const toggleDaynight = document.getElementById('toggle-daynight');
    if (toggleDaynight) {
      toggleDaynight.addEventListener('change', (e) => {
        this.dayNightEnabled = e.target.checked;
      });
    }

    // Particle speed
    const particleSpeed = document.getElementById('particle-speed');
    if (particleSpeed) {
      particleSpeed.addEventListener('input', (e) => {
        this.particleSpeed = parseFloat(e.target.value);
      });
    }

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

        // Sample data
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
      this.earth.rotation.y += 0.0003;
    }

    // Rotate clouds
    if (this.clouds) {
      this.clouds.rotation.y += 0.0005;
    }

    // Subtle star rotation
    if (this.stars) {
      this.stars.rotation.y += 0.00002;
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
