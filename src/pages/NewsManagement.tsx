
import MainLayout from "@/components/MainLayout";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NewsManagementHeader from "@/components/news-management/NewsManagementHeader";
import NewsManagementTabs from "@/components/news-management/NewsManagementTabs";
import NewsManagementContent from "@/components/news-management/NewsManagementContent";
import { useNewsManagement } from "@/hooks/useNewsManagement";
import { NewsStatus } from "@/hooks/useNewsArticles";

const NewsManagement = () => {
  const {
    showForm,
    setShowForm,
    editingArticle,
    setEditingArticle,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    categories,
    filteredArticles,
    isLoading,
    handleCreateArticle,
    handleUpdateArticle,
    handleDeleteArticle
  } = useNewsManagement();

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <NewsManagementHeader 
          showForm={showForm} 
          setShowForm={setShowForm} 
        />

        <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value as NewsStatus)}>
          <NewsManagementTabs onValueChange={setStatusFilter}>
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </NewsManagementTabs>

          {["all", "draft", "published"].map((tab) => (
            <NewsManagementContent
              key={tab}
              tabValue={tab}
              showForm={showForm}
              editingArticle={editingArticle}
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              isLoading={isLoading}
              filteredArticles={filteredArticles}
              categories={categories}
              setShowForm={setShowForm}
              setEditingArticle={setEditingArticle}
              setSearchQuery={setSearchQuery}
              setCategoryFilter={setCategoryFilter}
              handleCreateArticle={handleCreateArticle}
              handleUpdateArticle={handleUpdateArticle}
              handleDeleteArticle={handleDeleteArticle}
            />
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default NewsManagement;
