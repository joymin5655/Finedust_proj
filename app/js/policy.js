/**
 * policy.js — Policy Research page entrypoint
 * ─────────────────────────────────────────────
 * Reads:  data/policy-impact/index.json  (country list)
 *         data/policy-impact/<file>.json  (per-country detail)
 *         data/policies.json             (global policies list)
 *
 * Renders: card grid + detail panel + PM2.5 trend chart
 *
 * Depends on: dataService.js, uiService.js, i18n.js, Chart.js
 */

/** HTML 특수문자 이스케이프 — XSS 방지 */
function _esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

(async function PolicyPage() {
  // ── DOM refs ────────────────────────────────────────────────
  const listEl      = document.getElementById('policy-list');
  const detailPanel = document.getElementById('detail-panel');
  const detailPH    = document.getElementById('detail-placeholder');
  const detailCnt   = document.getElementById('detail-content');
  const searchEl    = document.getElementById('policy-search');
  const regionEl    = document.getElementById('policy-region');

  let allCountries   = [];
  let detailChart    = null;
  let analyticsData  = null; // policy-analytics.json (지역 그룹 평균)
  let globalPolicies = null; // policies.json (target/credibility 보조)

  // ── Load data ───────────────────────────────────────────────
  async function loadAnalytics() {
    try {
      const base = window.AirLensConfig?.getBasePath?.() || '/data';
      const res = await fetch(`${base}/policy-analytics.json`);
      if (res.ok) analyticsData = await res.json();
    } catch (_) { /* 선택적 — 없어도 기본 표시 유지 */ }
  }

  // ── Load global policies.json (target_pm25, credibility 보조) ──
  async function loadGlobalPolicies() {
    try {
      const base = window.AirLensConfig?.getBasePath?.() || '/data';
      const res = await fetch(`${base}/policies.json`);
      if (res.ok) {
        const data = await res.json();
        globalPolicies = data.policies || [];
      }
    } catch (_) { /* 선택적 */ }
  }

  // ── 데이터 기반 credibility 동적 계산 ─────────────────────────
  // 정책 JSON 필드에서 데이터 품질/신뢰도를 추론
  function computeCredibility(policy, data) {
    let score = 0;
    let maxScore = 0;

    // 1. impact 데이터 존재 여부 (25점)
    maxScore += 25;
    if (policy.impact) {
      score += 10;
      if (policy.impact.beforePeriod?.meanPM25 != null) score += 5;
      if (policy.impact.afterPeriod?.meanPM25 != null) score += 5;
      if (policy.impact.analysis) score += 5;
    }

    // 2. 통계적 유의성 (25점)
    maxScore += 25;
    const ana = policy.impact?.analysis;
    if (ana) {
      if (ana.pValue != null) {
        if (ana.pValue <= 0.01) score += 20;
        else if (ana.pValue <= 0.05) score += 15;
        else if (ana.pValue <= 0.1) score += 8;
        else score += 3;
      }
      if (ana.effectSize === 'large') score += 5;
      else if (ana.effectSize === 'medium') score += 3;
      else if (ana.effectSize === 'small') score += 1;
    }

    // 3. 샘플 수 (20점)
    maxScore += 20;
    const samplesBefore = policy.impact?.beforePeriod?.samples || 0;
    const samplesAfter  = policy.impact?.afterPeriod?.samples || 0;
    const totalSamples  = samplesBefore + samplesAfter;
    if (totalSamples >= 2000) score += 20;
    else if (totalSamples >= 1000) score += 15;
    else if (totalSamples >= 500) score += 10;
    else if (totalSamples > 0) score += 5;

    // 4. timeline 데이터 (15점)
    maxScore += 15;
    const tl = policy.timeline;
    if (tl && tl.length >= 5) score += 15;
    else if (tl && tl.length >= 3) score += 10;
    else if (tl && tl.length >= 1) score += 5;

    // 5. 메타데이터 완성도 (15점)
    maxScore += 15;
    if (policy.description) score += 3;
    if (policy.url) score += 3;
    if (policy.type) score += 2;
    if (policy.targetPollutants?.length) score += 2;
    if (policy.measures?.length >= 3) score += 3;
    else if (policy.measures?.length >= 1) score += 2;
    if (data.realTimeData) score += 2;

    return maxScore > 0 ? score / maxScore : 0;
  }

  // ── 정책 설명에서 PM2.5 목표치 추출 ─────────────────────────
  function extractTarget(policy, countryName) {
    // 1. policies.json에서 먼저 찾기
    if (globalPolicies) {
      const match = globalPolicies.find(p =>
        p.country === countryName ||
        (policy.name && p.title && (
          p.title.toLowerCase().includes(policy.name.toLowerCase().slice(0, 10)) ||
          policy.name.toLowerCase().includes(p.title.toLowerCase().slice(0, 10))
        ))
      );
      if (match && match.target_pm25) {
        return { pm25: match.target_pm25, year: match.target_year || null };
      }
    }

    // 2. description에서 regex로 추출 (예: "reduce PM2.5 to 15 µg/m³ by 2030")
    const desc = policy.description || '';
    
    // Pattern: "to X µg/m³" or "to X μg/m³"
    const toMatch = desc.match(/to\s+(\d+(?:\.\d+)?)\s*(?:µg\/m³|μg\/m³|ug\/m3)/i);
    if (toMatch) {
      const yearMatch = desc.match(/by\s+(\d{4})/i);
      return { pm25: parseFloat(toMatch[1]), year: yearMatch ? parseInt(yearMatch[1]) : null };
    }

    // Pattern: "reduce by X%" → 목표는 before * (1 - X/100) 으로 추정
    const pctMatch = desc.match(/reduce\s+(?:PM\S*\s+)?(?:by\s+)?(\d+)(?:\s*[-–]\s*(\d+))?\s*%/i);
    if (pctMatch && policy.impact?.beforePeriod?.meanPM25) {
      const pct = pctMatch[2] ? parseInt(pctMatch[2]) : parseInt(pctMatch[1]); // 범위면 큰 값 사용
      const before = policy.impact.beforePeriod.meanPM25;
      const target = before * (1 - pct / 100);
      const yearMatch = desc.match(/by\s+(\d{4})/i);
      return { pm25: Math.round(target * 10) / 10, year: yearMatch ? parseInt(yearMatch[1]) : null };
    }

    // 3. impact afterPeriod → 달성치를 "실질 목표"로 표시 (fallback)
    if (policy.impact?.afterPeriod?.meanPM25 != null) {
      const afterYear = policy.impact.afterPeriod.end?.slice(0, 4);
      return {
        pm25: policy.impact.afterPeriod.meanPM25,
        year: afterYear ? parseInt(afterYear) : null,
        isAchieved: true  // 목표가 아니라 달성치
      };
    }

    return { pm25: null, year: null };
  }

  async function loadData() {
    try {
      const index = await window.DataService.loadPolicyIndex();
      allCountries = index.countries || [];
      document.getElementById('stat-countries').textContent = allCountries.length;
      const policyCount = allCountries.reduce((s, c) => s + (c.policyCount || 0), 0);
      document.getElementById('stat-policies').textContent = policyCount;
      renderList(allCountries);
    } catch (err) {
      console.error('Policy data load failed:', err);
      listEl.innerHTML = `
        <div class="text-center py-12 text-red-400">
          <span class="material-symbols-outlined text-4xl block mb-2">error</span>
          <p class="text-sm">Failed to load policy data. Please try again.</p>
        </div>`;
    }
  }

  // ── Render country list (single-column sidebar) ──────────────
  function renderList(countries) {
    if (!countries.length) {
      listEl.innerHTML = `<div class="text-center py-12 text-gray-500 text-xs">No results found.</div>`;
      return;
    }

    listEl.innerHTML = countries.map(c => `
      <div class="country-item"
           data-file="${_esc(c.dataFile)}" data-country="${_esc(c.country)}">
        <span class="flag">${_esc(c.flag || '🌍')}</span>
        <div class="info">
          <p class="name">${_esc(c.country)}</p>
          <p class="meta">${_esc(c.region || '')}</p>
        </div>
        <span class="count">${_esc(String(c.policyCount || 0))}</span>
      </div>
    `).join('');

    // Attach click events
    listEl.querySelectorAll('.country-item').forEach(btn => {
      btn.addEventListener('click', () => selectCountry(btn));
    });
  }

  // ── Select country → show detail panel ─────────────────────
  async function selectCountry(btn) {
    // Highlight selected item
    listEl.querySelectorAll('.country-item').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const file    = btn.dataset.file;
    const country = btn.dataset.country;

    // Show dashboard content
    detailPH.style.display    = 'none';
    detailCnt.style.display   = 'flex';
    // Hide effect placeholder, will be shown if no data
    const effPH = document.getElementById('detail-effect-placeholder');
    if (effPH) effPH.style.display = 'none';

    // Find meta from index
    const meta = allCountries.find(c => c.country === country) || {};

    // Populate basic fields from index
    document.getElementById('detail-flag').textContent    = meta.flag || '🌍';
    document.getElementById('detail-country').textContent = meta.country || country;
    document.getElementById('detail-region').textContent  = meta.region || '';
    document.getElementById('detail-title').textContent   = '—';
    document.getElementById('detail-authority').textContent = '';
    document.getElementById('detail-desc').textContent    = 'Loading…';
    document.getElementById('detail-target').textContent  = '--';
    document.getElementById('detail-year').textContent    = '----';
    document.getElementById('detail-cred-pct').textContent = '--%';
    document.getElementById('detail-cred-bar').style.width = '0%';
    document.getElementById('detail-chart-wrap').style.display = 'none';

    // Load country detail
    try {
      const data = await window.DataService.loadCountryPolicy(file);
      populateDetail(data, meta);
    } catch (err) {
      console.warn(`Could not load detail for ${country}:`, err);
      document.getElementById('detail-desc').textContent = 'Detailed data not available for this country.';
    }
  }

  // ── Populate detail panel ───────────────────────────────────
  function populateDetail(data, meta) {
    // Use first policy entry if array
    const policy = Array.isArray(data.policies) ? data.policies[0] : data;
    const countryName = data.country || meta.country || '';

    document.getElementById('detail-title').textContent =
      policy.title || policy.name || data.title || '—';
    document.getElementById('detail-authority').textContent =
      policy.authority || data.authority || policy.type || '';
    document.getElementById('detail-desc').textContent =
      policy.description || data.description || '—';

    // ── PM2.5 Target (동적 추출) ────────────────────────────────
    const targetInfo = extractTarget(policy, countryName);
    const targetLabelEl = document.getElementById('detail-target-label');
    if (targetInfo.pm25 != null) {
      document.getElementById('detail-target').textContent = targetInfo.pm25;
      if (targetLabelEl) {
        targetLabelEl.textContent = targetInfo.isAchieved ? 'PM2.5 Achieved' : 'PM2.5 Target';
      }
    } else {
      document.getElementById('detail-target').textContent = '--';
      if (targetLabelEl) targetLabelEl.textContent = 'PM2.5 Target';
    }
    const targetYear = targetInfo.year
      ?? (policy.implementationDate ? parseInt(policy.implementationDate.slice(0, 4)) : null);
    document.getElementById('detail-year').textContent = targetYear || '----';

    // ── Data Credibility (동적 계산) ────────────────────────────
    const cred = computeCredibility(policy, data) * 100;
    document.getElementById('detail-cred-pct').textContent = `${cred.toFixed(0)}%`;
    // Color coding based on score
    const credBar = document.getElementById('detail-cred-bar');
    setTimeout(() => {
      credBar.style.width = `${cred}%`;
      if (cred >= 70) credBar.style.background = '#25e2f4';       // primary
      else if (cred >= 40) credBar.style.background = '#f59e0b';  // amber
      else credBar.style.background = '#ef4444';                    // red
    }, 50);

    const url = policy.url || data.url || '#';
    const safeUrl = (url === '#') ? '#' : (/^(https?:\/\/|\/)/i.test(url) ? url : '#');
    document.getElementById('detail-link').href = safeUrl;

    // ── 정책 효과 분석 (PRD §6) ──────────────────────────────
    renderPolicyEffect(policy, data, meta);

    // PM2.5 trend chart
    const owid = data.owid_pm25 || data.pm25_trend;
    if (owid && owid.years && owid.values) {
      renderTrendChart(owid.years, owid.values);
    } else if (policy.timeline && policy.timeline.length > 1) {
      const years  = policy.timeline.map(t => t.date.slice(0, 4));
      const values = policy.timeline.map(t => t.pm25);
      renderTrendChart(years, values, policy.implementationDate?.slice(0, 4));
    }

    // ── Enhanced data (AOD + Policy Effect basic) ──────────
    loadEnhancedData(countryName, data);
  }

  // ── Policy Effect Panel (PRD §6.1 ~ §6.2) ─────────────────
  function renderPolicyEffect(policy, data, meta) {
    const effectWrap = document.getElementById('detail-effect-wrap');
    const effPH = document.getElementById('detail-effect-placeholder');
    if (!effectWrap) return;

    const imp = policy.impact;
    if (!imp) { effectWrap.style.display = 'none'; if(effPH) effPH.style.display='flex'; return; }

    const before = imp.beforePeriod?.meanPM25;
    const after  = imp.afterPeriod?.meanPM25;
    const ana    = imp.analysis || {};
    const pct    = ana.percentChange;

    if (before == null || after == null || pct == null) {
      effectWrap.style.display = 'none'; if(effPH) effPH.style.display='flex'; return;
    }

    effectWrap.style.display = 'flex';
    if(effPH) effPH.style.display = 'none';

    // Before / After 값
    const el = id => document.getElementById(id);
    if (el('eff-before'))  el('eff-before').textContent  = `${before.toFixed(1)} µg/m³`;
    if (el('eff-after'))   el('eff-after').textContent   = `${after.toFixed(1)} µg/m³`;

    // 변화율 칩
    const pctEl = el('eff-pct');
    if (pctEl) {
      const sign = pct < 0 ? '' : '+';
      pctEl.textContent = `${sign}${pct.toFixed(1)}%`;
      pctEl.className = `text-sm font-black rounded-full px-3 py-1 ${
        pct < 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
      }`;
    }

    // 통계적 유의성
    const sigEl = el('eff-sig');
    if (sigEl) {
      sigEl.textContent = ana.significant ? '✅ Statistically significant' : '⚠️ Not significant';
      sigEl.style.color = ana.significant ? '#10b981' : '#f59e0b';
    }

    // 지역 그룹 비교 (PRD §6.2)
    const groupEl = el('eff-group');
    if (groupEl) {
      const region     = meta.region || data.region || '';
      const regionAvgMap = analyticsData?.regionAvgPct || {};
      const groupResult  = window.PMService?.calcRelativeEffect(pct, region, regionAvgMap);

      if (groupResult) {
        const regionSign = groupResult.regionAvg < 0 ? '' : '+';
        groupEl.innerHTML = `
          <span class="font-bold">${_esc(region)} avg:</span>
          ${regionSign}${groupResult.regionAvg}% &nbsp;|&nbsp;
          <span class="${groupResult.relative < -3 ? 'text-emerald-500 font-bold' : groupResult.relative > 3 ? 'text-orange-500' : 'text-gray-500'}">
            ${groupResult.label}
          </span>`;
        groupEl.style.display = 'block';
      } else {
        groupEl.style.display = 'none';
      }
    }

    // Timeline mini bar (before → after 화살표)
    const timelineEl = el('eff-timeline');
    if (timelineEl && policy.timeline?.length) {
      renderEffectTimeline(policy.timeline, policy.implementationDate);
    }
  }

  // ── Effect Timeline (정책 전후 변화 미니 차트) ──────────────
  let effectChart = null;
  function renderEffectTimeline(timeline, policyDate) {
    const wrap = document.getElementById('eff-timeline');
    if (!wrap) return;
    wrap.style.display = 'block';

    const canvas = document.getElementById('eff-timeline-chart');
    if (!canvas) return;

    if (effectChart) { effectChart.destroy(); effectChart = null; }

    const labels = timeline.map(t => t.date.slice(0, 7));
    const values = timeline.map(t => t.pm25);
    const policyYear = policyDate?.slice(0, 4);

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.5)';
    const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';

    // 정책 시행 시점 수직선 annotation (단순 구현 — plugins 없이 pointStyles)
    const pointColors = labels.map(l => l.startsWith(policyYear) ? '#ef4444' : '#25e2f4');
    const pointRadius = labels.map(l => l.startsWith(policyYear) ? 5 : 2);

    effectChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'PM2.5',
          data: values,
          borderColor: '#25e2f4',
          backgroundColor: 'rgba(37,226,244,.08)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: pointColors,
          pointRadius
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 500 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: items => {
                const l = items[0].label;
                return l.startsWith(policyYear) ? `📌 Policy enacted (${l})` : l;
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: textColor, maxTicksLimit: 5 }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: false }
        }
      }
    });
  }

  // ── PM2.5 trend chart ───────────────────────────────────────
  function renderTrendChart(years, values) {
    document.getElementById('detail-chart-wrap').style.display = 'block';
    const ctx = document.getElementById('detail-chart').getContext('2d');

    if (detailChart) { detailChart.destroy(); detailChart = null; }

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.6)';
    const gridColor = isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)';

    detailChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'PM2.5 µg/m³',
          data: values,
          borderColor: '#25e2f4',
          backgroundColor: 'rgba(37,226,244,.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 600 },
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { ticks: { color: textColor, maxTicksLimit: 6 }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: false }
        }
      }
    });
  }

  // ── Search & filter ─────────────────────────────────────────
  function applyFilters() {
    const q      = (searchEl.value || '').toLowerCase();
    const region = regionEl.value;

    const filtered = allCountries.filter(c => {
      const matchQ = !q
        || c.country.toLowerCase().includes(q)
        || (c.region || '').toLowerCase().includes(q);
      const matchR = !region || c.region === region;
      return matchQ && matchR;
    });

    renderList(filtered);
  }

  searchEl?.addEventListener('input',  applyFilters);
  regionEl?.addEventListener('change', applyFilters);

  // ── Enhanced Data: AOD + Policy Effect (policy-enhanced.js 통합) ──
  const COUNTRY_CAPITAL = {
    'South Korea': 'Seoul', 'China': 'Beijing', 'Japan': 'Tokyo',
    'India': 'Delhi', 'United States': 'New York', 'United Kingdom': 'London',
    'Germany': 'Berlin', 'France': 'Paris', 'Poland': 'Warsaw',
    'Thailand': 'Bangkok', 'Australia': 'Sydney', 'Canada': 'Toronto',
    'Brazil': 'São Paulo', 'Indonesia': 'Jakarta', 'Mexico': 'Mexico City',
    'Turkey': 'Istanbul', 'Italy': 'Rome', 'Spain': 'Madrid',
    'Netherlands': 'Amsterdam', 'Vietnam': 'Hanoi', 'Singapore': 'Singapore',
    'Malaysia': 'Kuala Lumpur', 'Philippines': 'Manila', 'South Africa': 'Johannesburg',
  };

  let _policyEffectCache = null;
  let _aodCache = null;

  async function loadEnhancedData(countryName, data) {
    const wrap = document.getElementById('detail-enhanced-wrap');
    const content = document.getElementById('enhanced-data-content');
    if (!wrap || !content) return;

    content.innerHTML = '';
    wrap.style.display = 'none';

    const base = window.AirLensConfig?.getBasePath?.() || '/data';
    let hasContent = false;

    // 1. AOD 데이터
    try {
      if (!_aodCache) {
        const res = await fetch(`${base}/earthdata/aod_samples.json`);
        if (res.ok) _aodCache = await res.json();
      }
      const capital = COUNTRY_CAPITAL[countryName];
      const aodCity = _aodCache?.cities?.find(c =>
        c.city?.toLowerCase() === (capital || '').toLowerCase()
      );
      if (aodCity?.aod_annual_avg != null) {
        const aod = aodCity.aod_annual_avg;
        const color = aod < 0.1 ? '#00e5ff' : aod < 0.2 ? '#69f0ae' : aod < 0.35 ? '#ffff00' : aod < 0.5 ? '#ff9800' : '#f44336';
        const label = aod < 0.1 ? 'Very Low' : aod < 0.2 ? 'Low' : aod < 0.35 ? 'Moderate' : aod < 0.5 ? 'High' : 'Very High';
        const trendIcon = aodCity.trend === 'decreasing' ? '📉' : aodCity.trend === 'increasing' ? '📈' : '➡️';

        content.innerHTML += `
          <div class="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-yellow-500/15">
            <div class="flex items-center gap-3">
              <span class="text-lg">🛰️</span>
              <div>
                <p class="text-xs font-bold text-white/70">Satellite AOD (${_esc(capital)})</p>
                <p class="text-[10px] text-white/40">MODIS/MAIAC · NASA Earthdata</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-lg font-black" style="color:${color}">${aod.toFixed(2)}</span>
              <span class="text-xs text-white/40 ml-1">AOD</span>
              <p class="text-[10px]" style="color:${color}">${label} ${trendIcon}</p>
            </div>
          </div>`;
        hasContent = true;
      }
    } catch (e) { /* AOD 선택적 */ }

    // 2. Policy Effect (basic JSON)
    try {
      if (!_policyEffectCache) {
        const res = await fetch(`${base}/policy-impact/policy_effect_basic.json`);
        if (res.ok) _policyEffectCache = await res.json();
      }
      const cc = data.countryCode || allCountries.find(c => c.country === countryName)?.countryCode;
      const entry = _policyEffectCache?.effects?.find(e => e.country_code === cc);
      if (entry?.effect) {
        const e = entry.effect;
        const changeColor = e.improved ? '#4ade80' : '#f87171';
        const changeIcon = e.improved ? '📉' : '📈';

        content.innerHTML += `
          <div class="p-3 rounded-lg border ${e.improved ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-bold text-white/70">🏛️ Cross-Source Policy Effect</p>
              <span class="text-[10px] text-white/40">±${e.window_years || 3}yr average</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="p-2 rounded bg-black/20">
                <p class="text-[10px] text-white/40">Before</p>
                <p class="text-sm font-bold text-amber-400">${e.before_avg}</p>
              </div>
              <div class="p-2 rounded bg-black/20">
                <p class="text-[10px] text-white/40">After</p>
                <p class="text-sm font-bold text-blue-400">${e.after_avg}</p>
              </div>
              <div class="p-2 rounded bg-black/20">
                <p class="text-[10px] text-white/40">Change</p>
                <p class="text-sm font-bold" style="color:${changeColor}">${changeIcon} ${e.change_pct > 0 ? '+' : ''}${e.change_pct}%</p>
              </div>
            </div>
            ${entry.policy_name ? `<p class="text-[10px] text-white/30 mt-2">${_esc(entry.policy_name)} (${entry.policy_year || ''})</p>` : ''}
          </div>`;
        hasContent = true;
      }
    } catch (e) { /* 선택적 */ }

    if (hasContent) {
      wrap.style.display = 'block';
    }
  }

  // ── URL 파라미터 처리 (?country=KR) ────────────────────────
  // Globe에서 "See All Policies →" 버튼을 클릭하면
  // policy.html?country=KR 형식으로 넘어옴.
  // 데이터 로드 후 해당 국가를 자동 선택함.
  function handleUrlCountry() {
    const params = new URLSearchParams(window.location.search);
    const code   = (params.get('country') || '').toUpperCase();
    if (!code) return;

    // ISO code → 국가 이름 매핑 (index.json의 countryCode 필드 기준)
    const target = allCountries.find(c =>
      (c.countryCode || '').toUpperCase() === code ||
      c.country.toUpperCase() === code
    );
    if (!target) return;

    // 검색창에 국가명 입력하여 필터 적용
    if (searchEl) {
      searchEl.value = target.country;
      applyFilters();
    }

    // 첫 번째 카드 자동 클릭 (DOM 업데이트 후)
    setTimeout(() => {
      const firstCard = listEl.querySelector('.country-item');
      if (firstCard) {
        firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        selectCountry(firstCard);
      }
    }, 150);
  }

  // ── Init ────────────────────────────────────────────────────
  await Promise.all([loadData(), loadAnalytics(), loadGlobalPolicies()]);
  handleUrlCountry();
})();
