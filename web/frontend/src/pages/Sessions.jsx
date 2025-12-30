import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSessions, deleteSession, syncStravaActivities, refreshAllStravaStreams } from '../services/api'
import { format } from 'date-fns'

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  useEffect(() => {
    loadSessions()
  }, [])
  
  const loadSessions = async () => {
    try {
      const response = await getSessions(50, 0)
      setSessions(response.data.sessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await syncStravaActivities()
      console.log('Sync response:', response.data)
      
      if (response.data.error) {
        alert(`Error: ${response.data.error}`)
      } else {
        const imported = response.data.imported || 0
        const skipped = response.data.skipped || 0
        const total = response.data.total || 0
        alert(`Sync complete! Imported ${imported} new activities. ${skipped} were already imported. Found ${total} total cycling activities in last 30 days.`)
        await loadSessions()
      }
    } catch (error) {
      console.error('Failed to sync Strava activities:', error)
      console.error('Error response:', error.response?.data)
      alert(error.response?.data?.error || 'Failed to sync Strava activities. Make sure you have connected your Strava account in Settings.')
    } finally {
      setSyncing(false)
    }
  }
  
  const handleRefreshStreams = async () => {
    setRefreshing(true)
    try {
      const response = await refreshAllStravaStreams()
      console.log('Refresh streams response:', response.data)
      
      if (response.data.error) {
        alert(`Error: ${response.data.error}`)
      } else {
        const refreshed = response.data.refreshed || 0
        const failed = response.data.failed || 0
        alert(`Refreshed detailed data for ${refreshed} sessions!${failed > 0 ? ` (${failed} failed)` : ''}`)
        await loadSessions()
      }
    } catch (error) {
      console.error('Failed to refresh streams:', error)
      alert(error.response?.data?.error || 'Failed to refresh Strava data.')
    } finally {
      setRefreshing(false)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    
    try {
      await deleteSession(id)
      setSessions(sessions.filter(s => s.id !== id))
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('Failed to delete session')
    }
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshStreams}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Stream Data'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {syncing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Sync from Strava
            </>
          )}
        </button>
      </div>
      
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No sessions yet</p>
          <p className="text-sm text-gray-400">Sessions are created from the iOS app</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Power
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(session.start_time), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link
                        to={`/sessions/${session.id}`}
                        className="text-velo-cyan-600 hover:text-velo-cyan-800 font-semibold"
                      >
                        {session.name || 'Unnamed Session'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(session.distance / 1609.34).toFixed(1)} mi
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(session.duration / 60)} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(session.average_power)} W
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View (hidden on desktop) */}
          <div className="md:hidden space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <Link
                  to={`/sessions/${session.id}`}
                  className="block mb-3"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {session.name || 'Unnamed Session'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(session.start_time), 'PP')}
                  </p>
                </Link>
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Distance</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(session.distance / 1609.34).toFixed(1)}
                      <span className="text-sm font-normal ml-1">mi</span>
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Duration</p>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(session.duration / 60)}
                      <span className="text-sm font-normal ml-1">min</span>
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Power</p>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(session.average_power)}
                      <span className="text-sm font-normal ml-1">W</span>
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(session.id)}
                  className="w-full py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete Session
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
