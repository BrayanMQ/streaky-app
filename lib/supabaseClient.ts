import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for use in both Server and Client Components
 * 
 * This client uses NEXT_PUBLIC_ prefixed environment variables
 * which work in both server and client environments.
 * 
 * Usage:
 * ```tsx
 * // Server Component
 * import { supabase } from '@/lib/supabaseClient'
 * 
 * // Client Component
 * 'use client'
 * import { supabase } from '@/lib/supabaseClient'
 * ```
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);