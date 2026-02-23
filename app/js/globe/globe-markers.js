/**
 * globe-markers.js — Particles, PM2.5 Markers, Policy Markers
 * ────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';

export function mixMarkers(Cls) {
  const P = Cls.prototype;

  // ── Particles (atmospheric flow arrows) ────────────────────
  P.createParticles = function () {
    this.particles = new THREE.Group();
    this.particleArrows = [];

    const arrowCount = 400;
    const radius = 1.03;

    for (let i = 0; i < arrowCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / arrowCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const position = new THREE.Vector3(x, y, z);

      const latitude = (Math.PI / 2) - phi;
      const latitudeDeg = (latitude * 180) / Math.PI;
      const jetStreamFactor = Math.abs(latitudeDeg) > 30 && Math.abs(latitudeDeg) < 60 ? 1.5 : 1.0;

      const flowDirection = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta));
      if (latitudeDeg > 0 && latitudeDeg < 30) flowDirection.y += 0.1;
      else if (latitudeDeg < 0 && latitudeDeg > -30) flowDirection.y -= 0.1;
      flowDirection.normalize();

      const arrowLength = 0.04 * jetStreamFactor;
      const arrowHeadLength = 0.012 * jetStreamFactor;
      const arrowHeadWidth = 0.008 * jetStreamFactor;

      const shaftGeometry = new THREE.CylinderGeometry(0.002, 0.002, arrowLength - arrowHeadLength, 4);
      const shaftMesh = new THREE.Mesh(shaftGeometry);
      shaftMesh.position.y = (arrowLength - arrowHeadLength) / 2;

      const headGeometry = new THREE.ConeGeometry(arrowHeadWidth, arrowHeadLength, 4);
      const headMesh = new THREE.Mesh(headGeometry);
      headMesh.position.y = arrowLength - arrowHeadLength / 2;

      const arrowGroup = new THREE.Group();
      arrowGroup.add(shaftMesh);
      arrowGroup.add(headMesh);

      const color = new THREE.Color();
      color.setHSL(jetStreamFactor > 1 ? 0.52 : 0.55, jetStreamFactor > 1 ? 0.9 : 0.7, jetStreamFactor > 1 ? 0.6 : 0.5);

      const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, depthWrite: false });
      shaftMesh.material = material;
      headMesh.material = material;

      arrowGroup.position.copy(position);

      const up = position.clone().normalize();
      const localRight = new THREE.Vector3().crossVectors(up, flowDirection).normalize();
      const localForward = new THREE.Vector3().crossVectors(localRight, up).normalize();
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeBasis(localRight, up, localForward);
      arrowGroup.quaternion.setFromRotationMatrix(rotationMatrix);
      arrowGroup.rotateOnAxis(up, Math.atan2(flowDirection.z, flowDirection.x));

      this.particles.add(arrowGroup);
      this.particleArrows.push({
        group: arrowGroup,
        basePosition: position.clone(),
        flowDirection: flowDirection.clone(),
        speed: jetStreamFactor,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.particles.visible = this.particlesEnabled;
    this.scene.add(this.particles);
  };

  P.updateParticles = function () {
    if (!this.particles || !this.particlesEnabled || !this.particleArrows) return;
    this.particleArrows.forEach((arrow) => {
      const pulseSpeed = 0.001 * arrow.speed;
      const opacity = 0.5 + Math.sin(this.time * pulseSpeed + arrow.phase) * 0.3;
      arrow.group.children.forEach(mesh => { if (mesh.material) mesh.material.opacity = opacity; });
      if (arrow.speed > 1) {
        const scale = 1.0 + Math.sin(this.time * 0.002 + arrow.phase) * 0.1;
        arrow.group.scale.setScalar(scale);
      }
    });
  };

  // ── PM2.5 Markers (async batch) ────────────────────────────
  P.createPM25MarkersAsync = async function () {
    if (!this.markerSystem || this.pm25Data.size === 0) return;

    let created = 0;
    for (const [city, data] of this.pm25Data.entries()) {
      const marker = this.markerSystem.createPM25Marker({
        city,
        lat: data.lat,
        lon: data.lon,
        pm25: data.pm25,
        aqi: data.aqi,
        country: data.country,
        source: data.source
      });
      if (marker) created++;
    }
    console.log(`✅ Created ${created} PM2.5 markers`);
  };

  // ── Country Policy Markers ─────────────────────────────────
  P.createCountryPolicyMarkers = function () {
    if (!this.countryPolicies || !this.markerSystem) {
      console.warn('⚠️ countryPolicies or markerSystem not available');
      return;
    }

    const countries = Object.keys(this.countryPolicies);
    console.log(`📋 Creating ${countries.length} country policy markers...`);

    let created = 0;
    for (const country of countries) {
      const policy = this.countryPolicies[country];
      if (!policy) continue;

      const effectivenessScore = (policy.mainPolicy?.effectivenessRating || 5) / 10;
      const marker = this.markerSystem.createPolicyMarker({
        country, effectivenessScore,
        flag: policy.flag, region: policy.region, policyType: policy.policyType,
        mainPolicy: policy.mainPolicy, pm25Trends: policy.pm25Trends,
        policyImpact: policy.policyImpact, news: policy.news,
        currentAQI: policy.currentAQI, currentPM25: policy.currentPM25
      });
      if (marker) created++;
    }
    console.log(`✅ Created ${created}/${countries.length} country policy markers`);
    this.updateStatisticsFromCountryPolicies();
  };

  P.createPolicyMarkersAsync = async function (policyMap) {
    // placeholder for future policy map data
  };

} // end mixMarkers
