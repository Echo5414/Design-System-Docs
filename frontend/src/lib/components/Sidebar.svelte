<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import type { Collection, CollectionItem, TokenType } from '../types';
  import { collectionStates, setCollectionOpen } from '../stores/uiState';
  import { collections } from '../stores/collections';

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

  function saveCollectionName(id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    
    if (newName) {
      const updatedCollections = $collections.map(collection =>
        collection.id === id
          ? { ...collection, name: newName }
          : collection
      );
      collections.save(updatedCollections, $page.data.fetch);
    }
    editingCollectionId = null;
  }

  async function addNewItem(collectionId: string) {
    const collection = $collections.find(c => c.id === collectionId);
    if (!collection) return;

    const newItem = {
      id: createUniqueId(),
      name: 'New Item',
      items: []
    };

    const updatedCollections = $collections.map(c =>
      c.id === collectionId
        ? { 
            ...c, 
            items: [...c.items, newItem]
          }
        : c
    );
    await collections.save(updatedCollections, $page.data.fetch);
    // Navigate to the new item
    goto(`/${newItem.id}`);
    setCollectionOpen(collectionId, true);
    activeDropdown = null;
  }

  function startEditingItem(collectionId: string, itemId: string) {
    editingItemId = itemId;
    activeDropdown = null;
  }

  function saveItemName(collectionId: string, itemId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    
    if (newName) {
      const updatedCollections = $collections.map(collection =>
        collection.id === collectionId
          ? {
              ...collection,
              items: collection.items.map(item =>
                item.id === itemId
                  ? { ...item, name: newName }
                  : item
              )
            }
          : collection
      );
      collections.save(updatedCollections, $page.data.fetch);
    }
    editingItemId = null;
  }

  function deleteCollection(id: string) {
    if (confirm('Are you sure you want to delete this collection?')) {
      const updatedCollections = $collections.filter(collection => collection.id !== id);
      collections.save(updatedCollections, $page.data.fetch);
    }
  }

  function deleteItem(collectionId: string, itemId: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedCollections = $collections.map(collection =>
        collection.id === collectionId
          ? {
              ...collection,
              items: collection.items.filter(item => item.id !== itemId)
            }
          : collection
      );
      collections.save(updatedCollections, $page.data.fetch);
    }
  }

  function handleCollectionDndConsider(event: CustomEvent<DndEvent<Collection>>) {
    const updatedCollections = event.detail.items.map(item => ({
      ...item,
      id: item.id || createUniqueId(),
      items: item.items || []
    }));
    collections.save(updatedCollections, $page.data.fetch);
  }

  function handleCollectionDndFinalize(event: CustomEvent<DndEvent<Collection>>) {
    const updatedCollections = event.detail.items.map(item => ({
      ...item,
      id: item.id || createUniqueId(),
      items: item.items || []
    }));
    collections.save(updatedCollections, $page.data.fetch);
  }

  function handleItemsDndConsider(event: CustomEvent<DndEvent<CollectionItem>>, collectionId: string) {
    dragActiveCollection = collectionId;
    const updatedCollections = $collections.map(collection =>
      collection.id === collectionId
        ? {
            ...collection,
            items: event.detail.items.map(item => ({
              ...item,
              id: item.id || createUniqueId(),
              items: item.items || []
            }))
          }
        : collection
    );
    collections.save(updatedCollections, $page.data.fetch);
  }

  function handleItemsDndFinalize(event: CustomEvent<DndEvent<CollectionItem>>, collectionId: string) {
    dragActiveCollection = null;
    const updatedCollections = $collections.map(collection =>
      collection.id === collectionId
        ? {
            ...collection,
            items: event.detail.items.map(item => ({
              ...item,
              id: item.id || createUniqueId(),
              items: item.items || []
            }))
          }
        : collection
    );
    collections.save(updatedCollections, $page.data.fetch);
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

  function openCreateModal() {
    isCreateModalOpen = true;
    newCollectionName = '';
    // Wait for the next tick to ensure the dialog element is in the DOM
    setTimeout(() => {
      if (modalElement) {
        modalElement.showModal();
      }
    }, 0);
  }

  function closeCreateModal() {
    if (modalElement) {
      modalElement.close();
    }
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

    const updatedCollections = [...$collections, newCollection];
    await collections.save(updatedCollections, $page.data.fetch);
    closeCreateModal();
    // Navigate to the new collection
    goto(`/${newCollection.id}`);
    setCollectionOpen(newCollection.id, true);
  }

  function handleCreateKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      createNewCollection();
    } else if (event.key === 'Escape') {
      closeCreateModal();
    }
  }

  function handleNavigation(id: string, event: MouseEvent) {
    event.preventDefault();
    goto(`/${id}`);
  }
</script>

<aside class="sidebar">
  <nav class="nav-menu">
    <div class="collections-section">
      <div class="section-header">
        <h2 class="section-title">Collections</h2>
        <button class="icon-button" onclick={openCreateModal} title="Create new collection">
          +
        </button>
      </div>
      <section
        use:dndzone={{
          items: $collections,
          dragDisabled: isDraggingItem,
          flipDurationMs: 150,
          dropTargetStyle: {
            outline: '2px dashed var(--color-card-border)'
          },
          type: 'collections'
        }}
        onconsider={handleCollectionDndConsider}
        onfinalize={handleCollectionDndFinalize}
      >
        {#each $collections as collection (collection.id)}
          <div class="collection-item" data-collection-id={collection.id}>
            <div class="collection-header">
              <div 
                class="collection-trigger"
                role="button"
                tabindex="0"
              >
                <div 
                  class="chevron" 
                  class:open={$collectionStates.getState(collection.id).isOpen}
                  onclick={(e) => handleChevronClick(e, collection.id)}
                  onkeydown={(e) => handleCollectionKeydown(e, collection.id)}
                  role="button"
                  tabindex="0"
                  aria-label={$collectionStates.getState(collection.id).isOpen ? "Collapse collection" : "Expand collection"}
                  aria-expanded={$collectionStates.getState(collection.id).isOpen}
                >
                  {$collectionStates.getState(collection.id).isOpen ? '▼' : '▶'}
                </div>
                {#if editingCollectionId === collection.id}
                  <input
                    type="text"
                    class="collection-name-input"
                    value={collection.name}
                    onblur={(e) => saveCollectionName(collection.id, e)}
                    onkeydown={(e) => handleKeydown(e, collection.id)}
                    use:focusOnMount
                  />
                {:else}
                  <a 
                    href={`/${collection.id}`} 
                    class="collection-name-link"
                    onclick={(e) => handleNavigation(collection.id, e)}
                  >
                    {collection.name}
                  </a>
                {/if}
              </div>
              <div class="collection-actions">
                <button 
                  class="icon-button more-button"
                  onclick={(e) => toggleDropdown(collection.id, e)}
                  title="More options"
                  data-active={activeDropdown === collection.id}
                >
                  ⋮
                </button>
                {#if activeDropdown === collection.id}
                  <div class="dropdown-menu">
                    <button 
                      class="dropdown-item"
                      onclick={(e) => {
                        e.stopPropagation();
                        startEditingCollection(collection.id);
                        activeDropdown = null;
                      }}
                    >
                      Rename Collection
                    </button>
                    <button 
                      class="dropdown-item"
                      onclick={(e) => {
                        e.stopPropagation();
                        addNewItem(collection.id);
                        activeDropdown = null;
                      }}
                    >
                      Add Item
                    </button>
                    <button 
                      class="dropdown-item delete"
                      onclick={(e) => {
                        e.stopPropagation();
                        deleteCollection(collection.id);
                        activeDropdown = null;
                      }}
                    >
                      Delete Collection
                    </button>
                  </div>
                {/if}
              </div>
            </div>
            {#if $collectionStates.getState(collection.id).isOpen}
              <div
                class="collection-items dndzone"
                class:active={dragActiveCollection === collection.id}
                use:dndzone={{
                  items: collection.items,
                  dragDisabled: false,
                  dropFromOthersDisabled: true,
                  flipDurationMs: 150,
                  dropTargetStyle: {
                    outline: '2px dashed var(--color-card-border)'
                  },
                  type: `items-${collection.id}`
                }}
                onconsider={(e) => handleItemsDndConsider(e, collection.id)}
                onfinalize={(e) => {
                  handleItemsDndFinalize(e, collection.id);
                  handleItemDragEnd();
                }}
              >
                {#each collection.items as item (item.id)}
                  <div 
                    class="item-wrapper"
                    class:dragging={dragActiveCollection === collection.id}
                    data-item-id={item.id}
                  >
                    {#if editingItemId === item.id}
                      <div class="nav-link">
                        <input
                          type="text"
                          class="item-name-input"
                          value={item.name}
                          onblur={(e) => saveItemName(collection.id, item.id, e)}
                          onkeydown={(e) => handleItemKeydown(e, collection.id, item.id)}
                          use:focusOnMount
                        />
                      </div>
                    {:else}
                      <a 
                        href={`/${item.id}`} 
                        class="nav-link"
                        class:active={$page.url.pathname === `/${item.id}`}
                        onclick={(e) => handleNavigation(item.id, e)}
                      >
                        <span>{item.name}</span>
                      </a>
                      <div class="item-actions">
                        <button 
                          class="icon-button more-button"
                          onclick={(e) => toggleDropdown(`${collection.id}-${item.id}`, e)}
                          title="More options"
                          data-active={activeDropdown === `${collection.id}-${item.id}`}
                        >
                          ⋮
                        </button>
                        {#if activeDropdown === `${collection.id}-${item.id}`}
                          <div class="dropdown-menu">
                            <button 
                              class="dropdown-item"
                              onclick={(e) => {
                                e.stopPropagation();
                                startEditingItem(collection.id, item.id);
                                activeDropdown = null;
                              }}
                            >
                              Rename Item
                            </button>
                            <button 
                              class="dropdown-item delete"
                              onclick={(e) => {
                                e.stopPropagation();
                                deleteItem(collection.id, item.id);
                                activeDropdown = null;
                              }}
                            >
                              Delete Item
                            </button>
                          </div>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </section>
    </div>
  </nav>
</aside>

{#if isCreateModalOpen}
  <div 
    class="modal-wrapper"
    role="button"
    tabindex="0"
    onclick={handleModalClick}
    onkeydown={handleModalKeydown}
    aria-label="Close modal"
  >
    <dialog 
      class="modal-backdrop"
      aria-labelledby="modal-title"
      bind:this={modalElement}
    >
      <form 
        class="modal"
        method="dialog"
        onsubmit={(e) => {
          e.preventDefault();
          if (newCollectionName.trim()) {
            createNewCollection();
          }
        }}
      >
        <h2 id="modal-title" class="modal-title">Create New Collection</h2>
        <input
          type="text"
          class="modal-input"
          placeholder="Collection name"
          bind:value={newCollectionName}
          onkeydown={handleCreateKeydown}
          aria-label="Collection name"
          use:focusOnMount
        />
        <div class="modal-actions">
          <button 
            type="button"
            class="modal-button secondary" 
            onclick={closeCreateModal}
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="modal-button primary" 
            disabled={!newCollectionName.trim()}
          >
            Create
          </button>
        </div>
      </form>
    </dialog>
  </div>
{/if}

<style>
  .sidebar {
    width: 260px;
    background-color: var(--color-card);
    border-right: 1px solid var(--color-card-border);
    padding: var(--spacing-4);
    height: 100vh;
    overflow-y: auto;
  }

  .nav-menu {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .collections-section {
    flex: 1;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-2) var(--spacing-4);
    margin-bottom: var(--spacing-2);
  }

  .section-title {
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    min-height: 24px;
    width: 24px;
    height: 24px;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: var(--transition-base);
    flex-shrink: 0;
    font-size: 18px;
    line-height: 1;
  }

  .icon-button:hover {
    color: var(--color-text-primary);
    background-color: var(--color-neutral-800);
  }

  .collection-item {
    margin-bottom: var(--spacing-2);
  }

  .collection-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-2);
    padding: var(--spacing-1);
    border-radius: var(--radius-sm);
    transition: var(--transition-base);
    cursor: grab;
  }

  .collection-header:hover {
    background-color: var(--color-neutral-800);
  }

  .collection-header:hover .collection-trigger,
  .collection-header:hover .icon-button {
    color: var(--color-text-primary);
  }

  .collection-trigger {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    flex: 1;
    padding: var(--spacing-2);
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: var(--transition-base);
    min-width: 0;
  }

  .collection-trigger:hover {
    color: var(--color-text-primary);
  }

  .collection-name-input {
    background: var(--color-neutral-900);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    padding: var(--spacing-1) var(--spacing-2);
    width: 100%;
    min-width: 0;
  }

  .collection-actions {
    position: relative;
    display: flex;
    gap: var(--spacing-1);
    flex-shrink: 0;
  }

  .more-button {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .collection-header:hover .more-button {
    opacity: 1;
  }

  .more-button[data-active="true"] {
    opacity: 1;
  }

  .chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    cursor: pointer;
    border-radius: var(--radius-sm);
    font-size: 12px;
  }

  .chevron:hover {
    background-color: var(--color-neutral-700);
  }

  .chevron.open {
    transform: rotate(0deg);
  }

  .item-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-1);
    min-width: 0;
    padding: var(--spacing-1) var(--spacing-3);
    border-radius: var(--radius-md);
    transition: background-color 0.2s ease;
    cursor: grab;
  }

  .item-wrapper:hover {
    background-color: var(--color-neutral-800);
  }

  .item-wrapper.dragging {
    background-color: var(--color-neutral-800);
    outline: 2px solid var(--color-emerald-600);
    outline-offset: -2px;
  }

  .item-wrapper:hover .nav-link {
    color: var(--color-text-primary);
  }

  .nav-link.active {
    background-color: var(--color-neutral-800);
    color: var(--color-text-primary);
  }

  .item-wrapper .nav-link.active {
    background-color: transparent;
  }

  .item-actions {
    position: relative;
    display: flex;
    gap: var(--spacing-1);
    flex-shrink: 0;
  }

  .collection-items {
    list-style: none;
    padding: 0;
    margin: 0;
    border-radius: var(--radius-md);
    transition: background-color 0.2s ease;
    min-height: 40px;
  }

  .collection-items.dndzone {
    min-height: 40px;
  }

  .collection-items.dndzone:hover {
    background-color: var(--color-neutral-900);
  }

  .collection-items.dndzone.active {
    background-color: var(--color-neutral-800);
    outline: 2px dashed var(--color-card-border);
    outline-offset: -2px;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2);
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: var(--transition-base);
    font-size: var(--font-size-sm);
    flex: 1;
    min-width: 0;
  }

  .nav-link:hover {
    background-color: var(--color-neutral-800);
    color: var(--color-text-primary);
  }

  .nav-link.active {
    background-color: var(--color-neutral-800);
    color: var(--color-text-primary);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--spacing-1);
    background-color: var(--color-neutral-900);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-1);
    min-width: 160px;
    z-index: 100;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .dropdown-item {
    display: block;
    width: 100%;
    padding: var(--spacing-2) var(--spacing-3);
    border: none;
    background: none;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    text-align: left;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: var(--transition-base);
  }

  .dropdown-item:hover {
    background-color: var(--color-neutral-800);
    color: var(--color-text-primary);
  }

  .dropdown-item.delete {
    color: rgb(239, 68, 68);
  }

  .dropdown-item.delete:hover {
    background-color: rgb(127, 29, 29);
    color: white;
  }

  .collection-item:active,
  .item-wrapper:active {
    cursor: grabbing;
  }

  .collection-header:active {
    cursor: grabbing;
  }

  .item-wrapper:active {
    cursor: grabbing;
  }

  .collection-name-link {
    color: inherit;
    text-decoration: none;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .collection-name-link:hover {
    color: var(--color-text-primary);
  }

  .item-name-input {
    background: var(--color-neutral-900);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    padding: var(--spacing-1) var(--spacing-2);
    width: 100%;
    min-width: 0;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border: none;
    padding: var(--spacing-4);
    max-width: 100vw;
    max-height: 100vh;
    width: 100%;
  }

  .modal-backdrop::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .modal-backdrop[open] {
    display: flex;
  }

  .modal {
    background-color: var(--color-card);
    border-radius: var(--radius-lg);
    padding: var(--spacing-6);
    width: 100%;
    max-width: 400px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    margin: 0;
  }

  .modal-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-4) 0;
  }

  .modal-input {
    width: 100%;
    padding: var(--spacing-3);
    background-color: var(--color-neutral-900);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-4);
  }

  .modal-input:focus {
    outline: none;
    border-color: var(--color-emerald-600);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-2);
  }

  .modal-button {
    padding: var(--spacing-2) var(--spacing-4);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-base);
  }

  .modal-button.secondary {
    background-color: transparent;
    border: 1px solid var(--color-card-border);
    color: var(--color-text-secondary);
  }

  .modal-button.secondary:hover {
    background-color: var(--color-neutral-800);
    color: var(--color-text-primary);
  }

  .modal-button.primary {
    background-color: var(--color-emerald-600);
    border: none;
    color: white;
  }

  .modal-button.primary:hover {
    background-color: var(--color-emerald-700);
  }

  .modal-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-wrapper {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: none;
    padding: 0;
    margin: 0;
    border: none;
    background: none;
    cursor: default;
    width: 100%;
  }

  .modal-wrapper:has(dialog[open]) {
    display: block;
  }
</style> 