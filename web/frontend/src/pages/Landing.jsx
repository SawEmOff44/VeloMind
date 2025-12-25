import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-6xl sm:text-8xl">🚴</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
              Power Your Ride with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                VeloMind
              </span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              Transform your cycling experience with real-time power estimation, 
              advanced route matching, and comprehensive performance analytics—all without expensive power meters.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto rounded-lg border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-900 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • Free forever
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              Everything You Need to Train Smarter
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade cycling analytics without the professional price tag
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mx-auto mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Real-Time Power Estimation</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Get accurate power metrics without expensive power meters. Uses physics-based calculations with speed, elevation, and environmental data.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 mx-auto mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Advanced Analytics</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Power curves, zone distribution, training load tracking, and fitness metrics. Analyze your performance like a pro.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mx-auto mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Smart Route Matching</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Upload GPX routes and get real-time guidance. Know exactly where you are and what's coming next.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 mx-auto mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Custom Parameters</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Fine-tune calculations with your weight, bike setup, and riding position. Multiple profiles for different bikes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 mx-auto mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Heart Rate Zones</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Connect Bluetooth heart rate monitors. Track intensity and optimize your training load.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 mx-auto mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Strava Integration</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Sync your rides automatically. Import historical data and share achievements with your cycling community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 h-full">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Create Your Account</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Sign up in seconds. Set up your rider profile with weight, FTP, and bike specifications.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-gray-300"></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 h-full">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Download the iOS App</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Install VeloMind on your iPhone. Connect your sensors and upload your favorite routes.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-gray-300"></div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Start Riding</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Hit the road and watch your power data flow. Review detailed analytics after every ride.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-6">
              Ready to Elevate Your Cycling?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of cyclists who are training smarter with VeloMind
            </p>
            <Link
              to="/register"
              className="inline-block rounded-lg bg-white px-10 py-4 text-lg font-bold text-blue-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started Free
            </Link>
            <p className="mt-6 text-sm text-blue-100">
              ✓ No credit card required  ✓ Free forever  ✓ iOS app included
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <span className="text-3xl">🚴</span>
              <span className="text-xl font-bold text-white">VeloMind</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 VeloMind. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
