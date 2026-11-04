# Development Log — Transaction Reports / Check Register (Radio #4)

## Date: 2026-11-03

## Summary
Implemented the fourth radio option of the **Transaction Reports** page —
**Check Register** — per the requirements in
`agent-guides/prompts/Reports/2/CheckRegisterReport.txt`.

No new page or component file was needed: the report registry in
`src/app/components/react-tables/report/transactionreports/index.tsx` renders
everything from the active report definition (registry entry, column config,
endpoint branch, a data-normalization step, and a dedicated PDF table layout).

## UI Behaviour
- Radio option **Check Register** is now enabled (the "(soon)" placeholder is gone).
- Selecting it shows the two project datepickers, **From** and **To**
  (shared `DateField`, same datepicker format as the other reports).
- **Search** applies both dates (inverted ranges are swapped) and fetches the report.
- **Show** / eye icon opens the generated PDF in a new browser tab.
- **Export** combo offers PDF / CSV export with filename
  `Check_Register_<From>_<To>.pdf|csv`.
- Toolbar keeps the global search box, column-visibility menu; each column header
  keeps its funnel filter — identical pattern to the other reports.

## Data Table
Flat rows straight from the API (one row per date + payment method), rendered with
`@tanstack/react-table` — sorting, global search, funnel column filters, column
visibility, pagination.

| Column | Field | Type | Notes |
|---|---|---|---|
| Date | `tbip_Date` | date (`dd-MMM-yyyy`) | API returns `mm.dd.yyyy` (e.g. `06.21.2025` — confirmed since day `21` exceeds a month); normalized to ISO, displayed per the legacy PDF format |
| Description | `tbpn_PaymentName` | text | e.g. `DEBIT/CREDIT CARD`, `DEPOSIT`, `ELECT CHECK`, `FINANCE 1-K`, `FINANCE 1-P` |
| Amount | `tbip_PayAmt` | currency | e.g. `4,653.84` |

## PDF
- Company header from `api/CompanyInfo/WOLogo` via the shared `CompanyInfoHeader`
  (`tbbiBusinessName`, `tbbi_Address1`, `tbbi_Address2`).
- Title: **CHECK REGISTER**; period line `From: <MMMM dd, yyyy> To: <MMMM dd, yyyy>`.
- Dedicated legacy-style layout for this report (instead of the shared striped table):
  a `Description of Transaction | Amount` table where rows are **grouped per date**:
  - `DATE : dd-MMM-yyyy` group header row (like the legacy `DATE : 01-Oct-2025`)
  - payment rows sorted alphabetically per day (legacy order: DEBIT/CREDIT CARD,
    DEPOSIT, ELECT CHECK, FINANCE 1-K, FINANCE 1-P)
  - per-day **Total** row with the day subtotal (legacy prints the subtotal amount)
  - final **GRAND TOTAL** row (client-side sum — an enhancement over the legacy PDF,
    permitted by the "full liberty to design" clause)
- Built with the shared `html-to-image` + `jsPDF` flow, including the multi-page
  canvas-slice fix.
- The shared striped Description/Amount/Pay-Date table is untouched for the
  Daily / Daily Range reports.

## Excel
CSV export (UTF-8 BOM + quoted values) of the flat filtered rows; date cells exported
as `dd-MMM-yyyy`.

## Files Modified

### 1. Transaction Reports Component
**File:** `src/app/components/react-tables/report/transactionreports/index.tsx`

| Change | Detail |
|---|---|
| Report registry | `checkRegister` now `implemented: true`, `pdfTitle: 'Check Register'`, `fileBase: 'Check_Register'` |
| Column config | Added `CHECK_REGISTER_COLUMNS` (Date / Description / Amount) |
| API URL | New `checkRegister` branch → `api/Reports/GetCheckRegisterReport?StartDate=...&EndDate=...` |
| Date parser | `apiDottedDateToIso()` auto-detects `dd.mm.yyyy` vs `mm.dd.yyyy` (component > 12 must be the day); ambiguous dates default to `dd.mm.yyyy`. Later refined: the normalization now passes `'mdy'` explicitly so even ambiguous dates (both parts ≤ 12) are read as `mm.dd.yyyy` — proven correct for this endpoint by `06.21.2025`. |
| (`2026-11-03` note | When the **On Credit / Pending Amount** report was implemented from `Reports/2/PendingAmount.txt`, its sample (`04.13.2017`) also proved `mm.dd.yyyy`; the shareable parser gained a `mode` parameter and Check Register switched to `'mdy'`. |
| Data normalization | New `checkRegister` branch in the `reportData` useMemo normalizes `tbip_Date` to ISO |
| PDF grouping | New `pdfCheckGroups` useMemo groups the *filtered* rows per date (ascending, alphabetical payment rows), computes per-day totals and the grand total |
| Print node | Dedicated grouped/totalled table for Check Register; the shared table is kept for all other reports |

### 2. This Development Log
**File:** `agent-guides/prompts/Reports/DEVLOG_CheckRegister.md`

## Reference PDF
`agent-guides/prompts/Reports/CheckRegister.pdf` (5 pages) was extracted and used as
the layout reference — column header wording, per-date grouping, day subtotals, date
format `dd-MMM-yyyy`, money format with thousands separators, and the standard
company header / `Print Date & Time` footer all mirror it.

## API Endpoint Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for the report header |
| `api/Reports/GetCheckRegisterReport` | Flat payment rows for the selected date range |

### Query Parameters
| Parameter | Format | Required |
|---|---|---|
| `StartDate` | `dd-MMM-yyyy` (e.g. `01-Jan-2025`) | No (nullable) |
| `EndDate` | `dd-MMM-yyyy` (e.g. `31-Dec-2025`) | No (nullable) |

## Response Shape
```json
[
  {
    "tbip_Date": "06.21.2025",
    "tbpn_PaymentName": "DEBIT/CREDIT CARD",
    "tbip_PayAmt": 4653.84
  }
]
```
- `tbip_Date` — dotted `mm.dd.yyyy` on this endpoint (unlike the other reports'
  `dd.mm.yyyy`); handled by the auto-detecting parser.
- `tbpn_PaymentName` — payment method description.
- `tbip_PayAmt` — amount; per-day totals and the grand total are computed client-side.

## Validation
- `npx tsc --noEmit` — passes with no errors.
- `npx eslint` on the modified component — 0 errors (only the pre-existing
  TanStack Table / `any` warnings present before this change).

## Remaining (future phases)
- Invoice Data, On Credit — still "(soon)" placeholders, following the same
  registry + column config + endpoint branch pattern.

---

## 2026-11-04 � PDF export migrated from raster to vector

Show PDF / PDF Export no longer screenshot the hidden print DOM (`toPng` +
`sliceTallImageIntoPdfPages`). A full Check Register (~870 rows � 25-30 pages)
made the old pipeline render one giant 816px PNG and re-encode every page
slice, so exports took seconds and the text was only screen resolution (blurry
when zoomed).

Now `src/app/components/react-tables/shared/vectorReportPdf.ts` builds native
jsPDF output via `jspdf-autotable` (new dependency): company header block,
title, date line, auto-paginated table with repeated header rows and a Print
Date & Time footer on every page. `transactionreports/index.tsx` feeds the
same layout data (per-day groups, day totals + grand total, invoice detail
rows, On Credit totals footer) in via `VectorPdfTableSpec`. Smoke test: ~870
rows ? 29 pages in ~400ms at 373KB. Excel/CSV export untouched; the hidden
print node remains only for browser Ctrl+P printing.
