/**
 * globe-charts.js — Chart rendering (PM2.5 trends, timeline, impact comparison)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { esc, safeUrl } from '../utils/security.js';
import { WHO_GUIDELINE } from '../utils/config.js';

function _esc(str) { return esc(str); }
function _safeUrl(url) { return safeUrl(url); }

export function mixCharts(Cls) {
  const P = Cls.prototype;

  // ── PM2.5 Trends Chart ─────────────────────────────────────
  P.renderPM25TrendsChart = function (trendsData, countryName, policyImpact) {
    const canvas = document.getElementById('policy-timeline-chart');
    if (!canvas) return;
    if (this.timelineChart) this.timelineChart.destroy();

    const ctx = canvas.getContext('2d');
    const labels = trendsData.map(item => item.year.toString());
    const pm25Values = trendsData.map(item => item.value);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(37, 226, 244, 0.8)');
    gradient.addColorStop(1, 'rgba(37, 226, 244, 0.2)');

    this.timelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'PM2.5 Annual Average (µg/m³)',
            data: pm25Values,
            borderColor: '#25e2f4',
            backgroundColor: gradient,
            borderWidth: 3,
            pointRadius: 6,
            pointBackgroundColor: (context) => {
              const idx = context.dataIndex;
              return trendsData[idx].note?.includes('🔸') ? '#ff6b35' :
                     trendsData[idx].note?.includes('✅') ? '#00ff88' : '#25e2f4';
            },
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverRadius: 8,
            fill: true,
            tension: 0.3
          },
          {
            label: `WHO Guideline (${WHO_GUIDELINE.pm25_annual} µg/m³)`,
            data: pm25Values.map(() => WHO_GUIDELINE.pm25_annual),
            borderColor: 'rgba(255, 80, 80, 0.7)',
            borderWidth: 2,
            borderDash: [8, 4],
            pointRadius: 0,
            fill: false,
            tension: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${countryName} - PM2.5 Historical Trends`,
            color: '#ffffff',
            font: { size: 14, weight: 'bold' }
          },
          legend: {
            display: true,
            labels: {
              color: 'rgba(255,255,255,0.6)',
              font: { size: 10 },
              usePointStyle: true,
              pointStyle: 'line',
              filter: (item) => item.datasetIndex === 1, // WHO만 범례에 표시
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const idx = context.dataIndex;
                const note = trendsData[idx].note || '';
                return `PM2.5: ${context.raw} µg/m³ ${note}`;
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: {
            ticks: { color: 'rgba(255,255,255,0.7)' },
            grid: { color: 'rgba(255,255,255,0.1)' },
            title: { display: true, text: 'µg/m³', color: 'rgba(255,255,255,0.7)' }
          }
        }
      }
    });
  };

  // ── Full Details Modal ─────────────────────────────────────
  P.showFullDetails = function (countryName, policy) {
    const modal = document.createElement('div');
    modal.id = 'policy-details-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm';
    modal.style.animation = 'fadeIn 0.3s ease-out';

    const mc = document.createElement('div');
    mc.className = 'bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl p-8 max-w-3xl max-h-[90vh] overflow-y-auto m-4';
    mc.style.animation = 'slideInUp 0.3s ease-out';

    mc.innerHTML = `
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-4">
          <span class="text-6xl">${_esc(policy.flag)}</span>
          <div>
            <h2 class="text-3xl font-bold text-white">${_esc(countryName)}</h2>
            <p class="text-lg text-white/60">${_esc(policy.region)}</p>
          </div>
        </div>
        <button id="close-modal" class="text-white/60 hover:text-white transition-colors">
          <span class="material-symbols-outlined text-3xl">close</span>
        </button>
      </div>
      <div class="space-y-6">
        <div class="bg-black/20 rounded-lg p-6">
          <h3 class="text-2xl font-bold text-white mb-4">Main Policy</h3>
          <h4 class="text-xl font-bold text-primary mb-3">${_esc(policy.mainPolicy.name)}</h4>
          <p class="text-base text-white/90 mb-4">${_esc(policy.mainPolicy.description)}</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 mb-1">Implementation Date</p>
              <p class="text-sm font-semibold text-white">${_esc(policy.mainPolicy.implementationDate)}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-3">
              <p class="text-xs text-white/60 mb-1">Effectiveness</p>
              <p class="text-sm font-semibold text-white">${_esc(String(policy.mainPolicy.effectivenessRating))}/10</p>
            </div>
          </div>
        </div>
        <div class="bg-black/20 rounded-lg p-6">
          <h3 class="text-2xl font-bold text-white mb-4">Current Air Quality</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black/30 rounded-lg p-4 text-center">
              <p class="text-sm text-white/60 mb-2">AQI</p>
              <p class="text-4xl font-bold ${this.getAQIClass(policy.currentAQI)}">${_esc(String(policy.currentAQI))}</p>
            </div>
            <div class="bg-black/30 rounded-lg p-4 text-center">
              <p class="text-sm text-white/60 mb-2">PM2.5</p>
              <p class="text-4xl font-bold text-primary">${_esc(String(policy.currentPM25))}</p>
              <p class="text-xs text-white/60 mt-2">µg/m³</p>
            </div>
          </div>
        </div>
        ${policy.news?.length > 0 ? `
        <div class="bg-black/20 rounded-lg p-6">
          <h3 class="text-2xl font-bold text-white mb-4">Recent News</h3>
          <div class="space-y-3">
            ${policy.news.map(n => `
              <div class="bg-black/30 rounded-lg p-4 hover:bg-black/40 transition-colors cursor-pointer" data-url="${_esc(_safeUrl(n.url))}">
                <h5 class="text-base font-semibold text-white mb-2">${_esc(n.title)}</h5>
                <div class="flex justify-between text-sm text-white/60">
                  <span>${_esc(n.source)}</span><span>${_esc(n.date)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}
      </div>
    `;

    modal.appendChild(mc);
    document.body.appendChild(modal);

    mc.querySelectorAll('[data-url]').forEach(el => {
      el.addEventListener('click', () => {
        const url = el.dataset.url;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    modal.querySelector('#close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  };

  // ── Policy Info Panel (for raycaster click) ────────────────
  P.showPolicyInfoPanel = function (countryCode, policyData) {
    if (window.globeUpdatePanel) {
      window.globeUpdatePanel({
        type: 'policy',
        countryCode,
        ...policyData
      });
    }
  };

  // ── PM2.5 Trend Chart (small inline) ──────────────────────
  P.renderPM25TrendChart = function (trends, policyDate) {
    // Minimal trend chart for station info panel
    const canvas = document.getElementById('station-trend-chart');
    if (!canvas || !trends?.length) return;
    const ctx = canvas.getContext('2d');
    if (this._stationChart) this._stationChart.destroy();

    this._stationChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trends.map(t => t.label || t.date),
        datasets: [{
          data: trends.map(t => t.value),
          borderColor: '#25e2f4', borderWidth: 2,
          pointRadius: 0, fill: false, tension: 0.3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  };

} // end mixCharts
