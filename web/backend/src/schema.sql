-- VeloMind Database Schema for Neon PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    apple_id VARCHAR(255) UNIQUE,
    strava_id INTEGER UNIQUE,
    strava_access_token TEXT,
    strava_refresh_token TEXT,
    strava_token_expires_at BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rider parameters table
CREATE TABLE IF NOT EXISTS rider_parameters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Default',
    mass DECIMAL(6,2) NOT NULL DEFAULT 85.0,
    cda DECIMAL(6,4) NOT NULL DEFAULT 0.32,
    crr DECIMAL(6,5) NOT NULL DEFAULT 0.0045,
    drivetrain_loss DECIMAL(4,3) NOT NULL DEFAULT 0.03,
    ftp INTEGER,
    position VARCHAR(50) DEFAULT 'hoods',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    gpx_data TEXT NOT NULL,
    total_distance DECIMAL(10,2),
    total_elevation_gain DECIMAL(10,2),
    point_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route waypoints table
CREATE TABLE IF NOT EXISTS route_waypoints (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    type VARCHAR(50) DEFAULT 'alert',
    label VARCHAR(255),
    notes TEXT,
    distance_from_start DECIMAL(10,2),
    alert_distance INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE SET NULL,
    name VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER,
    distance DECIMAL(10,2),
    average_power DECIMAL(8,2),
    normalized_power DECIMAL(8,2),
    average_speed DECIMAL(6,2),
    average_cadence DECIMAL(6,2),
    average_heart_rate INTEGER,
    total_elevation_gain DECIMAL(10,2),
    tss DECIMAL(8,2),
    intensity_factor DECIMAL(4,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session data points (time series)
CREATE TABLE IF NOT EXISTS session_data_points (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    altitude DECIMAL(8,2),
    speed DECIMAL(6,2),
    cadence DECIMAL(6,2),
    heart_rate INTEGER,
    power DECIMAL(8,2),
    grade DECIMAL(6,4),
    wind_speed DECIMAL(6,2),
    wind_direction DECIMAL(6,2)
);

-- Calibration sessions table
CREATE TABLE IF NOT EXISTS calibration_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    average_speed DECIMAL(6,2),
    average_grade DECIMAL(6,4),
    average_wind DECIMAL(6,2),
    estimated_power DECIMAL(8,2),
    calibrated_cda DECIMAL(6,4),
    calibrated_crr DECIMAL(6,5),
    riding_position VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fitness metrics table
CREATE TABLE IF NOT EXISTS fitness_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    atl DECIMAL(8,2),
    ctl DECIMAL(8,2),
    tsb DECIMAL(8,2),
    tss DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_session_data_points_session_id ON session_data_points(session_id);
CREATE INDEX IF NOT EXISTS idx_session_data_points_timestamp ON session_data_points(timestamp);
CREATE INDEX IF NOT EXISTS idx_routes_user_id ON routes(user_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_route_id ON route_waypoints(route_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_user_id ON route_waypoints(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_metrics_user_date ON fitness_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_rider_parameters_user_id ON rider_parameters(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rider_parameters_updated_at BEFORE UPDATE ON rider_parameters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_waypoints_updated_at BEFORE UPDATE ON route_waypoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
