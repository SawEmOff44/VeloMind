import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import { getToken } from './services/auth'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Sessions = lazy(() => import('./pages/Sessions'))
const SessionDetail = lazy(() => import('./pages/SessionDetail'))
const RoutesPage = lazy(() => import('./pages/Routes'))
const RouteDetail = lazy(() => import('./pages/RouteDetail'))
const RouteComparison = lazy(() => import('./pages/RouteComparison'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Parameters = lazy(() => import('./pages/Parameters'))
const Settings = lazy(() => import('./pages/Settings'))
const StravaCallback = lazy(() => import('./pages/StravaCallback'))

function RouteLoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" />
      </div>
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken())
  
  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(!!getToken())
    }

    window.addEventListener('storage', syncAuthState)

    return () => {
      window.removeEventListener('storage', syncAuthState)
    }
  }, [])
  
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    return children
  }
  
  const PublicRoute = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />
    }
    return children
  }
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar isAuthenticated={isAuthenticated} />

        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            } />
            
            <Route path="/login" element={
              <PublicRoute>
                <Login onLogin={() => setIsAuthenticated(true)} />
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <Register onRegister={() => setIsAuthenticated(true)} />
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/sessions" element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            } />
            
            <Route path="/sessions/:id" element={
              <ProtectedRoute>
                <SessionDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/routes" element={
              <ProtectedRoute>
                <RoutesPage />
              </ProtectedRoute>
            } />
            
            <Route path="/routes/compare" element={
              <ProtectedRoute>
                <RouteComparison />
              </ProtectedRoute>
            } />
            
            <Route path="/routes/:id" element={
              <ProtectedRoute>
                <RouteDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            
            <Route path="/parameters" element={
              <ProtectedRoute>
                <Parameters />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="/strava/callback" element={
              <ProtectedRoute>
                <StravaCallback />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App
