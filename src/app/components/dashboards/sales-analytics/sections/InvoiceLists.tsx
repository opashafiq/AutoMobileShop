'use client'

import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse, RecentInvoice, TopOutstandingInvoice } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { DataTable, type Column } from '../shared/DataTable'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate, formatNumber } from '../format'

/**
 * Section G — Action lists, two columns (§3).
 * Left:  Outstanding Invoices — the age cell is coloured: green < 30 days,
 *        amber 30–60, red over 60.
 * Right: Recent Invoices — latest activity, NOT filtered by period.
 */
export function InvoiceLists({ query }: { query: QueryState<OverviewResponse> }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-6 col-span-12">
        <ChartCard title="Outstanding Invoices" subtitle="Unpaid money, oldest first">
          <WidgetState
            query={query}
            isEmpty={(o) => !o.topOutstanding?.length}
            height={340}
            emptyMessage="No outstanding invoices"
          >
            {(o) => <OutstandingTable items={o.topOutstanding} />}
          </WidgetState>
        </ChartCard>
      </div>

      <div className="lg:col-span-6 col-span-12">
        <ChartCard title="Recent Invoices" subtitle="Latest activity across all branches">
          <WidgetState
            query={query}
            isEmpty={(o) => !o.recentInvoices?.length}
            height={340}
            emptyMessage="No recent invoices"
          >
            {(o) => <RecentTable items={o.recentInvoices} />}
          </WidgetState>
        </ChartCard>
      </div>
    </div>
  )
}

function ageToneClass(age: number): string {
  if (age < 30) return 'text-success'
  if (age <= 60) return 'text-warning'
  return 'text-error'
}

function OutstandingTable({ items }: { items: TopOutstandingInvoice[] }) {
  const columns: Column<TopOutstandingInvoice>[] = [
    { header: 'Invoice #', render: (r) => <span className="font-medium text-primary">#{r.invoiceId}</span> },
    { header: 'Date', render: (r) => formatDate(r.invoiceDate) },
    { header: 'Customer', cellClassName: 'min-w-[160px]', render: (r) => (<div className="min-w-0"><p className="font-medium text-dark dark:text-white">{r.customerName}</p>{r.phone && <p className="text-xs text-muted-foreground">{r.phone}</p>}</div>) },
    { header: 'Total', align: 'end', render: (r) => <span className="tabular-nums">{formatCurrency(r.total)}</span> },
    { header: 'Paid', align: 'end', render: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.paid)}</span> },
    { header: 'Due', align: 'end', render: (r) => <span className="tabular-nums font-semibold text-error">{formatCurrency(r.due)}</span> },
    { header: 'Age', align: 'end', render: (r) => <span className={cn('tabular-nums font-medium', ageToneClass(r.ageInDays))}>{formatNumber(r.ageInDays)}d</span> },
  ]

  return (
    <DataTable<TopOutstandingInvoice>
      columns={columns}
      rows={items}
      keyField={(r) => r.invoiceId}
      mobileTitle={(r) => `#${r.invoiceId} · ${r.customerName}`}
      mobileSubtitle={(r) => formatDate(r.invoiceDate)}
      emptyMessage="No outstanding invoices"
    />
  )
}

function RecentTable({ items }: { items: RecentInvoice[] }) {
  const columns: Column<RecentInvoice>[] = [
    { header: 'Invoice #', render: (r) => <span className="font-medium text-primary">#{r.invoiceId}</span> },
    { header: 'Date', render: (r) => formatDate(r.invoiceDate) },
    { header: 'Customer', cellClassName: 'min-w-[160px]', render: (r) => (<div className="min-w-0"><p className="font-medium text-dark dark:text-white">{r.customerName}</p>{r.phone && <p className="text-xs text-muted-foreground">{r.phone}</p>}</div>) },
    { header: 'Items', align: 'end', render: (r) => <span className="tabular-nums">{formatNumber(r.lineCount)}</span> },
    { header: 'Total', align: 'end', render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.total)}</span> },
    {
      header: 'Paid',
      align: 'end',
      render: (r) => (
        <div className="text-end">
          <p className={cn('tabular-nums', r.paid >= r.total ? 'text-success' : 'font-medium text-warning')}>{formatCurrency(r.paid)}</p>
          {r.paymentInfo && <p className="text-xs text-muted-foreground">{r.paymentInfo}</p>}
        </div>
      ),
    },
  ]

  return (
    <DataTable<RecentInvoice>
      columns={columns}
      rows={items}
      keyField={(r) => r.invoiceId}
      mobileTitle={(r) => `#${r.invoiceId} · ${r.customerName}`}
      mobileSubtitle={(r) => formatDate(r.invoiceDate)}
      emptyMessage="No recent invoices"
    />
  )
}

export default InvoiceLists