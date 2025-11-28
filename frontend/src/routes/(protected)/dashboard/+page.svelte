<!-- Main dashboard showing all tokens -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { routes } from '$lib/config/routes';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TopNav from '$lib/components/TopNav.svelte';
  import TokenTable from '$lib/components/TokenTable.svelte';
  import { collectionsStore } from '$lib/stores/collections';
  import type { TokenItem } from '$lib/types';
  import { onMount } from 'svelte';

  let tokens: TokenItem[] = [];
  let pageTitle = 'All Tokens';
  let pageDescription = 'View all design tokens across collections';
  let isLoading = true;

  onMount(async () => {
    try {
      await collectionsStore.load();
      isLoading = false;
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  });

  $: {
    // Show all tokens from all collections and categories
    tokens = $collectionsStore.flatMap(c => 
      c.items.flatMap(item => item.items || [])
    );
  }
</script>

<div class="dashboard">
  <Sidebar />
  
  <div class="main-content">
    <TopNav />
    
    <main class="content">
      {#if isLoading}
        <div class="loading">Loading collections...</div>
      {:else}
        <TokenTable {tokens} />
      {/if}
    </main>
  </div>
</div>

<style>
  .dashboard {
    min-height: 100vh;
    height: 100vh;
    background: var(--color-background);
    display: flex;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .content {
    flex: 1;
    padding: var(--spacing-6);
    overflow-y: auto;
  }

  .loading {
    color: var(--color-text-secondary);
  }
</style> 