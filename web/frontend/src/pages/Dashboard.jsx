import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSessions } from '../services/api'
import { format } from 'date-fns'

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadSessions()
  }, [])
  
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalSessions}</dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Distance</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {(stats.totalDistance / 1000).toFixed(0)} km
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Avg Power</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {Math.round(stats.avgPower)} W
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Time</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {Math.round(stats.totalTime / 3600)} hrs
              </dd>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Sessions</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No sessions yet</p>
              <Link
                to="/routes"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Upload GPX Route
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="block hover:bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {session.name || 'Unnamed Session'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(session.start_time), 'PPp')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(session.average_power)} W
                      </p>
                      <p className="text-sm text-gray-500">
                        {(session.distance / 1000).toFixed(1)} km
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
