'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';

/**
 * Dashboard page
 * 
 * This page will be fully implemented in a future issue.
 * For now, it's a placeholder to test the middleware protection.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, signOut, signOutPending, signOutError } = useAuth();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.error) {
        console.error('Sign out error:', result.error);
        // Even if there's an error, redirect to login
        router.push('/auth/login');
      } else {
        // Redirect to login after successful sign out
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Redirect to login even on error
      router.push('/auth/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              {user?.email ? `Welcome, ${user.email}` : 'This page is protected by middleware.'}
            </p>
          </div>
          <Button
            onClick={handleSignOut}
            disabled={signOutPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            {signOutPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Sign out
              </>
            )}
          </Button>
        </div>

        {signOutError && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Error signing out: {signOutError.message}
          </div>
        )}

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Dashboard</h2>
          <p className="text-muted-foreground">
            This page will be fully implemented in a future issue.
          </p>
        </div>
      </div>
    </div>
  );
}

