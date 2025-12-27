import { redirect } from 'next/navigation';

/**
 * Root page
 * 
 * Redirects to /auth/login as the main entry point of the application.
 */
export default function RootPage() {
  redirect('/auth/login');
}

