import Foundation

/// Wind data from weather service
struct WindData: Codable {
    let speed: Double           // m/s
    let direction: Double       // degrees (0-360, where 0 is North)
    let timestamp: Date
    let location: (lat: Double, lon: Double)
    
    enum CodingKeys: String, CodingKey {
        case speed, direction, timestamp, latitude, longitude
    }
    
    init(speed: Double, direction: Double, timestamp: Date, latitude: Double, longitude: Double) {
        self.speed = speed
        self.direction = direction
        self.timestamp = timestamp
        self.location = (latitude, longitude)
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        speed = try container.decode(Double.self, forKey: .speed)
        direction = try container.decode(Double.self, forKey: .direction)
        timestamp = try container.decode(Date.self, forKey: .timestamp)
        let lat = try container.decode(Double.self, forKey: .latitude)
        let lon = try container.decode(Double.self, forKey: .longitude)
        location = (lat, lon)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(speed, forKey: .speed)
        try container.encode(direction, forKey: .direction)
        try container.encode(timestamp, forKey: .timestamp)
        try container.encode(location.lat, forKey: .latitude)
        try container.encode(location.lon, forKey: .longitude)
    }
    
    /// Calculate headwind component given bearing (direction of travel)
    func headwindComponent(bearing: Double) -> Double {
        // Wind direction is where wind is coming FROM
        // Convert to radians
        let windRad = direction * .pi / 180.0
        let bearingRad = bearing * .pi / 180.0
        
        // Angle difference between wind direction and travel direction
        let angleDiff = windRad - bearingRad
        
        // Headwind is positive, tailwind is negative
        let headwind = speed * cos(angleDiff)
        
        return headwind
    }
}

/// Weather data
struct WeatherData: Codable {
    let temperature: Double     // Celsius
    let humidity: Double        // 0-100
    let pressure: Double        // hPa
    let timestamp: Date
}
