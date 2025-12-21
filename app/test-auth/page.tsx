'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

/**
 * Test page for authentication functionality
 * 
 * This page allows you to test all authentication features:
 * - Email/password sign in
 * - Email/password sign up
 * - Google OAuth sign in
 * - Sign out
 * - View current user and session
 * 
 * Remove this page before production deployment.
 */
export default function TestAuthPage() {
  const {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resendConfirmationEmail,
    signInPending,
    signUpPending,
    signInWithGooglePending,
    signOutPending,
    resendConfirmationPending,
    signInError,
    signUpError,
    signInWithGoogleError,
    signOutError,
    resendConfirmationError,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn({ email, password });
      if (result.error) {
        console.error('Sign in error:', result.error);
      } else {
        console.log('Sign in successful:', result.user);
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signUp({ email, password });
      if (result.error) {
        console.error('Sign up error:', result.error);
      } else {
        console.log('Sign up successful:', result.user);
      }
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      const result = await signInWithGoogle(window.location.origin);
      if (result.error) {
        console.error('Google sign in error:', result.error);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.error) {
        console.error('Sign out error:', result.error);
      } else {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>

      {/* Current Auth State */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
        {user ? (
          <div>
            <p className="mb-2">
              <strong>User:</strong> {user.email}
            </p>
            <p className="mb-2">
              <strong>User ID:</strong> {user.id}
            </p>
            <p className="mb-2">
              <strong>Session:</strong> {session ? 'Active' : 'No session'}
            </p>
            {session && session.expires_at && (
              <p className="text-sm text-gray-600">
                <strong>Expires at:</strong>{' '}
                {new Date(session.expires_at * 1000).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <p>Not authenticated</p>
        )}
      </div>

      {/* Sign In Form */}
      {!user && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sign In</h2>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            {signInError && (
              <div className="text-red-600 text-sm space-y-2">
                <p>
                  <strong>Error:</strong> {signInError.message}
                </p>
                {signInError.message === 'Email not confirmed' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="mb-2">
                      Your email needs to be confirmed. You can:
                    </p>
                    <ul className="list-disc list-inside mb-2 space-y-1 text-sm">
                      <li>Check your email for the confirmation link</li>
                      <li>Resend the confirmation email below</li>
                      <li>
                        <a
                          href="https://app.supabase.com/project/_/auth/users"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Confirm manually in Supabase Dashboard
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://app.supabase.com/project/_/auth/providers"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Disable email confirmation (for development)
                        </a>
                      </li>
                    </ul>
                    <button
                      onClick={async () => {
                        if (!email) {
                          alert('Please enter your email first');
                          return;
                        }
                        try {
                          await resendConfirmationEmail(email);
                          alert('Confirmation email sent! Check your inbox.');
                        } catch (error) {
                          console.error('Error resending email:', error);
                          alert('Error sending confirmation email. Check console for details.');
                        }
                      }}
                      disabled={resendConfirmationPending || !email}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                    >
                      {resendConfirmationPending
                        ? 'Sending...'
                        : 'Resend Confirmation Email'}
                    </button>
                    {resendConfirmationError && (
                      <p className="text-red-600 text-xs mt-1">
                        {resendConfirmationError.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <button
              type="submit"
              disabled={signInPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {signInPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      )}

      {/* Sign Up Form */}
      {!user && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="signup-email" className="block mb-2">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block mb-2">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            {signUpError && (
              <p className="text-red-600 text-sm">
                Error: {signUpError.message}
              </p>
            )}
            <button
              type="submit"
              disabled={signUpPending}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {signUpPending ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        </div>
      )}

      {/* Google OAuth */}
      {!user && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Google OAuth</h2>
          {signInWithGoogleError && (
            <p className="text-red-600 text-sm mb-4">
              Error: {signInWithGoogleError.message}
            </p>
          )}
          <button
            onClick={handleSignInWithGoogle}
            disabled={signInWithGooglePending}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {signInWithGooglePending
              ? 'Redirecting...'
              : 'Sign in with Google'}
          </button>
        </div>
      )}

      {/* Sign Out */}
      {user && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sign Out</h2>
          {signOutError && (
            <p className="text-red-600 text-sm mb-4">
              Error: {signOutError.message}
            </p>
          )}
          <button
            onClick={handleSignOut}
            disabled={signOutPending}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {signOutPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({ user, session }, null, 2)}
        </pre>
      </div>
    </div>
  );
}

