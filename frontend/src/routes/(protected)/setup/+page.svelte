<script lang="ts">
	import { goto } from '$app/navigation';
	import { routes } from '$lib/config/routes';
	import '$lib/styles/tokens.css';

	let activeTab = $state('create');
	let isConnected = $state(false);
	let connectedRepo = $state('');
	let repoName = $state('');
	let repoUrl = $state('');
	let isCreatingRepo = $state(false);
	let repositories = $state<any[]>([]);
	let isLoadingRepos = $state(false);
	let searchFilter = $state('');

	$effect(() => {
		if (activeTab === 'connect') {
			fetchRepositories();
		}
	});

	async function fetchRepositories() {
		isLoadingRepos = true;
		try {
			const response = await fetch('http://localhost:1337/api/github/repos', {
				method: 'GET',
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Failed to fetch repositories');
			}

			const { data } = await response.json();
			repositories = data;
		} catch (error) {
			console.error('Error fetching repositories:', error);
		} finally {
			isLoadingRepos = false;
		}
	}

	let filteredRepos = $derived.by(() => {
		return repositories.filter(
			(repo) =>
				repo.full_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
				repo.description?.toLowerCase().includes(searchFilter.toLowerCase())
		);
	});

	async function handleCreateRepo(event: SubmitEvent) {
		event.preventDefault();
		isCreatingRepo = true;

		try {
			const response = await fetch('http://localhost:1337/api/github/create-repo', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: repoName,
					description: 'Created via Design System Docs',
					private: false,
					auto_init: true
				}),
				credentials: 'include' // Use httpOnly cookies
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error?.message || response.statusText);
			}

			const { data: responseData } = await response.json();
			console.log('Repository created:', responseData);

			// Connect to the newly created repo
			await connectToDesignSystem(responseData);
		} catch (error) {
			console.error('Error creating repository:', error);
			alert(error instanceof Error ? error.message : 'Failed to create repository');
		} finally {
			isCreatingRepo = false;
		}
	}

	async function connectToDesignSystem(repo: any) {
		try {
			const response = await fetch('http://localhost:1337/api/design-system/connect', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					repoName: repo.name,
					repoOwner: repo.owner.login,
					branch: repo.default_branch
				}),
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Failed to connect design system');
			}

			const { data } = await response.json();
			console.log('Connect response data:', data);

			// Store ID and redirect
			localStorage.setItem('activeDesignSystemId', data.documentId || data.id);
			goto(routes.DASHBOARD);
		} catch (error) {
			console.error('Error connecting design system:', error);
			alert('Failed to connect design system');
		}
	}

	function handleDisconnectRepo() {
		isConnected = false;
		connectedRepo = '';
		activeTab = 'create';
	}

	async function handleLogout() {
		try {
			// Call Strapi's logout endpoint to clear httpOnly cookies
			const response = await fetch('http://localhost:1337/api/auth/logout', {
				method: 'GET',
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Failed to logout');
			}

			// Clear any client-side state
			localStorage.removeItem('user');

			// Redirect to login
			goto(routes.LOGIN, { replaceState: true });
		} catch (error) {
			console.error('Error logging out:', error);
		}
	}
</script>

<div class="container">
	<div class="card">
		<div class="card-header">
			<div class="header-content">
				<h2 class="card-title">Repository Setup</h2>
				<button class="icon-button" onclick={handleLogout} aria-label="Logout">
					<svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
						/>
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
							onclick={() => (activeTab = 'create')}
						>
							Create New
						</button>
						<button
							class="tab-trigger"
							class:active={activeTab === 'connect'}
							onclick={() => (activeTab = 'connect')}
						>
							Connect Existing
						</button>
					</div>

					{#if activeTab === 'create'}
						<form onsubmit={handleCreateRepo} class="form">
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
							<button type="submit" class="submit-button" disabled={isCreatingRepo}>
								<svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4v16m8-8H4"
									/>
								</svg>
								{isCreatingRepo ? 'Creating...' : 'Create Repository'}
							</button>
						</form>
					{:else}
						<div class="form">
							<div class="form-group">
								<label for="searchRepo" class="label">Search Repositories</label>
								<input
									id="searchRepo"
									bind:value={searchFilter}
									placeholder="Type to filter..."
									class="input"
								/>
							</div>

							{#if isLoadingRepos}
								<div class="loading-state">Loading repositories...</div>
							{:else if filteredRepos.length > 0}
								<div class="repo-list">
									{#each filteredRepos as repo}
										<button
											type="button"
											class="repo-item"
											onclick={() => connectToDesignSystem(repo)}
										>
											<div class="repo-info">
												<span class="repo-name">{repo.name}</span>
												{#if repo.description}
													<span class="repo-desc">{repo.description}</span>
												{/if}
												<span class="repo-updated"
													>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span
												>
											</div>
										</button>
									{/each}
								</div>
							{:else}
								<div class="empty-state">No repositories found</div>
							{/if}
						</div>
					{/if}
				</div>
			{:else}
				<div class="connected-repo">
					<div class="label">Connected Repository</div>
					<div class="repo-display">
						<svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
							/>
						</svg>
						<input value={connectedRepo} readonly class="repo-url" />
						<button
							class="icon-link-button"
							onclick={handleDisconnectRepo}
							aria-label="Disconnect repository"
						>
							<svg class="icon icon-link" viewBox="0 0 24 24" stroke="currentColor" fill="none">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
								/>
							</svg>
							<svg class="icon icon-unlink" viewBox="0 0 24 24" stroke="currentColor" fill="none">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
								/>
							</svg>
							<span class="disconnect-text">Disconnect</span>
						</button>
					</div>
					<button class="continue-button" onclick={() => goto(routes.DASHBOARD)}>
						<span>Continue to Dashboard</span>
						<svg class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 12h14M12 5l7 7-7 7"
							/>
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

	.repo-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
		max-height: 400px;
		overflow-y: auto;
		padding: var(--spacing-2) 0;
	}

	/* Custom scrollbar styling */
	.repo-list::-webkit-scrollbar {
		width: 8px;
	}

	.repo-list::-webkit-scrollbar-track {
		background: #171717;
		border-radius: 4px;
	}

	.repo-list::-webkit-scrollbar-thumb {
		background: #404040;
		border-radius: 4px;
		transition: background 0.2s ease;
	}

	.repo-list::-webkit-scrollbar-thumb:hover {
		background: #55dd72;
	}

	/* Firefox scrollbar */
	.repo-list {
		scrollbar-width: thin;
		scrollbar-color: #404040 #171717;
	}

	.repo-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-3);
		padding: var(--spacing-3);
		background-color: var(--color-neutral-900);
		border: 1px solid var(--color-card-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: var(--transition-base);
		text-align: left;
		width: 100%;
	}

	.repo-item:hover {
		background-color: var(--color-neutral-800);
		border-color: var(--color-emerald-600);
	}

	.repo-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		flex: 1;
	}

	.repo-name {
		font-weight: 600;
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
	}

	.repo-desc {
		color: var(--color-text-secondary);
		font-size: var(--font-size-xs);
	}

	.repo-updated {
		color: var(--color-text-secondary);
		font-size: var(--font-size-xs);
		opacity: 0.7;
	}

	.loading-state,
	.empty-state {
		padding: var(--spacing-6);
		text-align: center;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}
</style>
