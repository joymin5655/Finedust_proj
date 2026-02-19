/**
 * LocationService
 * 위치 취득 + 가장 가까운 WAQI 측정소 찾기
 */

class LocationService {
  constructor() {
    this.currentLocation = null;
  }

  /**
   * 브라우저 GPS 요청
   * @returns {Promise<{lat, lon}|null>}
   */
  async getLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentLocation = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
          resolve(this.currentLocation);
        },
        () => resolve(null),
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }

  /**
   * Haversine 거리 계산 (km)
   */
  calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * latest.json의 cities 배열에서 가장 가까운 N개 측정소 반환
   * @param {Array} cities - latest.json의 cities 배열
   * @param {number} lat
   * @param {number} lon
   * @param {number} topN
   * @returns {Array}
   */
  findNearbyStations(cities, lat, lon, topN = 3) {
    return cities
      .filter(city => city.location?.geo?.[0] != null && city.location?.geo?.[1] != null)
      .map(city => ({
        ...city,
        distance: this.calcDistance(lat, lon, city.location.geo[0], city.location.geo[1])
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, topN);
  }

  /**
   * 도시명/위치명 추출 (표시용)
   */
  getLocationLabel(station) {
    return station?.location?.name || station?.city || '알 수 없는 위치';
  }
}

window.LocationService = LocationService;
