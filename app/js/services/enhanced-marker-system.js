/**
 * Enhanced Marker System v2.0 - 미니멀 & 클릭 가능한 마커
 * 
 * 🎯 개선 사항:
 * - 정책 마커: 작고 깔끔한 핀 스타일
 * - PM2.5 마커: 통일된 작은 점
 * - 클릭 이벤트 지원 (userData에 정보 저장)
 */

import * as THREE from 'three';

export class EnhancedMarkerSystem {
  constructor(scene, earth) {
    this.scene = scene;
    this.earth = earth;
    
    if (!scene || !earth) {
      throw new Error('EnhancedMarkerSystem: scene and earth are required');
    }
    
    // Marker storage
    this.pm25Markers = new Map();
    this.policyMarkers = new Map();
    this.markerGroups = {
      pm25: new THREE.Group(),
      policies: new THREE.Group(),
      user: null
    };
    
    this.markerGroups.pm25.name = 'PM25-Markers';
    this.markerGroups.policies.name = 'Policy-Markers';
    
    this.earth.add(this.markerGroups.pm25);
    this.earth.add(this.markerGroups.policies);
    
    console.log('✅ Enhanced Marker System v2.0 initialized');
  }

  /**
   * PM2.5 마커 생성 - 작은 원형 점
   */
  createPM25Marker(data) {
    const { id, latitude, longitude, pm25, country } = data;
    
    const markerRadius = 0.008;
    const color = this.getPM25Color(pm25);
    
    // 메인 점
    const geometry = new THREE.SphereGeometry(markerRadius, 12, 12);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.85
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    // 클릭용 userData
    sphere.userData = {
      type: 'pm25',
      id,
      pm25,
      country,
      latitude,
      longitude
    };
    
    // 글로우 효과
    const glowGeometry = new THREE.SphereGeometry(markerRadius * 1.8, 12, 12);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.25
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    
    const markerGroup = new THREE.Group();
    markerGroup.add(sphere);
    markerGroup.add(glow);
    markerGroup.userData = sphere.userData;
    
    const position = this.latLonToPosition(latitude, longitude);
    markerGroup.position.copy(position);
    
    this.markerGroups.pm25.add(markerGroup);
    
    this.pm25Markers.set(id, {
      group: markerGroup,
      sphere,
      glow,
      material,
      glowMaterial,
      data,
      time: Math.random() * Math.PI * 2
    });
    
    return markerGroup;
  }

  /**
   * 정책 마커 생성 - 미니멀 핀 스타일
   * 크기를 대폭 줄이고 심플하게
   */
  createPolicyMarker(data) {
    const { country, effectivenessScore = 0.5, latitude, longitude } = data;
    
    const color = this.getPolicyColor(effectivenessScore);
    const markerGroup = new THREE.Group();
    
    // ================================
    // 1️⃣ 핀 헤드 (작은 다이아몬드)
    // ================================
    const pinSize = 0.018;
    const pinGeometry = new THREE.OctahedronGeometry(pinSize, 0);
    const pinMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.95
    });
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.rotation.x = Math.PI / 4;
    pin.position.y = pinSize * 1.2;
    
    // ================================
    // 2️⃣ 핀 스템 (얇은 선)
    // ================================
    const stemGeometry = new THREE.CylinderGeometry(0.002, 0.002, pinSize * 1.5, 6);
    const stemMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = pinSize * 0.4;
    
    // ================================
    // 3️⃣ 베이스 링 (펄싱 애니메이션용)
    // ================================
    const ringGeometry = new THREE.RingGeometry(pinSize * 0.8, pinSize * 1.2, 24);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    
    // ================================
    // 4️⃣ 외곽 글로우
    // ================================
    const glowGeometry = new THREE.SphereGeometry(pinSize * 1.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = pinSize * 1.2;
    
    markerGroup.add(stem);
    markerGroup.add(pin);
    markerGroup.add(ring);
    markerGroup.add(glow);
    
    // 클릭용 userData
    markerGroup.userData = {
      type: 'policy',
      country,
      effectivenessScore,
      latitude,
      longitude,
      ...data
    };
    
    // 위치 설정
    const lat = latitude || 37.5;
    const lon = longitude || 126.9;
    const position = this.latLonToPosition(lat, lon);
    markerGroup.position.copy(position);
    
    // 지구 표면에 수직으로 정렬
    markerGroup.lookAt(0, 0, 0);
    markerGroup.rotateX(Math.PI);
    
    this.markerGroups.policies.add(markerGroup);
    
    this.policyMarkers.set(country, {
      group: markerGroup,
      pin,
      stem,
      ring,
      glow,
      pinMaterial,
      ringMaterial,
      glowMaterial,
      data,
      time: Math.random() * Math.PI * 2
    });
    
    return markerGroup;
  }

  /**
   * PM2.5 마커 애니메이션 업데이트
   */
  updatePM25Marker(id, deltaTime = 0.016) {
    const marker = this.pm25Markers.get(id);
    if (!marker) return;
    
    marker.time += deltaTime;
    
    // 부드러운 펄싱
    const pulse = 1.0 + Math.sin(marker.time * 2) * 0.15;
    marker.glow.scale.setScalar(pulse);
    marker.glowMaterial.opacity = 0.2 + Math.sin(marker.time * 2) * 0.1;
  }

  /**
   * 정책 마커 애니메이션 업데이트
   */
  updatePolicyMarker(country, deltaTime = 0.016) {
    const marker = this.policyMarkers.get(country);
    if (!marker) return;
    
    marker.time += deltaTime;
    
    // 핀 살짝 회전
    marker.pin.rotation.y += deltaTime * 0.5;
    
    // 링 펄싱
    const ringScale = 1.0 + Math.sin(marker.time * 2.5) * 0.3;
    marker.ring.scale.setScalar(ringScale);
    marker.ringMaterial.opacity = 0.3 + Math.sin(marker.time * 2.5) * 0.15;
    
    // 글로우 호흡
    const glowScale = 1.0 + Math.sin(marker.time * 1.8) * 0.2;
    marker.glow.scale.setScalar(glowScale);
    marker.glowMaterial.opacity = 0.12 + Math.sin(marker.time * 1.8) * 0.08;
  }

  /**
   * 모든 마커 업데이트
   */
  updateAll(deltaTime = 0.016) {
    for (const [id] of this.pm25Markers) {
      this.updatePM25Marker(id, deltaTime);
    }
    for (const [country] of this.policyMarkers) {
      this.updatePolicyMarker(country, deltaTime);
    }
  }

  /**
   * 위도/경도 → 3D 좌표
   */
  latLonToPosition(latitude, longitude) {
    const radius = 1.01;
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  /**
   * PM2.5 색상
   */
  getPM25Color(pm25) {
    if (pm25 <= 12) return new THREE.Color(0x00e400);
    if (pm25 <= 35.5) return new THREE.Color(0xffff00);
    if (pm25 <= 55.5) return new THREE.Color(0xff7e00);
    if (pm25 <= 150.5) return new THREE.Color(0xff0000);
    return new THREE.Color(0x8f3f97);
  }

  /**
   * 정책 효과도 색상
   */
  getPolicyColor(score) {
    const s = Math.max(0, Math.min(1, score));
    if (s >= 0.7) return new THREE.Color(0x00ff88);
    if (s >= 0.5) return new THREE.Color(0x44dd66);
    if (s >= 0.3) return new THREE.Color(0xffcc00);
    return new THREE.Color(0xff6644);
  }

  /**
   * 마커 제거
   */
  removePM25Marker(id) {
    const marker = this.pm25Markers.get(id);
    if (marker) {
      this.markerGroups.pm25.remove(marker.group);
      this.pm25Markers.delete(id);
    }
  }

  removePolicyMarker(country) {
    const marker = this.policyMarkers.get(country);
    if (marker) {
      this.markerGroups.policies.remove(marker.group);
      this.policyMarkers.delete(country);
    }
  }

  clearAll() {
    this.pm25Markers.clear();
    this.policyMarkers.clear();
    while (this.markerGroups.pm25.children.length > 0) {
      this.markerGroups.pm25.remove(this.markerGroups.pm25.children[0]);
    }
    while (this.markerGroups.policies.children.length > 0) {
      this.markerGroups.policies.remove(this.markerGroups.policies.children[0]);
    }
  }

  /**
   * 마커 하이라이트 (호버/선택 시)
   */
  highlightPolicyMarker(country, highlight = true) {
    const marker = this.policyMarkers.get(country);
    if (!marker) return;
    
    if (highlight) {
      marker.pin.scale.setScalar(1.5);
      marker.pinMaterial.opacity = 1.0;
      marker.glowMaterial.opacity = 0.4;
    } else {
      marker.pin.scale.setScalar(1.0);
      marker.pinMaterial.opacity = 0.95;
      marker.glowMaterial.opacity = 0.15;
    }
  }

  /**
   * 정책 마커 데이터 가져오기
   */
  getPolicyMarkerData(country) {
    const marker = this.policyMarkers.get(country);
    return marker ? marker.data : null;
  }

  /**
   * 모든 정책 마커 국가 목록
   */
  getAllPolicyCountries() {
    return Array.from(this.policyMarkers.keys());
  }
}

export default EnhancedMarkerSystem;
