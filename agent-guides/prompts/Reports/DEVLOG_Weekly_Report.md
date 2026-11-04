# Development Log — Transaction Reports / Weekly-Monthly Report (Radio #3)

## Date: 2026-11-03

## Summary
Implemented the third radio option of the **Transaction Reports** page —
**Weekly/Monthly Report** — per the requirements in
`agent-guides/prompts/Reports/2/Weekly_Report.txt`.

No new page or component file was needed: the report registry in
`src/app/components/react-tables/report/transactionreports/index.tsx` renders
everything from the active report definition, so this phase required a registry
entry, a column config, an endpoint branch, and a small data-normalization step.

## UI Behaviour
- Radio option **Weekly/Monthly Report** is now enabled (the "(soon)" placeholder is gone).
- Selecting it shows two project datepickers, **From** and **To** (shared `DateField`
  component — same datepicker format as the other reports).
- **Search** applies both dates (inverted From/To ranges are swapped automatically)
  and fetches the report.
- **Show** / eye icon opens the generated PDF in a new browser tab.
- **Export** combo offers **PDF Export** / **Excel Export**.
- Toolbar keeps the global search box, column-visibility menu, and each column header
  keeps its funnel filter (ColumnFilterInput) — identical design pattern to the Daily
  Report and the other datatables in the project.
- Range From/To summary chips above the table come free from the shared range logic.
- The "will be available in a future phase" placeholder no longer shows for this radio.

## Data Table
Uses `@tanstack/react-table` with sorting, global search, funnel column filters,
column visibility and pagination.

| Column | Field | Type | Notes |
|---|---|---|---|
| Date | `date` | date (`dd-MMM-yyyy`) | API returns `dd.mm.yyyy`; normalized to ISO then displayed per the legacy PDF format; sortable as ISO |
| Credit | `credit` | currency | |
| Cash | `cash` | currency | |
| CreditCard Visa | `creditCardVisa` | currency | |
| DEBIT CARD | `debitcard` | currency | |
| CHECKElect Reg | `checkElectReg` | currency | |
| CreditCard Master | `creditCardMaster` | currency | |
| CreditCard Disc | `creditCardDisc` | currency | |
| CreditCard Amex | `creditCardAmex` | currency | |
| Finance 1-K | `crestFinance` | currency | |
| Finance 1-P | `progFinance` | currency | |
| Grand Total | `grandTotal` | currency | **Derived client-side** — sum of the ten payment-method amounts; not in the API payload (matches the legacy PDF, which prints it) |

Given 12 columns, the table scrolls horizontally; each currency column has a small
`minWidth` so headers wrap to two lines, mirroring the reference PDF's two-line header
(`CreditCard` / `Visa` etc.).

## PDF
- Company header from `api/CompanyInfo/WOLogo` via the shared `CompanyInfoHeader`
  component (`tbbiBusinessName`, `tbbi_Address1`, `tbbi_Address2`).
- Title: **WEEKLY/MONTHLY REPORT**; period line `From: <MMMM dd, yyyy> To: <MMMM dd, yyyy>`.
- Striped table with the exact legacy column layout: `Date | Credit | Cash |
  CreditCard Visa | DEBIT CARD | CHECKElect Reg | CreditCard Master | CreditCard Disc |
  CreditCard Amex | Finance 1-K | Finance 1-P | Grand Total`.
- Amounts as `1,234.56` (thousands separator, 2 decimals); dates as `01-Oct-2025`
  (the legacy PDF's `dd-MMM-yyyy` format).
- Date column left-aligned; all amount columns right-aligned, like the legacy report.
- `Print Date & Time:` footer (`dd-MMM-yyyy` + `H:mm`, e.g. `30-Oct-2026 18:13`).
- Built with the shared `html-to-image` + `jsPDF` flow, including the multi-page
  canvas-slice fix.

## Excel
CSV export (UTF-8 BOM + quoted values) of the currently filtered rows; date cells are
exported as `dd-MMM-yyyy` to match the PDF.

## Files Modified

### 1. Transaction Reports Component
**File:** `src/app/components/react-tables/report/transactionreports/index.tsx`

| Change | Detail |
|---|---|
| Report registry | `weeklyMonthly` now `implemented: true`, `pdfTitle: 'Weekly/Monthly Report'`, `fileBase: 'Weekly_Report'` |
| `ColumnConfig` | Added a new column type `'date'` (ISO-stored, `dd-MMM-yyyy`-displayed, left-aligned) |
| Column config | Added `WEEKLY_COLUMNS` (12 columns with legacy headers) and `WEEKLY_AMOUNT_KEYS` for the Grand Total computation |
| API URL | New `weeklyMonthly` branch → `api/Reports/GetdailyWeeklyReport?StartDate=...&EndDate=...` |
| Data normalization | `reportData` useMemo now normalizes weekly rows: `date` (`dd.mm.yyyy` → ISO via `apiDottedDateToIso`) + derived `grandTotal` |
| Helpers | New `apiDottedDateToIso()` and `formatReportDate()`; existing `toApiDate` / `fileSuffix` reused for params and filenames |
| Cell renderer | Table cell, PDF cell, and header-alignment logic now honour the `date` type (date columns left-aligned, header hugged left) |
| Excel export | Date cells formatted as `dd-MMM-yyyy` |

### 2. This Development Log
**File:** `agent-guides/prompts/Reports/DEVLOG_Weekly_Report.md`

## Reference PDF
`agent-guides/prompts/Reports/WeeklyReport.pdf` (2 pages) was extracted and used as the
layout reference — column set, header names, date format, money format and footer all
mirror it (design-liberty deviations: title + From/To period line added on top,
striped rows, dash for empty date cells not needed since all rows carry a date).

## API Endpoint Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for the report header |
| `api/Reports/GetdailyWeeklyReport` | Weekly per-day payment totals for the selected date range |

### Query Parameters
| Parameter | Format | Required |
|---|---|---|
| `StartDate` | `dd-MMM-yyyy` (e.g. `01-Jan-2025`) | No (nullable) |
| `EndDate` | `dd-MMM-yyyy` (e.g. `31-Jan-2025`) | No (nullable) |

## Response Shape
```json
[
  {
    "date": "01.02.2025",
    "credit": 0,
    "cash": 122.98,
    "creditCardVisa": 132.79,
    "debitcard": 3201.81,
    "checkElectReg": 0,
    "creditCardMaster": 15,
    "creditCardDisc": 0,
    "creditCardAmex": 1855.41,
    "crestFinance": 0,
    "progFinance": 0
  }
]
```
- `date` — backend dotted format, normalized to ISO then shown as `dd-MMM-yyyy`.
- All ten payment-method fields — numbers, summed into the derived `grandTotal`.

## Validation
- `npx tsc --noEmit` — passes with no errors.
- `npx eslint` on the modified component — 0 errors (only the pre-existing
  TanStack Table / `any` warnings that were present before this change).

## Remaining (future phases)
- Check Register, Invoice Data, On Credit — still "(soon)" placeholders. Each needs a
  registry entry, a `ColumnConfig[]`, an `apiUrl` branch and, if it has dotted dates,
  the same normalization pattern used here.
