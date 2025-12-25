import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import SessionDetail from './pages/SessionDetail'
import RoutesPage from './pages/Routes'
import Parameters from './pages/Parameters'
import Settings from './pages/Settings'
import StravaCallback from './pages/StravaCallback'
import { getToken } from './services/auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    setIsAuthenticated(!!getToken())
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
      </div>
    </Router>
  )
}

export default App
