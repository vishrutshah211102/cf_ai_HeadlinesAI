/**
 * Article filtering and reordering utilities
 */

export interface Article {
  id: number;
  title: string;
  topicTags: string[];
  region: string;
  body: string;
}

/**
 * Filter and reorder articles based on user's seen history
 * Unseen articles are placed at the top, followed by seen articles
 * @param articles - Array of all articles
 * @param seenArticleIds - Array of article IDs the user has already seen
 * @returns Reordered array with unseen articles first
 */
export function filterAndReorderArticles(articles: Article[], seenArticleIds: number[]): Article[] {
  console.log(`[${new Date().toISOString()}] Filtering ${articles.length} articles against ${seenArticleIds.length} seen articles`);
  
  // Create Set for O(1) lookup performance
  const seenIdsSet = new Set(seenArticleIds);
  
  // Separate articles into unseen and seen
  const unseenArticles: Article[] = [];
  const seenArticles: Article[] = [];
  
  for (const article of articles) {
    if (seenIdsSet.has(article.id)) {
      seenArticles.push(article);
    } else {
      unseenArticles.push(article);
    }
  }
  
  console.log(`[${new Date().toISOString()}] Found ${unseenArticles.length} unseen articles and ${seenArticles.length} seen articles`);
  
  // Log the IDs for debugging
  const unseenIds = unseenArticles.map(a => a.id);
  const seenIds = seenArticles.map(a => a.id);
  console.log(`[${new Date().toISOString()}] Unseen article IDs:`, unseenIds);
  console.log(`[${new Date().toISOString()}] Seen article IDs:`, seenIds);
  
  // Return unseen articles first, then seen articles
  const reorderedArticles = [...unseenArticles, ...seenArticles];
  
  console.log(`[${new Date().toISOString()}] Reordered articles: ${reorderedArticles.length} total (${unseenArticles.length} unseen + ${seenArticles.length} seen)`);
  
  return reorderedArticles;
}

/**
 * Filter articles by user preferences (topics and region)
 * @param articles - Array of articles to filter
 * @param preferredTopics - User's preferred topics (optional)
 * @param preferredRegion - User's preferred region (optional)
 * @returns Filtered array of articles
 */
export function filterByPreferences(
  articles: Article[], 
  preferredTopics?: string[], 
  preferredRegion?: string
): Article[] {
  console.log(`[${new Date().toISOString()}] Filtering by preferences - Topics:`, preferredTopics, 'Region:', preferredRegion);
  
  let filteredArticles = articles;
  
  // Filter by topics if preferences exist
  if (preferredTopics && preferredTopics.length > 0) {
    const topicsSet = new Set(preferredTopics.map(topic => topic.toLowerCase()));
    const beforeCount = filteredArticles.length;
    
    filteredArticles = filteredArticles.filter(article => 
      article.topicTags.some(tag => topicsSet.has(tag.toLowerCase()))
    );
    
    console.log(`[${new Date().toISOString()}] Topic filter: ${beforeCount} → ${filteredArticles.length} articles`);
  }
  
  // Filter by region if preference exists
  if (preferredRegion) {
    const beforeCount = filteredArticles.length;
    
    filteredArticles = filteredArticles.filter(article => 
      article.region.toLowerCase() === preferredRegion.toLowerCase()
    );
    
    console.log(`[${new Date().toISOString()}] Region filter: ${beforeCount} → ${filteredArticles.length} articles`);
  }
  
  console.log(`[${new Date().toISOString()}] Final filtered count: ${filteredArticles.length} articles`);
  
  return filteredArticles;
}

/**
 * Combined filtering and reordering function
 * @param articles - Array of all articles
 * @param seenArticleIds - Array of seen article IDs
 * @param preferredTopics - User's preferred topics (optional)
 * @param preferredRegion - User's preferred region (optional)
 * @param limit - Maximum number of articles to return (default: 5)
 * @returns Filtered and reordered articles (unseen first, then seen), limited to top N
 */
export function processArticles(
  articles: Article[], 
  seenArticleIds: number[], 
  preferredTopics?: string[], 
  preferredRegion?: string,
  limit: number = 5
): Article[] {
  console.log(`[${new Date().toISOString()}] Processing ${articles.length} articles with user preferences and seen history, limit: ${limit}`);
  
  // First apply preference filtering if any preferences exist
  let processedArticles = articles;
  if ((preferredTopics && preferredTopics.length > 0) || preferredRegion) {
    processedArticles = filterByPreferences(articles, preferredTopics, preferredRegion);
    
    // If no articles match preferences, fall back to all articles
    if (processedArticles.length === 0) {
      console.log(`[${new Date().toISOString()}] No articles matched preferences, falling back to all articles`);
      processedArticles = articles;
    }
  }
  
  // Then reorder based on seen history
  const reorderedArticles = filterAndReorderArticles(processedArticles, seenArticleIds);
  
  // Limit to top N articles
  const limitedArticles = reorderedArticles.slice(0, limit);
  
  console.log(`[${new Date().toISOString()}] Article processing complete: ${limitedArticles.length} articles returned (limited from ${reorderedArticles.length} total)`);
  console.log(`[${new Date().toISOString()}] Returning article IDs:`, limitedArticles.map(a => a.id));
  
  return limitedArticles;
}