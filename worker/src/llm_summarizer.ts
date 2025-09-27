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
 * Process user message and filtered articles to generate summaries using Cloudflare Workers AI
 * @param userMessage - Original user message
 * @param articles - Filtered articles to summarize
 * @param ai - Cloudflare AI binding
 * @returns Promise with summarized articles
 */
export async function llm_summarize(userMessage: string, articles: SummarizedArticle[], ai: Ai): Promise<SummarizedArticle[]> {
  console.log(`[${new Date().toISOString()}] LLM Summarizer - User Message: "${userMessage}"`);
  console.log(`[${new Date().toISOString()}] LLM Summarizer - Processing ${articles.length} articles for summarization`);
  
  // Log the article IDs being processed
  const articleIds = articles.map(article => article.id);
  console.log(`[${new Date().toISOString()}] LLM Summarizer - Article IDs:`, articleIds);
  
  try {
    // Process articles in parallel for better performance
    const summarizedArticles = await Promise.all(
      articles.map(async (article, index) => {
        console.log(`[${new Date().toISOString()}] LLM Summarizer - Summarizing article ${article.id} (${index + 1}/${articles.length})`);
        
        const systemPrompt = `You are a news summarizer. Create a concise, engaging summary of the news article based on the user's interest. Keep it under 100 words and make it relevant to their query.`;
        
        const userPrompt = `User query: "${userMessage}"
Article Title: ${article.title}
Original Content: ${article.body.substring(0, 500)}...

Create a concise summary:`;
        
        try {
          const aiResponse = await ai.run('@hf/thebloke/llama-2-13b-chat-awq' as any, {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.3
          });
          
          let summary = 'Summary unavailable';
          
          if (aiResponse && typeof aiResponse === 'object' && 'response' in aiResponse) {
            summary = (aiResponse.response as string).trim();
          } else if (typeof aiResponse === 'string') {
            summary = aiResponse.trim();
          }
          
          console.log(`[${new Date().toISOString()}] LLM Summarizer - Article ${article.id} summarized successfully`);
          
          return {
            ...article,
            body: summary
          };
          
        } catch (error) {
          console.error(`[${new Date().toISOString()}] LLM Summarizer - Error summarizing article ${article.id}:`, error);
          return {
            ...article,
            body: `Summary: ${article.title} - A ${article.topicTags.join(', ')} story from ${article.region}.`
          };
        }
      })
    );
    
    console.log(`[${new Date().toISOString()}] LLM Summarizer - Completed summarization for ${summarizedArticles.length} articles`);
    console.log(`[${new Date().toISOString()}] LLM Summarizer - Sample summarized article:`, JSON.stringify(summarizedArticles[0] || {}));
    
    return summarizedArticles;
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] LLM Summarizer - Global error:`, error);
    
    // Fallback: return articles with basic summaries
    const fallbackArticles = articles.map(article => ({
      ...article,
      body: `Summary: ${article.title} - A ${article.topicTags.join(', ')} story from ${article.region}.`
    }));
    
    return fallbackArticles;
  }
}