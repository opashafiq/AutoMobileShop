'use client'

import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse, KpiValues } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { KpiCard } from '../shared/KpiCard'
import { SkeletonBlock } from '../shared/SkeletonBlock'
import { formatNumber } from '../format'

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

  const cards: {
    label: string
    value: number
    delta: number | null | undefined
    icon: string
    iconColorClass: string
    sub?: string
    tooltip?: string
    formatValue?: (v: number) => string
    inverted?: boolean
  }[] = [
    {
      label: 'Net Sales',
      value: current.netSales,
      delta: changePercent.netSales,
      icon: 'solar:wallet-money-bold-duotone',
      iconColorClass: 'bg-lightprimary text-primary',
    },
    {
      label: 'Invoices',
      value: current.invoiceCount,
      delta: changePercent.invoiceCount,
      icon: 'solar:receipt-2-bold-duotone',
      iconColorClass: 'bg-lightsecondary text-secondary',
      formatValue: formatNumber,
    },
    {
      label: 'Avg. Invoice',
      value: current.averageInvoiceValue,
      delta: changePercent.averageInvoice,
      icon: 'solar:bill-list-bold-duotone',
      iconColorClass: 'bg-lightsuccess text-success',
    },
    {
      label: 'Collected',
      value: current.collected,
      delta: changePercent.collected,
      icon: 'solar:card-bold-duotone',
      iconColorClass: 'bg-lightinfo text-info',
    },
    {
      label: 'Outstanding',
      value: current.outstanding,
      delta: changePercent.outstanding,
      icon: 'solar:clock-circle-bold-duotone',
      iconColorClass: 'bg-lighterror text-error',
      inverted: true, // unpaid dues rising is bad → renders red
    },
    {
      label: 'Gross Profit',
      value: current.grossProfit,
      delta: changePercent.grossProfit,
      icon: 'solar:chart-2-bold-duotone',
      iconColorClass: 'bg-lightprimary text-primary',
      sub: `${Number(current.marginPercent).toFixed(1)}% margin`,
      tooltip:
        'Estimated — based on current item cost, not cost at time of sale.',
    },
    {
      label: 'Items Sold',
      value: current.itemsSold,
      delta: changePercent.itemsSold,
      icon: 'solar:box-bold-duotone',
      iconColorClass: 'bg-lightsecondary text-secondary',
      formatValue: formatNumber,
    },
    {
      label: 'Customers',
      value: current.customerCount,
      delta: changePercent.customerCount,
      icon: 'solar:user-circle-bold-duotone',
      iconColorClass: 'bg-lightsuccess text-success',
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