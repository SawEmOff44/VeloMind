import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAnalyticsOverview, getAnalyticsTrends, getAnalyticsRecords } from '../services/api'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { 
  TrophyIcon, 
  ChartBarIcon, 
  FireIcon, 
  BoltIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  MapIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

export default function Analytics() {
  const [overview, setOverview] = useState(null)
  const [trends, setTrends] = useState(null)
  const [records, setRecords] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState(30)
  const [trendMetric, setTrendMetric] = useState('power')
  const [trendTimeframe, setTrendTimeframe] = useState(90)

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const powerZoneColors = {
    'Recovery': '#10b981',
    'Endurance': '#06b6d4',
    'Tempo': '#f59e0b',
    'Threshold': '#ef4444',
    'VO2Max': '#8b5cf6',
    'Anaerobic': '#ec4899'
  }

  useEffect(() => {
    loadAnalytics()
  }, [timeframe])

  useEffect(() => {
    loadTrends()
  }, [trendMetric, trendTimeframe])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [overviewRes, recordsRes] = await Promise.all([
        getAnalyticsOverview(timeframe),
        getAnalyticsRecords()
      ])
      setOverview(overviewRes.data)
      setRecords(recordsRes.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrends = async () => {
    try {
      const trendsRes = await getAnalyticsTrends(trendMetric, trendTimeframe)
      setTrends(trendsRes.data)
    } catch (error) {
      console.error('Failed to load trends:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    )
  }

  const frequencyData = overview?.frequency?.map(f => ({
    day: dayNames[f.day_of_week],
    rides: parseInt(f.ride_count)
  })) || []

  const powerZoneData = overview?.powerZones?.map(pz => ({
    name: pz.zone,
    rides: parseInt(pz.ride_count),
    duration: parseInt(pz.total_duration)
  })) || []

  const trendData = trends?.data?.map(t => ({
    date: format(new Date(t.date), 'MMM d'),
    value: parseFloat(t.avg_value).toFixed(1),
    max: parseFloat(t.max_value).toFixed(1)
  })) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track your progress and performance trends</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex items-center gap-2">
          {[7, 30, 90, 365].map(days => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                timeframe === days
                  ? 'bg-gradient-to-r from-velo-cyan to-velo-teal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <MapIcon className="h-8 w-8 opacity-80" />
            </div>
            <dt className="text-sm font-medium opacity-90 mb-1">Total Rides</dt>
            <dd className="text-4xl font-black">{overview.stats.total_rides || 0}</dd>
            <p className="text-xs opacity-75 mt-2">Last {timeframe} days</p>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <ArrowTrendingUpIcon className="h-8 w-8 opacity-80" />
            </div>
            <dt className="text-sm font-medium opacity-90 mb-1">Total Distance</dt>
            <dd className="text-4xl font-black">
              {overview.stats.total_distance 
                ? (overview.stats.total_distance / 1609.34).toFixed(0)
                : 0}
              <span className="text-2xl font-normal ml-1">mi</span>
            </dd>
            <p className="text-xs opacity-75 mt-2">
              {overview.stats.total_elevation 
                ? `${Math.round(overview.stats.total_elevation * 3.28084)} ft climbed`
                : 'No elevation data'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <BoltIcon className="h-8 w-8 opacity-80" />
            </div>
            <dt className="text-sm font-medium opacity-90 mb-1">Avg Power</dt>
            <dd className="text-4xl font-black">
              {overview.stats.avg_power ? Math.round(overview.stats.avg_power) : 0}
              <span className="text-2xl font-normal ml-1">W</span>
            </dd>
            <p className="text-xs opacity-75 mt-2">
              Peak: {overview.stats.peak_power ? Math.round(overview.stats.peak_power) : 0}W
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="h-8 w-8 opacity-80" />
            </div>
            <dt className="text-sm font-medium opacity-90 mb-1">Total Time</dt>
            <dd className="text-4xl font-black">
              {overview.stats.total_time 
                ? (overview.stats.total_time / 3600).toFixed(0)
                : 0}
              <span className="text-2xl font-normal ml-1">hrs</span>
            </dd>
            <p className="text-xs opacity-75 mt-2">
              {overview.stats.avg_hr ? `Avg HR: ${Math.round(overview.stats.avg_hr)} bpm` : 'No HR data'}
            </p>
          </div>
        </div>
      )}

      {/* Personal Records */}
      {records && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-yellow-500" />
            Personal Records
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.longestRide && (
              <Link
                to={`/sessions/${records.longestRide.id}`}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-cyan-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Longest Ride</span>
                  <MapIcon className="w-5 h-5 text-gray-400 group-hover:text-cyan-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {(records.longestRide.distance / 1609.34).toFixed(2)} mi
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(records.longestRide.start_time), 'MMM d, yyyy')}
                </p>
              </Link>
            )}

            {records.highestElevation && (
              <Link
                to={`/sessions/${records.highestElevation.id}`}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Highest Elevation</span>
                  <ChartBarIcon className="w-5 h-5 text-gray-400 group-hover:text-teal-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(records.highestElevation.elevation_gain * 3.28084)} ft
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(records.highestElevation.start_time), 'MMM d, yyyy')}
                </p>
              </Link>
            )}

            {records.highestPower && (
              <Link
                to={`/sessions/${records.highestPower.id}`}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Highest Avg Power</span>
                  <BoltIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(records.highestPower.average_power)} W
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(records.highestPower.start_time), 'MMM d, yyyy')}
                </p>
              </Link>
            )}

            {records.fastestSpeed && (
              <Link
                to={`/sessions/${records.fastestSpeed.id}`}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Fastest Avg Speed</span>
                  <FireIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {records.fastestSpeed.avg_speed.toFixed(1)} mph
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(records.fastestSpeed.start_time), 'MMM d, yyyy')}
                </p>
              </Link>
            )}

            {records.longestDuration && (
              <Link
                to={`/sessions/${records.longestDuration.id}`}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Longest Duration</span>
                  <ClockIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {(records.longestDuration.duration / 3600).toFixed(1)} hrs
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(records.longestDuration.start_time), 'MMM d, yyyy')}
                </p>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Ride Frequency */}
        {frequencyData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ride Frequency by Day</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rides" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Power Zone Distribution */}
        {powerZoneData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Power Zone Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={powerZoneData}
                  dataKey="rides"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {powerZoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={powerZoneColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Performance Trends */}
      {trends && trendData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance Trends</h3>
            
            <div className="flex items-center gap-2">
              {/* Metric Selector */}
              <select
                value={trendMetric}
                onChange={(e) => setTrendMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="power">Power</option>
                <option value="speed">Speed</option>
                <option value="hr">Heart Rate</option>
                <option value="cadence">Cadence</option>
              </select>

              {/* Timeframe Selector */}
              {[30, 90, 180, 365].map(days => (
                <button
                  key={days}
                  onClick={() => setTrendTimeframe(days)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                    trendTimeframe === days
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#06b6d4" 
                strokeWidth={2}
                name="Average"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="max" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Maximum"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No Data State */}
      {(!overview || overview.stats.total_rides === '0') && (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-2">No ride data available</p>
          <p className="text-sm text-gray-500">Complete some rides to see your analytics!</p>
        </div>
      )}
    </div>
  )
}
