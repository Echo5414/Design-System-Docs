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
  const docId = token.documentId || data.documentId || token.id || createUniqueId();

  return {
    id: String(docId),
    documentId: String(docId),
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

function mapCollectionsFromStrapi(designSystemData: any, groupsByCollection?: Record<string, any[]>): Collection[] {
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

    // Handle groups relation
    let groups = colData.groups;
    if (groups && groups.data) {
      groups = groups.data;
    } else if (Array.isArray(groups)) {
      groups = groups;
    } else if (groupsByCollection && groupsByCollection[String(collection.id)]) {
      groups = groupsByCollection[String(collection.id)];
    } else {
      groups = [];
    }
    console.debug('[Collections] groups for collection', colData.name, groups);

    // Group tokens by group relation; ungrouped tokens sit under "Ungrouped"
    const ungroupedTokens = tokens.filter((t: any) => {
      const data = t.attributes || t;
      return !data.group;
    }).map(mapToken);

    const mappedGroups: CollectionItem[] = groups.map((group: any) => {
      const gData = group.attributes || group;
      const groupId = group.documentId || gData.documentId || group.id;
      const groupTokens = tokens
        .filter((t: any) => {
          const data = t.attributes || t;
          const rel = data.group;
          const relId = rel?.documentId || rel?.id;
          return relId && String(relId) === String(groupId);
        })
        .map(mapToken);

      return {
        id: String(groupId),
        name: gData.name ?? 'Group',
        description: gData.description ?? '',
        items: groupTokens
      };
    });

    const items: CollectionItem[] = [];

    if (ungroupedTokens.length) {
      items.push({
        id: `${collection.id}-ungrouped`,
        name: 'Ungrouped',
        description: '',
        items: ungroupedTokens
      });
    }

    items.push(...mappedGroups);

    return {
      id: String(collection.id),
      name: colData.name ?? `Collection ${collection.id}`,
      description: colData.description ?? '',
      items
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
          const ds = await getDesignSystem(storedId, { includeTokens: true, includeGroups: true });
          designSystemData = ds?.data ?? ds;
        } catch (error: any) {
          console.warn('Failed to load stored design system, will fallback to list.', error);
          localStorage.removeItem('activeDesignSystemId');
        }
      }

      if (!designSystemData) {
        const list = await listDesignSystems({ includeTokens: true, includeGroups: true });
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

      // Fetch groups separately to ensure they are present
      let groupsByCollection: Record<string, any[]> = {};
      try {
        const groupsRes = await import('$lib/api/strapi').then(({ getGroupsByDesignSystem }) =>
          getGroupsByDesignSystem(String(designSystemData.id))
        );
        const groupsData = groupsRes?.data || [];
        groupsData.forEach((g: any) => {
          const gData = g.attributes || g;
          const collectionId = gData.collection?.data?.id || gData.collection?.id || gData.collection;
          if (collectionId) {
            groupsByCollection[collectionId] = groupsByCollection[collectionId] || [];
            groupsByCollection[collectionId].push(g);
          }
        });
      } catch (err) {
        console.warn('Failed to fetch groups directly for design system', err);
      }

      // Use designSystemData (already populated) plus extra groups map
      let collections: Collection[] = mapCollectionsFromStrapi(designSystemData, groupsByCollection);

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

    async createGroup(collectionId: string, name: string) {
      if (!browser) return;
      try {
        await import('$lib/api/strapi').then(async ({ createGroup }) => {
          const slug = slugify(name);
          await createGroup({
            name,
            slug,
            collection: collectionId,
          });
        });
      } catch (error) {
        console.error('Failed to create group:', error);
        throw error;
      }
    },

    async renameCollection(id: string, newName: string) {
      if (!browser) return;
      try {
        await updateCollection(id, { name: newName });
        await load();
      } catch (error) {
        console.error('Failed to rename collection:', error);
        throw error;
      }
    },

    async deleteCollection(id: string) {
      if (!browser) return;
      try {
        await deleteCollection(id);
        await load();
      } catch (error) {
        console.error('Failed to delete collection:', error);
        throw error;
      }
    },

    async renameGroup(id: string, newName: string) {
      if (!browser) return;
      const { updateGroup } = await import('$lib/api/strapi');
      await updateGroup(id, { name: newName });
      await load();
    },

    // These are legacy local updates, we rely on page reload or re-fetch for tokens now
    // as TokenModal handles the creation directly.
    addToken: async () => await load(),
    deleteToken: async () => await load()
  };
}

export const collectionsStore = createCollectionsStore();
