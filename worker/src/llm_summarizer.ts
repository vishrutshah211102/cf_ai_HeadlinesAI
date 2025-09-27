/**
 * LLM Summarizer for processing article summaries
 */

export interface SummarizedArticle {
  id: number;
  title: string;
  topicTags: string[];
  region: string;
  body: string; // This will be replaced with "summary"
}

/**
 * Process user message and filtered articles to generate summaries
 * @param userMessage - Original user message
 * @param articles - Filtered articles to summarize
 * @returns Promise with summarized articles
 */
export async function llm_summarize(userMessage: string, articles: SummarizedArticle[]): Promise<SummarizedArticle[]> {
  console.log(`[${new Date().toISOString()}] LLM Summarizer - User Message: "${userMessage}"`);
  console.log(`[${new Date().toISOString()}] LLM Summarizer - Processing ${articles.length} articles for summarization`);
  
  // Log the article IDs being processed
  const articleIds = articles.map(article => article.id);
  console.log(`[${new Date().toISOString()}] LLM Summarizer - Article IDs:`, articleIds);
  
  // For now, just return the articles with "summary" in the body
  const summarizedArticles: SummarizedArticle[] = articles.map(article => ({
    ...article,
    body: "summary"
  }));
  
  console.log(`[${new Date().toISOString()}] LLM Summarizer - Completed summarization for ${summarizedArticles.length} articles`);
  console.log(`[${new Date().toISOString()}] LLM Summarizer - Sample summarized article:`, JSON.stringify(summarizedArticles[0] || {}));
  
  return summarizedArticles;
}