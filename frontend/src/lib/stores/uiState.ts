import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface CollectionState {
  isOpen: boolean;
}

const STORAGE_KEY = 'collection_states';

class CollectionStates {
  private states: Map<string, CollectionState>;

  constructor() {
    this.states = new Map();
    if (browser) {
      // Load saved states from localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.entries(parsed).forEach(([id, state]) => {
            this.states.set(id, state as CollectionState);
          });
        }
      } catch (error) {
        console.error('Error loading collection states:', error);
      }
    }
  }

  getState(id: string): CollectionState {
    if (!this.states.has(id)) {
      this.states.set(id, { isOpen: false });
    }
    return this.states.get(id)!;
  }

  setState(id: string, state: CollectionState) {
    this.states.set(id, state);
    if (browser) {
      // Save to localStorage
      try {
        const statesObj = Object.fromEntries(this.states);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(statesObj));
      } catch (error) {
        console.error('Error saving collection states:', error);
      }
    }
  }
}

function createCollectionStatesStore() {
  const { subscribe, set, update } = writable(new CollectionStates());

  return {
    subscribe,
    update,
    getState: (id: string) => {
      let states: CollectionStates;
      subscribe(s => states = s)();
      return states!.getState(id);
    }
  };
}

export const collectionStates = createCollectionStatesStore();

export function setCollectionOpen(id: string, isOpen: boolean) {
  collectionStates.update((states: CollectionStates) => {
    states.setState(id, { isOpen });
    return states;
  });
} 