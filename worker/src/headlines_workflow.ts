/**
 * Headlines AI Workflow - Orchestrates the entire article processing pipeline
 */

import { llm_call } from "./llm_tagger";
import { llm_summarize, type SummarizedArticle } from "./llm_summarizer";
import { getUserPreferences, updateUserPreferences, getSeenArticles, addSeenArticles } from "./storing_info";
import { processArticles, type Article } from "./filter";
import mockData from "../../mock/mock.json";

export interface WorkflowInput {
  sessionId: string;
  userMessage: string;
  kv: KVNamespace;
}

export interface WorkflowOutput {
  articles: SummarizedArticle[];
  newArticlesSeen: number;
  totalArticlesProcessed: number;
  preferencesUpdated: boolean;
}

/**
 * Simple workflow step executor interface
 */
interface WorkflowStep {
  do<T>(name: string, fn: () => Promise<T>): Promise<T>;
}

/**
 * Headlines AI Processing Workflow (Stub Implementation)
 * Orchestrates: LLM Tagging -> Filtering -> LLM Summarization -> KV Storage
 */
export class HeadlinesWorkflow {
  
  async run(input: WorkflowInput, step: WorkflowStep): Promise<WorkflowOutput> {
    const { sessionId, userMessage, kv } = input;
    
    console.log(`[${new Date().toISOString()}] Workflow started for session: ${sessionId}`);
    console.log(`[${new Date().toISOString()}] Workflow processing message: "${userMessage}"`);
    
    // Step 1: Get user preferences from KV
    const userPrefs = await step.do("get-user-preferences", async () => {
      console.log(`[${new Date().toISOString()}] Workflow Step 1: Getting user preferences`);
      const prefs = await getUserPreferences(kv, sessionId);
      console.log(`[${new Date().toISOString()}] Workflow Step 1 Complete: Retrieved preferences`);
      return prefs;
    });
    
    // Step 2: LLM Tagging - Extract topics and region from user message
    const llmTagResponse = await step.do("llm-tagging", async () => {
      console.log(`[${new Date().toISOString()}] Workflow Step 2: LLM Tagging`);
      const tagResponse = await llm_call(userPrefs, userMessage);
      console.log(`[${new Date().toISOString()}] Workflow Step 2 Complete: LLM tagged with`, JSON.stringify(tagResponse));
      return tagResponse;
    });
    
    // Step 3: Merge preferences for immediate use
    const currentPrefs = await step.do("merge-preferences", async () => {
      console.log(`[${new Date().toISOString()}] Workflow Step 3: Merging preferences`);
      const merged = {
        topics: llmTagResponse.topics || userPrefs.topics,
        region: llmTagResponse.region || userPrefs.region
      };
      console.log(`[${new Date().toISOString()}] Workflow Step 3 Complete: Current preferences`, JSON.stringify(merged));
      return merged;
    });
    
    // Step 4: Update user preferences in KV (if LLM provided new ones)
    const preferencesUpdated = await step.do("update-preferences", async () => {
      console.log(`[${new Date().toISOString()}] Workflow Step 4: Updating preferences in KV`);
      if (llmTagResponse.topics || llmTagResponse.region) {
        await updateUserPreferences(kv, sessionId, {
          topics: llmTagResponse.topics,
          region: llmTagResponse.region
        });
        console.log(`[${new Date().toISOString()}] Workflow Step 4 Complete: Preferences updated`);
        return true;
      }
      console.log(`[${new Date().toISOString()}] Workflow Step 4 Complete: No preference updates needed`);
      return false;
    });
    
    // Step 5: Get seen articles from KV
    const seenArticles = await step.do("get-seen-articles", async () => {
      console.log(`[${new Date().toISOString()}] Workflow Step 5: Getting seen articles`);
      const seen = await getSeenArticles(kv, sessionId);
      console.log(`[${new Date().toISOString()}] Workflow Step 5 Complete: User has seen ${seen.ids.length} articles`);
      return seen;
    });
    
    // Step 6: Filter and process articles
    const filteredArticles = await step.do("filter-articles", async () => {
      console.log(`[${new Date().toISOString()}] Workflow Step 6: Filtering and processing articles`);
      const processed = processArticles(
        mockData as Article[],
        seenArticles.ids,
        currentPrefs.topics,
        currentPrefs.region,
        5 // Limit to top 5 articles
      );
      console.log(`[${new Date().toISOString()}] Workflow Step 6 Complete: Filtered to ${processed.length} articles`);
      return processed;
    });
    
    // Step 7: Update seen articles in KV
    const newArticlesSeen = await step.do("update-seen-articles", async () => {
      console.log(`[${new Date().toISOString()}] Workflow Step 7: Updating seen articles`);
      const returnedArticleIds = filteredArticles.map(article => article.id);
      const newArticleIds = returnedArticleIds.filter(id => !seenArticles.ids.includes(id));
      
      if (newArticleIds.length > 0) {
        await addSeenArticles(kv, sessionId, newArticleIds);
        console.log(`[${new Date().toISOString()}] Workflow Step 7 Complete: Marked ${newArticleIds.length} new articles as seen`);
      } else {
        console.log(`[${new Date().toISOString()}] Workflow Step 7 Complete: No new articles to mark as seen`);
      }
      
      return newArticleIds.length;
    });
    
    // Step 8: LLM Summarization
    const summarizedArticles = await step.do("llm-summarization", async () => {
      console.log(`[${new Date().toISOString()}] Workflow Step 8: LLM Summarization`);
      const summarized = await llm_summarize(userMessage, filteredArticles as SummarizedArticle[]);
      console.log(`[${new Date().toISOString()}] Workflow Step 8 Complete: Summarized ${summarized.length} articles`);
      return summarized;
    });
    
    // Workflow completion
    const result: WorkflowOutput = {
      articles: summarizedArticles,
      newArticlesSeen,
      totalArticlesProcessed: mockData.length,
      preferencesUpdated
    };
    
    console.log(`[${new Date().toISOString()}] Workflow Complete: Returning ${result.articles.length} articles`);
    console.log(`[${new Date().toISOString()}] Workflow Stats:`, {
      newArticlesSeen: result.newArticlesSeen,
      totalProcessed: result.totalArticlesProcessed,
      preferencesUpdated: result.preferencesUpdated
    });
    
    return result;
  }
}