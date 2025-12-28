# 🚀 Quick Reference - VeloMind Backend

## Environment Variables for Vercel

Copy/paste these into Vercel Dashboard > Settings > Environment Variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@your-neon-host.neon.tech/velomind?sslmode=require
JWT_SECRET=<run command below to generate>
STRAVA_CLIENT_ID=<your-strava-client-id>
STRAVA_CLIENT_SECRET=<your-strava-client-secret>
STRAVA_REDIRECT_URI=https://your-backend-url.vercel.app/strava/callback
MAX_FILE_SIZE=10485760
```

### Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Deploy Commands

```bash
# First deployment
cd web/backend
vercel

# Production deployment
vercel --prod

# Or use npm script
npm run deploy
```

## Database Setup

```bash
# After getting DATABASE_URL from Neon
export DATABASE_URL="your-postgresql-connection-string"
./init-db.sh
```

## Test Deployment

```bash
# Health check
curl https://your-backend-url.vercel.app/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

## Key Files Modified/Created

✅ [vercel.json](vercel.json) - Deployment config
✅ [package.json](package.json) - Deploy scripts added
✅ [src/index.js](src/index.js) - CORS updated for iOS
✅ [src/db.js](src/db.js) - SSL for production
✅ [init-db.sh](init-db.sh) - Database init script
✅ [.gitignore](.gitignore) - Sensitive files excluded

## Documentation

📖 [TESTFLIGHT_SETUP.md](TESTFLIGHT_SETUP.md) - Complete deployment guide
📖 [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) - Environment variables
📖 [README.md](README.md) - API documentation
📖 [../TESTFLIGHT_CHECKLIST.md](../../TESTFLIGHT_CHECKLIST.md) - Pre-launch checklist
📖 [../IOS_BACKEND_CONFIG.md](../../IOS_BACKEND_CONFIG.md) - iOS app config

## Production URLs

- Backend: `https://your-backend-url.vercel.app`
- Health: `https://your-backend-url.vercel.app/health`
- Vercel Dashboard: https://vercel.com/dashboard
- Neon Console: https://console.neon.tech

## Status Check

All local files are verified and production-ready! ✅

Once you finish setting up:
1. Vercel environment variables
2. Neon database
3. Strava OAuth redirect URI

You can deploy with: `npm run deploy`
