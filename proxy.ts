import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Route protection middleware
 * 
 * This middleware:
 * - Protects /dashboard and /habits routes requiring authentication
 * - Redirects unauthenticated users to /auth/login with redirectTo parameter
 * - Redirects authenticated users away from /auth/login to /dashboard
 * - Allows access to public routes (/auth/login when not authenticated, /auth/callback)
 * 
 * Runs in Edge Runtime, so it uses Edge-compatible APIs.
 */

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/habits'];

// Public routes (accessible without authentication)
const publicRoutes = ['/auth/login', '/auth/callback'];

/**
 * Validates that the redirect URL is safe (prevents open redirects)
 */
function isValidRedirectUrl(url: string): boolean {
  try {
    // Only allow relative routes that start with /
    if (!url.startsWith('/')) {
      return false;
    }

    // Don't allow external protocols
    if (url.includes('://')) {
      return false;
    }

    // Don't allow javascript: or data: URLs
    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Create response to allow cookie updates
  const response = NextResponse.next();

  // Create Supabase client to check authentication
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return Array.from(request.cookies.getAll());
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  const isAuthenticated = !error && user !== null;

  // If user is authenticated and trying to access /auth/login, redirect to dashboard
  if (isAuthenticated && pathname === '/auth/login') {
    // Check if there's a redirectTo parameter (from a previous redirect)
    // If so, redirect there instead of dashboard
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    const redirectPath = redirectTo && isValidRedirectUrl(redirectTo) ? redirectTo : '/dashboard';
    
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // If it's a protected route, verify authentication
  if (isProtectedRoute) {
    if (!isAuthenticated) {
      // Build login URL with redirectTo parameter
      const loginUrl = new URL('/auth/login', request.url);
      
      // Add redirectTo parameter if valid
      if (isValidRedirectUrl(pathname)) {
        loginUrl.searchParams.set('redirectTo', pathname);
      }

      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow access to public routes when not authenticated
  // Allow access to /auth/callback always (for OAuth flow)
  // Authenticated users accessing /auth/login are already handled above

  return response;
}

/**
 * Middleware matcher configuration
 * Only runs middleware on specific routes for better performance
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (files in the public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

