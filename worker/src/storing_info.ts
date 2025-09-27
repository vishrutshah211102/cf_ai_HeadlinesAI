/**
 * Cloudflare KV storage utilities for user data management
 */

export interface UserPreferences {
  topics?: string[];
  region?: string;
}

export interface SeenArticles {
  ids: number[];
  updated_at: string;
}

/**
 * Get user preferences from KV storage
 * @param kv - Cloudflare KV namespace
 * @param sid - Session ID for namespacing
 * @returns User preferences object
 */
export async function getUserPreferences(kv: KVNamespace, sid: string): Promise<UserPreferences> {
  const key = `prefs:${sid}`;
  console.log(`[${new Date().toISOString()}] Getting user preferences for key: ${key}`);
  
  try {
    const stored = await kv.get(key, { type: "json" });
    const prefs = stored || {};
    console.log(`[${new Date().toISOString()}] Retrieved preferences:`, JSON.stringify(prefs));
    return prefs as UserPreferences;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error getting preferences for ${key}:`, error);
    return {};
  }
}

/**
 * Update user preferences in KV storage
 * @param kv - Cloudflare KV namespace
 * @param sid - Session ID for namespacing
 * @param newPrefs - New preferences to merge with existing ones
 */
export async function updateUserPreferences(kv: KVNamespace, sid: string, newPrefs: UserPreferences): Promise<void> {
  const key = `prefs:${sid}`;
  console.log(`[${new Date().toISOString()}] Updating user preferences for key: ${key}`);
  
  try {
    // Get existing preferences
    const existingPrefs = await getUserPreferences(kv, sid);
    
    // Merge new preferences with existing ones
    const mergedPrefs: UserPreferences = {
      ...existingPrefs,
      ...newPrefs,
      // Merge topics arrays if both exist
      topics: newPrefs.topics ? [...(existingPrefs.topics || []), ...newPrefs.topics].filter((topic, index, arr) => arr.indexOf(topic) === index) : existingPrefs.topics
    };
    
    await kv.put(key, JSON.stringify(mergedPrefs));
    console.log(`[${new Date().toISOString()}] Updated preferences:`, JSON.stringify(mergedPrefs));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating preferences for ${key}:`, error);
  }
}

/**
 * Get seen articles from KV storage
 * @param kv - Cloudflare KV namespace
 * @param sid - Session ID for namespacing
 * @returns Seen articles object
 */
export async function getSeenArticles(kv: KVNamespace, sid: string): Promise<SeenArticles> {
  const key = `seen:${sid}`;
  console.log(`[${new Date().toISOString()}] Getting seen articles for key: ${key}`);
  
  try {
    const stored = await kv.get(key, { type: "json" });
    const defaultSeen: SeenArticles = {
      ids: [],
      updated_at: new Date().toISOString()
    };
    const seen = stored || defaultSeen;
    console.log(`[${new Date().toISOString()}] Retrieved seen articles:`, JSON.stringify(seen));
    return seen as SeenArticles;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error getting seen articles for ${key}:`, error);
    return {
      ids: [],
      updated_at: new Date().toISOString()
    };
  }
}

/**
 * Add article IDs to seen list
 * @param kv - Cloudflare KV namespace
 * @param sid - Session ID for namespacing
 * @param articleIds - Array of article IDs to mark as seen
 */
export async function addSeenArticles(kv: KVNamespace, sid: string, articleIds: number[]): Promise<void> {
  const key = `seen:${sid}`;
  console.log(`[${new Date().toISOString()}] Adding seen articles for key: ${key}, IDs:`, articleIds);
  
  try {
    // Get existing seen articles
    const existingSeen = await getSeenArticles(kv, sid);
    
    // Merge new article IDs with existing ones (remove duplicates)
    const mergedIds = [...existingSeen.ids, ...articleIds].filter((id, index, arr) => arr.indexOf(id) === index);
    
    const updatedSeen: SeenArticles = {
      ids: mergedIds,
      updated_at: new Date().toISOString()
    };
    
    await kv.put(key, JSON.stringify(updatedSeen));
    console.log(`[${new Date().toISOString()}] Updated seen articles:`, JSON.stringify(updatedSeen));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating seen articles for ${key}:`, error);
  }
}