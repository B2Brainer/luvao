import type {
  OptimizeLine,
  OptimizeResponse,
  PriceSeriesResponse,
  PriceStatsResponse,
  ProjectionRequest,
  ResearchTimeUnit,
  ResearchViewFilters,
  SavingsPotential,
} from './types'

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat('es-CO', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 0,
})

const storePalette = ['#2563eb', '#14b8a6', '#f97316', '#8b5cf6', '#e11d48', '#22c55e']

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A'
  }

  return currencyFormatter.format(value)
}

export function compactNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A'
  }

  return compactFormatter.format(value)
}

export function formatCalories(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A'
  }

  return `${numberFormatter.format(Math.round(value))} kcal`
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'N/A'
  }

  return `${(value * 100).toFixed(1)}%`
}

export function toPeriodDays(timeUnit: ResearchTimeUnit, durationValue: number) {
  const safeDuration = Math.max(1, Math.round(durationValue))

  if (timeUnit === 'days') {
    return safeDuration
  }

  if (timeUnit === 'weeks') {
    return safeDuration * 7
  }

  return safeDuration * 30
}

export function formatTimeframe(timeUnit: ResearchTimeUnit, durationValue: number) {
  const safeDuration = Math.max(1, Math.round(durationValue))

  if (timeUnit === 'days') {
    return `${safeDuration} ${safeDuration === 1 ? 'dia' : 'dias'}`
  }

  if (timeUnit === 'weeks') {
    return `${safeDuration} ${safeDuration === 1 ? 'semana' : 'semanas'}`
  }

  return `${safeDuration} ${safeDuration === 1 ? 'mes' : 'meses'}`
}

function uniqueSorted(values: number[], currentValue: number) {
  return [...new Set([...values, Math.max(1, Math.round(currentValue))])].sort((left, right) => left - right)
}

export function buildProjectionRequests(filters: ResearchViewFilters): ProjectionRequest[] {
  if (filters.projectionMode === 'people') {
    const householdSizes = uniqueSorted([1, 2, 3, 4, 5, 6], filters.householdSize)
    const periodDays = toPeriodDays(filters.timeUnit, filters.durationValue)

    return householdSizes.map((householdSize) => ({
      key: `people-${householdSize}-${periodDays}`,
      label: `${householdSize}`,
      householdSize,
      periodDays,
      targetCalories: Math.round(householdSize * filters.dailyCaloriesPerPerson * periodDays),
    }))
  }

  const durationValues = filters.timeUnit === 'days'
    ? uniqueSorted([7, 14, 30, 60, 90], filters.durationValue)
    : filters.timeUnit === 'weeks'
      ? uniqueSorted([1, 2, 4, 8, 12], filters.durationValue)
      : uniqueSorted([1, 2, 3, 6, 12], filters.durationValue)

  return durationValues.map((durationValue) => {
    const periodDays = toPeriodDays(filters.timeUnit, durationValue)

    return {
      key: `duration-${filters.timeUnit}-${durationValue}-${filters.householdSize}`,
      label: formatTimeframe(filters.timeUnit, durationValue),
      householdSize: filters.householdSize,
      periodDays,
      targetCalories: Math.round(filters.householdSize * filters.dailyCaloriesPerPerson * periodDays),
    }
  })
}

export function buildCategoryTargetRows(response: OptimizeResponse | null | undefined) {
  return (response?.categoryTargets ?? []).map((item) => ({
    category: item.category,
    targetCalories: item.targetCalories,
    plannedCalories: item.plannedCalories,
  }))
}

export function buildStoreSpendRows(response: OptimizeResponse | null | undefined) {
  if (!response) {
    return []
  }

  return Object.entries(response.estimatedByStore)
    .sort((left, right) => right[1] - left[1])
    .map(([name, value], index) => ({
      name,
      value,
      share: response.totalEstimated > 0 ? value / response.totalEstimated : 0,
      fill: storePalette[index % storePalette.length],
    }))
}

export function buildCoverageRows(lines: OptimizeLine[]) {
  const byCategory = new Map<string, { resolved: number; unresolved: number }>()

  for (const line of lines) {
    const category = line.category ?? 'Sin categoria'
    const current = byCategory.get(category) ?? { resolved: 0, unresolved: 0 }

    if (line.selected && line.subtotal !== null) {
      current.resolved += 1
    } else {
      current.unresolved += 1
    }

    byCategory.set(category, current)
  }

  return [...byCategory.entries()]
    .map(([category, values]) => {
      const total = values.resolved + values.unresolved

      return {
        category,
        resolved: values.resolved,
        unresolved: values.unresolved,
        coverage: total > 0 ? values.resolved / total : 0,
      }
    })
    .sort((left, right) => right.coverage - left.coverage)
}

export function buildPriceSeriesRows(response: PriceSeriesResponse | null | undefined, storeName: string) {
  if (!response) {
    return []
  }

  const sourceSeries = storeName
    ? response.byStore.find((item) => item.storeName === storeName)?.series ?? []
    : response.overallDaily

  return sourceSeries.map((point) => ({
    date: new Date(`${point.date}T00:00:00`).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
    }),
    avg: point.stats.avg ?? 0,
    min: point.stats.min ?? 0,
    max: point.stats.max ?? 0,
    count: point.stats.count,
  }))
}

export function buildStoreStatsRows(response: PriceStatsResponse | null | undefined) {
  if (!response) {
    return []
  }

  return response.byStore
    .map((item) => ({
      storeName: item.storeName,
      avg: item.stats.avg,
      min: item.stats.min,
      max: item.stats.max,
      cv: item.stats.cv,
    }))
    .sort((left, right) => (right.avg ?? 0) - (left.avg ?? 0))
}

export function computeSavingsPotential(lines: OptimizeLine[]): SavingsPotential {
  let total = 0
  let comparableLines = 0

  for (const line of lines) {
    if (line.selected?.price === null || line.selected?.price === undefined || !line.optionsByStore?.length) {
      continue
    }

    const candidatePrices = line.optionsByStore
      .map((option) => option.price)
      .filter((value): value is number => value !== null && value !== undefined)

    if (candidatePrices.length < 2) {
      continue
    }

    const mostExpensiveComparable = Math.max(...candidatePrices)
    total += Math.max(0, mostExpensiveComparable - line.selected.price) * line.quantity
    comparableLines += 1
  }

  return {
    total,
    comparableLines,
    averagePerLine: comparableLines > 0 ? total / comparableLines : null,
  }
}