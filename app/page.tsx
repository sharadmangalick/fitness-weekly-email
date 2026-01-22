import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">Fitness Weekly</div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-white/90 hover:text-white">
              Log In
            </Link>
            <Link href="/signup" className="btn-primary !py-2 !px-4 !text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-primary pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Personalized Training Plans
            <br />
            <span className="text-white/80">Delivered Weekly</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Connect your Garmin or Strava account and receive AI-powered training plans
            based on your actual fitness data. No spreadsheets, no guesswork.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary !bg-white !text-primary-dark">
              Start Free
            </Link>
            <a href="#how-it-works" className="btn-secondary !bg-white/10 !text-white border border-white/20">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-500 mb-6">Works with your favorite platforms</p>
          <div className="flex justify-center items-center gap-12">
            <div className="text-center">
              <div className="text-4xl mb-2">🏃</div>
              <div className="font-semibold text-gray-700">Garmin Connect</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🚴</div>
              <div className="font-semibold text-gray-700">Strava</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Platform</h3>
              <p className="text-gray-600">
                Link your Garmin or Strava account in seconds. We securely access your
                activity, sleep, and recovery data.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Your Goals</h3>
              <p className="text-gray-600">
                Tell us about your race (or fitness goal), target time, and current training.
                Our wizard makes it easy.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Your Plan</h3>
              <p className="text-gray-600">
                Each week, we analyze your data and email you a personalized training plan
                adjusted for your recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Smart Training, Simplified
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recovery-Aware Plans</h3>
              <p className="text-gray-600">
                We analyze your resting heart rate, sleep quality, and body battery to
                automatically adjust training when you need more recovery.
              </p>
            </div>
            <div className="card p-6">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Goal-Specific Training</h3>
              <p className="text-gray-600">
                Whether you're targeting a 5K PR or building mileage, get workouts designed
                for your specific goal and timeline.
              </p>
            </div>
            <div className="card p-6">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Weekly Email Delivery</h3>
              <p className="text-gray-600">
                Your training plan arrives in your inbox every week with clear daily workouts,
                paces, and coaching notes.
              </p>
            </div>
            <div className="card p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is encrypted and never shared. We use OAuth for Strava and
                encrypted session tokens for Garmin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 gradient-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Train Smarter?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join runners who get personalized plans based on their actual fitness data.
          </p>
          <Link href="/signup" className="btn-primary !bg-white !text-primary-dark">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Fitness Weekly Email. Built with your health in mind.
          </p>
        </div>
      </footer>
    </div>
  )
}
