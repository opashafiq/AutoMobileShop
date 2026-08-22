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
import DateField from '@/app/components/react-tables/shared/DateField'

/* ── Types ── */

interface CustomerRow {
  name: string
  emailAddress: string
  phone: string
}

/* ── Helper: format a yyyy-MM-dd string to dd-MMM-yyyy for the API ── */
function toApiDate(isoDate: string): string {
  if (!isoDate) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [yyyy, mm, dd] = isoDate.split('-')
  return `${dd}-${months[parseInt(mm, 10) - 1]}-${yyyy}`
}

/* ── Helper: format a Date to yyyy-MM-dd for native date input ── */
function toInputDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/* ── Helper: default date range — From = today, To = one month back ── */
function getDefaultDateRange(): { from: string; to: string } {
  const today = new Date()
  const oneMonthBack = new Date()
  oneMonthBack.setMonth(oneMonthBack.getMonth() - 1)
  return {
    from: toInputDate(today),
    to: toInputDate(oneMonthBack),
  }
}

/* ── Main Component ── */

export default function CustomerDetailsReport() {
  const printRef = useRef<HTMLDivElement>(null)

  /* ── Input draft state (not applied until Search is pressed) ── */
  const defaults = useMemo(() => getDefaultDateRange(), [])
  const [inputFrom, setInputFrom] = useState(defaults.from)
  const [inputTo, setInputTo] = useState(defaults.to)

  /* ── Applied query — only updates on Search / on first load. Null = not queried yet. ── */
  const [query, setQuery] = useState<{ from: string; to: string } | null>(() => ({
    from: defaults.from,
    to: defaults.to,
  }))

  /* ── Build API URL from the applied query (null key = no fetch) ── */
  const apiUrl = useMemo(() => {
    if (!query) return null
    const base = getApiUrl('/api/Reports/GetCustomerList')
    const params = new URLSearchParams()
    if (query.from) params.set('startDate', toApiDate(query.from))
    if (query.to) params.set('endDate', toApiDate(query.to))
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }, [query])

  /* ── Fetch data ── */
  const { data: customerData, isLoading } = useSWR<CustomerRow[]>(
    apiUrl,
    getFetcher,
    { refreshInterval: 0 }
  )

  const reportData = useMemo(
    () => (Array.isArray(customerData) ? customerData : []),
    [customerData]
  )

  /* ── Table state ── */
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({})
  const [showSearch, setShowSearch] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    name: true,
    emailAddress: true,
    phone: true,
  })

  const handleColumnFilterChange = (columnKey: string, value: ColumnFilterValue) => {
    setColumnFilters((prev) => ({ ...prev, [columnKey]: value }))
  }

  const handleClearAllFilters = () => {
    setColumnFilters({})
  }

  /* ── Column definitions ── */
  const columnHelper = createColumnHelper<CustomerRow>()

  /** Render a subtle gray dash for empty/blank string values */
  const dashIfEmpty = (value: string) => {
    const trimmed = value?.trim()
    if (!trimmed) {
      return <span className='text-gray-300 dark:text-gray-600'>—</span>
    }
    return trimmed
  }

  const columns = useMemo(
    () =>
      [
        columnHelper.accessor('name', {
          header: 'Customer Name',
          cell: (info) => <p className='text-sm font-medium'>{dashIfEmpty(info.getValue())}</p>,
        }),
        columnHelper.accessor('emailAddress', {
          header: 'Email',
          cell: (info) => <p className='text-sm'>{dashIfEmpty(info.getValue())}</p>,
        }),
        columnHelper.accessor('phone', {
          header: 'Phone',
          cell: (info) => <p className='text-sm'>{dashIfEmpty(info.getValue())}</p>,
        }),
      ] as ColumnDef<CustomerRow>[],
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
      ) as unknown as CustomerRow[],
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

  /* ── Column filter keys ── */
  const filterableColumns = ['name', 'emailAddress', 'phone']

  /* ── Search: apply the draft inputs to the query and fetch ── */
  const handleSearch = () => {
    setQuery({ from: inputFrom, to: inputTo })
  }

  /* ── Reset: clear every input (dates show "Pick a Date") and drop the query so no fetch fires ── */
  const handleReset = () => {
    setInputFrom('')
    setInputTo('')
    setQuery(null)
  }

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

  /** Show — open PDF in a new tab */
  const handlePrint = async () => {
    const pdf = await buildPdf()
    if (!pdf) return
    const blobUrl = pdf.output('bloburl')
    window.open(blobUrl, '_blank')
  }

  /** PDF Export — download */
  const handleDownloadPdf = async () => {
    const pdf = await buildPdf()
    if (!pdf) return
    pdf.save('Customer_Details_Report.pdf')
  }

  /* ═══════════════════════════════════════════════════════════
     EXCEL EXPORT
     ═══════════════════════════════════════════════════════════ */

  const handleExportExcel = useCallback(() => {
    const headers = ['Customer Name', 'Email', 'Phone']
    const rows = filteredData.map((row) => [
      row.name,
      row.emailAddress,
      row.phone,
    ])

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
    link.setAttribute('download', 'Customer_Details_Report.csv')
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
      {/* ── Data Table Card ── */}
      <Card className='no-print'>
        <div className='p-4'>
          {/* ── Title + Toolbar ── */}
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5'>
            <h3 className='text-lg font-semibold text-dark dark:text-white mb-4 md:mb-0'>
              Preview - Customer Details
            </h3>
            <div className='flex flex-wrap items-center gap-1 md:gap-2'>
              {/* Search */}
              {!showSearch ? (
                <Button
                  variant='ghostprimary'
                  onClick={() => setShowSearch(true)}
                  aria-label='Show search'
                  shape='pill'>
                  <Icon
                    icon='solar:minimalistic-magnifer-line-duotone'
                    width={18}
                    height={18}
                  />
                </Button>
              ) : (
                <Input
                  placeholder='Search...'
                  className='form-control! w-40 md:w-56'
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  onBlur={() => {
                    if (!globalFilter) setShowSearch(false)
                  }}
                  aria-label='Search report'
                />
              )}

              {/* Column visibility dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghostprimary' shape='pill'>
                    <Icon
                      icon='solar:settings-line-duotone'
                      width={18}
                      height={18}
                      aria-label='Column visibility'
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-48 p-2 shadow dark:shadow-white/20'>
                  {Object.keys(columnVisibility).map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col}
                      checked={columnVisibility[col]}
                      onCheckedChange={() =>
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [col]: !prev[col],
                        }))
                      }
                      className='capitalize'>
                      {col}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Download as CSV button */}
              <Button
                variant='ghostprimary'
                onClick={handleExportExcel}
                shape='pill'
                aria-label='Download CSV'>
                <Icon
                  icon='solar:download-minimalistic-line-duotone'
                  width={18}
                  height={18}
                />
              </Button>

              {/* Clear filters button */}
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

          {/* ── Filter Bar (Date pickers + action buttons) ── */}
          <div className='mb-4 rounded-lg border border-ld bg-lightprimary/10 p-4 dark:bg-darkinfo/5'>
            <div className='flex flex-wrap items-end gap-4'>
              <DateField label='From' value={inputFrom} onChange={setInputFrom} />
              <DateField label='To' value={inputTo} onChange={setInputTo} />
              <div className='flex items-end gap-2'>
                <Button
                  variant='default'
                  size='sm'
                  className='h-10 text-white [&_svg]:text-white'
                  onClick={handleSearch}>
                  <Icon icon='solar:minimalistic-magnifer-line-duotone' width={16} height={16} className='me-1.5' />
                  Search
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-10'
                  onClick={handleReset}>
                  <Icon icon='solar:refresh-linear' width={16} height={16} className='me-1.5' />
                  Reset
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-10'
                      disabled={reportData.length === 0}>
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
                                      {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                      <Icon
                                        icon='solar:transfer-vertical-line-duotone'
                                        width={14}
                                        height={14}
                                        className='shrink-0'
                                      />
                                    </button>
                                  ) : (
                                    <span className='inline-flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>
                                      {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                    </span>
                                  )}
                                  {isFilterable && (
                                    <ColumnFilterInput
                                      columnData={columnData}
                                      filterValue={columnFilters[columnKey] || undefined}
                                      onFilterChange={(value) =>
                                        handleColumnFilterChange(columnKey, value)
                                      }
                                      columnName={String(
                                        header.column.columnDef.header || columnKey
                                      )}
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
                        <td colSpan={visibleColumns.length} className='text-center py-8'>
                          Loading...
                        </td>
                      </tr>
                    ) : query === null ? (
                      <tr>
                        <td colSpan={visibleColumns.length} className='text-center py-8 text-muted dark:text-gray-500'>
                          Set filters and press Search to load data.
                        </td>
                      </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={visibleColumns.length} className='text-center py-8'>
                          No customers found for the selected date range.
                        </td>
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
                              className={`px-4 py-2 ${
                                cell.column.id === 'name' ? 'min-w-[200px]' : ''
                              }`}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
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
                      <SelectItem key={pageSize} value={String(pageSize)}>
                        {pageSize}
                      </SelectItem>
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
                    className={`text-dark dark:text-white hover:text-primary cursor-pointer ${
                      table.getState().pagination.pageIndex === 0
                        ? 'opacity-50 cursor-not-allowed!'
                        : ''
                    }`}
                    width={20}
                    height={20}
                    onClick={() => table.previousPage()}
                  />
                  <span className='w-8 h-8 bg-lightprimary text-primary flex items-center justify-center rounded-md dark:bg-darkprimary dark:text-white text-sm font-normal'>
                    {table.getState().pagination.pageIndex + 1}
                  </span>
                  <Icon
                    icon='solar:arrow-right-line-duotone'
                    className={`text-dark dark:text-white hover:text-primary cursor-pointer ${
                      table.getState().pagination.pageIndex + 1 === table.getPageCount()
                        ? 'opacity-50 cursor-not-allowed!'
                        : ''
                    }`}
                    width={20}
                    height={20}
                    onClick={() =>
                      table.getState().pagination.pageIndex + 1 < table.getPageCount() &&
                      table.nextPage()
                    }
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
          style={{
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            maxWidth: '8.5in',
            width: '816px',
          }}>
          {/* Company Header */}
          <CompanyInfoHeader className='mb-4' />

          {/* Report Title */}
          <div className='text-center mb-3'>
            <h2 className='text-lg font-bold text-slate-900 uppercase tracking-wide'>
              Customer Details
            </h2>
            {(query?.from || query?.to) && (
              <p className='text-sm text-slate-600 mt-1'>
                {query.from && <span>From: <strong>{toApiDate(query.from)}</strong></span>}
                {query.from && query.to && <span className='mx-2'>|</span>}
                {query.to && <span>To: <strong>{toApiDate(query.to)}</strong></span>}
              </p>
            )}
          </div>

          {/* Print Table */}
          <table className='w-full text-xs border-collapse'>
            <thead>
              <tr className='bg-slate-100'>
                <th className='border border-slate-300 px-2 py-1.5 text-left font-semibold'>#</th>
                <th className='border border-slate-300 px-2 py-1.5 text-left font-semibold'>Customer Name</th>
                <th className='border border-slate-300 px-2 py-1.5 text-left font-semibold'>Email</th>
                <th className='border border-slate-300 px-2 py-1.5 text-left font-semibold'>Phone</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className='border border-slate-300 px-2 py-1'>{idx + 1}</td>
                  <td className='border border-slate-300 px-2 py-1 font-medium'>{row.name || '—'}</td>
                  <td className='border border-slate-300 px-2 py-1'>{row.emailAddress || '—'}</td>
                  <td className='border border-slate-300 px-2 py-1'>{row.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className='bg-slate-100 font-bold'>
                <td className='border border-slate-300 px-2 py-1.5' colSpan={3}>
                  Total Customers
                </td>
                <td className='border border-slate-300 px-2 py-1.5'>
                  {filteredData.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print,
          .no-print * {
            visibility: hidden !important;
          }
          .no-print-same,
          .no-print-same * {
            visibility: visible !important;
          }
          .no-print-same {
            position: static !important;
            left: auto !important;
          }
        }
      `}</style>
    </>
  )
}
