# Audit Trail Module — Implementation Notes

**Date:** 2026-10-01
**Feature:** Read-only audit trail data-grid fed directly from the backend API.

## What was built

A page listing user activities (audit log entries) in a TanStack-style data grid,
following the exact design pattern of **Transaction → Invoice**
(`src/app/components/react-tables/transaction/invoice-datatable/index.tsx`),
with one difference required by the BRS: **no Create button** (audit entries are
immutable and come from the backend only).

## API contract

- `GET {API_BASE_URL}/api/AuditTrail?pageNumber=1&pageSize=10`
  Optional query params: `event`, `eventType` (int key), `entityName`,
  `performedById`, `performedByName`, `ipAddress`, `startDate`, `endDate`
  (date-time). Response is a paged envelope: `{ items, totalCount, pageNumber, totalPages }`.
- `GET {API_BASE_URL}/api/AuditTrail/EventTypes` → `[{ key, value }]` lookup used
  to populate the Event Type combo-box filter.

`API_BASE_URL` resolves to `NEXT_PUBLIC_API_BASE_URL` (`https://localhost:7184`)
through `getApiUrl()` in `src/app/api/globalFetcher.ts`, so both endpoints are hit
directly with `getFetcher` (which attaches the Bearer token).

## Files created / changed

| File | Purpose |
|---|---|
| `src/app/(DashboardLayout)/types/apps/auditTrail.ts` | `AuditTrailItem`, `AuditTrailPagedResponse`, `AuditTrailEventType`, `AuditTrailFilterState` |
| `src/app/components/react-tables/audit-trail-datatable/index.tsx` | The data-grid (client component) |
| `src/app/(DashboardLayout)/react-tables/audit-trail/page.tsx` | Page route `/react-tables/audit-trail` + breadcrumb |
| `src/app/(DashboardLayout)/layout/vertical/sidebar/Sidebaritems.ts` | Added "Audit Trail" menu item under a new **Audit** group |

## Design decisions

- **Toolbar** mirrors Invoice: search toggle, column-visibility dropdown,
  CSV export, refresh, filter toggle. Create button omitted per requirement.
- **Filter panel** (shown when the filter button is toggled) has a field per API
  query param, with input type chosen per the data type:
  - `Event`, `EntityName`, `IpAddress` → text inputs
  - `EventType` → shadcn `Select` combo-box populated from `/api/AuditTrail/EventTypes`
    (sends the numeric `key`; "All" value `'all'` is skipped in the URL)
  - `PerformedByName` → shadcn `Select` combo-box populated from
    `GET /api/ApplicationUser` (key = `id`, value = `userName`). The combo sends
    the **userName** as the `performedByName` query param; nothing is sent when
    "All" is selected. The `performedById` filter was removed per revision 1.
  - `StartDate` / `EndDate` → Calendar-in-Popover date pickers, same pattern/style
    as the Invoice form (`format(startDate, 'dd/MM/yyyy')` on the trigger,
    **ISO `toISOString()`** in the query string because this API declares
    `string($date-time)`, unlike Invoice which sends `yyyy-MM-dd`). Both date
    triggers use a fixed 180px width so the panel rows stay even.
- **Role-based scope (revision 2):** admins may view all users' activity;
  non-admins are locked to their own. Non-admins get
  `performedByName=<their userName>` injected as the initial `filterParams`
  (lazy `useState` initializer from `getUserSession()`), the user combo is
  disabled and pinned to their own name, and `buildFilterParams`/`resetFilters`
  always re-apply that scope. `Search`/`Reset` re-commit filters; Reset keeps
  the role scope.
- **Committed filters:** filter state builds a URLSearchParams string only on
  **Search/Reset** (`filterParams` state), so SWR refetches once per commit and
  not on every keystroke — same approach as Invoice.
- **Server-side pagination:** `manualPagination: true`; page size options
  10/20/30/40/50 (default 10, matching the API sample); compact pager with
  ellipses; a snap-back effect corrects `pageNumber` when the server reports
  fewer pages after filtering.
- **Columns:** Id, Event, Event Type (badge colored by type: Create=primary,
  Read=info, Update/PermissionChange=warning, Delete=error, Login=success,
  Logout=secondary, Other=default), Entity, Entity Id, Performed By, Performed At
  (dd/MM/yyyy HH:mm:ss), IP Address, Status (Success/Failed badge).
- **Expandable rows** (same expander pattern as Invoice) show `description`,
  performed-by details, `userAgent`, `correlationId`, and pretty-printed
  `changes` / `metadata` JSON. Failed entries (isSuccess=false) get a light-error
  row background.
- **Header funnel filters (revision 3):** every meaningful column header gets the
  shared `ColumnFilterInput` funnel popover, same as the Invoice table:
  Event (text), Event Type (checkbox list on `eventTypeName`), Entity (text),
  Entity Id (text), Performed By (auto text/select), IP Address (auto),
  Performed At (forced `filterType='date'` From/To), Status (checkbox
  Success/Failed). Business logic lives in `shared/columnFilterUtils.ts`
  (`applyColumnFilters`); filters compare against a display-normalized copy of
  the rows (`EXTRACTORS` map) so Status matches "Success"/"Failed" strings and
  Event Type matches `eventTypeName` rather than the raw numeric key. The
  toolbar shows a "Clear Filters" button while any funnel is active. Note these
  funnels filter the current page only; the API-side filter bar queries the
  whole dataset server-side.
- **No Context provider** was added: like the Invoice datatable, this module
  fetches server state directly with `useSWR`, so a React Context wrapper would
  be redundant.
