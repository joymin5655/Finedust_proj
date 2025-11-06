/**
 * Utility helper functions
 */

export const getAQILevel = (pm25: number): { name: string; color: string; hex: string } => {
  if (pm25 <= 12) return { name: 'Good', color: 'text-brand-green', hex: '#30d158' };
  if (pm25 <= 35) return { name: 'Moderate', color: 'text-brand-yellow', hex: '#ffd60a' };
  if (pm25 <= 55) return { name: 'Unhealthy for Sensitive Groups', color: 'text-brand-orange', hex: '#ff9f0a' };
  if (pm25 <= 150) return { name: 'Unhealthy', color: 'text-brand-red', hex: '#ff453a' };
  return { name: 'Hazardous', color: 'text-brand-purple', hex: '#bf5af2' };
};

export const getAQIInfo = (pm25: number): {
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

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

export async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export const compressImage = async (file: File, maxWidth: number = 800): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
