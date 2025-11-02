//
//  GeminiAPIService.swift
//  AirLens
//
//  Service for interacting with Google Gemini API
//

import Foundation
import UIKit

class GeminiAPIService {
    static let shared = GeminiAPIService()
    
    private let apiKey: String = {
        // API key should be stored in Info.plist or environment
        guard let key = Bundle.main.object(forInfoDictionaryKey: "GEMINI_API_KEY") as? String else {
            fatalError("GEMINI_API_KEY not found in Info.plist")
        }
        return key
    }()
    
    private let baseURL = "https://generativelanguage.googleapis.com/v1beta/models"
    
    private init() {}
    
    // MARK: - Analyze Image for PM2.5
    func analyzeImage(_ image: UIImage) async throws -> GeminiImageAnalysisResponse {
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            throw NSError(domain: "GeminiAPI", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to convert image"])
        }
        
        let base64Image = imageData.base64EncodedString()
        
        let requestBody: [String: Any] = [
            "contents": [
                [
                    "parts": [
                        [
                            "inline_data": [
                                "mime_type": "image/jpeg",
                                "data": base64Image
                            ]
                        ],
                        [
                            "text": "Analyze the sky in this image to estimate the air quality. Provide a PM2.5 value, a confidence score between 0 and 1, and a brief one-sentence analysis of the sky conditions (e.g., 'Clear skies with some haze')."
                        ]
                    ]
                ]
            ],
            "generationConfig": [
                "response_mime_type": "application/json",
                "response_schema": [
                    "type": "object",
                    "properties": [
                        "pm25": ["type": "number", "description": "Estimated PM2.5 value in μg/m³"],
                        "confidence": ["type": "number", "description": "Confidence score from 0.0 to 1.0"],
                        "analysis": ["type": "string", "description": "A brief analysis of the sky"]
                    ],
                    "required": ["pm25", "confidence", "analysis"]
                ]
            ]
        ]
        
        let url = URL(string: "\(baseURL)/gemini-2.5-flash:generateContent?key=\(apiKey)")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw NSError(domain: "GeminiAPI", code: -2, userInfo: [NSLocalizedDescriptionKey: "API request failed"])
        }
        
        let jsonResponse = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let candidates = jsonResponse?["candidates"] as? [[String: Any]],
              let firstCandidate = candidates.first,
              let content = firstCandidate["content"] as? [String: Any],
              let parts = content["parts"] as? [[String: Any]],
              let text = parts.first?["text"] as? String else {
            throw NSError(domain: "GeminiAPI", code: -3, userInfo: [NSLocalizedDescriptionKey: "Failed to parse response"])
        }
        
        let textData = text.data(using: .utf8)!
        let decoder = JSONDecoder()
        return try decoder.decode(GeminiImageAnalysisResponse.self, from: textData)
    }
    
    // MARK: - Get Location Details
    func getLocationDetails(latitude: Double, longitude: Double) async throws -> GeminiLocationResponse {
        let requestBody: [String: Any] = [
            "contents": [
                [
                    "parts": [
                        [
                            "text": "Provide the city, country, and two-letter ISO 3166-1 alpha-2 country code for latitude: \(latitude), longitude: \(longitude)."
                        ]
                    ]
                ]
            ],
            "generationConfig": [
                "response_mime_type": "application/json",
                "response_schema": [
                    "type": "object",
                    "properties": [
                        "city": ["type": "string"],
                        "country": ["type": "string"],
                        "countryCode": ["type": "string", "description": "ISO 3166-1 alpha-2 two-letter country code"]
                    ],
                    "required": ["city", "country", "countryCode"]
                ]
            ]
        ]
        
        let url = URL(string: "\(baseURL)/gemini-2.5-flash:generateContent?key=\(apiKey)")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw NSError(domain: "GeminiAPI", code: -2, userInfo: [NSLocalizedDescriptionKey: "API request failed"])
        }
        
        let jsonResponse = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let candidates = jsonResponse?["candidates"] as? [[String: Any]],
              let firstCandidate = candidates.first,
              let content = firstCandidate["content"] as? [String: Any],
              let parts = content["parts"] as? [[String: Any]],
              let text = parts.first?["text"] as? String else {
            throw NSError(domain: "GeminiAPI", code: -3, userInfo: [NSLocalizedDescriptionKey: "Failed to parse response"])
        }
        
        let textData = text.data(using: .utf8)!
        let decoder = JSONDecoder()
        return try decoder.decode(GeminiLocationResponse.self, from: textData)
    }
}
