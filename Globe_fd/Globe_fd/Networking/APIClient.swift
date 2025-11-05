//
//  APIClient.swift
//  Globe_fd
//
//  Created by JOYMIN on 11/5/25.
//
import Foundation
import Combine

class APIClient: ObservableObject {
    static let shared = APIClient()
    
    let baseURL = "http://localhost:8000"  // 개발 환경
    
    func fetchStations() async throws -> [Station] {
        let url = URL(string: "\(baseURL)/api/stations?limit=1000")!
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
    
    func fetchPolicies() async throws -> [AirPolicy] {
        let url = URL(string: "\(baseURL)/api/policies")!
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
            pm25: 0, confidence: 0,
            breakdown: PredictionBreakdown(camera: 0, station: nil, satellite: nil),
            timestamp: Date()
        )
    }
}
