//
//  Statistics.swift
//  AirLens
//
//  Statistics and analytics models
//

import Foundation

struct Statistics: Codable {
    let totalStations: Int
    let averagePM25: Double
    let countriesCount: Int
    let lastUpdated: String
    let topPollutedCities: [CityPollution]?
    let cleanestCities: [CityPollution]?

    enum CodingKeys: String, CodingKey {
        case totalStations = "total_stations"
        case averagePM25 = "average_pm25"
        case countriesCount = "countries_count"
        case lastUpdated = "last_updated"
        case topPollutedCities = "top_polluted_cities"
        case cleanestCities = "cleanest_cities"
    }
}

struct CityPollution: Codable, Identifiable {
    let id = UUID()
    let city: String
    let country: String
    let pm25: Double
    let aqi: Int

    enum CodingKeys: String, CodingKey {
        case city
        case country
        case pm25
        case aqi
    }
}

struct ModelPerformance: Identifiable {
    let id = UUID()
    let deviceModel: String
    let inferenceLatency: Double // in milliseconds
    let rmse: Double
    let supportedVersion: String

    static let mockData: [ModelPerformance] = [
        ModelPerformance(
            deviceModel: "iPhone 15 Pro",
            inferenceLatency: 45,
            rmse: 2.1,
            supportedVersion: "iOS 17+"
        ),
        ModelPerformance(
            deviceModel: "iPhone 14 Pro",
            inferenceLatency: 52,
            rmse: 2.3,
            supportedVersion: "iOS 16+"
        ),
        ModelPerformance(
            deviceModel: "iPhone 13",
            inferenceLatency: 68,
            rmse: 2.5,
            supportedVersion: "iOS 15+"
        ),
        ModelPerformance(
            deviceModel: "iPhone 12",
            inferenceLatency: 78,
            rmse: 2.8,
            supportedVersion: "iOS 14+"
        )
    ]
}

struct DataSource: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let url: String
    let coverage: String

    static let sources: [DataSource] = [
        DataSource(
            name: "World Air Quality Index (WAQI)",
            description: "Real-time air quality data from monitoring stations worldwide",
            url: "https://waqi.info/",
            coverage: "Global"
        ),
        DataSource(
            name: "IQAir",
            description: "Comprehensive air quality information and forecasts",
            url: "https://www.iqair.com/",
            coverage: "100+ countries"
        ),
        DataSource(
            name: "NOAA GFS",
            description: "Global weather forecasting system for meteorological data",
            url: "https://www.ncei.noaa.gov/",
            coverage: "Global"
        ),
        DataSource(
            name: "NASA FIRMS",
            description: "Fire detection and tracking using satellite data",
            url: "https://firms.modaps.eosdis.nasa.gov/",
            coverage: "Global"
        ),
        DataSource(
            name: "Sentinel-5P",
            description: "Satellite monitoring of atmospheric composition",
            url: "https://sentinel.esa.int/",
            coverage: "Global"
        )
    ]
}

// Chart data models
struct ChartDataPoint: Identifiable {
    let id = UUID()
    let label: String
    let value: Double
}

struct TimeSeriesData: Identifiable {
    let id = UUID()
    let timestamp: Date
    let value: Double
}
