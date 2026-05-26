import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import { orchestratorService } from '../../../services/api'
import type { OptimizationContext } from '../../../services/optimizationContext'
import { buildProjectionRequests, toPeriodDays } from '../research.utils'
import type {
  OptimizeResponse,
  PriceSeriesResponse,
  PriceStatsResponse,
  ResearchBasketItem,
  ResearchViewFilters,
} from '../types'

const REFRESH_INTERVAL_MS = 60_000

function optimizationItems(context: OptimizationContext) {
  return context.source === 'custom-list' ? context.items : []
}

export function useResearchBasket() {
  return useQuery({
    queryKey: ['research', 'basket'],
    queryFn: async () => {
      const response = await orchestratorService.getResearchBasket()
      return response.data as ResearchBasketItem[]
    },
    staleTime: 45_000,
    refetchInterval: REFRESH_INTERVAL_MS,
    placeholderData: keepPreviousData,
  })
}

export function useResearchScenario(filters: ResearchViewFilters, context: OptimizationContext) {
  const periodDays = toPeriodDays(filters.timeUnit, filters.durationValue)
  const targetCalories = Math.round(filters.householdSize * filters.dailyCaloriesPerPerson * periodDays)
  const items = optimizationItems(context)

  return useQuery({
    queryKey: ['research', 'scenario', context.source, items, filters.householdSize, periodDays, filters.dailyCaloriesPerPerson],
    queryFn: async () => {
      const response = await orchestratorService.optimizeList({
        items,
        periodDays,
        targetCalories,
      })

      return response.data as OptimizeResponse
    },
    staleTime: 45_000,
    refetchInterval: REFRESH_INTERVAL_MS,
    placeholderData: keepPreviousData,
  })
}

export function useProjectionScenarios(filters: ResearchViewFilters, context: OptimizationContext) {
  const requests = buildProjectionRequests(filters)
  const items = optimizationItems(context)
  const results = useQueries({
    queries: requests.map((request) => ({
      queryKey: ['research', 'projection', context.source, items, request.key, request.periodDays, request.targetCalories],
      queryFn: async () => {
        const response = await orchestratorService.optimizeList({
          items,
          periodDays: request.periodDays,
          targetCalories: request.targetCalories,
        })

        return response.data as OptimizeResponse
      },
      staleTime: 45_000,
      refetchInterval: REFRESH_INTERVAL_MS,
    })),
  })

  return {
    data: requests.map((request, index) => ({
      ...request,
      scenario: results[index].data ?? null,
    })),
    isLoading: results.some((result) => result.isLoading),
    isFetching: results.some((result) => result.isFetching),
    error: (results.find((result) => result.error)?.error as Error | undefined) ?? null,
  }
}

export function usePriceStats(filters: ResearchViewFilters) {
  return useQuery({
    queryKey: ['research', 'price-stats', filters.priceQuery || 'all', filters.priceStoreName || 'all', filters.priceWindowDays],
    queryFn: async () => {
      const response = await orchestratorService.getPriceStats({
        query: filters.priceQuery || undefined,
        storeName: filters.priceStoreName || undefined,
        days: filters.priceWindowDays,
      })

      return response.data as PriceStatsResponse
    },
    staleTime: 45_000,
    refetchInterval: REFRESH_INTERVAL_MS,
    placeholderData: keepPreviousData,
  })
}

export function usePriceSeries(filters: ResearchViewFilters) {
  return useQuery({
    queryKey: ['research', 'price-series', filters.priceQuery || 'all', filters.priceStoreName || 'all', filters.priceWindowDays],
    queryFn: async () => {
      const response = await orchestratorService.getPriceSeries({
        query: filters.priceQuery || undefined,
        storeName: filters.priceStoreName || undefined,
        days: filters.priceWindowDays,
      })

      return response.data as PriceSeriesResponse
    },
    staleTime: 45_000,
    refetchInterval: REFRESH_INTERVAL_MS,
    placeholderData: keepPreviousData,
  })
}