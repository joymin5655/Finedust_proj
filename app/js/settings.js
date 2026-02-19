/**
 * settings.js - AirLens Settings Page
 * Handles theme switching and language selection.
 * Language changes are applied site-wide via I18n (i18n.js).
 */

class SettingsManager {
  constructor() {
    this.initThemeButtons();
    this.initLanguageSelect();
  }

  // ── Theme ────────────────────────────────────────────────────
  initThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const currentTheme = localStorage.getItem('theme') || 'light';

    themeButtons.forEach(btn => {
      if (btn.dataset.theme === currentTheme) btn.classList.add('active');

      btn.addEventListener('click', () => {
        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const selected = btn.dataset.theme;
        if (selected === 'dark') {
          document.body.classList.add('dark-mode');
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
          if (window.themeToggle) window.themeToggle.toggle.checked = true;
        } else {
          document.body.classList.remove('dark-mode');
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
          if (window.themeToggle) window.themeToggle.toggle.checked = false;
        }
      });
    });
  }

  // ── Language ─────────────────────────────────────────────────
  initLanguageSelect() {
    const sel = document.getElementById('language-select');
    if (!sel) return;

    // Reflect saved language
    sel.value = localStorage.getItem('language') || 'en';

    sel.addEventListener('change', (e) => {
      const lang = e.target.value;

      // Apply immediately via I18n engine
      if (window.I18n) {
        window.I18n.setLang(lang);
      } else {
        localStorage.setItem('language', lang);
      }

      // Show toast notification
      const name = this.getLanguageName(lang);
      const savedLabel = window.t ? window.t('settings.saved') : 'Language updated to';
      this.showNotification(`${savedLabel} ${name}`);
    });
  }

  getLanguageName(code) {
    return {
      en: 'English', ko: '한국어', ja: '日本語',
      zh: '中文', es: 'Español', fr: 'Français'
    }[code] || code;
  }

  // ── Toast notification ────────────────────────────────────────
  showNotification(message) {
    // Remove any existing toast
    document.querySelectorAll('.settings-notification').forEach(n => n.remove());

    const n = document.createElement('div');
    n.className = 'settings-notification';
    n.textContent = message;
    n.style.cssText = `
      position:fixed; bottom:80px; left:50%;
      transform:translateX(-50%);
      background:var(--color-primary); color:#111;
      padding:.75rem 2rem; border-radius:999px;
      box-shadow:0 4px 24px rgba(0,0,0,.25);
      z-index:10001; font-weight:600; font-size:.9rem;
      animation:toast-in .3s ease-out;
      white-space:nowrap;
    `;
    document.body.appendChild(n);

    setTimeout(() => {
      n.style.animation = 'toast-out .3s ease-out forwards';
      setTimeout(() => n.remove(), 300);
    }, 2800);
  }
}

// Toast animation styles
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes toast-in  { from { opacity:0; transform:translate(-50%,16px) } to { opacity:1; transform:translate(-50%,0) } }
  @keyframes toast-out { from { opacity:1; transform:translate(-50%,0) } to { opacity:0; transform:translate(-50%,16px) } }
`;
document.head.appendChild(toastStyle);

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.settingsManager = new SettingsManager(); });
} else {
  window.settingsManager = new SettingsManager();
}
