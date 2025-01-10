<script lang="ts">
  import { collections } from '$lib/stores/collections';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let isLoading = $state(true);
  let user = $state<any>(null);

  onMount(() => {
    if (browser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('user');
          goto('/', { replaceState: true });
        }
      }
      isLoading = false;
    }
  });

  function handleCollectionClick(id: string) {
    goto(`/collections/${id}`);
  }

  function handleLoginClick() {
    goto('/');
  }
</script>

<div class="container">
  {#if isLoading}
    <div class="loading-card">
      <p class="loading-text">Loading...</p>
    </div>
  {:else if !user}
    <div class="error-card">
      <p class="error-text">Please log in to view collections</p>
      <button class="login-button" on:click={handleLoginClick}>
        Go to Login
      </button>
    </div>
  {:else}
    <header class="page-header">
      <h1 class="page-title">Design System</h1>
      <p class="page-description">Manage your design tokens and collections</p>
    </header>

    <div class="collections-grid">
      {#each $collections as collection}
        <button
          class="collection-card"
          on:click={() => handleCollectionClick(collection.id)}
        >
          <h2 class="collection-title">{collection.name}</h2>
          <p class="collection-stats">
            {collection.items.length} categories
          </p>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-6);
  }

  .page-header {
    margin-bottom: var(--spacing-8);
  }

  .page-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin: 0 0 var(--spacing-2) 0;
  }

  .page-description {
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
    margin: 0;
  }

  .collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-6);
  }

  .collection-card {
    all: unset;
    cursor: pointer;
    background-color: var(--color-card);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    transition: var(--transition-base);
  }

  .collection-card:hover {
    background-color: var(--color-card-hover);
    transform: translateY(-2px);
  }

  .collection-card:focus-visible {
    outline: 2px solid var(--color-emerald-600);
    outline-offset: 2px;
  }

  .collection-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0 0 var(--spacing-2) 0;
  }

  .collection-stats {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  .loading-card,
  .error-card {
    width: auto;
    padding: var(--spacing-4) var(--spacing-6);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-lg);
    background-color: var(--color-card);
    text-align: center;
  }

  .loading-text,
  .error-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0 0 var(--spacing-4) 0;
  }

  .login-button {
    all: unset;
    cursor: pointer;
    padding: var(--spacing-2) var(--spacing-4);
    background-color: var(--color-emerald-600);
    color: white;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    transition: var(--transition-base);
  }

  .login-button:hover {
    background-color: var(--color-emerald-700);
  }

  .login-button:focus-visible {
    outline: 2px solid var(--color-emerald-600);
    outline-offset: 2px;
  }
</style> 