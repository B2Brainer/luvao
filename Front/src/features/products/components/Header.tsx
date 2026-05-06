import { Link } from 'react-router-dom'
import './Header.css'

export default function Header() {

  return (
    <header className="header">
      <div className="brand-wrap">
        <p className="brand-badge">LUVAO</p>
        <span>Comparador inteligente de mercado</span>
      </div>

      <nav className="header-nav">
        <a href="#">Búsqueda</a>
        <a href="#">Comparación</a>
        <a href="#">Lista optimizada</a>
      </nav>

      <div className="header-actions">
        <Link to="/login">Salir</Link>
      </div>
    </header>
  )
}