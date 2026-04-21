import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Circle, CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  MapPinIcon,
  SignalIcon
} from '@heroicons/react/24/outline'
import { getRoute, getWaypoints } from '../services/api'
import {
  buildRouteWaypoints,
  deriveLiveSpeedMps,
  findNearestRoutePoint,
  formatDistanceImperial,
  formatSpeedMph,
  getNextWaypoint,
  getRouteSourceLabel,
  metersToMiles,
  toNumber
} from '../utils/liveRide'
import 'leaflet/dist/leaflet.css'

function FollowRider({ position, followRider }) {
  const map = useMap()

  useEffect(() => {
    if (!position || !followRider) return

    map.setView(
      [position.latitude, position.longitude],
      Math.max(map.getZoom(), 15),
      { animate: true }
    )
  }, [map, position, followRider])

  return null
}

function getLocationErrorMessage(error) {
  if (!error) return ''

  if (error.code === 1) {
    return 'Location permission is blocked. Enable precise location access to use live ride mode.'
  }

  if (error.code === 2) {
    return 'GPS signal is unavailable right now. Keep the page open and try moving to an open area.'
  }

  if (error.code === 3) {
    return 'Location is taking too long to update. We will keep trying in the background.'
  }

  return 'Unable to read your current location.'
}

export default function RouteLiveRide() {
  const { id } = useParams()
  const [route, setRoute] = useState(null)
  const [waypoints, setWaypoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [position, setPosition] = useState(null)
  const [speedMps, setSpeedMps] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [followRider, setFollowRider] = useState(true)
  const lastPositionRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function loadRouteData() {
      setLoading(true)
      setLoadError('')

      try {
        const [routeResponse, waypointsResponse] = await Promise.all([
          getRoute(id),
          getWaypoints(id).catch(() => ({ data: { waypoints: [] } }))
        ])

        if (cancelled) return

        setRoute(routeResponse.data)
        setWaypoints(waypointsResponse.data?.waypoints || [])
      } catch (error) {
        if (cancelled) return
        console.error('Failed to load live ride route:', error)
        setLoadError('Unable to load this route for live ride mode.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRouteData()

    return () => {
      cancelled = true
    }
  }, [id])

  const routePoints = route?.points || []

  useEffect(() => {
    if (!routePoints.length) return

    if (!navigator.geolocation) {
      setLocationError('This browser does not support live GPS tracking.')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (geoPosition) => {
        const nextPosition = {
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude,
          accuracy: geoPosition.coords.accuracy,
          speed: geoPosition.coords.speed,
          heading: geoPosition.coords.heading,
          timestamp: geoPosition.timestamp
        }

        const derivedSpeed = deriveLiveSpeedMps(nextPosition, lastPositionRef.current)
        if (derivedSpeed !== null) {
          setSpeedMps(derivedSpeed)
        }

        lastPositionRef.current = nextPosition
        setPosition(nextPosition)
        setIsTracking(true)
        setLocationError('')
      },
      (error) => {
        console.error('Live ride geolocation error:', error)
        setIsTracking(false)
        setLocationError(getLocationErrorMessage(error))
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [routePoints.length])

  const routeBounds = useMemo(() => {
    if (!routePoints.length) return null

    const latitudes = routePoints.map((point) => point.latitude)
    const longitudes = routePoints.map((point) => point.longitude)

    return [
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)]
    ]
  }, [routePoints])

  const rideWaypoints = useMemo(
    () => buildRouteWaypoints(waypoints, routePoints, { includeClimbs: true }),
    [waypoints, routePoints]
  )

  const nearestPoint = useMemo(() => {
    if (!position) return null
    return findNearestRoutePoint(routePoints, position.latitude, position.longitude)
  }, [routePoints, position])

  const totalDistance = toNumber(route?.total_distance)
    ?? toNumber(routePoints[routePoints.length - 1]?.distance)
    ?? 0
  const progressDistance = nearestPoint?.routeDistance ?? 0
  const remainingDistance = Math.max(0, totalDistance - progressDistance)
  const nextWaypoint = useMemo(
    () => getNextWaypoint(rideWaypoints, progressDistance),
    [rideWaypoints, progressDistance]
  )
  const distanceToNextWaypoint = nextWaypoint
    ? Math.max(0, (toNumber(nextWaypoint.distanceFromStart) ?? 0) - progressDistance)
    : null
  const upcomingWaypoints = useMemo(
    () => rideWaypoints.filter((waypoint) => {
      const distanceFromStart = toNumber(waypoint.distanceFromStart)
      return distanceFromStart !== null && distanceFromStart >= progressDistance + 25
    }).slice(0, 3),
    [rideWaypoints, progressDistance]
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading live ride mode...</p>
      </div>
    )
  }

  if (loadError || !route) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-600">{loadError || 'Route not found'}</p>
        <Link to="/routes" className="text-velo-blue-600 hover:underline mt-4 inline-flex items-center gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Routes
        </Link>
      </div>
    )
  }

  const nextWaypointPresentation = nextWaypoint?.presentation

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link to={`/routes/${id}`} className="inline-flex items-center gap-2 text-velo-blue-600 hover:underline">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to route details
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <SignalIcon className="h-4 w-4" />
              {isTracking ? 'Live GPS active' : 'Waiting for GPS'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {getRouteSourceLabel(route.source_format)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
              {rideWaypoints.length} cues on route
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">{route.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Keep this page open on your phone during the ride to track your position, speed, and the next route cue.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFollowRider((value) => !value)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
            followRider
              ? 'bg-velo-cyan text-white hover:bg-velo-cyan-dark'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ArrowPathIcon className="h-5 w-5" />
          {followRider ? 'Following rider' : 'Map unlocked'}
        </button>
      </div>

      {locationError && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-none" />
            <p className="text-sm">{locationError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Live Map</h2>
                <p className="text-sm text-gray-500">Your current location stays anchored to the route when follow mode is on.</p>
              </div>
              {position && (
                <div className="text-right text-sm text-gray-500">
                  <p>Accuracy</p>
                  <p className="font-semibold text-gray-900">{formatDistanceImperial(position.accuracy || 0)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative h-[52vh] min-h-[420px]">
            {routeBounds && (
              <MapContainer bounds={routeBounds} className="h-full w-full" scrollWheelZoom>
                <FollowRider position={position} followRider={followRider} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Polyline
                  positions={routePoints.map((point) => [point.latitude, point.longitude])}
                  color="#06b6d4"
                  weight={5}
                  opacity={0.8}
                />

                {routePoints[0] && (
                  <CircleMarker
                    center={[routePoints[0].latitude, routePoints[0].longitude]}
                    radius={7}
                    pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.95 }}
                  >
                    <Popup>Start</Popup>
                  </CircleMarker>
                )}

                {routePoints[routePoints.length - 1] && (
                  <CircleMarker
                    center={[routePoints[routePoints.length - 1].latitude, routePoints[routePoints.length - 1].longitude]}
                    radius={7}
                    pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.95 }}
                  >
                    <Popup>Finish</Popup>
                  </CircleMarker>
                )}

                {rideWaypoints.map((waypoint) => (
                  <CircleMarker
                    key={waypoint.id}
                    center={[waypoint.latitude, waypoint.longitude]}
                    radius={waypoint.id === nextWaypoint?.id ? 8 : 5}
                    pathOptions={{
                      color: waypoint.presentation.color,
                      fillColor: waypoint.presentation.color,
                      fillOpacity: waypoint.id === nextWaypoint?.id ? 0.95 : 0.65
                    }}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-semibold text-gray-900">
                          {waypoint.presentation.emoji} {waypoint.label || waypoint.presentation.label}
                        </p>
                        {waypoint.notes && (
                          <p className="mt-1 text-sm text-gray-600">{waypoint.notes}</p>
                        )}
                        {Number.isFinite(toNumber(waypoint.distanceFromStart)) && (
                          <p className="mt-2 text-xs text-gray-500">
                            {metersToMiles(toNumber(waypoint.distanceFromStart)).toFixed(2)} mi from start
                          </p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {position && (
                  <>
                    <Circle
                      center={[position.latitude, position.longitude]}
                      radius={position.accuracy || 10}
                      pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.12 }}
                    />
                    <CircleMarker
                      center={[position.latitude, position.longitude]}
                      radius={9}
                      pathOptions={{ color: '#0f172a', fillColor: '#38bdf8', fillOpacity: 1, weight: 3 }}
                    >
                      <Popup>
                        <div className="min-w-[150px]">
                          <p className="font-semibold text-gray-900">You are here</p>
                          <p className="mt-1 text-sm text-gray-600">
                            Speed: {formatSpeedMph(speedMps)}
                          </p>
                          {nearestPoint && (
                            <p className="mt-1 text-sm text-gray-600">
                              Off route: {formatDistanceImperial(nearestPoint.distanceToRoute)}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  </>
                )}
              </MapContainer>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BoltIcon className="h-4 w-4" />
                Speed
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{formatSpeedMph(speedMps)}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4" />
                Off Route
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {nearestPoint ? formatDistanceImperial(nearestPoint.distanceToRoute) : '--'}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FlagIcon className="h-4 w-4" />
                Progress
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{metersToMiles(progressDistance).toFixed(1)} mi</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FlagIcon className="h-4 w-4" />
                Remaining
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{metersToMiles(remainingDistance).toFixed(1)} mi</p>
            </div>
          </div>

          <div className={`rounded-3xl border p-5 shadow-sm ${nextWaypointPresentation?.bgClass || 'bg-white'} ${nextWaypointPresentation?.borderClass || 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold ${nextWaypointPresentation?.textClass || 'text-gray-600'}`}>
                  Next cue
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {nextWaypoint
                    ? `${nextWaypointPresentation?.emoji || '•'} ${nextWaypoint.label || nextWaypointPresentation?.label}`
                    : 'No more upcoming cues'}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">In</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {distanceToNextWaypoint !== null ? formatDistanceImperial(distanceToNextWaypoint) : '--'}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              {nextWaypoint?.notes || 'You are past the last stored cue on this route.'}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming cues</h3>
            <div className="mt-4 space-y-3">
              {upcomingWaypoints.length === 0 && (
                <p className="text-sm text-gray-500">No additional cues ahead.</p>
              )}

              {upcomingWaypoints.map((waypoint) => (
                <div
                  key={waypoint.id}
                  className={`rounded-2xl border p-4 ${waypoint.presentation.bgClass} ${waypoint.presentation.borderClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm font-semibold ${waypoint.presentation.textClass}`}>
                        {waypoint.presentation.emoji} {waypoint.label || waypoint.presentation.label}
                      </p>
                      {waypoint.notes && (
                        <p className="mt-1 text-sm text-gray-600">{waypoint.notes}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDistanceImperial(Math.max(0, (toNumber(waypoint.distanceFromStart) || 0) - progressDistance))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
