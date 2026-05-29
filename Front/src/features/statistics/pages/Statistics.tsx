import { useState, type CSSProperties } from 'react'
import { type OptimizationContextSource, useOptimizationContext } from '../../../services/optimizationContext'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ResearchFilters from '../components/ResearchFilters'
import {
  useProjectionScenarios,
  useResearchScenario,
} from '../hooks/useResearchData'
import {
  buildCategoryTargetRows,
  buildStoreSpendRows,
  formatCalories,
  formatCurrency,
  formatPercent,
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

function hasStoreComparison(response: { storeScenarios?: Array<unknown>; estimatedByStore: Record<string, number> } | null | undefined) {
  if (!response) {
    return false
  }

  return Boolean(response.storeScenarios?.length || Object.keys(response.estimatedByStore ?? {}).length)
}

function formatSnapshotTime(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function Statistics() {
  const [filters, setFilters] = useState<ResearchViewFilters>(defaultFilters)
  const [sourceOverride, setSourceOverride] = useState<OptimizationContextSource | null>(null)
  const optimizationContext = useOptimizationContext()
  const hasCustomContext = optimizationContext.source === 'custom-list' && optimizationContext.items.length > 0
  const hasDaneOptimization = optimizationContext.source === 'dane-basket'
  const defaultDaneContext = {
    source: 'dane-basket' as const,
    items: [],
    restrictedStore: null,
    lastOptimization: null,
    updatedAt: optimizationContext.updatedAt,
  }
  const effectiveContext = sourceOverride === 'custom-list'
    ? hasCustomContext
      ? optimizationContext
      : defaultDaneContext
    : sourceOverride === 'dane-basket'
      ? hasDaneOptimization
        ? optimizationContext
        : defaultDaneContext
      : hasCustomContext || hasDaneOptimization
        ? optimizationContext
        : defaultDaneContext

  const scenarioQuery = useResearchScenario(filters, effectiveContext)
  const projectionQuery = useProjectionScenarios(filters, effectiveContext)
  const currentPeriodDays = toPeriodDays(filters.timeUnit, filters.durationValue)
  const currentTargetCalories = Math.round(filters.householdSize * filters.dailyCaloriesPerPerson * currentPeriodDays)

  const scenario = scenarioQuery.data ?? null
  const persistedStoreScenario = hasStoreComparison(effectiveContext.lastOptimization)
    ? effectiveContext.lastOptimization
    : null
  const storeScenarioSource = persistedStoreScenario ?? scenario
  const snapshotTimeLabel = formatSnapshotTime(persistedStoreScenario?.computedAt ?? effectiveContext.updatedAt)
  const persistedBaseTargetCalories = persistedStoreScenario?.targetCalories ?? persistedStoreScenario?.storeScenarios?.[0]?.targetCalories ?? null
  const isScaledPersistedScenario = Boolean(
    persistedStoreScenario &&
    persistedBaseTargetCalories &&
    Math.round(persistedBaseTargetCalories) !== currentTargetCalories,
  )

  const categoryRows = buildCategoryTargetRows(scenario)
  const totalCategoryTargetCalories = categoryRows.reduce((sum, row) => sum + row.targetCalories, 0)
  const maxCategoryCalories = Math.max(
    1,
    ...categoryRows.map((row) => Math.max(row.targetCalories, row.plannedCalories, 0)),
  )
  const categoryBoardRows = categoryRows.map((row) => {
    const targetCalories = Math.max(row.targetCalories, 0)
    const plannedCalories = Math.max(row.plannedCalories, 0)
    const compliance = targetCalories > 0
      ? plannedCalories / targetCalories
      : plannedCalories > 0
        ? 1
        : 0
    const variance = plannedCalories - targetCalories
    const targetWidth = targetCalories > 0 ? Math.max((targetCalories / maxCategoryCalories) * 100, 6) : 0
    const plannedWidth = plannedCalories > 0 ? Math.max((plannedCalories / maxCategoryCalories) * 100, 6) : 0
    const share = totalCategoryTargetCalories > 0 ? targetCalories / totalCategoryTargetCalories : 0
    const status = targetCalories === 0 && plannedCalories === 0
      ? 'idle'
      : compliance < 0.9
        ? 'low'
        : compliance > 1.1
          ? 'high'
          : 'balanced'

    return {
      ...row,
      compliance,
      variance,
      targetWidth,
      plannedWidth,
      share,
      status,
      visualProgress: Math.max(0, Math.min(compliance, 1)) * 100,
      statusLabel: status === 'balanced'
        ? 'OK'
        : status === 'low'
          ? 'Bajo'
          : status === 'high'
            ? 'Alto'
            : 'Sin datos',
    }
  })
  const storeSpendRows = persistedStoreScenario
    ? buildStoreSpendRows(storeScenarioSource, {
        targetCalories: currentTargetCalories,
        periodDays: currentPeriodDays,
      })
    : buildStoreSpendRows(storeScenarioSource)
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

  const shouldWarnShortCustomList = effectiveContext.source === 'custom-list' && effectiveContext.items.length < 3

  return (
    <div className="statistics-shell">
      <section className="statistics-layout">
        <aside className="statistics-sidebar">
          <ResearchFilters
            filters={filters}
            onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
          />
        </aside>

        <div className="statistics-content">
          {(hasCustomContext || shouldWarnShortCustomList) && (
            <div className="statistics-toolbar">
              {hasCustomContext && (
                <div className="statistics-chip-row">
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
          )}

          {scenarioQuery.error && (
            <div className="statistics-card error-card">
              <h3>No fue posible cargar el escenario principal.</h3>
              <p>{scenarioQuery.error instanceof Error ? scenarioQuery.error.message : 'Error desconocido.'}</p>
            </div>
          )}

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
                  <p>Objetivo y plan por categoria en una vista compacta.</p>
                </div>
                <span className="chart-caption">{categoryBoardRows.length} categorias</span>
              </div>

              {!categoryRows.length ? (
                <div className="loading-block">Esperando datos del optimizador...</div>
              ) : (
                <div className="category-compliance-shell">
                  <div className="category-compliance-grid">
                    {categoryBoardRows.map((row) => {
                      const orbStyle = {
                        ['--category-progress' as string]: `${row.visualProgress}%`,
                      } as CSSProperties

                      return (
                        <article className={`category-compliance-tile ${row.status}`} key={row.category}>
                          <div className="category-tile-header">
                            <h4>{row.category}</h4>
                            <span className={`category-state-pill ${row.status}`}>{row.statusLabel}</span>
                          </div>

                          <div className="category-tile-body">
                            <div className={`category-orb ${row.status}`} style={orbStyle}>
                              <div className="category-orb-core">
                                <strong>{formatPercent(row.compliance)}</strong>
                                <span>cumplido</span>
                              </div>
                            </div>

                            <div className="category-metric-stack">
                              <div className="category-meter-row">
                                <div className="category-meter-labels">
                                  <span>Objetivo</span>
                                  <strong>{formatCalories(row.targetCalories)}</strong>
                                </div>
                                <div className="category-meter-track target">
                                  <div className="category-meter-fill" style={{ width: `${row.targetWidth}%` }} />
                                </div>
                              </div>

                              <div className="category-meter-row">
                                <div className="category-meter-labels">
                                  <span>Planificado</span>
                                  <strong>{formatCalories(row.plannedCalories)}</strong>
                                </div>
                                <div className={`category-meter-track planned ${row.status}`}>
                                  <div className="category-meter-fill" style={{ width: `${row.plannedWidth}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="category-tile-footer">
                            <span>{row.variance >= 0 ? '+' : '-'} {formatCalories(Math.abs(row.variance))}</span>
                            <span>{formatPercent(row.share)}</span>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              )}
            </article>

            <article className="statistics-card">
              <div className="statistics-card-head">
                <div>
                  <h3>Costo si compras todo en una sola tienda</h3>
                  <p>
                    {persistedStoreScenario
                      ? 'Usa la última optimización guardada en la home como base y la reescala cuando cambias personas, tiempo o kcal.'
                      : 'Recalcula la misma canasta activa limitando la seleccion a un solo retail y mostrando cobertura real.'}
                  </p>
                </div>
                <span className="chart-caption">
                  {persistedStoreScenario
                    ? isScaledPersistedScenario
                      ? 'Resultado reescalado'
                      : 'Resultado del optimizador'
                    : `${storeSpendRows.length} tiendas`}
                </span>
              </div>

              {!storeSpendRows.length ? (
                <div className="loading-block">Esperando simulacion por tienda...</div>
              ) : (
                <div className="chart-shell">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={storeSpendRows} layout="vertical" margin={{ left: 10, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(20,32,51,0.08)" />
                      <XAxis type="number" stroke="#526173" tickFormatter={(value: number) => formatCurrency(value)} width={96} />
                      <YAxis type="category" dataKey="name" width={108} stroke="#526173" />
                      <Tooltip
                        formatter={(value) => [formatCurrency(tooltipNumber(value)), 'Costo estimado']}
                        contentStyle={{ borderRadius: 12, borderColor: 'rgba(14,23,46,0.08)' }}
                      />
                      <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} name="Costo estimado" />
                    </BarChart>
                  </ResponsiveContainer>

                  {persistedStoreScenario && (
                    <div className="summary-inline">
                      <span>
                        {persistedStoreScenario.restrictedStore
                          ? `La última optimización principal quedó restringida a ${persistedStoreScenario.restrictedStore}.`
                          : 'La última optimización principal pudo combinar tiendas y esta vista conserva esa misma corrida.'}
                      </span>
                      <span>
                        {isScaledPersistedScenario
                          ? `La gráfica se reescaló desde ${formatCalories(persistedBaseTargetCalories)} hasta ${formatCalories(currentTargetCalories)}.`
                          : snapshotTimeLabel
                            ? `Último cálculo guardado: ${snapshotTimeLabel}.`
                            : 'Para recalcular este bloque desde home, vuelve a ejecutar el optimizador principal.'}
                      </span>
                    </div>
                  )}

                  <ul className="store-scenario-list">
                    {storeSpendRows.map((row) => (
                      <li key={row.name}>
                        <div className="store-scenario-header">
                          <strong>{row.name}</strong>
                          <span>{formatCurrency(row.value)}</span>
                        </div>
                        <div className="store-scenario-meta">
                          <span className={`statistics-chip${row.coverage < 1 ? ' alert' : ''}`}>
                            Cobertura {formatPercent(row.coverage)}
                          </span>
                          <span className="statistics-chip">
                            Resueltos {row.resolvedItems}/{row.requestedItems}
                          </span>
                          {row.missingCount > 0 && (
                            <span className="statistics-chip alert">
                              Faltan {row.missingCount}: {row.missingLabel}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

          </div>
        </div>
      </section>
    </div>
  )
}