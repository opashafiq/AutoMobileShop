'use client'

import { useState, type CSSProperties } from 'react'
import { Icon } from '@iconify/react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type {
  CustomerMix,
  NameValue,
  SalesHeatmapCell,
  TirePositions,
} from '../types'
import { dashboardApi } from '../dashboardApi'
import { useDashboardQuery } from '../useDashboardQuery'
import { useDashboardFilter } from '../filter-context'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { LazyLoad } from '../shared/LazyLoad'
import { ApexChart } from '../shared/ApexChart'
import { useChartTheme, type ChartOptions } from '../shared/charts'
import {
  formatCurrency,
  formatNumber,
  formatNumberAbbrev,
  formatPercent,
} from '../format'

/**
 * Section I — Insights (collapsible, §3). Four additional lazy views that are
 * NOT part of the overview response — each stays unmounted (and un-fetched)
 * until the panel is opened / its card scrolls into view:
 *   Sales heatmap (7 × 24) · Customer mix · Top vehicle makes · Tire positions
 *
 * The section loads on the shared filter (from/to/location) exactly like the
 * other lazy widgets: `[filterKey, refreshKey]` in every query's deps.
 */
export function Insights() {
  return (
    <div className="p-5 sm:p-6">
      <Collapsible defaultOpen>
        <DashboardInsightsPanel />
      </Collapsible>
    </div>
  )
}

function DashboardInsightsPanel() {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group -m-1 flex w-full items-center justify-between gap-4 rounded-lg p-1 text-start transition-colors hover:bg-background"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-lightsecondary text-secondary">
              <Icon icon="solar:chart-2-bold-duotone" width={20} height={20} />
            </span>
            <span>
              <span className="block text-base font-semibold text-dark dark:text-white">
                Insights
              </span>
              <span className="block text-sm text-muted-foreground">
                Sales heatmap, customer mix and vehicle trends
              </span>
            </span>
          </span>
          <Icon
            icon="solar:alt-arrow-down-outline"
            width={20}
            height={20}
            className={cn(
              'shrink-0 text-muted-foreground transition-transform duration-300',
              open && 'rotate-180',
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <LazyLoad height={300}>
              <HeatmapCard />
            </LazyLoad>
          </div>

          <div>
            <LazyLoad height={260}>
              <CustomerMixCard />
            </LazyLoad>
          </div>

          <div>
            <LazyLoad height={260}>
              <VehicleMakesCard />
            </LazyLoad>
          </div>

          <div>
            <LazyLoad height={260}>
              <TirePositionsCard />
            </LazyLoad>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/* ------------------------------- Sales heatmap ------------------------------ */

const HOUR_LABELS: { hour: number; label: string }[] = [
  { hour: 0, label: '12a' },
  { hour: 6, label: '6a' },
  { hour: 12, label: '12p' },
  { hour: 18, label: '6p' },
]

function HeatmapCard() {
  const { filter, filterKey, refreshKey } = useDashboardFilter()
  const query = useDashboardQuery({
    fetcher: (signal) => dashboardApi.getSalesHeatmap(filter, signal),
    deps: [filterKey, refreshKey],
  })

  return (
    <ChartCard title="Sales Heatmap" subtitle="Where the week's money flows, hour by hour">
      <WidgetState
        query={query}
        height={300}
        isEmpty={(cells) =>
          cells.length === 0 || cells.every((c) => !(c.netSales || 0) && !(c.invoiceCount || 0))
        }
        emptyMessage="No sales in this period"
      >
        {(cells) => <HeatmapGrid cells={cells} />}
      </WidgetState>
    </ChartCard>
  )
}

/** Fill a 7-ish × 24 grid: missing cells default to 0 (§3). Day-row order = first
 *  appearance in the API array (never re-sorted). Repeated dayNames (multi-week
 *  periods) are aggregated — sums across weeks for that day + hour. */
function buildGrid(cells: SalesHeatmapCell[]): {
  day: string
  slots: { netSales: number; invoiceCount: number }[]
}[] {
  const order: string[] = []
  const buckets = new Map<string, Map<number, { netSales: number; invoiceCount: number }>>()

  for (const cell of cells) {
    if (!buckets.has(cell.dayName)) {
      buckets.set(cell.dayName, new Map())
      order.push(cell.dayName)
    }
    const hours = buckets.get(cell.dayName)!
    const cur = hours.get(cell.hour) ?? { netSales: 0, invoiceCount: 0 }
    hours.set(cell.hour, {
      netSales: cur.netSales + (cell.netSales || 0),
      invoiceCount: cur.invoiceCount + (cell.invoiceCount || 0),
    })
  }

  return order.map((day) => {
    const hours = buckets.get(day)!
    const slots = Array.from({ length: 24 }, (_, hour) => hours.get(hour) ?? { netSales: 0, invoiceCount: 0 })
    return { day, slots }
  })
}

function heatStyle(pct: number): CSSProperties {
  return { '--heat-pct': `${pct.toFixed(0)}%` } as CSSProperties
}

function HeatmapGrid({ cells }: { cells: SalesHeatmapCell[] }) {
  const rows = buildGrid(cells)
  const max = Math.max(
    1,
    ...rows.flatMap((r) => r.slots.map((s) => s.netSales)),
  )
  // Peak slot for the sr-only summary.
  let peak: { day: string; hour: number; netSales: number; invoiceCount: number } | null = null
  for (const row of rows) {
    for (let hour = 0; hour < 24; hour++) {
      const s = row.slots[hour]
      if (s.netSales > 0 && (!peak || s.netSales > peak.netSales)) {
        peak = { day: row.day, hour, netSales: s.netSales, invoiceCount: s.invoiceCount }
      }
    }
  }

  return (
    <div className="overflow-hidden">
      <div className="flex gap-x-3">
        {/* Day labels stay fixed on the left while the 24 columns scroll on small screens. */}
        <ul className="w-16 shrink-0 space-y-1.5 sm:w-20" aria-hidden="true">
          {rows.map((row) => (
            <li
              key={row.day}
              className="flex h-6 items-center text-xs font-medium text-muted-foreground"
            >
              {row.day}
            </li>
          ))}
        </ul>

        <div className="min-w-0 flex-1 overflow-x-auto pb-1">
          {/* Hour columns header */}
          <div
            className="mb-1.5 grid h-6 items-center"
            style={{ gridTemplateColumns: 'repeat(24, minmax(10px, 1fr))' }}
            aria-hidden="true"
          >
            {Array.from({ length: 24 }, (_, hour) => {
              const marker = HOUR_LABELS.find((h) => h.hour === hour)
              return (
                <span key={hour} className="px-0.5 text-center text-[10px] text-muted-foreground">
                  {marker ? marker.label : ''}
                </span>
              )
            })}
          </div>

          <div className="space-y-1.5" role="img" aria-label="Sales heatmap by day and hour">
            {rows.map((row) => (
              <div
                key={row.day}
                className="grid h-6"
                style={{ gridTemplateColumns: 'repeat(24, minmax(10px, 1fr))', gap: '4px' }}
              >
                {row.slots.map((slot, hour) => {
                  const pct = slot.netSales > 0 ? (slot.netSales / max) * 100 : 0
                  return (
                    <span
                      key={hour}
                      className="heat-cell rounded-sm"
                      style={heatStyle(pct)}
                      title={
                        slot.netSales > 0 || slot.invoiceCount > 0
                          ? `${row.day} ${String(hour).padStart(2, '0')}:00 · ${formatCurrency(slot.netSales)} · ${formatNumber(slot.invoiceCount)} invoices`
                          : `${row.day} ${String(hour).padStart(2, '0')}:00 · no sales`
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-3">
        <span className="text-xs text-muted-foreground">Less</span>
        <span
          className="heat-legend h-2 w-28 rounded-full"
          aria-hidden="true"
        />
        <span className="text-xs text-muted-foreground">More</span>
      </div>

      <p className="sr-only">
        {peak
          ? `Peak sales: ${peak.day} ${String(peak.hour).padStart(2, '0')}:00 — ${formatCurrency(peak.netSales)} across ${formatNumber(peak.invoiceCount)} invoices.`
          : 'No sales recorded this period.'}{' '}
        {rows.length} day rows across 24 hours; empty cells are zero sales.
      </p>
    </div>
  )
}

/* -------------------------------- Customer mix ------------------------------- */

function CustomerMixCard() {
  const { filter, filterKey, refreshKey } = useDashboardFilter()
  const query = useDashboardQuery({
    fetcher: (signal) => dashboardApi.getCustomersMix(filter, signal),
    deps: [filterKey, refreshKey],
  })

  return (
    <ChartCard title="Customer Mix" subtitle="New vs returning customers">
      <WidgetState
        query={query}
        height={260}
        emptyMessage="No customers in this period"
      >
        {(mix) => <MixBars mix={mix} />}
      </WidgetState>
    </ChartCard>
  )
}

function MixBars({ mix }: { mix: CustomerMix }) {
  const customerTotal = mix.newCustomers + mix.returningCustomers
  const revenueTotal = mix.newCustomerRevenue + mix.returningCustomerRevenue
  const newSharePct = customerTotal > 0 ? (mix.newCustomers / customerTotal) * 100 : 0
  const revSharePct = revenueTotal > 0 ? (mix.newCustomerRevenue / revenueTotal) * 100 : 0

  return (
    <div className="space-y-5">
      <MixRow
        label="Customers"
        total={customerTotal}
        newShare={newSharePct}
      />
      <MixRow
        label="Revenue"
        total={revenueTotal}
        newShare={revSharePct}
        currency
      />

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
          New
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
          Returning
        </span>
      </div>

      <p className="sr-only">
        {formatNumber(mix.newCustomers)} new and {formatNumber(mix.returningCustomers)} returning
        customers ({formatPercent(newSharePct)} new);{' '}
        {formatCurrency(mix.newCustomerRevenue)} from new and {formatCurrency(mix.returningCustomerRevenue)}
        from returning customers.
      </p>
    </div>
  )
}

function MixRow({
  label,
  total,
  newShare,
  currency = false,
}: {
  label: string
  total: number
  newShare: number
  currency?: boolean
}) {
  const fmt = (v: number) => (currency ? formatCurrency(v) : formatNumber(v))
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-dark dark:text-white">{label}</p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {fmt(total)} total · {formatPercent(newShare)} new
        </p>
      </div>
      <div
        className="flex h-3 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-hidden="true"
      >
        <span
          className="h-full rounded-l-full"
          style={{ width: `${newShare}%`, backgroundColor: 'var(--color-primary)' }}
        />
        <span
          className="h-full flex-1 rounded-r-full"
          style={{ backgroundColor: 'var(--color-success)' }}
        />
      </div>
    </div>
  )
}

/* ------------------------------- Top vehicle makes ---------------------------- */

function VehicleMakesCard() {
  const { filter, filterKey, refreshKey } = useDashboardFilter()
  const query = useDashboardQuery({
    fetcher: (signal) => dashboardApi.getTopVehicleMakes({ top: 10, ...filter }, signal),
    deps: [filterKey, refreshKey],
  })

  return (
    <ChartCard title="Top Vehicle Makes" subtitle="Makes seen this period">
      <WidgetState
        query={query}
        height={260}
        emptyMessage="No vehicles in this period"
      >
        {(items) => <MakesBars items={items} />}
      </WidgetState>
    </ChartCard>
  )
}

function MakesBars({ items }: { items: NameValue[] }) {
  const theme = useChartTheme()
  const options: ChartOptions = {
    chart: {
      type: 'bar',
      height: 260,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
    },
    series: [{ name: 'Vehicles', data: items.map((i) => i.value) }],
    colors: ['var(--color-info)'],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '56%',
        borderRadius: 5,
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'around',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: items.map((i) => i.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { formatter: (v: number) => formatNumberAbbrev(v) },
    },
    yaxis: { labels: { style: { colors: theme.foreColor, fontSize: '12px' } } },
    grid: theme.grid,
    legend: { show: false },
    tooltip: {
      theme: theme.tooltipTheme,
      fillSeriesColor: false,
      y: {
        formatter: (value: number, opts: { dataPointIndex: number }) => {
          const item = items[opts.dataPointIndex]
          const share = Number.isFinite(item?.sharePercent) ? `  ·  ${formatPercent(item.sharePercent)} of period` : ''
          return `${formatNumber(value)} vehicles${share}`
        },
      },
    },
  }

  return (
    <div role="img" aria-label={`Top vehicle makes. ${items.map((i) => `${i.name}: ${formatNumber(i.value)}`).join(', ')}.`}>
      <ApexChart options={options} series={options.series} type="bar" height={260} width="100%" />
    </div>
  )
}

/* -------------------------------- Tire positions ------------------------------ */

type TireKey = 'leftFront' | 'rightFront' | 'leftRear' | 'rightRear'

const TIRE_LABELS: { key: TireKey; side: string; short: string }[] = [
  { key: 'leftFront', side: 'Left front', short: 'LF' },
  { key: 'rightFront', side: 'Right front', short: 'RF' },
  { key: 'leftRear', side: 'Left rear', short: 'LR' },
  { key: 'rightRear', side: 'Right rear', short: 'RR' },
]

function TirePositionsCard() {
  const { filter, filterKey, refreshKey } = useDashboardFilter()
  const query = useDashboardQuery({
    fetcher: (signal) => dashboardApi.getTirePositions(filter, signal),
    deps: [filterKey, refreshKey],
  })

  return (
    <ChartCard title="Tire Positions" subtitle="Sold units by wheel position">
      <WidgetState query={query} height={260} emptyMessage="No tire sales in this period">
        {(positions) => <TireDiagram positions={positions} />}
      </WidgetState>
    </ChartCard>
  )
}

function TireDiagram({ positions }: { positions: TirePositions }) {
  const cornerClass: Record<TireKey, string> = {
    leftFront: 'left-0 top-0 items-center',
    rightFront: 'right-0 top-0 items-center',
    leftRear: 'left-0 bottom-0 items-center',
    rightRear: 'right-0 bottom-0 items-center',
  }

  return (
    <div>
      <div className="relative mx-auto aspect-2/1 w-full max-w-md" role="img" aria-label="Positions viewed from the front of the vehicle">
        {/* Car body (viewed from above). */}
        <div className="absolute inset-x-8 inset-y-5 rounded-[1.75rem] border border-ld bg-muted/40" aria-hidden="true">
          <div className="absolute inset-x-0 top-[38%] border-t border-ld" aria-hidden="true" />
          <span
            className="absolute left-1/2 top-[26%] flex -translate-x-1/2 items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            aria-hidden="true"
          >
            <Icon icon="solar:direction-broken" width={12} height={12} />
            Front
          </span>
        </div>

        {TIRE_LABELS.map(({ key, side, short }) => (
          <div
            key={key}
            className={cn('absolute flex flex-col', cornerClass[key])}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-lightprimary text-[10px] font-bold text-primary">
              {short}
            </span>
            <span className="mt-1 text-center text-sm font-semibold tabular-nums text-dark dark:text-white">
              {formatNumber(positions[key])}
            </span>
            <span className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">
              {side}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground">
        {TIRE_LABELS.map(({ key, side }) => `${side} ${formatNumber(positions[key])}`).join(' · ')}
      </p>
    </div>
  )
}

export default Insights