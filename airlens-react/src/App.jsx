import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import './styles/main.css'
import './styles/responsive.css'
import './styles/accessibility.css'
import './styles/performance.css'

// Components
import Navbar from './components/Navbar'
import ThemeToggle from './components/ThemeToggle'

// Pages
import Home from './pages/Home'
import Globe from './pages/Globe'
import Camera from './pages/Camera'
import Research from './pages/Research'
import About from './pages/About'
import Settings from './pages/Settings'

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/globe" element={<Globe />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/research" element={<Research />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
