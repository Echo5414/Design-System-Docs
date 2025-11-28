import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { routes, DEFAULT_AUTH_REDIRECT } from '$lib/config/routes';

export const load: PageServerLoad = async ({ cookies, url, locals }) => {
  console.log('=== Server Load Start ===');
  console.log('URL:', url.toString());
  console.log('Search params:', Object.fromEntries(url.searchParams));
  console.log('Auth state:', locals.user);

  // Handle Strapi callback with tokens
  if (url.searchParams.has('access_token') && url.searchParams.has('jwt')) {
    console.log('Strapi callback detected with tokens');

    const jwt = url.searchParams.get('jwt');
    const githubToken = url.searchParams.get('access_token');

    if (!jwt || !githubToken) {
      console.error('Missing required tokens');
      return {
        error: 'Authentication failed. Missing required tokens.',
        isAuthenticated: false
      };
    }

    console.log('Setting cookies...');
    cookies.set('jwt', jwt, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    cookies.set('github', githubToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    cookies.set('is_authenticated', 'true', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    console.log('Cookies set:', { jwt: jwt.slice(0, 10) + '...', github: githubToken.slice(0, 10) + '...' });
    throw redirect(303, DEFAULT_AUTH_REDIRECT);
  }

  // Only redirect if explicitly on the login page
  if (locals.user?.isAuthenticated && url.pathname === routes.LOGIN) {
    throw redirect(303, DEFAULT_AUTH_REDIRECT);
  }

  console.log('=== Server Load End ===');
  return {
    error: null,
    isAuthenticated: locals.user?.isAuthenticated || false
  };
};