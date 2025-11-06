import React, { useMemo } from 'react';
import type { PM25Prediction } from '../types';
import { getAQIInfo } from '../utils/helpers';

interface ResultsDisplayProps {
  prediction: PM25Prediction;
  onClose: () => void;
}

const Confetti: React.FC = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
    {Array.from({ length: 19 }).map((_, i) => (
      <div
        key={i}
        className="confetti-piece absolute w-2 h-4 top-0 opacity-0 animate-rain"
        style={{
          left: `${(i * 5 + Math.random() * 5)}%`,
          transform: `rotate(${Math.random() * 360}deg)`,
          animationDelay: `${Math.random() * 2000}ms`,
          animationDuration: `${2000 + Math.random() * 2000}ms`,
          backgroundColor: ['#30d158', '#ffd60a', '#0a84ff'][i % 3]
        }}
      />
    ))}
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ prediction, onClose }) => {
  const { level, message, ringGradient, buttonGradient, textColor } = useMemo(() => getAQIInfo(prediction.pm25), [prediction.pm25]);
  const showConfetti = prediction.pm25 <= 12;
  const textShadow = '[text-shadow:0_2px_4px_rgba(0,0,0,0.7)]';
  const dropShadow = '[filter:drop-shadow(0_2px_2px_rgba(0,0,0,0.8))]';

  return (
    <div
      className="relative w-[380px] mx-4 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {showConfetti && <Confetti />}
      <div className="relative z-10 w-full flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em] mb-6">Air Quality Index</p>

        <div className={`w-48 h-48 mb-6 rounded-full bg-gradient-to-br ${ringGradient} flex flex-col items-center justify-center shadow-2xl animate-gradient bg-size-200 border-4 border-white/10`}>
          <div className="text-7xl font-bold text-white drop-shadow-2xl">
            {prediction.pm25.toFixed(0)}
          </div>
          <p className="text-base font-semibold text-white/80 mt-2">μg/m³</p>
        </div>

        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${textColor} mb-3 tracking-tight`}>{level}</h2>
          <p className="text-base text-gray-300 max-w-sm leading-relaxed px-4">{message}</p>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-4 rounded-2xl text-white font-semibold text-base tracking-wide bg-gradient-to-r ${buttonGradient} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
