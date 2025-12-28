import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCurrentUser, getParameters, createParameters, updateParameters } from '../services/api'

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stravaConnected, setStravaConnected] = useState(false)
  const [showStravaSuccess, setShowStravaSuccess] = useState(false)
  const [fitnessProfile, setFitnessProfile] = useState(null)
  const [editingFitness, setEditingFitness] = useState(false)
  const [fitnessForm, setFitnessForm] = useState({
    name: 'Default Profile',
    mass: 85,
    ftp: 250,
    cda: 0.32,
    crr: 0.0045,
    drivetrain_loss: 0.03,
    position: 'hoods'
  })

  useEffect(() => {
    // Check for Strava connection success
    if (searchParams.get('strava') === 'connected') {
      setShowStravaSuccess(true)
      // Clear the query parameter
      setSearchParams({})
      // Hide success message after 5 seconds
      setTimeout(() => setShowStravaSuccess(false), 5000)
    }
    
    loadUser()
    loadFitnessProfile()
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

  const loadFitnessProfile = async () => {
    try {
      const response = await getParameters()
      const activeProfile = response.data.parameters?.find(p => p.is_active)
      if (activeProfile) {
        setFitnessProfile(activeProfile)
        setFitnessForm({
          name: activeProfile.name,
          mass: parseFloat(activeProfile.mass),
          ftp: activeProfile.ftp,
          cda: parseFloat(activeProfile.cda),
          crr: parseFloat(activeProfile.crr),
          drivetrain_loss: parseFloat(activeProfile.drivetrain_loss),
          position: activeProfile.position
        })
      }
    } catch (error) {
      console.error('Failed to load fitness profile:', error)
    }
  }

  const handleFitnessSubmit = async (e) => {
    e.preventDefault()
    try {
      if (fitnessProfile) {
        await updateParameters(fitnessProfile.id, fitnessForm)
      } else {
        await createParameters({ ...fitnessForm, is_active: true })
      }
      await loadFitnessProfile()
      setEditingFitness(false)
    } catch (error) {
      console.error('Failed to save fitness profile:', error)
      alert('Failed to save fitness profile')
    }
  }

  const handleStravaConnect = () => {
    // Redirect to Strava OAuth
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID
    const redirectUri = `${import.meta.env.VITE_API_BASE.replace('/api', '')}/strava/callback`
    const scope = 'read,activity:read_all'
    const state = user?.id || '1' // Pass user ID for backend to update
    
    const stravaUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`
    
    console.log('Strava OAuth:', { clientId, redirectUri, stravaUrl })
    console.log('About to redirect to:', stravaUrl)
    
    if (!clientId) {
      alert('Strava Client ID not configured. Please check your environment variables.')
      return
    }
    
    // Use window.location.assign instead of href for better debugging
    console.log('Executing redirect...')
    window.location.assign(stravaUrl)
    console.log('Redirect executed - this should not log')
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

      {/* Success Message */}
      {showStravaSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Successfully connected to Strava! Your activities will now sync automatically.
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Fitness Profile */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Fitness Profile</h2>
          {!editingFitness && fitnessProfile && (
            <button
              onClick={() => setEditingFitness(true)}
              className="px-3 py-1 text-sm bg-gradient-to-r from-velo-cyan-500 to-velo-blue-500 text-white rounded hover:from-velo-cyan-600 hover:to-velo-blue-600"
            >
              Edit
            </button>
          )}
        </div>

        {editingFitness || !fitnessProfile ? (
          <form onSubmit={handleFitnessSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={fitnessForm.name}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fitnessForm.mass}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, mass: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  FTP (watts)
                  <span className="ml-2 text-xs text-gray-500">Functional Threshold Power</span>
                </label>
                <input
                  type="number"
                  value={fitnessForm.ftp}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, ftp: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CdA
                  <span className="ml-2 text-xs text-gray-500">Aerodynamic drag</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fitnessForm.cda}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, cda: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rolling Resistance (Crr)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={fitnessForm.crr}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, crr: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Riding Position
                </label>
                <select
                  value={fitnessForm.position}
                  onChange={(e) => setFitnessForm({ ...fitnessForm, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-velo-cyan-500"
                >
                  <option value="hoods">Hoods</option>
                  <option value="drops">Drops</option>
                  <option value="aero">Aero</option>
                  <option value="tops">Tops</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-velo-cyan-500 to-velo-blue-500 text-white rounded-md hover:from-velo-cyan-600 hover:to-velo-blue-600"
              >
                Save Profile
              </button>
              {editingFitness && fitnessProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingFitness(false)
                    setFitnessForm({
                      name: fitnessProfile.name,
                      mass: parseFloat(fitnessProfile.mass),
                      ftp: fitnessProfile.ftp,
                      cda: parseFloat(fitnessProfile.cda),
                      crr: parseFloat(fitnessProfile.crr),
                      drivetrain_loss: parseFloat(fitnessProfile.drivetrain_loss),
                      position: fitnessProfile.position
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="text-lg font-semibold text-gray-900">{fitnessProfile.mass} lbs</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">FTP</p>
              <p className="text-lg font-semibold text-gray-900">{fitnessProfile.ftp} watts</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CdA</p>
              <p className="text-lg font-semibold text-gray-900">{fitnessProfile.cda}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rolling Resistance</p>
              <p className="text-lg font-semibold text-gray-900">{fitnessProfile.crr}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Position</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{fitnessProfile.position}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Power-to-Weight</p>
              <p className="text-lg font-semibold text-gray-900">
                {(fitnessProfile.ftp / (fitnessProfile.mass * 0.453592)).toFixed(2)} W/kg
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-velo-cyan-50 rounded-md">
          <p className="text-sm text-velo-cyan-900">
            <strong>💡 Tip:</strong> This profile is used for route predictions and iOS ride intelligence. 
            Update your FTP regularly after fitness tests for accurate pacing recommendations.
          </p>
        </div>
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
