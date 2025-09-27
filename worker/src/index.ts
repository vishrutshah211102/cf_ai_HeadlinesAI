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
// Import the mock data
import mockData from "../../mock/mock.json";
// Import cookie utilities
import { getOrCreateSessionId } from "./cookie";

export class Pipeline extends WorkflowEntrypoint<Env> {
  async run(event: WorkflowEvent<unknown>, step: WorkflowStep) {
    return await step.do("default", async () => "ok");
  }
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		
		console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname} - ${request.headers.get('user-agent') || 'Unknown'}`);
		
		// Handle POST requests to /chat endpoint
		if (request.method === "POST" && url.pathname === "/chat") {
			try {
				// Handle session management
				const { sessionId, isNewSession, setCookieHeader } = getOrCreateSessionId(request);
				console.log(`[${new Date().toISOString()}] Session ID: ${sessionId} (New: ${isNewSession})`);
				
				// Get the request body as text
				const requestBody = await request.text();
				console.log(`[${new Date().toISOString()}] Request body length: ${requestBody.length}`);
				
				// Validate that the message has length > 0
				if (!requestBody || requestBody.trim().length === 0) {
					console.log(`[${new Date().toISOString()}] Validation failed: Empty message`);
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
					
					return new Response(
						JSON.stringify({ error: "Please send a message with at least size greater than 0" }),
						{
							status: 400,
							headers,
						}
					);
				}
				
				console.log(`[${new Date().toISOString()}] Validation passed, returning mock data`);
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
				
				return new Response(JSON.stringify(mockData), {
					headers,
				});
			} catch (error) {
				console.error(`[${new Date().toISOString()}] Error processing request:`, error);
				return new Response(
					JSON.stringify({ error: "Internal server error" }),
					{
						status: 500,
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*",
							"Access-Control-Allow-Methods": "POST, OPTIONS",
							"Access-Control-Allow-Headers": "Content-Type",
						},
					}
				);
			}
		}
		
		// Handle CORS preflight requests
		if (request.method === "OPTIONS") {
			console.log(`[${new Date().toISOString()}] CORS preflight request`);
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
		}
		
		// Default response for other requests
		console.log(`[${new Date().toISOString()}] Default response for ${request.method} ${url.pathname}`);
		return new Response('Hello World!');
	},
} satisfies ExportedHandler<Env>;
