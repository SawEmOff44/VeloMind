import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Export session as CSV
router.get('/session/:id/csv', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get session
    const sessionResult = await query(
      `SELECT * FROM sessions WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    
    // Get data points
    const dataPoints = await query(
      `SELECT * FROM session_data_points 
       WHERE session_id = $1 
       ORDER BY timestamp`,
      [id]
    );
    
    // Generate CSV
    let csv = 'timestamp,latitude,longitude,altitude,power,heart_rate,cadence,speed,distance\n';
    
    dataPoints.rows.forEach(point => {
      csv += `${point.timestamp},${point.latitude || ''},${point.longitude || ''},${point.altitude || ''},${point.power || ''},${point.heart_rate || ''},${point.cadence || ''},${point.speed || ''},${point.distance || ''}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${session.name || 'session'}_${session.id}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export session as TCX (Training Center XML)
router.get('/session/:id/tcx', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get session
    const sessionResult = await query(
      `SELECT * FROM sessions WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    
    // Get data points
    const dataPoints = await query(
      `SELECT * FROM session_data_points 
       WHERE session_id = $1 
       ORDER BY timestamp`,
      [id]
    );
    
    // Generate TCX
    let tcx = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Biking">
      <Id>${session.start_time}</Id>
      <Lap StartTime="${session.start_time}">
        <TotalTimeSeconds>${session.duration || 0}</TotalTimeSeconds>
        <DistanceMeters>${session.distance || 0}</DistanceMeters>
        <MaximumSpeed>${session.max_speed || 0}</MaximumSpeed>
        <Calories>0</Calories>
        ${session.average_heart_rate ? `<AverageHeartRateBpm><Value>${Math.round(session.average_heart_rate)}</Value></AverageHeartRateBpm>` : ''}
        ${session.max_heart_rate ? `<MaximumHeartRateBpm><Value>${Math.round(session.max_heart_rate)}</Value></MaximumHeartRateBpm>` : ''}
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Track>
`;
    
    dataPoints.rows.forEach(point => {
      tcx += `          <Trackpoint>
            <Time>${point.timestamp}</Time>
`;
      if (point.latitude && point.longitude) {
        tcx += `            <Position>
              <LatitudeDegrees>${point.latitude}</LatitudeDegrees>
              <LongitudeDegrees>${point.longitude}</LongitudeDegrees>
            </Position>
`;
      }
      if (point.altitude) {
        tcx += `            <AltitudeMeters>${point.altitude}</AltitudeMeters>\n`;
      }
      if (point.distance) {
        tcx += `            <DistanceMeters>${point.distance}</DistanceMeters>\n`;
      }
      if (point.heart_rate) {
        tcx += `            <HeartRateBpm><Value>${Math.round(point.heart_rate)}</Value></HeartRateBpm>\n`;
      }
      if (point.cadence) {
        tcx += `            <Cadence>${Math.round(point.cadence)}</Cadence>\n`;
      }
      if (point.power) {
        tcx += `            <Extensions>
              <TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2">
                <Watts>${Math.round(point.power)}</Watts>
              </TPX>
            </Extensions>
`;
      }
      tcx += `          </Trackpoint>\n`;
    });
    
    tcx += `        </Track>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${session.name || 'session'}_${session.id}.tcx"`);
    res.send(tcx);
  } catch (error) {
    console.error('Export TCX error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export all sessions summary as CSV
router.get('/sessions/summary/csv', authenticateToken, async (req, res) => {
  try {
    const sessions = await query(
      `SELECT 
        s.id, s.name, s.start_time, s.duration, s.distance,
        s.elevation_gain, s.average_power, s.max_power,
        s.average_heart_rate, s.max_heart_rate, s.average_cadence,
        r.name as route_name
       FROM sessions s
       LEFT JOIN routes r ON s.route_id = r.id
       WHERE s.user_id = $1
       ORDER BY s.start_time DESC`,
      [req.user.id]
    );
    
    // Generate CSV
    let csv = 'id,name,date,duration_seconds,distance_meters,elevation_meters,avg_power_watts,max_power_watts,avg_hr,max_hr,avg_cadence,route\n';
    
    sessions.rows.forEach(session => {
      csv += `${session.id},"${session.name || 'Unnamed'}",${session.start_time},${session.duration || ''},${session.distance || ''},${session.elevation_gain || ''},${session.average_power || ''},${session.max_power || ''},${session.average_heart_rate || ''},${session.max_heart_rate || ''},${session.average_cadence || ''},"${session.route_name || ''}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="velomind_sessions_summary.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export sessions summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
