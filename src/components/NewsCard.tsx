
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent as UICardContent, CardFooter, CardHeader as UICardHeader } from "@/components/ui/card";
import { NewsArticle } from "./NewsForm";
import DeleteDialog from "./news-card/DeleteDialog";
import CardHeader from "./news-card/CardHeader";
import CardContentComponent from "./news-card/CardContent";
import CardFooterActions from "./news-card/CardFooterActions";

interface NewsCardProps {
  article: NewsArticle;
  onEdit: (article: NewsArticle) => void;
  onDelete: (id: string) => void;
  viewOnly?: boolean;
}

const NewsCard = ({ article, onEdit, onDelete, viewOnly = false }: NewsCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!article.id) return;
    
    try {
      await onDelete(article.id);
      toast.success("Article deleted successfully");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <UICardHeader className="pb-2">
          <CardHeader
            id={article.id}
            title={article.title}
            category={article.category}
            timestamp={article.timestamp}
          />
        </UICardHeader>
        <UICardContent className="py-2 flex-grow">
          <CardContentComponent
            summary={article.summary}
            imageUrl={article.imageUrl}
          />
        </UICardContent>
        <CardFooter className="pt-2 flex justify-between">
          <CardFooterActions
            article={article}
            viewOnly={viewOnly}
            onEdit={onEdit}
            onDeleteClick={() => setDeleteDialogOpen(true)}
          />
        </CardFooter>
      </Card>

      <DeleteDialog
        title={article.title}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default NewsCard;
