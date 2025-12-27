import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { getRoute } from '../services/api'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icon issue with Vite
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

export default function RouteDetail() {
  const { id } = useParams()
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapBounds, setMapBounds] = useState(null)
  
  useEffect(() => {
    loadRoute()
  }, [id])
  
  const loadRoute = async () => {
    try {
      const response = await getRoute(id)
      const routeData = response.data
      setRoute(routeData)
      
      // Calculate map bounds
      if (routeData.points && routeData.points.length > 0) {
        const lats = routeData.points.map(p => p.latitude)
        const lons = routeData.points.map(p => p.longitude)
        setMapBounds([
          [Math.min(...lats), Math.min(...lons)],
          [Math.max(...lats), Math.max(...lons)]
        ])
      }
    } catch (error) {
      console.error('Failed to load route:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading route...</p>
      </div>
    )
  }
  
  if (!route) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">Route not found</p>
        <Link to="/routes" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Routes
        </Link>
      </div>
    )
  }
  
  // Prepare elevation chart data
  const elevationData = route.points
    ? route.points.map((point, index) => ({
        distance: (point.distance / 1609.34).toFixed(2), // Convert to miles
        elevation: point.elevation ? Math.round(point.elevation * 3.28084) : 0, // Convert to feet
        index
      }))
    : []
  
  // Calculate grade for each segment
  const gradeData = route.points && route.points.length > 1
    ? route.points.slice(1).map((point, index) => {
        const prev = route.points[index]
        const distanceDiff = point.distance - prev.distance
        const elevationDiff = point.elevation && prev.elevation 
          ? point.elevation - prev.elevation 
          : 0
        const grade = distanceDiff > 0 ? (elevationDiff / distanceDiff) * 100 : 0
        
        return {
          distance: (point.distance / 1609.34).toFixed(2), // Convert to miles
          grade: grade.toFixed(1),
          index: index + 1
        }
      })
    : []
  
  // Route statistics
  const stats = {
    distance: (route.total_distance / 1609.34).toFixed(2), // Convert to miles
    elevationGain: Math.round((route.total_elevation_gain || 0) * 3.28084), // Convert to feet
    maxElevation: route.points && route.points.length > 0
      ? Math.round(Math.max(...route.points.map(p => (p.elevation || 0) * 3.28084)))
      : 0,
    minElevation: route.points && route.points.length > 0
      ? Math.round(Math.min(...route.points.map(p => (p.elevation || 0) * 3.28084)))
      : 0,
    avgGrade: route.total_distance > 0 && route.total_elevation_gain
      ? ((route.total_elevation_gain / route.total_distance) * 100).toFixed(1)
      : 0
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/routes" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Routes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{route.name}</h1>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Distance</p>
          <p className="text-2xl font-bold text-gray-900">{stats.distance} mi</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Elevation Gain</p>
          <p className="text-2xl font-bold text-gray-900">{stats.elevationGain} ft</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Max Elevation</p>
          <p className="text-2xl font-bold text-gray-900">{stats.maxElevation} ft</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Min Elevation</p>
          <p className="text-2xl font-bold text-gray-900">{stats.minElevation} ft</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg Grade</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgGrade}%</p>
        </div>
      </div>
      
      {/* Map */}
      <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Route Map</h2>
        </div>
        <div className="h-96">
          {mapBounds && route.points && (
            <MapContainer
              bounds={mapBounds}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline
                positions={route.points.map(p => [p.latitude, p.longitude])}
                color="blue"
                weight={3}
              />
              {/* Start marker */}
              <Marker position={[route.points[0].latitude, route.points[0].longitude]}>
                <Popup>Start</Popup>
              </Marker>
              {/* End marker */}
              <Marker position={[
                route.points[route.points.length - 1].latitude,
                route.points[route.points.length - 1].longitude
              ]}>
                <Popup>Finish</Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      </div>
      
      {/* Elevation Profile */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Elevation Profile</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={elevationData}>
            <defs>
              <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="distance" 
              label={{ value: 'Distance (mi)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Elevation (ft)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value) => [`${value} ft`, 'Elevation']}
              labelFormatter={(label) => `${label} mi`}
            />
            <Area 
              type="monotone" 
              dataKey="elevation" 
              stroke="#3b82f6" 
              fill="url(#elevationGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Grade Profile */}
      {gradeData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Grade Profile</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="distance" 
                label={{ value: 'Distance (mi)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value) => `${value}%`}
                label={{ value: 'Grade (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`${parseFloat(value).toFixed(1)}%`, 'Grade']}
                labelFormatter={(label) => `${label} mi`}
              />
              <Line 
                type="monotone" 
                dataKey="grade" 
                stroke="#ef4444" 
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
