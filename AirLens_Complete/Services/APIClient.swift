//
//  APIClient.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import Combine

// MARK: - API Client
class APIClient: ObservableObject {
    static let shared = APIClient()
    
    private let baseURL: String = {
        #if DEBUG
        return "http://localhost:8000"
        #else
        return "https://airlens-api.onrender.com"
        #endif
    }()
    
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 60
        configuration.waitsForConnectivity = true
        
        self.session = URLSession(configuration: configuration)
        
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }
    
    // MARK: - Station APIs
    
    /// Fetch air quality stations
    func fetchStations(country: String? = nil, limit: Int = 1000) async throws -> [Station] {
        var components = URLComponents(string: "\(baseURL)/api/stations")!
        components.queryItems = [
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        
        if let country = country {
            components.queryItems?.append(URLQueryItem(name: "country", value: country))
        }
        
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        let stationsResponse = try decoder.decode(StationsResponse.self, from: data)
        return stationsResponse.data
    }
    
    /// Fetch nearby stations
    func fetchNearbyStations(latitude: Double, longitude: Double, radius: Double = 50) async throws -> [Station] {
        var components = URLComponents(string: "\(baseURL)/api/stations/nearby")!
        components.queryItems = [
            URLQueryItem(name: "lat", value: "\(latitude)"),
            URLQueryItem(name: "lon", value: "\(longitude)"),
            URLQueryItem(name: "radius", value: "\(radius)")
        ]
        
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        let stationsResponse = try decoder.decode(StationsResponse.self, from: data)
        return stationsResponse.data
    }
    
    // MARK: - Policy APIs
    
    /// Fetch air quality policies
    func fetchPolicies(country: String? = nil, category: PolicyCategory? = nil) async throws -> [AirPolicy] {
        var components = URLComponents(string: "\(baseURL)/api/policies")!
        var queryItems: [URLQueryItem] = []
        
        if let country = country {
            queryItems.append(URLQueryItem(name: "country", value: country))
        }
        
        if let category = category {
            queryItems.append(URLQueryItem(name: "category", value: category.rawValue))
        }
        
        components.queryItems = queryItems.isEmpty ? nil : queryItems
        
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        let policiesResponse = try decoder.decode(PoliciesResponse.self, from: data)
        return policiesResponse.data
    }
    
    // MARK: - Prediction API
    
    /// Predict PM2.5 from image
    func predictPM25(imageData: Data, location: PredictionLocation? = nil) async throws -> PredictionResult {
        let url = URL(string: "\(baseURL)/api/predict")!
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        // Create multipart form data
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        
        // Add image data
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)
        
        // Add location if available
        if let location = location {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"latitude\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(location.latitude)".data(using: .utf8)!)
            body.append("\r\n".data(using: .utf8)!)
            
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"longitude\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(location.longitude)".data(using: .utf8)!)
            body.append("\r\n".data(using: .utf8)!)
        }
        
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        let predictionResponse = try decoder.decode([String: PredictionResult].self, from: data)
        
        guard let prediction = predictionResponse["data"] else {
            throw APIError.invalidData
        }
        
        return prediction
    }
    
    // MARK: - Statistics API
    
    /// Fetch global statistics
    func fetchStatistics() async throws -> GlobalStatistics {
        let url = URL(string: "\(baseURL)/api/statistics")!
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.httpError(statusCode: httpResponse.statusCode)
        }
        
        return try decoder.decode(GlobalStatistics.self, from: data)
    }
    
    // MARK: - Health Check
    
    /// Check API health
    func healthCheck() async throws -> Bool {
        let url = URL(string: "\(baseURL)/health")!
        
        let (_, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        return (200...299).contains(httpResponse.statusCode)
    }
}

// MARK: - API Error
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case invalidData
    case httpError(statusCode: Int)
    case networkError(Error)
    case decodingError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid server response"
        case .invalidData:
            return "Invalid data received"
        case .httpError(let statusCode):
            return "HTTP error: \(statusCode)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError(let error):
            return "Data decoding error: \(error.localizedDescription)"
        }
    }
}

// MARK: - Global Statistics Model
struct GlobalStatistics: Codable {
    let totalStations: Int
    let totalPolicies: Int
    let averagePM25: Double
    let countriesCount: Int
    let lastUpdated: Date
    
    enum CodingKeys: String, CodingKey {
        case totalStations = "total_stations"
        case totalPolicies = "total_policies"
        case averagePM25 = "average_pm25"
        case countriesCount = "countries_count"
        case lastUpdated = "last_updated"
    }
}