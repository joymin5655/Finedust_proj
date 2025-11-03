//
//  PM25PredictionService.swift
//  AirLens
//
//  Core prediction service using native Swift image analysis
//  No external API or ML model required - 100% offline
//

import Foundation
import UIKit
import Accelerate

/// Manages PM2.5 prediction from sky images using computer vision techniques
class PM25PredictionService {
    static let shared = PM25PredictionService()
    
    private init() {}
    
    // MARK: - Main Prediction Method
    
    /// Analyzes an image and predicts PM2.5 level
    /// - Parameter image: Sky image to analyze
    /// - Returns: PM2.5 prediction result with confidence
    func predictPM25(from image: UIImage) async throws -> PM25PredictionResult {
        // Extract image features
        let features = extractImageFeatures(from: image)
        
        // Calculate PM2.5 from features
        let pm25 = calculatePM25(from: features)
        
        // Calculate confidence based on feature quality
        let confidence = calculateConfidence(from: features)
        
        // Generate analysis text
        let analysis = generateAnalysis(features: features, pm25: pm25)
        
        return PM25PredictionResult(
            pm25: pm25,
            confidence: confidence,
            analysis: analysis,
            features: features
        )
    }
    
    // MARK: - Feature Extraction
    
    private func extractImageFeatures(from image: UIImage) -> ImageFeatures {
        guard let cgImage = image.cgImage else {
            return ImageFeatures.default
        }
        
        let width = cgImage.width
        let height = cgImage.height
        let pixelCount = width * height
        
        // Prepare pixel data
        let bytesPerPixel = 4
        let bytesPerRow = bytesPerPixel * width
        var pixelData = [UInt8](repeating: 0, count: pixelCount * bytesPerPixel)
        
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGContext(
            data: &pixelData,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: bytesPerRow,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        )
        
        context?.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        
        // Sample pixels for efficiency (every 10th pixel)
        let sampleStep = 10
        var sampledPixels: [(r: Float, g: Float, b: Float)] = []
        
        for i in stride(from: 0, to: pixelCount, by: sampleStep) {
            let offset = i * bytesPerPixel
            if offset + 2 < pixelData.count {
                let r = Float(pixelData[offset]) / 255.0
                let g = Float(pixelData[offset + 1]) / 255.0
                let b = Float(pixelData[offset + 2]) / 255.0
                sampledPixels.append((r, g, b))
            }
        }
        
        // Calculate features
        let brightness = calculateBrightness(sampledPixels)
        let saturation = calculateSaturation(sampledPixels)
        let blueRatio = calculateBlueRatio(sampledPixels)
        let contrast = calculateContrast(sampledPixels)
        let hazeScore = calculateHazeScore(sampledPixels)
        let colorfulness = calculateColorfulness(sampledPixels)
        
        return ImageFeatures(
            brightness: brightness,
            saturation: saturation,
            blueRatio: blueRatio,
            contrast: contrast,
            hazeScore: hazeScore,
            colorfulness: colorfulness
        )
    }
    
    // MARK: - Feature Calculations
    
    private func calculateBrightness(_ pixels: [(r: Float, g: Float, b: Float)]) -> Float {
        let sum = pixels.reduce(0.0) { result, pixel in
            result + (pixel.r + pixel.g + pixel.b) / 3.0
        }
        return sum / Float(pixels.count)
    }
    
    private func calculateSaturation(_ pixels: [(r: Float, g: Float, b: Float)]) -> Float {
        var totalSaturation: Float = 0.0
        
        for pixel in pixels {
            let max = Swift.max(pixel.r, pixel.g, pixel.b)
            let min = Swift.min(pixel.r, pixel.g, pixel.b)
            let saturation = max > 0 ? (max - min) / max : 0
            totalSaturation += saturation
        }
        
        return totalSaturation / Float(pixels.count)
    }
    
    private func calculateBlueRatio(_ pixels: [(r: Float, g: Float, b: Float)]) -> Float {
        var blueScore: Float = 0.0
        
        for pixel in pixels {
            // Blue sky has high blue, moderate green, low red
            if pixel.b > pixel.r && pixel.b > pixel.g * 0.8 {
                blueScore += 1.0
            }
        }
        
        return blueScore / Float(pixels.count)
    }
    
    private func calculateContrast(_ pixels: [(r: Float, g: Float, b: Float)]) -> Float {
        let brightnesses = pixels.map { ($0.r + $0.g + $0.b) / 3.0 }
        let mean = brightnesses.reduce(0, +) / Float(brightnesses.count)
        
        let variance = brightnesses.reduce(0.0) { result, brightness in
            result + pow(brightness - mean, 2)
        } / Float(brightnesses.count)
        
        let standardDeviation = sqrt(variance)
        return min(standardDeviation * 4.0, 1.0)  // Normalize to 0-1
    }
    
    private func calculateHazeScore(_ pixels: [(r: Float, g: Float, b: Float)]) -> Float {
        var hazyPixelCount = 0
        
        for pixel in pixels {
            // Haze: whitish, desaturated, similar RGB values
            let avg = (pixel.r + pixel.g + pixel.b) / 3.0
            let maxDiff = max(abs(pixel.r - avg), abs(pixel.g - avg), abs(pixel.b - avg))
            
            if maxDiff < 0.1 && avg > 0.5 {
                hazyPixelCount += 1
            }
        }
        
        return Float(hazyPixelCount) / Float(pixels.count)
    }
    
    private func calculateColorfulness(_ pixels: [(r: Float, g: Float, b: Float)]) -> Float {
        var totalColorfulness: Float = 0.0
        
        for pixel in pixels {
            let rg = pixel.r - pixel.g
            let yb = 0.5 * (pixel.r + pixel.g) - pixel.b
            totalColorfulness += sqrt(rg * rg + yb * yb)
        }
        
        return min(totalColorfulness / Float(pixels.count) * 2.0, 1.0)
    }
    
    // MARK: - PM2.5 Calculation
    
    private func calculatePM25(from features: ImageFeatures) -> Double {
        // Weighted formula based on air quality research
        // Clear, blue, bright sky = low PM2.5
        // Hazy, gray, dim sky = high PM2.5
        
        let brightnessWeight: Float = 50.0
        let saturationWeight: Float = 30.0
        let blueRatioWeight: Float = 40.0
        let contrastWeight: Float = 25.0
        let hazeWeight: Float = 45.0
        let colorfulnessWeight: Float = 20.0
        
        let pm25 = Double(
            (1.0 - features.brightness) * brightnessWeight +
            (1.0 - features.saturation) * saturationWeight +
            (1.0 - features.blueRatio) * blueRatioWeight +
            (1.0 - features.contrast) * contrastWeight +
            features.hazeScore * hazeWeight +
            (1.0 - features.colorfulness) * colorfulnessWeight +
            10.0  // Base level
        )
        
        // Clip to realistic range
        return max(0, min(300, pm25))
    }
    
    private func calculateConfidence(from features: ImageFeatures) -> Double {
        // Higher confidence when features are more definitive
        var confidence = 0.5
        
        // Clear blue sky or obvious haze increases confidence
        if features.blueRatio > 0.6 || features.hazeScore > 0.6 {
            confidence += 0.2
        }
        
        // High contrast increases confidence
        if features.contrast > 0.5 {
            confidence += 0.1
        }
        
        // Good brightness (not too dark/bright) increases confidence
        if features.brightness > 0.3 && features.brightness < 0.9 {
            confidence += 0.1
        }
        
        // Saturation extremes increase confidence
        if features.saturation > 0.5 || features.saturation < 0.3 {
            confidence += 0.1
        }
        
        return min(0.95, max(0.6, confidence))
    }
    
    private func generateAnalysis(features: ImageFeatures, pm25: Double) -> String {
        if pm25 < 15 {
            if features.blueRatio > 0.6 {
                return "Clear blue skies with excellent visibility"
            } else if features.brightness > 0.7 {
                return "Bright conditions with clean air"
            } else {
                return "Good air quality detected"
            }
        } else if pm25 < 35 {
            if features.hazeScore > 0.3 {
                return "Slight haze visible in the atmosphere"
            } else {
                return "Moderate conditions with acceptable air quality"
            }
        } else if pm25 < 55 {
            return "Noticeable haze reducing visibility"
        } else if pm25 < 100 {
            return "Significant haze and reduced visibility"
        } else if pm25 < 150 {
            return "Heavy haze with poor air quality"
        } else {
            return "Severe haze and very poor visibility"
        }
    }
}

// MARK: - Data Models

struct ImageFeatures {
    let brightness: Float        // 0-1: overall image brightness
    let saturation: Float         // 0-1: color saturation
    let blueRatio: Float          // 0-1: proportion of blue sky
    let contrast: Float           // 0-1: image contrast
    let hazeScore: Float          // 0-1: estimated haze level
    let colorfulness: Float       // 0-1: color diversity
    
    static var `default`: ImageFeatures {
        ImageFeatures(
            brightness: 0.5,
            saturation: 0.5,
            blueRatio: 0.5,
            contrast: 0.5,
            hazeScore: 0.5,
            colorfulness: 0.5
        )
    }
}

struct PM25PredictionResult {
    let pm25: Double
    let confidence: Double
    let analysis: String
    let features: ImageFeatures
}
