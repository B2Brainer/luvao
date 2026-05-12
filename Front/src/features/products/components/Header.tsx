import { Link } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="brand-wrap">
        <img src="/brand/logo-solo.png" alt="Luvao" className="header-logo" />
        <div>
          <p className="brand-badge">Comparador investigativo</p>
          <span>Canasta DANE · supermercados · estadísticas</span>
        </div>
      </div>

      <nav className="header-nav">
        <a href="#stats">Estadísticas</a>
        <a href="#compare">Comparación</a>
        <a href="#basket">Canasta DANE</a>
        <a href="#optimize">Optimización</a>
      </nav>

      <div className="header-actions">
        <Link to="/login" className="logout-link">Salir</Link>
      </div>
    </header>
  )
}