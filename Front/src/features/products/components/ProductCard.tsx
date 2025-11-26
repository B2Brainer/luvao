import { useNavigate } from 'react-router-dom'
import './ProductCard.css'

export default function ProductCard({ product }: { product: any }) {
  const nav = useNavigate()
  return (
    <div className="product-card" onClick={() => nav(`/products/${product.id}`)}>
      <div className="product-thumb" />
      <h3 className="product-title">{product.name}</h3>
      <p className="product-store">{product.store}</p>
      <p className="product-price">${product.price.toLocaleString()}</p>
    </div>
  )
}