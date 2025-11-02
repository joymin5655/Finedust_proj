import React, { useState, useEffect } from 'react';
import type { View } from './types';
import CameraView from './Finedust_model/CameraView';
import GlobeView from './Policy/GlobeView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [view, setView] = useState<View>('camera');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderView = () => {
    switch (view) {
      case 'globe':
        return <GlobeView onBack={() => setView('camera')} />;
      case 'settings':
        return <SettingsView onBack={() => setView('camera')} darkMode={darkMode} setDarkMode={setDarkMode} />;
      case 'camera':
      default:
        return <CameraView onNavigateToGlobe={() => setView('globe')} onNavigateToSettings={() => setView('settings')} />;
    }
  };
  
  const containerClasses = `mx-auto h-screen flex flex-col shadow-2xl bg-white dark:bg-gray-900/50 backdrop-blur-3xl ${
    view === 'globe' ? 'w-full' : 'max-w-md lg:max-w-4xl'
  }`;

  return (
    <div className="min-h-screen font-sans text-black dark:text-white bg-gray-100 dark:bg-black">
      <div className={containerClasses}>
        {renderView()}
      </div>
    </div>
  );
};

export default App;