/**
 * globe-data-integration.js
 * ─────────────────────────────────────────────────────
 * Globe 페이지에서 OpenAQ + Earthdata AOD 데이터를
 * WAQI 마커 위에 오버레이로 표시하는 통합 모듈
 *
 * globe.html에서 <script type="module" src="..."> 로 로드
 */

import { getAllAodPoints, aodToColor } from './services/earthdataService.js';
import { loadPm25Years } from './services/openaqService.js';

const DATA_BASE = (() => {
  if (window.location.hostname.includes('github.io'))
    return '/Finedust_proj/app/data';
  return '/app/data';
})();

// ── WAQI latest.json 로드 ─────────────────────────────────────────
async function loadWaqiLatest() {
  try {
    const res = await fetch(`${DATA_BASE}/waqi/latest.json`);
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ── Policy effect 로드 ────────────────────────────────────────────
async function loadPolicyEffect() {
  try {
    const res = await fetch(`${DATA_BASE}/policy-impact/policy_effect_basic.json`);
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

/**
 * 글로브 오른쪽 패널에 "Data Sources" 섹션을 렌더링
 */
function renderDataSourcesBadge(waqiCount, openaqCount, aodCount) {
  const panel = document.querySelector('.control-panel');
  if (!panel) return;

  const existing = document.getElementById('data-sources-badge');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'data-sources-badge';
  div.innerHTML = `
    <div class="mt-1 p-1.5 bg-black/20 rounded-lg border border-white/10">
      <h4 class="text-[10px] font-bold text-white mb-1">Live Data Sources</h4>
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-white/60">WAQI Stations</span>
          <span class="text-[10px] font-bold text-primary">${waqiCount}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-white/60">OpenAQ Cities</span>
          <span class="text-[10px] font-bold text-green-400">${openaqCount}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-white/60">NASA AOD Points</span>
          <span class="text-[10px] font-bold text-yellow-400">${aodCount}</span>
        </div>
      </div>
    </div>`;

  // 첫 번째 구분선 앞에 삽입
  const divider = panel.querySelector('.border-t');
  if (divider) panel.insertBefore(div, divider);
  else panel.appendChild(div);
}

/**
 * 글로브 패널 하단에 Policy Effect 요약 표시
 */
function renderPolicyEffectSummary(effects) {
  const panel = document.querySelector('.control-panel');
  if (!panel || !effects?.length) return;

  const existing = document.getElementById('policy-effect-summary');
  if (existing) existing.remove();

  // 개선된 상위 3개
  const improved = effects.filter(e => e.effect?.improved)
    .sort((a, b) => a.effect.change_pct - b.effect.change_pct)
    .slice(0, 3);

  if (!improved.length) return;

  const rows = improved.map(e =>
    `<div class="flex items-center justify-between">
       <span class="text-[10px] text-white/60 truncate">${e.country_code}</span>
       <span class="text-[10px] font-bold text-green-400">${e.effect.change_pct.toFixed(1)}%</span>
     </div>`
  ).join('');

  const div = document.createElement('div');
  div.id = 'policy-effect-summary';
  div.innerHTML = `
    <div class="mt-1 p-1.5 bg-black/20 rounded-lg border border-green-500/20">
      <h4 class="text-[10px] font-bold text-green-400 mb-1">📉 Top PM2.5 Reductions</h4>
      ${rows}
      <p class="text-[9px] text-white/30 mt-1">Based on OpenAQ annual data</p>
    </div>`;
  panel.appendChild(div);
}

/**
 * Globe 업데이트된 데이터 통계 표시
 */
function updateLastUpdatedBadge(waqiData) {
  if (!waqiData?.updated_at) return;
  const ts = new Date(waqiData.updated_at);
  const timeStr = ts.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // stat 업데이트
  const citiesEl = document.getElementById('stat-countries');
  if (citiesEl && waqiData.count) {
    // WAQI cities를 stations 카운트에 반영
    const existing = parseInt(citiesEl.textContent) || 0;
    if (waqiData.count > existing) {
      citiesEl.textContent = waqiData.count;
    }
  }

  // 마지막 업데이트 표시
  const updEl = document.querySelector('[data-last-updated]');
  if (updEl) updEl.textContent = timeStr;
}

// ── 메인 초기화 ──────────────────────────────────────────────────────
export async function initGlobeDataIntegration() {
  console.log('[globe-data-integration] Loading all data sources...');

  // 병렬 로드
  const [waqiData, openaqData, aodPoints, policyEffects] = await Promise.allSettled([
    loadWaqiLatest(),
    loadPm25Years(),
    getAllAodPoints(),
    loadPolicyEffect()
  ]);

  const waqi     = waqiData.status     === 'fulfilled' ? waqiData.value     : null;
  const openaq   = openaqData.status   === 'fulfilled' ? openaqData.value   : null;
  const aod      = aodPoints.status    === 'fulfilled' ? aodPoints.value    : [];
  const effects  = policyEffects.status === 'fulfilled' ? policyEffects.value?.effects : [];

  const waqiCount  = waqi?.count    || 0;
  const openaqCount = openaq?.count || 0;
  const aodCount   = aod?.length    || 0;

  console.log(`[globe-data-integration] WAQI:${waqiCount} OpenAQ:${openaqCount} AOD:${aodCount}`);

  // UI 업데이트
  renderDataSourcesBadge(waqiCount, openaqCount, aodCount);
  renderPolicyEffectSummary(effects);
  updateLastUpdatedBadge(waqi);

  // AOD 데이터를 window에 노출 (globe.js에서 사용 가능)
  window.aodDataPoints = aod;
  window.policyEffectData = effects;

  return { waqi, openaq, aod, effects };
}

// ── 자동 실행 ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // globe.js 초기화 후 실행 (500ms 지연)
  setTimeout(() => {
    initGlobeDataIntegration().catch(e =>
      console.warn('[globe-data-integration] Init error:', e)
    );
  }, 2000);
});
