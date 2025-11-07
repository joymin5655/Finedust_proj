import React, { useState, useEffect } from 'react';
import type { View } from './types';
import LandingPage from './components/LandingPage';
import CameraView from './components/CameraView';
import GlobeView from './components/GlobeView';
import HistoryView from './components/HistoryView';
import PolicyView from './components/PolicyView';
import SettingsView from './components/SettingsView';
import { localStorageService } from './services/localStorage';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [view, setView] = useState<View>('camera');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    // Load settings
    const settings = localStorageService.getSettings();
    setDarkMode(settings.darkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLaunchApp = () => {
    setShowLanding(false);
    setView('camera');
  };

  const handleNavigateToGlobe = () => {
    setShowLanding(false);
    setView('globe');
  };

  const renderView = () => {
    switch (view) {
      case 'globe':
        return <GlobeView onBack={() => setView('camera')} />;
      case 'history':
        return <HistoryView onBack={() => setView('camera')} />;
      case 'policy':
        return <PolicyView onBack={() => setView('camera')} />;
      case 'settings':
        return <SettingsView onBack={() => setView('camera')} darkMode={darkMode} setDarkMode={setDarkMode} />;
      case 'camera':
      default:
        return (
          <CameraView
            onNavigateToHistory={() => setView('history')}
            onNavigateToPolicy={() => setView('policy')}
            onNavigateToSettings={() => setView('settings')}
          />
        );
    }
  };

  // Show landing page
  if (showLanding) {
    return (
      <LandingPage
        onLaunchApp={handleLaunchApp}
        onNavigateToGlobe={handleNavigateToGlobe}
      />
    );
  }

  // Show main app
  const containerClasses = `mx-auto h-screen flex flex-col shadow-2xl bg-white dark:bg-gray-900/50 backdrop-blur-3xl ${
    view === 'camera' ? 'max-w-md lg:max-w-4xl' : 'w-full'
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
