# AI Agent Guidance

## Purpose

This file is the main agent guide for working on the AutoMobileShop repo. Agents should consult it before making changes.

## Recommended workflow

1. Read `agent-guides/README.md` and this file.
2. Identify the task scope from the user request.
3. Search the repository for existing implementations of the requested feature.
4. Preserve existing folder structure, naming, and UI patterns.
5. Make minimal, focused edits and validate the change with available tools.

## Core repository conventions

- The project uses **Next.js App Router** and TypeScript.
- Most UI elements are built using custom components in `src/components/ui`.
- Data fetches use **SWR** with helpers in `src/app/api/globalFetcher.ts`.
- Tables are built with **@tanstack/react-table** and often contain dialogs for edit/create flows.
- Use `@/*` imports for internal project code.

## How to use these docs

- If asked for a feature change, first locate similar code in `src/app/components` or `src/components/ui`.
- If asked for a new component, follow the pattern from existing tables, dialogs, and buttons.
- If the user asks for documentation, add files into `agent-guides/`.

## When the user asks about sales features

- Check `src/app/components/apps` and `src/app/components/react-tables` for existing business UI.
- Use `src/app/api/globalFetcher.ts` for backend requests rather than raw `fetch` when possible.
- Reuse theme and layout patterns from `src/app/layout.tsx`.

## Example search targets

- `useSWR` — data fetching.
- `Dialog` / `DialogContent` — modal UI.
- `@tanstack/react-table` — table rendering.
- `src/components/ui` — reusable button/input/checkbox selectors.
- `src/app/api/globalFetcher.ts` — shared fetch helpers.

## File naming guidance

- Add new agent docs inside `agent-guides/`.
- Add new feature components under `src/app/components` or `src/components/ui`.
- Avoid putting business logic in `public/` or `src/utils` unless it is generic.
