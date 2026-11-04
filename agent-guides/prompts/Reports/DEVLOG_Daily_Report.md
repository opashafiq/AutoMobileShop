# Development Log — Transaction Reports / Daily Report

## Date: 2026-11-03 (rev. 5 — multi-page slice cropped rows at page breaks)

> **Rev. 5 note:** with multi-page reports, the last table row on a page was
> cropped in half (screenshot evidence: "Mag Lugs" row cut at the bottom of
> page 1). Root cause: the canvas-slice paginator cut the tall screenshot at a
> fixed page height, which can land mid-row. Fix in `buildPdf()`:
> - Table-row bottoms of the still-mounted print clone are measured
>   (`tr.getBoundingClientRect()`) before slicing; CSS px map 1:1 to screenshot
>   px because `pixelRatio` is 1.
> - Each page cut (except the final page) is pulled up to the nearest row bottom,
>   so a slice always ends exactly after a complete row (≥ 40 px of content kept).
> - Two orphan guards: a cut never leaves a `DATE :` group-header row alone at
>   the bottom of a Check Register page (rows marked `pdf-group-header`), and
>   never separates an Invoice Data main row from its detail row (rows marked
>   `pdf-detail-row`).
> - Effect: pages end slightly earlier than the theoretical full height, leaving
>   a small white margin at the bottom — standard pagination behaviour.
> Applies to every report (Daily, Daily Range, Weekly, Check Register, Pending
> Amount, Invoice Data) since they share the same `buildPdf()` pipeline.
>
> **Rev. 5 extension (same date):** the row-boundary logic was extracted into the
> shared helper `src/app/components/react-tables/shared/pdfPageSlicing.ts`
> (`sliceTallImageIntoPdfPages(pdf, dataUrl, clone)`) and applied repo-wide —
> the same mid-row cropping bug existed in 8 more copies of the slice loop:
> - `report/tiresalereport`, `report/wheelsalereport`, `report/ourpbycategory`,
>   `report/salesummaryreport`, `report/totalourpreport`, `report/customerdetails`
>   (legacy report pages)
> - `transaction/layaway-print` and `transaction/invoice-print` (print views)
> Each file's inline single/multi-page branch was replaced with a call to the
> `transactionreports` fix + orphan guards. Validation across all 10 touched
> files: `npx tsc --noEmit` passes; eslint 0 errors (warnings all pre-existing).

## Date: 2026-11-01 (rev. 4 — fixed blank pages 2+ in multi-page PDF)

> **Rev. 4 note:** with enough rows to exceed one PDF page, pages 2+ rendered blank.
> Root cause: the multi-page branch placed the full-page-height image with a negative
> `y` offset (`pdf.addImage(dataUrl, 'PNG', 0, -y, ...)`), but jsPDF clips images to the
> page bounds instead of scrolling, so every slice beyond page 1 came out empty.
> Fix: the tall screenshot is now sliced into per-page canvases (offscreen `<canvas>`
> + `ctx.drawImage` per slice) and each slice is drawn at `0,0` on its own page.
> The same latent bug existed in the other report pages (tiresalereport, ourpbycategory,
> wheelsalereport, salesummaryreport, totalourpreport, customerdetails) and the
> layaway/invoice print views; all 8 files received the same canvas-slice fix in this revision.

## Summary
Implemented the **Transaction Reports** page (Step 1: *Daily Report* radio option) per the
requirements in `Daily_Report.txt`. The page is designed as a report registry so the other five
radio options (Daily Report Date Range, Weekly/Monthly, Check Register, Invoice Data, On Credit)
can be added one by one later.

> **Rev. 2 note:** the first implementation was built against an incorrect sample response
> (tire-line items). The endpoint actually returns category-wise daily rows
> (`categoryName` / `totalAmount` / `paydate` / `date`), matching the legacy `DailyReport.pdf`
> (Description | Amount | Pay date). The component was redesigned accordingly:
> columns are now Description / Amount / Pay Date, no client-side grand total
> (the backend already emits summary rows such as TOTAL_SALE, SALE TAX, TOTAL,
> payment-method rows) and a legacy-style Print Date & Time footer was added.
>
> **Rev. 3 note:** filter-bar buttons now match the OURP By Category report:
> **Search** (applies the date and fetches), **Show** (opens the generated PDF in the
> browser tab for viewing/printing) and an **Export** combo with *PDF Export* /
> *Excel Export* download items.

## UI Layout
- Radio row with the 6 report options (matches `Daily_Reports_Header.JPG`); **Daily Report selected by default**
- Single **Date** picker (project datepicker — shared `DateField` component, default = today)
- Buttons (as in the OURP By Category report): **Search** (fetch), **Show** (open PDF in browser), **Export** combo (PDF Export / Excel Export)
- Toolbar: search, column visibility, quick PDF preview (eye icon, same Show behaviour)
- Summary chips: Records count + report Date for the filtered rows
- Data table: `@tanstack/react-table` with funnel column filters, sorting, pagination, search, column visibility — same pattern as the other report datatables
- Selecting a not-yet-implemented radio shows an informational notice; Show/PDF/Excel are hidden for it

## Files Created / Modified

### 1. Sidebar Menu Entry
**File:** `src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts`
- Added `Transaction Reports` as the first child of the existing `Report` heading
- URL: `/react-tables/report/transaction-reports`
- Icon: `solar:document-text-linear`

### 2. Page Route
**File:** `src/app/(DashboardLayout)/react-tables/report/transaction-reports/page.tsx`
- Next.js page with metadata and breadcrumb: Home → Report → Transaction Reports

### 3. Transaction Reports Component
**File:** `src/app/components/react-tables/report/transactionreports/index.tsx`
- **Report registry:** `REPORTS` array — one entry per radio option with `key`, `label`,
  `implemented`, `dateMode`, `pdfTitle`, `fileBase`. Adding a future report = a new entry,
  a `ColumnConfig[]` list, and a `buildUrl` switch branch.
- **Column config:** `DAILY_COLUMNS` drives the table, PDF and Excel columns from one place —
  `Description` (`categoryName`), `Amount` (`totalAmount`, currency), `Pay Date` (`paydate`)
- **Show:** applies the date input to the query; on first load the report auto-fetches with today's date
- **Empty cells / null paydate:** subtle gray dash (—)
- **PDF:** Company header (shared `CompanyInfoHeader`), report title, legacy-style
  `Date: October 03, 2025` line, striped Description/Amount/Pay Date table rows rendered as
  returned by the API (no client-side totals — summary rows come from the backend),
  and a `Print Date & Time:` footer like the legacy report;
  filename `Daily_Report_<dd-MMM-yyyy>.pdf`
- **Excel:** CSV export (BOM + quoted values), rows as returned by the API
- **Print / PDF view:** Show button and the toolbar eye icon both open the generated PDF
  blob URL in a new browser tab (same behaviour as the OURP By Category report)

### 4. API Endpoints Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for the report header (uses `tbbiBusinessName`, `tbbi_Address1`, `tbbi_Address2`) |
| `api/Reports/GetdailyReport?StartDate=...` | Daily report data |

### 5. Query Parameters
| Parameter | Format | Required |
|---|---|---|
| `StartDate` | `dd-MMM-yyyy` (e.g. `03-Oct-2026`) | No (nullable) |

### 6. Not Yet Implemented (future phases)
- Radio options other than Daily Report show a "(soon)" label and a notice; they are selected but
  render a placeholder until their endpoints and column configs are added
- Date-Range mode (`dateMode: 'range'`) already renders From/To pickers, kept for the date-range reports

> **Update 2026-11-03:** the second radio option, **Daily Report (Date Range)**, is now
> implemented — see `DEVLOG_Daily_Report_Range.md`. Remaining "(soon)" options are
> Weekly/Monthly, Check Register, Invoice Data and On Credit.

## Response Shape (Daily Report)
```
{ date, categoryName, totalAmount, paydate }
```
- `date` — report date as `10.03.2026`-style string (the selected date repeats on each row)
- `categoryName` — row description (categories, summary rows like TOTAL_SALE, payment methods)
- `totalAmount` — number, rendered with 2-decimal money formatting
- `paydate` — nullable; displayed as dash when null (deposits show their payment date)
