'use client'

/*
 * SalesDashboard — the page composition for the Sales & Inventory dashboard.
 *
 * One primary GET /api/dashboard/overview drives every section (§2.3); the six
 * lazy widgets (heatmap, customer mix, vehicle makes, tire positions, low stock,
 * dead stock) fire on scroll-into-view from within their own sections.
 *
 * Section A header (this file): business name, shared period selector (with a
 * debounced custom date range), branch dropdown fed from `salesByLocation`, and
 * a manual refresh that re-fires every active query through the filter context.
 */

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUser } from '@/app/context/UserContext'
import { cn } from '@/lib/utils'

import type { OverviewResponse, Period } from './types'
import { dashboardApi } from './dashboardApi'
import { useDashboardQuery, type QueryState } from './useDashboardQuery'
import {
  DashboardFilterProvider,
  PERIODS,
  useDashboardFilter,
} from './filter-context'
import { formatDate, formatTime } from './format'

import { KpiSection } from './sections/KpiCards'
import { SalesTrends } from './sections/SalesTrends'
import { PaymentAndDepartment } from './sections/PaymentAndDepartment'
import { TopProductsCustomers } from './sections/TopProductsCustomers'
import { BrandAndBranch } from './sections/BrandAndBranch'
import { InvoiceLists } from './sections/InvoiceLists'
import { InventoryHealth } from './sections/InventoryHealth'
import { Insights } from './sections/Insights'

export function SalesDashboard() {
  return (
    <DashboardFilterProvider>
      <DashboardPage />
    </DashboardFilterProvider>
  )
}

function DashboardPage() {
  const { filter, filterKey, refreshKey } = useDashboardFilter()

  const overview = useDashboardQuery<OverviewResponse>({
    fetcher: (signal) => dashboardApi.getOverview(filter, signal),
    deps: [filterKey, refreshKey],
  })

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader query={overview} />

      <KpiSection query={overview} />
      <SalesTrends query={overview} />
      <PaymentAndDepartment query={overview} />
      <TopProductsCustomers query={overview} />
      <BrandAndBranch query={overview} />
      <InvoiceLists query={overview} />
      <InventoryHealth query={overview} />

      <Card className="p-0">
        <Insights />
      </Card>
    </div>
  )
}

/* ------------------------------ Section A header ----------------------------- */

function DashboardHeader({ query }: { query: QueryState<OverviewResponse> }) {
  const { user } = useUser()
  const { filter, update, refresh } = useDashboardFilter()

  const periodLabel =
    PERIODS.find((p) => p.value === filter.period)?.label ?? filter.period
  const rangeLabel =
    filter.period === 'custom' && filter.from && filter.to
      ? `${formatDate(filter.from)} – ${formatDate(filter.to)}`
      : periodLabel

  const branches = query.data?.salesByLocation ?? []
  const branchValue = filter.locationId == null ? 'all' : String(filter.locationId)

  // "Updated at …" stamps only when a fresh overview actually lands — the hook
  // records `loadedAt` on each successful response (no state-in-effect needed).
  const lastRefreshed = query.loadedAt ?? null

  return (
    <Card className="no-print">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-lightprimary text-primary">
            <Icon icon="solar:chart-line-bold-duotone" width={22} height={22} />
          </span>
          <div>
            <h4 className="text-xl font-semibold text-dark dark:text-white">
              {user?.locationName || 'Sales & Inventory'}
            </h4>
            <p className="card-subtitle mt-0.5">{rangeLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Keyed by period so the draft date inputs re-initialise whenever the
              range is reset externally (switching to/from Custom sets defaults in
              `update()`). The user's own debounced commit leaves the drafts in
              sync, so the key stays stable mid-edit and focus is never lost. */}
          <DateRangeControls
            key={filter.period}
          />

          <Select
            value={filter.period}
            onValueChange={(v) => update({ period: v as Period })}
          >
            {/* whitespace-nowrap: "Custom Range" must stay on one line — a
                wrapped label is what makes the box taller than its neighbours. */}
            <SelectTrigger className="h-10 w-[170px] whitespace-nowrap" aria-label="Reporting period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={branchValue}
            onValueChange={(v) => update({ locationId: v === 'all' ? undefined : Number(v) })}
          >
            <SelectTrigger className="h-10 w-[168px] whitespace-nowrap" aria-label="Branch">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.filter((b) => b.id != null).map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghostsecondary"
            className="h-10 gap-1.5 px-3"
            onClick={refresh}
            aria-label="Refresh all data"
            title="Refresh all data"
          >
            <Icon
              icon="solar:refresh-broken"
              width={18}
              height={18}
              className={cn(query.isLoading && 'animate-spin')}
            />
          </Button>

          {lastRefreshed && (
            <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
              Updated {formatTime(lastRefreshed)}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

/**
 * Custom-range date pickers, committed to the shared filter 400 ms after a
 * change (§5.2). Same look and behaviour as the transaction pages' pickers
 * (outline button → Calendar popover, `dd/MM/yyyy` display) with the same
 * ISO `yyyy-MM-dd` value contract — no native browser date inputs.
 */
function DateRangeControls() {
  const { filter, update } = useDashboardFilter()
  const custom = filter.period === 'custom'

  // Drafts keep the picking responsive while the committed filter stays
  // debounced. The caller keys this component by `period`, so switching
  // to/from Custom remounts it with fresh initial drafts.
  const [from, setFrom] = useState(filter.from ?? '')
  const [to, setTo] = useState(filter.to ?? '')

  useEffect(() => {
    if (!custom) return
    const t = setTimeout(() => {
      update({ from: from || undefined, to: to || undefined })
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, custom])

  if (!custom) return null

  return (
    <div className="flex items-center gap-1.5">
      <DateButton label="From date" value={from} onChange={setFrom} />
      <span className="text-muted-foreground" aria-hidden="true">
        →
      </span>
      <DateButton label="To date" value={to} onChange={setTo} />
    </div>
  )
}

function toIso(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Calendar popover date button — mirrors the transaction/Layaway DateField. */
function DateButton({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(`${value}T00:00:00`) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-[148px] justify-start border-ld text-left font-normal text-ld"
          aria-label={label}
        >
          {selected ? (
            format(selected, 'dd/MM/yyyy')
          ) : (
            <span className="text-darklink">Pick a date</span>
          )}
          <Icon icon="solar:calendar-linear" width={16} height={16} className="ml-auto shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? toIso(date) : '')
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default SalesDashboard