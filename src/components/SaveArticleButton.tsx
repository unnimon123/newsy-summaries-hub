
import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SaveArticleButtonProps {
  articleId: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

const SaveArticleButton = ({
  articleId,
  variant = 'outline',
  size = 'sm',
  showText = true,
}: SaveArticleButtonProps) => {
  const { user } = useAuth();
  const { isArticleSaved, saveArticle, unsaveArticle } = useSavedArticles();
  const [isSaving, setIsSaving] = useState(false);

  const saved = isArticleSaved(articleId);

  const handleToggleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save articles');
      return;
    }

    setIsSaving(true);
    try {
      if (saved) {
        await unsaveArticle(articleId);
      } else {
        await saveArticle(articleId);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isSaving}
      aria-label={saved ? 'Unsave article' : 'Save article'}
      className={saved ? 'text-primary border-primary hover:bg-primary/10' : ''}
    >
      {saved ? (
        <BookmarkCheck size={16} className={showText ? 'mr-2' : ''} />
      ) : (
        <Bookmark size={16} className={showText ? 'mr-2' : ''} />
      )}
      {showText && (saved ? 'Saved' : 'Save')}
    </Button>
  );
};

export default SaveArticleButton;
