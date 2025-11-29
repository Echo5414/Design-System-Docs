// frontend/src/lib/types.ts

// Remove the type declarations since they're in app.d.ts
// Instead, we'll use the global types directly

// Base interface for shared properties
interface BaseItem {
  id: string;
  name: string;
  description?: string;
}

// Token interface with all properties
export interface TokenItem extends BaseItem {
  documentId?: string;
  type: TokenType;
  value: TokenValueType;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  items?: TokenItem[];
}

// Collection item (category)
export interface CollectionItem extends BaseItem {
  items?: TokenItem[];
}

// Collection
export interface Collection extends BaseItem {
  items: CollectionItem[];
}

// Re-export Token as TokenItem for backward compatibility
export type Token = TokenItem;
