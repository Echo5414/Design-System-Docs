# Quick Test Plan - TokenModal Strapi Integration

**Updated:** November 28, 2025 17:46 CET  
**Status:** ✅ Implemented, Ready to Test

---

## What Changed

**TokenModal.svelte** now:
- ✅ Fetches collections from Strapi (via `getActiveDesignSystem()`)
- ✅ Shows dropdown to select which collection
- ✅ Saves tokens to Strapi (via `createToken()`)
- ✅ Reloads page after save to show new tokens
- ✅ Handles errors gracefully with alerts

---

## How to Test

### 1. Prerequisites
- ✅ Backend running (`npm run develop` in `backend/`)
- ✅ Frontend running (`npm run dev` in `frontend/`)
- ✅ Logged in via GitHub OAuth
- ✅ Repository connected (Design System created in Strapi)

### 2. Test Steps

1. **Navigate to Dashboard**
   - Go to `http://localhost:5173/setup`
   - Login with GitHub
   - Connect to an existing repo (or create new one)
   - You should be redirected to `/dashboard`

2. **Open Token Modal**
   - Click on any collection in the sidebar
   - Look for an "Add Token" button
   - Click it to open the modal

3. **Create a Color Token**
   - **Collection dropdown:** Should show "Colors", "Typography", "Spacing"
   - **Name:** `primary-500`
   - **Type:** `color`
   - **Value:** Click color picker, choose blue (`#0057FF`)
   - **Description:** `Primary brand color`
   - Click **"Save Token"**

4. **Verify in Strapi Admin**
   - Open `http://localhost:1337/admin`
   - Navigate to **Content Manager** → **Token**
   - You should see a new token:
     - Name: `primary-500`
     - Full Path: `color.primary-500`
     - Type: `color`
     - Value: `#0057FF` (JSON)
     - Collection: Link to "Colors" collection

5. **Verify Page Reload**
   - After clicking "Save Token", the page should reload
   - The new token should appear in the token list (if implemented)

6. **Create a Typography Token**
   - Open modal again
   - **Collection:** Typography
   - **Name:** `heading-xl`
   - **Type:** `typography`
   - Fill in fields:
     - Font Family: `Inter`
     - Font Size: `32px`
     - Font Weight: `700`
     - Line Height: `40px`
     - Letter Spacing: `0`
   - **Save**
   - Verify in Strapi Admin

---

## Expected Behavior

### ✅ Success Case
- Modal opens with collection dropdown populated
- Form submits successfully
- Page reloads
- Token appears in Strapi Admin
- No JavaScript errors in console

### ❌ Error Cases

**Case 1: No Active Design System**
- **Trigger:** Open modal without connecting a repo
- **Expected:** Alert: "Failed to load collections"
- **Fix:** Connect a repo first

**Case 2: Network Error**
- **Trigger:** Backend down while saving
- **Expected:** Alert: "Failed to create token. Please try again."
- **Fix:** Restart backend

**Case 3: Invalid Token Data**
- **Trigger:** Empty name field
- **Expected:** HTML5 validation prevents submit
- **Fix:** Fill in required fields

---

## Known Limitations (Current Implementation)

1. **Page Reload Required**
   - After saving, the entire page reloads to show the new token
   - **Future:** Use Svelte stores to update UI instantly

2. **Token List Not Migrated Yet**
   - Tokens save to Strapi, but the dashboard still reads from `collections.json`
   - **Result:** New tokens won't appear in the list until dashboard is migrated
   - **Workaround:** Check Strapi Admin to verify tokens were created

3. **No Collection Creation**
   - Modal only shows existing collections
   - **Workaround:** Use Strapi Admin to add collections, or wait for Sidebar migration

4. **categoryId/group_path**
   - Currently uses `categoryId` from route params (if available)
   - Falls back to `'default'` if not present
   - **Future:** Add a "Group" input field in the modal

---

## Debugging Tips

### Check Browser Console
```javascript
// Should see this when modal opens:
"Loading collections..."

// If successful:
// (Network tab) GET /api/design-systems/{id}?populate=collections → 200
// (Console) No errors

// If failed:
"Failed to load collections: Error: ..."
```

### Check Network Tab
```
POST /api/tokens
Request Body:
{
  "data": {
    "name": "primary-500",
    "full_path": "color.primary-500",
    "type": "color",
    "value": "#0057FF",
    "description": "Primary brand color",
    "collection": 1
  }
}

Response: 200 OK
{
  "data": {
    "id": 1,
    "attributes": { ... }
  }
}
```

### Check Strapi Logs
```bash
# In backend terminal
[2025-11-28 17:XX:XX.XXX] http: POST /api/tokens (XXX ms) 200
```

---

## Next Steps After Successful Test

1. ✅ **TokenModal works** → Tokens save to Strapi
2. 🚧 **Migrate Dashboard Pages** → Read tokens from Strapi instead of `collections.json`
3. 🚧 **Migrate Sidebar** → Fetch collections from Strapi
4. 🚧 **Add Real-Time Updates** → Use Svelte stores instead of page reload

---

## Rollback Plan

If the new TokenModal causes issues:

1. **Keep the old version:**
   ```bash
   git checkout HEAD~1 frontend/src/lib/components/TokenModal.svelte
   ```

2. **Or revert to collections.json:**
   - Restore line 69 in TokenModal:
   ```typescript
   await collectionsStore.addToken(collectionId, categoryId, token);
   ```

---

**Test Status:** ⏳ Awaiting User Testing  
**Expected Date:** November 28, 2025
