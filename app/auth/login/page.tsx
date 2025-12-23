'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Login content component that uses useSearchParams
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInPending,
    signUpPending,
    signInWithGooglePending,
    signInError,
    signUpError,
  } = useAuth();

  // Validate redirectTo to prevent open redirects
  const getValidRedirectPath = () => {
    if (!redirectTo) return '/dashboard';
    // Only allow relative paths, no external URLs
    if (
      redirectTo.startsWith('/') &&
      !redirectTo.includes('://') &&
      !redirectTo.toLowerCase().startsWith('javascript:') &&
      !redirectTo.toLowerCase().startsWith('data:')
    ) {
      return redirectTo;
    }
    return '/dashboard';
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Get user-friendly error message from Supabase error
  const getErrorMessage = (error: any): string => {
    if (!error) return 'An unexpected error occurred';

    const errorMessage = error.message || error.toString();

    // Map common Supabase errors to user-friendly messages
    if (errorMessage.includes('Invalid login credentials') || 
        errorMessage.includes('email') && errorMessage.includes('password')) {
      return 'Invalid email or password. Please try again.';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Please check your email and confirm your account before signing in.';
    }
    if (errorMessage.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (errorMessage.includes('Password')) {
      if (errorMessage.includes('weak')) {
        return 'Password is too weak. Please use a stronger password.';
      }
      if (errorMessage.includes('length')) {
        return 'Password must be at least 6 characters long.';
      }
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }

    return errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    // Validation
    const errors: { email?: string; password?: string } = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (!isLogin && password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // If there are field errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      if (isLogin) {
        const result = await signIn({ email: email.trim(), password });
        if (result.error) {
          setFormError(getErrorMessage(result.error));
          return;
        }
        // Success - redirect will happen via auth state change
        router.push(getValidRedirectPath());
      } else {
        const result = await signUp({ email: email.trim(), password });
        if (result.error) {
          setFormError(getErrorMessage(result.error));
          return;
        }
        // Success - redirect will happen via auth state change
        router.push(getValidRedirectPath());
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    try {
      const redirectPath = getValidRedirectPath();
      const result = await signInWithGoogle(
        `${window.location.origin}${redirectPath}`
      );
      if (result.error) {
        setFormError(result.error.message || 'Failed to sign in with Google');
      }
      // OAuth will redirect automatically
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  };

  const displayError = formError || signInError?.message || signUpError?.message;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-2xl">
        <Flame className="h-8 w-8 text-primary" />
        <span>Streaky</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isLogin ? 'Welcome back' : 'Create account'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Sign in to continue your streaks'
              : 'Start building habits today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayError && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Clear email error when user starts typing
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                onBlur={() => {
                  // Validate email on blur
                  if (email && !validateEmail(email)) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: 'Please enter a valid email address',
                    }));
                  }
                }}
                required
                disabled={signInPending || signUpPending}
                className={fieldErrors.email ? 'border-destructive' : ''}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Clear password error when user starts typing
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                required
                disabled={signInPending || signUpPending}
                className={fieldErrors.password ? 'border-destructive' : ''}
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {isLogin && (
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  asChild
                >
                  <Link href="/auth/forgot-password">Forgot password?</Link>
                </Button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={signInPending || signUpPending}
            >
              {signInPending || signUpPending
                ? 'Processing...'
                : isLogin
                  ? 'Sign In'
                  : 'Sign Up'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent hover:bg-muted/50 hover:border-input/80 transition-all duration-200"
            onClick={handleGoogleLogin}
            disabled={signInWithGooglePending}
            type="button"
          >
            {signInWithGooglePending ? (
              'Connecting...'
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </>
            )}
          </Button>

          <div className="mt-6 text-center text-sm">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="px-1"
                  onClick={() => {
                    setIsLogin(false);
                    setFormError(null);
                    setFieldErrors({});
                  }}
                >
                  Sign up
                </Button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="px-1"
                  onClick={() => {
                    setIsLogin(true);
                    setFormError(null);
                    setFieldErrors({});
                  }}
                >
                  Sign in
                </Button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Login page
 *
 * This page provides authentication options:
 * - Email/password sign in and sign up
 * - Google OAuth sign in
 * - Password recovery link
 * - Registration link
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
