<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import type { Collection, CollectionItem } from '../types';
  import { collectionStates, setCollectionOpen } from '../stores/uiState';
  import { collectionsStore } from '../stores/collections';

  let activeDropdown: string | null = $state(null);
  let dragActiveCollection: string | null = $state(null);
  let isDraggingItem = $state(false);
  let isCreateModalOpen = $state(false);
  let newCollectionName = $state('');
  let modalElement = $state<HTMLDialogElement | null>(null);
  let editingCollectionId = $state<string | null>(null);
  let editingItemId = $state<string | null>(null);
  let isInitialized = $state(false);

  onMount(() => {
    isInitialized = true;
  });

  function createUniqueId() {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async function handleCollectionDndConsider(event: CustomEvent<DndEvent<Collection>>) {
    const { items: newCollections } = event.detail;
    // Update the store immediately to reflect the new order
    collectionsStore.update(collections => newCollections);
  }

  async function handleCollectionDndFinalize(event: CustomEvent<DndEvent<Collection>>) {
    const { items: newCollections } = event.detail;
    // Save the final order to the store and persist it
    await collectionsStore.save(newCollections);
  }

  async function handleItemsDndConsider(event: CustomEvent<DndEvent<CollectionItem>>, collectionId: string) {
    const { items: newItems } = event.detail;
    collectionsStore.update(collections => 
      collections.map(collection =>
        collection.id === collectionId
          ? { ...collection, items: newItems }
          : collection
      )
    );
  }

  async function handleItemsDndFinalize(event: CustomEvent<DndEvent<CollectionItem>>, collectionId: string) {
    const { items: newItems } = event.detail;
    const updatedCollections = $collectionsStore.map(collection =>
      collection.id === collectionId
        ? { ...collection, items: newItems }
        : collection
    );
    await collectionsStore.save(updatedCollections);
  }

  function handleCollectionDragStart() {
    if (isDraggingItem) return false;
  }

  function handleItemDragStart() {
    isDraggingItem = true;
  }

  function handleItemDragEnd() {
    isDraggingItem = false;
  }

  function openCreateModal() {
    isCreateModalOpen = true;
    newCollectionName = '';
  }

  function closeCreateModal() {
    isCreateModalOpen = false;
    newCollectionName = '';
  }

  async function createNewCollection() {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: createUniqueId(),
      name: newCollectionName.trim(),
      items: []
    };

    const updatedCollections = [...$collectionsStore, newCollection];
    await collectionsStore.save(updatedCollections);
    closeCreateModal();
    // Navigate to the new collection
    goto(`/dashboard/${newCollection.id}`);
    setCollectionOpen(newCollection.id, true);
  }

  function handleCreateKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      createNewCollection();
    }
  }

  function handleModalClick(event: MouseEvent) {
    // Only close if clicking the backdrop (dialog element itself)
    if (event.target === modalElement) {
      closeCreateModal();
    }
  }

  function handleModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault(); // Prevent default dialog close
      closeCreateModal();
    }
  }

  function toggleDropdown(id: string, event: Event) {
    event.stopPropagation();
    activeDropdown = activeDropdown === id ? null : id;
  }

  function handleClickOutside(event: MouseEvent) {
    if (activeDropdown) {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.more-button')) {
        activeDropdown = null;
      }
    }
  }

  $effect(() => {
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });

  function toggleCollection(id: string) {
    const currentState = $collectionStates.getState(id);
    setCollectionOpen(id, !currentState.isOpen);
  }

  function startEditingCollection(id: string) {
    editingCollectionId = id;
    activeDropdown = null;
  }

  function startEditingItem(collectionId: string, itemId: string) {
    editingItemId = itemId;
    activeDropdown = null;
  }

  function handleCollectionKeydown(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleCollection(id);
    }
  }

  function handleChevronClick(event: MouseEvent, id: string) {
    event.stopPropagation();
    toggleCollection(id);
  }

  function focusOnMount(node: HTMLElement) {
    node.focus();
    return {};
  }

  function handleItemKeydown(event: KeyboardEvent, collectionId: string, itemId: string) {
    if (event.key === 'Enter') {
      saveItemName(collectionId, itemId, event);
    } else if (event.key === 'Escape') {
      editingItemId = null;
    }
  }

  function handleKeydown(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter') {
      saveCollectionName(id, event);
    } else if (event.key === 'Escape') {
      editingCollectionId = null;
    }
  }

  async function saveCollectionName(id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    
    if (newName) {
      const updatedCollections = $collectionsStore.map((collection: Collection) =>
        collection.id === id
          ? { ...collection, name: newName }
          : collection
      );
      await collectionsStore.save(updatedCollections);
    }
    editingCollectionId = null;
  }

  async function saveItemName(collectionId: string, itemId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    
    if (newName) {
      const updatedCollections = $collectionsStore.map((collection: Collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              items: collection.items.map((item: CollectionItem) =>
                item.id === itemId
                  ? { ...item, name: newName }
                  : item
              )
            }
          : collection
      );
      await collectionsStore.save(updatedCollections);
    }
    editingItemId = null;
  }

  async function addNewItem(collectionId: string) {
    const collection = $collectionsStore.find((c: Collection) => c.id === collectionId);
    if (!collection) return;

    const newItem: CollectionItem = {
      id: createUniqueId(),
      name: 'New Item',
      items: []
    };

    const updatedCollections = $collectionsStore.map((c: Collection) =>
      c.id === collectionId
        ? { 
            ...c, 
            items: [...c.items, newItem]
          }
        : c
    );
    await collectionsStore.save(updatedCollections);
    // Navigate to the new item
    goto(`/dashboard/${collectionId}/${newItem.id}`);
    setCollectionOpen(collectionId, true);
    activeDropdown = null;
  }

  async function deleteCollection(id: string) {
    const updatedCollections = $collectionsStore.filter((collection: Collection) => collection.id !== id);
    await collectionsStore.save(updatedCollections);
    // If we're on the current collection's page, navigate to dashboard
    if ($page.url.pathname.includes(id)) {
      goto('/dashboard');
    }
  }

  async function deleteItem(collectionId: string, itemId: string) {
    const updatedCollections = $collectionsStore.map((collection: Collection) =>
      collection.id === collectionId
        ? {
            ...collection,
            items: collection.items.filter((item: CollectionItem) => item.id !== itemId)
          }
        : collection
    );
    await collectionsStore.save(updatedCollections);
    // If we're on the current item's page, navigate to collection
    if ($page.url.pathname.includes(itemId)) {
      goto(`/dashboard/${collectionId}`);
    }
  }
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <button class="add-collection-button" onclick={openCreateModal}>
      Add Collection
    </button>
  </div>

  <div class="collections">
    <section
      use:dndzone={{
        items: $collectionsStore,
        dragDisabled: isDraggingItem,
        flipDurationMs: 150
      }}
      onconsider={handleCollectionDndConsider}
      onfinalize={handleCollectionDndFinalize}
    >
      {#each $collectionsStore as collection (collection.id)}
        <div class="collection-item" data-collection-id={collection.id}>
          <div class="collection-header">
            <div
              class="collection-button"
              role="button"
              tabindex="0"
              onclick={() => goto(`/dashboard/${collection.id}`)}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goto(`/dashboard/${collection.id}`);
                }
              }}
            >
              <span class="chevron" class:open={$collectionStates.getState(collection.id).isOpen}>
                <button
                  class="chevron-button"
                  onclick={(e) => handleChevronClick(e, collection.id)}
                  onkeydown={(e) => handleCollectionKeydown(e, collection.id)}
                  aria-label={$collectionStates.getState(collection.id).isOpen ? "Collapse section" : "Expand section"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    role="img"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </span>
              {#if editingCollectionId === collection.id}
                <input
                  type="text"
                  value={collection.name}
                  onblur={(e) => saveCollectionName(collection.id, e)}
                  onkeydown={(e) => handleKeydown(e, collection.id)}
                  use:focusOnMount
                />
              {:else}
                <span class="collection-name">{collection.name}</span>
              {/if}
            </div>
            <button
              class="more-button"
              onclick={(e) => toggleDropdown(collection.id, e)}
              aria-label="More options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                role="img"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {#if activeDropdown === collection.id}
              <div class="dropdown-menu">
                <button onclick={() => startEditingCollection(collection.id)}>
                  Rename
                </button>
                <button onclick={() => addNewItem(collection.id)}>
                  Add Item
                </button>
                <button onclick={() => deleteCollection(collection.id)}>
                  Delete
                </button>
              </div>
            {/if}
          </div>

          {#if $collectionStates.getState(collection.id).isOpen}
            <div class="collection-items">
              <section
                use:dndzone={{
                  items: collection.items,
                  dragDisabled: false,
                  flipDurationMs: 150
                }}
                onconsider={(e) => handleItemsDndConsider(e, collection.id)}
                onfinalize={(e) => handleItemsDndFinalize(e, collection.id)}
              >
                {#each collection.items as item (item.id)}
                  <div class="item">
                    <a
                      href={`/dashboard/${collection.id}/${item.id}`}
                      class="item-link"
                      class:active={$page.url.pathname.includes(item.id)}
                    >
                      {#if editingItemId === item.id}
                        <input
                          type="text"
                          value={item.name}
                          onblur={(e) => saveItemName(collection.id, item.id, e)}
                          onkeydown={(e) => handleItemKeydown(e, collection.id, item.id)}
                          use:focusOnMount
                        />
                      {:else}
                        <span class="item-name">{item.name}</span>
                      {/if}
                    </a>
                    <button
                      class="more-button"
                      onclick={(e) => toggleDropdown(item.id, e)}
                      aria-label="More options"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        role="img"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>
                    {#if activeDropdown === item.id}
                      <div class="dropdown-menu">
                        <button onclick={() => startEditingItem(collection.id, item.id)}>
                          Rename
                        </button>
                        <button onclick={() => deleteItem(collection.id, item.id)}>
                          Delete
                        </button>
                      </div>
                    {/if}
                  </div>
                {/each}
              </section>
            </div>
          {/if}
        </div>
      {/each}
    </section>
  </div>

  <div class="sidebar-footer">
    <button class="add-collection-button" onclick={openCreateModal}>
      Add Collection
    </button>
  </div>
</aside>

{#if isCreateModalOpen}
  <dialog
    class="modal"
    bind:this={modalElement}
    open
    aria-labelledby="modal-title"
    aria-modal="true"
  >
    <div 
      class="modal-content"
      onclick={handleModalClick}
      onkeydown={handleModalKeydown}
      role="presentation"
    >
      <h2 id="modal-title">Create Collection</h2>
      <input
        type="text"
        bind:value={newCollectionName}
        placeholder="Collection name"
        onkeydown={handleCreateKeydown}
      />
      <div class="modal-actions">
        <button onclick={closeCreateModal}>Cancel</button>
        <button onclick={createNewCollection}>Create</button>
      </div>
    </div>
  </dialog>
{/if}

<style>
  .sidebar {
    width: 260px;
    background: var(--color-card);
    border-right: 1px solid var(--color-card-border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .sidebar-header {
    padding: var(--spacing-4);
    border-bottom: 1px solid var(--color-card-border);
  }

  .sidebar-footer {
    padding: var(--spacing-4);
    border-top: 1px solid var(--color-card-border);
  }

  .add-collection-button {
    width: 100%;
    padding: var(--spacing-2) var(--spacing-4);
    background: var(--color-emerald-600);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-base);
  }

  .add-collection-button:hover {
    background: var(--color-emerald-700);
  }

  .collections {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-4);
  }

  .collection-item {
    margin-bottom: var(--spacing-2);
  }

  .collection-header {
    display: flex;
    align-items: center;
    position: relative;
  }

  .collection-button {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2);
    background: none;
    border: none;
    color: var(--color-text-primary);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-base);
    border-radius: var(--radius-md);
  }

  .collection-button:hover {
    background: var(--color-neutral-900);
  }

  .chevron {
    display: flex;
    align-items: center;
    color: var(--color-text-secondary);
    transition: transform var(--transition-base);
  }

  .chevron.open {
    transform: rotate(90deg);
  }

  .collection-name {
    flex: 1;
    text-align: left;
  }

  .collection-items {
    margin-left: var(--spacing-6);
    margin-top: var(--spacing-2);
  }

  .item {
    display: flex;
    align-items: center;
    position: relative;
    margin-bottom: var(--spacing-1);
  }

  .item-link {
    flex: 1;
    padding: var(--spacing-2);
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: var(--transition-base);
  }

  .item-link:hover {
    background: var(--color-neutral-900);
    color: var(--color-text-primary);
  }

  .item-link.active {
    background: var(--color-neutral-900);
    color: var(--color-text-primary);
  }

  .item-name {
    font-size: var(--font-size-sm);
  }

  .more-button {
    padding: var(--spacing-1);
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: var(--transition-base);
    border-radius: var(--radius-md);
  }

  .more-button:hover {
    color: var(--color-text-primary);
    background: var(--color-neutral-900);
  }

  .dropdown-menu {
    position: absolute;
    right: 0;
    top: 100%;
    background: var(--color-card);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-1);
    z-index: 10;
    min-width: 120px;
    box-shadow: var(--shadow-md);
  }

  .dropdown-menu button {
    width: 100%;
    padding: var(--spacing-2) var(--spacing-3);
    background: none;
    border: none;
    color: var(--color-text-primary);
    text-align: left;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: var(--transition-base);
  }

  .dropdown-menu button:hover {
    background: var(--color-neutral-900);
  }

  input {
    width: 100%;
    padding: var(--spacing-1) var(--spacing-2);
    background: var(--color-card);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
  }

  input:focus {
    outline: none;
    border-color: var(--color-emerald-600);
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-card);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-lg);
    padding: 0;
    max-width: 400px;
    width: 90%;
  }

  .modal::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    padding: var(--spacing-6);
  }

  .modal h2 {
    margin: 0 0 var(--spacing-4) 0;
    font-size: var(--font-size-xl);
    font-weight: 600;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-3);
    margin-top: var(--spacing-6);
  }

  .modal-actions button {
    padding: var(--spacing-2) var(--spacing-4);
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-base);
  }

  .modal-actions button:first-child {
    background: transparent;
    border: 1px solid var(--color-card-border);
    color: var(--color-text-primary);
  }

  .modal-actions button:first-child:hover {
    background: var(--color-neutral-900);
  }

  .modal-actions button:last-child {
    background: var(--color-emerald-600);
    border: none;
    color: white;
  }

  .modal-actions button:last-child:hover {
    background: var(--color-emerald-700);
  }

  .chevron-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    transition: var(--transition-base);
  }

  .chevron-button:hover {
    color: var(--color-text-primary);
  }
</style> 