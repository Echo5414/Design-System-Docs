<script lang="ts">
  import type { TokenItem as Token } from '$lib/types';
  import TokenModal from './TokenModal.svelte';
  import { page } from '$app/stores';

  export let tokens: Token[] = [];
  export let title: string = '';
  export let description: string = '';

  let isModalOpen = false;

  function isColorValue(value: any): value is string {
    return typeof value === 'string' && value.startsWith('#');
  }

  function isDimensionValue(value: any): value is { value: string | number; unit: string } {
    return typeof value === 'object' && 'value' in value && 'unit' in value && !('font-family' in value);
  }

  function isTypographyValue(value: any): value is {
    'font-family': string;
    'font-size': string;
    'font-weight': number;
    'line-height': string;
    'letter-spacing': string;
  } {
    return typeof value === 'object' && 'font-family' in value;
  }

  function openModal() {
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }
</script>

<div class="token-view">
  <header class="header">
    <div class="header-content">
      <div>
        <h2>{title}</h2>
        <p class="description">{description}</p>
      </div>
      {#if $page.params.collectionId && $page.params.categoryId}
        <button class="add-button" on:click={openModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Token
        </button>
      {/if}
    </div>
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
</div>

{#if isModalOpen && $page.params.collectionId && $page.params.categoryId}
  <TokenModal
    isOpen={isModalOpen}
    collectionId={$page.params.collectionId}
    categoryId={$page.params.categoryId}
    on:close={closeModal}
    on:save={closeModal}
  />
{/if}

<style>
  .token-view {
    width: 100%;
  }

  .header {
    margin-bottom: var(--spacing-8);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  h2 {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .description {
    color: var(--color-text-secondary);
    margin: var(--spacing-2) 0 0 0;
  }

  .add-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2) var(--spacing-4);
    background-color: var(--color-emerald-600);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--transition-base);
  }

  .add-button:hover {
    background-color: var(--color-emerald-700);
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
</style> 