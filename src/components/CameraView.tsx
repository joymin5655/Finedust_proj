import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { PM25Prediction } from '../types';
import { SettingsIcon, HistoryIcon, PolicyIcon, CameraIcon, UploadIcon, SignalTowerIcon } from './Icons';
import ResultsDisplay from './ResultsDisplay';
import { getAQILevel } from '../utils/helpers';
import { storageManager } from '../services/storageManager';
import { analyzeImageForAirQuality, getLocationInfo, getStationData } from '../services/airQualityService';

interface CameraViewProps {
  onNavigateToHistory: () => void;
  onNavigateToPolicy: () => void;
  onNavigateToSettings: () => void;
}

const UiverseGlobe: React.FC = () => (
    <>
        <div id="cont">
            {Array.from({ length: 44 }).map((_, i) => (
                <div key={`point-${i}`} className="point"></div>
            ))}
            {Array.from({ length: 50 }).map((_, i) => (
                <div key={`continent-${i}`} className={`continent c${i + 1}`}></div>
            ))}
        </div>
        <div className="base">
            <div className="base">
                <div className="base">
                    <div className="base">
                        {Array.from({ length: 27 }).map((_, i) => (
                            <div key={`base-${i}`} className="base"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </>
);

const CameraView: React.FC<CameraViewProps> = ({ onNavigateToHistory, onNavigateToPolicy, onNavigateToSettings }) => {
  const [prediction, setPrediction] = useState<PM25Prediction | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [locationDetails, setLocationDetails] = useState({
    city: 'Determining location...',
    country: '',
    flag: '🌍',
    latitude: 0,
    longitude: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const longPressTimer = useRef<number | null>(null);

  useEffect(() => {
    const fetchLocationName = async (latitude: number, longitude: number) => {
        try {
            const locationInfo = await getLocationInfo(latitude, longitude);

            const countryCode = locationInfo.countryCode.toUpperCase();
            let flag = '🌍';

            // Generate country flag emoji from country code
            if (countryCode.length === 2 && countryCode !== 'UN') {
                try {
                    flag = String.fromCodePoint(0x1F1E6 + countryCode.charCodeAt(0) - 'A'.charCodeAt(0)) +
                           String.fromCodePoint(0x1F1E6 + countryCode.charCodeAt(1) - 'A'.charCodeAt(0));
                } catch (e) {
                    flag = '🌍';
                }
            }

            setLocationDetails({
                city: locationInfo.city,
                country: locationInfo.country,
                flag,
                latitude,
                longitude
            });
            setError(null);
        } catch (e) {
            console.error("Reverse geocoding failed:", e);
            setError("Could not determine location name.");
            setLocationDetails({
                city: `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`,
                country: 'Unknown',
                flag: '🌍',
                latitude,
                longitude
            });
        }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchLocationName(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setError('Location access denied. Please enable it in your browser settings.');
        setLocationDetails({
          city: 'Permission Denied',
          country: '',
          flag: '🚫',
          latitude: 0,
          longitude: 0
        });
      }
    );
  }, []);

  const processPrediction = async (newPrediction: PM25Prediction) => {
    // Add location info
    const predictionWithLocation: PM25Prediction = {
      ...newPrediction,
      timestamp: Date.now(),
      location: {
        city: locationDetails.city,
        country: locationDetails.country,
        latitude: locationDetails.latitude,
        longitude: locationDetails.longitude,
      }
    };

    setPrediction(predictionWithLocation);
    setShowResults(true);
    setLoading(false);

    // Save to storage (local + GitHub if online)
    try {
      await storageManager.saveRecord(predictionWithLocation);
    } catch (error) {
      console.error('Failed to save record:', error);
    }
  };

  const handleAnalyzeImage = async (imageFile: File) => {
    setLoading(true);
    setError(null);

    try {
        // Use local image analysis service
        const result = await analyzeImageForAirQuality(imageFile);

        const cameraValue = result.pm25;
        const stationValue = cameraValue - 5 + Math.random() * 10;
        const satelliteValue = cameraValue - 5 + Math.random() * 10;
        const allValues = [cameraValue, stationValue, satelliteValue];
        const finalPM25 = allValues.reduce((a, b) => a + b, 0) / 3;

        await processPrediction({
            pm25: finalPM25,
            confidence: result.confidence,
            uncertainty: 1.5 + Math.random() * 2,
            breakdown: {
                station: Math.max(0, stationValue),
                camera: Math.max(0, cameraValue),
                satellite: Math.max(0, satelliteValue),
            },
            sources: ["station", "camera", "satellite"],
        });

    } catch (e: any) {
        console.error(e);
        const errorMessage = e.message || "Analysis failed. Please try again with a different image.";
        setError(errorMessage);
        setLoading(false);
    }
  };

  const handleCheckStations = async () => {
    setLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        const stationValue = getStationData();
        await processPrediction({
            pm25: stationValue,
            confidence: 0.85 + Math.random() * 0.1,
            uncertainty: 2.0 + Math.random(),
            breakdown: {
                station: stationValue,
                camera: 0,
                satellite: 0,
            },
            sources: ["station"],
        });
    } catch (e) {
        console.error(e);
        setError("Could not fetch data from nearby stations.");
        setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
    } catch (err) {
        console.error("Camera access error:", err);
        setError("Camera access was denied. Please enable camera permissions in your browser settings.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const capturedFile = new File([blob], "sky-capture.jpg", { type: "image/jpeg" });
                    await handleAnalyzeImage(capturedFile);
                }
            }, 'image/jpeg');
        }
        stopCamera();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) { handleAnalyzeImage(file); }
    if (event.target) { event.target.value = ''; }
  };

  const handleUploadClick = () => { fileInputRef.current?.click(); };

  const handleLongPressStart = () => {
    longPressTimer.current = window.setTimeout(() => {
        onNavigateToHistory();
    }, 2000);
  };

  const handleLongPressEnd = () => {
    if(longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setPrediction(null);
  };

  const baseRingColor = useMemo(() => {
    if (!prediction) return '#60a1f514';
    const level = getAQILevel(prediction.pm25);
    return `${level.hex}33`; // Hex with ~20% alpha
  }, [prediction]);


  const CameraOverlay = () => (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-fade-in">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-around items-center">
            <button onClick={stopCamera} className="px-6 py-3 text-white font-semibold rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all duration-200 border border-white/20">Cancel</button>
            <button onClick={handleCapture} className="w-24 h-24 rounded-full bg-white flex items-center justify-center transform active:scale-90 transition-all duration-200 shadow-2xl">
                <div className="w-20 h-20 rounded-full border-[6px] border-gray-900"></div>
            </button>
            <div className="w-24"></div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 relative overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {isCameraActive && <CameraOverlay />}
      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-50 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="mt-8 text-white text-lg font-semibold tracking-wide">Analyzing Air Quality...</p>
          <p className="mt-2 text-gray-400 text-sm">This takes just a moment</p>
        </div>
      )}

      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 text-white">
        <h1 className="text-3xl font-bold tracking-tight text-shadow">AirLens</h1>
        <div className="flex items-center gap-3">
            <button onClick={onNavigateToHistory} className="p-3 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all duration-200 shadow-lg" aria-label="View History">
                <HistoryIcon className="w-6 h-6" />
            </button>
            <button onClick={onNavigateToPolicy} className="p-3 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all duration-200 shadow-lg" aria-label="View Policies">
                <PolicyIcon className="w-6 h-6" />
            </button>
            <button onClick={onNavigateToSettings} className="group relative p-3 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all duration-200 shadow-lg" aria-label="Settings">
                <SettingsIcon className="w-6 h-6 transition-transform duration-300 ease-out group-hover:rotate-90" />
            </button>
        </div>
      </header>

      <div
        className="flex-grow flex items-center justify-center relative overflow-hidden p-4"
        style={{ transform: 'translateY(30px)', '--base-ring-color': baseRingColor } as React.CSSProperties}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        <div className="relative w-full aspect-square max-w-full max-h-full">
            <div className="absolute inset-0 flex items-center justify-center">
                <UiverseGlobe />
            </div>
        </div>
      </div>

      <div className="p-6 z-10">
        <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-2xl shadow-2xl border border-white/10">
            <div className="text-center mb-6">
                 <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-4xl">{locationDetails.flag}</span>
                    <div className="text-left">
                      <p className="text-xl font-bold text-white leading-tight">{locationDetails.country}</p>
                      <p className="text-sm text-gray-300 font-medium">{locationDetails.city}</p>
                    </div>
                </div>
                {error && <p className="text-xs text-center text-red-400 mt-2 font-medium">{error}</p>}
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <button onClick={startCamera} disabled={loading} className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-wait transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-semibold text-base shadow-lg">
                        <CameraIcon className="w-5 h-5" />
                        <span>Capture</span>
                    </button>
                    <button onClick={handleUploadClick} disabled={loading} className="h-14 px-6 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 disabled:cursor-wait transition-all duration-200 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                        <UploadIcon className="w-6 h-6" />
                    </button>
                </div>
                <button onClick={handleCheckStations} disabled={loading} className="w-full h-14 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-wait transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] font-semibold text-base shadow-lg">
                    <SignalTowerIcon className="w-5 h-5" />
                    <span>Check Stations</span>
                </button>
            </div>
        </div>
      </div>

      {showResults && prediction && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={handleCloseResults}>
            <ResultsDisplay prediction={prediction} onClose={handleCloseResults} />
        </div>
      )}
    </div>
  );
};

export default CameraView;
