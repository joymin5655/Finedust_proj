import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { APP_CONFIG } from '../logic/config';

const Globe = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (globeRef.current) {
      globeRef.current.rotation.y = elapsedTime * 0.04;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsedTime * 0.055;
      cloudsRef.current.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.scale.setScalar(1.1 + Math.sin(elapsedTime * 0.5) * 0.01);
    }
  });

  return (
    <>
      <Stars radius={250} depth={80} count={12000} factor={4} saturation={1} fade speed={1.5} />

      <ambientLight intensity={0.4} />
      <pointLight position={[12, 12, 12]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-10, 5, 8]} intensity={1.2} color="#25e2f4" />
      <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={2} castShadow />

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Main Earth Sphere */}
        <Sphere ref={globeRef} args={[1, 128, 128]}>
          <meshPhongMaterial
            color={APP_CONFIG.GLOBE_THEME.EARTH_COLOR}
            emissive={APP_CONFIG.GLOBE_THEME.EMISSIVE_COLOR}
            specular="#444444"
            shininess={15}
            bumpScale={0.02}
          />
        </Sphere>

        {/* Clouds Layer */}
        <Sphere ref={cloudsRef} args={[1.02, 96, 96]}>
          <meshPhongMaterial
            color={APP_CONFIG.GLOBE_THEME.CLOUDS_COLOR}
            transparent
            opacity={0.12}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </Sphere>

        {/* Atmosphere Glow (Inner) */}
        <Sphere ref={atmosphereRef} args={[1.05, 96, 96]}>
          <meshPhongMaterial
            color={APP_CONFIG.GLOBE_THEME.ATMOSPHERE_COLOR}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>

        {/* Outer Halo */}
        <Sphere args={[1.15, 96, 96]}>
          <meshPhongMaterial
            color={APP_CONFIG.GLOBE_THEME.ATMOSPHERE_COLOR}
            transparent
            opacity={0.03}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      </Float>

      <OrbitControls
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.03}
        minDistance={1.4}
        maxDistance={4.5}
        rotateSpeed={0.6}
        autoRotate={false}
      />
    </>
  );
};

export default Globe;