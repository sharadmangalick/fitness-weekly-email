'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DONATION_PRESETS, DEFAULT_DONATION_AMOUNT } from '@/lib/stripe'

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState(DEFAULT_DONATION_AMOUNT)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount)
    setIsCustom(false)
    setCustomAmount('')
    setError('')
  }

  const handleCustomChange = (value: string) => {
    setCustomAmount(value)
    setIsCustom(true)
    setError('')
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed >= 1) {
      setSelectedAmount(Math.round(parsed * 100))
    }
  }

  const handleDonate = async () => {
    if (isCustom && (!customAmount || parseFloat(customAmount) < 1)) {
      setError('Please enter at least $1')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/donate/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: selectedAmount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-purple-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Support RunPlan.fun
          </h1>
          <p className="text-gray-600">
            Help keep personalized training plans free for everyone
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select an amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DONATION_PRESETS.map((preset) => (
                <button
                  key={preset.amount}
                  onClick={() => handlePresetClick(preset.amount)}
                  className={`py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                    !isCustom && selectedAmount === preset.amount
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter a custom amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Enter amount"
                className={`w-full pl-7 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isCustom
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200'
                }`}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            onClick={handleDonate}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Donate $${(selectedAmount / 100).toFixed(0)}`
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Secure payment powered by Stripe. Your donation helps cover hosting costs and keeps RunPlan.fun free for all runners.
          </p>

          <div className="pt-4 border-t border-gray-200 text-center">
            <Link href="/dashboard" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
