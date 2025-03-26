
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewsArticle } from "../NewsForm";
import { FormErrors, calculateWordCount } from "./NewsFormValidator";
import ImageUploader from "./ImageUploader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NewsFormContentProps {
  formData: NewsArticle;
  errors: FormErrors;
  onChange: (name: string, value: string) => void;
  onImageChange: (imageFile: File | null, imageUrl: string) => void;
}

const NewsFormContent = ({ formData, errors, onChange, onImageChange }: NewsFormContentProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleCategoryChange = (value: string) => {
    onChange('category', value);
  };

  const handleImageChangeEvent = (newImageFile: File | null, newImageUrl: string) => {
    setImageFile(newImageFile);
    onImageChange(newImageFile, newImageUrl);
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
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
          onChange={handleInputChange}
          rows={3}
          className={errors.summary ? "border-red-500" : ""}
        />
        {errors.summary && (
          <p className="text-sm text-red-500">{errors.summary}</p>
        )}
        <div className="text-sm text-gray-500">
          Word count: {calculateWordCount(formData.summary)}/60
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="news_date">News Date (Optional)</Label>
        <Input
          type="date"
          id="news_date"
          name="news_date"
          value={formData.timestamp ? formData.timestamp.split('T')[0] : ''}
          onChange={(e) => {
            const date = e.target.value;
            onChange('timestamp', date ? `${date}T00:00:00` : '');
          }}
          className={errors.timestamp ? "border-red-500" : ""}
        />
        {errors.timestamp && (
          <p className="text-sm text-red-500">{errors.timestamp}</p>
        )}
      </div>
      
      <ImageUploader 
        initialImageUrl={formData.imageUrl}
        onImageChange={handleImageChangeEvent}
        error={errors.imageUrl || errors.imageFile}
      />
      
      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Source URL</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          value={formData.sourceUrl}
          onChange={handleInputChange}
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
    </div>
  );
};

export default NewsFormContent;
