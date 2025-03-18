
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsArticle } from "@/components/NewsForm";

interface CardFooterActionsProps {
  article: NewsArticle;
  viewOnly?: boolean;
  onEdit?: (article: NewsArticle) => void;
  onDeleteClick?: () => void;
}

const CardFooterActions = ({ 
  article, 
  viewOnly = false, 
  onEdit, 
  onDeleteClick 
}: CardFooterActionsProps) => {
  const handleOpenSource = () => {
    if (article.sourceUrl) {
      window.open(article.sourceUrl, '_blank');
    }
  };

  if (viewOnly) {
    return (
      <>
        {article.sourceUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenSource}
          >
            <ExternalLink size={16} className="mr-2" />
            Visit Source
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit && onEdit(article)}
      >
        <Edit size={16} className="mr-2" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        onClick={onDeleteClick}
      >
        <Trash2 size={16} className="mr-2" />
        Delete
      </Button>
    </>
  );
};

export default CardFooterActions;
