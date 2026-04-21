import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'
import { parseFIT, parseGPX, findNearestDistanceFromPoints } from './gpx.js'

const router = express.Router()

async function loadRoutePoints(routeId, userId) {
  const result = await pool.query(
    'SELECT gpx_data FROM routes WHERE id = $1 AND user_id = $2',
    [routeId, userId]
  )

  if (result.rows.length === 0 || !result.rows[0].gpx_data) {
    return []
  }

  const parsed = await parseGPX(result.rows[0].gpx_data)
  return parsed.points || []
}

function toNumber(value) {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function resolveWaypointDistance(waypoint, routePoints) {
  const explicitDistance = toNumber(waypoint.distance_from_start ?? waypoint.distanceFromStart)
  if (explicitDistance !== null) return explicitDistance

  const latitude = toNumber(waypoint.latitude)
  const longitude = toNumber(waypoint.longitude)
  if (latitude === null || longitude === null || routePoints.length === 0) {
    return null
  }

  return findNearestDistanceFromPoints(routePoints, latitude, longitude)
}

async function refreshWaypointCount(routeId, userId) {
  await pool.query(
    `UPDATE routes
     SET waypoint_count = (
       SELECT COUNT(*)
       FROM route_waypoints
       WHERE route_id = $1 AND user_id = $2
     )
     WHERE id = $1 AND user_id = $2`,
    [routeId, userId]
  )
}

async function insertWaypointList(routeId, userId, waypointList, routePoints) {
  const savedWaypoints = []

  for (const waypoint of waypointList.slice(0, 500)) {
    const result = await pool.query(
      `INSERT INTO route_waypoints
       (route_id, user_id, latitude, longitude, type, label, notes, distance_from_start, alert_distance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        routeId,
        userId,
        waypoint.latitude,
        waypoint.longitude,
        waypoint.type || 'alert',
        waypoint.label,
        waypoint.notes,
        resolveWaypointDistance(waypoint, routePoints),
        waypoint.alert_distance || waypoint.alertDistance || 1000
      ]
    )

    savedWaypoints.push(result.rows[0])
  }

  await refreshWaypointCount(routeId, userId)
  return savedWaypoints
}

async function backfillFitWaypoints(routeId, userId, routePoints) {
  const routeResult = await pool.query(
    `SELECT COALESCE(source_format, 'gpx') AS source_format, original_file_data
     FROM routes
     WHERE id = $1 AND user_id = $2`,
    [routeId, userId]
  )

  if (routeResult.rows.length === 0) {
    return []
  }

  const route = routeResult.rows[0]
  if (route.source_format !== 'fit' || !route.original_file_data) {
    return []
  }

  try {
    const parsed = parseFIT(route.original_file_data)
    if (!Array.isArray(parsed.waypoints) || parsed.waypoints.length === 0) {
      return []
    }

    return insertWaypointList(routeId, userId, parsed.waypoints, routePoints)
  } catch (error) {
    console.warn('Failed to backfill FIT waypoints:', error?.message || error)
    return []
  }
}

// Get all waypoints for a route
router.get('/route/:routeId', authenticateToken, async (req, res) => {
  try {
    const { routeId } = req.params
    const userId = req.user.id

    // Verify user owns the route or it's public
    const routeCheck = await pool.query(
      'SELECT user_id FROM routes WHERE id = $1',
      [routeId]
    )

    if (routeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' })
    }

    const routePoints = await loadRoutePoints(routeId, userId)

    // Get waypoints
    let result = await pool.query(
      `SELECT * FROM route_waypoints 
       WHERE route_id = $1 AND user_id = $2
       ORDER BY distance_from_start ASC`,
      [routeId, userId]
    )

    if (result.rows.length === 0) {
      const backfilledWaypoints = await backfillFitWaypoints(routeId, userId, routePoints)
      if (backfilledWaypoints.length > 0) {
        result = { rows: backfilledWaypoints }
      }
    }

    res.json({ waypoints: result.rows })
  } catch (error) {
    if (error?.code === '42P01') {
      console.warn('route_waypoints table missing; returning empty waypoints list')
      return res.json({ waypoints: [] })
    }
    console.error('Error fetching waypoints:', error)
    res.status(500).json({ error: 'Failed to fetch waypoints' })
  }
})

// Create waypoint
router.post('/route/:routeId', authenticateToken, async (req, res) => {
  try {
    const { routeId } = req.params
    const userId = req.user.id
    const { latitude, longitude, type, label, notes, distance_from_start, alert_distance } = req.body

    // Verify user owns the route
    const routeCheck = await pool.query(
      'SELECT user_id FROM routes WHERE id = $1',
      [routeId]
    )

    if (routeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' })
    }

    if (routeCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const routePoints = await loadRoutePoints(routeId, userId)
    const resolvedDistanceFromStart = resolveWaypointDistance(
      { latitude, longitude, distance_from_start },
      routePoints
    )

    const savedWaypoints = await insertWaypointList(
      routeId,
      userId,
      [{
        latitude,
        longitude,
        type,
        label,
        notes,
        distance_from_start: resolvedDistanceFromStart,
        alert_distance
      }],
      routePoints
    )

    res.status(201).json({ waypoint: savedWaypoints[0] })
  } catch (error) {
    console.error('Error creating waypoint:', error)
    res.status(500).json({ error: 'Failed to create waypoint' })
  }
})

// Update waypoint
router.put('/:waypointId', authenticateToken, async (req, res) => {
  try {
    const { waypointId } = req.params
    const userId = req.user.id
    const { latitude, longitude, type, label, notes, distance_from_start, alert_distance } = req.body

    // Verify ownership
    const waypointCheck = await pool.query(
      'SELECT user_id, route_id, latitude, longitude FROM route_waypoints WHERE id = $1',
      [waypointId]
    )

    if (waypointCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' })
    }

    if (waypointCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const routePoints = await loadRoutePoints(waypointCheck.rows[0].route_id, userId)
    const resolvedDistanceFromStart = resolveWaypointDistance(
      {
        latitude: latitude ?? waypointCheck.rows[0].latitude,
        longitude: longitude ?? waypointCheck.rows[0].longitude,
        distance_from_start
      },
      routePoints
    )

    const result = await pool.query(
      `UPDATE route_waypoints 
       SET latitude = COALESCE($1, latitude),
           longitude = COALESCE($2, longitude),
           type = COALESCE($3, type),
           label = COALESCE($4, label),
           notes = COALESCE($5, notes),
           distance_from_start = COALESCE($6, distance_from_start),
           alert_distance = COALESCE($7, alert_distance),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [latitude, longitude, type, label, notes, resolvedDistanceFromStart, alert_distance, waypointId]
    )

    res.json({ waypoint: result.rows[0] })
  } catch (error) {
    console.error('Error updating waypoint:', error)
    res.status(500).json({ error: 'Failed to update waypoint' })
  }
})

// Delete waypoint
router.delete('/:waypointId', authenticateToken, async (req, res) => {
  try {
    const { waypointId } = req.params
    const userId = req.user.id

    // Verify ownership
    const waypointCheck = await pool.query(
      'SELECT user_id, route_id FROM route_waypoints WHERE id = $1',
      [waypointId]
    )

    if (waypointCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' })
    }

    if (waypointCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await pool.query('DELETE FROM route_waypoints WHERE id = $1', [waypointId])
    await refreshWaypointCount(waypointCheck.rows[0].route_id, userId)

    res.json({ message: 'Waypoint deleted successfully' })
  } catch (error) {
    console.error('Error deleting waypoint:', error)
    res.status(500).json({ error: 'Failed to delete waypoint' })
  }
})

// Bulk sync waypoints for a route (used by web to sync localStorage)
router.post('/route/:routeId/sync', authenticateToken, async (req, res) => {
  try {
    const { routeId } = req.params
    const userId = req.user.id
    const waypointList = Array.isArray(req.body?.waypoints) ? req.body.waypoints : []

    // Verify route ownership
    const routeCheck = await pool.query(
      'SELECT user_id FROM routes WHERE id = $1',
      [routeId]
    )

    if (routeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' })
    }

    if (routeCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Delete existing waypoints for this route
    await pool.query('DELETE FROM route_waypoints WHERE route_id = $1 AND user_id = $2', [routeId, userId])

    const routePoints = await loadRoutePoints(routeId, userId)

    // Insert new waypoints
    const savedWaypoints = await insertWaypointList(routeId, userId, waypointList, routePoints)

    res.json({ waypoints: savedWaypoints })
  } catch (error) {
    console.error('Error syncing waypoints:', error)
    res.status(500).json({ error: 'Failed to sync waypoints' })
  }
})

export default router
