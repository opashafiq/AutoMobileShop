# Development Log — Sale Summary Report

## Date: 2026-08-22

## Summary
Implemented the "Sale Summary Report" page per the requirements in `Sale_Summary_Report.txt`.

> Note: The BRS says to put files "in a folder named wheelsalereport" — that is a copy-paste leftover from the Wheel Sale Report doc. Following the established lowercase-no-space convention for each report (`ourpbycategory`, `customerdetails`, `tiresalereport`, `wheelsalereport`), the dedicated folder used here is **`salesummaryreport`**.

## Files Created / Modified

### 1. Sidebar Menu Entry
**File:** `src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts`
- Added `Sale Summary Report` submenu item under the existing `Report` heading
- URL: `/react-tables/report/sale-summary-report`
- Icon: `solar:pie-chart-3-linear`

### 2. Page Route
**File:** `src/app/(DashboardLayout)/react-tables/report/sale-summary-report/page.tsx`
- Next.js page with metadata and breadcrumb: Home → Report → Sale Summary Report

### 3. Sale Summary Report Component
**File:** `src/app/components/react-tables/report/salesummaryreport/index.tsx`
- **Filter Bar:** From/To datepickers (default: From = today, To = one month back) + Category combo box populated from `api/Departments`, first department auto-selected so the first load already carries a value
- **Show button:** Re-fetches with current filter values (mutate)
- **Export dropdown:** PDF Export + Excel Export (CSV with BOM)
- **Data table:** `@tanstack/react-table` with funnel filters on string columns (categoryName, brand, size), sorting, pagination, search, column visibility
- **Empty cells:** Display subtle gray dash (—)
- **PDF:** Company header, date range + category, numbered data table with a summary footer row (weighted Avg Price and weighted OURP across the qty-weighted totals)
- **First load:** API called with default date range + first category

### 4. API Endpoints Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for report header |
| `api/Departments` | Category combo box source (`id` + `tbid_DepartmentName`) |
| `api/Reports/GetSaleSummary?startDate=...&endDate=...&Category=...` | Sale summary data |

### 5. Query Parameters
| Parameter | Format | Required |
|---|---|---|
| `startDate` | `dd-MMM-yyyy` | No |
| `endDate` | `dd-MMM-yyyy` | No |
| `Category` | long | No (omitted when nothing selected) |

### 6. Response Fields Used
| Field | Column |
|---|---|
| `categoryName` | Category |
| `brand` | Brand |
| `size` | Size |
| `totalQty` | Total Qty |
| `avgPrice` | Avg Price |
| `tbim_OURP` | OURP |