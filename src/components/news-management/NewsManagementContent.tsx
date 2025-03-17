
import { TabsContent } from "@/components/ui/tabs";
import NewsForm, { NewsArticle } from "@/components/NewsForm";
import NewsFilters from "@/components/NewsFilters";
import NewsArticleList from "@/components/NewsArticleList";

interface NewsManagementContentProps {
  showForm: boolean;
  editingArticle: NewsArticle | null;
  searchQuery: string;
  categoryFilter: string;
  isLoading: boolean;
  filteredArticles: NewsArticle[];
  categories: { value: string; label: string }[];
  setShowForm: (show: boolean) => void;
  setEditingArticle: (article: NewsArticle | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  handleCreateArticle: (article: NewsArticle) => void;
  handleUpdateArticle: (article: NewsArticle) => void;
  handleDeleteArticle: (id: string) => Promise<void>;
  tabValue: string;
}

const NewsManagementContent = ({
  showForm,
  editingArticle,
  searchQuery,
  categoryFilter,
  isLoading,
  filteredArticles,
  categories,
  setShowForm,
  setEditingArticle,
  setSearchQuery,
  setCategoryFilter,
  handleCreateArticle,
  handleUpdateArticle,
  handleDeleteArticle,
  tabValue,
}: NewsManagementContentProps) => {
  return (
    <TabsContent value={tabValue} className="mt-4">
      {showForm && (
        <div className="mb-6">
          <NewsForm
            onSubmit={handleCreateArticle}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingArticle && (
        <div className="mb-6">
          <NewsForm
            article={editingArticle}
            onSubmit={handleUpdateArticle}
            onCancel={() => setEditingArticle(null)}
          />
        </div>
      )}

      <NewsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />

      <NewsArticleList
        isLoading={isLoading}
        filteredArticles={filteredArticles}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        showForm={showForm}
        setShowForm={setShowForm}
        onEdit={setEditingArticle}
        onDelete={handleDeleteArticle}
      />
    </TabsContent>
  );
};

export default NewsManagementContent;
