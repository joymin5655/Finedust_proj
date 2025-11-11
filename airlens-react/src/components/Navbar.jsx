import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          🌍 AirLens
        </Link>

        <ul className="navbar-nav">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/globe" className="nav-link">Globe</Link></li>
          <li><Link to="/camera" className="nav-link">Camera AI</Link></li>
          <li><Link to="/research" className="nav-link">Research</Link></li>
          <li><Link to="/about" className="nav-link">About</Link></li>
          <li><Link to="/settings" className="nav-link">Settings</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
