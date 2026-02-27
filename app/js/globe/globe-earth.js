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

  // ── Lights (3점 조명 — 자연스러운 음영) ──────────────────────
  P.createLights = function () {
    // 환경광 (전체 베이스)
    const ambientLight = new THREE.AmbientLight(0xccddff, 0.4);
    this.scene.add(ambientLight);

    // 태양광 (주광)
    this.sunLight = new THREE.DirectionalLight(0xfff5e0, 1.3);
    this.sunLight.position.set(5, 3, 5);
    this.scene.add(this.sunLight);

    // 필라이트 (반대편 부드러운 청색)
    const fillLight = new THREE.DirectionalLight(0x4477aa, 0.25);
    fillLight.position.set(-5, -2, -5);
    this.scene.add(fillLight);

    // 림라이트 (에지 강조)
    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.15);
    rimLight.position.set(0, 5, -3);
    this.scene.add(rimLight);
  };

  // ── Stars (크기·밝기 다양화) ─────────────────────────────────
  P.createStars = function () {
    const starsGeometry = new THREE.BufferGeometry();
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // 구면 분포 (클러스터링 방지)
      const r = 800 + Math.random() * 1200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      // 크기 다양화 (대부분 작고 일부 밝은 별)
      const bright = Math.random();
      sizes[i] = bright > 0.98 ? 3.5 : bright > 0.9 ? 2.2 : 0.8 + Math.random() * 0.8;

      // 색상 다양화 (백색 + 약간의 청/황 틴트)
      const tint = Math.random();
      if (tint > 0.92) {
        // 파란 별
        colors[i3] = 0.7; colors[i3+1] = 0.8; colors[i3+2] = 1.0;
      } else if (tint > 0.85) {
        // 노란 별
        colors[i3] = 1.0; colors[i3+1] = 0.95; colors[i3+2] = 0.7;
      } else {
        colors[i3] = 1.0; colors[i3+1] = 1.0; colors[i3+2] = 1.0;
      }
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const starsMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: 1.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    });

    this.stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(this.stars);
  };

  // ── Realistic Earth (다중 CDN + bump map) ───────────────────
  P.createRealisticEarth = async function () {
    const geometry = new THREE.SphereGeometry(1, 128, 128);
    console.log('🌍 Loading Earth texture...');

    const textureLoader = new THREE.TextureLoader();

    // 다중 CDN 시도
    const CDN_URLS = [
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
      'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg',
    ];
    const BUMP_URL = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

    const loadTexture = (url, timeout = 6000) => new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), timeout);
      textureLoader.load(url, (tex) => {
        clearTimeout(timer);
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;
        resolve(tex);
      }, undefined, () => { clearTimeout(timer); resolve(null); });
    });

    let earthTexture = null;
    for (const url of CDN_URLS) {
      earthTexture = await loadTexture(url, 5000);
      if (earthTexture) {
        console.log('✅ Earth texture loaded');
        break;
      }
    }

    if (!earthTexture) {
      console.log('🎨 Creating procedural Earth texture...');
      earthTexture = this.createProceduralEarthTexture();
    }

    // Bump map (선택적 — 높낮이 표현)
    let bumpTexture = null;
    try {
      bumpTexture = await loadTexture(BUMP_URL, 4000);
      if (bumpTexture) console.log('✅ Bump map loaded');
    } catch (e) { /* optional */ }

    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture || undefined,
      bumpScale: bumpTexture ? 0.02 : 0.005,
      specular: new THREE.Color(0x222233),
      shininess: 20,
      emissive: new THREE.Color(0x0a1628),
      emissiveIntensity: 0.08,
      side: THREE.FrontSide,
      flatShading: false
    });

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
    console.log('✅ Earth globe created');
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

  // ── Atmosphere (이중 레이어 Fresnel) ────────────────────────
  P.createAtmosphere = function () {
    // 내부 대기 (파란 글로우)
    const innerGeo = new THREE.SphereGeometry(1.02, 64, 64);
    const innerMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float rim = 1.0 - max(0.0, dot(vNormal, viewDir));
          float atmosphere = pow(rim, 2.5) * 0.6;
          vec3 color = mix(vec3(0.1, 0.4, 0.9), vec3(0.3, 0.7, 1.0), rim);
          gl_FragColor = vec4(color, atmosphere);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
    });
    this.atmosphereInner = new THREE.Mesh(innerGeo, innerMat);
    this.scene.add(this.atmosphereInner);

    // 외부 대기 (넓은 글로우)
    const outerGeo = new THREE.SphereGeometry(1.15, 64, 64);
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
          float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.15, 0.4, 0.85, 1.0) * intensity * 0.8;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    this.atmosphere = new THREE.Mesh(outerGeo, outerMat);
    this.scene.add(this.atmosphere);
  };

  // ── Clouds (자연스러운 밴드 패턴) ────────────────────────────
  P.createClouds = function () {
    const geometry = new THREE.SphereGeometry(1.01, 64, 64);
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 투명 배경
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 위도별 구름 밀도 (열대 수렴대, 편서풍대에 집중)
    const cloudBands = [
      { latCenter: 0.5, latWidth: 0.08, density: 0.7 },   // ITCZ (적도)
      { latCenter: 0.3, latWidth: 0.12, density: 0.5 },   // 북반구 중위도
      { latCenter: 0.7, latWidth: 0.12, density: 0.5 },   // 남반구 중위도
      { latCenter: 0.15, latWidth: 0.06, density: 0.3 },  // 북극 근처
      { latCenter: 0.85, latWidth: 0.06, density: 0.3 },  // 남극 근처
    ];

    ctx.fillStyle = 'white';
    for (const band of cloudBands) {
      const yCenter = band.latCenter * canvas.height;
      const yRange = band.latWidth * canvas.height;
      const count = Math.floor(200 * band.density);

      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = yCenter + (Math.random() - 0.5) * yRange * 2;
        const radius = 15 + Math.random() * 30;
        const opacity = 0.1 + Math.random() * 0.2 * band.density;

        ctx.globalAlpha = opacity;
        // 여러 원으로 자연스러운 형태
        const clusterSize = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < clusterSize; j++) {
          const ox = (Math.random() - 0.5) * radius;
          const oy = (Math.random() - 0.5) * radius * 0.4;
          const r = radius * (0.5 + Math.random() * 0.5);
          ctx.beginPath();
          ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.clouds = new THREE.Mesh(geometry, material);
    this.scene.add(this.clouds);
  };

  // ── Country Borders (위도/경도 그리드) ───────────────────────
  P.createCountryBorders = function () {
    const group = new THREE.Group();
    const material = new THREE.LineBasicMaterial({
      color: 0x4488cc,
      transparent: true,
      opacity: 0.15,
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
