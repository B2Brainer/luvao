import { formatCalories, formatCurrency, formatPercent, toPeriodDays } from '../research.utils'
import type { OptimizeResponse, ResearchViewFilters, SavingsPotential } from '../types'

type KpiGridProps = {
  filters: ResearchViewFilters
  scenario: OptimizeResponse | null
  savings: SavingsPotential
}

export default function KpiGrid({ filters, scenario, savings }: KpiGridProps) {
  const periodDays = toPeriodDays(filters.timeUnit, filters.durationValue)
  const costPerPersonDay = scenario
    ? scenario.totalEstimated / filters.householdSize / periodDays
    : null
  const coverage = scenario && scenario.requestedItems > 0
    ? scenario.resolvedItems / scenario.requestedItems
    : null
  const calorieCompliance = scenario?.plannedCalories && scenario?.targetCalories
    ? scenario.plannedCalories / scenario.targetCalories
    : null
  const costPerThousandCalories = scenario?.plannedCalories
    ? scenario.totalEstimated / (scenario.plannedCalories / 1000)
    : null

  return (
    <section className="research-kpi-grid">
      <article className="research-kpi-card">
        <span>Costo total estimado</span>
        <strong>{formatCurrency(scenario?.totalEstimated)}</strong>
        <small>Escenario completo para {filters.householdSize} personas</small>
      </article>

      <article className="research-kpi-card">
        <span>Costo por persona y dia</span>
        <strong>{formatCurrency(costPerPersonDay)}</strong>
        <small>Comparacion util para prensa e investigacion</small>
      </article>

      <article className="research-kpi-card">
        <span>Cobertura del optimizador</span>
        <strong>{formatPercent(coverage)}</strong>
        <small>Resueltos {scenario?.resolvedItems ?? 0} de {scenario?.requestedItems ?? 0}</small>
      </article>

      <article className="research-kpi-card">
        <span>Cumplimiento calorico</span>
        <strong>{formatPercent(calorieCompliance)}</strong>
        <small>{formatCalories(scenario?.plannedCalories)} planificadas</small>
      </article>

      <article className="research-kpi-card">
        <span>Costo por 1000 kcal</span>
        <strong>{formatCurrency(costPerThousandCalories)}</strong>
        <small>Metrica derivada de la estimacion calorica actual</small>
      </article>

      <article className="research-kpi-card">
        <span>Ahorro potencial</span>
        <strong>{formatCurrency(savings.total)}</strong>
        <small>{savings.comparableLines} lineas con comparables de tienda</small>
      </article>
    </section>
  )
}