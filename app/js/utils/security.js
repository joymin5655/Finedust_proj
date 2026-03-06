/**
 * security.js — XSS/URL 보안 유틸리티
 * ──────────────────────────────────────
 */

/**
 * XSS 방어 — HTML 특수문자 이스케이프
 */
export function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * URL 안전성 검증 — javascript:/data: 차단
 */
export function safeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('vbscript:')) {
    console.warn('🚫 Blocked unsafe URL:', url);
    return null;
  }
  if (!trimmed.startsWith('http://') &&
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('/')) {
    return null;
  }
  return url;
}
