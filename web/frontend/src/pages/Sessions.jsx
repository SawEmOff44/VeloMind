import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSessions, deleteSession } from '../services/api'
import { format } from 'date-fns'

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  
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
