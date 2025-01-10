<script lang="ts">
  import { page } from '$app/stores';
</script>

{#if $page.error}
  <div class="container">
    <div class="error-card">
      <h1>Error {$page.status}</h1>
      <p>{$page.error.message}</p>
      <button class="back-button" on:click={() => history.back()}>Go Back</button>
    </div>
  </div>
{/if}

<style>
  .container {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-4);
  }

  .error-card {
    background: var(--color-card);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  h1 {
    color: var(--color-text-primary);
    font-size: var(--font-size-2xl);
    margin: 0 0 var(--spacing-4) 0;
  }

  p {
    color: var(--color-text-secondary);
    margin: 0 0 var(--spacing-6) 0;
  }

  .back-button {
    background: var(--color-emerald-600);
    color: white;
    border: none;
    padding: var(--spacing-2) var(--spacing-4);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition-base);
  }

  .back-button:hover {
    background: var(--color-emerald-700);
  }
</style> 