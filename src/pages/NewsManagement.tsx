
import MainLayout from "@/components/MainLayout";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NewsManagementHeader from "@/components/news-management/NewsManagementHeader";
import NewsManagementTabs from "@/components/news-management/NewsManagementTabs";
import NewsManagementContent from "@/components/news-management/NewsManagementContent";
import { useNewsManagement } from "@/hooks/useNewsManagement";
import { NewsStatus } from "@/hooks/useNewsArticles";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NewsManagement = () => {
  const { isAdmin, initialLoadDone } = useAuth();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  
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
  
  // Verify admin access once auth is fully loaded
  useEffect(() => {
    console.log("NewsManagement: Checking admin status", { isAdmin, initialLoadDone });
    
    const timeoutId = setTimeout(() => {
      setIsVerifying(false);
    }, 1000);
    
    if (initialLoadDone) {
      clearTimeout(timeoutId);
      setIsVerifying(false);
      
      if (!isAdmin) {
        console.log("Non-admin user attempted to access /news, redirecting to home");
        toast.error("You don't have permission to access this page");
        navigate('/', { replace: true });
      }
    }
    
    return () => clearTimeout(timeoutId);
  }, [isAdmin, initialLoadDone, navigate]);

  if (isVerifying && !initialLoadDone) {
    return null; // Let the AdminRoute component handle the loading state
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <NewsManagementHeader 
          showForm={showForm} 
          setShowForm={setShowForm} 
        />

        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as NewsStatus)}>
          <NewsManagementTabs 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <Button onClick={() => setShowForm(true)} disabled={showForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Article
            </Button>
          </NewsManagementTabs>

          <NewsManagementContent
            key={statusFilter}
            tabValue={statusFilter}
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
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default NewsManagement;
