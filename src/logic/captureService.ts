import { supabase } from './supabase';

export interface CaptureData {
  userId: string;
  imageUrl: string; // Store the relative path instead of full URL for private buckets
  pm25Est: number;
  aqiClass: string;
  confidence: number;
  lat?: number;
  lon?: number;
  cityName?: string;
}

/**
 * Saves capture metadata to the database.
 * We store the file path instead of the full URL for private access.
 */
export const saveCapture = async (data: CaptureData) => {
  const { error } = await supabase.from('captures').insert({
    user_id: data.userId,
    image_url: data.imageUrl, // This is now the path (e.g., "uid/12345.jpg")
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

/**
 * Uploads an image to a PRIVATE bucket.
 * Returns the relative path of the uploaded file.
 */
export const uploadImage = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('captures')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Return the path to be stored in the DB
  return filePath;
};

/**
 * Generates a temporary Signed URL for a private image.
 * Valid for 1 hour by default.
 */
export const getPrivateImageUrl = async (path: string) => {
  const { data, error } = await supabase.storage
    .from('captures')
    .createSignedUrl(path, 3600); // 3600 seconds = 1 hour

  if (error) throw error;
  return data.signedUrl;
};