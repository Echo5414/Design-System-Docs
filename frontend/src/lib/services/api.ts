import type { Collection, TokenItem, TokenData, TokenType, TokenValueType } from '$lib/types';

interface RawToken {
  id: string;
  name: string;
  type: TokenType;
  value: TokenValueType;
  description: string;
  createdAt: string;
  updatedAt: string;
  source: string;
}

class CollectionsAPI {
  private static instance: CollectionsAPI;
  private cache: Map<string, Collection[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): CollectionsAPI {
    if (!CollectionsAPI.instance) {
      CollectionsAPI.instance = new CollectionsAPI();
    }
    return CollectionsAPI.instance;
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry !== undefined && Date.now() < expiry;
  }

  private setCache(key: string, data: Collection[]): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.cacheDuration);
  }

  async getCollections(): Promise<Collection[]> {
    console.log('API: Fetching collections');

    try {
      const response = await fetch('/api/collections');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const collections = await response.json();
      console.log('API: Successfully fetched collections');

      // If collections is already in the correct format, return it directly
      if (Array.isArray(collections)) {
        return collections;
      }

      // Otherwise, transform the data into our Collection format
      return Object.entries(collections).map(([id, collection]) => ({
        id,
        name: id,
        items: [],
        ...(collection as Partial<Collection>)
      }));
    } catch (error) {
      console.error('API: Error fetching collections:', error);
      throw error;
    }
  }

  async saveCollections(collections: Collection[], customFetch?: typeof window.fetch): Promise<void> {
    console.log('API: Saving collections');
    const fetchFn = customFetch || window.fetch;

    try {
      const response = await fetchFn('/api/collections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collections),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('API: Successfully saved collections');
    } catch (error) {
      console.error('API: Error saving collections:', error);
      throw error;
    }
  }

  async createToken(tokenData: TokenData): Promise<TokenItem> {
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const token: TokenItem = {
        id: crypto.randomUUID(),
        name: data.type,
        type: data.type,
        value: data.value,
        description: data.description,
        tokenData: {
          type: data.type,
          value: data.value,
          description: data.description,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          source: data.source
        }
      };

      return token;
    } catch (error) {
      console.error('API: Error creating token:', error);
      throw error;
    }
  }
}

export default CollectionsAPI.getInstance(); 