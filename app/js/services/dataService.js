/**
 * dataService.js — Central data loader for AirLens
 * ─────────────────────────────────────────────────
 * Single source of truth for static JSON data:
 *   • WAQI station data  → data/waqi/latest.json
 *   • Policy index       → data/policy-impact/index.json
 *   • Country details    → data/policy-impact/<country>.json
 *
 * All reads are cached in-memory (10-minute TTL).
 * No API keys are stored here — raw fetch only.
 */

const DataService = (() => {
  // ── Path resolution (GitHub Pages vs local) ──────────────────
  const BASE = (() => {
    const h = window.location.hostname;
    if (h.includes('github.io')) return '/Finedust_proj/app/data';
    // 로컬 개발: window.location.origin 으로 포트 포함 (e.g. http://localhost:8000)
    // 실행 위치가 /app/ 이면 ./data, 루트면 ./app/data 를 상대경로로 사용
    return window.location.origin + '/data';
  })();

  const CACHE_TTL = 10 * 60 * 1000; // 10 min
  const _cache = new Map();

  function _isFresh(key) {
    const entry = _cache.get(key);
    return entry && (Date.now() - entry.ts) < CACHE_TTL;
  }
  function _set(key, data) { _cache.set(key, { data, ts: Date.now() }); }
  function _get(key) { return _cache.get(key)?.data ?? null; }

  async function _fetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return res.json();
  }

  // ── Public API ────────────────────────────────────────────────

  /** Load WAQI latest station data → returns raw JSON object */
  async function loadStations() {
    const KEY = 'waqi-latest';
    if (_isFresh(KEY)) return _get(KEY);
    const data = await _fetch(`${BASE}/waqi/latest.json`);
    _set(KEY, data);
    return data;
  }

  /** Load policy index → returns { countries: [...] } */
  async function loadPolicyIndex() {
    const KEY = 'policy-index';
    if (_isFresh(KEY)) return _get(KEY);
    const data = await _fetch(`${BASE}/policy-impact/index.json`);
    _set(KEY, data);
    return data;
  }

  /** Load a single country's policy detail */
  async function loadCountryPolicy(filename) {
    const KEY = `policy-${filename}`;
    if (_isFresh(KEY)) return _get(KEY);
    const data = await _fetch(`${BASE}/policy-impact/${filename}`);
    _set(KEY, data);
    return data;
  }

  /** Load all policies from policies.json (for Policy page) */
  async function loadAllPolicies() {
    const KEY = 'policies-all';
    if (_isFresh(KEY)) return _get(KEY);
    const data = await _fetch(`${BASE}/policies.json`);
    _set(KEY, data);
    return data;
  }

  function clearCache() { _cache.clear(); }

  return { loadStations, loadPolicyIndex, loadCountryPolicy, loadAllPolicies, clearCache };
})();

window.DataService = DataService;
