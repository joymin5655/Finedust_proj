//
//  ContentView.swift
//  Finedust
//
//  Main content view with navigation
//

import SwiftUI

struct ContentView: View {
    @State private var isDarkMode = true
    
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            
            // AirLens 초기 화면을 메인으로 표시
            HomeScreenView()
        }
        .preferredColorScheme(isDarkMode ? .dark : .light)
    }
}

#Preview {
    ContentView()
}
