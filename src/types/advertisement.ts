export interface Advertisement {
  id?: string;
  title: string;
  image_path: string;
  cta_link: string;
  cta_text: string;
  is_active: boolean;
  display_frequency: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  imageFile?: File | null; // For handling image uploads
}
