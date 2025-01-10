<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import '$lib/styles/tokens.css';

  const user = $page.data.user;
  let activeTab = 'create';
  let isConnected = false;
  let connectedRepo = '';
  let repoName = '';
  let repoUrl = '';
  let isCreatingRepo = false;

  async function handleCreateRepo(event: SubmitEvent) {
    event.preventDefault();
    isCreatingRepo = true;

    try {
      const jwt = localStorage.getItem('jwt');
      const githubToken = localStorage.getItem('github_token');
      
      if (!jwt || !githubToken) {
        throw new Error('Missing authentication tokens');
      }

      const response = await fetch('http://localhost:1337/api/github/create-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'GitHub-Token': githubToken,
        },
        body: JSON.stringify({
          name: repoName,
          description: 'Created via Design System Docs',
          private: false,
          auto_init: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || response.statusText);
      }

      const { data } = await response.json();
      console.log('Repository created:', data);
      connectedRepo = data.full_name;
      isConnected = true;
    } catch (error) {
      console.error('Error creating repository:', error);
      alert(error instanceof Error ? error.message : 'Failed to create repository');
    } finally {
      isCreatingRepo = false;
    }
  }

  function handleConnectRepo(event: SubmitEvent) {
    event.preventDefault();
    connectedRepo = repoUrl;
    isConnected = true;
  }

  function handleDisconnectRepo() {
    isConnected = false;
    connectedRepo = '';
    activeTab = 'create';
  }

  function handleLogout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('github_token');
    localStorage.removeItem('user');
    goto('/', { replaceState: true });
  }
</script>

<div class="container">
  <div class="card">
    <div class="card-header">
      <div class="header-content">
        <h2 class="card-title">Repository Setup</h2>
        <button 
          class="icon-button" 
          on:click={handleLogout}
          aria-label="Logout"
        >
          <svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
      <p class="card-description">
        Create a new repository or connect to an existing one to get started
      </p>
    </div>

    <div class="card-content">
      {#if !isConnected}
        <div class="tabs">
          <div class="tabs-list">
            <button
              class="tab-trigger"
              class:active={activeTab === 'create'}
              on:click={() => activeTab = 'create'}
            >
              Create New
            </button>
            <button
              class="tab-trigger"
              class:active={activeTab === 'connect'}
              on:click={() => activeTab = 'connect'}
            >
              Connect Existing
            </button>
          </div>

          {#if activeTab === 'create'}
            <form on:submit={handleCreateRepo} class="form">
              <div class="form-group">
                <label for="repoName" class="label">Repository Name</label>
                <input
                  id="repoName"
                  bind:value={repoName}
                  placeholder="e.g., design-system"
                  class="input"
                  required
                />
              </div>
              <button 
                type="submit" 
                class="submit-button"
                disabled={isCreatingRepo}
              >
                <svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {isCreatingRepo ? 'Creating...' : 'Create Repository'}
              </button>
            </form>
          {:else}
            <form on:submit={handleConnectRepo} class="form">
              <div class="form-group">
                <label for="repoUrl" class="label">Repository URL</label>
                <input
                  id="repoUrl"
                  bind:value={repoUrl}
                  placeholder="https://github.com/username/repo"
                  class="input"
                  required
                />
              </div>
              <button type="submit" class="submit-button">
                <svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Connect Repository
              </button>
            </form>
          {/if}
        </div>
      {:else}
        <div class="connected-repo">
          <div class="label">Connected Repository</div>
          <div class="repo-display">
            <svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <input
              value={connectedRepo}
              readonly
              class="repo-url"
            />
            <button 
              class="icon-link-button" 
              on:click={handleDisconnectRepo}
              aria-label="Disconnect repository"
            >
              <svg class="icon icon-link" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <svg class="icon icon-unlink" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span class="disconnect-text">Disconnect</span>
            </button>
          </div>
          <button 
            class="continue-button"
            on:click={() => goto('/dashboard')}
          >
            <span>Continue to Dashboard</span>
            <svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .container {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card {
    width: 100%;
    max-width: 28rem;
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-lg);
    background-color: var(--color-card);
    backdrop-filter: var(--blur-backdrop);
    padding: var(--spacing-8);
  }

  .card-header {
    margin-bottom: var(--spacing-8);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-4);
  }

  .card-title {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  .card-description {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }

  .tabs-list {
    display: flex;
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-6);
  }

  .tab-trigger {
    flex: 1;
    padding: var(--spacing-2) var(--spacing-4);
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: var(--transition-base);
  }

  .tab-trigger.active {
    background-color: var(--color-neutral-800);
    color: var(--color-text-primary);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .input {
    padding: var(--spacing-2) var(--spacing-3);
    background-color: var(--color-neutral-900);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
  }

  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3) var(--spacing-4);
    background-color: var(--color-emerald-600);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition-base);
  }

  .submit-button:hover {
    background-color: var(--color-emerald-700);
  }

  .icon {
    width: 20px;
    height: 20px;
  }

  .icon-button {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: var(--spacing-2);
    border-radius: var(--radius-sm);
    transition: var(--transition-base);
  }

  .icon-button:hover {
    background-color: var(--color-neutral-800);
    color: var(--color-text-primary);
  }

  .connected-repo {
    margin-top: var(--spacing-6);
  }

  .repo-display {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-card-border);
    background-color: var(--color-neutral-900);
  }

  .repo-url {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    padding: 0;
  }

  .repo-url:focus {
    outline: none;
  }

  .icon-link-button {
    position: relative;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: var(--spacing-2);
    border-radius: var(--radius-sm);
    transition: var(--transition-base);
    display: flex;
    align-items: center;
  }

  .icon-link-button:hover {
    color: var(--color-text-primary);
  }

  .icon-link-button .icon-unlink {
    display: none;
  }

  .icon-link-button:hover .icon-link {
    display: none;
  }

  .icon-link-button:hover .icon-unlink {
    display: block;
  }

  .disconnect-text {
    position: absolute;
    right: calc(100% + var(--spacing-2));
    background-color: var(--color-neutral-800);
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    opacity: 0;
    visibility: hidden;
    transition: var(--transition-base);
    white-space: nowrap;
  }

  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: var(--color-neutral-800);
  }

  .continue-button {
    width: 100%;
    margin-top: var(--spacing-4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3) var(--spacing-4);
    background-color: var(--color-emerald-600);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition-base);
  }

  .continue-button:hover {
    background-color: var(--color-emerald-700);
  }

  .continue-button svg {
    width: 16px;
    height: 16px;
  }
</style> 