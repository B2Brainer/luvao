import { useNavigate } from 'react-router-dom'
import '../styles/ProductDetail.css'

const MOCK_PRODUCT_DETAIL = {
  id: '1',
  name: 'Arroz 1kg',
  category: 'Canasta DANE · Cereales y granos',
  description:
    'Ficha investigativa de un producto canónico para comparar precio, tendencia y presentación entre supermercados.',
  prices: [
    { store: 'D1', price: 1550, date: '2026-05-12', link: 'https://d1.com.co' },
    { store: 'Olímpica', price: 3800, date: '2026-05-12', link: 'https://olimpica.com' },
    { store: 'Éxito', price: 42900, date: '2026-05-12', link: 'https://exito.com' },
  ],
}

export default function ProductDetail() {
  const nav = useNavigate()
  const product = MOCK_PRODUCT_DETAIL

  const bestPrice = Math.min(...product.prices.map((p) => p.price))
  const worstPrice = Math.max(...product.prices.map((p) => p.price))
  const spread = worstPrice - bestPrice

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={() => nav('/products')}>
        ← Volver al panel
      </button>

      <section className="detail-container">
        <div className="detail-image">
          <div className="detail-badge">Canasta DANE</div>
          <div className="placeholder">
            <div className="placeholder-ring" />
            <span>Ficha comparativa</span>
          </div>
        </div>

        <div className="detail-info">
          <span className="detail-kicker">Resultado investigativo</span>
          <h1>{product.name}</h1>
          <p className="category">{product.category}</p>
          <p className="description">{product.description}</p>

          <div className="detail-grid">
            <div className="best-price">
              <span>Mejor precio</span>
              <p className="price">{bestPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
            </div>

            <div className="best-price muted">
              <span>Diferencia máxima</span>
              <p className="price">{spread.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          <div className="prices-table">
            <div className="table-title">
              <h3>Precios en tiendas</h3>
              <span>actualización reciente</span>
            </div>

            {product.prices.map((p) => {
              const width = Math.max(18, (bestPrice / p.price) * 100)
              return (
                <div key={p.store} className="price-row">
                  <div>
                    <span className="store-name">{p.store}</span>
                    <span className="date">{p.date}</span>
                  </div>
                  <div className="price-track">
                    <div className="price-fill" style={{ width: `${width}%` }} />
                  </div>
                  <span className="price">{p.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</span>
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="link-btn">
                    Ver
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
