<script lang="ts">
  import { page } from '$app/stores';
  import TokenModal from '$lib/components/TokenModal.svelte';
  import { collectionsStore } from '$lib/stores/collections';
  import type { Collection, CollectionItem } from '$lib/types';

  let isOpen = $state(false);
  let selectedCollection = $state<Collection | undefined>(undefined);
  let selectedCategory = $state<CollectionItem | undefined>(undefined);

  $effect(() => {
    const { collectionId, categoryId } = $page.params;
    selectedCollection = $collectionsStore.find(c => c.id === collectionId);
    selectedCategory = selectedCollection?.items.find(item => item.id === categoryId);
  });
</script>

<div>
  <TokenModal
    bind:isOpen
    collectionId={selectedCollection?.id || ''}
    categoryId={selectedCategory?.id || ''}
    on:save={() => {
      isOpen = false;
      // Refresh collections after save
      collectionsStore.load();
    }}
  />
</div> 