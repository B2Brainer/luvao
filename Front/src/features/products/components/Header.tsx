import { Link, NavLink } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="brand-wrap">
        <img src="/brand/logo-solo.png" alt="Luvao" className="header-logo" />
      </div>

      <nav className="header-nav">
        <NavLink to="/products">Home</NavLink>
        <NavLink to="/statistics">Estadisticas</NavLink>
      </nav>

      <div className="header-actions">
        <Link to="/login" className="logout-link">Salir</Link>
      </div>
    </header>
  )
}
