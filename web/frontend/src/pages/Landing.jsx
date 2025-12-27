import { Link } from 'react-router-dom'
import { 
  BoltIcon, 
  ChartBarIcon, 
  MapIcon,
  CloudIcon,
  CpuChipIcon,
  BeakerIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function Landing() {
  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-600/10 to-purple-600/20 animate-pulse" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-40">
          <div className="text-center">
            {/* Logo with glow effect */}
            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-cyan-500/50 blur-3xl rounded-full animate-pulse" />
              <img src="/images/VeloMind_Logo.v2.png" alt="VeloMind" className="relative h-32 sm:h-40 w-auto mx-auto filter drop-shadow-2xl" />
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl md:text-8xl mb-6">
              Train Smarter with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient">
                VeloMind
              </span>
            </h1>
            
            <p className="mt-8 text-xl sm:text-2xl leading-relaxed text-gray-300 max-w-4xl mx-auto font-light">
              Real-time intelligence for cyclists. Physics-based power estimation, 
              AI learning, and professional analytics—
              <span className="text-cyan-400 font-semibold"> no power meter required</span>.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/register"
                className="group relative w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-5 text-xl font-bold text-white shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">Start Training Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              </Link>
              
              <Link
                to="/login"
                className="w-full sm:w-auto rounded-xl border-2 border-cyan-500/50 bg-gray-800/50 backdrop-blur-sm px-10 py-5 text-xl font-bold text-white hover:border-cyan-400 hover:bg-gray-700/50 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">iOS & Web</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6">
              Everything You Need to Train Smarter
            </h2>
            <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto">
              Professional-grade cycling intelligence in your pocket
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 - Real-Time Power */}
            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 border border-gray-700 hover:border-cyan-500/50">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <BoltIcon className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Real-Time Power</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Physics-based power estimation without expensive meters. Know your watts every second.
              </p>
            </div>

            {/* Feature 2 - AI Learning */}
            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700 hover:border-purple-500/50">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <SparklesIcon className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">AI Learning</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Learns your aerodynamics, fatigue patterns, and heat sensitivity over time.
              </p>
            </div>

            {/* Feature 3 - Smart Navigation */}
            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 border border-gray-700 hover:border-green-500/50">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <MapIcon className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Smart Navigation</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Turn-by-turn guidance with climb previews and wind-aware speed predictions.
              </p>
            </div>

            {/* Feature 4 - Intelligence Alerts */}
            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 border border-gray-700 hover:border-orange-500/50">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <FireIcon className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Intelligence Alerts</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Overcooking warnings, pacing advice, nutrition timing, and fatigue detection.
              </p>
            </div>

            {/* Feature 5 - Environmental Awareness */}
            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-gray-700 hover:border-blue-500/50">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CloudIcon className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Environmental Load</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Real-time calculation of heat, humidity, and wind impact on your performance.
              </p>
            </div>

            {/* Feature 6 - Advanced Analytics */}
            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 border border-gray-700 hover:border-indigo-500/50">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Pro Analytics</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Power curves, zone distribution, TSS tracking, and fitness metrics.
              </p>
            </div>

            {/* Feature 7 - Effort Budget */}
            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 border border-gray-700 hover:border-yellow-500/50">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <BeakerIcon className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Effort Budget</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Visual gauge showing remaining energy. Know when to push and when to preserve.
              </p>
            </div>

            {/* Feature 8 - Strava Integration */}
            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 border border-gray-700 hover:border-red-500/50">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CpuChipIcon className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 text-center">Strava Sync</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Import activities and analyze your entire training history with fitness trends.
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
