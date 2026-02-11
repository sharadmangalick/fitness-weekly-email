import Link from 'next/link'

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="text-slate-600 mb-8">
            <strong>Effective Date:</strong> February 10, 2026
          </p>
          <p className="text-slate-700 mb-8 leading-relaxed">
            Welcome to RunPlan. By accessing or using our service, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          {/* Section 1 */}
          <section id="acceptance" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">1.</span>
              Acceptance of Terms
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              By creating an account, connecting a fitness platform (Garmin Connect or Strava), or using any part of the RunPlan service ("Service"), you agree to these Terms of Service ("Terms"), our <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</Link>, and all applicable laws and regulations.
            </p>
            <p className="text-slate-700 leading-relaxed">
              If you do not agree to these Terms, you may not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section id="service-description" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">2.</span>
              Description of Service
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              RunPlan is a personalized running coaching platform that:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Connects to your Garmin Connect or Strava account via official OAuth APIs</li>
              <li>Analyzes your running activities, recovery metrics, and health data</li>
              <li>Generates personalized weekly training plans based on your goals and fitness level</li>
              <li>Delivers training plans to your email address on a weekly basis</li>
            </ul>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
              <p className="text-slate-700 text-sm leading-relaxed">
                <strong>Important:</strong> RunPlan is a training tool, not medical advice. Always consult with a healthcare provider before starting any new exercise program, especially if you have pre-existing health conditions.
              </p>
            </div>

            <p className="text-slate-700 leading-relaxed">
              The Service is provided on an "as-is" basis. We continuously work to improve the Service, but we make no guarantees about specific training outcomes or results.
            </p>
          </section>

          {/* Section 3 */}
          <section id="user-accounts" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">3.</span>
              User Accounts and Responsibilities
            </h2>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">3.1 Account Creation</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              To use RunPlan, you must:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">3.2 Account Security</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Keeping your password confidential and secure</li>
              <li>Notifying us immediately of any unauthorized access to your account</li>
              <li>Ensuring your email address is current and accessible</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">3.3 Prohibited Activities</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
              <li>Use automated scripts, bots, or scrapers to access the Service</li>
              <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
              <li>Impersonate any person or entity, or falsely represent your affiliation</li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Use the Service to spam, harass, or abuse others</li>
            </ul>

            <p className="text-slate-700 leading-relaxed">
              Violation of these terms may result in immediate termination of your account.
            </p>
          </section>

          {/* Section 4 */}
          <section id="platform-connections" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">4.</span>
              Platform Connections (Garmin Connect & Strava)
            </h2>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">4.1 OAuth Authorization</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              When you connect your Garmin Connect or Strava account to RunPlan:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>You authorize RunPlan to access your fitness and health data via official OAuth APIs</li>
              <li>RunPlan has <strong>read-only</strong> access and cannot post, edit, or delete your activities</li>
              <li>You can revoke access at any time from your Garmin or Strava account settings</li>
              <li>Revoking access will stop data synchronization and training plan generation</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">4.2 Data Accuracy</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              RunPlan relies on data provided by Garmin Connect and Strava:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>We are not responsible for inaccuracies in data provided by third-party platforms</li>
              <li>Training plans are generated based on available data at the time of generation</li>
              <li>If platform APIs are unavailable or data is incomplete, plan quality may be affected</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">4.3 Third-Party Terms</h3>
            <p className="text-slate-700 leading-relaxed">
              Your use of Garmin Connect and Strava is subject to their respective terms of service and privacy policies. RunPlan is not responsible for the practices or policies of these third-party services.
            </p>
          </section>

          {/* Section 5 */}
          <section id="privacy-data" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">5.</span>
              Privacy and Data Usage
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</Link>, which is incorporated into these Terms by reference.
            </p>

            <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-6 mb-4">
              <h3 className="font-semibold text-slate-900 mb-2">Key Privacy Commitments:</h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 text-sm">
                <li>Your data is encrypted and never sold to third parties</li>
                <li>We only use your data to generate personalized training plans</li>
                <li>You can delete your account and all associated data at any time</li>
                <li>We comply with GDPR (EU) and CCPA (California) privacy regulations</li>
              </ul>
            </div>

            <p className="text-slate-700 leading-relaxed">
              For detailed information about data collection, usage, and your rights, please review our <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</Link>.
            </p>
          </section>

          {/* Section 6 */}
          <section id="intellectual-property" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">6.</span>
              Intellectual Property
            </h2>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">6.1 RunPlan Ownership</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              The Service, including all content, features, functionality, software, algorithms, trademarks, logos, and branding ("RunPlan IP"), is owned by RunPlan and protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-slate-700 mb-6 leading-relaxed">
              You may not copy, modify, distribute, sell, or lease any part of the Service without our explicit written permission.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">6.2 Your Content</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              You retain all rights to your fitness data, activities, and personal information. By using the Service, you grant RunPlan a limited license to:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2 ml-4">
              <li>Access and process your fitness data to generate personalized training plans</li>
              <li>Store your data securely on our servers</li>
              <li>Use aggregated, anonymized data for service improvements and research</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              This license ends when you delete your account or revoke platform access.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">6.3 Training Plans</h3>
            <p className="text-slate-700 leading-relaxed">
              Training plans generated by RunPlan are for your personal, non-commercial use. You may not resell, redistribute, or claim ownership of training plans generated by our Service.
            </p>
          </section>

          {/* Section 7 */}
          <section id="disclaimers" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">7.</span>
              Disclaimers and Limitations of Liability
            </h2>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                Medical Disclaimer
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                <strong>RunPlan is not a substitute for professional medical advice, diagnosis, or treatment.</strong> Always consult with a qualified healthcare provider before beginning any new exercise program, especially if you:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4 text-sm">
                <li>Have any pre-existing medical conditions (heart disease, diabetes, injuries, etc.)</li>
                <li>Are pregnant or breastfeeding</li>
                <li>Are taking medications that may affect exercise tolerance</li>
                <li>Experience pain, dizziness, or discomfort during training</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">7.1 No Guarantees</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              While we strive to provide accurate and effective training plans, we make no guarantees regarding:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Achievement of specific race times or fitness goals</li>
              <li>Prevention of injury or illness</li>
              <li>Service uptime or availability (99.9% uptime target, but not guaranteed)</li>
              <li>Accuracy of third-party data (Garmin/Strava)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">7.2 Use at Your Own Risk</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Fitness for a particular purpose</li>
              <li>Merchantability</li>
              <li>Non-infringement</li>
              <li>Accuracy, reliability, or completeness of training plans</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">7.3 Limitation of Liability</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, RUNPLAN SHALL NOT BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Personal injury or property damage resulting from use of the Service</li>
              <li>Errors or omissions in training plans or advice</li>
              <li>Interruption or cessation of the Service</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              If your jurisdiction does not allow the exclusion of certain warranties or liabilities, the above limitations may not apply to you. In such cases, our liability is limited to the maximum extent permitted by applicable law.
            </p>
          </section>

          {/* Section 8 */}
          <section id="modifications" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">8.</span>
              Service Modifications and Availability
            </h2>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">8.1 Changes to the Service</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>Modify, suspend, or discontinue any part of the Service at any time</li>
              <li>Add or remove features, functionality, or integrations</li>
              <li>Change training plan algorithms and methodologies</li>
              <li>Update pricing (with notice for existing users)</li>
            </ul>
            <p className="text-slate-700 mb-6 leading-relaxed">
              We will make reasonable efforts to notify users of significant changes via email.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">8.2 Service Interruptions</h3>
            <p className="text-slate-700 leading-relaxed">
              The Service may be temporarily unavailable due to maintenance, updates, or unforeseen technical issues. We are not liable for any interruptions or downtime.
            </p>
          </section>

          {/* Section 9 */}
          <section id="termination" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">9.</span>
              Account Termination
            </h2>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">9.1 Termination by You</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              You may delete your account at any time from your account settings. Upon deletion:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>All personal data and training history will be permanently deleted within 30 days</li>
              <li>Platform connections (Garmin/Strava) will be revoked</li>
              <li>Weekly training plan emails will cease immediately</li>
              <li>This action is irreversible</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">9.2 Termination by RunPlan</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              We reserve the right to suspend or terminate your account if:
            </p>
            <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2 ml-4">
              <li>You violate these Terms of Service</li>
              <li>Your account is inactive for 3+ years (with email notice)</li>
              <li>Your actions threaten the security or integrity of the Service</li>
              <li>We are required to do so by law</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">9.3 Effect of Termination</h3>
            <p className="text-slate-700 leading-relaxed">
              Upon termination (by you or us), your right to access the Service immediately ceases. Provisions of these Terms that by their nature should survive termination (disclaimers, limitations of liability, intellectual property) will remain in effect.
            </p>
          </section>

          {/* Section 10 */}
          <section id="payment" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">10.</span>
              Payment and Pricing
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              RunPlan is currently <strong>free to use</strong>. No credit card is required, and there are no hidden fees.
            </p>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Future Paid Features</h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                We may introduce optional paid features in the future (such as advanced analytics, race-day strategies, or 1-on-1 coaching). If we do:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4 text-sm">
                <li>Core weekly training plans will remain <strong>free forever</strong></li>
                <li>Existing users will be notified before any paid features launch</li>
                <li>You will never be charged without explicit consent</li>
                <li>Free users will not lose existing functionality</li>
              </ul>
            </div>
          </section>

          {/* Section 11 */}
          <section id="governing-law" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">11.</span>
              Governing Law and Dispute Resolution
            </h2>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">11.1 Governing Law</h3>
            <p className="text-slate-700 mb-6 leading-relaxed">
              These Terms are governed by the laws of the United States and the state in which RunPlan operates, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">11.2 Dispute Resolution</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              If you have a dispute with RunPlan, please first contact us at <a href="mailto:support@runplan.fun" className="text-blue-600 hover:text-blue-700 font-medium">support@runplan.fun</a> to attempt informal resolution.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Any legal disputes that cannot be resolved informally shall be resolved through binding arbitration in accordance with the American Arbitration Association's rules, rather than in court (except where prohibited by law).
            </p>
          </section>

          {/* Section 12 */}
          <section id="general" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">12.</span>
              General Provisions
            </h2>

            <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-6">12.1 Entire Agreement</h3>
            <p className="text-slate-700 mb-6 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and RunPlan regarding the Service.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">12.2 Severability</h3>
            <p className="text-slate-700 mb-6 leading-relaxed">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">12.3 No Waiver</h3>
            <p className="text-slate-700 mb-6 leading-relaxed">
              Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-3">12.4 Assignment</h3>
            <p className="text-slate-700 leading-relaxed">
              You may not assign or transfer these Terms or your account to any third party without our written consent. RunPlan may assign these Terms in connection with a merger, acquisition, or sale of assets.
            </p>
          </section>

          {/* Section 13 */}
          <section id="changes-to-terms" className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">13.</span>
              Changes to These Terms
            </h2>
            <p className="text-slate-700 mb-4 leading-relaxed">
              We may update these Terms from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
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
              Your continued use of RunPlan after changes become effective constitutes acceptance of the updated Terms. If you do not agree with the changes, you must stop using the Service and delete your account.
            </p>
          </section>

          {/* Section 14 */}
          <section id="contact" className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-purple-500">14.</span>
              Contact Us
            </h2>
            <p className="text-slate-700 mb-6 leading-relaxed">
              If you have questions, concerns, or feedback about these Terms of Service, please contact us:
            </p>

            <div className="bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-sm text-slate-600">General Support</div>
                    <a href="mailto:support@runplan.fun" className="text-blue-600 hover:text-blue-700 font-medium">support@runplan.fun</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <div>
                    <div className="text-sm text-slate-600">Website</div>
                    <a href="https://www.runplan.fun" className="text-blue-600 hover:text-blue-700 font-medium">www.runplan.fun</a>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-slate-700 text-sm mt-6 italic">
              We aim to respond to all inquiries within 48 hours.
            </p>
          </section>

          {/* Footer Note */}
          <div className="border-t-2 border-orange-100 pt-8">
            <p className="text-slate-600 text-sm text-center leading-relaxed">
              These Terms of Service were last updated on <strong>February 10, 2026</strong>.<br />
              By using RunPlan, you acknowledge that you have read, understood, and agree to be bound by these Terms.
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
