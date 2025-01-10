<script lang="ts">
  import { page } from '$app/stores';
  const user = $page.data.user;
</script>

<div class="container">
  <header class="page-header">
    <h1 class="page-title">Colors</h1>
    <p class="page-description">Color palette and usage guidelines for the design system.</p>
  </header>
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
</style> 