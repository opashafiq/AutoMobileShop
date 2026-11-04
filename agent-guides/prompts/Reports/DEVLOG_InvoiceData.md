# Development Log — Transaction Reports / Invoice Data (Radio #5)

## Date: 2026-11-03

## Summary
Implemented the fifth radio option of the **Transaction Reports** page —
**Invoice Data** — per the requirements in
`agent-guides/prompts/Reports/2/InvoiceData.txt`.

No new page or component file was needed: the report registry in
`src/app/components/react-tables/report/transactionreports/index.tsx` renders
everything from the active report definition (registry entry, column config,
endpoint branch, date normalization, and a dedicated PDF card layout).

## UI Behaviour
- Radio option **Invoice Data** is now enabled (the "(soon)" placeholder is gone).
- Selecting it shows the two project datepickers, **From** and **To**
  (shared `DateField`, same datepicker format as the other reports).
- **Search** applies both dates (inverted ranges are swapped) and fetches the report.
- **Show** / eye icon opens the generated PDF in a new browser tab.
- **Export** combo offers PDF / CSV export with filename
  `Invoice_Data_<From>_<To>.pdf|csv`.
- Toolbar keeps the global search box, column-visibility menu; each of the 16 column
  headers keeps its funnel filter — identical pattern to the other reports.
- All 6 radio options are now implemented (1 Daily ✅, 2 Daily Range ✅,
  3 Weekly/Monthly ✅, 4 Check Register ✅, 5 Invoice Data ✅, 6 On Credit ✅).

## Data Table
One flat row per invoice, rendered with `@tanstack/react-table` — sorting, global
search, funnel column filters, column visibility, pagination. 16 columns with
horizontal scroll; headers wrap to two lines like the legacy PDF.

| Column | Field | Type | Notes |
|---|---|---|---|
| Date | `invoiceDate` | date (`dd-MMM-yyyy`) | API returns `mm.dd.yyyy` (`01.02.2025` = January 02 with `StartDate=01-Jan-2025`); normalized to ISO with the `'mdy'` parser mode |
| Transaction ID | `invoiceId` | text | large numeric ID kept raw |
| Customer Name | `name` | text | |
| Amount | `total` | currency | |
| Payment Type | `tbip_Paymentname` | text | e.g. `CC Amex`, `Debit Card`, `Cash,Debit Card` |
| Company Name | `companyName` | text | nullable → dash |
| Vehicle Make | `vehicle` | text | |
| Model | `model` | text | |
| Year | `year` | text | string in the payload |
| License | `license` | text | plate, e.g. `LTM 2118` |
| Phone | `phone` | text | |
| Address | `address` | text | |
| Odometer | `odometer` | text | |
| Tax Id | `taxNumber` | text | |
| Tread Depth | `treadDepth` | text | |
| Note | `notes` | text | long free text (disclaimers, PO numbers, DOT codes…) |

## PDF
- Company header from `api/CompanyInfo/WOLogo` via the shared `CompanyInfoHeader`
  (`tbbiBusinessName`, `tbbi_Address1`, `tbbi_Address2`).
- Title: **INVOICE DATA**; period line `From: <MMMM dd, yyyy> To: <MMMM dd, yyyy>`.
- **Legacy-style chronological card layout** (mirroring the 59-page
  `InvoiceData.pdf`, which renders each invoice as a rich multi-line block):
  rows are sorted by date (then transaction ID) and each invoice prints as
  - main row: `Transaction ID | Date | Customer Name | Phone | Payment Type | Amount`
  - detail row (full width): vehicle metadata line (`Vehicle: MAKE MODEL YEAR •
    Company: … • Tax ID: … • License: … • Odometer: … • Tread Depth: … • Address: …`)
    plus the note below in muted text.
  This preserves every field of the legacy block layout in a clean,
  industry-standard table form (the legacy header is a 8-column × 4-line grid that
  would not survive translation cleanly).
- Dates as `dd-MMM-yyyy` (day rows) — the legacy prints long dates; the period line
  and `formatReportDate` keep the established pattern of the other report PDFs.
  Amounts with thousands separators, 2 decimals; empty cells as dashes.
- `Print Date & Time:` footer as in the legacy report.
- Built with the shared `html-to-image` + `jsPDF` flow, including the multi-page
  canvas-slice fix. The Check Register grouped table and the Pending Amount totals
  branch of the print node are untouched.

## Excel
CSV export (UTF-8 BOM + quoted values) of the flat filtered rows; date cells exported
as `dd-MMM-yyyy`.

## Files Modified

### 1. Transaction Reports Component
**File:** `src/app/components/react-tables/report/transactionreports/index.tsx`

| Change | Detail |
|---|---|
| Report registry | `invoiceData` now `implemented: true`, `pdfTitle: 'Invoice Data'`, `fileBase: 'Invoice_Data'` |
| Column config | Added `INVOICE_DATA_COLUMNS` (16 columns incl. vehicle/contact/note details) |
| API URL | New `invoiceData` branch → `api/Reports/GetInvoiceData?StartDate=...&EndDate=...` |
| Data normalization | New `invoiceData` branch in the `reportData` useMemo: `invoiceDate` dotted `mm.dd.yyyy` → ISO (`mdy` mode) |
| PDF rows | New `pdfInvoiceRows` useMemo — filtered rows sorted by date then transaction ID for the chronological card layout |
| Print node | New dedicated `invoiceData` table branch (main row + detail row) before the Check Register branch |

### Incident note
During this phase one `edit` accidentally replaced the `onCredit` normalization
branch with a placeholder; the error was caught by inspection before validation and
fully restored (verified against lines 427–466). No residual impact.

### 2. This Development Log
**File:** `agent-guides/prompts/Reports/DEVLOG_InvoiceData.md`

## API Endpoint Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for the report header |
| `api/Reports/GetInvoiceData` | Invoice rows with customer/vehicle/payment details |

### Query Parameters
| Parameter | Format | Required |
|---|---|---|
| `StartDate` | `dd-MMM-yyyy` (e.g. `01-Jan-2025`) | No (nullable) |
| `EndDate` | `dd-MMM-yyyy` (e.g. `31-Jan-2025`) | No (nullable) |

## Response Shape
```json
[
  {
    "tbip_Paymentname": "CC Amex",
    "invoiceId": 7294735964,
    "name": "MICHAEL LANDY HAILE",
    "invoiceDate": "01.02.2025",
    "total": 751.26,
    "companyName": null,
    "taxNumber": null,
    "phone": "281-797-2051",
    "address": null,
    "vehicle": "TOYOTA",
    "model": "TUNDRA",
    "year": "2019",
    "odometer": "116049",
    "treadDepth": null,
    "license": "LTM 2118",
    "notes": null
  }
]
```
- `invoiceDate` — dotted `mm.dd.yyyy` (proven by `01.02.2025` ⇒ Jan 02, within the
  `StartDate=01-Jan-2025` range, i.e. month-first); normalized to ISO.
- Many nullable fields — rendered as dashes in the table/PDF.
- `invoiceId` — large integer; treated as text for display/filtering.

## Excel Update — Date: 2026-11-03 (Transaction ID as text)

User feedback: in Excel, the Transaction ID column rendered as scientific notation
(`1.00939E+11`) because IDs exceed Excel's 11-digit number display limit. The CSV
export now writes the Transaction ID cell as an Excel text-formula
(`="115922741281"`), which Excel displays verbatim as text. Applied only to the
Invoice Data report's `invoiceId` column in `handleExportExcel`
(`transactionreports/index.tsx`). Validation: `npx tsc --noEmit`, eslint — 0 errors.

## Validation
- `npx tsc --noEmit` — passes with no errors.
- `npx eslint` on the modified component — 0 errors (only the pre-existing
  TanStack Table / `any` warnings present before this change).
