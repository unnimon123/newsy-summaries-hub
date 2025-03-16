
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import NewsForm, { NewsArticle } from "@/components/NewsForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsFilters from "@/components/NewsFilters";
import NewsArticleList from "@/components/NewsArticleList";
import { useNewsArticles, NewsStatus } from "@/hooks/useNewsArticles";
import { useCategories } from "@/hooks/useCategories";

const NewsManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<NewsStatus>("all");
  
  // Custom hooks for data fetching and mutations
  const { categoriesData, categoriesLoading, categories } = useCategories();
  const { 
    newsData, 
    newsLoading, 
    createArticleMutation, 
    updateArticleMutation, 
    deleteArticleMutation 
  } = useNewsArticles(statusFilter);

  const handleCreateArticle = (article: NewsArticle) => {
    console.log('Handling article creation:', article);
    createArticleMutation.mutate(article);
    setShowForm(false);
  };

  const handleUpdateArticle = (article: NewsArticle) => {
    updateArticleMutation.mutate(article);
    setEditingArticle(null);
  };

  const handleDeleteArticle = async (id: string) => {
    return deleteArticleMutation.mutateAsync(id);
  };

  // Apply filters to the articles
  const filteredArticles = newsData?.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const isLoading = newsLoading || categoriesLoading;

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
          <p className="text-muted-foreground">
            Create, edit and manage news articles for your mobile application.
          </p>
        </div>

        <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value as NewsStatus)}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="all">All Articles</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </div>

          <TabsContent value="all" className="mt-4">
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

          <TabsContent value="draft">
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

          <TabsContent value="published">
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
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default NewsManagement;
