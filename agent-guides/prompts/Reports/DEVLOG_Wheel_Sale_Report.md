# Development Log — Wheel Sale Report

## Date: 2026-08-22

## Summary
Implemented the "Wheel Sale Report" page per the requirements in `New_Wheel_Sale_Report.txt`.

## Files Created / Modified

### 1. Sidebar Menu Entry
**File:** `src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts`
- Added `Wheel Sale Report` submenu item under the existing `Report` heading
- URL: `/react-tables/report/wheel-sale-report`
- Icon: `solar:reel-linear`

### 2. Page Route
**File:** `src/app/(DashboardLayout)/react-tables/report/wheel-sale-report/page.tsx`
- Next.js page with metadata and breadcrumb: Home → Report → Wheel Sale Report

### 3. Wheel Sale Report Component
**File:** `src/app/components/react-tables/report/wheelsalereport/index.tsx`
- **Filter Bar:** From/To datepickers (default: From = today, To = one month back) + Brand, Size, Bolt, and Series text inputs
- **Show button:** Re-fetches with current filter values (mutate)
- **Export dropdown:** PDF Export + Excel Export (CSV with BOM)
- **Data table:** `@tanstack/react-table` with funnel filters on string columns (category, size, brand, series, bolt), sorting, pagination, search, column visibility
- **Empty cells:** Display subtle gray dash (—)
- **PDF:** Company header, date range, numbered data table with total qty footer row
- **First load:** API called with default date range (today to one month back)

### 4. API Endpoints Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for report header |
| `api/Reports/GetWheelSaleReport?startDate=...&endDate=...&Brand=...&Size=...&Bolt=...&Series=...` | Wheel sale data |

### 5. Query Parameters
| Parameter | Format | Required |
|---|---|---|
| `startDate` | `dd-MMM-yyyy` | No |
| `endDate` | `dd-MMM-yyyy` | No |
| `Brand` | string | No |
| `Size` | string | No |
| `Bolt` | string | No |
| `Series` | string | No |