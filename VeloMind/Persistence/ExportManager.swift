import Foundation

/// Export formats supported
enum ExportFormat {
    case csv
    case gpx
    case fit  // Future implementation
}

/// Handles data export in various formats
class ExportManager {
    
    // MARK: - CSV Export
    
    static func exportToCSV(_ session: RideSession) -> String {
        var csv = "timestamp,latitude,longitude,altitude_ft,speed_ms,speed_mph,cadence_rpm,heartrate_bpm,power_watts,grade_percent,wind_speed_ms,wind_direction_deg\n"
        
        let dateFormatter = ISO8601DateFormatter()
        
        for point in session.dataPoints {
            let row = [
                dateFormatter.string(from: point.timestamp),
                String(format: "%.6f", point.latitude),
                String(format: "%.6f", point.longitude),
                String(format: "%.1f", point.altitude),
                String(format: "%.2f", point.speed),
                String(format: "%.2f", point.speed * 3.6),
                String(format: "%.0f", point.cadence),
                point.heartRate.map { String($0) } ?? "",
                String(format: "%.1f", point.power),
                String(format: "%.2f", point.grade * 100),
                String(format: "%.2f", point.windSpeed),
                String(format: "%.0f", point.windDirection)
            ].joined(separator: ",")
            
            csv += row + "\n"
        }
        
        return csv
    }
    
    // MARK: - GPX Export
    
    static func exportToGPX(_ session: RideSession) -> String {
        let dateFormatter = ISO8601DateFormatter()
        
        var gpx = """
        <?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1" creator="VeloMind" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
        <metadata>
        <name>VeloMind Ride - \(dateFormatter.string(from: session.startTime))</name>
        <time>\(dateFormatter.string(from: session.startTime))</time>
        </metadata>
        <trk>
        <name>VeloMind Ride</name>
        <type>cycling</type>
        <trkseg>
        
        """
        
        for point in session.dataPoints {
            gpx += """
            <trkpt lat="\(String(format: "%.6f", point.latitude))" lon="\(String(format: "%.6f", point.longitude))">
            <ele>\(String(format: "%.1f", point.altitude))</ele>
            <time>\(dateFormatter.string(from: point.timestamp))</time>
            <extensions>
            <power>\(String(format: "%.0f", point.power))</power>
            <cadence>\(String(format: "%.0f", point.cadence))</cadence>
            
            """
            
            if let hr = point.heartRate {
                gpx += "<heartrate>\(hr)</heartrate>\n"
            }
            
            gpx += """
            </extensions>
            </trkpt>
            
            """
        }
        
        gpx += """
        </trkseg>
        </trk>
        </gpx>
        """
        
        return gpx
    }
    
    // MARK: - FIT Export (Future)
    
    static func exportToFIT(_ session: RideSession) -> Data? {
        // TODO: Implement FIT file export
        // FIT files are binary format used by Garmin and other cycling computers
        // Requires FIT SDK integration or manual binary encoding
        return nil
    }
    
    // MARK: - File Saving
    
    static func saveExport(_ content: String, filename: String, format: ExportFormat) throws -> URL {
        let fileManager = FileManager.default
        let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
        
        let fileExtension: String
        switch format {
        case .csv:
            fileExtension = "csv"
        case .gpx:
            fileExtension = "gpx"
        case .fit:
            fileExtension = "fit"
        }
        
        let fileURL = documentsPath.appendingPathComponent("\(filename).\(fileExtension)")
        
        try content.write(to: fileURL, atomically: true, encoding: .utf8)
        
        return fileURL
    }
    
    static func saveExportData(_ data: Data, filename: String, format: ExportFormat) throws -> URL {
        let fileManager = FileManager.default
        let documentsPath = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
        
        let fileExtension: String
        switch format {
        case .csv:
            fileExtension = "csv"
        case .gpx:
            fileExtension = "gpx"
        case .fit:
            fileExtension = "fit"
        }
        
        let fileURL = documentsPath.appendingPathComponent("\(filename).\(fileExtension)")
        
        try data.write(to: fileURL)
        
        return fileURL
    }
}
