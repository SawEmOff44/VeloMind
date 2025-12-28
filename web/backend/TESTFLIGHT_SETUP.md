# TestFlight Deployment Guide - VeloMind Backend

## Quick Start

Get your backend ready for iOS TestFlight testing in 5 steps:

### 1️⃣ Create Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click "New Project"
3. Name it: `velomind-production`
4. Select region closest to your users
5. Copy the **Connection String** (looks like: `postgresql://user:pass@host.neon.tech/dbname`)

### 2️⃣ Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Navigate to backend folder
cd web/backend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: velomind-backend
# - Deploy? Yes
```

Your backend will be deployed to: `https://velomind-backend.vercel.app` (or similar)

### 3️⃣ Configure Environment Variables in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `velomind-backend` project
3. Go to **Settings** > **Environment Variables**
4. Add these variables (for Production, Preview, and Development):

#### Required Variables:

**NODE_ENV**
```
production
```

**DATABASE_URL** (from step 1)
```
postgresql://username:password@your-host.neon.tech/velomind?sslmode=require
```

**JWT_SECRET** (generate a strong random string)
```bash
# Run this command to generate:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Then paste the output as your JWT_SECRET value.

**STRAVA_CLIENT_ID**
```
Your Strava app client ID
```

**STRAVA_CLIENT_SECRET**
```
Your Strava app client secret
```

**STRAVA_REDIRECT_URI**
```
https://your-backend-url.vercel.app/strava/callback
```

**MAX_FILE_SIZE**
```
10485760
```

### 4️⃣ Initialize Database

```bash
# Set your database URL locally for the script
export DATABASE_URL="your-connection-string-from-step-1"

# Run the initialization script
cd web/backend
./init-db.sh
```

Or manually in Neon's SQL Editor:
1. Go to your Neon dashboard
2. Click "SQL Editor"
3. Copy/paste contents of `src/schema.sql` and run
4. Copy/paste contents of `src/migrations/add_strava_columns.sql` and run
5. Copy/paste contents of `src/migrations/add_performance_indexes.sql` and run

### 5️⃣ Update Strava App Settings

1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Update your app:
   - **Authorization Callback Domain**: `your-backend-url.vercel.app`
   - Add this callback URL: `https://your-backend-url.vercel.app/strava/callback`
3. Save changes

### 6️⃣ Redeploy with Environment Variables

```bash
cd web/backend
vercel --prod
```

## Testing Your Backend

Test the deployment:

```bash
# Health check
curl https://your-backend-url.vercel.app/health

# Expected response:
# {"status":"ok","timestamp":"2024-12-28T..."}
```

## Configure iOS App

Now update your iOS app to use the production backend:

1. Find your API configuration (likely in `APIService.swift` or similar)
2. Update the base URL:

```swift
// Development
// let apiBaseURL = "http://localhost:3001"

// Production
let apiBaseURL = "https://your-backend-url.vercel.app"
```

Or use build configurations:

```swift
#if DEBUG
    let apiBaseURL = "http://localhost:3001"
#else
    let apiBaseURL = "https://your-backend-url.vercel.app"
#endif
```

## Common Issues & Solutions

### Issue: CORS errors from iOS app
**Solution**: The backend is configured to allow requests with no origin, which is how mobile apps work. This should work automatically.

### Issue: Database connection fails
**Solution**: 
- Verify DATABASE_URL in Vercel settings
- Make sure it ends with `?sslmode=require`
- Check that your Neon database is active

### Issue: Strava OAuth not working
**Solution**:
- Verify STRAVA_REDIRECT_URI matches exactly in both Vercel and Strava settings
- Make sure Authorization Callback Domain in Strava doesn't include `https://`

### Issue: 500 errors on API calls
**Solution**:
- Check Vercel logs: Project > Deployments > Click deployment > Functions tab
- Check for missing environment variables
- Verify database schema is initialized

## Monitoring & Maintenance

**View Logs:**
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on latest deployment
5. Go to "Functions" tab to see logs

**Database Usage:**
- Monitor in Neon dashboard
- Free tier: 0.5 GB storage, 1 million rows
- Upgrade if needed

**Rate Limiting:**
- Currently: 100 requests per 15 minutes per IP
- Adjust in `src/index.js` if needed

## Next Steps

After backend is live:

1. ✅ Test all API endpoints from your iOS app
2. ✅ Test authentication flow
3. ✅ Test Strava integration
4. ✅ Test session sync
5. ✅ Submit to TestFlight
6. ✅ Monitor logs during beta testing

## Production URLs

Keep these handy:

- **Backend API**: https://your-backend-url.vercel.app
- **Health Check**: https://your-backend-url.vercel.app/health
- **Strava Callback**: https://your-backend-url.vercel.app/strava/callback
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Dashboard**: https://console.neon.tech

## Support

If you run into issues:
1. Check Vercel deployment logs
2. Check Neon database status
3. Verify all environment variables are set correctly
4. Test API endpoints with curl or Postman before testing with iOS app

---

**Ready for TestFlight! 🚀**

Once you confirm the backend is working with health check and basic API tests, you're ready to upload your iOS app to TestFlight.
