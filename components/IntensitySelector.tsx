'use client'

export type IntensityPreference = 'conservative' | 'normal' | 'aggressive'

interface IntensitySelectorProps {
  value: IntensityPreference
  onChange: (value: IntensityPreference) => void
  disabled?: boolean
}

const intensityOptions: { value: IntensityPreference; label: string; description: string }[] = [
  {
    value: 'conservative',
    label: 'Less Intense',
    description: '85% of base mileage',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: '100% of base mileage',
  },
  {
    value: 'aggressive',
    label: 'More Intense',
    description: '115% of base mileage',
  },
]

export default function IntensitySelector({
  value,
  onChange,
  disabled = false,
}: IntensitySelectorProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Plan Intensity</h3>
          <p className="text-sm text-gray-500">
            Adjust how aggressive your training plan is
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {intensityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`
              flex-1 px-4 py-3 rounded-lg border-2 transition-all
              ${value === option.value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-xs mt-1 opacity-70">{option.description}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Recovery adjustments still apply on top of your intensity preference.
      </p>
    </div>
  )
}
