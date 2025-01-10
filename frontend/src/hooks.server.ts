import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Handle } from '@sveltejs/kit';

// Default collections structure
const defaultCollections = {
    "Primitives": {
        "description": "All base (primitive) tokens go here.",
        "extensions": {
            "com.username.myapp": {
                "id": crypto.randomUUID()
            }
        },
        "Colors": {
            "description": "Primitive color tokens.",
            "extensions": {
                "com.username.myapp": {
                    "id": crypto.randomUUID()
                }
            }
        },
        "Typography": {
            "description": "Primitive typography tokens.",
            "extensions": {
                "com.username.myapp": {
                    "id": crypto.randomUUID()
                }
            }
        }
    }
};

// Get absolute path to collections.json
const collectionsPath = resolve(process.cwd(), 'src/lib/data/collections.json');
console.log('Collections file path:', collectionsPath);

// Initialize collections from file if it doesn't exist
try {
    console.log('Checking for collections file...');
    const exists = readFileSync(collectionsPath, 'utf-8');
    console.log('Collections file exists');
} catch (error) {
    console.log('No collections file found, creating with defaults');
    writeFileSync(collectionsPath, JSON.stringify(defaultCollections, null, 2));
}

export const handle: Handle = async ({ event, resolve }) => {
    return await resolve(event);
}; 