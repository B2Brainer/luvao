import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
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
  nutrition?: { calories?: number | null; label?: string | null }
  pricePerCalorie?: number | null
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
  category?: string
  quantity: number
  caloriesPerPackage?: number | null
  targetCalories?: number | null
  plannedCalories?: number | null
  subtotal: number | null
  selected: CompareRow | null
}

type OptimizeResponse = {
  mode?: 'manual' | 'calorie-plan'
  periodDays?: number
  targetCalories?: number
  plannedCalories?: number
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

function calorieLabel(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  return `${Math.round(value).toLocaleString('es-CO')} kcal`
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

  if (error instanceof Error && error.message) {
    return error.message
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

type SortMode = 'price' | 'score' | 'presentation'

const preferredStoreOrder = ['olimpica', 'd1', 'carulla', 'exito']

const presentationUnitPriority: Record<string, number> = {
  und: 0,
  unds: 0,
  ud: 0,
  uds: 0,
  unidad: 0,
  unidades: 0,
  u: 0,
  mg: 1,
  g: 1,
  gr: 1,
  grs: 1,
  gramo: 1,
  gramos: 1,
  kg: 1,
  kgs: 1,
  kilogramo: 1,
  kilogramos: 1,
  oz: 1,
  onza: 1,
  onzas: 1,
  lb: 1,
  lbs: 1,
  libra: 1,
  libras: 1,
  ml: 2,
  mililitro: 2,
  mililitros: 2,
  l: 2,
  lt: 2,
  lts: 2,
  litro: 2,
  litros: 2,
}

const presentationUnitScale: Record<string, number> = {
  und: 1,
  unds: 1,
  ud: 1,
  uds: 1,
  unidad: 1,
  unidades: 1,
  u: 1,
  mg: 0.001,
  g: 1,
  gr: 1,
  grs: 1,
  gramo: 1,
  gramos: 1,
  kg: 1000,
  kgs: 1000,
  kilogramo: 1000,
  kilogramos: 1000,
  oz: 28.3495,
  onza: 28.3495,
  onzas: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  libra: 453.592,
  libras: 453.592,
  ml: 1,
  mililitro: 1,
  mililitros: 1,
  l: 1000,
  lt: 1000,
  lts: 1000,
  litro: 1000,
  litros: 1000,
}

function parsePresentationValue(label?: string | null) {
  if (!label) {
    return null
  }

  const matches = Array.from(
    label.toLowerCase().matchAll(/(\d+(?:[.,]\d+)?)\s*(kilogramos?|kgs?|kg|gramos?|grs?|gr|g|miligramos?|mg|libras?|lbs?|lb|onzas?|oz|mililitros?|ml|litros?|lts?|lt|l|unidades?|unidad|unds?|uds?|und|ud|u)\b/g),
  )

  if (matches.length === 0) {
    return null
  }

  const parsed = matches
    .map((match) => {
      const amount = Number(match[1].replace(',', '.'))
      const unit = match[2]
      const priority = presentationUnitPriority[unit]
      const scale = presentationUnitScale[unit]

      if (Number.isNaN(amount) || priority === undefined || scale === undefined) {
        return null
      }

      return {
        priority,
        value: amount * scale,
      }
    })
    .filter((entry): entry is { priority: number; value: number } => entry !== null)
    .sort((a, b) => a.priority - b.priority || a.value - b.value)

  return parsed[0] ?? null
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
  const [productQuery, setProductQuery] = useState('')
  const latestProductQuery = useRef(productQuery)
  const [researchBasket, setResearchBasket] = useState<BasketItem[]>([])
  const [priceStats, setPriceStats] = useState<PriceStatsResponse | null>(null)

  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState('')
  const [compareData, setCompareData] = useState<CompareResponse | null>(null)

  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [nameFilter, setNameFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortMode>('price')

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
        const [basketRes, statsRes] = await Promise.all([
          orchestratorService.getResearchBasket(),
          orchestratorService.getPriceStats({ days: 7 }),
        ])

        setResearchBasket(Array.isArray(basketRes.data) ? basketRes.data : [])
        setPriceStats(statsRes.data)
      } catch {
        setResearchBasket([])
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

  useEffect(() => {
    latestProductQuery.current = productQuery
  }, [productQuery])

  useEffect(() => {
    if (scrapeJob?.status !== 'success') {
      return
    }

    const refreshVisibleData = async () => {
      const currentQuery = latestProductQuery.current.trim()
      try {
        const [statsRes, compareRes] = await Promise.all([
          orchestratorService.getPriceStats({ days: 7 }),
          currentQuery
            ? orchestratorService.compareProduct(currentQuery)
            : Promise.resolve(null),
        ])

        setPriceStats(statsRes.data)
        if (compareRes) {
          setCompareData(compareRes.data)
          setSelectedStores([])
          setNameFilter('')
        }
      } catch {
        setScrapeError('El scraping terminó, pero no se pudo refrescar el panel automáticamente.')
      }
    }

    refreshVisibleData()
  }, [scrapeJob?.status])

  const comparisonRows = useMemo(() => {
    return uniqueCompareRows([
      ...(compareData?.bestByStore ?? []),
      ...(compareData?.ranking ?? []),
    ])
  }, [compareData])

  const availableStores = useMemo(() => {
    const stores = new Set(comparisonRows.map((item) => item.storeName))
    return Array.from(stores).sort((left, right) => {
      const leftIndex = preferredStoreOrder.indexOf(left.toLowerCase())
      const rightIndex = preferredStoreOrder.indexOf(right.toLowerCase())
      const leftRank = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex
      const rightRank = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex

      if (leftRank !== rightRank) {
        return leftRank - rightRank
      }

      return left.localeCompare(right, 'es', { sensitivity: 'base' })
    })
  }, [comparisonRows])

  const filteredRanking = useMemo(() => {
    let rows = [...comparisonRows]

    const normalizedNameFilter = nameFilter.trim().toLowerCase()

    if (normalizedNameFilter) {
      rows = rows.filter((row) => row.sourceName.toLowerCase().includes(normalizedNameFilter))
    }

    if (selectedStores.length > 0) {
      rows = rows.filter((row) => selectedStores.includes(row.storeName))
    }

    rows.sort((a, b) => {
      if (sortBy === 'score') {
        return b.matchScore - a.matchScore
      }
      if (sortBy === 'presentation') {
        const left = parsePresentationValue(a.presentation?.label)
        const right = parsePresentationValue(b.presentation?.label)

        if (!left && !right) {
          return (a.presentation?.label || '').localeCompare(b.presentation?.label || '', 'es', { sensitivity: 'base' })
        }
        if (!left) {
          return 1
        }
        if (!right) {
          return -1
        }
        if (left.priority !== right.priority) {
          return left.priority - right.priority
        }
        if (left.value !== right.value) {
          return left.value - right.value
        }
        return (a.presentation?.label || '').localeCompare(b.presentation?.label || '', 'es', { sensitivity: 'base' })
      }
      return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER)
    })

    return rows
  }, [comparisonRows, nameFilter, selectedStores, sortBy])

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

  const handleCompare = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!productQuery.trim()) {
      return
    }

    setCompareLoading(true)
    setCompareError('')
    try {
      const res = await orchestratorService.compareProduct(productQuery.trim())
      setCompareData(res.data)
      setSelectedStores([])
      setNameFilter('')
    } catch (err: unknown) {
      setCompareError(errorMessage(err, 'No se pudo comparar el producto.'))
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

  const runOptimize = async () => {
    setOptimizeLoading(true)
    setOptimizeError('')
    try {
      const res = await orchestratorService.optimizeList(items)
      setOptimizeData(res.data)
    } catch (err: unknown) {
      setOptimizeError(errorMessage(err, 'No se pudo optimizar la lista.'))
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
    } catch (err: unknown) {
      setOptimizeError(errorMessage(err, 'No se pudo optimizar la canasta básica alimentaria.'))
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
    } catch (err: unknown) {
      setScrapeError(errorMessage(err, 'No se pudo iniciar el scraping.'))
      setScrapeJob(null)
    } finally {
      setScrapeLoading(false)
    }
  }

  return (
    <div className="market-shell">
      <section className="research-hero" id="home">
        <h1>
          Encuentra en segundos dónde conviene comprar cada producto.
        </h1>

        <p>
          Busca lo que necesitas, compara opciones por tienda, revisa precios por presentación y arma una lista que se ajuste mejor a tu presupuesto.
        </p>

        <form className="hero-search" onSubmit={handleCompare}>
          <input
            value={productQuery}
            onChange={(event) => setProductQuery(event.target.value)}
            placeholder="Buscar producto para comparar: arroz, leche, aceite..."
          />
          <button type="submit" disabled={compareLoading}>
            {compareLoading ? 'Comparando...' : 'Comparar'}
          </button>
        </form>

        <div className="kpi-strip" id="stats">
          <article>
            <span>Registros analizados</span>
            <strong>{priceStats?.totalRecords ?? 0}</strong>
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
            <h3>Canasta básica alimentaria</h3>
            <p>Lista de referencia usada para comparar productos esenciales.</p>

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
            <button type="button" className="secondary" onClick={triggerScraping} disabled={scrapeLoading}>
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
            <button type="button" onClick={optimizeDaneBasket} disabled={optimizeLoading}>
              {optimizeLoading ? 'Optimizando...' : 'Optimizar canasta básica'}
            </button>
          </div>
        </aside>

        <div className="main-workspace" id="compare">
          <section className="panel-block">
            <div className="panel-head">
              <h2>Resultados de comparación</h2>
            </div>

            {compareError && <p className="error-line">{compareError}</p>}

            {compareData ? (
              <>
                {comparisonRows.length === 0 ? (
                  <div className="empty-panel">
                    <h3>Sin productos disponibles</h3>
                    <p>No se encontraron productos relevantes para esta búsqueda.</p>
                  </div>
                ) : (
                  <>
                    <div className="filters-row">
                      <input
                        type="search"
                        value={nameFilter}
                        onChange={(event) => setNameFilter(event.target.value)}
                        placeholder="Buscar por nombre del producto"
                      />

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

                      <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortMode)}>
                        <option value="presentation">Ordenar por presentación</option>
                        <option value="price">Ordenar por precio</option>
                        <option value="score">Ordenar por score</option>
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
                            {filteredRanking.map((row) => (
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
                          <p>Se analizaron {filteredRanking.length} coincidencias para {compareData.product}.</p>
                        </article>
                      </aside>
                    </div>
                  </>
                )}
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
              <p>Construye una lista personalizada o usa la canasta básica como punto de partida.</p>
            </div>

            <form
              className="opt-actions"
              onSubmit={(event) => {
                event.preventDefault()
                addItem()
              }}
            >
              <input
                value={itemsInput}
                onChange={(event) => setItemsInput(event.target.value)}
                placeholder="Agregar producto"
              />
              <button type="submit">Agregar</button>
              <button type="button" className="secondary" onClick={runOptimize} disabled={items.length === 0 || optimizeLoading}>
                {optimizeLoading ? 'Optimizando...' : 'Optimizar lista'}
              </button>
            </form>

            <div className="chips-row">
              {items.map((item) => (
                <div className="chip" key={item.product}>
                  <strong>{item.product}</strong>
                  <div className="qty-controls">
                    <button type="button" onClick={() => changeQuantity(item.product, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => changeQuantity(item.product, 1)}>+</button>
                  </div>
                  <button type="button" className="remove" onClick={() => removeItem(item.product)}>x</button>
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

                {optimizeData.mode === 'calorie-plan' && (
                  <article className="summary-card">
                    <span>Meta calórica</span>
                    <strong>{calorieLabel(optimizeData.plannedCalories)}</strong>
                    <small>
                      Objetivo {calorieLabel(optimizeData.targetCalories)} · {optimizeData.periodDays ?? 30} días
                    </small>
                  </article>
                )}

                <article className="summary-card full">
                  <span>Detalle por ítem</span>
                  {optimizeData.lines.map((line) => (
                    <div className="line item-line" key={line.requested}>
                      <div className="item-detail">
                        <strong>{line.requested}</strong>
                        <small>
                          {line.quantity > 0 ? `${line.quantity} x ` : ''}
                          {line.selected?.storeName || 'sin coincidencia'} · {line.selected?.sourceName || 'sin opción disponible'}
                          {line.plannedCalories ? ` · ${calorieLabel(line.plannedCalories)}` : ''}
                        </small>
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
