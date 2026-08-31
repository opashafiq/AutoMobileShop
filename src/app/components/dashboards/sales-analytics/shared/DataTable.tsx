'use client'

import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  /** Column header (also used as the mobile card label). */
  header: string
  render: (row: T) => ReactNode
  /** Applied to both the desktop cell and the mobile value. */
  cellClassName?: string
  /** Desktop only — hide narrow columns on tablet, show under md in the stacked card anyway. */
  hideOnMobile?: boolean
  align?: 'end' | 'start'
}

/**
 * DataTable — renders a desktop table and stacked cards on mobile (§2.7).
 * Wide tables become stacked cards below `md`.
 */
export function DataTable<T>({
  columns,
  rows,
  keyField,
  rowClassName,
  mobileTitle,
  mobileSubtitle,
  emptyMessage = 'No records',
}: {
  columns: Column<T>[]
  rows: T[]
  keyField: (row: T) => string | number
  rowClassName?: (row: T) => string
  mobileTitle?: (row: T) => ReactNode
  mobileSubtitle?: (row: T) => ReactNode
  emptyMessage?: string
}) {
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden -m-1.5 overflow-x-auto md:block">
        <div className="min-w-full p-1.5 align-middle">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.header}
                    className={cn('whitespace-nowrap text-sm', col.align === 'end' && 'text-end')}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const key = keyField(row)
                return (
                  <TableRow
                    key={key}
                    className={cn('border-b border-ld transition-colors', rowClassName?.(row))}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.header}
                        className={cn('whitespace-nowrap text-sm', col.cellClassName, col.align === 'end' && 'text-end')}
                      >
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Stacked cards on mobile */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const key = keyField(row)
          return (
            <div
              key={key}
              className={cn('rounded-lg border border-ld p-3', rowClassName?.(row))}
            >
              {(mobileTitle || mobileSubtitle) && (
                <div className="mb-2">
                  {mobileTitle && <div className="text-sm font-semibold text-dark dark:text-white">{mobileTitle(row)}</div>}
                  {mobileSubtitle && <div className="mt-0.5 text-xs text-muted-foreground">{mobileSubtitle(row)}</div>}
                </div>
              )}
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {columns.map((col) => (
                  <div key={col.header} className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {col.header}
                    </dt>
                    <dd className={cn('mt-px break-words text-sm', col.cellClassName, col.align === 'end' && 'text-start')}>
                      {col.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default DataTable