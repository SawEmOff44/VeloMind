import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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
      await query(
        `INSERT INTO sessions (
          user_id, name, start_time, end_time, total_distance, total_time, 
          avg_power, max_power, avg_speed, max_speed, total_elevation_gain,
          strava_activity_id, source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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

export default router;
