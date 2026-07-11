'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type SortingState,
} from '@tanstack/react-table'
import { Icon } from '@iconify/react'
import { toast, ToastContainer } from 'react-toastify'

import { getApiUrl, getFetcher, deleteFetcher } from '@/app/api/globalFetcher'
import {
  type InvoiceListResponse,
  type InvoiceListResponseItem,
  type InvoiceMasterDto,
  type InvoiceDetailsDto,
} from '@/app/(DashboardLayout)/types/apps/invoiceMaster'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import ColumnFilterInput from '@/app/components/react-tables/shared/ColumnFilterInput'
import { applyColumnFilters, type ColumnFilterValue } from '@/app/components/react-tables/shared/columnFilterUtils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'

// ---------- helpers ----------
const formatDate = (value?: string): string => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

const formatMoney = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return '0.00'
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const PAY_LABEL: Record<string, string> = { F: 'Full', P: 'Partial', L: 'Pending' }

// Map a column id to the nested path on InvoiceListResponseItem for filter data extraction.
const MASTER_ACCESSORS: Record<string, string> = {
  transactionId: 'tbim_InvoiceIdRad',
  customerName: 'tbim_Name',
  invoiceDate: 'tbim_InvDate',
  totalAmount: 'tbim_Total',
  phone: 'tbim_Phone',
  paymentType: 'paymentMethodName',
  paidAmount: 'tbim_PaidAmt',
  refundAmount: 'refundAmount',
}

const FILTERABLE_COLUMNS = ['customerName', 'phone', 'paymentType', 'paidAmount', 'refundAmount', 'totalAmount']

const columnHelper = createColumnHelper<InvoiceListResponseItem>()

export default function InvoiceDatatable() {
  const router = useRouter()
  const toastShown = useRef(false)

  // ----- API-side filter state -----
  const [customerName, setCustomerName] = useState('')
  const [phoneNo, setPhoneNo] = useState('')
  const [paymentSlot, setPaymentSlot] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  // The query string is the actual SWR key — changing it triggers a refetch.
  const [queryString, setQueryString] = useState('pageNumber=1&pageSize=10')

  const API_URL = getApiUrl(`/api/InvoiceMaster?${queryString}`)
  const { data, isLoading, error, mutate } = useSWR<InvoiceListResponse>(API_URL, getFetcher)

  const [tableData, setTableData] = useState<InvoiceListResponseItem[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [showSearch, setShowSearch] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    transactionId: true,
    customerName: true,
    invoiceDate: true,
    totalAmount: true,
    phone: true,
    paymentType: true,
    paidAmount: true,
    refundAmount: true,
  })
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({})
  const [feedback, setFeedback] = useState<string | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<InvoiceListResponseItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setTableData(data)
    }
  }, [data])

  useEffect(() => {
    if (!feedback) return
    const t = setTimeout(() => setFeedback(null), 3000)
    return () => clearTimeout(t)
  }, [feedback])

  useEffect(() => {
    if (feedback && !toastShown.current) {
      toastShown.current = true
      toast(feedback, { position: 'top-center', autoClose: 3000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true })
    } else if (!feedback) {
      toastShown.current = false
    }
  }, [feedback])

  // ---- delete ----
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const id = deleteTarget.invoiceMasterDto.id
      await deleteFetcher(`${getApiUrl('/api/InvoiceMaster')}/${id}`)
      setTableData((prev) => prev.filter((row) => row.invoiceMasterDto.id !== id))
      setFeedback('Invoice deleted')
      setDeleteTarget(null)
    } catch {
      setFeedback('Failed to delete invoice')
    } finally {
      setIsDeleting(false)
    }
  }

  // ---- columns ----
  const allColumns = useMemo<ColumnDef<InvoiceListResponseItem>[]>(() => {
    return [
      columnHelper.display({
        id: 'select',
        header: ({ table: t }) => (
          <Checkbox
            checked={t.getIsAllPageRowsSelected()}
            onCheckedChange={(checked) => t.toggleAllPageRowsSelected(checked === true)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={!!row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(checked === true)}
          />
        ),
        enableSorting: false,
        size: 40,
      }),
      columnHelper.display({
        id: 'expander',
        header: () => null,
        cell: ({ row }) => (
          <button
            type='button'
            onClick={row.getToggleExpandedHandler()}
            className='flex h-7 w-7 items-center justify-center rounded-md text-ld dark:text-darklink'
            aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
          >
            <Icon icon={row.getIsExpanded() ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} height={18} width={18} />
          </button>
        ),
        enableSorting: false,
        size: 40,
      }),
      columnHelper.display({
        id: 'transactionId',
        header: 'Transaction ID',
        cell: ({ row }) => (
          <span className='font-semibold text-primary'>{row.original.invoiceMasterDto.tbim_InvoiceIdRad || '-'}</span>
        ),
      }),
      columnHelper.display({
        id: 'customerName',
        header: 'Customer Name',
        cell: ({ row }) => <p className='text-sm'>{row.original.invoiceMasterDto.tbim_Name || '-'}</p>,
      }),
      columnHelper.display({
        id: 'invoiceDate',
        header: 'Date',
        cell: ({ row }) => <p className='text-sm'>{formatDate(row.original.invoiceMasterDto.tbim_InvDate)}</p>,
      }),
      columnHelper.display({
        id: 'totalAmount',
        header: 'Total Amount',
        cell: ({ row }) => <p className='text-sm font-semibold'>${formatMoney(row.original.invoiceMasterDto.tbim_Total)}</p>,
      }),
      columnHelper.display({
        id: 'phone',
        header: 'Phone No',
        cell: ({ row }) => <p className='text-sm'>{row.original.invoiceMasterDto.tbim_Phone || '-'}</p>,
      }),
      columnHelper.display({
        id: 'paymentType',
        header: 'Payment Type',
        cell: ({ row }) => (
          <p className='text-sm'>
            {row.original.invoiceMasterDto.paymentMethodName ||
              PAY_LABEL[row.original.invoiceMasterDto.tbim_PayInfo] ||
              '-'}
          </p>
        ),
      }),
      columnHelper.display({
        id: 'paidAmount',
        header: 'Paid Amount',
        cell: ({ row }) => <p className='text-sm'>${formatMoney(row.original.invoiceMasterDto.tbim_PaidAmt)}</p>,
      }),
      columnHelper.display({
        id: 'refundAmount',
        header: 'Refund Amount',
        cell: ({ row }) => <p className='text-sm'>${formatMoney(row.original.invoiceMasterDto.refundAmount)}</p>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const invId = row.original.invoiceMasterDto.id
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className='btn-circle-hover cursor-pointer p-0 h-7 w-7 bg-white dark:bg-black'>
                  <Icon icon='solar:menu-dots-bold' width={18} height={18} aria-label='menu' />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='shadow dark:shadow-white/20'>
                <DropdownMenuCheckboxItem
                  onClick={() => router.push(`/react-tables/transaction/invoice/${invId}/edit`)}
                  className='cursor-pointer'
                >
                  <Icon icon='solar:pen-2-linear' width={20} height={20} className='me-2' />
                  Edit
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  onClick={() => setDeleteTarget(row.original)}
                  className='cursor-pointer text-red-600 focus:text-red-700'
                >
                  <Icon icon='solar:trash-bin-2-outline' width={20} height={20} className='me-2' />
                  Delete
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
      }),
    ] as ColumnDef<InvoiceListResponseItem>[]
  }, [router])

  // Filter columns based on visibility
  const visibleColumns = useMemo(
    () => allColumns.filter((col) => {
      if (col.id === 'select' || col.id === 'expander' || col.id === 'actions') return true
      return col.id ? columnVisibility[col.id] : true
    }),
    [allColumns, columnVisibility],
  )

  // ---- API filter bar (customerName, phoneNo, paymentSlot, startDate, endDate) ----
  const buildSearchUrl = useCallback(() => {
    const params = new URLSearchParams()
    params.set('pageNumber', '1')
    params.set('pageSize', '10')
    if (customerName.trim()) params.set('customerName', customerName.trim())
    if (phoneNo.trim()) params.set('phoneNo', phoneNo.trim())
    if (paymentSlot && paymentSlot !== 'all') params.set('paymentSlot', paymentSlot)
    if (startDate) params.set('startDate', format(startDate, 'yyyy-MM-dd'))
    if (endDate) params.set('endDate', format(endDate, 'yyyy-MM-dd'))
    return params.toString()
  }, [customerName, phoneNo, paymentSlot, startDate, endDate])

  const handleSearch = () => {
    setQueryString(buildSearchUrl())
  }

  const resetFilters = () => {
    setCustomerName('')
    setPhoneNo('')
    setPaymentSlot('')
    setStartDate(undefined)
    setEndDate(undefined)
    setQueryString('pageNumber=1&pageSize=10')
  }

  // ---- column filters ----
  const handleColumnFilterChange = (columnKey: string, value: ColumnFilterValue) => {
    setColumnFilters((prev) => ({ ...prev, [columnKey]: value }))
  }
  const handleClearAllFilters = () => setColumnFilters({})

  // Pre-extract filter data for the master-level fields
  const filterDataMap = useMemo(() => {
    const map: Record<string, (string | number | undefined)[]> = {}
    for (const colId of FILTERABLE_COLUMNS) {
      const accessor = MASTER_ACCESSORS[colId]
      if (accessor) {
        map[colId] = tableData.map((row) => {
          const v = (row.invoiceMasterDto as any)[accessor]
          return v as string | number | undefined
        })
      }
    }
    return map
  }, [tableData])

  // Apply column filters
  const filteredData = useMemo(
    () => applyColumnFilters(
      tableData as unknown as Record<string, unknown>[],
      columnFilters,
    ) as unknown as InvoiceListResponseItem[],
    [tableData, columnFilters],
  )

  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    state: { sorting, globalFilter, rowSelection, expanded },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    autoResetPageIndex: true,
  })

  // ---- bulk delete (defined after `table` so it can reference it) ----
  const handleBulkDelete = useCallback(() => {
    const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.invoiceMasterDto.id)
    if (selectedIds.length === 0) return
    selectedIds.forEach((id) => {
      deleteFetcher(`${getApiUrl('/api/InvoiceMaster')}/${id}`).catch(() => {})
    })
    setTableData((prev) => prev.filter((row) => !selectedIds.includes(row.invoiceMasterDto.id)))
    table.resetRowSelection()
    setFeedback(`Deleted ${selectedIds.length} invoice(s)`)
  }, [table])

  // ---- CSV export ----
  const visibleExportKeys = useMemo(
    () => visibleColumns
      .filter((col) => col.id && !['select', 'expander', 'actions'].includes(col.id))
      .map((col) => col.id!),
    [visibleColumns],
  )
  const exportHeaders = useMemo(
    () => visibleExportKeys.map((id) => {
      const col = visibleColumns.find((c) => c.id === id)
      return typeof (col as any)?.header === 'string' ? (col as any).header : id
    }),
    [visibleExportKeys, visibleColumns],
  )
  const handleExportCSV = useCallback(() => {
    const rows = filteredData.map((row) =>
      visibleExportKeys.map((key) => {
        const m = row.invoiceMasterDto
        switch (key) {
          case 'transactionId': return m.tbim_InvoiceIdRad
          case 'customerName': return m.tbim_Name
          case 'invoiceDate': return formatDate(m.tbim_InvDate)
          case 'totalAmount': return m.tbim_Total
          case 'phone': return m.tbim_Phone
          case 'paymentType': return m.paymentMethodName || PAY_LABEL[m.tbim_PayInfo] || ''
          case 'paidAmount': return m.tbim_PaidAmt
          case 'refundAmount': return m.refundAmount
          default: return ''
        }
      }),
    )
    const csv = [
      exportHeaders.join(','),
      ...rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'invoices.csv'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [filteredData, visibleExportKeys, exportHeaders])

  return (
    <Card>
      <div>
        {/* ---- Toolbar ---- */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5'>
          <h3 className='text-lg font-semibold text-dark dark:text-white mb-4 md:mb-0'>
            Manage Invoices
          </h3>
          <div className='flex flex-wrap items-center gap-1 md:gap-2'>
            {!showSearch ? (
              <Button variant='ghostprimary' onClick={() => setShowSearch(true)} aria-label='Show search' shape='pill'>
                <Icon icon='solar:minimalistic-magnifer-line-duotone' width={18} height={18} />
              </Button>
            ) : (
              <Input
                placeholder='Search...'
                className='form-control! w-40 md:w-56'
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                onBlur={() => { if (!globalFilter) setShowSearch(false) }}
                aria-label='Search invoices'
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghostprimary' shape='pill'>
                  <Icon icon='solar:settings-line-duotone' width={18} height={18} aria-label='Settings' />
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
                    className='capitalize'
                  >
                    {col}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked disabled className='text-gray-400 capitalize'>
                  expander
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked disabled className='text-gray-400 capitalize'>
                  actions
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant='ghostprimary' onClick={handleExportCSV} shape='pill' aria-label='Download CSV'>
              <Icon icon='solar:download-minimalistic-line-duotone' width={18} height={18} />
            </Button>
            <Button variant='ghostprimary' onClick={() => mutate()} shape='pill' aria-label='Refresh data'>
              <Icon icon='solar:refresh-circle-linear' width={18} height={18} />
            </Button>
            <Button variant='ghostprimary' onClick={() => setShowFilters((p) => !p)} shape='pill' aria-label='Toggle filters'>
              {showFilters ? (
                <Icon icon='solar:close-circle-outline' width={18} height={18} />
              ) : (
                <Icon icon='solar:filter-linear' width={18} height={18} />
              )}
            </Button>
            {table.getSelectedRowModel().rows.length > 0 && (
              <Button variant='error' onClick={handleBulkDelete}>
                <Icon icon='solar:trash-bin-2-outline' width={18} height={18} />
              </Button>
            )}
            {Object.keys(columnFilters).length > 0 && (
              <Button variant='secondary' onClick={handleClearAllFilters} size='sm' className='text-xs'>
                <Icon icon='solar:close-circle-outline' width={16} height={16} className='me-1' />
                Clear Filters
              </Button>
            )}
            <Button variant='lightprimary' shape='pill' onClick={() => router.push('/react-tables/transaction/invoice/create')} aria-label='Create Invoice'>
              Create Invoice
            </Button>
          </div>
        </div>

        {/* ---- API-side filter bar (toggleable via the filter button in the toolbar) ---- */}
        {showFilters && (
          <div className='mb-4 rounded-lg border border-ld bg-lightprimary/10 p-4 dark:bg-darkinfo/5'>
            <div className='flex flex-wrap items-end gap-4'>
              <div className='min-w-[180px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Customer Name</Label>
                <Input
                  placeholder='Filter by name'
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className='h-10'
                />
              </div>
              <div className='min-w-[150px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Phone No</Label>
                <Input
                  placeholder='Filter by phone'
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  className='h-10'
                />
              </div>
              <div className='min-w-[150px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Payment</Label>
                <Select value={paymentSlot} onValueChange={setPaymentSlot}>
                  <SelectTrigger className='h-10' aria-label='Payment slot'>
                    <SelectValue placeholder='All' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='F'>Full Payment</SelectItem>
                    <SelectItem value='P'>Partial Payment</SelectItem>
                    <SelectItem value='L'>Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='min-w-[150px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='h-10 w-full justify-start text-left font-normal text-ld border-ld'
                    >
                      {startDate ? format(startDate, 'dd/MM/yyyy') : <span className='text-darklink'>Pick date</span>}
                      <Icon icon='solar:calendar-linear' width={16} height={16} className='ml-auto shrink-0 opacity-60' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className='min-w-[150px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='h-10 w-full justify-start text-left font-normal text-ld border-ld'
                    >
                      {endDate ? format(endDate, 'dd/MM/yyyy') : <span className='text-darklink'>Pick date</span>}
                      <Icon icon='solar:calendar-linear' width={16} height={16} className='ml-auto shrink-0 opacity-60' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className='flex items-end gap-2 pb-[1px]'>
                <Button onClick={handleSearch} className='h-10'>
                  <Icon icon='solar:magnifer-linear' width={16} height={16} className='mr-1' />
                  Search
                </Button>
                <Button variant='outline' onClick={resetFilters} className='h-10'>
                  <Icon icon='solar:refresh-linear' width={16} height={16} className='mr-1' />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ---- Error banner ---- */}
        {error && (
          <div className='mb-4 rounded-lg border border-error/30 bg-error/5 p-4 text-sm text-error'>
            Failed to load invoices. Please ensure the backend API is reachable.
          </div>
        )}

        {/* ---- Table ---- */}
        <div className='overflow-x-auto'>
          <div className='border rounded-md border-ld overflow-hidden'>
            <AnimatedTableWrapper className='overflow-x-auto'>
              <table className='min-w-full w-full'>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const colId = header.column.id
                        const colData = colId && FILTERABLE_COLUMNS.includes(colId)
                          ? (filterDataMap[colId] ?? [])
                          : []
                        return (
                          <th key={header.id} className='h-12 px-4 border-b border-ld text-left align-middle'>
                            {header.isPlaceholder ? null : (
                              <div className='inline-flex items-center gap-0.5'>
                                <button
                                  type='button'
                                  onClick={header.column.getToggleSortingHandler()}
                                  className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                                >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.getCanSort() && (
                                    <Icon icon='solar:transfer-vertical-line-duotone' width={14} height={14} className='shrink-0' />
                                  )}
                                </button>
                                {FILTERABLE_COLUMNS.includes(colId) && (
                                  <ColumnFilterInput
                                    columnData={colData as (string | number | undefined)[]}
                                    filterValue={columnFilters[colId] || undefined}
                                    onFilterChange={(value) => handleColumnFilterChange(colId, value)}
                                    columnName={String(header.column.columnDef.header || colId)}
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
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColumns.length} className='text-center py-8 text-sm text-darklink dark:text-bodytext'>
                        {isLoading ? 'Loading invoices...' : 'No invoices found.'}
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <FragmentRow key={row.id} row={row} index={index} />
                    ))
                  )}
                </AnimatedTableBody>
              </table>
            </AnimatedTableWrapper>
          </div>
        </div>

        {/* ---- Pagination ---- */}
        {table.getPageCount() > 0 ? (
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3'>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted dark:text-lightgray'>Show</p>
              <Select value={String(table.getState().pagination.pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
                <SelectTrigger className='w-fit' aria-label='Select number of rows per page'>
                  <SelectValue placeholder='Rows per page' />
                </SelectTrigger>
                <SelectContent>
                  {[3, 10, 20, 30, 40, 50].map((pageSize) => (
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
                    ? `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of ${table.getFilteredRowModel().rows.length}`
                    : '0 of 0'}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <Icon icon='solar:arrow-left-line-duotone'
                  className={`text-dark dark:text-white hover:text-primary cursor-pointer ${table.getState().pagination.pageIndex === 0 ? 'opacity-50 cursor-not-allowed!' : ''}`}
                  width={20} height={20} onClick={() => table.previousPage()} />
                <span className='w-8 h-8 bg-lightprimary text-primary flex items-center justify-center rounded-md dark:bg-darkprimary dark:text-white text-sm font-normal'>
                  {table.getState().pagination.pageIndex + 1}
                </span>
                <Icon icon='solar:arrow-right-line-duotone'
                  className={`text-dark dark:text-white hover:text-primary cursor-pointer ${table.getState().pagination.pageIndex + 1 === table.getPageCount() ? 'opacity-50 cursor-not-allowed!' : ''}`}
                  width={20} height={20} onClick={() => table.getState().pagination.pageIndex + 1 < table.getPageCount() && table.nextPage()} />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ---- Delete confirm dialog ---- */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{' '}
              <span className='font-semibold text-primary'>{deleteTarget?.invoiceMasterDto.tbim_InvoiceIdRad}</span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant='destructive' onClick={handleDelete} disabled={isDeleting} className='bg-error'>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {feedback && <ToastContainer />}
    </Card>
  )
}

// ---- Expanded row detail (kept in its own component for readability) ----
function FragmentRow({ row, index }: { row: any; index: number }) {
  const master: InvoiceMasterDto = row.original.invoiceMasterDto
  const details: InvoiceDetailsDto[] = row.original.invoiceDetailsDto || []

  const buildDescription = (d: InvoiceDetailsDto): string =>
    [d.tbid_DepartmentName, d.tbid_Size, d.tbid_Brand, d.tbid_Series, d.tbid_Bolt, d.tbid_HoleS, d.tbid_Zone]
      .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
      .join(', ')

  return (
    <>
      <AnimatedTableRow index={index} className='border-b last:border-b-0 border-ld hover:bg-lightprimary transition-colors duration-200'>
        {row.getVisibleCells().map((cell: any) => (
          <td key={cell.id} className='px-4 py-2'>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </AnimatedTableRow>
      {row.getIsExpanded() && (
        <tr className='bg-lightprimary/10'>
          <td colSpan={row.getVisibleCells().length} className='p-4'>
            <div className='rounded-lg border border-ld bg-white p-3 dark:bg-dark'>
              <h6 className='mb-2 text-sm font-semibold text-ld dark:text-darklink'>Line Items</h6>
              {details.length === 0 ? (
                <p className='py-4 text-center text-sm text-darklink dark:text-bodytext'>No line items.</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-ld text-left text-xs uppercase text-darklink dark:text-bodytext'>
                        <th className='py-2 pr-3 font-medium'>Taxable</th>
                        <th className='py-2 pr-3 font-medium'>Qty</th>
                        <th className='py-2 pr-3 font-medium'>Item Description</th>
                        <th className='py-2 pr-3 text-right font-medium'>Unit Price</th>
                        <th className='py-2 pr-3 text-right font-medium'>Amount</th>
                        <th className='py-2 text-right font-medium'>Tax Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.map((d) => (
                        <tr key={d.id} className='border-b border-ld/60'>
                          <td className='py-2 pr-3'>
                            {d.tbid_Taxable ? (
                              <Icon icon='solar:check-circle-linear' width={16} height={16} className='text-success' />
                            ) : (
                              <span className='text-darklink'>—</span>
                            )}
                          </td>
                          <td className='py-2 pr-3'>{d.tbid_Qty}</td>
                          <td className='py-2 pr-3'>{buildDescription(d) || '-'}</td>
                          <td className='py-2 pr-3 text-right'>${formatMoney(d.tbid_UnitPrice)}</td>
                          <td className='py-2 pr-3 text-right'>${formatMoney(d.tbid_LineTotal)}</td>
                          <td className='py-2 text-right'>${formatMoney(d.tbid_TaxAmt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className='mt-3 flex justify-end gap-6 text-sm'>
                <div>
                  <span className='text-darklink dark:text-bodytext'>Sub Total: </span>
                  <span className='font-semibold text-ld dark:text-darklink'>${formatMoney(master.tbim_SubTotal)}</span>
                </div>
                <div>
                  <span className='text-darklink dark:text-bodytext'>Tax: </span>
                  <span className='font-semibold text-ld dark:text-darklink'>${formatMoney(master.tbim_SaleTax)}</span>
                </div>
                <div>
                  <span className='text-darklink dark:text-bodytext'>Total: </span>
                  <span className='font-semibold text-primary'>${formatMoney(master.tbim_Total)}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}