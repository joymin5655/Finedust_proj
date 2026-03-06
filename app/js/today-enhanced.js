/**
 * today-enhanced.js — Today 페이지 고도화 모듈
 * ──────────────────────────────────────────────
 * WAQI 실시간 데이터 + OpenAQ 연간 트렌드 차트를
 * Today(index.html) 페이지에 주입
 *
 * 사용 방법: index.html에서 <script type="module" src="js/today-enhanced.js">
 */

import { loadWaqiLatest, findNearestCity, getAqiInfo } from './services/waqiService.js';
import { getCityYearlyTrend } from './services/openaqService.js';
import { getCityAod, aodToColor, aodToLabel } from './services/earthdataService.js';

// ── waqiService 래퍼 (기존 로직과 호환) ──────────────────────────────
async function loadWaqiData() {
  return loadWaqiLatest();
}

function findNearestWaqiCity(cities, lat, lon) {
  if (!cities?.length) return null;
  let best = null, bestDist = Infinity;
  for (const c of cities) {
    if (c.location?.geo == null) continue;
    const [cLat, cLon] = c.location.geo;
    const d = (lat - cLat) ** 2 + (lon - cLon) ** 2;
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best;
}

/** AQI 색상/등급 — waqiService의 getAqiInfo를 사용 */
function aqiInfo(aqi) {
  const info = getAqiInfo(aqi);
  return { label: info.label, color: info.color, bg: info.bg };
}

/** AQI 행동 가이드 — waqiService의 getAqiInfo를 사용 */
function aqiGuide(aqi) {
  return getAqiInfo(aqi).guide;
}

/**
 * 연간 트렌드 미니 차트 렌더링 (Chart.js 사용)
 */
function renderTrendChart(containerId, cityTrend, cityName) {
  const container = document.getElementById(containerId);
  if (!container || !cityTrend?.length) return;

  container.style.display = 'block';

  // 기존 차트 캔버스 생성
  container.innerHTML = `
    <div class="trend-chart-wrapper" style="
      background: rgba(0,0,0,0.15);
      border-radius: 12px;
      padding: 12px;
      margin-top: 12px;
      border: 1px solid rgba(37,226,244,0.2);">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <span style="color:rgba(255,255,255,0.7); font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">
          📈 PM2.5 Trend — ${cityName}
        </span>
        <span style="color:rgba(255,255,255,0.4); font-size:10px;">Annual avg µg/m³</span>
      </div>
      <div style="position:relative; height:80px;">
        <canvas id="trend-mini-canvas"></canvas>
      </div>
      <p style="color:rgba(255,255,255,0.4); font-size:10px; text-align:center; margin-top:4px;">Source: OpenAQ</p>
    </div>`;

  const canvas = container.querySelector('#trend-mini-canvas');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = cityTrend.map(d => d.year);
  const values = cityTrend.map(d => d.avg);
  const latest = values[values.length - 1];

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: '#25e2f4',
        backgroundColor: 'rgba(37,226,244,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#25e2f4',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toFixed(1)} µg/m³`
          }
        }
      },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

/**
 * AOD 인포 카드 렌더링
 */
function renderAodCard(containerId, aodData) {
  const el = document.getElementById(containerId);
  if (!el || !aodData) return;

  const color = aodToColor(aodData.aod_annual_avg);
  const label = aodToLabel(aodData.aod_annual_avg);
  const trendIcon = aodData.trend === 'decreasing' ? '📉' :
                    aodData.trend === 'increasing' ? '📈' : '➡️';

  el.style.display = 'block';
  el.innerHTML = `
    <div style="
      background: rgba(0,0,0,0.15);
      border-radius: 12px;
      padding: 12px;
      margin-top: 8px;
      border: 1px solid rgba(37,226,244,0.15);">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <span style="color:rgba(255,255,255,0.7); font-size:11px; font-weight:600; text-transform:uppercase;">
          🛰️ Satellite AOD
        </span>
        <span style="color:rgba(255,255,255,0.4); font-size:10px;">MODIS / NASA</span>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <div>
          <span style="font-size:1.5rem; font-weight:900; color:${color};">
            ${aodData.aod_annual_avg?.toFixed(2) ?? 'N/A'}
          </span>
          <span style="font-size:11px; color:rgba(255,255,255,0.5); margin-left:4px;">AOD (550nm)</span>
        </div>
        <div>
          <span style="font-size:12px; color:${color}; font-weight:600;">${label}</span><br>
          <span style="font-size:11px; color:rgba(255,255,255,0.5);">${trendIcon} ${aodData.trend}</span>
        </div>
      </div>
      <p style="font-size:10px; color:rgba(255,255,255,0.35); margin-top:6px;">
        Annual average Aerosol Optical Depth — higher values indicate more particles in the atmosphere
      </p>
    </div>`;
}

// ── 메인 초기화 ──────────────────────────────────────────────────────
export async function initTodayEnhanced({ lat, lon, cityName }) {
  try {
    console.log('[today-enhanced] Initializing with', { lat, lon, cityName });

    // 1. WAQI 실시간 데이터 (waqiService 사용)
    const waqiData = await loadWaqiData();
    if (waqiData) {
      const nearest = findNearestWaqiCity(waqiData.cities || [], lat, lon);
      if (nearest && nearest.aqi) {
        const info = aqiInfo(nearest.aqi);
        // WAQI AQI 카드 주입
        const waqiCardEl = document.getElementById('waqi-realtime-card');
        if (waqiCardEl) {
          waqiCardEl.style.display = 'block';
          waqiCardEl.innerHTML = `
            <div style="background:${info.bg}20; border:1px solid ${info.color}40;
                        border-radius:12px; padding:12px; margin-top:8px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                <span style="color:rgba(255,255,255,0.7); font-size:11px; font-weight:600; text-transform:uppercase;">
                  🌍 WAQI Realtime
                </span>
                <span style="font-size:10px; color:rgba(255,255,255,0.4);">
                  ${nearest.location?.name || nearest.city || 'Nearest Station'}
                </span>
              </div>
              <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:4px;">
                <span style="font-size:2rem; font-weight:900; color:${info.color};">${nearest.aqi}</span>
                <span style="font-size:14px; font-weight:700; color:${info.color};">${info.label}</span>
              </div>
              ${nearest.pollutants?.pm25 != null ? `
              <div style="font-size:12px; color:rgba(255,255,255,0.6);">
                PM2.5: ${nearest.pollutants.pm25} µg/m³
                ${nearest.pollutants?.pm10 != null ? `· PM10: ${nearest.pollutants.pm10}` : ''}
              </div>` : ''}
              <p style="font-size:11px; color:rgba(255,255,255,0.5); margin-top:6px;">
                ${aqiGuide(nearest.aqi)}
              </p>
            </div>`;
        }
      }
    }

    // 2. OpenAQ 연간 트렌드 (city명 있을 때)
    if (cityName) {
      const trend = await getCityYearlyTrend(cityName);
      if (trend?.length) {
        renderTrendChart('openaq-trend-container', trend, cityName);
      }
    }

    // 3. AOD (Earthdata)
    if (cityName) {
      const aodData = await getCityAod(cityName);
      renderAodCard('earthdata-aod-container', aodData);
    }

  } catch (err) {
    console.warn('[today-enhanced] Init error:', err);
  }
}

// ── 자동 실행 (today.js가 발행하는 today:locationReady 이벤트 수신) ──
// GPS 중복 요청을 피하기 위해 today.js에서 위치를 받아 초기화
document.addEventListener('today:locationReady', async (e) => {
  const { lat, lon, cityName } = e.detail;
  await initTodayEnhanced({ lat, lon, cityName });
});
