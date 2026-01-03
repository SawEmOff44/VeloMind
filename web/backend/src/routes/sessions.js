import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { invalidateUserCache } from '../services/cache.js';

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
      // Insert one-by-one (simplified - in production, use proper batch insert)
      for (const dp of dataPoints) {
        await query(
          `INSERT INTO session_data_points (
            session_id, timestamp, latitude, longitude, distance, altitude,
            speed, cadence, heart_rate, power, grade,
            wind_speed, wind_direction
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            session.id,
            dp.timestamp,
            dp.latitude,
            dp.longitude,
            dp.distance ?? null,
            dp.altitude,
            dp.speed,
            dp.cadence,
            dp.heartRate,
            dp.power,
            dp.grade,
            dp.windSpeed,
            dp.windDirection
          ]
        );
      }
    }
    
    // Invalidate cache for this user
    invalidateUserCache(req.user.id);
    
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
        // Invalidate cache for this user
    invalidateUserCache(req.user.id);
        res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get session analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    // Load active rider parameters for FTP + physics fallback
    const paramsResult = await query(
      `SELECT ftp, mass, cda, crr, drivetrain_loss
       FROM rider_parameters
       WHERE user_id = $1 AND is_active = true
       LIMIT 1`,
      [req.user.id]
    );
    const riderParams = paramsResult.rows?.[0] || {};
    const ftp = asNumber(riderParams.ftp, 250);
    const mass = asNumber(riderParams.mass, 85.0);
    const cda = asNumber(riderParams.cda, 0.32);
    const crr = asNumber(riderParams.crr, 0.0045);
    const drivetrainLoss = asNumber(riderParams.drivetrain_loss, 0.03);

    const dataPointsResult = await query(
      `SELECT * FROM session_data_points
       WHERE session_id = $1
       ORDER BY timestamp`,
      [req.params.id]
    );
    
    const points = dataPointsResult.rows;
    
    if (points.length === 0) {
      // Return empty analytics instead of 404
      return res.json({
        powerCurve: [],
        elevationProfile: [],
        speedProfile: [],
        cadenceProfile: [],
        heartRateZones: { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 },
        powerZones: { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 }
      });
    }
    
    const powerSeries = buildPowerSeries(points, { mass, cda, crr, drivetrainLoss });

    // Calculate analytics
    const analytics = {
      powerCurve: calculatePowerCurve(powerSeries),
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
      powerZones: calculatePowerZones(powerSeries, ftp)
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

function asNumber(value, fallback = 0) {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return null;
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function inferSampleIntervalSeconds(points) {
  if (!points || points.length < 3) return 1;
  const deltas = [];
  for (let i = 1; i < points.length; i++) {
    const t0 = new Date(points[i - 1].timestamp).getTime();
    const t1 = new Date(points[i].timestamp).getTime();
    const dt = (t1 - t0) / 1000;
    if (Number.isFinite(dt) && dt > 0 && dt < 30) {
      deltas.push(dt);
    }
  }
  return median(deltas) || 1;
}

function estimatePowerWatts({ speedMS, grade, massKG, cda, crr, drivetrainLoss }) {
  // Very lightweight physics model (no wind, constant air density)
  // speedMS from Strava velocity_smooth is m/s.
  if (!Number.isFinite(speedMS) || speedMS <= 0) return 0;
  const g = 9.81;
  const rho = 1.225;
  const slope = Number.isFinite(grade) ? grade : 0;
  const angle = Math.atan(slope);

  const pRoll = crr * massKG * g * speedMS * Math.cos(angle);
  const pGrav = massKG * g * slope * speedMS;
  const pAero = 0.5 * rho * cda * Math.pow(speedMS, 3);

  const mechanical = Math.max(0, pRoll + pGrav + pAero);
  const loss = Number.isFinite(drivetrainLoss) ? drivetrainLoss : 0;
  const total = mechanical / Math.max(0.01, (1 - loss));
  return Math.max(0, total);
}

function buildPowerSeries(points, { mass, cda, crr, drivetrainLoss }) {
  const massKG = asNumber(mass, 85);
  const series = [];
  for (const p of points) {
    const powerRaw = asNumber(p.power, 0);
    const power = powerRaw > 0
      ? powerRaw
      : estimatePowerWatts({
          speedMS: asNumber(p.speed, 0),
          grade: asNumber(p.grade, 0),
          massKG,
          cda: asNumber(cda, 0.32),
          crr: asNumber(crr, 0.0045),
          drivetrainLoss: asNumber(drivetrainLoss, 0.03)
        });

    series.push({
      timestamp: p.timestamp,
      power
    });
  }
  return series;
}

// Helper: Calculate power curve (best power for durations)
function calculatePowerCurve(powerSeries) {
  const durations = [5, 10, 20, 30, 60, 120, 300, 600, 1200, 1800, 3600]; // seconds
  if (!powerSeries || powerSeries.length === 0) return [];

  const sampleInterval = inferSampleIntervalSeconds(powerSeries);
  const powers = powerSeries.map(p => asNumber(p.power, 0));
  const curve = [];

  for (const durationSec of durations) {
    const windowSize = Math.max(1, Math.ceil(durationSec / sampleInterval));
    if (powers.length < windowSize) {
      curve.push({ duration: durationSec, power: 0 });
      continue;
    }

    // Sliding window sum for max average
    let sum = 0;
    for (let i = 0; i < windowSize; i++) sum += powers[i];
    let maxAvg = sum / windowSize;

    for (let i = windowSize; i < powers.length; i++) {
      sum += powers[i] - powers[i - windowSize];
      const avg = sum / windowSize;
      if (avg > maxAvg) maxAvg = avg;
    }

    curve.push({ duration: durationSec, power: Math.round(maxAvg) });
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
function calculatePowerZones(powerSeries, ftp) {
  const zones = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 };
  if (!powerSeries || powerSeries.length === 0) return zones;
  const ftpValue = asNumber(ftp, 250);
  if (!Number.isFinite(ftpValue) || ftpValue <= 0) return zones;

  const fallbackDt = inferSampleIntervalSeconds(powerSeries);

  for (let i = 0; i < powerSeries.length; i++) {
    const power = asNumber(powerSeries[i].power, 0);
    if (!Number.isFinite(power) || power <= 0) continue;

    let dt = fallbackDt;
    if (i < powerSeries.length - 1) {
      const t0 = new Date(powerSeries[i].timestamp).getTime();
      const t1 = new Date(powerSeries[i + 1].timestamp).getTime();
      const d = (t1 - t0) / 1000;
      if (Number.isFinite(d) && d > 0 && d < 30) dt = d;
    }

    if (power < ftpValue * 0.55) zones.z1 += dt;
    else if (power < ftpValue * 0.75) zones.z2 += dt;
    else if (power < ftpValue * 0.90) zones.z3 += dt;
    else if (power < ftpValue * 1.05) zones.z4 += dt;
    else zones.z5 += dt;
  }

  // Keep output stable for charts
  zones.z1 = Math.round(zones.z1);
  zones.z2 = Math.round(zones.z2);
  zones.z3 = Math.round(zones.z3);
  zones.z4 = Math.round(zones.z4);
  zones.z5 = Math.round(zones.z5);

  return zones;
}

export default router;
