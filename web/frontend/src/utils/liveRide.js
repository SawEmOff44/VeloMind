import { detectClimbs } from './climbAnalysis'

const EARTH_RADIUS_METERS = 6371e3

export function toNumber(value) {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * Math.PI / 180
  const phi2 = lat2 * Math.PI / 180
  const deltaPhi = (lat2 - lat1) * Math.PI / 180
  const deltaLambda = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}

export function metersToMiles(meters) {
  return meters / 1609.34
}

export function metersToFeet(meters) {
  return meters * 3.28084
}

export function formatDistanceImperial(meters) {
  if (!Number.isFinite(meters)) return '--'
  if (meters <= 0) return '0 ft'
  if (meters >= 1609.34) return `${metersToMiles(meters).toFixed(meters >= 16093.4 ? 0 : 1)} mi`
  return `${Math.max(10, Math.round(metersToFeet(meters) / 10) * 10)} ft`
}

export function formatSpeedMph(speedMps) {
  if (!Number.isFinite(speedMps)) return '--'
  return `${(speedMps * 2.23694).toFixed(1)} mph`
}

export function getRouteSourceLabel(sourceFormat = 'gpx') {
  switch (String(sourceFormat || 'gpx').toLowerCase()) {
    case 'fit':
      return 'FIT Course'
    case 'tcx':
      return 'TCX Course'
    case 'kml':
      return 'KML Route'
    default:
      return 'GPX Route'
  }
}

export function getWaypointPresentation(type = 'alert') {
  switch (type) {
    case 'turn':
      return {
        emoji: '↪',
        label: 'Turn',
        color: '#2563eb',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
        textClass: 'text-blue-700'
      }
    case 'water':
      return {
        emoji: '💧',
        label: 'Water Stop',
        color: '#0891b2',
        bgClass: 'bg-cyan-50',
        borderClass: 'border-cyan-200',
        textClass: 'text-cyan-700'
      }
    case 'food':
      return {
        emoji: '🍎',
        label: 'Nutrition',
        color: '#16a34a',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-200',
        textClass: 'text-emerald-700'
      }
    case 'danger':
      return {
        emoji: '⚠️',
        label: 'Danger',
        color: '#dc2626',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        textClass: 'text-red-700'
      }
    case 'rest':
      return {
        emoji: '🛑',
        label: 'Rest Stop',
        color: '#9333ea',
        bgClass: 'bg-violet-50',
        borderClass: 'border-violet-200',
        textClass: 'text-violet-700'
      }
    case 'photo':
      return {
        emoji: '📷',
        label: 'Photo Spot',
        color: '#ea580c',
        bgClass: 'bg-orange-50',
        borderClass: 'border-orange-200',
        textClass: 'text-orange-700'
      }
    case 'steep':
      return {
        emoji: '⛰️',
        label: 'Climb',
        color: '#7c3aed',
        bgClass: 'bg-fuchsia-50',
        borderClass: 'border-fuchsia-200',
        textClass: 'text-fuchsia-700'
      }
    default:
      return {
        emoji: '•',
        label: 'Alert',
        color: '#475569',
        bgClass: 'bg-slate-50',
        borderClass: 'border-slate-200',
        textClass: 'text-slate-700'
      }
  }
}

function inferWaypointTypeFromText(label = '', notes = '') {
  const text = `${label || ''} ${notes || ''}`.trim().toLowerCase()
  if (!text) return null

  if (/\b(water|hydration|refill|bottle|drink|sports drink)\b/.test(text)) return 'water'
  if (/\b(food|feed|nutrition|gel|snack)\b/.test(text)) return 'food'
  if (/\b(rest|aid station|rest area|checkpoint|toilet|shower|service|meeting spot|shelter|campsite|store)\b/.test(text)) return 'rest'
  if (/\b(danger|hazard|alert|obstacle|crossing|sharp curve|tunnel|bridge|traffic)\b/.test(text)) return 'danger'
  if (/\b(climb|summit|incline|ascent|hill|grade|hc|cat\.?\s*[1-4]|category\s*[1-4])\b/.test(text)) return 'steep'
  if (/\b(turn|fork|straight|u-turn|bear left|bear right|slight left|slight right|sharp left|sharp right)\b/.test(text)) return 'turn'
  if (/\b(overlook|viewpoint|scenic|photo)\b/.test(text)) return 'photo'

  return null
}

function resolveWaypointType(waypoint) {
  if (waypoint?.type && waypoint.type !== 'alert') {
    return waypoint.type
  }

  return inferWaypointTypeFromText(waypoint?.label, waypoint?.notes) || waypoint?.type || 'alert'
}

export function resolveDistanceFromRoutePoints(routePoints = [], latitude, longitude) {
  if (!routePoints.length || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  let nearestDistance = null
  let nearestOffset = Number.POSITIVE_INFINITY

  for (const point of routePoints) {
    const offset = haversineDistanceMeters(point.latitude, point.longitude, latitude, longitude)
    if (offset < nearestOffset) {
      nearestOffset = offset
      nearestDistance = toNumber(point.distance)
    }
  }

  return nearestDistance
}

function buildSyntheticClimbWaypoints(routePoints = []) {
  if (!routePoints.length) return []

  return detectClimbs(routePoints).map((climb, index) => {
    const distanceFromStart = toNumber(routePoints[climb.startIndex]?.distance ?? climb.start?.distance)
    const { title, detail } = describeClimbCue(climb)

    return {
      id: `synthetic-climb-${index}`,
      latitude: routePoints[climb.startIndex]?.latitude,
      longitude: routePoints[climb.startIndex]?.longitude,
      type: 'steep',
      label: title,
      notes: detail,
      distance_from_start: distanceFromStart,
      distanceFromStart,
      isSynthetic: true
    }
  })
}

function describeClimbCue(climb) {
  const distanceMiles = metersToMiles(climb.distance)
  const elevationFeet = Math.round(metersToFeet(climb.elevationGain))
  const avgGrade = climb.avgGrade
  const isShort = distanceMiles < 0.25
  const isLong = distanceMiles >= 0.8
  const isSteep = avgGrade >= 6.5

  let effort = 'easy'
  if (
    climb.category === 'HC' ||
    climb.category === '1' ||
    elevationFeet >= 900 ||
    (isLong && avgGrade >= 6)
  ) {
    effort = 'major'
  } else if (
    climb.category === '2' ||
    elevationFeet >= 350 ||
    avgGrade >= 7
  ) {
    effort = 'hard'
  } else if (
    climb.category === '3' ||
    elevationFeet >= 120 ||
    avgGrade >= 5
  ) {
    effort = 'moderate'
  }

  let title = 'Easy climb ahead'
  if (effort === 'major') {
    title = 'Major climb ahead'
  } else if (effort === 'hard') {
    title = isSteep ? 'Steep climb ahead' : 'Hard climb ahead'
  } else if (effort === 'moderate') {
    title = isShort ? 'Punchy climb ahead' : 'Moderate climb ahead'
  } else if (isShort) {
    title = 'Short easy rise ahead'
  }

  let lead = 'Gentle rise'
  if (effort === 'major') {
    lead = 'Long effort'
  } else if (effort === 'hard') {
    lead = 'Steady climb'
  } else if (effort === 'moderate') {
    lead = isShort ? 'Short punchy effort' : 'Rolling climb'
  }

  const detail = `${lead}: ${distanceMiles.toFixed(2)} mi • ${elevationFeet} ft gain • ${avgGrade.toFixed(1)}% avg`

  return { title, detail }
}

export function buildRouteWaypoints(waypoints = [], routePoints = [], options = {}) {
  const includeClimbs = options.includeClimbs ?? false

  const normalizedWaypoints = waypoints
    .map((waypoint, index) => {
      const latitude = toNumber(waypoint.latitude)
      const longitude = toNumber(waypoint.longitude)
      const distanceFromStart = toNumber(waypoint.distance_from_start ?? waypoint.distanceFromStart)
        ?? resolveDistanceFromRoutePoints(routePoints, latitude, longitude)
      const resolvedType = resolveWaypointType(waypoint)

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null
      }

      return {
        ...waypoint,
        id: waypoint.id ?? `waypoint-${index}`,
        type: resolvedType,
        latitude,
        longitude,
        distance_from_start: distanceFromStart,
        distanceFromStart,
        presentation: getWaypointPresentation(resolvedType)
      }
    })
    .filter(Boolean)

  const syntheticWaypoints = includeClimbs
    ? buildSyntheticClimbWaypoints(routePoints).map((waypoint) => ({
        ...waypoint,
        presentation: getWaypointPresentation(waypoint.type)
      }))
    : []

  return [...normalizedWaypoints, ...syntheticWaypoints].sort((a, b) => {
    const left = toNumber(a.distanceFromStart)
    const right = toNumber(b.distanceFromStart)

    if (left === null && right === null) return 0
    if (left === null) return 1
    if (right === null) return -1
    return left - right
  })
}

export function findNearestRoutePoint(routePoints = [], latitude, longitude) {
  if (!routePoints.length || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  let bestPoint = null
  let bestIndex = -1
  let bestOffset = Number.POSITIVE_INFINITY

  routePoints.forEach((point, index) => {
    const offset = haversineDistanceMeters(point.latitude, point.longitude, latitude, longitude)
    if (offset < bestOffset) {
      bestOffset = offset
      bestIndex = index
      bestPoint = point
    }
  })

  if (!bestPoint) return null

  return {
    index: bestIndex,
    point: bestPoint,
    distanceToRoute: bestOffset,
    routeDistance: toNumber(bestPoint.distance) ?? 0
  }
}

export function deriveLiveSpeedMps(currentPosition, previousPosition) {
  if (!currentPosition) return null

  if (Number.isFinite(currentPosition.speed) && currentPosition.speed >= 0) {
    return currentPosition.speed
  }

  if (!previousPosition) return null

  const elapsedMs = currentPosition.timestamp - previousPosition.timestamp
  if (elapsedMs <= 0) return null

  const distanceMeters = haversineDistanceMeters(
    previousPosition.latitude,
    previousPosition.longitude,
    currentPosition.latitude,
    currentPosition.longitude
  )

  // Ignore unrealistic GPS jumps.
  if (distanceMeters > 250) return null

  return distanceMeters / (elapsedMs / 1000)
}

export function getNextWaypoint(waypoints = [], progressDistance = 0, passedBuffer = 25) {
  return waypoints.find((waypoint) => {
    const distanceFromStart = toNumber(waypoint.distanceFromStart ?? waypoint.distance_from_start)
    return distanceFromStart !== null && distanceFromStart >= progressDistance + passedBuffer
  }) || null
}
