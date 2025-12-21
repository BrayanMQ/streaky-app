'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabaseClient';

/**
 * OAuth callback page
 * 
 * This page handles the OAuth callback from Supabase after Google authentication.
 * It processes the tokens from the URL hash and establishes the session.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createBrowserClient();
        
        // Check for OAuth errors in the hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          setIsProcessing(false);
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        // Supabase with detectSessionInUrl: true should automatically process the hash
        // Wait a bit for Supabase to process the session from the URL hash
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get the session (Supabase should have processed the hash automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
          setIsProcessing(false);
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        if (session) {
          // Success! Clean up the URL and redirect to dashboard
          window.history.replaceState({}, document.title, window.location.pathname);
          router.push('/dashboard');
        } else {
          // If no session after a short delay, try once more
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();
          
          if (retryError) {
            setError(retryError.message);
            setIsProcessing(false);
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }

          if (retrySession) {
            window.history.replaceState({}, document.title, window.location.pathname);
            router.push('/dashboard');
          } else {
            setError('No session found. Please try signing in again.');
            setIsProcessing(false);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setIsProcessing(false);
        // Clean up the URL even on error
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleCallback();
  }, [router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-red-600 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}

