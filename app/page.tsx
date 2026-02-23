'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

// Garmin Connect Icon Component - uses official Garmin Connect™ app icon
const GarminLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <Image
    src="/garmin-connect-icon.png"
    alt="Garmin Connect"
    width={48}
    height={48}
    className={`${className} rounded-lg`}
  />
)

// Strava Logo Component
const StravaLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zm-3.065-9.057l2.084-4.116 2.084 4.116h5.066L15.387 0l-5.15 8.887h2.085z"/>
  </svg>
)

export default function HomePage() {
  const [showStickyHeader, setShowStickyHeader] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling past hero section (approx 600px)
      setShowStickyHeader(window.scrollY > 600)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden">
      {/* Sticky Header */}
      <div
        className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-orange-200 shadow-sm z-50 py-3 px-6 transition-transform duration-300 ${
          showStickyHeader ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏃‍♂️</span>
            <span className="text-slate-900 font-semibold">RunPlan</span>
          </div>
          <Link
            href="/signup"
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-2 rounded-full font-semibold text-sm hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
          >
            Start Free
          </Link>
        </div>
      </div>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-6000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-xl">🏃‍♂️</span>
            </div>
            <span className="text-xl font-bold text-slate-900">RunPlan</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/integrations" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">
              Integrations
            </Link>
            <Link href="/about" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">
              About
            </Link>
            <Link href="/login" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">
              Log In
            </Link>
            <Link href="/signup" className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-2.5 rounded-full font-semibold hover:from-orange-600 hover:to-pink-600 transition-all hover:scale-105 shadow-md hover:shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Platform Badges - Prominent */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-full px-4 py-2 shadow-md">
              <GarminLogo className="w-6 h-6" />
              <span className="text-slate-900 font-medium text-sm">Garmin Connect&#8482;</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-full px-4 py-2 shadow-md">
              <div className="w-6 h-6 bg-[#FC4C02] rounded-full flex items-center justify-center">
                <StravaLogo className="w-3.5 h-3.5 text-slate-900" />
              </div>
              <span className="text-slate-900 font-medium text-sm">Strava</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Train Smarter. Run Faster.
            </span>
            <br />
            <span className="text-slate-900">Avoid Injury.</span>
          </h1>

          <p className="text-xl text-slate-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your AI running coach analyzes your watch data and delivers personalized weekly plans to your inbox.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Link href="/signup" className="group bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:opacity-90 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 flex items-center gap-2">
              Create My Free Plan
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
              <span>No credit card</span>
              <span className="text-slate-700">•</span>
              <span>Cancel anytime</span>
              <span className="text-slate-700">•</span>
              <span>2-minute setup</span>
            </div>
          </div>
        </div>

        {/* Data Flow Visualization */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Source Platforms */}
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-xl border-2 border-blue-100 shadow-lg rounded-2xl p-6 hover:border-[#007CC3]/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <GarminLogo className="w-14 h-14" />
                  <div>
                    <div className="text-slate-900 font-bold text-lg">Garmin Connect&#8482;</div>
                    <div className="text-slate-700 text-sm">Auto-sync enabled</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    All Your Runs
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Sleep & Recovery
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Resting HR & VO2 Max
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border-2 border-blue-100 shadow-lg rounded-2xl p-6 hover:border-[#FC4C02]/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-[#FC4C02] rounded-xl flex items-center justify-center shadow-lg shadow-[#FC4C02]/20">
                    <StravaLogo className="w-8 h-8 text-slate-900" />
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold text-lg">Strava</div>
                    <div className="text-slate-700 text-sm">Auto-sync enabled</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    All Your Runs
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Pace & Mileage
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Weekly Volume
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow / Flow */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="text-slate-600 text-sm font-medium mb-4">AUTOMATIC SYNC</div>
              <div className="relative">
                <div className="w-24 h-1 bg-gradient-to-r from-[#007CC3] via-purple-500 to-[#FC4C02] rounded-full"></div>
                <div className="absolute -right-2 -top-1.5 w-0 h-0 border-l-8 border-l-[#FC4C02] border-y-4 border-y-transparent"></div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs text-slate-700 bg-white/90 px-2 py-0.5 rounded border border-purple-200 font-medium">every week</span>
                </div>
              </div>
            </div>

            {/* Output - Training Plan */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl border-2 border-purple-200 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <div className="text-slate-900 font-bold">Your Running Plan</div>
                  <div className="text-slate-700 text-sm">Delivered weekly</div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="bg-white/70 rounded-lg p-2.5 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Mon</span>
                    <span className="text-slate-900 font-medium">Easy 5mi</span>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2.5 border border-orange-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Wed</span>
                    <span className="text-orange-700 font-medium">Tempo 6mi</span>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Sat</span>
                    <span className="text-purple-700 font-medium">Long Run 14mi</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-2.5 border border-green-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-semibold">Weekly Total</span>
                    <span className="text-green-700 font-bold">32 miles</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 text-center">
                8 weeks to your Half Marathon 🏃‍♂️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Sync Value Prop Banner */}
      <section className="relative z-10 py-12 border-y border-orange-200 bg-gradient-to-r from-blue-50 via-purple-50 to-orange-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div className="text-slate-900 font-semibold">Auto-Sync</div>
                <div className="text-slate-700 text-sm">Data pulls automatically</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <div className="text-slate-900 font-semibold">AI-Analyzed</div>
                <div className="text-slate-700 text-sm">Smart recommendations</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-slate-900 font-semibold">Weekly Email</div>
                <div className="text-slate-700 text-sm">Right to your inbox</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-700 text-lg max-w-2xl mx-auto">
              Connect once, get smarter training forever
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#007CC3] to-[#FC4C02] rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white border-2 border-purple-100 rounded-3xl shadow-xl p-8 h-full">
                <div className="flex gap-2 mb-6">
                  <GarminLogo className="w-12 h-12" />
                  <div className="w-12 h-12 bg-[#FC4C02] rounded-xl flex items-center justify-center">
                    <StravaLogo className="w-6 h-6 text-slate-900" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Connect Your Platform</h3>
                <p className="text-slate-700 leading-relaxed">
                  One-click connection to Garmin Connect&#8482; or Strava. We automatically pull your runs, mileage, pace, and recovery data.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white border-2 border-purple-100 rounded-3xl shadow-xl p-8 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Set Your Race Goal</h3>
                <p className="text-slate-700 leading-relaxed">
                  5K PR? First marathon? Building your base? Tell us your race and target time - we'll map out your training.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-orange-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-white border-2 border-purple-100 rounded-3xl shadow-xl p-8 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">📬</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Run with Your Plan</h3>
                <p className="text-slate-700 leading-relaxed">
                  Every week we analyze your runs and email your next week's workouts - easy days, tempos, long runs, rest days. <span className="text-slate-900 font-medium">Fully automatic.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Why Runners Love It
            </h2>
            <p className="text-slate-700 text-lg max-w-2xl mx-auto">
              Running plans that adapt to how your body actually feels
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3 mb-5">
                <GarminLogo className="w-10 h-10" />
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <StravaLogo className="w-5 h-5 text-[#FC4C02]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">No Logging Required</h3>
              <p className="text-slate-700 leading-relaxed">
                Your runs sync <span className="text-slate-900 font-semibold">automatically</span>. No entering miles, paces, or rest days. We pull everything from your watch.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-3xl p-8 hover:border-green-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm">
                <span className="text-2xl">💚</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Recovery-Aware Mileage</h3>
              <p className="text-slate-700 leading-relaxed">
                Bad sleep? Elevated heart rate? We'll dial back your miles. Feeling fresh? Let's push that long run. Your plan adapts weekly.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-3xl p-8 hover:border-purple-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm">
                <span className="text-2xl">🏁</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Race-Ready Plans</h3>
              <p className="text-slate-700 leading-relaxed">
                5K, 10K, half marathon, or marathon - get the right mix of easy runs, tempo work, and long runs to hit your goal time.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-3xl p-8 hover:border-orange-300 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm">
                <span className="text-2xl">📬</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Just Check Your Email</h3>
              <p className="text-slate-700 leading-relaxed">
                Your weekly plan arrives with every run mapped out - distance, pace, and purpose. No app. Just lace up and go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Week Comparison */}
      <section className="relative z-10 py-24 px-6 border-t border-orange-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Not Your Average Training Plan
            </h2>
            <p className="text-slate-700 text-lg max-w-2xl mx-auto">
              Most plans follow a rigid schedule. RunPlan adapts to how you're actually recovering and performing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Generic Plan Column */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-md overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📄</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Generic Plan</h3>
                    <p className="text-sm text-slate-600">Same for everyone</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {/* Monday */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-600">Monday</span>
                    <span className="text-sm text-slate-500">Week 8</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Rest</div>
                </div>

                {/* Tuesday */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-600">Tuesday</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Easy Run: 5 miles</div>
                  <div className="text-xs text-slate-500 mt-1">Standard easy pace</div>
                </div>

                {/* Wednesday */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-600">Wednesday</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Speed Work: 6 × 800m</div>
                  <div className="text-xs text-slate-500 mt-1">Fixed intervals</div>
                </div>

                {/* Friday */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-600">Friday</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Tempo Run: 6 miles</div>
                  <div className="text-xs text-slate-500 mt-1">Standard tempo pace</div>
                </div>

                {/* Sunday */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-600">Sunday</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Long Run: 14 miles</div>
                  <div className="text-xs text-slate-500 mt-1">Follows schedule exactly</div>
                </div>

                {/* Total */}
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Weekly Total</span>
                    <span className="text-lg font-bold text-slate-900">31 miles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RunPlan Column */}
            <div className="bg-gradient-to-br from-purple-50 to-orange-50 border-2 border-purple-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">RunPlan Personalized</h3>
                    <p className="text-sm text-white/90">Adapted just for you</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {/* Monday */}
                <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-purple-600">Monday</span>
                    <span className="text-sm text-slate-500">Week 8</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Rest Day</div>
                  <div className="text-xs text-purple-600 mt-1 flex items-start gap-1">
                    <span>💡</span>
                    <span>Recovering from weekend long run</span>
                  </div>
                </div>

                {/* Tuesday */}
                <div className="p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-orange-600">Tuesday</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Easy Run: 4 miles</div>
                  <div className="text-xs text-orange-600 mt-1 flex items-start gap-1">
                    <span>💡</span>
                    <span>Reduced from 5mi - your resting HR is elevated</span>
                  </div>
                </div>

                {/* Wednesday */}
                <div className="p-4 bg-white rounded-lg border border-pink-200 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-pink-600">Wednesday</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Speed Work: 6 × 400m @ 7:30</div>
                  <div className="text-xs text-pink-600 mt-1 flex items-start gap-1">
                    <span>💡</span>
                    <span>Based on your recent 5K PR pace</span>
                  </div>
                </div>

                {/* Friday */}
                <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-blue-600">Friday</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Recovery Run: 5 miles</div>
                  <div className="text-xs text-blue-600 mt-1 flex items-start gap-1">
                    <span>💡</span>
                    <span>Sleep quality improved - adding mile back</span>
                  </div>
                </div>

                {/* Sunday */}
                <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-purple-600">Sunday</span>
                  </div>
                  <div className="text-slate-900 font-semibold">Long Run: 16 miles @ 9:45</div>
                  <div className="text-xs text-purple-600 mt-1 flex items-start gap-1">
                    <span>💡</span>
                    <span>Extended by 2mi - recovery metrics are strong</span>
                  </div>
                </div>

                {/* Total */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-green-700">Weekly Total</span>
                    <span className="text-lg font-bold text-green-700">31 miles</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">✨ Same volume, smarter distribution</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Differences Callout */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-50 to-orange-50 border-2 border-purple-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">The RunPlan Difference</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Recovery-Aware</h4>
                  <p className="text-sm text-slate-700">Adjusts based on sleep, resting HR, and how you're feeling</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Pace-Specific</h4>
                  <p className="text-sm text-slate-700">Uses your actual PRs and race times for workout paces</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Progressive</h4>
                  <p className="text-sm text-slate-700">Builds fitness safely without rigid weekly jumps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Preview Section */}
      <section className="relative z-10 py-24 px-6 border-t border-orange-100 bg-gradient-to-b from-orange-50/50 to-blue-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              See What You'll Get Every Week
            </h2>
            <p className="text-slate-700 text-lg max-w-2xl mx-auto">
              No app to check, no spreadsheets to maintain. Just a clean, actionable training plan delivered to your inbox every Sunday morning.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Email Preview Card */}
            <div className="relative">
              {/* Email header decoration */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>

              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Email Client Header */}
                <div className="bg-slate-100 border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm text-slate-700 font-medium">Your Weekly Running Plan - January 13, 2025</div>
                  </div>
                </div>

                {/* Email Content */}
                <div className="p-8 bg-white">
                  {/* Email Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
                        <span className="text-xl">🏃‍♂️</span>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 uppercase tracking-wide font-semibold">From RunPlan</div>
                        <div className="text-sm text-slate-700">Your Training Plan: Week 8 of 16</div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">📊 This Week's Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">38 mi</div>
                        <div className="text-xs text-slate-700">Total Mileage</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">4</div>
                        <div className="text-xs text-slate-700">Run Days</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">Good</div>
                        <div className="text-xs text-slate-700">Recovery Status</div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Plan */}
                  <div className="space-y-3 mb-6">
                    <h3 className="text-base font-bold text-slate-900 mb-3">🗓️ Your Training Schedule</h3>

                    {/* Monday */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="min-w-[70px]">
                        <div className="text-xs font-semibold text-slate-600 uppercase">Monday</div>
                        <div className="text-sm text-slate-700">Jan 13</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">Easy Run</div>
                        <div className="text-sm text-slate-700">6 miles @ 9:30-10:00 min/mile</div>
                        <div className="text-xs text-slate-600 mt-1">💡 Focus on keeping your heart rate in Zone 2</div>
                      </div>
                    </div>

                    {/* Wednesday */}
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="min-w-[70px]">
                        <div className="text-xs font-semibold text-orange-600 uppercase">Wednesday</div>
                        <div className="text-sm text-slate-700">Jan 15</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">Tempo Run</div>
                        <div className="text-sm text-slate-700">8 miles (2 warm-up, 4 tempo @ 8:15, 2 cool-down)</div>
                        <div className="text-xs text-slate-600 mt-1">💡 Tempo pace should feel "comfortably hard"</div>
                      </div>
                    </div>

                    {/* Friday */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="min-w-[70px]">
                        <div className="text-xs font-semibold text-slate-600 uppercase">Friday</div>
                        <div className="text-sm text-slate-700">Jan 17</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">Recovery Run</div>
                        <div className="text-sm text-slate-700">4 miles @ easy pace</div>
                        <div className="text-xs text-slate-600 mt-1">💡 Keep it conversational</div>
                      </div>
                    </div>

                    {/* Sunday */}
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="min-w-[70px]">
                        <div className="text-xs font-semibold text-purple-600 uppercase">Sunday</div>
                        <div className="text-sm text-slate-700">Jan 19</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">Long Run</div>
                        <div className="text-sm text-slate-700">20 miles @ 9:45-10:15 min/mile</div>
                        <div className="text-xs text-slate-600 mt-1">💡 Your longest run yet - fuel every 45 min</div>
                      </div>
                    </div>
                  </div>

                  {/* Coach's Note */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">Coach's Note</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          Your recovery metrics look strong this week, so we're adding 2 miles to your long run. You're 8 weeks out from your marathon - this is where the real fitness building happens. Stay consistent and trust the process!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits callout below email */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-3xl mb-2">📧</div>
                <div className="text-slate-900 font-semibold mb-1">One Email</div>
                <div className="text-slate-700 text-sm">No app to check</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔄</div>
                <div className="text-slate-900 font-semibold mb-1">Auto-Updates</div>
                <div className="text-slate-700 text-sm">Adapts to your runs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-slate-900 font-semibold mb-1">Actionable</div>
                <div className="text-slate-700 text-sm">Just lace up and run</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="relative z-10 py-20 px-6 border-t border-orange-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Your Data Stays Yours
            </h2>
            <p className="text-slate-700 text-lg max-w-2xl mx-auto mb-4">
              We take privacy seriously. Your running data is personal, and we treat it that way.
            </p>
            <p className="text-slate-600 text-sm">
              Questions about privacy? Contact us at{' '}
              <a href="mailto:privacy@runplan.fun" className="text-blue-600 hover:text-blue-700 font-medium">
                privacy@runplan.fun
              </a>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-slate-900 font-semibold mb-2">Encrypted Storage</h3>
              <p className="text-slate-700 text-sm">Your tokens and data are encrypted. We can't see your Garmin password.</p>
            </div>

            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-slate-900 font-semibold mb-2">Never Sold</h3>
              <p className="text-slate-700 text-sm">We don't sell your data. Ever. No ads, no third-party sharing.</p>
            </div>

            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-slate-900 font-semibold mb-2">Delete Anytime</h3>
              <p className="text-slate-700 text-sm">Disconnect your account and we delete your data. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-6 border-t border-orange-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-700 text-lg">
              Everything you need to know about RunPlan
            </p>
          </div>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="text-purple-400 mt-1">💰</span>
                Is this really free?
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Yes! RunPlan is free to use — no credit card required, no hidden costs. We built RunPlan because we love running and wanted a better way to train. We may offer optional premium features in the future (like in-depth analytics or race-day strategy), but your core weekly training plans are included at no cost.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="text-blue-400 mt-1">⌚</span>
                Which running watches and platforms work?
              </h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                We support Garmin Connect&#8482; and Strava. This covers most major running watches:
              </p>
              <ul className="text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span><strong className="text-slate-900">Garmin Connect&#8482;:</strong> All Garmin running watches (Forerunner, Fenix, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span><strong className="text-slate-900">Strava:</strong> Apple Watch, Coros, Polar, Suunto, Wahoo, and any watch that syncs to Strava</span>
                </li>
              </ul>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="text-orange-400 mt-1">📧</span>
                Will you spam me?
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Absolutely not. You'll get exactly one email per week with your training plan - that's it. No marketing emails, no promotions, no "weekly tips" newsletters. You can unsubscribe anytime from any email, and we'll immediately stop sending plans (though we'll keep your account active in case you change your mind).
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="text-pink-400 mt-1">🤖</span>
                How does the AI actually work?
              </h3>
              <p className="text-slate-700 leading-relaxed">
                We analyze 7+ data points from your watch: weekly mileage, pace trends, recovery metrics (sleep, resting heart rate, HRV if available), training load, and workout consistency. Our AI compares your data against proven training principles (progressive overload, periodization, recovery cycles) and your specific goal (race date and target time). Each week, it generates a plan that pushes you forward without overtraining.
              </p>
            </div>

            {/* FAQ Item 5 */}
            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="text-green-400 mt-1">❌</span>
                What if I miss a workout or can't follow the plan?
              </h3>
              <p className="text-slate-700 leading-relaxed">
                No problem! Life happens. The next week's plan automatically adapts based on what you actually ran (not what was planned). Missed your long run? We'll adjust your mileage down. Crushed every workout and feeling great? We'll build on that momentum. The plan works with your reality, not against it.
              </p>
            </div>

            {/* FAQ Item 6 */}
            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="text-yellow-400 mt-1">👟</span>
                I'm a beginner - will this work for me?
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Absolutely. During setup, you'll tell us your experience level and current weekly mileage. If you're just starting out, we'll build a conservative plan focused on consistency and injury prevention. If you're already running 40+ miles per week, we'll design workouts that challenge you appropriately. The AI scales to your level.
              </p>
            </div>

            {/* FAQ Item 7 */}
            <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
                <span className="text-indigo-400 mt-1">🔒</span>
                Is my data secure?
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Yes. We use bank-level encryption for all stored data. Your Garmin/Strava tokens are encrypted and we never see your passwords. We're read-only - we can't post to your Strava feed, edit your activities, or access anything beyond your running data. Your information is never sold or shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#007CC3] via-purple-500 to-[#FC4C02] rounded-3xl blur-xl opacity-40"></div>
            <div className="relative bg-white border-2 border-purple-200 rounded-3xl p-12 text-center shadow-2xl">
              <div className="flex justify-center gap-4 mb-6">
                <GarminLogo className="w-14 h-14" />
                <div className="w-14 h-14 bg-[#FC4C02] rounded-xl flex items-center justify-center shadow-lg">
                  <StravaLogo className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Ready to Run Smarter?
              </h2>
              <p className="text-xl text-slate-700 mb-8 max-w-xl mx-auto">
                Connect your Garmin Connect&#8482; or Strava and get your first personalized running plan this week.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-orange-600 hover:to-pink-600 transition-all hover:scale-105 shadow-lg hover:shadow-xl">
                Create My Free Plan
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-600">
                <span>No credit card required</span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Your data stays private
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-orange-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm">🏃‍♂️</span>
              </div>
              <span className="font-semibold text-slate-900">RunPlan</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
                About
              </Link>
              <Link href="/terms" className="text-slate-600 hover:text-slate-900 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-slate-600 hover:text-slate-900 transition-colors">
                Privacy
              </Link>
              <Link href="/support" className="text-slate-600 hover:text-slate-900 transition-colors">
                Support
              </Link>
            </div>
          </div>
          <div className="text-center md:text-left mb-3">
            <p className="text-slate-600 text-sm">
              <a href="mailto:support@runplan.fun" className="text-slate-600 hover:text-slate-900 transition-colors">
                support@runplan.fun
              </a>
              {' '}<span className="text-slate-400">•</span>{' '}
              <a href="mailto:privacy@runplan.fun" className="text-slate-600 hover:text-slate-900 transition-colors">
                privacy@runplan.fun
              </a>
            </p>
          </div>
          <p className="text-slate-600 text-sm text-center md:text-left">
            © {new Date().getFullYear()} RunPlan. Run smarter, not harder.
          </p>
        </div>
      </footer>
    </div>
  )
}
