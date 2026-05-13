import { Link } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="brand-wrap">
        <img src="/brand/logo-solo.png" alt="Luvao" className="header-logo" />
      </div>

      <nav className="header-nav">
        <a href="#home">Home</a>
        <a href="#stats">Estadisticas</a>
      </nav>

      <div className="header-actions">
        <Link to="/login" className="logout-link">Salir</Link>
      </div>
    </header>
  )
}
