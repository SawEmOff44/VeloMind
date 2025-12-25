# VeloMind Web Application - Complete Structure

## 🎯 Site Structure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     VeloMind Platform                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────────┐
│   PUBLIC SECTION         │  │   AUTHENTICATED SECTION      │
│   (Marketing)            │  │   (Application Features)     │
├──────────────────────────┤  ├──────────────────────────────┤
│                          │  │                              │
│  ┌──────────────────┐   │  │  ┌──────────────────────┐   │
│  │  Landing Page    │   │  │  │  Dashboard           │   │
│  │  (/)             │   │  │  │  (/dashboard)        │   │
│  │                  │   │  │  │                      │   │
│  │  • Hero Section  │   │  │  │  • Stats Overview    │   │
│  │  • Features      │   │  │  │  • Recent Sessions   │   │
│  │  • How It Works  │   │  │  │  • Quick Actions     │   │
│  │  • CTA Buttons   │   │  │  └──────────────────────┘   │
│  └──────────────────┘   │  │                              │
│           │              │  │  ┌──────────────────────┐   │
│           ▼              │  │  │  Sessions            │   │
│  ┌──────────────────┐   │  │  │  (/sessions)         │   │
│  │  Register        │   │  │  │                      │   │
│  │  (/register)     │───┼──┼──│  • Session List      │   │
│  └──────────────────┘   │  │  │  • Session Detail    │   │
│           │              │  │  │  • Analytics Charts  │   │
│           ▼              │  │  └──────────────────────┘   │
│  ┌──────────────────┐   │  │                              │
│  │  Login           │   │  │  ┌──────────────────────┐   │
│  │  (/login)        │───┼──┼──│  Routes              │   │
│  └──────────────────┘   │  │  │  (/routes)           │   │
│                          │  │  │                      │   │
│  Redirects to:           │  │  │  • GPX Upload        │   │
│  • Landing if logged in │  │  │  • Route List        │   │
│  • Login if accessing   │  │  │  • Route Management  │   │
│    protected routes     │  │  └──────────────────────┘   │
│                          │  │                              │
└──────────────────────────┘  │  ┌──────────────────────┐   │
                               │  │  Parameters          │   │
                               │  │  (/parameters)       │   │
                               │  │                      │   │
                               │  │  • Create Profiles   │   │
                               │  │  • Edit Parameters   │   │
                               │  │  • CdA Calculation   │   │
                               │  └──────────────────────┘   │
                               │                              │
                               │  ┌──────────────────────┐   │
                               │  │  Settings            │   │
                               │  │  (/settings)         │   │
                               │  │                      │   │
                               │  │  • Account Info      │   │
                               │  │  • Strava Connect    │   │
                               │  │  • Integrations      │   │
                               │  └──────────────────────┘   │
                               │                              │
                               └──────────────────────────────┘
```

## 📁 File Structure

```
web/
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── index.js             # Server setup
│   │   ├── routes/
│   │   │   ├── auth.js          # Registration & Login
│   │   │   ├── sessions.js      # Session analytics
│   │   │   ├── gpx.js           # GPX upload
│   │   │   ├── parameters.js    # Rider parameters
│   │   │   └── strava.js        # Strava OAuth ✨ NEW
│   │   └── schema.sql           # PostgreSQL schema
│   └── package.json
│
├── frontend/                     # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx              # Routing logic (UPDATED)
│   │   ├── components/
│   │   │   └── Navbar.jsx       # Dynamic nav (UPDATED)
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Marketing page ✨ NEW (207 lines)
│   │   │   ├── Login.jsx        # Sign in (UPDATED)
│   │   │   ├── Register.jsx     # Sign up (UPDATED)
│   │   │   ├── Dashboard.jsx    # App home
│   │   │   ├── Sessions.jsx     # Session list
│   │   │   ├── SessionDetail.jsx# Session analytics
│   │   │   ├── Routes.jsx       # GPX management
│   │   │   ├── Parameters.jsx   # Rider config
│   │   │   ├── Settings.jsx     # Account settings ✨ NEW (144 lines)
│   │   │   └── StravaCallback.jsx # OAuth handler ✨ NEW (69 lines)
│   │   └── services/
│   │       ├── api.js           # API client
│   │       └── auth.js          # Auth helpers
│   └── package.json
│
├── README.md                     # Full documentation
├── QUICKSTART.md                 # Setup guide
├── IMPLEMENTATION.md             # Technical details
└── LANDING_PAGE.md              # Restructuring notes ✨ NEW
```

## 🎨 New Components Added

### 1. Landing Page (207 lines)
**Purpose**: Convert visitors to registered users

**Sections**:
- **Hero**: Bold headline, value proposition, dual CTA
- **Features Grid**: 6 key features with icons
  - Real-time power estimation
  - Advanced analytics
  - Smart route matching
  - Custom parameters
  - Heart rate zones
  - Strava integration
- **How It Works**: 3-step process
- **CTA Section**: Final conversion push
- **Footer**: Copyright info

**Design**: Modern, clean, conversion-optimized

### 2. Settings Page (144 lines)
**Purpose**: User account management

**Sections**:
- **Account Info**: Name, email, member since
- **Strava Integration**: 
  - Connect/disconnect button
  - Visual status indicator
  - OAuth flow explanation
- **Bluetooth Devices**: Info about iOS app management
- **Danger Zone**: Account deletion (coming soon)

**Features**:
- OAuth redirect to Strava
- Connection status tracking
- Error handling

### 3. Strava Callback (69 lines)
**Purpose**: Handle OAuth return flow

**Features**:
- Extract OAuth code from URL
- Send to backend for token exchange
- Loading state with spinner
- Error handling with redirects
- Success redirect to settings

## 🔄 User Flow Examples

### New User Registration
```
1. Visit https://velomind.com
   └─> Landing page displays

2. Click "Get Started Free"
   └─> /register

3. Fill out form (name, email, password)
   └─> Submit

4. Account created + Auto login
   └─> Redirect to /dashboard

5. See empty state with onboarding prompts
   └─> "Upload your first route"
   └─> "Create rider parameters"
   └─> "Connect Strava"
```

### Returning User
```
1. Visit https://velomind.com
   └─> Landing page (logged out)

2. Click "Sign In" in navbar
   └─> /login

3. Enter credentials
   └─> Submit

4. Authenticated
   └─> Redirect to /dashboard

5. Access all features via navbar
   └─> Dashboard, Sessions, Routes, Parameters, Settings
```

### Strava Connection Flow
```
1. Navigate to Settings
   └─> /settings

2. Click "Connect with Strava"
   └─> Redirect to strava.com/oauth/authorize

3. User authorizes on Strava
   └─> Strava redirects to /strava/callback?code=XXX

4. Callback page processes OAuth
   └─> Sends code to backend
   └─> Backend exchanges for access token
   └─> Stores in database

5. Redirect to Settings
   └─> Shows "Connected to Strava" ✓
   └─> Activities start syncing
```

## 🎯 Authentication Logic

### PublicRoute Wrapper
```javascript
// Redirects authenticated users to dashboard
if (isAuthenticated) {
  return <Navigate to="/dashboard" />
}
return children
```

**Applied to**: `/`, `/login`, `/register`

### ProtectedRoute Wrapper
```javascript
// Redirects unauthenticated users to login
if (!isAuthenticated) {
  return <Navigate to="/login" />
}
return children
```

**Applied to**: All app features (dashboard, sessions, routes, etc.)

## 🎨 Navbar Behavior

### Unauthenticated State
```
┌─────────────────────────────────────────────┐
│ 🚴 VeloMind          Sign In | Get Started  │
└─────────────────────────────────────────────┘
```

### Authenticated State
```
┌────────────────────────────────────────────────────────────┐
│ 🚴 VeloMind  Dashboard Sessions Routes Parameters Settings │ Logout │
└────────────────────────────────────────────────────────────┘
```

**Features**:
- Active route highlighting (blue underline)
- Dynamic links based on auth state
- Logo links to landing or dashboard

## 📊 Statistics

### Code Added
- **3 new pages**: 420 lines total
- **Landing.jsx**: 207 lines (hero, features, CTAs)
- **Settings.jsx**: 144 lines (account, Strava, integrations)
- **StravaCallback.jsx**: 69 lines (OAuth handler)

### Files Modified
- **App.jsx**: Added PublicRoute, Landing route
- **Navbar.jsx**: Dynamic content for auth state
- **Login.jsx**: Redirect to /dashboard
- **Register.jsx**: Redirect to /dashboard
- **.env.example**: Added VITE_STRAVA_CLIENT_ID

### Total Web App Size
- **Backend**: 9 files, ~1,500 lines
- **Frontend**: 13 pages/components, ~2,200 lines
- **Total**: 36+ files, ~3,700 lines

## 🚀 Ready for Launch

The VeloMind web application is now structured as a complete platform:

✅ Professional marketing presence  
✅ Clear user onboarding flow  
✅ Feature-gated application access  
✅ Strava integration for social features  
✅ Settings and account management  
✅ Responsive design (mobile-ready)  
✅ Modern UX with loading states  
✅ Error handling throughout  

**Ready to attract users and grow the cycling community!** 🚴‍♂️💨
