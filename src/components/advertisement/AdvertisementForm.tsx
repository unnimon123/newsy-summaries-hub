import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import ImageUploader from "./ImageUploader";
import { Advertisement } from "@/types/advertisement";
import { toast } from "sonner";

interface AdvertisementFormProps {
  advertisement?: Advertisement;
  onSubmit: (ad: Advertisement) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AdvertisementForm = ({ 
  advertisement, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: AdvertisementFormProps) => {
  const [formData, setFormData] = useState<Advertisement>(
    advertisement || {
      title: "",
      image_path: "",
      cta_link: "",
      cta_text: "Learn More",
      is_active: false,
      display_frequency: 5
    }
  );
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.image_path && !imageFile) {
      newErrors.image = "Image is required";
    }
    
    if (!formData.cta_link.trim()) {
      newErrors.cta_link = "CTA Link is required";
    }

    if (formData.display_frequency < 1) {
      newErrors.display_frequency = "Display frequency must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    try {
      await onSubmit({
        ...formData,
        imageFile // Pass the image file to parent for upload
      });
    } catch (error) {
      console.error("Error saving advertisement:", error);
      toast.error("Failed to save advertisement");
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (file: File | null, previewUrl: string) => {
    setImageFile(file);
    handleChange("image_path", previewUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {advertisement ? "Edit Advertisement" : "Create Advertisement"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => handleChange("title", e.target.value)}
              className={cn(errors.title && "border-red-500")}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <ImageUploader
            currentImageUrl={formData.image_path}
            onImageChange={handleImageChange}
          />
          {errors.image && (
            <p className="text-sm text-red-500 mt-1">{errors.image}</p>
          )}

          <div>
            <Label htmlFor="cta_link">CTA Link</Label>
            <Input
              id="cta_link"
              value={formData.cta_link}
              onChange={e => handleChange("cta_link", e.target.value)}
              className={cn(errors.cta_link && "border-red-500")}
              disabled={isSubmitting}
            />
            {errors.cta_link && (
              <p className="text-sm text-red-500 mt-1">{errors.cta_link}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cta_text">CTA Text</Label>
            <Input
              id="cta_text"
              value={formData.cta_text}
              onChange={e => handleChange("cta_text", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="display_frequency">Display Frequency</Label>
            <Input
              id="display_frequency"
              type="number"
              min={1}
              value={formData.display_frequency}
              onChange={e => handleChange("display_frequency", parseInt(e.target.value))}
              className={cn(errors.display_frequency && "border-red-500")}
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Show ad after every X news cards
            </p>
            {errors.display_frequency && (
              <p className="text-sm text-red-500 mt-1">{errors.display_frequency}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={checked => handleChange("is_active", checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdvertisementForm;
