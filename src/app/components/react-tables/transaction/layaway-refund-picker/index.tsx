'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Icon } from '@iconify/react'

import { getApiUrl, getFetcher } from '@/app/api/globalFetcher'
import {
  type LayawayListResponse,
  type LayawayListResponseItem,
  type LayawayMasterDto,
} from '@/app/(DashboardLayout)/types/apps/layawayMaster'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
const REFUND_TYPE_LABEL: Record<string, string> = { N: 'None', P: 'Partial', F: 'Full' }

const columnHelper = createColumnHelper<LayawayListResponseItem>()

interface LayawayRefundPickerProps {
  onSelect: (layaway: LayawayMasterDto, mode: 'item' | 'payment') => void
  onCancel: () => void
}

export default function LayawayRefundPicker({ onSelect, onCancel }: LayawayRefundPickerProps) {
  // ----- API-side filter state -----
  const [invoiceTransactionId, setInvoiceTransactionId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [phoneNo, setPhoneNo] = useState('')
  const [paymentSlot, setPaymentSlot] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filterParams, setFilterParams] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const queryString = `pageNumber=${pageNumber}&pageSize=${pageSize}${filterParams ? `&${filterParams}` : ''}`
  const API_URL = getApiUrl(`/api/LayawayMaster?${queryString}`)
  const { data, isLoading, error, mutate } = useSWR<LayawayListResponse>(API_URL, getFetcher)

  const [tableData, setTableData] = useState<LayawayListResponseItem[]>([])

  useEffect(() => {
    if (data) {
      setTableData(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
      setTotalPages(data.totalPages ?? 0)
    }
  }, [data])

  useEffect(() => {
    if (totalPages > 0 && pageNumber > totalPages) {
      setPageNumber(totalPages)
    }
  }, [totalPages, pageNumber])

  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams()
    if (invoiceTransactionId.trim()) params.set('invoiceTransactionId', invoiceTransactionId.trim())
    if (customerName.trim()) params.set('customerName', customerName.trim())
    if (phoneNo.trim()) params.set('phoneNo', phoneNo.trim())
    if (paymentSlot && paymentSlot !== 'all') params.set('paymentSlot', paymentSlot)
    if (startDate) params.set('startDate', format(startDate, 'yyyy-MM-dd'))
    if (endDate) params.set('endDate', format(endDate, 'yyyy-MM-dd'))
    return params.toString()
  }, [invoiceTransactionId, customerName, phoneNo, paymentSlot, startDate, endDate])

  const handleSearch = () => {
    setFilterParams(buildFilterParams())
    setPageNumber(1)
  }

  const resetFilters = () => {
    setInvoiceTransactionId('')
    setCustomerName('')
    setPhoneNo('')
    setPaymentSlot('')
    setStartDate(undefined)
    setEndDate(undefined)
    setFilterParams('')
    setPageNumber(1)
  }

  const columns = useMemo<ColumnDef<LayawayListResponseItem>[]>(() => [
    columnHelper.display({
      id: 'transactionId',
      header: 'Transaction Id',
      cell: ({ row }) => (
        <span className='font-semibold text-primary'>{row.original.layawayMasterDto.tbim_InvoiceIdRad || '-'}</span>
      ),
    }),
    columnHelper.display({
      id: 'customerName',
      header: 'Customer Name',
      cell: ({ row }) => <p className='text-sm'>{row.original.layawayMasterDto.tbim_Name || '-'}</p>,
    }),
    columnHelper.display({
      id: 'date',
      header: 'Date',
      cell: ({ row }) => <p className='text-sm'>{formatDate(row.original.layawayMasterDto.tbim_InvDate)}</p>,
    }),
    columnHelper.display({
      id: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => <p className='text-sm font-semibold'>${formatMoney(row.original.layawayMasterDto.tbim_Total)}</p>,
    }),
    columnHelper.display({
      id: 'phone',
      header: 'Phone No',
      cell: ({ row }) => <p className='text-sm'>{row.original.layawayMasterDto.tbim_Phone || '-'}</p>,
    }),
    columnHelper.display({
      id: 'paymentType',
      header: 'Payment Type',
      cell: ({ row }) => (
        <p className='text-sm'>
          {row.original.layawayMasterDto.paymentMethodName ||
            PAY_LABEL[row.original.layawayMasterDto.tbim_PayInfo] ||
            '-'}
        </p>
      ),
    }),
    columnHelper.display({
      id: 'paidAmount',
      header: 'Paid Amount',
      cell: ({ row }) => <p className='text-sm'>${formatMoney(row.original.layawayMasterDto.tbim_PaidAmt)}</p>,
    }),
    columnHelper.display({
      id: 'refundedAmount',
      header: 'Already Refunded',
      cell: ({ row }) => {
        const refunded = row.original.layawayMasterDto.refundAmount || 0
        return <p className='text-sm text-warning'>${formatMoney(refunded)}</p>
      },
    }),
    columnHelper.display({
      id: 'refundType',
      header: 'Refund Type',
      cell: ({ row }) => (
        <p className='text-sm'>{REFUND_TYPE_LABEL[row.original.layawayMasterDto.tbim_RefundType] || '-'}</p>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const m = row.original.layawayMasterDto
        const total = Number(m.tbim_Total) || 0
        const refunded = Number(m.refundAmount) || 0
        const remaining = total - refunded
        const isFullyRefunded = remaining <= 0 && refunded > 0
        const canRefund = remaining > 0

        return (
          <div className='flex gap-1.5'>
            <Button
              size='sm'
              variant='lightprimary'
              disabled={!canRefund}
              onClick={() => onSelect(m, 'item')}
              title={isFullyRefunded ? 'Layaway is fully refunded' : `Item Refund (remaining: $${formatMoney(remaining)})`}
            >
              <Icon icon='solar:cart-check-linear' width={16} height={16} className='mr-1' />
              Item Refund
            </Button>
            <Button
              size='sm'
              variant='outline'
              disabled={!canRefund}
              onClick={() => onSelect(m, 'payment')}
              title={isFullyRefunded ? 'Layaway is fully refunded' : `Payment Refund (remaining: $${formatMoney(remaining)})`}
            >
              <Icon icon='solar:card-money-linear' width={16} height={16} className='mr-1' />
              Payment Refund
            </Button>
          </div>
        )
      },
      enableSorting: false,
    }),
  ] as ColumnDef<LayawayListResponseItem>[], [onSelect])

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  // Build page numbers for pagination
  const pageNumbers = useMemo<(number | '…')[]>(() => {
    if (totalPages <= 1) return totalPages === 1 ? [1] : []
    const pages: (number | '…')[] = []
    const windowSize = 1
    const start = Math.max(1, pageNumber - windowSize)
    const end = Math.min(totalPages, pageNumber + windowSize)
    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('…')
    }
    for (let p = start; p <= end; p++) pages.push(p)
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('…')
      pages.push(totalPages)
    }
    return pages
  }, [pageNumber, totalPages])

  return (
    <div className='space-y-5'>
      {/* ---- Toolbar ---- */}
      <Card className='p-4 md:p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h4 className='text-lg font-semibold text-ld dark:text-darklink'>Select Layaway to Refund</h4>
            <p className='text-sm text-darklink dark:text-bodytext'>Choose a layaway and select whether to refund items, payments, or both.</p>
          </div>
          <Button variant='outline' onClick={onCancel}>
            <Icon icon='solar:alt-arrow-left-linear' width={18} height={18} className='mr-1' />
            Back to Refunds
          </Button>
        </div>

        {/* ---- Filter bar ---- */}
        <div className='mb-4 rounded-lg border border-ld bg-lightprimary/10 p-4 dark:bg-darkinfo/5'>
          <div className='flex flex-wrap items-end gap-4'>
            <div className='min-w-[140px] flex-1'>
              <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Layaway No</Label>
              <Input placeholder='Filter by layaway' value={invoiceTransactionId} onChange={(e) => setInvoiceTransactionId(e.target.value)} className='h-10' />
            </div>
            <div className='min-w-[140px] flex-1'>
              <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Customer Name</Label>
              <Input placeholder='Filter by name' value={customerName} onChange={(e) => setCustomerName(e.target.value)} className='h-10' />
            </div>
            <div className='min-w-[130px] flex-1'>
              <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Phone No</Label>
              <Input placeholder='Filter by phone' value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} className='h-10' />
            </div>
            <div className='min-w-[130px] flex-1'>
              <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Payment Slot</Label>
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
            <div className='min-w-[130px] flex-1'>
              <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='h-10 w-full justify-start text-left font-normal text-ld border-ld'>
                    {startDate ? format(startDate, 'dd/MM/yyyy') : <span className='text-darklink'>Pick date</span>}
                    <Icon icon='solar:calendar-linear' width={16} height={16} className='ml-auto shrink-0 opacity-60' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar mode='single' selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className='min-w-[130px] flex-1'>
              <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='h-10 w-full justify-start text-left font-normal text-ld border-ld'>
                    {endDate ? format(endDate, 'dd/MM/yyyy') : <span className='text-darklink'>Pick date</span>}
                    <Icon icon='solar:calendar-linear' width={16} height={16} className='ml-auto shrink-0 opacity-60' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar mode='single' selected={endDate} onSelect={setEndDate} initialFocus />
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

        {/* ---- Error banner ---- */}
        {error && (
          <div className='mb-4 rounded-lg border border-error/30 bg-error/5 p-4 text-sm text-error'>
            Failed to load layaways. Please ensure the backend API is reachable.
          </div>
        )}

        {/* ---- Table ---- */}
        <div className='overflow-x-auto'>
          <div className='border rounded-md border-ld overflow-hidden'>
            <table className='min-w-full w-full'>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className='h-12 px-4 border-b border-ld text-left align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400'>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className='text-center py-8 text-sm text-darklink dark:text-bodytext'>
                      {isLoading ? 'Loading layaways...' : 'No layaways found.'}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => {
                    const m = row.original.layawayMasterDto
                    const remaining = (Number(m.tbim_Total) || 0) - (Number(m.refundAmount) || 0)
                    const isFullyRefunded = remaining <= 0 && (Number(m.refundAmount) || 0) > 0
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-ld transition-colors duration-200 hover:bg-lightprimary/40 ${
                          isFullyRefunded ? 'opacity-50 bg-gray-50 dark:bg-gray-800/30' : ''
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className='px-4 py-3'>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- Pagination ---- */}
        {totalCount > 0 && (
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3'>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted dark:text-lightgray'>Show</p>
              <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPageNumber(1) }}>
                <SelectTrigger className='w-fit'>
                  <SelectValue placeholder='Rows per page' />
                </SelectTrigger>
                <SelectContent>
                  {[3, 10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-sm text-muted dark:text-lightgray'>per page</p>
            </div>
            <div className='flex items-center gap-3'>
              <div>
                <p className='text-sm font-normal text-muted dark:text-lightgray'>
                  {`${(pageNumber - 1) * pageSize + 1}-${Math.min(pageNumber * pageSize, totalCount)} of ${totalCount}`}
                </p>
              </div>
              <div className='flex items-center gap-1.5'>
                <Icon
                  icon='solar:arrow-left-line-duotone'
                  className={`text-dark dark:text-white hover:text-primary ${pageNumber <= 1 ? 'opacity-50 cursor-not-allowed!' : 'cursor-pointer'}`}
                  width={20} height={20}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                />
                {pageNumbers.map((p, idx) =>
                  p === '…' ? (
                    <span key={`ellipsis-${idx}`} className='w-8 h-8 flex items-center justify-center text-sm text-muted dark:text-lightgray'>…</span>
                  ) : (
                    <button
                      key={p}
                      type='button'
                      onClick={() => setPageNumber(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-normal transition-colors ${
                        p === pageNumber
                          ? 'bg-lightprimary text-primary dark:bg-darkprimary dark:text-white'
                          : 'text-dark dark:text-white hover:bg-lightprimary/60 dark:hover:bg-darkprimary/60'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <Icon
                  icon='solar:arrow-right-line-duotone'
                  className={`text-dark dark:text-white hover:text-primary ${pageNumber >= totalPages || totalPages <= 1 ? 'opacity-50 cursor-not-allowed!' : 'cursor-pointer'}`}
                  width={20} height={20}
                  onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}