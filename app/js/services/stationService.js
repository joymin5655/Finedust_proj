/**
 * stationService.js — WAQI station data helpers
 * ──────────────────────────────────────────────
 * Wraps DataService.loadStations() with domain logic:
 *   • findNearest(lat, lon, n)  — distance-ranked stations
 *   • weightedPM25(stations)    — 1/d weighted average
 *   • getAll()                  — flat array of stations
 *
 * Depends on: dataService.js (window.DataService)
 */

const StationService = (() => {
  // ── Haversine distance (km) ───────────────────────────────────
  function _dist(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * Math.PI / 180)
      * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ── Load & normalise raw cities array ────────────────────────
  async function getAll() {
    const raw = await window.DataService.loadStations();
    return (raw.cities || []).map(city => ({
      id:       city.city,
      name:     city.location?.name || city.city,
      lat:      city.location?.geo?.[0],
      lon:      city.location?.geo?.[1],
      aqi:      city.aqi,
      pm25:     city.pollutants?.pm25 ?? city.aqi,
      pm10:     city.pollutants?.pm10 ?? null,
      url:      city.location?.url || '',
      weather:  city.weather || {},
      updated:  city.time?.s || raw.updated_at
    })).filter(s => s.lat != null && s.lon != null);
  }

  /**
   * Find the N nearest stations to (lat, lon).
   * Returns stations augmented with a `distance` (km) field.
   */
  async function findNearest(lat, lon, n = 3) {
    const all = await getAll();
    return all
      .map(s => ({ ...s, distance: _dist(lat, lon, s.lat, s.lon) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, n);
  }

  /**
   * Compute inverse-distance-weighted PM2.5 from a station list
   * (each station must have `distance` and `pm25` fields).
   */
  function weightedPM25(stations) {
    const valid = stations.filter(s => s.pm25 != null);
    if (!valid.length) return null;
    const totalW = valid.reduce((s, st) => s + 1 / Math.max(st.distance, 0.1), 0);
    const sum    = valid.reduce((s, st) => s + st.pm25 * (1 / Math.max(st.distance, 0.1)), 0);
    return sum / totalW;
  }

  return { getAll, findNearest, weightedPM25 };
})();

window.StationService = StationService;
