'use client'

import { useState } from 'react'
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
  const tiles = [
    { label: 'SKUs', value: formatNumber(inventory.skuCount), icon: 'solar:box-minimalistic-bold-duotone', tone: 'text-primary', bg: 'bg-lightprimary' },
    { label: 'Units', value: formatNumber(inventory.totalUnits), icon: 'solar:layers-bold-duotone', tone: 'text-secondary', bg: 'bg-lightsecondary' },
    { label: 'Stock Value', value: formatCurrency(inventory.stockValueAtCost), icon: 'solar:wallet-money-bold-duotone', tone: 'text-success', bg: 'bg-lightsuccess' },
    {
      label: 'Out of Stock',
      value: formatNumber(inventory.outOfStockCount),
      icon: 'solar:close-circle-bold-duotone',
      tone: out ? 'text-error' : 'text-success',
      bg: out ? 'bg-lighterror' : 'bg-lightsuccess',
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
      <StockListBody query={query} />
    </div>
  )
}

/* -------------------------------- Card 3 -------------------------------- */

function DeadStockList({ days }: { days: number }) {
  const { filter, filterKey, refreshKey } = useDashboardFilter()

  const query = useDashboardQuery({
    fetcher: (signal) =>
      dashboardApi.getDeadStock({ days, top: 20, locationId: filter.locationId }, signal),
    deps: [filterKey, refreshKey, days],
  })

  return (
    <div>
      <p className="mb-3 text-base font-semibold text-dark dark:text-white">
        {query.data ? formatCurrency(sumStockValue(query.data)) : formatCurrency(0)}{' '}
        <span className="text-sm font-normal text-muted-foreground">
          tied up in non-moving stock
        </span>
      </p>
      <StockListBody query={query} showDays />
    </div>
  )
}

function sumStockValue(rows: StockItem[]): number {
  return rows.reduce((sum, r) => sum + (r.stockValue || 0), 0)
}

/* ------------------------------ shared bits ------------------------------ */

/** List-level loading / empty / error handling for the lazy stock lists. */
function StockListBody({ query, showDays = false }: { query: QueryState<StockItem[]>; showDays?: boolean }) {
  if (query.isError) {
    return <ErrorState onRetry={query.reload} message={query.error?.message} />
  }
  if (query.data !== undefined) {
    if (query.data.length === 0) return <EmptyState message="No items in this range" />
    return <StockRows items={query.data} showDays={showDays} />
  }
  return <SkeletonRows rows={6} />
}

function StockRows({ items, showDays = false }: { items: StockItem[]; showDays?: boolean }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={`${item.itemId ?? item.description}`}
          className="flex items-center justify-between gap-3 border-b border-ld pb-2.5 last:border-0 last:pb-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-lightprimary text-primary">
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
            <p className="text-sm font-medium tabular-nums">{formatCurrency(item.stockValue)}</p>
            {showDays && item.daysSinceLastSale != null && (
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