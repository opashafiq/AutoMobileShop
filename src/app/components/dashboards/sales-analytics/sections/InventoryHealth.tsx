'use client'

import { useState, type ReactNode } from 'react'
import { Icon } from '@iconify/react'
import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse, StockItem } from '../types'
import { dashboardApi } from '../dashboardApi'
import { useDashboardQuery } from '../useDashboardQuery'
import { useDashboardFilter } from '../filter-context'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { LazyLoad } from '../shared/LazyLoad'
import { EmptyState } from '../shared/EmptyState'
import { ErrorState } from '../shared/ErrorState'
import { SkeletonRows } from '../shared/SkeletonBlock'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '../format'

/**
 * Section H — Inventory Health, three cards across (§3).
 * Card 1: Stock Summary (from `overview.inventory` — part of the primary call).
 * Card 2: Low Stock — LAZY `GET /inventory/low-stock?threshold=&top=20`, with a
 *         threshold selector (4 / 10 / 20) that re-fires the call.
 * Card 3: Dead Stock — LAZY `GET /inventory/dead-stock?days=&top=20`, with a
 *         period selector (90 / 180 / 365) and a summed-value header figure.
 *
 * Selector state lives here (in the card headers, always visible) and flows
 * down into the lazy lists, which only mount once scrolled near the viewport —
 * so flipping the selector without ever scrolling the list still remembers.
 */
export function InventoryHealth({ query }: { query: QueryState<OverviewResponse> }) {
  const [threshold, setThreshold] = useState(4)
  const [days, setDays] = useState(180)

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <ChartCard title="Stock Summary" subtitle="Inventory at a glance">
        <WidgetState query={query} isEmpty={(o) => !o.inventory} height={360}>
          {(o) => <SummaryStats inventory={o.inventory} />}
        </WidgetState>
      </ChartCard>

      <ChartCard
        title="Low Stock"
        subtitle="Items below reorder level"
        action={
          <StockSelect
            value={threshold}
            onChange={setThreshold}
            options={[4, 10, 20]}
            optionLabel={(v) => `≤ ${v}`}
          />
        }
      >
        <LazyLoad height={360}>
          <LowStockList threshold={threshold} />
        </LazyLoad>
      </ChartCard>

      <ChartCard
        title="Dead Stock"
        subtitle="Non-moving inventory"
        action={
          <StockSelect
            value={days}
            onChange={setDays}
            options={[90, 180, 365]}
            optionLabel={(v) => `${v}d`}
          />
        }
      >
        <LazyLoad height={360}>
          <DeadStockList days={days} />
        </LazyLoad>
      </ChartCard>
    </div>
  )
}

/* -------------------------------- Card 1 -------------------------------- */

function SummaryStats({ inventory }: { inventory: OverviewResponse['inventory'] }) {
  const out = inventory.outOfStockCount > 0
  // One light-primary chip for the whole tile set (same rule as the KPI row) —
  // Solar bold-duotone glyphs blur into blobs at this size, so icons are
  // Tabler strokes. Colour stays semantic only: the Out-of-Stock chip turns
  // red when there is actually something out of stock.
  const tiles = [
    { label: 'SKUs', value: formatNumber(inventory.skuCount), icon: 'tabler:box', tone: 'text-primary', bg: 'bg-lightprimary' },
    { label: 'Units', value: formatNumber(inventory.totalUnits), icon: 'tabler:stack-2', tone: 'text-primary', bg: 'bg-lightprimary' },
    { label: 'Stock Value', value: formatCurrency(inventory.stockValueAtCost), icon: 'tabler:coin', tone: 'text-primary', bg: 'bg-lightprimary' },
    {
      label: 'Out of Stock',
      value: formatNumber(inventory.outOfStockCount),
      icon: 'tabler:alert-triangle',
      tone: out ? 'text-error' : 'text-primary',
      bg: out ? 'bg-lighterror' : 'bg-lightprimary',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-lg border border-ld p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.label}</p>
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', t.bg, t.tone)}>
              <Icon icon={t.icon} width={16} height={16} />
            </div>
          </div>
          <p className="mt-2 truncate text-xl font-semibold text-dark dark:text-white">{t.value}</p>
        </div>
      ))}
      {inventory.lowStockCount > 0 && (
        <p className="col-span-2 text-xs text-muted-foreground">
          {formatNumber(inventory.lowStockCount)} additional SKUs below the low-stock threshold.
        </p>
      )}
    </div>
  )
}

/* -------------------------------- Card 2 -------------------------------- */

function LowStockList({ threshold }: { threshold: number }) {
  const { filter, filterKey, refreshKey } = useDashboardFilter()

  const query = useDashboardQuery({
    fetcher: (signal) =>
      dashboardApi.getLowStock({ threshold, top: 20, locationId: filter.locationId }, signal),
    deps: [filterKey, refreshKey, threshold],
  })

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        {formatNumber(threshold)} or fewer units on hand
      </p>
      <StockListBody
        query={query}
        emptyMessage="Nothing below this threshold — stock levels are healthy"
        renderRows={(items) => <LowStockRows key={threshold} items={items} threshold={threshold} />}
      />
    </div>
  )
}

/* ------------------------------- severity ------------------------------- */

type StockSeverity = 'out' | 'critical' | 'low'

/** Red for out-of-stock / critical, amber for low (§3). */
const SEVERITY_META: Record<
  StockSeverity,
  { label: string; badge: 'lightError' | 'lightWarning'; bar: string }
> = {
  out: { label: 'Out of stock', badge: 'lightError', bar: 'bg-error' },
  critical: { label: 'Critical', badge: 'lightError', bar: 'bg-error' },
  low: { label: 'Low', badge: 'lightWarning', bar: 'bg-warning' },
}

function stockSeverity(quantity: number, threshold: number): StockSeverity {
  if (quantity <= 0) return 'out'
  if (quantity <= Math.max(1, Math.floor(threshold / 2))) return 'critical'
  return 'low'
}

/* -------------------------------- Card 3 -------------------------------- */

function DeadStockList({ days }: { days: number }) {
  const { filter, filterKey, refreshKey } = useDashboardFilter()

  const query = useDashboardQuery({
    fetcher: (signal) =>
      dashboardApi.getDeadStock({ days, top: 20, locationId: filter.locationId }, signal),
    deps: [filterKey, refreshKey, days],
  })

  const rows = query.data
  // §3: implausible per-SKU values (e.g. $10M for one tire) are flagged for
  // review — never silently altered. The header total gets an asterisk when
  // flagged rows are in the current page, since they inflate the sum.
  const flagged = rows?.filter((r) => isImplausibleStockValue(r)) ?? []

  return (
    <div>
      <p className="mb-3 text-base font-semibold text-dark dark:text-white">
        {rows ? formatCurrency(sumStockValue(rows)) : formatCurrency(0)}
        {flagged.length > 0 && <span className="text-warning"> *</span>}{' '}
        <span className="text-sm font-normal text-muted-foreground">
          tied up in non-moving stock
        </span>
      </p>
      <StockListBody
        query={query}
        emptyMessage="Everything has moved in this window"
        renderRows={(items) => <DeadStockRows key={days} items={items} />}
      />
      {flagged.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 rounded-md bg-lightwarning/60 p-2.5 text-xs leading-relaxed text-warning">
          <Icon icon="solar:danger-triangle-bold" width={14} height={14} className="mt-px shrink-0" />
          <span>
            {formatNumber(flagged.length)} value{flagged.length > 1 ? 's' : ''} flagged: stock value is far
            larger than units × unit cost — likely a backend calculation error. Verify before acting on
            the total.
          </span>
        </p>
      )}
    </div>
  )
}

function sumStockValue(rows: StockItem[]): number {
  return rows.reduce((sum, r) => sum + (r.stockValue || 0), 0)
}

/**
 * Audit heuristic for dead-stock values (§3): a single SKU's stock value
 * should never be an order of magnitude above units × unit cost, nor hit
 * seven-figure territory in a tire shop. Flags — does not change — the value.
 */
function isImplausibleStockValue(item: StockItem): boolean {
  const expected = item.unitCost * item.quantity
  if (expected > 0) return item.stockValue > expected * 10
  return item.stockValue > 1_000_000
}

/* ------------------------------ shared bits ------------------------------ */

/** Rows shown before a stock list collapses behind its "Show more" toggle. */
const INITIAL_VISIBLE = 5

/**
 * Inline "Show N more / Show less" for the stock lists. These are fixed
 * top-20 snapshots from the API — pagination would imply depth that isn't
 * there, so the tail reveals in place, keeping the cards compact at rest.
 */
function RevealToggle({
  total,
  expanded,
  onToggle,
}: {
  total: number
  expanded: boolean
  onToggle: () => void
}) {
  if (total <= INITIAL_VISIBLE) return null
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
    >
      {expanded ? 'Show less' : `Show ${total - INITIAL_VISIBLE} more`}
      <Icon
        icon={expanded ? 'solar:alt-arrow-up-outline' : 'solar:alt-arrow-down-outline'}
        width={14}
        height={14}
        aria-hidden="true"
      />
    </button>
  )
}

/** List-level loading / empty / error handling for the lazy stock lists. */
function StockListBody({
  query,
  emptyMessage,
  renderRows,
}: {
  query: QueryState<StockItem[]>
  emptyMessage: string
  renderRows: (items: StockItem[]) => ReactNode
}) {
  if (query.isError) {
    return <ErrorState onRetry={query.reload} message={query.error?.message} />
  }
  if (query.data !== undefined) {
    if (query.data.length === 0) return <EmptyState message={emptyMessage} />
    return <>{renderRows(query.data)}</>
  }
  return <SkeletonRows rows={6} />
}

/**
 * Low Stock as a compact severity-coloured bar strip (§3/§4): each row shows
 * remaining units as a bar relative to the largest count in the list, so the
 * most urgent items read at a glance.
 */
function LowStockRows({ items, threshold }: { items: StockItem[]; threshold: number }) {
  const maxQty = Math.max(1, ...items.map((i) => i.quantity))
  // Collapsed by default — first 5 rows, the tail behind "Show more".
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, INITIAL_VISIBLE)

  return (
    <div>
      <ul className="space-y-3.5">
        {visible.map((item) => {
        const meta = SEVERITY_META[stockSeverity(item.quantity, threshold)]
        // Keep >0 bars visible even for tiny counts (mirrors the heatmap floor).
        const width = item.quantity <= 0 ? 0 : Math.max(8, (item.quantity / maxQty) * 100)
        return (
          <li
            key={`${item.itemId ?? item.description}`}
            className="border-b border-ld pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-dark dark:text-white">{item.description}</p>
              <Badge variant={meta.badge} className="shrink-0 text-[11px] uppercase tracking-wide">
                {meta.label}
              </Badge>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <span className={cn('block h-full rounded-full', meta.bar)} style={{ width: `${width}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {[item.brand, item.size].filter(Boolean).join(' · ') || '—'} · {formatNumber(item.quantity)} on hand
            </p>
          </li>
        )
      })}
      </ul>
      <RevealToggle
        total={items.length}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
    </div>
  )
}

function DeadStockRows({ items }: { items: StockItem[] }) {
  // Collapsed by default — first 5 rows, the tail behind "Show more".
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, INITIAL_VISIBLE)

  return (
    <div>
      <ul className="space-y-3">
        {visible.map((item) => (
        <li
          key={`${item.itemId ?? item.description}`}
          className="flex items-center justify-between gap-3 border-b border-ld pb-2.5 last:border-0 last:pb-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon icon="solar:box-bold-duotone" width={16} height={16} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-dark dark:text-white">{item.description}</p>
              <p className="text-xs text-muted-foreground">
                {[item.brand, item.size].filter(Boolean).join(' · ') || '—'} · {formatNumber(item.quantity)} units
              </p>
            </div>
          </div>
          <div className="shrink-0 text-end">
            <p className="flex items-center justify-end gap-1.5 text-sm font-medium tabular-nums">
              {formatCurrency(item.stockValue)}
              {isImplausibleStockValue(item) && <AuditFlag item={item} />}
            </p>
            {item.daysSinceLastSale != null && (
              <p
                className={cn(
                  'text-xs tabular-nums',
                  item.daysSinceLastSale > 180
                    ? 'text-error'
                    : item.daysSinceLastSale > 90
                      ? 'text-warning'
                      : 'text-muted-foreground',
                )}
              >
                no sale {formatNumber(item.daysSinceLastSale)}d
              </p>
            )}
          </div>
        </li>
      ))}
      </ul>
      <RevealToggle
        total={items.length}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
    </div>
  )
}

/** Amber "Audit" chip explaining why the flagged value is suspect. */
function AuditFlag({ item }: { item: StockItem }) {
  const expected = item.unitCost * item.quantity
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex cursor-help items-center gap-0.5 rounded bg-lightwarning px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-warning"
            role="note"
            aria-label="Value flagged for audit"
          >
            <Icon icon="solar:danger-triangle-bold" width={11} height={11} />
            Audit
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <p className="text-xs font-normal leading-relaxed">
            Flagged for review: stock value {formatCurrency(item.stockValue)} vs {formatNumber(item.quantity)} ×{' '}
            {formatCurrency(item.unitCost)} = {formatCurrency(expected)}. Likely a unit-price or decimal
            error in the backend — verify before trusting this figure.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function StockSelect({
  value,
  onChange,
  options,
  optionLabel,
}: {
  value: number
  onChange: (v: number) => void
  options: number[]
  optionLabel: (v: number) => string
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className="w-24" aria-label="Select a range">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={String(opt)}>
            {optionLabel(opt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default InventoryHealth