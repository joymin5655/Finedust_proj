/**
 * globe-earth.js — 3D Earth, Atmosphere, Clouds, Stars, Borders, Lights
 * ──────────────────────────────────────────────────────────────────────
 * PolicyGlobe 클래스의 지구 렌더링 관련 메서드를 mixin 형태로 제공
 */

import * as THREE from 'three';

/**
 * @param {Function} Cls - PolicyGlobe class
 */
export function mixEarth(Cls) {
  const P = Cls.prototype;

  // ── Lights ──────────────────────────────────────────────────
  P.createLights = function () {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sunLight.position.set(5, 3, 5);
    this.scene.add(this.sunLight);

    const fillLight = new THREE.DirectionalLight(0x6495ed, 0.2);
    fillLight.position.set(-5, -3, -5);
    this.scene.add(fillLight);
  };

  // ── Stars ───────────────────────────────────────────────────
  P.createStars = function () {
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
  };

  // ── Realistic Earth ────────────────────────────────────────
  P.createRealisticEarth = async function () {
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    console.log('🌍 Loading Earth texture...');

    const textureLoader = new THREE.TextureLoader();
    let earthTexture = null;

    try {
      earthTexture = await Promise.race([
        new Promise((resolve, reject) => {
          textureLoader.load(
            'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
            (texture) => {
              console.log('✅ Earth texture loaded from CDN');
              texture.magFilter = THREE.LinearFilter;
              texture.minFilter = THREE.LinearMipmapLinearFilter;
              texture.generateMipmaps = true;
              resolve(texture);
            },
            undefined,
            () => resolve(null)
          );
        }),
        new Promise((resolve) => setTimeout(() => resolve(null), 5000))
      ]);

      if (!earthTexture) {
        console.log('🎨 Creating procedural Earth texture...');
        earthTexture = this.createProceduralEarthTexture();
      }

      const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpScale: 0.005,
        specular: new THREE.Color(0x333333),
        shininess: 15,
        emissive: new THREE.Color(0x112244),
        emissiveIntensity: 0.1,
        side: THREE.FrontSide,
        flatShading: false
      });

      this.earth = new THREE.Mesh(geometry, material);
      this.scene.add(this.earth);
      console.log('✅ Earth globe created');

    } catch (error) {
      console.error('❌ Error in createRealisticEarth:', error);
      const fallbackTexture = this.createProceduralEarthTexture();
      const material = new THREE.MeshPhongMaterial({
        map: fallbackTexture,
        bumpScale: 0.005,
        specular: new THREE.Color(0x333333),
        shininess: 15,
        emissive: new THREE.Color(0x112244),
        emissiveIntensity: 0.1
      });
      this.earth = new THREE.Mesh(geometry, material);
      this.scene.add(this.earth);
    }
  };

  // ── Procedural Texture ─────────────────────────────────────
  P.createProceduralEarthTexture = function () {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Ocean gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a3a4a');
    gradient.addColorStop(0.3, '#1a4466');
    gradient.addColorStop(0.5, '#1a4466');
    gradient.addColorStop(0.7, '#1a4466');
    gradient.addColorStop(1, '#1a3a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add ocean noise
    this.addOceanNoise(ctx, canvas.width, canvas.height);

    // Draw continents
    ctx.fillStyle = '#2d5a27';
    this.drawRealisticContinents(ctx, canvas.width, canvas.height);
    this.addLandDetails(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  P.createProceduralEarth = function (geometry) {
    const texture = this.createProceduralEarthTexture();
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpScale: 0.005,
      specular: new THREE.Color(0x333333),
      shininess: 15,
      emissive: new THREE.Color(0x112244),
      emissiveIntensity: 0.1
    });
    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
  };

  P.addOceanNoise = function (ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i]     = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
  };

  P.drawRealisticContinents = function (ctx, w, h) {
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
  };

  P.addLandDetails = function (ctx, w, h) {
    // Mountain ranges (darker)
    ctx.fillStyle = '#1e4028';
    ctx.beginPath();
    ctx.ellipse(w * 0.68, h * 0.33, w * 0.04, h * 0.01, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.19, h * 0.3, w * 0.015, h * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.275, h * 0.62, w * 0.008, h * 0.11, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Desert regions (lighter)
    ctx.fillStyle = '#3d6840';
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.40, w * 0.035, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.72, h * 0.30, w * 0.03, h * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // ── Atmosphere ─────────────────────────────────────────────
  P.createAtmosphere = function () {
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
  };

  // ── Clouds ─────────────────────────────────────────────────
  P.createClouds = function () {
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
  };

  // ── Country Borders (lat/lon grid) ─────────────────────────
  P.createCountryBorders = function () {
    const group = new THREE.Group();
    const material = new THREE.LineBasicMaterial({
      color: 0x55aaff,
      transparent: true,
      opacity: 0.3
    });

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const radius = Math.cos((lat * Math.PI) / 180);
      const y = Math.sin((lat * Math.PI) / 180);
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      group.add(new THREE.Line(geometry, material));
    }

    // Longitude lines
    for (let lon = 0; lon < 180; lon += 30) {
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const lat = (i / 64) * Math.PI - Math.PI / 2;
        const y = Math.sin(lat);
        const radius = Math.cos(lat);
        const angle = (lon * Math.PI) / 180;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      group.add(new THREE.Line(geometry, material));
    }

    this.countryBorders = group;
    this.countryBorders.visible = this.showBorders;
    this.scene.add(this.countryBorders);
  };

} // end mixEarth
