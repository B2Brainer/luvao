import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../services/api', () => ({
  orchestratorService: {
    compareProduct: vi.fn(),
    getPriceStats: vi.fn(),
    getResearchBasket: vi.fn(),
    getScrapingJobStatus: vi.fn(),
    optimizeList: vi.fn(),
    refreshScraping: vi.fn(),
  },
}))

vi.mock('../../../services/optimizationContext', () => ({
  saveOptimizationContext: vi.fn(),
  useOptimizationContext: vi.fn(),
}))

import { orchestratorService } from '../../../services/api'
import { saveOptimizationContext, useOptimizationContext } from '../../../services/optimizationContext'
import Products from './Products'

const statsPayload = {
  count: 12,
  min: 1000,
  max: 3000,
  avg: 2000,
  stdDev: 450,
  cv: 0.22,
}

const priceStatsResponse = {
  windowDays: 7,
  since: '2026-05-19T00:00:00.000Z',
  totalRecords: 24,
  overall: statsPayload,
  byStore: [
    { storeName: 'Olimpica', stats: statsPayload },
    { storeName: 'D1', stats: statsPayload },
  ],
  byQuery: [],
}

const optimizationResponse = {
  mode: 'calorie-plan' as const,
  computedAt: '2026-05-26T10:05:00.000Z',
  restrictedStore: 'Olimpica',
  periodDays: 30,
  targetCalories: 66000,
  plannedCalories: 61200,
  requestedItems: 1,
  resolvedItems: 1,
  unresolvedItems: [],
  totalEstimated: 18500,
  estimatedByStore: {
    Olimpica: 18500,
    D1: 19200,
  },
  storeScenarios: [
    {
      storeName: 'Olimpica',
      totalEstimated: 18500,
      resolvedItems: 1,
      requestedItems: 1,
      unresolvedItems: [],
      coverage: 1,
      plannedCalories: 61200,
      targetCalories: 66000,
    },
  ],
  lines: [
    {
      requested: 'arroz',
      quantity: 1,
      category: 'Cereales y harinas',
      caloriesPerPackage: 61200,
      targetCalories: 66000,
      plannedCalories: 61200,
      subtotal: 18500,
      selected: {
        id: '1',
        storeName: 'Olimpica',
        sourceName: 'Arroz Diana 500 g',
        price: 18500,
        pricePerUnit: 18500,
        matchScore: 0.95,
      },
    },
  ],
}

const daneOptimizationResponse = {
  ...optimizationResponse,
  restrictedStore: 'D1',
  estimatedByStore: {
    D1: 52000,
    Olimpica: 54800,
  },
  storeScenarios: [
    {
      storeName: 'D1',
      totalEstimated: 52000,
      resolvedItems: 8,
      requestedItems: 8,
      unresolvedItems: [],
      coverage: 1,
      plannedCalories: 64000,
      targetCalories: 66000,
    },
  ],
}

const getResearchBasketMock = vi.mocked(orchestratorService.getResearchBasket)
const getPriceStatsMock = vi.mocked(orchestratorService.getPriceStats)
const optimizeListMock = vi.mocked(orchestratorService.optimizeList)
const saveOptimizationContextMock = vi.mocked(saveOptimizationContext)
const useOptimizationContextMock = vi.mocked(useOptimizationContext)

describe('Products page optimizer', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()

    useOptimizationContextMock.mockReturnValue({
      source: 'dane-basket',
      items: [],
      restrictedStore: null,
      lastOptimization: null,
      updatedAt: null,
    })

    getResearchBasketMock.mockResolvedValue({ data: [] } as any)
    getPriceStatsMock.mockResolvedValue({ data: priceStatsResponse } as any)
    optimizeListMock.mockResolvedValue({ data: optimizationResponse } as any)
  })

  it('envía la tienda restringida y guarda el snapshot al optimizar una lista personalizada', async () => {
    render(<Products />)

    await waitFor(() => {
      expect(getPriceStatsMock).toHaveBeenCalled()
    })

    fireEvent.change(screen.getByPlaceholderText('Agregar producto'), {
      target: { value: 'arroz' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }))
    fireEvent.change(screen.getByLabelText('Comprar solo en'), {
      target: { value: 'Olimpica' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Optimizar lista' }))

    await waitFor(() => {
      expect(optimizeListMock).toHaveBeenCalledWith({
        items: [{ product: 'arroz', quantity: 1 }],
        periodDays: 30,
        targetCalories: 66000,
        restrictedStore: 'Olimpica',
      })
    })

    expect(saveOptimizationContextMock).toHaveBeenCalledWith({
      source: 'custom-list',
      items: [{ product: 'arroz', quantity: 1 }],
      restrictedStore: 'Olimpica',
      lastOptimization: optimizationResponse,
    })
    expect(screen.getByText('Restricción de tienda')).not.toBeNull()
    expect(screen.getByText('La selección principal se calculó solo con esta tienda.')).not.toBeNull()
  })

  it('usa la misma restricción al optimizar la canasta DANE', async () => {
    optimizeListMock.mockResolvedValueOnce({ data: daneOptimizationResponse } as any)

    render(<Products />)

    await waitFor(() => {
      expect(getPriceStatsMock).toHaveBeenCalled()
    })

    fireEvent.change(screen.getByLabelText('Comprar solo en'), {
      target: { value: 'D1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Optimizar canasta en D1' }))

    await waitFor(() => {
      expect(optimizeListMock).toHaveBeenCalledWith({
        items: [],
        periodDays: 30,
        targetCalories: 66000,
        restrictedStore: 'D1',
      })
    })

    expect(saveOptimizationContextMock).toHaveBeenCalledWith({
      source: 'dane-basket',
      restrictedStore: 'D1',
      lastOptimization: daneOptimizationResponse,
    })
  })
})
