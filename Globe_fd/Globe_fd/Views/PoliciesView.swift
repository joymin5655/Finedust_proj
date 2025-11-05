//
//  PoliciesView.swift
//  Globe_fd
//
//  Air Quality Policies and News View
//  Created on 2025-11-05.
//

import SwiftUI

struct PoliciesView: View {
    @EnvironmentObject var viewModel: PolicyViewModel
    @State private var selectedCountry: String = "All"
    @State private var searchText = ""
    @State private var selectedPolicy: AirPolicy?
    @State private var showingFilters = false
    @State private var sortOption: SortOption = .relevance
    
    enum SortOption: String, CaseIterable {
        case relevance = "Relevance"
        case newest = "Newest"
        case credibility = "Credibility"
        case country = "Country"
    }
    
    var countries: [String] {
        let allCountries = viewModel.policies.map { $0.country }
        return ["All"] + Array(Set(allCountries)).sorted()
    }
    
    var filteredPolicies: [AirPolicy] {
        var policies = viewModel.policies
        
        // Filter by country
        if selectedCountry != "All" {
            policies = policies.filter { $0.country == selectedCountry }
        }
        
        // Filter by search
        if !searchText.isEmpty {
            policies = policies.filter {
                $0.title.lowercased().contains(searchText.lowercased()) ||
                ($0.description?.lowercased().contains(searchText.lowercased()) ?? false) ||
                $0.country.lowercased().contains(searchText.lowercased())
            }
        }
        
        // Sort
        switch sortOption {
        case .relevance:
            policies.sort { $0.credibilityScore > $1.credibilityScore }
        case .newest:
            // Sort by ID (assuming newer have higher IDs)
            policies.sort { $0.id > $1.id }
        case .credibility:
            policies.sort { $0.credibilityScore > $1.credibilityScore }
        case .country:
            policies.sort { $0.country < $1.country }
        }
        
        return policies
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Search and Filters
                    VStack(spacing: 12) {
                        // Search Bar
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.secondary)
                            
                            TextField("Search policies...", text: $searchText)
                                .textFieldStyle(PlainTextFieldStyle())
                            
                            if !searchText.isEmpty {
                                Button(action: { searchText = "" }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        .padding(12)
                        .background(Color(.systemBackground))
                        .cornerRadius(10)
                        
                        // Filter Controls
                        HStack {
                            // Country Picker
                            Menu {
                                ForEach(countries, id: \.self) { country in
                                    Button(action: { selectedCountry = country }) {
                                        HStack {
                                            Text(country)
                                            if selectedCountry == country {
                                                Image(systemName: "checkmark")
                                            }
                                        }
                                    }
                                }
                            } label: {
                                HStack {
                                    Image(systemName: "globe")
                                    Text(selectedCountry)
                                    Image(systemName: "chevron.down")
                                }
                                .font(.caption)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color(.systemBackground))
                                .cornerRadius(8)
                            }
                            
                            // Sort Picker
                            Menu {
                                ForEach(SortOption.allCases, id: \.self) { option in
                                    Button(action: { sortOption = option }) {
                                        HStack {
                                            Text(option.rawValue)
                                            if sortOption == option {
                                                Image(systemName: "checkmark")
                                            }
                                        }
                                    }
                                }
                            } label: {
                                HStack {
                                    Image(systemName: "arrow.up.arrow.down")
                                    Text(sortOption.rawValue)
                                    Image(systemName: "chevron.down")
                                }
                                .font(.caption)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color(.systemBackground))
                                .cornerRadius(8)
                            }
                            
                            Spacer()
                            
                            // Results Count
                            Text("\(filteredPolicies.count) policies")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color(.systemGroupedBackground))
                    
                    // Policies List
                    if viewModel.isLoading {
                        Spacer()
                        ProgressView("Loading policies...")
                            .padding()
                        Spacer()
                    } else if filteredPolicies.isEmpty {
                        Spacer()
                        EmptyStateView()
                        Spacer()
                    } else {
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(filteredPolicies) { policy in
                                    PolicyCard(policy: policy)
                                        .onTapGesture {
                                            selectedPolicy = policy
                                        }
                                }
                            }
                            .padding()
                        }
                    }
                }
            }
            .navigationTitle("Air Quality Policies")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        Task {
                            await viewModel.fetchPolicies()
                        }
                    }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .sheet(item: $selectedPolicy) { policy in
                PolicyDetailView(policy: policy)
            }
        }
    }
}

// MARK: - Policy Card
struct PolicyCard: View {
    let policy: AirPolicy
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(policy.title)
                        .font(.headline)
                        .foregroundColor(.primary)
                        .lineLimit(2)
                    
                    HStack(spacing: 8) {
                        Label(policy.country, systemImage: "location.fill")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Text("•")
                            .foregroundColor(.secondary)
                        
                        Text(policy.source)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // Credibility Badge
                CredibilityBadge(score: policy.credibilityScore)
            }
            
            // Description
            if let description = policy.description {
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(3)
            }
            
            // Tags and Action
            HStack {
                // Policy Type Tag
                PolicyTypeTag(source: policy.source)
                
                Spacer()
                
                // Read More
                HStack(spacing: 4) {
                    Text("Read More")
                        .font(.caption)
                        .fontWeight(.medium)
                    Image(systemName: "arrow.right")
                        .font(.caption)
                }
                .foregroundColor(.blue)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5)
    }
}

// MARK: - Credibility Badge
struct CredibilityBadge: View {
    let score: Double
    
    var color: Color {
        if score >= 0.8 {
            return .green
        } else if score >= 0.6 {
            return .yellow
        } else {
            return .orange
        }
    }
    
    var body: some View {
        VStack(spacing: 2) {
            Image(systemName: "checkmark.seal.fill")
                .font(.title2)
                .foregroundColor(color)
            
            Text("\(Int(score * 100))%")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(color)
        }
    }
}

// MARK: - Policy Type Tag
struct PolicyTypeTag: View {
    let source: String
    
    var tagInfo: (icon: String, color: Color) {
        if source.contains("EPA") || source.contains("Gov") {
            return ("building.columns.fill", .blue)
        } else if source.contains("WHO") || source.contains("UN") {
            return ("globe.americas.fill", .green)
        } else if source.contains("Research") || source.contains("Study") {
            return ("graduationcap.fill", .purple)
        } else {
            return ("doc.text.fill", .gray)
        }
    }
    
    var body: some View {
        Label(source, systemImage: tagInfo.icon)
            .font(.caption2)
            .foregroundColor(tagInfo.color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(tagInfo.color.opacity(0.1))
            .cornerRadius(6)
    }
}

// MARK: - Policy Detail View
struct PolicyDetailView: View {
    let policy: AirPolicy
    @Environment(\.dismiss) var dismiss
    @State private var showShareSheet = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    VStack(alignment: .leading, spacing: 12) {
                        Text(policy.title)
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        HStack {
                            Label(policy.country, systemImage: "location.fill")
                                .foregroundColor(.secondary)
                            
                            Spacer()
                            
                            CredibilityBadge(score: policy.credibilityScore)
                        }
                    }
                    
                    Divider()
                    
                    // Source Information
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Source")
                            .font(.headline)
                        
                        HStack {
                            PolicyTypeTag(source: policy.source)
                            
                            Text(policy.source)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // Description
                    if let description = policy.description {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Overview")
                                .font(.headline)
                            
                            Text(description)
                                .font(.body)
                                .foregroundColor(.primary)
                        }
                    }
                    
                    // Key Points (Placeholder)
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Key Points")
                            .font(.headline)
                        
                        ForEach(["Reduce emissions by 30% by 2030",
                                "Implement stricter vehicle standards",
                                "Increase green spaces in urban areas",
                                "Monitor industrial emissions daily"], id: \.self) { point in
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                                    .font(.caption)
                                
                                Text(point)
                                    .font(.body)
                            }
                        }
                    }
                    
                    // Action Buttons
                    VStack(spacing: 12) {
                        Link(destination: URL(string: policy.url)!) {
                            HStack {
                                Text("View Original Source")
                                Image(systemName: "arrow.up.right")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        
                        Button(action: { showShareSheet = true }) {
                            HStack {
                                Text("Share Policy")
                                Image(systemName: "square.and.arrow.up")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(.systemFill))
                            .foregroundColor(.primary)
                            .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Policy Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .sheet(isPresented: $showShareSheet) {
            ShareSheet(items: [policy.url])
        }
    }
}

// MARK: - Empty State View
struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(.secondary)
            
            Text("No policies found")
                .font(.headline)
            
            Text("Try adjusting your filters or search terms")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// MARK: - Share Sheet
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    PoliciesView()
        .environmentObject(PolicyViewModel())
}
