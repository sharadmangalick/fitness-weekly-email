import Link from 'next/link'

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            About RunPlan
          </h1>

          <div className="prose prose-slate max-w-none">
            {/* Mission Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-purple-500">🎯</span>
                Our Mission
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                RunPlan exists to help runners train smarter, run faster, and avoid injury through personalized, data-driven training plans that adapt to how their body is actually recovering.
              </p>
              <p className="text-slate-700 leading-relaxed">
                We believe every runner deserves access to intelligent coaching that responds to their unique physiology, schedule, and goals—without the complexity of traditional training apps or the cost of a personal coach.
              </p>
            </section>

            {/* Story Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-orange-500">📖</span>
                Our Story
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                RunPlan was born from a simple frustration: generic training plans don't account for real life. Whether you had a bad night's sleep, fought off a cold, or crushed a workout beyond expectations, traditional plans keep marching forward regardless of how your body feels.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                As runners ourselves, we knew there had to be a better way. Modern running watches already track sleep quality, resting heart rate, HRV, and training load—but most runners weren't using this data to adapt their training week to week.
              </p>
              <p className="text-slate-700 leading-relaxed">
                So we built RunPlan: an AI-powered running coach that analyzes your actual recovery metrics from Garmin Connect or Strava and delivers a personalized training plan directly to your inbox every week. No app to check. No manual logging. Just intelligent guidance that adapts to your reality.
              </p>
            </section>

            {/* How It Works Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-blue-500">⚙️</span>
                How We Do It
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Data-Driven Personalization</h3>
                <p className="text-slate-700 text-sm leading-relaxed mb-3">
                  We connect directly to your Garmin Connect or Strava account to automatically sync your runs, recovery metrics, and health data. Our AI analyzes:
                </p>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Weekly mileage and pace trends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Sleep quality and duration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Resting heart rate and HRV</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Training load and stress levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>VO2 Max and fitness trends</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Proven Training Principles</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Our AI combines your personal data with evidence-based training science: progressive overload, periodization, recovery cycles, and race-specific preparation. Every week, your plan balances pushing forward with preventing overtraining—adapting to what you actually did, not just what was planned.
                </p>
              </div>
            </section>

            {/* Commitment Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-green-500">🔒</span>
                Our Commitment to You
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-slate-200 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    Free Forever
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Your weekly training plans will always be free. No hidden costs, no credit card required, no trial that converts to paid.
                  </p>
                </div>

                <div className="border-2 border-slate-200 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">🔐</span>
                    Privacy First
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Your data is encrypted, never sold, and used only to generate your training plans. You can delete everything anytime.
                  </p>
                </div>

                <div className="border-2 border-slate-200 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">📧</span>
                    No Spam
                  </h3>
                  <p className="text-slate-700 text-sm">
                    One email per week with your training plan. That's it. No marketing emails, no promotions, no "tips" newsletters.
                  </p>
                </div>

                <div className="border-2 border-slate-200 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">🤝</span>
                    Runner-Built
                  </h3>
                  <p className="text-slate-700 text-sm">
                    We're runners, not a faceless corporation. We use RunPlan ourselves and constantly improve it based on real feedback.
                  </p>
                </div>
              </div>
            </section>

            {/* Platform Integration Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-purple-500">🔗</span>
                Platform Integrations
              </h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                RunPlan integrates with the fitness platforms you already use through secure, official OAuth connections:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 border-2 border-blue-100 rounded-xl">
                  <div className="w-12 h-12 bg-[#007CC3] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Garmin Connect</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Access to runs, sleep, resting HR, HRV, Body Battery, stress levels, and VO2 Max from all Garmin watches (Forerunner, Fenix, etc.). We use Garmin's official OAuth API for secure, read-only access.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-orange-50 border-2 border-orange-100 rounded-xl">
                  <div className="w-12 h-12 bg-[#FC4C02] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zm-3.065-9.057l2.084-4.116 2.084 4.116h5.066L15.387 0l-5.15 8.887h2.085z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Strava</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Connect any watch that syncs to Strava (Apple Watch, Coros, Polar, Suunto, Wahoo, and more). We pull your activities, pace data, and weekly mileage through Strava's official OAuth API.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-slate-700 text-sm leading-relaxed">
                  <strong>Read-Only Access:</strong> RunPlan has read-only access to your fitness data. We cannot post activities, edit your data, or access any non-fitness information from your account.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-pink-500">💬</span>
                Get in Touch
              </h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                We're here to help! Whether you have questions, feedback, or need support, we'd love to hear from you.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="text-xs text-slate-600">General Support</div>
                        <a href="mailto:support@runplan.fun" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          support@runplan.fun
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <div>
                        <div className="text-xs text-slate-600">Privacy Inquiries</div>
                        <a href="mailto:privacy@runplan.fun" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          privacy@runplan.fun
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Online</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <div>
                        <div className="text-xs text-slate-600">Website</div>
                        <a href="https://www.runplan.fun" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          www.runplan.fun
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="text-xs text-slate-600">Support Center</div>
                        <Link href="/support" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Help & FAQs
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <div className="bg-gradient-to-br from-purple-50 to-orange-50 border-2 border-purple-200 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to Train Smarter?</h3>
              <p className="text-slate-700 mb-6">
                Join runners who are already training with personalized, adaptive plans.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-pink-600 transition-all hover:scale-105 shadow-lg"
              >
                Create Your Free Plan
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
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
