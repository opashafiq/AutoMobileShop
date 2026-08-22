# Development Log — Total OURP Report

## Date: 2026-08-22

## Summary
Implemented the "Total OURP Report" page per the requirements in `Total_OURP_Report.txt`.

## Files Created / Modified

### 1. Sidebar Menu Entry
**File:** `src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts`
- Added `Total OURP Report` submenu item under the existing `Report` heading
- URL: `/react-tables/report/total-ourp-report`
- Icon: `solar:pie-chart-2-linear`

### 2. Page Route
**File:** `src/app/(DashboardLayout)/react-tables/report/total-ourp-report/page.tsx`
- Next.js page with metadata and breadcrumb: Home → Report → Total OURP Report

### 3. Total OURP Report Component
**File:** `src/app/components/react-tables/report/totalourpreport/index.tsx`
- **No query parameters** — the API is called on page load (SWR, `refreshInterval: 0`)
- **Filter Bar:** Contains only the Show + Export buttons (no input controls needed)
- **Show button:** Re-fetches (mutate)
- **Export dropdown:** PDF Export + Excel Export (CSV with BOM)
- **Data table:** `@tanstack/react-table` with funnel filter on Category (numeric `total` excluded), sorting, pagination, search, column visibility
- **Empty cells:** Display subtle gray dash (—)
- **PDF:** Company header, title, numbered table (Category / Total) with a Grand Total footer row

### 4. API Endpoints Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for report header |
| `api/Reports/GetTotalOURP` | Category-wise OURP totals (no parameters) |

### 5. Response Fields Used
| Field | Column |
|---|---|
| `category` | Category |
| `total` | Total |