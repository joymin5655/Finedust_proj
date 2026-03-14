import { useEffect, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { APP_CONFIG } from '../logic/config';

// Helper to convert lat/lon to 3D Cartesian coordinates
const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

const CityMarkers = () => {
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get(`${APP_CONFIG.BASE_DATA_URL}/major-cities.json`);
        setCities(res.data);
      } catch (err) {
        console.error('Failed to load major cities:', err);
      }
    };
    loadData();
  }, []);

  return (
    <group>
      {cities.map((city, idx) => {
        const position = latLonToVector3(city.lat, city.lon, 1.005);
        
        return (
          <group key={idx} position={position}>
            {/* City Point */}
            <mesh>
              <sphereGeometry args={[0.005, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
            {/* City Label Placeholder (Circle) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.007, 0.008, 32]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default CityMarkers;
