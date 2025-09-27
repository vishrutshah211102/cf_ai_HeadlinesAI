/**
 * LLM Logic for processing user messages and preferences
 */

export interface LLMResponse {
  topics?: string[];
  region?: string;
}

export interface UserPreferences {
  [key: string]: any;
}

/**
 * Process user message and preferences to determine topics and region using Cloudflare Workers AI
 * @param prefs - User preferences as JSON object
 * @param message - User message as string
 * @param ai - Cloudflare AI binding
 * @returns Promise with topics and region
 */
export async function llm_call(prefs: UserPreferences, message: string, ai: Ai): Promise<LLMResponse> {
  console.log(`[${new Date().toISOString()}] LLM Tagger - Preferences:`, JSON.stringify(prefs));
  console.log(`[${new Date().toISOString()}] LLM Tagger - Message: "${message}"`);
  
  try {
    // Create prompt for the LLM to extract topics and region
    const systemPrompt = `You are a news content tagger. Analyze the user message and extract relevant topics and region preferences. 
Return only a valid JSON object with this exact format:
{"topics": ["topic1", "topic2"], "region": "region_name"}

Valid topics: sport, politics, technology, business, entertainment
Valid regions: Europe, North America, Asia

If no specific preferences can be determined, return empty arrays/null values.`;
    
    const userPrompt = `User message: "${message}"
Current preferences: ${JSON.stringify(prefs)}

Extract topics and region from this message:`;
    
    console.log(`[${new Date().toISOString()}] LLM Tagger - Calling Cloudflare AI with llama-3.3`);
    
    const aiResponse = await ai.run('@hf/thebloke/llama-2-13b-chat-awq' as any, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.1
    });
    
    console.log(`[${new Date().toISOString()}] LLM Tagger - Raw AI Response:`, JSON.stringify(aiResponse));
    
    // Extract and parse the response
    let responseText = '';
    if (aiResponse && typeof aiResponse === 'object' && 'response' in aiResponse) {
      responseText = aiResponse.response as string;
    } else if (typeof aiResponse === 'string') {
      responseText = aiResponse;
    } else {
      throw new Error('Unexpected AI response format');
    }
    
    // Try to extract JSON from the response
    let jsonMatch = responseText.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      console.log(`[${new Date().toISOString()}] LLM Tagger - No JSON found, using fallback`);
      return { topics: [], region: undefined };
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]) as LLMResponse;
    console.log(`[${new Date().toISOString()}] LLM Tagger - Parsed Response:`, JSON.stringify(parsedResponse));
    
    return parsedResponse;
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] LLM Tagger - Error:`, error);
    // Fallback to empty response on error
    return { topics: [], region: undefined };
  }
}