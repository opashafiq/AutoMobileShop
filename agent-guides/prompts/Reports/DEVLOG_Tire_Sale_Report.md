# Development Log — Tire Sale Report

## Date: 2026-08-22

## Summary
Implemented the "Tire Sale Report" page per the requirements in `New_Tire_Sale_Report.txt`.

## Files Created / Modified

### 1. Sidebar Menu Entry
**File:** `src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts`
- Added `Tire Sale Report` submenu item under the existing `Report` heading
- URL: `/react-tables/report/tire-sale-report`
- Icon: `solar:cart-large-2-linear`

### 2. Page Route
**File:** `src/app/(DashboardLayout)/react-tables/report/tire-sale-report/page.tsx`
- Next.js page with metadata and breadcrumb: Home → Report → Tire Sale Report

### 3. Tire Sale Report Component
**File:** `src/app/components/react-tables/report/tiresalereport/index.tsx`
- **Filter Bar:** From/To datepickers (default: From = today, To = one month back) + Brand text input + Size text input
- **Show button:** Re-fetches with current filter values
- **Export dropdown:** PDF Export + Excel Export
- **Data table:** `@tanstack/react-table` with funnel filters, sorting, pagination, search, column visibility
- **Empty cells:** Display subtle gray dash (—)
- **PDF:** Company header, date range, numbered data table with total qty footer row
- **First load:** API called with default date range (today to one month back)

### 4. API Endpoints Used
| Endpoint | Purpose |
|---|---|
| `api/CompanyInfo/WOLogo` | Company information for report header |
| `api/Reports/GetTireSaleReport?startDate=...&endDate=...&Brand=...&Size=...` | Tire sale data |

### 5. Query Parameters
| Parameter | Format | Required |
|---|---|---|
| `startDate` | `dd-MMM-yyyy` | No |
| `endDate` | `dd-MMM-yyyy` | No |
| `Brand` | string | No |
| `Size` | string | No |
