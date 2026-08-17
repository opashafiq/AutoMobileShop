# Dashboard API Samples — Tire Shop

Sample JSON payloads for each dashboard widget. Use these as blueprints when building your backend API endpoints.

## Response Envelope

Each JSON file represents the **`data` payload only**. Wrap it in your standard envelope:

```json
{ "status": 200, "msg": "Success", "data": { ... } }
```

## Endpoint Map

### Highly Relevant (8)

| File | Component | Source | Suggested Endpoint | Description |
|---|---|---|---|---|
| `TopCards.json` | TopCards | Modern | `GET /Dashboard/SummaryCards` | Key metric cards (today's sales, pending invoices, low stock, new orders, customers, service orders) |
| `WelcomeCard.json` | WelcomeCard | eCommerce | `GET /Dashboard/Welcome` | Welcome banner with user name, today's sales, overall performance |
| `RevenueUpdate.json` | RevenueUpdate | Modern | `GET /Dashboard/RevenueUpdate?year=2026` | Stacked bar chart: earnings vs expenses by month, per year selector |
| `Expense.json` | Expense | eCommerce | `GET /Dashboard/ExpenseBreakdown` | Donut chart: expense categories with totals |
| `SellingProducts.json` | SellingProducts | Modern | `GET /Dashboard/BestSellingBrands` | Progress bars: top tire brands by revenue percentage |
| `TopProduct.json` | TopProduct | eCommerce | `GET /Dashboard/TopProducts` | Sortable table: top-selling products with image, stock, price |
| `RecentTransaction.json` | RecentTransaction | eCommerce | `GET /Dashboard/RecentTransactions` | Timeline feed: recent payments and sale events |
| `PaymentGateway.json` | PaymentGateway | eCommerce | `GET /Dashboard/PaymentMethods` | Payment method breakdown (cash, card, financing) |

### Relevant (10)

| File | Component | Source | Suggested Endpoint | Description |
|---|---|---|---|---|
| `YearlyBreakup.json` | YearlyBreakup | Modern | `GET /Dashboard/YearlyBreakup` | Donut chart: revenue split by year |
| `MonthlyEarning.json` | MonthlyEarning | Modern | `GET /Dashboard/MonthlyEarnings` | Sparkline card: monthly earnings with % change |
| `MonthlyEarningEcommerce.json` | MonthlyEarning | eCommerce | `GET /Dashboard/MonthlyEarnings` | Sparkline card: monthly earnings (alternate variant) |
| `Sales.json` | Sales | eCommerce | `GET /Dashboard/Sales` | Sparkline bar: weekly sales total |
| `IncrementedSales.json` | IncrementedSales | eCommerce | `GET /Dashboard/IncrementedSales` | Sparkline bar: sales trend |
| `SalesGrowth.json` | SalesGrowth | eCommerce | `GET /Dashboard/SalesGrowth` | Area sparkline: sales growth over 18 periods |
| `Customers.json` | Customers | eCommerce | `GET /Dashboard/Customers` | Sparkline area: customer count with trend |
| `CustomerSegmentation.json` | CustomerSegmentation | eCommerce | `GET /Dashboard/CustomerSegments` | Donut chart: customer categories (Individual/Fleet/Wholesale) |
| `WeeklyStats.json` | WeeklyStats | Modern | `GET /Dashboard/WeeklyStats` | Area sparkline + stats list (top sales, top service, top customer) |
| `WeeklySales.json` | YearlySales | eCommerce | `GET /Dashboard/WeeklySales` | Bar chart: sales by day of week with totals |
| `QuarterlyStats.json` | QuarterlyStats | eCommerce | `GET /Dashboard/QuarterlyStats` | Area sparkline + stats list (quarterly) |

### Partially Relevant (4) — Adapted for Tire Shop

| File | Component | Source | Suggested Endpoint | Description |
|---|---|---|---|---|
| `EmployeeSalary.json` | EmployeeSalary | Modern | `GET /Dashboard/TechnicianRevenue` | Bar chart: technician service revenue by month |
| `TopPerformer.json` | TopPerformer | Modern | `GET /Dashboard/TopTechnicians` | Sortable table: top technicians (revenue, service category, priority) |
| `UserActivity.json` | UserActivity | eCommerce | `GET /Dashboard/ServiceActivity` | Stacked bar: tire sales vs service jobs by day |

> **Note:** `MonthlyEarning.json` (Modern) and `MonthlyEarningEcommerce.json` (eCommerce) serve similar data with minor layout differences. You can merge them into a single endpoint and add a `variant` query param if needed.

---

## Field Semantics — Adapted Components

Some components were renamed from their original labels to fit a tire shop context. Here's the field mapping:

### TopPerformer → TopTechnicians

| Field | Original Meaning | Tire Shop Meaning |
|---|---|---|
| `username` | Employee name | Technician name |
| `designation` | Job title | Role (Senior Tech, Service Advisor) |
| `project` | Assigned project | Primary service category |
| `priority` | Task priority | Workload priority |
| `budget` | Budget in $K | Revenue generated in $K |

### EmployeeSalary → Technician Revenue

| Field | Original Meaning | Tire Shop Meaning |
|---|---|---|
| `summary.salary` | Total salary | Total labor cost |
| `summary.profit` | Profit | Net profit from services |
| `summary.salaryLabel` | "Salary" | "Labor Cost" |
| `summary.profitLabel` | "Profit" | "Net Profit" |

### UserActivity → Service Activity

| Series | Original | Tire Shop |
|---|---|---|
| Series 1 | Checkout | Tire Sales |
| Series 2 | Viewed | Service Jobs (alignment, rotation, balancing) |

---

## Styling & Display Fields

Some JSON files include display-related fields (icons, colors, URLs) that are normally a frontend concern:

- `TopCards.json` — `img`, `bgcolor`, `textclr`, `url` are display hints
- `PaymentGateway.json` — `color` is a CSS class, `paymentImg` is an icon path
- `RecentTransaction.json` — `borderColor`, `isSale` control timeline rendering
- `TopProduct.json` — `color` maps to badge variant for stock status

**Two approaches:**
1. **API returns everything** — Frontend renders as-is (most flexible, currently reflected in the JSONs)
2. **Frontend hardcodes display config** — API returns only values; frontend maps styling internally

Approach 2 is cleaner long-term (separation of concerns) but requires frontend refactoring. The current JSONs support approach 1 for drop-in compatibility.

---

## Chart Colors

Colors like `var(--color-primary)` are CSS custom properties resolved by the theme engine. They appear in the JSON for legend markers and donut segments. The actual chart rendering uses these values from the chart config (not the data). If you need to override chart colors per API response, the frontend chart config should reference `series[].color` or `colors[]` from the payload.

---

## Skipped Components

These components were analyzed but deemed **not applicable** to a tire shop:

| Component | Source | Reason |
|---|---|---|
| `Projects` | Modern | "Projects" concept doesn't exist in tire retail |
| `Social` | Modern | Social network/team collaboration features don't apply |
