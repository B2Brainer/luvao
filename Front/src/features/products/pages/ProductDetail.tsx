import { useParams, useNavigate } from 'react-router-dom'
import '../styles/ProductDetail.css'

// mock para UI
const MOCK_PRODUCT_DETAIL = {
  id: '1',
  name: 'Arroz 1kg',
  category: 'Alimentos',
  description: 'Arroz blanco de grano largo, ideal para preparar cualquier comida.',
  prices: [
    { store: 'Éxito', price: 4200, date: '2025-11-26', link: 'https://exito.com' },
    { store: 'Olimpica', price: 4500, date: '2025-11-25', link: 'https://olimpica.com' },
    { store: 'Colsubsidio', price: 3900, date: '2025-11-24', link: 'https://colsubsidio.com' },
  ],
}

export default function ProductDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const product = MOCK_PRODUCT_DETAIL // reemplazar con fetch real

  const bestPrice = Math.min(...product.prices.map(p => p.price))

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={() => nav('/products')}>← Volver</button>
      
      <div className="detail-container">
        <div className="detail-image">
          <div className="placeholder" />
        </div>

        <div className="detail-info">
          <h1>{product.name}</h1>
          <p className="category">{product.category}</p>
          <p className="description">{product.description}</p>

          <div className="best-price">
            <span>Mejor precio:</span>
            <p className="price">${bestPrice.toLocaleString()}</p>
          </div>

          <div className="prices-table">
            <h3>Precios en tiendas</h3>
            {product.prices.map((p, i) => (
              <div key={i} className="price-row">
                <span className="store-name">{p.store}</span>
                <span className="price">${p.price.toLocaleString()}</span>
                <span className="date">{p.date}</span>
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="link-btn">
                  Ver
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}