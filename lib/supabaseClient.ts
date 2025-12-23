import { createClient } from "@supabase/supabase-js";
import type { Database } from '@/types/database'
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client configuration
 * 
 * This module provides Supabase clients for both Server and Client Components.
 * The browser client is optimized for authentication and session management.
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
 * Creates or returns the singleton Supabase client optimized for browser usage with session management
 * 
 * This client is configured with:
 * - Automatic session persistence (localStorage)
 * - Auth state change listeners
 * - Optimized for authentication flows
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
  
  // Create new instance only if it doesn't exist anywhere
  browserClientInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      // Use a consistent storage key to avoid conflicts
      storageKey: 'sb-auth-token',
    },
  });

  // Store in window object immediately to prevent race conditions
  (window as any)[BROWSER_CLIENT_KEY] = browserClientInstance;
  
  return browserClientInstance;
}