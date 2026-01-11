'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
    /** Child components to render */
    children: ReactNode;
    /** Optional custom fallback component */
    fallback?: ReactNode;
    /** Callback when an error is caught */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    /** Callback when reset is triggered */
    onReset?: () => void;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * A React Error Boundary that catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the application.
 * 
 * Features:
 * - Catches errors anywhere in the child component tree
 * - Displays user-friendly fallback UI
 * - Provides reset functionality to recover from errors
 * - Logs errors in development mode
 * - Supports custom fallback components
 * 
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => console.error(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 * 
 * @example With custom fallback
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log error in development mode
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error);
            console.error('Error info:', errorInfo);
        }

        // Call optional onError callback
        this.props.onError?.(error, errorInfo);
    }

    resetErrorBoundary = (): void => {
        this.props.onReset?.();
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Render custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Render default ErrorFallback
            return (
                <ErrorFallback
                    error={this.state.error ?? undefined}
                    resetErrorBoundary={this.resetErrorBoundary}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 * 
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent);
 * ```
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    const ComponentWithErrorBoundary: React.FC<P> = (props) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );

    ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

    return ComponentWithErrorBoundary;
}
