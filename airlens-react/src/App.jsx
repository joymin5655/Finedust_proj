import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import './App.css'
import './styles/main.css'
import './styles/responsive.css'
import './styles/accessibility.css'
import './styles/performance.css'
import './styles/globe.css'
import './styles/camera.css'
import './styles/settings.css'

// Components
import Navbar from './components/Navbar'
import ThemeToggle from './components/ThemeToggle'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Globe = lazy(() => import('./pages/Globe'))
const Camera = lazy(() => import('./pages/Camera'))
const Research = lazy(() => import('./pages/Research'))
const About = lazy(() => import('./pages/About'))
const Settings = lazy(() => import('./pages/Settings'))

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--color-bg)'
  }}>
    <div className="spinner"></div>
  </div>
)

function App() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <div className="App">
      <Navbar />
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/globe" element={<Globe />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/research" element={<Research />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
