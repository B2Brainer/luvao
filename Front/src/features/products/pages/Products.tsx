import { useEffect, useMemo, useState } from 'react'
import { orchestratorService } from '../../../services/api'
import '../styles/Products.css'

type RankingRow = {
  id: string
  storeName: string
  sourceName: string
  price: number | null
  pricePerUnit: number | null
  matchScore: number
  presentation?: { label?: string | null }
  url?: string | null
}

type CompareResponse = {
  product: string
  comparedCount: number
  bestOverall: RankingRow | null
  bestByStore: RankingRow[]
  ranking: RankingRow[]
}

type ScrapingJob = {
  id: string
  status: 'pending' | 'running' | 'success' | 'failed'
  updated_at?: string
  result?: {
    stores_processed?: string[]
    products_sent?: number
    queries_processed?: string[]
  }
  error?: string
}

type OptimizeLine = {
  requested: string
  quantity: number
  subtotal: number | null
  selected: RankingRow | null
}

type OptimizeResponse = {
  requestedItems: number
  resolvedItems: number
  unresolvedItems: string[]
  totalEstimated: number
  estimatedByStore: Record<string, number>
  lines: OptimizeLine[]
}

function priceLabel(price: number | null | undefined) {
  if (price === null || price === undefined) {
    return 'N/A'
  }
  return `$${price.toLocaleString('es-CO')}`
}

function progressForStatus(status?: ScrapingJob['status']) {
  if (status === 'pending') {
    return 25
  }
  if (status === 'running') {
    return 70
  }
  return 100
}

function Products() {
  const [productQuery, setProductQuery] = useState('arroz')
  const [catalogProducts, setCatalogProducts] = useState<string[]>([])

  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState('')
  const [compareData, setCompareData] = useState<CompareResponse | null>(null)

  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'price' | 'score' | 'unit'>('price')

  const [itemsInput, setItemsInput] = useState('')
  const [items, setItems] = useState<Array<{ product: string; quantity: number }>>([])
  const [optimizeLoading, setOptimizeLoading] = useState(false)
  const [optimizeError, setOptimizeError] = useState('')
  const [optimizeData, setOptimizeData] = useState<OptimizeResponse | null>(null)

  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeError, setScrapeError] = useState('')
  const [scrapeJob, setScrapeJob] = useState<ScrapingJob | null>(null)

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await orchestratorService.getProductList()
        setCatalogProducts(Array.isArray(res.data?.products) ? res.data.products : [])
      } catch {
        setCatalogProducts([])
      }
    }

    loadCatalog()
  }, [])

  useEffect(() => {
    if (!scrapeJob?.id || !['pending', 'running'].includes(scrapeJob.status)) {
      return
    }

    const interval = setInterval(async () => {
      try {
        const res = await orchestratorService.getScrapingJobStatus(scrapeJob.id)
        setScrapeJob(res.data)
      } catch {
        setScrapeError('No se pudo consultar el estado del scraping en tiempo real.')
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [scrapeJob])

  const availableStores = useMemo(() => {
    const stores = new Set((compareData?.ranking ?? []).map((item) => item.storeName))
    return Array.from(stores)
  }, [compareData])

  const filteredRanking = useMemo(() => {
    let rows = [...(compareData?.ranking ?? [])]

    if (selectedStores.length > 0) {
      rows = rows.filter((row) => selectedStores.includes(row.storeName))
    }

    if (maxPrice !== null && !Number.isNaN(maxPrice)) {
      rows = rows.filter((row) => row.price !== null && row.price <= maxPrice)
    }

    rows.sort((a, b) => {
      if (sortBy === 'score') {
        return b.matchScore - a.matchScore
      }
      if (sortBy === 'unit') {
        return (a.pricePerUnit ?? Number.MAX_SAFE_INTEGER) - (b.pricePerUnit ?? Number.MAX_SAFE_INTEGER)
      }
      return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER)
    })

    return rows
  }, [compareData, selectedStores, maxPrice, sortBy])

  const compareMetrics = useMemo(() => {
    if (!compareData || filteredRanking.length === 0) {
      return null
    }

    const prices = filteredRanking
      .map((row) => row.price)
      .filter((value): value is number => value !== null)

    if (prices.length === 0) {
      return null
    }

    const best = Math.min(...prices)
    const worst = Math.max(...prices)
    const spread = worst - best

    return {
      best,
      worst,
      spread,
      candidates: filteredRanking.length,
    }
  }, [compareData, filteredRanking])

  const handleCompare = async () => {
    if (!productQuery.trim()) {
      return
    }

    setCompareLoading(true)
    setCompareError('')
    try {
      const res = await orchestratorService.compareProduct(productQuery.trim())
      setCompareData(res.data)
      setSelectedStores([])
      setMaxPrice(null)
    } catch (err: any) {
      setCompareError(err.response?.data?.message || 'No se pudo comparar el producto.')
      setCompareData(null)
    } finally {
      setCompareLoading(false)
    }
  }

  const toggleStore = (store: string) => {
    setSelectedStores((current) => {
      if (current.includes(store)) {
        return current.filter((item) => item !== store)
      }
      return [...current, store]
    })
  }

  const addItem = () => {
    const product = itemsInput.trim().toLowerCase()
    if (!product) {
      return
    }

    setItems((current) => {
      const found = current.find((item) => item.product === product)
      if (found) {
        return current.map((item) =>
          item.product === product
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...current, { product, quantity: 1 }]
    })
    setItemsInput('')
  }

  const changeQuantity = (product: string, delta: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.product === product
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item,
        ),
    )
  }

  const removeItem = (product: string) => {
    setItems((current) => current.filter((item) => item.product !== product))
  }

  const runOptimize = async (fullCatalog = false) => {
    setOptimizeLoading(true)
    setOptimizeError('')
    try {
      const res = fullCatalog
        ? await orchestratorService.optimizeFullCatalog()
        : await orchestratorService.optimizeList(items)
      setOptimizeData(res.data)
    } catch (err: any) {
      setOptimizeError(err.response?.data?.message || 'No se pudo optimizar la lista.')
      setOptimizeData(null)
    } finally {
      setOptimizeLoading(false)
    }
  }

  const triggerScraping = async () => {
    setScrapeLoading(true)
    setScrapeError('')
    try {
      const res = await orchestratorService.refreshScraping()
      if (!res.data?.jobId) {
        throw new Error('El backend no devolvió jobId para seguimiento en tiempo real.')
      }
      setScrapeJob({ id: res.data.jobId, status: res.data.jobStatus || 'pending' })
    } catch (err: any) {
      setScrapeError(err.response?.data?.message || err.message || 'No se pudo iniciar el scraping.')
      setScrapeJob(null)
    } finally {
      setScrapeLoading(false)
    }
  }

  return (
    <div className="ux-shell">
      <section className="hero-card">
        <p className="hero-kicker">Comparador inteligente en tiempo real</p>
        <h1>Encuentra el mejor precio por tienda y optimiza tu mercado completo</h1>
        <p className="hero-copy">
          Busca un producto para comparar fuentes, activa scraping con seguimiento en vivo y construye una lista
          optimizada con total estimado por tienda.
        </p>
      </section>

      <section className="panel-grid">
        <article className="panel panel-search">
          <h2>Búsqueda y comparación</h2>
          <p>Consulta un producto canónico y recibe ranking por score semántico y precio.</p>

          <div className="search-row">
            <input
              list="catalog-products"
              value={productQuery}
              onChange={(event) => setProductQuery(event.target.value)}
              placeholder="Ej: arroz, aceite, atun"
            />
            <datalist id="catalog-products">
              {catalogProducts.map((product) => (
                <option value={product} key={product} />
              ))}
            </datalist>
            <button onClick={handleCompare} disabled={compareLoading}>
              {compareLoading ? 'Comparando...' : 'Comparar'}
            </button>
          </div>

          {compareError && <p className="error-line">{compareError}</p>}

          {compareMetrics && (
            <div className="metrics-grid">
              <div>
                <span>Mejor precio</span>
                <strong>{priceLabel(compareMetrics.best)}</strong>
              </div>
              <div>
                <span>Precio más alto</span>
                <strong>{priceLabel(compareMetrics.worst)}</strong>
              </div>
              <div>
                <span>Ahorro potencial</span>
                <strong>{priceLabel(compareMetrics.spread)}</strong>
              </div>
              <div>
                <span>Candidatos visibles</span>
                <strong>{compareMetrics.candidates}</strong>
              </div>
            </div>
          )}

          {compareData && (
            <>
              <div className="filters-bar">
                <div className="store-filter">
                  {availableStores.map((store) => (
                    <label key={store}>
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store)}
                        onChange={() => toggleStore(store)}
                      />
                      {store}
                    </label>
                  ))}
                </div>

                <input
                  type="number"
                  min={0}
                  value={maxPrice ?? ''}
                  onChange={(event) => {
                    const raw = event.target.value
                    setMaxPrice(raw ? Number(raw) : null)
                  }}
                  placeholder="Precio máximo"
                />

                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'price' | 'score' | 'unit')}>
                  <option value="price">Ordenar por precio</option>
                  <option value="score">Ordenar por score</option>
                  <option value="unit">Ordenar por precio por unidad</option>
                </select>
              </div>

              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Tienda</th>
                      <th>Producto homologado</th>
                      <th>Precio</th>
                      <th>Presentación</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRanking.slice(0, 18).map((row) => (
                      <tr key={row.id}>
                        <td>{row.storeName}</td>
                        <td>
                          <div className="line-name">{row.sourceName}</div>
                          {row.url && (
                            <a href={row.url} target="_blank" rel="noreferrer">
                              ver enlace
                            </a>
                          )}
                        </td>
                        <td>{priceLabel(row.price)}</td>
                        <td>{row.presentation?.label || 'N/A'}</td>
                        <td>{(row.matchScore * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </article>

        <article className="panel panel-scraping">
          <h2>Scraping en tiempo real</h2>
          <p>Dispara actualización y monitorea el estado del job en vivo.</p>

          <button onClick={triggerScraping} disabled={scrapeLoading}>
            {scrapeLoading ? 'Iniciando...' : 'Actualizar precios ahora'}
          </button>
          {scrapeError && <p className="error-line">{scrapeError}</p>}

          {scrapeJob && (
            <div className="job-card">
              <div className="job-header">
                <span>Job</span>
                <strong>{scrapeJob.id}</strong>
              </div>

              <div className="status-row">
                <span className={`status-pill ${scrapeJob.status}`}>{scrapeJob.status}</span>
                <span>{scrapeJob.updated_at ? new Date(scrapeJob.updated_at).toLocaleTimeString() : 'en progreso'}</span>
              </div>

              <div className="progress-track">
                <div
                  className={`progress-fill ${scrapeJob.status}`}
                  style={{ width: `${progressForStatus(scrapeJob.status)}%` }}
                />
              </div>

              {scrapeJob.result && (
                <ul>
                  <li>Tiendas procesadas: {(scrapeJob.result.stores_processed || []).join(', ') || 'N/A'}</li>
                  <li>Productos enviados: {scrapeJob.result.products_sent ?? 0}</li>
                  <li>Queries: {(scrapeJob.result.queries_processed || []).join(', ') || 'N/A'}</li>
                </ul>
              )}

              {scrapeJob.error && <p className="error-line">{scrapeJob.error}</p>}
            </div>
          )}
        </article>
      </section>

      <section className="panel panel-list">
        <h2>Lista de compras optimizada</h2>
        <p>Agrega productos y recibe selección por tienda con total estimado.</p>

        <div className="list-actions">
          <input
            list="catalog-products"
            value={itemsInput}
            onChange={(event) => setItemsInput(event.target.value)}
            placeholder="Agregar producto a la lista"
          />
          <button onClick={addItem}>Agregar</button>
          <button
            className="alt"
            onClick={() => runOptimize(false)}
            disabled={items.length === 0 || optimizeLoading}
          >
            {optimizeLoading ? 'Optimizando...' : 'Optimizar lista'}
          </button>
          <button className="ghost" onClick={() => runOptimize(true)} disabled={optimizeLoading}>
            Optimizar catálogo completo
          </button>
        </div>

        <div className="chips">
          {items.map((item) => (
            <div className="chip" key={item.product}>
              <strong>{item.product}</strong>
              <div className="qty-controls">
                <button onClick={() => changeQuantity(item.product, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => changeQuantity(item.product, 1)}>+</button>
              </div>
              <button className="remove" onClick={() => removeItem(item.product)}>x</button>
            </div>
          ))}
        </div>

        {optimizeError && <p className="error-line">{optimizeError}</p>}

        {optimizeData && (
          <div className="optimize-grid">
            <div className="summary-box">
              <h3>Total estimado</h3>
              <p>{priceLabel(optimizeData.totalEstimated)}</p>
              <small>
                Resueltos {optimizeData.resolvedItems}/{optimizeData.requestedItems}
              </small>
            </div>

            <div className="summary-box">
              <h3>Distribución por tienda</h3>
              {Object.entries(optimizeData.estimatedByStore).map(([store, value]) => (
                <div className="store-line" key={store}>
                  <span>{store}</span>
                  <strong>{priceLabel(value)}</strong>
                </div>
              ))}
            </div>

            <div className="summary-box full">
              <h3>Detalle por ítem</h3>
              {optimizeData.lines.map((line) => (
                <div className="line-detail" key={line.requested}>
                  <div>
                    <strong>{line.requested}</strong>
                    <small>
                      {line.selected?.storeName || 'sin coincidencia'} · {line.selected?.sourceName || 'sin opción disponible'}
                    </small>
                  </div>
                  <span>{priceLabel(line.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default Products

