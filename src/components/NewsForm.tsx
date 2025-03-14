
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = "Image URL is required";
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
      // In a real app, we would submit to Supabase here
      await onSubmit({
        ...formData,
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
      }
    } catch (error) {
      console.error("Error submitting article:", error);
      toast.error("Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
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
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={errors.imageUrl ? "border-red-500" : ""}
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-500">{errors.imageUrl}</p>
            )}
          </div>
          
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
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
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
