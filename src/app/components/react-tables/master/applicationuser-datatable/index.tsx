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
import type { ApplicationUserType, RoleType, LocationDetailsType } from '@/app/models/interfaces'
import {
  AnimatedTableWrapper,
  AnimatedTableBody,
  AnimatedTableRow,
} from '@/app/components/animatedComponents/AnimatedTable'
import { toast, ToastContainer } from 'react-toastify'
import { CustomizerContext } from '@/app/context/CustomizerContext'
import useSWR from 'swr'
import { getApiUrl, getFetcher, postFetcher, putFetcher, deleteFetcher } from '@/app/api/globalFetcher'
import ColumnFilterInput from '@/app/components/react-tables/shared/ColumnFilterInput'
import { applyColumnFilters, ColumnFilterValue } from '@/app/components/react-tables/shared/columnFilterUtils'

function ApplicationUserTable({ enableColumnFilters = true }: { enableColumnFilters?: boolean }) {
  const { activeMode } = useContext(CustomizerContext)

  const [userData, setUserData] = useState<ApplicationUserType[]>([])

  // SWR fetch from ApplicationUser API
  const API_URL = getApiUrl('/api/ApplicationUser')
  const { data, mutate } = useSWR(API_URL, getFetcher)

  // Fetch roles list for dropdown
  const ROLES_API_URL = getApiUrl('/Authentication/roles')
  const { data: rolesData } = useSWR(ROLES_API_URL, getFetcher)

  // Fetch LocationDetails list for dropdown
  const LOCATION_API_URL = getApiUrl('/api/LocationDetails')
  const { data: locationData } = useSWR(LOCATION_API_URL, getFetcher)

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setUserData(data as ApplicationUserType[])
    }
  }, [data])

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true,
    userName: true,
    firstName: true,
    lastName: true,
    email: true,
    isActive: true,
    locationName: true,
    roles: true,
  })
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmDeleteTargetId, setConfirmDeleteTargetId] = useState<string | null>(null)
  const [confirmDeleteCount, setConfirmDeleteCount] = useState(0)
  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<Partial<ApplicationUserType> & { password?: string; role?: string }>({
    id: '',
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    isActive: true,
    locationId: undefined,
    locationName: '',
    password: '',
    role: '',
  })

  // Build dropdown option maps for lookup
  const roleOptions = useMemo(() => {
    if (!Array.isArray(rolesData)) return []
    return rolesData as RoleType[]
  }, [rolesData])

  const locationOptions = useMemo(() => {
    if (!Array.isArray(locationData)) return []
    return locationData as LocationDetailsType[]
  }, [locationData])

  const resetCurrentUser = () => {
    setCurrentUser({
      id: '',
      userName: '',
      firstName: '',
      lastName: '',
      email: '',
      isActive: true,
      locationId: undefined,
      locationName: '',
      password: '',
      role: '',
    })
  }

  const openCreateDialog = () => {
    resetCurrentUser()
    setDialogMode('create')
    setEditingRowId(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (row: ApplicationUserType) => {
    setDialogMode('edit')
    setEditingRowId(row.id)
    setCurrentUser({
      ...row,
      password: '',
      role: row.roles?.length > 0 ? row.roles[0] : '',
    })
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

  const handleRoleChange = (value: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: value,
    }))
  }

  const handleLocationChange = (value: string) => {
    const id = Number(value)
    const selected = locationOptions.find((opt) => opt.id === id)
    setCurrentUser((prev) => ({
      ...prev,
      locationId: id,
      locationName: selected?.tbld_LocationName ?? '',
    }))
  }

  const handleSave = async () => {
    setApiLoading(true)

    try {
      const payload: Record<string, any> = {
        userName: currentUser.userName ?? '',
        firstName: currentUser.firstName ?? '',
        lastName: currentUser.lastName ?? '',
        isActive: currentUser.isActive ?? true,
        locationId: currentUser.locationId ?? 0,
        email: currentUser.email ?? '',
        role: currentUser.role ?? '',
      }

      // Only include password if provided (for both create and edit it's part of the API contract)
      if (currentUser.password) {
        payload.password = currentUser.password
      }

      if (dialogMode === 'create') {
        const response = await postFetcher(API_URL, payload)
        setUserData((prev) => [response as ApplicationUserType, ...prev])
        setFeedback('Application User created')
      } else if (editingRowId !== null) {
        const updatedUser = (await putFetcher(`${API_URL}/${editingRowId}`, payload)) as ApplicationUserType | null
        setUserData((prev) =>
          prev.map((item) =>
            item.id === editingRowId ? (updatedUser ?? { ...item, ...payload }) : item
          )
        )
        setFeedback('Application User updated')
      }

      closeDialog()
    } catch (error) {
      console.error('Unable to save application user', error)
      setFeedback('Unable to save Application User')
    } finally {
      setApiLoading(false)
    }
  }

  const openDeleteConfirm = (rowId: string) => {
    setConfirmDeleteTargetId(rowId)
    setConfirmDeleteCount(1)
    setConfirmDeleteMessage(
      'Are you sure you want to delete this Application User? This action cannot be undone.'
    )
    setConfirmDialogOpen(true)
  }

  const handleDelete = (rowId: string) => {
    openDeleteConfirm(rowId)
  }

  const handleConfirmDelete = async () => {
    if (confirmDeleteCount > 1 && confirmDeleteTargetId === null) {
      const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)
      setUserData((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
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
      setUserData((prev) => prev.filter((item) => item.id !== confirmDeleteTargetId))
      setFeedback('Record deleted')
    } catch (error) {
      console.error('Unable to delete application user', error)
      setFeedback('Unable to delete record')
    } finally {
      setConfirmDialogOpen(false)
      setConfirmDeleteTargetId(null)
      setConfirmDeleteCount(0)
    }
  }

  // Create column helper for ApplicationUserType
  const columnHelper = createColumnHelper<ApplicationUserType>()

  // Build columns matching the ApplicationUser API
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

        columnHelper.accessor('userName', {
          header: 'Username',
          cell: (info) => <p className='text-sm font-medium'>{info.getValue()}</p>,
        }),

        columnHelper.accessor('firstName', {
          header: 'First Name',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('lastName', {
          header: 'Last Name',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('email', {
          header: 'Email',
          cell: (info) => <p className='text-sm'>{info.getValue()}</p>,
        }),

        columnHelper.accessor('isActive', {
          header: 'Active',
          cell: (info) => {
            const isActive = info.getValue()
            return (
              <div className='flex items-center justify-center'>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                  <Icon
                    icon={isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                    width={14}
                    height={14}
                  />
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            )
          },
        }),

        columnHelper.accessor('locationName', {
          header: 'Location',
          cell: (info) => <p className='text-sm'>{info.getValue() || '-'}</p>,
        }),

        columnHelper.accessor('roles', {
          header: 'Roles',
          cell: (info) => {
            const roles = info.getValue()
            return (
              <div className='flex flex-wrap gap-1'>
                {roles && roles.length > 0 ? (
                  roles.map((role, idx) => (
                    <span
                      key={idx}
                      className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
                      {role}
                    </span>
                  ))
                ) : (
                  <span className='text-xs text-muted'>-</span>
                )}
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
                    className='cursor-pointer text-red-600 focus:text-red-700'>
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
      ] as ColumnDef<ApplicationUserType>[],
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
        userData as unknown as Record<string, unknown>[],
        columnFilters
      ) as unknown as ApplicationUserType[],
    [userData, columnFilters]
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
        .map((col) => (col as any).accessorKey as keyof ApplicationUserType),
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
      visibleExportKeys.map((key) => {
        const val = row[key]
        if (key === 'roles' && Array.isArray(val)) return val.join('; ')
        if (key === 'isActive') return val ? 'Active' : 'Inactive'
        return val ?? ''
      })
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
    link.setAttribute('download', 'application-users.csv')
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
            Manage Application Users
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
                aria-label='Search users'
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
              aria-label='Create Application User'>
              Create User
            </Button>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' ? 'Create Application User' : 'Edit Application User'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'create'
                  ? 'Enter new application user information and save to the database.'
                  : 'Update the application user record and save your changes.'}
              </DialogDescription>
            </DialogHeader>

            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Username</label>
                  <Input
                    value={currentUser.userName ?? ''}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        userName: e.target.value,
                      }))
                    }
                    placeholder='Username'
                  />
                </div>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Email</label>
                  <Input
                    type='email'
                    value={currentUser.email ?? ''}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder='Email'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>First Name</label>
                  <Input
                    value={currentUser.firstName ?? ''}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder='First Name'
                  />
                </div>
                <div className='grid gap-2'>
                  <label className='text-sm font-medium'>Last Name</label>
                  <Input
                    value={currentUser.lastName ?? ''}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder='Last Name'
                  />
                </div>
              </div>

              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Password {dialogMode === 'edit' && '(leave blank to keep current)'}</label>
                <Input
                  type='password'
                  value={currentUser.password ?? ''}
                  onChange={(e) =>
                    setCurrentUser((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder={dialogMode === 'create' ? 'Password' : 'New Password (optional)'}
                />
              </div>

              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Role</label>
                <Select
                  value={currentUser.role ?? ''}
                  onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.id} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid gap-2'>
                <label className='text-sm font-medium'>Location</label>
                <Select
                  value={currentUser.locationId ? String(currentUser.locationId) : ''}
                  onValueChange={handleLocationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select location' />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.tbld_LocationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center justify-between rounded-lg border p-3'>
                <div>
                  <label className='text-sm font-medium'>Active</label>
                  <p className='text-xs text-muted-foreground'>
                    {currentUser.isActive ? 'User is active' : 'User is inactive'}
                  </p>
                </div>
                <Switch
                  checked={currentUser.isActive ?? true}
                  onCheckedChange={(checked) =>
                    setCurrentUser((prev) => ({
                      ...prev,
                      isActive: checked,
                    }))
                  }
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
                disabled={
                  apiLoading ||
                  !currentUser.userName ||
                  !currentUser.firstName ||
                  !currentUser.email ||
                  !currentUser.role ||
                  !currentUser.locationId ||
                  (dialogMode === 'create' && !currentUser.password)
                }>
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
                            ? (userData.map((row) => row[columnKey as keyof ApplicationUserType]) as (string | number | boolean | string[] | undefined)[])
                            : []
                        const isFilterable =
                          enableColumnFilters &&
                          columnKey &&
                          columnKey !== 'id' &&
                          ['userName', 'firstName', 'lastName', 'email', 'locationName'].includes(
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
                        No users found.
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
                                cell.column.id === 'userName' ||
                                cell.column.id === 'email' ||
                                cell.column.id === 'locationName'
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

export default ApplicationUserTable
