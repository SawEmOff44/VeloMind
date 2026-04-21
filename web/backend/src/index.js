import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

import { query } from './db.js';

// Routes
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import gpxRoutes from './routes/gpx.js';
import parametersRoutes from './routes/parameters.js';
import stravaRoutes from './routes/strava.js';
import waypointsRoutes from './routes/waypoints.js';
import analyticsRoutes from './routes/analytics.js';
import exportRoutes from './routes/export.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS - Allow all Vercel deployments, localhost, and mobile apps
const allowedOrigins = [
  'http://localhost:3000',
  'https://velo-mind.vercel.app',
  /https:\/\/velo-mind-.*\.vercel\.app$/ // Allow all Vercel preview deployments
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, iOS TestFlight)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    
    if (isAllowed || process.env.CORS_ORIGIN === origin) {
      callback(null, true);
    } else {
      // Log rejected origins in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('CORS rejected origin:', origin);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OAuth Callback Route (must be at root level, not under /api)
app.use('/strava', stravaRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/gpx', gpxRoutes);
app.use('/api/parameters', parametersRoutes);
app.use('/api/strava', stravaRoutes);
app.use('/api/waypoints', waypointsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function warnIfSchemaMismatch() {
  try {
    const result = await query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'session_data_points'
         AND column_name = 'distance'
       LIMIT 1`
    );

    if (result.rowCount === 0) {
      console.warn(
        '⚠️ DB schema mismatch: public.session_data_points.distance is missing. ' +
          'Run: ALTER TABLE public.session_data_points ADD COLUMN IF NOT EXISTS distance DECIMAL(10,2);'
      );
    }
  } catch (err) {
    console.warn('⚠️ DB schema check failed (continuing anyway):', err?.message || err);
  }
}

async function ensureOptionalRouteColumns() {
  const statements = [
    `ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS source_format VARCHAR(20) DEFAULT 'gpx'`,
    `ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS original_file_name VARCHAR(255)`,
    `ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS original_mime_type VARCHAR(100)`,
    `ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS original_file_data BYTEA`,
    `ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS original_file_size INTEGER`,
    `ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS waypoint_count INTEGER DEFAULT 0`
  ];

  try {
    for (const statement of statements) {
      await query(statement);
    }
  } catch (err) {
    console.warn('⚠️ Route metadata schema check failed (continuing anyway):', err?.message || err);
  }
}

async function ensureWaypointSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS public.route_waypoints (
       id SERIAL PRIMARY KEY,
       route_id INTEGER REFERENCES public.routes(id) ON DELETE CASCADE,
       user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
       latitude DECIMAL(10,7) NOT NULL,
       longitude DECIMAL(10,7) NOT NULL,
       type VARCHAR(50) DEFAULT 'alert',
       label VARCHAR(255),
       notes TEXT,
       distance_from_start DECIMAL(10,2),
       alert_distance INTEGER DEFAULT 1000,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     )`,
    `ALTER TABLE public.route_waypoints ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'alert'`,
    `ALTER TABLE public.route_waypoints ADD COLUMN IF NOT EXISTS label VARCHAR(255)`,
    `ALTER TABLE public.route_waypoints ADD COLUMN IF NOT EXISTS notes TEXT`,
    `ALTER TABLE public.route_waypoints ADD COLUMN IF NOT EXISTS distance_from_start DECIMAL(10,2)`,
    `ALTER TABLE public.route_waypoints ADD COLUMN IF NOT EXISTS alert_distance INTEGER DEFAULT 1000`,
    `ALTER TABLE public.route_waypoints ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `ALTER TABLE public.route_waypoints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    `CREATE INDEX IF NOT EXISTS idx_route_waypoints_route_id ON public.route_waypoints(route_id)`,
    `CREATE INDEX IF NOT EXISTS idx_route_waypoints_user_id ON public.route_waypoints(user_id)`
  ];

  try {
    for (const statement of statements) {
      await query(statement);
    }
  } catch (err) {
    console.warn('⚠️ Waypoint schema check failed (continuing anyway):', err?.message || err);
  }
}

(async () => {
  await ensureOptionalRouteColumns();
  await ensureWaypointSchema();
  await warnIfSchemaMismatch();

  app.listen(PORT, () => {
    console.log(`🚴 VeloMind API server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
})();

export default app;
