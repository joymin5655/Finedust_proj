/**
 * dataService.js — 통합 데이터 서비스 (리팩토링)
 * ────────────────────────────────────────────────
 * PRD v1.5 §3 기반: 단일 진입점으로 모든 데이터 소스 관리
 *
 * ⚠️  일반 <script> 태그로 로드 (ES module 아님)
 *     → window.DataService 로 접근
 */

(function () {
  'use strict';

  // ── 중앙 설정에서 가져옴 (utils/config.js → window.AirLensConfig) ──
  // config.js가 먼저 로드되어야 함. 아닐 경우 fallback 사용.
  function _getConfig() { return window.AirLensConfig || {}; }

  var CACHE_TTL = (_getConfig().CACHE_TTL) || {
    stations:   5 * 60 * 1000,
    policies:   10 * 60 * 1000,
    prediction: 60 * 60 * 1000,
  };

  function getDataBasePath() {
    if (_getConfig().getBasePath) return _getConfig().getBasePath();
    // Fallback (config.js 미로드 시)
    if (typeof window !== 'undefined') {
      if (window.location.hostname.includes('github.io')) {
        return '/Finedust_proj/app/data';
      }
      var path = window.location.pathname;
      var appIdx = path.indexOf('/app/');
      if (appIdx !== -1) {
        return path.substring(0, appIdx) + '/app/data';
      }
      return window.location.origin + '/data';
    }
    return '/data';
  }

  // ── DataService 클래스 ──────────────────────────────────────
  function DataService() {
    this._cache = {};
    this._subscribers = {};
    this._basePath = getDataBasePath();
  }

  // Cache
  DataService.prototype._isFresh = function (key, ttl) {
    var entry = this._cache[key];
    return entry && (Date.now() - entry.ts < ttl);
  };
  DataService.prototype._set = function (key, data) {
    this._cache[key] = { data: data, ts: Date.now() };
  };
  DataService.prototype._get = function (key) {
    var entry = this._cache[key];
    return entry ? entry.data : null;
  };
  DataService.prototype.clearCache = function () { this._cache = {}; };

  // Pub/Sub
  DataService.prototype.subscribe = function (event, fn) {
    if (!this._subscribers[event]) this._subscribers[event] = [];
    this._subscribers[event].push(fn);
    return function () {
      var arr = this._subscribers[event];
      if (arr) {
        var idx = arr.indexOf(fn);
        if (idx !== -1) arr.splice(idx, 1);
      }
    }.bind(this);
  };
  DataService.prototype._notify = function (event, data) {
    var subs = this._subscribers[event] || [];
    subs.forEach(function (fn) {
      try { fn(data, event); } catch (e) { console.error('[DataService] subscriber error (' + event + '):', e); }
    });
  };

  // Fetch helper
  DataService.prototype._fetch = function (path) {
    var url = this._basePath + '/' + path;
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + url);
      return res.json();
    });
  };

  // ── 1. Stations (WAQI) — raw JSON 반환 ─────────────────────
  DataService.prototype.loadStations = function () {
    var self = this;
    var KEY = 'stations';
    if (this._isFresh(KEY, CACHE_TTL.stations)) return Promise.resolve(this._get(KEY));

    return this._fetch('waqi/latest.json').then(function (raw) {
      self._set(KEY, raw);
      self._notify('stations', raw);
      var count = (raw.cities || []).length;
      console.log('✅ [DataService] Loaded ' + count + ' stations');
      return raw;
    }).catch(function (e) {
      console.warn('[DataService] stations load failed:', e.message);
      return self._get(KEY) || { cities: [], count: 0 };
    });
  };

  DataService.prototype.getStations = function () {
    return this._get('stations') || { cities: [], count: 0 };
  };

  // ── 2. Global Stations ────────────────────────────────────
  DataService.prototype.loadGlobalStations = function () {
    var self = this;
    var KEY = 'global-stations';
    if (this._isFresh(KEY, CACHE_TTL.stations)) return Promise.resolve(this._get(KEY));

    return this._fetch('waqi/global-stations.json').then(function (data) {
      self._set(KEY, data);
      return data;
    }).catch(function (e) {
      console.warn('[DataService] global-stations failed:', e.message);
      return self._get(KEY) || { stations: [], count: 0 };
    });
  };

  // ── 3. OpenAQ Yearly Trends ────────────────────────────────
  DataService.prototype.loadYearlyTrends = function () {
    var self = this;
    var KEY = 'openaq-years';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return Promise.resolve(this._get(KEY));
    return this._fetch('openaq/pm25_years.json').then(function (d) {
      self._set(KEY, d); return d;
    }).catch(function (e) {
      console.warn('[DataService] openaq years failed:', e.message);
      return self._get(KEY);
    });
  };

  DataService.prototype.getCityYearlyTrend = function (city, country) {
    return this.loadYearlyTrends().then(function (data) {
      if (!data) return [];
      var entry = (data.data || []).find(function (d) {
        return d.city.toLowerCase() === city.toLowerCase() &&
          (!country || d.country === country);
      });
      return entry ? (entry.data || []) : [];
    });
  };

  // ── 4. OpenAQ Daily Trends ─────────────────────────────────
  DataService.prototype.loadDailyTrends = function () {
    var self = this;
    var KEY = 'openaq-days';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return Promise.resolve(this._get(KEY));
    return this._fetch('openaq/pm25_days.json').then(function (d) {
      self._set(KEY, d); return d;
    }).catch(function (e) {
      console.warn('[DataService] openaq days failed:', e.message);
      return self._get(KEY);
    });
  };

  // ── 5. Earthdata AOD ───────────────────────────────────────
  DataService.prototype.loadAodSamples = function () {
    var self = this;
    var KEY = 'aod-samples';
    if (this._isFresh(KEY, CACHE_TTL.prediction)) return Promise.resolve(this._get(KEY));
    return this._fetch('earthdata/aod_samples.json').then(function (d) {
      self._set(KEY, d); return d;
    }).catch(function (e) {
      console.warn('[DataService] aod failed:', e.message);
      return self._get(KEY);
    });
  };

  DataService.prototype.loadAodTrend = function () {
    var self = this;
    var KEY = 'aod-trend';
    if (this._isFresh(KEY, CACHE_TTL.prediction)) return Promise.resolve(this._get(KEY));
    return this._fetch('earthdata/aod_trend.json').then(function (d) {
      self._set(KEY, d); return d;
    }).catch(function () { return self._get(KEY); });
  };

  // ── 6. Country Policies ────────────────────────────────────
  DataService.prototype.loadCountryPolicies = function () {
    var self = this;
    var KEY = 'country-policies';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return Promise.resolve(this._get(KEY));
    return this._fetch('country-policies.json').then(function (d) {
      self._set(KEY, d);
      self._notify('policies', d);
      console.log('✅ [DataService] Loaded ' + Object.keys(d).length + ' country policies');
      return d;
    }).catch(function (e) {
      console.warn('[DataService] country-policies failed:', e.message);
      return self._get(KEY) || {};
    });
  };

  // ── 7. Policy Impact (per-country JSON) ────────────────────
  DataService.prototype.loadPolicyIndex = function () {
    var self = this;
    var KEY = 'policy-index';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return Promise.resolve(this._get(KEY));
    return this._fetch('policy-impact/index.json').then(function (d) {
      self._set(KEY, d); return d;
    }).catch(function () { return self._get(KEY); });
  };

  DataService.prototype.loadCountryImpact = function (dataFile) {
    return this._fetch('policy-impact/' + dataFile).catch(function (e) {
      console.warn('[DataService] impact ' + dataFile + ' failed:', e.message);
      return null;
    });
  };

  // ── 하위 호환: policy.js에서 loadCountryPolicy() 호출 ──────
  DataService.prototype.loadCountryPolicy = DataService.prototype.loadCountryImpact;

  // ── 8. Policies (flat list) ────────────────────────────────
  DataService.prototype.loadPoliciesList = function () {
    var self = this;
    var KEY = 'policies-list';
    if (this._isFresh(KEY, CACHE_TTL.policies)) return Promise.resolve(this._get(KEY));
    return this._fetch('policies.json').then(function (d) {
      self._set(KEY, d); return d;
    }).catch(function () { return self._get(KEY); });
  };

  // ── 9. Prediction Grid (ML Spec §2.6) ─────────────────────
  DataService.prototype.loadPredictionGrid = function () {
    var self = this;
    var KEY = 'prediction-grid';
    if (this._isFresh(KEY, CACHE_TTL.prediction)) return Promise.resolve(this._get(KEY));
    return this._fetch('predictions/grid_latest.json').then(function (d) {
      self._set(KEY, d);
      self._notify('predictions', d);
      return d;
    }).catch(function () { return null; });
  };

  // ── 10. Weather (Open-Meteo) ──────────────────────────────
  DataService.prototype.fetchWeatherForLocation = function (lat, lon) {
    var params = new URLSearchParams({
      latitude: lat, longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure',
      timezone: 'auto',
    });
    return fetch('https://api.open-meteo.com/v1/forecast?' + params).then(function (res) {
      if (!res.ok) return null;
      return res.json().then(function (d) { return d.current || null; });
    }).catch(function () { return null; });
  };

  // ── 11. Air Quality (Open-Meteo) ──────────────────────────
  DataService.prototype.fetchAirQualityForCity = function (lat, lon) {
    var params = new URLSearchParams({
      latitude: lat, longitude: lon,
      current: 'pm2_5,pm10,us_aqi',
      timezone: 'auto',
    });
    return fetch('https://air-quality-api.open-meteo.com/v1/air-quality?' + params).then(function (res) {
      if (!res.ok) return null;
      return res.json().then(function (d) { return d.current || null; });
    }).catch(function () { return null; });
  };

  // ── 싱글턴 등록 ───────────────────────────────────────────
  window.DataService = new DataService();

})();
