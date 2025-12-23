'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Login page
 * 
 * This page will be fully implemented in a future issue.
 * For now, it's a placeholder that reads the redirectTo parameter
 * to be used when the login functionality is implemented.
 */
export default function LoginPage() {
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

