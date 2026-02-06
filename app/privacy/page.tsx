import Link from 'next/link'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-600 mb-8">
            <strong>Effective Date:</strong> February 6, 2026
          </p>
          <p className="text-slate-700 mb-8 leading-relaxed">
            At RunPlan, your privacy is paramount. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our personalized running coaching service.
          </p>

          {/* Table of Contents */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-12 border border-purple-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Navigation</h2>
            <nav className="space-y-2">
              <a href="#what-we-collect" className="block text-blue-600 hover:text-blue-700 font-medium">1. What Information We Collect</a>
              <a href="#how-we-use" className="block text-blue-600 hover:text-blue-700 font-medium">2. How We Use Your Information</a>
              <a href="#how-we-store" className="block text-blue-600 hover:text-blue-700 font-medium">3. How We Store Your Data</a>
              <a href="#third-party" className="block text-blue-600 hover:text-blue-700 font-medium">4. Third-Party Services</a>
              <a href="#data-sharing" className="block text-blue-600 hover:text-blue-700 font-medium">5. Data Sharing and Disclosure</a>
              <a href="#your-rights" className="block text-blue-600 hover:text-blue-700 font-medium">6. Your Privacy Rights</a>
              <a href="#data-retention" className="block text-blue-600 hover:text-blue-700 font-medium">7. Data Retention</a>
              <a href="#security" className="block text-blue-600 hover:text-blue-700 font-medium">8. Security Measures</a>
              <a href="#children" className="block text-blue-600 hover:text-blue-700 font-medium">9. Children's Privacy</a>
              <a href="#international" className="block text-blue-600 hover:text-blue-700 font-medium">10. International Users</a>
              <a href="#changes" className="block text-blue-600 hover:text-blue-700 font-medium">11. Changes to This Policy</a>
              <a href="#contact" className="block text-blue-600 hover:text-blue-700 font-medium">12. Contact Us</a>
            </nav>
          </div>

          {/* Section 1 */}
          <section id="what-we-collect" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">1.</span>
              What Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">1.1 Account Information</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              When you create a RunPlan account, we collect:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Email address (for account access and weekly training plan delivery)</li>
              <li>Password (encrypted and never stored in plain text)</li>
              <li>Account preferences (notification settings, training goals)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">1.2 Fitness Platform Data</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              When you connect Garmin Connect or Strava to RunPlan, we access the following data through official OAuth APIs:
            </p>

            <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-6 mb-4">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <span>📊</span>
                Activity Data
              </h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1 ml-6">
                <li>Running activities (distance, duration, pace, date/time)</li>
                <li>Heart rate data during activities (average, max)</li>
                <li>Cadence and elevation gain</li>
                <li>Training load and perceived exertion (if available)</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-2 border-purple-100 rounded-xl p-6 mb-4">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <span>💤</span>
                Recovery Metrics (Garmin only)
              </h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1 ml-6">
                <li>Sleep duration and quality (light, deep, REM sleep stages)</li>
                <li>Resting heart rate and heart rate variability (HRV)</li>
                <li>Body Battery or stress level data</li>
                <li>VO2 Max estimates</li>
              </ul>
            </div>

            <p className="text-slate-700 leading-relaxed bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <strong>Important:</strong> We have read-only access to your fitness data. We cannot post activities, edit existing data, or access any non-fitness information from your Garmin or Strava account.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">1.3 Training Preferences</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              During setup and ongoing use, you provide:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Race goal (5K, 10K, half marathon, marathon, or base building)</li>
              <li>Target race date and goal time</li>
              <li>Current fitness level and weekly mileage</li>
              <li>Training preferences (preferred training days, maximum weekly mileage)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">1.4 Usage and Analytics Data</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              To improve our service, we collect:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Pages visited and features used</li>
              <li>Email open rates and link clicks (training plan emails)</li>
              <li>Browser type, device type, and operating system</li>
              <li>IP address and general geographic location (city/country level)</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              We use Google Analytics to track usage patterns. This data is anonymized and aggregated.
            </p>
          </section>

          {/* Section 2 */}
          <section id="how-we-use" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">2.</span>
              How We Use Your Information
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              We use your personal information solely to provide and improve the RunPlan service:
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">🏃‍♂️</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Generate Personalized Training Plans</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Analyze your running activities, recovery metrics, and training history to create weekly plans adapted to your current fitness and goals.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">📧</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Deliver Weekly Training Plans</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Send your personalized training plan to your email address every week (or at your preferred frequency).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">🔔</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Send Service Notifications</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Notify you of important account events (e.g., platform connection expiring, plan adjustments, race week reminders).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">🛠️</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Improve Our Service</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Analyze aggregated, anonymized usage data to improve training plan algorithms, fix bugs, and develop new features.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">💬</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Provide Customer Support</h3>
                  <p className="text-slate-700 leading-relaxed">
                    Respond to your questions, troubleshoot issues, and provide assistance when you contact us.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                What We Don't Do
              </h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-6">
                <li><strong>No selling your data</strong> - We never sell or rent your personal information to third parties</li>
                <li><strong>No advertising</strong> - We don't use your data for targeted advertising or marketing campaigns</li>
                <li><strong>No spam</strong> - We only send training plan emails and critical account notifications</li>
                <li><strong>No social sharing</strong> - We don't post to your Garmin or Strava feeds</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section id="how-we-store" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">3.</span>
              How We Store Your Data
            </h2>
            <p className="text-slate-700 mb-6 leading-relaxed">
              Your data security is our top priority. We implement industry-standard security measures:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encryption at Rest
                </h3>
                <p className="text-slate-700 text-sm">
                  All sensitive data (OAuth tokens, access credentials) is encrypted using AES-256 encryption before storage.
                </p>
              </div>

              <div className="bg-purple-50 border-2 border-purple-100 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Encryption in Transit
                </h3>
                <p className="text-slate-700 text-sm">
                  All data transmitted between your browser and our servers uses TLS 1.3 encryption (HTTPS).
                </p>
              </div>

              <div className="bg-orange-50 border-2 border-orange-100 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure Infrastructure
                </h3>
                <p className="text-slate-700 text-sm">
                  Hosted on Vercel with Supabase database infrastructure. Both services are SOC 2 Type II certified.
                </p>
              </div>

              <div className="bg-green-50 border-2 border-green-100 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Access Controls
                </h3>
                <p className="text-slate-700 text-sm">
                  Row-level security (RLS) policies ensure users can only access their own data. Passwords are hashed using bcrypt.
                </p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              <strong>Data Location:</strong> Your data is stored on secure servers located in the United States. By using RunPlan, you consent to the transfer and storage of your data in the U.S.
            </p>
          </section>

          {/* Section 4 */}
          <section id="third-party" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">4.</span>
              Third-Party Services
            </h2>
            <p className="text-slate-700 mb-6 leading-relaxed">
              RunPlan integrates with the following third-party services to provide our functionality:
            </p>

            <div className="space-y-4">
              <div className="border-2 border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#007CC3] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Garmin Connect</h3>
                </div>
                <p className="text-slate-700 text-sm mb-2 leading-relaxed">
                  We use Garmin's official OAuth 2.0 API to access your fitness and health data. Garmin's privacy policy governs how they handle your data on their platform.
                </p>
                <a href="https://www.garmin.com/en-US/privacy/connect/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Garmin Privacy Policy →
                </a>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#FC4C02] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Strava</h3>
                </div>
                <p className="text-slate-700 text-sm mb-2 leading-relaxed">
                  We use Strava's official OAuth 2.0 API to access your activity data. Strava's privacy policy governs how they handle your data on their platform.
                </p>
                <a href="https://www.strava.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Strava Privacy Policy →
                </a>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">GA</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Google Analytics</h3>
                </div>
                <p className="text-slate-700 text-sm mb-2 leading-relaxed">
                  We use Google Analytics to understand how users interact with RunPlan. This data is anonymized and aggregated. You can opt out of Google Analytics tracking using browser extensions.
                </p>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Google Privacy Policy →
                </a>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Supabase</h3>
                </div>
                <p className="text-slate-700 text-sm mb-2 leading-relaxed">
                  We use Supabase for authentication and database services. Supabase is SOC 2 Type II certified and GDPR compliant.
                </p>
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Supabase Privacy Policy →
                </a>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="data-sharing" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">5.</span>
              Data Sharing and Disclosure
            </h2>
            <p className="text-slate-700 mb-6 leading-relaxed">
              <strong>We do not sell your personal information.</strong> We only share your data in the following limited circumstances:
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-xl flex-shrink-0">⚖️</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Legal Compliance</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    We may disclose your information if required by law, court order, subpoena, or to comply with legal processes.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-xl flex-shrink-0">🛡️</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Safety and Security</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    To protect the rights, property, or safety of RunPlan, our users, or the public (e.g., fraud prevention, abuse detection).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-xl flex-shrink-0">🏢</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Business Transfers</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    If RunPlan is acquired or merged with another company, your information may be transferred as part of that transaction. You will be notified via email of any such change.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-xl flex-shrink-0">✅</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">With Your Consent</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    We may share your data with third parties if you explicitly consent (e.g., connecting to additional services in the future).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="your-rights" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">6.</span>
              Your Privacy Rights
            </h2>
            <p className="text-slate-700 mb-6 leading-relaxed">
              You have the following rights regarding your personal information:
            </p>

            <div className="space-y-3 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-1">🔍 Right to Access</h3>
                <p className="text-slate-700 text-sm">
                  Request a copy of all personal data we hold about you. You can view your data anytime in your dashboard.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-1">✏️ Right to Correction</h3>
                <p className="text-slate-700 text-sm">
                  Update or correct inaccurate information in your account settings.
                </p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-1">🗑️ Right to Deletion</h3>
                <p className="text-slate-700 text-sm">
                  Request permanent deletion of your account and all associated data. This can be done instantly from your account settings.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-1">📦 Right to Data Portability</h3>
                <p className="text-slate-700 text-sm">
                  Request your data in a machine-readable format (JSON/CSV export available from dashboard).
                </p>
              </div>

              <div className="bg-gradient-to-r from-pink-50 to-pink-100 border-l-4 border-pink-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-1">🚫 Right to Object</h3>
                <p className="text-slate-700 text-sm">
                  Object to processing of your data for specific purposes (e.g., opt out of analytics).
                </p>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-slate-900 mb-1">🔌 Right to Revoke Consent</h3>
                <p className="text-slate-700 text-sm">
                  Disconnect Garmin or Strava at any time from your dashboard. We immediately stop accessing your fitness data.
                </p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              To exercise any of these rights, visit your account settings or contact us at <a href="mailto:smangalick@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium">smangalick@gmail.com</a>. We will respond within 30 days.
            </p>
          </section>

          {/* Section 7 */}
          <section id="data-retention" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">7.</span>
              Data Retention
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide our service:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-6">
              <li><strong>Active accounts:</strong> Data retained indefinitely while your account is active</li>
              <li><strong>Inactive accounts:</strong> If you don't log in for 2+ years, we may send a reminder email. If no response after 3 years, your account may be deactivated</li>
              <li><strong>Deleted accounts:</strong> When you delete your account, all personal data is permanently deleted within 30 days</li>
              <li><strong>Legal requirements:</strong> Some data may be retained longer if required by law (e.g., transaction records, abuse reports)</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              You can delete your account anytime from your account settings. This action is immediate and irreversible.
            </p>
          </section>

          {/* Section 8 */}
          <section id="security" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">8.</span>
              Security Measures
            </h2>
            <p className="text-slate-700 mb-6 leading-relaxed">
              We take comprehensive measures to protect your data:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">🔐 Password Hashing</h3>
                <p className="text-slate-700 text-sm">All passwords hashed with bcrypt (industry standard)</p>
              </div>
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">🔒 Token Encryption</h3>
                <p className="text-slate-700 text-sm">OAuth tokens encrypted with AES-256 before storage</p>
              </div>
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">🌐 HTTPS Only</h3>
                <p className="text-slate-700 text-sm">All traffic encrypted in transit using TLS 1.3</p>
              </div>
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">🔍 Regular Audits</h3>
                <p className="text-slate-700 text-sm">Routine security audits and dependency updates</p>
              </div>
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">🚪 Access Controls</h3>
                <p className="text-slate-700 text-sm">Row-level security ensures data isolation</p>
              </div>
              <div className="border-2 border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">📊 Monitoring</h3>
                <p className="text-slate-700 text-sm">Real-time monitoring for suspicious activity</p>
              </div>
            </div>

            <div className="mt-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-slate-700 text-sm leading-relaxed">
                <strong>Security Breach Notification:</strong> In the unlikely event of a data breach affecting your personal information, we will notify you via email within 72 hours of discovery, as required by GDPR and CCPA regulations.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="children" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">9.</span>
              Children's Privacy
            </h2>
            <p className="text-slate-700 leading-relaxed">
              RunPlan is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we discover that we have inadvertently collected data from a child under 18, we will delete it immediately. If you believe we have collected information from a child, please contact us at <a href="mailto:smangalick@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium">smangalick@gmail.com</a>.
            </p>
          </section>

          {/* Section 10 */}
          <section id="international" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">10.</span>
              International Users
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              RunPlan is operated from the United States. If you are accessing our service from outside the U.S., please be aware that your information will be transferred to, stored, and processed in the United States.
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-4">
              <h3 className="font-semibold text-slate-900 mb-2">🇪🇺 European Union (GDPR)</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                RunPlan complies with GDPR requirements for EU residents. You have the right to access, correct, delete, port, and object to processing of your data. To exercise these rights, contact us at <a href="mailto:smangalick@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium">smangalick@gmail.com</a>.
              </p>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-2">🇺🇸 California (CCPA)</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                California residents have additional rights under the California Consumer Privacy Act (CCPA). You may request disclosure of what personal information we collect, sell (we don't), and share. You may also request deletion of your data. To exercise these rights, email <a href="mailto:smangalick@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium">smangalick@gmail.com</a> with "CCPA Request" in the subject line.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section id="changes" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">11.</span>
              Changes to This Policy
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
            </p>
            <p className="text-slate-700 mb-4 leading-relaxed">
              When we make significant changes, we will:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mb-4">
              <li>Update the "Effective Date" at the top of this page</li>
              <li>Notify you via email at the address associated with your account</li>
              <li>Display a prominent notice on our website for 30 days</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Your continued use of RunPlan after changes become effective constitutes acceptance of the updated policy. If you do not agree with the changes, you may delete your account.
            </p>
          </section>

          {/* Section 12 */}
          <section id="contact" className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">12.</span>
              Contact Us
            </h2>
            <p className="text-slate-700 mb-6 leading-relaxed">
              If you have questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us:
            </p>

            <div className="bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-sm text-slate-600">Email</div>
                    <a href="mailto:smangalick@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium">smangalick@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <div>
                    <div className="text-sm text-slate-600">Website</div>
                    <a href="https://fitness-weekly-email.vercel.app" className="text-blue-600 hover:text-blue-700 font-medium">fitness-weekly-email.vercel.app</a>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-slate-700 text-sm mt-6 italic">
              We aim to respond to all privacy inquiries within 30 days.
            </p>
          </section>

          {/* Footer Note */}
          <div className="border-t-2 border-orange-100 pt-8">
            <p className="text-slate-600 text-sm text-center leading-relaxed">
              This Privacy Policy was last updated on <strong>February 6, 2026</strong>.<br />
              By using RunPlan, you acknowledge that you have read and understood this Privacy Policy.
            </p>
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
