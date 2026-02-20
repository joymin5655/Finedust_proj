/**
 * policy-enhanced.js — Policy 페이지 데이터 강화 모듈
 * ─────────────────────────────────────────────────────
 * OpenAQ 연간 트렌드 + Earthdata AOD + Policy Effect 분석을
 * policy.html 국가 상세 패널에 추가
 *
 * policy.html에서 <script type="module" src="js/policy-enhanced.js"> 로 로드
 */

import { getCityYearlyTrend, getCountryLatestPm25 } from './services/openaqService.js';
import { getCityAod, aodToColor, aodToLabel } from './services/earthdataService.js';

const DATA_BASE = (() => {
  if (window.location.hostname.includes('github.io'))
    return '/Finedust_proj/app/data';
  return '/app/data';
})();

// ── Policy Effect 데이터 로드 ─────────────────────────────────────
let _policyEffectCache = null;
async function loadPolicyEffect() {
  if (_policyEffectCache) return _policyEffectCache;
  try {
    const res = await fetch(`${DATA_BASE}/policy-impact/policy_effect_basic.json`);
    if (!res.ok) return null;
    _policyEffectCache = await res.json();
    return _policyEffectCache;
  } catch { return null; }
}

// 국가 코드 매핑
const COUNTRY_TO_CODE = {
  'South Korea': 'KR', 'Korea': 'KR', 'China': 'CN', 'Japan': 'JP',
  'India': 'IN', 'United States': 'US', 'USA': 'US',
  'United Kingdom': 'GB', 'UK': 'GB', 'Germany': 'DE', 'France': 'FR',
  'Poland': 'PL', 'Thailand': 'TH', 'Australia': 'AU',
};
const COUNTRY_CAPITAL = {
  'South Korea': 'Seoul', 'Korea': 'Seoul', 'China': 'Beijing',
  'Japan': 'Tokyo', 'India': 'Delhi', 'United States': 'New York',
  'USA': 'New York', 'United Kingdom': 'London', 'UK': 'London',
  'Germany': 'Berlin', 'France': 'Paris', 'Poland': 'Warsaw',
  'Thailand': 'Bangkok', 'Australia': 'Sydney',
};

/**
 * OpenAQ 연간 트렌드 차트 렌더링
 * @param {string} containerId
 * @param {Array} trend
 * @param {string} countryName
 */
function renderOpenAqTrendChart(containerId, trend, countryName) {
  const el = document.getElementById(containerId);
  if (!el || !trend?.length || typeof Chart === 'undefined') return;

  // 기존 차트 제거
  el.innerHTML = `
    <div style="
      background:rgba(0,0,0,0.15); border-radius:12px; padding:16px;
      border:1px solid rgba(37,226,244,0.25); margin-top:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <span style="color:rgba(255,255,255,0.7); font-size:12px; font-weight:700;">
          📈 PM2.5 Annual Trend — ${countryName}
        </span>
        <span style="color:rgba(255,255,255,0.4); font-size:10px;">Source: OpenAQ</span>
      </div>
      <div style="position:relative; height:120px;">
        <canvas id="${containerId}-canvas"></canvas>
      </div>
    </div>`;

  const canvas = document.getElementById(`${containerId}-canvas`);
  if (!canvas) return;

  const labels = trend.map(d => d.year);
  const values = trend.map(d => d.avg);

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: '#25e2f4',
        backgroundColor: 'rgba(37,226,244,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#25e2f4',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(1)} µg/m³` }
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  });
}

/**
 * Policy Effect 패널 렌더링
 */
function renderPolicyEffect(containerId, effectData) {
  const el = document.getElementById(containerId);
  if (!el || !effectData?.effect) return;

  const e = effectData.effect;
  const changeColor = e.improved ? '#4ade80' : '#f87171';
  const changeIcon  = e.improved ? '📉' : '📈';

  el.style.display = 'block';
  el.innerHTML = `
    <div style="
      background:linear-gradient(135deg, rgba(74,222,128,0.08), rgba(37,226,244,0.08));
      border-radius:12px; padding:16px;
      border:1px solid rgba(74,222,128,0.25); margin-top:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <span style="color:rgba(255,255,255,0.7); font-size:12px; font-weight:700;">
          🏛️ Policy Impact Analysis
        </span>
        <span style="color:rgba(255,255,255,0.4); font-size:10px;">±${e.window_years}yr avg</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px;">
        <div style="text-align:center; padding:8px; background:rgba(0,0,0,0.2); border-radius:8px;">
          <div style="font-size:10px; color:rgba(255,255,255,0.5); margin-bottom:3px;">Before</div>
          <div style="font-size:1.1rem; font-weight:900; color:#fbbf24;">${e.before_avg} µg/m³</div>
        </div>
        <div style="text-align:center; padding:8px; background:rgba(0,0,0,0.2); border-radius:8px;">
          <div style="font-size:10px; color:rgba(255,255,255,0.5); margin-bottom:3px;">After</div>
          <div style="font-size:1.1rem; font-weight:900; color:#60a5fa;">${e.after_avg} µg/m³</div>
        </div>
        <div style="text-align:center; padding:8px; background:rgba(0,0,0,0.2); border-radius:8px;">
          <div style="font-size:10px; color:rgba(255,255,255,0.5); margin-bottom:3px;">Change</div>
          <div style="font-size:1.1rem; font-weight:900; color:${changeColor};">
            ${changeIcon} ${e.change_pct > 0 ? '+' : ''}${e.change_pct}%
          </div>
        </div>
      </div>
      <div style="font-size:11px; color:rgba(255,255,255,0.5); padding:8px; background:rgba(0,0,0,0.2); border-radius:8px;">
        <strong style="color:rgba(255,255,255,0.7);">Policy:</strong> ${effectData.policy_name || 'N/A'}<br>
        <strong style="color:rgba(255,255,255,0.7);">Year:</strong> ${effectData.policy_year || 'N/A'}<br>
        ${effectData.description ? `<span style="color:rgba(255,255,255,0.4);">${effectData.description}</span>` : ''}
      </div>
    </div>`;
}

/**
 * AOD 카드 렌더링
 */
function renderAodCard(containerId, aodData) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!aodData?.aod_annual_avg) {
    el.style.display = 'none';
    return;
  }

  const color = aodToColor(aodData.aod_annual_avg);
  const label = aodToLabel(aodData.aod_annual_avg);
  const trendIcon = aodData.trend === 'decreasing' ? '📉' :
                    aodData.trend === 'increasing' ? '📈' : '➡️';

  el.style.display = 'block';
  el.innerHTML = `
    <div style="
      background:rgba(0,0,0,0.15); border-radius:12px; padding:12px;
      border:1px solid rgba(255,200,0,0.25); margin-top:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <span style="color:rgba(255,255,255,0.7); font-size:12px; font-weight:700;">🛰️ Satellite AOD</span>
        <span style="color:rgba(255,255,255,0.4); font-size:10px;">MODIS / NASA</span>
      </div>
      <div style="display:flex; align-items:center; gap:16px;">
        <div>
          <span style="font-size:1.75rem; font-weight:900; color:${color};">
            ${aodData.aod_annual_avg.toFixed(2)}
          </span>
          <span style="font-size:11px; color:rgba(255,255,255,0.5); margin-left:4px;">AOD 550nm</span>
        </div>
        <div>
          <span style="font-size:13px; color:${color}; font-weight:700;">${label}</span><br>
          <span style="font-size:11px; color:rgba(255,255,255,0.5);">${trendIcon} ${aodData.trend}</span>
        </div>
      </div>
    </div>`;
}

/**
 * 국가 선택 시 호출 — 모든 강화 데이터 주입
 * @param {string} countryName  e.g. "South Korea"
 * @param {string} [trendContainerId]
 * @param {string} [effectContainerId]
 * @param {string} [aodContainerId]
 */
export async function enhanceCountryPanel(
  countryName,
  trendContainerId  = 'openaq-policy-trend',
  effectContainerId = 'policy-effect-panel',
  aodContainerId    = 'policy-aod-panel'
) {
  const cc      = COUNTRY_TO_CODE[countryName];
  const capital = COUNTRY_CAPITAL[countryName] || '';

  // 1. OpenAQ 트렌드
  if (capital) {
    const trend = await getCityYearlyTrend(capital, cc);
    if (trend?.length) {
      renderOpenAqTrendChart(trendContainerId, trend, countryName);
    }
  }

  // 2. Policy Effect
  const effectData = await loadPolicyEffect();
  if (effectData && cc) {
    const entry = effectData.effects?.find(e => e.country_code === cc);
    if (entry) renderPolicyEffect(effectContainerId, entry);
  }

  // 3. AOD
  if (capital) {
    const aod = await getCityAod(capital);
    renderAodCard(aodContainerId, aod);
  }
}

// ── 전역 노출 (policy.js에서 호출할 수 있도록) ──────────────────────
window.enhanceCountryPanel = enhanceCountryPanel;

// ── 자동 감지: URL ?country= 파라미터 ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const params  = new URLSearchParams(location.search);
  const country = params.get('country');
  if (country) {
    setTimeout(() => {
      enhanceCountryPanel(decodeURIComponent(country));
    }, 1500);
  }
});
