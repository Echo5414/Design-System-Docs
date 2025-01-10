import { writable } from 'svelte/store';
import type { Collection } from '$lib/types';
import collectionsAPI from '../services/api';

function createCollectionsStore() {
  const { subscribe, set } = writable<Collection[]>([]);
  let initialized = false;
  let initializationPromise: Promise<void> | null = null;

  async function load() {
    if (initialized) {
      console.log('Collections: Already initialized');
      return;
    }

    if (initializationPromise) {
      console.log('Collections: Initialization in progress');
      return initializationPromise;
    }

    console.log('Collections: Starting initialization');
    initializationPromise = collectionsAPI.getCollections()
      .then(collections => {
        set(collections);
        initialized = true;
        console.log('Collections: Initialization successful');
      })
      .catch(error => {
        console.error('Collections: Initialization failed', error);
        throw error;
      })
      .finally(() => {
        initializationPromise = null;
      });

    return initializationPromise;
  }

  async function save(collections: Collection[], fetch?: typeof window.fetch) {
    try {
      console.log('Collections: Saving changes');
      await collectionsAPI.saveCollections(collections, fetch);
      set(collections);
      console.log('Collections: Save successful');
    } catch (error) {
      console.error('Collections: Save failed', error);
      throw error;
    }
  }

  return {
    subscribe,
    load,
    save,
    isInitialized: () => initialized
  };
}

export const collections = createCollectionsStore(); 