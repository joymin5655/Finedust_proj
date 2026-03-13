import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Globe from '../components/Globe';
import AirQualityMarkers from '../components/AirQualityMarkers';
import { Info } from 'lucide-react';

const GlobeView = () => {
  return (
    <div className="h-screen w-full relative bg-black overflow-hidden">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-bg-dark">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="font-bold tracking-widest uppercase text-xs">Initializing Globe...</p>
          </div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          gl={{ 
            antialias: true, 
            alpha: false,
            powerPreference: 'high-performance'
          }}
        >
          <color attach="background" args={['#000005']} />
          <Globe />
          <AirQualityMarkers />
        </Canvas>
      </Suspense>

      <div className="absolute top-24 left-6 z-10 max-w-xs">
        <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-lg">
          Global Air Quality
        </h1>
        <p className="text-white/60 text-xs mt-1 drop-shadow-md">
          Real-time PM2.5 monitoring stations worldwide.
        </p>
        
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10">
            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
            <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Good (0-15)</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Moderate (16-35)</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10">
            <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
            <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Unhealthy (36-75)</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
            <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Hazardous (76+)</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <div className="bg-primary/10 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl flex items-center gap-3 text-white">
          <Info className="text-primary w-5 h-5 flex-shrink-0" />
          <p className="text-[10px] font-medium leading-tight opacity-80">
            Click and drag to rotate the Earth. Scroll to zoom. Data is sourced from WAQI and satellite estimates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobeView;