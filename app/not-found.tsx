'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

/**
 * 404 Not Found page
 * 
 * Custom 404 page displayed when a route doesn't exist.
 * Provides navigation options to help users find their way back.
 * 
 * Features:
 * - Clean, user-friendly design
 * - Navigation options (go home, go back)
 * - Consistent with app design system
 */
export default function NotFoundPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">
            Page Not Found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground">
              Don't worry! You can navigate back to your dashboard or use the navigation menu to find what you're looking for.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleGoBack} variant="outline" className="flex-1 w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button asChild className="flex-1 w-full sm:w-auto">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
