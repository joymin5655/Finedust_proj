//
//  Prediction.swift
//  AirLens
//
//  PM2.5 prediction model
//

import Foundation
import UIKit

struct PredictionResult: Codable {
    let pm25: Double
    let confidence: Double
    let location: LocationInfo?
    let timestamp: String
    let methodology: Methodology

    var pm25Level: PM25Level {
        PM25Level.from(value: pm25)
    }
}

struct LocationInfo: Codable {
    let latitude: Double
    let longitude: Double
    let country: String?
    let city: String?
    let countryFlag: String?

    enum CodingKeys: String, CodingKey {
        case latitude
        case longitude
        case country
        case city
        case countryFlag = "country_flag"
    }
}

struct Methodology: Codable {
    let imageAnalysis: Double
    let weatherData: Double
    let historicalTrends: Double
    let satelliteData: Double

    enum CodingKeys: String, CodingKey {
        case imageAnalysis = "image_analysis"
        case weatherData = "weather_data"
        case historicalTrends = "historical_trends"
        case satelliteData = "satellite_data"
    }

    var components: [(name: String, value: Double)] {
        [
            ("Image Analysis", imageAnalysis),
            ("Weather Data", weatherData),
            ("Historical Trends", historicalTrends),
            ("Satellite Data", satelliteData)
        ]
    }
}

struct PredictionRequest: Codable {
    let latitude: Double?
    let longitude: Double?
    let timestamp: String?

    init(latitude: Double? = nil, longitude: Double? = nil) {
        self.latitude = latitude
        self.longitude = longitude
        self.timestamp = ISO8601DateFormatter().string(from: Date())
    }
}

// For camera capture
struct CapturedImage {
    let image: UIImage
    let location: LocationInfo?
    let timestamp: Date

    func toJPEGData(compressionQuality: CGFloat = 0.8) -> Data? {
        image.jpegData(compressionQuality: compressionQuality)
    }
}
