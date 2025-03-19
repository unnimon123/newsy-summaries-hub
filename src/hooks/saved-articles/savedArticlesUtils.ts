
import type { SavedArticleWithDetails } from './savedArticlesApi';

// Check if an article is saved
export function isArticleSaved(
  savedArticles: SavedArticleWithDetails[], 
  articleId: string
): boolean {
  return savedArticles.some(item => item.article_id === articleId);
}

// Find saved article entry by article ID
export function getSavedArticleByArticleId(
  savedArticles: SavedArticleWithDetails[], 
  articleId: string
): SavedArticleWithDetails | undefined {
  return savedArticles.find(item => item.article_id === articleId);
}
