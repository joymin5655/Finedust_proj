import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import GlobeView from './pages/GlobeView';
import PolicyView from './pages/PolicyView';
import CameraAI from './pages/CameraAI';
import About from './pages/About';
import Auth from './pages/Auth';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/globe" element={<GlobeView />} />
          <Route path="/policy" element={<PolicyView />} />
          <Route path="/camera" element={<CameraAI />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;