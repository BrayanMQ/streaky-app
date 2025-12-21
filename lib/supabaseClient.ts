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

/**
 * Creates or returns the singleton Supabase client optimized for browser usage with session management
 * 
 * This client is configured with:
 * - Automatic session persistence (localStorage)
 * - Auth state change listeners
 * - Optimized for authentication flows
 * 
 * Uses a singleton pattern to ensure only one instance exists in the browser context,
 * preventing the "Multiple GoTrueClient instances detected" warning.
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
  // Return existing instance if it exists (singleton pattern)
  if (browserClientInstance) {
    return browserClientInstance;
  }
  
  // Create new instance only if it doesn't exist
  browserClientInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });
  
  return browserClientInstance;
}