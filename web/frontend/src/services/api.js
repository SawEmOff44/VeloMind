import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const login = (email, password) => 
  api.post('/auth/login', { email, password })

export const register = (email, password, name) => 
  api.post('/auth/register', { email, password, name })

export const getCurrentUser = () => 
  api.get('/auth/me')

// Sessions
export const getSessions = (limit = 50, offset = 0) => 
  api.get(`/sessions?limit=${limit}&offset=${offset}`)

export const getSession = (id) => 
  api.get(`/sessions/${id}`)

export const getSessionAnalytics = (id) => 
  api.get(`/sessions/${id}/analytics`)

export const createSession = (data) => 
  api.post('/sessions', data)

export const deleteSession = (id) => 
  api.delete(`/sessions/${id}`)

// GPX Routes
export const uploadGPX = (file, name) => {
  const formData = new FormData()
  formData.append('gpx', file)
  formData.append('name', name)
  
  return api.post('/gpx/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getRoutes = () => 
  api.get('/gpx')

export const getRoute = (id) => 
  api.get(`/gpx/${id}`)

export const deleteRoute = (id) => 
  api.delete(`/gpx/${id}`)

// Parameters
export const getParameters = () => 
  api.get('/parameters')

export const getActiveParameters = () => 
  api.get('/parameters/active')

export const createParameters = (data) => 
  api.post('/parameters', data)

export const updateParameters = (id, data) => 
  api.put(`/parameters/${id}`, data)

export const deleteParameters = (id) => 
  api.delete(`/parameters/${id}`)

export const estimateParameters = (sessionId, knownPower) => 
  api.post('/parameters/estimate', { sessionId, knownPower })

// Strava
export const getStravaActivities = () => 
  api.get('/strava/activities')

export const syncStrava = () => 
  api.post('/strava/sync')

// Waypoints
export const getWaypoints = (routeId) =>
  api.get(`/waypoints/route/${routeId}`)

export const createWaypoint = (routeId, data) =>
  api.post(`/waypoints/route/${routeId}`, data)

export const updateWaypoint = (waypointId, data) =>
  api.put(`/waypoints/${waypointId}`, data)

export const deleteWaypoint = (waypointId) =>
  api.delete(`/waypoints/${waypointId}`)

export const syncWaypoints = (routeId, waypoints) =>
  api.post(`/waypoints/route/${routeId}/sync`, { waypoints })

export default api
