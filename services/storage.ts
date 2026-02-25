import { supabase, isSupabaseConfigured } from '../supabaseClient';

export const uploadImage = async (file: File, bucket: string): Promise<string | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.warn(`Could not upload image to ${bucket}:`, uploadError.message || uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error: any) {
    console.warn(`Unexpected error uploading image to ${bucket}:`, error.message || error);
    return null;
  }
};
