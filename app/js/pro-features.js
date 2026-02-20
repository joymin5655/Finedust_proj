/**
 * pro-features.js — AirLens Plus 기능 모음
 *
 * IS_PRO = true  → 모든 기능 활성
 * IS_PRO = false → Free 제한 모드 (v2 백엔드 연동 후 동적 제어 예정)
 *
 * TODO (v2): 백엔드 /api/me → { plan: 'plus' | 'free' } 응답으로 교체
 */

/* ──────────────────────────────────────────────────────────
   0. 플랜 확인 헬퍼
   ────────────────────────────────────────────────────────── */
function isPro() {
  return typeof window.PLAN !== 'undefined' && window.PLAN.IS_PRO === true;
}

function proFeature(featureKey) {
  return isPro() && window.PLAN.features[featureKey] === true;
}

/* ──────────────────────────────────────────────────────────
   1. WATCHLIST — Today 페이지
   ────────────────────────────────────────────────────────── */
const DEFAULT_WATCHLIST = [
  { city: 'Seoul',    countryCode: 'KR', flag: '🇰🇷', pm: null },
  { city: 'Tokyo',    countryCode: 'JP', flag: '🇯🇵', pm: null },
  { city: 'Beijing',  countryCode: 'CN', flag: '🇨🇳', pm: null },
  { city: 'New York', countryCode: 'US', flag: '🇺🇸', pm: null },
  { city: 'London',   countryCode: 'GB', flag: '🇬🇧', pm: null },
  { city: 'Delhi',    countryCode: 'IN', flag: '🇮🇳', pm: null },
];

function loadWatchlist() {
  try {
    const saved = localStorage.getItem('airlens_watchlist');
    return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
  } catch { return DEFAULT_WATCHLIST; }
}

function saveWatchlistData(list) {
  localStorage.setItem('airlens_watchlist', JSON.stringify(list));
}

function gradeColor(pm) {
  if (pm === null || pm === undefined) return '#9ca3af';
  if (pm <= 15)  return '#10b981';
  if (pm <= 35)  return '#f59e0b';
  if (pm <= 75)  return '#f97316';
  return '#ef4444';
}

function gradeLabel(pm) {
  if (pm === null || pm === undefined) return '--';
  if (pm <= 15)  return 'Good';
  if (pm <= 35)  return 'Moderate';
  if (pm <= 75)  return 'Unhealthy';
  return 'Hazardous';
}

/* 샘플 PM 값 (실제 API 없을 때 시각적으로 채워주는 demo 데이터) */
const DEMO_PM = { Seoul: 18, Tokyo: 12, Beijing: 55, 'New York': 9, London: 14, Delhi: 88 };

function renderWatchlistCards() {
  const container = document.getElementById('watchlist-cards');
  if (!container) return;

  const list = loadWatchlist();
  container.innerHTML = list.map((item, i) => {
    const pm  = item.pm ?? DEMO_PM[item.city] ?? Math.round(10 + Math.random() * 60);
    const col = gradeColor(pm);
    const lbl = gradeLabel(pm);
    return `
      <div class="rounded-xl border-2 p-3 text-center transition-all cursor-default"
           style="border-color:${col}20; background:${col}10;">
        <div class="text-xl mb-0.5">${item.flag}</div>
        <div class="text-xs font-bold text-gray-800 dark:text-white truncate">${item.city}</div>
        <div class="text-lg font-black" style="color:${col}">${pm}</div>
        <div class="text-[10px]" style="color:${col}">${lbl}</div>
      </div>`;
  }).join('');
}

/* Watchlist 북마크 버튼 토글 */
function toggleWatchlist(btn) {
  if (!proFeature('watchlist')) {
    showProToast('Watchlist is a Plus feature');
    return;
  }
  const panel = document.getElementById('watchlist-panel');
  if (!panel) return;

  if (panel.style.display === 'none' || panel.style.display === '') {
    renderWatchlistCards();
    panel.style.display = 'block';
    btn.innerHTML = '<span class="material-symbols-outlined text-sm text-primary">bookmarks</span><span class="hidden sm:inline text-primary">Watching</span>';
  } else {
    panel.style.display = 'none';
    btn.innerHTML = '<span class="material-symbols-outlined text-sm">bookmark_add</span><span class="hidden sm:inline">Watch</span>';
  }
}

/* ──────────────────────────────────────────────────────────
   2. ALERT THRESHOLD — Today 페이지
   ────────────────────────────────────────────────────────── */
function saveAlertThreshold() {
  if (!proFeature('alertThreshold')) {
    showProToast('Alerts are a Plus feature');
    return;
  }
  const val = document.getElementById('alert-slider')?.value;
  if (!val) return;

  localStorage.setItem('airlens_alert_threshold', val);

  const btn = document.querySelector('#alert-card button');
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✅ Saved!';
    btn.classList.add('bg-green-500');
    btn.classList.remove('bg-amber-500');
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('bg-green-500');
      btn.classList.add('bg-amber-500');
    }, 1800);
  }
}

/* 저장된 임계값 복원 */
function restoreAlertThreshold() {
  const saved = localStorage.getItem('airlens_alert_threshold');
  if (!saved) return;
  const slider = document.getElementById('alert-slider');
  const label  = document.getElementById('alert-val');
  if (slider) slider.value = saved;
  if (label)  label.textContent = saved;
}

/* ──────────────────────────────────────────────────────────
   3. CSV EXPORT — Policy 페이지
   ────────────────────────────────────────────────────────── */
function exportPolicyCSV() {
  if (!proFeature('csvExport')) {
    showProToast('CSV export is a Plus feature');
    return;
  }

  // 페이지에서 렌더링된 카드에서 데이터 추출
  const cards = document.querySelectorAll('#policy-list .policy-card');
  if (cards.length === 0) {
    alert('No policy data loaded yet. Please wait for the page to finish loading.');
    return;
  }

  let rows = [['Country', 'Region', 'Policy', 'Year', 'Credibility']];
  cards.forEach(card => {
    const country  = card.querySelector('[data-country]')?.dataset.country  || card.querySelector('h3, .font-bold')?.textContent?.trim() || '';
    const region   = card.querySelector('[data-region]')?.dataset.region    || '';
    const policy   = card.querySelector('[data-policy]')?.dataset.policy    || card.querySelector('p, .text-xs')?.textContent?.trim() || '';
    const year     = card.querySelector('[data-year]')?.dataset.year        || '';
    const credibility = card.querySelector('[data-cred]')?.dataset.cred     || '';
    rows.push([country, region, policy, year, credibility].map(v => `"${v.replace(/"/g,'""')}"`));
  });

  // 만약 카드에서 추출이 안 되면 window.policyData 사용
  if (rows.length <= 1 && window._policyData) {
    rows = [['Country', 'Region', 'Policy Title', 'Authority', 'PM2.5 Target', 'Year', 'Credibility']];
    window._policyData.forEach(p => {
      rows.push([
        p.country || '', p.region || '', p.policy || p.title || '',
        p.authority || '', p.target || '', p.year || '', p.credibility || ''
      ].map(v => `"${String(v).replace(/"/g,'""')}"`));
    });
  }

  const csv  = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `airlens_policies_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ──────────────────────────────────────────────────────────
   4. GROUP COMPARE — Policy 페이지
   ────────────────────────────────────────────────────────── */
function toggleGroupCompare() {
  if (!proFeature('policyGroupComp')) {
    showProToast('Group comparison is a Plus feature');
    return;
  }

  const panel = document.getElementById('group-compare-panel');
  if (!panel) return;

  if (panel.style.display === 'none' || panel.style.display === '') {
    panel.style.display = 'block';
    initGroupCompareChart();
  } else {
    panel.style.display = 'none';
  }
}

function initGroupCompareChart() {
  const canvas = document.getElementById('group-compare-chart');
  if (!canvas || !window.Chart) return;

  // 이미 차트가 있으면 제거
  if (canvas._chartInstance) canvas._chartInstance.destroy();

  canvas._chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Transport', 'Industrial', 'Energy', 'Agriculture', 'Construction', 'Multi-sector'],
      datasets: [{
        label: 'Avg PM2.5 Reduction (%)',
        data: [18.4, 22.1, 31.7, 9.8, 14.2, 27.5],
        backgroundColor: [
          'rgba(59,130,246,0.7)', 'rgba(249,115,22,0.7)',
          'rgba(16,185,129,0.7)', 'rgba(234,179,8,0.7)',
          'rgba(139,92,246,0.7)', 'rgba(37,226,244,0.7)'
        ],
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` -${ctx.parsed.y}% PM2.5 avg`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#9ca3af', font: { size: 10 },
                   callback: v => `-${v}%` },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: {
          ticks: { color: '#9ca3af', font: { size: 10 } },
          grid: { display: false }
        }
      }
    }
  });
}

/* ──────────────────────────────────────────────────────────
   5. GLOBE — AOD Layer & Time Slider
   ────────────────────────────────────────────────────────── */
window.toggleAodLayer = function(enabled) {
  if (!proFeature('aodLayer')) return;
  console.log('[Pro] AOD layer:', enabled ? 'ON' : 'OFF');
  // globe.js의 AOD 레이어 함수가 있으면 연결
  if (typeof window.globeSetAodLayer === 'function') {
    window.globeSetAodLayer(enabled);
  }
};

window.onGlobeTimeSlide = function(hourValue) {
  if (!proFeature('globeTimeSlider')) return;
  const label = document.getElementById('globe-time-label');
  if (!label) return;

  const h = parseInt(hourValue);
  if (h >= 23) {
    label.textContent = 'Now';
  } else {
    label.textContent = `${String(h).padStart(2,'0')}:00`;
  }
  // globe.js의 타임슬라이더 핸들러가 있으면 연결
  if (typeof window.globeSetHour === 'function') {
    window.globeSetHour(h);
  }
};

/* ──────────────────────────────────────────────────────────
   6. SETTINGS — Upgrade Modal (Free 유저용, 현재는 미사용)
   ────────────────────────────────────────────────────────── */
function showUpgradeModal() {
  // v2에서 PayPal 링크로 교체 예정
  // window.open('https://paypal.me/YOUR_ID?amount=4.99', '_blank');
  const modal = document.getElementById('upgrade-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/* ──────────────────────────────────────────────────────────
   7. PRO TOAST — Pro 기능 접근 시 안내 (Free 모드용)
   ────────────────────────────────────────────────────────── */
function showProToast(msg) {
  let toast = document.getElementById('pro-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pro-toast';
    toast.style.cssText = `
      position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
      background:#102122; border:1.5px solid #25e2f4; color:#25e2f4;
      padding:10px 20px; border-radius:12px; font-size:13px; font-weight:700;
      z-index:9999; pointer-events:none; white-space:nowrap;
      box-shadow:0 4px 20px rgba(37,226,244,0.3);
      opacity:0; transition:opacity .2s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = '✨ ' + msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

/* ──────────────────────────────────────────────────────────
   8. INIT — DOMContentLoaded
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname;

  // Today 페이지
  if (page.includes('index') || page.endsWith('/app/') || page.endsWith('/app')) {
    restoreAlertThreshold();
    // Pro가 아니면 alert-card 숨김
    if (!proFeature('alertThreshold')) {
      const alertCard = document.getElementById('alert-card');
      if (alertCard) alertCard.style.display = 'none';
    }
  }

  // Globe 페이지
  if (page.includes('globe')) {
    if (!proFeature('globeTimeSlider')) {
      const slider = document.getElementById('globe-time-slider');
      if (slider) slider.closest('.bg-primary\\/5')?.remove();
    }
  }

  console.log('[AirLens] Pro features loaded. Plan:', isPro() ? 'Plus' : 'Free');
});
