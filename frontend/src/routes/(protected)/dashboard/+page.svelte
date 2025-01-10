<script lang="ts">
  import { page } from '$app/stores';
  
  // The user data is now available from the protected layout
  $: ({ user } = $page.data);
</script>

<div class="container">
  {#if user}
    <h1>Hello {user.username}!</h1>
  {:else}
    <div class="card loading-card">
      <p class="loading-text">Loading...</p>
    </div>
  {/if}
</div>

<style>
  .container {
    padding: var(--spacing-8);
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  h1 {
    color: var(--color-text-primary);
    font-size: var(--font-size-3xl);
    font-weight: 700;
  }

  .loading-card {
    width: auto;
    padding: var(--spacing-4) var(--spacing-6);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-lg);
    background-color: var(--color-card);
  }

  .loading-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }
</style> 