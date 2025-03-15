
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export interface NewsArticle {
  id?: string;
  title: string;
  summary: string;
  imageUrl: string;
  sourceUrl: string;
  category: string;
  timestamp?: string;
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
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch categories from Supabase
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Initialize image preview if article has an imageUrl
  useEffect(() => {
    if (article?.imageUrl) {
      setImagePreview(article.imageUrl);
    }
  }, [article]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
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

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
    
    // Clear error when field is edited
    if (errors.category) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "Image must be less than 5MB"
        }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "Image must be JPG, PNG, or WEBP format"
        }));
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Clear error if exists
      if (errors.imageFile || errors.imageUrl) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.imageFile;
          delete newErrors.imageUrl;
          return newErrors;
        });
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const uploadImageToSupabase = async (): Promise<string> => {
    if (!imageFile) {
      // If no new image is selected but we have an existing imageUrl, return it
      if (formData.imageUrl) return formData.imageUrl;
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = "Summary is required";
    } else if (formData.summary.split(/\s+/).length > 60) {
      newErrors.summary = "Summary must be 60 words or less";
    }
    
    if (!imageFile && !formData.imageUrl) {
      newErrors.imageUrl = "Image is required";
    }
    
    if (!formData.sourceUrl.trim()) {
      newErrors.sourceUrl = "Source URL is required";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
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
    
    setIsSubmitting(true);
    
    try {
      // Upload image if there's a new one
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImageToSupabase();
      }
      
      await onSubmit({
        ...formData,
        imageUrl,
        timestamp: new Date().toISOString(),
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
        });
        removeImage();
      }
    } catch (error) {
      console.error("Error submitting article:", error);
      toast.error("Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map database categories to form categories
  const categories = categoriesData?.map(cat => ({
    value: cat.id,
    label: cat.name
  })) || [
    { value: "education", label: "Foreign Education" },
    { value: "visa", label: "Visas" },
    { value: "scholarship", label: "Scholarships" },
    { value: "course", label: "Courses" },
    { value: "immigration", label: "Immigration" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{article ? "Edit Article" : "Create New Article"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary">
              Summary <span className="text-sm text-gray-500">(60 words max)</span>
            </Label>
            <Textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={3}
              className={errors.summary ? "border-red-500" : ""}
            />
            {errors.summary && (
              <p className="text-sm text-red-500">{errors.summary}</p>
            )}
            <div className="text-sm text-gray-500">
              Word count: {formData.summary.split(/\s+/).filter(Boolean).length}/60
            </div>
          </div>
          
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
            {errors.imageUrl && (
              <p className="text-sm text-red-500">{errors.imageUrl}</p>
            )}
            {errors.imageFile && (
              <p className="text-sm text-red-500">{errors.imageFile}</p>
            )}
          </div>
          
          {!imageFile && (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Or enter image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={errors.imageUrl ? "border-red-500" : ""}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              name="sourceUrl"
              value={formData.sourceUrl}
              onChange={handleChange}
              className={errors.sourceUrl ? "border-red-500" : ""}
            />
            {errors.sourceUrl && (
              <p className="text-sm text-red-500">{errors.sourceUrl}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : article ? "Update Article" : "Create Article"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NewsForm;
