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

(async function PolicyPage() {
  // ── DOM refs ────────────────────────────────────────────────
  const listEl      = document.getElementById('policy-list');
  const detailPanel = document.getElementById('detail-panel');
  const detailPH    = document.getElementById('detail-placeholder');
  const detailCnt   = document.getElementById('detail-content');
  const searchEl    = document.getElementById('policy-search');
  const regionEl    = document.getElementById('policy-region');

  let allCountries = [];
  let detailChart  = null;

  // ── Load data ───────────────────────────────────────────────
  async function loadData() {
    try {
      const index = await window.DataService.loadPolicyIndex();
      allCountries = index.countries || [];

      // Update stat counters
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
        data-file="${c.dataFile}" data-country="${c.country}">
        <div class="flex items-start gap-3">
          <span class="text-2xl flex-shrink-0">${c.flag || '🌍'}</span>
          <div class="min-w-0">
            <p class="text-gray-900 dark:text-white font-bold text-sm truncate">${c.country}</p>
            <p class="text-gray-400 text-xs">${c.region || ''}</p>
            <p class="text-primary text-xs font-semibold mt-1">
              ${c.policyCount || 0} polic${c.policyCount === 1 ? 'y' : 'ies'}
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
      policy.title || data.title || '—';
    document.getElementById('detail-authority').textContent =
      policy.authority || data.authority || '';
    document.getElementById('detail-desc').textContent =
      policy.description || data.description || '—';

    const target = policy.target_pm25 ?? data.target_pm25 ?? '--';
    const year   = policy.target_year  ?? data.target_year  ?? '----';
    document.getElementById('detail-target').textContent = target;
    document.getElementById('detail-year').textContent   = year;

    const cred = (policy.credibility ?? data.credibility ?? 0) * 100;
    document.getElementById('detail-cred-pct').textContent = `${cred.toFixed(0)}%`;
    setTimeout(() => {
      document.getElementById('detail-cred-bar').style.width = `${cred}%`;
    }, 50);

    const url = policy.url || data.url || '#';
    document.getElementById('detail-link').href = url;

    // PM2.5 trend chart from OWID data
    const owid = data.owid_pm25 || data.pm25_trend;
    if (owid && owid.years && owid.values) {
      renderTrendChart(owid.years, owid.values);
    }
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

  // ── Init ────────────────────────────────────────────────────
  await loadData();
})();
