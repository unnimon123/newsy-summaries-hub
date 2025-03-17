
import { useState } from "react";
import { NewsArticle } from "@/components/NewsForm";
import { useNewsArticles, NewsStatus } from "@/hooks/useNewsArticles";
import { useCategories } from "@/hooks/useCategories";

export const useNewsManagement = () => {
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

  return {
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
  };
};
