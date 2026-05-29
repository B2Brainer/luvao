import { describe, expect, it } from 'vitest'
import { buildCategoryTargetRows, buildStoreSpendRows } from './research.utils'
import type { OptimizeResponse } from './types'

describe('statistics research utils', () => {
  it('builds store rows from per-store scenarios with visible coverage and missing items', () => {
    const response: OptimizeResponse = {
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
      ],
      requestedItems: 4,
      resolvedItems: 3,
      unresolvedItems: ['pollo'],
      totalEstimated: 52000,
      estimatedByStore: {
        Exito: 32000,
        Olimpica: 20000,
      },
      storeScenarios: [
        {
          storeName: 'Exito',
          totalEstimated: 52000,
          resolvedItems: 4,
          requestedItems: 4,
          unresolvedItems: [],
          coverage: 1,
          plannedCalories: 61200,
          targetCalories: 66000,
        },
        {
          storeName: 'Olimpica',
          totalEstimated: 41800,
          resolvedItems: 3,
          requestedItems: 4,
          unresolvedItems: ['pollo'],
          coverage: 0.75,
          plannedCalories: 48800,
          targetCalories: 66000,
        },
      ],
      lines: [],
    }

    expect(buildStoreSpendRows(response)).toEqual([
      expect.objectContaining({
        name: 'Exito',
        value: 52000,
        coverage: 1,
        missingCount: 0,
        missingLabel: 'Cobertura completa',
      }),
      expect.objectContaining({
        name: 'Olimpica',
        value: 41800,
        coverage: 0.75,
        missingCount: 1,
        missingLabel: 'pollo',
      }),
    ])
  })

  it('rescales store rows from an optimizer snapshot when target calories change', () => {
    const response: OptimizeResponse = {
      mode: 'calorie-plan',
      periodDays: 30,
      targetCalories: 66000,
      plannedCalories: 61200,
      requestedItems: 2,
      resolvedItems: 2,
      unresolvedItems: [],
      totalEstimated: 52000,
      estimatedByStore: {
        Exito: 32000,
      },
      storeScenarios: [
        {
          storeName: 'Exito',
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

    expect(buildStoreSpendRows(response, { targetCalories: 132000, periodDays: 60 })).toEqual([
      expect.objectContaining({
        name: 'Exito',
        value: 104000,
        plannedCalories: 122400,
        targetCalories: 132000,
      }),
    ])
  })

  it('falls back to the legacy estimatedByStore payload when storeScenarios are missing', () => {
    const response: OptimizeResponse = {
      requestedItems: 2,
      resolvedItems: 2,
      unresolvedItems: [],
      totalEstimated: 12000,
      estimatedByStore: {
        Exito: 7000,
        D1: 5000,
      },
      lines: [],
    }

    expect(buildStoreSpendRows(response)).toEqual([
      expect.objectContaining({ name: 'Exito', value: 7000, coverage: 1 }),
      expect.objectContaining({ name: 'D1', value: 5000, coverage: 1 }),
    ])
  })

  it('keeps target and planned calories per category from the backend contract', () => {
    const response: OptimizeResponse = {
      requestedItems: 1,
      resolvedItems: 1,
      unresolvedItems: [],
      totalEstimated: 1000,
      estimatedByStore: { Exito: 1000 },
      categoryTargets: [
        {
          category: 'Proteínas',
          share: 0.17,
          targetCalories: 11220,
          plannedCalories: 9800,
        },
      ],
      lines: [],
    }

    expect(buildCategoryTargetRows(response)).toEqual([
      {
        category: 'Proteínas',
        targetCalories: 11220,
        plannedCalories: 9800,
      },
    ])
  })
})