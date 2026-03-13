import { useEffect, useState } from 'react';
import { useGeolocation } from '../logic/useGeolocation';
import { useAirQualityStore } from '../logic/useAirQualityStore';
import { 
  fetchAirQuality, 
  getAQIGrade, 
  estimateSatPM25, 
  integrateSources,
  getActionGuide
} from '../logic/airQualityService';
import LocationCard from '../components/LocationCard';
import AQICard from '../components/AQICard';
import DataSourcesCard from '../components/DataSourcesCard';
import { Info } from 'lucide-react';

const Dashboard = () => {
  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const { data, loading: aqLoading, setLoading, setData, setError } = useAirQualityStore();
  const [fusedData, setFusedData] = useState<any>(null);

  useEffect(() => {
    const getAQI = async () => {
      if (location) {
        setLoading(true);
        try {
          const res = await fetchAirQuality(location.latitude, location.longitude);
          
          const stationPM = res.iaqi.pm25?.v || res.aqi || 0;
          
          const satResult = estimateSatPM25(stationPM, {
            lat: location.latitude,
            month: new Date().getMonth() + 1,
            hour: new Date().getHours()
          });

          const integrated = integrateSources(stationPM, satResult?.pm25 || null, null);
          setFusedData(integrated);

          setData({
            pm25: integrated?.value || stationPM,
            aqi: res.aqi,
            city: res.city.name,
            station: res.city.name,
            source: 'Multi-source Fusion',
            lastUpdated: res.time.s,
            grade: getAQIGrade(integrated?.value || stationPM),
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    getAQI();
  }, [location, setData, setLoading, setError]);

  return (
    <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Today's Air Quality 🌤️
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Combining station data + sky photo AI to measure PM2.5
        </p>
      </div>
      
      <LocationCard 
        location={data?.city || 'Detecting...'} 
        loading={geoLoading} 
        error={geoError} 
      />

      <AQICard 
        pm25={data?.pm25 || 0} 
        grade={data?.grade || 'Analyzing...'} 
        loading={aqLoading || geoLoading} 
        confScore={fusedData?.confScore}
      />

      <DataSourcesCard 
        station={fusedData?.stationVal || '--'} 
        satellite={fusedData?.satVal || '--'} 
        camera={fusedData?.cameraVal || '--'} 
        loading={aqLoading || geoLoading} 
      />

      <div className="rounded-xl bg-white dark:bg-black/20 border-l-4 border-primary pl-4 pr-4 py-3 text-gray-700 dark:text-gray-200 text-sm leading-relaxed shadow-sm flex gap-3 items-start">
        <Info className="text-primary shrink-0 mt-0.5" size={18} />
        <div>
          {data ? (
            <>
              <p className="font-bold mb-1">Status: {data.grade}</p>
              <p>{getActionGuide(data.pm25)}</p>
            </>
          ) : (
            'Waiting for location access to provide localized air quality insights...'
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;