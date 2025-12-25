# VeloMind Web Application

Web dashboard for VeloMind - upload GPX routes, analyze cycling sessions, and manage rider parameters.

## Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT tokens

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)

### Backend Setup

1. Navigate to backend directory:
```bash
cd web/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
NODE_ENV=development
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_REDIRECT_URI=http://localhost:5173/strava/callback
```

4. Initialize database:
```bash
psql $DATABASE_URL < src/schema.sql
```

5. Start server:
```bash
npm run dev
```

Backend runs on http://localhost:3001

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd web/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:3001
```

4. Start development server:
```bash
npm run dev
```

Frontend runs on http://localhost:5173

## Features

### Routes
- Upload GPX files via drag-and-drop or file picker
- View route details (distance, elevation gain)
- Delete routes

### Sessions
- View all cycling sessions
- Session analytics (power curves, zone distribution)
- Detailed session view with charts

### Parameters
- Create multiple rider parameter profiles
- Configure mass, CdA, rolling resistance, FTP
- Edit and delete parameter sets

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token

### Routes
- `GET /api/routes` - List all routes
- `POST /api/gpx/upload` - Upload GPX file
- `DELETE /api/routes/:id` - Delete route

### Sessions
- `GET /api/sessions` - List sessions (with pagination)
- `GET /api/sessions/:id` - Get session details
- `GET /api/sessions/:id/analytics` - Get session analytics
- `POST /api/sessions` - Create session (from iOS app)
- `DELETE /api/sessions/:id` - Delete session

### Parameters
- `GET /api/parameters` - List parameter sets
- `POST /api/parameters` - Create parameter set
- `PUT /api/parameters/:id` - Update parameter set
- `DELETE /api/parameters/:id` - Delete parameter set
- `POST /api/parameters/estimate` - Estimate CdA from session data

### Strava Integration
- `GET /api/strava/connect` - Start Strava OAuth flow
- `GET /api/strava/callback` - OAuth callback handler
- `GET /api/strava/activities` - Sync Strava activities

## iOS App Integration

The iOS app syncs data with this backend:

1. Sessions are created via `POST /api/sessions` with session data points
2. Routes are fetched via `GET /api/routes` for ride matching
3. Parameters are retrieved via `GET /api/parameters` for power calculations
4. Strava activities sync via `/api/strava/*` endpoints

## Database Schema

### Users
- `id`, `name`, `email`, `password_hash`
- `strava_athlete_id`, `strava_access_token`, `strava_refresh_token`
- `created_at`, `updated_at`

### Routes
- `id`, `user_id`, `name`, `gpx_data`
- `total_distance`, `total_elevation_gain`
- Indexes on `user_id`

### Sessions
- `id`, `user_id`, `route_id`, `name`
- `start_time`, `end_time`, `duration`
- `distance`, `average_speed`, `max_speed`
- `average_power`, `normalized_power`, `average_heart_rate`
- `total_elevation_gain`

### Session Data Points
- `id`, `session_id`, `timestamp`, `latitude`, `longitude`
- `altitude`, `speed`, `power`, `heart_rate`, `cadence`
- Indexes on `session_id`, `timestamp`

### Rider Parameters
- `id`, `user_id`, `name`
- `total_mass_kg`, `frontal_area_m2`, `drag_coefficient`
- `rolling_resistance`, `drivetrain_loss`
- `ftp`, `is_active`

### Calibration Sessions
- Tracks calibration rides for parameter estimation
- Links to sessions and stores environmental conditions

### Fitness Metrics
- Daily ATL, CTL, TSB tracking
- Calculated from session training loads

## Development

### Backend
```bash
cd web/backend
npm run dev  # Starts with nodemon for hot reload
```

### Frontend
```bash
cd web/frontend
npm run dev  # Starts Vite dev server
```

## Production Deployment

### Backend (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `cd web/backend && npm install`
4. Set start command: `cd web/backend && npm start`
5. Add environment variables (DATABASE_URL, JWT_SECRET, etc.)

### Frontend (Netlify/Vercel)

1. Connect GitHub repository
2. Set build command: `cd web/frontend && npm run build`
3. Set publish directory: `web/frontend/dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.render.com`

## License

Proprietary - All rights reserved
