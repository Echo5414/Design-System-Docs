import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import type { Collection, CollectionItem, TokenItem, TokenType } from '../types';
import {
  getActiveDesignSystem,
  getCollectionsByDesignSystem,
  getDesignSystem,
  listDesignSystems,
  createCollection,
  updateCollection,
  deleteCollection
} from '$lib/api/strapi';

function createUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'group';
}

function mapToken(token: any): TokenItem {
  // Strapi 5: attributes are flattened. Fallback to attributes for safety.
  const data = token.attributes || token;
  const type = (data.type as TokenType) || 'color';

  return {
    id: String(token.id ?? createUniqueId()),
    name: data.name ?? 'Untitled token',
    type,
    value: data.value,
    description: data.description ?? '',
    tokenData: {
      type,
      description: data.description ?? '',
      value: data.value,
      createdAt: data.createdAt ?? '',
      updatedAt: data.updatedAt ?? '',
      source: 'Strapi'
    }
  };
}

function mapTokensToCategories(tokens: any[], collectionId: number): CollectionItem[] {
  if (!tokens?.length) return [];

  const grouped = new Map<string, { displayName: string; tokens: TokenItem[] }>();

  tokens.forEach((token) => {
    const data = token.attributes || token;
    const displayName = data.group_path || 'Tokens';
    const key = slugify(displayName);
    const mappedToken = mapToken(token);

    if (!grouped.has(key)) {
      grouped.set(key, { displayName, tokens: [] });
    }

    grouped.get(key)?.tokens.push(mappedToken);
  });

  return Array.from(grouped.entries()).map(([key, group]) => ({
    id: `${collectionId}-${key}`,
    name: group.displayName,
    description: '',
    items: group.tokens
  }));
}

function mapCollectionsFromStrapi(designSystemData: any): Collection[] {
  if (Array.isArray(designSystemData)) {
    designSystemData = designSystemData[0];
  }

  if (!designSystemData) return [];

  // Strapi 5: attributes are flattened. 
  const dsData = designSystemData.attributes || designSystemData;

  // Handle relations: Strapi 5 returns array directly, Strapi 4 returns { data: [] }
  let collections = dsData.collections;
  if (collections && collections.data) {
    collections = collections.data;
  }
  collections = collections || [];

  return collections.map((collection: any) => {
    const colData = collection.attributes || collection;

    // Handle tokens relation
    let tokens = colData.tokens;
    if (tokens && tokens.data) {
      tokens = tokens.data;
    }
    tokens = tokens || [];

    const items = mapTokensToCategories(tokens, collection.id);

    return {
      id: String(collection.id),
      name: colData.name ?? `Collection ${collection.id}`,
      description: colData.description ?? '',
      items: items.length
        ? items
        : [
          {
            id: `${collection.id}-default`,
            name: 'Tokens',
            description: '',
            items: []
          }
        ]
    };
  });
}

function createCollectionsStore() {
  const { subscribe, set, update } = writable<Collection[]>([]);
  const snapshot = () => get({ subscribe });

  async function load(_customFetch?: typeof fetch) {
    if (!browser) return;

    try {
      // Try stored ID first; if missing or 404, fall back to first available design system.
      const storedId = localStorage.getItem('activeDesignSystemId');
      let designSystemData: any | null = null;

      if (storedId) {
        try {
          const ds = await getDesignSystem(storedId, { includeTokens: true });
          designSystemData = ds?.data ?? ds;
        } catch (error: any) {
          console.warn('Failed to load stored design system, will fallback to list.', error);
          localStorage.removeItem('activeDesignSystemId');
        }
      }

      if (!designSystemData) {
        const list = await listDesignSystems({ includeTokens: true });
        const first = list?.data?.[0];
        if (first?.id) {
          localStorage.setItem('activeDesignSystemId', String(first.id));
          designSystemData = first;
        }
      }

      if (!designSystemData) {
        set([]);
        throw new Error('No design system found. Please connect a repository.');
      }

      let collections = mapCollectionsFromStrapi(designSystemData);

      // Fallback: if collections didn't populate, fetch collections directly for this design system
      if (!collections.length && designSystemData.id) {
        try {
          const colRes = await getCollectionsByDesignSystem(Number(designSystemData.id), { includeTokens: true });
          collections = mapCollectionsFromStrapi({
            ...designSystemData,
            attributes: {
              ...(designSystemData.attributes ?? {}),
              collections: colRes?.data ? { data: colRes.data } : []
            }
          });
        } catch (err) {
          console.warn('Failed to fetch collections directly for design system', err);
        }
      }

      set(collections);
      console.log('Collections loaded from Strapi', collections);
    } catch (error) {
      console.error('Error loading collections from Strapi:', error);
      set([]);
      throw error;
    }
  }

  async function save(collections: Collection[], _customFetch?: typeof fetch) {
    // Persisting collection/category mutations to Strapi is not implemented yet.
    // We still update the local store to keep the UI in sync for the current session.
    set(collections);
    console.warn('Collections save called – persistence to Strapi not implemented yet.');
  }

  return {
    subscribe,
    set,
    update,
    load,
    save, // Keep for compatibility but warn
    reset() {
      set([]);
    },

    async createCollection(name: string) {
      if (!browser) return;
      try {
        const activeDS = await getActiveDesignSystem();
        const key = slugify(name);

        const result = await createCollection({
          name,
          key,
          description: '',
          design_system: activeDS.id
        });

        // Reload to reflect changes
        await load();
        return result.data;
      } catch (error) {
        console.error('Failed to create collection:', error);
        throw error;
      }
    },

    async renameCollection(id: string, newName: string) {
      if (!browser) return;
      try {
        await updateCollection(parseInt(id), { name: newName });
        await load();
      } catch (error) {
        console.error('Failed to rename collection:', error);
        throw error;
      }
    },

    async deleteCollection(id: string) {
      if (!browser) return;
      try {
        await deleteCollection(parseInt(id));
        await load();
      } catch (error) {
        console.error('Failed to delete collection:', error);
        throw error;
      }
    },

    // These are legacy local updates, we rely on page reload or re-fetch for tokens now
    // as TokenModal handles the creation directly.
    addToken: async () => await load(),
    deleteToken: async () => await load()
  };
}

export const collectionsStore = createCollectionsStore();
