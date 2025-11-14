/**
 * Globe Marker System - 지구본에 고정된 마커 관리
 * 마커들이 지구표면에 완벽하게 고정됨
 * 지구본 회전 시 마커들도 함께 회전 (상대위치 유지)
 */

import * as THREE from 'three';

export class GlobeMarkerSystem {
  constructor(globe, scene) {
    this.globe = globe; // 지구 Mesh 객체 (회전하는 지구)
    this.scene = scene;
    
    // 마커 그룹들
    this.markerGroups = {
      pm25: null,        // PM2.5 측정소 마커
      policies: null,    // 정책 마커
      users: null        // 사용자 위치
    };
    
    // 마커 데이터 저장
    this.markerData = new Map(); // id -> { mesh, position, data }
    
    // 업데이트 상태
    this.isUpdating = false;
  }

  /**
   * 초기화
   */
  init() {
    // 마커 그룹 생성
    this.markerGroups.pm25 = new THREE.Group();
    this.markerGroups.policies = new THREE.Group();
    this.markerGroups.users = new THREE.Group();
    
    // 지구에 직접 추가 (중요!)
    // 이렇게 하면 지구가 회전할 때 마커도 함께 회전함
    this.globe.add(this.markerGroups.pm25);
    this.globe.add(this.markerGroups.policies);
    this.globe.add(this.markerGroups.users);
    
    console.log('✅ Globe Marker System initialized');
  }

  /**
   * 위도/경도를 3D 위치로 변환 (지구 표면)
   * @param {number} lat - 위도 (-90 ~ 90)
   * @param {number} lon - 경도 (-180 ~ 180)
   * @param {number} radius - 지구 반지름 (기본값 1.0)
   * @returns {THREE.Vector3} 3D 위치
   */
  latLonToPosition(lat, lon, radius = 1.05) {
    // 위도/경도를 라디안으로 변환
    const phi = (90 - lat) * (Math.PI / 180);   // 극각 (pole angle)
    const theta = (lon + 180) * (Math.PI / 180); // 방위각 (azimuth angle)
    
    // 구면좌표 -> 직교좌표
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  }

  /**
   * PM2.5 마커 추가
   * @param {string} id - 고유 ID
   * @param {number} lat - 위도
   * @param {number} lon - 경도
   * @param {number} value - PM2.5 값
   * @param {Object} data - 추가 데이터
   */
  addPM25Marker(id, lat, lon, value, data = {}) {
    const position = this.latLonToPosition(lat, lon, 1.05);
    const color = this.getAQIColor(value);
    
    // 메인 마커 (구)
    const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      emissive: color,
      emissiveIntensity: 0.3,
      metalness: 0.3,
      roughness: 0.4
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(position);
    marker.userData = { id, type: 'pm25', value, data };
    
    // 링 (주변 효과)
    const ringGeometry = new THREE.RingGeometry(0.025, 0.035, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.lookAt(position.clone().normalize().multiplyScalar(2));
    ring.userData = { id, type: 'pm25-ring' };
    
    // 그룹에 추가
    this.markerGroups.pm25.add(marker);
    this.markerGroups.pm25.add(ring);
    
    // 마커 데이터 저장
    this.markerData.set(id, {
      mesh: marker,
      ring: ring,
      position: position,
      lat: lat,
      lon: lon,
      value: value,
      data: data,
      type: 'pm25'
    });
    
    return { marker, ring };
  }

  /**
   * 정책 마커 추가 (더 큰 마커)
   * @param {string} countryCode - 국가 코드
   * @param {number} lat - 위도
   * @param {number} lon - 경도
   * @param {string} status - 정책 상태 ('Exemplary', 'Effective', etc)
   * @param {Object} data - 정책 데이터
   */
  addPolicyMarker(countryCode, lat, lon, status = 'Effective', data = {}) {
    const position = this.latLonToPosition(lat, lon, 1.08);
    const color = this.getPolicyStatusColor(status);
    
    // 메인 마커 (더 큼)
    const markerGeometry = new THREE.SphereGeometry(0.03, 32, 32);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: 0.95,
      emissive: color,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.2
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(position);
    marker.userData = { id: countryCode, type: 'policy', status, data };
    
    // 펄싱 링 효과
    const ringGeometry = new THREE.TorusGeometry(0.05, 0.008, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.userData = { id: countryCode, type: 'policy-ring' };
    
    // 그룹에 추가
    this.markerGroups.policies.add(marker);
    this.markerGroups.policies.add(ring);
    
    // 마커 데이터 저장
    this.markerData.set(`policy-${countryCode}`, {
      mesh: marker,
      ring: ring,
      position: position,
      lat: lat,
      lon: lon,
      status: status,
      data: data,
      type: 'policy'
    });
    
    return { marker, ring };
  }

  /**
   * 사용자 위치 마커 추가
   */
  addUserLocationMarker(lat, lon) {
    const position = this.latLonToPosition(lat, lon, 1.12);
    
    // 사용자 마커 (별 모양)
    const starGeometry = new THREE.IcosahedronGeometry(0.025, 1);
    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0xffeb3b,
      emissive: 0xffeb3b,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.copy(position);
    star.userData = { type: 'user-location' };
    
    // 펄싱 애니메이션용 링
    const pulseGeometry = new THREE.SphereGeometry(0.04, 32, 32);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xffeb3b,
      transparent: true,
      opacity: 0.3,
      wireframe: false
    });
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulse.position.copy(position);
    pulse.userData = { type: 'user-pulse' };
    pulse.scale.set(1, 1, 1);
    
    this.markerGroups.users.add(star);
    this.markerGroups.users.add(pulse);
    
    this.markerData.set('user-location', {
      mesh: star,
      pulse: pulse,
      position: position,
      lat: lat,
      lon: lon,
      type: 'user'
    });
    
    return { star, pulse };
  }

  /**
   * 모든 PM2.5 마커 제거
   */
  clearPM25Markers() {
    this.markerGroups.pm25.children.forEach(child => {
      child.geometry?.dispose();
      child.material?.dispose();
    });
    this.markerGroups.pm25.clear();
    
    // 데이터맵에서 pm25 마커 제거
    for (let [key, value] of this.markerData) {
      if (value.type === 'pm25') {
        this.markerData.delete(key);
      }
    }
  }

  /**
   * 모든 정책 마커 제거
   */
  clearPolicyMarkers() {
    this.markerGroups.policies.children.forEach(child => {
      child.geometry?.dispose();
      child.material?.dispose();
    });
    this.markerGroups.policies.clear();
    
    for (let [key, value] of this.markerData) {
      if (value.type === 'policy') {
        this.markerData.delete(key);
      }
    }
  }

  /**
   * 마커 가시성 제어
   */
  setMarkerGroupVisibility(groupName, visible) {
    if (this.markerGroups[groupName]) {
      this.markerGroups[groupName].visible = visible;
    }
  }

  /**
   * PM2.5 값에 따른 색상 반환
   */
  getAQIColor(value) {
    if (value <= 50) return new THREE.Color(0x00e400);   // Green
    if (value <= 100) return new THREE.Color(0xffff00);  // Yellow
    if (value <= 150) return new THREE.Color(0xff7e00);  // Orange
    if (value <= 200) return new THREE.Color(0xff0000);  // Red
    if (value <= 300) return new THREE.Color(0x8f3f97);  // Purple
    return new THREE.Color(0x7e1946);                     // Maroon
  }

  /**
   * 정책 상태에 따른 색상
   */
  getPolicyStatusColor(status) {
    const colors = {
      'Exemplary': 0x00ff88,      // Bright green
      'Highly Effective': 0x00dd66,
      'Effective': 0x44cc88,
      'Partial Progress': 0xffaa00,
      'Limited Progress': 0xff6600,
      'default': 0xffaa00
    };
    return new THREE.Color(colors[status] || colors.default);
  }

  /**
   * 마커 애니메이션 업데이트 (매 프레임 호출)
   * 펄싱 효과, 회전 효과 등을 적용
   */
  update(deltaTime) {
    // 펄싱 애니메이션 (사용자 마커)
    this.markerData.forEach((markerData, id) => {
      if (markerData.type === 'user' && markerData.pulse) {
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
        markerData.pulse.scale.set(scale, scale, scale);
      }
      
      // 회전 애니메이션 (정책 마커)
      if (markerData.type === 'policy' && markerData.ring) {
        markerData.ring.rotation.z += 0.01;
      }
    });
  }

  /**
   * 마커 업데이트 (값 변경)
   */
  updateMarker(id, newValue) {
    const markerData = this.markerData.get(id);
    if (!markerData) return;
    
    if (markerData.type === 'pm25') {
      const newColor = this.getAQIColor(newValue);
      markerData.mesh.material.color.copy(newColor);
      markerData.mesh.material.emissive.copy(newColor);
      if (markerData.ring) {
        markerData.ring.material.color.copy(newColor);
      }
      markerData.value = newValue;
    }
  }

  /**
   * 마커 선택 해제 모든 상태 초기화
   */
  deselectAll() {
    this.markerData.forEach(markerData => {
      if (markerData.mesh) {
        markerData.mesh.material.emissiveIntensity = 
          markerData.type === 'pm25' ? 0.3 : 0.4;
      }
    });
  }

  /**
   * 마커 선택
   */
  selectMarker(id) {
    this.deselectAll();
    const markerData = this.markerData.get(id);
    if (markerData && markerData.mesh) {
      markerData.mesh.material.emissiveIntensity = 0.8;
    }
  }
}
