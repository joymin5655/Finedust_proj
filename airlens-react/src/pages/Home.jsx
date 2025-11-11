import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import './Home.css'

function Home() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 100

    class Particle {
      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = Math.random() * 2 + 1
        this.opacity = Math.random() * 0.5 + 0.2
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(37, 226, 244, ${this.opacity})`
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="home-page">
      <canvas ref={canvasRef} className="hero-canvas" />

      <div className="hero-content">
        <h1 className="hero-title">
          🌍 AirLens
        </h1>
        <p className="hero-subtitle">
          See the Air - Interactive Global Air Quality Visualization
        </p>
        <p className="hero-description">
          Real-time PM2.5 monitoring • AI-powered predictions • Advanced 3D visualization
        </p>

        <div className="hero-buttons">
          <Link to="/globe" className="btn btn-primary">
            Explore Globe →
          </Link>
          <Link to="/camera" className="btn btn-secondary">
            Camera AI →
          </Link>
        </div>

        <div className="hero-features">
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>NO API KEYS NEEDED</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🇪🇺</span>
            <span>Official EU Copernicus Data</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🌍</span>
            <span>174+ Cities Worldwide</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📸</span>
            <span>AI-Powered Analysis</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
