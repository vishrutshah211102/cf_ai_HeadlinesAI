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
    const { systemPrompt } = await import('./prompts');
    
    const userPrompt = `User message: "${message}"
Current preferences: ${JSON.stringify(prefs)}

Extract topics and region from this message:`;
    
    console.log(`[${new Date().toISOString()}] LLM Tagger - Calling Cloudflare AI with llama-3.3`);
    
    const aiResponse = await ai.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast' as any, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.1
    });
    
    console.log(`[${new Date().toISOString()}] LLM Tagger - Raw AI Response:`, JSON.stringify(aiResponse));

    // Extract and parse the response
    let parsedResponse: LLMResponse;
    
    if (aiResponse && typeof aiResponse === 'object' && 'response' in aiResponse) {
      // The response is already parsed as an object
      if (typeof aiResponse.response === 'object') {
        parsedResponse = aiResponse.response as LLMResponse;
      } else {
        // Response is a string, try to parse it
        const responseText = aiResponse.response as string;
        let jsonMatch = responseText.match(/\{[^}]+\}/);
        if (!jsonMatch) {
          console.log(`[${new Date().toISOString()}] LLM Tagger - No JSON found, using fallback`);
          return { topics: [], region: undefined };
        }
        parsedResponse = JSON.parse(jsonMatch[0]) as LLMResponse;
      }
    } else if (typeof aiResponse === 'string') {
      // Response is a string, try to parse it
      let jsonMatch = aiResponse.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        console.log(`[${new Date().toISOString()}] LLM Tagger - No JSON found, using fallback`);
        return { topics: [], region: undefined };
      }
      parsedResponse = JSON.parse(jsonMatch[0]) as LLMResponse;
    } else {
      throw new Error('Unexpected AI response format');
    }
    console.log(`[${new Date().toISOString()}] LLM Tagger - Parsed Response:`, JSON.stringify(parsedResponse));
    
    return parsedResponse;
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] LLM Tagger - Error:`, error);
    // Fallback to empty response on error
    return { topics: [], region: undefined };
  }
}