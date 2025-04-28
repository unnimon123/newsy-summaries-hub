import { supabase } from "@/integrations/supabase/client";

const STORAGE_BUCKET = "advertisement-images";

export const uploadAdvertisementImage = async (imageFile: File | null, existingImageUrl?: string): Promise<string> => {
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
    .from(STORAGE_BUCKET)
    .upload(filePath, imageFile);

  if (error) throw error;

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

export const deleteAdvertisementImage = async (imagePath: string): Promise<void> => {
  if (!imagePath) return;

  try {
    // Extract the path from the URL
    const url = new URL(imagePath);
    const pathParts = url.pathname.split('/');
    const startIndex = pathParts.indexOf(STORAGE_BUCKET);
    if (startIndex === -1) return;

    const path = pathParts.slice(startIndex + 1).join('/');
    if (!path) return;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
};
