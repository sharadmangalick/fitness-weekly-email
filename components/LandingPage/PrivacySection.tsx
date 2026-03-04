export default function PrivacySection() {
  return (
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
            <p className="text-slate-700 text-sm">Your tokens and data are encrypted. We can&apos;t see your Garmin password.</p>
          </div>

          <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-semibold mb-2">Never Sold</h3>
            <p className="text-slate-700 text-sm">We don&apos;t sell your data. Ever. No ads, no third-party sharing.</p>
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
  )
}
