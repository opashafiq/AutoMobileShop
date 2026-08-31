'use client'

import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse, KpiValues } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { KpiCard } from '../shared/KpiCard'
import { SkeletonBlock } from '../shared/SkeletonBlock'
import { formatNumber, formatPercent } from '../format'

/**
 * Section B — KPI cards (§3). 8 cards, 4 across on desktop; a horizontally
 * scrollable strip on mobile (§2.7).
 * Source: `overview.kpi`.
 */
export function KpiSection({ query }: { query: QueryState<OverviewResponse> }) {
  return (
    <WidgetState
      query={query}
      isEmpty={(o) => allKpiZero(o.kpi?.current)}
      height={132}
      loading={<KpiSkeleton />}
      emptyMessage="No sales in this period"
    >
      {(overview) => <KpiGrid kpi={overview.kpi} />}
    </WidgetState>
  )
}

function allKpiZero(k: KpiValues | undefined): boolean {
  if (!k) return true
  return (
    k.netSales === 0 &&
    k.invoiceCount === 0 &&
    k.collected === 0 &&
    k.grossProfit === 0 &&
    k.itemsSold === 0 &&
    k.customerCount === 0 &&
    k.outstanding === 0
  )
}

function KpiGrid({ kpi }: { kpi: OverviewResponse['kpi'] }) {
  const { current, changePercent } = kpi

  // §1: one accent treatment for the whole row — every card uses KpiCard's
  // default light-primary chip, so the row reads as one KPI band. Icons are
  // Tabler stroke glyphs chosen for instant recognition (dollar = sales,
  // file-invoice = invoices, package = items, users = customers) — no
  // duotone/filled shapes that blur into blobs at 20px.
  const cards: {
    label: string
    value: number
    delta: number | null | undefined
    icon: string
    sub?: string
    tooltip?: string
    formatValue?: (v: number) => string
    inverted?: boolean
  }[] = [
    {
      label: 'Net Sales',
      value: current.netSales,
      delta: changePercent.netSales,
      icon: 'tabler:currency-dollar',
    },
    {
      label: 'Invoices',
      value: current.invoiceCount,
      delta: changePercent.invoiceCount,
      icon: 'tabler:file-invoice',
      formatValue: formatNumber,
    },
    {
      label: 'Avg. Invoice',
      value: current.averageInvoiceValue,
      delta: changePercent.averageInvoice,
      icon: 'tabler:receipt-2',
    },
    {
      label: 'Collected',
      value: current.collected,
      delta: changePercent.collected,
      icon: 'tabler:credit-card',
    },
    {
      label: 'Outstanding',
      value: current.outstanding,
      delta: changePercent.outstanding,
      icon: 'tabler:clock',
      inverted: true, // unpaid dues rising is bad → renders red
    },
    {
      label: 'Gross Profit',
      value: current.grossProfit,
      delta: changePercent.grossProfit,
      icon: 'tabler:chart-line',
      sub: `${formatPercent(current.marginPercent)} margin`,
      tooltip:
        'Estimated — based on current item cost, not cost at time of sale.',
    },
    {
      label: 'Items Sold',
      value: current.itemsSold,
      delta: changePercent.itemsSold,
      icon: 'tabler:package',
      formatValue: formatNumber,
    },
    {
      label: 'Customers',
      value: current.customerCount,
      delta: changePercent.customerCount,
      icon: 'tabler:users',
      formatValue: formatNumber,
    },
  ]

  return (
    <div
      aria-label="Key performance indicators"
      className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 py-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:py-0 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <div key={card.label} className="min-w-[230px] snap-start md:min-w-0">
          <KpiCard {...card} />
        </div>
      ))}
    </div>
  )
}

/** Skeleton replicating the KPI grid while the overview loads. */
export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg">
          <div className="flex items-center justify-between">
            <SkeletonBlock height={14} className="w-1/2 bg-muted/80" />
            <SkeletonBlock height={36} className="w-9" />
          </div>
          <SkeletonBlock height={28} className="w-2/3 bg-muted/80" />
        </div>
      ))}
    </div>
  )
}

export default KpiSection