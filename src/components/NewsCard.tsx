
import { useState } from "react";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { NewsArticle } from "./NewsForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NewsCardProps {
  article: NewsArticle;
  onEdit: (article: NewsArticle) => void;
  onDelete: (id: string) => void;
  viewOnly?: boolean;
}

const NewsCard = ({ article, onEdit, onDelete, viewOnly = false }: NewsCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch category information
  const { data: categoryData } = useQuery({
    queryKey: ['category', article.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', article.category)
        .single();
      
      if (error) {
        console.error('Error fetching category:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!article.category,
  });

  const handleDelete = async () => {
    if (!article.id) return;
    
    setIsDeleting(true);
    try {
      await onDelete(article.id);
      toast.success("Article deleted successfully");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleOpenSource = () => {
    if (article.sourceUrl) {
      window.open(article.sourceUrl, '_blank');
    }
  };

  const getCategoryLabel = (): string => {
    if (categoryData) {
      return categoryData.name;
    }
    
    // Fallback mapping for demo purposes
    const categories: Record<string, string> = {
      education: "Foreign Education",
      visa: "Visas",
      scholarship: "Scholarships",
      course: "Courses",
      immigration: "Immigration",
    };
    
    return categories[article.category] || article.category;
  };

  const getCategoryColor = (value: string): string => {
    const colors: Record<string, string> = {
      education: "bg-blue-100 text-blue-800",
      visa: "bg-green-100 text-green-800",
      scholarship: "bg-purple-100 text-purple-800",
      course: "bg-yellow-100 text-yellow-800",
      immigration: "bg-red-100 text-red-800",
    };
    
    return colors[value] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2">{article.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                {article.category && (
                  <Badge variant="outline" className={getCategoryColor(article.category)}>
                    {getCategoryLabel()}
                  </Badge>
                )}
                {article.timestamp && (
                  <span className="text-xs text-gray-500">
                    {formatDate(article.timestamp)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-2 flex-grow">
          <p className="text-sm text-gray-600 line-clamp-4">{article.summary}</p>
          
          {article.imageUrl && (
            <div className="mt-3 h-32 overflow-hidden rounded-md">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
                }}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          {viewOnly ? (
            <>
              {article.sourceUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenSource}
                >
                  <ExternalLink size={16} className="mr-2" />
                  Visit Source
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(article)}
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the article "{article.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NewsCard;
