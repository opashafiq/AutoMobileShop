'use client'

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
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icon } from '@iconify/react/dist/iconify.js'
import React from 'react'
import type { RefundMethodNameType } from '@/app/models/interfaces'
import {
  AnimatedTableWrapper,
  AnimatedTableBody,
  AnimatedTableRow,
} from '@/app/components/animatedComponents/AnimatedTable'
import { toast, ToastContainer } from 'react-toastify'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import useSWR from 'swr'
import { getApiUrl, getFetcher, postFetcher, putFetcher, deleteFetcher } from '@/app/api/globalFetcher'
import { getUserName } from '@/app/api/auth'
import { getLocalISO } from '@/lib/time'
import ColumnFilterInput from '@/app/components/react-tables/shared/ColumnFilterInput'
import { applyColumnFilters, ColumnFilterValue } from '@/app/components/react-tables/shared/columnFilterUtils'

function RefundMethodNameTable({ enableColumnFilters = true }: { enableColumnFilters?: boolean }) {
  const { activeMode } = useContext(CustomizerContext)

  const [refundData, setRefundData] = useState<RefundMethodNameType[]>([])

  const API_URL = getApiUrl('/api/RefundMethodNames')
  const { data } = useSWR(API_URL, getFetcher)

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setRefundData(data as RefundMethodNameType[])
    }
  }, [data])

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [editingRowId, setEditingRowId] = useState<number | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true,
    tbrmn_RefundMethodName: true,
    tbrmn_IsActive: true,
  })
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmDeleteTargetId, setConfirmDeleteTargetId] = useState<number | string | null>(null)
  const [confirmDeleteCount, setConfirmDeleteCount] = useState(0)
  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const [currentRefund, setCurrentRefund] = useState<Partial<RefundMethodNameType>>({
    id: 0,
    tbrmn_RefundMethodName: '',
    tbrmn_IsActive: true,
  })

  const resetCurrentRefund = () => {
    setCurrentRefund({ id: 0, tbrmn_RefundMethodName: '', tbrmn_IsActive: true })
  }

  const openCreateDialog = () => { resetCurrentRefund(); setDialogMode('create'); setEditingRowId(null); setIsDialogOpen(true) }
  const openEditDialog = (row: RefundMethodNameType) => { setDialogMode('edit'); setEditingRowId(row.id); setCurrentRefund({ ...row }); setIsDialogOpen(true) }
  const closeDialog = () => { setIsDialogOpen(false); setEditingRowId(null) }

  const handleColumnFilterChange = (columnKey: string, value: ColumnFilterValue) => setColumnFilters((prev) => ({ ...prev, [columnKey]: value }))
  const handleClearAllFilters = () => setColumnFilters({})

  const handleSave = async () => {
    setApiLoading(true)
    try {
      const payload: RefundMethodNameType = {
        id: dialogMode === 'create' ? 0 : editingRowId ?? 0,
        tbrmn_RefundMethodName: currentRefund.tbrmn_RefundMethodName ?? '',
        tbrmn_IsActive: currentRefund.tbrmn_IsActive ?? true,
        userName: getUserName() ?? '',
        setDate: getLocalISO(),
      }
      if (dialogMode === 'create') {
        const response = await postFetcher(API_URL, payload)
        setRefundData((prev) => [response as RefundMethodNameType, ...prev])
        setFeedback('Refund Method created')
      } else if (editingRowId !== null) {
        const updated = (await putFetcher(`${API_URL}/${editingRowId}`, payload)) as RefundMethodNameType | null
        setRefundData((prev) => prev.map((item) => item.id === editingRowId ? (updated ?? payload) : item))
        setFeedback('Refund Method updated')
      }
      closeDialog()
    } catch (error) {
      console.error('Unable to save refund method', error)
      setFeedback('Unable to save Refund Method')
    } finally { setApiLoading(false) }
  }

  const openDeleteConfirm = (rowId: number | string) => {
    setConfirmDeleteTargetId(rowId); setConfirmDeleteCount(1)
    setConfirmDeleteMessage('Are you sure you want to delete this Refund Method? This action cannot be undone.')
    setConfirmDialogOpen(true)
  }
  const handleDelete = (rowId: number | string) => openDeleteConfirm(rowId)

  const handleConfirmDelete = async () => {
    if (confirmDeleteCount > 1) {
      const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)
      setRefundData((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
      table.resetRowSelection(); setFeedback(`Deleted ${selectedIds.length} record(s)`)
      setConfirmDialogOpen(false); return
    }
    if (confirmDeleteTargetId === null) { setConfirmDialogOpen(false); return }
    try {
      await deleteFetcher(`${API_URL}/${confirmDeleteTargetId}`)
      setRefundData((prev) => prev.filter((item) => item.id !== confirmDeleteTargetId))
      setFeedback('Record deleted')
    } catch (error) {
      console.error('Unable to delete refund method', error)
      setFeedback('Unable to delete record')
    } finally { setConfirmDialogOpen(false); setConfirmDeleteTargetId(null); setConfirmDeleteCount(0) }
  }

  const columnHelper = createColumnHelper<RefundMethodNameType>()

  const allColumns = useMemo(
    () =>
      [
        columnHelper.display({
          id: 'select',
          header: ({ table }) => (<Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)} />),
          cell: ({ row }) => (<Checkbox checked={!!row.getIsSelected()} onCheckedChange={(checked) => row.toggleSelected(checked === true)} />),
        }),
        columnHelper.accessor('tbrmn_RefundMethodName', {
          header: 'Refund Method Name',
          cell: (info) => <p className='text-sm font-medium'>{info.getValue()}</p>,
        }),
        columnHelper.accessor('tbrmn_IsActive', {
          header: 'Active',
          cell: (info) => {
            const isActive = info.getValue()
            return (
              <div className='flex items-center justify-center'>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  <Icon icon={isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} width={14} height={14} />
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            )
          },
        }),
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => {
            const rowId = row.original.id
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span className='btn-circle-hover cursor-pointer p-0 h-7 w-7 bg-white dark:bg-black'><Icon icon='solar:menu-dots-bold' width={18} height={18} aria-label='menu' /></span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='shadow dark:shadow-white/20'>
                  <DropdownMenuItem onClick={() => openEditDialog(row.original)} className='cursor-pointer'><Icon icon='solar:pen-2-linear' width={20} height={20} className='me-2' /> Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(rowId)} className="cursor-pointer text-red-600 focus:text-red-700"><Icon icon='solar:trash-bin-2-outline' width={20} height={20} className='me-2' /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          },
        }),
      ] as ColumnDef<RefundMethodNameType>[],
    []
  )

  const visibleColumns = useMemo(
    () => allColumns.filter((col) => {
      if (col.id === 'select') return true
      if ('accessorKey' in col && typeof col.accessorKey === 'string') return columnVisibility[col.accessorKey]
      if (col.id === 'actions') return true
      return true
    }),
    [allColumns, columnVisibility]
  )

  const filteredData = useMemo(
    () => applyColumnFilters(refundData as unknown as Record<string, unknown>[], columnFilters) as unknown as RefundMethodNameType[],
    [refundData, columnFilters]
  )

  const table = useReactTable({
    data: filteredData, columns: visibleColumns, state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), autoResetPageIndex: true,
  })

  const visibleExportKeys = useMemo(
    () => visibleColumns.filter((col) => (col as any).accessorKey && col.id !== 'select' && col.id !== 'actions').map((col) => (col as any).accessorKey as keyof RefundMethodNameType),
    [visibleColumns]
  )
  const exportHeaders = useMemo(
    () => visibleColumns.filter((col) => (col as any).accessorKey && col.id !== 'select' && col.id !== 'actions').map((col) => typeof (col as any).header === 'string' ? (col as any).header : (col as any).accessorKey),
    [visibleColumns]
  )

  const handleExportCSV = useCallback(() => {
    const rows = filteredData.map((row) => visibleExportKeys.map((key) => {
      const val = row[key]
      if (key === 'tbrmn_IsActive') return val ? 'Active' : 'Inactive'
      return val ?? ''
    }))
    const csvContent = [exportHeaders.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a')
    link.href = url; link.setAttribute('download', 'refund-methods.csv')
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }, [filteredData, visibleExportKeys, exportHeaders])

  const handleBulkDelete = useCallback(() => {
    const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)
    if (selectedIds.length === 0) return
    setConfirmDeleteTargetId(null); setConfirmDeleteCount(selectedIds.length)
    setConfirmDeleteMessage(`Are you sure you want to delete ${selectedIds.length} selected record(s)? This action cannot be undone.`)
    setConfirmDialogOpen(true)
  }, [table])

  useEffect(() => { if (!feedback) return; const t = setTimeout(() => setFeedback(null), 3000); return () => clearTimeout(t) }, [feedback])
  const toastColor = activeMode === 'dark' ? 'dark' : 'light'
  useEffect(() => { if (feedback) { toast(feedback, { position: 'top-center', autoClose: 3000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, theme: toastColor }) } }, [feedback])

  return (
    <Card>
      <div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5'>
          <h3 className='text-lg font-semibold text-dark dark:text-white mb-4 md:mb-0'>Manage Refund Methods</h3>
          <div className='flex flex-wrap items-center gap-1 md:gap-2'>
            {!showSearch ? (
              <Button variant='ghostprimary' onClick={() => setShowSearch(true)} aria-label='Show search' shape='pill'><Icon icon='solar:minimalistic-magnifer-line-duotone' width={18} height={18} /></Button>
            ) : (
              <Input placeholder='Search...' className='form-control! w-40 md:w-56' value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)} onBlur={() => { if (!globalFilter) setShowSearch(false) }} aria-label='Search refund methods' />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghostprimary' shape='pill'><Icon icon='solar:settings-line-duotone' width={18} height={18} aria-label='Settings' /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-48 p-2 shadow dark:shadow-white/20'>
                {Object.keys(columnVisibility).map((col) => (
                  <DropdownMenuCheckboxItem key={col} checked={columnVisibility[col]} onCheckedChange={() => setColumnVisibility((prev) => ({ ...prev, [col]: !prev[col] }))} className='capitalize'>{col}</DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked disabled className='text-gray-400 capitalize'>actions</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant='ghostprimary' onClick={handleExportCSV} shape='pill' aria-label='Download CSV'><Icon icon='solar:download-minimalistic-line-duotone' width={18} height={18} /></Button>
            {table.getSelectedRowModel().rows.length > 0 && <Button variant='error' onClick={handleBulkDelete}><Icon icon='solar:trash-bin-2-outline' width={18} height={18} /></Button>}
            {enableColumnFilters && Object.keys(columnFilters).length > 0 && (
              <Button variant='secondary' onClick={handleClearAllFilters} size='sm' className='text-xs'><Icon icon='solar:close-circle-outline' width={16} height={16} className='me-1' /> Clear Filters</Button>
            )}
            <Button variant='lightprimary' shape='pill' onClick={openCreateDialog} aria-label='Create Refund Method'>Create Refund Method</Button>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'create' ? 'Create Refund Method' : 'Edit Refund Method'}</DialogTitle>
              <DialogDescription>{dialogMode === 'create' ? 'Enter new refund method information and save to the database.' : 'Update the refund method record and save your changes.'}</DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Refund Method Name</label>
                <Input value={currentRefund.tbrmn_RefundMethodName ?? ''} onChange={(e) => setCurrentRefund((p) => ({ ...p, tbrmn_RefundMethodName: e.target.value }))} placeholder='Refund Method Name' />
              </div>
              <div className='flex items-center justify-between rounded-lg border p-3'>
                <div>
                  <label className='text-sm font-medium'>Active</label>
                  <p className='text-xs text-muted-foreground'>{currentRefund.tbrmn_IsActive ? 'Method is active' : 'Method is inactive'}</p>
                </div>
                <Switch checked={currentRefund.tbrmn_IsActive ?? true} onCheckedChange={(checked) => setCurrentRefund((p) => ({ ...p, tbrmn_IsActive: checked }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type='button' variant='secondary' onClick={closeDialog} disabled={apiLoading}>Cancel</Button>
              <Button type='button' variant='success' onClick={handleSave} disabled={apiLoading || !currentRefund.tbrmn_RefundMethodName}>
                {apiLoading ? dialogMode === 'create' ? 'Creating...' : 'Saving...' : dialogMode === 'create' ? 'Create' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Confirm delete</DialogTitle><DialogDescription>{confirmDeleteMessage}</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button type='button' variant='secondary' onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
              <Button type='button' variant='destructive' onClick={handleConfirmDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {feedback && <ToastContainer />}

        {/* Table */}
        <div className='overflow-x-auto'>
          <div className='border rounded-md border-ld overflow-hidden'>
            <AnimatedTableWrapper className='overflow-x-auto'>
              <table className='min-w-full w-full'>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const columnKey = typeof (header.column.columnDef as any).accessorKey === 'string' ? (header.column.columnDef as any).accessorKey : header.column.id
                        const columnData = columnKey && enableColumnFilters ? refundData.map((row) => row[columnKey as keyof RefundMethodNameType]) : []
                        const isFilterable = enableColumnFilters && columnKey && columnKey !== 'id' && ['tbrmn_RefundMethodName'].includes(columnKey)
                        return (
                          <th key={header.id} className='h-12 px-4 border-b border-ld text-left align-middle'>
                            {header.isPlaceholder ? null : (
                              <div className='inline-flex items-center gap-0.5'>
                                <button type='button' onClick={header.column.getToggleSortingHandler()} className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}>
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.getCanSort() && <Icon icon='solar:transfer-vertical-line-duotone' width={14} height={14} className='shrink-0' />}
                                </button>
                                {isFilterable && <ColumnFilterInput columnData={columnData as (string | number | undefined)[]} filterValue={columnFilters[columnKey] || undefined} onFilterChange={(value) => handleColumnFilterChange(columnKey, value)} columnName={String(header.column.columnDef.header || columnKey)} />}
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
                    <tr><td colSpan={visibleColumns.length} className='text-center py-4'>No refund methods found.</td></tr>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <React.Fragment key={row.id}>
                        <AnimatedTableRow index={index} className='border-b last:border-b-0 border-ld hover:bg-lightprimary transition-colors duration-200'>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className={`px-4 py-2 ${cell.column.id === 'tbrmn_RefundMethodName' ? 'min-w-[180px]' : ''}`}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </AnimatedTableRow>
                      </React.Fragment>
                    ))
                  )}
                </AnimatedTableBody>
              </table>
            </AnimatedTableWrapper>
          </div>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 0 ? (
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3'>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted dark:text-lightgray'>Show</p>
              <Select value={String(table.getState().pagination.pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
                <SelectTrigger className='w-fit' aria-label='Select number of rows per page'><SelectValue placeholder='Rows per page' /></SelectTrigger>
                <SelectContent>{[3, 10, 20, 30, 40, 50].map((pageSize) => (<SelectItem key={pageSize} value={String(pageSize)}>{pageSize}</SelectItem>))}</SelectContent>
              </Select>
              <p className='text-sm text-muted dark:text-lightgray'>per page</p>
            </div>
            <div className='flex items-center gap-3'>
              <div><p className='text-sm font-normal text-muted dark:text-lightgray'>{table.getRowModel().rows.length > 0 ? `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of ${table.getFilteredRowModel().rows.length}` : '0 of 0'}</p></div>
              <div className='flex items-center gap-2'>
                <Icon icon='solar:arrow-left-line-duotone' className={`text-dark dark:text-white hover:text-primary cursor-pointer ${table.getState().pagination.pageIndex === 0 ? 'opacity-50 cursor-not-allowed!' : ''}`} width={20} height={20} onClick={() => table.previousPage()} />
                <span className='w-8 h-8 bg-lightprimary text-primary flex items-center justify-center rounded-md dark:bg-darkprimary dark:text-white text-sm font-normal'>{table.getState().pagination.pageIndex + 1}</span>
                <Icon icon='solar:arrow-right-line-duotone' className={`text-dark dark:text-white hover:text-primary cursor-pointer ${table.getState().pagination.pageIndex + 1 === table.getPageCount() ? 'opacity-50 cursor-not-allowed!' : ''}`} width={20} height={20} onClick={() => table.getState().pagination.pageIndex + 1 < table.getPageCount() && table.nextPage()} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

export default RefundMethodNameTable
