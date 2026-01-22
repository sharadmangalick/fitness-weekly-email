import Link from 'next/link'

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
              <span className="text-xl">🏃</span>
            </div>
            <span className="text-xl font-bold text-white">Fitness Weekly</span>
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
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-slate-300 text-sm">Now supporting Garmin & Strava</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Train Smarter with</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              AI-Powered Plans
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect your fitness tracker and get personalized weekly training plans
            delivered to your inbox. Built around <em>your</em> recovery, <em>your</em> goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="group bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 flex items-center gap-2">
              Start Free
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

        {/* Floating Cards Preview */}
        <div className="max-w-4xl mx-auto mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none"></div>
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold border-2 border-slate-900">S</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold border-2 border-slate-900">M</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold border-2 border-slate-900">+</div>
              </div>
              <div className="text-slate-400 text-sm">Join 500+ runners getting smarter training</div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <div className="text-3xl mb-3">📊</div>
                <div className="text-white font-semibold mb-1">Recovery Score</div>
                <div className="text-slate-400 text-sm">Based on HR, sleep & stress</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                  </div>
                  <span className="text-green-400 font-semibold text-sm">82%</span>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <div className="text-3xl mb-3">🎯</div>
                <div className="text-white font-semibold mb-1">This Week</div>
                <div className="text-slate-400 text-sm">Personalized for you</div>
                <div className="mt-3 text-2xl font-bold text-white">32 <span className="text-base font-normal text-slate-400">miles</span></div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <div className="text-3xl mb-3">🏆</div>
                <div className="text-white font-semibold mb-1">Goal Progress</div>
                <div className="text-slate-400 text-sm">Half Marathon: 8 weeks</div>
                <div className="mt-3 flex gap-1">
                  {[1,2,3,4,5,6,7,8].map((i) => (
                    <div key={i} className={`h-2 flex-1 rounded-full ${i <= 5 ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="relative z-10 py-16 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-slate-500 mb-8 text-sm uppercase tracking-wider font-medium">Syncs with your favorite platforms</p>
          <div className="flex justify-center items-center gap-16">
            <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="font-semibold text-lg">Garmin Connect</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zm-3.065-9.057l2.084-4.116 2.084 4.116h5.066L15.387 0l-5.15 8.887h2.085z"/>
                </svg>
              </div>
              <span className="font-semibold text-lg">Strava</span>
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
              Three simple steps to smarter training
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Connect Your Watch</h3>
                <p className="text-slate-400 leading-relaxed">
                  Link your Garmin or Strava account in one click. We securely access your activity, sleep, and recovery data.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Set Your Goals</h3>
                <p className="text-slate-400 leading-relaxed">
                  Training for a 5K? Marathon? Or just building fitness? Tell us your goal and we'll build your path.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Get Your Plan</h3>
                <p className="text-slate-400 leading-relaxed">
                  Every week, receive a personalized training plan that adapts to your recovery and keeps you progressing.
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
              Training That Adapts to You
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Not just another cookie-cutter plan
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-5">
                <span className="text-2xl">💚</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Recovery-First Approach</h3>
              <p className="text-slate-400 leading-relaxed">
                We monitor your resting heart rate, sleep quality, and body battery. When you need rest, your plan adjusts automatically.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-5">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Goal-Specific Workouts</h3>
              <p className="text-slate-400 leading-relaxed">
                Racing a half marathon? Building base miles? Your workouts are designed specifically for your goal and timeline.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-5">
                <span className="text-2xl">📬</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Weekly Email Delivery</h3>
              <p className="text-slate-400 leading-relaxed">
                Your plan arrives every week with clear daily workouts, target paces, and coaching notes. No app needed.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-5">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Private & Secure</h3>
              <p className="text-slate-400 leading-relaxed">
                Your data is encrypted and never shared. We use secure OAuth connections and you can disconnect anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Train Smarter?
              </h2>
              <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
                Join runners who get personalized plans based on their actual fitness data. Free to start.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-100 transition-all hover:scale-105">
                Create Free Account
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm">🏃</span>
            </div>
            <span className="font-semibold text-white">Fitness Weekly</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Fitness Weekly Email. Train smarter, not harder.
          </p>
        </div>
      </footer>
    </div>
  )
}
