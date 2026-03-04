export default function SampleWeekComparison() {
  return (
    <section className="relative z-10 py-24 px-6 border-t border-orange-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Not Your Average Training Plan
          </h2>
          <p className="text-slate-700 text-lg max-w-2xl mx-auto">
            Most plans follow a rigid schedule. RunPlan adapts to how you're actually recovering and performing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Generic Plan Column */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-md overflow-hidden">
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📄</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Generic Plan</h3>
                  <p className="text-sm text-slate-600">Same for everyone</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-slate-600">Monday</span>
                  <span className="text-sm text-slate-500">Week 8</span>
                </div>
                <div className="text-slate-900 font-semibold">Rest</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-slate-600">Tuesday</span>
                </div>
                <div className="text-slate-900 font-semibold">Easy Run: 5 miles</div>
                <div className="text-xs text-slate-500 mt-1">Standard easy pace</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-slate-600">Wednesday</span>
                </div>
                <div className="text-slate-900 font-semibold">Speed Work: 6 × 800m</div>
                <div className="text-xs text-slate-500 mt-1">Fixed intervals</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-slate-600">Friday</span>
                </div>
                <div className="text-slate-900 font-semibold">Tempo Run: 6 miles</div>
                <div className="text-xs text-slate-500 mt-1">Standard tempo pace</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-slate-600">Sunday</span>
                </div>
                <div className="text-slate-900 font-semibold">Long Run: 14 miles</div>
                <div className="text-xs text-slate-500 mt-1">Follows schedule exactly</div>
              </div>

              <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Weekly Total</span>
                  <span className="text-lg font-bold text-slate-900">31 miles</span>
                </div>
              </div>
            </div>
          </div>

          {/* RunPlan Column */}
          <div className="bg-gradient-to-br from-purple-50 to-orange-50 border-2 border-purple-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">RunPlan Personalized</h3>
                  <p className="text-sm text-white/90">Adapted just for you</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-purple-600">Monday</span>
                  <span className="text-sm text-slate-500">Week 8</span>
                </div>
                <div className="text-slate-900 font-semibold">Rest Day</div>
                <div className="text-xs text-purple-600 mt-1 flex items-start gap-1">
                  <span>💡</span>
                  <span>Recovering from weekend long run</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-orange-600">Tuesday</span>
                </div>
                <div className="text-slate-900 font-semibold">Easy Run: 4 miles</div>
                <div className="text-xs text-orange-600 mt-1 flex items-start gap-1">
                  <span>💡</span>
                  <span>Reduced from 5mi - your resting HR is elevated</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-pink-200 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-pink-600">Wednesday</span>
                </div>
                <div className="text-slate-900 font-semibold">Speed Work: 6 × 400m @ 7:30</div>
                <div className="text-xs text-pink-600 mt-1 flex items-start gap-1">
                  <span>💡</span>
                  <span>Based on your recent 5K PR pace</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-blue-600">Friday</span>
                </div>
                <div className="text-slate-900 font-semibold">Recovery Run: 5 miles</div>
                <div className="text-xs text-blue-600 mt-1 flex items-start gap-1">
                  <span>💡</span>
                  <span>Sleep quality improved - adding mile back</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-purple-600">Sunday</span>
                </div>
                <div className="text-slate-900 font-semibold">Long Run: 16 miles @ 9:45</div>
                <div className="text-xs text-purple-600 mt-1 flex items-start gap-1">
                  <span>💡</span>
                  <span>Extended by 2mi - recovery metrics are strong</span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-300 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-green-700">Weekly Total</span>
                  <span className="text-lg font-bold text-green-700">31 miles</span>
                </div>
                <div className="text-xs text-green-600 mt-1">✨ Same volume, smarter distribution</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Differences Callout */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-50 to-orange-50 border-2 border-purple-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">The RunPlan Difference</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Recovery-Aware</h4>
                <p className="text-sm text-slate-700">Adjusts based on sleep, resting HR, and how you're feeling</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Pace-Specific</h4>
                <p className="text-sm text-slate-700">Uses your actual PRs and race times for workout paces</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Progressive</h4>
                <p className="text-sm text-slate-700">Builds fitness safely without rigid weekly jumps</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
