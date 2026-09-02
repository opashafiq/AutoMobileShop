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
import type { ItemMasterType, DepartmentType, DistributorType, LocationDetailsType } from '@/app/models/interfaces'
import {
  AnimatedTableWrapper,
  AnimatedTableBody,
  AnimatedTableRow,
} from '@/app/components/animatedComponents/AnimatedTable'
import { toast, ToastContainer } from 'react-toastify'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import useSWR from 'swr'
import { getApiUrl, getFetcher, putFetcher, deleteFetcher } from '@/app/api/globalFetcher'
import { getUserName } from '@/app/api/auth'
import { getLocalISO } from '@/lib/time'
import ColumnFilterInput from '@/app/components/react-tables/shared/ColumnFilterInput'
import { applyColumnFilters, ColumnFilterValue, FilterType } from '@/app/components/react-tables/shared/columnFilterUtils'

// Trash Items — a restricted view over the trashed items returned by
// GET /api/ItemMaster/get-trash-items. It offers just two row actions:
// Change Category (re-file the item via PUT /api/ItemMaster/{id}) and Delete
// (permanently remove it via DELETE /api/ItemMaster/{id}). There is no
// Create/Import — items arrive here through the Archive action on Item Master.
function TrashItemsTable({ enableColumnFilters = true }: { enableColumnFilters?: boolean }) {
  const { activeMode } = useContext(CustomizerContext)

  const [itemData, setItemData] = useState<ItemMasterType[]>([])

  // SWR fetch — dedicated endpoint that returns only the trashed items.
  const LIST_URL = getApiUrl('/api/ItemMaster/get-trash-items')
  const { data } = useSWR(LIST_URL, getFetcher)

  // Base ItemMaster URL used by the row actions (PUT / DELETE by id).
  const API_URL = getApiUrl('/api/ItemMaster')

  // Fetch categories for the Change Category dialog
  const DEPARTMENTS_API_URL = getApiUrl('/api/Departments')
  const { data: departmentsData } = useSWR(DEPARTMENTS_API_URL, getFetcher)
  // Distributors / Locations are shown read-only in the dialog but still need
  // their option lists so the disabled Selects can resolve display labels.
  const DISTRIBUTORS_API_URL = getApiUrl('/api/Distributors')
  const { data: distributorsData } = useSWR(DISTRIBUTORS_API_URL, getFetcher)
  const LOCATIONS_API_URL = getApiUrl('/api/LocationDetails')
  const { data: locationsData } = useSWR(LOCATIONS_API_URL, getFetcher)

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setItemData(data as ItemMasterType[])
    }
  }, [data])

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true,
    tbim_Size: true,
    tbim_Brand: true,
    tbim_Series: true,
    tbim_Bolt: true,
    tbim_HoleS: true,
    tbim_Zone: true,
    tbim_Qty: true,
    tbim_QtyOp: true,
    tbim_Code: true,
    tbim_CodeTOT: true,
    tbim_OURP: true,
    tbim_ThrashDate: true,
    departmentName: true,
    distributorName: true,
    locationName: true,
  })
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({})
  const [showSearch, setShowSearch] = useState(false)
  const [apiLoading, setApiLoading] = useState(false)

  // Change Category dialog state — shows the full ItemMaster edit form with
  // only Category, Qty, Code and OURP editable; everything else is read-only.
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryRow, setCategoryRow] = useState<ItemMasterType | null>(null)
  const [currentItem, setCurrentItem] = useState<Partial<ItemMasterType>>({})
  const [newCategoryId, setNewCategoryId] = useState(0)
  const [categoryError, setCategoryError] = useState('')

  // Delete confirmation state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmDeleteTargetId, setConfirmDeleteTargetId] = useState<number | null>(null)
  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState('')

  // Categories for the dialog — "Trash" itself is excluded so an item can
  // only be re-filed into a real category from this page.
  const categoryOptions = useMemo(() => {
    if (!Array.isArray(departmentsData)) return []
    return (departmentsData as DepartmentType[]).filter(
      (opt) => (opt.tbid_DepartmentName ?? '').trim().toLowerCase() !== 'trash'
    )
  }, [departmentsData])

  const distributorOptions = useMemo(() => {
    if (!Array.isArray(distributorsData)) return []
    return distributorsData as DistributorType[]
  }, [distributorsData])

  const locationOptions = useMemo(() => {
    if (!Array.isArray(locationsData)) return []
    return locationsData as LocationDetailsType[]
  }, [locationsData])

  const handleColumnFilterChange = (columnKey: string, value: ColumnFilterValue) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }))
  }

  const handleClearAllFilters = () => {
    setColumnFilters({})
  }

  const openChangeCategoryDialog = (row: ItemMasterType) => {
    setCategoryRow(row)
    setCurrentItem({ ...row })
    // The row's current category is "Trash", which is not offered in the
    // dropdown, so start from 0 and force an explicit selection.
    setNewCategoryId(0)
    setCategoryError('')
    setCategoryDialogOpen(true)
  }

  const handleCategorySave = async () => {
    if (!categoryRow) {
      setCategoryDialogOpen(false)
      return
    }
    if (newCategoryId === 0) {
      setCategoryError('Please select a category')
      return
    }

    setApiLoading(true)
    try {
      // Same payload shape as the ItemMaster edit form: every field is sent
      // so the PUT keeps the read-only fields exactly as they are.
      const payload: Partial<ItemMasterType> = {
        id: categoryRow.id,
        tbim_ItemCategoryId: newCategoryId,
        tbim_Size: currentItem.tbim_Size ?? '',
        tbim_Brand: currentItem.tbim_Brand ?? '',
        tbim_Series: currentItem.tbim_Series ?? '',
        tbim_Bolt: currentItem.tbim_Bolt ?? '',
        tbim_HoleS: currentItem.tbim_HoleS ?? '',
        tbim_Zone: currentItem.tbim_Zone ?? '',
        tbim_Qty: currentItem.tbim_Qty ?? 0,
        tbim_QtyOp: currentItem.tbim_QtyOp ?? 0,
        tbim_Code: currentItem.tbim_Code ?? 0,
        tbim_CodeTOT: currentItem.tbim_CodeTOT ?? 0,
        tbim_DistributorId: currentItem.tbim_DistributorId ?? 0,
        tbim_OURP: currentItem.tbim_OURP ?? 0,
        tbim_LocationId: currentItem.tbim_LocationId ?? 0,
        tbim_ThrashDate: currentItem.tbim_ThrashDate || null,
        userName: getUserName() ?? '',
        setDate: getLocalISO(),
      }

      await putFetcher(`${API_URL}/${categoryRow.id}`, payload)
      // The item left the "Trash" category, so it no longer belongs in
      // this list — remove the row.
      setItemData((prev) => prev.filter((item) => item.id !== categoryRow.id))
      setFeedback('Item category updated')
      setCategoryDialogOpen(false)
    } catch (error) {
      console.error('Unable to change category', error)
      setFeedback(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to change category'
      )
    } finally {
      setApiLoading(false)
    }
  }

  const openDeleteConfirm = (rowId: number) => {
    setConfirmDeleteTargetId(rowId)
    setConfirmDeleteMessage(
      'Are you sure you want to permanently delete this Trash Item? This action cannot be undone.'
    )
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (confirmDeleteTargetId === null) {
      setConfirmDialogOpen(false)
      return
    }

    try {
      await deleteFetcher(`${API_URL}/${confirmDeleteTargetId}`)
      setItemData((prev) => prev.filter((item) => item.id !== confirmDeleteTargetId))
      setFeedback('Record deleted')
    } catch (error) {
      console.error('Unable to delete item', error)
      setFeedback(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to delete record'
      )
    } finally {
      setConfirmDialogOpen(false)
      setConfirmDeleteTargetId(null)
    }
  }

  // Create column helper for ItemMasterType
  const columnHelper = createColumnHelper<ItemMasterType>()

  // Build columns
  const allColumns = useMemo(
    () =>
      [
        columnHelper.accessor('tbim_Size', {
          header: 'Size',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('tbim_Brand', {
          header: 'Brand',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('tbim_Series', {
          header: 'Series',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('tbim_Bolt', {
          header: 'Bolt',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('tbim_HoleS', {
          header: 'Hole S',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('tbim_Zone', {
          header: 'Zone',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('tbim_Qty', {
          header: 'Qty',
          cell: (info) => <p className='text-sm'>{info.getValue() ?? 0}</p>,
        }),

        columnHelper.accessor('tbim_QtyOp', {
          header: 'Qty Op',
          cell: (info) => <p className='text-sm'>{info.getValue() ?? 0}</p>,
        }),

        columnHelper.accessor('tbim_Code', {
          header: 'Code',
          cell: (info) => <p className='text-sm'>{info.getValue() ?? 0}</p>,
        }),

        columnHelper.accessor('tbim_CodeTOT', {
          header: 'Code TOT',
          cell: (info) => <p className='text-sm'>{info.getValue() ?? 0}</p>,
        }),

        columnHelper.accessor('tbim_OURP', {
          header: 'OURP',
          cell: (info) => <p className='text-sm'>{info.getValue() ?? 0}</p>,
        }),

        columnHelper.accessor('tbim_ThrashDate', {
          header: 'Trash Date',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('departmentName', {
          header: 'Department',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('distributorName', {
          header: 'Distributor',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('locationName', {
          header: 'Location',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.display({
          id: 'actions',
          enableSorting: false,
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
                    onClick={() => openChangeCategoryDialog(row.original)}
                    className='cursor-pointer'>
                    <Icon
                      icon='solar:tag-linear'
                      width={20}
                      height={20}
                      className='me-2'
                    />
                    Change Category
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openDeleteConfirm(rowId)}
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
      ] as ColumnDef<ItemMasterType>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Filter columns based on columnVisibility
  const visibleColumns = useMemo(
    () =>
      allColumns.filter((col) => {
        if ('accessorKey' in col && typeof col.accessorKey === 'string') {
          return columnVisibility[col.accessorKey]
        }
        return true
      }),
    [allColumns, columnVisibility]
  )

  const filteredData = useMemo(
    () =>
      applyColumnFilters(
        itemData as unknown as Record<string, unknown>[],
        columnFilters
      ) as unknown as ItemMasterType[],
    [itemData, columnFilters]
  )

  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
  })

  const visibleExportKeys = useMemo(
    () =>
      visibleColumns
        .filter((col) => (col as any).accessorKey && col.id !== 'actions')
        .map((col) => (col as any).accessorKey as keyof ItemMasterType),
    [visibleColumns]
  )

  const exportHeaders = useMemo(
    () =>
      visibleColumns
        .filter((col) => (col as any).accessorKey && col.id !== 'actions')
        .map((col) =>
          typeof (col as any).header === 'string' ? (col as any).header : (col as any).accessorKey
        ),
    [visibleColumns]
  )

  const handleExportCSV = useCallback(() => {
    const rows = filteredData.map((row) =>
      visibleExportKeys.map((key) => row[key] ?? '')
    )
    const csvContent = [
      exportHeaders.join(','),
      ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'trash-items.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredData, visibleExportKeys, exportHeaders])

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 3000)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback])

  return (
    <Card>
      <div>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5'>
          <h3 className='text-lg font-semibold text-dark dark:text-white mb-4 md:mb-0'>
            Manage Trash Items
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
                aria-label='Search trash items'
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
                    className='capitalize'>
                    {col}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked disabled className='text-gray-400 capitalize'>actions</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant='ghostprimary' onClick={handleExportCSV} shape='pill' aria-label='Download CSV'>
              <Icon icon='solar:download-minimalistic-line-duotone' width={18} height={18} />
            </Button>
            {enableColumnFilters && Object.keys(columnFilters).length > 0 && (
              <Button variant='secondary' onClick={handleClearAllFilters} size='sm' className='text-xs'>
                <Icon icon='solar:close-circle-outline' width={16} height={16} className='me-1' />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Change Category Dialog — full ItemMaster edit form, editable only
            for Category, Qty, Code and OURP; everything else is read-only */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <DialogTitle>Change Category</DialogTitle>
              <DialogDescription>
                Select a new category to move this item out of Trash. Only Category, Qty, Code and
                OURP can be edited — all other fields are read-only.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Size</label>
                  <Input value={currentItem.tbim_Size ?? ''} readOnly className='bg-lightgray dark:bg-darkmuted cursor-not-allowed' placeholder='Size' />
                </div>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Brand</label>
                  <Input value={currentItem.tbim_Brand ?? ''} readOnly className='bg-lightgray dark:bg-darkmuted cursor-not-allowed' placeholder='Brand' />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Series</label>
                  <Input value={currentItem.tbim_Series ?? ''} readOnly className='bg-lightgray dark:bg-darkmuted cursor-not-allowed' placeholder='Series' />
                </div>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Bolt</label>
                  <Input value={currentItem.tbim_Bolt ?? ''} readOnly className='bg-lightgray dark:bg-darkmuted cursor-not-allowed' placeholder='Bolt' />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>HoleS</label>
                  <Input value={currentItem.tbim_HoleS ?? ''} readOnly className='bg-lightgray dark:bg-darkmuted cursor-not-allowed' placeholder='HoleS' />
                </div>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Zone</label>
                  <Input value={currentItem.tbim_Zone ?? ''} readOnly className='bg-lightgray dark:bg-darkmuted cursor-not-allowed' placeholder='Zone' />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Qty</label>
                  <Input type='number' value={currentItem.tbim_Qty ?? 0} onChange={(e) => setCurrentItem((p) => ({ ...p, tbim_Qty: Number(e.target.value) }))} placeholder='Qty' />
                </div>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Qty Op</label>
                  <Input type='number' value={currentItem.tbim_QtyOp ?? 0} readOnly className='bg-lightgray dark:bg-darkmuted cursor-not-allowed' placeholder='Qty Op' />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Code</label>
                  <Input type='number' value={currentItem.tbim_Code ?? 0} onChange={(e) => setCurrentItem((p) => ({ ...p, tbim_Code: Number(e.target.value) }))} placeholder='Code' />
                </div>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Code TOT</label>
                  <Input type='number' value={currentItem.tbim_CodeTOT ?? 0} readOnly className='bg-lightgray dark:bg-darkmuted cursor-not-allowed' placeholder='Code TOT' />
                </div>
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>OURP</label>
                <Input type='number' value={currentItem.tbim_OURP ?? 0} onChange={(e) => setCurrentItem((p) => ({ ...p, tbim_OURP: Number(e.target.value) }))} placeholder='OURP' />
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Trash Date</label>
                <Input type='date' value={currentItem.tbim_ThrashDate ? currentItem.tbim_ThrashDate.slice(0, 10) : ''} readOnly className='bg-lightgray dark:bg-darkmuted cursor-not-allowed' placeholder='Trash Date' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Category</label>
                  <Select
                    value={String(newCategoryId)}
                    onValueChange={(value) => {
                      setNewCategoryId(Number(value))
                      setCategoryError('')
                    }}>
                    <SelectTrigger><SelectValue placeholder='Select category' /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.id} value={String(opt.id)}>{opt.tbid_DepartmentName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categoryError && <p className='text-sm text-red-600'>{categoryError}</p>}
                </div>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Distributor</label>
                  <Select value={String(currentItem.tbim_DistributorId ?? 0)} disabled>
                    <SelectTrigger><SelectValue placeholder='Distributor' /></SelectTrigger>
                    <SelectContent>
                      {distributorOptions.map((opt) => (
                        <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Location</label>
                <Select value={String(currentItem.tbim_LocationId ?? 0)} disabled>
                  <SelectTrigger><SelectValue placeholder='Location' /></SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>{opt.tbld_LocationName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type='button' variant='secondary' onClick={() => setCategoryDialogOpen(false)} disabled={apiLoading}>Cancel</Button>
              <Button type='button' variant='success' onClick={handleCategorySave} disabled={apiLoading}>
                {apiLoading ? 'Saving...' : 'Save'}
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
                        const columnKey = typeof (header.column.columnDef as any).accessorKey === 'string'
                          ? (header.column.columnDef as any).accessorKey
                          : header.column.id
                        const columnData = columnKey && enableColumnFilters
                          ? itemData.map((row) => row[columnKey as keyof ItemMasterType])
                          : []
                        const isFilterable = enableColumnFilters && columnKey && columnKey !== 'id' &&
                          ['tbim_Size', 'tbim_Brand', 'tbim_Series', 'tbim_Bolt', 'tbim_HoleS', 'tbim_Zone', 'departmentName', 'distributorName', 'locationName'].includes(columnKey)
                        const forcedFilterType: FilterType | undefined =
                          columnKey === 'departmentName' ? 'select' : undefined
                        return (
                          <th key={header.id} className='h-12 px-4 border-b border-ld text-left align-middle'>
                            {header.isPlaceholder ? null : (
                              <div className='inline-flex items-center gap-0.5'>
                                {header.column.getCanSort() ? (
                                  <button type='button' onClick={header.column.getToggleSortingHandler()}
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
                                    columnData={columnData as (string | number | undefined)[]}
                                    filterValue={columnFilters[columnKey] || undefined}
                                    onFilterChange={(value) => handleColumnFilterChange(columnKey, value)}
                                    columnName={String(header.column.columnDef.header || columnKey)}
                                    filterType={forcedFilterType}
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
                    <tr><td colSpan={visibleColumns.length} className='text-center py-4'>No trash items found.</td></tr>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <React.Fragment key={row.id}>
                        <AnimatedTableRow index={index} className='border-b last:border-b-0 border-ld hover:bg-lightprimary transition-colors duration-200'>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className={`px-4 py-2 ${cell.column.id === 'tbim_Size' || cell.column.id === 'tbim_Brand' ? 'min-w-[180px]' : ''}`}>
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
    </Card>
  )
}

export default TrashItemsTable
