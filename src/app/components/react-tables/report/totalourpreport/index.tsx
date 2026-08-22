'use client'

import React, { useCallback, useMemo, useState, useRef } from 'react'
import useSWR from 'swr'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Icon } from '@iconify/react/dist/iconify.js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AnimatedTableWrapper,
  AnimatedTableBody,
  AnimatedTableRow,
} from '@/app/components/animatedComponents/AnimatedTable'
import { getApiUrl, getFetcher } from '@/app/api/globalFetcher'
import {
  applyColumnFilters,
  ColumnFilterValue,
} from '@/app/components/react-tables/shared/columnFilterUtils'
import ColumnFilterInput from '@/app/components/react-tables/shared/ColumnFilterInput'
import CompanyInfoHeader from '@/app/components/react-tables/shared/CompanyInfoHeader'

/* ── Types ── */

interface TotalOurpRow {
  category: string
  total: number
}

/* ── Helpers ── */

const formatAmount = (value: number) => {
  if (value === null || value === undefined || isNaN(value)) return '0.00'
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/* ── Main Component ── */

export default function TotalOurpReport() {
  const printRef = useRef<HTMLDivElement>(null)

  /* ── Fetch data (no query parameters) ── */
  const { data: ourpData, isLoading, mutate } = useSWR<TotalOurpRow[]>(
    getApiUrl('/api/Reports/GetTotalOURP'),
    getFetcher,
    { refreshInterval: 0 }
  )

  const reportData = useMemo(
    () => (Array.isArray(ourpData) ? ourpData : []),
    [ourpData]
  )

  /* ── Table state ── */
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({})
  const [showSearch, setShowSearch] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    category: true,
    total: true,
  })

  const handleColumnFilterChange = (columnKey: string, value: ColumnFilterValue) => {
    setColumnFilters((prev) => ({ ...prev, [columnKey]: value }))
  }

  const handleClearAllFilters = () => {
    setColumnFilters({})
  }

  /* ── Column definitions ── */
  const columnHelper = createColumnHelper<TotalOurpRow>()

  const dashIfEmpty = (value: string | null | undefined) => {
    const trimmed = value?.trim()
    if (!trimmed) {
      return <span className='text-gray-300 dark:text-gray-600'>—</span>
    }
    return trimmed
  }

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('category', {
          header: 'Category',
          cell: (info) => <p className='text-sm font-medium'>{dashIfEmpty(info.getValue())}</p>,
        }),
        columnHelper.accessor('total', {
          header: 'Total',
          cell: (info) => (
            <p className='text-sm text-right font-medium'>{formatAmount(info.getValue())}</p>
          ),
        }),
      ] as ColumnDef<TotalOurpRow>[],
    []
  )

  /* ── Visible columns ── */
  const visibleColumns = useMemo(
    () =>
      columns.filter((col) => {
        if ('accessorKey' in col && typeof col.accessorKey === 'string') {
          return columnVisibility[col.accessorKey] !== false
        }
        return true
      }),
    [columns, columnVisibility]
  )

  /* ── Filter data ── */
  const filteredData = useMemo(
    () =>
      applyColumnFilters(
        reportData as unknown as Record<string, unknown>[],
        columnFilters
      ) as unknown as TotalOurpRow[],
    [reportData, columnFilters]
  )

  /* ── Table instance ── */
  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  })

  /* ── Column filter keys (string column only — total is numeric) ── */
  const filterableColumns = ['category']

  /* ── Show handler ── */
  const handleShow = () => {
    mutate()
  }

  /* ── Grand total ── */
  const grandTotal = useMemo(
    () => filteredData.reduce((sum, r) => sum + (r.total || 0), 0),
    [filteredData]
  )

  /* ═══════════════════════════════════════════════════════════
     PDF HELPERS
     ═══════════════════════════════════════════════════════════ */

  const buildPdf = async (): Promise<jsPDF | null> => {
    const node = printRef.current
    if (!node) return null

    const PAGE_WIDTH_PX = 816

    const wrapper = document.createElement('div')
    wrapper.style.position = 'fixed'
    wrapper.style.left = '-99999px'
    wrapper.style.top = '0'
    wrapper.style.width = `${PAGE_WIDTH_PX}px`
    wrapper.style.background = '#ffffff'
    document.body.appendChild(wrapper)

    const clone = node.cloneNode(true) as HTMLDivElement
    clone.style.width = `${PAGE_WIDTH_PX}px`
    clone.style.maxWidth = `${PAGE_WIDTH_PX}px`
    clone.style.minWidth = `${PAGE_WIDTH_PX}px`
    clone.style.boxSizing = 'border-box'
    wrapper.appendChild(clone)

    try {
      const dataUrl = await toPng(clone, {
        quality: 1.0,
        pixelRatio: 1,
        backgroundColor: '#ffffff',
        width: PAGE_WIDTH_PX,
        height: clone.scrollHeight,
        cacheBust: true,
      })

      const pdf = new jsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfHeight = (imgProps.height / imgProps.width) * pageWidth

      if (pdfHeight <= pageHeight) {
        pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pdfHeight)
      } else {
        const pageHeightInImg = pageHeight * (imgProps.width / pageWidth)
        let y = 0
        while (y < imgProps.height) {
          pdf.addImage(dataUrl, 'PNG', 0, -y, pageWidth, pdfHeight)
          y += pageHeightInImg
          if (y < imgProps.height) pdf.addPage()
        }
      }
      return pdf
    } catch (err) {
      console.error('PDF generation failed:', err)
      return null
    } finally {
      document.body.removeChild(wrapper)
    }
  }

  const handleDownloadPdf = async () => {
    const pdf = await buildPdf()
    if (!pdf) return
    pdf.save('Total_OURP_Report.pdf')
  }

  /* ═══════════════════════════════════════════════════════════
     EXCEL EXPORT
     ═══════════════════════════════════════════════════════════ */

  const handleExportExcel = useCallback(() => {
    const headers = ['Category', 'Total']
    const rows = filteredData.map((row) => [row.category, row.total])

    const BOM = '﻿'
    const csvContent =
      BOM +
      [
        headers.join(','),
        ...rows.map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Total_OURP_Report.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredData])

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <>
      <Card className='no-print'>
        <div className='p-4'>
          {/* ── Title + Toolbar ── */}
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5'>
            <h3 className='text-lg font-semibold text-dark dark:text-white mb-4 md:mb-0'>
              Preview - Total OURP Report
            </h3>
            <div className='flex flex-wrap items-center gap-1 md:gap-2'>
              {!showSearch ? (
                <Button
                  variant='ghostprimary'
                  onClick={() => setShowSearch(true)}
                  aria-label='Show search'
                  shape='pill'>
                  <Icon icon='solar:minimalistic-magnifer-line-duotone' width={18} height={18} />
                </Button>
              ) : (
                <Input
                  placeholder='Search...'
                  className='form-control! w-40 md:w-56'
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  onBlur={() => { if (!globalFilter) setShowSearch(false) }}
                  aria-label='Search report'
                />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghostprimary' shape='pill'>
                    <Icon icon='solar:settings-line-duotone' width={18} height={18} aria-label='Column visibility' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-48 p-2 shadow dark:shadow-white/20'>
                  {Object.keys(columnVisibility).map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col}
                      checked={columnVisibility[col]}
                      onCheckedChange={() =>
                        setColumnVisibility((prev) => ({ ...prev, [col]: !prev[col] }))
                      }
                      className='capitalize'>
                      {col}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant='ghostprimary'
                onClick={handleExportExcel}
                shape='pill'
                aria-label='Download CSV'>
                <Icon icon='solar:download-minimalistic-line-duotone' width={18} height={18} />
              </Button>

              {Object.keys(columnFilters).length > 0 && (
                <Button
                  variant='secondary'
                  onClick={handleClearAllFilters}
                  size='sm'
                  className='text-xs'>
                  <Icon icon='solar:close-circle-outline' width={16} height={16} className='me-1' />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* ── Filter Bar (no inputs — actions only) ── */}
          <div className='mb-4 rounded-lg border border-ld bg-lightprimary/10 p-4 dark:bg-darkinfo/5'>
            <div className='flex flex-wrap items-end gap-2'>
              <Button
                variant='default'
                size='sm'
                className='h-10 text-white [&_svg]:text-white'
                onClick={handleShow}>
                <Icon icon='solar:printer-linear' width={16} height={16} className='me-1.5' />
                Show
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='h-10' disabled={reportData.length === 0}>
                    <Icon icon='solar:download-linear' width={16} height={16} className='me-1.5 [&_svg]:text-current' />
                    Export
                    <Icon icon='solar:alt-arrow-down-linear' width={14} height={14} className='ms-1 [&_svg]:text-current' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-44 shadow dark:shadow-white/20'>
                  <DropdownMenuItem onClick={handleDownloadPdf} className='cursor-pointer'>
                    <Icon icon='solar:file-download-linear' width={18} height={18} className='me-2' />
                    PDF Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportExcel} className='cursor-pointer'>
                    <Icon icon='solar:document-text-linear' width={18} height={18} className='me-2' />
                    Excel Export
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <div className='border rounded-md border-ld overflow-hidden'>
              <AnimatedTableWrapper className='overflow-x-auto'>
                <table className='min-w-full w-full'>
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          const columnKey =
                            typeof (header.column.columnDef as any).accessorKey === 'string'
                              ? (header.column.columnDef as any).accessorKey
                              : header.column.id
                          const columnData =
                            columnKey && filterableColumns.includes(columnKey)
                              ? reportData.map((row: any) => row[columnKey])
                              : []
                          const isFilterable =
                            columnKey && filterableColumns.includes(columnKey)

                          return (
                            <th
                              key={header.id}
                              className='h-12 px-4 border-b border-ld text-left align-middle'>
                              {header.isPlaceholder ? null : (
                                <div className='inline-flex items-center gap-0.5'>
                                  {header.column.getCanSort() ? (
                                    <button
                                      type='button'
                                      onClick={header.column.getToggleSortingHandler()}
                                      className='inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white cursor-pointer select-none'>
                                      {flexRender(header.column.columnDef.header, header.getContext())}
                                      <Icon icon='solar:transfer-vertical-line-duotone' width={14} height={14} className='shrink-0' />
                                    </button>
                                  ) : (
                                    <span className='inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>
                                      {flexRender(header.column.columnDef.header, header.getContext())}
                                    </span>
                                  )}
                                  {isFilterable && (
                                    <ColumnFilterInput
                                      columnData={columnData}
                                      filterValue={columnFilters[columnKey] || undefined}
                                      onFilterChange={(value) => handleColumnFilterChange(columnKey, value)}
                                      columnName={String(header.column.columnDef.header || columnKey)}
                                    />
                                  )}
                                </div>
                              )}
                            </th>
                          )
                        })}
                      </tr>
                    ))}
                  </thead>
                  <AnimatedTableBody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={visibleColumns.length} className='text-center py-8'>Loading...</td>
                      </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={visibleColumns.length} className='text-center py-8'>No data found.</td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row, index) => (
                        <AnimatedTableRow
                          key={row.id}
                          index={index}
                          className='border-b last:border-b-0 border-ld hover:bg-lightprimary transition-colors duration-200'>
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className='px-4 py-2'>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </AnimatedTableRow>
                      ))
                    )}
                  </AnimatedTableBody>
                </table>
              </AnimatedTableWrapper>
            </div>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 0 && (
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3'>
              <div className='flex items-center gap-2'>
                <p className='text-sm text-muted dark:text-lightgray'>Show</p>
                <Select
                  value={String(table.getState().pagination.pageSize)}
                  onValueChange={(value) => table.setPageSize(Number(value))}>
                  <SelectTrigger className='w-fit' aria-label='Select rows per page'>
                    <SelectValue placeholder='Rows per page' />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={String(pageSize)}>{pageSize}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className='text-sm text-muted dark:text-lightgray'>per page</p>
              </div>
              <div className='flex items-center gap-3'>
                <div>
                  <p className='text-sm font-normal text-muted dark:text-lightgray'>
                    {table.getRowModel().rows.length > 0
                      ? `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min(
                          (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                          table.getFilteredRowModel().rows.length
                        )} of ${table.getFilteredRowModel().rows.length}`
                      : '0 of 0'}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Icon
                    icon='solar:arrow-left-line-duotone'
                    className={`text-dark dark:text-white hover:text-primary cursor-pointer ${table.getState().pagination.pageIndex === 0 ? 'opacity-50 cursor-not-allowed!' : ''}`}
                    width={20}
                    height={20}
                    onClick={() => table.previousPage()}
                  />
                  <span className='w-8 h-8 bg-lightprimary text-primary flex items-center justify-center rounded-md dark:bg-darkprimary dark:text-white text-sm font-normal'>
                    {table.getState().pagination.pageIndex + 1}
                  </span>
                  <Icon
                    icon='solar:arrow-right-line-duotone'
                    className={`text-dark dark:text-white hover:text-primary cursor-pointer ${table.getState().pagination.pageIndex + 1 === table.getPageCount() ? 'opacity-50 cursor-not-allowed!' : ''}`}
                    width={20}
                    height={20}
                    onClick={() => table.getState().pagination.pageIndex + 1 < table.getPageCount() && table.nextPage()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Hidden Print / PDF content ── */}
      <div className='no-print-same' style={{ position: 'absolute', left: '-99999px', top: 0 }}>
        <div
          ref={printRef}
          className='bg-white text-slate-900 p-4'
          style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", maxWidth: '8.5in', width: '816px' }}>
          <CompanyInfoHeader className='mb-4' />

          <div className='text-center mb-3'>
            <h2 className='text-lg font-bold text-slate-900 uppercase tracking-wide'>Total OURP Report</h2>
          </div>

          <table className='w-full text-xs border-collapse'>
            <thead>
              <tr className='bg-slate-100'>
                <th className='border border-slate-300 px-2 py-1.5 text-left font-semibold'>#</th>
                <th className='border border-slate-300 px-2 py-1.5 text-left font-semibold'>Category</th>
                <th className='border border-slate-300 px-2 py-1.5 text-right font-semibold'>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className='border border-slate-300 px-2 py-1'>{idx + 1}</td>
                  <td className='border border-slate-300 px-2 py-1'>{row.category || '—'}</td>
                  <td className='border border-slate-300 px-2 py-1 text-right font-medium'>{formatAmount(row.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className='bg-slate-100 font-bold'>
                <td className='border border-slate-300 px-2 py-1.5' colSpan={2}>Total</td>
                <td className='border border-slate-300 px-2 py-1.5 text-right'>{formatAmount(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .no-print, .no-print * { visibility: hidden !important; }
          .no-print-same, .no-print-same * { visibility: visible !important; }
          .no-print-same { position: static !important; left: auto !important; }
        }
      `}</style>
    </>
  )
}