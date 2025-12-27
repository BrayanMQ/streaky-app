import { createClient } from "@supabase/supabase-js";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import type { Database } from '@/types/database'
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client configuration
 * 
 * This module provides Supabase clients for both Server and Client Components.
 * The browser client uses cookies for session management to work with middleware.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/**
 * Base Supabase client for Server Components
 * 
 * Usage:
 * ```tsx
 * // Server Component
 * import { supabase } from '@/lib/supabaseClient'
 * ```
 */
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Singleton instance for browser client
let browserClientInstance: SupabaseClient<Database> | null = null;

// Use a unique key to identify our singleton instance in window object
// This ensures true singleton across all module boundaries in Next.js
const BROWSER_CLIENT_KEY = '__SUPABASE_BROWSER_CLIENT_SINGLETON__';

/**
 * Creates or returns the singleton Supabase client optimized for browser usage with cookie-based session management
 * 
 * This client is configured with:
 * - Cookie-based session persistence (works with middleware)
 * - Auth state change listeners
 * - Optimized for authentication flows
 * 
 * Uses @supabase/ssr to handle cookies properly so the middleware can read the session.
 * 
 * Uses a robust singleton pattern that stores the instance in both module scope and window object
 * to prevent the "Multiple GoTrueClient instances detected" warning across different module boundaries.
 * 
 * Usage:
 * ```tsx
 * // Client Component
 * 'use client'
 * import { createBrowserClient } from '@/lib/supabaseClient'
 * 
 * const supabase = createBrowserClient()
 * ```
 * 
 * @returns {SupabaseClient<Database>} A Supabase client instance for browser use (singleton)
 */
export function createBrowserClient(): SupabaseClient<Database> {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    throw new Error('createBrowserClient can only be used in browser environment');
  }

  // First, check window object for existing instance (prevents cross-module duplicates)
  const windowInstance = (window as any)[BROWSER_CLIENT_KEY] as SupabaseClient<Database> | undefined;
  if (windowInstance) {
    // Also update module-level reference for consistency
    browserClientInstance = windowInstance;
    return windowInstance;
  }

  // Then check module-level singleton
  if (browserClientInstance) {
    // Store in window for cross-module access
    (window as any)[BROWSER_CLIENT_KEY] = browserClientInstance;
    return browserClientInstance;
  }
  
  // Create new instance using @supabase/ssr for cookie management
  // This ensures cookies are set properly so middleware can read them
  browserClientInstance = createSSRBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return document.cookie.split(';').map(cookie => {
          const [name, ...rest] = cookie.split('=');
          return { name: name.trim(), value: rest.join('=') };
        });
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieString = `${name}=${value}`;
          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`;
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`;
          }
          if (options?.path) {
            cookieString += `; path=${options.path}`;
          }
          if (options?.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
          }
          if (options?.secure) {
            cookieString += `; secure`;
          }
          if (options?.httpOnly) {
            // httpOnly cookies cannot be set from JavaScript
            // They must be set by the server
          }
          document.cookie = cookieString;
        });
      },
    },
  });

  // Store in window object immediately to prevent race conditions
  (window as any)[BROWSER_CLIENT_KEY] = browserClientInstance;
  
  return browserClientInstance;
}