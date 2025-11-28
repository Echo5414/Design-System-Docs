import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

// Note: We need to explicitly type this as RequestHandler
export const POST = (async ({ cookies }) => {
  // Clear all auth cookies with proper options
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const
  };

  // Clear the cookies we set during GitHub OAuth login
  cookies.delete('jwt', cookieOptions);
  cookies.delete('github_token', cookieOptions);
  cookies.delete('is_authenticated', { 
    ...cookieOptions, 
    httpOnly: false 
  });
  cookies.delete('returnTo', cookieOptions); // Also clear any stored returnTo path

  return json({ success: true });
}) satisfies RequestHandler; 