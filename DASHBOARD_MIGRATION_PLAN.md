# Dashboard Migration to Strapi - Implementation Plan

**Date:** November 28, 2025  
**Status:** Ready to Implement  
**Blocker Identified:** TokenModal saves to `collections.json` instead of Strapi

---

## 🎯 Objective

Migrate the Dashboard from using `frontend/src/lib/data/collections.json` (local file) to the Strapi API, enabling multi-user collaboration and Draft→Publish workflow.

##Current Architecture

- **Sidebar**: Reads from `collectionsStore` (wraps `collections.json`)
- **TokenModal**: Saves tokens via `collectionsStore.addToken()` → writes to `collections.json`
- **Dashboard pages**: Read from `collectionsStore`

## ✅ What's Already Done

1. **Strapi Content Types** created with W3C-compliant schema
2. **Permissions granted** for all CRUD operations
3. **API client (`strapi.ts`)** ready with helper functions
4. **Connect Repo flow** creates Design System + default collections in Strapi

## 🚧 What Needs Migration

### 1. **TokenModal.svelte** (HIGH PRIORITY - User's Blocker)

**Current Code** (line 69-70):
```typescript
await collectionsStore.addToken(collectionId, categoryId, token);
```

**New Code** (using Strapi):
```typescript
import { createToken } from '$lib/api/strapi';
import { browser } from '$app/environment';

// Get activeDesignSystemId from localStorage
const designSystemId = browser ? localStorage.getItem('activeDesignSystemId') : null;
if (!designSystemId) throw new Error('No active design system');

// Map UI data to Strapi schema
const tokenData = {
  name: tokenName,
  full_path: `${collectionKey}.${categoryName}.${tokenName}`, // e.g. "color.brand.primary"
  group_path: categoryName, // e.g. "brand"
  type: tokenType, // "color", "typography", etc.
  value: parseTokenValue(tokenType, tokenValue), // JSON value
  description: tokenDescription,
  collection: parseInt(collectionId), // Strapi collection ID
};

await createToken(tokenData);
```

**Challenge:**
- `collectionId` and `categoryId` are currently **local IDs** (e.g., `"id-1764345459804"`).
- We need **Strapi IDs** (numeric, e.g., `1`, `2`, `3`).

**Solution:**
- When fetching collections from Strapi, store a mapping: `localId → strapiId`.
- Or: **Change routing** to use Strapi IDs: `/dashboard/1` instead of `/dashboard/id-17643...`.

### 2. **Sidebar.svelte**

**Current:** Reads `$collectionsStore` (from `collections.json`)  
**New:** Fetch from Strapi on mount

```typescript
import { onMount } from 'svelte';
import { getActiveDesignSystem } from '$lib/api/strapi';

let collections = $state([]);
let isLoading = $state(true);

onMount(async () => {
  try {
    const { data } = await getActiveDesignSystem();
    collections = data.attributes.collections.data.map((col: any) => ({
      id: col.id,
      name: col.attributes.name,
      key: col.attributes.key,
      items: col.attributes.tokens?.data || []
    }));
  } catch (error) {
    console.error('Failed to load collections:', error);
  } finally {
    isLoading = false;
  }
});
```

**Challenges:**
- **Drag-and-drop reordering**: Currently saves to `collections.json`. For Strapi, you'd need to add a `position` field or disable reordering temporarily.
- **Add/Edit/Delete Collection**: Replace `collectionsStore.save()` calls with `createCollection()`, `updateCollection()`, `deleteCollection()` from `strapi.ts`.

### 3. **Dashboard Pages**

**Files to Update:**
- `frontend/src/routes/(protected)/dashboard/+page.svelte` (overview)
- `frontend/src/routes/(protected)/dashboard/[collectionId]/+page.svelte` (collection detail)
- `frontend/src/routes/(protected)/dashboard/[collectionId]/[categoryId]/+page.svelte` (category/token list)

**Current:** Load from `$collectionsStore`  
**New:** Use SvelteKit's `+page.ts` or `+page.server.ts` to fetch from Strapi

Example for `[collectionId]/+page.ts`:
```typescript
import { getCollection } from '$lib/api/strapi';

export async function load({ params }) {
  const { data } = await getCollection(parseInt(params.collectionId));
  
  return {
    collection: {
      id: data.id,
      name: data.attributes.name,
      key: data.attributes.key,
      tokens: data.attributes.tokens?.data || []
    }
  };
}
```

---

## 📝 Step-by-Step Implementation Guide

### Step 1: Update `activeDesignSystemId` Storage ✅ DONE
Already implemented in `setup/+page.svelte` (line 106).

### Step 2: Fix TokenModal (CRITICAL)

1. Open `frontend/src/lib/components/TokenModal.svelte`
2. Import Strapi helpers:
   ```typescript
   import { createToken } from '$lib/api/strapi';
   import { browser } from '$app/environment';
   ```
3. Replace `handleSubmit` function (lines 54-74) with Strapi version (see code above)
4. **Problem:** `collectionId` is a local ID. **Solution Options:**
   - **Option A (Quick Fix):** Store `strapiCollectionId` as a prop passed from parent
   - **Option B (Better):** Refactor routing to use Strapi IDs everywhere

### Step 3: Refactor Routing (RECOMMENDED)

**Old Routes:**
- `/dashboard/id-1764345459804` → Collection
- `/dashboard/id-1764345459804/id-1764345463682` → Category

**New Routes:**
- `/dashboard/1` → Collection (where `1` is Strapi collection ID)
- `/dashboard/1/2` → Token detail (where `2` is Strapi token ID)

**Benefits:**
- Simpler ID management
- Easier to share URLs
- Direct mapping to Strapi

**Changes Required:**
- Update all `goto(\`/dashboard/${collection.id}\`)` calls to use Strapi IDs
- Update Sidebar links
- Update page routes to expect numeric IDs

### Step 4: Migrate Sidebar

1. Replace `collectionsStore` import with Strapi fetch
2. Update `createNewCollection` to call `createCollection()` from Strapi
3. Update delete/rename functions to use Strapi API
4. **Skip drag-and-drop** for now (add `position` field later if needed)

### Step 5: Migrate Dashboard Pages

1. Add `+page.ts` files to use SvelteKit's data loading
2. Fetch collections/tokens from Strapi
3. Update UI to display loaded data

### Step 6: Test End-to-End

1. Login → Connect Repo
2. Navigate to Dashboard
3. Add a Token
4. Verify it appears in Strapi Admin (`http://localhost:1337/admin`)
5. Refresh page → token should persist

---

## 🔧 Quick Win: Minimal TokenModal Fix

If you want tokens to save to Strapi **right now** without changing routes:

1. **Add `strapiCollectionId` prop** to TokenModal:
   ```svelte
   export let collectionId: string;  // Keep for backward compat
   export let strapiCollectionId: number;  // NEW: Strapi ID
   ```

2. **Update `handleSubmit`**:
   ```typescript
   const designSystemId = browser ? localStorage.getItem('activeDesignSystemId') : null;
   
   await createToken({
     name: tokenName,
     full_path: `${collectionKey}.${tokenName}`,
     type: tokenType,
     value: parseTokenValue(tokenType, tokenValue),
     description: tokenDescription,
     collection: strapiCollectionId  // Use Strapi ID
   });
   ```

3. **Pass Strapi ID from parent** (wherever TokenModal is used):
   ```svelte
   <TokenModal 
     bind:isOpen={isModalOpen} 
     collectionId={localCollectionId}
     strapiCollectionId={strapiCollectionId}  <!-- NEW -->
     categoryId={categoryId} 
   />
   ```

This way, tokens save to Strapi while you refactor routing later.

---

## 📦 Files to Modify (Summary)

| File | Action | Priority |
|------|--------|----------|
| `TokenModal.svelte` | Replace `collectionsStore.addToken()` with `createToken()` | **CRITICAL** |
| `Sidebar.svelte` | Fetch collections from Strapi on mount | High |
| `dashboard/+page.svelte` | Add `+page.ts`, fetch from Strapi | Medium |
| `dashboard/[collectionId]/+page.svelte` | Add `+page.ts`, fetch collection | Medium |
| `collectionsStore.ts` | Deprecate or refactor to use Strapi | Low (optional) |

---

## 🚀 Next Session Checklist

- [ ] Fix TokenModal to save to Strapi (Quick Win approach)
- [ ] Test token creation end-to-end
- [ ] Decide: Refactor routing to use Strapi IDs? (Yes recommended)
- [ ] Migrate Sidebar fetch logic
- [ ] Add loading states for API calls
- [ ] Handle errors gracefully (show toast/notification)

---

## 📚 Reference

- **Strapi API Docs**: `http://localhost:1337/documentation` (if enabled)
- **W3C Spec**: https://tr.designtokens.org/format/
- **SvelteKit Loading Data**: https://kit.svelte.dev/docs/load

---

**End of Migration Plan**
