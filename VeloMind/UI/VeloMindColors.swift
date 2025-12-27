import SwiftUI

extension Color {
    // VeloMind Brand Colors - Cyan to Green Gradient Theme
    static let veloCyan = Color(red: 6/255, green: 182/255, blue: 212/255)
    static let veloCyanLight = Color(red: 34/255, green: 211/255, blue: 238/255)
    static let veloCyanDark = Color(red: 8/255, green: 145/255, blue: 178/255)
    
    static let veloBlue = Color(red: 2/255, green: 132/255, blue: 199/255)
    static let veloBlueLight = Color(red: 14/255, green: 165/255, blue: 233/255)
    static let veloBlueDark = Color(red: 3/255, green: 105/255, blue: 161/255)
    
    static let veloGreen = Color(red: 16/255, green: 185/255, blue: 129/255)
    static let veloGreenLight = Color(red: 52/255, green: 211/255, blue: 153/255)
    static let veloGreenDark = Color(red: 5/255, green: 150/255, blue: 105/255)
    
    static let veloTeal = Color(red: 20/255, green: 184/255, blue: 166/255)
    static let veloTealLight = Color(red: 45/255, green: 212/255, blue: 191/255)
    static let veloTealDark = Color(red: 13/255, green: 148/255, blue: 136/255)
}

// VeloMind Gradient Styles
struct VeloMindGradient {
    static let primary = LinearGradient(
        colors: [.veloCyan, .veloTeal, .veloGreen],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let cyanBlue = LinearGradient(
        colors: [.veloCyan, .veloBlue],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let tealGreen = LinearGradient(
        colors: [.veloTeal, .veloGreen],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let blueTeal = LinearGradient(
        colors: [.veloBlue, .veloTeal],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let greenCyan = LinearGradient(
        colors: [.veloGreen, .veloCyan],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
