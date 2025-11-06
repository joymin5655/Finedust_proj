import React, { useState, useMemo, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import type { Policy } from '../types';
import { PolicyCategory } from '../types';
import { ArrowLeftIcon, CloseIcon } from '../components/icons';

const mockPolicies: Policy[] = [
  { id: 'us-naaqs', country: 'USA', authority: 'EPA', category: PolicyCategory.PM25_REDUCTION, title: 'National Ambient Air Quality Standards (NAQS)', description: 'Sets standards for PM2.5 and other pollutants.', officialURL: 'https://www.epa.gov/criteria-air-pollutants/naaqs-table', credibility: 0.99 },
  { id: 'sk-fdrp', country: 'South Korea', authority: 'AirKorea', category: PolicyCategory.PM25_REDUCTION, title: 'Fine Dust Reduction Plans', description: 'Comprehensive national strategy to reduce fine dust pollution.', officialURL: 'https://www.air.go.kr/', credibility: 0.99 },
  { id: 'eu-aqd', country: 'EU', authority: 'EEA', category: PolicyCategory.EMISSION_STANDARDS, title: 'EU Air Quality Directive (2008/50/EC)', description: 'Sets legally binding limits for air pollutants that impact public health.', officialURL: 'https://www.eea.europa.eu/themes/air', credibility: 0.99 },
  { id: 'in-ncap', country: 'India', authority: 'CPCB', category: PolicyCategory.CLIMATE_ACTION, title: 'National Clean Air Programme (NCAP)', description: 'Aims for a 20-30% reduction in PM concentrations by 2024.', officialURL: 'https://cpcb.nic.in/', credibility: 0.92 },
  { id: 'cn-aqiap', country: 'China', authority: 'CNEMC', category: PolicyCategory.PM25_REDUCTION, title: 'Air Quality Improvement Action Plan', description: 'Aggressive measures to control air pollution in key industrial regions.', officialURL: 'http://www.cnemc.cn/', credibility: 0.95 },
  { id: 'jp-apcl', country: 'Japan', authority: 'MOE', category: PolicyCategory.EMISSION_STANDARDS, title: 'Air Pollution Control Law', description: 'Regulates the emission of smoke and soot from industrial activities.', officialURL: 'https://www.env.go.jp/en/air/aq/index.html', credibility: 0.98 },
  { id: 'us-caa', country: 'USA', authority: 'EPA', category: PolicyCategory.CLIMATE_ACTION, title: 'Clean Air Act (CAA)', description: 'Comprehensive federal law that regulates air emissions from stationary and mobile sources.', officialURL: 'https://www.epa.gov/clean-air-act-overview', credibility: 0.99 },
  { id: 'uk-ca', country: 'UK', authority: 'DEFRA', category: PolicyCategory.CLIMATE_ACTION, title: 'UK Clean Air Strategy', description: 'Sets out a comprehensive plan to tackle all sources of air pollution.', officialURL: 'https://www.gov.uk/government/publications/clean-air-strategy-2019', credibility: 0.97 },
  { id: 'au-nes', country: 'Australia', authority: 'DCCEEW', category: PolicyCategory.EMISSION_STANDARDS, title: 'National Clean Air Agreement', description: 'A framework for governments to work together on air quality issues.', officialURL: 'https://www.dcceew.gov.au/environment/air/national-clean-air-agreement', credibility: 0.94 },
  { id: 'br-pnca', country: 'Brazil', authority: 'MMA', category: PolicyCategory.PUBLIC_HEALTH, title: 'National Policy on Climate Change (PNMC)', description: 'Establishes commitments to reduce greenhouse gas emissions.', officialURL: 'https://antigo.mma.gov.br/clima/politica-nacional-sobre-mudanca-do-clima.html', credibility: 0.88 },
];

const stations = [
    { name: 'Washington D.C.', country: 'USA', lat: 38.9, lon: -77.0 },
    { name: 'Seoul', country: 'South Korea', lat: 37.5, lon: 127.0 },
    { name: 'Brussels', country: 'EU', lat: 50.8, lon: 4.3 },
    { name: 'New Delhi', country: 'India', lat: 28.6, lon: 77.2 },
    { name: 'Beijing', country: 'China', lat: 39.9, lon: 116.4 },
    { name: 'Tokyo', country: 'Japan', lat: 35.7, lon: 139.7 },
    { name: 'Los Angeles', country: 'USA', lat: 34.05, lon: -118.24 },
    { name: 'London', country: 'UK', lat: 51.50, lon: -0.12 },
    { name: 'Moscow', country: 'Russia', lat: 55.75, lon: 37.61 },
    { name: 'Cairo', country: 'Egypt', lat: 30.04, lon: 31.23 },
    { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.90, lon: -43.17 },
    { name: 'Sydney', country: 'Australia', lat: -33.86, lon: 151.20 },
    { name: 'Jakarta', country: 'Indonesia', lat: -6.20, lon: 106.84 },
    { name: 'Mexico City', country: 'Mexico', lat: 19.43, lon: -99.13 },
    { name: 'Lagos', country: 'Nigeria', lat: 6.52, lon: 3.37 }
];

const PolicyPanel: React.FC<{ policies: Policy[]; country: string; onClose: () => void; isVisible: boolean; }> = ({ policies, country, onClose, isVisible }) => {
    const getCredibilityColor = (credibility: number) => {
        if (credibility > 0.95) return 'bg-green-500';
        if (credibility > 0.85) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    return (
        <div className={`absolute top-0 right-0 h-full w-full sm:w-96 md:w-[420px] lg:w-[480px] bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-2xl z-30 transform transition-transform duration-500 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg">Policies for {country}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                    {policies.map(policy => (
                        <div key={policy.id} className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{policy.authority}</p>
                                    <h4 className="font-bold text-sm text-brand-blue">{policy.title}</h4>
                                </div>
                                <div className="flex items-center space-x-2 text-xs flex-shrink-0 ml-2">
                                    <div className={`w-3 h-3 rounded-full ${getCredibilityColor(policy.credibility)}`}></div>
                                    <span>{(policy.credibility * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <p className="text-xs mt-2 text-gray-600 dark:text-gray-300">{policy.description}</p>
                            <a href={policy.officialURL} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-blue hover:underline mt-2 block">
                                Official Source &rarr;
                            </a>
                        </div>
                    ))}
                     {policies.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">No policies available for this region.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const GlobeView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const globeEl = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setSize({ width, height });
            }
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, []);

    const globeMaterial = useMemo(() => {
        const material = new THREE.MeshPhongMaterial();
        material.color = new THREE.Color(0x1a202c);
        material.emissive = new THREE.Color(0x2a3a5a);
        material.emissiveIntensity = 0.1;
        material.shininess = 0.1;
        return material;
    }, []);

    useEffect(() => {
        if (!globeEl.current) return;

        const controls = globeEl.current.controls();
        controls.autoRotate = false;
        controls.enableZoom = true;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (globeEl.current) {
                    globeEl.current.pointOfView({ 
                        lat: pos.coords.latitude, 
                        lng: pos.coords.longitude, 
                        altitude: 2.0 
                    }, 1500);
                }
            },
            (err) => {
                console.error("Could not get user location:", err.message);
                if (globeEl.current) {
                    globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1500);
                }
            }
        );
    }, []);

    const handleHexClick = (hex: any) => {
        if (hex && hex.points.length > 0) {
            const countryCounts = hex.points.reduce((acc: any, p: any) => {
                acc[p.country] = (acc[p.country] || 0) + 1;
                return acc;
            }, {});
            const dominantCountry = Object.keys(countryCounts).reduce((a, b) => countryCounts[a] > countryCounts[b] ? a : b);
            setSelectedCountry(dominantCountry);
            setIsPanelVisible(true);
        }
    };

    const closePanel = () => {
        setIsPanelVisible(false);
    };

    const filteredPolicies = useMemo(() => {
        if (!selectedCountry) return [];
        return mockPolicies.filter(p => p.country === selectedCountry);
    }, [selectedCountry]);

    const getHexColor = (avgPm25: number): string => {
        if (avgPm25 <= 12) return '#30d158'; // Good
        if (avgPm25 <= 35) return '#ffd60a'; // Moderate
        if (avgPm25 <= 55) return '#ff9f0a'; // Unhealthy for Sensitive
        if (avgPm25 <= 150) return '#ff453a'; // Unhealthy
        return '#bf5af2'; // Hazardous
    };
    
    const augmentedStations = useMemo(() => stations.map(s => ({
        ...s,
        pm25: Math.random() * 160,
    })), []);

    return (
        <div className="flex flex-col h-full bg-black relative overflow-hidden">
            <header className="absolute top-0 left-0 w-full p-4 flex items-center z-20">
                <button onClick={onBack} className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors text-white">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl md:text-2xl font-bold ml-4 text-white text-shadow">Global AQI Explorer</h2>
            </header>
            
            <div ref={containerRef} className="flex-grow w-full h-full absolute inset-0">
                <Globe
                    ref={globeEl}
                    width={size.width}
                    height={size.height}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    globeMaterial={globeMaterial}

                    hexBinPointsData={augmentedStations}
                    hexBinPointLat="lat"
                    hexBinPointLng="lon"
                    hexBinPointWeight="pm25"
                    hexBinResolution={3}
                    hexMargin={0.25}
                    hexAltitude={(d: { sumWeight: number }) => d.sumWeight * 0.0005}
                    hexTopColor={(d: { points: any[] }) => {
                        const avgPm25 = d.points.reduce((acc, p) => acc + p.pm25, 0) / d.points.length;
                        return getHexColor(avgPm25);
                    }}
                    hexSideColor={(d: { points: any[] }) => {
                        const avgPm25 = d.points.reduce((acc, p) => acc + p.pm25, 0) / d.points.length;
                        return getHexColor(avgPm25);
                    }}
                    hexLabel={(d: any) => `
                        <div class="p-2 rounded-md bg-gray-900/80 text-white text-sm">
                            <div class="font-bold">${d.points.length} stations</div>
                            <div>Avg PM2.5: ${(d.points.reduce((acc:number, p:any) => acc + p.pm25, 0) / d.points.length).toFixed(1)} µg/m³</div>
                        </div>
                    `}
                    onHexClick={handleHexClick}
                    hexTransitionDuration={300}
                />
            </div>

            <PolicyPanel
                policies={filteredPolicies}
                country={selectedCountry || ''}
                onClose={closePanel}
                isVisible={isPanelVisible}
            />
        </div>
    );
};

export default GlobeView;