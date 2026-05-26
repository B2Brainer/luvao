import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { OptimizeResponse } from '../types'

vi.mock('recharts', async () => {
  return {
    ResponsiveContainer: () => null,
    AreaChart: () => null,
    BarChart: () => null,
    Area: () => null,
    Bar: () => null,
    CartesianGrid: () => null,
    Legend: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
  }
})

vi.mock('../../../services/optimizationContext', () => ({
  useOptimizationContext: vi.fn(),
}))

vi.mock('../hooks/useResearchData', () => ({
  useResearchScenario: vi.fn(),
  useProjectionScenarios: vi.fn(),
}))

import { useOptimizationContext } from '../../../services/optimizationContext'
import { useProjectionScenarios, useResearchScenario } from '../hooks/useResearchData'
import Statistics from './Statistics'

const customScenario: OptimizeResponse = {
  mode: 'calorie-plan',
  periodDays: 30,
  targetCalories: 66000,
  plannedCalories: 48800,
  categoryTargets: [
    {
      category: 'Cereales y harinas',
      share: 0.28,
      targetCalories: 18480,
      plannedCalories: 15000,
    },
    {
      category: 'Proteínas',
      share: 0.17,
      targetCalories: 11220,
      plannedCalories: 9800,
    },
  ],
  requestedItems: 2,
  resolvedItems: 1,
  unresolvedItems: ['pollo'],
  totalEstimated: 41800,
  estimatedByStore: { Olimpica: 41800 },
  storeScenarios: [
    {
      storeName: 'Olimpica',
      totalEstimated: 41800,
      resolvedItems: 1,
      requestedItems: 2,
      unresolvedItems: ['pollo'],
      coverage: 0.5,
      plannedCalories: 48800,
      targetCalories: 66000,
    },
  ],
  lines: [],
}

const daneScenario: OptimizeResponse = {
  mode: 'calorie-plan',
  periodDays: 30,
  targetCalories: 66000,
  plannedCalories: 61200,
  categoryTargets: [
    {
      category: 'Cereales y harinas',
      share: 0.28,
      targetCalories: 18480,
      plannedCalories: 17200,
    },
    {
      category: 'Proteínas',
      share: 0.17,
      targetCalories: 11220,
      plannedCalories: 10800,
    },
  ],
  requestedItems: 2,
  resolvedItems: 2,
  unresolvedItems: [],
  totalEstimated: 52000,
  estimatedByStore: { D1: 52000 },
  storeScenarios: [
    {
      storeName: 'D1',
      totalEstimated: 52000,
      resolvedItems: 2,
      requestedItems: 2,
      unresolvedItems: [],
      coverage: 1,
      plannedCalories: 61200,
      targetCalories: 66000,
    },
  ],
  lines: [],
}

const useOptimizationContextMock = vi.mocked(useOptimizationContext)
const useResearchScenarioMock = vi.mocked(useResearchScenario)
const useProjectionScenariosMock = vi.mocked(useProjectionScenarios)

describe('Statistics page', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()

    useOptimizationContextMock.mockReturnValue({
      source: 'custom-list',
      items: [
        { product: 'arroz', quantity: 1 },
        { product: 'pollo', quantity: 1 },
      ],
      updatedAt: '2026-05-26T10:00:00.000Z',
    })

    useResearchScenarioMock.mockImplementation((_filters, context) => ({
      data: context.source === 'custom-list' ? customScenario : daneScenario,
      error: null,
    }) as any)

    useProjectionScenariosMock.mockImplementation((filters, context) => ({
      data: [
        {
          key: 'projection-1',
          label: filters.projectionMode === 'people' ? `${filters.householdSize}` : '1 mes',
          householdSize: filters.householdSize,
          periodDays: filters.timeUnit === 'months' ? filters.durationValue * 30 : 30,
          targetCalories: filters.householdSize * filters.dailyCaloriesPerPerson * 30,
          scenario: context.source === 'custom-list' ? customScenario : daneScenario,
        },
      ],
      isLoading: false,
      isFetching: false,
      error: null,
    }) as any)
  })

  it('recalcula la vista cuando cambian filtros clave del escenario', async () => {
    render(<Statistics />)

    expect(screen.getByRole('heading', { name: 'Costo proyectado segun numero de personas' })).not.toBeNull()

    fireEvent.change(screen.getByLabelText('Numero de personas'), {
      target: { value: '6' },
    })

    await waitFor(() => {
      const lastScenarioCall = useResearchScenarioMock.mock.calls.at(-1)
      const lastProjectionCall = useProjectionScenariosMock.mock.calls.at(-1)

      expect(lastScenarioCall?.[0].householdSize).toBe(6)
      expect(lastProjectionCall?.[0].householdSize).toBe(6)
    })

    fireEvent.change(screen.getByLabelText('Proyeccion principal'), {
      target: { value: 'duration' },
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Costo proyectado segun horizonte de compra' })).not.toBeNull()
      expect(useProjectionScenariosMock.mock.calls.at(-1)?.[0].projectionMode).toBe('duration')
    })
  })

  it('permite cambiar entre lista personalizada y canasta DANE', async () => {
    render(<Statistics />)

    expect(screen.getByText('Lista corta: con menos de 3 ítems los indicadores pueden sobrerrepresentar un solo producto.')).not.toBeNull()
    expect(screen.getByText('Olimpica')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Usar canasta DANE' }))

    await waitFor(() => {
      expect(useResearchScenarioMock.mock.calls.at(-1)?.[1].source).toBe('dane-basket')
      expect(screen.getByText('D1')).not.toBeNull()
      expect(screen.queryByText('Olimpica')).toBeNull()
      expect(screen.queryByText('Lista corta: con menos de 3 ítems los indicadores pueden sobrerrepresentar un solo producto.')).toBeNull()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Usar última lista personalizada' }))

    await waitFor(() => {
      expect(useResearchScenarioMock.mock.calls.at(-1)?.[1].source).toBe('custom-list')
      expect(screen.getByText('Olimpica')).not.toBeNull()
      expect(screen.getByText('Lista corta: con menos de 3 ítems los indicadores pueden sobrerrepresentar un solo producto.')).not.toBeNull()
    })
  })
})