# VeloMind Web Application - Implementation Summary

## Overview

Full-stack web application for VeloMind cycling platform enabling GPX upload, session analysis, and parameter management.

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Maps**: Leaflet + React Leaflet
- **HTTP Client**: Axios
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **GPX Parsing**: xml2js

## Project Structure

```
web/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server setup
│   │   ├── db.js                 # PostgreSQL connection
│   │   ├── schema.sql            # Database schema
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT authentication middleware
│   │   └── routes/
│   │       ├── auth.js           # User registration & login
│   │       ├── gpx.js            # GPX file upload & parsing
│   │       ├── sessions.js       # Session CRUD & analytics
│   │       ├── parameters.js     # Rider parameters management
│   │       └── strava.js         # Strava OAuth integration
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Router & auth state
│   │   ├── components/
│   │   │   └── Navbar.jsx        # Navigation component
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login form
│   │   │   ├── Register.jsx      # Registration form
│   │   │   ├── Dashboard.jsx     # Overview stats & recent sessions
│   │   │   ├── Sessions.jsx      # Session list view
│   │   │   ├── SessionDetail.jsx # Session analytics with charts
│   │   │   ├── Routes.jsx        # GPX upload & route management
│   │   │   └── Parameters.jsx    # Rider parameters editor
│   │   └── services/
│   │       ├── api.js            # Axios API client
│   │       └── auth.js           # Auth helpers
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── README.md                      # Full documentation
├── QUICKSTART.md                  # Quick start guide
└── .gitignore
```

## Features Implemented

### 1. Authentication
- User registration with password hashing (bcrypt)
- JWT-based authentication
- Protected routes on frontend
- Token refresh handling

### 2. GPX Route Management
- Drag-and-drop file upload
- GPX XML parsing
- Distance calculation (haversine formula)
- Elevation gain computation
- Route listing and deletion

### 3. Session Management
- Session list with pagination
- Session detail view with full data
- Session analytics:
  - Power curves (5s to 1hr)
  - Elevation profile charts
  - Heart rate and power zone distribution
- Session deletion

### 4. Rider Parameters
- Multiple parameter profiles
- Configuration fields:
  - Total mass (rider + bike)
  - Frontal area (m²)
  - Drag coefficient (Cd)
  - Rolling resistance (Crr)
  - Drivetrain loss (%)
  - FTP (Functional Threshold Power)
- CdA calculation (A × Cd)
- Profile management (create, edit, delete)

### 5. Data Visualization
- Power curve line charts
- Elevation profile charts
- Power zone distribution bar charts
- Responsive charts with Recharts
- Interactive tooltips

### 6. iOS App Integration
- RESTful API endpoints for:
  - Fetching routes for ride matching
  - Retrieving rider parameters
  - Uploading completed sessions
  - Syncing session data points
- CORS configuration for mobile clients

### 7. Strava Integration (Optional)
- OAuth 2.0 flow
- Activity sync endpoint
- Token refresh handling

## API Endpoints

### Authentication
```
POST   /api/auth/register         # Create new user
POST   /api/auth/login            # Login and get JWT
GET    /api/auth/me               # Get current user
```

### Routes
```
GET    /api/gpx                   # List all routes
POST   /api/gpx/upload            # Upload GPX file
GET    /api/gpx/:id               # Get route details
DELETE /api/gpx/:id               # Delete route
```

### Sessions
```
GET    /api/sessions              # List sessions (paginated)
GET    /api/sessions/:id          # Get session details
GET    /api/sessions/:id/analytics # Get analytics data
POST   /api/sessions              # Create session (from iOS)
DELETE /api/sessions/:id          # Delete session
```

### Parameters
```
GET    /api/parameters            # List parameter sets
GET    /api/parameters/active     # Get active parameters
POST   /api/parameters            # Create parameter set
PUT    /api/parameters/:id        # Update parameters
DELETE /api/parameters/:id        # Delete parameters
POST   /api/parameters/estimate   # Estimate CdA from session
```

### Strava
```
GET    /api/strava/connect        # Start OAuth flow
GET    /api/strava/callback       # OAuth callback
GET    /api/strava/activities     # Get synced activities
POST   /api/strava/sync           # Sync new activities
```

## Database Schema

### Tables
1. **users** - User accounts with Strava tokens
2. **routes** - GPX routes with track points
3. **sessions** - Ride sessions with summary stats
4. **session_data_points** - Time-series data from sessions
5. **rider_parameters** - Rider physical parameters
6. **calibration_sessions** - Calibration ride data
7. **fitness_metrics** - Daily ATL/CTL/TSB tracking

### Key Relationships
- Users → Routes (1:N)
- Users → Sessions (1:N)
- Users → RiderParameters (1:N)
- Routes → Sessions (1:N)
- Sessions → SessionDataPoints (1:N)

## Setup Instructions

### Quick Start
See [QUICKSTART.md](QUICKSTART.md) for step-by-step setup.

### Environment Variables

**Backend** (.env):
```
DATABASE_URL=postgresql://...
JWT_SECRET=random-hex-string
PORT=3001
STRAVA_CLIENT_ID=optional
STRAVA_CLIENT_SECRET=optional
```

**Frontend** (.env):
```
VITE_API_URL=http://localhost:3001
```

### Installation

1. **Database**: Create Neon PostgreSQL database and run schema.sql
2. **Backend**: `cd web/backend && npm install && npm run dev`
3. **Frontend**: `cd web/frontend && npm install && npm run dev`
4. **Access**: Navigate to http://localhost:5173

## Production Deployment

### Backend (Render)
1. Create Web Service
2. Build: `cd web/backend && npm install`
3. Start: `cd web/backend && npm start`
4. Add environment variables

### Frontend (Netlify/Vercel)
1. Build: `cd web/frontend && npm run build`
2. Publish: `web/frontend/dist`
3. Add: `VITE_API_URL=https://api.yourdomain.com`

## Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] GPX file upload (drag & drop)
- [ ] Route listing and deletion
- [ ] Session list view
- [ ] Session detail with charts
- [ ] Parameter creation and editing
- [ ] Dashboard statistics

### API Testing
```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Code Statistics

- **Backend**: 9 files, ~1,500 lines
- **Frontend**: 10 components/pages, ~1,800 lines
- **Total**: 19 files, ~3,300 lines of code
- **Database**: 7 tables with indexes

## Next Steps

1. Add unit tests (Jest for backend, Vitest for frontend)
2. Add E2E tests (Playwright/Cypress)
3. Implement real-time session updates (WebSocket)
4. Add session comparison tool
5. Implement route recommendations
6. Add weather integration on web
7. Create admin dashboard
8. Add export functionality (PDF reports)

## iOS App Integration Notes

The iOS app (`VeloMind/Network/APIManager.swift`) should be configured to:

1. Set `baseURL` to backend URL (localhost for dev, production URL for release)
2. Include JWT token in Authorization header
3. Call these endpoints:
   - `GET /api/routes` - Fetch routes for ride matching
   - `GET /api/parameters/active` - Get rider parameters
   - `POST /api/sessions` - Upload completed session
   - `POST /api/sessions/:id/data` - Upload session data points

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token expiration (24h)
- SQL injection prevention (parameterized queries)
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Environment variable validation

## Performance Optimizations

- Database indexes on foreign keys and timestamps
- Connection pooling for PostgreSQL
- Gzip compression on responses
- Efficient GPX parsing (streaming)
- Frontend code splitting (React Router)
- Lazy loading for charts

## License

Proprietary - All rights reserved
