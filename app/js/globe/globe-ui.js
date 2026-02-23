/**
 * globe-ui.js — Event listeners, toggles, search, filters, panels, modals
 * ────────────────────────────────────────────────────────────────────────
 */

import { esc, safeUrl } from '../utils/security.js';
import { nameToCode, countryToFlag } from '../utils/geo.js';

// module-level helpers (backward compat)
function _esc(str) { return esc(str); }
function _safeUrl(url) { return safeUrl(url); }
function _nameToCode(name) { return nameToCode(name); }

export function mixUI(Cls) {
  const P = Cls.prototype;

  // ── Loading indicators ─────────────────────────────────────
  P.updateLoadingProgress = function (percent, status) {
    const progressBar = document.getElementById('loading-progress');
    const statusText = document.getElementById('loading-status');
    if (progressBar) progressBar.style.width = Math.min(percent, 95) + '%';
    if (statusText) statusText.textContent = status;
  };

  P.hideLoadingIndicator = function () {
    const el = document.getElementById('loading-indicator');
    if (el) {
      this.updateLoadingProgress(100, 'Ready');
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => { el.style.display = 'none'; }, 300);
    }
  };

  // ── Toggle Switches ────────────────────────────────────────
  P.setupToggleSwitches = function () {
    const setupToggle = (switchId, checkboxId, callback) => {
      const switchEl = document.getElementById(switchId);
      const checkbox = document.getElementById(checkboxId);
      if (switchEl && checkbox) {
        switchEl.addEventListener('click', () => {
          checkbox.checked = !checkbox.checked;
          switchEl.classList.toggle('checked', checkbox.checked);
          callback(checkbox.checked);
        });
      }
    };

    setupToggle('toggle-borders-switch', 'toggle-borders', (checked) => {
      this.showBorders = checked;
      if (this.countryBorders) this.countryBorders.visible = checked;
    });
    setupToggle('toggle-pm25-switch', 'toggle-pm25', (checked) => {
      this.showPM25 = checked;
      if (this.markerSystem) this.markerSystem.markerGroups.pm25.visible = checked;
    });
    setupToggle('toggle-policies-switch', 'toggle-policies', (checked) => {
      if (this.markerSystem) this.markerSystem.markerGroups.policies.visible = checked;
    });
    setupToggle('toggle-particles-switch', 'toggle-particles', (checked) => {
      this.particlesEnabled = checked;
      if (this.particles) this.particles.visible = checked;
    });
    setupToggle('toggle-predictions-switch', 'toggle-predictions', (checked) => {
      if (this.predictionLayer) this.predictionLayer.toggle(checked);
    });
  };

  // ── Event Listeners ────────────────────────────────────────
  P.setupEventListeners = function () {
    window.addEventListener('resize', () => this.onResize());

    document.getElementById('zoom-in')?.addEventListener('click', () => {
      this.camera.position.multiplyScalar(0.85);
      this.camera.position.clampLength(this.controls.minDistance, this.controls.maxDistance);
    });
    document.getElementById('zoom-out')?.addEventListener('click', () => {
      this.camera.position.multiplyScalar(1.15);
      this.camera.position.clampLength(this.controls.minDistance, this.controls.maxDistance);
    });
    document.getElementById('reset-view')?.addEventListener('click', () => {
      this.camera.position.set(0, 0, 2.5);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    });

    // Country search
    const searchInput = document.getElementById('country-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        if (term.length >= 2) this.searchCountry(term);
      });
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const term = e.target.value.trim();
          if (term) this.searchCountry(term);
        }
      });
    }

    // Filters
    document.getElementById('filter-region')?.addEventListener('click', () => this.showRegionFilter());
    document.getElementById('filter-policy')?.addEventListener('click', () => this.showPolicyFilter());

    // Refresh
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const icon = document.getElementById('refresh-icon');
        const updateText = document.getElementById('last-update');
        if (icon) icon.style.animation = 'spin 1s linear infinite';
        if (updateText) updateText.textContent = 'Updating...';

        if (this.airQualityAPI) {
          this.airQualityAPI.clearCache();
          await this.loadRealTimeAirQuality();
        }

        if (icon) icon.style.animation = '';
        if (updateText) updateText.textContent = `Updated ${new Date().toLocaleTimeString()}`;
      });
    }

    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
  };

  // ── Click Handler ──────────────────────────────────────────
  P.onClick = function (event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Policy markers first
    if (this.markerSystem && this.markerSystem.markerGroups.policies) {
      const policyIntersects = this.raycaster.intersectObjects(
        this.markerSystem.markerGroups.policies.children, true
      );
      if (policyIntersects.length > 0) {
        let target = policyIntersects[0].object;
        while (target && !target.userData?.country) target = target.parent;
        if (target?.userData?.country) {
          const countryName = target.userData.country;
          this.showCountryPolicy(countryName);
          this.rotateToCountry(countryName);
          return;
        }
      }
    }

    // PM2.5 markers
    if (this.markerSystem && this.markerSystem.markerGroups.pm25) {
      const pm25Intersects = this.raycaster.intersectObjects(
        this.markerSystem.markerGroups.pm25.children, true
      );
      if (pm25Intersects.length > 0) {
        let target = pm25Intersects[0].object;
        while (target && !target.userData?.city) target = target.parent;
        if (target?.userData) {
          this.showStationInfoPanel(target.userData);
          return;
        }
      }
    }

    // Legacy PM2.5 markers
    if (this.pm25Markers && this.showPM25) {
      const intersects = this.raycaster.intersectObjects(this.pm25Markers.children, true);
      if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        if (data?.city) { this.showStationInfoPanel(data); return; }
      }
    }
  };

  // ── Mouse Move ─────────────────────────────────────────────
  P.onMouseMove = function (event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (this.markerSystem?.markerGroups?.policies) {
      const hits = this.raycaster.intersectObjects(this.markerSystem.markerGroups.policies.children, true);
      if (hits.length > 0) { document.body.style.cursor = 'pointer'; return; }
    }
    if (this.markerSystem?.markerGroups?.pm25) {
      const hits = this.raycaster.intersectObjects(this.markerSystem.markerGroups.pm25.children, true);
      if (hits.length > 0) { document.body.style.cursor = 'pointer'; return; }
    }
    if (this.pm25Markers && this.showPM25) {
      const hits = this.raycaster.intersectObjects(this.pm25Markers.children, true);
      if (hits.length > 0) { document.body.style.cursor = 'pointer'; return; }
    }
    document.body.style.cursor = 'default';
  };

  P.onResize = function () {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  // ── Country Policy Display ─────────────────────────────────
  P.showCountryPolicy = function (countryName) {
    const p = this.countryPolicies[countryName];
    if (!p) { console.log('No policy data for', countryName); return; }

    const countryCode = p.countryCode || _nameToCode(countryName);
    const otherPolicies = p.additionalPolicies || p.otherPolicies || [];

    window.globeUpdatePanel({
      type: 'country', name: countryName,
      flag: p.flag || '🌍', region: p.region || '',
      lat: p.coordinates?.lat ?? null, lon: p.coordinates?.lon ?? null,
      pm25: p.currentPM25 ?? 0, countryCode,
      policy: p.mainPolicy ? {
        title: p.mainPolicy.name, description: p.mainPolicy.description,
        date: p.mainPolicy.implementationDate, rating: p.mainPolicy.effectivenessRating
      } : null,
      impact: p.policyImpact ? {
        rate: p.policyImpact.reductionRate, period: p.policyImpact.timeframe,
        measures: p.policyImpact.keyMeasures || []
      } : null,
      trends: p.pm25Trends || [],
      otherPolicies: otherPolicies.map(op => ({ year: op.year, title: op.name || op.title || op }))
    });
  };

  P.showCountryPolicyTrends = function (countryName, policyData) {
    console.log(`📊 Showing PM2.5 trends for ${countryName}`);
    const card = document.getElementById('policy-card');
    card.style.display = 'block';
    setTimeout(() => card.classList.add('show'), 10);

    document.getElementById('policy-flag').textContent = policyData.flag;
    document.getElementById('policy-country').textContent = countryName;
    document.getElementById('policy-region').textContent = policyData.region;
    document.getElementById('policy-name').textContent = policyData.mainPolicy.name;
    document.getElementById('policy-desc').textContent = policyData.mainPolicy.description;
    document.getElementById('policy-date').textContent = `Implemented: ${policyData.mainPolicy.implementationDate}`;

    const aqiElement = document.getElementById('policy-aqi');
    aqiElement.textContent = policyData.currentAQI;
    aqiElement.className = `text-2xl font-bold ${this.getAQIClass(policyData.currentAQI)}`;
    document.getElementById('policy-pm25').textContent = `${policyData.currentPM25} µg/m³`;

    const impactSection = document.getElementById('policy-impact-section');
    const timelineSection = document.getElementById('policy-timeline-section');

    if (policyData.pm25Trends?.length > 0) {
      impactSection.style.display = 'block';
      const firstYear = policyData.pm25Trends[0];
      const lastYear = policyData.pm25Trends[policyData.pm25Trends.length - 1];
      document.getElementById('impact-before').textContent = `${firstYear.value} µg/m³`;
      document.getElementById('impact-after').textContent = `${lastYear.value} µg/m³`;
      const percentChange = (((lastYear.value - firstYear.value) / firstYear.value) * 100).toFixed(1);
      const changeEl = document.getElementById('impact-change');
      changeEl.textContent = `${percentChange > 0 ? '+' : ''}${percentChange}%`;
      changeEl.className = `text-lg font-bold ${percentChange < 0 ? 'text-green-400' : 'text-red-400'}`;

      const statusInfo = policyData.policyImpact?.status || 'Ongoing';
      const reductionRate = policyData.policyImpact?.reductionRate || 'N/A';
      document.getElementById('impact-significance').textContent = `Status: ${statusInfo} | Reduction: ${reductionRate}`;

      timelineSection.style.display = 'block';
      this.renderPM25TrendsChart(policyData.pm25Trends, countryName, policyData.policyImpact);
    } else {
      impactSection.style.display = 'none';
      timelineSection.style.display = 'none';
    }

    // News
    const newsContainer = document.getElementById('policy-news');
    newsContainer.innerHTML = '';
    if (policyData.news?.length > 0) {
      policyData.news.forEach(news => {
        const item = document.createElement('div');
        item.className = 'news-item bg-black/20 rounded-lg p-3 cursor-pointer hover:bg-black/30 transition-colors';
        item.innerHTML = `
          <h6 class="text-sm font-medium text-white mb-1">${_esc(news.title)}</h6>
          <div class="flex items-center justify-between text-xs text-white/60">
            <span>${_esc(news.source)}</span><span>${_esc(news.date)}</span>
          </div>`;
        item.addEventListener('click', () => {
          const safe = _safeUrl(news.url);
          if (safe) window.open(safe, '_blank', 'noopener,noreferrer');
        });
        newsContainer.appendChild(item);
      });
    } else {
      newsContainer.innerHTML = '<p class="text-sm text-white/60 text-center py-2">No recent news available</p>';
    }
  };

  // ── Station Info Panel ─────────────────────────────────────
  P.showStationInfoPanel = function (stationData) {
    console.log('📍 Station info:', stationData);
    // Delegate to globeUpdatePanel if available
    if (window.globeUpdatePanel) {
      window.globeUpdatePanel({ type: 'station', ...stationData });
    }
  };

  // ── Search & Navigation ────────────────────────────────────
  P.searchCountry = function (searchTerm) {
    const term = searchTerm.toLowerCase();
    const matched = Object.keys(this.countryPolicies).filter(c => c.toLowerCase().includes(term));
    if (matched.length > 0) {
      this.showCountryPolicy(matched[0]);
      this.rotateToCountry(matched[0]);
    }
  };

  P.rotateToCountry = function (countryName) {
    for (const [city, data] of this.pm25Data.entries()) {
      if (data.country === countryName) {
        const { lat, lon } = data;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const distance = 2.5;
        const x = -distance * Math.sin(phi) * Math.cos(theta);
        const z = distance * Math.sin(phi) * Math.sin(theta);
        const y = distance * Math.cos(phi);
        this.animateCameraTo({ x, y, z });
        return;
      }
    }
  };

  P.animateCameraTo = function (targetPosition) {
    const start = this.camera.position.clone();
    const end = targetPosition;
    const duration = 1500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      this.camera.position.lerpVectors(start, end, eased);
      this.controls.update();
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  };

  // ── Filters ────────────────────────────────────────────────
  P.showRegionFilter = function () {
    const regions = [...new Set(Object.values(this.countryPolicies).map(p => p.region).filter(Boolean))];
    this.showDropdownMenu('filter-region', regions, (r) => this.filterByRegion(r));
  };

  P.showPolicyFilter = function () {
    const types = [...new Set(Object.values(this.countryPolicies).map(p => p.policyType).filter(Boolean))];
    this.showDropdownMenu('filter-policy', types, (t) => this.filterByPolicyType(t));
  };

  P.showDropdownMenu = function (buttonId, options, onSelect) {
    const existing = document.getElementById('dropdown-menu');
    if (existing) existing.remove();

    const button = document.getElementById(buttonId);
    if (!button) return;
    const rect = button.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.id = 'dropdown-menu';
    dropdown.className = 'absolute z-50 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl py-2 min-w-[200px]';
    dropdown.style.cssText = `position:fixed;top:${rect.bottom + 4}px;left:${rect.left}px;`;

    options.forEach(option => {
      const item = document.createElement('button');
      item.className = 'w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors';
      item.textContent = option;
      item.addEventListener('click', () => { onSelect(option); dropdown.remove(); });
      dropdown.appendChild(item);
    });

    document.body.appendChild(dropdown);
    setTimeout(() => {
      document.addEventListener('click', function handler(e) {
        if (!dropdown.contains(e.target)) { dropdown.remove(); document.removeEventListener('click', handler); }
      });
    }, 10);
  };

  P.filterByRegion = function (region) {
    const countries = Object.entries(this.countryPolicies)
      .filter(([_, p]) => p.region === region).map(([c]) => c);
    if (countries.length > 0) this.showCountryPolicy(countries[0]);
  };

  P.filterByPolicyType = function (policyType) {
    const countries = Object.entries(this.countryPolicies)
      .filter(([_, p]) => p.policyType === policyType).map(([c]) => c);
    if (countries.length > 0) this.showCountryPolicy(countries[0]);
  };

  P.clearFilters = function () {
    const card = document.getElementById('policy-card');
    if (card) card.style.display = 'none';
  };

  // ── AQI Helpers ────────────────────────────────────────────
  P.getAQILabel = function (aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  P.getAQIClass = function (aqi) {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-500';
    return 'text-red-900';
  };

  P.getAQIStatus = function (value) {
    if (value <= 50) return 'Good';
    if (value <= 100) return 'Moderate';
    if (value <= 150) return 'Unhealthy for Sensitive Groups';
    if (value <= 200) return 'Unhealthy';
    if (value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  P.getPM25ColorString = function (pm25) {
    if (pm25 <= 12) return '#00e400';
    if (pm25 <= 35.4) return '#ffff00';
    if (pm25 <= 55.4) return '#ff7e00';
    if (pm25 <= 150.4) return '#ff0000';
    if (pm25 <= 250.4) return '#8f3f97';
    return '#7e0023';
  };

  P.getPM25Label = function (pm25) {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35.4) return 'Moderate';
    if (pm25 <= 55.4) return 'Unhealthy (SG)';
    if (pm25 <= 150.4) return 'Unhealthy';
    if (pm25 <= 250.4) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // ── Policy UI Update ───────────────────────────────────────
  P.updatePolicyUI = function () {
    try {
      if (this.globalStats) {
        const ce = document.getElementById('stat-countries');
        const pe = document.getElementById('stat-policies');
        const re = document.getElementById('stat-regions');
        if (ce) ce.textContent = this.globalStats.countries;
        if (pe) pe.textContent = this.globalStats.policies;
        if (re) re.textContent = this.globalStats.regions;
      } else {
        this.updateStatisticsFromCountryPolicies();
      }
    } catch (error) {
      console.error('❌ Error updating policy UI:', error);
    }
  };

  // ── Data Subscriptions ─────────────────────────────────────
  P.setupDataSubscriptions = function () {
    this.globalDataService.subscribe('stations', (stations) => {
      console.log(`📍 Stations updated: ${stations.size}`);
    });
    this.globalDataService.subscribe('policies', () => {
      this.updatePolicyUI();
    });
    this.globalDataService.subscribe('selectedCountry', (country) => {
      this.displayCountryPolicy(country);
    });
  };

  P.displayCountryPolicy = function (policy) {
    if (!policy) return;
    const policyCard = document.getElementById('policy-card');
    if (!policyCard) return;

    window.currentPolicy = policy;
    const countryName = policy.country || policy.name;
    document.getElementById('policy-flag').textContent = countryToFlag(countryName) || '🌍';
    document.getElementById('policy-country').textContent = countryName;
    document.getElementById('policy-region').textContent = policy.region || '';
    document.getElementById('policy-name').textContent = policy.title || 'Policy Title';
    document.getElementById('policy-desc').textContent = policy.description || '';

    const date = policy.implementationYear
      ? new Date(policy.implementationYear, 0).toLocaleDateString()
      : (policy.target_year ? `Target: ${policy.target_year}` : 'Date not available');
    document.getElementById('policy-date').textContent = date;

    policyCard.style.display = 'block';
    policyCard.classList.add('show');
  };

} // end mixUI
