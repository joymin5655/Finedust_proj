/**
 * dataService.module.js — ES module shim
 * ────────────────────────────────────────
 * Re-exports window.DataService (set by the IIFE in dataService.js)
 * for files that import it as an ES module.
 *
 * Usage in ES modules:
 *   import { DataService } from './dataService.module.js';
 */
export const DataService = window.DataService;
