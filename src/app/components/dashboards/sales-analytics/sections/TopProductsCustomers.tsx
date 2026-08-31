'use client'

import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse, TopCustomer, TopProduct } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { DataTable, type Column } from '../shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '../format'

/**
 * Section E — Two columns (§3).
 * Left:  Top 10 Products by Value. The stock column is the point: `stockOnHand`
 *        0 → red "Out of stock" badge, 1–4 → amber "Low" badge.
 * Right: Top 10 Customers. Rows with `outstanding > 0` are highlighted.
 */
export function TopProductsCustomers({ query }: { query: QueryState<OverviewResponse> }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-6 col-span-12">
        <ChartCard title="Top 10 Products by Value" subtitle="Highest-revenue items and what is left in stock">
          <WidgetState
            query={query}
            isEmpty={(o) => !o.topProducts?.length}
            height={360}
            emptyMessage="No product sales in this period"
          >
            {(o) => <ProductsTable items={o.topProducts} />}
          </WidgetState>
        </ChartCard>
      </div>

      <div className="lg:col-span-6 col-span-12">
        <ChartCard title="Top 10 Customers" subtitle="Highest-value customers this period">
          <WidgetState
            query={query}
            isEmpty={(o) => !o.topCustomers?.length}
            height={360}
            emptyMessage="No customers in this period"
          >
            {(o) => <CustomersTable items={o.topCustomers} />}
          </WidgetState>
        </ChartCard>
      </div>
    </div>
  )
}

function StockBadge({ stockOnHand }: { stockOnHand: number }) {
  if (stockOnHand <= 0) {
    return <Badge variant="lightError" className="text-[11px] uppercase tracking-wide">Out of stock</Badge>
  }
  if (stockOnHand <= 4) {
    return <Badge variant="lightWarning" className="text-[11px] uppercase tracking-wide">Low · {formatNumber(stockOnHand)}</Badge>
  }
  return <span className="text-sm font-medium">{formatNumber(stockOnHand)}</span>
}

function ProductsTable({ items }: { items: TopProduct[] }) {
  const columns: Column<TopProduct>[] = [
    {
      header: 'Product',
      cellClassName: 'min-w-[200px]',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="font-medium text-dark dark:text-white">{r.description}</p>
            {(r.brand || r.size) && (
              <p className="truncate text-xs text-muted-foreground">
                {[r.brand, r.size].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      ),
    },
    { header: 'Qty', align: 'end', render: (r) => <span className="tabular-nums">{formatNumber(r.quantity)}</span> },
    { header: 'Revenue', align: 'end', render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.revenue)}</span> },
    { header: 'Share', align: 'end', render: (r) => formatPercent(r.sharePercent) },
    { header: 'Stock', align: 'end', render: (r) => <StockBadge stockOnHand={r.stockOnHand} /> },
  ]

  return (
    <DataTable<TopProduct>
      columns={columns}
      rows={items}
      keyField={(r) => `${r.itemId ?? r.description}-${r.quantity}`}
      mobileTitle={(r) => r.description}
      mobileSubtitle={(r) => [r.brand, r.size].filter(Boolean).join(' · ')}
      rowClassName={(r) => (r.stockOnHand <= 0 ? 'bg-lighterror/25 md:bg-lighterror/15' : undefined)}
      emptyMessage="No product sales in this period"
    />
  )
}

function CustomersTable({ items }: { items: TopCustomer[] }) {
  const columns: Column<TopCustomer>[] = [
    {
      header: 'Name',
      cellClassName: 'min-w-[180px]',
      render: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-dark dark:text-white">{r.name}</p>
          {r.email && <p className="truncate text-xs text-muted-foreground">{r.email}</p>}
        </div>
      ),
    },
    {
      header: 'Phone',
      render: (r) => <span className="tabular-nums">{r.phone ?? '—'}</span>,
    },
    { header: 'Invoices', align: 'end', render: (r) => <span className="tabular-nums">{formatNumber(r.invoiceCount)}</span> },
    { header: 'Revenue', align: 'end', render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.revenue)}</span> },
    {
      header: 'Due',
      align: 'end',
      render: (r) =>
        r.outstanding > 0 ? (
          <span className="tabular-nums font-semibold text-error">{formatCurrency(r.outstanding)}</span>
        ) : (
          <span className="tabular-nums text-muted-foreground">{formatCurrency(r.outstanding)}</span>
        ),
    },
    { header: 'Last Visit', align: 'end', render: (r) => formatDate(r.lastPurchase) },
  ]

  return (
    <DataTable<TopCustomer>
      columns={columns}
      rows={items}
      keyField={(r) => `${r.name}-${r.phone ?? r.email ?? 'x'}`}
      mobileTitle={(r) => r.name}
      mobileSubtitle={(r) => r.phone ?? undefined}
      rowClassName={(r) => (r.outstanding > 0 ? 'bg-lighterror/25 md:bg-lighterror/15' : undefined)}
      emptyMessage="No customers in this period"
    />
  )
}

export default TopProductsCustomers