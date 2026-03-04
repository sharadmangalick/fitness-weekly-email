import { GarminLogo, StravaLogo } from './PlatformLogos'

export default function FeaturesSection() {
  return (
    <section className="relative z-10 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Why Runners Love It
          </h2>
          <p className="text-slate-700 text-lg max-w-2xl mx-auto">
            Running plans that adapt to how your body actually feels
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-8 hover:border-blue-300 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-3 mb-5">
              <GarminLogo className="w-10 h-10" />
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <StravaLogo className="w-5 h-5 text-[#FC4C02]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">No Logging Required</h3>
            <p className="text-slate-700 leading-relaxed">
              Your runs sync <span className="text-slate-900 font-semibold">automatically</span>. No entering miles, paces, or rest days. We pull everything from your watch.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-3xl p-8 hover:border-green-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm">
              <span className="text-2xl">💚</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Recovery-Aware Mileage</h3>
            <p className="text-slate-700 leading-relaxed">
              Bad sleep? Elevated heart rate? We'll dial back your miles. Feeling fresh? Let's push that long run. Your plan adapts weekly.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-3xl p-8 hover:border-purple-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm">
              <span className="text-2xl">🏁</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Plans That Fit Your Goals</h3>
            <p className="text-slate-700 leading-relaxed">
              Race training, base building, injury recovery, or just getting faster - get the right mix of runs tailored to where you are and where you want to be.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-3xl p-8 hover:border-orange-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm">
              <span className="text-2xl">📬</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Just Check Your Email</h3>
            <p className="text-slate-700 leading-relaxed">
              Your weekly plan arrives with every run mapped out - distance, pace, and purpose. No app. Just lace up and go.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
