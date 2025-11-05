//
//  APIClient.swift
//  Globe_fd
//
//  Created on 2025-11-05.
//

import Foundation
import Combine

class APIClient: ObservableObject {
    static let shared = APIClient()
    
    private let baseURL: String = {
        #if DEBUG
        return "http://localhost:8000"
        #else
        return "https://your-api.onrender.com"
        #endif
    }()
    
    private init() {}
    
    // MARK: - Fetch Stations
    
    func fetchStations(country: String? = nil, limit: Int = 1000) async throws -> [Station] {
        var components = URLComponents(string: "\(baseURL)/api/stations")!
        components.queryItems = [
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        
        if let country = country {
            components.queryItems?.append(URLQueryItem(name: "country", value: country))
        }
        
        guard let url = components.url else {
            throw URLError(.badURL)
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let result = try decoder.decode(StationsResponse.self, from: data)
        return result.data
    }
    
    // MARK: - Fetch Policies
    
    func fetchPolicies(country: String? = nil) async throws -> [AirPolicy] {
        var components = URLComponents(string: "\(baseURL)/api/policies")!
        
        if let country = country {
            components.queryItems = [URLQueryItem(name: "country", value: country)]
        }
        
        guard let url = components.url else {
            throw URLError(.badURL)
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let result = try decoder.decode(PoliciesResponse.self, from: data)
        return result.data
    }
    
    // MARK: - Predict PM2.5
    
    func predictPM25(imageData: Data) async throws -> PredictionResult {
        let url = URL(string: "\(baseURL)/api/predict")!
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)",
                        forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        let result = try decoder.decode([String: PredictionResult].self, from: data)
        
        return result["data"] ?? PredictionResult(
            pm25: 0,
            confidence: 0,
            breakdown: PredictionBreakdown(camera: 0, station: nil, satellite: nil),
            timestamp: Date()
        )
    }
}
