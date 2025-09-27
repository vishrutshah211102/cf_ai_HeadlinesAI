/**
 * Headlines Service - Clean interface for workflow execution
 */

import { HeadlinesWorkflow, type WorkflowInput, type WorkflowOutput } from "./headlines_workflow";
import { getOrCreateSessionId } from "./cookie";

/**
 * Process chat request through the Headlines workflow
 * @param request - HTTP request object
 * @param env - Environment bindings
 * @returns Promise with workflow results and response headers
 */
export async function processChatRequest(
  request: Request, 
  env: Env
): Promise<{ result: WorkflowOutput; headers: Record<string, string> }> {
  console.log(`[${new Date().toISOString()}] Headlines Service: Processing chat request`);
  
  // Handle session management
  const { sessionId, isNewSession, setCookieHeader } = getOrCreateSessionId(request);
  console.log(`[${new Date().toISOString()}] Headlines Service: Session ${sessionId} (New: ${isNewSession})`);
  
  // Get and validate request body
  const userMessage = await request.text();
  console.log(`[${new Date().toISOString()}] Headlines Service: Message length ${userMessage.length}`);
  
  if (!userMessage || userMessage.trim().length === 0) {
    throw new Error("Please send a message with at least size greater than 0");
  }
  
  // Execute workflow steps manually (stub implementation)
  console.log(`[${new Date().toISOString()}] Headlines Service: Starting workflow execution`);
  
  const workflowInput: WorkflowInput = {
    sessionId,
    userMessage: userMessage.trim(),
    kv: env.HEADLINES_KV
  };
  
  // Create a mock step executor for workflow
  const mockStep = {
    do: async (name: string, fn: () => Promise<any>) => {
      console.log(`[${new Date().toISOString()}] Executing workflow step: ${name}`);
      const result = await fn();
      console.log(`[${new Date().toISOString()}] Completed workflow step: ${name}`);
      return result;
    }
  } as any;
  
  // Execute workflow logic directly
  const workflow = new HeadlinesWorkflow();
  const result = await workflow.run(workflowInput, mockStep);
  console.log(`[${new Date().toISOString()}] Headlines Service: Workflow execution complete`);
  
  // Prepare response headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS", 
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  // Set cookie if it's a new session
  if (setCookieHeader) {
    headers["Set-Cookie"] = setCookieHeader;
  }
  
  console.log(`[${new Date().toISOString()}] Headlines Service: Returning ${result.articles.length} articles`);
  
  return { result, headers };
}

/**
 * Handle CORS preflight requests
 */
export function handleCORSPreflight(): Response {
  console.log(`[${new Date().toISOString()}] Headlines Service: Handling CORS preflight`);
  
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}