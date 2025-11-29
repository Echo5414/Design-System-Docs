/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module '$app/stores' {
	import type { Readable } from 'svelte/store';
	import type { Navigation, Page } from '@sveltejs/kit';

	export const page: Readable<Page>;
	export const navigating: Readable<Navigation | null>;
}

declare module '$app/navigation' {
	export function goto(
		url: string | URL,
		opts?: {
			replaceState?: boolean;
			noscroll?: boolean;
			keepfocus?: boolean;
			state?: any;
		}
	): Promise<void>;
}

declare module 'svelte/runes' {
	export interface State<T> {
		value: T;
		get: () => T;
		set: (value: T) => void;
	}

	export interface Derived<T> {
		value: T;
		get: () => T;
	}

	export function state<T>(value: T): State<T>;
	export function derived<T>(fn: () => T): Derived<T>;
}

declare module '$lib/stores/collections' {
	import type { Collection } from '$lib/types';
	import type { Readable } from 'svelte/store';

	export const collections: Readable<Collection[]> & {
		load: (customFetch?: typeof fetch) => Promise<void>;
		save: (collections: Collection[], customFetch?: typeof fetch) => Promise<void>;
		reset: () => void;
	};
}

declare module '$lib/types' {
	export interface Extension {
		id: string;
		[key: string]: any;
	}

	export interface Extensions {
		'com.username.myapp': Extension;
		[key: string]: Extension;
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

	export interface TokenItem {
		id: string;
		documentId?: string;
		name: string;
		type: TokenType;
		value: TokenValueType;
		description?: string;
		tokenData?: TokenData;
		extensions?: Extensions;
	}

	export type TokenType = 'color' | 'typography' | 'spacing' | 'dimension';

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

	export interface TokenData {
		type: TokenType;
		description: string;
		value: TokenValueType;
		createdAt: string;
		updatedAt: string;
		source?: string;
	}
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				isAuthenticated: boolean;
				returnTo?: string;
			};
		}
		interface PageData {
			error?: string | null;
			isAuthenticated: boolean;
		}
		// interface Platform {}
	}
}

export {};
