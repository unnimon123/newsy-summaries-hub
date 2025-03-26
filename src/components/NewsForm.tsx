import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import NewsFormContent from "./news-form/NewsFormContent";
import { validateNewsForm, FormErrors } from "./news-form/NewsFormValidator";
import { uploadImageToSupabase } from "./news-form/ImageUploadService";

export interface NewsArticle {
  id?: string;
  title: string;
  summary: string;
  imageUrl: string;
  sourceUrl: string;
  category: string;
  timestamp?: string;
  viewCount?: number;
  status?: "draft" | "published";
  news_timestamp?: string;
}

interface NewsFormProps {
  article?: NewsArticle;
  onSubmit: (article: NewsArticle) => void;
  onCancel?: () => void;
}

const NewsForm = ({ article, onSubmit, onCancel }: NewsFormProps) => {
  const [formData, setFormData] = useState<NewsArticle>(
    article || {
      title: "",
      summary: "",
      imageUrl: "",
      sourceUrl: "",
      category: "",
      status: "draft"
    }
  );
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [actionType, setActionType] = useState<'draft' | 'publish' | null>(null);

  useEffect(() => {
    // Reset submission state when actionType changes
    return () => {
      setIsSubmitting(false);
      setActionType(null);
    };
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (newImageFile: File | null, imageUrl: string) => {
    setImageFile(newImageFile);
    setFormData(prev => ({ ...prev, imageUrl }));
    
    // Clear errors related to image
    if (errors.imageFile || errors.imageUrl) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.imageFile;
        delete newErrors.imageUrl;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent, publishStatus?: "draft" | "published") => {
    e.preventDefault();
    setActionType(publishStatus === 'published' ? 'publish' : 'draft');
    
    const validationErrors = validateNewsForm(formData, imageFile);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload image first if there's a new one
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        try {
          finalImageUrl = await uploadImageToSupabase(imageFile, formData.imageUrl);
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error("Failed to upload image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }
      
      await onSubmit({
        ...formData,
        imageUrl: finalImageUrl,
        status: publishStatus || formData.status || "draft",
        timestamp: new Date().toISOString(),
        news_timestamp: formData.news_timestamp || null
      });
      
      toast.success(article ? "Article updated successfully" : "Article created successfully");
      
      if (!article) {
        // Reset form if it's a new article
        setFormData({
          title: "",
          summary: "",
          imageUrl: "",
          sourceUrl: "",
          category: "",
          status: "draft"
        });
        setImageFile(null);
      }
    } catch (error) {
      console.error("Error submitting article:", error);
      toast.error("Failed to save article. Please try again.");
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const getButtonText = (type: 'draft' | 'publish') => {
    if (isSubmitting && actionType === type) {
      return type === 'publish' ? "Publishing..." : "Saving...";
    }
    if (article) {
      return type === 'publish' ? "Publish" : "Update as Draft";
    }
    return type === 'publish' ? "Publish" : "Save as Draft";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{article ? "Edit Article" : "Create New Article"}</CardTitle>
      </CardHeader>
      <form onSubmit={(e) => handleSubmit(e)}>
        <CardContent>
          <NewsFormContent 
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onImageChange={handleImageChange}
          />
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {getButtonText('draft')}
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, "published")}
              variant="secondary"
            >
              {getButtonText('publish')}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NewsForm;
