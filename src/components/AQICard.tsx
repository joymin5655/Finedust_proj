interface AQICardProps {
  pm25: number;
  grade: string;
  loading: boolean;
  confScore?: number;
}

const getGradeStyles = (grade: string) => {
  switch (grade) {
    case 'Good':
      return 'from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 border-emerald-400 text-emerald-700 dark:text-emerald-400';
    case 'Moderate':
      return 'from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 border-amber-400 text-amber-700 dark:text-amber-400';
    case 'Unhealthy':
      return 'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 border-orange-400 text-orange-700 dark:text-orange-400';
    case 'Very Unhealthy':
      return 'from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 border-red-400 text-red-700 dark:text-red-400';
    default:
      return 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-gray-400 text-gray-700 dark:text-gray-400';
  }
};

const AQICard = ({ pm25, grade, loading, confScore = 92 }: AQICardProps) => {
  const styles = getGradeStyles(grade);

  return (
    <div className={`rounded-3xl border-2 p-8 shadow-xl bg-gradient-to-br transition-all duration-700 text-center ${styles}`}>
      <p className="text-xs uppercase tracking-widest font-bold opacity-60 mb-2">Combined PM2.5</p>
      <div className="flex items-end justify-center gap-2 mb-2">
        <span className="text-8xl font-black tracking-tighter">
          {loading ? '--' : pm25}
        </span>
        <span className="text-2xl font-bold opacity-60 pb-3">µg/m³</span>
      </div>
      <div className="text-3xl font-black uppercase tracking-tight italic">
        {loading ? 'Analyzing...' : grade}
      </div>
      
      {!loading && (
        <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-bold opacity-60">
            <span>Confidence Level</span>
            <span>{confScore}%</span>
          </div>
          <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-current rounded-full transition-all duration-1000" 
              style={{ width: `${confScore}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AQICard;