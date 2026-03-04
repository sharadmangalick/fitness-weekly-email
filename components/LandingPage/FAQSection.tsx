export default function FAQSection() {
  return (
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
          <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
              <span className="text-purple-400 mt-1">💰</span>
              Is this really free?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Yes! RunPlan is free to use — no credit card required, no hidden costs. We built RunPlan because we love running and wanted a better way to train. We may offer optional premium features in the future (like in-depth analytics or race-day strategy), but your core weekly training plans are included at no cost.
            </p>
          </div>

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

          <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
              <span className="text-orange-400 mt-1">📧</span>
              Will you spam me?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Absolutely not. You&apos;ll get exactly one email per week with your training plan - that&apos;s it. No marketing emails, no promotions, no &quot;weekly tips&quot; newsletters. You can unsubscribe anytime from any email, and we&apos;ll immediately stop sending plans (though we&apos;ll keep your account active in case you change your mind).
            </p>
          </div>

          <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
              <span className="text-pink-400 mt-1">🤖</span>
              How does the AI actually work?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              We analyze 7+ data points from your watch: weekly mileage, pace trends, recovery metrics (sleep, resting heart rate, HRV if available), training load, and workout consistency. Our AI compares your data against proven training principles (progressive overload, periodization, recovery cycles) and your specific goal (whether that&apos;s a race, building mileage, or getting back from injury). Each week, it generates a plan that pushes you forward without overtraining.
            </p>
          </div>

          <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
              <span className="text-green-400 mt-1">❌</span>
              What if I miss a workout or can&apos;t follow the plan?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              No problem! Life happens. The next week&apos;s plan automatically adapts based on what you actually ran (not what was planned). Missed your long run? We&apos;ll adjust your mileage down. Crushed every workout and feeling great? We&apos;ll build on that momentum. The plan works with your reality, not against it.
            </p>
          </div>

          <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
              <span className="text-yellow-400 mt-1">👟</span>
              I&apos;m a beginner - will this work for me?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Absolutely. During setup, you&apos;ll tell us your experience level and current weekly mileage. If you&apos;re just starting out, we&apos;ll build a conservative plan focused on consistency and injury prevention. If you&apos;re already running 40+ miles per week, we&apos;ll design workouts that challenge you appropriately. The AI scales to your level.
            </p>
          </div>

          <div className="bg-white/90 border-2 border-orange-100 rounded-2xl shadow-md p-6 hover:border-purple-200 transition-colors">
            <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-start gap-3">
              <span className="text-indigo-400 mt-1">🔒</span>
              Is my data secure?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Yes. We use bank-level encryption for all stored data. Your Garmin/Strava tokens are encrypted and we never see your passwords. We&apos;re read-only - we can&apos;t post to your Strava feed, edit your activities, or access anything beyond your running data. Your information is never sold or shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
