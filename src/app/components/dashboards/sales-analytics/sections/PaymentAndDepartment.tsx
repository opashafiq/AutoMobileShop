'use client'

import type { QueryState } from '../useDashboardQuery'
import type { NameValue, OverviewResponse, PaymentCollectionItem } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { ApexChart } from '../shared/ApexChart'
import { EmptyState } from '../shared/EmptyState'
import { useChartTheme, CHART_COLORS, NEUTRAL_COLOR, type ChartOptions } from '../shared/charts'
import { formatCurrency, formatCurrencyAbbrev, formatNumber, formatPercent } from '../format'

/**
 * Section D — Two columns (§3).
 * Left:  Collection by Payment Method (donut, total in the centre, top 5 + "Other").
 * Right: Sales by Department (horizontal bars, `sharePercent` at the bar end).
 *
 * `sharePercent` is precomputed by the API — use it directly, never recompute.
 * The only aggregate built client-side is the "Other" bucket amount (the sum of
 * the remaining methods), which has no precomputed share.
 */
export function PaymentAndDepartment({ query }: { query: QueryState<OverviewResponse> }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-6 col-span-12">
        <ChartCard title="Collection by Payment Method" subtitle="Cash received by method">
          <WidgetState
            query={query}
            isEmpty={(o) => !o.paymentCollection?.length}
            height={340}
            emptyMessage="No collections in this period"
          >
            {(o) => <PaymentSection items={o.paymentCollection} />}
          </WidgetState>
        </ChartCard>
      </div>

      <div className="lg:col-span-6 col-span-12">
        <ChartCard title="Sales by Department" subtitle="Revenue split across departments">
          <WidgetState
            query={query}
            isEmpty={(o) => !o.salesByDepartment?.length}
            height={340}
            emptyMessage="No department sales in this period"
          >
            {(o) => <DepartmentBars items={o.salesByDepartment} />}
          </WidgetState>
        </ChartCard>
      </div>
    </div>
  )
}

/** Top 5 methods + everything else grouped as "Other" (§3). */
function groupPaymentMethods(items: PaymentCollectionItem[]): PaymentCollectionItem[] {
  if (items.length <= 6) return items
  const top = items.slice(0, 5)
  const rest = items.slice(5)
  return [
    ...top,
    {
      paymentId: -1,
      paymentName: 'Other',
      amount: rest.reduce((sum, i) => sum + i.amount, 0),
      transactionCount: rest.reduce((sum, i) => sum + i.transactionCount, 0),
      sharePercent: NaN, // no precomputed share for the aggregated bucket
    },
  ]
}

/**
 * §4: donuts are reserved for 3+ meaningfully-sized segments — with 1–2 real
 * categories a donut is decoration, so the widget falls back to horizontal
 * bars. An all-zero period gets an explicit empty state rather than an empty
 * ring (§2).
 */
function PaymentSection({ items }: { items: PaymentCollectionItem[] }) {
  const meaningful = items.filter((i) => i.amount > 0)
  if (meaningful.length === 0) {
    return <EmptyState message="No collections recorded in this period" />
  }
  if (meaningful.length <= 2) {
    return <PaymentBars items={items} />
  }
  return <PaymentDonut items={items} />
}

/** Horizontal-bars fallback for periods with 1–2 active payment methods. */
function PaymentBars({ items }: { items: PaymentCollectionItem[] }) {
  const theme = useChartTheme()
  const sorted = [...items].sort((a, b) => b.amount - a.amount)
  const height = Math.max(180, sorted.length * 64 + 60)

  const options: ChartOptions = {
    chart: {
      type: 'bar',
      height,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
      animations: { enabled: true, easing: 'easeinout', speed: 650 },
    },
    series: [{ name: 'Collected', data: sorted.map((i) => Math.round(i.amount * 100) / 100) }],
    colors: [CHART_COLORS[0]],
    plotOptions: {
      bar: {
        horizontal: true,
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
      style: { fontSize: '11px', fontWeight: 600, colors: [theme.foreColor] },
    },
    xaxis: {
      categories: sorted.map((i) => i.paymentName),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { formatter: (v: number) => formatCurrencyAbbrev(v) },
    },
    yaxis: {
      labels: { style: { colors: theme.foreColor, fontSize: '12px' } },
    },
    grid: theme.grid,
    legend: { show: false },
    tooltip: {
      theme: theme.tooltipTheme,
      fillSeriesColor: false,
      y: {
        formatter: (value: number, opts: { dataPointIndex: number }) => {
          const item = sorted[opts.dataPointIndex]
          const share = Number.isFinite(item?.sharePercent)
            ? `  ·  ${formatPercent(item?.sharePercent)} of period`
            : ''
          return `${formatCurrency(value)}${share}  ·  ${formatNumber(item?.transactionCount)} transactions`
        },
      },
    },
  }

  return (
    <div
      role="img"
      aria-label={`Collection by payment method: ${sorted
        .map((i) => `${i.paymentName} ${formatCurrency(i.amount)}`)
        .join(', ')}.`}
    >
      <ApexChart options={options} series={options.series} type="bar" height={height} width="100%" />
    </div>
  )
}

function PaymentDonut({ items }: { items: PaymentCollectionItem[] }) {
  const theme = useChartTheme()
  const grouped = groupPaymentMethods(items)
  const total = grouped.reduce((sum, i) => sum + i.amount, 0)
  // §1: one categorical sequence everywhere; the aggregated "Other" bucket
  // sits outside it in neutral gray.
  const colors = grouped.map(
    (g, i) => (g.paymentName === 'Other' ? NEUTRAL_COLOR : CHART_COLORS[i % CHART_COLORS.length]),
  )

  const options: ChartOptions = {
    chart: {
      type: 'donut',
      height: 340,
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
    },
    series: grouped.map((i) => Math.round(i.amount * 100) / 100),
    labels: grouped.map((i) => i.paymentName),
    colors,
    stroke: { show: true, width: 0, colors: ['transparent'] },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: 'bottom',
      fontFamily: theme.fontFamily,
      fontSize: '12px',
      markers: { size: 7, strokeWidth: 0 },
      formatter: (label: string, opts: { seriesIndex: number }) =>
        `${label} — ${formatCurrency(grouped[opts.seriesIndex]?.amount)}`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '78%',
          labels: {
            show: true,
            name: { show: true, fontSize: '14px', fontWeight: 600 },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 700,
              formatter: () => formatCurrencyAbbrev(total),
            },
            total: {
              show: true,
              label: 'Collected',
              fontSize: '12px',
              formatter: () => formatCurrencyAbbrev(total),
            },
          },
        },
      },
    },
    tooltip: {
      theme: theme.tooltipTheme,
      fillSeriesColor: false,
      y: {
        formatter: (value: number, opts: { seriesIndex: number }) => {
          const item = grouped[opts.seriesIndex]
          const share = Number.isFinite(item?.sharePercent)
            ? `  ·  ${formatPercent(item?.sharePercent)} of period`
            : ''
          return `${formatCurrency(value)}${share}`
        },
      },
    },
  }

  return (
    <div
      role="img"
      aria-label={`Collection by payment method. Total collected ${formatCurrency(total)}. Methods: ${grouped
        .map((i) => `${i.paymentName} ${formatCurrency(i.amount)}`)
        .join(', ')}.`}
    >
      <ApexChart options={options} series={options.series} type="donut" height={340} width="100%" />
    </div>
  )
}

function DepartmentBars({ items }: { items: OverviewResponse['salesByDepartment'] }) {
  const theme = useChartTheme()
  // §5: bar charts read descending, largest first (display order only).
  const sorted = [...items].sort((a, b) => b.value - a.value)
  // A tire shop tracks dozens of micro-departments; rendering them all squeezes
  // every label below legibility (24 rows in one card ≈ 12px each). Top 8 read
  // as bars; the rest aggregate into one "Other (N more)" row whose share is
  // the SUM of the remaining precomputed shares — summed, not recomputed.
  const rows: NameValue[] =
    sorted.length <= 9
      ? sorted
      : [
          ...sorted.slice(0, 8),
          {
            id: null,
            name: `Other (${sorted.length - 8} more)`,
            value: sorted.slice(8).reduce((s, i) => s + i.value, 0),
            count: sorted.slice(8).reduce((s, i) => s + i.count, 0),
            sharePercent: sorted.slice(8).reduce((s, i) => s + i.sharePercent, 0),
          },
        ]
  const shares = rows.map((i) => i.sharePercent)
  // Row-proportional height keeps labels full-size whatever the row count.
  const height = Math.max(240, rows.length * 34 + 60)

  const options: ChartOptions = {
    chart: {
      type: 'bar',
      height,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
      animations: { enabled: true, easing: 'easeinout', speed: 650 },
    },
    series: [{ name: 'Sales', data: rows.map((i) => i.value) }],
    colors: ['var(--color-primary)'],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '58%',
        borderRadius: 5,
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'around',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_v: number, opts: { dataPointIndex: number }) =>
        `${formatPercent(shares[opts.dataPointIndex])}`,
      offsetX: 6,
      style: { fontSize: '12px', fontWeight: 600, colors: [theme.foreColor] },
    },
    xaxis: {
      categories: rows.map((i) => i.name),
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
      y: {
        formatter: (value: number, opts: { dataPointIndex: number }) =>
          `${formatCurrency(value)}  ·  ${formatNumber(rows[opts.dataPointIndex]?.count)} sales`,
      },
    },
  }

  return (
    <div
      role="img"
      aria-label={`Sales by department: ${rows
        .map((i) => `${i.name} ${formatCurrency(i.value)}`)
        .join(', ')}.`}
      className="h-full"
    >
      <ApexChart options={options} series={options.series} type="bar" height={height} width="100%" />
    </div>
  )
}

export default PaymentAndDepartment