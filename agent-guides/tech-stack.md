# Tech Stack

## Core technologies

- **Next.js** — App Router-based React application.
- **TypeScript** — strongly typed React and application logic.
- **Tailwind CSS** — utility-first styling with the `@tailwindcss/postcss` plugin.
- **SWR** — data fetching and caching in React components.

## UI and component libraries

- **Radix UI** — low-level accessible primitives, used for dialogs, dropdowns, and menus.
- **@tanstack/react-table** — advanced table rendering and row selection.
- **react-toastify** — toast notifications.
- **Iconify** / **lucide-react** — icon components.
- **class-variance-authority** — styling variants for custom components.

## Common file patterns

- `src/components/ui` — reusable UI atoms and components.
- `src/app/components` — feature-specific components and page-level sections.
- `src/app/api/globalFetcher.ts` — shared fetch helpers for GET/POST/PUT/DELETE.
- `src/app/context` — React context providers for application state and theming.

## Build and run

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — run built app

## Configuration

- `next.config.mjs` — `reactStrictMode: false`, image optimization disabled.
- `postcss.config.mjs` — enables Tailwind CSS plugin.
- `tsconfig.json` — path alias `@/*` mapped to `./src/*`.

## Notes for agents

- Use the custom `Button`, `Dialog`, `Input`, `Checkbox`, and `Select` components from `src/components/ui`.
- Avoid changing global layout or theme provider unless the user explicitly asks.
- When adding a new page or component, keep it in `src/app` or `src/app/components` depending on scope.
