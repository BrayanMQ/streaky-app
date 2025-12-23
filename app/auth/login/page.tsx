'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Login content component that uses useSearchParams
 */
function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <div>
      <h1>Login Page</h1>
      <p>This page will be implemented in a future issue.</p>
      {redirectTo && (
        <p className="text-sm text-gray-600 mt-2">
          After login, you will be redirected to: {redirectTo}
        </p>
      )}
    </div>
  );
}

/**
 * Login page
 * 
 * This page will be fully implemented in a future issue.
 * For now, it's a placeholder that reads the redirectTo parameter
 * to be used when the login functionality is implemented.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div>
        <h1>Login Page</h1>
        <p>Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

