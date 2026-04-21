import { an as axios } from "./vendor-DqMYeBgE.js";
const trimTrailingSlash = (value) => String(value).replace(/\/+$/, "");
const normalizeApiBase = (value) => {
  const normalized = trimTrailingSlash(value);
  if (!normalized || normalized === "/") {
    return "/api";
  }
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};
const API_BASE = normalizeApiBase(
  "http://localhost:3001/api"
);
const buildApiUrl = (path = "") => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
const login = (email, password) => api.post("/auth/login", { email, password });
const register = (email, password, name) => api.post("/auth/register", { email, password, name });
const getCurrentUser = () => api.get("/auth/me");
const getSessions = (limit = 50, offset = 0) => api.get(`/sessions?limit=${limit}&offset=${offset}`);
const getSession = (id) => api.get(`/sessions/${id}`);
const getSessionAnalytics = (id) => api.get(`/sessions/${id}/analytics`);
const deleteSession = (id) => api.delete(`/sessions/${id}`);
const uploadGPX = (file, name) => {
  const formData = new FormData();
  formData.append("gpx", file);
  formData.append("name", name);
  return api.post("/gpx/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
const getRoutes = () => api.get("/gpx");
const getRoute = (id) => api.get(`/gpx/${id}`);
const deleteRoute = (id) => api.delete(`/gpx/${id}`);
const getParameters = () => api.get("/parameters");
const getActiveParameters = () => api.get("/parameters/active");
const createParameters = (data) => api.post("/parameters", data);
const updateParameters = (id, data) => api.put(`/parameters/${id}`, data);
const deleteParameters = (id) => api.delete(`/parameters/${id}`);
const getWaypoints = (routeId) => api.get(`/waypoints/route/${routeId}`);
const syncWaypoints = (routeId, waypoints) => api.post(`/waypoints/route/${routeId}/sync`, { waypoints });
const getAnalyticsOverview = (timeframe = 30) => api.get(`/analytics/overview?timeframe=${timeframe}`);
const getAnalyticsTrends = (metric = "power", timeframe = 90) => api.get(`/analytics/trends?metric=${metric}&timeframe=${timeframe}`);
const getAnalyticsRecords = () => api.get("/analytics/records");
const getIntelligenceSummary = (timeframe = 30) => api.get(`/analytics/intelligence?timeframe=${timeframe}`);
const syncStravaActivities = () => api.post("/strava/sync");
const syncStravaStreams = (sessionId) => api.post(`/strava/sync-streams/${sessionId}`);
const refreshAllStravaStreams = () => api.post("/strava/refresh-all-streams");
export {
  getIntelligenceSummary as a,
  getActiveParameters as b,
  refreshAllStravaStreams as c,
  deleteSession as d,
  getSession as e,
  getSessionAnalytics as f,
  getSessions as g,
  syncStravaStreams as h,
  buildApiUrl as i,
  getRoutes as j,
  uploadGPX as k,
  login as l,
  deleteRoute as m,
  getRoute as n,
  getWaypoints as o,
  syncWaypoints as p,
  getAnalyticsOverview as q,
  register as r,
  syncStravaActivities as s,
  getAnalyticsRecords as t,
  updateParameters as u,
  getAnalyticsTrends as v,
  getParameters as w,
  createParameters as x,
  deleteParameters as y,
  getCurrentUser as z
};
