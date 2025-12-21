'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabaseClient';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  getSession,
} from '@/lib/auth';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Query keys for React Query
 */
const authKeys = {
  user: ['auth', 'user'] as const,
  session: ['auth', 'session'] as const,
};

/**
 * Custom hook for authentication using React Query
 * 
 * This hook provides:
 * - Current user and session state
 * - Authentication mutations (sign in, sign up, sign out)
 * - Automatic session synchronization via auth state changes
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useAuth } from '@/hooks/useAuth'
 * 
 * function MyComponent() {
 *   const { user, session, isLoading, signIn, signOut } = useAuth()
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   if (!user) return <div>Not authenticated</div>
 *   
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // Query for current user
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: authKeys.user,
    queryFn: async () => {
      const { user, error } = await getCurrentUser();
      if (error) throw error;
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Query for current session
  const {
    data: sessionData,
    isLoading: isLoadingSession,
  } = useQuery({
    queryKey: authKeys.session,
    queryFn: async () => {
      const { session, error } = await getSession();
      if (error) throw error;
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Mutation for email/password sign in
  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithEmail(email, password),
    onSuccess: (data) => {
      if (data.user && data.session) {
        // Invalidate and refetch user and session queries
        queryClient.setQueryData(authKeys.user, data.user);
        queryClient.setQueryData(authKeys.session, data.session);
      }
    },
  });

  // Mutation for email/password sign up
  const signUpMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signUpWithEmail(email, password),
    onSuccess: (data) => {
      if (data.user && data.session) {
        // Invalidate and refetch user and session queries
        queryClient.setQueryData(authKeys.user, data.user);
        queryClient.setQueryData(authKeys.session, data.session);
      }
    },
  });

  // Mutation for Google OAuth sign in
  const signInWithGoogleMutation = useMutation({
    mutationFn: (redirectTo?: string) => signInWithGoogle(redirectTo),
  });

  // Mutation for sign out
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // Clear user and session from cache
      queryClient.setQueryData(authKeys.user, null);
      queryClient.setQueryData(authKeys.session, null);
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });

  // Listen to auth state changes and sync with React Query
  useEffect(() => {
    const supabase = createBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Update session in cache
      queryClient.setQueryData(authKeys.session, session);

      // Update user in cache if session exists
      if (session?.user) {
        queryClient.setQueryData(authKeys.user, session.user);
      } else {
        queryClient.setQueryData(authKeys.user, null);
      }

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      queryClient.invalidateQueries({ queryKey: authKeys.session });

      // Handle specific events
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    // State
    user: userData ?? null,
    session: sessionData ?? null,
    isLoading: isLoadingUser || isLoadingSession,
    error: userError as AuthError | null,

    // Mutations
    signIn: signInMutation.mutateAsync,
    signInPending: signInMutation.isPending,
    signInError: signInMutation.error as AuthError | null,

    signUp: signUpMutation.mutateAsync,
    signUpPending: signUpMutation.isPending,
    signUpError: signUpMutation.error as AuthError | null,

    signInWithGoogle: signInWithGoogleMutation.mutateAsync,
    signInWithGooglePending: signInWithGoogleMutation.isPending,
    signInWithGoogleError: signInWithGoogleMutation.error as AuthError | null,

    signOut: signOutMutation.mutateAsync,
    signOutPending: signOutMutation.isPending,
    signOutError: signOutMutation.error as AuthError | null,
  };
}

