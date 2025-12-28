import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

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

app.listen(PORT, () => {
  console.log(`🚴 VeloMind API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
