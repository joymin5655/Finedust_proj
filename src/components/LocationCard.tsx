import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LocationCardProps {
  city: string; // Changed from location to city to match usage in Dashboard.tsx
  loading: boolean;
  error?: string | null; // Made error optional as it's not always passed
}

const LocationCard = ({ city, loading, error }: LocationCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-4 flex items-center gap-3 shadow-sm transition-all">
      <div className="bg-primary/10 p-2 rounded-xl">
        <MapPin className="text-primary w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-700 dark:text-gray-200 font-bold text-sm truncate">
          {loading ? t('LOCATION.DETECTING') : error ? t('LOCATION.DENIED') : city}
        </p>
        <p className="text-gray-400 text-xs">
          {error ? t('LOCATION.DEFAULT_FALLBACK') : t('LOCATION.MONITORING')}
        </p>
      </div>
    </div>
  );
};

export default LocationCard;
