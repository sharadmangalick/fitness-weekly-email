import Link from 'next/link'

export default function StravaIntegrationPage() {
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
              <div className="w-16 h-16 bg-[#FC4C02] rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zm-3.065-9.057l2.084-4.116 2.084 4.116h5.066L15.387 0l-5.15 8.887h2.085z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                  Strava Integration
                </h1>
                <p className="text-slate-600 mt-2">
                  Connect any running watch through Strava
                </p>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              RunPlan integrates with Strava using Strava's official OAuth 2.0 API to provide personalized training plans based on your running activities. If you track your runs on Strava—whether from an Apple Watch, Coros, Polar, Suunto, Wahoo, or any other device—RunPlan can analyze your data to create adaptive weekly training plans.
            </p>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure OAuth Connection
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                We use Strava's official OAuth 2.0 authentication. You authorize RunPlan directly through Strava's secure login page—we never see or store your Strava password.
              </p>
            </div>
          </section>

          {/* Compatible Devices */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Compatible Devices</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              RunPlan works with any device that syncs activities to Strava, including:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Apple Watch</h3>
                <p className="text-slate-700 text-sm">
                  All Apple Watch models (Series 3 and newer) with the Strava app or syncing to Strava
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Coros</h3>
                <p className="text-slate-700 text-sm">
                  Pace, Apex, Vertix, and all other Coros running watches
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Polar</h3>
                <p className="text-slate-700 text-sm">
                  Vantage, Pacer, Grit X, and all Polar sports watches
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Suunto</h3>
                <p className="text-slate-700 text-sm">
                  Suunto 5, 9, Vertical, Race, and other Suunto models
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Wahoo</h3>
                <p className="text-slate-700 text-sm">
                  Wahoo ELEMNT RIVAL and other Wahoo devices
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Garmin via Strava</h3>
                <p className="text-slate-700 text-sm">
                  Garmin users can also connect through Strava if preferred
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Mobile Apps</h3>
                <p className="text-slate-700 text-sm">
                  Strava mobile app, Nike Run Club, or any app that exports to Strava
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Other Devices</h3>
                <p className="text-slate-700 text-sm">
                  Any GPS watch or tracker that can sync activities to Strava
                </p>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-slate-700 text-sm leading-relaxed">
                <strong>Tip:</strong> If your watch doesn't directly connect to Strava, check if it can export activities as GPX or FIT files, which you can manually upload to Strava.
              </p>
            </div>
          </section>

          {/* Data We Access */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">What Data We Access</h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              With your permission, RunPlan accesses the following data from Strava to create personalized training plans:
            </p>

            <div className="space-y-4">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span>🏃</span>
                  Running Activities
                </h3>
                <ul className="text-slate-700 text-sm space-y-1 ml-6">
                  <li>• Distance, duration, and pace</li>
                  <li>• Date and time of runs</li>
                  <li>• Heart rate data (if available from your device)</li>
                  <li>• Elevation gain and cadence (if tracked)</li>
                  <li>• Splits and laps</li>
                  <li>• Perceived effort and workout type</li>
                </ul>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span>📊</span>
                  Performance Metrics
                </h3>
                <ul className="text-slate-700 text-sm space-y-1 ml-6">
                  <li>• Weekly and monthly mileage totals</li>
                  <li>• Pace trends and improvements</li>
                  <li>• Personal records (fastest times by distance)</li>
                  <li>• Workout consistency and patterns</li>
                  <li>• Activity frequency</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span>💪</span>
                  Training Load
                </h3>
                <ul className="text-slate-700 text-sm space-y-1 ml-6">
                  <li>• Relative Effort scores (if heart rate data available)</li>
                  <li>• Acute and chronic training load trends</li>
                  <li>• Workout intensity distribution</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-slate-700 text-sm leading-relaxed">
                <strong>Note:</strong> Strava does not provide sleep, HRV, or advanced recovery metrics like Garmin does. RunPlan will create training plans based on your activity data and workout consistency. For more comprehensive recovery-based training, consider connecting a Garmin watch instead.
              </p>
            </div>

            <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Read-Only Access
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                <strong>Important:</strong> RunPlan has <strong>read-only</strong> access to your Strava data. We cannot post activities, kudos, comments, or modify your profile. You can revoke access at any time from your Strava account settings.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Connect Your Strava Account</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Click "Connect Strava" in your RunPlan dashboard. You'll be redirected to Strava's official authorization page where you securely log in with your Strava credentials.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-600">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Grant Permissions</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Review the permissions RunPlan is requesting (read activities, view profile) and click "Authorize." You're giving RunPlan permission to read your activity data, not modify it.
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
                    Once connected, RunPlan automatically pulls your activities from Strava. New runs are synced daily to keep your training plan current.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Get Personalized Plans</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Every Sunday, RunPlan analyzes your recent runs, weekly mileage, and pace trends to generate a personalized training plan for the week ahead. Plans are delivered directly to your inbox.
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
                  All OAuth tokens and activity data are encrypted with AES-256 before storage
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
                  We never see or store your Strava password—authentication happens on Strava's servers
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
                  We can only read your activities, not post, edit, or delete anything on Strava
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
                  Disconnect Strava from RunPlan or revoke access from Strava settings anytime
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
                  Can I use both Garmin and Strava connections?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Currently, you can only connect one platform at a time (either Garmin Connect or Strava). If you have a Garmin watch, we recommend connecting Garmin directly for access to advanced health metrics like sleep, HRV, and Body Battery.
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  What if I upload runs manually to Strava?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  That works fine! RunPlan will sync any activities on your Strava account, whether they were automatically uploaded from a watch or manually added. Just make sure to include pace and distance data.
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Does Strava integration access my private activities?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Yes, RunPlan can access your private activities because you've explicitly authorized access. We treat all your data confidentially and never share it. Your activity privacy settings on Strava (public/private) remain unchanged.
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  How often does RunPlan sync with Strava?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  RunPlan syncs daily to pull new activities. When you complete a run and it appears on Strava, it typically shows up in RunPlan within 24 hours. Your weekly training plan is generated every Sunday using your most recent data.
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Will RunPlan post my training plan to Strava?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  No. RunPlan has read-only access and cannot post anything to your Strava feed. Your training plans are delivered exclusively via email.
                </p>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  What happens if I disconnect my Strava account?
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  If you disconnect Strava, RunPlan will immediately stop accessing your data and generating training plans. Your historical data in RunPlan will be retained for 30 days in case you reconnect, then permanently deleted.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to Connect Your Strava?</h3>
            <p className="text-slate-700 mb-6">
              Create your RunPlan account and connect Strava in under 2 minutes.
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
