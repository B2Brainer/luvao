export type Stats = {
  count: number
  min: number | null
  max: number | null
  avg: number | null
  stdDev: number | null
  cv: number | null
}

export type PriceStatsResponse = {
  windowDays: number
  since: string
  totalRecords: number
  overall: Stats
  byStore: Array<{ storeName: string; stats: Stats }>
  byQuery: Array<{ query: string; stats: Stats }>
}

export type DailyPricePoint = {
  date: string
  stats: Stats
}

export type PriceSeriesResponse = {
  windowDays: number
  since: string
  totalRecords: number
  overallDaily: DailyPricePoint[]
  byStore: Array<{ storeName: string; series: DailyPricePoint[] }>
  byQuery: Array<{ query: string; series: DailyPricePoint[] }>
}

export type ResearchBasketItem = {
  product: string
  quantity: number
  category: string
  unit: string | null
}

export type OptimizeOption = {
  id: string
  storeName: string
  sourceName: string
  price: number | null
  pricePerUnit: number | null
  matchScore: number
  pricePerCalorie?: number | null
  presentation?: { label?: string | null }
  nutrition?: { calories?: number | null; label?: string | null }
  url?: string | null
}

export type OptimizeLine = {
  requested: string
  category?: string
  quantity: number
  caloriesPerPackage?: number | null
  targetCalories?: number | null
  plannedCalories?: number | null
  subtotal: number | null
  selected: OptimizeOption | null
  optionsByStore?: OptimizeOption[]
}

export type OptimizeResponse = {
  mode?: 'manual' | 'calorie-plan'
  computedAt?: string
  restrictedStore?: string | null
  periodDays?: number
  targetCalories?: number
  targetRangeCalories?: { min: number; max: number }
  plannedCalories?: number
  categoryTargets?: Array<{
    category: string
    share: number
    targetCalories: number
    plannedCalories: number
  }>
  requestedItems: number
  resolvedItems: number
  unresolvedItems: string[]
  totalEstimated: number
  estimatedByStore: Record<string, number>
  storeScenarios?: Array<{
    storeName: string
    totalEstimated: number
    resolvedItems: number
    requestedItems: number
    unresolvedItems: string[]
    coverage: number
    plannedCalories: number
    targetCalories: number
  }>
  lines: OptimizeLine[]
}

export type ResearchTimeUnit = 'days' | 'weeks' | 'months'
export type ResearchProjectionMode = 'people' | 'duration'

export type ResearchViewFilters = {
  householdSize: number
  timeUnit: ResearchTimeUnit
  durationValue: number
  dailyCaloriesPerPerson: number
  projectionMode: ResearchProjectionMode
  priceWindowDays: number
  priceQuery: string
  priceStoreName: string
}

export type ProjectionRequest = {
  key: string
  label: string
  householdSize: number
  periodDays: number
  targetCalories: number
}

export type SavingsPotential = {
  total: number
  comparableLines: number
  averagePerLine: number | null
}