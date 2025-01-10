<script lang="ts">
  import { onMount } from 'svelte';
  import { collections } from '$lib/stores/collections';
  import '$lib/styles/global.css';

  let { children } = $props();
  let isLoading = $state(true);

  onMount(async () => {
    try {
      await collections.load();
    } catch(error) {
      console.error('Error loading collections:', error);
    } finally {
      isLoading = false;
    }
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