import Link from 'next/link'

// Garmin Logo Component
const GarminLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4zm0 1.2c-4.636 0-8.4 3.764-8.4 8.4s3.764 8.4 8.4 8.4 8.4-3.764 8.4-8.4-3.764-8.4-8.4-8.4zm4.95 3.45L12 12l-1.65-1.65L12 8.7l4.95 4.95-4.95 4.95-1.65-1.65 3.3-3.3-3.3-3.3z"/>
  </svg>
)

// Strava Logo Component
const StravaLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zm-3.065-9.057l2.084-4.116 2.084 4.116h5.066L15.387 0l-5.15 8.887h2.085z"/>
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-xl">🏃‍♂️</span>
            </div>
            <span className="text-xl font-bold text-white">RunPlan</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors font-medium">
              Log In
            </Link>
            <Link href="/signup" className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-semibold hover:bg-slate-100 transition-all hover:scale-105">
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
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2">
              <div className="w-6 h-6 bg-[#007CC3] rounded-full flex items-center justify-center">
                <GarminLogo className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-medium text-sm">Garmin</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2">
              <div className="w-6 h-6 bg-[#FC4C02] rounded-full flex items-center justify-center">
                <StravaLogo className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white font-medium text-sm">Strava</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Your Running Data.</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Smarter Training Plans.
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-6 max-w-2xl mx-auto leading-relaxed">
            We pull your running data <span className="text-white font-semibold">automatically</span> from Garmin or Strava
            and deliver personalized weekly training plans to your inbox.
          </p>

          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
            No logging miles. No spreadsheets. Connect once and run smarter forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="group bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 flex items-center gap-2">
              Connect Your Account
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="#how-it-works" className="text-slate-300 hover:text-white px-6 py-4 font-medium transition-colors flex items-center gap-2">
              See How It Works
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Data Flow Visualization */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Source Platforms */}
            <div className="space-y-4">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 hover:border-[#007CC3]/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-[#007CC3] rounded-xl flex items-center justify-center shadow-lg shadow-[#007CC3]/20">
                    <GarminLogo className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Garmin Connect</div>
                    <div className="text-slate-400 text-sm">Auto-sync enabled</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    All Your Runs
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Sleep & Recovery
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Resting HR & VO2 Max
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 hover:border-[#FC4C02]/50 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-[#FC4C02] rounded-xl flex items-center justify-center shadow-lg shadow-[#FC4C02]/20">
                    <StravaLogo className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">Strava</div>
                    <div className="text-slate-400 text-sm">Auto-sync enabled</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    All Your Runs
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Pace & Mileage
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Weekly Volume
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow / Flow */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="text-slate-500 text-sm font-medium mb-4">AUTOMATIC SYNC</div>
              <div className="relative">
                <div className="w-24 h-1 bg-gradient-to-r from-[#007CC3] via-purple-500 to-[#FC4C02] rounded-full"></div>
                <div className="absolute -right-2 -top-1.5 w-0 h-0 border-l-8 border-l-[#FC4C02] border-y-4 border-y-transparent"></div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs text-slate-600 bg-slate-900 px-2">every week</span>
                </div>
              </div>
            </div>

            {/* Output - Training Plan */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <div className="text-white font-bold">Your Running Plan</div>
                  <div className="text-slate-400 text-sm">Delivered weekly</div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Mon</span>
                    <span className="text-white">Easy 5mi</span>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Wed</span>
                    <span className="text-orange-400">Tempo 6mi</span>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Sat</span>
                    <span className="text-purple-400">Long Run 14mi</span>
                  </div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-2.5 border border-green-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400">Weekly Total</span>
                    <span className="text-green-400 font-bold">32 miles</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center">
                8 weeks to your Half Marathon 🏃‍♂️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Sync Value Prop Banner */}
      <section className="relative z-10 py-12 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold">Auto-Sync</div>
                <div className="text-slate-400 text-sm">Data pulls automatically</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold">AI-Analyzed</div>
                <div className="text-slate-400 text-sm">Smart recommendations</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold">Weekly Email</div>
                <div className="text-slate-400 text-sm">Right to your inbox</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Connect once, get smarter training forever
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#007CC3] to-[#FC4C02] rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 h-full">
                <div className="flex gap-2 mb-6">
                  <div className="w-12 h-12 bg-[#007CC3] rounded-xl flex items-center justify-center">
                    <GarminLogo className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-12 h-12 bg-[#FC4C02] rounded-xl flex items-center justify-center">
                    <StravaLogo className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Connect Your Platform</h3>
                <p className="text-slate-400 leading-relaxed">
                  One-click connection to Garmin or Strava. We automatically pull your runs, mileage, pace, and recovery data.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Set Your Race Goal</h3>
                <p className="text-slate-400 leading-relaxed">
                  5K PR? First marathon? Building your base? Tell us your race and target time - we'll map out your training.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-orange-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl">📬</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Run with Your Plan</h3>
                <p className="text-slate-400 leading-relaxed">
                  Every week we analyze your runs and email your next week's workouts - easy days, tempos, long runs, rest days. <span className="text-white font-medium">Fully automatic.</span>
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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Runners Love It
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Running plans that adapt to how your body actually feels
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-[#007CC3]/50 transition-colors group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#007CC3]/20 rounded-lg flex items-center justify-center">
                  <GarminLogo className="w-5 h-5 text-[#007CC3]" />
                </div>
                <div className="w-10 h-10 bg-[#FC4C02]/20 rounded-lg flex items-center justify-center">
                  <StravaLogo className="w-5 h-5 text-[#FC4C02]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No Logging Required</h3>
              <p className="text-slate-400 leading-relaxed">
                Your runs sync <span className="text-white font-medium">automatically</span>. No entering miles, paces, or rest days. We pull everything from your watch.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-green-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-5">
                <span className="text-2xl">💚</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Recovery-Aware Mileage</h3>
              <p className="text-slate-400 leading-relaxed">
                Bad sleep? Elevated heart rate? We'll dial back your miles. Feeling fresh? Let's push that long run. Your plan adapts weekly.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-5">
                <span className="text-2xl">🏁</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Race-Ready Plans</h3>
              <p className="text-slate-400 leading-relaxed">
                5K, 10K, half marathon, or marathon - get the right mix of easy runs, tempo work, and long runs to hit your goal time.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-orange-500/50 transition-colors">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-5">
                <span className="text-2xl">📬</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Just Check Your Email</h3>
              <p className="text-slate-400 leading-relaxed">
                Your weekly plan arrives with every run mapped out - distance, pace, and purpose. No app. Just lace up and go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="relative z-10 py-20 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Data Stays Yours
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              We take privacy seriously. Your running data is personal, and we treat it that way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Encrypted Storage</h3>
              <p className="text-slate-400 text-sm">Your tokens and data are encrypted. We can't see your Garmin password.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Never Sold</h3>
              <p className="text-slate-400 text-sm">We don't sell your data. Ever. No ads, no third-party sharing.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Delete Anytime</h3>
              <p className="text-slate-400 text-sm">Disconnect your account and we delete your data. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#007CC3] via-purple-500 to-[#FC4C02] rounded-3xl blur-xl opacity-40"></div>
            <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-12 text-center">
              <div className="flex justify-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#007CC3] rounded-xl flex items-center justify-center shadow-lg">
                  <GarminLogo className="w-8 h-8 text-white" />
                </div>
                <div className="w-14 h-14 bg-[#FC4C02] rounded-xl flex items-center justify-center shadow-lg">
                  <StravaLogo className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Run Smarter?
              </h2>
              <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
                Connect your Garmin or Strava and get your first personalized running plan this week. Free to start.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-100 transition-all hover:scale-105">
                Get Started Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
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
      <footer className="relative z-10 py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm">🏃‍♂️</span>
            </div>
            <span className="font-semibold text-white">RunPlan</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} RunPlan. Run smarter, not harder.
          </p>
        </div>
      </footer>
    </div>
  )
}
