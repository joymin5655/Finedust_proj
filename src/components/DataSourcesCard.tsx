import { Radio, Satellite, Camera } from 'lucide-react';

interface DataSourcesCardProps {
  station: number | string;
  satellite: number | string;
  camera: number | string;
  loading: boolean;
}

const DataSourcesCard = ({ station, satellite, camera, loading }: DataSourcesCardProps) => {
  const sources = [
    { label: 'Station', icon: <Radio size={18} />, value: station, color: 'text-blue-400' },
    { label: 'Satellite', icon: <Satellite size={18} />, value: satellite, color: 'text-primary' },
    { label: 'Camera AI', icon: <Camera size={18} />, value: camera, color: 'text-amber-400' },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 font-bold flex items-center gap-2">
        <Satellite className="text-primary w-4 h-4" />
        Data Sources Breakdown
      </p>
      <div className="grid grid-cols-3 gap-3">
        {sources.map((src) => (
          <div key={src.label} className="flex flex-col items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 p-4 border border-transparent hover:border-primary/20 transition-all">
            <div className={`${src.color} opacity-80`}>{src.icon}</div>
            <span className="text-[10px] uppercase font-bold text-gray-400">{src.label}</span>
            <div className="flex flex-col items-center leading-none">
              <span className="text-xl font-black text-gray-800 dark:text-white">
                {loading ? '--' : src.value}
              </span>
              <span className="text-[10px] font-bold text-gray-400 mt-1">µg/m³</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSourcesCard;