import { supabase } from './supabase';

export interface CaptureData {
  userId: string;
  imageUrl: string;
  pm25Est: number;
  aqiClass: string;
  confidence: number;
  lat?: number;
  lon?: number;
  cityName?: string;
}

export const saveCapture = async (data: CaptureData) => {
  const { error } = await supabase.from('captures').insert({
    user_id: data.userId,
    image_url: data.imageUrl,
    pm25_est: data.pm25Est,
    aqi_class: data.aqiClass,
    confidence: data.confidence,
    location_lat: data.lat,
    location_lon: data.lon,
    city_name: data.cityName,
  });

  if (error) throw error;
  return true;
};

export const uploadImage = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('captures')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('captures').getPublicUrl(filePath);
  return data.publicUrl;
};