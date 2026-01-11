'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

/**
 * Props for the ErrorFallback component
 */
interface ErrorFallbackProps {
    /** The error that was caught */
    error?: Error;
    /** Function to reset the error boundary */
    resetErrorBoundary?: () => void;
    /** Custom title for the error message */
    title?: string;
    /** Custom description for the error message */
    description?: string;
}

/**
 * ErrorFallback Component
 * 
 * A user-friendly error display component that matches the app's design system.
 * Used as the fallback UI for error boundaries and error pages.
 * 
 * Features:
 * - Clean, card-based design matching the app style
 * - "Try Again" button to reset the error state
 * - "Go to Dashboard" button for navigation
 * - i18n support for translations
 * - Development mode error details
 * 
 * @example
 * ```tsx
 * <ErrorFallback 
 *   error={error}
 *   resetErrorBoundary={() => reset()}
 * />
 * ```
 */
export function ErrorFallback({
    error,
    resetErrorBoundary,
    title,
    description
}: ErrorFallbackProps) {
    const { t } = useTranslation();

    const displayTitle = title || t('errors.boundary.title');
    const displayDescription = description || t('errors.boundary.description');

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{displayTitle}</CardTitle>
                    <CardDescription className="text-base">
                        {displayDescription}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    {process.env.NODE_ENV === 'development' && error && (
                        <div className="rounded-lg bg-muted p-4 text-left">
                            <p className="text-xs font-mono text-muted-foreground break-all">
                                {error.message}
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:flex-row">
                    {resetErrorBoundary && (
                        <Button onClick={resetErrorBoundary} variant="outline" className="flex-1 w-full sm:w-auto">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t('errors.boundary.tryAgain')}
                        </Button>
                    )}
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
