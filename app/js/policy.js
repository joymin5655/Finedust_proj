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

  // ── Load data ───────────────────────────────────────────────
  async function loadAnalytics() {
    try {
      // dataService와 동일한 BASE 경로 사용
      const isGHPages = window.location.hostname.includes('github.io');
      const base = isGHPages ? '/Finedust_proj/app/data' : window.location.origin + '/data';
      const res = await fetch(`${base}/policy-analytics.json`);
      if (res.ok) analyticsData = await res.json();
    } catch (_) { /* 선택적 - 없어도 기본 표시 유지 */ }
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
        <div class="col-span-2 text-center py-12 text-red-400">
          <span class="material-symbols-outlined text-4xl block mb-2">error</span>
          <p class="text-sm">Failed to load policy data. Please try again.</p>
        </div>`;
    }
  }

  // ── Render card grid ────────────────────────────────────────
  function renderList(countries) {
    if (!countries.length) {
      listEl.innerHTML = `<div class="col-span-2 text-center py-12 text-gray-400 text-sm">No results found.</div>`;
      return;
    }

    listEl.innerHTML = countries.map(c => `
      <button
        class="policy-card text-left rounded-xl border border-gray-200 dark:border-white/10
               bg-white dark:bg-black/20 p-4 shadow-sm hover:shadow-md"
        data-file="${_esc(c.dataFile)}" data-country="${_esc(c.country)}">
        <div class="flex items-start gap-3">
          <span class="text-2xl flex-shrink-0">${_esc(c.flag || '🌍')}</span>
          <div class="min-w-0">
            <p class="text-gray-900 dark:text-white font-bold text-sm truncate">${_esc(c.country)}</p>
            <p class="text-gray-400 text-xs">${_esc(c.region || '')}</p>
            <p class="text-primary text-xs font-semibold mt-1">
              ${_esc(String(c.policyCount || 0))} polic${c.policyCount === 1 ? 'y' : 'ies'}
            </p>
          </div>
        </div>
      </button>
    `).join('');

    // Attach click events
    listEl.querySelectorAll('.policy-card').forEach(btn => {
      btn.addEventListener('click', () => selectCountry(btn));
    });
  }

  // ── Select country → show detail panel ─────────────────────
  async function selectCountry(btn) {
    // Highlight selected card
    listEl.querySelectorAll('.policy-card').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const file    = btn.dataset.file;
    const country = btn.dataset.country;

    // Show panel
    detailPanel.style.opacity = '1';
    detailPanel.style.pointerEvents = 'auto';
    detailPH.style.display    = 'none';
    detailCnt.style.display   = 'block';

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

    document.getElementById('detail-title').textContent =
      policy.title || policy.name || data.title || '—';
    document.getElementById('detail-authority').textContent =
      policy.authority || data.authority || policy.type || '';
    document.getElementById('detail-desc').textContent =
      policy.description || data.description || '—';

    const target = policy.target_pm25 ?? data.target_pm25 ?? '--';
    const year   = policy.target_year  ?? data.target_year  ??
                   (policy.implementationDate ? policy.implementationDate.slice(0,4) : '----');
    document.getElementById('detail-target').textContent = target;
    document.getElementById('detail-year').textContent   = year;

    const cred = (policy.credibility ?? data.credibility ?? 0) * 100;
    document.getElementById('detail-cred-pct').textContent = `${cred.toFixed(0)}%`;
    setTimeout(() => {
      document.getElementById('detail-cred-bar').style.width = `${cred}%`;
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
      // fallback: policy timeline을 트렌드 차트로 활용
      const years  = policy.timeline.map(t => t.date.slice(0, 4));
      const values = policy.timeline.map(t => t.pm25);
      renderTrendChart(years, values, policy.implementationDate?.slice(0, 4));
    }
  }

  // ── Policy Effect Panel (PRD §6.1 ~ §6.2) ─────────────────
  function renderPolicyEffect(policy, data, meta) {
    const effectWrap = document.getElementById('detail-effect-wrap');
    if (!effectWrap) return;

    const imp = policy.impact;
    if (!imp) { effectWrap.style.display = 'none'; return; }

    const before = imp.beforePeriod?.meanPM25;
    const after  = imp.afterPeriod?.meanPM25;
    const ana    = imp.analysis || {};
    const pct    = ana.percentChange;

    if (before == null || after == null || pct == null) {
      effectWrap.style.display = 'none'; return;
    }

    effectWrap.style.display = 'block';

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
      const firstCard = listEl.querySelector('.policy-card');
      if (firstCard) {
        firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        selectCountry(firstCard);
      }
    }, 150);
  }

  // ── Init ────────────────────────────────────────────────────
  await Promise.all([loadData(), loadAnalytics()]);
  handleUrlCountry();
})();
