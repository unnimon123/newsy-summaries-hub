
import type { SavedArticleWithDetails } from './savedArticlesApi';

// Check if an article is saved
export function isArticleSaved(
  savedArticles: SavedArticleWithDetails[], 
  articleId: string
): boolean {
  if (!savedArticles || !articleId) return false;
  return savedArticles.some(item => item.article_id === articleId);
}

// Find saved article entry by article ID
export function getSavedArticleByArticleId(
  savedArticles: SavedArticleWithDetails[], 
  articleId: string
): SavedArticleWithDetails | undefined {
  if (!savedArticles || !articleId) return undefined;
  return savedArticles.find(item => item.article_id === articleId);
}

// Format date for display
export function formatSavedDate(dateString: string | null): string {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Group saved articles by date
export function groupArticlesByDate(articles: SavedArticleWithDetails[]) {
  if (!articles?.length) return {};
  
  return articles.reduce((groups: Record<string, SavedArticleWithDetails[]>, article) => {
    const date = article.created_at ? new Date(article.created_at).toDateString() : 'Unknown';
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(article);
    return groups;
  }, {});
}

// Sort saved articles by date (newest first)
export function sortArticlesByDate(articles: SavedArticleWithDetails[]): SavedArticleWithDetails[] {
  if (!articles?.length) return [];
  
  return [...articles].sort((a, b) => {
    if (!a.created_at) return 1;
    if (!b.created_at) return -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
