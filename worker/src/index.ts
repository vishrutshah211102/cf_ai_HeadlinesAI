/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import { HeadlinesWorkflow } from "./headlines_workflow";
import { processChatRequest, handleCORSPreflight } from "./headlines_service";

export class Pipeline extends WorkflowEntrypoint<Env> {
  async run(event: WorkflowEvent<unknown>, step: WorkflowStep) {
    return await step.do("default", async () => "ok");
  }
}

// Export the Headlines workflow for Cloudflare to register
export { HeadlinesWorkflow };

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		
		console.log(`[${new Date().toISOString()}] Worker: ${request.method} ${url.pathname} - ${request.headers.get('user-agent') || 'Unknown'}`);
		
		// Handle POST requests to /chat endpoint
		if (request.method === "POST" && url.pathname === "/chat") {
			try {
				console.log(`[${new Date().toISOString()}] Worker: Processing chat request via Headlines Service`);
				
				// Use the Headlines service to process the request
				const { result, headers } = await processChatRequest(request, env);
				
				console.log(`[${new Date().toISOString()}] Worker: Chat request completed successfully`);
				return new Response(JSON.stringify(result.articles), { headers });
				
			} catch (error) {
				console.error(`[${new Date().toISOString()}] Worker: Error processing chat request:`, error);
				
				const errorMessage = error instanceof Error ? error.message : "Internal server error";
				const status = errorMessage.includes("Please send a message") ? 400 : 500;
				
				return new Response(
					JSON.stringify({ error: errorMessage }),
					{
						status,
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": request.headers.get('Origin') || "*",
							"Access-Control-Allow-Methods": "POST, OPTIONS",
							"Access-Control-Allow-Headers": "Content-Type, X-Session-ID",
							"Access-Control-Expose-Headers": "X-Session-ID",
							"Access-Control-Allow-Credentials": "true",
						},
					}
				);
			}
		}
		
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      console.log(`[${new Date().toISOString()}] Worker: Handling CORS preflight`);
      return handleCORSPreflight(request);
    }		// Default response for other requests
		console.log(`[${new Date().toISOString()}] Worker: Default response for ${request.method} ${url.pathname}`);
		return new Response('Hello World! Headlines AI Worker is running.');
	},
} satisfies ExportedHandler<Env>;
