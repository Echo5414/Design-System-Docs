import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  console.log('=== Hook Start ===');
  console.log('URL:', event.url.toString());
  
  // Get auth state from cookies
  const jwt = event.cookies.get('jwt');
  const pathname = event.url.pathname;
  const isProtectedRoute = pathname.includes('/(protected)/') || 
                          pathname.startsWith('/setup') || 
                          pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/tokens');
  
  console.log('Auth state:', {
    hasJwt: !!jwt,
    isProtectedRoute,
    pathname
  });
  
  // Set auth state in locals
  event.locals.user = {
    isAuthenticated: !!jwt,
    // Only store returnTo for protected routes
    returnTo: isProtectedRoute ? pathname : undefined
  };
  
  // If accessing a protected route without auth, redirect to login
  if (isProtectedRoute && !jwt) {
    console.log('Protected route accessed without auth, redirecting to login');
    // Store the return URL in a cookie
    event.cookies.set('returnTo', pathname, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5 // 5 minutes expiry for security
    });
    
    // Clear any existing auth cookies
    event.cookies.delete('jwt', { path: '/' });
    event.cookies.delete('github_token', { path: '/' });
    event.cookies.delete('is_authenticated', { path: '/' });
    
    throw redirect(303, '/');
  }
  
  console.log('=== Hook End ===');
  const response = await resolve(event);
  return response;
}; 