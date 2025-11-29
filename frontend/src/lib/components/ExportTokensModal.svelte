<script lang="ts">
	import { collectionsStore } from '$lib/stores/collections';
	import type { Collection } from '$lib/types';

	let { isOpen = $bindable(false) } = $props();

	let jsonOutput = $derived.by(() => {
		const collections: Collection[] = $collectionsStore;
		if (!collections || collections.length === 0) return '{}';

		const tokens: any = {};

		collections.forEach((collection: Collection) => {
			const collectionKey = collection.name;
			if (!tokens[collectionKey]) tokens[collectionKey] = {};

			collection.items.forEach((category: any) => {
				if (!category.items) return;

				// Use group name as a nesting level when provided; otherwise place tokens at collection root.
				const groupName = category.name;
				const targetRoot =
					groupName && groupName !== 'Ungrouped'
						? (tokens[collectionKey][groupName] = tokens[collectionKey][groupName] || {})
						: tokens[collectionKey];

				category.items.forEach((token: any) => {
					// Create nested structure based on token name segments
					const pathParts = token.name.split('.');
					let current = targetRoot;

					for (let i = 0; i < pathParts.length - 1; i++) {
						if (!current[pathParts[i]]) {
							current[pathParts[i]] = {};
						}
						current = current[pathParts[i]];
					}

					const tokenName = pathParts[pathParts.length - 1];
					current[tokenName] = {
						$type: token.type,
						$value: token.value,
						...(token.description && { $description: token.description })
					};
				});
			});
		});

		return JSON.stringify(tokens, null, 2);
	});

	function handleClose() {
		isOpen = false;
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(jsonOutput);
			alert('Design tokens copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="modal-overlay"
		role="button"
		tabindex="0"
		aria-label="Close modal"
		onclick={handleClose}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				handleClose();
			}
		}}
	>
		<div
			class="modal"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<div class="header-content">
					<h2>Design Tokens Export</h2>
					<p class="spec-info">W3C Design Tokens Format (v1.0)</p>
				</div>
				<button class="close-button" onclick={handleClose}>×</button>
			</div>

			<div class="actions">
				<button class="copy-button" onclick={copyToClipboard}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2" />
						<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" />
					</svg>
					Copy to Clipboard
				</button>
			</div>

			<div class="code-container">
				<pre><code>{jsonOutput}</code></pre>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.75);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		backdrop-filter: blur(4px);
		cursor: pointer;
		border: none;
		padding: 0;
		margin: 0;
		background: transparent;
	}

	.modal {
		background-color: var(--color-card);
		border-radius: var(--radius-lg);
		padding: var(--spacing-6);
		width: 90%;
		max-width: 800px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-lg);
		cursor: default;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: var(--spacing-4);
	}

	.header-content {
		flex: 1;
	}

	h2 {
		margin: 0 0 var(--spacing-1) 0;
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.spec-info {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.close-button {
		background: none;
		border: none;
		font-size: var(--font-size-2xl);
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.close-button:hover {
		color: var(--color-text-primary);
	}

	.actions {
		margin-bottom: var(--spacing-4);
	}

	.copy-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
		padding: var(--spacing-2) var(--spacing-3);
		background-color: var(--color-emerald-600);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.copy-button:hover {
		background-color: var(--color-emerald-700);
	}

	.code-container {
		flex: 1;
		overflow: auto;
		background-color: var(--color-neutral-900);
		border: 1px solid var(--color-card-border);
		border-radius: var(--radius-md);
		padding: var(--spacing-4);
	}

	pre {
		margin: 0;
		font-family: 'Fira Code', 'Courier New', monospace;
		font-size: 13px;
		line-height: 1.6;
	}

	code {
		color: var(--color-text-primary);
	}

	/* Scrollbar styling */
	.code-container::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.code-container::-webkit-scrollbar-track {
		background: var(--color-neutral-800);
		border-radius: 4px;
	}

	.code-container::-webkit-scrollbar-thumb {
		background: var(--color-neutral-700);
		border-radius: 4px;
	}

	.code-container::-webkit-scrollbar-thumb:hover {
		background: var(--color-emerald-600);
	}
</style>
