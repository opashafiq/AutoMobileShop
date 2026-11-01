'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import jsPDF from 'jspdf'
import { format as formatDateFn } from 'date-fns'
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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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

/* ═══════════════════════════════════════════════════════════
   REPORT REGISTRY
   One entry per radio option on the Transaction Reports page.
   New reports are added here; everything below renders off the
   active definition so future reports only need a new entry,
   a column config and a URL builder branch.
   ═══════════════════════════════════════════════════════════ */

interface ReportDef {
  key: string
  /** Radio label shown in the filter bar */
  label: string
  /** Whether the report already has a working endpoint */
  implemented: boolean
  /** Date inputs to show in the filter bar */
  dateMode: 'single' | 'range' | 'none'
  /** Title printed on the PDF */
  pdfTitle?: string
  /** Base name for the PDF / Excel download files */
  fileBase?: string
}

const REPORTS: ReportDef[] = [
  {
    key: 'daily',
    label: 'Daily Report',
    implemented: true,
    dateMode: 'single',
    pdfTitle: 'Daily Report',
    fileBase: 'Daily_Report',
  },
  {
    key: 'dailyRange',
    label: 'Daily Report (Date Range)',
    implemented: false,
    dateMode: 'range',
  },
  {
    key: 'weeklyMonthly',
    label: 'Weekly/Monthly Report',
    implemented: false,
    dateMode: 'range',
  },
  {
    key: 'checkRegister',
    label: 'Check Register',
    implemented: false,
    dateMode: 'range',
  },
  {
    key: 'invoiceData',
    label: 'Invoice Data',
    implemented: false,
    dateMode: 'range',
  },
  {
    key: 'onCredit',
    label: 'On Credit',
    implemented: false,
    dateMode: 'range',
  },
]

/* ── Column configuration (data-driven so later reports can reuse it) ── */

interface ColumnConfig {
  key: string
  header: string
  type: 'text' | 'number' | 'currency'
  /** Show the funnel column filter in the table header */
  filterable?: boolean
  /** Minimum width in pixels for the cell */
  minWidth?: number
}

const DAILY_COLUMNS: ColumnConfig[] = [
  { key: 'categoryName', header: 'Description', type: 'text', filterable: true, minWidth: 250 },
  { key: 'totalAmount', header: 'Amount', type: 'currency', filterable: true },
  { key: 'paydate', header: 'Pay Date', type: 'text', filterable: true },
]

/* ── Types ── */

type ReportRow = Record<string, string | number>

interface AppliedQuery {
  from: string
  to: string
}

/* ── Helpers ── */

function toApiDate(isoDate: string): string {
  if (!isoDate) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [yyyy, mm, dd] = isoDate.split('-')
  return `${dd}-${months[parseInt(mm, 10) - 1]}-${yyyy}`
}

function toLongDate(isoDate: string): string {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  return formatDateFn(date, 'MMMM dd, yyyy')
}

function toInputDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatMoney(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const dash = <span className='text-gray-300 dark:text-gray-600'>—</span>

/* ── Main Component ── */

export default function TransactionReports() {
  const printRef = useRef<HTMLDivElement>(null)

  /* ── Active report (first radio selected by default) ── */
  const [activeKey, setActiveKey] = useState(REPORTS[0].key)
  const activeReport = useMemo(
    () => REPORTS.find((r) => r.key === activeKey) ?? REPORTS[0],
    [activeKey]
  )
  const activeColumns = useMemo(
    () => (activeReport.key === 'daily' ? DAILY_COLUMNS : []),
    [activeReport]
  )

  /* ── Date inputs (single date for Daily Report; range kept for later reports) ── */
  const today = useMemo(() => toInputDate(new Date()), [])
  const [inputFrom, setInputFrom] = useState(today)
  const [inputTo, setInputTo] = useState(today)

  /* ── Applied query — only updates on Show / first load. Null = not queried yet ── */
  const [query, setQuery] = useState<AppliedQuery | null>(() => ({
    from: today,
    to: today,
  }))

  /* ── Reset applied filters when switching reports ── */
  const handleReportChange = (key: string) => {
    setActiveKey(key)
    setColumnFilters({})
    setGlobalFilter('')
    setQuery(null)
  }

  /* ── Build API URL from the active report + applied query (null key = no fetch) ── */
  const apiUrl = useMemo(() => {
    if (!query || !activeReport.implemented) return null
    switch (activeReport.key) {
      case 'daily': {
        const base = getApiUrl('/api/Reports/GetdailyReport')
        return query.from ? `${base}?StartDate=${toApiDate(query.from)}` : base
      }
      default:
        return null
    }
  }, [query, activeReport])

  /* ── Fetch data ── */
  const { data: rawReportData, isLoading, error } = useSWR<ReportRow[]>(
    apiUrl,
    getFetcher,
    { refreshInterval: 0 }
  )

  const reportData = useMemo(
    () => (Array.isArray(rawReportData) ? rawReportData : []),
    [rawReportData]
  )

  /* ── Table state ── */
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({})
  const [showSearch, setShowSearch] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})

  const handleColumnFilterChange = (columnKey: string, value: ColumnFilterValue) => {
    setColumnFilters((prev) => ({ ...prev, [columnKey]: value }))
  }

  const handleClearAllFilters = () => {
    setColumnFilters({})
  }

  const dashIfEmpty = (value: string | number) => {
    const trimmed = String(value ?? '').trim()
    if (!trimmed) return dash
    return trimmed
  }

  /* ── Column definitions ── */
  const columnHelper = createColumnHelper<ReportRow>()

  const columns = useMemo(
    () =>
      activeColumns.map((cfg) =>
        columnHelper.accessor(cfg.key as keyof ReportRow, {
          header: cfg.header,
          cell: (info) => {
            const value = info.getValue()
            if (cfg.type === 'text') {
              return <p className='text-sm'>{dashIfEmpty(value)}</p>
            }
            if (cfg.type === 'number') {
              return <p className='text-sm text-right font-medium'>{dashIfEmpty(value)}</p>
            }
            return (
              <p className='text-sm text-right font-medium'>
                {typeof value === 'number' ? formatMoney(value) : dashIfEmpty(value)}
              </p>
            )
          },
        })
      ) as ColumnDef<ReportRow>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeColumns]
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
      ) as unknown as ReportRow[],
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

  /* ── Filterable column keys ── */
  const filterableColumns = useMemo(
    () => activeColumns.filter((c) => c.filterable).map((c) => c.key),
    [activeColumns]
  )

  /* ── Search: apply the draft inputs to the query and fetch ── */
  const handleShow = () => {
    setQuery({ from: inputFrom, to: inputTo })
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
        /* Multi-page: slice the tall screenshot into per-page canvases.
           jsPDF does not reliably render images with negative y offsets
           (slices beyond page 1 come out blank), so each page gets its
           own slice drawn at 0,0. */
        const img = new Image()
        img.src = dataUrl
        await img.decode()

        const sliceHeightPx = Math.floor(pageHeight * (imgProps.width / pageWidth))
        let rendered = 0
        let isFirstPage = true
        while (rendered < imgProps.height) {
          const sliceH = Math.min(sliceHeightPx, imgProps.height - rendered)
          const sliceCanvas = document.createElement('canvas')
          sliceCanvas.width = imgProps.width
          sliceCanvas.height = sliceH
          const ctx = sliceCanvas.getContext('2d')
          if (!ctx) break
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
          ctx.drawImage(img, 0, rendered, imgProps.width, sliceH, 0, 0, imgProps.width, sliceH)

          if (!isFirstPage) pdf.addPage()
          const slicePdfHeight = (sliceH / imgProps.width) * pageWidth
          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, slicePdfHeight)
          rendered += sliceH
          isFirstPage = false
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

  const handlePrint = async () => {
    const pdf = await buildPdf()
    if (!pdf) return
    const blobUrl = pdf.output('bloburl')
    window.open(blobUrl, '_blank')
  }

  const handleDownloadPdf = async () => {
    const pdf = await buildPdf()
    if (!pdf) return
    const suffix = query?.from ? `_${toApiDate(query.from)}` : ''
    pdf.save(`${activeReport.fileBase ?? 'Report'}${suffix}.pdf`)
  }

  /* ═══════════════════════════════════════════════════════════
     EXCEL EXPORT
     ═══════════════════════════════════════════════════════════ */

  const handleExportExcel = useCallback(() => {
    const headers = activeColumns.map((c) => c.header)
    const rows = filteredData.map((row) =>
      activeColumns.map((c) => {
        const value = row[c.key]
        return typeof value === 'number' ? value : String(value ?? '')
      })
    )

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
    const suffix = query?.from ? `_${toApiDate(query.from)}` : ''
    link.setAttribute('download', `${activeReport.fileBase ?? 'Report'}${suffix}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredData, activeColumns, activeReport, query])

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
              Preview — {activeReport.implemented ? activeReport.label : 'Transaction Reports'}
            </h3>
            {activeReport.implemented && (
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
                    {activeColumns.map((c) => (
                      <DropdownMenuCheckboxItem
                        key={c.key}
                        checked={columnVisibility[c.key] !== false}
                        onCheckedChange={() =>
                          setColumnVisibility((prev) => ({ ...prev, [c.key]: prev[c.key] === false }))
                        }
                        className='capitalize'>
                        {c.header}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant='ghostprimary'
                  onClick={handlePrint}
                  shape='pill'
                  disabled={isLoading || reportData.length === 0}
                  aria-label='Show report PDF'>
                  <Icon icon='solar:eye-linear' width={18} height={18} />
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
            )}
          </div>

          {/* ── Filter Bar ── */}
          <div className='mb-4 rounded-lg border border-ld bg-lightprimary/10 p-4 dark:bg-darkinfo/5'>
            {/* Radio option row (as in the legacy report header) */}
            <RadioGroup
              value={activeKey}
              onValueChange={handleReportChange}
              className='flex flex-wrap items-center gap-x-6 gap-y-2 mb-4'>
              {REPORTS.map((r) => (
                <div key={r.key} className='flex items-center gap-2'>
                  <RadioGroupItem value={r.key} id={`radio-${r.key}`} />
                  <Label
                    htmlFor={`radio-${r.key}`}
                    className='text-sm font-normal text-ld dark:text-darklink cursor-pointer'>
                    {r.label}
                    {!r.implemented && (
                      <span className='ms-1 text-xs text-muted-foreground dark:text-gray-500'>
                        (soon)
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {!activeReport.implemented ? (
              <div className='flex items-center gap-2 rounded-md border border-dashed border-ld bg-white/60 dark:bg-dark/40 px-4 py-3'>
                <Icon icon='solar:info-circle-linear' width={20} height={20} className='text-primary shrink-0' />
                <p className='text-sm text-muted dark:text-lightgray'>
                  {activeReport.label} will be available in a future phase — the Daily Report is
                  implemented first.
                </p>
              </div>
            ) : (
              <>
                <div className='flex flex-wrap items-end gap-4'>
                  {activeReport.dateMode === 'single' && (
                    <DateField label='Date' value={inputFrom} onChange={setInputFrom} />
                  )}
                  {activeReport.dateMode === 'range' && (
                    <>
                      <DateField label='From' value={inputFrom} onChange={setInputFrom} />
                      <DateField label='To' value={inputTo} onChange={setInputTo} />
                    </>
                  )}

                  <div className='flex items-end gap-2'>
                    <Button
                      variant='default'
                      size='sm'
                      className='h-10 text-white [&_svg]:text-white'
                      onClick={handleShow}>
                      <Icon icon='solar:minimalistic-magnifer-line-duotone' width={16} height={16} className='me-1.5' />
                      Search
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-10'
                      onClick={handlePrint}
                      disabled={isLoading || reportData.length === 0}>
                      <Icon icon='solar:eye-linear' width={16} height={16} className='me-1.5' />
                      Show
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-10'
                          disabled={isLoading || reportData.length === 0}>
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

                {/* ── Summary chip ── */}
                {reportData.length > 0 && (
                  <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
                    <span className='rounded-md bg-white border border-ld px-3 py-1 dark:bg-dark/40'>
                      Records: <strong className='text-dark dark:text-white'>{filteredData.length}</strong>
                    </span>
                    {query?.from && (
                      <span className='rounded-md bg-white border border-ld px-3 py-1 dark:bg-dark/40'>
                        Date: <strong className='text-dark dark:text-white'>{toLongDate(query.from)}</strong>
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Table */}
          {activeReport.implemented && (
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
                                ? reportData.map((row) => row[columnKey])
                                : []
                            const isFilterable =
                              columnKey && filterableColumns.includes(columnKey)
                            /* Numeric columns right-align the header so the
                               sort/filter icons and label hug the same edge
                               as the right-aligned cell values */
                            const isNumericHeader =
                              activeColumns.find((c) => c.key === columnKey)?.type !== 'text'

                            return (
                              <th
                                key={header.id}
                                className={`h-12 px-4 border-b border-ld align-middle ${isNumericHeader ? 'text-right' : 'text-left'}`}>
                                {header.isPlaceholder ? null : (
                                  <div
                                    className={
                                      isNumericHeader
                                        ? 'flex items-center justify-end gap-0.5'
                                        : 'inline-flex items-center gap-0.5'
                                    }>
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
                      ) : error ? (
                        <tr>
                          <td colSpan={visibleColumns.length} className='text-center py-8 text-destructive'>
                            Failed to load report data.
                          </td>
                        </tr>
                      ) : query === null ? (
                        <tr>
                          <td colSpan={visibleColumns.length} className='text-center py-8 text-muted dark:text-gray-500'>
                            Select a report above and press Show to load data.
                          </td>
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
                                className={`px-4 py-2 ${cell.column.id === 'categoryName' ? 'min-w-[250px]' : ''}`}
                                style={cell.column.id === 'totalAmount' ? { minWidth: 120 } : undefined}>
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
          )}

          {/* Pagination */}
          {activeReport.implemented && table.getPageCount() > 0 && table.getRowModel().rows.length > 0 && (
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
            <h2 className='text-lg font-bold text-slate-900 uppercase tracking-wide'>
              {activeReport.pdfTitle ?? activeReport.label}
            </h2>
          </div>

          {activeReport.implemented && query?.from && (
            <div className='mb-3'>
              <p className='text-sm text-slate-900'>
                <strong>Date:</strong> <strong className='ms-4'>{toLongDate(query.from)}</strong>
              </p>
            </div>
          )}

          <table className='w-full text-xs border-collapse'>
            <thead>
              <tr className='bg-slate-100'>
                {activeColumns.map((c) => (
                  <th
                    key={c.key}
                    className={`border border-slate-300 px-2 py-1.5 font-semibold ${c.type === 'text' ? 'text-left' : 'text-right'}`}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {activeColumns.map((c) => {
                    const value = row[c.key]
                    return (
                      <td
                        key={c.key}
                        className={`border border-slate-300 px-2 py-1 ${c.type === 'text' ? '' : 'text-right'} ${c.key === 'categoryName' ? 'font-medium' : ''}`}>
                        {c.type === 'text'
                          ? value || '—'
                          : typeof value === 'number'
                            ? formatMoney(value)
                            : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Print timestamp footer, as in the legacy report */}
          <div className='mt-6 text-xs text-slate-600'>
            Print Date &amp; Time:&nbsp;&nbsp;&nbsp;
            <span className='font-medium'>
              {formatDateFn(new Date(), 'dd-MMM-yyyy')}&nbsp;&nbsp;&nbsp;{formatDateFn(new Date(), 'H:mm')}
            </span>
          </div>
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
