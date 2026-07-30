# Layaway Pending Amount Collection — Implementation Notes

## BRS Reference
See `agent-guides/prompts/Layaway_collect_pending_money.txt`

## Files Created

| File | Purpose |
|------|---------|
| `src/app/(DashboardLayout)/react-tables/transaction/layaway-collect/page.tsx` | List page for pending layaways |
| `src/app/components/react-tables/transaction/layaway-collect-datatable/index.tsx` | Datatable showing layaways with pending amounts + Collect button |
| `src/app/(DashboardLayout)/react-tables/transaction/layaway-collect/[id]/page.tsx` | Collect form page (layaway-scoped) |
| `src/app/components/react-tables/transaction/layaway-collect-form/index.tsx` | Form to collect payments against pending layaway |

## Files Modified

| File | Change |
|------|--------|
| `src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts` | Added "Collect Layaway Amount" under Transaction menu |

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/LayawayMaster?pageNumber=X&pageSize=Y&PendingListOnly=true` | GET | List layaways with pending amounts |
| `/api/LayawayMaster/{id}` | GET | Get single layaway with full details |
| `/api/PaymentNames` | GET | Get payment method options |
| `/api/LayawayMaster/SavePayments` | POST | Save new payments (array of payment objects) |

### SavePayments Input
```json
[
  {
    "id": 0,
    "tbip_InvoiceId": 0,
    "tbip_PaymentId": 0,
    "tbip_PayAmt": 0,
    "tbip_Date": "2026-07-30T08:52:55.786Z",
    "tbip_PaymentType": "string",
    "paymentName": "string"
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

The collect form shows the layaway in read-only mode (customer info, items, totals) and provides a payment entry panel where users can add new payments. Existing payment records are NOT shown. Live calculation tracks:

- **Paid Amount** — original `tbim_PaidAmt`
- **Pending Amount** — original `pendingAmount`
- **Current Paid Amount** — original paid + sum of new payments
- **Current Pending Amount** — pending - sum of new payments

## Reference

This implementation follows the same pattern as the Invoice Pending Amount Collection. See `agent-guides/prompts/Invoice_Pending_Collection_Notes.md` for the reference implementation.
