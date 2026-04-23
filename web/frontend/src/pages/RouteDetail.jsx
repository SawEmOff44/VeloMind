import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceDot } from 'recharts'
import {
  createWaypoint as createRouteWaypoint,
  deleteWaypoint as deleteRouteWaypoint,
  downloadRouteSource,
  getRoute,
  getActiveParameters,
  getWaypoints,
  updateWaypoint as updateRouteWaypoint
} from '../services/api'
import { detectClimbs, getClimbCategoryColor, getClimbCategoryLabel } from '../utils/climbAnalysis'
import { reverseRoute, getDifficultyColor, predictSegmentTime } from '../utils/routeUtils'
import {
  ArrowDownTrayIcon,
  CheckIcon,
  MapPinIcon,
  PlayIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import {
  buildRouteWaypoints,
  getRouteSourceLabel,
  getWaypointPresentation,
  haversineDistanceMeters,
  resolveDistanceFromRoutePoints,
  toNumber
} from '../utils/liveRide'
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

function waypointIdsMatch(left, right) {
  return String(left) === String(right)
}

function sortWaypoints(waypointList) {
  return [...waypointList].sort((left, right) => {
    const leftDistance = toNumber(left.distance_from_start ?? left.distanceFromStart)
    const rightDistance = toNumber(right.distance_from_start ?? right.distanceFromStart)

    if (leftDistance === null && rightDistance === null) return 0
    if (leftDistance === null) return 1
    if (rightDistance === null) return -1
    return leftDistance - rightDistance
  })
}

function stopEventPropagation(event) {
  event.stopPropagation()
}

function formatCoordinateInput(value) {
  const parsed = toNumber(value)
  return parsed === null ? '' : parsed.toFixed(6)
}

function createEmptyCoordinateDraft(latitude = '', longitude = '') {
  return {
    latitude: formatCoordinateInput(latitude),
    longitude: formatCoordinateInput(longitude)
  }
}

function isSupportCue(cue) {
  return cue.type === 'rest' || cue.type === 'water' || cue.type === 'food'
}

// Component to handle map clicks
function MapClickHandler({ isAddWaypointMode, onMapClick }) {
  const lastInteractionRef = useRef(0)

  useMapEvents({
    click: (event) => {
      if (!isAddWaypointMode) return

      const originalTarget = event.originalEvent?.target
      if (
        originalTarget?.closest?.('.leaflet-control')
        || originalTarget?.closest?.('.leaflet-popup')
        || originalTarget?.closest?.('.leaflet-marker-icon')
      ) {
        return
      }

      if (Date.now() - lastInteractionRef.current < 300) {
        return
      }

      onMapClick(event)
    },
    dragstart: () => {
      lastInteractionRef.current = Date.now()
    },
    movestart: () => {
      lastInteractionRef.current = Date.now()
    },
    zoomstart: () => {
      lastInteractionRef.current = Date.now()
    }
  })

  return null
}

function normalizeWaypointForSync(waypoint, routePoints) {
  const distanceFromStart = toNumber(waypoint.distance_from_start)
    ?? resolveDistanceFromRoutePoints(routePoints, waypoint.latitude, waypoint.longitude)

  return {
    ...waypoint,
    distance_from_start: distanceFromStart
  }
}

function WaypointPopupEditor({ waypoint, onSave, onRemove }) {
  const [draft, setDraft] = useState({
    label: waypoint.label || '',
    type: waypoint.type || 'alert',
    notes: waypoint.notes || '',
    latitude: formatCoordinateInput(waypoint.latitude),
    longitude: formatCoordinateInput(waypoint.longitude)
  })
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    setDraft({
      label: waypoint.label || '',
      type: waypoint.type || 'alert',
      notes: waypoint.notes || '',
      latitude: formatCoordinateInput(waypoint.latitude),
      longitude: formatCoordinateInput(waypoint.longitude)
    })
  }, [waypoint.id, waypoint.label, waypoint.type, waypoint.notes, waypoint.latitude, waypoint.longitude])

  const latitude = toNumber(draft.latitude)
  const longitude = toNumber(draft.longitude)
  const coordinatesAreValid = latitude !== null && longitude !== null

  const hasChanges = (
    draft.label !== (waypoint.label || '')
    || draft.type !== (waypoint.type || 'alert')
    || draft.notes !== (waypoint.notes || '')
    || draft.latitude !== formatCoordinateInput(waypoint.latitude)
    || draft.longitude !== formatCoordinateInput(waypoint.longitude)
  )

  const handleSave = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!hasChanges || saving || !coordinatesAreValid) return

    setSaving(true)
    try {
      await onSave(waypoint.id, {
        label: draft.label,
        type: draft.type,
        notes: draft.notes,
        latitude,
        longitude
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (removing) return

    setRemoving(true)
    try {
      await onRemove(waypoint.id)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <form className="min-w-[220px] space-y-3" onSubmit={handleSave}>
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-700">Label</label>
        <input
          type="text"
          value={draft.label}
          onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
          onClick={stopEventPropagation}
          onMouseDown={stopEventPropagation}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-velo-cyan-500"
          placeholder="e.g., Aggressive dogs"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-700">Type</label>
        <select
          value={draft.type}
          onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
          onClick={stopEventPropagation}
          onMouseDown={stopEventPropagation}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-velo-cyan-500"
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
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-700">Notes</label>
        <textarea
          value={draft.notes}
          onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
          onClick={stopEventPropagation}
          onMouseDown={stopEventPropagation}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-velo-cyan-500"
          rows="2"
          placeholder="Details for iOS alert..."
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Latitude</label>
          <input
            type="text"
            inputMode="decimal"
            value={draft.latitude}
            onChange={(event) => setDraft((current) => ({ ...current, latitude: event.target.value }))}
            onClick={stopEventPropagation}
            onMouseDown={stopEventPropagation}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-velo-cyan-500"
            placeholder="30.197867"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Longitude</label>
          <input
            type="text"
            inputMode="decimal"
            value={draft.longitude}
            onChange={(event) => setDraft((current) => ({ ...current, longitude: event.target.value }))}
            onClick={stopEventPropagation}
            onMouseDown={stopEventPropagation}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-velo-cyan-500"
            placeholder="-97.429454"
          />
        </div>
      </div>
      {!coordinatesAreValid && (
        <p className="text-xs font-medium text-red-600">
          Enter valid latitude and longitude values to save this cue.
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!hasChanges || saving || !coordinatesAreValid}
          className="flex-1 rounded bg-velo-cyan px-3 py-2 text-xs font-semibold text-white hover:bg-velo-cyan-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Cue'}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="flex-1 rounded bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {removing ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </form>
  )
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
  const [downloadingSource, setDownloadingSource] = useState(false)
  const [isAddWaypointMode, setIsAddWaypointMode] = useState(false)
  const [creatingWaypoint, setCreatingWaypoint] = useState(false)
  const [newWaypointDraft, setNewWaypointDraft] = useState(() => createEmptyCoordinateDraft())
  const mapRef = useRef(null)
  const routeCues = useMemo(
    () => buildRouteWaypoints(waypoints, route?.points || []),
    [waypoints, route]
  )
  const savedCueCount = waypoints.length || route?.waypoint_count || routeCues.length
  
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
          setWaypoints(
            sortWaypoints(
              waypointsResponse.data.waypoints.map((waypoint) =>
                normalizeWaypointForSync(waypoint, routeData.points || [])
              )
            )
          )
        } else {
          // Fallback to localStorage for backward compatibility
          const savedWaypoints = localStorage.getItem(`waypoints_${id}`)
          if (savedWaypoints) {
            setWaypoints(
              sortWaypoints(
                JSON.parse(savedWaypoints).map((waypoint) =>
                  normalizeWaypointForSync(waypoint, routeData.points || [])
                )
              )
            )
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
      const active = response?.data?.parameters
      if (active) {
        setRiderParams({
          ftp: active.ftp || 250,
          mass: parseFloat(active.mass) || 85,
          cda: parseFloat(active.cda) || 0.32
        })
      }
    } catch (error) {
      console.error('Failed to load rider parameters:', error)
    }
  }

  useEffect(() => {
    if (loading) return

    localStorage.setItem(`waypoints_${id}`, JSON.stringify(waypoints))
  }, [id, loading, waypoints])

  const upsertWaypoint = (nextWaypoint) => {
    const normalizedWaypoint = normalizeWaypointForSync(nextWaypoint, route?.points || [])

    setWaypoints((currentWaypoints) => {
      const existingIndex = currentWaypoints.findIndex((waypoint) =>
        waypointIdsMatch(waypoint.id, normalizedWaypoint.id)
      )

      if (existingIndex === -1) {
        return sortWaypoints([...currentWaypoints, normalizedWaypoint])
      }

      const nextWaypoints = [...currentWaypoints]
      nextWaypoints[existingIndex] = normalizedWaypoint
      return sortWaypoints(nextWaypoints)
    })
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
  
  const handleMapClick = async (e) => {
    if (!isAddWaypointMode || creatingWaypoint) return

    setNewWaypointDraft(createEmptyCoordinateDraft(e.latlng.lat, e.latlng.lng))
  }

  const createWaypointFromCoordinates = async () => {
    const latitude = toNumber(newWaypointDraft.latitude)
    const longitude = toNumber(newWaypointDraft.longitude)

    if (latitude === null || longitude === null) {
      alert('Enter valid latitude and longitude values before creating a cue')
      return
    }

    const existingWaypointIds = new Set(waypoints.map((waypoint) => String(waypoint.id)))

    setCreatingWaypoint(true)

    try {
      const response = await createRouteWaypoint(id, {
        latitude,
        longitude,
        type: 'alert',
        label: 'New Cue',
        notes: '',
        distance_from_start: resolveDistanceFromRoutePoints(route?.points || [], latitude, longitude)
      })

      if (response?.data?.waypoint) {
        upsertWaypoint(response.data.waypoint)
        setNewWaypointDraft(createEmptyCoordinateDraft())
        setIsAddWaypointMode(false)
      }
    } catch (error) {
      try {
        const response = await getWaypoints(id)
        const refreshedWaypoints = sortWaypoints(
          (response?.data?.waypoints || []).map((waypoint) =>
            normalizeWaypointForSync(waypoint, route?.points || [])
          )
        )
        const recoveredWaypoint = refreshedWaypoints.find((waypoint) => {
          if (existingWaypointIds.has(String(waypoint.id))) return false

          const waypointLatitude = toNumber(waypoint.latitude)
          const waypointLongitude = toNumber(waypoint.longitude)
          if (waypointLatitude === null || waypointLongitude === null) return false

          return haversineDistanceMeters(latitude, longitude, waypointLatitude, waypointLongitude) <= 25
        })

        if (recoveredWaypoint) {
          setWaypoints(refreshedWaypoints)
          setNewWaypointDraft(createEmptyCoordinateDraft())
          setIsAddWaypointMode(false)
          return
        }
      } catch (refreshError) {
        console.error('Failed to confirm waypoint creation after error:', refreshError)
      }

      console.error('Failed to create waypoint:', error)
      alert(error?.response?.data?.error || 'Failed to create cue')
    } finally {
      setCreatingWaypoint(false)
    }
  }
  
  const saveWaypoint = async (waypointId, updates) => {
    try {
      const response = await updateRouteWaypoint(waypointId, updates)
      if (response?.data?.waypoint) {
        upsertWaypoint(response.data.waypoint)
      }
    } catch (error) {
      console.error('Failed to update waypoint:', error)
      alert(error?.response?.data?.error || 'Failed to save cue')
    }
  }
  
  const removeWaypoint = async (waypointId) => {
    try {
      await deleteRouteWaypoint(waypointId)
      setWaypoints((currentWaypoints) =>
        currentWaypoints.filter((waypoint) => !waypointIdsMatch(waypoint.id, waypointId))
      )
    } catch (error) {
      if (error?.response?.status === 404) {
        setWaypoints((currentWaypoints) =>
          currentWaypoints.filter((waypoint) => !waypointIdsMatch(waypoint.id, waypointId))
        )
        return
      }

      try {
        const response = await getWaypoints(id)
        const refreshedWaypoints = sortWaypoints(
          (response?.data?.waypoints || []).map((waypoint) =>
            normalizeWaypointForSync(waypoint, route?.points || [])
          )
        )
        const waypointStillExists = refreshedWaypoints.some((waypoint) =>
          waypointIdsMatch(waypoint.id, waypointId)
        )

        if (!waypointStillExists) {
          setWaypoints(refreshedWaypoints)
          return
        }
      } catch (refreshError) {
        console.error('Failed to confirm waypoint deletion after error:', refreshError)
      }

      console.error('Failed to remove waypoint:', error)
      alert(error?.response?.data?.error || 'Failed to remove cue')
    }
  }
  
  const toggleRouteDirection = () => {
    setShowReversed(!showReversed)
    setSelectedPoint(null) // Clear selection when reversing
  }

  const toggleAddWaypointMode = () => {
    setIsAddWaypointMode((current) => {
      if (current) {
        setNewWaypointDraft(createEmptyCoordinateDraft())
        return false
      }

      return true
    })
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

  const handleDownloadSource = async () => {
    try {
      setDownloadingSource(true)
      const response = await downloadRouteSource(id)
      const contentType = response.headers['content-type'] || 'application/octet-stream'
      const fileName = route.original_file_name || `${route.name}.${route.source_format || 'gpx'}`
      const blob = new Blob([response.data], { type: contentType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download source route file:', error)
      alert('Failed to download the original route file')
    } finally {
      setDownloadingSource(false)
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
  
  // Prepare route points (reversed or normal)
  const displayPoints = showReversed && route.points 
    ? reverseRoute(route.points) 
    : route.points
  
  // Detect climbs in the route
  const climbs = displayPoints ? detectClimbs(displayPoints) : []
  const supportCues = routeCues.filter(isSupportCue)
  const generalRouteCues = routeCues.filter((cue) => !isSupportCue(cue))
  
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
  const routeLinePositions = displayPoints
    ? displayPoints.map((point) => [point.latitude, point.longitude])
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
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              {getRouteSourceLabel(route.source_format)}
            </span>
            <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
              {savedCueCount} saved cues
            </span>
            {route.original_file_name && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                {route.original_file_name}
              </span>
            )}
          </div>
          {showReversed && (
            <span className="inline-block mt-2 px-3 py-1 bg-velo-cyan-100 text-velo-cyan-700 rounded-full text-sm font-medium">
              Reversed Direction
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/routes/${id}/live`}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-velo-cyan-500 to-velo-blue-500 text-white rounded-lg hover:from-velo-cyan-600 hover:to-velo-blue-600 transition-all font-semibold"
          >
            <PlayIcon className="w-5 h-5" />
            Start Live Ride
          </Link>
          {route.has_original_file && (
            <button
              onClick={handleDownloadSource}
              disabled={downloadingSource}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {downloadingSource ? 'Downloading...' : 'Download Original'}
            </button>
          )}
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
                    {getClimbCategoryLabel(climb.category, climb)}
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

      {routeCues.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Route Cues</h2>
              <p className="text-sm text-gray-500">Imported FIT cues and saved route alerts that can also power live ride guidance.</p>
            </div>
            <Link
              to={`/routes/${id}/live`}
              className="inline-flex items-center gap-2 rounded-lg bg-velo-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-velo-cyan-dark"
            >
              <PlayIcon className="h-4 w-4" />
              Open Live Ride
            </Link>
          </div>

          {supportCues.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Support Stops</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportCues.slice(0, 6).map((cue) => {
                  const presentation = getWaypointPresentation(cue.type)

                  return (
                    <div
                      key={`support-${cue.id}`}
                      className={`rounded-xl border p-4 ${presentation.bgClass} ${presentation.borderClass}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-semibold ${presentation.textClass}`}>
                            {presentation.emoji} {cue.label || presentation.label}
                          </p>
                          {cue.notes && (
                            <p className="mt-1 text-sm text-gray-600">{cue.notes}</p>
                          )}
                        </div>
                        {Number.isFinite(toNumber(cue.distanceFromStart)) && (
                          <p className="text-sm font-semibold text-gray-900">
                            {(toNumber(cue.distanceFromStart) / 1609.34).toFixed(2)} mi
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {generalRouteCues.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generalRouteCues.slice(0, 12).map((cue) => {
                const presentation = getWaypointPresentation(cue.type)

                return (
                  <div
                    key={cue.id}
                    className={`rounded-xl border p-4 ${presentation.bgClass} ${presentation.borderClass}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-semibold ${presentation.textClass}`}>
                          {presentation.emoji} {cue.label || presentation.label}
                        </p>
                        {cue.notes && (
                          <p className="mt-1 text-sm text-gray-600">{cue.notes}</p>
                        )}
                      </div>
                      {Number.isFinite(toNumber(cue.distanceFromStart)) && (
                        <p className="text-sm font-semibold text-gray-900">
                          {(toNumber(cue.distanceFromStart) / 1609.34).toFixed(2)} mi
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Map */}
      <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Route Map</h2>
            <p className="text-sm text-gray-500">
              Pan and zoom normally. Turn on add mode only when you want to place a cue.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleAddWaypointMode}
              disabled={creatingWaypoint}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isAddWaypointMode
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-velo-cyan text-white hover:bg-velo-cyan-dark'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <MapPinIcon className="h-4 w-4" />
              {creatingWaypoint
                ? 'Placing Cue...'
                : isAddWaypointMode
                  ? 'Cancel Add Cue'
                  : 'Add Cue'}
            </button>
            <span className={`text-sm ${isAddWaypointMode ? 'font-semibold text-amber-700' : 'text-gray-500'}`}>
              {isAddWaypointMode
                ? 'Tap the map or paste coordinates, then confirm the new cue.'
                : 'Map taps are safe while add mode is off.'}
            </span>
          </div>
          {isAddWaypointMode && (
            <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-amber-800">Latitude</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newWaypointDraft.latitude}
                  onChange={(event) => setNewWaypointDraft((current) => ({ ...current, latitude: event.target.value }))}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-velo-cyan-500"
                  placeholder="30.197867"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-amber-800">Longitude</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newWaypointDraft.longitude}
                  onChange={(event) => setNewWaypointDraft((current) => ({ ...current, longitude: event.target.value }))}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-velo-cyan-500"
                  placeholder="-97.429454"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={createWaypointFromCoordinates}
                  disabled={creatingWaypoint}
                  className="rounded-lg bg-velo-cyan px-4 py-2 text-sm font-semibold text-white hover:bg-velo-cyan-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingWaypoint ? 'Creating...' : 'Create Cue'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewWaypointDraft(createEmptyCoordinateDraft())
                    setIsAddWaypointMode(false)
                  }}
                  disabled={creatingWaypoint}
                  className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-amber-800 md:col-span-3">
                Tip: tap the map to fill these coordinates, or paste exact lat/lon from the original route map.
              </p>
            </div>
          )}
        </div>
        <div className="h-96">
          {mapBounds && displayPoints && (
            <MapContainer
              ref={mapRef}
              bounds={mapBounds}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <MapClickHandler
                isAddWaypointMode={isAddWaypointMode}
                onMapClick={handleMapClick}
              />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Route halo for visibility against the basemap */}
              <Polyline
                positions={routeLinePositions}
                pathOptions={{
                  color: '#0f172a',
                  weight: 12,
                  opacity: 0.28,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                interactive={false}
              />

              {/* Bright route spine so the course stays easy to follow */}
              <Polyline
                positions={routeLinePositions}
                pathOptions={{
                  color: '#22d3ee',
                  weight: 8,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                interactive={false}
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
                    pathOptions={{
                      color: segment.color,
                      weight: 5,
                      opacity: 0.95,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }}
                    interactive={false}
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
                    <WaypointPopupEditor
                      waypoint={waypoint}
                      onSave={saveWaypoint}
                      onRemove={removeWaypoint}
                    />
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
                      <strong>Climb {idx + 1} - {getClimbCategoryLabel(climb.category, climb)}</strong>
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
