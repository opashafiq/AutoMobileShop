'use client'

import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse, TopCustomer, TopProduct } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { DataTable, type Column } from '../shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '../format'

/**
 * Section E — Top 10 Products by Value, then Top 10 Customers.
 * The stock column is the point on products: `stockOnHand` 0 → red "Out"
 * badge, 1–4 → amber "Low" badge. Customer rows with `outstanding > 0` are
 * highlighted. Both tables render full-width and stack — a 5-column table
 * needs the room (half-width cards force horizontal scroll).
 */
export function TopProductsCustomers({ query }: { query: QueryState<OverviewResponse> }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
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

      <div className="col-span-12">
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
    return (
      <Badge variant="lightError" title="Out of stock" className="text-[11px] uppercase tracking-wide">
        Out
      </Badge>
    )
  }
  if (stockOnHand <= 4) {
    return (
      <Badge variant="lightWarning" title="Low stock" className="text-[11px] uppercase tracking-wide">
        Low · {formatNumber(stockOnHand)}
      </Badge>
    )
  }
  return <span className="text-sm font-medium">{formatNumber(stockOnHand)}</span>
}

/**
 * Brand/size parts that ADD information beyond the description. Most product
 * descriptions already spell out brand and size ("CELIMO PREVAIL A/T …
 * LT35-12.50-20"), so printing "brand · size" under them duplicates the line —
 * only the parts the description doesn't already contain are returned.
 */
function productSubline(r: TopProduct): string {
  const desc = r.description.toLowerCase()
  return [r.brand, r.size]
    .filter(Boolean)
    .filter((part) => !desc.includes(String(part).toLowerCase()))
    .join(' · ')
}

function ProductsTable({ items }: { items: TopProduct[] }) {
  // Mini-bar scale: relative to the biggest share in the list (§4).
  const maxShare = Math.max(1, ...items.map((r) => r.sharePercent))

  // Table layout is fixed (DataTable) — every column declares a width except
  // the product name, which absorbs the rest. Long names ellipsize with the
  // full text on hover.
  const columns: Column<TopProduct>[] = [
    {
      header: 'Product',
      sortValue: (r) => r.description,
      render: (r) => {
        const sub = productSubline(r)
        return (
          <div className="min-w-0">
            <p className="truncate font-medium text-dark dark:text-white" title={r.description}>
              {r.description}
            </p>
            {sub && (
              <p className="truncate text-xs text-muted-foreground" title={sub}>
                {sub}
              </p>
            )}
          </div>
        )
      },
    },
    {
      header: 'Qty',
      width: 80,
      sortValue: (r) => r.quantity,
      render: (r) => <span className="tabular-nums">{formatNumber(r.quantity)}</span>,
    },
    {
      header: 'Revenue',
      width: 120,
      sortValue: (r) => r.revenue,
      render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.revenue)}</span>,
    },
    {
      header: 'Share',
      width: 128,
      sortValue: (r) => r.sharePercent,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-muted md:block" aria-hidden="true">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.sharePercent / maxShare) * 100}%` }} />
          </span>
          <span className="tabular-nums">{formatPercent(r.sharePercent)}</span>
        </div>
      ),
    },
    {
      header: 'Stock',
      width: 88,
      sortValue: (r) => r.stockOnHand,
      render: (r) => <StockBadge stockOnHand={r.stockOnHand} />,
    },
  ]

  return (
    <DataTable<TopProduct>
      columns={columns}
      rows={items}
      keyField={(r) => `${r.itemId ?? r.description}-${r.quantity}`}
      mobileTitle={(r) => r.description}
      mobileSubtitle={(r) => productSubline(r)}
      rowClassName={(r) => (r.stockOnHand <= 0 ? 'bg-lighterror/25 md:bg-lighterror/15' : undefined)}
      emptyMessage="No product sales in this period"
    />
  )
}

function CustomersTable({ items }: { items: TopCustomer[] }) {
  // Phone lives in the row-detail expansion (§3). Fixed column widths — the
  // customer name absorbs the remaining space and ellipsizes when long.
  const columns: Column<TopCustomer>[] = [
    {
      header: 'Customer',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-dark dark:text-white" title={r.name}>
            {r.name}
          </p>
          {r.email && (
            <p className="truncate text-xs text-muted-foreground" title={r.email}>
              {r.email}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Invoices',
      width: 116,
      sortValue: (r) => r.invoiceCount,
      render: (r) => <span className="tabular-nums">{formatNumber(r.invoiceCount)}</span>,
    },
    {
      header: 'Revenue',
      width: 120,
      sortValue: (r) => r.revenue,
      render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.revenue)}</span>,
    },
    {
      header: 'Due',
      width: 120,
      sortValue: (r) => r.outstanding,
      render: (r) =>
        r.outstanding > 0 ? (
          <span className="tabular-nums font-semibold text-error">{formatCurrency(r.outstanding)}</span>
        ) : (
          <span className="tabular-nums text-muted-foreground">{formatCurrency(r.outstanding)}</span>
        ),
    },
    {
      header: 'Last Visit',
      width: 136,
      sortValue: (r) => r.lastPurchase ?? '',
      render: (r) => formatDate(r.lastPurchase),
    },
  ]

  return (
    <DataTable<TopCustomer>
      columns={columns}
      rows={items}
      keyField={(r) => `${r.name}-${r.phone ?? r.email ?? 'x'}`}
      mobileTitle={(r) => r.name}
      rowClassName={(r) => (r.outstanding > 0 ? 'bg-lighterror/25 md:bg-lighterror/15' : undefined)}
      emptyMessage="No customers in this period"
      detail={(r) => (
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Phone</dt>
            <dd className="tabular-nums">{r.phone ?? '—'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</dt>
            <dd className="break-words">{r.email ?? '—'}</dd>
          </div>
        </dl>
      )}
    />
  )
}

export default TopProductsCustomers