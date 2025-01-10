import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }) => {
  console.error('Client error:', error);
  return {
    message: 'An unexpected error occurred'
  };
};

// Redirect root to dashboard
if (typeof window !== 'undefined' && window.location.pathname === '/') {
  window.location.href = '/dashboard';
} 