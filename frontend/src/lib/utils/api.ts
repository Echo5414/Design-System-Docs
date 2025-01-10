/**
 * Helper function for making authenticated API calls
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const jwt = localStorage.getItem('jwt');
    
    if (!jwt) {
        throw new Error('No authentication token found');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${jwt}`);

    const response = await fetch(`/api/${endpoint.replace(/^\//, '')}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return response.json();
}

/**
 * Get collections data
 */
export async function getCollections() {
    return fetchApi('collections');
}

/**
 * Update collections data
 */
export async function updateCollections(collections: any) {
    return fetchApi('collections', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(collections)
    });
} 