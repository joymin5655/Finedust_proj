import React from 'react';
import { CameraIcon, HistoryIcon, CloudSyncIcon, SignalTowerIcon, MapPinIcon } from './Icons';

interface LandingPageProps {
  onLaunchApp: () => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}> = ({ icon, title, description, gradient }) => (
  <div className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] cursor-default">
    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-gray-300 leading-relaxed">{description}</p>
  </div>
);

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
    <div className="text-4xl font-bold text-white mb-2">{value}</div>
    <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white overflow-auto">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-block px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in">
            <span className="text-sm font-semibold text-blue-300">No External APIs • 100% Privacy</span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            AirLens
          </h1>

          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-semibold animate-fade-in" style={{ animationDelay: '0.2s' }}>
            AI-Powered Air Quality Monitoring
          </p>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Analyze air quality in real-time using just your camera.
            No external APIs. Complete privacy. Works offline.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={onLaunchApp}
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.05] active:scale-[0.98] transition-all duration-200"
            >
              Launch App
            </button>
            <a
              href="#features"
              className="px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-lg hover:bg-white/20 hover:scale-[1.05] active:scale-[0.98] transition-all duration-200"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
            <StatCard value="0" label="External APIs" />
            <StatCard value="100%" label="Privacy" />
            <StatCard value="Offline" label="Works Anywhere" />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Powerful Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need for air quality monitoring, beautifully designed and privacy-focused
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<CameraIcon className="w-8 h-8 text-white" />}
              title="Camera Analysis"
              description="Capture sky photos and get instant PM2.5 readings using advanced image analysis algorithms."
              gradient="from-blue-500 to-blue-600"
            />
            <FeatureCard
              icon={<SignalTowerIcon className="w-8 h-8 text-white" />}
              title="Station Data"
              description="Access simulated monitoring station data with realistic time-based pollution patterns."
              gradient="from-purple-500 to-purple-600"
            />
            <FeatureCard
              icon={<MapPinIcon className="w-8 h-8 text-white" />}
              title="Location Tracking"
              description="Automatic location detection with reverse geocoding using free OpenStreetMap API."
              gradient="from-green-500 to-green-600"
            />
            <FeatureCard
              icon={<HistoryIcon className="w-8 h-8 text-white" />}
              title="Measurement History"
              description="Track all your measurements with detailed timestamps, locations, and AQI levels."
              gradient="from-orange-500 to-orange-600"
            />
            <FeatureCard
              icon={<CloudSyncIcon className="w-8 h-8 text-white" />}
              title="GitHub Sync"
              description="Automatically sync your data to GitHub for backup and cross-device access."
              gradient="from-teal-500 to-teal-600"
            />
            <FeatureCard
              icon={<div className="text-3xl">📱</div>}
              title="PWA Support"
              description="Install as a native app on any device. Works offline with full functionality."
              gradient="from-pink-500 to-pink-600"
            />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-6 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple, fast, and completely private
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-2xl">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Capture</h3>
              <p className="text-gray-400 leading-relaxed">
                Take a photo of the sky using your camera or upload an existing image
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-2xl">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Analyze</h3>
              <p className="text-gray-400 leading-relaxed">
                Local AI analyzes brightness, saturation, and color to estimate PM2.5 levels
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-2xl">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Results</h3>
              <p className="text-gray-400 leading-relaxed">
                Get instant air quality readings with detailed AQI information and recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 tracking-tight">Built With Modern Tech</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Cutting-edge technologies for the best experience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['React 19', 'TypeScript', 'Vite 6', 'Tailwind CSS', 'Canvas API', 'PWA', 'GitHub API', 'LocalStorage'].map((tech) => (
              <div key={tech} className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-center hover:border-white/20 hover:scale-105 transition-all duration-200">
                <div className="text-lg font-bold text-white">{tech}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Check Your Air Quality?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start monitoring air quality in seconds. No signup required.
            </p>
            <button
              onClick={onLaunchApp}
              className="px-12 py-6 rounded-2xl bg-white text-blue-600 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.05] active:scale-[0.98] transition-all duration-200"
            >
              Launch AirLens Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p className="mb-4">
            <span className="font-semibold text-white">AirLens</span> • Made with ❤️ by joymin5655
          </p>
          <p className="text-sm">
            <a href="https://github.com/joymin5655/Finedust_proj" className="hover:text-white transition-colors">
              View on GitHub
            </a>
            {' • '}
            <span>No External AI APIs Required</span>
            {' • '}
            <span>100% Privacy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
