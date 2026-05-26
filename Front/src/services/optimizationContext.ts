import { useSyncExternalStore } from 'react'

export type OptimizationContextSource = 'dane-basket' | 'custom-list'

export type OptimizationContextItem = {
  product: string
  quantity: number
}

export type OptimizationContextOption = {
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

export type OptimizationContextLine = {
  requested: string
  category?: string
  quantity: number
  caloriesPerPackage?: number | null
  targetCalories?: number | null
  plannedCalories?: number | null
  subtotal: number | null
  selected: OptimizationContextOption | null
  optionsByStore?: OptimizationContextOption[]
}

export type OptimizationContextResult = {
  mode?: 'manual' | 'calorie-plan'
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
  lines: OptimizationContextLine[]
  restrictedStore?: string | null
  computedAt?: string
}

export type OptimizationContext = {
  source: OptimizationContextSource
  items: OptimizationContextItem[]
  restrictedStore: string | null
  lastOptimization: OptimizationContextResult | null
  updatedAt: string | null
}

const STORAGE_KEY = 'luvao:last-optimization-context'
const STORAGE_EVENT = 'luvao:last-optimization-context-updated'

const DEFAULT_CONTEXT: OptimizationContext = {
  source: 'dane-basket',
  items: [],
  restrictedStore: null,
  lastOptimization: null,
  updatedAt: null,
}

let cachedRawValue: string | null = null
let cachedSnapshot: OptimizationContext = DEFAULT_CONTEXT

function sanitizeItems(items: OptimizationContextItem[] | undefined) {
  return (items ?? [])
    .map((item) => ({
      product: item.product.trim().toLowerCase(),
      quantity: Math.max(1, Math.round(item.quantity || 1)),
    }))
    .filter((item) => item.product.length > 0)
}

function sanitizeRestrictedStore(restrictedStore: string | null | undefined) {
  const normalized = restrictedStore?.trim()
  return normalized ? normalized : null
}

function normalizeOptimizationResult(result: OptimizationContextResult | null | undefined) {
  if (!result || typeof result !== 'object') {
    return null
  }

  if (
    typeof result.requestedItems !== 'number' ||
    typeof result.resolvedItems !== 'number' ||
    typeof result.totalEstimated !== 'number' ||
    !Array.isArray(result.unresolvedItems) ||
    !Array.isArray(result.lines)
  ) {
    return null
  }

  return result
}

function normalizeContext(context: Partial<OptimizationContext> | null | undefined): OptimizationContext {
  const source = context?.source === 'custom-list' ? 'custom-list' : 'dane-basket'
  const items = sanitizeItems(context?.items)
  const restrictedStore = sanitizeRestrictedStore(context?.restrictedStore)
  const lastOptimization = normalizeOptimizationResult(context?.lastOptimization)

  if (source === 'custom-list' && items.length === 0) {
    return DEFAULT_CONTEXT
  }

  return {
    source,
    items: source === 'custom-list' ? items : [],
    restrictedStore,
    lastOptimization,
    updatedAt: context?.updatedAt ?? null,
  }
}

export function getOptimizationContextSnapshot(): OptimizationContext {
  if (typeof window === 'undefined') {
    return DEFAULT_CONTEXT
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (rawValue === cachedRawValue) {
    return cachedSnapshot
  }

  cachedRawValue = rawValue

  if (!rawValue) {
    cachedSnapshot = DEFAULT_CONTEXT
    return cachedSnapshot
  }

  try {
    cachedSnapshot = normalizeContext(JSON.parse(rawValue) as Partial<OptimizationContext>)
    return cachedSnapshot
  } catch {
    cachedSnapshot = DEFAULT_CONTEXT
    return cachedSnapshot
  }
}

export function saveOptimizationContext(context: {
  source: OptimizationContextSource
  items?: OptimizationContextItem[]
  restrictedStore?: string | null
  lastOptimization?: OptimizationContextResult | null
}) {
  if (typeof window === 'undefined') {
    return
  }

  const payload = normalizeContext({
    source: context.source,
    items: context.items,
    restrictedStore: context.restrictedStore,
    lastOptimization: context.lastOptimization,
    updatedAt: new Date().toISOString(),
  })

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: payload }))
}

export function subscribeOptimizationContext(listener: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleStorage = (event: Event) => {
    if (event instanceof StorageEvent && event.key && event.key !== STORAGE_KEY) {
      return
    }

    listener()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(STORAGE_EVENT, handleStorage)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(STORAGE_EVENT, handleStorage)
  }
}

export function useOptimizationContext() {
  return useSyncExternalStore(
    subscribeOptimizationContext,
    getOptimizationContextSnapshot,
    getOptimizationContextSnapshot,
  )
}