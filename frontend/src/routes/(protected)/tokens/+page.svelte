<script lang="ts">
  import TokenModal from '$lib/components/TokenModal.svelte';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { Collection, TokenData } from '$lib/types';

  let isTokenModalOpen = $state(false);
  let collections = $state<Collection[]>([]);

  function handleTokenSave(event: CustomEvent<TokenData>) {
    const token = event.detail;
    const id = crypto.randomUUID();
    
    // Here you would typically save to your backend
    console.log('Token created:', token);
    console.log('Updated collections:', collections);

    isTokenModalOpen = false;
  }
</script>

<div class="container">
  <div class="header">
    <h1>Design Tokens</h1>
    <button class="add-token-button" onclick={() => isTokenModalOpen = true}>
      Add Token
    </button>
  </div>

  <TokenModal 
    isOpen={isTokenModalOpen}
    on:close={() => isTokenModalOpen = false}
    on:save={handleTokenSave}
  />
</div>

<style>
  .container {
    padding: var(--spacing-6);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-6);
  }

  h1 {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  .add-token-button {
    padding: var(--spacing-2) var(--spacing-4);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .add-token-button:hover {
    background: var(--color-primary-dark);
  }
</style> 