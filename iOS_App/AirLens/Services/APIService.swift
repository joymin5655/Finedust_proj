//
//  APIService.swift
//  AirLens
//
//  Network API service for backend communication
//

import Foundation
import UIKit

enum APIError: Error, LocalizedError {
    case invalidURL
    case networkError(Error)
    case invalidResponse
    case decodingError(Error)
    case serverError(Int)
    case noData

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .invalidResponse:
            return "Invalid response from server"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .serverError(let code):
            return "Server error: \(code)"
        case .noData:
            return "No data received"
        }
    }
}

class APIService {
    static let shared = APIService()

    // TODO: Update this with your backend URL
    private let baseURL = "http://localhost:8000/api"

    private let session: URLSession

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
    }

    // MARK: - Stations

    func fetchStations(country: String? = nil, limit: Int = 100, skip: Int = 0) async throws -> StationListResponse {
        var components = URLComponents(string: "\(baseURL)/stations")
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "limit", value: "\(limit)"),
            URLQueryItem(name: "skip", value: "\(skip)")
        ]

        if let country = country {
            queryItems.append(URLQueryItem(name: "country", value: country))
        }

        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw APIError.invalidURL
        }

        return try await performRequest(url: url)
    }

    func fetchNearbyStations(latitude: Double, longitude: Double, radius: Double = 100) async throws -> StationListResponse {
        var components = URLComponents(string: "\(baseURL)/stations/nearby")
        components?.queryItems = [
            URLQueryItem(name: "latitude", value: "\(latitude)"),
            URLQueryItem(name: "longitude", value: "\(longitude)"),
            URLQueryItem(name: "radius_km", value: "\(radius)")
        ]

        guard let url = components?.url else {
            throw APIError.invalidURL
        }

        return try await performRequest(url: url)
    }

    // MARK: - Policies

    func fetchPolicies(country: String? = nil, category: PolicyCategory? = nil, limit: Int = 100) async throws -> PolicyListResponse {
        var components = URLComponents(string: "\(baseURL)/policies")
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "limit", value: "\(limit)")
        ]

        if let country = country {
            queryItems.append(URLQueryItem(name: "country", value: country))
        }

        if let category = category {
            queryItems.append(URLQueryItem(name: "category", value: category.rawValue))
        }

        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw APIError.invalidURL
        }

        return try await performRequest(url: url)
    }

    // MARK: - Prediction

    func predictPM25(image: UIImage, latitude: Double? = nil, longitude: Double? = nil) async throws -> PredictionResult {
        guard let url = URL(string: "\(baseURL)/predict") else {
            throw APIError.invalidURL
        }

        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            throw APIError.noData
        }

        let boundary = UUID().uuidString
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add image
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"image.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)

        // Add location if available
        if let latitude = latitude {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"latitude\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(latitude)".data(using: .utf8)!)
            body.append("\r\n".data(using: .utf8)!)
        }

        if let longitude = longitude {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"longitude\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(longitude)".data(using: .utf8)!)
            body.append("\r\n".data(using: .utf8)!)
        }

        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        return try await performRequest(request: request)
    }

    // MARK: - Statistics

    func fetchStatistics() async throws -> Statistics {
        guard let url = URL(string: "\(baseURL)/statistics") else {
            throw APIError.invalidURL
        }

        return try await performRequest(url: url)
    }

    // MARK: - Generic Request Handler

    private func performRequest<T: Decodable>(url: URL) async throws -> T {
        let request = URLRequest(url: url)
        return try await performRequest(request: request)
    }

    private func performRequest<T: Decodable>(request: URLRequest) async throws -> T {
        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }

            guard (200...299).contains(httpResponse.statusCode) else {
                throw APIError.serverError(httpResponse.statusCode)
            }

            do {
                let decoder = JSONDecoder()
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decodingError(error)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
}
