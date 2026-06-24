# CLAUDE.md — AutoMobileShop

## Project Overview

Next.js 16 application for an automotive shop management system. It includes a dashboard layout, multiple feature modules (eCommerce, contacts, notes, tickets, blog, chat, email, invoice, kanban), AI-powered features (chat, image generation), and a landing page.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`), `tw-animate-css` |
| **State / Data Fetching** | SWR (`swr`) + React Context |
| **Forms** | `react-hook-form` + `zod` validation |
| **UI Components** | Radix UI primitives + shadcn/ui + `@tabler/icons-react` + `lucide-react` |
| **Tables** | `@tanstack/react-table` |
| **Charts** | `apexcharts`, `recharts` |
| **Rich Text** | TipTap editor |
| **Auth** | JWT token stored in `localStorage` as `NEXT_AUTH_TOKEN` |
| **Internationalization** | `i18next` / `react-i18next` |

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run Next.js lint

## Project Structure

```
src/
├── app/
│   ├── (DashboardLayout)/   # Authenticated dashboard routes
│   │   ├── apps/            # Feature pages (blog, chat, contacts, ecommerce, etc.)
│   │   ├── layout/          # Sidebar, header, customizer components
│   │   ├── dashboards/      # Dashboard page widgets
│   │   ├── types/apps/      # TypeScript interfaces for each feature module
│   │   └── ...
│   ├── api/                 # Next.js API route handlers + globalFetcher.ts
│   ├── auth/                # Auth pages (login, register, etc.)
│   ├── components/          # Scoped components organized by feature
│   ├── context/             # React Context providers (one per feature module)
│   ├── css/                 # Global styles
│   ├── frontend-pages/      # Public-facing pages
│   ├── landingpage/         # Landing page
│   ├── models/              # Shared model interfaces
│   ├── layout.tsx           # Root layout
│   └── not-found.tsx        # 404 page
├── components/
│   └── ui/                  # shadcn/ui primitives (button, card, dialog, etc.)
├── hooks/                   # Shared hooks (use-mobile, use-toast)
├── lib/                     # Utility libraries (time, utils)
└── utils/                   # i18n configuration, utilities
```

## Data Fetching Pattern (SWR)

**Global Fetchers** are defined in [src/app/api/globalFetcher.ts](src/app/api/globalFetcher.ts).

Available fetchers:
- `getFetcher` — GET requests (used with `useSWR`)
- `postFetcher(url, arg)` — POST requests (used with `useSWR`)
- `putFetcher(url, arg)` — PUT requests
- `patchFetcher(url, arg)` — PATCH requests
- `deleteFetcher(url, arg?)` — DELETE requests
- `getApiUrl(endpoint)` — Resolves relative endpoints against `NEXT_PUBLIC_API_BASE_URL`
- `API_BASE_URL` — The configured API base URL

All fetchers automatically attach `Authorization: Bearer <token>` from localStorage (`NEXT_AUTH_TOKEN`).

**Canonical usage pattern in Context providers:**
```tsx
import useSWR from 'swr'
import { getFetcher, postFetcher } from '@/app/api/globalFetcher'

// In a context provider:
const { data, isLoading, error } = useSWR('/api/contacts', getFetcher)

// Mutation:
const { trigger } = useSWR('/api/contacts', (url) =>
  postFetcher(url, { /* payload */ })
)
```

## TypeScript Interfaces / Models

- **Shared models**: [src/app/models/interfaces.ts](src/app/models/interfaces.ts)
- **Feature-specific types**: [src/app/(DashboardLayout)/types/apps/](src/app/(DashboardLayout)/types/apps/) (one file per feature: `contact.ts`, `eCommerce.ts`, `blog.ts`, etc.)
- **Path alias**: `@/` maps to `src/` (configured in `tsconfig.json`)

## Auth System

- Auth helpers in [src/app/api/auth.ts](src/app/api/auth.ts)
- Token stored in `localStorage` key `NEXT_AUTH_TOKEN`
- Provide `login(username, password)`, `getToken()`, `setToken()`, `clearToken()`, `isLoggedIn()`
- Uses `POST /Authentication/Login` on the backend API
- DashboardLayout redirects unauthenticated users to `/auth/auth1/login`

## Coding Conventions

### Reusability & Clean Code
- Extract reusable logic into shared hooks under [src/hooks/](src/hooks/)
- Place shared UI variants in [src/components/shared/](src/app/components/shared/) (e.g., `CardBox`, `OutlineCard`, `TitleBorderCard`)
- API route handlers live in [src/app/api/](src/app/api/) organized by feature name
- Context providers in [src/app/context/](src/app/context/) follow the pattern: `<Feature>Context`, `<Feature>Provider`, `use<Feature>`

### State Management
- Use React Context for feature-level state (one context per module)
- Use SWR for server state / API data fetching
- Local component state with `useState` for UI-only concerns

### Styling
- Tailwind CSS v4 utility classes (no `tailwind.config.ts` — use CSS `@theme` directives)
- The `cn()` utility from `clsx` + `tailwind-merge` for conditional classes
- Dark mode via class strategy (`dark:` prefix)
- Use `@tabler/icons-react` or `lucide-react` for icons via the `Icon` component pattern

### Forms
- `react-hook-form` with `zod` schema validation
- Use `@hookform/resolvers` for zod integration
- shadcn/ui form components (in [src/components/ui/](src/components/ui/))

### API Routes (Next.js Backend)
- Each module has a `route.ts` inside `src/app/api/<module>/` exporting `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Responses follow the shape: `{ status: 200 | 400 | 404, msg: string, data?: any, error?: any }`
- Mock data is collocated with API routes or in [src/app/components/](src/app/components/) (e.g., `productData.ts`)

## Available Skills (Agent Instructions)

Skills are installed in [.agents/skills/](.agents/skills/):

| Skill | When to Use |
|---|---|
| `tailwind-4-docs` | Tailwind v4 questions, selecting utilities, configuration, migration from v3 |
| `tailwind-design-system` | Building design systems, component libraries, design tokens, responsive patterns |
| `web-design-guidelines` | UI review, accessibility audit, UX review, design best practices |

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://localhost:44352` | Backend API base URL |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Frontend base URL |
| `NEXT_PUBLIC_GEMINI_API_KEY` | — | Google Gemini API key (for AI features) |

## Performance & Best Practices

- Prefer `'use client'` only when interactivity/hooks are needed — keep components server-rendered by default
- Memoize expensive computations with `useMemo` / `useCallback`
- Use Next.js `<Image>` with proper sizing (current config: `unoptimized: true`)
- Keep API route handlers thin — delegate business logic to utility functions when it grows beyond CRUD
- When adding a new feature module, follow the existing pattern: types → API route → context → components → page
- Use `zod` for runtime validation of API payloads alongside TypeScript interfaces


## Code Quality & Pre-Execution Evaluation Protocol

You are required to rigorously evaluate, test, and debug all code snippets in internal memory before delivering them or marking them as complete. Do not output code blindly. Follow this strict protocol for every code generation or modification request:

### 1. The Pre-Evaluation Rule (Think Before You Code)
Before you write or finalize any code, you must execute a "mental dry-run" and analyze the solution against the target ecosystem (e.g., specific language versions, framework constraints, and database limitations like SQL Server 2014 syntax limits).

### 2. Mandatory Verification Checklist
Analyze your proposed solution for the following common failure points:
- **Syntax & Compilation Errors:** Are there missing semicolons, incorrect types, or invalid syntax for the specified language version?
- **Version Compatibility:** Does this code rely on features, methods, or syntax optimizations that do not exist or will crash in the user's specific tech stack environment?
- **Resource & Query Performance:** Does the code introduce architectural anti-patterns (such as N+1 query problems, unindexed searches, or open SQL injections)?
- **Edge Cases:** How does the code handle `null` values, empty inputs, network timeouts, or missing records?

### 3. Self-Correction Loop
- If you detect *any* bug, performance issue, or compatibility mismatch during your pre-evaluation, you must immediately discard that approach.
- Silently refactor and fix the issue internally. 
- Only deliver the finalized, corrected code that has successfully passed all verification checks.

### 4. Output Delivery Requirements
- Provide the fully resolved, complete code block. Do not provide partial snippets that leave "TODOs" or placeholders for critical logic.
- Include a brief, high-level explanation of *why* this specific implementation was chosen if a version-specific or performance-driven adjustment had to be made.