import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(process.cwd(), 'src/lib/data/collections.json');

// Cache for collections data
let collectionsCache: any = null;
let lastReadTime = 0;
const CACHE_TTL = 5000; // 5 seconds

// Initialize collections file if it doesn't exist
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({
        "Primitives": {
            "description": "All base (primitive) tokens go here.",
            "extensions": {
                "com.username.myapp": {
                    "id": crypto.randomUUID()
                }
            }
        }
    }, null, 2));
}

function readCollections() {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (collectionsCache && (now - lastReadTime) < CACHE_TTL) {
        return collectionsCache;
    }

    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        collectionsCache = JSON.parse(data);
        lastReadTime = now;
        return collectionsCache;
    } catch (error) {
        console.error('API: Error reading collections:', error);
        return {};
    }
}

function writeCollections(collections: Record<string, any>) {
    try {
        if (typeof collections !== 'object' || collections === null) {
            console.error('API: Invalid collections data - not an object');
            return false;
        }

        fs.writeFileSync(dataPath, JSON.stringify(collections, null, 2));
        // Update cache
        collectionsCache = collections;
        lastReadTime = Date.now();
        return true;
    } catch (error) {
        console.error('API: Error writing collections:', error);
        return false;
    }
}

export const GET: RequestHandler = async () => {
    const collections = readCollections();
    return json(collections);
};

export const PUT: RequestHandler = async ({ request }) => {
    const collections = await request.json();
    if (writeCollections(collections)) {
        return json({ success: true });
    }
    return json({ success: false }, { status: 500 });
}; 