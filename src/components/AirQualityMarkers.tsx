import { useMemo } from 'react';
import * as THREE from 'three';

// Helper to convert lat/lon to 3D Cartesian coordinates
const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

const AirQualityMarkers = () => {
  // Sample data
  const stations = useMemo(() => [
    { id: 1, lat: 37.5665, lon: 126.9780, pm25: 12, city: 'Seoul' },
    { id: 2, lat: 35.6762, lon: 139.6503, pm25: 25, city: 'Tokyo' },
    { id: 3, lat: 40.7128, lon: -74.0060, pm25: 8, city: 'New York' },
    { id: 4, lat: 51.5074, lon: -0.1278, pm25: 45, city: 'London' },
    { id: 5, lat: -33.8688, lon: 151.2093, pm25: 5, city: 'Sydney' },
    { id: 6, lat: 39.9042, lon: 116.4074, pm25: 110, city: 'Beijing' },
    { id: 7, lat: 19.4326, lon: -99.1332, pm25: 65, city: 'Mexico City' },
  ], []);

  const getMarkerColor = (pm25: number) => {
    if (pm25 <= 15) return '#10b981';
    if (pm25 <= 35) return '#f59e0b';
    if (pm25 <= 75) return '#f97316';
    return '#ef4444';
  };

  return (
    <group>
      {stations.map((station) => {
        const position = latLonToVector3(station.lat, station.lon, 1);
        const color = getMarkerColor(station.pm25);
        
        return (
          <mesh key={station.id} position={position}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
            <mesh>
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
          </mesh>
        );
      })}
    </group>
  );
};

export default AirQualityMarkers;