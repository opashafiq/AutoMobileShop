# Frontend Build Brief — Sales & Inventory Dashboard

> **How to use this file:** edit the six lines in **Section 0**, then paste the whole document to your frontend AI agent as a single message. Everything below Section 0 is written to be handed over as-is — the agent needs no other context.

---

## 0. PROJECT CONTEXT — EDIT THESE SIX LINES BEFORE SENDING

```
FRAMEWORK:        React 18 + TypeScript + Vite          <-- change if Angular / Vue / Blazor / Next.js
STYLING:          Tailwind CSS                          <-- change if Bootstrap / MUI / plain CSS
CHART LIBRARY:    Recharts                              <-- change if Chart.js / ApexCharts / ECharts
API BASE URL:     https://localhost:44352  <-- your actual base URL
AUTH:             Bearer token from localStorage key "access_token"   <-- or "none"
CURRENCY:         USD, symbol $, en-US locale, 2 decimals
```

---

## 1. YOUR TASK

Build a single-page analytics dashboard for a **tire and auto service retail business**. The backend is an ASP.NET Core Web API that is already built, deployed, and returns the exact JSON contracts documented in Section 4. You are building the frontend only.

The audience is the **business owner**, not an analyst. They open this screen once in the morning and want to know, within five seconds: how much did we sell, how much cash came in, what is stuck, and what needs attention today.

**Do not build a mock. Do not invent sample data. Every number on screen must come from a real API call.** If an endpoint fails, show an error state on that card — never a placeholder number.

---

## 2. GLOBAL BEHAVIOUR

### 2.1 The period filter controls the whole page

A single control at the top of the page drives every widget. It sends one shared query string to every endpoint:

```
?period=<value>&locationId=<optional>
```

Valid `period` values, exactly these strings:

| Value | Label to display |
|---|---|
| `today` | Today |
| `yesterday` | Yesterday |
| `wtd` | This Week |
| `mtd` | This Month |
| `lastmonth` | Last Month |
| `ytd` | This Year |
| `lastyear` | Last Year |
| `last12m` | Last 12 Months |
| `custom` | Custom Range |

When `period=custom`, also send `&from=YYYY-MM-DD&to=YYYY-MM-DD` from a date-range picker. For all other values, do **not** send `from` or `to`.

Default on first load: `mtd`.

### 2.2 Location filter

A dropdown labelled **Branch**, with an "All Branches" option that sends no `locationId` at all. Populate its options from the `salesByLocation` array in the overview response (each entry has `id` and `name`). When a specific branch is selected, append `&locationId=<id>` to every request **except** `GET /sales/by-location`, which must always show all branches so they can be compared.

### 2.3 Loading strategy — this matters

**First paint calls exactly one endpoint:** `GET /overview`. It returns thirteen widgets' worth of data in a single response. Render the entire page from it.

Only the six widgets *not* included in the overview response get their own individual calls, and those are lazy — fire them when the widget scrolls into view, not on page load:

- sales heatmap
- customer mix
- vehicle makes
- tire positions
- low stock
- dead stock

When the user changes the period or branch, re-call `/overview` plus any lazy widget already visible. Debounce the custom-date-range picker by 400ms so dragging across dates does not fire ten requests.

### 2.4 Every widget needs four states

1. **Loading** — skeleton shimmer matching the widget's final dimensions. Never a centred spinner on a card; it makes the layout jump.
2. **Loaded with data** — the chart or table.
3. **Empty** — the call succeeded but returned an empty array or all-zero values. Show a muted message: *"No sales in this period"*. Never render an empty chart axis.
4. **Error** — the call failed. Show the message and a **Retry** button that re-fires that endpoint only, not the whole page.

Empty and error are different states with different messages. Do not collapse them into one.

### 2.5 Formatting rules

- **Currency:** `Intl.NumberFormat` with the locale and currency from Section 0. Abbreviate on chart axes only (`$1.2M`, `$450K`), never in tables or KPI cards.
- **Percentages:** one decimal, always signed on deltas (`+12.4%`, `-3.1%`).
- **Dates:** `dd MMM yyyy` in tables, `MMM yyyy` on the monthly axis.
- **Phone numbers:** display exactly as returned. Do not reformat.
- **Nulls:** render as `—`, never `null`, `undefined`, `0`, or an empty cell.

### 2.6 Deltas and colour

`changePercent` values in the KPI response compare the current period to the immediately preceding period of equal length. Show an up or down arrow with the signed percentage.

**Green is not always up.** These three KPIs invert — a rise is bad and must render red:

- `outstanding` (unpaid dues rising)
- `discount` (margin being given away)
- Dead stock value

For everything else, up is green.

### 2.7 Responsive

Desktop first, three-column grid at ≥1280px. Collapse to two columns at ≥768px, single column below that. On mobile, KPI cards become a horizontally scrollable strip; wide tables become stacked cards.

### 2.8 Accessibility

Every chart needs an accessible text alternative — either a visually hidden data table or an `aria-label` summarising the trend. Do not rely on colour alone to distinguish series; use pattern, label, or direct annotation. Ensure 4.5:1 contrast on all text.

---

## 3. PAGE LAYOUT

Build the sections in this order, top to bottom.

### Section A — Header bar
Business name, period selector, branch dropdown, last-refreshed timestamp, manual refresh button.

### Section B — KPI cards (8 cards, 4 across on desktop)
Source: `overview.kpi`

| # | Label | Value field | Delta key |
|---|---|---|---|
| 1 | Net Sales | `kpi.current.netSales` | `netSales` |
| 2 | Invoices | `kpi.current.invoiceCount` | `invoiceCount` |
| 3 | Avg. Invoice | `kpi.current.averageInvoiceValue` | `averageInvoice` |
| 4 | Collected | `kpi.current.collected` | `collected` |
| 5 | Outstanding | `kpi.current.outstanding` | `outstanding` **(inverted colour)** |
| 6 | Gross Profit | `kpi.current.grossProfit` | `grossProfit` |
| 7 | Items Sold | `kpi.current.itemsSold` | `itemsSold` |
| 8 | Customers | `kpi.current.customerCount` | `customerCount` |

Card 6 shows `kpi.current.marginPercent` as a secondary line beneath the value, formatted `18.4% margin`. Add a small info tooltip on this card only: *"Estimated — based on current item cost, not cost at time of sale."* This caveat is required; do not omit it.

### Section C — Trends (full width, tabbed: Monthly | Yearly | Daily)

**Monthly tab (default)** — source `overview.monthlySales`
Combo chart. Bars = `netSales`. Line = `collected`. Second line on a right-hand axis = `invoiceCount`. X axis = `label` (already formatted, e.g. `"Mar 2026"` — use it as-is, do not reconstruct it from `year`/`month`).

**Yearly tab** — source `overview.yearlySales`
Grouped bars: `netSales` and `collected`. X axis = `year`.

**Daily tab** — source `overview.dailySales`
Area chart of `netSales` by `date`. The array is gap-filled by the API — zero-sale days are present with `netSales: 0`, so plot every element. Do not filter zeros out; the gaps are the insight.

### Section D — Two columns

**Left: Collection by Payment Method** — source `overview.paymentCollection`
Donut chart. Slice value = `amount`, label = `paymentName`, `sharePercent` in the tooltip. Total collected in the centre. If more than 6 methods, show top 5 and group the rest as "Other".

**Right: Sales by Department** — source `overview.salesByDepartment`
Horizontal bar chart, `value` descending. Show `sharePercent` at the end of each bar.

### Section E — Two columns

**Left: Top 10 Products by Value** — source `overview.topProducts`
Table: Product (`description`) · Qty (`quantity`) · Revenue (`revenue`) · Share (`sharePercent`) · Stock (`stockOnHand`).

The stock column is the point of this widget. When `stockOnHand` is `0`, show a red **Out of stock** badge. When it is 1–4, show an amber **Low** badge. A top-selling product that is out of stock is the single most actionable thing on this page — make it visually loud.

**Right: Top 10 Customers** — source `overview.topCustomers`
Table: Name (`name`) · Phone (`phone`) · Invoices (`invoiceCount`) · Revenue (`revenue`) · Due (`outstanding`) · Last Visit (`lastPurchase`).
Highlight any row where `outstanding > 0`.

### Section F — Two columns

**Left: Sales by Brand** — source `overview.salesByBrand`, horizontal bars.

**Right: Sales by Branch** — source `overview.salesByLocation`, vertical bars. Hide this entire widget when the array has one or zero entries (single-branch businesses should not see an empty comparison).

### Section G — Action lists, two columns

**Left: Outstanding Invoices** — source `overview.topOutstanding`
Table: Invoice # (`invoiceId`) · Date (`invoiceDate`) · Customer (`customerName`) · Total (`total`) · Paid (`paid`) · **Due** (`due`) · Age (`ageInDays`).
Colour the age cell: green under 30 days, amber 30–60, red over 60.

**Right: Recent Invoices** — source `overview.recentInvoices`
Table: Invoice # · Date · Customer · Items (`lineCount`) · Total · Paid.
Not filtered by period — this is always the latest activity.

### Section H — Inventory Health, three cards across

**Card 1: Stock Summary** — source `overview.inventory`
Four stats: `skuCount` (SKUs) · `totalUnits` (Units) · `stockValueAtCost` (Stock Value) · `outOfStockCount` (Out of Stock, red when > 0).

**Card 2: Low Stock** — lazy call `GET /inventory/low-stock?threshold=4&top=20`
List: `description` · `quantity` · `stockValue`. Include a small threshold selector (4 / 10 / 20) that re-fires the call.

**Card 3: Dead Stock** — lazy call `GET /inventory/dead-stock?days=180&top=20`
List: `description` · `quantity` · `stockValue` · `daysSinceLastSale`. Sum `stockValue` across the returned rows and show it as a header figure: *"$X tied up in non-moving stock"*. Include a period selector (90 / 180 / 365 days).

### Section I — Deeper insights, collapsed by default

Render as an expandable "Insights" section so it does not crowd the main view. All four are lazy — call only when expanded.

1. **Sales Heatmap** — `GET /sales/heatmap` → 7×24 grid, `dayOfWeek` (0 = Sunday) as rows, `hour` as columns, cell intensity from `netSales`. Use `dayName` for row labels. Note that quiet hours are simply absent from the response — treat missing cells as zero, do not skip them.
2. **New vs Returning Customers** — `GET /customers/mix` → two stacked bars, one for count, one for revenue.
3. **Top Vehicle Makes** — `GET /vehicles/top-makes?top=10` → horizontal bars of `value`, with `count` in the tooltip.
4. **Tire Position Demand** — `GET /vehicles/tire-positions` → four numbers arranged as a car diagram: `leftFront` / `rightFront` on top, `leftRear` / `rightRear` below.

---

## 4. API CONTRACT

Base URL and auth are in Section 0. All responses are `application/json` with **camelCase** property names. All money fields are decimals. All dates are ISO 8601 strings.

### 4.1 `GET /api/dashboard/overview` — the primary call

```json
{
  "kpi": {
    "from": "2026-08-01T00:00:00",
    "to": "2026-08-27T00:00:00",
    "current": {
      "invoiceCount": 342, "subTotal": 128400.00, "tax": 10272.00,
      "labour": 8600.00, "discount": 3200.00, "grossSales": 144072.00,
      "netSales": 143850.00, "paidAmount": 131200.00, "collected": 129800.00,
      "grossProfit": 41200.00, "itemsSold": 918, "customerCount": 287,
      "outstanding": 12650.00, "averageInvoiceValue": 420.61, "marginPercent": 28.64
    },
    "previous": { "...same shape..." },
    "changePercent": {
      "netSales": 12.4, "grossSales": 11.8, "invoiceCount": 6.2,
      "averageInvoice": 5.9, "collected": 9.1, "outstanding": -4.3,
      "grossProfit": 14.2, "itemsSold": 7.7, "customerCount": 5.1,
      "tax": 11.9, "labour": 3.4, "discount": -2.2
    }
  },
  "yearlySales":  [{ "year": 2026, "netSales": 0, "collected": 0, "invoiceCount": 0 }],
  "monthlySales": [{ "year": 2026, "month": 8, "label": "Aug 2026", "netSales": 0, "collected": 0, "invoiceCount": 0 }],
  "dailySales":   [{ "date": "2026-08-01T00:00:00", "netSales": 0, "invoiceCount": 0 }],
  "topProducts":  [{ "itemId": 101, "description": "Michelin 225/45R17 Primacy", "brand": "Michelin",
                     "size": "225/45R17", "series": "Primacy", "department": "Tires",
                     "quantity": 48, "revenue": 9600.00, "sharePercent": 6.7, "stockOnHand": 12 }],
  "topCustomers": [{ "phone": "5551234567", "name": "John Smith", "email": "j@x.com",
                     "invoiceCount": 6, "revenue": 3200.00, "outstanding": 150.00,
                     "lastPurchase": "2026-08-20T14:32:00" }],
  "paymentCollection": [{ "paymentId": 2, "paymentName": "Visa", "amount": 48200.00,
                          "transactionCount": 121, "sharePercent": 37.1 }],
  "salesByDepartment": [{ "id": 1, "name": "Tires", "value": 98400.00, "count": 612, "sharePercent": 68.4 }],
  "salesByBrand":      [{ "id": null, "name": "Michelin", "value": 32100.00, "count": 168, "sharePercent": 22.3 }],
  "salesByLocation":   [{ "id": 1, "name": "Main Branch", "value": 96500.00, "count": 228, "sharePercent": 67.1 }],
  "inventory": { "skuCount": 1240, "totalUnits": 8632, "stockValueAtCost": 412800.00,
                 "outOfStockCount": 38, "lowStockCount": 96 },
  "topOutstanding": [{ "invoiceId": 9812, "invoiceDate": "2026-06-14T00:00:00", "customerName": "Acme Fleet",
                       "phone": "5559876543", "total": 4200.00, "paid": 1000.00, "due": 3200.00, "ageInDays": 73 }],
  "recentInvoices": [{ "invoiceId": 10233, "invoiceDate": "2026-08-26T16:10:00", "customerName": "Jane Doe",
                       "phone": "5552223333", "total": 620.00, "paid": 620.00,
                       "paymentInfo": "Visa ****4417", "lineCount": 4 }]
}
```

### 4.2 Individual endpoints

All accept the shared period query string from Section 2.1 unless noted.

| Endpoint | Extra params | Returns |
|---|---|---|
| `GET /api/dashboard/kpi` | — | the `kpi` object above |
| `GET /api/dashboard/sales/yearly` | `years` (default 5), `locationId` — **no period** | `yearlySales[]` |
| `GET /api/dashboard/sales/monthly` | `months` (default 12), `locationId` — **no period** | `monthlySales[]` |
| `GET /api/dashboard/sales/daily` | — | `dailySales[]` |
| `GET /api/dashboard/sales/heatmap` | — | `[{ dayOfWeek, dayName, hour, netSales, invoiceCount }]` |
| `GET /api/dashboard/collection/by-payment-method` | — | `paymentCollection[]` |
| `GET /api/dashboard/layaway/summary` | — | `{ openCount, openValue, collectedValue, pendingValue }` |
| `GET /api/dashboard/products/top-by-value` | `top` (default 10) | `topProducts[]` |
| `GET /api/dashboard/products/top-by-quantity` | `top` (default 10) | `topProducts[]`, sorted by quantity |
| `GET /api/dashboard/sales/by-department` | — | `NameValue[]` |
| `GET /api/dashboard/sales/by-brand` | `top` | `NameValue[]` |
| `GET /api/dashboard/sales/by-distributor` | `top` | `NameValue[]` |
| `GET /api/dashboard/customers/top` | `top` | `topCustomers[]` |
| `GET /api/dashboard/customers/mix` | — | `{ newCustomers, returningCustomers, newCustomerRevenue, returningCustomerRevenue }` |
| `GET /api/dashboard/vehicles/top-makes` | `top` | `NameValue[]` |
| `GET /api/dashboard/vehicles/tire-positions` | — | `{ leftFront, rightFront, leftRear, rightRear }` |
| `GET /api/dashboard/sales/by-location` | — **never send locationId** | `NameValue[]` |
| `GET /api/dashboard/invoices/top-outstanding` | `top` | `topOutstanding[]` |
| `GET /api/dashboard/invoices/recent` | `top`, `locationId` — **no period** | `recentInvoices[]` |
| `GET /api/dashboard/inventory/summary` | `locationId`, `lowStockThreshold` — **no period** | inventory object |
| `GET /api/dashboard/inventory/low-stock` | `threshold`, `top`, `locationId` — **no period** | `StockItem[]` |
| `GET /api/dashboard/inventory/dead-stock` | `days`, `top`, `locationId` — **no period** | `StockItem[]` |

`NameValue` = `{ id: number|null, name: string, value: number, count: number, sharePercent: number }`

`StockItem` = `{ itemId, description, brand, size, quantity, unitCost, stockValue, lastSoldOn, daysSinceLastSale }`

### 4.3 Contract rules you must respect

- **`monthlySales`, `yearlySales`, and `dailySales` are already gap-filled** by the API. Missing periods come back with zeros. Plot every element in order; do not deduplicate, sort, or filter.
- **`sharePercent` is precomputed.** Use it directly. Do not recalculate percentages client-side — the API divides by the true period total, which is larger than the sum of a top-10 list, so your recalculation would be wrong.
- **`label` on monthly data is pre-formatted.** Use it as the axis tick. Do not rebuild it from `year` and `month`.
- **Nullable fields:** `itemId`, `brand`, `size`, `series`, `department`, `email`, `paymentInfo`, `lastSoldOn`, `daysSinceLastSale`, and `NameValue.id` can all be `null`. Handle every one.
- **Empty results return `[]`, not `null`** — but code defensively anyway.

---

## 5. TECHNICAL REQUIREMENTS

1. **Typed API layer.** Generate TypeScript interfaces (or equivalent) for every contract in Section 4. Put all fetch logic in one `dashboardApi` module. No `fetch` calls inside components.
2. **One shared filter state** for period, custom dates, and branch. Every widget reads from it. Persist to the URL query string so a filtered view can be bookmarked and shared.
3. **Abort in-flight requests** when the filter changes, using `AbortController`. Rapid period switching must not let a stale response overwrite a newer one.
4. **Attach the auth header** from Section 0 on every request. On a `401`, redirect to login rather than showing an error card.
5. **Reusable components** — build `KpiCard`, `ChartCard`, `DataTable`, `SkeletonBlock`, and `EmptyState` once and reuse them. Do not copy-paste card markup per widget.
6. **No hardcoded data anywhere**, including chart demo data left over from library examples.
7. **Number safety** — division for any derived value must guard against zero denominators.
8. **Print stylesheet** — the owner will want to print or PDF this. Charts must not clip and dark backgrounds must not render as black blocks.


## 6. WIDGETS DESIGN TEMPLATE
Retain all visual configurations including color palettes, gradients, font families, tooltip styles, hover states, border radius, and gridline styling.
For reference,Following files contain the layout of different graphs , charts etc.
\main\src\app\(DashboardLayout)\page.tsx
\main\src\app\(DashboardLayout)\dashboards\eCommerce\page.tsx
\main\src\app\(DashboardLayout)\dashboards\general\page.tsx

Please use above design patterns, components while disigning the Dashboard widgets.

---

## 6. DELIVERABLES

1. Complete, runnable frontend source.
2. Typed API client module covering all 24 endpoints.
3. All components from Sections B through I.
4. A `README.md` explaining how to configure the API base URL and run the project.
5. A short note listing any endpoint whose response shape did not match this document, so the backend can be corrected.

---

## 7. WHAT NOT TO DO

- Do not add a chart or metric that is not sourced from an endpoint in Section 4.
- Do not call `/overview` and then also call the individual endpoints for the same widgets. That doubles the load for no benefit.
- Do not use `Task`-style parallel fan-out of all 24 endpoints on page load.
- Do not silently swallow errors into an empty state — the two are visually distinct for a reason.
- Do not present `grossProfit` or `marginPercent` without the estimation caveat tooltip.
- Do not reformat, re-sort, or re-aggregate any array the API returns.

Build it.
