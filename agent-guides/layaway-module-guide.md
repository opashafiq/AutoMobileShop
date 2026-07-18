# Layaway Module Implementation Guide

## Purpose
This document captures the architecture, patterns, and decisions made while building the **Layaway** module under the **Transaction** section. It is a deliberate clone of the **Invoice** module with a few intentional differences (see [Differences from Invoice](#differences-from-invoice) below). Use this as a reference when modifying the LayawayMaster page or when cloning the pattern into yet another transaction module (RefundMaster, etc.).

The parent guide for all transaction modules lives in [transaction-module-guide.md](transaction-module-guide.md). This file only documents what is unique to Layaway.

---

## File Map

Everything Layaway is a parallel copy of the Invoice files, swapped to Layaway types and `/api/LayawayMaster` endpoints.

| Concern | File |
|---|---|
| Types / DTOs | [src/app/(DashboardLayout)/types/apps/layawayMaster.ts](../src/app/(DashboardLayout)/types/apps/layawayMaster.ts) |
| List page (server) | [src/app/(DashboardLayout)/react-tables/transaction/layaway/page.tsx](../src/app/(DashboardLayout)/react-tables/transaction/layaway/page.tsx) |
| Create page (server) | [src/app/(DashboardLayout)/react-tables/transaction/layaway/create/page.tsx](../src/app/(DashboardLayout)/react-tables/transaction/layaway/create/page.tsx) |
| Edit page (server) | [src/app/(DashboardLayout)/react-tables/transaction/layaway/[id]/edit/page.tsx](../src/app/(DashboardLayout)/react-tables/transaction/layaway/[id]/edit/page.tsx) |
| List datatable (client) | [src/app/components/react-tables/transaction/layaway-datatable/index.tsx](../src/app/components/react-tables/transaction/layaway-datatable/index.tsx) |
| Create/Edit form (client) | [src/app/components/react-tables/transaction/layaway-form/index.tsx](../src/app/components/react-tables/transaction/layaway-form/index.tsx) |
| Sidebar entry | [src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts](../src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts) (in the `Transaction` group, after `Invoice`) |

### Reused (not cloned) shared pieces
- [src/app/components/react-tables/transaction/shared/Combobox.tsx](../src/app/components/react-tables/transaction/shared/Combobox.tsx) — searchable select for Tax ID, Item, Payment Method, Category.
- [src/app/components/react-tables/transaction/invoice-form/CarVisual.tsx](../src/app/components/react-tables/transaction/invoice-form/CarVisual.tsx) — the LF/RF/LR/RR car schematic is imported directly from the invoice-form folder (no re-cloning needed; it's a pure presentational component keyed by boolean props).
- [src/app/context/UserContext/index.tsx](../src/app/context/UserContext/index.tsx) — `useUser()` provides `locationId`, stamped onto `tbim_LocationId` on save.
- [src/app/api/globalFetcher.ts](../src/app/api/globalFetcher.ts) — `getApiUrl`, `getFetcher`, `postFetcher`, `deleteFetcher`.
- [src/lib/time.ts](../src/lib/time.ts) — `getLocalISO()`.
- [src/app/api/auth.ts](../src/app/api/auth.ts) — `getUserName()`.

---

## API Endpoint Patterns

All URLs resolve through `getApiUrl()` which prepends `NEXT_PUBLIC_API_BASE_URL`.

| Operation | Method | URL | Notes |
|---|---|---|---|
| List | GET | `/api/LayawayMaster?pageNumber=N&pageSize=N` | Optional filters: `invoiceId`, `customerName`, `phoneNo`, `paymentSlot`, `startDate`, `endDate`. Returns `{ items, totalCount, pageNumber, totalPages }`. |
| Get One | GET | `/api/LayawayMaster/{id}` | Single layaway with `layawayMasterDto` + `layawayDetailsDto` + `layawayPaymentsDto`. |
| Create | POST | `/api/LayawayMaster/CreateLayaway` | Full payload (`layawayMasterDto` + `layawayDetailsDto` + `layawayPaymentsDto`). |
| Edit | POST | `/api/LayawayMaster/EditLayaway?id={id}` | **Note: uses POST, not PUT** (mirrors the Invoice `EditInvoice` quirk in the .NET controller). Response: `{ message, LayawayId }`. |
| Delete | DELETE | `/api/LayawayMaster/{id}` | No body. |
| **Import to Invoice** | POST | `/api/LayawayMaster/importtoinvoice/{id}` | Layaway-only. Moves the record from LayawayMaster into InvoiceMaster. `{id}` = `layawayMasterDto.id`. On success the form routes to the Invoice datatable. |

Supporting reference endpoints (shared with Invoice): `/api/TaxId`, `/api/TaxId/{id}`, `/api/ItemMaster`, `/api/ItemMaster/{id}`, `/api/PaymentNames`, `/api/Departments`, `/api/TaxRateModified`.

---

## Type Differences (Layaway vs Invoice)

The `layawayMaster.ts` DTOs deliberately differ from `invoiceMaster.ts`. When you make changes, keep these in mind:

### `LayawayMasterDto`
- Uses `tbim_Item_Delete_after_Layaway_Create` (Invoice uses `..._after_Invoice_Create`).
- Uses **`tbim_LocationId`** (Invoice uses `tbim_LocationDetailsId`). The save handler stamps `useUser().locationId` here.
- Has **no** `tbim_LaywayNo` / `tbim_LaywayDate` fields.
- Has **no** `layawayRefund` array — Layaway owns the refund concept on the invoice side, not on itself.
- Otherwise the customer/vehicle/total fields mirror Invoice (`tbim_Phone`, `tbim_Name`, `tbim_InvDate`, `tbim_SubTotal`, `tbim_Total`, `tbim_PaidAmt`, `refundAmount`, `paymentMethodName`, etc.).

### `LayawayPaymentsDto`
- Stripped down: `id`, `tbip_InvoiceId`, `tbip_PaymentId`, `tbip_PayAmt`, `tbip_Date`, `tbip_PaymentType`, `paymentName`.
- **No** layaway linkage fields (`tbip_LayawayId`, `tdip_fromlayaway`, `tbip_LayawayDate`). If the backend ever starts returning these, add them to the type and the `emptyPayment()` factory in the form.

### `LayawayDetailsDto`
- Identical shape to `InvoiceDetailsDto`. The foreign-key field is still named `tbid_InvoiceId` on the Layaway side too (backend keeps the legacy column name).

Reference types (`TaxIdType`, `PaymentNameType`, `TaxRateModifiedType`, `ItemMasterType`) are re-exported from `invoiceMaster.ts` so there's a single source of truth — do not duplicate them.

---

## Differences from Invoice (the BRS requirements)

Per [agent-guides/prompts/Layaway_BRS.txt](prompts/Layaway_BRS.txt), Layaway is "a complete clone of Transaction -> Invoice except":

### 1. No "Payment Refund from Layaway" section
- The Invoice form has a right-column card titled **"Payment Refund from Layaway"** that renders `layawayRefund` rows. This is **removed** in the Layaway form.
- The Invoice expanded-row datatable footer also had a "Refund" line in the payment-side breakdown; the Layaway datatable keeps the refund line only when `refundAmount > 0` (harmless defensive rendering — Layaway records can still carry a `refundAmount` from the API, but there is no editable refund section).
- All `layawayRefund` state and the `LayawayRefundDto` import are absent from the Layaway form.

### 2. Labels renamed Invoice → Layaway
Every user-facing string was renamed to read naturally for a Layaway. Key renames:
- Page titles: "Create Invoice" → "Create Layaway", "Edit Invoice" → "Edit Layaway".
- Datatable title: "Manage Invoices" → "Manage Layaways"; Create button "Create Invoice" → "Create Layaway".
- Section heading: "Invoice Items" → "Layaway Items".
- Save button: "Save Invoice"/"Update Invoice" → "Save Layaway"/"Update Layaway".
- Item-sheet commit button: "Add to Invoice" → "Add to Layaway".
- Sheet descriptions: "Record a payment against this invoice." → "Record a payment against this layaway."
- Delete dialog: "Delete Invoice" → "Delete Layaway".
- CSV export filename: `invoices.csv` → `layaways.csv`.
- Toast feedback: "Invoice deleted/created/updated" → "Layaway deleted/created/updated".

The `tbim_InvoiceIdRad` and `tbid_InvoiceId` column/field names are kept as-is (they match the backend; renaming them would break the API contract). Only the visible labels were changed — internal identifiers stay on the Invoice naming because the backend DTOs literally use those names.

### 3. Two extra form fields: "Import Date" and "Import to Invoice"
Added to the **right column**, shown **only in edit mode** (`isEdit`):

- **Import Date** — an `<Input type='date'>` bound to local `importDate` state. Defaults to the current date (via `getLocalISO()`) on create and to the loaded layaway's `tbim_InvDate` on edit. On import, this value is sent to the backend as the `importDate` query parameter (see below).
- **Import to Invoice** — a `Button` that calls `handleImportToInvoice`:
  1. `POST /api/LayawayMaster/importtoinvoice/{layawayId}?importDate=YYYY-MM-DD` via `postFetcher`. The `importDate` query param is the datepicker value formatted `yyyy-MM-dd` via date-fns `format(...)` — the same format used by the other datepickers in the project (e.g. the Start/End date filters in the datatable filter bar). The POST body is an empty object. Falls back to today's date if `importDate` is somehow blank.
  2. On success → `toast.success(...)` then `router.push('/react-tables/transaction/invoice')` to land on the Invoice datatable (which re-fetches fresh via SWR, so the imported invoice appears).
  3. On failure → `toast.error('Failed to import layaway to invoice')`.

This card uses the `solar:import-linear` icon. If the icon doesn't render, swap to any solar icon (e.g. `solar:archive-up-linear`).

---

## How the Form Saves

`handleSave` builds this payload (note the Layaway-specific keys):

```typescript
{
  layawayMasterDto: {
    ...masterFromState,
    tbim_LocationId: locationId,          // from useUser()
    tbim_SubTotal: totals.subTotal,         // recomputed from line items
    tbim_SaleTax: totals.saleTax,          // sum of line-item tax only
    tbim_DisAmt: totals.disAmt,            // subTotal * disPer / 100
    tbim_Total: totals.total,               // adj + sub + tax + labour − discount
    tbim_PaidAmt: totals.totalPaid,         // sum of payment amounts
    tbim_AdjTotal: totals.total,
    tbim_RefundType: master.tbim_RefundType || 'N',
    userName, setDate,
  },
  layawayDetailsDto: details,               // each item's id left as 0 for new rows
  layawayPaymentsDto: payments,
}
```

Validation before save: `tbim_Name` and `tbim_Phone` required; `totalPaid` cannot exceed `total`; if `tbim_PayInfo === 'F'` then `totalPaid === total`.

On success, the form routes back to `/react-tables/transaction/layaway`.

> The Invoice form's edit path used `postFetcher` against `EditInvoice` (POST, not PUT). The Layaway edit path mirrors that: `postFetcher('/api/LayawayMaster/EditLayaway?id={id}', payload)`.

---

## Totals Calculation (unchanged from Invoice)

Recomputed via `useMemo` from `details`, `payments`, and the discount/labour/adjustment fields:
- `tbim_SubTotal` = Σ `tbid_LineTotal`
- `tbim_SaleTax` = Σ `tbid_TaxAmt` (line-item tax; labour is not taxed)
- `tbim_DisAmt` = `subTotal * (tbim_DisPer / 100)`
- `tbim_Total` = `tbim_AdjAmt + subTotal + saleTax + labour − disAmt`

The tax-rate default for new line items comes from `/api/TaxRateModified` (single object **or** array — both handled by `effectiveTaxRate`), falling back to `DEFAULT_TAX_RATE = 8.25`.

---

## Datatable Notes

- Server-side pagination via `pageNumber`/`pageSize` against `/api/LayawayMaster`.
- Column ids intentionally reuse the Invoice names (`transactionId`, `customerName`, `invoiceDate`, `totalAmount`, `phone`, `paymentType`, `paidAmount`, `refundAmount`) so the shared `ColumnFilterInput` + `columnFilterUtils` machinery works unchanged. `MASTER_ACCESSORS` maps each column id to the nested field on `layawayMasterDto`.
- Actions menu: **Edit**, **Reorder** (`?reorder=<id>` on the create page), **Delete**.
- Bulk-delete + CSV export + toggleable API filter bar (customerName / phoneNo / paymentSlot / startDate / endDate) — all cloned verbatim from the Invoice datatable.

---

## Sidebar Entry

In `Sidebaritems.ts`, inside the `Transaction` group, the `Layaway` item sits right after `Invoice`:

```typescript
{
  name: "Layaway",
  icon: "solar:hand-money-linear",
  id: uniqueId(),
  url: "/react-tables/transaction/layaway",
},
```

If you add a horizontal menu config later (`MenuData.ts`), mirror this entry there too.

---

## Modification Cheatsheet

Use these search anchors to find the spots most likely to change:

| If you need to… | Look in |
|---|---|
| Change a visible label | grep the Layaway form/datatable for the exact string (`"Manage Layaways"`, `"Import to Invoice"`, …) |
| Add/remove a master field | `layawayMaster.ts` → `LayawayMasterDto`, then `emptyMaster()` in the form, then the save payload in `handleSave` |
| Add/remove a payment field | `layawayMaster.ts` → `LayawayPaymentsDto`, `emptyPayment()`, the payment Sheet, and the payment table column |
| Change totals logic | the `totals` `useMemo` in `layaway-form/index.tsx` |
| Wire the Import Date to the API | `handleImportToInvoice` — append `importDate` to the `postFetcher` body/request |
| Change columns in the list | `allColumns` `useMemo` in `layaway-datatable/index.tsx` + `MASTER_ACCESSORS` + `FILTERABLE_COLUMNS` + `columnVisibility` defaults |
| Re-point endpoints | grep the form + datatable for `/api/LayawayMaster` |
| Reuse the CarVisual elsewhere | `import { CarVisual } from '../invoice-form/CarVisual'` (already done in the Layaway form) |

---

## Build Verification

After any change, confirm the app still compiles:

```bash
npm run build --no-lint
```

(The `--no-lint` matches the pattern in [transaction-module-guide.md](transaction-module-guide.md); add `--no-lint` only if the pre-existing lint warnings block the build, otherwise prefer `npm run lint`.)