import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { PM25Prediction } from '../types';
import { SettingsIcon, GlobeIcon, CameraIcon, UploadIcon, SignalTowerIcon } from '../components/icons';
import { GoogleGenAI, Type } from "@google/genai";
import ResultsDisplay from './ResultsDisplay';

interface CameraViewProps {
  onNavigateToGlobe: () => void;
  onNavigateToSettings: () => void;
}

const getAQILevel = (pm25: number): { name: string; color: string; hex: string; } => {
  if (pm25 <= 12) return { name: 'Good', color: 'text-brand-green', hex: '#30d158' };
  if (pm25 <= 35) return { name: 'Moderate', color: 'text-brand-yellow', hex: '#ffd60a' };
  if (pm25 <= 55) return { name: 'Unhealthy for Sensitive Groups', color: 'text-brand-orange', hex: '#ff9f0a' };
  if (pm25 <= 150) return { name: 'Unhealthy', color: 'text-brand-red', hex: '#ff453a' };
  return { name: 'Hazardous', color: 'text-brand-purple', hex: '#bf5af2' };
};

const UiverseGlobe: React.FC = () => (
    <>
        <div id="cont">
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div><div className="point"></div>
            <div className="point"></div><div className="point"></div>
            <div className="continent c1"></div><div className="continent c2"></div><div className="continent c3"></div>
            <div className="continent c4"></div><div className="continent c5"></div><div className="continent c6"></div>
            <div className="continent c7"></div><div className="continent c8"></div><div className="continent c9"></div>
            <div className="continent c10"></div><div className="continent c11"></div><div className="continent c12"></div>
            <div className="continent c13"></div><div className="continent c14"></div><div className="continent c15"></div>
            <div className="continent c16"></div><div className="continent c17"></div><div className="continent c18"></div>
            <div className="continent c19"></div><div className="continent c20"></div><div className="continent c21"></div>
            <div className="continent c22"></div><div className="continent c23"></div><div className="continent c24"></div>
            <div className="continent c25"></div><div className="continent c26"></div><div className="continent c27"></div>
            <div className="continent c28"></div><div className="continent c29"></div><div className="continent c30"></div>
            <div className="continent c31"></div><div className="continent c32"></div><div className="continent c33"></div>
            <div className="continent c34"></div><div className="continent c35"></div><div className="continent c36"></div>
            <div className="continent c37"></div><div className="continent c38"></div><div className="continent c39"></div>
            <div className="continent c40"></div><div className="continent c41"></div><div className="continent c42"></div>
            <div className="continent c43"></div><div className="continent c44"></div><div className="continent c45"></div>
            <div className="continent c46"></div><div className="continent c47"></div><div className="continent c48"></div>
            <div className="continent c49"></div><div className="continent c50"></div>
        </div>
        <div className="base">
            <div className="base">
                <div className="base">
                    <div className="base">
                        <div className="base"></div><div className="base"></div><div className="base"></div>
                        <div className="base"></div><div className="base"></div><div className="base"></div>
                        <div className="base"></div><div className="base"></div><div className="base"></div>
                        <div className="base"></div><div className="base"></div><div className="base"></div>
                        <div className="base"></div><div className="base"></div><div className="base"></div>
                        <div className="base"></div><div className="base"></div><div className="base"></div>
                        <div className="base"></div><div className="base"></div><div className="base"></div>
                        <div className="base"></div><div className="base"></div><div className="base"></div>
                        <div className="base"></div><div className="base"></div><div className="base"></div>
                        <div className="base"></div>
                    </div>
                </div>
            </div>
        </div>
    </>
);

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

const CameraView: React.FC<CameraViewProps> = ({ onNavigateToGlobe, onNavigateToSettings }) => {
  const [prediction, setPrediction] = useState<PM25Prediction | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [locationDetails, setLocationDetails] = useState({ city: 'Determining location...', country: '', flag: '🌍' });
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
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    city: { type: Type.STRING },
                    country: { type: Type.STRING },
                    countryCode: { type: Type.STRING, description: 'ISO 3166-1 alpha-2 two-letter country code.' }
                },
                required: ['city', 'country', 'countryCode']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: `Provide the city, country, and two-letter ISO 3166-1 alpha-2 country code for latitude: ${latitude}, longitude: ${longitude}.` }] },
                config: { responseMimeType: "application/json", responseSchema },
            });
            const result = JSON.parse(response.text);
            const countryCode = result.countryCode.toUpperCase();
            const flag = String.fromCodePoint(0x1F1E6 + countryCode.charCodeAt(0) - 'A'.charCodeAt(0)) +
                         String.fromCodePoint(0x1F1E6 + countryCode.charCodeAt(1) - 'A'.charCodeAt(0));

            setLocationDetails({ city: result.city, country: result.country, flag });
            setError(null);
        } catch (e) {
            console.error("Reverse geocoding failed:", e);
            setError("Could not determine location name.");
            setLocationDetails({ city: `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`, country: 'Unknown', flag: '🌍' });
        }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchLocationName(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setError('Location access denied. Please enable it in your browser settings.');
        setLocationDetails({ city: 'Permission Denied', country: '', flag: '🚫' });
      }
    );
  }, []);
  
  const processPrediction = (newPrediction: PM25Prediction) => {
    setPrediction(newPrediction);
    setShowResults(true);
    setLoading(false);
  };

  const handleAnalyzeImage = async (imageFile: File) => {
    setLoading(true);
    setError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const imagePart = await fileToGenerativePart(imageFile);
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                pm25: { type: Type.NUMBER, description: 'Estimated PM2.5 value in μg/m³.' },
                confidence: { type: Type.NUMBER, description: 'Confidence score from 0.0 to 1.0.' },
                analysis: { type: Type.STRING, description: 'A brief analysis of the sky.' }
            },
            required: ['pm25', 'confidence', 'analysis']
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [ imagePart, { text: 'Analyze the sky in this image to estimate the air quality. Provide a PM2.5 value, a confidence score between 0 and 1, and a brief one-sentence analysis of the sky conditions (e.g., "Clear skies with some haze").' }] },
            config: { responseMimeType: "application/json", responseSchema },
        });

        const resultJson = JSON.parse(response.text);
        
        const cameraValue = resultJson.pm25;
        const stationValue = cameraValue - 5 + Math.random() * 10;
        const satelliteValue = cameraValue - 5 + Math.random() * 10;
        const allValues = [cameraValue, stationValue, satelliteValue];
        const finalPM25 = allValues.reduce((a, b) => a + b, 0) / 3;

        processPrediction({
            pm25: finalPM25,
            confidence: resultJson.confidence,
            uncertainty: 1.5 + Math.random() * 2,
            breakdown: {
                station: Math.max(0, stationValue),
                camera: Math.max(0, cameraValue),
                satellite: Math.max(0, satelliteValue),
            },
            sources: ["station", "camera", "satellite"],
        });

    } catch (e) {
        console.error(e);
        setError("Analysis failed. Please try again with a different image.");
        setLoading(false);
    }
  };

  const handleCheckStations = async () => {
    setLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        const stationValue = 10 + Math.random() * 45;
        processPrediction({
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
        onNavigateToGlobe();
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
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-around items-center">
            <button onClick={stopCamera} className="px-4 py-2 text-white font-semibold rounded-lg bg-white/10 hover:bg-white/20">Cancel</button>
            <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white flex items-center justify-center transform active:scale-90 transition-transform">
                <div className="w-16 h-16 rounded-full border-4 border-black"></div>
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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="loader-frame">
            <div className="loader-center">
              <div className="dot-1"></div>
              <div className="dot-2"></div>
              <div className="dot-3"></div>
            </div>
          </div>
        </div>
      )}

      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 text-white">
        <h1 className="text-xl lg:text-2xl font-bold text-shadow">AirLens</h1>
        <div className="flex items-center space-x-2">
            <button onClick={onNavigateToGlobe} className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors">
                <GlobeIcon className="w-6 h-6" />
            </button>
            <button onClick={onNavigateToSettings} className="group relative p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors">
                <SettingsIcon className="w-6 h-6 transition-transform duration-400 ease-in-out group-hover:rotate-60 group-active:animate-rot" />
            </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row items-center justify-center">
        <div 
          className="w-full h-full flex-grow flex items-center justify-center relative overflow-hidden p-4 lg:w-1/2"
          style={{ '--base-ring-color': baseRingColor } as React.CSSProperties}
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

        <div className="p-4 z-10 w-full lg:w-1/2 lg:p-8">
          <div className="p-4 rounded-3xl bg-black/30 backdrop-blur-xl shadow-lg border border-white/10">
              <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-2">
                      <span className="text-2xl lg:text-3xl">{locationDetails.flag}</span>
                      <p className="text-lg lg:text-xl font-bold text-white">{locationDetails.country}</p>
                      <p className="text-base lg:text-lg text-gray-300">{locationDetails.city}</p>
                  </div>
                  {error && <p className="text-xs text-center text-red-400 mt-1">{error}</p>}
              </div>
              <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                      <button onClick={startCamera} disabled={loading} className="w-[70%] h-12 bg-gray-700/80 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait transition-all duration-300 hover:bg-gray-600 active:scale-95 transform">
                          <CameraIcon className="w-5 h-5" />
                          <span className="text-sm font-semibold">Capture</span>
                      </button>
                      <button onClick={handleUploadClick} disabled={loading} className="w-[30%] h-12 bg-brand-blue text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait transition-all duration-300 hover:bg-blue-600 active:scale-95 transform">
                          <UploadIcon className="w-5 h-5" />
                          <span className="text-sm font-semibold">Upload</span>
                      </button>
                  </div>
                  <button onClick={handleCheckStations} disabled={loading} className="w-full h-12 bg-purple-600/80 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait transition-all duration-300 hover:bg-purple-700 active:scale-95 transform">
                      <SignalTowerIcon className="w-5 h-5" />
                      <span className="text-sm font-semibold">Stations</span>
                  </button>
              </div>
          </div>
        </div>
      </main>
      
      {showResults && prediction && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={handleCloseResults}>
            <ResultsDisplay prediction={prediction} onClose={handleCloseResults} />
        </div>
      )}
    </div>
  );
};

export default CameraView;