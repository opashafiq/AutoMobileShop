'use client'

import type { QueryState } from '../useDashboardQuery'
import type { NameValue, OverviewResponse } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { ApexChart } from '../shared/ApexChart'
import { useChartTheme, CHART_COLORS, type ChartOptions } from '../shared/charts'
import { cn } from '@/lib/utils'
import { formatCurrency, formatCurrencyAbbrev, formatPercent } from '../format'

/**
 * Section F — Two columns (§3).
 * Left:  Sales by Brand (horizontal bars).
 * Right: Sales by Branch (vertical bars). The entire widget is HIDDEN when the
 *        array has one or zero entries — a single-branch business sees no empty
 *        comparison — and the brand card expands to fill the row.
 */
export function BrandAndBranch({ query }: { query: QueryState<OverviewResponse> }) {
  return (
    <WidgetState
      query={query}
      isEmpty={(o) => !o.salesByBrand?.length && (o.salesByLocation?.length ?? 0) <= 1}
      height={320}
      emptyMessage="No brand or branch sales in this period"
    >
      {(o) => <BrandBranchGrid overview={o} />}
    </WidgetState>
  )
}

function BrandBranchGrid({ overview }: { overview: OverviewResponse }) {
  const theme = useChartTheme()
  const branches = overview.salesByLocation ?? []
  const branchHidden = branches.length <= 1

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className={cn('col-span-12', !branchHidden && 'lg:col-span-6')}>
        <ChartCard title="Sales by Brand" subtitle="Revenue split across brands">
          {overview.salesByBrand?.length ? (
            <BrandBars items={overview.salesByBrand} theme={theme} />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No sales in this period
            </p>
          )}
        </ChartCard>
      </div>

      {!branchHidden && (
        <div className="col-span-12 lg:col-span-6">
          <ChartCard title="Sales by Branch" subtitle="Comparing locations">
            <BranchBars items={branches} theme={theme} />
          </ChartCard>
        </div>
      )}
    </div>
  )
}

function BrandBars({ items, theme }: { items: NameValue[]; theme: ReturnType<typeof useChartTheme> }) {
  // §5: bars read descending, largest first (display order only).
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const options: ChartOptions = {
    chart: {
      type: 'bar',
      height: 320,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
    },
    series: [{ name: 'Sales', data: sorted.map((i) => i.value) }],
    colors: [CHART_COLORS[0]],
    plotOptions: { bar: { horizontal: true, barHeight: '58%', borderRadius: 5, borderRadiusApplication: 'around', borderRadiusWhenStacked: 'around' } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: sorted.map((i) => i.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { formatter: (v: number) => formatCurrencyAbbrev(v) },
    },
    yaxis: { labels: { style: { colors: theme.foreColor, fontSize: '12px' } } },
    grid: theme.grid,
    legend: { show: false },
    tooltip: {
      theme: theme.tooltipTheme,
      fillSeriesColor: false,
      y: { formatter: (value: number) => formatCurrency(value) },
    },
  }
  return (
    <div role="img" aria-label="Sales by brand" className="h-full">
      <ApexChart options={options} series={options.series} type="bar" height={320} width="100%" />
    </div>
  )
}

function BranchBars({ items, theme }: { items: NameValue[]; theme: ReturnType<typeof useChartTheme> }) {
  // §5: bars read descending, largest first (display order only).
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const options: ChartOptions = {
    chart: {
      type: 'bar',
      height: 320,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
    },
    series: [{ name: 'Sales', data: sorted.map((i) => i.value) }],
    colors: [CHART_COLORS[0]],
    plotOptions: {
      bar: { horizontal: false, columnWidth: '42%', borderRadius: 5, borderRadiusApplication: 'around', borderRadiusWhenStacked: 'around' },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: sorted.map((i) => i.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.foreColor, fontSize: '12px' } },
    },
    yaxis: { labels: { formatter: (v: number) => formatCurrencyAbbrev(v) } },
    grid: theme.grid,
    legend: { show: false },
    tooltip: {
      theme: theme.tooltipTheme,
      fillSeriesColor: false,
      y: {
        formatter: (value: number, opts: { dataPointIndex: number }) =>
          `${formatCurrency(value)}  ·  ${formatPercent(sorted[opts.dataPointIndex]?.sharePercent)} of period`,
      },
    },
  }
  return (
    <div role="img" aria-label="Sales by branch" className="h-full">
      <ApexChart options={options} series={options.series} type="bar" height={320} width="100%" />
    </div>
  )
}

export default BrandAndBranch