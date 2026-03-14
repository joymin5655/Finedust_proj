import { useEffect, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { APP_CONFIG } from '../logic/config';
import { getMarkerColor } from '../logic/airQualityService';

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
  const [stations, setStations] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get(`${APP_CONFIG.BASE_DATA_URL}/waqi/latest.json`);
        if (res.data && res.data.cities) {
          setStations(res.data.cities);
        }
      } catch (err) {
        console.error('Failed to load global station markers:', err);
      }
    };
    loadData();
  }, []);

  return (
    <group>
      {stations.map((station: any, idx) => {
        const [lat, lon] = station.location.geo;
        const position = latLonToVector3(lat, lon, 1.005); // Slightly above globe surface
        const pm25 = station.pollutants.pm25 || 0;
        const color = getMarkerColor(pm25);
        
        return (
          <group key={idx} position={position}>
            {/* Core Point */}
            <mesh>
              <sphereGeometry args={[0.008, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* Outer Glow */}
            <mesh>
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            {/* Atmosphere Spike (Optional, represents PM2.5 height) */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
               <boxGeometry args={[0.002, 0.002, Math.max(0.01, pm25 / 1000)]} />
               <meshBasicMaterial color={color} transparent opacity={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default AirQualityMarkers;