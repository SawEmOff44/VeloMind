import Foundation
import CoreLocation
import os.log

/// Manages weather and wind data from Open-Meteo
@MainActor
class WeatherManager: ObservableObject {
    @Published var currentWind: WindData?
    @Published var currentWeather: WeatherData?
    @Published var currentTemperature: Double?    // Celsius
    @Published var currentHumidity: Double?       // Percentage (0-100)
    @Published var lastUpdateTime: Date?
    @Published var isOnline = true
    
    private let logger = Logger(subsystem: "com.velomind.app", category: "Weather")
    private let baseURL = "https://api.open-meteo.com/v1/forecast"
    
    // Fetch intervals
    private let timeInterval: TimeInterval = 60  // seconds
    private let distanceInterval: Double = 800   // meters (approximately 0.5 miles)
    
    private var lastFetchLocation: CLLocation?
    private var lastFetchTime: Date?
    
    // MARK: - Public Methods
    
    func shouldFetchWeather(at location: CLLocation) -> Bool {
        // Fetch if we've never fetched
        guard let lastLocation = lastFetchLocation,
              let lastTime = lastFetchTime else {
            return true
        }
        
        // Fetch if time interval exceeded
        if Date().timeIntervalSince(lastTime) >= timeInterval {
            return true
        }
        
        // Fetch if distance interval exceeded
        let distance = location.distance(from: lastLocation)
        if distance >= distanceInterval {
            return true
        }
        
        return false
    }
    
    func fetchWeather(at location: CLLocation) async {
        guard shouldFetchWeather(at: location) else {
            return
        }
        
        let lat = location.coordinate.latitude
        let lon = location.coordinate.longitude
        
        // Build URL with parameters
        var components = URLComponents(string: baseURL)!
        components.queryItems = [
            URLQueryItem(name: "latitude", value: String(lat)),
            URLQueryItem(name: "longitude", value: String(lon)),
            URLQueryItem(name: "current", value: "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m"),
            URLQueryItem(name: "wind_speed_unit", value: "ms"),
            URLQueryItem(name: "timezone", value: "auto")
        ]
        
        guard let url = components.url else {
            logger.error("Invalid weather URL")
            return
        }
        
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                logger.error("Weather API request failed")
                isOnline = false
                return
            }
            
            let weatherResponse = try JSONDecoder().decode(OpenMeteoResponse.self, from: data)
            
            // Update wind data
            if let windSpeed = weatherResponse.current.windSpeed10m,
               let windDirection = weatherResponse.current.windDirection10m {
                currentWind = WindData(
                    speed: windSpeed,
                    direction: windDirection,
                    timestamp: Date(),
                    latitude: lat,
                    longitude: lon
                )
            }
            
            // Update weather data
            if let temperature = weatherResponse.current.temperature2m,
               let humidity = weatherResponse.current.relativeHumidity2m,
               let pressure = weatherResponse.current.surfacePressure {
                currentWeather = WeatherData(
                    temperature: temperature,
                    humidity: humidity,
                    pressure: pressure,
                    timestamp: Date()
                )
                
                // Also update separate properties for easy access
                currentTemperature = temperature
                currentHumidity = humidity
            }
            
            lastFetchLocation = location
            lastFetchTime = Date()
            lastUpdateTime = Date()
            isOnline = true
            
            logger.info("Weather updated: wind \(weatherResponse.current.windSpeed10m ?? 0, privacy: .public) m/s @ \(weatherResponse.current.windDirection10m ?? 0, privacy: .public)°")
            
        } catch {
            logger.error("Weather fetch error: \(error.localizedDescription)")
            isOnline = false
            
            // Apply decay to cached wind data if offline for too long
            decayWindDataIfNeeded()
        }
    }
    
    func getHeadwind(bearing: Double) -> Double {
        guard let wind = currentWind else {
            return 0.0
        }
        
        // Apply decay if data is old
        let age = Date().timeIntervalSince(wind.timestamp)
        let decayTime: TimeInterval = 30 * 60  // 30 minutes
        
        if age > decayTime {
            // Exponential decay toward zero
            let decayFactor = exp(-age / decayTime)
            return wind.headwindComponent(bearing: bearing) * decayFactor
        }
        
        return wind.headwindComponent(bearing: bearing)
    }
    
    // MARK: - Private Methods
    
    private func decayWindDataIfNeeded() {
        guard let wind = currentWind else { return }
        
        let age = Date().timeIntervalSince(wind.timestamp)
        let maxAge: TimeInterval = 30 * 60  // 30 minutes
        
        if age > maxAge {
            logger.warning("Wind data too old (\(age / 60, privacy: .public) minutes), applying decay")
        }
    }
}

// MARK: - Open-Meteo API Response Models

private struct OpenMeteoResponse: Codable {
    let current: CurrentWeather
    
    struct CurrentWeather: Codable {
        let temperature2m: Double?
        let relativeHumidity2m: Double?
        let surfacePressure: Double?
        let windSpeed10m: Double?
        let windDirection10m: Double?
        
        enum CodingKeys: String, CodingKey {
            case temperature2m = "temperature_2m"
            case relativeHumidity2m = "relative_humidity_2m"
            case surfacePressure = "surface_pressure"
            case windSpeed10m = "wind_speed_10m"
            case windDirection10m = "wind_direction_10m"
        }
    }
}
