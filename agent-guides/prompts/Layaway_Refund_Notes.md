# Layaway Refund Module — Design Notes

## Overview

The Layaway Refund module is a deliberate clone of the Invoice Refund module, following the same architecture, UX patterns, and component structure. The BRS (`Layaway_Refund_BRS.txt`) instructs: *"Do exact the same you did for the InvoiceRefundMasterDto. Only differences are: a) Use LayawayMaster instead of InvoiceMaster"*.

All corrections documented in `Invoice_Refund_Notes.md` (the companion design document) apply equally to this module. This document captures only the **differences** and **layaway-specific decisions**.

---

## Differences from Invoice Refund

### 1. Data Model — Denormalized Master DTO

Unlike Invoice Refund (which references the source invoice via `tbirm_InvoiceId` and carries only `originalInvoiceName`/`originalInvoiceDate`), the **LayawayRefundMasterDto** carries a **full denormalized snapshot** of the source LayawayMaster:

- All `layaway_tbim_*` fields mirror the `LayawayMasterDto` fields verbatim
- `tbim_InvoiceIdRad` (the layaway's displayable transaction number)
- `originalLayawayName` / `originalLayawayDate` (duplicated for quick list display)

This means the create payload is significantly larger than Invoice Refund. The `emptyRefundMaster()` seed function and the hydration `setMaster({...})` call must populate every `layaway_tbim_*` field from the source `LayawayMasterDto`.

### 2. Details DTO — Extra Snapshot Fields

`LayawayRefundDetailsDto` has four fields **not present** in `InvoiceRefundDetailsDto`:

| Field | Purpose |
|---|---|
| `tbird_Layaway_Qty` | Snapshot of the original layaway quantity |
| `tbird_Layaway_Qty_LineTotal` | Snapshot of the original line total |
| `tbird_Layaway_Qty_TaxAmt` | Snapshot of the original tax amount |
| `tbird_TaxRate` | Effective tax rate (recomputed from original line, or `DEFAULT_TAX_RATE = 8.25`) |

The `DraftLayawayRefundDetail` type carries `refundQty` and `originalQty` (same pattern as Invoice Refund). The `tbird_Qty` in the API DTO is the **refund quantity** (not the original quantity), while `tbird_Layaway_Qty` holds the original snapshot.

### 3. API Endpoints

| Invoice Refund | Layaway Refund |
|---|---|
| `/api/InvoiceRefundMaster?pageNumber=N...` | `/api/LayawayRefundMaster?pageNumber=N...` |
| `/api/InvoiceRefundMaster/{id}` | `/api/LayawayRefundMaster/{id}` |
| `/api/InvoiceRefundMaster/CreateRefund` | `/api/LayawayRefundMaster/CreateLayawayRefund` |
| `/api/InvoiceRefundMaster/EditRefund?id={id}` | `/api/LayawayRefundMaster/EditLayawayRefund?id={id}` |
| `/api/InvoiceRefundMaster/{id}` (DELETE) | `/api/LayawayRefundMaster/{id}` (DELETE) |
| `/api/InvoiceMaster?pageNumber=N...` (picker) | `/api/LayawayMaster?pageNumber=N...` (picker) |

### 4. Field Name Differences

| Concept | Invoice Refund | Layaway Refund |
|---|---|---|
| Transaction ID Rad | `tbirm_InvoiceRefundIdRad` | `tbirm_LayawayRefundIdRad` |
| Refund Date | `tbirm_InvRefundDate` | `tbirm_LayawayRefundDate` |
| Inventory delete flag | `tbirm_Item_Delete_after_Invoice_Refund_Create` | `tbirm_Item_Delete_after_Layaway_Refund_Create` |
| Original name | `originalInvoiceName` | `originalLayawayName` |
| Original date | `originalInvoiceDate` | `originalLayawayDate` |
| Details FK | `tbird_InvoiceRefundId` | `tbird_Layaway_RefundId` |
| Payments FK | `tbirp_InvoiceRefundId` | `tbirp_Layaway_RefundId` |
| Source invoice ID | `tbirm_InvoiceId` | `layaway_tbim_InvoiceId` (denormalized) |

### 5. Picker Endpoint

The picker fetches from `/api/LayawayMaster` with identical filter parameters: `invoiceTransactionId`, `customerName`, `phoneNo`, `paymentSlot`, `startDate`, `endDate`. The picker columns match the Layaway Master DTO fields (Transaction Id, Customer Name, Date, Total Amount, Phone No, Payment Type, Paid Amount, Refund Amount, Refund Type).

---

## Corrections & Deviations from Original Layaway Refund BRS (same as Invoice Refund)

The Layaway Refund BRS text in sections 4 and 5 was copied from the Invoice Refund BRS and still references `InvoiceMasterDto`, `InvoiceDetailsDto`, etc. in the prose descriptions. The **mapping tables** (lines 948–1004 of the Layaway BRS) are the authoritative source for field mappings.

The following corrections from `Invoice_Refund_Notes.md` were applied during implementation (with layaway-appropriate field substitutions):

### #1 — "New Refund" button (not "New Invoice")
The list-page button label is "New Refund", matching the Invoice Refund pattern.

### #2 — Partial-refund totals derived from refunded lines
For partial-item refunds:
- `tbirm_SubTotal` = Σ of refunded items `tbird_LineTotal` (not copied from `layaway_tbim_SubTotal`)
- `tbirm_SaleTax` = Σ of refunded items `tbird_TaxAmt`
- `tbirm_Total` = `tbirm_SubTotal + tbirm_SaleTax`
- `tbirm_RefundAmt` = Σ of payments (enforced equal to `tbirm_Total`)
- Labour, Discount, and Adjustment fields are zeroed in the save payload (refund only reflects Amount + Tax)

For payment-only refunds: `tbirm_SubTotal = 0`, `tbirm_SaleTax = 0`, `tbirm_Total = 0`, `tbirm_RefundAmt = total refund payment`.

### #3 — Save-time validation
Before POST: `Σ(tbirp_RefundAmt) === tbirm_Total` (item) or `> 0` (payment). At least one payment entry required. Must not exceed remaining refundable. Save button disabled on failure.

### #4 — Double-refund guard on picker
Each layaway row shows `remainingRefundable = tbim_Total − refundAmount`. Item Refund and Payment Refund buttons disabled when ≤ 0.

### #5 — Per-line RefundQty
Each line has an editable Refund Qty (default 0, ≤ original `LayawayDetailsDto.tbid_Qty`). `tbird_LineTotal = UnitPrice × RefundQty`. `tbird_TaxAmt = LineTotal × (tbird_TaxRate / 100)` if taxable.

### #6 — Note is user-entered
`tbirm_Note` comes from the textarea, NOT copied from `layaway_tbim_Note`.

### #7 — Refund Date datepicker
Visible in the form, defaults to today.

### #8 — Edit/Delete semantics
- Edit: `POST /api/LayawayRefundMaster/EditLayawayRefund?id={id}`. Allows changing refunded items, payments, notes, refund type.
- Delete: calls `DELETE /api/LayawayRefundMaster/{id}`. Backend reverses inventory; frontend shows confirmation dialog, then calls delete and refetches.

### #9 — Inventory-delete flag defaults to false
`tbirm_Item_Delete_after_Layaway_Refund_Create` defaults to `false`. It is a per-refund explicit checkbox, not copied from the source layaway's `layaway_tbim_Item_Delete_after_Layaway_Create`.

### #10 — Pending payment code = L
The picker's Payment Slot filter uses `L` for Pending (matching the existing Layaway module's `tbim_PayInfo` codes: `F`=Full, `P`=Partial, `L`=Pending).

### #11 — Refund total = Amount + Tax only
Labour, Discount, and Adjustment fields are zeroed in the save payload. The right-side summary shows SubTotal + Tax → Amount+Tax total.

---

## File Structure

```
src/app/(DashboardLayout)/
  react-tables/transaction/
    layaway-refund/
      page.tsx                           # Refund list page
      create/
        page.tsx                         # Create — layaway picker → refund builder
      [id]/
        edit/
          page.tsx                       # Edit existing refund
  types/apps/
    layawayRefundMaster.ts               # LayawayRefundMasterDto + related types

src/app/components/react-tables/transaction/
  layaway-refund-datatable/
    index.tsx                            # Refund list datatable
  layaway-refund-form/
    index.tsx                            # Refund builder form (create & edit)
  layaway-refund-picker/
    index.tsx                            # Layaway picker datatable (select layaway to refund)
```

## API Contract (Backend)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/LayawayRefundMaster?pageNumber=N&pageSize=N&...` | List refunds (paginated, filterable) |
| GET | `/api/LayawayRefundMaster/{id}` | Get single refund with details & payments |
| POST | `/api/LayawayRefundMaster/CreateLayawayRefund` | Create a new refund |
| POST | `/api/LayawayRefundMaster/EditLayawayRefund?id={id}` | Edit existing refund |
| DELETE | `/api/LayawayRefundMaster/{id}` | Delete a refund |
| GET | `/api/RefundMethodNames` | List refund method names (key=id, value=tbrmn_RefundMethodName) |
| GET | `/api/LayawayMaster?pageNumber=N&pageSize=N&...` | Layaway picker (reused from layaway module) |

## Key State Management Patterns

### Refund List Datatable
- SWR with URL-key pagination
- 6 search filters: Transaction No, Layaway No, Customer Name, Phone No, From Date, To Date
- Expanded row shows refunded items + totals
- Edit → navigates to `/react-tables/transaction/layaway-refund/{id}/edit`
- Delete → confirmation dialog → `deleteFetcher` → mutate

### Layaway Picker
- SWR to `/api/LayawayMaster` (reusing the layaway list endpoint)
- Columns: Transaction Id, Customer Name, Date, Total Amount, Phone No, Payment Type, Paid Amount, Already Refunded, Remaining Refundable
- Actions: Item Refund, Payment Refund (disabled if remaining ≤ 0)
- Search filters: Layaway No, Customer Name, Phone No, From Date, To Date, Payment Slot

### Refund Builder Form
- Stage-based: receives source `LayawayMasterDto` (from picker) and `refundMode` ('item' | 'payment')
- Source layaway master info displayed readonly with denormalized fields
- Items datatable with editable Refund Qty per row, live recomputed totals
- Payments datatable with add/edit/remove via Sheet (refund method combobox)
- Partial/Full refund radio → sets `tbirm_RefundType`
- Notes textarea, Refund Date datepicker
- Summary (live computed: SubTotal, SaleTax, Total, RefundAmt)
- Inventory-delete checkbox (default false)
- Save → maps Layaway→Refund DTOs, calls CreateLayawayRefund

### Edit Form
- Same component as builder but loaded from existing refund data (`GET /api/LayawayRefundMaster/{id}`)
- Uses `POST /api/LayawayRefundMaster/EditLayawayRefund?id={id}`

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Denormalized master DTO | All `layaway_tbim_*` fields stored in refund record | Self-contained refund snapshot; source layaway may change later |
| Extra detail fields | `tbird_Layaway_Qty`, `tbird_Layaway_Qty_LineTotal`, `tbird_Layaway_Qty_TaxAmt`, `tbird_TaxRate` | Backend API contract requires these for the LayawayRefundDetailsDto |
| Delete semantics | Backend reverses stock; frontend just calls DELETE | Follows existing Invoice Refund / Invoice module pattern |
| Payment refund Totals=0 | `tbirm_SubTotal=0`, `tbirm_Total=0`, `tbirm_RefundAmt=sum(payments)` | Matches existing sample data (e.g., record id=10 in BRS) |
| Edit endpoint name | `EditLayawayRefund` (not `EditRefund`) | Distinct endpoint from Invoice Refund on the backend |
| Refund builder UI | Full-page form (not modal) | Matches Invoice/Layaway/InvoiceRefund create pattern; too complex for a dialog |
| Layaway picker UI | Separate component, toggled by stage state | Same architecture as Invoice Refund |
