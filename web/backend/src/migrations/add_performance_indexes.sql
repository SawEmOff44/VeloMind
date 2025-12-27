-- Performance optimization indexes for VeloMind database
-- Add these to improve query performance for analytics and frequent queries

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_start ON sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_route_id ON sessions(route_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_route ON sessions(user_id, route_id);

-- Session data points indexes
CREATE INDEX IF NOT EXISTS idx_session_data_points_session ON session_data_points(session_id);
CREATE INDEX IF NOT EXISTS idx_session_data_points_timestamp ON session_data_points(session_id, timestamp);

-- Routes table indexes
CREATE INDEX IF NOT EXISTS idx_routes_user_id ON routes(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_routes_user_created ON routes(user_id, created_at DESC);

-- Route points indexes
CREATE INDEX IF NOT EXISTS idx_route_points_route_id ON route_points(route_id);
CREATE INDEX IF NOT EXISTS idx_route_points_sequence ON route_points(route_id, sequence_number);

-- Route waypoints indexes
CREATE INDEX IF NOT EXISTS idx_route_waypoints_route_id ON route_waypoints(route_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_type ON route_waypoints(route_id, type);

-- Parameters indexes
CREATE INDEX IF NOT EXISTS idx_parameters_user_id ON parameters(user_id);
CREATE INDEX IF NOT EXISTS idx_parameters_active ON parameters(user_id, is_active);

-- Users indexes (if not already present)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_strava ON users(strava_athlete_id) WHERE strava_athlete_id IS NOT NULL;

-- Composite indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_sessions_analytics ON sessions(user_id, start_time DESC, average_power, distance, duration)
  WHERE average_power IS NOT NULL;

-- Add EXPLAIN ANALYZE results for common queries:
-- Example: EXPLAIN ANALYZE SELECT * FROM sessions WHERE user_id = ? ORDER BY start_time DESC LIMIT 50;
