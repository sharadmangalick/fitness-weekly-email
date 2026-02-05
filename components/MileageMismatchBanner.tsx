'use client'

import { useState } from 'react'

interface MileageMismatchBannerProps {
  configuredMileage: number
  calculatedMileage: number
  onUpdate: (newMileage: number) => Promise<void>
  onDismiss: () => void
}

export default function MileageMismatchBanner({
  configuredMileage,
  calculatedMileage,
  onUpdate,
  onDismiss,
}: MileageMismatchBannerProps) {
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await onUpdate(calculatedMileage)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-amber-800">
            Your recent training shows <strong>~{calculatedMileage} miles/week</strong>, but your plan is based on <strong>{configuredMileage} miles</strong>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="px-3 py-1.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {updating ? 'Updating...' : `Update to ${calculatedMileage} miles`}
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
