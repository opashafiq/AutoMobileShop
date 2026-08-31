'use client'

import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { ApexChart } from '../shared/ApexChart'
import { useChartTheme, type ChartOptions } from '../shared/charts'
import { Icon } from '@iconify/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  formatCurrency,
  formatCurrencyAbbrev,
  formatNumberAbbrev,
  formatShortDay,
} from '../format'

/**
 * Section C — Sales Trends (§3). Full width, tabbed: Monthly | Yearly | Daily.
 *
 * - Monthly: bars = netSales, line = collected, right-hand line = invoiceCount.
 *   X axis = `label` exactly as returned (do not reconstruct it).
 * - Yearly:  grouped bars netSales + collected.
 * - Daily:   area chart of netSales by date — zero-sale days are present and
 *            must be plotted (the gaps are the insight); never filter them out.
 *
 * All three arrays are already gap-filled and ordered by the API — plot every
 * element in order; do not deduplicate, sort or filter.
 */
export function SalesTrends({ query }: { query: QueryState<OverviewResponse> }) {
  return (
    <ChartCard title="Sales Trends">
      <WidgetState
        query={query}
        isEmpty={(o) => !o.monthlySales?.length && !o.yearlySales?.length && !o.dailySales?.length}
        height={380}
        loading={<div className="h-[380px] w-full animate-pulse rounded-lg bg-muted/70" />}
      >
        {(overview) => <TrendsTabs overview={overview} />}
      </WidgetState>
    </ChartCard>
  )
}

function TrendsTabs({ overview }: { overview: OverviewResponse }) {
  const theme = useChartTheme()
  const { monthlySales, yearlySales, dailySales } = overview

  return (
    <Tabs defaultValue="monthly" className="w-full">
      <TabsList className="mb-2">
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="yearly">Yearly</TabsTrigger>
        <TabsTrigger value="daily">Daily</TabsTrigger>
      </TabsList>

      <TabsContent value="monthly">
        <MonthlyChart data={monthlySales} theme={theme} />
      </TabsContent>
      <TabsContent value="yearly">
        <YearlyChart data={yearlySales} theme={theme} />
      </TabsContent>
      <TabsContent value="daily">
        <DailyChart data={dailySales} theme={theme} />
      </TabsContent>
    </Tabs>
  )
}

type Theme = ReturnType<typeof useChartTheme>

function baseChart(theme: Theme, height = 360, type: 'bar' | 'line' | 'area' = 'bar') {
  return {
    chart: {
      type,
      height,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
      animations: {
        enabled: true,
        easing: 'easeinout' as const,
        speed: 650,
        animateGradually: { enabled: true, delay: 100 },
        dynamicAnimation: { enabled: true, speed: 650 },
      },
    },
    grid: theme.grid,
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: theme.fontFamily,
      fontSize: '12px',
      markers: { size: 6, strokeWidth: 0 },
      itemMargin: { horizontal: 10, vertical: 0 },
    },
    tooltip: {
      theme: theme.tooltipTheme,
      fillSeriesColor: false,
    },
  } as const
}

function moneyTooltip(theme: Theme, invoiceSeriesIndex?: number) {
  return {
    theme: theme.tooltipTheme,
    fillSeriesColor: false,
    y: {
      formatter: (_val: number, opts: { seriesIndex: number }) =>
        opts.seriesIndex === invoiceSeriesIndex
          ? formatNumberAbbrev(_val)
          : formatCurrency(_val),
    },
  }
}

/**
 * §5: the trailing month of any period is only part-way through, so it plots
 * as a sudden cliff that reads like a data bug. Detect it (last month below
 * 60% of the average of up to three prior months) so the chart can annotate
 * it. The underlying values are flagged, never altered.
 */
function partialMonthLabel(data: OverviewResponse['monthlySales']): string | null {
  if (data.length < 2) return null
  const last = data[data.length - 1]
  const prior = data.slice(Math.max(0, data.length - 4), data.length - 1)
  if (!prior.length) return null
  const avg = prior.reduce((sum, m) => sum + m.netSales, 0) / prior.length
  if (avg <= 0) return null
  return last.netSales < avg * 0.6 ? last.label : null
}

function MonthlyChart({ data, theme }: { data: OverviewResponse['monthlySales']; theme: Theme }) {
  if (!data.length) {
    return <TrendsEmpty />
  }
  const labels = data.map((m) => m.label)
  const partialMonth = partialMonthLabel(data)

  const options: ChartOptions = {
    ...baseChart(theme, 360, 'line'),
    series: [
      { name: 'Net Sales', type: 'bar', data: data.map((m) => m.netSales) },
      { name: 'Collected', type: 'line', data: data.map((m) => m.collected) },
      { name: 'Invoices', type: 'line', data: data.map((m) => m.invoiceCount) },
    ],
    colors: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'],
    stroke: { width: [0, 2.5, 2.5], curve: 'smooth' as const },
    plotOptions: {
      bar: {
        columnWidth: '38%',
        borderRadius: 5,
        borderRadiusApplication: 'around' as const,
        borderRadiusWhenStacked: 'around' as const,
      },
    },
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.foreColor, fontSize: '12px' } },
      tooltip: { enabled: false },
    },
    yaxis: [
      {
        seriesName: 'Net Sales',
        labels: { formatter: (v: number) => formatCurrencyAbbrev(v) },
      },
      {
        seriesName: 'Collected',
        labels: { formatter: (v: number) => formatCurrencyAbbrev(v) },
      },
      {
        seriesName: 'Invoices',
        opposite: true,
        labels: { formatter: (v: number) => formatNumberAbbrev(v) },
      },
    ],
    tooltip: moneyTooltip(theme, 2),
    ...(partialMonth && {
      // Neutral dashed marker over the partial month (§5).
      annotations: {
        xaxis: [
          {
            x: partialMonth,
            strokeDashArray: 4,
            borderColor: '#94a3b8',
            opacity: 0.15,
            label: {
              text: 'In progress',
              position: 'top',
              style: {
                fontSize: '11px',
                fontWeight: 600,
                background: '#94a3b8',
                color: '#fff',
                offsetY: -6,
              },
            },
          },
        ],
      },
    }),
  }

  return (
    <div
      role="img"
      aria-label={`Monthly sales trend: ${labels.length} months. Net sales and collected amounts, plus invoice count.${partialMonth ? ` ${partialMonth} is only part-way through.` : ''}`}
    >
      <ApexChart options={options} series={options.series} type="line" height={360} width="100%" />
      {partialMonth && (
        <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground" role="note">
          <Icon icon="solar:info-circle-bold" width={14} height={14} className="mt-px shrink-0" />
          <span>
            {partialMonth} is still in progress — its totals will keep rising until the month closes. The
            drop reflects the partial period, not a sales decline.
          </span>
        </p>
      )}
      <HiddenSummary
        items={data.map(
          (m) => `${m.label}: net sales ${formatCurrency(m.netSales)}, collected ${formatCurrency(m.collected)}, ${m.invoiceCount} invoices`,
        )}
      />
    </div>
  )
}

function YearlyChart({ data, theme }: { data: OverviewResponse['yearlySales']; theme: Theme }) {
  if (!data.length) return <TrendsEmpty />
  const options: ChartOptions = {
    ...baseChart(theme, 360, 'bar'),
    series: [
      { name: 'Net Sales', data: data.map((y) => y.netSales) },
      { name: 'Collected', data: data.map((y) => y.collected) },
    ],
    colors: ['var(--color-primary)', 'var(--color-secondary)'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '34%',
        borderRadius: 5,
        borderRadiusApplication: 'around' as const,
        borderRadiusWhenStacked: 'around' as const,
      },
    },
    xaxis: {
      categories: data.map((y) => String(y.year)),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.foreColor, fontSize: '12px' } },
    },
    yaxis: {
      labels: { formatter: (v: number) => formatCurrencyAbbrev(v) },
    },
    tooltip: moneyTooltip(theme),
  }
  return (
    <div role="img" aria-label={`Yearly sales: net sales versus collected by year.`}>
      <ApexChart options={options} series={options.series} type="bar" height={360} width="100%" />
      <HiddenSummary
        items={data.map(
          (y) => `${y.year}: net sales ${formatCurrency(y.netSales)}, collected ${formatCurrency(y.collected)}`,
        )}
      />
    </div>
  )
}

function DailyChart({ data, theme }: { data: OverviewResponse['dailySales']; theme: Theme }) {
  if (!data.length) return <TrendsEmpty />
  const options: ChartOptions = {
    ...baseChart(theme, 360, 'area'),
    series: [{ name: 'Net Sales', data: data.map((d) => d.netSales) }],
    colors: ['var(--color-primary)'],
    stroke: { width: 2.5, curve: 'smooth' as const },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['var(--color-lightprimary)'],
        inverseColors: false,
        opacityFrom: 0.55,
        opacityTo: 0.02,
        stops: [0, 90],
      },
    },
    xaxis: {
      categories: data.map((d) => formatShortDay(d.date)),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.foreColor, fontSize: '11px' }, rotate: -45 },
      tickAmount: Math.min(12, data.length - 1) || 1,
    },
    yaxis: {
      labels: { formatter: (v: number) => formatCurrencyAbbrev(v) },
    },
    tooltip: { theme: theme.tooltipTheme, fillSeriesColor: false, x: { show: true } },
  }
  return (
    <div role="img" aria-label="Daily net sales area chart including days with no sales.">
      <ApexChart options={options} series={options.series} type="area" height={360} width="100%" />
      <HiddenSummary
        items={data.map((d) => `${formatShortDay(d.date)}: net sales ${formatCurrency(d.netSales)}`)}
      />
    </div>
  )
}

function TrendsEmpty() {
  return <p className="py-16 text-center text-sm text-muted-foreground">No sales in this period</p>
}

/** Accessibility: a visually hidden tabular summary for each chart (§2.8). */
function HiddenSummary({ items }: { items: string[] }) {
  return (
    <ul className="sr-only">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export default SalesTrends