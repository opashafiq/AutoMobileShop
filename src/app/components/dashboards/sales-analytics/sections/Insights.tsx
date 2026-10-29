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
import { previousPeriodQuery } from '../prior-period'
import { useDashboardQuery, type QueryState } from '../useDashboardQuery'
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
                  // §2: zero cells get a distinct neutral fill; nonzero cells
                  // ride a ramp with a visible floor (22%) so "barely any
                  // sales" never reads as "no data".
                  const isZero = !(slot.netSales > 0)
                  const pct = isZero ? 0 : 22 + (slot.netSales / max) * 78
                  return (
                    <span
                      key={hour}
                      className={cn('heat-cell rounded-sm', isZero && 'heat-cell-zero')}
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
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="heat-cell-zero h-2 w-2.5 rounded-sm" aria-hidden="true" />
          No sales
        </span>
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
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }} />
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
          style={{ backgroundColor: 'var(--color-secondary)' }}
        />
      </div>
    </div>
  )
}

/* ------------------------------- Top vehicle makes ---------------------------- */

function VehicleMakesCard() {
  const { filter, filterKey, refreshKey } = useDashboardFilter()
  const query = useDashboardQuery({
    fetcher: (signal) => dashboardApi.getTopVehicleMakes(filter, { top: 10 }, signal),
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
  // §5: largest first. §4: height follows the data volume — no vast empty
  // area under two bars, no cramping at ten.
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const height = Math.max(180, sorted.length * 34 + 60)

  const options: ChartOptions = {
    chart: {
      type: 'bar',
      height,
      toolbar: { show: false },
      fontFamily: theme.fontFamily,
      foreColor: theme.foreColor,
    },
    series: [{ name: 'Vehicles', data: sorted.map((i) => i.value) }],
    colors: ['var(--color-primary)'],
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
      categories: sorted.map((i) => i.name),
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
          const item = sorted[opts.dataPointIndex]
          const share = Number.isFinite(item?.sharePercent) ? `  ·  ${formatPercent(item.sharePercent)} of period` : ''
          return `${formatNumber(value)} vehicles${share}`
        },
      },
    },
  }

  return (
    <div role="img" aria-label={`Top vehicle makes. ${sorted.map((i) => `${i.name}: ${formatNumber(i.value)}`).join(', ')}.`}>
      <ApexChart options={options} series={options.series} type="bar" height={height} width="100%" />
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

  // Second fetch for the symmetric previous period — it only feeds the tooltip
  // trend lines, so it never holds the widget open: the diagram renders as soon
  // as the current period lands, and a failed/slow prior fetch degrades the
  // trend text to "no previous-period data" instead of an error card.
  const prior = previousPeriodQuery(filter)
  const priorQuery = useDashboardQuery({
    fetcher: (signal) =>
      prior
        ? dashboardApi.getTirePositions(prior, signal)
        : Promise.resolve<TirePositions | undefined>(undefined),
    deps: [filterKey, refreshKey],
  })

  // Merge into one WidgetState: the diagram gates on the CURRENT fetch only.
  const merged: QueryState<TirePositions> = {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    loadedAt: query.loadedAt,
    reload: query.reload,
  }

  return (
    <ChartCard title="Tire Positions" subtitle="Sold units by wheel position">
      <WidgetState query={merged} height={260} emptyMessage="No tire sales in this period">
        {(positions) => <TireDiagram positions={positions} previous={priorQuery.data} />}
      </WidgetState>
    </ChartCard>
  )
}

function TireDiagram({
  positions,
  previous,
}: {
  positions: TirePositions
  previous?: TirePositions
}) {
  // §5: top-down car outline, front at the top. Each tire is a bottom-anchored
  // meter whose fill height is that position's share of the period total —
  // anchored at zero, so it never exaggerates a near-tie the way a min-max
  // normalization would. A zero position stays an empty track so it can't be
  // mistaken for a low-but-real count.
  const entries = TIRE_LABELS.map(({ key, side, short }) => ({
    key,
    side,
    short,
    value: positions[key] ?? 0,
  }))
  const total = entries.reduce((sum, e) => sum + e.value, 0)
  const average = total / 4
  const leader = entries.reduce((best, e) => (e.value > best.value ? e : best), entries[0])
  const leaderGap = average > 0 ? ((leader.value - average) / average) * 100 : 0
  const frontTotal = (positions.leftFront ?? 0) + (positions.rightFront ?? 0)
  const rearTotal = (positions.leftRear ?? 0) + (positions.rightRear ?? 0)
  const leftTotal = (positions.leftFront ?? 0) + (positions.leftRear ?? 0)
  const rightTotal = (positions.rightFront ?? 0) + (positions.rightRear ?? 0)

  // Insight above repetition — the per-position numbers already sit beside
  // each tire; this line carries only the spread and the axle story.
  let caption = 'No tire sales in this period'
  if (total > 0) {
    const parts = [`${leader.side} is the busiest corner at ${formatNumber(leader.value)} units`]
    parts.push(
      leaderGap >= 0.1
        ? `top seller runs ${formatPercent(leaderGap)} above the position average`
        : 'sales are evenly spread across positions',
    )
    if (frontTotal > 0 && rearTotal > 0 && frontTotal !== rearTotal) {
      const stronger = frontTotal > rearTotal ? 'Front' : 'Rear'
      const weaker = stronger === 'Front' ? 'rear' : 'front'
      const skew = (Math.abs(frontTotal - rearTotal) / Math.min(frontTotal, rearTotal)) * 100
      parts.push(
        `${stronger.toLowerCase()} corners outsell ${weaker.toLowerCase()} by ${formatPercent(skew)}`,
      )
    }
    caption = parts.join(' · ')
  }

  const tireGeometry: Record<
    TireKey,
    { x: number; y: number; cx: number; labelX: number; labelAnchor: 'end' | 'start' }
  > = {
    leftFront: { x: 68, cx: 66, y: 52, labelX: 60, labelAnchor: 'end' },
    rightFront: { x: 218, cx: 254, y: 52, labelX: 260, labelAnchor: 'start' },
    leftRear: { x: 68, cx: 66, y: 152, labelX: 60, labelAnchor: 'end' },
    rightRear: { x: 218, cx: 254, y: 152, labelX: 260, labelAnchor: 'start' },
  }

  return (
    <div className="pb-1">
      <div
        className="mx-auto w-full max-w-lg"
        role="img"
        aria-label={`Top-down view of the vehicle, front at the top. Sold units by wheel position: ${TIRE_LABELS.map(
          ({ key, side }) => `${side} ${formatNumber(positions[key])}`,
        ).join(', ')}.`}
      >
        <svg viewBox="0 0 320 252" className="h-auto w-full">
          <defs>
            {entries.map(({ key }) => {
              const geo = tireGeometry[key]
              return (
                <clipPath key={key} id={`tire-clip-${key}`}>
                  <rect x={geo.x} y={geo.y} width={34} height={56} rx={9} />
                </clipPath>
              )
            })}
          </defs>

          {/* Direction cue + axle total — front of the vehicle at the top. */}
          <path
            d="M160 34 L160 24 M155 29 L160 24 L165 29"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-muted-foreground"
          />
          <text
            x="160"
            y="14"
            textAnchor="middle"
            className="fill-current text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground tabular-nums"
          >
            {`Front · ${formatNumber(frontTotal)}`}
          </text>

          {/* Car body viewed from above; solid axle lines join each wheel pair. */}
          <rect
            x="110"
            y="38"
            width="100"
            height="192"
            rx="30"
            className="fill-muted stroke-ld"
            fillOpacity={0.3}
            strokeWidth="1.5"
          />
          <line
            x1="102"
            y1="80"
            x2="218"
            y2="80"
            stroke="currentColor"
            strokeOpacity={0.5}
            strokeWidth="1.25"
            className="text-muted-foreground"
          />
          <line
            x1="102"
            y1="180"
            x2="218"
            y2="180"
            stroke="currentColor"
            strokeOpacity={0.5}
            strokeWidth="1.25"
            className="text-muted-foreground"
          />

          {/* Side totals (the rotated L/R labels double as side aggregates);
              front/rear direction cues carry the axle totals. */}
          <text
            x="14"
            y="130"
            textAnchor="middle"
            transform="rotate(-90 14 130)"
            className="fill-current text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground tabular-nums"
          >
            {`Left · ${formatNumber(leftTotal)}`}
          </text>
          <text
            x="306"
            y="130"
            textAnchor="middle"
            transform="rotate(90 306 130)"
            className="fill-current text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground tabular-nums"
          >
            {`Right · ${formatNumber(rightTotal)}`}
          </text>
          <text
            x="160"
            y="250"
            textAnchor="middle"
            className="fill-current text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground tabular-nums"
          >
            {`Rear · ${formatNumber(rearTotal)}`}
          </text>

          {entries.map(({ key, side, short, value }) => {
            const { x, cx, y, labelX, labelAnchor } = tireGeometry[key]
            const share = total > 0 ? (value / total) * 100 : 0
            const fillH = total > 0 ? 56 * (value / total) : 0
            const isLeader = key === leader.key && leaderGap >= 0.1

            // Trend vs the symmetric previous period, only when that data landed.
            const prevValue = previous?.[key]
            const delta = typeof prevValue === 'number' ? value - prevValue : undefined
            const deltaPct =
              typeof prevValue === 'number' && prevValue > 0
                ? ((value - prevValue) / prevValue) * 100
                : undefined
            const trendText =
              delta === undefined
                ? ' · no previous-period data'
                : ` · vs previous period: ${delta >= 0 ? '+' : ''}${formatNumber(delta)} (${
                    deltaPct === undefined
                      ? 'n/a'
                      : `${deltaPct >= 0 ? '+' : ''}${formatPercent(deltaPct)}`
                  })`

            // Top-seller gap badge — the gap is quantified (+X% vs the average)
            // so a small edge never reads as a meaningful one. White-on-primary
            // for contrast. Only when there is an actual spread to show.
            const badgeText = `+${formatPercent(leaderGap)} vs avg`
            const badgeWidth = badgeText.length * 4.9 + 12
            const badgeY = y === 52 ? 113 : 213

            return (
              <g key={key}>
                <title>{`${side}: ${formatNumber(value)} units, ${formatPercent(share)} of the period total${trendText}`}</title>
                {/* Track: borderless in every state — the outline was rendering
                    as a thin artifact line across the top of each tire. */}
                <rect
                  x={x}
                  y={y}
                  width={34}
                  height={56}
                  rx={9}
                  className="fill-current text-muted-foreground"
                  fillOpacity={0.15}
                />
                {/* Bottom-anchored fill = share of the period total, clipped to
                    the pill's rounded corners. */}
                {fillH > 0 && (
                  <g clipPath={`url(#tire-clip-${key})`}>
                    <rect
                      x={x}
                      y={y + 56 - fillH}
                      width={34}
                      height={fillH}
                      className="fill-current text-primary"
                      fillOpacity={0.8}
                    />
                  </g>
                )}
                <text
                  x={labelX}
                  y={y + 24}
                  textAnchor={labelAnchor}
                  className="fill-current text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {short}
                </text>
                <text
                  x={labelX}
                  y={y + 41}
                  textAnchor={labelAnchor}
                  className="fill-current text-sm font-bold tabular-nums text-dark dark:text-white"
                >
                  {formatNumber(value)}
                </text>
                {/* The position's share of the period total beneath the count. */}
                <text
                  x={labelX}
                  y={y + 55}
                  textAnchor={labelAnchor}
                  className="fill-current text-[10px] font-medium tabular-nums text-muted-foreground"
                >
                  {formatPercent(share)}
                </text>
                {isLeader && (
                  <g>
                    <rect
                      x={cx - badgeWidth / 2}
                      y={badgeY}
                      width={badgeWidth}
                      height={15}
                      rx={7.5}
                      className="fill-current text-primary"
                    />
                    <text
                      x={cx}
                      y={badgeY + 11}
                      textAnchor="middle"
                      className="fill-white text-[9px] font-semibold uppercase tracking-wide"
                    >
                      {badgeText}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground">{caption}</p>
    </div>
  )
}

export default Insights