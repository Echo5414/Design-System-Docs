<!-- Reuse the dashboard layout but with category-specific logic -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { routes } from '$lib/config/routes';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TopNav from '$lib/components/TopNav.svelte';
  import TokenTable from '$lib/components/TokenTable.svelte';
  import { collectionsStore } from '$lib/stores/collections';
  import type { TokenItem } from '$lib/types';
  import { onMount } from 'svelte';

  let tokens: TokenItem[] = [];
  let pageTitle = '';
  let pageDescription = '';
  let isLoading = true;

  onMount(async () => {
    try {
      await collectionsStore.load();
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      isLoading = false;
    }
  });

  $: {
    const collection = $collectionsStore.find(c => c.id === $page.params.collectionId);
    if (collection) {
      const category = collection.items.find(item => item.id === $page.params.categoryId);
      if (category) {
        pageTitle = `${collection.name} / ${category.name}`;
        pageDescription = category.description || '';
        tokens = category.items || [];
      }
    }
  }
</script>

<div class="dashboard">
  <Sidebar />
  
  <div class="main-content">
    <TopNav title={pageTitle} />
    
    <main class="content">
      {#if isLoading}
        <div class="loading">Loading collections...</div>
      {:else}
        <TokenTable {tokens} title={pageTitle} description={pageDescription} />
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
