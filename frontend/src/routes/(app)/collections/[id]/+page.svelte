<script lang="ts">
  import { page } from '$app/stores';
  import { collections } from '$lib/stores/collections';
  import type { Collection } from '$lib/types';

  let collection = $state<Collection | null>(null);

  $effect(() => {
    // Find the collection by ID
    collection = $collections.find(c => c.id === $page.params.id) || null;
  });
</script>

<div class="container">
  {#if !collection}
    <div class="error-state">
      <p class="error-text">Collection not found</p>
    </div>
  {:else}
    <header class="page-header">
      <h1 class="page-title">{collection.name}</h1>
      <p class="page-description">Manage your {collection.name.toLowerCase()} tokens</p>
    </header>

    <div class="categories-grid">
      {#each collection.items as category}
        <div class="category-card">
          <h2 class="category-title">{category.name}</h2>
          <p class="category-stats">
            {category.items?.length || 0} tokens
          </p>
        </div>
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

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-6);
  }

  .category-card {
    background-color: var(--color-card);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
  }

  .category-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0 0 var(--spacing-2) 0;
  }

  .category-stats {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  .error-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .error-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
  }
</style> 