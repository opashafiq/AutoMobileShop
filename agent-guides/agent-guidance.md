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

## CRUD page conventions

- **No redundant `<h1>`**: In `page.tsx`, do not add an `<h1>` title below the `<BreadcrumbComp>` — the breadcrumb already displays the title.
- **Meaningful card titles**: In the datatable `index.tsx`, use a verb-prefixed title like `"Manage <Entity>"` (e.g. `"Manage Daily Expenses"`, `"Manage Tax IDs"`, `"Manage Application Users"`) rather than a generic `<Entity> Table` or `<Entity> Records`.
- For canonical examples, see the latest versions of:
  - `src/app/(DashboardLayout)/react-tables/master/application-user/page.tsx`
  - `src/app/components/react-tables/master/applicationuser-datatable/index.tsx`

## Datepicker conventions

- Reusable calendar popover: `src/components/ui/calendar.tsx` (wraps `react-day-picker` v8).
  - Header: `captionLayout="dropdown-buttons"` + custom `CompactDropdown` (no lib CSS needed; do NOT re-import 'react-day-picker/dist/style.css'). Month/year are compact native selects; prev/next arrows always visible.
  - Defaults: `fromYear` (currentYear − 10) / `toYear` (currentYear + 10) — pass explicit values for birth-year style pickers; `weekStartsOn={0}` (Sunday, US).
  - Cells are 40px (`h-10 w-10`); outside days dimmed via opacity; today marked with a dot (not a fill); selected day is the only solid fill.
  - `displayFormat/MM-dd-yyyy` on trigger buttons; API payloads stay `yyyy-MM-dd`.
  - Single-date pickers get a typeable `MM-DD-YYYY` input (footer) — accepts `YYYY-MM-DD` too; two-way sync with `allowTyping={false}` to opt out.
  - Range pickers: opt into drafts with `showPresets`, `onApply(range)`, `onCancel` (see `DateRangePickerCode.tsx` for the pattern).
  - `disableFuture` greys out/disables dates after today per picker; custom rules also work via `disabled` matchers.
  - Display selected dates on trigger buttons in **`MM-dd-yyyy`** (date-fns format). Keep API payloads in `yyyy-MM-dd` — do not change query/body formats.
- `react-datepicker` instances must use `showMonthDropdown`, `showYearDropdown`, `dropdownMode="select"` and `dateFormat="MM-dd-yyyy"`.
- Native `<input type='date'>` in forms stays native: its display follows browser locale and its popup already supports month/year dropdowns; value remains `yyyy-MM-dd`.

## File naming guidance

- Add new agent docs inside `agent-guides/`.
- Add new feature components under `src/app/components` or `src/components/ui`.
- Avoid putting business logic in `public/` or `src/utils` unless it is generic.
