# Development Log — Transaction Reports / On Credit — Pending Amount Report (Radio #6)

## Date: 2026-11-03

## Summary
Implemented the sixth radio option of the **Transaction Reports** page —
**On Credit**, backed by the **Pending Amount Report** endpoint — per the
requirements in `agent-guides/prompts/Reports/2/PendingAmount.txt`.

No new page or component file was needed: the report registry in
`src/app/components/react-tables/report/transactionreports/index.tsx` renders
everything from the active report definition (registry entry, column config,
endpoint branch, a data-normalization step, and a totals footer in the PDF).

## Naming note
The requirement file is named `PendingAmount.txt` but BRS #1 explicitly targets the
**6th radio button (On Credit)**. Implementation therefore keeps the radio label
`On Credit` (as the registry already defined) while the report/PDF title and download
names reflect the endpoint: PDF title **PENDING AMOUNT REPORT**, filename
`Pending_Amount_<From>_<To>.pdf|csv`.

## UI Behaviour
- Radio option **On Credit** is now enabled (the "(soon)" placeholder is gone).
- Selecting it shows the two project datepickers, **From** and **To**
  (shared `DateField`, same datepicker format as the other reports).
- **Search** applies both dates (inverted ranges are swapped) and fetches the report.
- **Show** / eye icon opens the generated PDF in a new browser tab.
- **Export** combo offers PDF / CSV export.

### Date parameters (assumption documented)
The endpoint sample is given as `api/Reports/GetPendingAmount` *without* query
parameters, but BRS #2 requires From/To date pickers. Following the uniform pattern
of every other report, the call sends optional `StartDate` / `EndDate`
(`dd-MMM-yyyy`) query parameters; an ASP.NET binder simply ignores them if the
endpoint does not support filtering, in which case the report lists all pending
invoices. No other param shape is possible without backend confirmation.

## Data Table
One row per pending / partially paid invoice, rendered with `@tanstack/react-table`
— sorting, global search, funnel column filters, column visibility, pagination.

| Column | Field | Type | Notes |
|---|---|---|---|
| Invoice Date | `tbim_InvDate` | date (`dd-MMM-yyyy`) | API returns `mm.dd.yyyy` (e.g. `04.13.2017` — proven month-first); normalized to ISO with the `'mdy'` parser mode |
| Invoice No | `tbim_InvoiceIdRad` | text | e.g. `934482` |
| Customer | `tbim_Name` | text | |
| Company | `tbti_ComName` | text | nullable → dash |
| Payment Method(s) | `tbip_Paymentname` | text | comma-joined, e.g. `CC Master,CC Visa` (note: different casing than the Check Register's `tbpn_PaymentName`) |
| Total | `tbim_Total` | currency | |
| Paid Amount | `tbim_PaidAmt` | currency | |
| Pending Amount | `pendingAmount` | currency | **Derived client-side** = Total − Paid Amount; not in the API payload |
| Status | `payInfo` | text | `PARTIAL` / etc. (friendly text variant of `tbim_PayInfo` = `P`) |

## PDF
- No legacy PDF exists for this report (per the requirement file) — designed freely
  on the shared pattern of the other reports.
- Company header from `api/CompanyInfo/WOLogo` via the shared `CompanyInfoHeader`
  (`tbbiBusinessName`, `tbbi_Address1`, `tbbi_Address2`).
- Title: **PENDING AMOUNT REPORT**; period line `From: <MMMM dd, yyyy> To: <MMMM dd, yyyy>`.
- Shared striped table with the nine columns above (dates `dd-MMM-yyyy`, amounts
  with thousands separators, 2 decimals, nullable cells as dashes).
- **Totals footer row**: `TOTALS (N records)` spanning the label columns with the
  summed Total / Paid Amount / Pending Amount and count — a pending-amount report
  without totals is not very useful.
- Built with the shared `html-to-image` + `jsPDF` flow, including the multi-page
  canvas-slice fix.

## Excel
CSV export (UTF-8 BOM + quoted values) of the flat filtered rows; date cells exported
as `dd-MMM-yyyy`.

## Files Modified

### 1. Transaction Reports Component
**File:** `src/app/components/react-tables/report/transactionreports/index.tsx`

| Change | Detail |
|---|---|
| Report registry | `onCredit` now `implemented: true`, `pdfTitle: 'Pending Amount Report'`, `fileBase: 'Pending_Amount'` |
| Column config | Added `PENDING_COLUMNS` (nine columns, including the derived `pendingAmount`) |
| API URL | New `onCredit` branch → `api/Reports/GetPendingAmount` (+ optional `StartDate`/`EndDate`) |
| Date parser | `apiDottedDateToIso()` gained an explicit `mode` parameter (`'dmy'` default / `'mdy'`); Check Register normalization switched to `'mdy'`; Pending Amount uses `'mdy'` |
| Helper | Added `numOrZero()` to coerce API numeric cells (used by the derived pending amount and the PDF totals row) |
| Data normalization | New `onCredit` branch in the `reportData` useMemo: `tbim_InvDate` → ISO (`mdy`) and `pendingAmount` = `tbim_Total − tbim_PaidAmt` |
| Print node | The shared striped table now appends a totals footer row when the active report is `onCredit` |

### 2. This Development Log
**File:** `agent-guides/prompts/Reports/DEVLOG_OnCredit_PendingAmount.md`

### 3. Check Register dev log
**File:** `agent-guides/prompts/Reports/DEVLOG_CheckRegister.md` — appended a note
about the parser `mode` refinement introduced here.

## API Endpoint Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for the report header |
| `api/Reports/GetPendingAmount` | Pending / partially paid invoices (+ optional `StartDate` / `EndDate`, see assumption above) |

## Response Shape
```json
[
  {
    "tbip_Paymentname": "CC Master,CC Visa",
    "id": 232,
    "tbim_InvoiceIdRad": 934482,
    "tbim_Name": "monica momin",
    "tbti_ComName": null,
    "tbim_InvDate": "04.11.2017",
    "tbim_Total": 117.45,
    "tbim_PaidAmt": 117.45,
    "tbim_PayInfo": "P",
    "payInfo": "PARTIAL"
  }
]
```
- `tbim_InvDate` — dotted `mm.dd.yyyy`; normalized to ISO (`mdy` mode), displayed as
  `dd-MMM-yyyy`. Ambiguous values such as `04.11.2017` are read as `MM dd` per this
  endpoint's proven convention.
- `pendingAmount` — derived (`tbim_Total − tbim_PaidAmt`).
- `id` / `tbim_PayInfo` — kept in the raw row but not surfaced as columns
  (`payInfo` is the friendlier text variant of `tbim_PayInfo`).

## Validation
- `npx tsc --noEmit` — passes with no errors.
- `npx eslint` on the modified component — 0 errors (only the pre-existing
  TanStack Table / `any` warnings present before this change).

## Status of all radios
| # | Radio | State |
|---|---|---|
| 1 | Daily Report | ✅ (earlier phase) |
| 2 | Daily Report (Date Range) | ✅ (earlier phase) |
| 3 | Weekly/Monthly Report | ✅ (earlier phase) |
| 4 | Check Register | ✅ (earlier phase) |
| 5 | Invoice Data | ▪ not in scope of any prompt file received so far — still "(soon)" |
| 6 | On Credit (Pending Amount) | ✅ this phase |
