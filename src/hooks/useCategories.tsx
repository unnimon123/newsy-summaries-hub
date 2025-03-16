
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategories = () => {
  // Fetch categories from Supabase
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories from Supabase...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Fetched categories:', data?.length || 0);
      return data;
    },
  });

  // Construct categories array for the filter dropdown
  const categories = [
    { value: "all", label: "All Categories" },
    ...(categoriesData?.map(cat => ({
      value: cat.id,
      label: cat.name
    })) || []),
  ];

  return {
    categoriesData,
    categoriesLoading,
    categories
  };
};
