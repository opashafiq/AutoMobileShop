'use client'

import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse, PaymentCollectionItem } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { ApexChart } from '../shared/ApexChart'
import { useChartTheme, type ChartOptions } from '../shared/charts'
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
            {(o) => <PaymentDonut items={o.paymentCollection} />}
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

function PaymentDonut({ items }: { items: PaymentCollectionItem[] }) {
  const theme = useChartTheme()
  const grouped = groupPaymentMethods(items)
  const total = grouped.reduce((sum, i) => sum + i.amount, 0)
  const colors = grouped.map(
    (_, i) => theme.palette[i % theme.palette.length],
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
  const shares = items.map((i) => i.sharePercent)

  const options: ChartOptions = {
    chart: {
      type: 'bar',
      height: 340,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
      animations: { enabled: true, easing: 'easeinout', speed: 650 },
    },
    series: [{ name: 'Sales', data: items.map((i) => i.value) }],
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
      style: { fontSize: '11px', fontWeight: 600, colors: [theme.foreColor] },
    },
    xaxis: {
      categories: items.map((i) => i.name),
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
        formatter: (value: number, opts: { dataPointIndex: number }) =>
          `${formatCurrency(value)}  ·  ${formatNumber(items[opts.dataPointIndex]?.count)} sales`,
      },
    },
  }

  return (
    <div role="img" aria-label="Sales by department" className="h-full">
      <ApexChart options={options} series={options.series} type="bar" height={340} width="100%" />
    </div>
  )
}

export default PaymentAndDepartment