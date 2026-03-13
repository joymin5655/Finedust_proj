import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Globe = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (globeRef.current) {
      globeRef.current.rotation.y = elapsedTime * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsedTime * 0.07;
    }
  });

  return (
    <>
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, 3, 5]} intensity={0.8} />

      {/* Main Earth Sphere */}
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          color="#1a3a5a"
          emissive="#001122"
          specular="#333333"
          shininess={5}
        />
      </Sphere>

      {/* Clouds Layer */}
      <Sphere ref={cloudsRef} args={[1.015, 64, 64]}>
        <meshPhongMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </Sphere>

      {/* Atmosphere Glow */}
      <Sphere args={[1.1, 64, 64]}>
        <meshPhongMaterial
          color="#25e2f4"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      <OrbitControls
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={1.5}
        maxDistance={4}
      />
    </>
  );
};

export default Globe;