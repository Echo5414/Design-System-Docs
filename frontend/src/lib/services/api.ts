import type { Collection } from '../types';

interface CollectionJson {
  description: string;
  extensions: {
    'com.username.myapp': {
      id: string;
    };
  };
  [key: string]: any;
}

const BASE_URL = '/api';

const collectionsAPI = {
  async getCollections(fetchFn = fetch) {
    const response = await fetchFn(`${BASE_URL}/collections`);
    if (!response.ok) {
      console.error('Failed to fetch collections:', await response.text());
      throw new Error('Failed to fetch collections');
    }
    return response.json();
  },

  async saveCollections(collections: any, fetchFn = fetch) {
    const response = await fetchFn(`${BASE_URL}/collections`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collections),
    });
    if (!response.ok) {
      console.error('Failed to save collections:', await response.text());
      throw new Error('Failed to save collections');
    }
    return response.json();
  },
};

export default collectionsAPI; 