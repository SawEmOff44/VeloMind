import Foundation
import CoreLocation

/// Parser for GPX files
class GPXParser: NSObject, XMLParserDelegate {
    private var routePoints: [RoutePoint] = []
    private var currentElement = ""
    private var currentLatitude: Double?
    private var currentLongitude: Double?
    private var currentElevation: Double?
    
    func parse(data: Data) throws -> [RoutePoint] {
        routePoints.removeAll()
        
        let parser = XMLParser(data: data)
        parser.delegate = self
        
        guard parser.parse() else {
            throw GPXError.parsingFailed
        }
        
        guard !routePoints.isEmpty else {
            throw GPXError.noPointsFound
        }
        
        return routePoints
    }
    
    // MARK: - XMLParserDelegate
    
    func parser(_ parser: XMLParser, didStartElement elementName: String, namespaceURI: String?, qualifiedName qName: String?, attributes attributeDict: [String : String] = [:]) {
        currentElement = elementName
        
        if elementName == "trkpt" || elementName == "rtept" {
            if let latString = attributeDict["lat"], let lat = Double(latString),
               let lonString = attributeDict["lon"], let lon = Double(lonString) {
                currentLatitude = lat
                currentLongitude = lon
            }
        }
    }
    
    func parser(_ parser: XMLParser, foundCharacters string: String) {
        if currentElement == "ele" {
            currentElevation = Double(string.trimmingCharacters(in: .whitespacesAndNewlines))
        }
    }
    
    func parser(_ parser: XMLParser, didEndElement elementName: String, namespaceURI: String?, qualifiedName qName: String?) {
        if elementName == "trkpt" || elementName == "rtept" {
            if let lat = currentLatitude, let lon = currentLongitude {
                let point = RoutePoint(
                    latitude: lat,
                    longitude: lon,
                    elevation: currentElevation,
                    distance: 0  // Will be calculated later
                )
                routePoints.append(point)
                
                currentLatitude = nil
                currentLongitude = nil
                currentElevation = nil
            }
        }
    }
}

enum GPXError: Error {
    case parsingFailed
    case noPointsFound
    case invalidFormat
}
