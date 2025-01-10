export const routes = {
  // Public routes
  LOGIN: '/',
  
  // Protected routes
  SETUP: '/setup',
  DASHBOARD: '/dashboard',
  TOKENS: '/tokens'
} as const;

// Default route after authentication if no returnTo is specified
export const DEFAULT_AUTH_REDIRECT = routes.SETUP; 