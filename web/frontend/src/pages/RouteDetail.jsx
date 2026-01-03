import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceDot } from 'recharts'
import { getRoute, getActiveParameters, getWaypoints, syncWaypoints } from '../services/api'
import { detectClimbs, getClimbCategoryColor, getClimbCategoryLabel } from '../utils/climbAnalysis'
import { reverseRoute, getDifficultyColor, predictSpeed, predictSegmentTime } from '../utils/routeUtils'
import { ShareIcon, CheckIcon } from '@heroicons/react/24/outline'
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

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: onMapClick,
  })
  return null
}

export default function RouteDetail() {
  const { id } = useParams()
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapBounds, setMapBounds] = useState(null)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [waypoints, setWaypoints] = useState([])
  const [showReversed, setShowReversed] = useState(false)
  const [riderParams, setRiderParams] = useState({ ftp: 250, mass: 85, cda: 0.32 })
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const mapRef = useRef(null)
  
  useEffect(() => {
    loadRoute()
    loadRiderParams()
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
      
      // Load waypoints from backend
      try {
        const waypointsResponse = await getWaypoints(id)
        if (waypointsResponse.data.waypoints && waypointsResponse.data.waypoints.length > 0) {
          setWaypoints(waypointsResponse.data.waypoints)
        } else {
          // Fallback to localStorage for backward compatibility
          const savedWaypoints = localStorage.getItem(`waypoints_${id}`)
          if (savedWaypoints) {
            setWaypoints(JSON.parse(savedWaypoints))
          }
        }
      } catch (error) {
        console.error('Failed to load waypoints:', error)
      }
    } catch (error) {
      console.error('Failed to load route:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const loadRiderParams = async () => {
    try {
      const response = await getActiveParameters()
      if (response.data) {
        setRiderParams({
          ftp: response.data.ftp || 250,
          mass: parseFloat(response.data.mass) || 85,
          cda: parseFloat(response.data.cda) || 0.32
        })
      }
    } catch (error) {
      console.error('Failed to load rider parameters:', error)
    }
  }
  
  const handleChartClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const pointIndex = data.activePayload[0].payload.index
      if (route.points && route.points[pointIndex]) {
        setSelectedPoint(route.points[pointIndex])
        // Pan map to point
        if (mapRef.current) {
          mapRef.current.setView([
            route.points[pointIndex].latitude,
            route.points[pointIndex].longitude
          ], mapRef.current.getZoom())
        }
      }
    }
  }
  
  const handleMapClick = (e) => {
    const newWaypoint = {
      id: Date.now(),
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
      type: 'alert',
      label: 'New Waypoint',
      notes: ''
    }
    const updatedWaypoints = [...waypoints, newWaypoint]
    setWaypoints(updatedWaypoints)
    localStorage.setItem(`waypoints_${id}`, JSON.stringify(updatedWaypoints))
  }
  
  const updateWaypoint = (waypointId, updates) => {
    const updatedWaypoints = waypoints.map(w => 
      w.id === waypointId ? { ...w, ...updates } : w
    )
    setWaypoints(updatedWaypoints)
    localStorage.setItem(`waypoints_${id}`, JSON.stringify(updatedWaypoints))
    
    // Sync to backend (debounced in real app)
    syncWaypoints(id, updatedWaypoints).catch(err => 
      console.error('Failed to sync waypoints:', err)
    )
  }
  
  const removeWaypoint = (waypointId) => {
    const updatedWaypoints = waypoints.filter(w => w.id !== waypointId)
    setWaypoints(updatedWaypoints)
    localStorage.setItem(`waypoints_${id}`, JSON.stringify(updatedWaypoints))
    
    // Sync to backend
    syncWaypoints(id, updatedWaypoints).catch(err => 
      console.error('Failed to sync waypoints:', err)
    )
  }
  
  const toggleRouteDirection = () => {
    setShowReversed(!showReversed)
    setSelectedPoint(null) // Clear selection when reversing
  }
  
  const handleShareRoute = () => {
    const link = `${window.location.origin}/routes/${id}`
    setShareLink(link)
    setShareModalOpen(true)
  }
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
  
  // Prepare route points (reversed or normal)
  const displayPoints = showReversed && route.points 
    ? reverseRoute(route.points) 
    : route.points
  
  // Detect climbs in the route
  const climbs = displayPoints ? detectClimbs(displayPoints) : []
  
  // Prepare elevation chart data
  const elevationData = displayPoints
    ? displayPoints.map((point, index) => ({
        distance: (point.distance / 1609.34).toFixed(2), // Convert to miles
        elevation: point.elevation ? Math.round(point.elevation * 3.28084) : 0, // Convert to feet
        index,
        latitude: point.latitude,
        longitude: point.longitude
      }))
    : []
  
  // Calculate grade for each segment
  const gradeData = displayPoints && displayPoints.length > 1
    ? displayPoints.slice(1).map((point, index) => {
        const prev = displayPoints[index]
        const distanceDiff = point.distance - prev.distance
        const elevationDiff = point.elevation && prev.elevation 
          ? point.elevation - prev.elevation 
          : 0
        const grade = distanceDiff > 0 ? (elevationDiff / distanceDiff) * 100 : 0
        
        return {
          distance: (point.distance / 1609.34).toFixed(2), // Convert to miles
          grade: parseFloat(grade.toFixed(1)), // Keep as number for domain calculation
          index: index + 1,
          color: getDifficultyColor(grade),
          latitude: point.latitude,
          longitude: point.longitude
        }
      })
    : []
  
  // Calculate grade domain with 1% padding
  const gradeMin = gradeData.length > 0 ? Math.min(...gradeData.map(d => d.grade)) : 0
  const gradeMax = gradeData.length > 0 ? Math.max(...gradeData.map(d => d.grade)) : 0
  const gradeDomain = [Math.floor(gradeMin - 1), Math.ceil(gradeMax + 1)]
  
  // Route statistics
  const stats = {
    distance: (route.total_distance / 1609.34).toFixed(2), // Convert to miles
    elevationGain: Math.round((route.total_elevation_gain || 0) * 3.28084), // Convert to feet
    maxElevation: displayPoints && displayPoints.length > 0
      ? Math.round(Math.max(...displayPoints.map(p => (p.elevation || 0) * 3.28084)))
      : 0,
    minElevation: displayPoints && displayPoints.length > 0
      ? Math.round(Math.min(...displayPoints.map(p => (p.elevation || 0) * 3.28084)))
      : 0,
    avgGrade: route.total_distance > 0 && route.total_elevation_gain
      ? ((route.total_elevation_gain / route.total_distance) * 100).toFixed(1)
      : 0
  }
  
  // Calculate speed/time predictions
  const totalTimeSeconds = displayPoints && displayPoints.length > 1
    ? displayPoints.slice(1).reduce((total, point, index) => {
        const prev = displayPoints[index]
        const distanceDiff = point.distance - prev.distance
        const elevationDiff = point.elevation && prev.elevation ? point.elevation - prev.elevation : 0
        const grade = distanceDiff > 0 ? (elevationDiff / distanceDiff) * 100 : 0
        const segmentTime = predictSegmentTime(
          distanceDiff,
          grade,
          riderParams.ftp,
          riderParams.mass,
          riderParams.cda
        )
        return total + segmentTime
      }, 0)
    : 0

  const totalTimeMinutes = totalTimeSeconds / 60
  
  const avgSpeed = totalTimeSeconds > 0 
    ? (parseFloat(stats.distance) / (totalTimeSeconds / 3600)).toFixed(1)
    : 0
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/routes" className="text-velo-blue-600 hover:underline mb-2 inline-block">
            ← Back to Routes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{route.name}</h1>
          {showReversed && (
            <span className="inline-block mt-2 px-3 py-1 bg-velo-cyan-100 text-velo-cyan-700 rounded-full text-sm font-medium">
              Reversed Direction
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShareRoute}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all font-semibold"
          >
            <ShareIcon className="w-5 h-5" />
            Share
          </button>
          <button
            onClick={toggleRouteDirection}
            className="px-4 py-2 bg-gradient-to-r from-velo-cyan-500 to-velo-blue-500 text-white rounded-lg hover:from-velo-cyan-600 hover:to-velo-blue-600 transition-all font-semibold"
          >
            {showReversed ? '⟲ Normal Direction' : '⟲ Reverse Route'}
          </button>
        </div>
      </div>
      
      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Share Route</h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Share this route with others using the link below:
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
              />
              <button
                onClick={copyShareLink}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-velo-cyan text-white hover:bg-velo-cyan-dark'
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-5 h-5 inline" />
                  </>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Anyone with this link can view this route, but they'll need a VeloMind account to download it to their device.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
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
          <p className="text-sm text-gray-500">Avg Grade</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgGrade}%</p>
        </div>
        <div className="bg-gradient-to-br from-velo-cyan-50 to-velo-blue-50 p-4 rounded-lg shadow border border-velo-cyan-200">
          <p className="text-sm text-velo-cyan-700">Est. Time</p>
          <p className="text-2xl font-bold text-velo-blue-900">
            {Math.floor(totalTimeMinutes / 60)}h {Math.round(totalTimeMinutes % 60)}m
          </p>
        </div>
        <div className="bg-gradient-to-br from-velo-teal-50 to-velo-green-50 p-4 rounded-lg shadow border border-velo-teal-200">
          <p className="text-sm text-velo-teal-700">Avg Speed</p>
          <p className="text-2xl font-bold text-velo-green-900">{avgSpeed} mph</p>
        </div>
      </div>
      
      {/* Climbs Detected */}
      {climbs.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Detected Climbs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {climbs.map((climb, idx) => (
              <div 
                key={idx}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                style={{ borderColor: getClimbCategoryColor(climb.category) }}
                onClick={() => {
                  // Pan map to climb start
                  if (mapRef.current && displayPoints[climb.startIndex]) {
                    mapRef.current.setView([
                      displayPoints[climb.startIndex].latitude,
                      displayPoints[climb.startIndex].longitude
                    ], 14)
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">Climb {idx + 1}</h3>
                  <span 
                    className="px-2 py-1 rounded text-white text-sm font-bold"
                    style={{ backgroundColor: getClimbCategoryColor(climb.category) }}
                  >
                    {getClimbCategoryLabel(climb.category)}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Distance: {(climb.distance / 1609.34).toFixed(2)} mi</p>
                  <p>Elevation: {Math.round(climb.elevationGain * 3.28084)} ft</p>
                  <p>Avg Grade: {climb.avgGrade.toFixed(1)}%</p>
                  <p>Max Grade: {climb.maxGrade.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Map */}
      <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Route Map</h2>
          <p className="text-sm text-gray-500">Click on map to add waypoint markers</p>
        </div>
        <div className="h-96">
          {mapBounds && displayPoints && (
            <MapContainer
              ref={mapRef}
              bounds={mapBounds}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <MapClickHandler onMapClick={handleMapClick} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Difficulty-colored route segments */}
              {gradeData.map((segment, idx) => {
                if (idx === 0 || !displayPoints[idx]) return null
                return (
                  <Polyline
                    key={idx}
                    positions={[
                      [displayPoints[idx - 1].latitude, displayPoints[idx - 1].longitude],
                      [displayPoints[idx].latitude, displayPoints[idx].longitude]
                    ]}
                    color={segment.color}
                    weight={4}
                    opacity={0.7}
                  />
                )
              })}
              
              {/* Start marker */}
              <Marker position={[displayPoints[0].latitude, displayPoints[0].longitude]}>
                <Popup>
                  <strong>{showReversed ? 'Finish' : 'Start'}</strong>
                  <br />Elevation: {Math.round(displayPoints[0].elevation * 3.28084)} ft
                </Popup>
              </Marker>
              
              {/* End marker */}
              <Marker position={[
                displayPoints[displayPoints.length - 1].latitude,
                displayPoints[displayPoints.length - 1].longitude
              ]}>
                <Popup>
                  <strong>{showReversed ? 'Start' : 'Finish'}</strong>
                  <br />Elevation: {Math.round(displayPoints[displayPoints.length - 1].elevation * 3.28084)} ft
                </Popup>
              </Marker>
              
              {/* Selected point from chart click */}
              {selectedPoint && (
                <Circle
                  center={[selectedPoint.latitude, selectedPoint.longitude]}
                  radius={50}
                  pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
                >
                  <Popup>
                    <strong>Selected Point</strong>
                    <br />Distance: {(selectedPoint.distance / 1609.34).toFixed(2)} mi
                    <br />Elevation: {Math.round(selectedPoint.elevation * 3.28084)} ft
                  </Popup>
                </Circle>
              )}
              
              {/* Custom waypoints */}
              {waypoints.map(waypoint => (
                <Marker 
                  key={waypoint.id}
                  position={[waypoint.latitude, waypoint.longitude]}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="mb-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Label</label>
                        <input
                          type="text"
                          value={waypoint.label || ''}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateWaypoint(waypoint.id, { label: e.target.value })
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-velo-cyan-500 focus:border-transparent"
                          placeholder="e.g., Aggressive dogs"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                        <select
                          value={waypoint.type || 'alert'}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateWaypoint(waypoint.id, { type: e.target.value })
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-velo-cyan-500 focus:border-transparent"
                        >
                          <option value="alert">⚠️ Alert</option>
                          <option value="danger">🚨 Danger</option>
                          <option value="water">💧 Water Stop</option>
                          <option value="food">🍎 Nutrition</option>
                          <option value="rest">🛑 Rest Stop</option>
                          <option value="photo">📷 Photo Spot</option>
                          <option value="turn">↪️ Turn</option>
                          <option value="steep">⛰️ Steep Section</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={waypoint.notes || ''}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateWaypoint(waypoint.id, { notes: e.target.value })
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-velo-cyan-500 focus:border-transparent"
                          rows="2"
                          placeholder="Details for iOS alert..."
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeWaypoint(waypoint.id)
                        }}
                        className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Remove Waypoint
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Climb markers */}
              {climbs.map((climb, idx) => {
                if (!displayPoints[climb.startIndex]) return null
                return (
                  <Circle
                    key={`climb-${idx}`}
                    center={[
                      displayPoints[climb.startIndex].latitude,
                      displayPoints[climb.startIndex].longitude
                    ]}
                    radius={100}
                    pathOptions={{ 
                      color: getClimbCategoryColor(climb.category),
                      fillColor: getClimbCategoryColor(climb.category),
                      fillOpacity: 0.3
                    }}
                  >
                    <Popup>
                      <strong>Climb {idx + 1} - {getClimbCategoryLabel(climb.category)}</strong>
                      <br />Distance: {(climb.distance / 1609.34).toFixed(2)} mi
                      <br />Elevation: {Math.round(climb.elevationGain * 3.28084)} ft
                      <br />Avg Grade: {climb.avgGrade.toFixed(1)}%
                    </Popup>
                  </Circle>
                )
              })}
            </MapContainer>
          )}
        </div>
      </div>
      
      {/* Elevation Profile */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Elevation Profile</h2>
        <p className="text-sm text-gray-500 mb-4">Click on the chart to highlight location on map</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={elevationData} onClick={handleChartClick}>
            <defs>
              <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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
              stroke="#0284c7" 
              fill="url(#elevationGradient)"
              strokeWidth={2}
            />
            {selectedPoint && (
              <ReferenceDot
                x={(selectedPoint.distance / 1609.34).toFixed(2)}
                y={Math.round(selectedPoint.elevation * 3.28084)}
                r={8}
                fill="red"
                stroke="white"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Grade Profile */}
      {gradeData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Grade Profile</h2>
          <p className="text-sm text-gray-500 mb-4">Colors indicate difficulty: Blue (flat) → Green → Yellow → Orange → Red (steep)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={gradeData} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="distance" 
                label={{ value: 'Distance (mi)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={gradeDomain}
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
              {selectedPoint && gradeData.find(d => d.index === displayPoints.indexOf(selectedPoint)) && (
                <ReferenceDot
                  x={(selectedPoint.distance / 1609.34).toFixed(2)}
                  y={gradeData.find(d => d.index === displayPoints.indexOf(selectedPoint))?.grade || 0}
                  r={8}
                  fill="red"
                  stroke="white"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
