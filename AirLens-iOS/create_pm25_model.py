#!/usr/bin/env python3
"""
PM2.5 Prediction Model Creator for AirLens iOS App

This script creates a Core ML model that predicts PM2.5 levels
from sky image features (brightness, saturation, contrast, etc.)

Requirements:
    pip install coremltools numpy scikit-learn

Usage:
    python3 create_pm25_model.py
"""

import coremltools as ct
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import json

def create_training_data():
    """
    Create synthetic training data based on observed relationships
    between sky appearance and PM2.5 levels.
    
    Features:
    - brightness (0-1): Overall image brightness
    - saturation (0-1): Color saturation
    - blue_ratio (0-1): Proportion of blue in image
    - contrast (0-1): Image contrast
    - haze_score (0-1): Estimated haze level
    """
    np.random.seed(42)
    n_samples = 10000
    
    # Generate feature data
    brightness = np.random.uniform(0, 1, n_samples)
    saturation = np.random.uniform(0, 1, n_samples)
    blue_ratio = np.random.uniform(0, 1, n_samples)
    contrast = np.random.uniform(0, 1, n_samples)
    haze_score = np.random.uniform(0, 1, n_samples)
    
    # Create PM2.5 values based on realistic relationships
    # Good air quality: bright, saturated, high blue, high contrast, low haze
    # Poor air quality: dark, desaturated, low blue, low contrast, high haze
    
    pm25 = (
        # Brightness effect (brighter = lower PM2.5)
        (1 - brightness) * 50 +
        # Saturation effect (more saturated = lower PM2.5)
        (1 - saturation) * 30 +
        # Blue ratio effect (more blue = lower PM2.5)
        (1 - blue_ratio) * 40 +
        # Contrast effect (higher contrast = lower PM2.5)
        (1 - contrast) * 25 +
        # Haze score effect (more haze = higher PM2.5)
        haze_score * 45 +
        # Add some noise for realism
        np.random.normal(0, 5, n_samples)
    )
    
    # Clip to realistic PM2.5 range (0-300)
    pm25 = np.clip(pm25, 0, 300)
    
    # Create feature matrix
    X = np.column_stack([brightness, saturation, blue_ratio, contrast, haze_score])
    
    return X, pm25

def train_model():
    """Train Random Forest model for PM2.5 prediction"""
    print("🎓 Creating training data...")
    X, y = create_training_data()
    
    print(f"📊 Training data shape: {X.shape}")
    print(f"📈 PM2.5 range: {y.min():.1f} - {y.max():.1f} μg/m³")
    
    # Split data
    split_idx = int(0.8 * len(X))
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest model
    print("🌲 Training Random Forest model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"✅ Training R² score: {train_score:.4f}")
    print(f"✅ Testing R² score: {test_score:.4f}")
    
    # Make predictions for validation
    y_pred = model.predict(X_test_scaled)
    mae = np.mean(np.abs(y_pred - y_test))
    print(f"📉 Mean Absolute Error: {mae:.2f} μg/m³")
    
    return model, scaler

def convert_to_coreml(model, scaler):
    """Convert scikit-learn model to Core ML format"""
    print("\n🔄 Converting to Core ML format...")
    
    # Feature names
    feature_names = [
        "brightness",
        "saturation", 
        "blue_ratio",
        "contrast",
        "haze_score"
    ]
    
    # Convert sklearn model to Core ML
    coreml_model = ct.converters.sklearn.convert(
        model,
        input_features=feature_names,
        output_feature_names=["pm25_prediction"]
    )
    
    # Add metadata
    coreml_model.author = "AirLens Team"
    coreml_model.short_description = "Predicts PM2.5 air quality from sky image features"
    coreml_model.version = "1.0"
    
    # Add feature descriptions
    coreml_model.input_description["brightness"] = "Overall image brightness (0-1)"
    coreml_model.input_description["saturation"] = "Color saturation (0-1)"
    coreml_model.input_description["blue_ratio"] = "Proportion of blue color (0-1)"
    coreml_model.input_description["contrast"] = "Image contrast (0-1)"
    coreml_model.input_description["haze_score"] = "Estimated haze level (0-1)"
    
    coreml_model.output_description["pm25_prediction"] = "Predicted PM2.5 level (μg/m³)"
    
    # Save scaler parameters for use in Swift
    scaler_params = {
        "mean": scaler.mean_.tolist(),
        "scale": scaler.scale_.tolist()
    }
    
    return coreml_model, scaler_params

def save_model(coreml_model, scaler_params):
    """Save Core ML model and scaler parameters"""
    model_path = "PM25Predictor.mlmodel"
    scaler_path = "scaler_params.json"
    
    print(f"\n💾 Saving Core ML model to {model_path}...")
    coreml_model.save(model_path)
    
    print(f"💾 Saving scaler parameters to {scaler_path}...")
    with open(scaler_path, 'w') as f:
        json.dump(scaler_params, f, indent=2)
    
    print("\n✅ Model creation complete!")
    print(f"📦 Files created:")
    print(f"   - {model_path}")
    print(f"   - {scaler_path}")
    print("\n📋 Next steps:")
    print("   1. Drag PM25Predictor.mlmodel into your Xcode project")
    print("   2. Copy scaler_params.json values into Swift code")
    print("   3. Build and run your app!")

def test_model(coreml_model):
    """Test the Core ML model with sample inputs"""
    print("\n🧪 Testing model with sample inputs...")
    
    test_cases = [
        {
            "name": "Clear Blue Sky",
            "features": {"brightness": 0.9, "saturation": 0.8, "blue_ratio": 0.85, "contrast": 0.7, "haze_score": 0.1},
            "expected": "Low PM2.5 (Good)"
        },
        {
            "name": "Hazy Sky",
            "features": {"brightness": 0.5, "saturation": 0.3, "blue_ratio": 0.4, "contrast": 0.3, "haze_score": 0.7},
            "expected": "High PM2.5 (Unhealthy)"
        },
        {
            "name": "Overcast",
            "features": {"brightness": 0.4, "saturation": 0.2, "blue_ratio": 0.3, "contrast": 0.2, "haze_score": 0.5},
            "expected": "Moderate PM2.5"
        }
    ]
    
    for test in test_cases:
        prediction = coreml_model.predict(test["features"])
        pm25 = prediction["pm25_prediction"]
        print(f"   {test['name']}: {pm25:.1f} μg/m³ ({test['expected']})")

def main():
    """Main execution function"""
    print("=" * 60)
    print("🌍 AirLens PM2.5 Prediction Model Creator")
    print("=" * 60)
    
    # Train model
    model, scaler = train_model()
    
    # Convert to Core ML
    coreml_model, scaler_params = convert_to_coreml(model, scaler)
    
    # Test model
    test_model(coreml_model)
    
    # Save model
    save_model(coreml_model, scaler_params)
    
    print("\n" + "=" * 60)
    print("🎉 Success! Your Core ML model is ready!")
    print("=" * 60)

if __name__ == "__main__":
    main()
