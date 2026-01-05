import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSessions, getIntelligenceSummary, getActiveParameters, updateParameters } from '../services/api'
import { format } from 'date-fns'
import IntelligenceDashboard from '../components/IntelligenceDashboard'
import ActivityFeed from '../components/ActivityFeed'
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
  const [intelligenceTimeframe, setIntelligenceTimeframe] = useState(30)
  const [intelligenceSummary, setIntelligenceSummary] = useState(null)
  const [intelligenceLoading, setIntelligenceLoading] = useState(false)
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

  const syncFitnessProfileFromDashboard = async (profile) => {
    try {
      const activeResp = await getActiveParameters()
      const active = activeResp?.data?.parameters
      if (!active?.id) return

      const ftpValue = Number(profile?.ftp)
      const massValue = Number(profile?.weight)
      if (!Number.isFinite(ftpValue) || !Number.isFinite(massValue)) return

      await updateParameters(active.id, {
        name: active.name,
        mass: massValue,
        cda: Number(active.cda),
        crr: Number(active.crr),
        drivetrain_loss: Number(active.drivetrain_loss),
        ftp: ftpValue,
        position: active.position,
        is_active: true
      })
    } catch (e) {
      console.warn('Failed to sync fitness profile from dashboard:', e)
    }
  }

  const persistUserProfile = (profile) => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile))
      return true
    } catch (e) {
      console.error('Failed to persist userProfile to localStorage:', e)
      return false
    }
  }

  useEffect(() => {
    loadIntelligenceSummary(intelligenceTimeframe)
  }, [intelligenceTimeframe])
  
  const loadUserProfile = () => {
    // Load from localStorage for now
    const saved = localStorage.getItem('userProfile')
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved userProfile:', e)
      }
    }
  }
  
  const saveUserProfile = () => {
    const ok = persistUserProfile(userProfile)
    if (!ok) {
      alert('Could not save profile (storage full). Try a smaller photo.')
      return
    }
    setEditingProfile(false)

    // Best-effort: keep server-backed Fitness Profile in sync
    void syncFitnessProfileFromDashboard(userProfile)
  }
  
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const dataUrl = reader.result

          // Resize/compress to avoid exceeding localStorage quota
          const img = new Image()
          img.onload = () => {
            const MAX_SIZE = 256
            const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height))
            const w = Math.max(1, Math.round(img.width * scale))
            const h = Math.max(1, Math.round(img.height * scale))

            const canvas = document.createElement('canvas')
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, w, h)

            const compressed = canvas.toDataURL('image/jpeg', 0.85)
            const updated = { ...userProfile, photo: compressed }
            setUserProfile(updated)

            // Persist immediately so photo doesn't disappear on reload
            const ok = persistUserProfile(updated)
            if (!ok) {
              alert('Photo too large to save. Try a smaller image.')
            }
          }
          img.src = dataUrl
        } catch (err) {
          console.error('Photo upload failed:', err)
          alert('Failed to process photo')
        }
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

  const loadIntelligenceSummary = async (timeframe) => {
    setIntelligenceLoading(true)
    try {
      const response = await getIntelligenceSummary(timeframe)
      setIntelligenceSummary(response.data)
    } catch (error) {
      console.error('Failed to load intelligence summary:', error)
      setIntelligenceSummary(null)
    } finally {
      setIntelligenceLoading(false)
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
                      <span className="text-white font-bold">{userProfile.weight}lbs</span>
                      <span className="text-blue-100 text-sm">Weight</span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <div className="flex items-center gap-2">
                      <CogIcon className="h-5 w-5 text-purple-300" />
                      <span className="text-white font-bold">{userProfile.bike.weight}lbs</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Bike Weight (lbs)</label>
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
              {(stats.totalDistance / 1609.34).toFixed(0)}
              <span className="text-2xl font-normal ml-1">mi</span>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="h-7 w-7 text-velo-teal" />
              Performance Intelligence
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIntelligenceTimeframe(7)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold border transition-colors ${
                  intelligenceTimeframe === 7
                    ? 'bg-velo-teal text-white border-velo-teal'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                7d
              </button>
              <button
                onClick={() => setIntelligenceTimeframe(30)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold border transition-colors ${
                  intelligenceTimeframe === 30
                    ? 'bg-velo-teal text-white border-velo-teal'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                30d
              </button>
            </div>
          </div>

          <IntelligenceDashboard 
            rideData={{ 
              ftp: userProfile.ftp,
              recentSessions: sessions.slice(0, 5)
            }}
            intelligenceData={intelligenceLoading ? null : intelligenceSummary}
          />
        </div>
      )}
      
      {/* Recent Activity & Intelligence */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            <Link
              to="/sessions"
              className="text-sm font-semibold text-cyan-600 hover:text-cyan-700"
            >
              View All →
            </Link>
          </div>
          <ActivityFeed limit={5} />
        </div>
      </div>
    </div>
    </div>
  )
}
