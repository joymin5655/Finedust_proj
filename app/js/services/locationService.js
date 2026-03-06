/**
 * locationService.js — GPS location helper
 * ─────────────────────────────────────────
 * Exposes a singleton window.LocationService with:
 *   getLocation()  → Promise<{lat, lon} | null>
 *
 * today.js uses this; StationService handles nearest-station logic.
 */

const LocationService = (() => {
  let _cached = null;

  /** Request browser GPS. Returns {lat,lon} or null if denied/unavailable. */
  async function getLocation() {
    if (_cached) return _cached;
    return new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        pos => {
          _cached = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          resolve(_cached);
        },
        () => resolve(null),
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }

  return { getLocation };
})();

window.LocationService = LocationService;
