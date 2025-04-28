import { supabase } from "@/integrations/supabase/client";
import { Advertisement } from "@/types/advertisement";
import { uploadAdvertisementImage, deleteAdvertisementImage } from "./advertisementImageService";

export const createAdvertisement = async (ad: Advertisement): Promise<Advertisement> => {
  try {
    let imagePath = ad.image_path;

    // Upload image if provided
    if (ad.imageFile) {
      imagePath = await uploadAdvertisementImage(ad.imageFile);
    }

    const { data, error } = await supabase
      .from('advertisements')
      .insert([{
        title: ad.title,
        image_path: imagePath,
        cta_link: ad.cta_link,
        cta_text: ad.cta_text,
        is_active: ad.is_active,
        display_frequency: ad.display_frequency,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating advertisement:", error);
    throw error;
  }
};

export const updateAdvertisement = async (ad: Advertisement): Promise<Advertisement> => {
  if (!ad.id) throw new Error("Advertisement ID is required");

  try {
    let imagePath = ad.image_path;

    // Upload new image if provided
    if (ad.imageFile) {
      // Delete old image first
      await deleteAdvertisementImage(ad.image_path);
      imagePath = await uploadAdvertisementImage(ad.imageFile);
    }

    const { data, error } = await supabase
      .from('advertisements')
      .update({
        title: ad.title,
        image_path: imagePath,
        cta_link: ad.cta_link,
        cta_text: ad.cta_text,
        is_active: ad.is_active,
        display_frequency: ad.display_frequency,
      })
      .eq('id', ad.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating advertisement:", error);
    throw error;
  }
};

export const deleteAdvertisement = async (id: string): Promise<void> => {
  try {
    // First get the advertisement details
    const { data: ad, error: fetchError } = await supabase
      .from('advertisements')
      .select('image_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!ad) throw new Error("Advertisement not found");

    // Delete the image first if it exists
    if (ad.image_path) {
      try {
        await deleteAdvertisementImage(ad.image_path);
      } catch (imageError) {
        console.error("Warning: Failed to delete image:", imageError);
        // Continue with ad deletion even if image deletion fails
      }
    }

    // Delete the advertisement record
    const { error: deleteError } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete advertisement");
  }
};

export const toggleAdvertisementStatus = async (id: string, isActive: boolean): Promise<Advertisement> => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error toggling advertisement status:", error);
    throw error;
  }
};

export const getAdvertisements = async (): Promise<Advertisement[]> => {
  try {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    throw error;
  }
};
