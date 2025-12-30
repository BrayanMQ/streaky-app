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

/**
 * Updates the current user's email address
 * 
 * @param newEmail - New email address
 * @returns Promise with updated user data, or error
 */
export async function updateEmail(
  newEmail: string
): Promise<{ user: User | null; error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  return {
    user: data.user,
    error,
  };
}

/**
 * Updates the current user's password
 * 
 * @param newPassword - New password
 * @returns Promise with updated user data, or error
 */
export async function updatePassword(
  newPassword: string
): Promise<{ user: User | null; error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return {
    user: data.user,
    error,
  };
}

/**
 * Deletes the current user's account and all associated data
 * 
 * This function:
 * 1. Deletes all user-related data (habits, habit_logs, user_settings)
 * 2. Signs out the user
 * 
 * Note: The actual deletion of the auth user requires admin privileges.
 * The data deletion will cascade automatically when the user is deleted,
 * but we delete explicitly here for better control and error handling.
 * 
 * For complete account deletion including auth user, you may need to:
 * - Use a Supabase Edge Function with admin privileges
 * - Or handle it server-side with admin API
 * 
 * @returns Promise with error if deletion fails
 */
export async function deleteUserAccount(): Promise<{ error: AuthError | null }> {
  const supabase = createBrowserClient();
  
  // Get current user to ensure they're authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: userError || new Error('User not authenticated') as AuthError };
  }

  try {
    // Delete user_settings (CASCADE would handle this, but we do it explicitly)
    const { error: settingsError } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', user.id);

    if (settingsError) {
      console.error('Error deleting user settings:', settingsError);
      // Continue even if settings deletion fails (might not exist)
    }

    // First, get all habit IDs for this user
    const { data: habits, error: fetchHabitsError } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', user.id);

    if (fetchHabitsError) {
      console.error('Error fetching habits:', fetchHabitsError);
      // Continue - we'll try to delete habits anyway
    }

    // Delete habit_logs for all user's habits
    // (This will cascade automatically, but we do it explicitly for cleaner transaction)
    if (habits && habits.length > 0) {
      const habitIds = habits.map(h => h.id);
      const { error: logsError } = await supabase
        .from('habit_logs')
        .delete()
        .in('habit_id', habitIds);

      if (logsError) {
        console.error('Error deleting habit logs:', logsError);
        // Continue even if logs deletion fails (CASCADE will handle it)
      }
    }

    // Delete habits (this will cascade delete habit_logs automatically if we didn't above)
    const { error: habitsError } = await supabase
      .from('habits')
      .delete()
      .eq('user_id', user.id);

    if (habitsError) {
      console.error('Error deleting habits:', habitsError);
      return { error: habitsError as unknown as AuthError };
    }

    // Sign out the user (auth user deletion requires admin privileges)
    // The actual auth user deletion should be handled by a server-side function
    // or Edge Function with admin privileges
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      return { error: signOutError };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { 
      error: error instanceof Error ? error as AuthError : new Error('Failed to delete account') as AuthError 
    };
  }
}

