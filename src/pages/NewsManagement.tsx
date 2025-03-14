
import { useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import MainLayout from "@/components/MainLayout";
import NewsForm, { NewsArticle } from "@/components/NewsForm";
import NewsCard from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const NewsManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock data - in a real application this would come from Supabase
  const [articles, setArticles] = useState<NewsArticle[]>([
    {
      id: "1",
      title: "New UK Student Visa Changes for International Students",
      summary: "The UK government has announced significant changes to the student visa system, affecting international students planning to study in the country starting from January 2024.",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2069&auto=format&fit=crop",
      sourceUrl: "https://example.com/uk-visa-changes",
      category: "visa",
      timestamp: "2023-11-10T10:30:00Z",
    },
    {
      id: "2",
      title: "Top 10 Scholarships for International Students in Canada",
      summary: "Discover the most prestigious and generous scholarships available for international students looking to study in Canada in 2024.",
      imageUrl: "https://images.unsplash.com/photo-1527891751199-7225231a68dd?q=80&w=2070&auto=format&fit=crop",
      sourceUrl: "https://example.com/canada-scholarships",
      category: "scholarship",
      timestamp: "2023-11-05T14:20:00Z",
    },
    {
      id: "3",
      title: "Australia Expands Immigration Pathways for Skilled Workers",
      summary: "The Australian government has announced new immigration pathways for skilled workers in high-demand industries, including technology, healthcare, and engineering.",
      imageUrl: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=2073&auto=format&fit=crop",
      sourceUrl: "https://example.com/australia-immigration",
      category: "immigration",
      timestamp: "2023-10-28T09:15:00Z",
    },
    {
      id: "4",
      title: "New Online Courses: Learn Data Science from Top Universities",
      summary: "Several leading universities have launched affordable online data science programs designed for international students seeking to enhance their skills.",
      imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
      sourceUrl: "https://example.com/data-science-courses",
      category: "course",
      timestamp: "2023-10-15T16:45:00Z",
    },
    {
      id: "5",
      title: "Germany Removes Language Requirements for Select Master's Programs",
      summary: "Several German universities are now offering Master's programs taught entirely in English with no German language requirements, making education more accessible.",
      imageUrl: "https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?q=80&w=2070&auto=format&fit=crop",
      sourceUrl: "https://example.com/germany-education",
      category: "education",
      timestamp: "2023-10-08T11:30:00Z",
    },
  ]);

  const handleCreateArticle = (article: NewsArticle) => {
    // In a real app, this would be sent to Supabase
    const newArticle = {
      ...article,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setArticles([newArticle, ...articles]);
    setShowForm(false);
  };

  const handleUpdateArticle = (article: NewsArticle) => {
    // In a real app, this would be sent to Supabase
    if (!article.id) return;
    
    setArticles(articles.map((a) => (a.id === article.id ? article : a)));
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id: string) => {
    // In a real app, this would be sent to Supabase
    // Mocking an async operation
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setArticles(articles.filter((a) => a.id !== id));
        resolve();
      }, 500);
    });
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "education", label: "Foreign Education" },
    { value: "visa", label: "Visas" },
    { value: "scholarship", label: "Scholarships" },
    { value: "course", label: "Courses" },
    { value: "immigration", label: "Immigration" },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
          <p className="text-muted-foreground">
            Create, edit and manage news articles for your mobile application.
          </p>
        </div>

        <Tabs defaultValue="all">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="all">All Articles</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowForm(true)}>
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
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredArticles.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onEdit={setEditingArticle}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mt-2 text-lg font-semibold">No drafts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Drafts will appear here once you start saving them.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="published">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mt-2 text-lg font-semibold">Published articles</h3>
              <p className="mt-1 text-sm text-gray-500">
                In the full version, this tab will show only published articles.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default NewsManagement;
