/**
 * globe-interaction.js — Hover tooltip + Quick Focus buttons
 * ──────────────────────────────────────────────────────────
 * PRD v2.0 Globe Upgrade: Phase G2
 *
 *   - 마커 위 Hover → 간단 툴팁 (도시명, PM2.5, AQI)
 *   - 퀵 포커스: Top Polluted / Most Improved / Policy Highlight
 *   - 카메라 애니메이션 개선
 */

import * as THREE from 'three';

export function mixInteraction(Cls) {
  const P = Cls.prototype;

  // ═══════════════════════════════════════════════════════════
  // 1. 호버 툴팁 시스템
  // ═══════════════════════════════════════════════════════════

  P.initHoverTooltip = function () {
    // 이미 있으면 재사용
    let tooltip = document.getElementById('globe-hover-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'globe-hover-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        background: rgba(10, 14, 26, 0.92);
        border: 1px solid rgba(37, 226, 244, 0.5);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        color: white;
        white-space: nowrap;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 4px 20px rgba(37, 226, 244, 0.2);
        transition: opacity 0.15s ease, transform 0.15s ease;
        opacity: 0;
        transform: translateY(4px);
        max-width: 220px;
      `;
      document.body.appendChild(tooltip);
    }
    this._hoverTooltip = tooltip;
    this._hoveredObj   = null;
    this._tooltipAnim  = null;
  };

  P._showTooltip = function (x, y, html) {
    const t = this._hoverTooltip;
    if (!t) return;
    t.innerHTML = html;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';

    // 화면 경계 보정
    const tw = 220, th = 80;
    const tx = (x + 16 + tw > window.innerWidth) ? x - tw - 16 : x + 16;
    const ty = (y + 16 + th > window.innerHeight) ? y - th - 8 : y + 16;
    t.style.left = tx + 'px';
    t.style.top  = ty + 'px';
  };

  P._hideTooltip = function () {
    const t = this._hoverTooltip;
    if (!t) return;
    t.style.opacity = '0';
    t.style.transform = 'translateY(4px)';
    this._hoveredObj = null;
  };

  P._pm25GradeStr = function (pm25) {
    if (pm25 == null) return '—';
    if (pm25 <= 12)  return '<span style="color:#00e400">● Good</span>';
    if (pm25 <= 35)  return '<span style="color:#ffff00">● Moderate</span>';
    if (pm25 <= 55)  return '<span style="color:#ff7e00">● Unhealthy(SG)</span>';
    if (pm25 <= 150) return '<span style="color:#ff5555">● Unhealthy</span>';
    return '<span style="color:#cc44cc">● Very Unhealthy</span>';
  };

  // ── 개선된 마우스무브 (툴팁 포함) ──────────────────────────
  P.onMouseMoveEnhanced = function (event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const cx = event.clientX, cy = event.clientY;
    let found = false;

    // Policy markers
    if (this.markerSystem?.markerGroups?.policies) {
      const hits = this.raycaster.intersectObjects(
        this.markerSystem.markerGroups.policies.children, true);
      if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj && !obj.userData?.country) obj = obj.parent;
        if (obj?.userData?.country) {
          const d = obj.userData;
          const pm25 = d.pm25 ?? d.currentPM25 ?? null;
          const html = `
            <div style="font-weight:700;color:#25e2f4;margin-bottom:4px;">
              ${d.flag || '🌍'} ${d.country}
            </div>
            ${pm25 != null ? `<div style="margin-bottom:2px;">PM2.5 <b>${pm25.toFixed(1)}</b> µg/m³</div>` : ''}
            ${this._pm25GradeStr(pm25)}
            <div style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.1);padding-top:4px;font-size:10px;color:rgba(255,255,255,0.5);">
              클릭하면 정책 상세 보기
            </div>`;
          this._showTooltip(cx, cy, html);
          document.body.style.cursor = 'pointer';
          found = true;
        }
      }
    }

    // PM2.5 markers
    if (!found && this.markerSystem?.markerGroups?.pm25) {
      const hits = this.raycaster.intersectObjects(
        this.markerSystem.markerGroups.pm25.children, true);
      if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj && !obj.userData?.city) obj = obj.parent;
        if (obj?.userData) {
          const d = obj.userData;
          const pm25 = d.pm25 ?? d.value ?? null;
          const html = `
            <div style="font-weight:700;color:#25e2f4;margin-bottom:4px;">
              📍 ${d.city || d.name || '—'}
            </div>
            ${d.country ? `<div style="color:rgba(255,255,255,0.5);font-size:10px;margin-bottom:3px;">${d.country}</div>` : ''}
            ${pm25 != null ? `<div style="margin-bottom:2px;">PM2.5 <b>${pm25.toFixed(1)}</b> µg/m³</div>` : ''}
            ${this._pm25GradeStr(pm25)}
            ${d.aqi != null ? `<div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:3px;">AQI: ${d.aqi}</div>` : ''}
            <div style="margin-top:6px;border-top:1px solid rgba(255,255,255,0.1);padding-top:4px;font-size:10px;color:rgba(255,255,255,0.5);">
              클릭하면 상세 보기
            </div>`;
          this._showTooltip(cx, cy, html);
          document.body.style.cursor = 'pointer';
          found = true;
        }
      }
    }

    if (!found) {
      this._hideTooltip();
      document.body.style.cursor = 'default';
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 2. Quick Focus 버튼
  // ═══════════════════════════════════════════════════════════

  P.setupQuickFocus = function () {
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn.bind(this));
    };

    bind('qf-top-polluted',    this.focusTopPolluted);
    bind('qf-most-improved',   this.focusMostImproved);
    bind('qf-policy-highlight',this.focusPolicyHighlight);
    bind('qf-my-location',     this.focusMyLocation);
  };

  // ── Top Polluted ────────────────────────────────────────────
  P.focusTopPolluted = function () {
    if (!this.pm25Data || this.pm25Data.size === 0) return;
    const sorted = [...this.pm25Data.entries()]
      .filter(([, d]) => d.pm25 != null)
      .sort(([, a], [, b]) => (b.pm25 || 0) - (a.pm25 || 0));

    if (sorted.length === 0) return;
    const [city, data] = sorted[0];
    this.animateCameraToLatLon(data.lat, data.lon, 2.0);

    // 정보 패널 표시
    if (window.globeUpdatePanel) {
      window.globeUpdatePanel({
        type: 'station',
        name: city,
        flag: '🏭',
        region: data.country || '',
        pm25: data.pm25,
        lat: data.lat,
        lon: data.lon,
      });
    }
    this._showQuickFocusList('polluted', sorted.slice(0, 5));
  };

  // ── Most Improved ───────────────────────────────────────────
  P.focusMostImproved = function () {
    // DID-lite 효과 기준: countryPolicies에서 did_effect 가장 낮은(개선) 국가
    const entries = Object.entries(this.countryPolicies || {})
      .filter(([, p]) => p.policyImpact?.reductionRate)
      .map(([country, p]) => {
        const rate = parseFloat(p.policyImpact.reductionRate) || 0;
        return { country, rate, policy: p };
      })
      .sort((a, b) => b.rate - a.rate);

    if (entries.length === 0) {
      this._showQuickFocusToast('데이터 없음. 정책 데이터를 먼저 로드하세요.');
      return;
    }

    const best = entries[0];
    const p = best.policy;
    const lat = p.coordinates?.lat;
    const lon = p.coordinates?.lon;
    if (lat != null && lon != null) {
      this.animateCameraToLatLon(lat, lon, 2.2);
    }

    this.showCountryPolicy(best.country);
    this._showQuickFocusList('improved', entries.slice(0, 5));
  };

  // ── Policy Highlight ────────────────────────────────────────
  P.focusPolicyHighlight = function () {
    // 최근 정책(mainPolicy.implementationDate 최신) 국가 포커스
    const entries = Object.entries(this.countryPolicies || {})
      .filter(([, p]) => p.mainPolicy?.implementationDate)
      .map(([country, p]) => {
        const yr = parseInt(p.mainPolicy.implementationDate) || 0;
        return { country, yr, policy: p };
      })
      .sort((a, b) => b.yr - a.yr);

    if (entries.length === 0) {
      this._showQuickFocusToast('정책 데이터가 없습니다.');
      return;
    }

    // 상위 3개 순환
    const idx = (this._policyHighlightIdx || 0) % Math.min(3, entries.length);
    this._policyHighlightIdx = idx + 1;

    const { country, policy: p } = entries[idx];
    const lat = p.coordinates?.lat;
    const lon = p.coordinates?.lon;
    if (lat != null && lon != null) {
      this.animateCameraToLatLon(lat, lon, 2.1);
    }
    this.showCountryPolicy(country);
    this._showQuickFocusList('policy', entries.slice(0, 5));
  };

  // ── My Location ─────────────────────────────────────────────
  P.focusMyLocation = function () {
    if (this.userLocation) {
      this.animateCameraToLatLon(this.userLocation.lat, this.userLocation.lon, 1.9);
      return;
    }
    if (!('geolocation' in navigator)) {
      this._showQuickFocusToast('위치 서비스를 사용할 수 없습니다.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        this.animateCameraToLatLon(this.userLocation.lat, this.userLocation.lon, 1.9);
      },
      () => { this._showQuickFocusToast('위치 접근이 거부되었습니다.'); }
    );
  };

  // ── 카메라 위도/경도 이동 ──────────────────────────────────
  P.animateCameraToLatLon = function (lat, lon, distance = 2.2) {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -distance * Math.sin(phi) * Math.cos(theta);
    const y =  distance * Math.cos(phi);
    const z =  distance * Math.sin(phi) * Math.sin(theta);
    this.animateCameraTo({ x, y, z });
  };

  // ── 퀵 포커스 리스트 팝업 ──────────────────────────────────
  P._showQuickFocusList = function (type, items) {
    let el = document.getElementById('quick-focus-popup');
    if (!el) {
      el = document.createElement('div');
      el.id = 'quick-focus-popup';
      el.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9000;
        background: rgba(10,14,26,0.95);
        border: 1px solid rgba(37,226,244,0.4);
        border-radius: 12px;
        padding: 12px 16px;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: 0 8px 32px rgba(37,226,244,0.15);
        min-width: 260px;
        max-width: 320px;
        animation: fadeInUp 0.2s ease;
      `;
      document.body.appendChild(el);
    }

    const titles = {
      polluted: '🏭 Most Polluted Cities',
      improved: '📉 Most Improved Countries',
      policy:   '📋 Recent Policy Highlights',
    };

    const rows = items.map((item, i) => {
      if (type === 'polluted') {
        const [city, data] = item;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="color:rgba(255,255,255,0.8);font-size:11px;">${i+1}. ${city}</span>
          <span style="color:#ff5555;font-weight:700;font-size:11px;">${data.pm25?.toFixed(1)} µg</span>
        </div>`;
      }
      if (type === 'improved') {
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="color:rgba(255,255,255,0.8);font-size:11px;">${i+1}. ${item.country}</span>
          <span style="color:#00ff88;font-weight:700;font-size:11px;">-${item.rate}%</span>
        </div>`;
      }
      if (type === 'policy') {
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="color:rgba(255,255,255,0.8);font-size:11px;">${i+1}. ${item.country}</span>
          <span style="color:#25e2f4;font-weight:700;font-size:11px;">${item.yr}</span>
        </div>`;
      }
      return '';
    }).join('');

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:700;color:#25e2f4;">${titles[type] || ''}</span>
        <button onclick="document.getElementById('quick-focus-popup').remove()"
          style="background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:16px;line-height:1;padding:0;">✕</button>
      </div>
      ${rows}
    `;

    // 5초 후 자동 닫기
    clearTimeout(this._qfPopupTimer);
    this._qfPopupTimer = setTimeout(() => { el?.remove(); }, 5000);
  };

  P._showQuickFocusToast = function (msg) {
    let t = document.getElementById('qf-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'qf-toast';
      t.style.cssText = `
        position:fixed; bottom:72px; left:50%; transform:translateX(-50%);
        z-index:9999; background:rgba(10,14,26,0.92);
        border:1px solid rgba(255,255,255,0.2); border-radius:8px;
        padding:8px 16px; color:white; font-size:12px;
        backdrop-filter:blur(12px);
      `;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t?.remove(), 3000);
  };

  // ═══════════════════════════════════════════════════════════
  // 3. 이벤트 바인딩 (기존 setupEventListeners 보완)
  // ═══════════════════════════════════════════════════════════

  P.setupInteractionEnhancements = function () {
    this.initHoverTooltip();
    this.setupQuickFocus();

    // 기존 mousemove를 개선 버전으로 교체
    // canvas의 이전 mousemove listener는 globe-ui.js onMouseMove
    // → 여기서 추가 등록 (중복 OK — 각자 다른 역할)
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMoveEnhanced(e));

    // 캔버스 밖으로 나가면 툴팁 숨기기
    this.canvas.addEventListener('mouseleave', () => this._hideTooltip());

    console.log('✅ Interaction enhancements loaded');
  };

} // end mixInteraction
