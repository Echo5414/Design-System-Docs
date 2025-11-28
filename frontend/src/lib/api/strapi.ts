const STRAPI_URL = 'http://localhost:1337';

type DesignSystemFetchOptions = {
    includeTokens?: boolean;
};

export async function strapiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${STRAPI_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include' // Important for cookies
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ error: { message: response.statusText } }));
        const err: any = new Error(errorPayload.error?.message || 'API Request Failed');
        err.status = response.status;
        throw err;
    }

    return response.json();
}

function buildPopulateQuery(options?: DesignSystemFetchOptions) {
    const params = new URLSearchParams();
    if (options?.includeTokens) {
        // Explicitly define the fields to populate to avoid circular issues
        params.append('populate[collections][populate]', 'tokens');
    } else {
        params.append('populate', 'collections');
    }
    return params.toString();
}

export async function listDesignSystems(options?: DesignSystemFetchOptions) {
    const populate = buildPopulateQuery(options);
    return strapiFetch(`/api/design-systems?sort=updatedAt:desc&${populate}`);
}

// Design System
export async function getDesignSystem(id: number | string, options?: DesignSystemFetchOptions) {
    console.log('[Strapi] Fetching design system:', id, typeof id);
    const populate = buildPopulateQuery(options);
    try {
        const result = await strapiFetch(`/api/design-systems/${id}?${populate}`);
        console.log('[Strapi] Design system fetched successfully:', result);
        return result;
    } catch (error: any) {
        if (error.status === 404) {
            console.warn('[Strapi] Design system not found (404), caller handles fallback.');
        } else {
            console.error('[Strapi] Failed to fetch design system:', error);
        }
        throw error;
    }
}

export async function getActiveDesignSystem(options?: DesignSystemFetchOptions) {
    let id = localStorage.getItem('activeDesignSystemId');
    console.log('[Strapi] Active design system ID from localStorage:', id);

    if (id === 'NaN' || id === 'undefined' || id === 'null') {
        console.warn('[Strapi] Invalid ID in localStorage, clearing.');
        localStorage.removeItem('activeDesignSystemId');
        id = null;
    }

    let record: any | null = null;

    // Try using stored id first
    if (id) {
        try {
            const dsResult = await getDesignSystem(id, options);
            record = dsResult?.data ?? null;
        } catch (error: any) {
            console.error('[Strapi] Failed to fetch stored design system, clearing localStorage.', error);
            localStorage.removeItem('activeDesignSystemId');
            if (error?.status && error.status !== 404) throw error;
        }
    }

    // Fallback: fetch first available design system
    if (!record) {
        const list = await listDesignSystems(options);
        console.log('[Strapi] List design systems response:', list);
        const first = list?.data?.[0];
        if (first) {
            const idToStore = first.documentId || first.id;
            localStorage.setItem('activeDesignSystemId', String(idToStore));
            record = first;
        }
    }

    if (!record) {
        throw new Error('No design system found. Please connect a repository.');
    }

    return record;
}

// Collections
export async function getCollection(id: number) {
    return strapiFetch(`/api/token-collections/${id}?populate=tokens`);
}

export async function createCollection(data: { name: string; key: string; description?: string; design_system: number }) {
    return strapiFetch('/api/token-collections', {
        method: 'POST',
        body: JSON.stringify({ data })
    });
}

export async function updateCollection(id: number, data: { name?: string; key?: string; description?: string }) {
    return strapiFetch(`/api/token-collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data })
    });
}

export async function deleteCollection(id: number) {
    return strapiFetch(`/api/token-collections/${id}`, {
        method: 'DELETE'
    });
}

// Tokens
export async function getToken(id: number) {
    return strapiFetch(`/api/tokens/${id}`);
}

export async function createToken(data: {
    name: string;
    full_path: string;
    value: any;
    type: string;
    collection: number;
    group_path?: string;
    description?: string;
    deprecated?: boolean;
    alias_to?: string;
    extensions?: any;
}) {
    return strapiFetch('/api/tokens', {
        method: 'POST',
        body: JSON.stringify({ data })
    });
}

export async function updateToken(id: number, data: any) {
    return strapiFetch(`/api/tokens/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data })
    });
}

export async function deleteToken(id: number) {
    return strapiFetch(`/api/tokens/${id}`, {
        method: 'DELETE'
    });
}

export async function getCollectionsByDesignSystem(designSystemId: number, options?: { includeTokens?: boolean }) {
    const params = new URLSearchParams();
    params.append('filters[design_system][id][$eq]', String(designSystemId));

    if (options?.includeTokens) {
        params.append('populate', 'tokens');
    }

    return strapiFetch(`/api/token-collections?${params.toString()}`);
}
