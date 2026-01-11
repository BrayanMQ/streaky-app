'use client';

import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

/**
 * Global Error page for handling critical errors in the root layout
 * 
 * This is Next.js App Router's global-error.tsx convention that acts as
 * a catch-all error boundary for the entire application, including the
 * root layout.
 * 
 * Important: This component must include its own <html> and <body> tags
 * because it replaces the root layout when activated.
 * 
 * Note: Cannot use providers/i18n here since they may have failed.
 * Uses inline styles as a fallback.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{
                margin: 0,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                backgroundColor: '#f5f5f5',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    maxWidth: '400px',
                    width: '100%',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <AlertTriangle style={{ width: '40px', height: '40px', color: '#dc2626' }} />
                    </div>

                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#111827',
                        marginBottom: '0.5rem'
                    }}>
                        Something went wrong
                    </h1>

                    <p style={{
                        color: '#6b7280',
                        marginBottom: '1.5rem',
                        fontSize: '0.95rem'
                    }}>
                        We're sorry, but something unexpected happened. Please try again.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <div style={{
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <p style={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                wordBreak: 'break-all'
                            }}>
                                {error.message}
                            </p>
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        <button
                            onClick={() => reset()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#374151'
                            }}
                        >
                            <RotateCcw style={{ width: '16px', height: '16px' }} />
                            Try Again
                        </button>
                        <a
                            href="/dashboard"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                backgroundColor: '#3b82f6',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'white',
                                textDecoration: 'none'
                            }}
                        >
                            <Home style={{ width: '16px', height: '16px' }} />
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
