import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getSession, getSessionAnalytics } from '../services/api'
import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function SessionDetail() {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadSession()
  }, [id])
  
  const loadSession = async () => {
    try {
      const [sessionRes, analyticsRes] = await Promise.all([
        getSession(id),
        getSessionAnalytics(id)
      ])
      setSession(sessionRes.data)
      setAnalytics(analyticsRes.data)
    } catch (error) {
      console.error('Failed to load session:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }
  
  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Session not found</p>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {session.name || 'Unnamed Session'}
      </h1>
      <p className="text-gray-500 mb-8">
        {format(new Date(session.start_time), 'PPp')}
      </p>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Distance</p>
          <p className="text-2xl font-bold text-gray-900">
            {(session.distance / 1609.34).toFixed(1)} mi
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Duration</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(session.duration / 60)} min
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg Power</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(session.average_power)} W
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Normalized Power</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(session.normalized_power)} W
          </p>
        </div>
      </div>
      
      {/* Charts */}
      {analytics && (
        <div className="space-y-8">
          {/* Power Curve */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Power Curve</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.powerCurve}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="duration" label={{ value: 'Duration (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="power" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Elevation Profile */}
          {analytics.elevationProfile && analytics.elevationProfile.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Elevation Profile</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.elevationProfile}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="distance" label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Altitude (m)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="altitude" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Power Zones */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Power Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { zone: 'Z1', time: analytics.powerZones.z1 },
                { zone: 'Z2', time: analytics.powerZones.z2 },
                { zone: 'Z3', time: analytics.powerZones.z3 },
                { zone: 'Z4', time: analytics.powerZones.z4 },
                { zone: 'Z5', time: analytics.powerZones.z5 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="time" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
