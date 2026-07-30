# Invoice Pending Amount Collection — Implementation Notes

## BRS Reference
See `agent-guides/prompts/Invoice_collect_pending_money.txt`

## Files Created

| File | Purpose |
|------|---------|
| `src/app/(DashboardLayout)/react-tables/transaction/invoice-collect/page.tsx` | List page for pending invoices |
| `src/app/components/react-tables/transaction/invoice-collect-datatable/index.tsx` | Datatable showing invoices with pending amounts + Collect button |
| `src/app/(DashboardLayout)/react-tables/transaction/invoice-collect/[id]/page.tsx` | Collect form page (invoice-scoped) |
| `src/app/components/react-tables/transaction/invoice-collect-form/index.tsx` | Form to collect payments against pending invoice |

## Files Modified

| File | Change |
|------|--------|
| `src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts` | Added "Collect Invoice Amount" under Transaction menu |

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/InvoiceMaster?pageNumber=X&pageSize=Y&PendingListOnly=true` | GET | List invoices with pending amounts |
| `/api/InvoiceMaster/{id}` | GET | Get single invoice with full details |
| `/api/PaymentNames` | GET | Get payment method options |
| `/api/InvoiceMaster/SavePayments` | POST | Save new payments (array of payment objects) |

### SavePayments Input
```json
[
  {
    "id": 0,
    "tbip_InvoiceId": 4059,
    "tbip_PaymentId": 4,
    "tbip_PayAmt": 999,
    "tbip_Date": "2026-07-30T03:36:28.645Z",
    "tbip_PaymentType": "P",
    "tbip_LayawayId": null,
    "tdip_fromlayaway": "N",
    "tbip_LayawayDate": null,
    "paymentName": "cash"
  }
]
```

### SavePayments Response
```json
{
  "message": "Payment adjusted successfully",
  "invoiceId": 4059
}
```

## Form Behavior

The collect form shows the invoice in read-only mode (customer info, items, totals) and provides a payment entry panel where users can add new payments. Existing payment records are NOT shown. Live calculation tracks:

- **Paid Amount** — original `tbim_PaidAmt`
- **Pending Amount** — original `pendingAmount`
- **Current Paid Amount** — original paid + sum of new payments
- **Current Pending Amount** — pending - sum of new payments

## DUPLICATION NOTES FOR LAYAWAY

When implementing the same for Layaway pending amount collection:

1. Create a similar set of files under `layaway-collect/` following the same pattern
2. Sidebar link: "Collect Layaway Amount" with icon `solar:hand-money-linear`
3. API endpoint will be different — use the layaway equivalent of SavePayments
4. The datatable will mirror the layaway datatable but with pending-only filter and Collect button
5. The collect form will mirror this invoice-collect-form but loaded with layaway data
6. Import from layaway types instead of invoice types
