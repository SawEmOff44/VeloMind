import express from 'express';
import multer from 'multer';
import xml2js from 'xml2js';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.gpx', '.fit', '.tcx', '.kml'];
    const allowedMimeTypes = [
      'application/gpx+xml',
      'text/xml',
      'application/xml',
      'application/vnd.ant.fit',
      'application/octet-stream',
      'application/vnd.garmin.tcx+xml',
      'application/vnd.google-earth.kml+xml'
    ];
    
    const hasAllowedExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    const hasAllowedMimeType = allowedMimeTypes.includes(file.mimetype);
    
    if (hasAllowedExtension || hasAllowedMimeType) {
      cb(null, true);
    } else {
      cb(new Error('Only GPX, FIT, TCX, and KML files are allowed'));
    }
  }
});

// Get all routes for user (for iOS sync)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, user_id, name, total_distance, total_elevation_gain, 
              point_count, created_at, updated_at
       FROM routes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    
    res.json({ routes: result.rows });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// Download GPX file (for iOS sync)
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const routeResult = await query(
      'SELECT * FROM routes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    const route = routeResult.rows[0];
    
    // Get route points
    const pointsResult = await query(
      `SELECT latitude, longitude, elevation, distance
       FROM route_points
       WHERE route_id = $1
       ORDER BY point_index ASC`,
      [req.params.id]
    );
    
    // Generate GPX XML
    const gpxData = generateGPX(route.name, pointsResult.rows);
    
    res.set('Content-Type', 'application/gpx+xml');
    res.set('Content-Disposition', `attachment; filename="${route.name}.gpx"`);
    res.send(gpxData);
  } catch (error) {
    console.error('Error downloading route:', error);
    res.status(500).json({ error: 'Failed to download route' });
  }
});

// Generate GPX XML from route points
function generateGPX(name, points) {
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VeloMind" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(name)}</name>
  </metadata>
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
`;
  
  for (const point of points) {
    gpx += `      <trkpt lat="${point.latitude}" lon="${point.longitude}">
`;
    if (point.elevation !== null) {
      gpx += `        <ele>${point.elevation}</ele>
`;
    }
    gpx += `      </trkpt>
`;
  }
  
  gpx += `    </trkseg>
  </trk>
</gpx>`;
  
  return gpx;
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Parse GPX XML
async function parseGPX(xmlData) {
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);
  
  const points = [];
  let trackPoints = [];
  
  // Try to find track points in various GPX structures
  if (result.gpx?.trk?.[0]?.trkseg?.[0]?.trkpt) {
    trackPoints = result.gpx.trk[0].trkseg[0].trkpt;
  } else if (result.gpx?.rte?.[0]?.rtept) {
    trackPoints = result.gpx.rte[0].rtept;
  }
  
  let cumulativeDistance = 0;
  let prevLat = null;
  let prevLon = null;
  
  for (const pt of trackPoints) {
    const lat = parseFloat(pt.$.lat);
    const lon = parseFloat(pt.$.lon);
    const ele = pt.ele ? parseFloat(pt.ele[0]) : null;
    
    // Calculate distance from previous point
    if (prevLat !== null && prevLon !== null) {
      const distance = haversineDistance(prevLat, prevLon, lat, lon);
      cumulativeDistance += distance;
    }
    
    points.push({
      latitude: lat,
      longitude: lon,
      elevation: ele,
      distance: cumulativeDistance
    });
    
    prevLat = lat;
    prevLon = lon;
  }
  
  // Calculate elevation gain
  let elevationGain = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].elevation && points[i - 1].elevation) {
      const gain = points[i].elevation - points[i - 1].elevation;
      if (gain > 0) {
        elevationGain += gain;
      }
    }
  }
  
  return {
    points,
    totalDistance: cumulativeDistance,
    totalElevationGain: elevationGain,
    pointCount: points.length
  };
}

// Haversine distance formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

// Upload GPX file
router.post('/upload', authenticateToken, upload.single('gpx'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { name } = req.body;
    const gpxData = req.file.buffer.toString('utf-8');
    
    // Parse GPX
    const parsed = await parseGPX(gpxData);
    
    // Save to database
    const result = await query(
      `INSERT INTO routes (user_id, name, gpx_data, total_distance, total_elevation_gain, point_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, total_distance, total_elevation_gain, point_count, created_at`,
      [
        req.user.id,
        name || req.file.originalname,
        gpxData,
        parsed.totalDistance,
        parsed.totalElevationGain,
        parsed.pointCount
      ]
    );
    
    res.json({
      route: result.rows[0],
      parsed: {
        totalDistance: parsed.totalDistance,
        totalElevationGain: parsed.totalElevationGain,
        pointCount: parsed.pointCount
      }
    });
  } catch (error) {
    console.error('GPX upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get route by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM routes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    const route = result.rows[0];
    
    // Parse GPX to get points
    const parsed = await parseGPX(route.gpx_data);
    
    res.json({
      ...route,
      points: parsed.points
    });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get route with waypoints for iOS download
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    // Get route
    const routeResult = await query(
      'SELECT * FROM routes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    const route = routeResult.rows[0];
    
    // Parse GPX to get points
    const parsed = await parseGPX(route.gpx_data);
    
    // Get waypoints
    const waypointsResult = await query(
      `SELECT * FROM route_waypoints 
       WHERE route_id = $1 AND user_id = $2
       ORDER BY distance_from_start ASC`,
      [req.params.id, req.user.id]
    );
    
    res.json({
      id: route.id,
      name: route.name,
      total_distance: route.total_distance,
      total_elevation_gain: route.total_elevation_gain,
      points: parsed.points,
      waypoints: waypointsResult.rows
    });
  } catch (error) {
    console.error('Download route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all routes for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, total_distance, total_elevation_gain, point_count, created_at
       FROM routes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    
    res.json({ routes: result.rows });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete route
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM routes WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
