import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const load: PageLoad = async ({ data }) => {
  console.log('=== Page Load Start ===');
  console.log('Browser environment:', browser);
  console.log('Page load data:', {
    isAuthenticated: data.isAuthenticated,
    hasError: !!data.error
  });

  // Only handle auth state if in browser
  if (browser) {
    console.log('Checking auth state...');
    
    if (data.isAuthenticated) {
      console.log('User is authenticated');
      // You can add additional client-side setup here if needed
    } else {
      console.log('User is not authenticated');
      // Clear any stale auth state from localStorage
      localStorage.removeItem('user');
    }
  } else {
    console.log('Server-side load, skipping auth check');
  }
  
  console.log('=== Page Load End ===');
  return {
    ...data
  };
}; 