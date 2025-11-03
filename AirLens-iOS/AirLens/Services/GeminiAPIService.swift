//
//  GeminiAPIService.swift
//  AirLens
//
//  Service for interacting with Google Gemini API
//  Now includes Mock Mode for development without API key
//

import Foundation
import UIKit

class GeminiAPIService {
    static let shared = GeminiAPIService()
    
    // MARK: - Configuration
    /// Set to true to use mock data instead of real API
    var useMockData: Bool = true
    
    /// Check if API key is available
    var hasAPIKey: Bool {
        return apiKey != nil
    }
    
    private let apiKey: String? = {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "GEMINI_API_KEY") as? String,
              key != "YOUR_GEMINI_API_KEY",
              !key.isEmpty else {
            print("⚠️ No valid API key found. Using mock data mode.")
            return nil
        }
        return key
    }()
    
    private let baseURL = "https://generativelanguage.googleapis.com/v1beta/models"
    
    private init() {
        // Automatically enable mock mode if no API key
        if apiKey == nil {
            useMockData = true
            print("🎭 Mock Data Mode: ENABLED")
        }
    }
    
    // MARK: - Analyze Image for PM2.5
    func analyzeImage(_ image: UIImage) async throws -> GeminiImageAnalysisResponse {
        // Use mock data if enabled or no API key
        if useMockData || apiKey == nil {
            return generateMockImageAnalysis(for: image)
        }
        
        // Real API call (original implementation)
        return try await performRealImageAnalysis(image)
    }
    
    // MARK: - Get Location Details
    func getLocationDetails(latitude: Double, longitude: Double) async throws -> GeminiLocationResponse {
        // Use mock data if enabled or no API key
        if useMockData || apiKey == nil {
            return generateMockLocationDetails(latitude: latitude, longitude: longitude)
        }
        
        // Real API call (original implementation)
        return try await performRealLocationQuery(latitude: latitude, longitude: longitude)
    }
    
    // MARK: - Mock Data Generators
    
    private func generateMockImageAnalysis(for image: UIImage) -> GeminiImageAnalysisResponse {
        // Simulate processing time
        Thread.sleep(forTimeInterval: 1.0)
        
        // Generate realistic PM2.5 values based on image brightness
        let brightness = calculateImageBrightness(image)
        let basePM25 = brightness > 0.7 ? Double.random(in: 5...20) :  // Bright = good air
                       brightness > 0.4 ? Double.random(in: 25...50) :  // Medium = moderate
                                         Double.random(in: 60...120)    // Dark = poor
        
        let confidence = Double.random(in: 0.75...0.95)
        
        let analysis = brightness > 0.7 ? "Clear blue skies with excellent visibility" :
                       brightness > 0.4 ? "Hazy conditions with reduced visibility" :
                                         "Heavy haze and poor air quality visible"
        
        print("🎭 Mock Analysis: PM2.5=\(basePM25.rounded()), Confidence=\(confidence)")
        
        return GeminiImageAnalysisResponse(
            pm25: basePM25,
            confidence: confidence,
            analysis: analysis
        )
    }
    
    private func generateMockLocationDetails(latitude: Double, longitude: Double) -> GeminiLocationResponse {
        // Simulate processing time
        Thread.sleep(forTimeInterval: 0.5)
        
        // Simple mock location mapping based on coordinates
        let location = determineMockLocation(latitude: latitude, longitude: longitude)
        
        print("🎭 Mock Location: \(location.city), \(location.country)")
        
        return GeminiLocationResponse(
            city: location.city,
            country: location.country,
            countryCode: location.countryCode
        )
    }
    
    private func calculateImageBrightness(_ image: UIImage) -> Double {
        guard let cgImage = image.cgImage else { return 0.5 }
        
        let width = cgImage.width
        let height = cgImage.height
        let bytesPerPixel = 4
        let bytesPerRow = bytesPerPixel * width
        let bitsPerComponent = 8
        
        var pixelData = [UInt8](repeating: 0, count: width * height * bytesPerPixel)
        
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGContext(
            data: &pixelData,
            width: width,
            height: height,
            bitsPerComponent: bitsPerComponent,
            bytesPerRow: bytesPerRow,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        )
        
        context?.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        
        var totalBrightness: Double = 0
        let sampleSize = min(1000, width * height)
        let step = max(1, (width * height) / sampleSize)
        
        for i in stride(from: 0, to: width * height, by: step) {
            let offset = i * bytesPerPixel
            if offset + 2 < pixelData.count {
                let r = Double(pixelData[offset])
                let g = Double(pixelData[offset + 1])
                let b = Double(pixelData[offset + 2])
                totalBrightness += (r + g + b) / 3.0
            }
        }
        
        return totalBrightness / (255.0 * Double(sampleSize))
    }
    
    private func determineMockLocation(latitude: Double, longitude: Double) -> (city: String, country: String, countryCode: String) {
        // Korea
        if (33...39).contains(latitude) && (124...132).contains(longitude) {
            let cities = ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"]
            return (cities.randomElement()!, "South Korea", "KR")
        }
        
        // Japan
        if (30...46).contains(latitude) && (128...146).contains(longitude) {
            let cities = ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo"]
            return (cities.randomElement()!, "Japan", "JP")
        }
        
        // China
        if (18...54).contains(latitude) && (73...135).contains(longitude) {
            let cities = ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"]
            return (cities.randomElement()!, "China", "CN")
        }
        
        // USA
        if (25...49).contains(latitude) && (-125...(-66)).contains(longitude) {
            let cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]
            return (cities.randomElement()!, "United States", "US")
        }
        
        // Europe
        if (35...72).contains(latitude) && (-10...40).contains(longitude) {
            let cities = ["London", "Paris", "Berlin", "Madrid", "Rome"]
            let countries = ["United Kingdom", "France", "Germany", "Spain", "Italy"]
            let codes = ["GB", "FR", "DE", "ES", "IT"]
            let index = Int.random(in: 0..<cities.count)
            return (cities[index], countries[index], codes[index])
        }
        
        // Default
        return ("Unknown City", "Unknown Country", "XX")
    }
    
    // MARK: - Real API Implementations (Original)
    
    private func performRealImageAnalysis(_ image: UIImage) async throws -> GeminiImageAnalysisResponse {
        guard let apiKey = apiKey else {
            throw NSError(domain: "GeminiAPI", code: -1, userInfo: [NSLocalizedDescriptionKey: "No API key"])
        }
        
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
    
    private func performRealLocationQuery(latitude: Double, longitude: Double) async throws -> GeminiLocationResponse {
        guard let apiKey = apiKey else {
            throw NSError(domain: "GeminiAPI", code: -1, userInfo: [NSLocalizedDescriptionKey: "No API key"])
        }
        
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
