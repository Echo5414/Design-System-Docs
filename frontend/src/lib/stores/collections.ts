import { writable, get } from 'svelte/store';
import type { Collection } from '../types';
import collectionsAPI from '$lib/services/api';
import collectionsData from '../data/collections.json';

function createCollectionsStore() {
  const { subscribe, set, update } = writable<Collection[]>([]);

  function createUniqueId() {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function transformCollections(data: Record<string, any>) {
    return Object.entries(data)
      .filter(([key]) => key !== 'description' && key !== 'extensions')
      .map(([name, data]: [string, any]) => ({
        id: data.extensions?.['com.username.myapp']?.id || createUniqueId(),
        name,
        description: data.description || '',
        items: Object.entries(data)
          .filter(([key]) => key !== 'description' && key !== 'extensions')
          .map(([categoryName, categoryData]: [string, any]) => ({
            id: categoryData.extensions?.['com.username.myapp']?.id || createUniqueId(),
            name: categoryName,
            description: categoryData.description || '',
            items: Object.entries(categoryData)
              .filter(([key]) => key !== 'description' && key !== 'extensions')
              .map(([tokenName, tokenData]: [string, any]) => ({
                id: tokenData.extensions?.['com.username.myapp']?.id || createUniqueId(),
                name: tokenName,
                value: tokenData.value,
                type: tokenData.type,
                description: tokenData.description || ''
              }))
          }))
      }));
  }

  return {
    subscribe,
    set,
    update,

    async save(collections: Collection[]) {
      try {
        // Transform collections back to JSON format
        const collectionsJson = collections.reduce((acc: Record<string, any>, collection) => {
          acc[collection.name] = {
            description: collection.description || '',
            extensions: {
              'com.username.myapp': {
                id: collection.id
              }
            }
          };

          // Add categories as top-level entries under the collection
          collection.items.forEach(category => {
            acc[collection.name][category.name] = {
              description: category.description || '',
              extensions: {
                'com.username.myapp': {
                  id: category.id
                }
              }
            };

            // Add tokens under each category
            if (category.items) {
              category.items.forEach(token => {
                acc[collection.name][category.name][token.name] = {
                  value: token.value,
                  type: token.type,
                  description: token.description || '',
                  extensions: {
                    'com.username.myapp': {
                      id: token.id
                    }
                  }
                };
              });
            }
          });

          return acc;
        }, {});

        // Save through the API to write to collections.json
        await collectionsAPI.saveCollections(collectionsJson, fetch);
        
        // Update the local store
        set(collections);
        
        console.log('Collections saved successfully');
      } catch (error) {
        console.error('Error saving collections:', error);
        throw error;
      }
    },

    async load() {
      try {
        if (import.meta.env.DEV) {
          // In development, load from local collections.json
          const collections = transformCollections(collectionsData);
          set(collections);
          console.log('Collections loaded from local JSON');
        } else {
          // In production, load from API
          const rawData = await collectionsAPI.getCollections(fetch);
          const collections = transformCollections(rawData);
          set(collections);
          console.log('Collections loaded from API');
        }
      } catch (error) {
        console.error('Error loading collections:', error);
        throw error;
      }
    },

    addToken(collectionId: string, categoryId: string, token: any) {
      update(collections => {
        const collection = collections.find(c => c.id === collectionId);
        if (collection) {
          const category = collection.items.find(item => item.id === categoryId);
          if (category) {
            if (!category.items) {
              category.items = [];
            }
            category.items.push({
              ...token,
              id: createUniqueId()
            });
          }
        }
        return collections;
      });

      // Save changes after updating
      this.save(get(this));
    },

    deleteToken(collectionId: string, categoryId: string, tokenId: string) {
      update(collections => {
        const collection = collections.find(c => c.id === collectionId);
        if (collection) {
          const category = collection.items.find(item => item.id === categoryId);
          if (category && category.items) {
            category.items = category.items.filter(token => token.id !== tokenId);
          }
        }
        return collections;
      });

      // Save changes after updating
      this.save(get(this));
    }
  };
}

export const collectionsStore = createCollectionsStore(); 