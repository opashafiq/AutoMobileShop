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
import { Badge } from '@/components/ui/badge'
import type { BadgeProps } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Icon } from '@iconify/react/dist/iconify.js'
import React from 'react'
import { uniqueId } from 'lodash'
import {
  AnimatedTableWrapper,
  AnimatedTableBody,
  AnimatedTableRow,
} from '@/app/components/animatedComponents/AnimatedTable'
import { toast, ToastContainer } from 'react-toastify'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import useSWR from 'swr'
import { getFetcher } from '@/app/api/globalFetcher'

interface TaxType {
  id: number
  tbti_ComName: string
  tbti_TaxNumber: string
  tbti_Address: string
  tbti_Phone: string
  userName: string
  setDate: string
}

function TaxIdTable() {
  ////////////////////////////////////
  // Implemented a simple console log to verify component rendering and data fetching
  ///////////////////////////////////////////////////////
  console.log('Rendering TaxIdTable')
  // const fetcher = (url: string) =>
  // fetch(url).then(res => res.json());
  // // API Fetching with SWR (uncomment and replace API_URL to use)
  // //const API_URL = 'https://jsonplaceholder.typicode.com/todos/1';
  // const API_URL = 'https://localhost:7184/api/Departments/1';
  //   const { data, error, isLoading } = useSWR(
  //   API_URL,
  //   getFetcher
  // );
  // // console.log('Fetched data:', data, 'Error:', error, 'Loading:', isLoading)
  // console.log('Record: ' + data.tbid_DepartmentName)
  //console.log('Title: ' + data.title)
  ////////////////////////////////////////////
  // Implementation complete
  /////////////////////////////////////////


  const { activeMode } = useContext(CustomizerContext)
  // console.log('Current theme mode from context:', activeMode)
  // setActiveMode('dark') // Example of changing theme mode from the component
  // console.log('Current theme mode from context after change:', activeMode)


  const [taxData, setTaxData] = useState<TaxType[]>([])

  // SWR fetch from API
  const API_URL = 'https://localhost:44352/api/TaxId'
  const { data, error, isLoading } = useSWR(API_URL, getFetcher)

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setTaxData(data as TaxType[])
    }
  }, [data])

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  
  const [rowSelection, setRowSelection] = useState({})
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editedRowData, setEditedRowData] = useState<Record<string, Partial<any>>>({})
  const [showSearch, setShowSearch] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true,
    tbti_ComName: true,
    tbti_TaxNumber: true,
    tbti_Address: true,
    tbti_Phone: true,
    userName: true,
    setDate: true,
  })

  // no client-side create UI for TaxId table; read-only

  const handleDelete = (rowId: number | string) => {
    setTaxData((prev) => prev.filter((item) => item.id !== rowId))
    setFeedback('Record deleted')
  }

  // Create column helper for TaxType
  const columnHelper = createColumnHelper<TaxType>()

  // Build columns matching the TaxId API
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

        columnHelper.accessor('tbti_ComName', {
          header: 'Company',
          cell: (info) => <p className='text-sm font-medium'>{info.getValue()}</p>,
        }),

        columnHelper.accessor('tbti_TaxNumber', {
          header: 'Tax Number',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('tbti_Address', {
          header: 'Address',
          cell: (info) => <p className='text-sm'>{info.getValue()}</p>,
        }),

        columnHelper.accessor('tbti_Phone', {
          header: 'Phone',
          cell: (info) => <p className='text-sm'>{info.getValue()}</p>,
        }),

        columnHelper.accessor('userName', {
          header: 'User',
          cell: (info) => <p className='text-sm'>{info.getValue()}</p>,
        }),

        columnHelper.accessor('setDate', {
          header: 'Date',
          cell: (info) => (
            <p className='text-sm'>{new Date(String(info.getValue())).toLocaleString()}</p>
          ),
        }),

        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => {
            const rowId = row.original.id
            return (
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='lighterror'
                  shape='pill'
                  onClick={() => handleDelete(rowId)}
                  aria-label='Delete record'>
                  <Icon icon='solar:trash-bin-2-outline' width={18} height={18} />
                </Button>
              </div>
            )
          },
        }),
      ] as ColumnDef<TaxType>[],
    [handleDelete]
  )

  // Filter columns based on columnVisibility before passing to useReactTable
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

  // Use taxData directly (no role filter)
  const filteredData = useMemo(() => taxData, [taxData])

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
    autoResetPageIndex: true, // Enable row highlighting on data changes
  })

  // Memoize visible column keys for export
  const visibleExportKeys = useMemo(
    () =>
      visibleColumns
        .filter(
          (col) => (col as any).accessorKey && col.id !== 'select' && col.id !== 'actions'
        )
        .map((col) => (col as any).accessorKey as keyof TaxType),
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

  // Optimized CSV export handler
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
    link.setAttribute('download', 'users.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredData, visibleExportKeys, exportHeaders])

  // Optimized bulk delete handler
  const handleBulkDelete = useCallback(() => {
    const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)
    setTaxData((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
    table.resetRowSelection()
    setFeedback(`Deleted ${selectedIds.length} record(s)`)
  }, [table])

  useEffect(() => {
    if (!feedback) return

    const timer = setTimeout(() => {
      setFeedback(null)
    }, 3000) // 3 seconds

    return () => clearTimeout(timer) // Cleanup on unmount or feedback change
  }, [feedback])

  // react toastify setup.
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
            User Table
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
                className='!form-control w-40 md:w-56'
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                onBlur={() => {
                  if (!globalFilter) setShowSearch(false)
                }}
                aria-label='Search orders'
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
          </div>
        </div>

        {/* filter & create removed for TaxId table */}

        {/* Feedback Toast */}
        {feedback && <ToastContainer />}

        {/* user table */}
        <div className='overflow-x-auto'>
          <div className='border rounded-md border-ld overflow-hidden'>
            <AnimatedTableWrapper className='overflow-x-auto'>
              <table className='min-w-full w-full'>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className='px-4 py-2 border-b border-ld text-left'>
                          {header.isPlaceholder ? null : (
                            <div
                              className={
                                header.column.getCanSort()
                                  ? 'cursor-pointer select-none'
                                  : ''
                              }
                              onClick={header.column.getToggleSortingHandler()}>
                              <div className='flex items-center gap-1'>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {header.column.getCanSort() && (
                                  <Icon icon='solar:transfer-vertical-line-duotone' />
                                )}
                              </div>
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <AnimatedTableBody>
                  {/* Add new-row removed for TaxId table (read-only) */}
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={visibleColumns.length}
                        className='text-center py-4'>
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <React.Fragment key={row.id}>
                        <AnimatedTableRow
                          index={index}
                          className='border-b last:border-b-0 border-ld'>
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={`px-4 py-2 ${
                                cell.column.id === 'userName' ||
                                cell.column.id === 'phone'
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
            {/* Page Size Selector */}
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
              {/* Page Summary */}
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

              {/* Custom Pagination Controls */}
              <div className='flex items-center gap-2'>
                <Icon
                  icon='solar:arrow-left-line-duotone'
                  className={`text-dark dark:text-white hover:text-primary cursor-pointer ${
                    table.getState().pagination.pageIndex === 0
                      ? 'opacity-50 !cursor-not-allowed'
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
                      ? 'opacity-50 !cursor-not-allowed'
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

export default TaxIdTable
