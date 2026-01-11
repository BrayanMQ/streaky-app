/**
 * Centralized Error Handling Utilities
 * 
 * This module provides utilities for consistent error handling across the application.
 */

import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Error types for categorization
 */
export type ErrorType =
    | 'network'
    | 'auth'
    | 'validation'
    | 'server'
    | 'unknown';

/**
 * Structured app error
 */
export interface AppError {
    type: ErrorType;
    message: string;
    originalError?: unknown;
}

/**
 * Check if an error is a network-related error
 * 
 * @param error - The error to check
 * @returns true if the error is network-related
 */
export function isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) {
        const message = error.message.toLowerCase();
        return (
            message.includes('failed to fetch') ||
            message.includes('network request failed') ||
            message.includes('networkerror')
        );
    }

    if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        return status === 0 || status === 503;
    }

    return false;
}

/**
 * Check if the browser is currently offline
 * 
 * @returns true if the browser is offline
 */
export function isOffline(): boolean {
    if (typeof navigator !== 'undefined') {
        return !navigator.onLine;
    }
    return false;
}

/**
 * Parse a Supabase error into a user-friendly message
 * 
 * @param error - PostgrestError from Supabase
 * @returns User-friendly error message key for i18n
 */
export function parseSupabaseError(error: PostgrestError): string {
    const { code, message } = error;

    // Authentication-related codes
    if (code === 'PGRST301' || message.includes('JWT')) {
        return 'auth.errors.sessionExpired';
    }

    // Row-level security violations
    if (code === '42501') {
        return 'auth.errors.unauthorized';
    }

    // Not found
    if (code === 'PGRST116') {
        return 'errors.notFound';
    }

    // Rate limiting
    if (code === '429') {
        return 'errors.tooManyRequests';
    }

    // Generic server error
    if (code?.startsWith('5')) {
        return 'errors.serverError.description';
    }

    return 'errors.boundary.description';
}

/**
 * Extract a message from an unknown error type
 * 
 * @param error - Any error type
 * @returns The error message string
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message);
    }

    return 'An unexpected error occurred';
}

/**
 * Create a structured AppError from an unknown error
 * 
 * @param error - Any error type
 * @returns Structured AppError object
 */
export function createAppError(error: unknown): AppError {
    const message = getErrorMessage(error);

    if (isNetworkError(error) || isOffline()) {
        return {
            type: 'network',
            message: 'Network error. Please check your connection.',
            originalError: error,
        };
    }

    if (error instanceof Error) {
        // Check for auth-related errors
        if (message.toLowerCase().includes('auth') ||
            message.toLowerCase().includes('unauthorized') ||
            message.toLowerCase().includes('unauthenticated')) {
            return {
                type: 'auth',
                message: 'Authentication error. Please sign in again.',
                originalError: error,
            };
        }
    }

    return {
        type: 'unknown',
        message,
        originalError: error,
    };
}

/**
 * Log an error in development mode only
 * 
 * @param context - Context string describing where the error occurred
 * @param error - The error to log
 */
export function logError(context: string, error: unknown): void {
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${context}]`, error);

        if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack);
        }
    }
}

/**
 * Log with additional metadata for better debugging
 * 
 * @param context - Context string describing where the error occurred
 * @param error - The error to log
 * @param metadata - Additional metadata to log
 */
export function logErrorWithMetadata(
    context: string,
    error: unknown,
    metadata?: Record<string, unknown>
): void {
    if (process.env.NODE_ENV === 'development') {
        console.group(`[Error: ${context}]`);
        console.error('Error:', error);
        if (metadata) {
            console.error('Metadata:', metadata);
        }
        if (error instanceof Error && error.stack) {
            console.error('Stack:', error.stack);
        }
        console.groupEnd();
    }
}
