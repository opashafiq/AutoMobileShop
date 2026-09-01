'use client'

import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse, TopCustomer, TopProduct } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { ApexChart } from '../shared/ApexChart'
import { DataTable, type Column } from '../shared/DataTable'
import { useChartTheme, type ChartOptions } from '../shared/charts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatCurrencyAbbrev, formatDate, formatNumber, formatPercent } from '../format'

/**
 * Section E — Top 10 Products by Value, then Top 10 Customers.
 *
 * Products: chart-first — horizontal bars, largest first, with bar colour
 * carrying the stock story the brief calls "the point of this widget"
 * (primary = healthy, warning = ≤4 units, error = out of stock). A compact
 * Chart | Table toggle in the card header switches to the sortable audit
 * table (stockOnHand 0 → red "Out" badge, 1–4 → amber "Low" badge). Both
 * views render full-width — long product names need the room (half-width
 * cards squeeze labels).
 *
 * Customers: rows with `outstanding > 0` are highlighted.
 */
export function TopProductsCustomers({ query }: { query: QueryState<OverviewResponse> }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        {/* Tabs wraps the whole card so the trigger can live in the header's
            action slot while the two panels render in the body. */}
        <Tabs defaultValue="chart">
          <ChartCard
            title="Top 10 Products by Value"
            subtitle="Highest-revenue items and what is left in stock"
            action={
              <TabsList className="h-8">
                <TabsTrigger value="chart" className="px-3 py-1 text-xs">
                  Chart
                </TabsTrigger>
                <TabsTrigger value="table" className="px-3 py-1 text-xs">
                  Table
                </TabsTrigger>
              </TabsList>
            }
          >
            <WidgetState
              query={query}
              isEmpty={(o) => !o.topProducts?.length}
              height={360}
              emptyMessage="No product sales in this period"
            >
              {(o) => <ProductsCard items={o.topProducts} />}
            </WidgetState>
          </ChartCard>
        </Tabs>
      </div>

      <div className="col-span-12">
        <ChartCard title="Top 10 Customers" subtitle="Highest-value customers this period">
          <WidgetState
            query={query}
            isEmpty={(o) => !o.topCustomers?.length}
            height={360}
            emptyMessage="No customers in this period"
          >
            {(o) => <CustomersTable items={o.topCustomers} />}
          </WidgetState>
        </ChartCard>
      </div>
    </div>
  )
}

/**
 * The two views of the products widget. Tab state is uncontrolled (Radix), so
 * the chosen view survives filter changes — the section never remounts.
 */
function ProductsCard({ items }: { items: TopProduct[] }) {
  return (
    <>
      <TabsContent value="chart">
        <ProductsChart items={items} />
      </TabsContent>
      <TabsContent value="table">
        <ProductsTable items={items} />
      </TabsContent>
    </>
  )
}

/* ------------------------------- chart view ------------------------------ */

/** Bar colour = stock state. Semantic only: red for a genuine alert. */
function stockBarColor(stockOnHand: number): string {
  if (stockOnHand <= 0) return 'var(--color-error)'
  if (stockOnHand <= 4) return 'var(--color-warning)'
  return 'var(--color-primary)'
}

function stockText(stockOnHand: number): string {
  if (stockOnHand <= 0) return 'Out of stock'
  if (stockOnHand <= 4) return `Low — ${formatNumber(stockOnHand)} left`
  return `${formatNumber(stockOnHand)} in stock`
}

/** Axis labels truncate at a word boundary; the tooltip carries the full name. */
function truncateLabel(text: string, max = 28): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`
}

/**
 * Glance view for Top 10 Products by Value: horizontal bars, largest first
 * (§5). `distributed: true` is what makes ApexCharts take one colour per bar
 * from the `colors` array (a plain single-series bar paints them all alike);
 * a single-series Apex legend can't colour per bar either, so the stock key
 * above the plot is plain HTML.
 */
function ProductsChart({ items }: { items: TopProduct[] }) {
  const theme = useChartTheme()
  // §5: bars read descending, largest first (display order only).
  const rows = [...items].sort((a, b) => b.revenue - a.revenue)
  // Row-proportional height keeps labels full-size whatever the row count.
  const height = Math.max(280, rows.length * 34 + 60)

  const options: ChartOptions = {
    chart: {
      type: 'bar',
      height,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
      animations: { enabled: true, easing: 'easeinout', speed: 650 },
    },
    series: [{ name: 'Revenue', data: rows.map((i) => Math.round(i.revenue * 100) / 100) }],
    colors: rows.map((i) => stockBarColor(i.stockOnHand)),
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        barHeight: '58%',
        borderRadius: 5,
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'around',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (v: number) => formatCurrencyAbbrev(v),
      offsetX: 6,
      style: { fontSize: '12px', fontWeight: 600, colors: [theme.foreColor] },
    },
    xaxis: {
      categories: rows.map((i) => truncateLabel(i.description)),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { formatter: (v: number) => formatCurrencyAbbrev(v) },
    },
    yaxis: {
      labels: { style: { colors: theme.foreColor, fontSize: '13px' } },
    },
    grid: theme.grid,
    legend: { show: false },
    tooltip: {
      theme: theme.tooltipTheme,
      fillSeriesColor: false,
      // The axis shows the truncated name — the tooltip title gets the full one.
      x: {
        formatter: (_val: string, opts: { dataPointIndex: number }) =>
          rows[opts.dataPointIndex]?.description ?? '',
      },
      y: {
        formatter: (value: number, opts: { dataPointIndex: number }) => {
          const r = rows[opts.dataPointIndex]
          if (!r) return formatCurrency(value)
          return `${formatCurrency(value)}  ·  ${formatNumber(r.quantity)} sold  ·  ${formatPercent(
            r.sharePercent,
          )} of period  ·  ${stockText(r.stockOnHand)}`
        },
      },
    },
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /> In stock
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" /> Low (≤ 4 units)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-error" aria-hidden="true" /> Out of stock
        </span>
      </div>
      <div
        role="img"
        aria-label={`Top products by revenue: ${rows
          .map((i) => `${i.description} ${formatCurrency(i.revenue)} (${stockText(i.stockOnHand)})`)
          .join(', ')}.`}
      >
        <ApexChart options={options} series={options.series} type="bar" height={height} width="100%" />
      </div>
    </div>
  )
}

/* ------------------------------- table view ------------------------------ */

function StockBadge({ stockOnHand }: { stockOnHand: number }) {
  if (stockOnHand <= 0) {
    return (
      <Badge variant="lightError" title="Out of stock" className="text-[11px] uppercase tracking-wide">
        Out
      </Badge>
    )
  }
  if (stockOnHand <= 4) {
    return (
      <Badge variant="lightWarning" title="Low stock" className="text-[11px] uppercase tracking-wide">
        Low · {formatNumber(stockOnHand)}
      </Badge>
    )
  }
  return <span className="text-sm font-medium">{formatNumber(stockOnHand)}</span>
}

/**
 * Brand/size parts that ADD information beyond the description. Most product
 * descriptions already spell out brand and size ("CELIMO PREVAIL A/T …
 * LT35-12.50-20"), so printing "brand · size" under them duplicates the line —
 * only the parts the description doesn't already contain are returned.
 */
function productSubline(r: TopProduct): string {
  const desc = r.description.toLowerCase()
  return [r.brand, r.size]
    .filter(Boolean)
    .filter((part) => !desc.includes(String(part).toLowerCase()))
    .join(' · ')
}

function ProductsTable({ items }: { items: TopProduct[] }) {
  // Mini-bar scale: relative to the biggest share in the list (§4).
  const maxShare = Math.max(1, ...items.map((r) => r.sharePercent))

  // Table layout is fixed (DataTable) — every column declares a width except
  // the product name, which absorbs the rest. Long names ellipsize with the
  // full text on hover.
  const columns: Column<TopProduct>[] = [
    {
      header: 'Product',
      sortValue: (r) => r.description,
      render: (r) => {
        const sub = productSubline(r)
        return (
          <div className="min-w-0">
            <p className="truncate font-medium text-dark dark:text-white" title={r.description}>
              {r.description}
            </p>
            {sub && (
              <p className="truncate text-xs text-muted-foreground" title={sub}>
                {sub}
              </p>
            )}
          </div>
        )
      },
    },
    {
      header: 'Qty',
      width: 80,
      sortValue: (r) => r.quantity,
      render: (r) => <span className="tabular-nums">{formatNumber(r.quantity)}</span>,
    },
    {
      header: 'Revenue',
      width: 120,
      sortValue: (r) => r.revenue,
      render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.revenue)}</span>,
    },
    {
      header: 'Share',
      width: 128,
      sortValue: (r) => r.sharePercent,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-muted md:block" aria-hidden="true">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.sharePercent / maxShare) * 100}%` }} />
          </span>
          <span className="tabular-nums">{formatPercent(r.sharePercent)}</span>
        </div>
      ),
    },
    {
      header: 'Stock',
      width: 88,
      sortValue: (r) => r.stockOnHand,
      render: (r) => <StockBadge stockOnHand={r.stockOnHand} />,
    },
  ]

  return (
    <DataTable<TopProduct>
      columns={columns}
      rows={items}
      keyField={(r) => `${r.itemId ?? r.description}-${r.quantity}`}
      mobileTitle={(r) => r.description}
      mobileSubtitle={(r) => productSubline(r)}
      rowClassName={(r) => (r.stockOnHand <= 0 ? 'bg-lighterror/25 md:bg-lighterror/15' : undefined)}
      emptyMessage="No product sales in this period"
    />
  )
}

/* ------------------------------ customers -------------------------------- */

function CustomersTable({ items }: { items: TopCustomer[] }) {
  // Phone lives in the row-detail expansion (§3). Fixed column widths — the
  // customer name absorbs the remaining space and ellipsizes when long.
  const columns: Column<TopCustomer>[] = [
    {
      header: 'Customer',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-dark dark:text-white" title={r.name}>
            {r.name}
          </p>
          {r.email && (
            <p className="truncate text-xs text-muted-foreground" title={r.email}>
              {r.email}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Invoices',
      width: 116,
      sortValue: (r) => r.invoiceCount,
      render: (r) => <span className="tabular-nums">{formatNumber(r.invoiceCount)}</span>,
    },
    {
      header: 'Revenue',
      width: 120,
      sortValue: (r) => r.revenue,
      render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.revenue)}</span>,
    },
    {
      header: 'Due',
      width: 120,
      sortValue: (r) => r.outstanding,
      render: (r) =>
        r.outstanding > 0 ? (
          <span className="tabular-nums font-semibold text-error">{formatCurrency(r.outstanding)}</span>
        ) : (
          <span className="tabular-nums text-muted-foreground">{formatCurrency(r.outstanding)}</span>
        ),
    },
    {
      header: 'Last Visit',
      width: 136,
      sortValue: (r) => r.lastPurchase ?? '',
      render: (r) => formatDate(r.lastPurchase),
    },
  ]

  return (
    <DataTable<TopCustomer>
      columns={columns}
      rows={items}
      keyField={(r) => `${r.name}-${r.phone ?? r.email ?? 'x'}`}
      mobileTitle={(r) => r.name}
      rowClassName={(r) => (r.outstanding > 0 ? 'bg-lighterror/25 md:bg-lighterror/15' : undefined)}
      emptyMessage="No customers in this period"
      detail={(r) => (
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Phone</dt>
            <dd className="tabular-nums">{r.phone ?? '—'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</dt>
            <dd className="break-words">{r.email ?? '—'}</dd>
          </div>
        </dl>
      )}
    />
  )
}

export default TopProductsCustomers
