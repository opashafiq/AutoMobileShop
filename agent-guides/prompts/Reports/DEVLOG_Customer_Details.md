# Development Log — Customer Details Report

## Date: 2026-08-22

## Summary
Implemented the "Customer Details" report page per the requirements in `Customer_Details.txt`.

## Files Created / Modified

### 1. Sidebar Menu Entry
**File:** `src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts`
- Added `Customer Details` submenu item under the existing `Report` heading
- URL: `/react-tables/report/customer-details`
- Icon: `solar:users-group-rounded-linear`

### 2. Page Route
**File:** `src/app/(DashboardLayout)/react-tables/report/customer-details/page.tsx`
- Next.js page with metadata and breadcrumb: Home → Report → Customer Details
- Imports the `CustomerDetailsReport` component

### 3. Customer Details Report Component
**File:** `src/app/components/react-tables/report/customerdetails/index.tsx`
- **Date Pickers:** Start Date and End Date inputs in the filter bar, defaulting to current month range
- **Show Button:** Triggers data fetch via `mutate()` — calls `api/Reports/GetCustomerList?startDate=...&endDate=...`
  - On first load without query params, user clicks Show to load data
- **Data Table:** Uses `@tanstack/react-table` with funnel filters, sorting, pagination, global search, and column visibility — same pattern as OURP By Category
- **Export Dropdown:** PDF Export and Excel Export grouped under a single Export dropdown
- **Empty cell handling:** Blank values display a subtle gray dash (—)
- **Print Layout:** Hidden container with company header (reusing `CompanyInfoHeader`), report title with date range, numbered data table with total row
- **Show button:** Opens PDF in a new browser tab for viewing and printing

### 4. Reused Components
| Component | Source |
|---|---|
| `CompanyInfoHeader` | `src/app/components/react-tables/shared/CompanyInfoHeader.tsx` |
| `ColumnFilterInput` | `src/app/components/react-tables/shared/ColumnFilterInput.tsx` |
| `applyColumnFilters` | `src/app/components/react-tables/shared/columnFilterUtils.ts` |
| `AnimatedTable*` | `src/app/components/animatedComponents/AnimatedTable.tsx` |

### 5. API Endpoints Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for report header |
| `api/Reports/GetCustomerList?startDate=...&endDate=...` | Customer list data |

## Design Decisions
- **Date format:** API expects `dd-MMM-yyyy` (e.g., `01-Jan-2025`) — `formatDateForApi` helper handles this
- **Default date range:** Current month (first day to last day) to show meaningful data on first load
- **Show button behavior:** Triggers `mutate()` to re-fetch with current date params, matching the BRS requirement "on first load call API without query parameter" — user must click Show after changing dates
- **PDF generation** reuses the same `buildPdf()` pattern from OURP By Category (html-to-image + jsPDF)
- **Print table** includes a `#` column (row number) and a "Total Customers" footer row
