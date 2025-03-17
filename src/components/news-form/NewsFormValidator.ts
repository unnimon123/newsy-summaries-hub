
import { NewsArticle } from "../NewsForm";

export type FormErrors = Record<string, string>;

export const validateNewsForm = (formData: NewsArticle, imageFile: File | null): FormErrors => {
  const errors: FormErrors = {};
  
  if (!formData.title.trim()) {
    errors.title = "Title is required";
  }
  
  if (!formData.summary.trim()) {
    errors.summary = "Summary is required";
  } else if (formData.summary.split(/\s+/).length > 60) {
    errors.summary = "Summary must be 60 words or less";
  }
  
  if (!imageFile && !formData.imageUrl) {
    errors.imageUrl = "Image is required";
  }
  
  if (!formData.sourceUrl.trim()) {
    errors.sourceUrl = "Source URL is required";
  }
  
  if (!formData.category) {
    errors.category = "Category is required";
  }
  
  return errors;
};

export const calculateWordCount = (text: string): number => {
  return text.split(/\s+/).filter(Boolean).length;
};
