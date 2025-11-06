import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, SunIcon, MoonIcon, CheckIcon } from './Icons';
import { localStorageService } from '../services/localStorage';
import { storageManager } from '../services/storageManager';
import type { AppSettings } from '../types';

interface SettingsViewProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-xl mb-6 tracking-tight">{title}</h3>
        {children}
    </div>
);

const SettingsView: React.FC<SettingsViewProps> = ({ onBack, darkMode, setDarkMode }) => {
  const [settings, setSettings] = useState<AppSettings>(localStorageService.getSettings());
  const [isOnline, setIsOnline] = useState(storageManager.online);
  const [githubConnected, setGithubConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);

  useEffect(() => {
    checkGitHubConnection();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkGitHubConnection = async () => {
    setCheckingConnection(true);
    try {
      const connected = await storageManager.checkGitHubConnection();
      setGithubConnected(connected);
    } catch (error) {
      setGithubConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorageService.saveSettings({ [key]: value });

    if (key === 'darkMode') {
      setDarkMode(value as boolean);
    }
  };

  const storageSize = localStorageService.getStorageSize();
  const storageSizeKB = (storageSize / 1024).toFixed(2);
  const unsyncedCount = storageManager.getUnsyncedCount();

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <header className="p-6 flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10 shadow-lg">
        <button onClick={onBack} className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </header>

      <div className="flex-grow overflow-y-auto p-6 space-y-5">
        <SettingsCard title="Appearance">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Language</span>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value as 'en' | 'ko')}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 border-none outline-none"
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {settings.darkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-blue-500" />}
            </button>
          </div>
        </SettingsCard>

        <SettingsCard title="Data & Sync">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Auto Sync</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Automatically sync to GitHub</p>
              </div>
              <button
                onClick={() => updateSetting('autoSync', !settings.autoSync)}
                className={`w-12 h-6 rounded-full transition-colors ${settings.autoSync ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.autoSync ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Offline Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Disable all network requests</p>
              </div>
              <button
                onClick={() => updateSetting('offlineMode', !settings.offlineMode)}
                className={`w-12 h-6 rounded-full transition-colors ${settings.offlineMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.offlineMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Connection Status</span>
                <span className={`text-sm font-semibold ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">GitHub Status</span>
                <div className="flex items-center gap-2">
                  {checkingConnection ? (
                    <span className="text-sm text-gray-500">Checking...</span>
                  ) : (
                    <>
                      <span className={`text-sm font-semibold ${githubConnected ? 'text-green-500' : 'text-red-500'}`}>
                        {githubConnected ? 'Connected' : 'Not Connected'}
                      </span>
                      <button
                        onClick={checkGitHubConnection}
                        className="text-xs text-blue-500 hover:text-blue-600"
                      >
                        Retry
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Unsynced Records</span>
                <span className={`text-sm font-semibold ${unsyncedCount > 0 ? 'text-orange-500' : 'text-gray-500'}`}>
                  {unsyncedCount}
                </span>
              </div>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Storage">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Local Storage Used</span>
              <span className="text-sm font-semibold">{storageSizeKB} KB</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Records</span>
              <span className="text-sm font-semibold">{storageManager.getHistory().length}</span>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="About">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">AirLens Final</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Version 1.0.0</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A mobile-first air quality monitoring app that uses AI to analyze sky images and estimate PM2.5 levels.
                Data is stored locally and synced to GitHub for backup.
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Powered by Google Gemini AI
              </p>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Developer Info">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">GitHub Storage</span>
              <span className="font-mono text-xs">{githubConnected ? <CheckIcon className="w-4 h-4 text-green-500 inline" /> : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Local Storage</span>
              <span className="font-mono text-xs"><CheckIcon className="w-4 h-4 text-green-500 inline" /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">PWA Support</span>
              <span className="font-mono text-xs"><CheckIcon className="w-4 h-4 text-green-500 inline" /></span>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
};

export default SettingsView;
