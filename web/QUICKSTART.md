# VeloMind Web Application - Quick Start

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended: https://neon.tech)
- Git

## 1. Database Setup

1. Create a Neon database at https://neon.tech (free tier available)
2. Copy your connection string (format: `postgresql://user:password@host/database?sslmode=require`)
3. Run the schema:

```bash
# From the web/backend directory
psql "YOUR_DATABASE_URL" < src/schema.sql
```

## 2. Backend Setup

```bash
cd web/backend
npm install

# Create .env file
cat > .env << EOL
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=$(openssl rand -hex 32)
PORT=3001
NODE_ENV=development
STRAVA_CLIENT_ID=your-strava-client-id-optional
STRAVA_CLIENT_SECRET=your-strava-client-secret-optional
STRAVA_REDIRECT_URI=http://localhost:5173/strava/callback
EOL

# Start backend
npm run dev
```

Backend will run on http://localhost:3001

## 3. Frontend Setup

```bash
cd web/frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001" > .env

# Start frontend
npm run dev
```

Frontend will run on http://localhost:5173

## 4. First Use

1. Navigate to http://localhost:5173
2. Click "Register" to create an account
3. Upload a GPX route from the Routes page
4. Create rider parameters from the Parameters page
5. Sessions will appear automatically when created from the iOS app

## iOS App Integration

To connect the iOS app:

1. Update `APIManager.swift` with your backend URL:
   ```swift
   private let baseURL = "http://localhost:3001" // or your production URL
   ```

2. The iOS app will:
   - Fetch routes for ride matching
   - Fetch rider parameters for power calculations
   - Upload sessions after completing rides
   - Sync with Strava if configured

## Strava Integration (Optional)

1. Create a Strava API application: https://www.strava.com/settings/api
2. Set Authorization Callback Domain to `localhost` (for development)
3. Add Client ID and Secret to backend `.env`
4. Users can connect Strava from the web dashboard

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Ensure PostgreSQL accepts connections
- Run schema.sql if tables are missing

### Frontend API errors
- Verify backend is running on port 3001
- Check VITE_API_URL in frontend .env
- Check browser console for CORS errors

### Sessions not appearing
- Ensure iOS app has correct backend URL
- Check network connectivity
- Verify JWT token is valid

## Production Deployment

See [web/README.md](README.md) for production deployment instructions (Render + Netlify/Vercel).
