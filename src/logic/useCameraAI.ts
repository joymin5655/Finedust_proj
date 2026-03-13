import { useState, useCallback } from 'react';

interface AnalysisResult {
  pm25: number;
  confidence: number;
  grade: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy';
}

export const useCameraAI = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const getGrade = (pm25: number): AnalysisResult['grade'] => {
    if (pm25 <= 15) return 'Good';
    if (pm25 <= 35) return 'Moderate';
    if (pm25 <= 75) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  const analyzeImage = useCallback(async (file: File) => {
    setAnalyzing(true);
    setResult(null);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const THUMB_SIZE = 200;
    const scale = Math.min(THUMB_SIZE / img.naturalWidth, THUMB_SIZE / img.naturalHeight) || 1;
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const totalPixels = imageData.length / 4;

    let sumR = 0, sumG = 0, sumB = 0, sumBright = 0, sumContrast = 0;

    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2];
      sumR += r; sumG += g; sumB += b;
      const bright = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      sumBright += bright;
      const mx = Math.max(r, g, b) / 255;
      const mn = Math.min(r, g, b) / 255;
      sumContrast += (mx - mn);
    }

    const avgR = sumR / totalPixels / 255;
    const avgG = sumG / totalPixels / 255;
    const avgB = sumB / totalPixels / 255;
    const brightness = sumBright / totalPixels;
    const contrast = sumContrast / totalPixels / 255;

    const hazeLevel = brightness * (1 - contrast);
    const blueness = avgB - (avgR + avgG) / 2;
    const skyVisibility = Math.max(0, Math.min(1, blueness * brightness * 2));

    const hazeScore = hazeLevel * 80;
    const visibilityPenalty = (1 - skyVisibility) * 30;
    const brightnessAdj = (1 - brightness) * 20;
    const pm25 = Math.max(0, hazeScore + visibilityPenalty + brightnessAdj);

    const imageQuality = (contrast + skyVisibility) / 2;
    const confidence = Math.min(0.95, 0.55 + imageQuality * 0.25);

    await new Promise(r => setTimeout(r, 1200));

    setResult({
      pm25: Math.round(pm25 * 10) / 10,
      confidence: Math.round(confidence * 100),
      grade: getGrade(pm25),
    });
    setAnalyzing(false);
    URL.revokeObjectURL(objectUrl);
  }, []);

  return { analyzeImage, analyzing, result };
};