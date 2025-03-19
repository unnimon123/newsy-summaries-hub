
import MainLayout from "@/components/MainLayout";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldAlert } from "lucide-react";
import NewsManagementHeader from "@/components/news-management/NewsManagementHeader";
import NewsManagementTabs from "@/components/news-management/NewsManagementTabs";
import NewsManagementContent from "@/components/news-management/NewsManagementContent";
import { useNewsManagement } from "@/hooks/useNewsManagement";
import { NewsStatus } from "@/hooks/useNewsArticles";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NewsManagement = () => {
  const { isAdmin, userRole } = useAuth();
  const navigate = useNavigate();

  // Log admin status
  useEffect(() => {
    console.log("NewsManagement page - Admin status:", { isAdmin, userRole: userRole?.role });
    
    // Verify admin access when component mounts
    if (userRole && userRole.role !== 'admin') {
      toast.error("You don't have permission to access this page");
      navigate('/', { replace: true });
    }
  }, [isAdmin, userRole, navigate]);

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

  // Double-check admin access
  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-center">
            You don't have permission to access News Management.
          </p>
        </div>
      </MainLayout>
    );
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
