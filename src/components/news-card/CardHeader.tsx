
import { Badge } from "@/components/ui/badge";
import SaveArticleButton from "@/components/SaveArticleButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CardHeaderProps {
  id?: string;
  title: string;
  category: string;
  timestamp?: string;
}

const CardHeader = ({ id, title, category, timestamp }: CardHeaderProps) => {
  // Fetch category information
  const { data: categoryData } = useQuery({
    queryKey: ['category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', category)
        .single();
      
      if (error) {
        console.error('Error fetching category:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!category,
  });

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
    
    return categories[category] || category;
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
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
        <div className="flex items-center gap-2 mt-1">
          {category && (
            <Badge variant="outline" className={getCategoryColor(category)}>
              {getCategoryLabel()}
            </Badge>
          )}
          {timestamp && (
            <span className="text-xs text-gray-500">
              {formatDate(timestamp)}
            </span>
          )}
        </div>
      </div>
      {id && <SaveArticleButton articleId={id} size="icon" showText={false} />}
    </div>
  );
};

export default CardHeader;
