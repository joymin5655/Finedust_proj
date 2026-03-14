/**
 * settings.js — AirLens Settings Page (강화 버전)
 * ────────────────────────────────────────────────
 * ① Theme 버튼 ↔ 왼쪽 하단 #theme-toggle 완전 양방향 동기화
 *    · theme-btn 클릭 → 토글 체크박스 상태 변경 → ThemeToggle.enableDarkMode/LightMode 호출
 *    · 토글 변경 → theme-btn active 클래스 자동 업데이트
 *    · Tailwind 'dark' class + body 'dark-mode' class 모두 처리
 * ② Language select — I18n 연동
 * ③ Toast 알림
 */
class SettingsManager {
  constructor() {
    this._ready(() => {
      this.initThemeButtons();
      this.initLanguageSelect();
      this.observeToggle();   // 토글 외부 변경 감지 (다른 페이지에서 넘어온 경우)
    });
  }

  _ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  // ── 현재 테마 반환 ────────────────────────────────────────────
  _getCurrentTheme() {
    return localStorage.getItem('theme') || 'light';
  }

  // ── 테마 적용 (Tailwind .dark + legacy body.dark-mode 모두 처리) ──
  _applyTheme(theme) {
    const isDark = theme === 'dark';

    // Tailwind 방식 (index.html 등에서 사용)
    document.documentElement.classList.toggle('dark', isDark);

    // Legacy 방식 (main.css body.dark-mode 규칙 대응)
    document.body.classList.toggle('dark-mode', isDark);

    // localStorage 저장
    localStorage.setItem('theme', theme);

    // ThemeToggle 인스턴스가 있으면 위임
    if (window.themeToggle) {
      if (isDark) window.themeToggle.enableDarkMode();
      else        window.themeToggle.enableLightMode();
    } else {
      // ThemeToggle 없을 때 체크박스 직접 동기화
      const toggle = document.getElementById('theme-toggle');
      if (toggle) toggle.checked = isDark;
    }
  }

  // ── Theme 버튼 초기화 ────────────────────────────────────────
  initThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    if (!themeButtons.length) return;

    // 현재 테마로 active 초기화
    this._syncButtonsToTheme(this._getCurrentTheme(), themeButtons);

    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = btn.dataset.theme;
        this._applyTheme(selected);
        this._syncButtonsToTheme(selected, themeButtons);

        // 동기화 인디케이터 표시
        const indicator = document.getElementById('sync-indicator');
        if (indicator) {
          indicator.style.opacity = '1';
          setTimeout(() => { indicator.style.opacity = '0'; }, 2000);
        }

        this.showNotification(
          selected === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled'
        );
      });
    });
  }

  _syncButtonsToTheme(theme, buttons) {
    (buttons || document.querySelectorAll('.theme-btn')).forEach(b => {
      b.classList.toggle('active', b.dataset.theme === theme);
    });
  }

  // ── 토글 외부 변경 감지 (ThemeToggle이 독립적으로 바뀔 때) ───
  observeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('change', () => {
      const theme = toggle.checked ? 'dark' : 'light';
      // body/html 클래스는 ThemeToggle이 이미 처리했으므로 버튼만 동기화
      localStorage.setItem('theme', theme);
      this._syncButtonsToTheme(theme);
    });
  }

  // ── Language ─────────────────────────────────────────────────
  initLanguageSelect() {
    const sel = document.getElementById('language-select');
    if (!sel) return;

    sel.value = localStorage.getItem('language') || 'en';

    sel.addEventListener('change', (e) => {
      const lang = e.target.value;
      if (window.I18n) {
        window.I18n.setLang(lang);
      } else {
        localStorage.setItem('language', lang);
      }
      const name = this._langName(lang);
      this.showNotification(`🌍 Language updated to ${name}`);
    });
  }

  _langName(code) {
    return { en:'English', ko:'한국어', ja:'日本語', zh:'中文', es:'Español', fr:'Français' }[code] || code;
  }

  // ── Toast ─────────────────────────────────────────────────────
  showNotification(message) {
    document.querySelectorAll('.settings-notification').forEach(n => n.remove());

    const n = document.createElement('div');
    n.className = 'settings-notification';
    n.textContent = message;
    Object.assign(n.style, {
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--color-primary, #25e2f4)',
      color: '#0d1f20',
      padding: '.65rem 1.75rem',
      borderRadius: '999px',
      boxShadow: '0 4px 24px rgba(0,0,0,.25)',
      zIndex: '10001',
      fontWeight: '700',
      fontSize: '.875rem',
      animation: 'toast-in .25s ease-out',
      whiteSpace: 'nowrap',
    });
    document.body.appendChild(n);

    setTimeout(() => {
      n.style.animation = 'toast-out .25s ease-out forwards';
      setTimeout(() => n.remove(), 260);
    }, 2500);
  }
}

// Toast keyframes
const _st = document.createElement('style');
_st.textContent = `
  @keyframes toast-in  { from { opacity:0; transform:translate(-50%,12px) } to { opacity:1; transform:translate(-50%,0) } }
  @keyframes toast-out { from { opacity:1; transform:translate(-50%,0) } to { opacity:0; transform:translate(-50%,12px) } }
`;
document.head.appendChild(_st);

window.settingsManager = new SettingsManager();
