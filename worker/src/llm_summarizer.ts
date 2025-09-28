  /**
 * LLM Summarizer for processing art        try {
          // Llama model expects messages format
          const aiResponse = await ai.run('@cf/meta/llama-3.1-8b-instruct-fp8' as any, {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.3
          });maries
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
        
        const { systemPrompt } = await import('./summarizerPrompts');
        
        const userPrompt = `User query: "${userMessage}"
Article Title: ${article.title}
Original Content: ${article.body.substring(0, 500)}...

Create a concise summary:`;
        
        try {
          // Llama model expects messages format
          const aiResponse = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.3,
            response_format: {
              type: "json_schema",
              json_schema: {
                type: "object",
                additionalProperties: false,
                properties: { summary: { type: "string" } },
                required: ["summary"]
              }
            }
          });
          
          let summary = 'Summary unavailable';
          
          console.log(`[${new Date().toISOString()}] LLM Summarizer - Raw AI Response for article ${article.id}:`, JSON.stringify(aiResponse));
          
          if (aiResponse && typeof aiResponse === 'object') {
            // Handle different response formats from BART model
            if ('response' in aiResponse && aiResponse.response && typeof (aiResponse as any).response === 'object' && 'summary' in (aiResponse as any).response) {
              summary = ((aiResponse as any).response.summary as string).trim();
            } else if ('summary' in aiResponse) {
              summary = (aiResponse.summary as string).trim();
            } else if ('response' in aiResponse) {
              summary = (aiResponse.response as string).trim();
            } else if ('result' in aiResponse) {
              summary = (aiResponse.result as string).trim();
            } else if (typeof aiResponse === 'object' && aiResponse.constructor === Object) {
              // If it's a plain object, try to get the first string value
              const values = Object.values(aiResponse);
              const firstString = values.find(val => typeof val === 'string');
              if (firstString) {
                summary = (firstString as string).trim();
              }
            }
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