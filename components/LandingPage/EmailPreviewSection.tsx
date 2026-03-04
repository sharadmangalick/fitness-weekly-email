export default function EmailPreviewSection() {
  return (
    <section className="relative z-10 py-24 px-6 border-t border-orange-100 bg-gradient-to-b from-orange-50/50 to-blue-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            See What You'll Get Every Week
          </h2>
          <p className="text-slate-700 text-lg max-w-2xl mx-auto">
            No app to check, no spreadsheets to maintain. Just a clean, actionable training plan delivered to your inbox every Sunday morning.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Email Preview Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>

            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Email Client Header */}
              <div className="bg-slate-100 border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-sm text-slate-700 font-medium">Your Weekly Running Plan - January 13, 2025</div>
                </div>
              </div>

              {/* Email Content */}
              <div className="p-8 bg-white">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xl">🏃‍♂️</span>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide font-semibold">From RunPlan</div>
                      <div className="text-sm text-slate-700">Your Training Plan: Week 8 of 16</div>
                    </div>
                  </div>
                </div>

                {/* Weekly Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">📊 This Week&apos;s Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">38 mi</div>
                      <div className="text-xs text-slate-700">Total Mileage</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">4</div>
                      <div className="text-xs text-slate-700">Run Days</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">Good</div>
                      <div className="text-xs text-slate-700">Recovery Status</div>
                    </div>
                  </div>
                </div>

                {/* Weekly Plan */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-base font-bold text-slate-900 mb-3">🗓️ Your Training Schedule</h3>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="min-w-[70px]">
                      <div className="text-xs font-semibold text-slate-600 uppercase">Monday</div>
                      <div className="text-sm text-slate-700">Jan 13</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">Easy Run</div>
                      <div className="text-sm text-slate-700">6 miles @ 9:30-10:00 min/mile</div>
                      <div className="text-xs text-slate-600 mt-1">💡 Focus on keeping your heart rate in Zone 2</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="min-w-[70px]">
                      <div className="text-xs font-semibold text-orange-600 uppercase">Wednesday</div>
                      <div className="text-sm text-slate-700">Jan 15</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">Tempo Run</div>
                      <div className="text-sm text-slate-700">8 miles (2 warm-up, 4 tempo @ 8:15, 2 cool-down)</div>
                      <div className="text-xs text-slate-600 mt-1">💡 Tempo pace should feel &quot;comfortably hard&quot;</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="min-w-[70px]">
                      <div className="text-xs font-semibold text-slate-600 uppercase">Friday</div>
                      <div className="text-sm text-slate-700">Jan 17</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">Recovery Run</div>
                      <div className="text-sm text-slate-700">4 miles @ easy pace</div>
                      <div className="text-xs text-slate-600 mt-1">💡 Keep it conversational</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="min-w-[70px]">
                      <div className="text-xs font-semibold text-purple-600 uppercase">Sunday</div>
                      <div className="text-sm text-slate-700">Jan 19</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">Long Run</div>
                      <div className="text-sm text-slate-700">20 miles @ 9:45-10:15 min/mile</div>
                      <div className="text-xs text-slate-600 mt-1">💡 Your longest run yet - fuel every 45 min</div>
                    </div>
                  </div>
                </div>

                {/* Coach's Note */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Coach&apos;s Note</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Your recovery metrics look strong this week, so we&apos;re adding 2 miles to your long run. You&apos;re 8 weeks out from your marathon - this is where the real fitness building happens. Stay consistent and trust the process!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits callout below email */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="text-3xl mb-2">📧</div>
              <div className="text-slate-900 font-semibold mb-1">One Email</div>
              <div className="text-slate-700 text-sm">No app to check</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <div className="text-slate-900 font-semibold mb-1">Auto-Updates</div>
              <div className="text-slate-700 text-sm">Adapts to your runs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-slate-900 font-semibold mb-1">Actionable</div>
              <div className="text-slate-700 text-sm">Just lace up and run</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
