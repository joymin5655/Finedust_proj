import React, { useMemo } from 'react';
import type { PM25Prediction } from '../types';

interface ResultsDisplayProps {
  prediction: PM25Prediction;
  onClose: () => void;
}

const getAQIInfo = (pm25: number): {
  level: string;
  message: string;
  ringGradient: string;
  buttonGradient: string;
  textColor: string;
} => {
  if (pm25 <= 12) return {
    level: 'Good',
    message: 'The air quality is excellent. A great day for outdoor activities!',
    ringGradient: 'from-green-500/80 to-cyan-500/80',
    buttonGradient: 'from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700',
    textColor: 'text-green-300'
  };
  if (pm25 <= 35) return {
    level: 'Moderate',
    message: 'Air quality is acceptable. Sensitive individuals may experience some effects.',
    ringGradient: 'from-yellow-500/80 to-amber-500/80',
    buttonGradient: 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700',
    textColor: 'text-yellow-300'
  };
  if (pm25 <= 55) return {
    level: 'Unhealthy for Sensitive Groups',
    message: 'Sensitive groups may experience health effects. Limit prolonged outdoor exertion.',
    ringGradient: 'from-orange-500/80 to-red-500/80',
    buttonGradient: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
    textColor: 'text-orange-300'
  };
  if (pm25 <= 150) return {
    level: 'Unhealthy',
    message: 'Everyone may begin to experience health effects. Reduce outdoor activities.',
    ringGradient: 'from-red-500/80 to-rose-500/80',
    buttonGradient: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
    textColor: 'text-red-300'
  };
  return {
    level: 'Hazardous',
    message: 'Health alert: everyone may experience more serious health effects.',
    ringGradient: 'from-purple-500/80 to-indigo-500/80',
    buttonGradient: 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700',
    textColor: 'text-purple-300'
  };
};

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
      className="relative w-[340px] animate-fade-in"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card
    >
      {showConfetti && <Confetti />}
      <div className={`relative z-10 w-full flex flex-col items-center justify-center p-6 text-white`}>
        <h3 className={`text-lg font-bold text-gray-300 uppercase tracking-wider ${textShadow}`}>Your Result</h3>
        
        <div className={`w-40 h-40 my-4 rounded-full bg-gradient-to-br ${ringGradient} flex flex-col items-center justify-center shadow-lg animate-gradient bg-size-200`}>
          <div className={`text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-300 ${dropShadow}`}>
            {prediction.pm25.toFixed(0)}
          </div>
          <p className={`text-sm font-medium text-gray-300 ${textShadow}`}>μg/m³</p>
        </div>
        
        <div className="text-center">
          <h2 className={`text-2xl font-bold capitalize ${textColor} ${textShadow}`}>{level}</h2>
          <p className={`mt-2 text-base text-gray-300 max-w-xs ${textShadow}`}>{message}</p>
        </div>
        
        <button onClick={onClose} className={`w-full mt-6 py-3 rounded-full text-white font-bold uppercase tracking-widest bg-gradient-to-r ${buttonGradient} transition-transform duration-200 transform hover:scale-105 active:scale-95 shadow-lg`}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
