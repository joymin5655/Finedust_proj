import React, { useState, useMemo } from 'react';
import type { Policy } from '../types';
import { PolicyCategory } from '../types';
import { ArrowLeftIcon, CloseIcon } from './icons';

const mockPolicies: Policy[] = [
  { id: 'us-naaqs', country: 'USA', authority: 'EPA', category: PolicyCategory.PM25_REDUCTION, title: 'National Ambient Air Quality Standards (NAQS)', description: 'Sets standards for PM2.5 and other pollutants.', officialURL: 'https://www.epa.gov/criteria-air-pollutants/naaqs-table', credibility: 0.99 },
  { id: 'sk-fdrp', country: 'South Korea', authority: 'AirKorea', category: PolicyCategory.PM25_REDUCTION, title: 'Fine Dust Reduction Plans', description: 'Comprehensive national strategy to reduce fine dust pollution.', officialURL: 'https://www.air.go.kr/', credibility: 0.99 },
  { id: 'eu-aqd', country: 'EU', authority: 'EEA', category: PolicyCategory.EMISSION_STANDARDS, title: 'EU Air Quality Directive (2008/50/EC)', description: 'Sets legally binding limits for air pollutants that impact public health.', officialURL: 'https://www.eea.europa.eu/themes/air', credibility: 0.99 },
  { id: 'in-ncap', country: 'India', authority: 'CPCB', category: PolicyCategory.CLIMATE_ACTION, title: 'National Clean Air Programme (NCAP)', description: 'Aims for a 20-30% reduction in PM concentrations by 2024.', officialURL: 'https://cpcb.nic.in/', credibility: 0.92 },
  { id: 'cn-aqiap', country: 'China', authority: 'CNEMC', category: PolicyCategory.PM25_REDUCTION, title: 'Air Quality Improvement Action Plan', description: 'Aggressive measures to control air pollution in key industrial regions.', officialURL: 'http://www.cnemc.cn/', credibility: 0.95 },
  { id: 'jp-apcl', country: 'Japan', authority: 'MOE', category: PolicyCategory.EMISSION_STANDARDS, title: 'Air Pollution Control Law', description: 'Regulates the emission of smoke and soot from industrial activities.', officialURL: 'https://www.env.go.jp/en/air/aq/index.html', credibility: 0.98 },
  { id: 'us-caa', country: 'USA', authority: 'EPA', category: PolicyCategory.CLIMATE_ACTION, title: 'Clean Air Act (CAA)', description: 'Comprehensive federal law that regulates air emissions from stationary and mobile sources.', officialURL: 'https://www.epa.gov/clean-air-act-overview', credibility: 0.99 },
];

const stations = [
    { name: 'Washington D.C.', country: 'USA', lat: 38.9, lon: -77.0 },
    { name: 'Seoul', country: 'South Korea', lat: 37.5, lon: 127.0 },
    { name: 'Brussels', country: 'EU', lat: 50.8, lon: 4.3 },
    { name: 'New Delhi', country: 'India', lat: 28.6, lon: 77.2 },
    { name: 'Beijing', country: 'China', lat: 39.9, lon: 116.4 },
    { name: 'Tokyo', country: 'Japan', lat: 35.7, lon: 139.7 },
];

const arcs = [
    { startLat: 39.9, startLon: 116.4, endLat: 35.7, endLon: 139.7 }, // Beijing to Tokyo
    { startLat: 28.6, startLon: 77.2, endLat: 39.9, endLon: 116.4 }, // Delhi to Beijing
    { startLat: 50.8, startLon: 4.3, endLat: 38.9, endLon: -77.0 }, // Brussels to DC
    { startLat: 38.9, startLon: -77.0, endLat: 35.7, endLon: 139.7 }, // DC to Tokyo
];

const PolicyPanel: React.FC<{ policies: Policy[]; country: string; onClose: () => void; isVisible: boolean; }> = ({ policies, country, onClose, isVisible }) => {
    const getCredibilityColor = (credibility: number) => {
        if (credibility > 0.95) return 'bg-green-500';
        if (credibility > 0.85) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    return (
        <div className={`absolute top-0 right-0 h-full w-full sm:w-96 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-2xl z-30 transform transition-transform duration-500 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
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
                </div>
            </div>
        </div>
    );
};

const GlobeView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [isPanelVisible, setIsPanelVisible] = useState(false);

    const handleStationClick = (country: string) => {
        setSelectedCountry(country);
        setIsPanelVisible(true);
    };

    const closePanel = () => {
        setIsPanelVisible(false);
    };

    const filteredPolicies = useMemo(() => {
        if (!selectedCountry) return [];
        return mockPolicies.filter(p => p.country === selectedCountry);
    }, [selectedCountry]);

    return (
        <div className="flex flex-col h-full bg-gray-800 dark:bg-black relative overflow-hidden">
            <header className="absolute top-0 left-0 p-4 flex items-center z-20">
                <button onClick={onBack} className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors text-white">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold ml-4 text-white text-shadow">Global Policy Explorer</h2>
            </header>

            <div className="flex-grow flex items-center justify-center globe-container">
                <div className="w-[300px] h-[300px] relative globe">
                    <div className="absolute inset-0 border-2 border-blue-400/20 rounded-full"></div>
                    <div className="absolute inset-0 transform rotate-x-90 border border-blue-400/20 rounded-full"></div>
                    <div className="absolute inset-0 transform rotate-y-90 border border-blue-400/20 rounded-full"></div>

                    {/* Stations */}
                    {stations.map(station => (
                        <div
                            key={station.name}
                            className="station-marker"
                            style={{ transform: `rotateY(${station.lon}deg) rotateX(${-station.lat}deg) translateZ(150px)` }}
                            onClick={() => handleStationClick(station.country)}
                        >
                            <div className="w-2 h-2 bg-brand-yellow rounded-full cursor-pointer transform transition-transform hover:scale-150"></div>
                            <div className="tooltip px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg pointer-events-none">
                                {station.name}
                            </div>
                        </div>
                    ))}
                    
                    {/* Atmospheric Arcs */}
                    {arcs.map((arc, index) => (
                       <svg key={index} className="absolute w-full h-full top-0 left-0 overflow-visible" style={{ transform: `rotateY(${arc.startLon}deg) rotateX(${-arc.startLat}deg)` }}>
                          <defs>
                              <radialGradient id={`grad${index}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" style={{stopColor: 'rgba(255,255,0,0.8)', stopOpacity:1}} />
                                <stop offset="100%" style={{stopColor: 'rgba(255,165,0,0)', stopOpacity:0}} />
                              </radialGradient>
                          </defs>
                          <path d={`M 150,0 A 150,150 0 0,1 ${150 + (arc.endLon - arc.startLon)}, ${150 - (arc.endLat - arc.startLat)}`} stroke="none" fill="none" id={`arcpath${index}`} />
                          {/* Fix: Cast style object to React.CSSProperties to allow for custom CSS properties. */}
                          <circle r="3" fill={`url(#grad${index})`} className="arc" style={{'--arc-path': `path("M 150,0 A 150,150 0 0,1 ${150 + (arc.endLon - arc.startLon) * 1.2}, ${150 - (arc.endLat - arc.startLat)*1.2}")`} as React.CSSProperties} />
                       </svg>
                    ))}
                </div>
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