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
import type { DistributorType } from '@/app/models/interfaces'
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

function DistributorsTable({ enableColumnFilters = true }: { enableColumnFilters?: boolean }) {
  const { activeMode } = useContext(CustomizerContext)

  const [distributorData, setDistributorData] = useState<DistributorType[]>([])

  // SWR fetch from API
  const API_URL = getApiUrl('/api/Distributors')
  const { data } = useSWR(API_URL, getFetcher)

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setDistributorData(data as DistributorType[])
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
    name: true,
    address: true,
  })
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmDeleteTargetId, setConfirmDeleteTargetId] = useState<number | string | null>(null)
  const [confirmDeleteCount, setConfirmDeleteCount] = useState(0)
  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const [currentDistributor, setCurrentDistributor] = useState<Partial<DistributorType>>({
    id: 0,
    name: '',
    address: '',
  })

  const resetCurrentDistributor = () => {
    setCurrentDistributor({
      id: 0,
      name: '',
      address: '',
    })
  }

  const openCreateDialog = () => {
    resetCurrentDistributor()
    setDialogMode('create')
    setEditingRowId(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (row: DistributorType) => {
    setDialogMode('edit')
    setEditingRowId(row.id)
    setCurrentDistributor({ ...row })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingRowId(null)
  }

  const handleColumnFilterChange = (columnKey: string, value: ColumnFilterValue) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }))
  }

  const handleClearAllFilters = () => {
    setColumnFilters({})
  }

  const handleSave = async () => {
    setApiLoading(true)

    try {
      const payload: DistributorType = {
        id: dialogMode === 'create' ? 0 : editingRowId ?? 0,
        name: currentDistributor.name ?? '',
        address: currentDistributor.address ?? '',
        userName: getUserName() ?? '',
        setDate: getLocalISO(),
      }

      if (dialogMode === 'create') {
        const response = await postFetcher(API_URL, payload)
        setDistributorData((prev) => [response as DistributorType, ...prev])
        setFeedback('Distributor created')
      } else if (editingRowId !== null) {
        const updatedDistributor = (await putFetcher(`${API_URL}/${editingRowId}`, payload)) as DistributorType | null
        setDistributorData((prev) =>
          prev.map((item) =>
            item.id === editingRowId ? (updatedDistributor ?? payload) : item
          )
        )
        setFeedback('Distributor updated')
      }

      closeDialog()
    } catch (error) {
      console.error('Unable to save distributor', error)
      setFeedback('Unable to save Distributor')
    } finally {
      setApiLoading(false)
    }
  }

  const openDeleteConfirm = (rowId: number | string) => {
    setConfirmDeleteTargetId(rowId)
    setConfirmDeleteCount(1)
    setConfirmDeleteMessage(
      'Are you sure you want to delete this Distributor? This action cannot be undone.'
    )
    setConfirmDialogOpen(true)
  }

  const handleDelete = (rowId: number | string) => {
    openDeleteConfirm(rowId)
  }

  const handleConfirmDelete = async () => {
    if (confirmDeleteCount > 1) {
      const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)
      setDistributorData((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
      table.resetRowSelection()
      setFeedback(`Deleted ${selectedIds.length} record(s)`)
      setConfirmDialogOpen(false)
      return
    }

    if (confirmDeleteTargetId === null) {
      setConfirmDialogOpen(false)
      return
    }

    try {
      await deleteFetcher(`${API_URL}/${confirmDeleteTargetId}`)
      setDistributorData((prev) => prev.filter((item) => item.id !== confirmDeleteTargetId))
      setFeedback('Record deleted')
    } catch (error) {
      console.error('Unable to delete distributor', error)
      setFeedback('Unable to delete record')
    } finally {
      setConfirmDialogOpen(false)
      setConfirmDeleteTargetId(null)
      setConfirmDeleteCount(0)
    }
  }

  // Create column helper for DistributorType
  const columnHelper = createColumnHelper<DistributorType>()

  // Build columns matching the Distributors API
  const allColumns = useMemo(
    () =>
      [
        columnHelper.display({
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(checked) =>
                table.toggleAllPageRowsSelected(checked === true)
              }
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={!!row.getIsSelected()}
              onCheckedChange={(checked) => row.toggleSelected(checked === true)}
            />
          ),
        }),

        columnHelper.accessor('name', {
          header: 'Name',
          cell: (info) => <p className='text-sm font-medium'>{info.getValue()}</p>,
        }),

        columnHelper.accessor('address', {
          header: 'Address',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => {
            const rowId = row.original.id
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span className='btn-circle-hover cursor-pointer p-0 h-7 w-7 bg-white dark:bg-black'>
                    <Icon
                      icon='solar:menu-dots-bold'
                      width={18}
                      height={18}
                      aria-label='menu'
                    />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='shadow dark:shadow-white/20'>
                  <DropdownMenuItem
                    onClick={() => openEditDialog(row.original)}
                    className='cursor-pointer'>
                    <Icon
                      icon='solar:pen-2-linear'
                      width={20}
                      height={20}
                      className='me-2'
                    />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(rowId)}
                    className="cursor-pointer text-red-600 focus:text-red-700">
                    <Icon
                      icon='solar:trash-bin-2-outline'
                      width={20}
                      height={20}
                      className='me-2'
                    />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          },
        }),
      ] as ColumnDef<DistributorType>[],
    []
  )

  // Filter columns based on columnVisibility
  const visibleColumns = useMemo(
    () =>
      allColumns.filter((col) => {
        if (col.id === 'select') return true
        if ('accessorKey' in col && typeof col.accessorKey === 'string') {
          return columnVisibility[col.accessorKey]
        }
        if (col.id === 'actions') return true
        return true
      }),
    [allColumns, columnVisibility]
  )

  const filteredData = useMemo(
    () =>
      applyColumnFilters(
        distributorData as unknown as Record<string, unknown>[],
        columnFilters
      ) as unknown as DistributorType[],
    [distributorData, columnFilters]
  )

  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  })

  // Memoize visible column keys for export
  const visibleExportKeys = useMemo(
    () =>
      visibleColumns
        .filter(
          (col) => (col as any).accessorKey && col.id !== 'select' && col.id !== 'actions'
        )
        .map((col) => (col as any).accessorKey as keyof DistributorType),
    [visibleColumns]
  )

  // Memoize export headers
  const exportHeaders = useMemo(
    () =>
      visibleColumns
        .filter(
          (col) =>
            (col as any).accessorKey &&
            col.id !== 'select' &&
            col.id !== 'actions'
        )
        .map((col) =>
          typeof (col as any).header === 'string'
            ? (col as any).header
            : (col as any).accessorKey
        ),
    [visibleColumns]
  )

  // CSV export handler
  const handleExportCSV = useCallback(() => {
    const rows = filteredData.map((row) =>
      visibleExportKeys.map((key) => row[key] ?? '')
    )
    const csvContent = [
      exportHeaders.join(','),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'distributors.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredData, visibleExportKeys, exportHeaders])

  // Bulk delete handler
  const handleBulkDelete = useCallback(() => {
    const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)
    if (selectedIds.length === 0) return

    setConfirmDeleteTargetId(null)
    setConfirmDeleteCount(selectedIds.length)
    setConfirmDeleteMessage(
      `Are you sure you want to delete ${selectedIds.length} selected record(s)? This action cannot be undone.`
    )
    setConfirmDialogOpen(true)
  }, [table])

  useEffect(() => {
    if (!feedback) return

    const timer = setTimeout(() => {
      setFeedback(null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [feedback])

  const toastColor = activeMode === 'dark' ? 'dark' : 'light'
  useEffect(() => {
    if (feedback) {
      toast(feedback, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: toastColor,
      })
    }
  }, [feedback])

  return (
    <Card>
      <div>
        {/* title */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5'>
          <h3 className='text-lg font-semibold text-dark dark:text-white mb-4 md:mb-0'>
            Manage Distributors
          </h3>
          <div className='flex flex-wrap items-center gap-1 md:gap-2'>
            {/* Search */}
            {!showSearch ? (
              <Button
                variant={'ghostprimary'}
                onClick={() => setShowSearch(true)}
                aria-label='Show search'
                shape={'pill'}>
                <Icon
                  icon={'solar:minimalistic-magnifer-line-duotone'}
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
                aria-label='Search distributors'
              />
            )}

            {/* Column visibility dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={'ghostprimary'} shape={'pill'}>
                  <Icon
                    icon='solar:settings-line-duotone'
                    width={18}
                    height={18}
                    aria-label='Settings'
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

                <DropdownMenuSeparator />

                <DropdownMenuCheckboxItem
                  checked
                  disabled
                  className='text-gray-400 capitalize'>
                  actions
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Download as CSV button */}
            <Button
              variant={'ghostprimary'}
              onClick={handleExportCSV}
              shape='pill'
              aria-label='Download CSV'>
              <Icon
                icon='solar:download-minimalistic-line-duotone'
                width={18}
                height={18}
              />
            </Button>

            {/* Bulk delete button */}
            {table.getSelectedRowModel().rows.length > 0 && (
              <Button variant={'error'} onClick={handleBulkDelete}>
                <Icon icon='solar:trash-bin-2-outline' width={18} height={18} />
              </Button>
            )}

            {/* Clear filters button */}
            {enableColumnFilters && Object.keys(columnFilters).length > 0 && (
              <Button
                variant={'secondary'}
                onClick={handleClearAllFilters}
                size='sm'
                className='text-xs'>
                <Icon icon='solar:close-circle-outline' width={16} height={16} className='me-1' />
                Clear Filters
              </Button>
            )}

            <Button
              variant='lightprimary'
              shape='pill'
              onClick={openCreateDialog}
              aria-label='Create Distributor'>
              Create Distributor
            </Button>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' ? 'Create Distributor' : 'Edit Distributor'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'create'
                  ? 'Enter new distributor information and save to the database.'
                  : 'Update the distributor record and save your changes.'}
              </DialogDescription>
            </DialogHeader>

            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Name</label>
                <Input
                  value={currentDistributor.name ?? ''}
                  onChange={(e) =>
                    setCurrentDistributor((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder='Name'
                />
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Address</label>
                <Input
                  value={currentDistributor.address ?? ''}
                  onChange={(e) =>
                    setCurrentDistributor((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder='Address'
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='secondary'
                onClick={closeDialog}
                disabled={apiLoading}>
                Cancel
              </Button>
              <Button
                type='button'
                variant='success'
                onClick={handleSave}
                disabled={apiLoading || !currentDistributor.name}>
                {apiLoading
                  ? dialogMode === 'create'
                    ? 'Creating...'
                    : 'Saving...'
                  : dialogMode === 'create'
                  ? 'Create'
                  : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm delete</DialogTitle>
              <DialogDescription>{confirmDeleteMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button type='button' variant='destructive' onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Feedback Toast */}
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
                        const columnKey =
                          typeof (header.column.columnDef as any).accessorKey === 'string'
                            ? (header.column.columnDef as any).accessorKey
                            : header.column.id
                        const columnData =
                          columnKey && enableColumnFilters
                            ? distributorData.map((row) => row[columnKey as keyof DistributorType])
                            : []
                        const isFilterable =
                          enableColumnFilters &&
                          columnKey &&
                          columnKey !== 'id' &&
                          ['name', 'address'].includes(
                            columnKey
                          )

                        return (
                          <th
                            key={header.id}
                            className='h-12 px-4 border-b border-ld text-left align-middle'>
                            {header.isPlaceholder ? null : (
                              <div className='inline-flex items-center gap-0.5'>
                                <button
                                  type='button'
                                  onClick={header.column.getToggleSortingHandler()}
                                  className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white ${
                                    header.column.getCanSort()
                                      ? 'cursor-pointer select-none'
                                      : ''
                                  }`}>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {header.column.getCanSort() && (
                                    <Icon icon='solar:transfer-vertical-line-duotone' width={14} height={14} className='shrink-0' />
                                  )}
                                </button>
                                {isFilterable && (
                                  <ColumnFilterInput
                                    columnData={columnData as (string | number | undefined)[]}
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
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={visibleColumns.length}
                        className='text-center py-4'>
                        No distributors found.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <React.Fragment key={row.id}>
                        <AnimatedTableRow
                          index={index}
                          className='border-b last:border-b-0 border-ld hover:bg-lightprimary transition-colors duration-200'>
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={`px-4 py-2 ${
                                cell.column.id === 'name' || cell.column.id === 'address'
                                  ? 'min-w-[180px]'
                                  : ''
                              }`}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
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

        {/* Pagination Controls */}
        {table.getPageCount() > 0 ? (
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3'>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted dark:text-lightgray'>Show</p>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}>
                <SelectTrigger
                  className='w-fit'
                  aria-label='Select number of rows per page'>
                  <SelectValue placeholder='Rows per page' />
                </SelectTrigger>
                <SelectContent>
                  {[3, 10, 20, 30, 40, 50].map((pageSize) => (
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
                    ? `${
                        table.getState().pagination.pageIndex *
                          table.getState().pagination.pageSize +
                        1
                      }-${Math.min(
                        (table.getState().pagination.pageIndex + 1) *
                          table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                      )} of ${table.getFilteredRowModel().rows.length}`
                    : `0 of 0`}
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
                    table.getState().pagination.pageIndex + 1 ===
                    table.getPageCount()
                      ? 'opacity-50 cursor-not-allowed!'
                      : ''
                  }`}
                  width={20}
                  height={20}
                  onClick={() =>
                    table.getState().pagination.pageIndex + 1 <
                      table.getPageCount() && table.nextPage()
                  }
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

export default DistributorsTable
