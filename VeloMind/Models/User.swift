import Foundation

struct User: Codable, Identifiable {
    let id: Int
    var email: String
    var name: String
    var createdAt: Date
    
    init(id: Int, email: String, name: String, createdAt: Date = Date()) {
        self.id = id
        self.email = email
        self.name = name
        self.createdAt = createdAt
    }
}

struct UserSession: Codable {
    let user: User
    let token: String
    let expiresAt: Date
}

struct AuthResponse: Codable {
    let token: String
    let userId: Int
    let name: String?
    
    enum CodingKeys: String, CodingKey {
        case token
        case userId = "user_id"
        case name
    }
}

enum AuthError: Error, LocalizedError {
    case invalidURL
    case serverError
    case invalidCredentials
    case userExists
    case networkError
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid server URL"
        case .serverError:
            return "Server error occurred"
        case .invalidCredentials:
            return "Invalid email or password"
        case .userExists:
            return "User already exists"
        case .networkError:
            return "Network connection failed"
        }
    }
}
