# Dashboard API — contract notes

Built against the contracts documented in §4 of the build brief. The backend
could **not be reached during development** (`NEXT_PUBLIC_API_BASE_URL`,
probe requests blocked / server not running), so verify against a live API once
it's up. The typed client lives in [`dashboardApi.ts`](dashboardApi.ts).

## Endpoints that didn't match the brief exactly, or need a note

1. **`GET /api/dashboard/overview`** — §4 documents the full shape and it is
   trusted as-is. The response is the single source for the KPI row, trends,
   payments, top lists, branch/brand bars, invoice lists and stock summary.
   If the live response differs, adapt `OverviewResponse` in `types.ts`.

2. **Trends tabs vs individual endpoints** — §4 documents both
   `GET /sales/monthly?months=` and `GET /sales/yearly?years=`, but §3 sources
   the Monthly / Yearly / Daily tabs from `overview.monthlySales` /
   `overview.yearlySales` / `overview.dailySales`. The dashboard therefore uses
   the overview payload for the tabs and the `months`/`years` parameters are not
   exercised. `MonthlySale.label` is used verbatim as the axis category (as
   documented: pre-formatted, e.g. `"Mar 2026"`).

3. **`GET /api/dashboard/vehicles/top-makes`** returns `NameValue[]` —
   `value` is rendered as the bar height and treated as the vehicle count
   (tooltip reads "N vehicles"). Confirm the unit of `value` against live data;
   if it is instead revenue/share, change the tooltip formatter in `Insights.tsx`.

4. **`GET /api/dashboard/sales/by-location`** deliberately **never receives
   `locationId`** — it always compares all branches, per §3. The branch dropdown
   in the header is fed from `overview.salesByLocation` (never from this
   endpoint) so its options stay complete after a single branch is selected.

5. **`GET /api/dashboard/inventory/low-stock` / `dead-stock`** take
   `threshold` / `days` and `top` alongside the shared period params. The period
   params are sent so a branch selection filters them; if the live API ignores
   `period` on these (they look inventory-wide), drop it from their param maps.

6. **Lazy widgets not in overview** — heatmap, customer mix, top-makes,
   tire-positions, low/dead stock are fetched separately and honor the shared
   filter exactly like the primary call (period, custom from/to, locationId).

7. **`/@` items** — `/api/dashboard/kpi`, `/sales/daily`,
   `/collection/by-payment-method`, `/customers/top`, `/invoices/top-outstanding`,
   `/invoices/recent`, `/inventory/summary`, `/products/top-by-value`,
   `/products/top-by-quantity`, `/sales/by-department`, `/sales/by-brand`,
   `/sales/by-distributor`, `/layaway/summary` are all implemented in the client
   (deliverable: client covering all 24 endpoints) but not wired to widgets —
   per §7 the dashboard must not call both the overview **and** the individual
   endpoint for the same widget.

8. **Dead Stock `stockValue` audit flag (visual-polish pass, 2026-08-31)** —
   per-SKU values like `$10,053,400.00` for a single tire look like a
   unit-price/quantity multiplication or decimal error on the backend. The
   dashboard **flags but never alters** the values: `InventoryHealth.tsx`
   marks any row where `stockValue > quantity × unitCost × 10` (or a
   seven-figure value when `unitCost` is unavailable) with an "Audit" badge,
   and the summed header total carries a `*` while flagged rows are in the
   page. Backend should verify how `stockValue` is computed for
   `GET /inventory/dead-stock`.

9. **KPI percent-change on zero values (visual-polish pass, 2026-08-31)** —
   `overview.kpi.changePercent` reports `+100.0` for a metric whose current
   value is `0` (observed on Gross Profit: `$0.00 · +100.0% · 0.0% margin`).
   Zero-to-zero has no defined percent change, and a genuine +100% would
   require a negative prior period — the backend is almost certainly hitting a
   zero-divide special case (`prior == 0 → 100`, or `(current − prior) / |prior|`
   guarded to a constant when the denominator is 0). The frontend displays
   `changePercent` verbatim (no client-side recomputation), so it now suppresses
   the contradictory delta — `KpiCard` renders "—" when the current value is 0
   and the delta is positive — instead of passing the artifact through.
   **Backend to verify**: the percent-change calculation for every KPI in
   `kpi.changePercent` (divide-by-zero handling when the prior period is 0 or
   null; also confirm a null prior returns `null`, which the frontend already
   renders as "—").