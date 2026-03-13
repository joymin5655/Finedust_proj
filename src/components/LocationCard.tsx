import { MapPin } from 'lucide-react';

interface LocationCardProps {
  location: string;
  loading: boolean;
  error: string | null;
}

const LocationCard = ({ location, loading, error }: LocationCardProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-4 flex items-center gap-3 shadow-sm transition-all">
      <div className="bg-primary/10 p-2 rounded-xl">
        <MapPin className="text-primary w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-700 dark:text-gray-200 font-bold text-sm truncate">
          {loading ? 'Detecting your location...' : error ? 'Location Access Denied' : location}
        </p>
        <p className="text-gray-400 text-xs">
          {error ? 'Using default location (Seoul)' : 'Real-time GPS Monitoring'}
        </p>
      </div>
    </div>
  );
};

export default LocationCard;