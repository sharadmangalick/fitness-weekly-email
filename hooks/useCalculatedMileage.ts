'use client'

import { useState, useEffect } from 'react'

interface CalculatedMileageState {
  calculatedMileage: number | null
  isLoading: boolean
  confidence: 'high' | 'medium' | 'low' | null
  weeksAnalyzed: number | null
  totalRunCount: number | null
  error: string | null
}

/**
 * Hook to fetch calculated weekly mileage from platform data
 *
 * Usage:
 * const { calculatedMileage, isLoading, confidence } = useCalculatedMileage()
 */
export function useCalculatedMileage(): CalculatedMileageState {
  const [state, setState] = useState<CalculatedMileageState>({
    calculatedMileage: null,
    isLoading: true,
    confidence: null,
    weeksAnalyzed: null,
    totalRunCount: null,
    error: null
  })

  useEffect(() => {
    let cancelled = false

    async function fetchMileage() {
      try {
        const response = await fetch('/api/calculate-mileage')

        if (cancelled) return

        if (!response.ok) {
          // Non-200 status - treat as no data available
          setState({
            calculatedMileage: null,
            isLoading: false,
            confidence: null,
            weeksAnalyzed: null,
            totalRunCount: null,
            error: null
          })
          return
        }

        const data = await response.json()

        if (cancelled) return

        setState({
          calculatedMileage: data.mileage,
          isLoading: false,
          confidence: data.confidence,
          weeksAnalyzed: data.weeksAnalyzed ?? null,
          totalRunCount: data.totalRunCount ?? null,
          error: data.error ?? null
        })
      } catch {
        if (cancelled) return

        // Network error or other failure - fail silently
        setState({
          calculatedMileage: null,
          isLoading: false,
          confidence: null,
          weeksAnalyzed: null,
          totalRunCount: null,
          error: null
        })
      }
    }

    fetchMileage()

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
