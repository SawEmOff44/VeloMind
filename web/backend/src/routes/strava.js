import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to fetch and store Strava activity streams
async function fetchAndStoreStreams(sessionId, stravaActivityId, accessToken, startTime) {
  const streamTypes = 'time,latlng,distance,altitude,velocity_smooth,heartrate,cadence,watts,grade_smooth';
  const streamsResponse = await fetch(
    `https://www.strava.com/api/v3/activities/${stravaActivityId}/streams?keys=${streamTypes}&key_by_type=true`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );
  
  if (!streamsResponse.ok) {
    throw new Error('Failed to fetch Strava streams');
  }
  
  const streams = await streamsResponse.json();
  
  // Check if streams exist
  if (!streams.time || streams.time.data.length === 0) {
    throw new Error('No stream data available');
  }
  
  // Delete existing data points
  await query('DELETE FROM session_data_points WHERE session_id = $1', [sessionId]);
  
  // Insert data points (batch insert for better performance)
  const dataLength = streams.time.data.length;
  const values = [];
  const params = [];
  let paramCount = 1;
  
  for (let i = 0; i < dataLength; i++) {
    const timestamp = new Date(startTime.getTime() + streams.time.data[i] * 1000);
    const lat = streams.latlng?.data[i]?.[0] || null;
    const lng = streams.latlng?.data[i]?.[1] || null;
    const distance = streams.distance?.data[i] || null;
    const altitude = streams.altitude?.data[i] || null;
    const speed = streams.velocity_smooth?.data[i] || null;
    const heartRate = streams.heartrate?.data[i] || null;
    const cadence = streams.cadence?.data[i] || null;
    const power = streams.watts?.data[i] || null;
    const grade = streams.grade_smooth?.data[i] || null;
    
    values.push(`($${paramCount}, $${paramCount+1}, $${paramCount+2}, $${paramCount+3}, $${paramCount+4}, $${paramCount+5}, $${paramCount+6}, $${paramCount+7}, $${paramCount+8}, $${paramCount+9}, $${paramCount+10})`);
    params.push(sessionId, timestamp, lat, lng, distance, altitude, speed, heartRate, cadence, power, grade);
    paramCount += 11;
  }
  
  // Batch insert all data points
  if (values.length > 0) {
    await query(
      `INSERT INTO session_data_points (
        session_id, timestamp, latitude, longitude, distance, altitude, 
        speed, heart_rate, cadence, power, grade
      ) VALUES ${values.join(', ')}`,
      params
    );
  }
  
  return dataLength;
}

// Strava OAuth callback handler
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      return res.status(400).json({ error: 'Strava authentication failed' });
    }
    
    // Update user with Strava tokens
    // Note: This requires the user to be logged in (state should contain user ID)
    const userId = state; // In production, decode from secure state parameter
    
    // First, clear this strava_id from any other users (in case of re-authorization)
    await query(
      `UPDATE users SET strava_id = NULL, strava_access_token = NULL, strava_refresh_token = NULL, strava_token_expires_at = NULL 
       WHERE strava_id = $1 AND id != $2`,
      [tokenData.athlete.id, userId]
    );
    
    // Now update the current user with Strava tokens
    await query(
      `UPDATE users
       SET strava_id = $1, strava_access_token = $2, strava_refresh_token = $3, strava_token_expires_at = $4
       WHERE id = $5`,
      [
        tokenData.athlete.id,
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_at,
        userId
      ]
    );
    
    res.redirect(`${process.env.CORS_ORIGIN}/settings?strava=connected`);
  } catch (error) {
    console.error('Strava callback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Strava activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      'SELECT strava_access_token, strava_refresh_token, strava_token_expires_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0 || !userResult.rows[0].strava_access_token) {
      return res.status(401).json({ error: 'Strava not connected' });
    }
    
    const user = userResult.rows[0];
    
    // Check if token needs refresh
    const now = Math.floor(Date.now() / 1000);
    let accessToken = user.strava_access_token;
    
    if (now >= user.strava_token_expires_at) {
      // Refresh token
      const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          refresh_token: user.strava_refresh_token,
          grant_type: 'refresh_token'
        })
      });
      
      const refreshData = await refreshResponse.json();
      
      if (refreshResponse.ok) {
        accessToken = refreshData.access_token;
        
        await query(
          'UPDATE users SET strava_access_token = $1, strava_token_expires_at = $2 WHERE id = $3',
          [refreshData.access_token, refreshData.expires_at, req.user.id]
        );
      }
    }
    
    // Fetch activities
    const activitiesResponse = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=50',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    const activities = await activitiesResponse.json();
    
    res.json({ activities });
  } catch (error) {
    console.error('Get Strava activities error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync Strava activities to sessions
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      'SELECT strava_access_token, strava_refresh_token, strava_token_expires_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0 || !userResult.rows[0].strava_access_token) {
      return res.status(401).json({ error: 'Strava not connected' });
    }
    
    const user = userResult.rows[0];
    
    // Check if token needs refresh
    const now = Math.floor(Date.now() / 1000);
    let accessToken = user.strava_access_token;
    
    if (now >= user.strava_token_expires_at) {
      // Refresh token
      const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          refresh_token: user.strava_refresh_token,
          grant_type: 'refresh_token'
        })
      });
      
      const refreshData = await refreshResponse.json();
      
      if (refreshResponse.ok) {
        accessToken = refreshData.access_token;
        await query(
          'UPDATE users SET strava_access_token = $1, strava_token_expires_at = $2 WHERE id = $3',
          [refreshData.access_token, refreshData.expires_at, req.user.id]
        );
      }
    }
    
    // Fetch recent cycling activities (last 30 days)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const activitiesResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${thirtyDaysAgo}&per_page=50`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    const activities = await activitiesResponse.json();
    
    // Filter for cycling activities only
    const cyclingActivities = activities.filter(a => a.type === 'Ride' || a.type === 'VirtualRide');
    
    let imported = 0;
    let skipped = 0;
    
    for (const activity of cyclingActivities) {
      // Check if already imported
      const existing = await query(
        'SELECT id FROM sessions WHERE user_id = $1 AND strava_activity_id = $2',
        [req.user.id, activity.id]
      );
      
      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }
      
      // Create session from Strava activity
      const sessionResult = await query(
        `INSERT INTO sessions (
          user_id, name, start_time, end_time, distance, duration, 
          average_power, max_power, average_speed, max_speed, total_elevation_gain,
          strava_activity_id, source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          req.user.id,
          activity.name,
          new Date(activity.start_date),
          new Date(new Date(activity.start_date).getTime() + activity.moving_time * 1000),
          activity.distance,
          activity.moving_time,
          activity.average_watts || null,
          activity.max_watts || null,
          activity.average_speed || null,
          activity.max_speed || null,
          activity.total_elevation_gain || null,
          activity.id,
          'strava'
        ]
      );
      
      const sessionId = sessionResult.rows[0].id;
      
      // Fetch and store detailed activity streams
      try {
        await fetchAndStoreStreams(sessionId, activity.id, accessToken, new Date(activity.start_date));
      } catch (streamError) {
        console.error(`Failed to fetch streams for activity ${activity.id}:`, streamError.message);
        // Continue even if streams fail - we still have the summary
      }
      
      imported++;
    }
    
    res.json({ 
      success: true, 
      imported, 
      skipped,
      total: cyclingActivities.length 
    });
  } catch (error) {
    console.error('Strava sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch detailed activity streams from Strava (manual trigger)
router.post('/sync-streams/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get session and strava activity ID
    const sessionResult = await query(
      'SELECT strava_activity_id, start_time FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const { strava_activity_id: stravaActivityId, start_time: startTime } = sessionResult.rows[0];
    
    if (!stravaActivityId) {
      return res.status(400).json({ error: 'Session not from Strava' });
    }
    
    // Get user's Strava access token
    const userResult = await query(
      'SELECT strava_access_token, strava_refresh_token, strava_token_expires_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0 || !userResult.rows[0].strava_access_token) {
      return res.status(401).json({ error: 'Strava not connected' });
    }
    
    const user = userResult.rows[0];
    let accessToken = user.strava_access_token;
    
    // Refresh token if needed
    const now = Math.floor(Date.now() / 1000);
    if (now >= user.strava_token_expires_at) {
      const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          refresh_token: user.strava_refresh_token,
          grant_type: 'refresh_token'
        })
      });
      
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        accessToken = refreshData.access_token;
        await query(
          'UPDATE users SET strava_access_token = $1, strava_token_expires_at = $2 WHERE id = $3',
          [refreshData.access_token, refreshData.expires_at, req.user.id]
        );
      }
    }
    
    // Use the helper function
    const dataPoints = await fetchAndStoreStreams(sessionId, stravaActivityId, accessToken, new Date(startTime));
    
    res.json({ 
      success: true, 
      dataPoints,
      message: `Imported ${dataPoints} data points from Strava` 
    });
  } catch (error) {
    console.error('Strava streams sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
