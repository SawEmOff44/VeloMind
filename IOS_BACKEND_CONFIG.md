# iOS App Configuration for Production Backend

## Quick Reference

After deploying your backend to Vercel, update your iOS app with these changes:

### 1. Update API Base URL

Find where you define your API endpoint (typically in `APIService.swift` or similar):

```swift
// BEFORE (Development)
private let baseURL = "http://localhost:3001"

// AFTER (Production)
private let baseURL = "https://your-backend-url.vercel.app"
```

### 2. Use Build Configurations (Recommended)

This allows you to easily switch between development and production:

```swift
import Foundation

class APIConfiguration {
    static let shared = APIConfiguration()
    
    var baseURL: String {
        #if DEBUG
            return "http://localhost:3001"
        #else
            return "https://your-backend-url.vercel.app"
        #endif
    }
}

// Usage in your code:
let apiService = APIService(baseURL: APIConfiguration.shared.baseURL)
```

### 3. Update All API Endpoints

Make sure all your API calls use the base URL:

```swift
// Authentication
POST \(baseURL)/api/auth/register
POST \(baseURL)/api/auth/login

// Sessions
GET  \(baseURL)/api/sessions
POST \(baseURL)/api/sessions
GET  \(baseURL)/api/sessions/:id

// Parameters
GET  \(baseURL)/api/parameters
POST \(baseURL)/api/parameters
PUT  \(baseURL)/api/parameters/:id

// Strava
GET  \(baseURL)/api/strava/auth
POST \(baseURL)/api/strava/exchange
GET  \(baseURL)/api/strava/activities

// Routes
GET  \(baseURL)/api/gpx
POST \(baseURL)/api/gpx/upload
GET  \(baseURL)/api/gpx/:id

// Health Check
GET  \(baseURL)/health
```

### 4. Test Connection Before Release

Add a simple connectivity test:

```swift
func testBackendConnection() async throws -> Bool {
    let url = URL(string: "\(baseURL)/health")!
    let (data, response) = try await URLSession.shared.data(from: url)
    
    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 200 else {
        return false
    }
    
    let json = try JSONDecoder().decode([String: String].self, from: data)
    return json["status"] == "ok"
}
```

### 5. Handle Network Security

Add this to your `Info.plist` if you need to support HTTP during development:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <!-- Only for local development -->
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

For production (Vercel), HTTPS is automatic - no special configuration needed!

### 6. Environment-Specific Configurations

Create a configuration file:

**Config.swift:**
```swift
import Foundation

enum Environment {
    case development
    case production
    
    static var current: Environment {
        #if DEBUG
            return .development
        #else
            return .production
        #endif
    }
}

struct AppConfig {
    static let apiBaseURL: String = {
        switch Environment.current {
        case .development:
            return "http://localhost:3001"
        case .production:
            return "https://your-backend-url.vercel.app"
        }
    }()
    
    static let enableLogging: Bool = {
        return Environment.current == .development
    }()
}
```

**Usage:**
```swift
let url = URL(string: "\(AppConfig.apiBaseURL)/api/sessions")!
```

### 7. Update Strava Redirect URI

In your Strava OAuth flow, make sure the redirect URI matches your backend:

```swift
let stravaAuthURL = """
https://www.strava.com/oauth/authorize?\
client_id=\(clientId)&\
response_type=code&\
redirect_uri=\(AppConfig.apiBaseURL)/strava/callback&\
scope=read,activity:read_all,activity:write
"""
```

### 8. Add Request Timeout Configuration

```swift
let config = URLSessionConfiguration.default
config.timeoutIntervalForRequest = 30.0  // 30 seconds
config.timeoutIntervalForResource = 300.0  // 5 minutes for uploads

let session = URLSession(configuration: config)
```

## Testing Checklist

Before submitting to TestFlight:

- [ ] Health endpoint responds: `GET /health`
- [ ] User can register/login
- [ ] Sessions can be created and retrieved
- [ ] Parameters can be updated
- [ ] Strava OAuth flow works
- [ ] GPX upload works
- [ ] All API calls use HTTPS in production
- [ ] Error handling works for network failures
- [ ] App handles backend being temporarily unavailable

## Common Issues

### Issue: "The resource could not be loaded"
- Check that baseURL is correct (no trailing slash)
- Verify backend is deployed and accessible
- Check Vercel deployment status

### Issue: Authentication fails
- Verify JWT_SECRET is set in Vercel
- Check token storage and retrieval in iOS app
- Ensure Authorization header format: `Bearer <token>`

### Issue: Strava OAuth fails
- Verify redirect URI matches in Strava settings and your backend
- Check STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in Vercel
- Test the OAuth flow manually with curl first

## Production Readiness

Your app is ready for TestFlight when:

✅ All API endpoints work with production backend  
✅ Authentication persists across app launches  
✅ Error messages are user-friendly  
✅ Network errors don't crash the app  
✅ Loading states are shown during API calls  
✅ Sensitive data (tokens) is stored securely in Keychain  
✅ API requests include proper headers  
✅ Logging is disabled or minimized in production builds  

---

**Your backend is at:** `https://your-backend-url.vercel.app`

Replace `your-backend-url` with your actual Vercel deployment URL!
