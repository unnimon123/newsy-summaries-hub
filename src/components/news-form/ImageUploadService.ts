
import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (imageFile: File | null, existingImageUrl?: string): Promise<string> => {
  // If no new image is selected but we have an existing imageUrl, return it
  if (!imageFile) {
    if (existingImageUrl) return existingImageUrl;
    throw new Error("No image selected");
  }

  // Create a unique filename
  const fileExt = imageFile.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `original/${fileName}`;

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('news-images')
    .upload(filePath, imageFile);

  if (error) throw error;

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('news-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};
