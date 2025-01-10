import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';
import type { CollectionUIState } from '../types';

const COLLECTIONS_UI_STATE_KEY = 'collections_ui_state';

// Load initial state from localStorage
function loadUIState(): CollectionUIState[] {
  if (!browser) return [];
  try {
    const stored = localStorage.getItem(COLLECTIONS_UI_STATE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading UI state:', error);
    return [];
  }
}

// Create store
const uiState = writable<CollectionUIState[]>(loadUIState());

// Create a derived store for collection states
export const collectionStates = derived(uiState, $uiState => {
  return {
    getState: (id: string): CollectionUIState => {
      return $uiState.find(state => state.id === id) || { id, isOpen: false };
    }
  };
});

// Subscribe to changes and save to localStorage
if (browser) {
  uiState.subscribe((state) => {
    try {
      localStorage.setItem(COLLECTIONS_UI_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving UI state:', error);
    }
  });
}

export function setCollectionOpen(id: string, isOpen: boolean) {
  uiState.update(states => {
    const existingIndex = states.findIndex(state => state.id === id);
    if (existingIndex >= 0) {
      const newStates = [...states];
      newStates[existingIndex] = { ...states[existingIndex], isOpen };
      return newStates;
    }
    return [...states, { id, isOpen }];
  });
} 