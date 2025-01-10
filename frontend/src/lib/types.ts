export interface Extension {
  id: string;
  [key: string]: any;
}

export interface Extensions {
  'com.username.myapp': Extension;
  [key: string]: Extension;
}

export interface TypographyValue {
  'font-family': string;
  'font-size': string;
  'font-weight': number;
  'line-height': string;
  'letter-spacing': string;
}

export interface DimensionValue {
  value: string | number;
  unit: string;
}

export type TokenValueType = string | DimensionValue | TypographyValue;

export interface TokenDefinition {
  value: TokenValueType;
  type: TokenType;
  description: string;
  extensions?: Extensions;
}

export interface CollectionGroup {
  description: string;
  extensions?: Extensions;
  [key: string]: TokenDefinition | string | Extensions | undefined;
}

export interface CollectionData {
  description: string;
  extensions?: Extensions;
  [key: string]: CollectionGroup | string | Extensions | undefined;
}

export interface CollectionsFile {
  [key: string]: CollectionData;
}

// Our internal representation for the UI
export interface TokenItem {
  id: string;
  name: string;
  type: TokenType;
  value: TokenValueType;
  description?: string;
  tokenData?: TokenData;
  extensions?: Extensions;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  items: CollectionItem[];
  extensions?: Extensions;
}

export interface CollectionItem {
  id: string;
  name: string;
  description?: string;
  items?: TokenItem[];
  extensions?: Extensions;
}

export type TokenType = 'color' | 'typography' | 'spacing' | 'dimension';

export interface TokenData {
  type: TokenType;
  description: string;
  value: TokenValueType;
  createdAt: string;
  updatedAt: string;
  source?: string;
}

// UI state interfaces (not persisted to database)
export interface CollectionUIState {
  id: string;
  isOpen: boolean;
} 