<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { TokenType, TokenValueType } from '$lib/types';
import {
	createToken,
	getActiveDesignSystem
} from '$lib/api/strapi';
import { browser } from '$app/environment';
import { collectionsStore } from '$lib/stores/collections';

let {
	isOpen = $bindable(false),
	collectionId = '',
	categoryId = '',
	initialGroupLabel = ''
} = $props();

	const dispatch = createEventDispatcher<{
		close: void;
		save: void;
	}>();

	let tokenName = $state('');
	let tokenType = $state<TokenType>('color');
let tokenValue = $state('');
let tokenDescription = $state('');
let selectedCollectionId = $state<string | null>(null);
let selectedGroupId = $state<string | null>(null);
let collections = $state<any[]>([]);
let isLoadingCollections = $state(false);
let groupInput = $state('');

	// Additional fields for typography
	let fontFamily = $state('');
	let fontSize = $state('');
	let fontWeight = $state(400);
	let lineHeight = $state('');
	let letterSpacing = $state('');

	// Fetch collections when modal opens
	$effect(() => {
		if (isOpen && browser && collections.length === 0) {
			fetchCollections();
		}
		if (isOpen) {
			groupInput = initialGroupLabel || '';
		}
	});

	async function fetchCollections() {
		isLoadingCollections = true;
		try {
			// Ensure store has data
			if (!$collectionsStore.length) {
				await collectionsStore.load();
			}

			collections = $collectionsStore.map((c) => ({
				id: c.id,
				name: c.name,
				key: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
				groups: (c.items || [])
					.filter((item) => item.id && !item.id.endsWith('-ungrouped'))
					.map((g) => ({
						id: g.id,
						name: g.name
					}))
			}));

			if (collections.length > 0) {
				const match = collections.find((c) => c.id === String(collectionId));
				selectedCollectionId = match?.id ?? collections[0].id;
				if (categoryId && !categoryId.endsWith('-ungrouped')) {
					selectedGroupId = String(categoryId);
					const col = collections.find((c) => c.id === selectedCollectionId);
					const existing = col?.groups?.find((g: any) => g.id === selectedGroupId);
					if (existing) {
						groupInput = existing.name;
					}
				} else {
					selectedGroupId = null;
				}
			}
		} catch (error) {
			console.error('Failed to load collections:', error);
		} finally {
			isLoadingCollections = false;
		}
	}

	function handleClose() {
		dispatch('close');
		resetForm();
	}

	function resetForm() {
		tokenName = '';
		tokenType = 'color';
		tokenValue = '';
	tokenDescription = '';
	groupInput = '';
	selectedGroupId = null;
	fontFamily = '';
	fontSize = '';
	fontWeight = 400;
	lineHeight = '';
	letterSpacing = '';
	}

	function parseTokenValue(type: TokenType, value: string): TokenValueType {
		switch (type) {
			case 'color':
				return value;
			case 'dimension':
				const [numStr, unit = 'px'] = value.split(/(\\d+)/).filter(Boolean);
				return {
					value: parseFloat(numStr),
					unit
				};
			case 'typography':
				return {
					'font-family': fontFamily,
					'font-size': fontSize,
					'font-weight': fontWeight,
					'line-height': lineHeight,
					'letter-spacing': letterSpacing
				};
			default:
				return value;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!selectedCollectionId) {
			alert('Please select a collection');
			return;
		}

		try {
			const selectedCollection = collections.find((c) => c.id === selectedCollectionId);
			const fullPath = `${selectedCollection.key}.${tokenName}`;

			await createToken({
				name: tokenName,
				full_path: fullPath,
				group: selectedGroupId,
				group_path: groupInput.trim() || null,
				type: tokenType,
				value: parseTokenValue(tokenType, tokenValue),
				description: tokenDescription,
				collection: selectedCollectionId
			});

			dispatch('save');
			handleClose();

			// Refresh collections data without page reload
			await collectionsStore.load();
		} catch (error) {
			console.error('Failed to create token:', error);
			alert('Failed to create token. Please try again.');
		}
	}

	const tokenTypes: TokenType[] = ['color', 'typography', 'dimension'];
</script>

{#if isOpen}
	<div class="modal-overlay">
		<div class="modal">
			<div class="modal-header">
				<h2>Add Token</h2>
				<button class="close-button" onclick={handleClose}>×</button>
			</div>
			<form onsubmit={handleSubmit}>
				<div class="form-group">
					<label for="collection">Collection *</label>
					{#if isLoadingCollections}
						<p class="loading">Loading collections...</p>
					{:else if collections.length === 0}
						<p class="error">No collections found. Please connect a repository first.</p>
					{:else}
						<select id="collection" bind:value={selectedCollectionId} required>
							{#each collections as collection}
								<option value={collection.id}>{collection.name}</option>
							{/each}
						</select>
					{/if}
				</div>

				<div class="form-group">
					<label for="tokenName">Name *</label>
					<input
						type="text"
						id="tokenName"
						bind:value={tokenName}
						required
						placeholder="e.g., primary-500"
					/>
				</div>
				<div class="form-group">
					<label for="tokenType">Type *</label>
					<select id="tokenType" bind:value={tokenType}>
						{#each tokenTypes as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="groupPath">Group (optional)</label>
					<select
						id="groupPath"
						bind:value={selectedGroupId}
						onchange={(e) => {
							const sel = (e.target as HTMLSelectElement).value;
							selectedGroupId = sel || null;
							if (sel) {
								const col = collections.find((c) => c.id === selectedCollectionId);
								const label = col?.groups?.find((g: any) => g.id === sel)?.name || '';
								groupInput = label;
							} else {
								groupInput = '';
							}
						}}
					>
						<option value=''>Ungrouped</option>
						{#if collections.length}
							{#each (collections.find((c) => c.id === selectedCollectionId)?.groups || []) as group}
								<option value={group.id}>{group.name}</option>
							{/each}
						{/if}
					</select>
					<p class="help-text">Select a group or leave ungrouped.</p>
				</div>

				{#if tokenType === 'typography'}
					<div class="form-group">
						<label for="fontFamily">Font Family</label>
						<input
							type="text"
							id="fontFamily"
							bind:value={fontFamily}
							placeholder="Arial, sans-serif"
						/>
					</div>
					<div class="form-group">
						<label for="fontSize">Font Size</label>
						<input type="text" id="fontSize" bind:value={fontSize} placeholder="16px" />
					</div>
					<div class="form-group">
						<label for="fontWeight">Font Weight</label>
						<input
							type="number"
							id="fontWeight"
							bind:value={fontWeight}
							min="100"
							max="900"
							step="100"
						/>
					</div>
					<div class="form-group">
						<label for="lineHeight">Line Height</label>
						<input type="text" id="lineHeight" bind:value={lineHeight} placeholder="1.5" />
					</div>
					<div class="form-group">
						<label for="letterSpacing">Letter Spacing</label>
						<input type="text" id="letterSpacing" bind:value={letterSpacing} placeholder="0" />
					</div>
				{:else}
					<div class="form-group">
						<label for="tokenValue">Value *</label>
						<div class="value-row">
							<input
								type={tokenType === 'color' ? 'color' : 'text'}
								id="tokenValue"
								bind:value={tokenValue}
								required
								placeholder={tokenType === 'color'
									? '#000000'
									: tokenType === 'dimension'
										? '16px'
										: ''}
							/>
							{#if tokenType === 'color'}
								<div
									class="color-swatch"
									style={`background:${tokenValue || '#000000'}`}
									aria-label="Color preview"
								></div>
							{/if}
						</div>
					</div>
				{/if}

				<div class="form-group">
					<label for="tokenDescription">Description</label>
					<textarea
						id="tokenDescription"
						bind:value={tokenDescription}
						rows="3"
						placeholder="Optional description for this token"
					></textarea>
				</div>
				<div class="button-group">
					<button type="button" class="cancel-button" onclick={handleClose}> Cancel </button>
					<button
						type="submit"
						class="save-button"
						disabled={isLoadingCollections || collections.length === 0}
					>
						Save Token
					</button>
				</div>
			</form>
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
	}

	.modal {
		background-color: var(--color-card);
		border-radius: var(--radius-lg);
		padding: var(--spacing-6);
		width: 90%;
		max-width: 500px;
		box-shadow: var(--shadow-lg);
		position: relative;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-6);
	}

	h2 {
		margin: 0;
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
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

	.form-group {
		margin-bottom: var(--spacing-4);
	}

	label {
		display: block;
		margin-bottom: var(--spacing-2);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	input,
	select,
	textarea {
		width: 100%;
		padding: var(--spacing-2) var(--spacing-3);
		border: 1px solid var(--color-card-border);
		border-radius: var(--radius-md);
		background-color: var(--color-card);
		color: var(--color-text-primary);
		font-size: var(--font-size-base);
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-emerald-600);
		box-shadow: 0 0 0 1px var(--color-emerald-600);
	}

	.loading,
	.error {
		padding: var(--spacing-2);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.error {
		color: var(--color-destructive);
	}

	.button-group {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-3);
		margin-top: var(--spacing-6);
	}

	.cancel-button,
	.save-button {
		padding: var(--spacing-2) var(--spacing-4);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.cancel-button {
		background: none;
		border: 1px solid var(--color-card-border);
		color: var(--color-text-secondary);
	}

	.cancel-button:hover {
		border-color: var(--color-text-secondary);
		color: var(--color-text-primary);
	}

	.save-button {
		background-color: var(--color-emerald-600);
		border: none;
		color: white;
	}

	.save-button:hover:not(:disabled) {
		background-color: var(--color-emerald-700);
	}

	.save-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.value-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
	}

	.value-row input {
		flex: 1;
	}

	.color-swatch {
		width: 32px;
		height: 32px;
		border: 1px solid var(--color-card-border);
		border-radius: var(--radius-sm);
	}
</style>
