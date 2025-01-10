<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { collections } from '$lib/stores/collections';
  import type { Collection, TokenItem, TokenValueType } from '$lib/types';

  let collection = $state<Collection | null>(null);
  let tokens = $state<TokenItem[]>([]);
  let isLoading = $state(true);

  function isColorValue(value: TokenValueType): value is string {
    return typeof value === 'string' && value.startsWith('#');
  }

  function isDimensionValue(value: TokenValueType): value is { value: string | number; unit: string } {
    return typeof value === 'object' && 'value' in value && 'unit' in value && !('font-family' in value);
  }

  function isTypographyValue(value: TokenValueType): value is {
    'font-family': string;
    'font-size': string;
    'font-weight': number;
    'line-height': string;
    'letter-spacing': string;
  } {
    return typeof value === 'object' && 'font-family' in value;
  }

  function getAllTokens(collection: Collection): TokenItem[] {
    const tokens: TokenItem[] = [];
    collection.items.forEach(category => {
      if (category.items) {
        tokens.push(...category.items);
      }
    });
    return tokens;
  }

  onMount(async () => {
    try {
      await collections.load();
      
      // Find the collection by ID
      const foundCollection = $collections.find(collection => 
        collection.id === $page.params.collection
      );

      if (foundCollection) {
        collection = foundCollection;
        // Get all tokens from the collection
        tokens = getAllTokens(collection);
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="container">
  {#if isLoading}
    <div class="loading-state">
      <p class="loading-text">Loading collection...</p>
    </div>
  {:else if !collection}
    <div class="error-state">
      <p class="error-text">Collection not found</p>
    </div>
  {:else}
    <header class="page-header">
      <h1 class="page-title">{collection.name}</h1>
      <p class="page-description">Manage your {collection.name.toLowerCase()} tokens</p>
    </header>

    <div class="token-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Preview</th>
            <th>Value</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Last Updated</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {#each tokens as token}
            <tr>
              <td>{token.name}</td>
              <td>
                {#if token.type === 'color' && isColorValue(token.value)}
                  <div 
                    class="color-preview" 
                    style="background-color: {token.value}"
                  ></div>
                {:else if token.type === 'typography' && isTypographyValue(token.value)}
                  <div class="typography-preview">
                    Aa
                  </div>
                {:else if token.type === 'dimension' && isDimensionValue(token.value)}
                  <div class="dimension-preview">
                    {token.value.value}{token.value.unit || ''}
                  </div>
                {:else}
                  {token.type}
                {/if}
              </td>
              <td>
                {#if typeof token.value === 'object'}
                  <pre>{JSON.stringify(token.value, null, 2)}</pre>
                {:else}
                  {token.value}
                {/if}
              </td>
              <td>{token.description}</td>
              <td>{token.tokenData?.createdAt || '-'}</td>
              <td>{token.tokenData?.updatedAt || '-'}</td>
              <td>{token.tokenData?.source || '-'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
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

  .token-table {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-card-border);
  }

  th, td {
    padding: var(--spacing-4);
    text-align: left;
    border-bottom: 1px solid var(--color-card-border);
  }

  th {
    font-weight: 500;
    color: var(--color-text-muted);
    background-color: var(--color-neutral-900);
  }

  td {
    color: var(--color-text-primary);
  }

  .color-preview {
    width: 40px;
    height: 24px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-card-border);
  }

  .typography-preview {
    font-family: var(--font-family-base);
    font-size: var(--font-size-xl);
    color: var(--color-text-primary);
  }

  .dimension-preview {
    font-family: var(--font-family-mono);
    color: var(--color-text-primary);
  }

  pre {
    margin: 0;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    white-space: pre-wrap;
  }

  .loading-state,
  .error-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .loading-text,
  .error-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
  }
</style> 