import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Route protection middleware
 * 
 * This middleware:
 * - Protects /dashboard and /habits routes requiring authentication
 * - Redirects unauthenticated users to /auth/login with redirectTo parameter
 * - Allows access to public routes (/auth/login, /auth/callback)
 * 
 * Runs in Edge Runtime, so it uses Edge-compatible APIs.
 */

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/habits'];

// Public routes (accessible without authentication)
const publicRoutes = ['/auth/login', '/auth/callback'];

/**
 * Creates a Supabase client for the middleware (Edge Runtime compatible)
 * and configures the session from the request cookies
 */
function createMiddlewareClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Create client with Edge Runtime configuration
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Pass all cookies from the request to the client
        Cookie: request.headers.get('cookie') || '',
      },
    },
  });

  return supabase;
}

/**
 * Checks if the user is authenticated
 * 
 * In Edge Runtime, we verify authentication by reading cookies
 * that Supabase sets. If the client uses localStorage (like in the browser),
 * cookies may not be available in the middleware.
 * 
 * For more robust verification, we attempt to get the user
 * using the access token if available in cookies.
 */
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return false;

    // Extract the project ref from the URL to identify Supabase cookies
    // URL format: https://xxxxx.supabase.co or https://xxxxx.supabase.io
    const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.(co|io)/);
    const projectRef = urlMatch?.[1];
    
    if (!projectRef) {
      // If we can't extract the project ref, try to verify another way
      return await verifyAuthWithClient(request);
    }

    // Look for Supabase cookies
    // Supabase may use different cookie formats depending on configuration
    const possibleCookieNames = [
      `sb-${projectRef}-auth-token`,
      `sb-${projectRef}-auth-token-code-verifier`,
    ];

    // Check if any authentication cookie exists
    const hasAuthCookie = possibleCookieNames.some(cookieName => {
      const cookie = request.cookies.get(cookieName);
      return cookie !== undefined && cookie.value !== '';
    });

    // If there are no cookies, the user is not authenticated
    if (!hasAuthCookie) {
      return false;
    }

    // If there are cookies, verify with Supabase client
    return await verifyAuthWithClient(request);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Verifies authentication using the Supabase client
 */
async function verifyAuthWithClient(request: NextRequest): Promise<boolean> {
  try {
    const supabase = createMiddlewareClient(request);
    
    // Attempt to get the current user
    // This will work if there's a valid token in cookies or headers
    const { data: { user }, error } = await supabase.auth.getUser();

    // If there's a user without errors, they are authenticated
    return !error && user !== null;
  } catch (error) {
    // If there's an error verifying, assume not authenticated
    return false;
  }
}

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If it's a protected route, verify authentication
  if (isProtectedRoute) {
    const authenticated = await isAuthenticated(request);

    if (!authenticated) {
      // Build login URL with redirectTo parameter
      const loginUrl = new URL('/auth/login', request.url);
      
      // Add redirectTo parameter if valid
      if (isValidRedirectUrl(pathname)) {
        loginUrl.searchParams.set('redirectTo', pathname);
      }

      return NextResponse.redirect(loginUrl);
    }
  }

  // If it's a public route and the user is authenticated,
  // we could redirect to dashboard, but for now we allow access
  // (this can be changed based on requirements)

  return NextResponse.next();
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

