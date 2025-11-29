# Design-System-Docs

A W3C Design Tokens-compliant platform for managing design tokens with GitHub integration and multi-platform distribution.

## 🎯 Project Vision

This platform serves as a **centralized design token management system** where:
- Design teams can create and edit tokens through a web UI
- Tokens are stored in **GitHub as the single source of truth** (W3C 2025.10 format)
- Multiple platforms (Web, Flutter, etc.) consume tokens from GitHub
- Optional Figma plugin allows editing tokens directly from Figma

## 🏗️ Architecture

**Stack:**
- **Frontend:** SvelteKit (Vite)
- **Backend:** Strapi 5.6.0 (Headless CMS)
- **Database:** SQLite (dev), can be swapped for PostgreSQL/MySQL (prod)
- **Authentication:** GitHub OAuth
- **Token Format:** W3C Design Tokens Spec 2025.10

**Flow:**
```
User → SvelteKit UI → Strapi API → SQLite (Draft State)
                                 ↓
                          GitHub Repo (Published State, W3C JSON)
                                 ↓
                   Consumers (Web, Flutter, Figma, etc.)
```

## ✅ Current Implementation Status

### Completed Features

#### **1. Authentication & GitHub Integration**
- ✅ GitHub OAuth login
- ✅ JWT stored in httpOnly cookies for security
- ✅ GitHub access token stored in httpOnly cookies
- ✅ Custom `jwt-cookie` middleware for Strapi authentication

#### **2. Repository Setup**
- ✅ Create new GitHub repositories via UI
- ✅ Connect to existing GitHub repositories
- ✅ Searchable repository list with live filtering
- ✅ Custom scrollbar styling matching design system

#### **3. Strapi Content Types (W3C-Compliant)**
- ✅ **Design System**
  - Fields: `name`, `slug`, `repo_owner`, `repo_name`, `branch`, `tokens_path`, `resolver_path`
  - Tracks: `last_published_commit_sha`, `last_published_at`, `last_synced_at`
  
- ✅ **Token Collection** (maps to W3C "groups")
  - Fields: `name`, `key`, `description`, `design_system` (relation)
  - Examples: Colors, Typography, Spacing
  
- ✅ **Token** (W3C Design Token)
  - Fields: `name`, `full_path`, `group_path`, `type`, `value` (JSON), `description`
  - Supports: `deprecated`, `alias_to`, `extensions`
  - Types: color, dimension, fontFamily, fontWeight, duration, typography, shadow, gradient, etc.

#### **4. API Endpoints**
- ✅ `POST /api/github/create-repo` - Create new GitHub repository
- ✅ `GET /api/github/repos` - List user's GitHub repositories
- ✅ `POST /api/design-system/connect` - Connect repo & create Design System + default collections
- ✅ Full CRUD endpoints for Design Systems, Token Collections, Tokens (via Strapi)

#### **5. Permissions**
All endpoints secured with proper role-based permissions for "Authenticated" users.

### 🚧 In Progress

#### **Dashboard Migration to Strapi** (Current Task)
- 🔄 Migrating from `collections.json` (local file) to Strapi API
- Components to update:
  - Sidebar (fetch collections from Strapi)
  - TokenModal (POST/PUT tokens to Strapi)
  - Token list pages (fetch from Strapi)

### 📋 Planned Features

#### **Phase 2: Draft → Publish Flow**
- "Publish Changes" button in UI
- Strapi reads draft tokens → generates W3C JSON → commits to GitHub
- Revision history (Git commit log)
- Rollback capability

#### **Phase 3: GitHub Token Import**
- Parse existing W3C tokens from GitHub when connecting repo
- Sync GitHub → Strapi on initial connection

#### **Phase 4: Figma Plugin**
- Extract Figma variables/styles
- Convert to W3C tokens
- Push to Strapi → GitHub

#### **Phase 5: Multi-Platform Export**
- Style Dictionary integration
- Generate platform-specific outputs (CSS, Dart, Swift, etc.)

## 📁 Project Structure

```
Design-System-Docs/
├── backend/                    # Strapi backend
│   ├── src/
│   │   ├── api/
│   │   │   ├── design-system/  # Design System content type
│   │   │   ├── token-collection/
│   │   │   ├── token/
│   │   │   └── github/         # GitHub integration controllers
│   │   ├── middlewares/
│   │   │   ├── jwt-cookie.ts   # Custom JWT authentication
│   │   │   └── github-callback.ts
│   │   └── index.ts            # Permissions setup
│   └── .env                    # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
│
├── frontend/                   # SvelteKit frontend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── (protected)/
│   │   │   │   ├── setup/      # Repository connection UI
│   │   │   │   └── dashboard/  # Token management UI
│   │   │   ├── +page.server.ts # OAuth callback handler
│   │   │   └── +layout.svelte
│   │   ├── lib/
│   │   │   ├── api/strapi.ts   # Strapi API client
│   │   │   └── components/     # Reusable UI components
│   │   └── hooks.server.ts     # Auth hooks
│   └── vite.config.ts
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- GitHub OAuth App credentials

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Design-System-Docs
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   echo "GITHUB_CLIENT_ID=your_client_id" > .env
   echo "GITHUB_CLIENT_SECRET=your_client_secret" >> .env
   
   npm run develop
   ```
   Backend runs on `http://localhost:1337`

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

4. **Login**
   - Navigate to `http://localhost:5173`
   - Click "Connect with GitHub"
   - Authorize the OAuth app

## 🎨 UI Styling Conventions

### Tailwind CSS & Shadcn

- Use Tailwind CSS for utility-first styling
- Leverage Shadcn components from `$lib/components/ui`
- Organize classes using `cn()` utility from `$lib/utils`

### Shadcn Color System

Define CSS variables without color space function:
```css
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;
```

Usage:
```svelte
<div class="bg-primary text-primary-foreground">Hello</div>
```

**Key color variables:**
- `--background`, `--foreground`: Default body colors
- `--muted`, `--muted-foreground`: Muted backgrounds
- `--card`, `--card-foreground`: Card backgrounds
- `--primary`, `--primary-foreground`: Primary button colors
- `--accent`, `--accent-foreground`: Accent colors
- `--destructive`, `--destructive-foreground`: Destructive actions
- `--ring`: Focus ring color
- `--radius`: Border radius for components

## 📚 W3C Design Tokens Spec (2025.10)

This project follows the official W3C Design Tokens specification:
- **Spec:** https://tr.designtokens.org/format/
- **Schema:** https://www.designtokens.org/schemas/2025.10/format.json

### Example W3C Token Structure
```json
{
  "$schema": "https://www.designtokens.org/technical-reports/",
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "hex": "#0057FF"
        },
        "$description": "Primary brand color"
      }
    }
  }
}
```

## 🔒 Security

- **JWT & GitHub tokens** stored in httpOnly cookies (not accessible via JavaScript)
- **CORS** configured with `credentials: true`
- **Role-based permissions** in Strapi for all API endpoints

## 🤝 Contributing

This project is in active development. Current focus: Dashboard migration to Strapi.

## 📝 License

[Your License Here]

---

**Last Updated:** November 28, 2025  
**Status:** Phase 1 (Repository Connection) ✅ Complete | Phase 2 (Dashboard Migration) 🚧 In Progress

one question, we generate the collections when we create a new repo right?

but lets assume we still have a repo somewhere and we want a design system for it, so when we
