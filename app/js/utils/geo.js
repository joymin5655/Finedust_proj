/**
 * geo.js — 지리/좌표 유틸리티
 * ────────────────────────────
 * Globe, Today, Policy 전체에서 재사용
 */

/**
 * Haversine 거리 계산 (km)
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 위경도 → Three.js 구체 좌표 (radius=1 기준)
 */
export function latLonToVector3(lat, lon, radius = 1.02) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

/**
 * 가장 가까운 측정소 K개 찾기 (IDW용)
 */
export function findNearestStations(lat, lon, stations, k = 5) {
  return stations
    .map(s => ({
      ...s,
      distance: haversineDistance(lat, lon, s.lat ?? s.latitude, s.lon ?? s.longitude),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);
}

/**
 * IDW (Inverse Distance Weighting) 보간
 * @param {Array} nearStations — { pm25, distance } 배열
 * @param {number} power — IDW 지수 (기본 2)
 */
export function idwInterpolate(nearStations, power = 2) {
  const valid = nearStations.filter(s => s.pm25 != null && s.distance > 0);
  if (!valid.length) return null;

  let weightSum = 0;
  let valueSum = 0;
  for (const s of valid) {
    const w = 1 / Math.pow(s.distance, power);
    weightSum += w;
    valueSum += w * s.pm25;
  }
  return weightSum > 0 ? valueSum / weightSum : null;
}

/**
 * 국가 이름 → ISO 2-letter code
 */
const COUNTRY_CODE_MAP = {
  'South Korea': 'KR', 'Korea': 'KR', 'China': 'CN', 'Japan': 'JP',
  'India': 'IN', 'USA': 'US', 'United States': 'US', 'Germany': 'DE',
  'France': 'FR', 'United Kingdom': 'GB', 'UK': 'GB', 'Australia': 'AU',
  'Canada': 'CA', 'Brazil': 'BR', 'Russia': 'RU', 'Indonesia': 'ID',
  'Mexico': 'MX', 'Saudi Arabia': 'SA', 'Turkey': 'TR', 'Poland': 'PL',
  'Thailand': 'TH', 'Vietnam': 'VN', 'Pakistan': 'PK', 'Bangladesh': 'BD',
  'Nigeria': 'NG', 'Egypt': 'EG', 'South Africa': 'ZA', 'Iran': 'IR',
  'Italy': 'IT', 'Spain': 'ES', 'Netherlands': 'NL', 'Sweden': 'SE',
  'Switzerland': 'CH', 'Belgium': 'BE', 'Austria': 'AT', 'Norway': 'NO',
  'Denmark': 'DK', 'Finland': 'FI', 'Singapore': 'SG', 'Malaysia': 'MY',
  'Philippines': 'PH', 'New Zealand': 'NZ', 'Chile': 'CL', 'Colombia': 'CO',
  'Argentina': 'AR', 'Peru': 'PE', 'Portugal': 'PT', 'Greece': 'GR',
  'Czech Republic': 'CZ', 'Romania': 'RO', 'Hungary': 'HU', 'Ukraine': 'UA',
};

export function nameToCode(name) {
  return COUNTRY_CODE_MAP[name] || name;
}

/**
 * 국가 이름/코드 → 국기 이모지
 */
export function countryToFlag(nameOrCode) {
  const code = (nameOrCode.length === 2 ? nameOrCode : nameToCode(nameOrCode)).toUpperCase();
  if (code.length !== 2) return '🌍';
  return String.fromCodePoint(
    ...code.split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  );
}
