import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
 * 
 * Performance: Uses lightweight cookie checks instead of network requests to Supabase.
 * Full authentication validation happens in server components if needed.
 */

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/habits'];

// Public routes (accessible without authentication)
const publicRoutes = ['/auth/login', '/auth/callback'];

/**
 * Extracts the Supabase project reference from the Supabase URL
 * 
 * @param supabaseUrl - The Supabase URL (e.g., https://<project-ref>.supabase.co)
 * @returns The project reference, or null if the URL format is invalid
 */
function extractProjectRef(supabaseUrl: string): string | null {
  try {
    const url = new URL(supabaseUrl);
    // Extract project ref from hostname (e.g., abc123xyz.supabase.co -> abc123xyz)
    const hostnameParts = url.hostname.split('.');
    if (hostnameParts.length >= 2 && hostnameParts[1] === 'supabase') {
      return hostnameParts[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Checks if Supabase session cookies are present, indicating potential authentication
 * 
 * This is a lightweight check that doesn't validate the tokens. It only checks for
 * their presence. Actual validation happens in server components.
 * 
 * @param request - The Next.js request object
 * @param projectRef - The Supabase project reference
 * @returns true if session cookies are present, false otherwise
 */
function hasSessionCookie(request: NextRequest, projectRef: string): boolean {
  // Supabase SSR stores the access token in a cookie with this pattern
  const accessTokenCookieName = `sb-${projectRef}-auth-token`;
  
  // Check for standard cookie
  const accessToken = request.cookies.get(accessTokenCookieName);
  if (accessToken && accessToken.value) {
    return true;
  }
  
  // Check for chunked cookies (if token is large, Supabase may split it)
  // Format: sb-<project-ref>-auth-token.0, .1, .2, etc.
  let chunkIndex = 0;
  let hasChunkedCookies = false;
  
  while (chunkIndex < 10) { // Reasonable limit for chunked cookies
    const chunkCookieName = `${accessTokenCookieName}.${chunkIndex}`;
    const chunkCookie = request.cookies.get(chunkCookieName);
    
    if (chunkCookie && chunkCookie.value) {
      hasChunkedCookies = true;
    } else if (hasChunkedCookies) {
      // We found chunks before, but this one is missing - stop searching
      break;
    } else {
      // No chunks found yet, but continue checking
      chunkIndex++;
      continue;
    }
    
    chunkIndex++;
  }
  
  return hasChunkedCookies;
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

  // Get Supabase URL to extract project ref for cookie checking
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  // Extract project ref and check for session cookies (lightweight check)
  const projectRef = extractProjectRef(supabaseUrl);
  const hasSession = projectRef ? hasSessionCookie(request, projectRef) : false;

  // If session cookies are present and trying to access /auth/login, redirect to dashboard
  if (hasSession && pathname === '/auth/login') {
    // Check if there's a redirectTo parameter (from a previous redirect)
    // If so, redirect there instead of dashboard
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    const redirectPath = redirectTo && isValidRedirectUrl(redirectTo) ? redirectTo : '/dashboard';
    
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // If it's a protected route, verify authentication (via cookie check)
  if (isProtectedRoute) {
    if (!hasSession) {
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

  return NextResponse.next();
}

/**
 * Middleware matcher configuration
 * Optimized to only run on routes that need protection or authentication checks
 */
export const config = {
  matcher: [
    /*
     * Match routes that require authentication checks:
     * - /dashboard and all sub-routes
     * - /auth/login and /auth/callback (for redirect logic)
     * 
     * Excludes:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico and other static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

