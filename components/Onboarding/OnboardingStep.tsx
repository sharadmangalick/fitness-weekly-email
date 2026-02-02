'use client'

interface OnboardingStepProps {
  currentStep: number
  totalSteps: number
  title: string
  subtitle?: string
  children: React.ReactNode
  onSkip?: () => void
  showSkip?: boolean
}

export default function OnboardingStep({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
  onSkip,
  showSkip = true,
}: OnboardingStepProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="gradient-primary p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {subtitle && (
              <p className="text-white/80 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          <div className="text-white/80 text-sm">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i + 1 <= currentStep ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {children}
      </div>

      {/* Skip Option */}
      {showSkip && onSkip && (
        <div className="p-4 border-t text-center">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  )
}
