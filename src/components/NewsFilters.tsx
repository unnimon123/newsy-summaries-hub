
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface NewsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: { value: string; label: string }[];
}

const NewsFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  categories,
}: NewsFiltersProps) => {
  // Debug log when categories change
  useEffect(() => {
    console.log("NewsFilters categories:", categories);
  }, [categories]);

  return (
    <div className="flex flex-col gap-4 mb-6 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search articles..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {categories.length === 0 ? (
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
    </div>
  );
};

export default NewsFilters;
