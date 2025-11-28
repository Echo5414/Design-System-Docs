import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the absolute path to collections.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COLLECTIONS_PATH = path.join(__dirname, '..', '..', '..', 'lib', 'data', 'collections.json');

// Default empty collections structure
const DEFAULT_COLLECTIONS = {};

async function ensureDirectoryExists() {
    const dir = path.dirname(COLLECTIONS_PATH);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function readCollections() {
    try {
        await ensureDirectoryExists();
        try {
            const data = await fs.readFile(COLLECTIONS_PATH, 'utf-8');
            return JSON.parse(data);
        } catch (error: unknown) {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                // File doesn't exist yet, return default structure
                return DEFAULT_COLLECTIONS;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error reading collections:', error);
        throw new Error('Failed to read collections');
    }
}

async function writeCollections(collections: any) {
    try {
        await ensureDirectoryExists();
        await fs.writeFile(COLLECTIONS_PATH, JSON.stringify(collections, null, 2), 'utf-8');
        console.log('Successfully wrote to:', COLLECTIONS_PATH);
    } catch (error) {
        console.error('Error writing collections:', error);
        throw new Error('Failed to write collections');
    }
}

export const GET = (async () => {
    try {
        const collections = await readCollections();
        return json(collections);
    } catch (error) {
        console.error('GET collections error:', error);
        return new Response('Failed to fetch collections', { status: 500 });
    }
}) satisfies RequestHandler;

export const PUT = (async ({ request }) => {
    try {
        const collections = await request.json();
        await writeCollections(collections);
        return json({ success: true });
    } catch (error) {
        console.error('PUT collections error:', error);
        return new Response('Failed to save collections', { status: 500 });
    }
}) satisfies RequestHandler; 