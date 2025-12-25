import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all sessions for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await query(
      `SELECT s.*, r.name as route_name
       FROM sessions s
       LEFT JOIN routes r ON s.route_id = r.id
       WHERE s.user_id = $1
       ORDER BY s.start_time DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    
    res.json({ sessions: result.rows });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session by ID with data points
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Get session
    const sessionResult = await query(
      `SELECT s.*, r.name as route_name
       FROM sessions s
       LEFT JOIN routes r ON s.route_id = r.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    
    // Get data points
    const dataPointsResult = await query(
      `SELECT * FROM session_data_points
       WHERE session_id = $1
       ORDER BY timestamp`,
      [req.params.id]
    );
    
    res.json({
      ...session,
      dataPoints: dataPointsResult.rows
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      routeId,
      name,
      startTime,
      endTime,
      duration,
      distance,
      averagePower,
      normalizedPower,
      averageSpeed,
      averageCadence,
      averageHeartRate,
      totalElevationGain,
      tss,
      intensityFactor,
      dataPoints
    } = req.body;
    
    // Insert session
    const sessionResult = await query(
      `INSERT INTO sessions (
        user_id, route_id, name, start_time, end_time, duration,
        distance, average_power, normalized_power, average_speed,
        average_cadence, average_heart_rate, total_elevation_gain,
        tss, intensity_factor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        req.user.id, routeId, name, startTime, endTime, duration,
        distance, averagePower, normalizedPower, averageSpeed,
        averageCadence, averageHeartRate, totalElevationGain,
        tss, intensityFactor
      ]
    );
    
    const session = sessionResult.rows[0];
    
    // Insert data points if provided
    if (dataPoints && dataPoints.length > 0) {
      const values = dataPoints.map((dp, i) => {
        const params = [
          session.id,
          dp.timestamp,
          dp.latitude,
          dp.longitude,
          dp.altitude,
          dp.speed,
          dp.cadence,
          dp.heartRate,
          dp.power,
          dp.grade,
          dp.windSpeed,
          dp.windDirection
        ];
        const placeholders = params.map((_, idx) => `$${idx + 1 + i * 12}`).join(',');
        return { params, placeholders };
      });
      
      // Batch insert (simplified - in production, use proper batch insert)
      for (const dp of dataPoints) {
        await query(
          `INSERT INTO session_data_points (
            session_id, timestamp, latitude, longitude, altitude,
            speed, cadence, heart_rate, power, grade,
            wind_speed, wind_direction
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            session.id, dp.timestamp, dp.latitude, dp.longitude, dp.altitude,
            dp.speed, dp.cadence, dp.heartRate, dp.power, dp.grade,
            dp.windSpeed, dp.windDirection
          ]
        );
      }
    }
    
    res.status(201).json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete session
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const dataPointsResult = await query(
      `SELECT * FROM session_data_points
       WHERE session_id = $1
       ORDER BY timestamp`,
      [req.params.id]
    );
    
    const points = dataPointsResult.rows;
    
    if (points.length === 0) {
      return res.status(404).json({ error: 'No data points found' });
    }
    
    // Calculate analytics
    const analytics = {
      powerCurve: calculatePowerCurve(points),
      elevationProfile: points.map(p => ({ 
        distance: p.distance,
        altitude: parseFloat(p.altitude),
        grade: parseFloat(p.grade)
      })),
      speedProfile: points.map(p => ({
        timestamp: p.timestamp,
        speed: parseFloat(p.speed)
      })),
      cadenceProfile: points.map(p => ({
        timestamp: p.timestamp,
        cadence: parseFloat(p.cadence)
      })),
      heartRateZones: calculateHeartRateZones(points),
      powerZones: calculatePowerZones(points)
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper: Calculate power curve (best power for durations)
function calculatePowerCurve(points) {
  const durations = [5, 10, 20, 30, 60, 120, 300, 600, 1200, 1800, 3600]; // seconds
  const curve = [];
  
  for (const duration of durations) {
    let maxAvg = 0;
    
    for (let i = 0; i <= points.length - duration; i++) {
      const slice = points.slice(i, i + duration);
      const avg = slice.reduce((sum, p) => sum + parseFloat(p.power || 0), 0) / slice.length;
      maxAvg = Math.max(maxAvg, avg);
    }
    
    curve.push({ duration, power: Math.round(maxAvg) });
  }
  
  return curve;
}

// Helper: Calculate HR zones
function calculateHeartRateZones(points) {
  const zones = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };
  
  for (const point of points) {
    const hr = parseInt(point.heart_rate);
    if (!hr) continue;
    
    if (hr < 140) zones.z1++;
    else if (hr < 155) zones.z2++;
    else if (hr < 165) zones.z3++;
    else if (hr < 175) zones.z4++;
    else zones.z5++;
  }
  
  return zones;
}

// Helper: Calculate power zones
function calculatePowerZones(points) {
  const zones = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };
  const ftp = 250; // TODO: Get from user parameters
  
  for (const point of points) {
    const power = parseFloat(point.power);
    if (!power) continue;
    
    if (power < ftp * 0.55) zones.z1++;
    else if (power < ftp * 0.75) zones.z2++;
    else if (power < ftp * 0.90) zones.z3++;
    else if (power < ftp * 1.05) zones.z4++;
    else zones.z5++;
  }
  
  return zones;
}

export default router;
