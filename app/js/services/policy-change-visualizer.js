/**
 * Policy Change Visualizer - 정책별 미세먼지 변화도 시각화 서비스
 * 
 * 핵심 기능:
 * 1. Before/After PM2.5 변화 시각적 표현
 * 2. WAQI 실시간 데이터와 정책 효과 비교
 * 3. 타임라인 기반 변화 추이 표시
 * 
 * @version 2.0.0 - 최적화 버전
 */

import * as THREE from 'three';
import { policyImpactAnalyzer } from './policy-impact-analyzer.js';
import { waqiDataService } from './waqi-data-service.js';

export class PolicyChangeVisualizer {
  constructor(scene, earth) {
    this.scene = scene;
    this.earth = earth;
    
    // 시각화 그룹
    this.visualGroup = new THREE.Group();
    this.visualGroup.name = 'PolicyChangeVisualizations';
    this.earth.add(this.visualGroup);
    
    // 데이터 저장
    this.policyChanges = new Map();
    this.currentWAQIData = null;
    
    // 색상 팔레트
    this.colors = {
      improvement: 0x00ff88,    // 개선됨 - 밝은 녹색
      moderate: 0xffdd00,       // 보통 - 노랑
      worsening: 0xff4444,      // 악화됨 - 빨강
      neutral: 0x888888         // 변화없음 - 회색
    };
    
    console.log('📊 Policy Change Visualizer initialized');
  }

  /**
   * 전체 정책 변화 데이터 로드 및 시각화
   */
  async loadAndVisualize() {
    console.log('🔄 Loading policy change data...');
    
    try {
      // 1. WAQI 실시간 데이터 로드
      this.currentWAQIData = await waqiDataService.loadWAQIData();
      console.log(`📡 Loaded ${this.currentWAQIData.size} WAQI stations`);
      
      // 2. 정책 인덱스 로드
      const indexResponse = await fetch(this.getBasePath() + '/policy-impact/index.json');
      const index = await indexResponse.json();
      
      // 3. 각 국가별 정책 데이터 로드 및 시각화
      let processedCount = 0;
      for (const countryInfo of index.countries) {
        try {
          const policyData = await this.loadCountryPolicy(countryInfo);
          if (policyData) {
            this.createPolicyChangeVisualization(countryInfo, policyData);
            processedCount++;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to load ${countryInfo.country}:`, error.message);
        }
      }
      
      console.log(`✅ Visualized ${processedCount} countries with policy changes`);
      return processedCount;
      
    } catch (error) {
      console.error('❌ Policy visualization failed:', error);
      return 0;
    }
  }

  /**
   * 국가별 정책 데이터 로드
   */
  async loadCountryPolicy(countryInfo) {
    const response = await fetch(this.getBasePath() + `/policy-impact/${countryInfo.dataFile}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data;
  }

  /**
   * 정책 변화 시각화 생성 (Before/After 표시)
   */
  createPolicyChangeVisualization(countryInfo, policyData) {
    const { country, coordinates, flag } = countryInfo;
    const { lat, lon } = coordinates;
    
    // 정책 영향 분석
    const mainPolicy = policyData.policies?.[0];
    if (!mainPolicy?.impact) return;
    
    const impact = mainPolicy.impact;
    const beforePM25 = impact.beforePeriod?.meanPM25 || 0;
    const afterPM25 = impact.afterPeriod?.meanPM25 || 0;
    const percentChange = impact.analysis?.percentChange || 0;
    
    // WAQI 현재 데이터와 비교
    const currentData = this.getCurrentDataForCountry(country);
    
    // 시각화 그룹 생성
    const visualization = new THREE.Group();
    visualization.name = `policy-change-${country}`;
    
    // 1. Before/After 비교 막대
    const comparisonBar = this.createComparisonBar(beforePM25, afterPM25, percentChange);
    visualization.add(comparisonBar);
    
    // 2. 변화 화살표
    const changeArrow = this.createChangeArrow(percentChange);
    changeArrow.position.z = 0.05;
    visualization.add(changeArrow);
    
    // 3. 효과도 링
    const effectRing = this.createEffectivenessRing(percentChange);
    visualization.add(effectRing);
    
    // 4. 국가 라벨
    const label = this.createCountryLabel(country, flag, percentChange, currentData?.pm25);
    label.position.z = 0.1;
    visualization.add(label);
    
    // 위치 설정
    const position = this.latLonToPosition(lat, lon);
    visualization.position.copy(position);
    visualization.lookAt(this.earth.position.clone().add(position));
    
    // 그룹에 추가
    this.visualGroup.add(visualization);
    
    // 저장
    this.policyChanges.set(country, {
      visualization,
      data: {
        beforePM25,
        afterPM25,
        percentChange,
        currentPM25: currentData?.pm25,
        policy: mainPolicy.name
      },
      effectRing,
      time: 0
    });
    
    return visualization;
  }

  /**
   * Before/After 비교 막대 생성
   */
  createComparisonBar(beforePM25, afterPM25, percentChange) {
    const group = new THREE.Group();
    
    // 스케일 정규화
    const maxPM25 = Math.max(beforePM25, afterPM25, 100);
    const beforeHeight = (beforePM25 / maxPM25) * 0.08;
    const afterHeight = (afterPM25 / maxPM25) * 0.08;
    
    // Before 막대 (왼쪽) - 빨간색 계열
    const beforeGeometry = new THREE.BoxGeometry(0.015, beforeHeight, 0.01);
    const beforeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6666,
      metalness: 0.5,
      roughness: 0.4,
      emissive: 0xff4444,
      emissiveIntensity: 0.2
    });
    const beforeBar = new THREE.Mesh(beforeGeometry, beforeMaterial);
    beforeBar.position.x = -0.015;
    beforeBar.position.y = beforeHeight / 2;
    group.add(beforeBar);
    
    // After 막대 (오른쪽) - 초록색/노랑색 (개선/악화에 따라)
    const afterGeometry = new THREE.BoxGeometry(0.015, afterHeight, 0.01);
    const afterColor = percentChange < 0 ? 0x44ff88 : 0xffaa44;
    const afterMaterial = new THREE.MeshStandardMaterial({
      color: afterColor,
      metalness: 0.5,
      roughness: 0.4,
      emissive: afterColor,
      emissiveIntensity: 0.3
    });
    const afterBar = new THREE.Mesh(afterGeometry, afterMaterial);
    afterBar.position.x = 0.015;
    afterBar.position.y = afterHeight / 2;
    group.add(afterBar);
    
    // 베이스 플레이트
    const baseGeometry = new THREE.BoxGeometry(0.05, 0.005, 0.015);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3,
      roughness: 0.7
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    group.add(base);
    
    return group;
  }

  /**
   * 변화 방향 화살표 생성
   */
  createChangeArrow(percentChange) {
    const group = new THREE.Group();
    
    const isImprovement = percentChange < 0;
    const arrowColor = isImprovement ? 0x00ff88 : (percentChange > 10 ? 0xff4444 : 0xffaa00);
    
    // 화살표 바디
    const bodyGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.03, 8);
    const arrowMaterial = new THREE.MeshStandardMaterial({
      color: arrowColor,
      metalness: 0.6,
      roughness: 0.3,
      emissive: arrowColor,
      emissiveIntensity: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, arrowMaterial);
    body.rotation.z = isImprovement ? 0 : Math.PI; // 아래로 또는 위로
    group.add(body);
    
    // 화살표 헤드
    const headGeometry = new THREE.ConeGeometry(0.008, 0.015, 8);
    const head = new THREE.Mesh(headGeometry, arrowMaterial);
    head.position.y = isImprovement ? 0.02 : -0.02;
    head.rotation.z = isImprovement ? 0 : Math.PI;
    group.add(head);
    
    return group;
  }

  /**
   * 효과도 링 생성 (펄싱 애니메이션용)
   */
  createEffectivenessRing(percentChange) {
    const effectivenessScore = this.calculateEffectivenessScore(percentChange);
    const ringColor = this.getEffectivenessColor(effectivenessScore);
    
    const ringGeometry = new THREE.TorusGeometry(0.06, 0.008, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: ringColor,
      metalness: 0.7,
      roughness: 0.3,
      emissive: ringColor,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.8
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    
    return ring;
  }

  /**
   * 국가 라벨 생성
   */
  createCountryLabel(country, flag, percentChange, currentPM25) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 변화율에 따른 테두리 색상
    const borderColor = percentChange < -15 ? '#00ff88' : 
                       percentChange < 0 ? '#88ff88' :
                       percentChange < 15 ? '#ffaa00' : '#ff4444';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // 국가명 + 국기
    ctx.fillStyle = '#ffffff';
    ctx.font = 'Bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${flag} ${country}`, canvas.width / 2, 35);
    
    // 변화율
    ctx.fillStyle = borderColor;
    ctx.font = 'Bold 28px Arial';
    const changeText = percentChange > 0 ? `+${percentChange.toFixed(1)}%` : `${percentChange.toFixed(1)}%`;
    ctx.fillText(changeText, canvas.width / 2, 75);
    
    // 현재 PM2.5
    if (currentPM25) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '16px Arial';
      ctx.fillText(`현재: ${currentPM25.toFixed(0)} μg/m³`, canvas.width / 2, 105);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.25, 0.125, 1);
    
    return sprite;
  }


  /**
   * 모든 시각화 업데이트 (애니메이션)
   */
  updateAll(deltaTime = 0.016) {
    for (const [country, data] of this.policyChanges) {
      data.time += deltaTime;
      
      // 링 펄싱 애니메이션
      if (data.effectRing) {
        const scale = 1 + Math.sin(data.time * 2) * 0.15;
        data.effectRing.scale.set(scale, scale, 1);
        
        // 투명도 변화
        if (data.effectRing.material) {
          data.effectRing.material.opacity = 0.6 + Math.sin(data.time * 3) * 0.2;
        }
      }
    }
  }

  /**
   * 현재 WAQI 데이터에서 국가별 평균 추출
   */
  getCurrentDataForCountry(country) {
    if (!this.currentWAQIData) return null;
    
    const countryStations = [];
    this.currentWAQIData.forEach((station) => {
      if (this.isStationInCountry(station, country)) {
        countryStations.push(station);
      }
    });
    
    if (countryStations.length === 0) return null;
    
    const avgPM25 = countryStations.reduce((sum, s) => sum + (s.pm25 || s.aqi || 0), 0) / countryStations.length;
    
    return {
      pm25: avgPM25,
      stationCount: countryStations.length
    };
  }

  /**
   * 스테이션이 국가에 속하는지 확인
   */
  isStationInCountry(station, country) {
    const stationCountry = (station.country || '').toLowerCase();
    const targetCountry = country.toLowerCase();
    
    if (stationCountry.includes(targetCountry) || targetCountry.includes(stationCountry)) {
      return true;
    }
    
    // 국가 별칭
    const aliases = {
      'south korea': ['korea', 'kr', 'republic of korea', '한국', '서울'],
      'united states': ['usa', 'us', 'united states of america'],
      'united kingdom': ['uk', 'britain', 'england'],
      'china': ['cn', 'prc', '中国']
    };
    
    const countryAliases = aliases[targetCountry] || [];
    return countryAliases.some(alias => stationCountry.includes(alias));
  }

  /**
   * 효과도 점수 계산
   */
  calculateEffectivenessScore(percentChange) {
    if (percentChange <= -30) return 1.0;
    if (percentChange <= -20) return 0.85;
    if (percentChange <= -15) return 0.7;
    if (percentChange <= -10) return 0.6;
    if (percentChange <= -5) return 0.5;
    if (percentChange < 0) return 0.4;
    if (percentChange < 10) return 0.3;
    return 0.2;
  }

  /**
   * 효과도 색상 반환
   */
  getEffectivenessColor(score) {
    if (score >= 0.8) return new THREE.Color(0x00ff88);
    if (score >= 0.6) return new THREE.Color(0x44ff44);
    if (score >= 0.4) return new THREE.Color(0xaaff00);
    if (score >= 0.3) return new THREE.Color(0xffaa00);
    return new THREE.Color(0xff4444);
  }

  /**
   * 위도/경도 → 3D 좌표 변환
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

  /**
   * 기본 경로 반환
   */
  getBasePath() {
    const hostname = window.location.hostname;
    if (hostname.includes('github.io')) {
      return '/Finedust_proj/app/data';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/app/data';
    }
    return 'data';
  }

  /**
   * 특정 국가의 정책 변화 데이터 반환
   */
  getPolicyChangeData(country) {
    return this.policyChanges.get(country)?.data || null;
  }

  /**
   * 모든 정책 변화 데이터 반환
   */
  getAllPolicyChanges() {
    const result = [];
    for (const [country, data] of this.policyChanges) {
      result.push({
        country,
        ...data.data
      });
    }
    return result.sort((a, b) => a.percentChange - b.percentChange);
  }

  /**
   * 가장 효과적인 정책 반환
   */
  getMostEffectivePolicies(limit = 10) {
    return this.getAllPolicyChanges()
      .filter(p => p.percentChange < 0)
      .slice(0, limit);
  }

  /**
   * 개선이 필요한 국가 반환
   */
  getNeedsImprovementPolicies(limit = 10) {
    return this.getAllPolicyChanges()
      .filter(p => p.percentChange > 0)
      .reverse()
      .slice(0, limit);
  }

  /**
   * 시각화 제거
   */
  clear() {
    this.policyChanges.clear();
    while (this.visualGroup.children.length > 0) {
      this.visualGroup.remove(this.visualGroup.children[0]);
    }
  }
}

// 싱글톤 인스턴스
export const policyChangeVisualizer = new PolicyChangeVisualizer(null, null);
export default PolicyChangeVisualizer;
