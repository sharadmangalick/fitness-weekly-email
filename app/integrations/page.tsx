import Link from 'next/link'

export default function IntegrationsPage() {
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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Platform Integrations
          </h1>
          <p className="text-slate-700 text-lg max-w-2xl mx-auto">
            Connect your running watch or fitness platform to get personalized training plans
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Garmin Card */}
          <Link href="/integrations/garmin" className="group">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-8 hover:border-blue-300 transition-all hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#007CC3] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Garmin Connect
                  </h2>
                  <p className="text-slate-600 text-sm">Official OAuth Integration</p>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mb-6">
                Connect your Garmin watch for comprehensive training plans based on activities, sleep, recovery metrics, and health data.
              </p>

              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-slate-900 text-sm">What You Get:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Sleep, HRV, Body Battery, and stress tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Recovery-aware training adjustments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>VO2 Max and Training Status insights</span>
                  </li>
                </ul>
              </div>

              <div className="text-sm text-slate-600 mb-4">
                <strong>Works with:</strong> Forerunner, Fenix, Epix, Venu, and all Garmin running watches
              </div>

              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-semibold group-hover:underline">
                  Learn More →
                </span>
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure OAuth
                </div>
              </div>
            </div>
          </Link>

          {/* Strava Card */}
          <Link href="/integrations/strava" className="group">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-8 hover:border-orange-300 transition-all hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#FC4C02] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zm-3.065-9.057l2.084-4.116 2.084 4.116h5.066L15.387 0l-5.15 8.887h2.085z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    Strava
                  </h2>
                  <p className="text-slate-600 text-sm">Official OAuth Integration</p>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mb-6">
                Connect any running watch through Strava to get personalized training plans based on your activity data and performance trends.
              </p>

              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-slate-900 text-sm">What You Get:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Activity data and pace trends analysis</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Weekly mileage and training load tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Personal records and consistency insights</span>
                  </li>
                </ul>
              </div>

              <div className="text-sm text-slate-600 mb-4">
                <strong>Works with:</strong> Apple Watch, Coros, Polar, Suunto, Wahoo, and any device that syncs to Strava
              </div>

              <div className="flex items-center justify-between">
                <span className="text-orange-600 font-semibold group-hover:underline">
                  Learn More →
                </span>
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure OAuth
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-900 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 text-slate-900 font-semibold">Garmin</th>
                  <th className="text-center py-3 px-4 text-slate-900 font-semibold">Strava</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-700">Running activities & pace</td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-700">Heart rate data</td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-700">Weekly mileage & trends</td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 bg-blue-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">Sleep tracking</td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-slate-400">—</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 bg-blue-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">HRV & recovery metrics</td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-slate-400">—</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 bg-blue-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">Body Battery & stress</td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-slate-400">—</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 bg-blue-50">
                  <td className="py-3 px-4 text-slate-700 font-medium">VO2 Max & Training Status</td>
                  <td className="text-center py-3 px-4">
                    <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-slate-400">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-slate-600 mt-4 text-center">
            💡 Garmin provides more comprehensive health data for recovery-aware training plans
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-purple-50 to-orange-50 border-2 border-purple-200 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to Connect?</h3>
          <p className="text-slate-700 mb-6">
            Create your RunPlan account and connect your platform in under 2 minutes.
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
