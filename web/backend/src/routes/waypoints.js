import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

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

    // Get waypoints
    const result = await pool.query(
      `SELECT * FROM route_waypoints 
       WHERE route_id = $1 AND user_id = $2
       ORDER BY distance_from_start ASC`,
      [routeId, userId]
    )

    res.json({ waypoints: result.rows })
  } catch (error) {
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

    const result = await pool.query(
      `INSERT INTO route_waypoints 
       (route_id, user_id, latitude, longitude, type, label, notes, distance_from_start, alert_distance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [routeId, userId, latitude, longitude, type || 'alert', label, notes, distance_from_start, alert_distance || 1000]
    )

    res.status(201).json({ waypoint: result.rows[0] })
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
      'SELECT user_id FROM route_waypoints WHERE id = $1',
      [waypointId]
    )

    if (waypointCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' })
    }

    if (waypointCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

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
      [latitude, longitude, type, label, notes, distance_from_start, alert_distance, waypointId]
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
      'SELECT user_id FROM route_waypoints WHERE id = $1',
      [waypointId]
    )

    if (waypointCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Waypoint not found' })
    }

    if (waypointCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await pool.query('DELETE FROM route_waypoints WHERE id = $1', [waypointId])

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
    const { waypoints } = req.body

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

    // Insert new waypoints
    const insertPromises = waypoints.map(wp => 
      pool.query(
        `INSERT INTO route_waypoints 
         (route_id, user_id, latitude, longitude, type, label, notes, distance_from_start, alert_distance)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [routeId, userId, wp.latitude, wp.longitude, wp.type || 'alert', wp.label, wp.notes, wp.distance_from_start, wp.alert_distance || 1000]
      )
    )

    const results = await Promise.all(insertPromises)
    const savedWaypoints = results.map(r => r.rows[0])

    res.json({ waypoints: savedWaypoints })
  } catch (error) {
    console.error('Error syncing waypoints:', error)
    res.status(500).json({ error: 'Failed to sync waypoints' })
  }
})

export default router
