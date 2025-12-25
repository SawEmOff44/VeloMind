import { useState, useEffect } from 'react'
import { getCurrentUser } from '../services/api'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stravaConnected, setStravaConnected] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const response = await getCurrentUser()
      setUser(response.data)
      setStravaConnected(!!response.data.strava_athlete_id)
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStravaConnect = () => {
    // Redirect to Strava OAuth
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID
    const redirectUri = `${window.location.origin}/strava/callback`
    const scope = 'read,activity:read_all'
    
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
  }

  const handleStravaDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Strava?')) return
    
    try {
      // TODO: Add disconnect endpoint
      alert('Strava disconnected')
      setStravaConnected(false)
    } catch (error) {
      console.error('Failed to disconnect Strava:', error)
      alert('Failed to disconnect Strava')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Account Information */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Strava Integration */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Strava Integration</h2>
        
        {stravaConnected ? (
          <div>
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-600 font-medium">Connected to Strava</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your Strava activities are being synced automatically. You can view imported rides in the Sessions page.
            </p>
            <button
              onClick={handleStravaDisconnect}
              className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
            >
              Disconnect Strava
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Strava account to automatically import your cycling activities and share your VeloMind rides with the Strava community.
            </p>
            <button
              onClick={handleStravaConnect}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Connect with Strava
            </button>
          </div>
        )}
      </div>

      {/* Bluetooth Devices */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bluetooth Devices</h2>
        <p className="text-sm text-gray-600 mb-4">
          Bluetooth sensors (heart rate monitors, speed/cadence sensors) are managed in the iOS app. 
          Open VeloMind on your iPhone to connect and configure sensors.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg p-6 border-2 border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. All your sessions, routes, and data will be permanently deleted.
        </p>
        <button
          onClick={() => alert('Account deletion feature coming soon')}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}
