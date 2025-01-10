<script lang="ts">
  import { collections } from '$lib/stores/collections';
  import { goto } from '$app/navigation';

  function handleCollectionClick(id: string) {
    goto(`/collections/${id}`);
  }
</script>

<div class="container">
  <header class="page-header">
    <h1 class="page-title">Design System</h1>
    <p class="page-description">Manage your design tokens and collections</p>
  </header>

  <div class="collections-grid">
    {#each $collections as collection}
      <button
        class="collection-card"
        onclick={() => handleCollectionClick(collection.id)}
      >
        <h2 class="collection-title">{collection.name}</h2>
        <p class="collection-stats">
          {collection.items.length} categories
        </p>
      </button>
    {/each}
  </div>
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
</style> 