# VeloMind Backend API

Production-ready Express.js backend for the VeloMind cycling performance app.

## 🚀 Quick Deploy to Production

```bash
cd web/backend
vercel
```

See **[TESTFLIGHT_SETUP.md](TESTFLIGHT_SETUP.md)** for complete TestFlight deployment guide.

## 📋 Features

- **User Authentication** - JWT-based auth with bcrypt password hashing
- **Strava Integration** - OAuth2 flow and activity sync
- **Session Management** - Store and analyze ride data
- **Route Management** - GPX upload and parsing
- **Parameter Tracking** - Rider fitness parameters (FTP, CdA, mass, etc.)
- **Analytics** - Performance metrics and insights
- **Security** - Helmet.js, rate limiting, CORS configured
- **Production Ready** - Compression, SSL, error handling

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT + bcrypt
- **Deployment**: Vercel
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.js              # Main server file
│   ├── db.js                 # Database connection
│   ├── schema.sql            # Database schema
│   ├── routes/               # API route handlers
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   ├── strava.js
│   │   ├── gpx.js
│   │   ├── parameters.js
│   │   ├── waypoints.js
│   │   ├── analytics.js
│   │   └── export.js
│   ├── middleware/           # Custom middleware
│   ├── models/               # Data models
│   ├── services/             # Business logic
│   └── migrations/           # Database migrations
├── .env.example              # Environment variables template
├── package.json
├── vercel.json               # Vercel deployment config
├── init-db.sh                # Database initialization script
├── TESTFLIGHT_SETUP.md       # Complete deployment guide
└── PRODUCTION_SETUP.md       # Production configuration details
```

## 🔧 Local Development

### Prerequisites

- Node.js 18 or higher
- PostgreSQL (or Neon account)
- Strava API credentials

### Setup

1. **Clone and install:**
   ```bash
   cd web/backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Set up database:**
   ```bash
   # Option 1: Using init script
   export DATABASE_URL="your-postgres-connection-string"
   ./init-db.sh
   
   # Option 2: Manual
   psql $DATABASE_URL -f src/schema.sql
   psql $DATABASE_URL -f src/migrations/*.sql
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

Server runs on http://localhost:3001

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Sessions
- `GET /api/sessions` - List user's sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Parameters
- `GET /api/parameters` - Get user parameters
- `POST /api/parameters` - Create parameter set
- `PUT /api/parameters/:id` - Update parameters
- `GET /api/parameters/active` - Get active parameters

### Strava
- `GET /api/strava/auth` - Initiate OAuth
- `POST /api/strava/exchange` - Exchange code for token
- `GET /api/strava/activities` - Sync activities
- `POST /api/strava/sync-session/:id` - Push session to Strava

### Routes
- `GET /api/gpx` - List routes
- `POST /api/gpx/upload` - Upload GPX file
- `GET /api/gpx/:id` - Get route details
- `DELETE /api/gpx/:id` - Delete route

### Waypoints
- `GET /api/waypoints/:routeId` - Get route waypoints
- `POST /api/waypoints` - Create waypoint
- `PUT /api/waypoints/:id` - Update waypoint
- `DELETE /api/waypoints/:id` - Delete waypoint

### Analytics
- `GET /api/analytics/overview` - Performance overview
- `GET /api/analytics/trends` - Historical trends
- `GET /api/analytics/segments/:sessionId` - Segment analysis

### Export
- `GET /api/export/session/:id` - Export session data
- `GET /api/export/gpx/:id` - Export route as GPX

### Health
- `GET /health` - API health check

## 🔒 Authentication

Protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are returned from `/api/auth/login` and `/api/auth/register`.

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel Dashboard**
   - Go to Settings > Environment Variables
   - Add all variables from `.env.example`

4. **Deploy to production:**
   ```bash
   npm run deploy
   ```

See **[TESTFLIGHT_SETUP.md](TESTFLIGHT_SETUP.md)** for complete guide.

### Environment Variables

Required variables (add in Vercel Dashboard):

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host.neon.tech/velomind
JWT_SECRET=<64-char-random-string>
STRAVA_CLIENT_ID=<your-strava-client-id>
STRAVA_CLIENT_SECRET=<your-strava-client-secret>
STRAVA_REDIRECT_URI=https://your-backend.vercel.app/strava/callback
MAX_FILE_SIZE=10485760
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🗄 Database

### Setup

The database schema is in `src/schema.sql`. It includes:

- **users** - User accounts and OAuth tokens
- **sessions** - Ride session data
- **session_data_points** - Time-series sensor data
- **routes** - GPX route data
- **route_waypoints** - Custom waypoints and alerts
- **rider_parameters** - Physical and performance parameters
- **learned_parameters** - ML-learned values

### Migrations

Migrations are in `src/migrations/`:
- `add_strava_columns.sql` - Strava integration fields
- `add_performance_indexes.sql` - Performance optimization indexes

Run all migrations:
```bash
./init-db.sh
```

### Database Provider

Recommended: **[Neon](https://neon.tech)** (PostgreSQL as a service)
- Free tier: 0.5 GB storage
- Automatic SSL
- Easy backups
- Connection pooling

## 🔧 Configuration

### CORS

Configured to allow:
- Localhost (development)
- Vercel deployments
- Mobile apps (no-origin requests)

Update in `src/index.js` if needed.

### Rate Limiting

Current limit: 100 requests per 15 minutes per IP

Adjust in `src/index.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

### File Uploads

Max file size: 10 MB (configurable via MAX_FILE_SIZE)

Handled by multer middleware for GPX uploads.

## 📊 Monitoring

### Vercel Logs
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project
3. Click "Deployments"
4. Click deployment > "Functions" tab

### Database Monitoring
- Monitor in Neon dashboard
- Check connection pool usage
- Review slow queries

### Health Check
```bash
curl https://your-backend.vercel.app/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-28T12:00:00.000Z"
}
```

## 🐛 Troubleshooting

### CORS Errors
- Mobile apps should work automatically (no-origin allowed)
- For web apps, add origin to `allowedOrigins` array

### Database Connection Fails
- Verify DATABASE_URL includes `?sslmode=require`
- Check Neon dashboard for database status
- Verify connection string credentials

### 401 Unauthorized
- Check JWT_SECRET is set correctly
- Verify token format: `Bearer <token>`
- Check token hasn't expired

### 500 Internal Server Error
- Check Vercel function logs
- Verify all environment variables are set
- Check database connectivity

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl https://your-backend.vercel.app/health

# Register user
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### With Postman
Import collection from API documentation above.

## 📱 iOS Integration

After deploying, update your iOS app:

```swift
// In your API configuration
let apiBaseURL = "https://your-backend.vercel.app"
```

See **[IOS_BACKEND_CONFIG.md](../IOS_BACKEND_CONFIG.md)** for complete iOS setup.

## 📄 License

MIT

## 👤 Author

William Skiles

## 🔗 Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Console](https://console.neon.tech)
- [Strava API](https://developers.strava.com)

---

**Ready to deploy!** Follow [TESTFLIGHT_SETUP.md](TESTFLIGHT_SETUP.md) to get started.
