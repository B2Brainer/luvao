import { useSyncExternalStore } from 'react'

export type OptimizationContextSource = 'dane-basket' | 'custom-list'

export type OptimizationContextItem = {
  product: string
  quantity: number
}

export type OptimizationContext = {
  source: OptimizationContextSource
  items: OptimizationContextItem[]
  updatedAt: string | null
}

const STORAGE_KEY = 'luvao:last-optimization-context'
const STORAGE_EVENT = 'luvao:last-optimization-context-updated'

const DEFAULT_CONTEXT: OptimizationContext = {
  source: 'dane-basket',
  items: [],
  updatedAt: null,
}

function sanitizeItems(items: OptimizationContextItem[] | undefined) {
  return (items ?? [])
    .map((item) => ({
      product: item.product.trim().toLowerCase(),
      quantity: Math.max(1, Math.round(item.quantity || 1)),
    }))
    .filter((item) => item.product.length > 0)
}

function normalizeContext(context: Partial<OptimizationContext> | null | undefined): OptimizationContext {
  const source = context?.source === 'custom-list' ? 'custom-list' : 'dane-basket'
  const items = sanitizeItems(context?.items)

  if (source === 'custom-list' && items.length === 0) {
    return DEFAULT_CONTEXT
  }

  return {
    source,
    items: source === 'custom-list' ? items : [],
    updatedAt: context?.updatedAt ?? null,
  }
}

export function getOptimizationContextSnapshot(): OptimizationContext {
  if (typeof window === 'undefined') {
    return DEFAULT_CONTEXT
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return DEFAULT_CONTEXT
  }

  try {
    return normalizeContext(JSON.parse(rawValue) as Partial<OptimizationContext>)
  } catch {
    return DEFAULT_CONTEXT
  }
}

export function saveOptimizationContext(context: {
  source: OptimizationContextSource
  items?: OptimizationContextItem[]
}) {
  if (typeof window === 'undefined') {
    return
  }

  const payload = normalizeContext({
    source: context.source,
    items: context.items,
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