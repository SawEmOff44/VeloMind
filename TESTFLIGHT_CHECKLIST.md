# 🚀 TestFlight Pre-Launch Checklist

Use this checklist to ensure your backend is properly configured before submitting to TestFlight.

## ☑️ Backend Deployment

### Step 1: Database Setup
- [ ] Created Neon PostgreSQL account
- [ ] Created production database project
- [ ] Copied database connection string
- [ ] Ran `init-db.sh` or manually executed schema.sql
- [ ] Ran all migration files
- [ ] Verified tables exist with test query

**Verify:** 
```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
```

### Step 2: Vercel Deployment
- [ ] Installed Vercel CLI (`npm i -g vercel`)
- [ ] Logged in to Vercel (`vercel login`)
- [ ] Deployed backend (`cd web/backend && vercel`)
- [ ] Noted deployment URL
- [ ] Deployed to production (`vercel --prod`)

**Your Backend URL:** `___________________________________`

### Step 3: Environment Variables in Vercel
Go to Vercel Dashboard > Your Project > Settings > Environment Variables

- [ ] NODE_ENV = `production`
- [ ] DATABASE_URL = `postgresql://...`
- [ ] JWT_SECRET = (generated 64-char string)
- [ ] STRAVA_CLIENT_ID = (from Strava)
- [ ] STRAVA_CLIENT_SECRET = (from Strava)
- [ ] STRAVA_REDIRECT_URI = `https://your-backend.vercel.app/strava/callback`
- [ ] MAX_FILE_SIZE = `10485760`
- [ ] Set all for: Production ✓ Preview ✓ Development ✓

### Step 4: Strava Configuration
Go to https://www.strava.com/settings/api

- [ ] Updated Authorization Callback Domain to `your-backend.vercel.app`
- [ ] Added callback URL: `https://your-backend.vercel.app/strava/callback`
- [ ] Verified Client ID matches Vercel env var
- [ ] Verified Client Secret matches Vercel env var

### Step 5: Backend Testing
Test each endpoint:

**Health Check:**
```bash
curl https://your-backend.vercel.app/health
```
- [ ] Returns: `{"status":"ok","timestamp":"..."}`

**User Registration:**
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'
```
- [ ] Returns user object with JWT token

**User Login:**
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```
- [ ] Returns JWT token

**Protected Endpoint (with token from above):**
```bash
curl https://your-backend.vercel.app/api/parameters \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
- [ ] Returns parameters (empty array is OK)

## ☑️ iOS App Configuration

### Step 6: Update iOS App
- [ ] Updated API base URL to production Vercel URL
- [ ] Used build configurations (#if DEBUG) for dev/prod switching
- [ ] Removed or commented out localhost URLs
- [ ] Updated all API endpoint URLs
- [ ] Verified HTTPS is used for all production calls

**In your code, verify:**
```swift
// Production URL is set
let baseURL = "https://your-backend.vercel.app"

// Or using build configs
#if DEBUG
  let baseURL = "http://localhost:3001"  // Dev only
#else
  let baseURL = "https://your-backend.vercel.app"  // Production
#endif
```

### Step 7: iOS App Testing
Test from iOS app:

- [ ] App can reach health endpoint
- [ ] User registration works
- [ ] User login works
- [ ] JWT token is stored and used
- [ ] Sessions can be created
- [ ] Sessions can be retrieved
- [ ] Parameters can be updated
- [ ] Strava OAuth flow works (if implemented)
- [ ] GPX upload works (if implemented)
- [ ] Error messages are user-friendly
- [ ] Loading states work during API calls

## ☑️ Security & Production Readiness

### Step 8: Security Review
- [ ] JWT_SECRET is strong (64+ characters)
- [ ] No secrets in code or git history
- [ ] .env file is in .gitignore
- [ ] Database uses SSL (automatic with Neon)
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Rate limiting is active
- [ ] Helmet.js security headers enabled
- [ ] CORS properly configured
- [ ] Sensitive data not logged

### Step 9: Error Handling
- [ ] App handles network failures gracefully
- [ ] App handles server errors (500) without crashing
- [ ] App handles unauthorized errors (401)
- [ ] User sees friendly error messages
- [ ] Loading indicators shown during API calls
- [ ] Timeouts are reasonable (30s request, 5min upload)

### Step 10: Data Management
- [ ] User tokens stored securely (Keychain)
- [ ] User can logout
- [ ] Sessions persist locally
- [ ] Sync works between device and server
- [ ] No data loss on app restart

## ☑️ TestFlight Preparation

### Step 11: App Store Connect
- [ ] App created in App Store Connect
- [ ] Bundle ID matches your Xcode project
- [ ] App name and description added
- [ ] Privacy policy URL added (if required)
- [ ] TestFlight beta info completed
- [ ] Test users or groups created

### Step 12: Xcode Archive
- [ ] Build configuration set to Release
- [ ] Version number incremented
- [ ] Build number incremented
- [ ] Provisioning profile is valid
- [ ] Certificates are valid
- [ ] Archive builds successfully
- [ ] No compiler warnings (or minimal)

### Step 13: Upload to TestFlight
- [ ] Archived app uploaded via Xcode
- [ ] App processes successfully (may take 10-30 min)
- [ ] Export compliance questions answered
- [ ] Build shows as "Ready to Submit"
- [ ] Added to internal testing group
- [ ] Test notes added for testers

### Step 14: Beta Testing
- [ ] Internal testers received invite
- [ ] At least one tester downloaded app
- [ ] At least one tester successfully used core features
- [ ] Backend logs show real usage
- [ ] No critical bugs reported

## ☑️ Monitoring & Support

### Step 15: Set Up Monitoring
- [ ] Bookmarked Vercel deployment URL
- [ ] Bookmarked Vercel dashboard
- [ ] Bookmarked Neon dashboard
- [ ] Can access Vercel function logs
- [ ] Can access Neon database stats
- [ ] Set up email alerts (optional)

### Step 16: Documentation
- [ ] Noted backend URL for reference
- [ ] Noted database connection string (secure location)
- [ ] Saved Strava API credentials
- [ ] Documented any custom configurations
- [ ] Shared necessary info with team (if applicable)

## 🎉 Ready to Launch!

When all checkboxes are complete, you're ready for TestFlight! 

### Quick Reference Links

**Your Production Setup:**
- Backend URL: `___________________________________`
- Vercel Dashboard: https://vercel.com/dashboard
- Neon Dashboard: https://console.neon.tech
- Strava API: https://www.strava.com/settings/api
- TestFlight: https://appstoreconnect.apple.com

### Support Documents
- [TESTFLIGHT_SETUP.md](TESTFLIGHT_SETUP.md) - Complete deployment guide
- [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) - Environment variable details
- [IOS_BACKEND_CONFIG.md](../IOS_BACKEND_CONFIG.md) - iOS configuration guide
- [README.md](README.md) - API documentation

### If Something Goes Wrong

1. **Check Vercel logs** - Most issues show up here first
2. **Check Neon status** - Database connectivity issues
3. **Test with curl** - Verify API endpoints work outside the app
4. **Review checklist** - Make sure nothing was skipped
5. **Check environment variables** - Most common issue

### Post-Launch Tasks

After successful TestFlight deployment:

- [ ] Monitor Vercel logs for errors
- [ ] Check Neon database usage
- [ ] Gather beta tester feedback
- [ ] Fix any reported bugs
- [ ] Iterate on backend performance
- [ ] Prepare for App Store submission

---

**Good luck with your TestFlight launch! 🚀**
