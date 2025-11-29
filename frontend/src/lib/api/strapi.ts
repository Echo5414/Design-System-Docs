const STRAPI_URL = 'http://localhost:1337';

type DesignSystemFetchOptions = {
    includeTokens?: boolean;
    includeGroups?: boolean;
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
    params.append('populate', 'collections');

    if (options?.includeGroups) {
        params.append('populate[collections][populate][groups]', '*');
    }

    if (options?.includeTokens) {
        params.append('populate[collections][populate][tokens][populate]', 'group');
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
export async function getCollection(id: number | string) {
    return strapiFetch(`/api/token-collections/${id}?populate=groups,tokens`);
}

export async function createCollection(data: { name: string; key: string; description?: string; design_system: number | string }) {
    return strapiFetch('/api/token-collections', {
        method: 'POST',
        body: JSON.stringify({ data })
    });
}

export async function updateCollection(id: number | string, data: { name?: string; key?: string; description?: string }) {
    return strapiFetch(`/api/token-collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data })
    });
}

export async function deleteCollection(id: number | string) {
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
    collection: number | string;
    group?: number | string | null;
    group_path?: string | null;
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

export async function updateToken(id: number | string, data: any) {
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

export async function getCollectionsByDesignSystem(
    designSystemId: number | string,
    options?: { includeTokens?: boolean; includeGroups?: boolean }
) {
    const params = new URLSearchParams();
    params.append('filters[design_system][id][$eq]', String(designSystemId));

    // Always include groups so we can render empty groups
    params.append('populate[groups]', '*');

    if (options?.includeTokens) {
        params.append('populate[tokens][populate]', 'group');
    }

    return strapiFetch(`/api/token-collections?${params.toString()}`);
}

export async function getGroupsByDesignSystem(designSystemId: number | string) {
    const params = new URLSearchParams();
    params.append('filters[collection][design_system][id][$eq]', String(designSystemId));
    params.append('populate', 'collection');
    return strapiFetch(`/api/token-groups?${params.toString()}`);
}

// Token Groups
export async function createGroup(data: { name: string; slug?: string; description?: string; order?: number; collection: number | string }) {
    return strapiFetch('/api/token-groups', {
        method: 'POST',
        body: JSON.stringify({ data })
    });
}

export async function updateGroup(id: number | string, data: { name?: string; slug?: string; description?: string; order?: number }) {
    return strapiFetch(`/api/token-groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data })
    });
}

export async function deleteGroup(id: number | string) {
    return strapiFetch(`/api/token-groups/${id}`, {
        method: 'DELETE'
    });
}
