/**
 * Enhanced Marker System v3.0 - 국가별 정책 마커 + 빠른 로딩
 * 
 * 🎯 v3.0 개선 사항:
 * - 국가별 좌표 데이터 내장
 * - 정책 마커: 미니멀 핀 스타일 (클릭 가능)
 * - PM2.5 마커: 작은 점 (빠른 생성)
 * - 클릭 시 정책 변화 정보 표시
 */

import * as THREE from 'three';
import { getPM25Grade } from '../utils/config.js';

// 국가별 수도/주요 도시 좌표
export const COUNTRY_COORDINATES = {
  // East Asia
  'South Korea': { lat: 37.5665, lon: 126.9780, capital: 'Seoul' },
  'Korea': { lat: 37.5665, lon: 126.9780, capital: 'Seoul' },
  'China': { lat: 39.9042, lon: 116.4074, capital: 'Beijing' },
  'Japan': { lat: 35.6762, lon: 139.6503, capital: 'Tokyo' },
  'Taiwan': { lat: 25.0330, lon: 121.5654, capital: 'Taipei' },
  'Hong Kong': { lat: 22.3193, lon: 114.1694, capital: 'Hong Kong' },
  'Mongolia': { lat: 47.8864, lon: 106.9057, capital: 'Ulaanbaatar' },
  
  // South Asia
  'India': { lat: 28.6139, lon: 77.2090, capital: 'New Delhi' },
  'Bangladesh': { lat: 23.8103, lon: 90.4125, capital: 'Dhaka' },
  'Pakistan': { lat: 33.6844, lon: 73.0479, capital: 'Islamabad' },
  'Sri Lanka': { lat: 6.9271, lon: 79.8612, capital: 'Colombo' },
  'Nepal': { lat: 27.7172, lon: 85.3240, capital: 'Kathmandu' },
  
  // Southeast Asia
  'Thailand': { lat: 13.7563, lon: 100.5018, capital: 'Bangkok' },
  'Vietnam': { lat: 21.0285, lon: 105.8542, capital: 'Hanoi' },
  'Indonesia': { lat: -6.2088, lon: 106.8456, capital: 'Jakarta' },
  'Singapore': { lat: 1.3521, lon: 103.8198, capital: 'Singapore' },
  'Malaysia': { lat: 3.1390, lon: 101.6869, capital: 'Kuala Lumpur' },
  'Philippines': { lat: 14.5995, lon: 120.9842, capital: 'Manila' },
  'Myanmar': { lat: 19.7633, lon: 96.0785, capital: 'Naypyidaw' },
  'Cambodia': { lat: 11.5564, lon: 104.9282, capital: 'Phnom Penh' },
  
  // North America
  'United States': { lat: 38.9072, lon: -77.0369, capital: 'Washington DC' },
  'USA': { lat: 38.9072, lon: -77.0369, capital: 'Washington DC' },
  'Canada': { lat: 45.4215, lon: -75.6972, capital: 'Ottawa' },
  'Mexico': { lat: 19.4326, lon: -99.1332, capital: 'Mexico City' },
  
  // South America
  'Brazil': { lat: -15.8267, lon: -47.9218, capital: 'Brasília' },
  'Argentina': { lat: -34.6037, lon: -58.3816, capital: 'Buenos Aires' },
  'Chile': { lat: -33.4489, lon: -70.6693, capital: 'Santiago' },
  'Colombia': { lat: 4.7110, lon: -74.0721, capital: 'Bogotá' },
  'Peru': { lat: -12.0464, lon: -77.0428, capital: 'Lima' },
  'Venezuela': { lat: 10.4806, lon: -66.9036, capital: 'Caracas' },
  
  // Europe - Western
  'United Kingdom': { lat: 51.5074, lon: -0.1278, capital: 'London' },
  'UK': { lat: 51.5074, lon: -0.1278, capital: 'London' },
  'France': { lat: 48.8566, lon: 2.3522, capital: 'Paris' },
  'Germany': { lat: 52.5200, lon: 13.4050, capital: 'Berlin' },
  'Netherlands': { lat: 52.3676, lon: 4.9041, capital: 'Amsterdam' },
  'Belgium': { lat: 50.8503, lon: 4.3517, capital: 'Brussels' },
  'Switzerland': { lat: 46.9480, lon: 7.4474, capital: 'Bern' },
  'Austria': { lat: 48.2082, lon: 16.3738, capital: 'Vienna' },
  
  // Europe - Southern
  'Italy': { lat: 41.9028, lon: 12.4964, capital: 'Rome' },
  'Spain': { lat: 40.4168, lon: -3.7038, capital: 'Madrid' },
  'Portugal': { lat: 38.7223, lon: -9.1393, capital: 'Lisbon' },
  'Greece': { lat: 37.9838, lon: 23.7275, capital: 'Athens' },
  
  // Europe - Eastern
  'Poland': { lat: 52.2297, lon: 21.0122, capital: 'Warsaw' },
  'Czech Republic': { lat: 50.0755, lon: 14.4378, capital: 'Prague' },
  'Czechia': { lat: 50.0755, lon: 14.4378, capital: 'Prague' },
  'Hungary': { lat: 47.4979, lon: 19.0402, capital: 'Budapest' },
  'Romania': { lat: 44.4268, lon: 26.1025, capital: 'Bucharest' },
  'Bulgaria': { lat: 42.6977, lon: 23.3219, capital: 'Sofia' },
  'Ukraine': { lat: 50.4501, lon: 30.5234, capital: 'Kyiv' },
  'Russia': { lat: 55.7558, lon: 37.6173, capital: 'Moscow' },
  
  // Europe - Northern
  'Sweden': { lat: 59.3293, lon: 18.0686, capital: 'Stockholm' },
  'Norway': { lat: 59.9139, lon: 10.7522, capital: 'Oslo' },
  'Denmark': { lat: 55.6761, lon: 12.5683, capital: 'Copenhagen' },
  'Finland': { lat: 60.1699, lon: 24.9384, capital: 'Helsinki' },
  
  // Middle East
  'Turkey': { lat: 39.9334, lon: 32.8597, capital: 'Ankara' },
  'Iran': { lat: 35.6892, lon: 51.3890, capital: 'Tehran' },
  'Saudi Arabia': { lat: 24.7136, lon: 46.6753, capital: 'Riyadh' },
  'UAE': { lat: 24.4539, lon: 54.3773, capital: 'Abu Dhabi' },
  'Israel': { lat: 31.7683, lon: 35.2137, capital: 'Jerusalem' },
  'Egypt': { lat: 30.0444, lon: 31.2357, capital: 'Cairo' },
  
  // Africa
  'South Africa': { lat: -25.7479, lon: 28.2293, capital: 'Pretoria' },
  'Nigeria': { lat: 9.0765, lon: 7.3986, capital: 'Abuja' },
  'Kenya': { lat: -1.2921, lon: 36.8219, capital: 'Nairobi' },
  'Morocco': { lat: 33.9716, lon: -6.8498, capital: 'Rabat' },
  'Ethiopia': { lat: 8.9806, lon: 38.7578, capital: 'Addis Ababa' },
  
  // Oceania
  'Australia': { lat: -35.2809, lon: 149.1300, capital: 'Canberra' },
  'New Zealand': { lat: -41.2866, lon: 174.7756, capital: 'Wellington' }
};

export class EnhancedMarkerSystem {
  constructor(scene, earth) {
    this.scene = scene;
    this.earth = earth;
    
    if (!scene || !earth) {
      throw new Error('EnhancedMarkerSystem: scene and earth are required');
    }
    
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
    
    console.log('✅ Enhanced Marker System v3.0 initialized');
  }

  /**
   * 국가 좌표 가져오기
   */
  static getCountryCoordinates(country) {
    return COUNTRY_COORDINATES[country] || null;
  }

  /**
   * PM2.5 마커 생성 - 빠른 버전
   * lat/lon 또는 latitude/longitude 모두 지원
   */
  createPM25Marker(data) {
    const lat = data.latitude ?? data.lat;
    const lon = data.longitude ?? data.lon;
    const { id, pm25, country } = data;
    
    if (!lat || !lon) return null;
    
    const markerRadius = 0.006;
    const color = this.getPM25Color(pm25);
    
    // 단순한 구체만 생성 (성능 최적화)
    const geometry = new THREE.SphereGeometry(markerRadius, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    sphere.userData = {
      type: 'pm25',
      id: id || data.city,
      city: data.city || data.name || id,
      name: data.name || data.city || id,
      pm25,
      aqi: data.aqi,
      country,
      source: data.source,
      lat, lon,
      latitude: lat,
      longitude: lon
    };
    
    const position = this.latLonToPosition(lat, lon);
    sphere.position.copy(position);
    
    this.markerGroups.pm25.add(sphere);
    
    this.pm25Markers.set(id, {
      mesh: sphere,
      material,
      data,
      time: Math.random() * Math.PI * 2
    });
    
    return sphere;
  }

  /**
   * 정책 마커 생성 - 국가별 (countryPolicies 기반)
   */
  createPolicyMarker(data) {
    const { country, effectivenessScore = 0.5 } = data;
    
    // 좌표 가져오기 (data에서 우선, 없으면 COUNTRY_COORDINATES에서)
    let lat = data.latitude;
    let lon = data.longitude;
    
    if (!lat || !lon) {
      const coords = COUNTRY_COORDINATES[country];
      if (coords) {
        lat = coords.lat;
        lon = coords.lon;
      } else {
        console.warn(`No coordinates for country: ${country}`);
        return null;
      }
    }
    
    const color = this.getPolicyColor(effectivenessScore);
    const markerGroup = new THREE.Group();
    
    // 핀 헤드 (다이아몬드)
    const pinSize = 0.022;
    const pinGeometry = new THREE.OctahedronGeometry(pinSize, 0);
    const pinMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.95
    });
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.rotation.x = Math.PI / 4;
    pin.position.y = pinSize * 1.5;
    
    // 스템 (막대)
    const stemGeometry = new THREE.CylinderGeometry(0.003, 0.003, pinSize * 2, 6);
    const stemMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.7
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = pinSize * 0.5;
    
    // 베이스 링 (애니메이션용)
    const ringGeometry = new THREE.RingGeometry(pinSize * 0.6, pinSize * 1.0, 20);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    
    // 글로우
    const glowGeometry = new THREE.SphereGeometry(pinSize * 1.3, 12, 12);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.12
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = pinSize * 1.5;
    
    markerGroup.add(stem);
    markerGroup.add(pin);
    markerGroup.add(ring);
    markerGroup.add(glow);
    
    // 클릭용 userData (모든 정책 데이터 포함)
    markerGroup.userData = {
      type: 'policy',
      country,
      effectivenessScore,
      latitude: lat,
      longitude: lon,
      ...data
    };
    
    const position = this.latLonToPosition(lat, lon);
    markerGroup.position.copy(position);
    
    // 지구 표면에 수직 정렬
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
      data: { ...data, latitude: lat, longitude: lon },
      time: Math.random() * Math.PI * 2
    });
    
    return markerGroup;
  }

  /**
   * PM2.5 마커 애니메이션
   */
  updatePM25Marker(id, deltaTime = 0.016) {
    const marker = this.pm25Markers.get(id);
    if (!marker) return;
    
    marker.time += deltaTime;
    const pulse = 1.0 + Math.sin(marker.time * 2) * 0.1;
    marker.mesh.scale.setScalar(pulse);
  }

  /**
   * 정책 마커 애니메이션
   */
  updatePolicyMarker(country, deltaTime = 0.016) {
    const marker = this.policyMarkers.get(country);
    if (!marker) return;
    
    marker.time += deltaTime;
    
    // 핀 회전
    marker.pin.rotation.y += deltaTime * 0.4;
    
    // 링 펄싱
    const ringScale = 1.0 + Math.sin(marker.time * 2.5) * 0.25;
    marker.ring.scale.setScalar(ringScale);
    marker.ringMaterial.opacity = 0.25 + Math.sin(marker.time * 2.5) * 0.1;
    
    // 글로우
    const glowScale = 1.0 + Math.sin(marker.time * 1.8) * 0.15;
    marker.glow.scale.setScalar(glowScale);
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
    const radius = 1.02;
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  getPM25Color(pm25) {
    const g = getPM25Grade(pm25);
    return new THREE.Color(g.hex);
  }

  getPolicyColor(score) {
    const s = Math.max(0, Math.min(1, score));
    if (s >= 0.7) return new THREE.Color(0x00ff88);
    if (s >= 0.5) return new THREE.Color(0x44dd66);
    if (s >= 0.3) return new THREE.Color(0xffcc00);
    return new THREE.Color(0xff6644);
  }

  removePM25Marker(id) {
    const marker = this.pm25Markers.get(id);
    if (marker) {
      this.markerGroups.pm25.remove(marker.mesh);
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
    this.clearPM25Markers();
    this.clearPolicyMarkers();
  }

  clearPM25Markers() {
    this.pm25Markers.clear();
    while (this.markerGroups.pm25.children.length > 0) {
      this.markerGroups.pm25.remove(this.markerGroups.pm25.children[0]);
    }
  }

  clearPolicyMarkers() {
    this.policyMarkers.clear();
    while (this.markerGroups.policies.children.length > 0) {
      this.markerGroups.policies.remove(this.markerGroups.policies.children[0]);
    }
  }

  highlightPolicyMarker(country, highlight = true) {
    const marker = this.policyMarkers.get(country);
    if (!marker) return;
    
    if (highlight) {
      marker.pin.scale.setScalar(1.5);
      marker.pinMaterial.opacity = 1.0;
      marker.glowMaterial.opacity = 0.35;
    } else {
      marker.pin.scale.setScalar(1.0);
      marker.pinMaterial.opacity = 0.95;
      marker.glowMaterial.opacity = 0.12;
    }
  }

  getPolicyMarkerData(country) {
    const marker = this.policyMarkers.get(country);
    return marker ? marker.data : null;
  }

  getAllPolicyCountries() {
    return Array.from(this.policyMarkers.keys());
  }
}

export default EnhancedMarkerSystem;
