/**
 * Cookie utilities for session management
 */

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Parse cookies from the Cookie header
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=');
    }
  });

  return cookies;
}

/**
 * Create a Set-Cookie header value
 */
export function createSetCookieHeader(name: string, value: string, options: {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
} = {}): string {
  let cookie = `${name}=${value}`;

  if (options.maxAge) {
    cookie += `; Max-Age=${options.maxAge}`;
  }

  if (options.path) {
    cookie += `; Path=${options.path}`;
  }

  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  if (options.secure) {
    cookie += '; Secure';
  }

  if (options.httpOnly) {
    cookie += '; HttpOnly';
  }

  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  return cookie;
}

/**
 * Get or create session ID from cookies or custom header
 */
export function getOrCreateSessionId(request: Request): { sessionId: string; isNewSession: boolean; setCookieHeader?: string; sessionHeader?: string } {
  // First try to get session from custom header (for cross-origin)
  const sessionHeader = request.headers.get('X-Session-ID');
  if (sessionHeader) {
    console.log(`[${new Date().toISOString()}] Existing session from header: ${sessionHeader}`);
    return {
      sessionId: sessionHeader,
      isNewSession: false
    };
  }

  // Fallback to cookies
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  
  // Check if 'sid' cookie exists
  if (cookies.sid) {
    console.log(`[${new Date().toISOString()}] Existing session found: ${cookies.sid}`);
    return {
      sessionId: cookies.sid,
      isNewSession: false
    };
  }

  // Create new session ID
  const newSessionId = generateUUID();
  console.log(`[${new Date().toISOString()}] Creating new session: ${newSessionId}`);
  
  const setCookieHeader = createSetCookieHeader('sid', newSessionId, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    httpOnly: false, // Allow JavaScript access for debugging
    secure: false,   // Allow non-HTTPS for localhost development
    sameSite: 'Lax'
  });

  return {
    sessionId: newSessionId,
    isNewSession: true,
    setCookieHeader,
    sessionHeader: newSessionId // Return session ID for client to store
  };
}