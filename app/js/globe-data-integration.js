/**
 * globe-data-integration.js — v4.0
 * ─────────────────────────────────────────────────────
 * Globe 패널에 Data Sources Badge + Policy Effect 요약 표시
 *
 * v4.0: FusionService에서 이미 로드된 데이터를 재사용
 *       (독립 fetch 제거 — 중복 네트워크 요청 방지)
 */

import { FusionService } from './services/fusionService.js';
import { getBasePath } from './utils/config.js';

// ── Policy effect 로드 (경량 — 요약 JSON만) ──────────────────
async function loadPolicyEffect() {
  try {
    const res = await fetch(`${getBasePath()}/policy-impact/policy_effect_basic.json`);
    if (!res.ok) return null;
    return res.json();
  } catch (e) { return null; }
}

/**
 * Data Sources 배지 렌더링
 */
function renderDataSourcesBadge(stats) {
  const panel = document.querySelector('.control-panel');
  if (!panel) return;

  const existing = document.getElementById('data-sources-badge');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'data-sources-badge';
  div.innerHTML = `
    <div class="mt-1 p-1.5 bg-black/20 rounded-lg border border-white/10">
      <h4 class="text-[10px] font-bold text-white/80 mb-1">📡 Live Data Sources</h4>
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-white/60">Total Stations</span>
          <span class="text-[10px] font-bold text-primary">${stats.total}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-white/60">Multi-Source</span>
          <span class="text-[10px] font-bold text-green-400">${stats.multiSource}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-white/60">Avg Quality</span>
          <span class="text-[10px] font-bold ${stats.avgDqss >= 75 ? 'text-green-400' : stats.avgDqss >= 50 ? 'text-yellow-400' : 'text-orange-400'}">${stats.avgDqss}%</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-white/60">AOD Coverage</span>
          <span class="text-[10px] font-bold text-yellow-400">${stats.aodCount} cities</span>
        </div>
      </div>
    </div>`;

  const divider = panel.querySelector('.border-t');
  if (divider) panel.insertBefore(div, divider);
  else panel.appendChild(div);
}

/**
 * Policy Effect 요약 렌더링
 */
function renderPolicyEffectSummary(effects) {
  const panel = document.querySelector('.control-panel');
  if (!panel || !effects?.length) return;

  const existing = document.getElementById('policy-effect-summary');
  if (existing) existing.remove();

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
      <p class="text-[9px] text-white/30 mt-1">Based on policy impact analysis</p>
    </div>`;
  panel.appendChild(div);
}

// ── 메인 초기화 (FusionService 데이터 재사용) ────────────────
export async function initGlobeDataIntegration() {
  console.log('[globe-data-integration] Integrating data sources...');

  // FusionService에서 이미 fuse된 데이터 사용
  const fused = FusionService.getFused();
  
  // 통계 계산
  let multiSource = 0, dqssSum = 0, aodCount = 0;
  for (const [, record] of fused) {
    if (record.sourceCount > 1) multiSource++;
    dqssSum += (record.dqss || 0);
    if (record.aod != null) aodCount++;
  }
  const total = fused.size;
  const avgDqss = total > 0 ? Math.round((dqssSum / total) * 100) : 0;

  const stats = { total, multiSource, avgDqss, aodCount };
  console.log(`[globe-data-integration] Stats: ${JSON.stringify(stats)}`);

  // Policy effects (별도 JSON — 경량)
  const policyEffectsRaw = await loadPolicyEffect();
  const effects = policyEffectsRaw?.effects || [];

  // UI 렌더링
  renderDataSourcesBadge(stats);
  renderPolicyEffectSummary(effects);

  return { stats, effects };
}

// ── Globe 준비 후 실행 (이벤트 기반) ──────────────────────────
// globe-data.js의 backgroundLoadData 완료 후 호출됨
// 또는 DOMContentLoaded 시 지연 실행 (fallback)
document.addEventListener('DOMContentLoaded', () => {
  // FusionService가 초기화될 때까지 대기
  const tryInit = (attempt = 0) => {
    if (FusionService.getSize() > 0) {
      initGlobeDataIntegration().catch(e =>
        console.warn('[globe-data-integration] Init error:', e)
      );
    } else if (attempt < 15) {
      // 최대 15초 대기 (1초 간격)
      setTimeout(() => tryInit(attempt + 1), 1000);
    } else {
      console.log('[globe-data-integration] No fused data after 15s, skipping badges');
    }
  };
  tryInit();
});
