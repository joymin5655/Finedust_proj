/**
 * openaiService.js — Serverless proxy wrapper for OpenAI
 * ───────────────────────────────────────────────────────
 * ⚠️  NO API KEY IS STORED HERE.
 *     The key lives exclusively in the Vercel/Cloudflare
 *     environment variables on the proxy server.
 *
 * The proxy endpoint accepts POST JSON and forwards to
 * the OpenAI Chat Completions API, returning the same
 * response shape.
 *
 * Usage:
 *   const report = await OpenAIService.todayReport({ pm25: 42, grade: 'Moderate', location: 'Seoul' });
 *   const summary = await OpenAIService.policyReport({ country: 'South Korea', policies: [...] });
 */

const OpenAIService = (() => {
  // ── Proxy base URL (no trailing slash) ───────────────────────
  // Replace with your deployed Vercel / Cloudflare Worker URL.
  const API_BASE = 'https://airlens-api.vercel.app';

  async function _post(endpoint, payload) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`OpenAI proxy error ${res.status}: ${text}`);
    }
    return res.json();
  }

  /**
   * Generate a natural-language air quality report for Today view.
   * @param {{ pm25: number, grade: string, location: string, weather?: object }} ctx
   * @returns {Promise<{ report: string }>}
   */
  async function todayReport(ctx) {
    return _post('/api/today-report', ctx);
  }

  /**
   * Generate a policy effectiveness summary for the Policy page.
   * @param {{ country: string, policies: Array, currentPM25?: number }} ctx
   * @returns {Promise<{ summary: string }>}
   */
  async function policyReport(ctx) {
    return _post('/api/policy-report', ctx);
  }

  /**
   * Check proxy availability (e.g., to show/hide AI features gracefully).
   * @returns {Promise<boolean>}
   */
  async function isAvailable() {
    try {
      const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  return { todayReport, policyReport, isAvailable, API_BASE };
})();

window.OpenAIService = OpenAIService;
