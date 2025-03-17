
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageChange: (imageFile: File | null, imageUrl: string) => void;
  error?: string;
}

const ImageUploader = ({ initialImageUrl, onImageChange, error }: ImageUploaderProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Initialize image preview if there's an initial URL
  useEffect(() => {
    if (initialImageUrl) {
      setImagePreview(initialImageUrl);
      setImageUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        onImageChange(null, "");
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        onImageChange(null, "");
        return;
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageUrl("");
      
      onImageChange(file, "");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null);
    setImagePreview(null);
    onImageChange(null, url);
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageUrl("");
    onImageChange(null, "");
  };

  return (
    <div className="space-y-2">
      <Label>Image</Label>
      {imagePreview ? (
        <div className="relative mt-2">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-md" 
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={removeImage}
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <label htmlFor="image-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-primary">
                Upload an image
              </span>
              <input
                id="image-upload"
                name="image"
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
              <span className="mt-1 block text-xs text-gray-500">
                JPG, PNG, WEBP up to 5MB
              </span>
            </label>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {!imageFile && !imagePreview && (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Or enter image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            className={error ? "border-red-500" : ""}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
