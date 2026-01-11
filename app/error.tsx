'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

/**
 * Error page for handling runtime errors in the application
 * 
 * This is Next.js App Router's error.tsx convention that creates
 * an error boundary for route segments.
 * 
 * Features:
 * - Catches errors at the route segment level
 * - Provides reset functionality to recover
 * - User-friendly UI matching app design
 * - Development mode error details
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = useTranslation();

    useEffect(() => {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error caught by error.tsx:', error);
        }
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t('errors.boundary.title')}</CardTitle>
                    <CardDescription className="text-base">
                        {t('errors.boundary.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    {process.env.NODE_ENV === 'development' && (
                        <div className="rounded-lg bg-muted p-4 text-left">
                            <p className="text-xs font-mono text-muted-foreground break-all">
                                {error.message}
                            </p>
                            {error.digest && (
                                <p className="text-xs font-mono text-muted-foreground mt-2">
                                    Digest: {error.digest}
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={() => reset()} variant="outline" className="flex-1 w-full sm:w-auto">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t('errors.boundary.tryAgain')}
                    </Button>
                    <Button asChild className="flex-1 w-full sm:w-auto">
                        <Link href="/dashboard">
                            <Home className="mr-2 h-4 w-4" />
                            {t('errors.boundary.goHome')}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
