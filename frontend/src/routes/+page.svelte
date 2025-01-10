<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { routes, DEFAULT_AUTH_REDIRECT } from '$lib/config/routes';

  let isLoggingIn = $state(false);
  let loading = $state(false);
  let error = $state<string | null>($page.data.error || null);

  function handleGitHubLogin() {
    isLoggingIn = true;
    console.log('Starting GitHub login...');
    
    // Clear any existing auth state
    localStorage.removeItem('user');
    
    const returnUrl = encodeURIComponent(`${window.location.origin}${routes.LOGIN}`);
    const loginUrl = `http://localhost:1337/api/connect/github?returnTo=${returnUrl}`;
    
    console.log('Redirecting to:', loginUrl);
    window.location.href = loginUrl;
  }

  onMount(async () => {
    console.log('=== onMount ===');
    loading = true;
    
    try {
      // Check authentication state
      console.log('Auth state:', {
        isAuthenticated: $page.data.isAuthenticated,
        hasError: !!$page.data.error
      });
      
      if ($page.data.isAuthenticated) {
        console.log('User is authenticated, redirecting to:', DEFAULT_AUTH_REDIRECT);
        await goto(DEFAULT_AUTH_REDIRECT, { replaceState: true });
      }
    } catch (e) {
      console.error('Error in auth flow:', e);
      error = 'Authentication failed. Please try again.';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="login-container">
    <div class="card loading-card">
      <p class="loading-text">Loading...</p>
    </div>
  </div>
{:else}
  <div class="login-container">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Design System Docs</h2>
        <p class="card-description">
          Sign in to your account to access the design system documentation
        </p>
      </div>
      <div class="card-content">
        {#if error}
          <div class="error-message">
            {error}
          </div>
        {/if}
        <button 
          class="github-button"
          onclick={handleGitHubLogin}
          disabled={isLoggingIn}
        >
          <svg class="github-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          {isLoggingIn ? 'Connecting...' : 'Continue with GitHub'}
        </button>
        <p class="terms-text">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .login-container {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card {
    width: 100%;
    max-width: 28rem;
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-lg);
    background-color: var(--color-card);
    backdrop-filter: var(--blur-backdrop);
    padding: var(--spacing-8);
  }

  .loading-card {
    width: auto;
    padding: var(--spacing-4) var(--spacing-6);
  }

  .loading-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  .card-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .card-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--color-text-primary);
    margin: 0 0 1rem 0;
  }

  .card-description {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .github-button {
    width: 100%;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: var(--color-neutral-900);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: var(--transition-base);
  }

  .github-button:hover {
    background-color: var(--color-neutral-800);
    color: white;
  }

  .github-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .github-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .terms-text {
    text-align: center;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin: 1rem 0 0 0;
  }

  .error-message {
    color: var(--color-error);
    font-size: var(--font-size-sm);
    text-align: center;
    padding: var(--spacing-2);
    background-color: var(--color-error-bg);
    border-radius: var(--radius-sm);
  }
</style> 