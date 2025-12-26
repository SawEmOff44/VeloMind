import Foundation

struct User: Codable, Identifiable {
    let id: UUID
    var email: String
    var name: String
    var createdAt: Date
    
    init(id: UUID = UUID(), email: String, name: String, createdAt: Date = Date()) {
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
