import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { orchestratorService } from '../../../services/api'
import '../styles/ProductDetail.css'

type CompareRow = {
  id: string
  storeName: string
  sourceName: string
  price: number | null
  matchScore: number
  url?: string | null
}

type CompareResponse = {
  product: string
  bestByStore: CompareRow[]
  ranking: CompareRow[]
}

type StatsResponse = {
  overall: {
    avg: number | null
    min: number | null
    max: number | null
  }
}

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function priceLabel(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  return currency.format(value)
}

function errorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  return fallback
}

function uniqueCompareRows(rows: CompareRow[]) {
  const seen = new Set<string>()
  return rows.filter((row) => {
    const key = row.id || `${row.storeName}-${row.sourceName}-${row.price ?? 'na'}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export default function ProductDetail() {
  const nav = useNavigate()
  const { id } = useParams<{ id: string }>()
  const productQuery = decodeURIComponent(id || '').trim()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [compareData, setCompareData] = useState<CompareResponse | null>(null)
  const [statsData, setStatsData] = useState<StatsResponse | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!productQuery) {
        setError('No se recibió un producto para consultar.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const [compareRes, statsRes] = await Promise.all([
          orchestratorService.compareProduct(productQuery),
          orchestratorService.getPriceStats({ query: productQuery, days: 7 }),
        ])

        setCompareData(compareRes.data)
        setStatsData(statsRes.data)
      } catch (err: unknown) {
        setError(errorMessage(err, 'No se pudo cargar la ficha del producto.'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [productQuery])

  const ranking = useMemo(
    () => uniqueCompareRows([
      ...(compareData?.bestByStore ?? []),
      ...(compareData?.ranking ?? []),
    ]),
    [compareData],
  )

  const bestPrice = useMemo(() => {
    const prices = ranking.map((p) => p.price).filter((p): p is number => p !== null)
    return prices.length ? Math.min(...prices) : null
  }, [ranking])

  const worstPrice = useMemo(() => {
    const prices = ranking.map((p) => p.price).filter((p): p is number => p !== null)
    return prices.length ? Math.max(...prices) : null
  }, [ranking])

  const spread = useMemo(() => {
    if (bestPrice === null || worstPrice === null) {
      return null
    }
    return worstPrice - bestPrice
  }, [bestPrice, worstPrice])

  if (loading) {
    return (
      <div className="product-detail-page">
        <button className="back-btn" onClick={() => nav('/products')}>
          ← Volver al panel
        </button>
        <section className="detail-container">
          <p className="detail-message">Cargando información del producto...</p>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-detail-page">
        <button className="back-btn" onClick={() => nav('/products')}>
          ← Volver al panel
        </button>
        <section className="detail-container">
          <p className="detail-message error">{error}</p>
        </section>
      </div>
    )
  }

  const productName = compareData?.product || productQuery

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
          <h1>{productName}</h1>
          <p className="category">Canasta DANE · Comparación multi-tienda</p>
          <p className="description">
            Ficha investigativa basada en datos reales del backend para analizar precio, variación y coincidencia semántica por supermercado.
          </p>

          <div className="detail-grid">
            <div className="best-price">
              <span>Mejor precio</span>
              <p className="price">{priceLabel(bestPrice)}</p>
            </div>

            <div className="best-price muted">
              <span>Diferencia máxima</span>
              <p className="price">{priceLabel(spread)}</p>
            </div>

            <div className="best-price">
              <span>Promedio 7 días</span>
              <p className="price">{priceLabel(statsData?.overall?.avg)}</p>
            </div>

            <div className="best-price muted">
              <span>Registros comparados</span>
              <p className="price">{ranking.length}</p>
            </div>
          </div>

          <div className="prices-table">
            <div className="table-title">
              <h3>Precios en tiendas</h3>
              <span>actualización reciente</span>
            </div>

            {ranking.slice(0, 14).map((p) => {
              const safePrice = p.price ?? 0
              const width = bestPrice && safePrice > 0 ? Math.max(18, (bestPrice / safePrice) * 100) : 18
              return (
                <div key={p.id} className="price-row">
                  <div>
                    <span className="store-name">{p.storeName}</span>
                    <span className="date">Score: {(p.matchScore * 100).toFixed(1)}%</span>
                  </div>
                  <div className="price-track">
                    <div className="price-fill" style={{ width: `${width}%` }} />
                  </div>
                  <span className="price">{priceLabel(p.price)}</span>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="link-btn">
                      Ver
                    </a>
                  ) : (
                    <span className="link-btn disabled">N/A</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
