import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import './Globe.css'

function EarthSphere() {
  const meshRef = useRef()

  useEffect(() => {
    if (meshRef.current) {
      const texture = new THREE.TextureLoader().load(
        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
      )
      meshRef.current.material.map = texture
    }
  }, [])

  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial />
    </mesh>
  )
}

function Globe() {
  return (
    <div className="globe-page">
      <div className="globe-container">
        <h1 className="globe-title">Interactive 3D Globe</h1>
        <p className="globe-subtitle">Explore global air quality data in real-time</p>

        <div className="globe-canvas-wrapper">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars />
            <EarthSphere />
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              minDistance={3}
              maxDistance={10}
            />
          </Canvas>
        </div>

        <div className="globe-info">
          <div className="info-card">
            <h3>🌍 174+ Cities</h3>
            <p>Real-time PM2.5 data from global monitoring stations</p>
          </div>
          <div className="info-card">
            <h3>🇪🇺 Official Data</h3>
            <p>EU Copernicus CAMS atmospheric monitoring</p>
          </div>
          <div className="info-card">
            <h3>📊 Interactive</h3>
            <p>Click countries to view policy impacts</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Globe
