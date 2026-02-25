import { supabase } from '../supabaseClient';

export const uploadImage = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
