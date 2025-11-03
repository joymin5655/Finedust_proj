//
//  ContentView.swift
//  Finedust
//
//  Main content view with navigation
//

import SwiftUI

struct ContentView: View {
    @State private var currentView: ViewType = .camera
    @State private var isDarkMode = true
    
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            
            Group {
                switch currentView {
                case .camera:
                    CameraView(
                        onNavigateToGlobe: { currentView = .globe },
                        onNavigateToSettings: { currentView = .settings }
                    )
                
                case .globe:
                    GlobeView(onBack: { currentView = .camera })
                
                case .settings:
                    SettingsView(
                        onBack: { currentView = .camera },
                        isDarkMode: $isDarkMode
                    )
                }
            }
        }
        .preferredColorScheme(isDarkMode ? .dark : .light)
    }
}

#Preview {
    ContentView()
}
