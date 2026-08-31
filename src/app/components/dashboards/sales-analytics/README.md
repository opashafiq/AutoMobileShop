# Sales & Inventory Dashboard

A single-page **Sales & Inventory Analytics** dashboard for the shop, at
`/dashboards/sales-analytics` (sidebar → **Home → Sales Analytics**).

Every number comes from a live API call — there is **no mock data**. If an
endpoint fails the widget shows an error card with a **Retry** button that
re-fires only that widget; if a period has no sales it shows a quiet
*"No sales in this period"* message. The two states are never collapsed into one.

## Configure & run

The dashboard talks to the ASP.NET Core shop API through `NEXT_PUBLIC_API_BASE_URL`
(default `https://localhost:44352`). Set it in `.env.local` if your backend is elsewhere:

```
NEXT_PUBLIC_API_BASE_URL=https://localhost:44352
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

```bash
npm install
npm run dev       # → http://localhost:3000/dashboards/sales-analytics
```

Login first (`/auth/auth1/login`). The dashboard attaches the
`NEXT_AUTH_TOKEN` bearer token from `localStorage` to every request; on a 401 it
clears the session and returns you to the login page.

## How the dashboard loads

- **One primary call** — `GET /api/dashboard/overview` fires on first paint and
  drives the KPI row, trends, payments, top lists, branch/brand bars, invoice
  lists and stock summary (§2.3 of the brief).
- **Six lazy calls** fire only when their card scrolls into view:
  `sales/heatmap`, `customers/mix`, `vehicles/top-makes`, `vehicles/tire-positions`,
  `inventory/low-stock`, `inventory/dead-stock`.
- **One shared filter** — period (`today … last12m` / custom range), branch and
  refresh live in a single context and are mirrored to the URL query string so a
  filtered view can be bookmarked. A change re-fires every active query and
  *aborts* any in-flight responses (custom hook over `AbortController`).
- **Custom range** commits 400 ms after you stop typing.

## Structure

```
components/dashboards/sales-analytics/
├── types.ts                 # TS contracts for every §4 endpoint
├── dashboardApi.ts          # typed client — all 24 endpoints, auth, 401 handling
├── useDashboardQuery.ts     # fetch + AbortController query hook
├── filter-context.tsx       # shared filter state + URL sync + refresh
├── format.ts                # currency / abbreviate / signed % / dates / null → "—"
├── sales-dashboard.tsx      # page composition + Section A header
├── sales-dashboard.css      # heatmap helpers + print stylesheet
├── shared/                  # KpiCard, ChartCard, DataTable, WidgetState,
│                            # LazyLoad, skeletons, empty & error states
└── sections/                # B–I: KPIs, trends, payments, lists, inventory,
                             # and the collapsible Insights panel
```

## Formatting rules

- Money: US dollars, en-US, 2 decimals (`$1,284.00`); abbreviated (`$1.2M`) on
  chart axes only.
- Deltas: signed percentages (`+12.4%` / `-3.1%`) with direction arrows.
- Dates: `dd MMM yyyy`. Nulls: `—`.
- **Green is not always up** — outstanding dues, discount and dead stock value
  are inverted: a rise renders red.

## Notes

- Trends tabs (Monthly / Yearly / Daily) read from `overview.monthlySales`,
  `overview.yearlySales` and `overview.dailySales` (see
  [`dashboard-api-report.md`](dashboard-api-report.md) for the shape notes).
- `sharePercent` is used exactly as the API precomputes it — the dashboard never
  re-sorts or re-aggregates response arrays (the only client-side aggregate is
  the "Other" bucket on the payment donut).
- The print stylesheet (`sales-dashboard.css`) forces light backgrounds and hides
  interactive controls when printing / exporting to PDF.