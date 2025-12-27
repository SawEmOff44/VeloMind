import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import cache, { cacheKeys, cacheTTL } from '../services/cache.js';

const router = express.Router();

// Get overall statistics for user
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query; // days
    
    // Check cache first
    const cacheKey = cacheKeys.analyticsOverview(req.user.id, timeframe);
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    // Get aggregate statistics
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_rides,
        SUM(distance) as total_distance,
        SUM(duration) as total_time,
        SUM(elevation_gain) as total_elevation,
        AVG(average_power) as avg_power,
        MAX(max_power) as peak_power,
        AVG(average_heart_rate) as avg_hr,
        MAX(max_speed) as max_speed
       FROM sessions
       WHERE user_id = $1 AND start_time >= $2`,
      [req.user.id, startDate]
    );
    
    // Get ride frequency by day of week
    const frequencyResult = await query(
      `SELECT 
        EXTRACT(DOW FROM start_time) as day_of_week,
        COUNT(*) as ride_count
       FROM sessions
       WHERE user_id = $1 AND start_time >= $2
       GROUP BY EXTRACT(DOW FROM start_time)
       ORDER BY day_of_week`,
      [req.user.id, startDate]
    );
    
    // Get power zone distribution
    const powerZonesResult = await query(
      `SELECT 
        CASE 
          WHEN average_power < (SELECT ftp * 0.55 FROM parameters WHERE user_id = $1 AND is_active = true LIMIT 1) THEN 'Recovery'
          WHEN average_power < (SELECT ftp * 0.75 FROM parameters WHERE user_id = $1 AND is_active = true LIMIT 1) THEN 'Endurance'
          WHEN average_power < (SELECT ftp * 0.90 FROM parameters WHERE user_id = $1 AND is_active = true LIMIT 1) THEN 'Tempo'
          WHEN average_power < (SELECT ftp * 1.05 FROM parameters WHERE user_id = $1 AND is_active = true LIMIT 1) THEN 'Threshold'
          WHEN average_power < (SELECT ftp * 1.20 FROM parameters WHERE user_id = $1 AND is_active = true LIMIT 1) THEN 'VO2Max'
          ELSE 'Anaerobic'
        END as zone,
        COUNT(*) as ride_count,
        SUM(duration) as total_duration
       FROM sessions
       WHERE user_id = $1 AND start_time >= $2 AND average_power IS NOT NULL
       GROUP BY zone
       ORDER BY 
         CASE zone
           WHEN 'Recovery' THEN 1
           WHEN 'Endurance' THEN 2
           WHEN 'Tempo' THEN 3
           WHEN 'Threshold' THEN 4
           WHEN 'VO2Max' THEN 5
           WHEN 'Anaerobic' THEN 6
         END`,
      [req.user.id, startDate]
    );
    
    const result = {
      stats: statsResult.rows[0],
      frequency: frequencyResult.rows,
      powerZones: powerZonesResult.rows,
      timeframe: parseInt(timeframe)
    };
    
    // Cache the result
    cache.set(cacheKey, result, cacheTTL.MEDIUM);
    
    res.json(result);
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get performance trends over time
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { metric = 'power', timeframe = '90' } = req.query;
    
    // Check cache first
    const cacheKey = cacheKeys.analyticsTrends(req.user.id, metric, timeframe);
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    let metricColumn = 'average_power';
    switch(metric) {
      case 'speed':
        metricColumn = 'distance / NULLIF(duration, 0) * 3600';
        break;
      case 'hr':
        metricColumn = 'average_heart_rate';
        break;
      case 'cadence':
        metricColumn = 'average_cadence';
        break;
      default:
        metricColumn = 'average_power';
    }
    
    const trendsResult = await query(
      `SELECT 
        DATE(start_time) as date,
        AVG(${metricColumn}) as avg_value,
        MAX(${metricColumn}) as max_value,
        COUNT(*) as ride_count
       FROM sessions
       WHERE user_id = $1 AND start_time >= $2 AND ${metricColumn} IS NOT NULL
       GROUP BY DATE(start_time)
       ORDER BY date`,
      [req.user.id, startDate]
    );
    
    const result = {
      metric,
      data: trendsResult.rows,
      timeframe: parseInt(timeframe)
    };
    
    // Cache the result
    cache.set(cacheKey, result, cacheTTL.MEDIUM);
    
    res.json(result);
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get personal records
router.get('/records', authenticateToken, async (req, res) => {
  try {
    // Check cache first
    const cacheKey = cacheKeys.analyticsRecords(req.user.id);
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    // Longest ride
    const longestRide = await query(
      `SELECT id, name, distance, start_time
       FROM sessions
       WHERE user_id = $1 AND distance IS NOT NULL
       ORDER BY distance DESC
       LIMIT 1`,
      [req.user.id]
    );
    
    // Highest elevation
    const highestElevation = await query(
      `SELECT id, name, elevation_gain, start_time
       FROM sessions
       WHERE user_id = $1 AND elevation_gain IS NOT NULL
       ORDER BY elevation_gain DESC
       LIMIT 1`,
      [req.user.id]
    );
    
    // Highest average power
    const highestPower = await query(
      `SELECT id, name, average_power, start_time
       FROM sessions
       WHERE user_id = $1 AND average_power IS NOT NULL
       ORDER BY average_power DESC
       LIMIT 1`,
      [req.user.id]
    );
    
    // Fastest average speed
    const fastestSpeed = await query(
      `SELECT id, name, distance, duration, start_time,
              (distance / NULLIF(duration, 0)) * 3600 as avg_speed
       FROM sessions
       WHERE user_id = $1 AND distance IS NOT NULL AND duration > 0
       ORDER BY avg_speed DESC
       LIMIT 1`,
      [req.user.id]
    );
    
    // Longest duration
    const longestDuration = await query(
      `SELECT id, name, duration, start_time
       FROM sessions
       WHERE user_id = $1 AND duration IS NOT NULL
       ORDER BY duration DESC
       LIMIT 1`,
      [req.user.id]
    );
    
    const result = {
      longestRide: longestRide.rows[0] || null,
      highestElevation: highestElevation.rows[0] || null,
      highestPower: highestPower.rows[0] || null,
      fastestSpeed: fastestSpeed.rows[0] || null,
      longestDuration: longestDuration.rows[0] || null
    };
    
    // Cache the result
    cache.set(cacheKey, result, cacheTTL.LONG);
    
    res.json(result);
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get monthly summary for calendar heatmap
router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const calendarResult = await query(
      `SELECT 
        DATE(start_time) as date,
        COUNT(*) as ride_count,
        SUM(distance) as total_distance,
        SUM(duration) as total_duration
       FROM sessions
       WHERE user_id = $1 AND EXTRACT(YEAR FROM start_time) = $2
       GROUP BY DATE(start_time)
       ORDER BY date`,
      [req.user.id, year]
    );
    
    res.json({
      year: parseInt(year),
      data: calendarResult.rows
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get ride comparison (current vs previous rides)
router.get('/comparison/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get current session
    const currentSession = await query(
      `SELECT * FROM sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.user.id]
    );
    
    if (currentSession.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = currentSession.rows[0];
    
    // Get similar rides (same route or similar distance)
    const similarRides = await query(
      `SELECT 
        id, name, start_time, distance, duration, average_power, elevation_gain,
        ABS(distance - $1) as distance_diff
       FROM sessions
       WHERE user_id = $2 
         AND id != $3
         AND (route_id = $4 OR ABS(distance - $1) < 5000)
       ORDER BY distance_diff
       LIMIT 5`,
      [session.distance, req.user.id, sessionId, session.route_id]
    );
    
    // Calculate averages from similar rides
    const avgStats = await query(
      `SELECT 
        AVG(distance) as avg_distance,
        AVG(duration) as avg_duration,
        AVG(average_power) as avg_power,
        AVG(elevation_gain) as avg_elevation
       FROM sessions
       WHERE user_id = $1 
         AND id != $2
         AND (route_id = $3 OR ABS(distance - $4) < 5000)`,
      [req.user.id, sessionId, session.route_id, session.distance]
    );
    
    res.json({
      current: session,
      similar: similarRides.rows,
      averages: avgStats.rows[0]
    });
  } catch (error) {
    console.error('Get comparison error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
