import { Helmet } from 'react-helmet-async';
import IntelligenceEngines from '../components/dashboard/IntelligenceEngines';
import PlatformHub from '../components/dashboard/PlatformHub';
import HeroProfile from '../components/dashboard/HeroProfile';
import LocalSensing from '../components/dashboard/LocalSensing';
import PersonalVault from '../components/dashboard/PersonalVault';
import { useAuthStore } from '../logic/useAuthStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen overflow-y-auto lg:overflow-y-hidden lg:overflow-x-auto no-scrollbar snap-y lg:snap-x snap-mandatory bg-bg-base transition-colors duration-500 selection:bg-primary/20">
      <Helmet>
        <title>AirLens | Atmospheric Intelligence Story</title>
        <meta name="description" content="Explore the invisible world of air quality through glass-box AI and physics-ML fusion." />
      </Helmet>

      {/* Chapter 0: Personalized Hero & Profile */}
      <div className="snap-center lg:shrink-0">
        <HeroProfile />
      </div>

      {/* Chapter 1: Intelligence Engines */}
      <div className="snap-center lg:shrink-0">
        <IntelligenceEngines />
      </div>

      {/* Chapter 2: Local Sensing (Upgrade) */}
      <div className="snap-center lg:shrink-0">
        <LocalSensing />
      </div>

      {/* Chapter 3: Navigation & Platform Hub */}
      <div className="snap-center lg:shrink-0">
        <PlatformHub />
      </div>

      {/* Chapter 4: Personal Vault (Archive) — 로그인 사용자만 */}
      {user && (
        <div className="snap-center lg:shrink-0">
          <PersonalVault />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
