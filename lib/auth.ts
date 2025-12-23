import { createBrowserClient } from './supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Authentication functions for Supabase Auth
 * 
 * All functions use the browser client which is optimized for
 * authentication flows with session persistence.
 */

/**
 * Signs in a user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with user and session data, or error
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Signs up a new user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with user and session data, or error
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Signs in a user with Google OAuth
 * 
 * This will redirect the user to Google's OAuth consent screen.
 * After authentication, the user will be redirected back to the app.
 * 
 * @param redirectTo - Optional URL to redirect to after authentication (defaults to /dashboard)
 * @returns Promise that resolves when redirect is initiated, or error
 */
export async function signInWithGoogle(
  redirectTo?: string
): Promise<{ error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  // Get the origin for the callback URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Build the callback URL with redirectTo as a query parameter if provided
  // Extract just the path from redirectTo if it's a full URL
  let redirectPath = redirectTo || '/dashboard';
  if (redirectTo && redirectTo.startsWith('http')) {
    try {
      const url = new URL(redirectTo);
      redirectPath = url.pathname;
    } catch {
      redirectPath = '/dashboard';
    }
  }
  
  // Build callback URL with redirectTo as query parameter
  const callbackUrl = `${origin}/auth/callback${redirectPath !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectPath)}` : ''}`;
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
    },
  });

  return { error };
}

/**
 * Signs out the current user
 * 
 * @returns Promise with error if sign out fails
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  const { error } = await supabase.auth.signOut();

  return { error };
}

/**
 * Gets the current authenticated user
 * 
 * @returns Promise with current user data, or null if not authenticated
 */
export async function getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  return { user, error };
}

/**
 * Gets the current session
 * 
 * @returns Promise with current session data, or null if no active session
 */
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();

  return { session, error };
}

/**
 * Resends the email confirmation link
 * 
 * @param email - User's email address
 * @returns Promise with error if resend fails
 */
export async function resendConfirmationEmail(
  email: string
): Promise<{ error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  return { error };
}

