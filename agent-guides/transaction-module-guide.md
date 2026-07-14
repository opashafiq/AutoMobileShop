# Transaction Module Implementation Guide

## Purpose
This document captures the architecture, patterns, and decisions made while building the **Invoice** module under the **Transaction** section. Use this as a reference when building similar modules (LayawayMaster, RefundMaster, etc.).

---

## Module Structure

Every transaction module follows this file layout:

```
src/app/(DashboardLayout)/
├── react-tables/transaction/
│   └── <module-name>/
│       ├── page.tsx            # List page (server component, metadata + breadcrumb)
│       ├── create/
│       │   └── page.tsx        # Create form page
│       └── [id]/
│           └── edit/
│               └── page.tsx    # Edit form page

src/app/components/react-tables/transaction/
├── <module-name>-datatable/
│   └── index.tsx               # List datatable component
└── <module-name>-form/
    └── index.tsx               # Create/Edit form component (shared)

src/app/(DashboardLayout)/types/apps/
└── <module-name>.ts            # TypeScript interfaces
```

### Naming Conventions
- **Module folder**: kebab-case (e.g., `invoice`, `layaway-master`, `refund-master`)
- **Datatable component folder**: `<kebab-name>-datatable/`
- **Form component folder**: `<kebab-name>-form/`
- **Page files**: `page.tsx` (always, per Next.js App Router convention)
- **Types file**: `<camelCase>.ts` (e.g., `invoiceMaster.ts`)

---

## Key Architectural Decisions

### 1. Full-Page Form (not modal)
Invoice creation uses a dedicated full-page form instead of a popup/modal. Reasons:
- Complex form with >30 fields across 4 sub-sections (customer info, line items, payments, layaway refund)
- Nested child-entry panels (add item, add payment) would create 3+ levels of stacked modals
- POS-style forms need stable, scrollable surface with live totals recalculation
- Full-page route supports deep-linking, browser back/forward, unsaved-changes guards
- Better mobile/tablet support

**For simple CRUD (<15 fields, no child collections)** → use a dialog/modal (see master modules).
**For complex transactional forms with child collections** → use a dedicated full-page form.

### 2. Direct API Calls (no local route handler)
Transaction modules call the external .NET backend directly via `globalFetcher`:
```typescript
import { getApiUrl, getFetcher, postFetcher, putFetcher, deleteFetcher } from '@/app/api/globalFetcher'
const API_URL = getApiUrl('/api/InvoiceMaster')
```
No local `src/app/api/<module>/route.ts` is needed. This matches the master module pattern.

### 3. No Context Provider
State is managed locally in the component using `useState`. SWR handles server-state synchronization.
Future modules should only add a Context provider if the state is needed across multiple sibling pages.

### 4. Child-Entry Using Sheet (Drawer)
Instead of nested modals for "Add Item" / "Add Payment", use a `Sheet` (slide-over panel from `@/components/ui/sheet`):
- Keeps the parent form visible
- User can see totals update as they fill in child data
- Cleaner UX than stacked modals

---

## Invoice Module Walkthrough

### Types (`src/app/(DashboardLayout)/types/apps/invoiceMaster.ts`)
Define all DTOs matching the backend API response shapes:
- `InvoiceMasterDto` — main invoice header (customer info, vehicle info, totals)
- `InvoiceDetailsDto` — line items (item reference, qty, price, tax)
- `InvoicePaymentsDto` — payment records
- `LayawayRefundDto` — layaway refund entries
- Reference data types: `TaxIdType`, `ItemMasterType`, `PaymentNameType`

### List Datatable (`invoice-datatable/index.tsx`)
- Uses TanStack React Table with client-side pagination
- **Standard toolbar** (matches the Master Data tables, e.g. Item Master):
  - `<Card>` wrapper with an `<h3>Manage <Module></h3>` title
  - Pill icon buttons row: search toggle (expands to an `Input`), settings dropdown (column visibility `DropdownMenuCheckboxItem`s), CSV export, bulk-delete (appears when rows selected), Clear Filters (appears when column filters active), and the Create button
  - Toast notifications via `react-toastify` (`toast` + `<ToastContainer />`) with a `feedback` string + auto-clear
- **Table** uses `AnimatedTableWrapper` / `AnimatedTableBody` / `AnimatedTableRow` (from `@/app/components/animatedComponents/AnimatedTable`) inside a bordered `div`
- Sortable headers render via `flexRender` with a `solar:transfer-vertical-line-duotone` icon
- Per-column filters use the shared `ColumnFilterInput` popover (`@/app/components/react-tables/shared/ColumnFilterInput`) + `applyColumnFilters` from `columnFilterUtils` — declare a `FILTERABLE_COLUMNS` allowlist and a `MASTER_ACCESSORS` map (column id → nested field on the row DTO) so the filter util can extract sample data
- Columns: Transaction ID, Customer Name, Date, Total, Phone, Payment Type, Paid Amount, Refund Amount
- Row-selection checkbox column (bulk delete)
- Actions column: a `DropdownMenu` (dots) with Edit (navigates to edit page) + Delete (confirm dialog + API call)
- Expandable rows for invoice details (follows `OrderDataTable.tsx` pattern); the expanded detail is a plain `<tr>` rendered after the `AnimatedTableRow`
- Standard pagination with a page-size `Select` ([3,10,20,30,40,50]), `start-end of total` summary, and `solar:arrow-left/right-line-duotone` nav icons
- **API-side filter bar** (toggleable): A hidden-until-clicked filter panel invoked by a pill filter button in the toolbar (uses `solar:filter-linear` / `solar:close-circle-outline` icons for open/close state). When visible, it displays:
  - Text `Input` for **Customer Name** and **Phone No**
  - `Select` dropdown for **Payment** slot (All / Full Payment / Partial / Pending)
  - Popover+`Calendar` date pickers for **Start Date** and **End Date**
  - **Search** button that builds a URL with `URLSearchParams` (only includes non-empty params) and updates `queryString` — since the SWR key is derived from `queryString`, this triggers a server re-fetch with the filter values
  - **Reset** button that clears all filter fields and resets `queryString` to `pageNumber=1&pageSize=10`
  - Inputs use `h-10` with `min-w-[150px]` to `min-w-[180px]` and `flex-1` for comfortable typing
- **Pagination note**: Currently uses client-side pagination via `getPaginationRowModel()`. The server fetches 10 records (`pageSize=10`), and next/prev page navigation pages through those locally. Switching to server-side pagination would require incrementing `pageNumber` on each page click.


> ⚠️ Ordering gotcha: handlers that call into `table` (e.g. `handleBulkDelete` using `table.getSelectedRowModel()`) must be declared **after** the `useReactTable(...)` call, or TS errors with "used before its declaration". Define them right after the table instance.

### Invoice Form (`invoice-form/index.tsx`)
Shared component for Create and Edit modes:
- **Props**: `mode: 'create' | 'edit'`, `invoiceId?: string`
- **Layout**: Chronological Z-pattern workflow — **left column = execute the work**, **right column = settle the payment**:

  | Left column (`xl:col-span-2`) | Right column (1/3) |
  |---|---|
  | 1. **Customer & Vehicle** — car visual + LF/RF/LR/RR checkboxes + fields | 1. **Payments** — Payment Type radio (Full/Partial/Pending), Total Paid, Add Payment button, payment history table |
  | 2. **Invoice Items** — line items datatable + Add Item Sheet | 2. **Layaway Refund** — refund entries datatable + total |
  | 3. **Calculation Panel** (right-aligned under items) — Sub Total, Labour input, Tax, Discount %→$ badge, Adjustment input, large Total Amount | 3. **Settlement Summary + Save/Back** — balance overview + Save Invoice + Back buttons |

- **Why**: In a POS/work-order context the operator's eyes stay on the left side (items entry). Pushing the financial breakdown to the right column forces mental gymnastics ("split math"). By keeping the full calculation below the items table on the left, the operator sees how subtotal / tax / discount / labour combine into the total in the same visual channel as the line items. The right sidebar becomes a chronological "settlement" step after all the work is logged.

- **State Management**: Single `formState` object with explicit setter functions. State uses `useState` (not React Hook Form) to match the existing codebase pattern.

- **Totals Calculation**: Computed via `useMemo`:
  - `tbim_SubTotal` = sum of all `tbid_LineTotal` in invoiceDetails
  - `tbim_SaleTax` = sum of all `tbid_TaxAmt` in invoiceDetails (line-item tax only; labour is not taxed per BRS)
  - `tbim_DisAmt` = `tbim_SubTotal * (tbim_DisPer / 100)`
  - `tbim_Total` = `tbim_AdjAmt + tbim_SubTotal + tbim_SaleTax + tbim_Labour - tbim_DisAmt`

- **Tax Auto-fill**: On `tbim_TaxId` change, fetch `TaxId/{id}` → auto-populate `taxCompanyName` and `taxAddress`

- **Item Selection Sheet**: Side drawer (`Sheet`) from the right with Combobox (Popover + Command) from ItemMaster, auto-fills unit price, user enters qty + taxable → calculates Amount + Tax Amount

- **Payment/Layaway Sheets**: Side drawers (`Sheet`) for adding/editing payment records and layaway refund entries

- **Datatable styling within forms**: All child tables (items, payments, layaway) use the same design language as the master data tables:
  - Rounded bordered wrapper (`rounded-lg border border-ld`)
  - `bg-lightprimary/20` header row with `text-xs font-semibold uppercase tracking-wider text-muted-foreground` headers
  - `border-b border-ld transition-colors duration-200 hover:bg-lightprimary/30` on data rows
  - `font-semibold` on key numeric cells (Amount, Total)

- **Saving**: Builds the API payload, calls `postFetcher` (create) or `putFetcher` (edit), navigates back to list on success

- **No action buttons in the top header**: Actions are moved to the bottom of the right sidebar as part of the chronological workflow. Top header is just a title + subtitle.

- ⚠️ **Known scope limits**: (1) "Save Draft" is not wired—the backend has no `isDraft` flag. (2) "Print Invoice" is not wired—no print template exists yet.

### Car Visual
A modern CSS/HTML car top-down schematic with position markers LF, RF, LR, RR as interactive regions. Each marker is a checkbox that visually highlights when selected. Defined in a standalone `CarVisual.tsx` sub-component with fixed inline styles for the four wheel-marker positions.

---

## API Endpoint Patterns

| Operation | Method | URL | Notes |
|---|---|---|---|
| List | GET | `/api/InvoiceMaster?pageNumber=N&pageSize=N` | Returns array of invoice DTOs |
| Get One | GET | `/api/InvoiceMaster/{id}` | Single invoice with details & payments |
| Create | POST | `/api/InvoiceMaster/CreateInvoice` | Full payload with all DTOs |
| Edit | PUT | `/api/InvoiceMaster/EditInvoice?id={id}` | Full payload with IDs preserved |
| Delete | DELETE | `/api/InvoiceMaster/{id}` | No body needed |
| Tax IDs | GET | `/api/TaxId` | Autocomplete data |
| Tax by ID | GET | `/api/TaxId/{id}` | Company name & address |
| Items | GET | `/api/ItemMaster` | Autocomplete data |
| Item by ID | GET | `/api/ItemMaster/{id}` | Price details |
| Payment Names | GET | `/api/PaymentNames` | Payment method options |
| Tax Rate | GET | `/api/TaxRateModified` | Returns a single object `{ tbtm_TaxRate: number }` or an array; used as the default tax rate in the Add-Item Sheet |

All URLs are resolved via `getApiUrl()` which prepends `NEXT_PUBLIC_API_BASE_URL`.

---

### Tax Rate Resolution (in the Add-Item Sheet)

Instead of the old hardcoded `DEFAULT_TAX_RATE = 8.25`, the form now:

1. Fetches `/api/TaxRateModified` via SWR **once** on mount (stored as `taxRateData`).
2. Derives `effectiveTaxRate` via `useMemo`, handling both single-object and array responses.
3. When the user opens the **Add Item sheet**, the draft item's `taxRate` field is pre-filled with `effectiveTaxRate` (not `DEFAULT_TAX_RATE`).
4. When **editing** an existing item whose taxable status is known, the rate is computed from `(tbid_TaxAmt / tbid_LineTotal) * 100`, falling back to `effectiveTaxRate` if the calculation isn't possible.
5. The user can still manually type any rate in the Add-Item Sheet if needed — the API rate is just the default, not a lock.

This keeps the default rate synchronized with the server while staying out of the user's way for manual override.

---

## Sidebar Setup

In `Sidebaritems.ts`, add a new group:
```typescript
{
  heading: "Transaction",
  children: [
    {
      name: "Invoice",
      icon: "solar:bill-list-linear",
      id: uniqueId(),
      url: "/react-tables/transaction/invoice",
    },
  ],
},
```

- Place the group after "Master Data" for logical ordering
- The route `url` must match the directory under `react-tables/transaction/`

---

## Shared Components (`components/react-tables/transaction/shared/`)

### Combobox (`Combobox.tsx`)
A reusable searchable combobox built on `Popover` + `Command` (`cmdk`), used for Tax ID selection, Item selection, and Payment Method selection.
- **Props**: `options: ComboboxOption[]`, `value: string`, `onChange: (value: string) => void`, `placeholder`, `searchPlaceholder`, `emptyText`, `disabled`
- Relies on `--radix-popover-trigger-width` CSS variable for width matching (the `PopoverContent` gets `w-[--radix-popover-trigger-width]`)
- For the future: if a new module needs a "Select" that isn't searchable, use the native `<Select>` instead.

### Discount UX Pattern in Calculation Panel
When building a calculation/summary panel:
- Always pair the input field with its computed result on the same visual row: `[ % input ] → [ -$badge ]` — never one above the other on separate lines (that breaks the visual relationship).
- Show the formula basis underneath (`Applied on Sub Total ($X × Y%)`) so nobody has to reverse-engineer the number.
- Use a `bg-error/10` badge for the discount amount, with `text-error` and a `-` prefix, to signal "this is a subtraction from the total" — color-coded red for cost reduction.

---

## Checklist for New Transaction Modules

- [ ] Add interfaces in `src/app/(DashboardLayout)/types/apps/<module>.ts`
- [ ] Create list page at `react-tables/transaction/<module>/page.tsx`
- [ ] Create list datatable component at `components/react-tables/transaction/<module>-datatable/index.tsx`
- [ ] If the module needs a form:
  - [ ] Create form component at `components/react-tables/transaction/<module>-form/index.tsx`
  - [ ] Create `create/page.tsx` and `[id]/edit/page.tsx`
- [ ] Add sidebar entry in `Sidebaritems.ts`
- [ ] Follow the patterns: SWR for data, TanStack for tables, Sheet for child-entry
- [ ] Document any module-specific deviations in this guide
- [ ] Verify build: `npm run build --no-lint`
