'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * Providers component that wraps the app with React Query
 * 
 * This component:
 * - Creates a QueryClient instance with optimized defaults
 * - Provides the QueryClient to all child components via QueryClientProvider
 * - Includes React Query Devtools in development mode
 * 
 * Usage:
 * ```tsx
 * // In app/layout.tsx
 * import { Providers } from '@/components/Providers'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance with useState to ensure it's only created once
  // This prevents creating a new client on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false, // Disable automatic refetch on window focus
            retry: 1, // Retry failed requests once
          },
          mutations: {
            retry: false, // Don't retry mutations by default
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

