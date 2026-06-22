# Project Overview

## What this repository is

This repository is a demo template built on top of a sales software UI. It is implemented using Next.js App Router, Tailwind CSS, and SWR, with a custom design system built from Radix UI components.

## Key features

- Sales-oriented dashboard and apps
- Data tables with create/edit/delete flows
- API fetch helpers using SWR
- Shared UI primitives in `src/components/ui`
- Theme support and global layout in `src/app/layout.tsx`

## Important folders

- `src/app` — primary application pages and UI-level components.
  - `src/app/components` — reusable app components, including tables, dashboards, and widgets.
  - `src/app/api` — fetcher helpers and routes.
  - `src/app/context` — app-level React contexts and providers.

- `src/components/ui` — custom UI primitives such as `Button`, `Dialog`, `Input`, `Checkbox`, `Select`, and more.

- `src/lib` — utility modules such as `utils.ts`.

- `src/utils` — project utilities like `i18n` and language settings.

## Relevant patterns

- Client components use `use client` and often depend on state, SWR, and UI components.
- Tables use `@tanstack/react-table` for data rendering and selection.
- Modals use custom `Dialog` atoms built around Radix UI.
- The project uses path alias `@/*` to import from `src/`.

## How AI agents should approach the project

1. Read `agent-guides/agent-guidance.md` first.
2. Identify the relevant feature area by searching for matching component names.
3. Preserve existing UI patterns and conventions.
4. Prefer editing existing components over adding duplicate logic.

## Current working area

The active component currently in use is `src/app/components/react-tables/master/taxid-datatable/index.tsx` for Tax ID CRUD flows.
