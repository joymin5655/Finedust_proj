import { useState, useRef } from 'react';
import { Upload, RefreshCw, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';
import { useCameraAI } from '../logic/useCameraAI';
import { useAuthStore } from '../logic/useAuthStore';
import { uploadImage, saveCapture } from '../logic/captureService';
import { Link } from 'react-router-dom';

const CameraAI = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeImage, analyzing, result } = useCameraAI();
  const { user } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setSaved(false);
      analyzeImage(selectedFile);
    }
  };

  const handleSave = async () => {
    if (!user || !result || !file) return;
    
    setSaving(true);
    try {
      // 1. Upload image to PRIVATE Storage (Returns relative path)
      const filePath = await uploadImage(file, user.id);
      
      // 2. Save path to Database
      await saveCapture({
        userId: user.id,
        imageUrl: filePath, // Storing path instead of full URL
        pm25Est: result.pm25,
        aqiClass: result.grade,
        confidence: result.confidence,
        cityName: 'My Location',
      });
      
      setSaved(true);
    } catch (err: any) {
      alert('Failed to save securely: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setFile(null);
    setSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">
          Secure Camera Sensing 🔐
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Images are stored privately and only accessible by you.
        </p>
      </div>

      <div className="bg-white dark:bg-black/20 rounded-3xl border border-gray-200 dark:border-white/10 p-6 shadow-sm overflow-hidden">
        {!preview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl py-20 flex flex-col items-center gap-4 hover:border-primary transition-all bg-gray-50/50 dark:bg-white/5"
          >
            <div className="bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform">
              <Upload className="text-primary w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-200 font-bold">Upload a sky photo</p>
              <p className="text-gray-400 text-xs mt-1">Tap to select or drag and drop</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              {analyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Analyzing haze patterns...</p>
                </div>
              )}
            </div>

            {result && !analyzing && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                    <CheckCircle2 size={18} />
                    Analysis Complete
                  </div>
                  {user ? (
                    <button 
                      onClick={handleSave}
                      disabled={saving || saved}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                        saved 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-primary text-bg-dark hover:brightness-110 disabled:opacity-50 shadow-lg shadow-primary/20'
                      }`}
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {saved ? 'Stored Privately' : 'Secure Save'}
                    </button>
                  ) : (
                    <Link to="/auth" className="text-[10px] font-black text-primary uppercase hover:underline">
                      Sign in to save securely
                    </Link>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Estimated PM2.5</p>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black text-primary">{result.pm25}</span>
                      <span className="text-xs font-bold text-gray-400 pb-1">µg/m³</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Air Quality Grade</p>
                    <span className="text-lg font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight italic">
                      {result.grade}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                    <span>AI Confidence</span>
                    <span>{result.confidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${result.confidence}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={reset}
                  className="mt-2 w-full py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  Analyze another photo
                </button>
              </div>
            )}
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10 flex gap-4">
        <AlertCircle className="text-emerald-500 shrink-0" size={20} />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Privacy Protection</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            We use **Supabase Private Storage** and **Signed URLs**. Your photos are encrypted at rest and only you can see them. We do not use your personal images for public training data without explicit consent.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraAI;