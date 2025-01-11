<script lang="ts">
  import { goto } from '$app/navigation';
  import { routes } from '$lib/config/routes';

  export let title = 'Design System';

  async function handleLogout() {
    document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'github_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'is_authenticated=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    goto(routes.LOGIN);
  }
</script>

<nav class="nav">
  <div class="nav-content">
    <div class="nav-brand">
      <h1>{title}</h1>
    </div>
    <div class="nav-actions">
      <button 
        class="icon-button" 
        onclick={handleLogout}
        aria-label="Logout"
      >
        <svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </div>
</nav>

<style>
  .nav {
    background: var(--color-card);
    border-bottom: 1px solid var(--color-card-border);
    padding: var(--spacing-4);
    flex-shrink: 0;
  }

  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand h1 {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .icon-button {
    background: none;
    border: none;
    padding: var(--spacing-2);
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: color var(--transition-base);
  }

  .icon-button:hover {
    color: var(--color-text-primary);
  }

  .icon {
    width: 24px;
    height: 24px;
  }
</style> 