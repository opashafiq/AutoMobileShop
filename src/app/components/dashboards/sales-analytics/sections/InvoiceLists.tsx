'use client'

import type { QueryState } from '../useDashboardQuery'
import type { OverviewResponse, RecentInvoice, TopOutstandingInvoice } from '../types'
import { WidgetState } from '../shared/WidgetState'
import { ChartCard } from '../shared/ChartCard'
import { DataTable, type Column } from '../shared/DataTable'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate, formatNumber } from '../format'

/**
 * Section G — Action lists (§3).
 * Outstanding Invoices: the age cell is coloured — green < 30 days, amber
 * 30–60, red over 60. Recent Invoices: latest activity, NOT filtered by
 * period. Both tables render full-width and stack — five money/date columns
 * need the room (half-width cards force horizontal scroll).
 */
export function InvoiceLists({ query }: { query: QueryState<OverviewResponse> }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <ChartCard title="Outstanding Invoices" subtitle="Unpaid money, oldest first">
          <WidgetState
            query={query}
            isEmpty={(o) => !o.topOutstanding?.length}
            height={340}
            emptyMessage="All invoices collected — nothing outstanding"
          >
            {(o) => <OutstandingTable items={o.topOutstanding} />}
          </WidgetState>
        </ChartCard>
      </div>

      <div className="col-span-12">
        <ChartCard title="Recent Invoices" subtitle="Latest activity across all branches">
          <WidgetState
            query={query}
            isEmpty={(o) => !o.recentInvoices?.length}
            height={340}
            emptyMessage="No invoices yet"
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
  // Total / Paid / Phone live in the row-detail expansion — Due is the action
  // figure (§3). Fixed column widths; the customer name absorbs the rest.
  const columns: Column<TopOutstandingInvoice>[] = [
    {
      header: 'Invoice No',
      width: 130,
      sortValue: (r) => r.invoiceId,
      render: (r) => <span className="font-medium text-primary">#{r.invoiceId}</span>,
    },
    {
      header: 'Date',
      width: 112,
      sortValue: (r) => r.invoiceDate,
      render: (r) => formatDate(r.invoiceDate),
    },
    {
      header: 'Customer',
      sortValue: (r) => r.customerName,
      render: (r) => (
        <span className="block truncate font-medium text-dark dark:text-white" title={r.customerName}>
          {r.customerName}
        </span>
      ),
    },
    {
      header: 'Due',
      width: 120,
      sortValue: (r) => r.due,
      render: (r) => <span className="tabular-nums font-semibold text-error">{formatCurrency(r.due)}</span>,
    },
    {
      header: 'Age',
      width: 64,
      sortValue: (r) => r.ageInDays,
      render: (r) => <span className={cn('tabular-nums font-medium', ageToneClass(r.ageInDays))}>{formatNumber(r.ageInDays)}d</span>,
    },
  ]

  return (
    <DataTable<TopOutstandingInvoice>
      columns={columns}
      rows={items}
      keyField={(r) => r.invoiceId}
      mobileTitle={(r) => `#${r.invoiceId} · ${r.customerName}`}
      mobileSubtitle={(r) => formatDate(r.invoiceDate)}
      emptyMessage="All invoices collected — nothing outstanding"
      detail={(r) => (
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</dt>
            <dd className="tabular-nums">{formatCurrency(r.total)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Paid</dt>
            <dd className="tabular-nums">{formatCurrency(r.paid)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Phone</dt>
            <dd className="tabular-nums">{r.phone ?? '—'}</dd>
          </div>
        </dl>
      )}
    />
  )
}

function RecentTable({ items }: { items: RecentInvoice[] }) {
  // Line count, payment method + phone move to the row-detail expansion (§3)
  // — the grid keeps the money columns the client scans for.
  const columns: Column<RecentInvoice>[] = [
    {
      header: 'Invoice No',
      width: 130,
      sortValue: (r) => r.invoiceId,
      render: (r) => <span className="font-medium text-primary">#{r.invoiceId}</span>,
    },
    {
      header: 'Date',
      width: 112,
      sortValue: (r) => r.invoiceDate,
      render: (r) => formatDate(r.invoiceDate),
    },
    {
      header: 'Customer',
      sortValue: (r) => r.customerName,
      render: (r) => (
        <span className="block truncate font-medium text-dark dark:text-white" title={r.customerName}>
          {r.customerName}
        </span>
      ),
    },
    {
      header: 'Total',
      width: 120,
      sortValue: (r) => r.total,
      render: (r) => <span className="tabular-nums font-medium">{formatCurrency(r.total)}</span>,
    },
    {
      header: 'Paid',
      width: 120,
      sortValue: (r) => r.paid,
      render: (r) => (
        <span className={cn('tabular-nums', r.paid >= r.total ? 'text-success' : 'font-medium text-warning')}>
          {formatCurrency(r.paid)}
        </span>
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
      emptyMessage="No invoices yet"
      detail={(r) => (
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Phone</dt>
            <dd className="tabular-nums">{r.phone ?? '—'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Payment method</dt>
            <dd>{r.paymentInfo ?? '—'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Items</dt>
            <dd className="tabular-nums">{formatNumber(r.lineCount)}</dd>
          </div>
        </dl>
      )}
    />
  )
}

export default InvoiceLists