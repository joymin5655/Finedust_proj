/**
 * uiService.js — Shared UI helpers
 * ─────────────────────────────────
 * Grade colours, loading states, toast notifications.
 * Used by today.js, policy.js, globe.js.
 */

const UIService = (() => {
  // ── PM2.5 grade (delegates to centralized config) ────────────
  function grade(pm25) {
    if (window.AirLensConfig?.getPM25Grade) {
      const g = window.AirLensConfig.getPM25Grade(pm25);
      return {
        key:   `grade.${g.label.toLowerCase().replace(/\s+/g, '_')}`,
        label: window.I18n ? window.I18n.t(`grade.${g.label.toLowerCase()}`) : g.label,
        color: g.darkColor || g.color,
        bg:    g.bgClass || ''
      };
    }
    // Fallback
    const GRADES = [
      { max: 12,   key: 'grade.good',     color: '#10b981', bg: 'grade-good'          },
      { max: 35.5, key: 'grade.moderate', color: '#f59e0b', bg: 'grade-moderate'      },
      { max: 55.5, key: 'grade.unhealthy',color: '#f97316', bg: 'grade-unhealthy'     },
      { max: Infinity, key: 'grade.very',color: '#ef4444', bg: 'grade-very-unhealthy' }
    ];
    const g = GRADES.find(g => pm25 <= g.max);
    return {
      key:   g.key,
      label: window.I18n ? window.I18n.t(g.key) : g.key.split('.').pop(),
      color: g.color,
      bg:    g.bg
    };
  }

  // ── Loading overlay ───────────────────────────────────────────
  function showLoading(msg = 'Loading…') {
    let el = document.getElementById('loading-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'loading-overlay';
      el.innerHTML = `<div class="spinner"></div><p id="loading-text"></p>`;
      document.body.appendChild(el);
    }
    el.style.display = 'flex';
    const txt = el.querySelector('#loading-text');
    if (txt) txt.textContent = msg;
  }
  function hideLoading() {
    const el = document.getElementById('loading-overlay');
    if (el) el.style.display = 'none';
  }

  // ── Toast notification ────────────────────────────────────────
  function toast(message, durationMs = 3000) {
    document.querySelectorAll('.airlens-toast').forEach(n => n.remove());
    const el = document.createElement('div');
    el.className = 'airlens-toast';
    el.textContent = message;
    el.style.cssText = `
      position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
      background:var(--color-primary,#25e2f4); color:#111;
      padding:.6rem 1.8rem; border-radius:999px;
      font-weight:600; font-size:.9rem; white-space:nowrap;
      box-shadow:0 4px 24px rgba(0,0,0,.25); z-index:10002;
      animation:toast-in .3s ease;
    `;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'toast-out .3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }, durationMs);
  }

  // Inject toast animation once
  if (!document.getElementById('__airlens_toast_style')) {
    const s = document.createElement('style');
    s.id = '__airlens_toast_style';
    s.textContent = `
      @keyframes toast-in  { from{opacity:0;transform:translate(-50%,14px)} to{opacity:1;transform:translate(-50%,0)} }
      @keyframes toast-out { from{opacity:1;transform:translate(-50%,0)} to{opacity:0;transform:translate(-50%,14px)} }
    `;
    document.head.appendChild(s);
  }

  return { grade, showLoading, hideLoading, toast };
})();

window.UIService = UIService;
