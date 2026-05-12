import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { orchestratorService } from '../../../services/api'
import '../styles/Products.css'

type Stats = {
  count: number
  min: number | null
  max: number | null
  avg: number | null
  stdDev: number | null
  cv: number | null
}

type CompareRow = {
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
  bestOverall: CompareRow | null
  bestByStore: CompareRow[]
  ranking: CompareRow[]
}

type PriceStatsResponse = {
  windowDays: number
  since: string
  totalRecords: number
  overall: Stats
  byStore: Array<{ storeName: string; stats: Stats }>
  byQuery: Array<{ query: string; stats: Stats }>
}

type BasketItem = {
  product: string
  quantity: number
  category?: string
  unit?: string | null
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
  selected: CompareRow | null
}

type OptimizeResponse = {
  requestedItems: number
  resolvedItems: number
  unresolvedItems: string[]
  totalEstimated: number
  estimatedByStore: Record<string, number>
  lines: OptimizeLine[]
}

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function priceLabel(price: number | null | undefined) {
  if (price === null || price === undefined) {
    return 'N/A'
  }
  return currency.format(price)
}

function percentLabel(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  return `${(value * 100).toFixed(1)}%`
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
  const [researchBasket, setResearchBasket] = useState<BasketItem[]>([])
  const [priceStats, setPriceStats] = useState<PriceStatsResponse | null>(null)

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
    const loadResearchData = async () => {
      try {
        const [catalogRes, basketRes, statsRes] = await Promise.all([
          orchestratorService.getProductList(),
          orchestratorService.getResearchBasket(),
          orchestratorService.getPriceStats({ days: 7 }),
        ])

        setCatalogProducts(
          Array.isArray(catalogRes.data)
            ? catalogRes.data
            : Array.isArray(catalogRes.data?.products)
              ? catalogRes.data.products
              : [],
        )
        setResearchBasket(Array.isArray(basketRes.data) ? basketRes.data : [])
        setPriceStats(statsRes.data)
      } catch {
        setCatalogProducts([])
      }
    }

    loadResearchData()
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

  const topStores = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of filteredRanking) {
      counts.set(row.storeName, (counts.get(row.storeName) || 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
  }, [filteredRanking])

  const basketCategories = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of researchBasket) {
      const key = item.category || 'sin categoría'
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries())
  }, [researchBasket])

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
      current.map((item) =>
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

  const optimizeDaneBasket = async () => {
    setOptimizeLoading(true)
    setOptimizeError('')
    try {
      const res = await orchestratorService.optimizeList([])
      setOptimizeData(res.data)
    } catch (err: any) {
      setOptimizeError(err.response?.data?.message || 'No se pudo optimizar la canasta DANE.')
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
    <div className="market-shell">
      <section className="research-hero" id="stats">
        <div className="hero-brand-row">
          <img src="/brand/logo-solo.png" alt="Luvao" className="hero-logo" />
          <span className="hero-tag">Panel investigativo · Canasta DANE</span>
        </div>

        <h1>
          Compara precios de mercado con una estructura clara, profesional y orientada a investigación.
        </h1>

        <p>
          Base estadística en tiempo real, comparación por tienda y optimización de canasta familiar sin perder la trazabilidad.
        </p>

        <div className="hero-search">
          <input
            list="catalog-products"
            value={productQuery}
            onChange={(event) => setProductQuery(event.target.value)}
            placeholder="Buscar producto para comparar: arroz, leche, aceite..."
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

        <div className="kpi-strip">
          <article>
            <span>Registros analizados</span>
            <strong>{priceStats?.totalRecords ?? 0}</strong>
          </article>
          <article>
            <span>Promedio general</span>
            <strong>{priceStats ? priceLabel(priceStats.overall.avg) : 'N/A'}</strong>
          </article>
          <article>
            <span>Variabilidad (CV)</span>
            <strong>{priceStats ? percentLabel(priceStats.overall.cv) : 'N/A'}</strong>
          </article>
          <article>
            <span>Tiendas activas</span>
            <strong>{priceStats?.byStore.length ?? 0}</strong>
          </article>
        </div>
      </section>

      <section className="workspace-grid">
        <aside className="left-rail" id="basket">
          <div className="rail-card">
            <h3>Canasta DANE</h3>
            <p>Base oficial usada para la comparación investigativa.</p>

            <div className="rail-stats">
              <div>
                <span>Ítems</span>
                <strong>{researchBasket.length}</strong>
              </div>
              <div>
                <span>Categorías</span>
                <strong>{basketCategories.length}</strong>
              </div>
            </div>

            <div className="category-pills">
              {basketCategories.map(([category, count]) => (
                <span key={category}>{category} ({count})</span>
              ))}
            </div>
          </div>

          <div className="rail-card">
            <h3>Scraping en vivo</h3>
            <button className="secondary" onClick={triggerScraping} disabled={scrapeLoading}>
              {scrapeLoading ? 'Iniciando...' : 'Actualizar precios ahora'}
            </button>

            <div className="status-row">
              <span className={`status-pill ${scrapeJob?.status ?? 'pending'}`}>
                {scrapeJob?.status ?? 'idle'}
              </span>
              <span>{scrapeJob?.updated_at ? new Date(scrapeJob.updated_at).toLocaleTimeString() : 'listo'}</span>
            </div>

            <div className="progress-track">
              <div
                className={`progress-fill ${scrapeJob?.status ?? 'pending'}`}
                style={{ width: `${progressForStatus(scrapeJob?.status)}%` }}
              />
            </div>

            {scrapeError && <p className="error-line">{scrapeError}</p>}

            {scrapeJob?.result && (
              <ul className="job-list">
                <li>Tiendas: {(scrapeJob.result.stores_processed || []).join(', ') || 'N/A'}</li>
                <li>Productos enviados: {scrapeJob.result.products_sent ?? 0}</li>
                <li>Queries: {(scrapeJob.result.queries_processed || []).join(', ') || 'N/A'}</li>
              </ul>
            )}
          </div>

          <div className="rail-card">
            <h3>Acciones rápidas</h3>
            <button onClick={optimizeDaneBasket} disabled={optimizeLoading}>
              {optimizeLoading ? 'Optimizando...' : 'Optimizar canasta DANE'}
            </button>
            <button className="ghost" onClick={() => runOptimize(true)} disabled={optimizeLoading}>
              Optimizar catálogo completo
            </button>
          </div>
        </aside>

        <div className="main-workspace" id="compare">
          <section className="panel-block">
            <div className="panel-head">
              <h2>Resultados de comparación</h2>
              <div className="panel-head-actions">
                <p>Filtra por tienda, límite de precio y orden de análisis.</p>
                {compareData && (
                  <Link to={`/products/${encodeURIComponent(compareData.product)}`} className="detail-link">
                    Ver ficha del producto
                  </Link>
                )}
              </div>
            </div>

            {compareError && <p className="error-line">{compareError}</p>}

            {compareMetrics && (
              <div className="compare-metrics">
                <div>
                  <span>Mejor precio</span>
                  <strong>{priceLabel(compareMetrics.best)}</strong>
                </div>
                <div>
                  <span>Mayor precio</span>
                  <strong>{priceLabel(compareMetrics.worst)}</strong>
                </div>
                <div>
                  <span>Ahorro potencial</span>
                  <strong>{priceLabel(compareMetrics.spread)}</strong>
                </div>
                <div>
                  <span>Coincidencias</span>
                  <strong>{compareMetrics.candidates}</strong>
                </div>
              </div>
            )}

            {compareData ? (
              <>
                <div className="filters-row">
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
                    <option value="unit">Ordenar por unidad</option>
                  </select>
                </div>

                <div className="compare-layout">
                  <div className="results-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Tienda</th>
                          <th>Producto encontrado</th>
                          <th>Precio</th>
                          <th>Presentación</th>
                          <th>Score</th>
                          <th>Enlace</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRanking.slice(0, 18).map((row) => (
                          <tr key={row.id}>
                            <td>{row.storeName}</td>
                            <td>{row.sourceName}</td>
                            <td>{priceLabel(row.price)}</td>
                            <td>{row.presentation?.label || 'N/A'}</td>
                            <td>{percentLabel(row.matchScore)}</td>
                            <td>
                              {row.url ? (
                                <a href={row.url} target="_blank" rel="noreferrer">
                                  Ver
                                </a>
                              ) : (
                                'N/A'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <aside className="insight-rail">
                    <article>
                      <h4>Mejor coincidencia global</h4>
                      <strong>{compareData.bestOverall?.storeName || 'N/A'}</strong>
                      <p>{compareData.bestOverall?.sourceName || 'Sin dato disponible'}</p>
                      <p>{priceLabel(compareData.bestOverall?.price ?? null)}</p>
                    </article>

                    <article>
                      <h4>Top tiendas por hallazgos</h4>
                      {topStores.map(([store, amount]) => (
                        <div className="mini-line" key={store}>
                          <span>{store}</span>
                          <strong>{amount}</strong>
                        </div>
                      ))}
                    </article>

                    <article>
                      <h4>Lectura rápida</h4>
                      <p>
                        {filteredRanking.length > 0
                          ? `Se analizaron ${filteredRanking.length} coincidencias para ${compareData.product}.`
                          : 'Ajusta filtros para recuperar coincidencias.'}
                      </p>
                    </article>
                  </aside>
                </div>
              </>
            ) : (
              <div className="empty-panel">
                <h3>Sin comparación aún</h3>
                <p>Inicia con un producto desde la barra superior para visualizar los resultados.</p>
              </div>
            )}
          </section>

          <section className="panel-block" id="optimize">
            <div className="panel-head">
              <h2>Optimización de lista</h2>
              <p>Construye una lista personalizada o usa la base DANE como punto de partida.</p>
            </div>

            <div className="opt-actions">
              <input
                list="catalog-products"
                value={itemsInput}
                onChange={(event) => setItemsInput(event.target.value)}
                placeholder="Agregar producto"
              />
              <button onClick={addItem}>Agregar</button>
              <button className="secondary" onClick={() => runOptimize(false)} disabled={items.length === 0 || optimizeLoading}>
                {optimizeLoading ? 'Optimizando...' : 'Optimizar lista'}
              </button>
            </div>

            <div className="chips-row">
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
              <div className="opt-result-grid">
                <article className="summary-card">
                  <span>Total estimado</span>
                  <strong>{priceLabel(optimizeData.totalEstimated)}</strong>
                  <small>Resueltos {optimizeData.resolvedItems}/{optimizeData.requestedItems}</small>
                </article>

                <article className="summary-card">
                  <span>Distribución por tienda</span>
                  {Object.entries(optimizeData.estimatedByStore).map(([store, value]) => (
                    <div className="line" key={store}>
                      <span>{store}</span>
                      <strong>{priceLabel(value)}</strong>
                    </div>
                  ))}
                </article>

                <article className="summary-card full">
                  <span>Detalle por ítem</span>
                  {optimizeData.lines.map((line) => (
                    <div className="line" key={line.requested}>
                      <div>
                        <strong>{line.requested}</strong>
                        <small>{line.selected?.storeName || 'sin coincidencia'} · {line.selected?.sourceName || 'sin opción disponible'}</small>
                      </div>
                      <strong>{priceLabel(line.subtotal)}</strong>
                    </div>
                  ))}
                </article>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}

export default Products
