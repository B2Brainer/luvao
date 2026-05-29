import { useNavigate } from 'react-router-dom'
import './ProductCard.css'

type ProductCardData = {
  id: string
  name: string
  store?: string
  price?: number | null
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const nav = useNavigate()
  return (
    <div className="product-card" onClick={() => nav(`/products/${product.id}`)}>
      <div className="product-thumb" />
      <h3 className="product-title">{product.name}</h3>
      <p className="product-store">{product.store ?? 'Tienda no disponible'}</p>
      <p className="product-price">
        {typeof product.price === 'number' ? `$${product.price.toLocaleString()}` : 'N/A'}
      </p>
    </div>
  )
}
