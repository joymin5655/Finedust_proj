import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeftIcon, CloseIcon } from './Icons';

interface PolicyData {
  id: string;
  country: string;
  countryCode: string;
  authority: string;
  title: string;
  description: string;
  effectiveDate: string;
  targetReduction: number;
  targetYear: number;
  targetPM25: number;
  credibility: number;
  officialURL: string;
  beforeData: Array<{ year: number; pm25: number }>;
  afterData: Array<{ year: number; pm25: number }>;
  improvement: number;
  status: 'effective' | 'moderate' | 'limited';
}

interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
  pm25: number;
  aqi: number;
  updated: string;
}

interface GlobeViewProps {
  onBack: () => void;
}

// Earth component
const Earth: React.FC<{ onStationClick: (station: Station) => void }> = ({ onStationClick }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const [stations, setStations] = useState<Station[]>([]);

  // Load Earth texture (we'll use a color for now, can add texture later)
  useEffect(() => {
    // Load station data (mock data for now)
    // In production, this would fetch from GitHub API
    const mockStations: Station[] = generateMockStations(100); // Start with 100 for performance
    setStations(mockStations);
  }, []);

  // Rotate Earth slowly
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          color="#1a5fb4"
          emissive="#0a2f5a"
          shininess={10}
          specular="#4a8fd4"
        />
      </mesh>

      {/* Station markers */}
      {stations.map((station) => (
        <StationMarker
          key={station.id}
          station={station}
          onClick={() => onStationClick(station)}
        />
      ))}
    </group>
  );
};

// Station marker component
const StationMarker: React.FC<{
  station: Station;
  onClick: () => void;
}> = ({ station, onClick }) => {
  const markerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Convert lat/lon to 3D position
  const position = latLonToVector3(station.lat, station.lon, 2.02);

  // Get color based on PM2.5 value
  const color = getPM25Color(station.pm25);

  return (
    <mesh
      ref={markerRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.5 : 1}
    >
      <sphereGeometry args={[0.01, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

// Station detail popup
const StationDetail: React.FC<{
  station: Station | null;
  onClose: () => void;
}> = ({ station, onClose }) => {
  if (!station) return null;

  const aqiLevel = getAQILevel(station.pm25);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{station.name}</h3>
            <p className="text-sm text-gray-400">{station.country}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{station.pm25.toFixed(1)}</span>
            <span className="text-gray-400">μg/m³</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${aqiLevel.bgColor} ${aqiLevel.textColor}`}
            >
              {aqiLevel.label}
            </div>
            <span className="text-sm text-gray-400">AQI: {station.aqi}</span>
          </div>

          <div className="pt-3 border-t border-white/10">
            <p className="text-xs text-gray-500">
              Updated: {new Date(station.updated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Policy Comparison Panel
const PolicyComparisonPanel: React.FC<{
  policies: PolicyData[];
  isOpen: boolean;
  onToggle: () => void;
}> = ({ policies, isOpen, onToggle }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyData | null>(null);

  // Combine before and after data for visualization
  const getChartData = (policy: PolicyData) => {
    const combined = [
      ...policy.beforeData.map(d => ({ year: d.year, pm25: d.pm25, period: 'Before' })),
      ...policy.afterData.map(d => ({ year: d.year, pm25: d.pm25, period: 'After' }))
    ];
    return combined.sort((a, b) => a.year - b.year);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'effective': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'limited': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-24 right-6 z-20 px-4 py-2 rounded-xl bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 transition-all duration-200 shadow-lg text-sm font-medium"
      >
        {isOpen ? 'Hide' : 'Show'} Policy Analysis
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute top-40 right-6 w-96 max-h-[calc(100vh-12rem)] z-30 overflow-hidden">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Policy Impact Analysis</h2>
              <p className="text-xs text-gray-400 mt-1">
                {policies.length} policies from {new Set(policies.map(p => p.country)).size} countries
              </p>
            </div>

            {/* Policy List */}
            <div className="overflow-y-auto max-h-64 p-4 space-y-2">
              {policies.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy.id === selectedPolicy?.id ? null : policy)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    selectedPolicy?.id === policy.id
                      ? 'bg-blue-500/30 border-blue-400/50'
                      : 'bg-white/5 hover:bg-white/10'
                  } border border-white/10`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {policy.country}
                      </h3>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {policy.title}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs font-bold text-green-400">
                        -{policy.improvement.toFixed(1)}%
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Policy Details */}
            {selectedPolicy && (
              <div className="p-4 border-t border-white/10 space-y-4 bg-black/20">
                {/* Policy Info */}
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{selectedPolicy.title}</h3>
                  <div className="space-y-1 text-xs text-gray-400">
                    <p><span className="text-gray-500">Authority:</span> {selectedPolicy.authority}</p>
                    <p><span className="text-gray-500">Effective:</span> {new Date(selectedPolicy.effectiveDate).toLocaleDateString()}</p>
                    <p><span className="text-gray-500">Target:</span> {selectedPolicy.targetReduction}% reduction by {selectedPolicy.targetYear}</p>
                    <p className="text-gray-300 mt-2 text-[11px] leading-relaxed">{selectedPolicy.description}</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData(selectedPolicy)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis
                        dataKey="year"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        tickLine={{ stroke: '#9ca3af' }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        tickLine={{ stroke: '#9ca3af' }}
                        label={{ value: 'PM2.5 (μg/m³)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10 } }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <ReferenceLine
                        x={new Date(selectedPolicy.effectiveDate).getFullYear()}
                        stroke="#60a5fa"
                        strokeDasharray="3 3"
                        label={{ value: 'Policy Start', position: 'top', fill: '#60a5fa', fontSize: 9 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pm25"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400">Improvement</p>
                    <p className="text-sm font-bold text-green-400">-{selectedPolicy.improvement.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400">Credibility</p>
                    <p className="text-sm font-bold text-blue-400">{(selectedPolicy.credibility * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-gray-400">Status</p>
                    <p className={`text-sm font-bold ${
                      selectedPolicy.status === 'effective' ? 'text-green-400' :
                      selectedPolicy.status === 'moderate' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedPolicy.status}
                    </p>
                  </div>
                </div>

                {/* Source Link */}
                <a
                  href={selectedPolicy.officialURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  View Official Source →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Main GlobeView component
const GlobeView: React.FC<GlobeViewProps> = ({ onBack }) => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [policyPanelOpen, setPolicyPanelOpen] = useState(false);

  useEffect(() => {
    // Load policies data
    fetch('/data/policies.json')
      .then(res => res.json())
      .then(data => {
        setPolicies(data.policies || []);
      })
      .catch(err => {
        console.error('Failed to load policies:', err);
      });

    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900 overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all duration-200 shadow-lg"
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Global Air Quality</h1>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium">30,000+ Stations</span>
        </div>
      </header>

      {/* Station detail popup */}
      <StationDetail
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />

      {/* Policy Comparison Panel */}
      <PolicyComparisonPanel
        policies={policies}
        isOpen={policyPanelOpen}
        onToggle={() => setPolicyPanelOpen(!policyPanelOpen)}
      />

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-20">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">PM2.5 Levels</h3>
          <div className="space-y-2">
            <LegendItem color="#00ff00" label="Good (0-12)" />
            <LegendItem color="#ffff00" label="Moderate (12-35)" />
            <LegendItem color="#ff8800" label="USG (35-55)" />
            <LegendItem color="#ff0000" label="Unhealthy (55-150)" />
            <LegendItem color="#8b0000" label="Hazardous (150+)" />
          </div>
        </div>
      </div>

      {/* Controls info */}
      <div className="absolute bottom-6 right-6 z-20">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Controls</h3>
          <p className="text-xs text-gray-400">Drag to rotate</p>
          <p className="text-xs text-gray-400">Scroll to zoom</p>
          <p className="text-xs text-gray-400">Click marker for details</p>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium">Loading Globe...</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Stars background */}
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* Earth with stations */}
          <Earth onStationClick={setSelectedStation} />

          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            rotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Helper components
const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded-full"
      style={{ backgroundColor: color }}
    ></div>
    <span className="text-xs text-gray-300">{label}</span>
  </div>
);

// Utility functions
function latLonToVector3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

function getPM25Color(pm25: number): string {
  if (pm25 <= 12) return '#00ff00';      // Green
  if (pm25 <= 35) return '#ffff00';      // Yellow
  if (pm25 <= 55) return '#ff8800';      // Orange
  if (pm25 <= 150) return '#ff0000';     // Red
  return '#8b0000';                      // Dark red
}

function getAQILevel(pm25: number) {
  if (pm25 <= 12) return {
    label: 'Good',
    bgColor: 'bg-green-500',
    textColor: 'text-white'
  };
  if (pm25 <= 35) return {
    label: 'Moderate',
    bgColor: 'bg-yellow-500',
    textColor: 'text-gray-900'
  };
  if (pm25 <= 55) return {
    label: 'Unhealthy for Sensitive Groups',
    bgColor: 'bg-orange-500',
    textColor: 'text-white'
  };
  if (pm25 <= 150) return {
    label: 'Unhealthy',
    bgColor: 'bg-red-500',
    textColor: 'text-white'
  };
  return {
    label: 'Hazardous',
    bgColor: 'bg-purple-900',
    textColor: 'text-white'
  };
}

function generateMockStations(count: number): Station[] {
  const stations: Station[] = [];
  const cities = [
    { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
    { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA' },
    { name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK' },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil' },
    { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt' },
  ];

  for (let i = 0; i < count; i++) {
    const city = cities[i % cities.length];
    const latOffset = (Math.random() - 0.5) * 10;
    const lonOffset = (Math.random() - 0.5) * 10;
    const pm25 = Math.random() * 200;

    stations.push({
      id: `station_${i}`,
      name: `${city.name} Station ${i}`,
      lat: city.lat + latOffset,
      lon: city.lon + lonOffset,
      country: city.country,
      pm25: pm25,
      aqi: Math.round(pm25 * 3),
      updated: new Date().toISOString(),
    });
  }

  return stations;
}

export default GlobeView;
