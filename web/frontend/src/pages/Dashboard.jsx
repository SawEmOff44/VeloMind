import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSessions } from '../services/api'
import { format } from 'date-fns'
import IntelligenceDashboard from '../components/IntelligenceDashboard'
import { 
  UserCircleIcon, 
  CogIcon, 
  MapIcon, 
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  CameraIcon,
  PencilIcon,
  TrophyIcon,
  FireIcon,
  HeartIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState({
    name: 'Cyclist',
    email: '',
    photo: null,
    ftp: 250,
    weight: 85,
    bike: {
      name: 'My Bike',
      weight: 8.5,
      type: 'Road'
    }
  })
  const [editingProfile, setEditingProfile] = useState(false)
  
  useEffect(() => {
    loadSessions()
    loadUserProfile()
  }, [])
  
  const loadUserProfile = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem('userProfile')
    if (saved) {
      setUserProfile(JSON.parse(saved))
    }
  }
  
  const saveUserProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
    setEditingProfile(false)
  }
  
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUserProfile({ ...userProfile, photo: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }
  
  const loadSessions = async () => {
    try {
      const response = await getSessions(10, 0)
      setSessions(response.data.sessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const stats = sessions.length > 0 ? {
    totalSessions: sessions.length,
    totalDistance: sessions.reduce((sum, s) => sum + parseFloat(s.distance || 0), 0),
    avgPower: sessions.reduce((sum, s) => sum + parseFloat(s.average_power || 0), 0) / sessions.length,
    totalTime: sessions.reduce((sum, s) => sum + parseInt(s.duration || 0), 0)
  } : null
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Header with Profile */}
        <div className="mb-8 bg-gradient-to-r from-velo-cyan-dark via-velo-teal to-velo-green rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-8 py-12 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              {/* Profile Photo */}
              <div className="relative group">
                <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/50 shadow-2xl overflow-hidden flex items-center justify-center">
                  {userProfile.photo ? (
                    <img src={userProfile.photo} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircleIcon className="h-20 w-20 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 h-10 w-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <CameraIcon className="h-5 w-5 text-gray-700" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-black text-white mb-2">
                  Welcome back, {userProfile.name}! 👋
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  Ready to crush your next ride?
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <div className="flex items-center gap-2">
                      <BoltIcon className="h-5 w-5 text-yellow-300" />
                      <span className="text-white font-bold">{userProfile.ftp}W</span>
                      <span className="text-blue-100 text-sm">FTP</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="h-5 w-5 text-green-300" />
                      <span className="text-white font-bold">{userProfile.weight}kg</span>
                      <span className="text-blue-100 text-sm">Weight</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <div className="flex items-center gap-2">
                      <CogIcon className="h-5 w-5 text-purple-300" />
                      <span className="text-white font-bold">{userProfile.bike.weight}kg</span>
                      <span className="text-blue-100 text-sm">{userProfile.bike.name}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Edit Button */}
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors border border-white/30"
              >
                <PencilIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Profile Edit Form */}
        {editingProfile && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FTP (Watts)</label>
                <input
                  type="number"
                  value={userProfile.ftp}
                  onChange={(e) => setUserProfile({ ...userProfile, ftp: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={userProfile.weight}
                  onChange={(e) => setUserProfile({ ...userProfile, weight: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bike Name</label>
                <input
                  type="text"
                  value={userProfile.bike.name}
                  onChange={(e) => setUserProfile({ ...userProfile, bike: { ...userProfile.bike, name: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bike Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={userProfile.bike.weight}
                  onChange={(e) => setUserProfile({ ...userProfile, bike: { ...userProfile.bike, weight: parseFloat(e.target.value) } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bike Type</label>
                <select
                  value={userProfile.bike.type}
                  onChange={(e) => setUserProfile({ ...userProfile, bike: { ...userProfile.bike, type: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option>Road</option>
                  <option>Gravel</option>
                  <option>Mountain</option>
                  <option>TT/Tri</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={saveUserProfile}
                className="px-6 py-2 bg-gradient-to-r from-velo-cyan to-velo-teal text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/routes"
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-velo-cyan"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-velo-cyan to-velo-blue rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Routes</h3>
                <p className="text-sm text-gray-500">Explore & Upload</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/sessions"
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-velo-teal"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-velo-teal to-velo-green rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Sessions</h3>
                <p className="text-sm text-gray-500">View History</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/parameters"
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-velo-green"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-velo-green to-velo-teal rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CogIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Parameters</h3>
                <p className="text-sm text-gray-500">Customize</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/settings"
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-velo-blue"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-velo-blue to-velo-cyan rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FireIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Configure</p>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Performance Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-velo-blue to-velo-cyan rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="h-8 w-8 opacity-80" />
              <TrophyIcon className="h-6 w-6 opacity-60" />
            </div>
            <dt className="text-sm font-medium opacity-90 mb-1">Total Sessions</dt>
            <dd className="text-4xl font-black">{stats.totalSessions}</dd>
            <p className="text-xs opacity-75 mt-2">Keep riding! 🚴</p>
          </div>
          
          <div className="bg-gradient-to-br from-velo-teal to-velo-green rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <MapIcon className="h-8 w-8 opacity-80" />
              <ArrowTrendingUpIcon className="h-6 w-6 opacity-60" />
            </div>
            <dt className="text-sm font-medium opacity-90 mb-1">Total Distance</dt>
            <dd className="text-4xl font-black">
              {(stats.totalDistance / 1000).toFixed(0)}
              <span className="text-2xl font-normal ml-1">km</span>
            </dd>
            <p className="text-xs opacity-75 mt-2">Amazing miles! 🎯</p>
          </div>
          
          <div className="bg-gradient-to-br from-velo-green to-velo-teal rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <BoltIcon className="h-8 w-8 opacity-80" />
              <FireIcon className="h-6 w-6 opacity-60" />
            </div>
            <dt className="text-sm font-medium opacity-90 mb-1">Avg Power</dt>
            <dd className="text-4xl font-black">
              {Math.round(stats.avgPower)}
              <span className="text-2xl font-normal ml-1">W</span>
            </dd>
            <p className="text-xs opacity-75 mt-2">Crushing it! ⚡</p>
          </div>
          
          <div className="bg-gradient-to-br from-velo-cyan to-velo-blue rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="h-8 w-8 opacity-80" />
              <HeartIcon className="h-6 w-6 opacity-60" />
            </div>
            <dt className="text-sm font-medium opacity-90 mb-1">Total Time</dt>
            <dd className="text-4xl font-black">
              {Math.round(stats.totalTime / 3600)}
              <span className="text-2xl font-normal ml-1">hrs</span>
            </dd>
            <p className="text-xs opacity-75 mt-2">Time well spent! ⏱️</p>
          </div>
        </div>
      )}
      
      {/* Intelligence Dashboard Section */}
      {sessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-7 w-7 text-velo-teal" />
            Performance Intelligence
          </h2>
          <IntelligenceDashboard 
            rideData={{ 
              ftp: userProfile.ftp,
              recentSessions: sessions.slice(0, 5)
            }}
            intelligenceData={{
              environmentalLoad: 8.5,
              effortBudget: 67,
              tss: 142,
              caloriesBurned: 1850,
              alerts: []
            }}
          />
        </div>
      )}
      
      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ClockIcon className="h-6 w-6 text-purple-600" />
              Recent Sessions
            </h2>
            <Link
              to="/sessions"
              className="text-sm font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View All
              <ArrowTrendingUpIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full h-24 w-24 mx-auto mb-6 flex items-center justify-center">
                <MapIcon className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">No sessions yet</p>
              <p className="text-gray-500 mb-6">Start your journey by uploading a route!</p>
              <Link
                to="/routes"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg transition-all"
              >
                Upload GPX Route
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="block group"
                >
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 hover:from-cyan-50 hover:to-blue-100 p-5 rounded-xl border-2 border-gray-200 hover:border-cyan-400 transition-all duration-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-cyan-700 transition-colors">
                          {session.name || 'Unnamed Session'}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          {format(new Date(session.start_time), 'PPp')}
                        </p>
                      </div>
                      <div className="flex gap-6 text-right">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Power</p>
                          <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                            <BoltIcon className="h-4 w-4 text-yellow-500" />
                            {Math.round(session.average_power)}W
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Distance</p>
                          <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                            <MapIcon className="h-4 w-4 text-blue-500" />
                            {(session.distance / 1000).toFixed(1)}km
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
