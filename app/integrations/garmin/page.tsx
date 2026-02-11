import Link from 'next/link'

export default function GarminIntegrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-xl">🏃‍♂️</span>
            </div>
            <span className="text-xl font-bold text-slate-900">RunPlan</span>
          </Link>
          <Link href="/" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-8 md:p-12">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#007CC3] rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  Garmin Connect Integration
                </h1>
                <p className="text-slate-600 mt-2">
                  Seamless connection to your Garmin watch data
                </p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              RunPlan integrates directly with Garmin Connect using Garmin's official OAuth 2.0 API to provide personalized training plans based on your real-world running data and health metrics. This integration gives RunPlan secure, read-only access to your fitness data without ever requiring your Garmin password.
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure OAuth Connection
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                We use Garmin's official OAuth 2.0 authentication. You authorize RunPlan directly through Garmin's secure login page—we never see or store your Garmin password.
              </p>
            </div>
          </section>

          {/* Compatible Devices */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Compatible Devices</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              RunPlan works with all Garmin running watches that sync to Garmin Connect, including:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Forerunner Series</h3>
                <p className="text-slate-700 text-sm">
                  Forerunner 55, 165, 255, 265, 955, 965, and all other Forerunner models
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Fenix Series</h3>
                <p className="text-slate-700 text-sm">
                  Fenix 6, 7, 8, and all Fenix variants (Pro, Solar, Sapphire, etc.)
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Epix Series</h3>
                <p className="text-slate-700 text-sm">
                  Epix Gen 2, Epix Pro, and all variants
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Other Models</h3>
                <p className="text-slate-700 text-sm">
                  Venu, Vivoactive, Enduro, MARQ, and any Garmin watch with running features
                </p>
              </div>
            </div>
          </section>

          {/* Data We Access */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">What Data We Access</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              With your permission, RunPlan accesses the following data from Garmin Connect to create personalized training plans:
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span>🏃</span>
                  Running Activities
                </h3>
                <ul className="text-slate-700 text-sm space-y-1 ml-6">
                  <li>• Distance, duration, and pace</li>
                  <li>• Date and time of runs</li>
                  <li>• Heart rate data (average and max)</li>
                  <li>• Cadence and elevation gain</li>
                  <li>• Training Effect and load scores</li>
                </ul>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span>💤</span>
                  Sleep & Recovery Metrics
                </h3>
                <ul className="text-slate-700 text-sm space-y-1 ml-6">
                  <li>• Sleep duration and quality (light, deep, REM)</li>
                  <li>• Sleep score and consistency</li>
                  <li>• Resting heart rate trends</li>
                  <li>• Heart rate variability (HRV) status</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span>⚡</span>
                  Health & Fitness Metrics
                </h3>
                <ul className="text-slate-700 text-sm space-y-1 ml-6">
                  <li>• Body Battery energy monitoring</li>
                  <li>• Stress level data</li>
                  <li>• VO2 Max estimates</li>
                  <li>• Training Status and Training Readiness</li>
                  <li>• Race time predictions</li>
                </ul>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span>📊</span>
                  Performance Trends
                </h3>
                <ul className="text-slate-700 text-sm space-y-1 ml-6">
                  <li>• Weekly mileage totals</li>
                  <li>• Acute and chronic training load</li>
                  <li>• Personal records (PRs) and achievements</li>
                  <li>• Workout consistency patterns</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Read-Only Access
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                <strong>Important:</strong> RunPlan has <strong>read-only</strong> access to your Garmin data. We cannot post activities, edit existing data, modify your profile, or access any non-fitness information. You can revoke access at any time from your Garmin Connect account settings.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Connect Your Account</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Click "Connect Garmin" in your RunPlan dashboard. You'll be redirected to Garmin's official login page where you securely authenticate with your Garmin account credentials.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Grant Permissions</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Review the permissions RunPlan is requesting (activities, sleep, health metrics) and authorize access. You're granting RunPlan permission to read your data, not modify it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Automatic Sync</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Once connected, RunPlan automatically syncs your data from Garmin Connect. New runs and health metrics are pulled daily to keep your training plan up-to-date.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Get Personalized Plans</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Every week, RunPlan analyzes your latest data and generates a personalized training plan adapted to your current fitness, recovery status, and race goals. Plans are delivered to your inbox every Sunday.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy & Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Privacy & Security</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encrypted Storage
                </h3>
                <p className="text-slate-700 text-sm">
                  All OAuth tokens and fitness data are encrypted with AES-256 before storage
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  No Password Storage
                </h3>
                <p className="text-slate-700 text-sm">
                  We never see or store your Garmin password—authentication happens on Garmin's servers
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Read-Only Access
                </h3>
                <p className="text-slate-700 text-sm">
                  We can only read your data, not modify, delete, or post anything
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Revoke Anytime
                </h3>
                <p className="text-slate-700 text-sm">
                  Disconnect your Garmin account from RunPlan or revoke access from Garmin Connect settings anytime
                </p>
              </div>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed">
              For complete details, see our <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</Link> and <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</Link>.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Do I need a Garmin watch to use RunPlan?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  You need either a Garmin watch or Strava account. If you don't have Garmin, you can connect Strava instead, which supports most other running watches (Apple Watch, Coros, Polar, Suunto, Wahoo).
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  What if my Garmin watch doesn't track sleep or HRV?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  RunPlan works with whatever data your watch provides. If your watch only tracks runs (older Forerunner models), we'll create plans based on your activity data. Newer watches with advanced health metrics enable more personalized recovery-based adjustments.
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  How often does RunPlan sync with Garmin Connect?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  RunPlan syncs daily to pull new activities and health metrics. When you complete a run, it typically appears in RunPlan within 24 hours. Your weekly training plan is generated every Sunday using your most recent data.
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Can RunPlan post workouts to my Garmin watch?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Not currently. RunPlan sends training plans via email, which you follow using your watch manually. We may add workout push functionality in the future if there's demand.
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  What happens if I disconnect my Garmin account?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  If you disconnect Garmin, RunPlan will immediately stop accessing your data and generating training plans. Your historical data in RunPlan will be retained for 30 days in case you reconnect, then permanently deleted.
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Is my Garmin data shared with third parties?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  No. Your Garmin data is used exclusively to generate your personalized training plans. We never sell, rent, or share your data with third parties. See our <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</Link> for details.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to Connect Your Garmin?</h3>
            <p className="text-slate-700 mb-6">
              Create your RunPlan account and connect your Garmin watch in under 2 minutes.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-pink-600 transition-all hover:scale-105 shadow-lg"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm">🏃‍♂️</span>
            </div>
            <span className="font-semibold text-slate-900">RunPlan</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
              Home
            </Link>
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
      </footer>
    </div>
  )
}
