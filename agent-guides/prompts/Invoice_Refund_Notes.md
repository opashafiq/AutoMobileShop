# Invoice Refund Module — Design Notes

## Corrections & Deviations from Original BRS

### #11 — Refund total = Amount + Tax only (no Labour/Discount/Adjustment)
Per user feedback: the refund calculation only includes **Amount (line total)** and **Tax**. Labour, Discount, and Adjustment fields have been **removed** from the refund form entirely. The right-side summary shows Sub Total + Tax → Amount+Tax total. A running "Total Return Amount" sum (Amount + Tax) is shown directly below the items datatable for quick reference while entering return quantities.

Based on review with the portal operator (Shafiq), the following changes were made to the original BRS before implementation:

### #1 — "New Invoice" renamed to "New Refund"
The button in the refund list that navigates to the invoice-picker is labeled **"New Refund"**, not "New Invoice" (which implied creating a new invoice, not a refund).

### #2 — Partial-refund totals derived from refunded lines, not copied from invoice
The original BRS mapping copied the full invoice totals into the refund master (`tbirm_SubTotal = InvoiceMasterDto.tbim_SubTotal`, same for `tbirm_Total`, etc.). This is only correct for full-item refunds. For partial-item refunds, the refund's financial fields must reflect **only the lines being returned**:

- `tbirm_SubTotal` = Σ of refunded items `tbird_LineTotal` (not the invoice's full subtotal)
- `tbirm_SaleTax` = Σ of refunded items `tbird_TaxAmt`
- `tbirm_Total` = `tbirm_SubTotal + tbirm_SaleTax + tbirm_Labour − tbirm_DisAmt + tbirm_AdjAmt`
- `tbirm_RefundAmt` = sum of `invoiceRefundPaymentsDto[].tbirp_RefundAmt` (enforced equal to `tbirm_Total`)
- `tbirm_Labour` / `tbirm_DisPer` / `tbirm_DisAmt` / `tbirm_AdjAmt` — the user may adjust these; they default from the source invoice.

For **Payment Refund** (no items): `tbirm_SubTotal = 0`, `tbirm_SaleTax = 0`, `tbirm_Total = 0`, `tbirm_RefundAmt = total refund payment`. Matches sample record `id=23` in the BRS.

### #3 — Save-time validation: refund payments must equal refund total
Before POST, the form validates `Σ(tbird_RefundAmt) === tbirm_Total`. If mismatched, the Save button is disabled with a validation message.

### #4 — Double-refund guard on invoice picker
The invoice-picker datatable (shown when creating a new refund) checks each invoice's remaining refundable amount:
- `remainingRefundable = invoiceMaster.tbim_Total − invoiceMaster.refundAmount`
- If `remainingRefundable <= 0`, the "Item Refund" and "Payment Refund" action buttons are disabled/hidden.
- The refund builder caps the total refundable to `remainingRefundable`.

### #5 — Per-line refund quantity (RefundQty)
For Item Refund, each line in the InvoiceDetails grid has an editable **Refund Qty** field, distinct from the originally-purchased Qty, with these rules:
- `RefundQty` ≤ original `InvoiceDetailsDto.tbid_Qty`
- `tbird_LineTotal = UnitPrice × RefundQty`
- `tbird_TaxAmt = LineTotal × (taxRate / 100)` (if taxable)
- Default `RefundQty` = 0 (user must enter the quantity being returned)

### #6 — Refund note is user-entered, not copied from invoice
The textarea in the refund builder sets `tbirm_Note` directly from user input. It is **not** copied from `InvoiceMasterDto.tbim_Note`.

### #7 — Refund Date datepicker included in the form
The builder includes a visible "Refund Date" datepicker (`tbirm_InvRefundDate`), defaulting to today. This was referenced in the BRS mapping but missing from the UI description.

### #8 — Edit/Delete semantics
- **Edit**: uses `POST /api/InvoiceRefundMaster/EditRefund?id={id}`. Allows changing refunded items, payments, notes, refund type.
- **Delete**: calls `DELETE /api/InvoiceRefundMaster/{id}`. The backend is responsible for reversing any inventory adjustment (frontend just shows a confirmation dialog, then calls delete and re-fetches the list).

### #9 — Inventory-delete flag not auto-copied from invoice
`tbirm_Item_Delete_after_Invoice_Refund_Create` defaults to `false` (items are NOT removed from inventory on refund). It is a per-refund explicit choice (checkbox in the builder), not copied from the source invoice's `tbim_Item_Delete_after_Invoice_Create`.

### #10 — Pending payment code = L, not N
The invoice picker's "Pending" filter value uses `L` (matching the existing Invoice module's `tbim_PayInfo` codes: `F`=Full, `P`=Partial, `L`=Pending). The BRS originally specified `N` — confirmed with backend, the picker's query parameter `paymentSlot` accepts `L`.

---

## File Structure

```
src/app/(DashboardLayout)/
  react-tables/transaction/
    invoice-refund/
      page.tsx                           # Refund list page
      create/
        page.tsx                         # Create — invoice picker → refund builder
      [id]/
        edit/
          page.tsx                       # Edit existing refund
  types/apps/
    refundMaster.ts                      # InvoiceRefundMasterDto + related types

src/app/components/react-tables/transaction/
  invoice-refund-datatable/
    index.tsx                            # Refund list datatable
  invoice-refund-form/
    index.tsx                            # Refund builder form (create & edit)
  invoice-refund-picker/
    index.tsx                            # Invoice picker datatable (select invoice to refund)
```

## API Contract (Backend)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/InvoiceRefundMaster?pageNumber=N&pageSize=N&...` | List refunds (paginated, filterable) |
| GET | `/api/InvoiceRefundMaster/{id}` | Get single refund with details & payments |
| POST | `/api/InvoiceRefundMaster/CreateRefund` | Create a new refund |
| POST | `/api/InvoiceRefundMaster/EditRefund?id={id}` | Edit existing refund |
| DELETE | `/api/InvoiceRefundMaster/{id}` | Delete a refund |
| GET | `/api/RefundMethodNames` | List refund method names (key=id, value=tbrmn_RefundMethodName) |
| GET | `/api/Departments` | List departments/categories |
| GET | `/api/InvoiceMaster?pageNumber=N&pageSize=N&...` | Invoice picker (reused from invoice module) |

## Key State Management Patterns

### Refund List Datatable (`invoice-refund-datatable`)
- SWR with URL-key pagination (mirrors `invoice-datatable`)
- 6 search filters: Transaction No, Invoice No, Customer Name, Phone No, From Date, To Date
- Columns: Transaction Id, Customer Name, Date, Total Amount, Phone No, Refund Amount, Actions (edit, delete)
- Edit → navigates to `/react-tables/transaction/invoice-refund/{id}/edit`
- Delete → confirmation dialog → `deleteFetcher` → mutate

### Invoice Picker (`invoice-refund-picker`)
- SWR to `/api/InvoiceMaster` (reusing the invoice list endpoint)
- Columns: Transaction Id, Customer Name, Date, Total Amount, Phone No, Payment Type, Paid Amount, Already Refunded, Remaining Refundable
- Actions: Item Refund, Payment Refund (disabled if remaining <= 0)
- Search filters: Invoice No, Customer Name, Phone No, From Date, To Date, Payment Slot

### Refund Builder Form (`invoice-refund-form`)
- Stage-based: receives `sourceInvoiceMasterDto` (from picker) and `refundMode` ('item' | 'payment')
- **Mode = Item Refund**:
  - Invoice master info displayed readonly
  - Items datatable with editable RefundQty per row
  - Payments datatable with add/edit/remove
  - Partial/Full refund radio → sets `tbirm_RefundType` = `P` or `F`
  - Notes textarea, Refund Date datepicker
  - Value summary (live computed: SubTotal, SaleTax, Total, RefundAmt)
  - Inventory-delete checkbox (default false)
  - Save → maps Invoice→Refund DTOs, calls CreateRefund
- **Mode = Payment Refund**:
  - Same as Item Refund, EXCEPT:
  - Items datatable is NOT shown (no details saved)
  - Only payments + RefundAmt saved
- Validation before save:
  - Σ(payments) === tbirm_Total (for item refund)
  - Σ(payments) === tbirm_RefundAmt (for payment refund)
  - At least one payment entry
  - totals not exceeding remaining refundable

### Edit Form
- Same component as builder but loaded from existing refund data (`GET /api/InvoiceRefundMaster/{id}`)
- Mode = 'edit' vs 'create'
- Uses `POST /api/InvoiceRefundMaster/EditRefund?id={id}`

---

## Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Delete semantics | Backend reverses stock; frontend just calls DELETE | Follows existing Invoice module pattern |
| Payment refund Totals=0 | `tbirm_SubTotal=0, tbirm_Total=0, tbirm_RefundAmt=sum(payments)` | Matches existing sample data (id=23) |
| Edit endpoint name | `EditRefund` (not `EditLayaway`) | Fixed copy-paste error from layaway module |
| Refund builder UI | Full-page form (not modal) | Matches Invoice/Layaway create pattern; too complex for a dialog |
| Invoice picker UI | Separate component, toggled by stage state | Clean separation; the picker needs its own search/filters separate from the builder |
