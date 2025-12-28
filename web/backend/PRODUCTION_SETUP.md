# Production Environment Variables for VeloMind Backend

## Required for Vercel Deployment

Copy these to your Vercel project settings (Settings > Environment Variables):

### Server Configuration
```
NODE_ENV=production
```

### Database (Neon PostgreSQL)
```
DATABASE_URL=postgresql://username:password@your-neon-host.neon.tech/velomind?sslmode=require
```
**How to get this:**
1. Go to https://neon.tech
2. Create a new project named "velomind-production"
3. Copy the connection string from the dashboard
4. Make sure to use the "pooled connection" string for better performance

### JWT Secret
```
JWT_SECRET=generate-a-secure-random-string-at-least-64-characters-long
```
**How to generate:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Strava OAuth
```
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_REDIRECT_URI=https://your-backend-url.vercel.app/strava/callback
```
**How to get this:**
1. Go to https://www.strava.com/settings/api
2. Update your Strava app settings:
   - Authorization Callback Domain: your-backend-url.vercel.app
   - Add callback URL: https://your-backend-url.vercel.app/strava/callback

### CORS (Optional - for web frontend)
```
CORS_ORIGIN=https://velo-mind.vercel.app
```

### File Upload
```
MAX_FILE_SIZE=10485760
```

## Setting up in Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from backend directory:**
   ```bash
   cd web/backend
   vercel
   ```

4. **Add Environment Variables:**
   - Go to your project in Vercel Dashboard
   - Navigate to Settings > Environment Variables
   - Add all the variables listed above
   - Make sure to add them for Production, Preview, and Development

5. **Redeploy after adding variables:**
   ```bash
   vercel --prod
   ```

## Database Setup

After deploying, you need to initialize the database:

1. **Run the schema:**
   ```bash
   # Connect to your Neon database using psql or Neon's SQL Editor
   # Copy and paste the contents of src/schema.sql
   ```

2. **Run migrations:**
   ```bash
   # Run each migration in the migrations folder in order
   # src/migrations/add_strava_columns.sql
   # src/migrations/add_performance_indexes.sql
   ```

## Testing Your Deployment

Once deployed, test the health endpoint:
```bash
curl https://your-backend-url.vercel.app/health
```

You should get:
```json
{"status":"ok","timestamp":"2024-12-28T..."}
```

## iOS App Configuration

Update your iOS app to point to the production backend:

In your Swift code, change the API base URL to:
```swift
let apiBaseURL = "https://your-backend-url.vercel.app"
```

Make sure to update:
- Authentication endpoints
- Session sync endpoints
- Strava integration endpoints
- Any other API calls

## Security Checklist

- ✅ HTTPS enforced (automatic with Vercel)
- ✅ Helmet.js for security headers
- ✅ Rate limiting configured
- ✅ CORS properly configured
- ✅ JWT secret is strong and secure
- ✅ Database uses SSL connections
- ✅ No sensitive data in logs
- ✅ Environment variables not committed to git

## Monitoring

- Check logs in Vercel dashboard: https://vercel.com/dashboard
- Monitor database usage in Neon dashboard
- Set up alerts for errors and high usage

## Support

If you encounter issues:
- Check Vercel deployment logs
- Check Neon database connection
- Verify all environment variables are set
- Test API endpoints with curl or Postman
