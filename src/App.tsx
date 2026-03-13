import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import GlobeView from './pages/GlobeView';
import PolicyView from './pages/PolicyView';
import CameraAI from './pages/CameraAI';
import About from './pages/About';
import Auth from './pages/Auth';
import { Routes, Route } from 'react-router-dom';

function App() {
  const location = useLocation();
  // Globe 페이지에서는 일반적인 레이아웃 구조(Padding 등)를 다르게 처리하기 위함
  const isGlobe = location.pathname === '/globe';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-1 ${isGlobe ? '' : 'pt-20'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/globe" element={<GlobeView />} />
          <Route path="/policy" element={<PolicyView />} />
          <Route path="/camera" element={<CameraAI />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
      {!isGlobe && <Footer />}
    </div>
  );
}

export default App;
