import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { ArrowLeftIcon, SunIcon, MoonIcon } from './icons';

interface SettingsViewProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const modelPerformanceData = [
  { device: 'iPhone 12', latency: 1.2, rmse: 8.2 },
  { device: 'iPhone 12 Pro', latency: 1.1, rmse: 8.15 },
  { device: 'iPhone 13', latency: 0.95, rmse: 8.1 },
  { device: 'iPhone 14 Pro', latency: 0.85, rmse: 8.1 },
];

const dataSources = [
    { name: 'WAQI API', description: 'Primary source for 500k+ ground monitoring stations.' },
    { name: 'IQAir API', description: 'Secondary source for verified station data.' },
    { name: 'NOAA GFS', description: 'Provides global wind and weather forecast data.' },
    { name: 'NASA FIRMS', description: 'Real-time global wildfire tracking.' },
    { name: 'Sentinel-5P', description: 'Satellite data for Aerosol Optical Depth (AOD).' },
];

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        {children}
    </div>
);

const SettingsView: React.FC<SettingsViewProps> = ({ onBack, darkMode, setDarkMode }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <header className="p-4 flex items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold ml-4">Settings</h2>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        <SettingsCard title="Appearance">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Language</span>
            <select className="p-2 rounded-md bg-gray-200 dark:bg-gray-700">
              <option>English</option>
              <option>한국어</option>
            </select>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
              {darkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-blue-500" />}
            </button>
          </div>
        </SettingsCard>
        
        <SettingsCard title="Data Sources">
            <ul className="space-y-3">
                {dataSources.map(source => (
                    <li key={source.name}>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{source.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{source.description}</p>
                    </li>
                ))}
            </ul>
        </SettingsCard>

        <SettingsCard title="Model Performance">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Performance metrics across different devices.</p>
            <div className="h-60 w-full mb-4">
                <h4 className="text-center font-semibold mb-2 text-sm">Inference Latency (seconds)</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={modelPerformanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="device" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip contentStyle={{backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none'}}/>
                        <Legend />
                        <Line type="monotone" dataKey="latency" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="h-60 w-full">
                <h4 className="text-center font-semibold mb-2 text-sm">Prediction Accuracy (RMSE μg/m³)</h4>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelPerformanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="device" fontSize={12} />
                        <YAxis domain={[8.0, 8.3]} fontSize={12} />
                        <Tooltip contentStyle={{backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none'}}/>
                        <Legend />
                        <Bar dataKey="rmse" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </SettingsCard>
      </div>
    </div>
  );
};

export default SettingsView;
