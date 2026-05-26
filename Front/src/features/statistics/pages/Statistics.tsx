import { useState } from 'react'
import { type OptimizationContextSource, useOptimizationContext } from '../../../services/optimizationContext'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import KpiGrid from '../components/KpiGrid'
import ResearchFilters from '../components/ResearchFilters'
import {
  usePriceStats,
  useProjectionScenarios,
  useResearchBasket,
  useResearchScenario,
} from '../hooks/useResearchData'
import {
  buildCategoryTargetRows,
  buildCoverageRows,
  buildStoreSpendRows,
  compactNumber,
  computeSavingsPotential,
  formatCalories,
  formatCurrency,
  formatPercent,
  formatTimeframe,
  toPeriodDays,
} from '../research.utils'
import type { ResearchViewFilters } from '../types'
import '../styles/Statistics.css'

const defaultFilters: ResearchViewFilters = {
  householdSize: 4,
  timeUnit: 'months',
  durationValue: 1,
  dailyCaloriesPerPerson: 2200,
  projectionMode: 'people',
  priceWindowDays: 30,
  priceQuery: '',
  priceStoreName: '',
}

function tooltipNumber(value: number | string | ReadonlyArray<number | string> | undefined) {
  if (Array.isArray(value)) {
    return Number(value[0] ?? 0)
  }

  return Number(value ?? 0)
}

export default function Statistics() {
  const [filters, setFilters] = useState<ResearchViewFilters>(defaultFilters)
  const [sourceOverride, setSourceOverride] = useState<OptimizationContextSource | null>(null)
  const optimizationContext = useOptimizationContext()
  const hasCustomContext = optimizationContext.source === 'custom-list' && optimizationContext.items.length > 0
  const effectiveContext = sourceOverride === 'dane-basket' || !hasCustomContext
    ? { source: 'dane-basket' as const, items: [], updatedAt: optimizationContext.updatedAt }
    : optimizationContext

  const basketQuery = useResearchBasket()
  const basketItems = basketQuery.data ?? []
  const activeSourceItems = effectiveContext.source === 'custom-list'
    ? effectiveContext.items.map((item) => item.product)
    : basketItems.map((item) => item.product)
  const productOptions = [...new Set(activeSourceItems)].sort((a, b) => a.localeCompare(b))
  const activePriceQuery = productOptions.includes(filters.priceQuery)
    ? filters.priceQuery
    : productOptions[0] || ''
  const queryFilters = {
    ...filters,
    priceQuery: activePriceQuery,
  }

  const scenarioQuery = useResearchScenario(filters, effectiveContext)
  const projectionQuery = useProjectionScenarios(filters, effectiveContext)
  const priceStatsQuery = usePriceStats(queryFilters)

  const scenario = scenarioQuery.data ?? null
  const periodDays = toPeriodDays(filters.timeUnit, filters.durationValue)
  const targetCalories = Math.round(filters.householdSize * filters.dailyCaloriesPerPerson * periodDays)
  const storeOptions = [
    ...new Set([
      ...(scenario ? Object.keys(scenario.estimatedByStore) : []),
      ...((priceStatsQuery.data?.byStore ?? []).map((item) => item.storeName)),
      ...(filters.priceStoreName ? [filters.priceStoreName] : []),
    ]),
  ].sort((a, b) => a.localeCompare(b))

  const categoryRows = buildCategoryTargetRows(scenario)
  const coverageRows = buildCoverageRows(scenario?.lines ?? [])
  const storeSpendRows = buildStoreSpendRows(scenario)
  const savings = computeSavingsPotential(scenario?.lines ?? [])
  const projectionRows = projectionQuery.data
    .filter((item) => item.scenario)
    .map((item) => ({
      label: item.label,
      totalEstimated: item.scenario?.totalEstimated ?? 0,
      costPerPersonDay: item.scenario
        ? item.scenario.totalEstimated / item.householdSize / item.periodDays
        : 0,
      coverage: item.scenario && item.scenario.requestedItems > 0
        ? item.scenario.resolvedItems / item.scenario.requestedItems
        : 0,
    }))

  const isRefreshing = scenarioQuery.isFetching || projectionQuery.isFetching || priceStatsQuery.isFetching
  const activeSourceLabel = effectiveContext.source === 'custom-list'
    ? `Lista personalizada activa (${effectiveContext.items.length} ítems)`
    : 'Canasta DANE como base'
  const activeSourceDescription = effectiveContext.source === 'custom-list'
    ? 'Esta vista toma como base la última lista personalizada optimizada y la reutiliza para recalcular costo, cobertura y sensibilidad.'
    : 'Esta vista toma como base la canasta DANE y recalcula costo, cobertura y sensibilidad con el optimizador investigativo.'
  const shouldWarnShortCustomList = effectiveContext.source === 'custom-list' && effectiveContext.items.length < 3

  return (
    <div className="statistics-shell">
      <section className="statistics-hero">
        <div className="statistics-hero-copy">
          <span className="statistics-eyebrow">Investigacion</span>
          <h1>Analiza gasto, cobertura y sensibilidad del optimizador para la canasta familiar.</h1>
          <p>
            {activeSourceDescription}
          </p>

          <div className="statistics-meta-row">
            <span>{activeSourceLabel}</span>
            <span>Filtros reactivos</span>
            <span>Actualizacion automatica cada 60 s</span>
          </div>

          {hasCustomContext && (
            <div className="statistics-chip-row source-switch-row">
              <button
                type="button"
                className={`source-switch-button${effectiveContext.source === 'custom-list' ? ' active' : ''}`}
                onClick={() => setSourceOverride('custom-list')}
              >
                Usar última lista personalizada
              </button>
              <button
                type="button"
                className={`source-switch-button${effectiveContext.source === 'dane-basket' ? ' active' : ''}`}
                onClick={() => setSourceOverride('dane-basket')}
              >
                Usar canasta DANE
              </button>
            </div>
          )}

          {shouldWarnShortCustomList && (
            <div className="statistics-chip-row">
              <span className="statistics-chip alert">
                Lista corta: con menos de 3 ítems los indicadores pueden sobrerrepresentar un solo producto.
              </span>
            </div>
          )}
        </div>

        <div className="statistics-hero-card">
          <div className="hero-metric">
            <span>Escenario activo</span>
            <strong>{filters.householdSize} personas</strong>
          </div>

          <div className="hero-metric">
            <span>Horizonte</span>
            <strong>{formatTimeframe(filters.timeUnit, filters.durationValue)}</strong>
          </div>

          <div className="hero-metric">
            <span>Meta calorica</span>
            <strong>{formatCalories(targetCalories)}</strong>
          </div>

          <div className="hero-metric">
            <span>Registros observados</span>
            <strong>{compactNumber(priceStatsQuery.data?.totalRecords ?? 0)}</strong>
          </div>

          <span className={`refresh-pill${isRefreshing ? ' active' : ''}`}>
            {isRefreshing ? 'Refrescando datos...' : 'Datos sincronizados'}
          </span>
        </div>
      </section>

      <section className="statistics-layout">
        <aside className="statistics-sidebar">
          <ResearchFilters
            filters={{
              ...filters,
              priceQuery: activePriceQuery,
            }}
            onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
            productOptions={productOptions}
            storeOptions={storeOptions}
          />
        </aside>

        <div className="statistics-content">
          {scenarioQuery.error && (
            <div className="statistics-card error-card">
              <h3>No fue posible cargar el escenario principal.</h3>
              <p>{scenarioQuery.error instanceof Error ? scenarioQuery.error.message : 'Error desconocido.'}</p>
            </div>
          )}

          <KpiGrid
            filters={filters}
            scenario={scenario}
            savings={savings}
          />

          <div className="statistics-charts-grid">
            <article className="statistics-card statistics-card-wide">
              <div className="statistics-card-head">
                <div>
                  <h3>
                    {filters.projectionMode === 'people'
                      ? 'Costo proyectado segun numero de personas'
                      : 'Costo proyectado segun horizonte de compra'}
                  </h3>
                  <p>
                    Cada punto recalcula el optimizador usando la última base activa para mostrar sensibilidad del gasto.
                  </p>
                </div>
                <span className="chart-caption">{projectionRows.length} escenarios</span>
              </div>

              {projectionQuery.error ? (
                <div className="empty-state">
                  <h4>No fue posible construir la proyeccion.</h4>
                  <p>{projectionQuery.error.message}</p>
                </div>
              ) : projectionRows.length === 0 ? (
                <div className="loading-block">Construyendo escenarios...</div>
              ) : (
                <div className="chart-shell">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={projectionRows}>
                      <defs>
                        <linearGradient id="projectionFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20,32,51,0.08)" />
                      <XAxis dataKey="label" stroke="#526173" />
                      <YAxis stroke="#526173" tickFormatter={(value: number) => formatCurrency(value)} width={92} />
                      <Tooltip
                        formatter={(value, name) => {
                          const numericValue = tooltipNumber(value)

                          if (name === 'totalEstimated') {
                            return [formatCurrency(numericValue), 'Costo total']
                          }
                          if (name === 'coverage') {
                            return [formatPercent(numericValue), 'Cobertura']
                          }
                          return [formatCurrency(numericValue), 'Costo por persona/dia']
                        }}
                        contentStyle={{ borderRadius: 12, borderColor: 'rgba(14,23,46,0.08)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="totalEstimated"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="url(#projectionFill)"
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  <div className="summary-inline">
                    <span>El escenario activo mantiene {formatPercent(projectionRows.at(-1)?.coverage ?? null)} de cobertura media en el barrido visible.</span>
                    <span>Al cambiar personas, tiempo o kcal, esta curva se recalcula sola.</span>
                  </div>
                </div>
              )}
            </article>

            <article className="statistics-card">
              <div className="statistics-card-head">
                <div>
                  <h3>Cumplimiento calorico por categoria</h3>
                  <p>Compara el objetivo teorico del optimizador con las kcal efectivamente planificadas.</p>
                </div>
              </div>

              {!categoryRows.length ? (
                <div className="loading-block">Esperando datos del optimizador...</div>
              ) : (
                <div className="chart-shell tall">
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={categoryRows} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(20,32,51,0.08)" />
                      <XAxis type="number" stroke="#526173" tickFormatter={(value: number) => compactNumber(value)} />
                      <YAxis type="category" dataKey="category" width={118} stroke="#526173" />
                      <Tooltip
                        formatter={(value, name) => [formatCalories(tooltipNumber(value)), name === 'targetCalories' ? 'Objetivo' : 'Planificado']}
                        contentStyle={{ borderRadius: 12, borderColor: 'rgba(14,23,46,0.08)' }}
                      />
                      <Legend />
                      <Bar dataKey="targetCalories" fill="#93c5fd" radius={[0, 8, 8, 0]} name="Objetivo" />
                      <Bar dataKey="plannedCalories" fill="#22c55e" radius={[0, 8, 8, 0]} name="Planificado" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>

            <article className="statistics-card">
              <div className="statistics-card-head">
                <div>
                  <h3>Distribucion del gasto por tienda</h3>
                  <p>Lectura rapida de concentracion del costo total en cada retail.</p>
                </div>
              </div>

              {!storeSpendRows.length ? (
                <div className="loading-block">Esperando distribucion por tienda...</div>
              ) : (
                <div className="chart-shell">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Tooltip formatter={(value) => [formatCurrency(tooltipNumber(value)), 'Costo']} />
                      <Pie data={storeSpendRows} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={2}>
                        {storeSpendRows.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <ul className="store-legend">
                    {storeSpendRows.map((row) => (
                      <li key={row.name}>
                        <span className="store-dot" style={{ backgroundColor: row.fill }} />
                        <span>{row.name}</span>
                        <strong>{formatCurrency(row.value)}</strong>
                        <small>{formatPercent(row.share)}</small>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            <article className="statistics-card">
              <div className="statistics-card-head">
                <div>
                  <h3>Cobertura del optimizador por categoria</h3>
                  <p>Cuantos items quedaron resueltos y cuantos siguen sin match en el catalogo actual.</p>
                </div>
              </div>

              {!coverageRows.length ? (
                <div className="loading-block">Analizando cobertura...</div>
              ) : (
                <div className="chart-shell tall">
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={coverageRows} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(20,32,51,0.08)" />
                      <XAxis type="number" stroke="#526173" allowDecimals={false} />
                      <YAxis type="category" dataKey="category" width={118} stroke="#526173" />
                      <Tooltip formatter={(value, name) => [tooltipNumber(value), name === 'resolved' ? 'Resueltos' : 'Sin match']} />
                      <Legend />
                      <Bar dataKey="resolved" fill="#14b8a6" radius={[0, 8, 8, 0]} name="Resueltos" />
                      <Bar dataKey="unresolved" fill="#fb7185" radius={[0, 8, 8, 0]} name="Sin match" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="coverage-list">
                    {coverageRows.map((row) => (
                      <span key={row.category}>{row.category}: {formatPercent(row.coverage)}</span>
                    ))}
                  </div>
                </div>
              )}
            </article>

          </div>
        </div>
      </section>
    </div>
  )
}