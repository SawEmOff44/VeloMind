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
      `SELECT id, user_id, name,
              total_distance::float8 AS total_distance,
              COALESCE(total_elevation_gain, 0)::float8 AS total_elevation_gain,
              point_count::int AS point_count,
              created_at
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
    const userId = req.user.id;
    const routeResult = await query(
      'SELECT * FROM routes WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    const route = routeResult.rows[0];

    // Prefer the uploaded GPX as the source of truth.
    // Older/leaner schemas may not include a separate route_points table.
    const gpxData = route.gpx_data;
    if (!gpxData) {
      return res.status(500).json({ error: 'Route is missing GPX data' });
    }

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

function getLowercaseExtension(filename) {
  const normalized = String(filename || '').toLowerCase();
  const dot = normalized.lastIndexOf('.');
  if (dot < 0) return '';
  return normalized.slice(dot);
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

function isValidCoordinate(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) &&
    Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

function semicirclesToDegrees(value) {
  return (value * 180) / 2147483648;
}

function decodeFitString(buffer) {
  const raw = Buffer.from(buffer).toString('utf8');
  const nullTerminated = raw.split('\u0000')[0];
  const cleaned = nullTerminated.replace(/\u0000/g, '').trim();
  return cleaned.length > 0 ? cleaned : null;
}

function fitScalarSize(typeNum) {
  switch (typeNum) {
    case 0: // enum
    case 1: // sint8
    case 2: // uint8
    case 10: // uint8z
    case 13: // byte
      return 1;
    case 3: // sint16
    case 4: // uint16
    case 11: // uint16z
      return 2;
    case 5: // sint32
    case 6: // uint32
    case 8: // float32
    case 12: // uint32z
      return 4;
    case 9: // float64
    case 14: // sint64
    case 15: // uint64
    case 16: // uint64z
      return 8;
    default:
      return 0;
  }
}

function decodeFitScalar(view, typeNum, littleEndian) {
  switch (typeNum) {
    case 0: return view.getUint8(0);
    case 1: return view.getInt8(0);
    case 2: return view.getUint8(0);
    case 3: return view.getInt16(0, littleEndian);
    case 4: return view.getUint16(0, littleEndian);
    case 5: return view.getInt32(0, littleEndian);
    case 6: return view.getUint32(0, littleEndian);
    case 8: return view.getFloat32(0, littleEndian);
    case 9: return view.getFloat64(0, littleEndian);
    case 10: return view.getUint8(0);
    case 11: return view.getUint16(0, littleEndian);
    case 12: return view.getUint32(0, littleEndian);
    case 13: return view.getUint8(0);
    case 14: return Number(view.getBigInt64(0, littleEndian));
    case 15: return Number(view.getBigUint64(0, littleEndian));
    case 16: return Number(view.getBigUint64(0, littleEndian));
    default: return null;
  }
}

function isFitInvalidValue(typeNum, value) {
  if (value === null || value === undefined) return true;
  if (!Number.isFinite(value)) return true;

  switch (typeNum) {
    case 0: // enum
    case 2: // uint8
      return value === 0xFF;
    case 1: // sint8
      return value === 0x7F;
    case 3: // sint16
      return value === 0x7FFF;
    case 4: // uint16
      return value === 0xFFFF;
    case 5: // sint32
      return value === 0x7FFFFFFF;
    case 6: // uint32
      return value === 0xFFFFFFFF;
    case 10: // uint8z
    case 11: // uint16z
    case 12: // uint32z
    case 16: // uint64z
      return value === 0;
    default:
      return false;
  }
}

function decodeFitFieldValue(buffer, baseType, littleEndian) {
  const typeNum = baseType & 0x1F;

  if (typeNum === 7) {
    return decodeFitString(buffer);
  }

  const scalarSize = fitScalarSize(typeNum);
  if (scalarSize === 0 || buffer.length % scalarSize !== 0) {
    return null;
  }

  const values = [];
  for (let i = 0; i < buffer.length; i += scalarSize) {
    const chunk = buffer.subarray(i, i + scalarSize);
    const view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    const value = decodeFitScalar(view, typeNum, littleEndian);
    if (isFitInvalidValue(typeNum, value)) {
      values.push(null);
    } else {
      values.push(value);
    }
  }

  return values.length === 1 ? values[0] : values;
}

function findNearestDistanceFromPoints(points, lat, lon) {
  let bestDistance = null;
  let bestOffset = Infinity;

  for (const point of points) {
    const offset = haversineDistance(point.latitude, point.longitude, lat, lon);
    if (offset < bestOffset) {
      bestOffset = offset;
      bestDistance = point.distance;
    }
  }

  return bestDistance;
}

function mapFitCoursePoint(typeCode, customName) {
  const names = {
    0: 'Course Point',
    1: 'Summit',
    2: 'Valley',
    3: 'Water',
    4: 'Food',
    5: 'Danger',
    6: 'Turn Left',
    7: 'Turn Right',
    8: 'Go Straight',
    16: 'Left Fork',
    17: 'Right Fork',
    18: 'Middle Fork',
    19: 'Slight Left',
    20: 'Sharp Left',
    21: 'Slight Right',
    22: 'Sharp Right',
    23: 'U-Turn'
  };

  const turnCodes = new Set([6, 7, 8, 16, 17, 18, 19, 20, 21, 22, 23]);
  const type = turnCodes.has(typeCode)
    ? 'turn'
    : typeCode === 3
      ? 'water'
      : typeCode === 4
        ? 'food'
        : typeCode === 5
          ? 'danger'
          : typeCode === 1
            ? 'steep'
            : 'alert';

  const label = customName || names[typeCode] || 'Course Point';
  return { type, label };
}

function normalizeRoutePoints(rawPoints) {
  const points = [];
  let cumulativeDistance = 0;
  let elevationGain = 0;

  for (const raw of rawPoints) {
    if (!isValidCoordinate(raw.latitude, raw.longitude)) {
      continue;
    }

    let distance = Number.isFinite(raw.distance) ? raw.distance : null;
    const elevation = Number.isFinite(raw.elevation) ? raw.elevation : null;

    if (distance === null) {
      if (points.length > 0) {
        const prev = points[points.length - 1];
        cumulativeDistance += haversineDistance(prev.latitude, prev.longitude, raw.latitude, raw.longitude);
      }
      distance = cumulativeDistance;
    } else {
      // Guard against broken distance resets in malformed files
      if (distance + 5 < cumulativeDistance && points.length > 0) {
        const prev = points[points.length - 1];
        cumulativeDistance += haversineDistance(prev.latitude, prev.longitude, raw.latitude, raw.longitude);
        distance = cumulativeDistance;
      } else {
        cumulativeDistance = distance;
      }
    }

    if (points.length > 0) {
      const prev = points[points.length - 1];
      if (elevation !== null && prev.elevation !== null) {
        const gain = elevation - prev.elevation;
        if (gain > 0) elevationGain += gain;
      }
    }

    points.push({
      latitude: raw.latitude,
      longitude: raw.longitude,
      elevation,
      distance
    });
  }

  return {
    points,
    totalDistance: points.length > 0 ? points[points.length - 1].distance : 0,
    totalElevationGain: elevationGain,
    pointCount: points.length
  };
}

function parseFIT(buffer) {
  if (!buffer || buffer.length < 12) {
    throw new Error('Invalid FIT file');
  }

  const headerSize = buffer.readUInt8(0);
  if (headerSize < 12 || headerSize > buffer.length) {
    throw new Error('Invalid FIT header');
  }

  const signature = buffer.toString('ascii', 8, 12);
  if (signature !== '.FIT') {
    throw new Error('Unrecognized FIT signature');
  }

  const dataSize = buffer.readUInt32LE(4);
  const dataStart = headerSize;
  const dataEnd = dataStart + dataSize;
  if (dataEnd > buffer.length) {
    throw new Error('Corrupt FIT payload');
  }

  const definitions = new Map();
  const routePointsRaw = [];
  const coursePointsRaw = [];

  let offset = dataStart;
  while (offset < dataEnd) {
    const recordHeader = buffer.readUInt8(offset);
    offset += 1;

    const isCompressedTimestamp = (recordHeader & 0x80) !== 0;
    if (isCompressedTimestamp) {
      const localMessageType = (recordHeader >> 5) & 0x03;
      const def = definitions.get(localMessageType);
      if (!def) {
        throw new Error('FIT data references missing compressed definition');
      }

      const dataResult = parseFitDataMessage(buffer, offset, dataEnd, def);
      offset = dataResult.offset;
      processFitMessage(def.globalMessageNumber, dataResult.fields, routePointsRaw, coursePointsRaw);
      continue;
    }

    const isDefinitionMessage = (recordHeader & 0x40) !== 0;
    const hasDeveloperData = (recordHeader & 0x20) !== 0;
    const localMessageType = recordHeader & 0x0F;

    if (isDefinitionMessage) {
      if (offset + 5 > dataEnd) {
        throw new Error('Truncated FIT definition message');
      }

      offset += 1; // reserved
      const architecture = buffer.readUInt8(offset);
      offset += 1;
      const littleEndian = architecture === 0;

      const globalMessageNumber = littleEndian
        ? buffer.readUInt16LE(offset)
        : buffer.readUInt16BE(offset);
      offset += 2;

      const fieldCount = buffer.readUInt8(offset);
      offset += 1;

      const fields = [];
      for (let i = 0; i < fieldCount; i++) {
        if (offset + 3 > dataEnd) {
          throw new Error('Truncated FIT field definition');
        }

        fields.push({
          fieldNumber: buffer.readUInt8(offset),
          size: buffer.readUInt8(offset + 1),
          baseType: buffer.readUInt8(offset + 2)
        });
        offset += 3;
      }

      let developerFieldBytes = 0;
      if (hasDeveloperData) {
        if (offset + 1 > dataEnd) {
          throw new Error('Truncated FIT developer field count');
        }

        const developerFieldCount = buffer.readUInt8(offset);
        offset += 1;
        for (let i = 0; i < developerFieldCount; i++) {
          if (offset + 3 > dataEnd) {
            throw new Error('Truncated FIT developer field');
          }
          developerFieldBytes += buffer.readUInt8(offset + 1);
          offset += 3;
        }
      }

      definitions.set(localMessageType, {
        globalMessageNumber,
        fields,
        littleEndian,
        developerFieldBytes
      });
    } else {
      const def = definitions.get(localMessageType);
      if (!def) {
        throw new Error('FIT data references missing definition');
      }

      const dataResult = parseFitDataMessage(buffer, offset, dataEnd, def);
      offset = dataResult.offset;
      processFitMessage(def.globalMessageNumber, dataResult.fields, routePointsRaw, coursePointsRaw);
    }
  }

  let normalized = normalizeRoutePoints(routePointsRaw);
  if (normalized.pointCount < 2 && coursePointsRaw.length > 1) {
    normalized = normalizeRoutePoints(coursePointsRaw.map((cp) => ({
      latitude: cp.latitude,
      longitude: cp.longitude,
      elevation: null,
      distance: cp.distance
    })));
  }

  const waypoints = coursePointsRaw
    .filter((cp) => isValidCoordinate(cp.latitude, cp.longitude))
    .map((cp) => {
      const mapped = mapFitCoursePoint(cp.typeCode, cp.name);
      const distanceFromStart = Number.isFinite(cp.distance)
        ? cp.distance
        : findNearestDistanceFromPoints(normalized.points, cp.latitude, cp.longitude);

      return {
        latitude: cp.latitude,
        longitude: cp.longitude,
        type: mapped.type,
        label: mapped.label,
        notes: cp.name || null,
        distanceFromStart
      };
    })
    .sort((a, b) => (a.distanceFromStart ?? Number.MAX_SAFE_INTEGER) - (b.distanceFromStart ?? Number.MAX_SAFE_INTEGER));

  return {
    ...normalized,
    waypoints
  };
}

function parseFitDataMessage(buffer, startOffset, dataEnd, definition) {
  let offset = startOffset;
  const fields = {};

  for (const fieldDef of definition.fields) {
    const end = offset + fieldDef.size;
    if (end > dataEnd) {
      throw new Error('Truncated FIT data message');
    }

    const fieldBuffer = buffer.subarray(offset, end);
    fields[fieldDef.fieldNumber] = decodeFitFieldValue(fieldBuffer, fieldDef.baseType, definition.littleEndian);
    offset = end;
  }

  if (definition.developerFieldBytes > 0) {
    const devEnd = offset + definition.developerFieldBytes;
    if (devEnd > dataEnd) {
      throw new Error('Truncated FIT developer data');
    }
    offset = devEnd;
  }

  return { fields, offset };
}

function processFitMessage(globalMessageNumber, fields, routePointsRaw, coursePointsRaw) {
  // Record message
  if (globalMessageNumber === 20) {
    const latSemi = fields[0];
    const lonSemi = fields[1];
    if (!Number.isFinite(latSemi) || !Number.isFinite(lonSemi)) {
      return;
    }

    const latitude = semicirclesToDegrees(latSemi);
    const longitude = semicirclesToDegrees(lonSemi);
    if (!isValidCoordinate(latitude, longitude)) return;

    const altitudeRaw = fields[2];
    const elevation = Number.isFinite(altitudeRaw) ? (altitudeRaw / 5) - 500 : null;
    const distanceRaw = fields[5];
    const distance = Number.isFinite(distanceRaw) ? distanceRaw / 100 : null;

    routePointsRaw.push({
      latitude,
      longitude,
      elevation,
      distance
    });
    return;
  }

  // Course point message
  if (globalMessageNumber === 32) {
    const latSemi = fields[2];
    const lonSemi = fields[3];
    if (!Number.isFinite(latSemi) || !Number.isFinite(lonSemi)) {
      return;
    }

    const latitude = semicirclesToDegrees(latSemi);
    const longitude = semicirclesToDegrees(lonSemi);
    if (!isValidCoordinate(latitude, longitude)) return;

    const distanceRaw = fields[4];
    const typeCode = fields[5];
    const name = fields[6];

    coursePointsRaw.push({
      latitude,
      longitude,
      distance: Number.isFinite(distanceRaw) ? distanceRaw / 100 : null,
      typeCode: Number.isFinite(typeCode) ? typeCode : null,
      name: typeof name === 'string' ? name : null
    });
  }
}

async function parseUploadedRouteFile(file, routeName) {
  const ext = getLowercaseExtension(file?.originalname);
  const isFit = ext === '.fit' || file?.mimetype === 'application/vnd.ant.fit';

  if (isFit) {
    const parsed = parseFIT(file.buffer);
    if (!parsed.points || parsed.points.length < 2) {
      throw new Error('No route points found in FIT file');
    }

    return {
      parsed,
      gpxData: generateGPX(routeName, parsed.points)
    };
  }

  const xmlData = file.buffer.toString('utf-8');
  const parsed = await parseGPX(xmlData);
  if (!parsed.points || parsed.points.length < 2) {
    throw new Error('No route points found in uploaded file');
  }

  return { parsed, gpxData: xmlData };
}

// Upload route file
router.post('/upload', authenticateToken, upload.single('gpx'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { name } = req.body;
    const routeName = name || req.file.originalname;
    const { parsed, gpxData } = await parseUploadedRouteFile(req.file, routeName);
    
    // Save to database
    const result = await query(
      `INSERT INTO routes (user_id, name, gpx_data, total_distance, total_elevation_gain, point_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, total_distance, total_elevation_gain, point_count, created_at`,
      [
        req.user.id,
        routeName,
        gpxData,
        parsed.totalDistance,
        parsed.totalElevationGain,
        parsed.pointCount
      ]
    );

    const route = result.rows[0];
    const waypointCandidates = Array.isArray(parsed.waypoints) ? parsed.waypoints : [];
    const waypointInsertions = waypointCandidates.slice(0, 500);
    let insertedWaypointCount = 0;

    if (waypointInsertions.length > 0) {
      try {
        for (const waypoint of waypointInsertions) {
          await query(
            `INSERT INTO route_waypoints
             (route_id, user_id, latitude, longitude, type, label, notes, distance_from_start, alert_distance)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              route.id,
              req.user.id,
              waypoint.latitude,
              waypoint.longitude,
              waypoint.type || 'alert',
              waypoint.label || null,
              waypoint.notes || null,
              waypoint.distanceFromStart ?? null,
              1000
            ]
          );
          insertedWaypointCount += 1;
        }
      } catch (waypointError) {
        console.warn('Skipping FIT waypoint persistence:', waypointError?.message || waypointError);
      }
    }
    
    res.json({
      route,
      parsed: {
        totalDistance: parsed.totalDistance,
        totalElevationGain: parsed.totalElevationGain,
        pointCount: parsed.pointCount,
        waypointCount: insertedWaypointCount
      }
    });
  } catch (error) {
    console.error('Route upload error:', error);
    const parseError = typeof error?.message === 'string' && (
      error.message.includes('No route points') ||
      error.message.includes('Invalid FIT') ||
      error.message.includes('Unrecognized FIT') ||
      error.message.includes('Corrupt FIT') ||
      error.message.includes('Truncated FIT')
    );
    res.status(parseError ? 400 : 500).json({ error: error.message });
  }
});

// Get route by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT * FROM routes WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
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
      `SELECT id, name, gpx_data,
              total_distance::float8 AS total_distance,
              COALESCE(total_elevation_gain, 0)::float8 AS total_elevation_gain,
              created_at
       FROM routes
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    const route = routeResult.rows[0];
    
    // Parse GPX to get points
    const parsed = await parseGPX(route.gpx_data);

    // Get waypoints (optional). If the table doesn't exist yet in a deployed DB,
    // return an empty list instead of failing the whole route download.
    let waypoints = [];
    try {
      const waypointsResult = await query(
        `SELECT id,
                route_id::int AS route_id,
                user_id::int AS user_id,
                latitude::float8 AS latitude,
                longitude::float8 AS longitude,
                type,
                label,
                notes,
                distance_from_start::float8 AS distance_from_start,
                COALESCE(alert_distance, 0)::int AS alert_distance,
                created_at
         FROM route_waypoints
         WHERE route_id = $1 AND user_id = $2
         ORDER BY distance_from_start ASC NULLS LAST, created_at ASC`,
        [req.params.id, req.user.id]
      );
      waypoints = waypointsResult.rows;
    } catch (wpError) {
      console.warn('Waypoints query failed; returning empty waypoints:', wpError);
      waypoints = [];
    }
    
    res.json({
      id: route.id,
      name: route.name,
      total_distance: route.total_distance,
      total_elevation_gain: route.total_elevation_gain,
      points: parsed.points,
      waypoints
    });
  } catch (error) {
    console.error('Download route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all routes for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT id, name,
              total_distance::float8 AS total_distance,
              COALESCE(total_elevation_gain, 0)::float8 AS total_elevation_gain,
              point_count::int AS point_count,
              created_at
       FROM routes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
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

export { parseFIT };
export default router;
