import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getRoute } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MapIcon, ArrowLeftIcon, ChartBarIcon, ArrowsPointingOutIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function RouteComparison() {
  const [searchParams] = useSearchParams()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('elevation')
  
  const colors = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  
  useEffect(() => {
    loadRoutes()
  }, [searchParams])
  
  const loadRoutes = async () => {
    const ids = searchParams.get('ids')?.split(',') || []
    if (ids.length === 0) {
      setLoading(false)
      return
    }
    
    try {
      const routePromises = ids.map(id => getRoute(id))
      const responses = await Promise.all(routePromises)
      const loadedRoutes = responses.map(r => r.data)
      setRoutes(loadedRoutes)
    } catch (error) {
      console.error('Failed to load routes:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const getDifficultyScore = (route) => {
    const distanceKm = route.total_distance / 1000
    const elevationPerKm = route.total_elevation_gain / distanceKm
    return elevationPerKm * distanceKm / 10
  }
  
  const getDifficultyLabel = (score) => {
    if (score < 10) return { label: 'Easy', color: 'bg-green-500' }
    if (score < 30) return { label: 'Moderate', color: 'bg-yellow-500' }
    if (score < 60) return { label: 'Hard', color: 'bg-orange-500' }
    return { label: 'Extreme', color: 'bg-red-500' }
  }
  
  const normalizeElevationData = () => {
    if (routes.length === 0) return []
    
    // Find the route with most points
    const maxPoints = Math.max(...routes.map(r => r.points?.length || 0))
    const normalizedData = []
    
    for (let i = 0; i < maxPoints; i++) {
      const dataPoint = { index: i }
      
      routes.forEach((route, routeIndex) => {
        if (route.points && route.points.length > 0) {
          const normalizedIndex = Math.floor((i / maxPoints) * route.points.length)
          const point = route.points[normalizedIndex]
          if (point) {
            if (selectedMetric === 'elevation') {
              dataPoint[`route${routeIndex}`] = Math.round(point.elevation * 3.28084) // to feet
            } else if (selectedMetric === 'grade') {
              dataPoint[`route${routeIndex}`] = point.grade || 0
            }
          }
        }
      })
      
      normalizedData.push(dataPoint)
    }
    
    return normalizedData
  }
  
  const estimateTime = (route, avgSpeed = 15) => {
    // avgSpeed in mph
    const distanceMi = route.total_distance / 1609.34
    return (distanceMi / avgSpeed) * 60 // minutes
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
  
  if (routes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/routes"
          className="inline-flex items-center gap-2 text-velo-cyan hover:text-velo-cyan-dark font-semibold mb-8"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Routes
        </Link>
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <MapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No routes selected for comparison</p>
          <Link
            to="/routes"
            className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-velo-cyan to-velo-teal text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Go to Routes
          </Link>
        </div>
      </div>
    )
  }
  
  const chartData = normalizeElevationData()
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/routes"
          className="inline-flex items-center gap-2 text-velo-cyan hover:text-velo-cyan-dark font-semibold mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Routes
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Route Comparison</h1>
        <p className="text-gray-600">Comparing {routes.length} routes side by side</p>
      </div>
      
      {/* Comparison Table */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-velo-cyan to-velo-teal text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold">Metric</th>
                {routes.map((route, index) => (
                  <th key={route.id} className="px-6 py-4 text-center text-sm font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: colors[index] }}
                      />
                      {route.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Distance Row */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <ArrowsPointingOutIcon className="w-5 h-5 text-gray-500" />
                    Distance
                  </div>
                </td>
                {routes.map(route => (
                  <td key={route.id} className="px-6 py-4 text-center text-gray-900">
                    {(route.total_distance / 1609.34).toFixed(2)} mi
                  </td>
                ))}
              </tr>
              
              {/* Elevation Row */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-gray-500" />
                    Elevation Gain
                  </div>
                </td>
                {routes.map(route => (
                  <td key={route.id} className="px-6 py-4 text-center text-gray-900">
                    {Math.round(route.total_elevation_gain)} m
                    <span className="text-sm text-gray-500 ml-1">
                      ({Math.round(route.total_elevation_gain * 3.28084)} ft)
                    </span>
                  </td>
                ))}
              </tr>
              
              {/* Difficulty Row */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">
                  Difficulty
                </td>
                {routes.map(route => {
                  const score = getDifficultyScore(route)
                  const difficulty = getDifficultyLabel(score)
                  return (
                    <td key={route.id} className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 ${difficulty.color} text-white text-sm font-bold rounded-full`}>
                        {difficulty.label}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Score: {score.toFixed(1)}
                      </div>
                    </td>
                  )
                })}
              </tr>
              
              {/* Estimated Time Row */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    Est. Time (15 mph avg)
                  </div>
                </td>
                {routes.map(route => (
                  <td key={route.id} className="px-6 py-4 text-center text-gray-900">
                    {Math.round(estimateTime(route))} min
                    <span className="text-sm text-gray-500 ml-1">
                      ({(estimateTime(route) / 60).toFixed(1)} hrs)
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Metric Selector */}
      <div className="mb-4 flex items-center gap-4">
        <span className="font-semibold text-gray-700">Chart Metric:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMetric('elevation')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedMetric === 'elevation'
                ? 'bg-velo-cyan text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Elevation
          </button>
          <button
            onClick={() => setSelectedMetric('grade')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedMetric === 'grade'
                ? 'bg-velo-cyan text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Grade
          </button>
        </div>
      </div>
      
      {/* Comparison Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {selectedMetric === 'elevation' ? 'Elevation Profile' : 'Grade Profile'} Comparison
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index" 
              label={{ value: 'Route Progress', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ 
                value: selectedMetric === 'elevation' ? 'Elevation (ft)' : 'Grade (%)', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip 
              formatter={(value) => [
                selectedMetric === 'elevation' ? `${value} ft` : `${value.toFixed(1)}%`,
                ''
              ]}
            />
            <Legend />
            {routes.map((route, index) => (
              <Line
                key={route.id}
                type="monotone"
                dataKey={`route${index}`}
                name={route.name}
                stroke={colors[index]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Winner Analysis */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">🏆 Shortest Route</h3>
          <p className="text-2xl font-black text-green-600">
            {routes.reduce((min, r) => r.total_distance < min.total_distance ? r : min).name}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {(routes.reduce((min, r) => r.total_distance < min.total_distance ? r : min).total_distance / 1609.34).toFixed(2)} mi
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">⛰️ Most Elevation</h3>
          <p className="text-2xl font-black text-blue-600">
            {routes.reduce((max, r) => r.total_elevation_gain > max.total_elevation_gain ? r : max).name}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {Math.round(routes.reduce((max, r) => r.total_elevation_gain > max.total_elevation_gain ? r : max).total_elevation_gain)} m
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border-2 border-yellow-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">⚡ Easiest Route</h3>
          <p className="text-2xl font-black text-yellow-600">
            {routes.reduce((min, r) => getDifficultyScore(r) < getDifficultyScore(min) ? r : min).name}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Difficulty: {getDifficultyLabel(getDifficultyScore(routes.reduce((min, r) => getDifficultyScore(r) < getDifficultyScore(min) ? r : min))).label}
          </p>
        </div>
      </div>
    </div>
  )
}
