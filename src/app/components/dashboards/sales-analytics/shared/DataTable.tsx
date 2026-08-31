'use client'

import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { Icon } from '@iconify/react'
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
  /**
   * Column header (also used as the mobile card label). Keep it a short
   * Title Case label matching the rest of the project ("Qty", "Unit Price",
   * "Invoice No") — no parenthetical units; let the cell values carry units.
   */
  header: string
  render: (row: T) => ReactNode
  /**
   * Fixed column width in px. The desktop layout is `table-fixed`, so every
   * column except the primary text column should declare a width generous
   * enough for its widest value (money ≈ 120) — numbers must never
   * ellipsize. Omit `width` on the primary text column and it absorbs the
   * remaining space; pair long text with `truncate` + `title` in `render`.
   */
  width?: number
  /** Applied to both the desktop cell and the mobile value. */
  cellClassName?: string
  align?: 'end' | 'start'
  /**
   * Value used for client-side sorting. Its presence makes the column
   * sortable — click toggles asc/desc. Headers stay plain text like the
   * rest of the project: the only arrow is the active sort indicator,
   * floated outside the label so activating a sort never shifts the header.
   * Coalesce nulls before returning (e.g. `row.total ?? 0`).
   */
  sortValue?: (row: T) => number | string
}

/**
 * DataTable — renders a desktop table and stacked cards on narrow screens.
 * Visual language follows the transaction tables (Transaction → Invoice):
 * uppercase letter-spaced muted headers in a bordered strip, airy rows with
 * light separators and a light-primary hover, values left-aligned.
 *
 * The desktop table is `table-fixed` with per-column widths, so it always
 * fills its card exactly — a horizontal scrollbar is impossible by
 * construction and headers stay pinned to their data; long text ellipsizes
 * (pair with `truncate` + `title` in the column render).
 *
 * - Columns with `sortValue` sort client-side. Every sortable header carries
 *   a faint ↑↓ affordance; the active sort column shows a primary-colored
 *   directional arrow instead.
 * - `detail` adds an expandable row beneath each table row (chevron in a
 *   leading column) so low-priority fields — phone numbers, payment method —
 *   stay out of the main grid. On mobile the detail renders inline at the
 *   bottom of the stacked card.
 */
export function DataTable<T>({
  columns,
  rows,
  keyField,
  rowClassName,
  mobileTitle,
  mobileSubtitle,
  detail,
  emptyMessage = 'No records',
}: {
  columns: Column<T>[]
  rows: T[]
  keyField: (row: T) => string | number
  rowClassName?: (row: T) => string
  mobileTitle?: (row: T) => ReactNode
  mobileSubtitle?: (row: T) => ReactNode
  detail?: (row: T) => ReactNode
  emptyMessage?: string
}) {
  const [sort, setSort] = useState<{ header: string; dir: 'asc' | 'desc' } | null>(null)
  const [expandedKey, setExpandedKey] = useState<string | number | null>(null)

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.header === sort.header)
    if (!col?.sortValue) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [rows, columns, sort])

  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  const toggleSort = (header: string) =>
    setSort((prev) =>
      prev?.header === header
        ? { header, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { header, dir: 'desc' },
    )

  const toggleExpand = (key: string | number) =>
    setExpandedKey((prev) => (prev === key ? null : key))

  return (
    <>
      {/* Desktop / laptop table — full card width, table-fixed so it can never overflow */}
      <div className="hidden -m-1.5 overflow-x-auto lg:block">
        <div className="min-w-full p-1.5 align-middle">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-y border-ld">
                {detail && <TableHead className="h-14 w-8 px-3" aria-label="Expand row" />}
                {columns.map((col) => {
                  const active = sort?.header === col.header
                  const end = col.align === 'end'
                  return (
                    <TableHead
                      key={col.header}
                      style={col.width != null ? { width: col.width } : undefined}
                      aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                      className={cn(
                        'h-14 whitespace-nowrap px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                        end && 'text-end',
                      )}
                    >
                      {col.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.header)}
                          className={cn(
                            'group inline-flex items-center gap-1 hover:text-primary',
                            active && 'text-dark dark:text-white',
                          )}
                        >
                          {col.header}
                          {/* Sort affordance on every sortable header: a faint ↑↓ pair
                              that becomes a primary-colored directional arrow on the
                              active column. */}
                          <Icon
                            icon={active ? (sort!.dir === 'asc' ? 'tabler:arrow-up' : 'tabler:arrow-down') : 'tabler:arrows-sort'}
                            width={14}
                            height={14}
                            className={cn(
                              'shrink-0',
                              active ? 'text-primary' : 'text-muted-foreground/40 group-hover:text-muted-foreground',
                            )}
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRows.map((row) => {
                const key = keyField(row)
                const isExpanded = detail != null && expandedKey === key
                return (
                  <Fragment key={key}>
                    <TableRow
                      className={cn(
                        'border-b border-ld transition-colors hover:bg-lightprimary/40',
                        rowClassName?.(row),
                      )}
                    >
                      {detail && (
                        <TableCell className="py-3.5 pl-3 pr-0">
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Hide row details' : 'Show row details'}
                            onClick={() => toggleExpand(key)}
                            className="text-muted-foreground transition-colors hover:text-primary"
                          >
                            <Icon
                              icon={isExpanded ? 'solar:alt-arrow-down-outline' : 'solar:alt-arrow-right-outline'}
                              width={16}
                              height={16}
                            />
                          </button>
                        </TableCell>
                      )}
                      {columns.map((col) => (
                        <TableCell
                          key={col.header}
                          className={cn('whitespace-nowrap px-4 py-3.5 text-sm', col.cellClassName, col.align === 'end' && 'text-end')}
                        >
                          {col.render(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                    {detail && isExpanded && (
                      <TableRow className="border-b border-ld hover:bg-inherit">
                        <TableCell colSpan={columns.length + 1} className="bg-muted/40 px-3 py-3">
                          {detail(row)}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Stacked cards on tablet / mobile */}
      <div className="space-y-3 lg:hidden">
        {sortedRows.map((row) => {
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
              {detail && (
                <div className="mt-2 border-t border-ld pt-2">{detail(row)}</div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default DataTable
