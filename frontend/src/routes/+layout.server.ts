import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const jwt = cookies.get('jwt');
  const returnTo = cookies.get('returnTo');
  
  return {
    isAuthenticated: !!jwt,
    returnTo
  };
}; 