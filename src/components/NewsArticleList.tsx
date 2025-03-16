
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import { NewsArticle } from "@/components/NewsForm";

interface NewsArticleListProps {
  isLoading: boolean;
  filteredArticles: NewsArticle[];
  searchQuery: string;
  categoryFilter: string;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onEdit: (article: NewsArticle) => void;
  onDelete: (id: string) => Promise<void>;
}

const NewsArticleList = ({
  isLoading,
  filteredArticles,
  searchQuery,
  categoryFilter,
  showForm,
  setShowForm,
  onEdit,
  onDelete,
}: NewsArticleListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="mt-2 text-lg font-semibold">No articles found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery || categoryFilter !== "all"
            ? "Try adjusting your search or filter criteria."
            : "Get started by creating a new article."}
        </p>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Article
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredArticles.map((article) => (
        <NewsCard
          key={article.id}
          article={article}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NewsArticleList;
