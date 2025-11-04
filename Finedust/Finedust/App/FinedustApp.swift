//
//  FinedustApp.swift
//  Finedust
//
//  Main app entry point

import SwiftUI

@main
struct FinedustApp: App {
    var body: some Scene {
        WindowGroup {
            // Use DemoMeasurementView for testing the enhanced UI
            // Switch to MainMeasurementView for production
            DemoMeasurementView()
        }
    }
}
