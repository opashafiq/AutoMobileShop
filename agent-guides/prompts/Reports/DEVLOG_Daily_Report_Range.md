# Development Log — Transaction Reports / Daily Report (Date Range)

## Date: 2026-11-03

## Summary
Implemented the second radio option of the **Transaction Reports** page —
**Daily Report (Date Range)** — per the requirements in
`agent-guides/prompts/Reports/2/Daily_Report_Range.txt`.

The page was already built as a report registry (see `DEVLOG_Daily_Report.md`), so this
phase only required a new registry entry, a column config, an endpoint branch, and
range-aware report header / summary / filename handling. No new page or component file
was needed: the existing `transactionreports` component renders everything from the
active report definition.

## UI Behaviour
- Radio option **Daily Report (Date Range)** is now enabled (no more "(soon)" label).
- Selecting it shows two project datepickers, **From** and **To** (shared `DateField`
  component — same datepicker format used by the other reports/forms).
- **Search** applies both dates and fetches the report.
- **Show** opens the generated PDF in a new browser tab (same as the Daily Report).
- **Export** combo keeps **PDF Export** / **Excel Export** behaviours.
- Toolbar keeps the search box, column-visibility menu, quick PDF preview (eye icon)
  and the funnel column filters on every column header — identical design pattern to
  the Daily Report and the other datatables in the project.
- Switching radios resets applied filters/search and the query, so each report loads
  only when the user presses Search.
- If the picked range is inverted (From > To), the two dates are swapped automatically
  on Search so the request is always valid.

## Data Table
Uses `@tanstack/react-table` with sorting, global search, funnel column filters,
column visibility and pagination (10/20/30/50/100 per page).

| Column | Field | Type |
|---|---|---|
| Description | `categoryName` | text, filterable |
| Amount | `totalAmount` | currency, right-aligned, filterable |
| Pay Date | `paydate` | text, filterable (dash when null) |

The selected From/To dates are shown as summary chips above the table instead of being
repeated on every row (they repeat on each API row: `startDate` / `endDate`).

## PDF
- Company header from `api/CompanyInfo/WOLogo` via the shared `CompanyInfoHeader`
  component (`tbbiBusinessName`, `tbbi_Address1`, `tbbi_Address2`).
- Title: **DAILY REPORT (DATE RANGE)**.
- Period line below the title: `From: <MMMM dd, yyyy>   To: <MMMM dd, yyyy>`.
- Same striped Description / Amount / Pay Date table as the Daily Report, rendered as
  returned by the API (no client-side totals — summary rows such as TOTAL_SALE,
  SALE TAX, TOTAL and payment-method rows come from the backend).
- `Print Date & Time:` footer, as in the legacy report.
- Built with the shared `html-to-image` + `jsPDF` flow, including the multi-page
  canvas-slice fix (pages 2+ no longer render blank).
- Filename: `Daily_Report_Range_<From>_<To>.pdf`
  (e.g. `Daily_Report_Range_01-Jan-2025_31-Dec-2025.pdf`).
- **Show** opens the same PDF as a blob URL in a new tab for viewing/printing.

## Excel
CSV export (UTF-8 BOM + quoted values) of the currently filtered rows.
Filename: `Daily_Report_Range_<From>_<To>.csv`.

## Files Modified

### 1. Transaction Reports Component
**File:** `src/app/components/react-tables/report/transactionreports/index.tsx`

| Change | Detail |
|---|---|
| Report registry | `dailyRange` now `implemented: true`, `dateMode: 'range'`, `pdfTitle: 'Daily Report (Date Range)'`, `fileBase: 'Daily_Report_Range'` |
| Column config | Added `DAILY_RANGE_COLUMNS` (Description / Amount / Pay Date), mirroring `DAILY_COLUMNS`; `activeColumns` now resolves per report key |
| API URL | New `dailyRange` branch → `api/Reports/GetdailyReportRange?StartDate=...&EndDate=...` |
| Search handler | `handleShow` swaps an inverted From/To range before applying the query |
| Filenames | New `fileSuffix()` helper — single date for Daily Report, `_from_to` for range reports |
| Summary chips | Range reports show separate **From** and **To** chips |
| PDF header | Range reports print `From: … To: …`; single-date reports keep `Date: …` |
| Table cells | Cell min-widths now come from the active column config (removed hardcoded column keys) |
| Copy | Replaced "Daily Report is implemented first" / "press Show" hints with generic wording |

### 2. This Development Log
**File:** `agent-guides/prompts/Reports/DEVLOG_Daily_Report_Range.md`

## API Endpoint Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for the report header |
| `api/Reports/GetdailyReportRange` | Daily report data for the selected date range |

### Query Parameters
| Parameter | Format | Required |
|---|---|---|
| `StartDate` | `dd-MMM-yyyy` (e.g. `01-Jan-2025`) | No (nullable) |
| `EndDate` | `dd-MMM-yyyy` (e.g. `31-Dec-2025`) | No (nullable) |

## Response Shape
```json
[
  {
    "startDate": "01.01.2025",
    "categoryName": "Accessories",
    "totalAmount": 301.01,
    "paydate": null,
    "endDate": "12.31.2025"
  }
]
```
- `startDate` / `endDate` — range echoed on each row (`MM.dd.yyyy` style string);
  displayed once in the page chips / PDF header, not as table columns.
- `categoryName` — row description (categories plus backend summary rows).
- `totalAmount` — number, formatted with 2 decimals.
- `paydate` — nullable; rendered as a subtle dash (—) when null.

## Validation
- `npx tsc --noEmit` — passes with no errors.
- `npx eslint` on the modified component — no errors (only the pre-existing
  TanStack Table / `any` warnings also present before this change).
## Excel Update — Date: 2026-11-03 (From/To header block)

User feedback: the Excel/CSV export should carry the selected period in the file
header. The CSV export of every **range-mode** report (Daily Report (Date Range),
Weekly/Monthly, Check Register, Invoice Data, On Credit) now starts with:

```
"Daily Report (Date Range)"
"From","01-Jan-2025"
"To","31-Dec-2025"

<column header row>
<data rows…>
```

- Dates use the same `dd-MMM-yyyy` format as the filename suffix / API params.
- Mirrors the `From: … To: …` period line printed on the PDFs.
- Implemented in `handleExportExcel` (`transactionreports/index.tsx`); values are
  quoted so the comma-safe CSV shape is preserved. Validation: `npx tsc --noEmit`,
  eslint — 0 errors.

## Reference PDF Verification — Date: 2026-11-03

Compared the implementation against the attached legacy report
`agent-guides/prompts/Reports/DailyReport_Date_Range.pdf` (extracted its content and
checked each required element). Result table:

| # | Reference PDF element | Implementation | Status |
|---|---|---|---|
| 1 | Company header on top: `Apollo Tire & Wheel` / `3722 NASA ROAD 1 (NASA PKWY)` / `SEABROOK TEXAS 77586` | `CompanyInfoHeader` rendered first in the hidden print node, using `tbbiBusinessName` / `tbbi_Address1` / `tbbi_Address2` from `api/CompanyInfo/WOLogo` | Matches |
| 2 | Period line, e.g. `Date: October 26, 2026 To October 03, 2025` (long-date format) | Range reports print `From: <MMMM dd, yyyy> To: <MMMM dd, yyyy>` (same long-date format via `toLongDate`) | Matches (labels `From`/`To` — allowed per requirement #5 "full liberty to design") |
| 3 | Table headers `Description | Amount | Pay date` | `DAILY_RANGE_COLUMNS` → exactly these three columns | Matches |
| 4 | Amounts as `15,625.58` / `0.00` (thousands separator + 2 decimals) | `formatMoney` → `toLocaleString('en-US')` with 2 decimals | Matches |
| 5 | Category rows incl. `(S.TAX EXEMPTED)` variants and backend summary rows (`TOTAL SALE`, `SALE TAX`, refunds, `DISCOUNT`, `ADJUST AMOUNT`, deposits, payment-method rows, `TOTAL`, `SHORT`, `OVER`) | Rows rendered as returned by `GetdailyReportRange` — no client-side totals | Matches |
| 6 | Nullable `Pay date` left blank for non-deposit rows | Rendered as a dash (`—`) | Acceptable deviation (clearer than blank) |
| 7 | Footer `Print Date & Time : 26-Oct-2026 7:50` | `Print Date & Time:` + `dd-MMM-yyyy` + `H:mm` (`26-Oct-2026 7:50` style) | Matches |
| 8 | Continuation pages repeat the period line above the table on every page | Single tall screenshot sliced into pages, so header/period appear once | Accepted deviation ("industry standard" liberty) |

No code changes were required — the already-implemented PDF pipeline conforms to the
reference. Validation re-run after review: `npx tsc --noEmit` — passes.

## Not Yet Implemented (future phases)
- Weekly/Monthly Report, Check Register, Invoice Data, On Credit — still show "(soon)"
  and a placeholder notice. Each needs a registry entry, a `ColumnConfig[]`, and an
  `apiUrl` switch branch; range pickers and range-aware PDF headers already work.
