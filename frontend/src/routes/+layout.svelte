<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '$lib/styles/global.css';
  import '$lib/styles/tokens.css';

  let { children } = $props();
  let isLoading = $state(false);

  // Only load collections for protected routes
  $effect(() => {
    // Check if we're on a protected route by looking for (protected) in the pathname
    const isProtectedRoute = $page.url.pathname.includes('(protected)');
    if (!isProtectedRoute) return;

    isLoading = true;
    import('$lib/stores/collections').then((module) => {
      module.collectionsStore.load()
        .catch((error: Error) => {
          console.error('Error loading collections:', error);
          // If we get a 401, we're not authenticated, redirect to login
          if (error.message.includes('401')) {
            window.location.href = '/';
          }
        })
        .finally(() => {
          isLoading = false;
        });
    });
  });
</script>

{#if isLoading}
  <div class="loading">
    <p>Loading...</p>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
  }
</style>