import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (file: File | null, previewUrl: string) => void;
  className?: string;
}

const ImageUploader = ({
  currentImageUrl,
  onImageChange,
  className
}: ImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || "");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreviewUrl(imageUrl);
        onImageChange(file, imageUrl);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("");
      onImageChange(null, "");
    }
  }, [onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file);
    }
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Advertisement Image</Label>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer",
          "transition-colors duration-200 ease-in-out",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
          "hover:border-blue-500"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                handleFileChange(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="py-8">
            <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Drag and drop an image, or click to select
            </p>
          </div>
        )}
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          accept="image/*"
        />
      </div>
    </div>
  );
};

export default ImageUploader;
