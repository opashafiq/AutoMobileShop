'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type SortingState,
} from '@tanstack/react-table'
import { Icon } from '@iconify/react'

import { getApiUrl, getFetcher } from '@/app/api/globalFetcher'
import { getUserSession } from '@/app/api/auth'
import {
  type AuditTrailPagedResponse,
  type AuditTrailItem,
  type AuditTrailEventType,
} from '@/app/(DashboardLayout)/types/apps/auditTrail'
import { type ApplicationUserType } from '@/app/models/interfaces'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
const formatDateTime = (value?: string | null): string => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** Pretty-print a JSON string that the backend sends in `changes` / `metadata`. */
const prettyJson = (raw: string | null): string => {
  if (!raw) return ''
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

/** Badge variant per event-type key (matches the backend EventTypes lookup). */
const eventTypeBadge = (eventTypeName: string): 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary' => {
  switch (eventTypeName) {
    case 'Create': return 'primary'
    case 'Read': return 'info'
    case 'Update': return 'warning'
    case 'Delete': return 'error'
    case 'Login': return 'success'
    case 'Logout': return 'secondary'
    case 'PermissionChange': return 'warning'
    default: return 'default'
  }
}

const columnHelper = createColumnHelper<AuditTrailItem>()

// Columns that get a funnel filter in the header (client-side, current page).
// The EXTRACTORS map tells the funnel which field feeds it / is matched —
// e.g. the "Event Type" funnel filters on eventTypeName, and the Status funnel
// filters on the display string ("Success"/"Failed") instead of the boolean.
const FILTERABLE_COLUMNS = ['event', 'eventType', 'entityName', 'entityId', 'performedByName', 'ipAddress', 'performedAt', 'isSuccess']

const EXTRACTORS: Record<string, (item: AuditTrailItem) => string | number | undefined> = {
  event: (item) => item.event ?? undefined,
  eventType: (item) => item.eventTypeName || undefined,
  entityName: (item) => item.entityName ?? undefined,
  entityId: (item) => item.entityId ?? undefined,
  performedByName: (item) => item.performedByName ?? undefined,
  ipAddress: (item) => item.ipAddress ?? undefined,
  performedAt: (item) => item.performedAt ?? undefined,
  isSuccess: (item) => (item.isSuccess ? 'Success' : 'Failed'),
}

export default function AuditTrailDatatable() {
  // ---- Role-based scope: admins see everyone's activity, others only their own ----
  const userSession = getUserSession()
  const isAdmin = userSession?.roles?.some(
    (role: string) => role.toLowerCase() === 'admin'
  ) ?? false
  const sessionUserName = userSession?.userName ?? ''

  // ----- API-side filter state (committed on Search/Reset so keystrokes don't refetch) -----
  const [event, setEvent] = useState('')
  const [eventType, setEventType] = useState('')
  const [entityName, setEntityName] = useState('')
  const [performedByName, setPerformedByName] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)
  // Non-admins start scoped to their own activity; admins start unfiltered.
  const [filterParams, setFilterParams] = useState(() =>
    !isAdmin && sessionUserName ? `performedByName=${encodeURIComponent(sessionUserName)}` : ''
  )

  // ---- Server-side pagination ----
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Application-user list (id-userName) backing the "Performed By Name" combo-box
  const USERS_URL = getApiUrl('/api/ApplicationUser')
  const { data: usersData } = useSWR<ApplicationUserType[]>(USERS_URL, getFetcher)
  const users: ApplicationUserType[] = usersData ?? []

  const queryString = `pageNumber=${pageNumber}&pageSize=${pageSize}${filterParams ? `&${filterParams}` : ''}`
  const API_URL = getApiUrl(`/api/AuditTrail?${queryString}`)
  const { data, isLoading, error, mutate } = useSWR<AuditTrailPagedResponse>(API_URL, getFetcher)

  // EventType key/value lookup for the combo-box filter (GET /api/AuditTrail/EventTypes)
  const EVENT_TYPES_URL = getApiUrl('/api/AuditTrail/EventTypes')
  const { data: eventTypesData } = useSWR<AuditTrailEventType[]>(EVENT_TYPES_URL, getFetcher)
  const eventTypes: AuditTrailEventType[] = eventTypesData ?? []

  const [tableData, setTableData] = useState<AuditTrailItem[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [showSearch, setShowSearch] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  // Per-column funnel filters in the header (see FILTERABLE_COLUMNS / EXTRACTORS)
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({})
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true,
    event: true,
    eventType: true,
    entityName: true,
    entityId: true,
    performedByName: true,
    performedAt: true,
    ipAddress: true,
    isSuccess: true,
  })

  useEffect(() => {
    if (data) {
      setTableData(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
      setTotalPages(data.totalPages ?? 0)
    }
  }, [data])

  // If the server reports fewer pages than our current pageNumber (e.g. after a
  // filter narrows the result set), snap back to the last valid page.
  useEffect(() => {
    if (totalPages > 0 && pageNumber > totalPages) {
      setPageNumber(totalPages)
    }
  }, [totalPages, pageNumber])

  // ---- column funnel filters ----
  const handleColumnFilterChange = (columnKey: string, value: ColumnFilterValue) => {
    setColumnFilters((prev) => ({ ...prev, [columnKey]: value }))
  }
  const handleClearAllFilters = () => setColumnFilters({})

  // Pre-extract funnel values per filterable column (status booleans are
  // mapped to their display strings).
  const filterDataMap = useMemo(() => {
    const map: Record<string, (string | number | undefined)[]> = {}
    for (const colId of FILTERABLE_COLUMNS) {
      map[colId] = tableData.map((row) => EXTRACTORS[colId](row))
    }
    return map
  }, [tableData])

  // Rows with the same display normalization applied, so funnel filters
  // (e.g. Status = 'Failed') match the actual row values.
  const filterRows = useMemo(
    () => tableData.map((row) => ({ ...row, ...Object.fromEntries(FILTERABLE_COLUMNS.map((c) => [c, EXTRACTORS[c](row)])) })),
    [tableData],
  )
  // Apply column filters, then hand the untouched rows back to the table.
  const filteredData = useMemo(
    () => applyColumnFilters(filterRows as unknown as Record<string, unknown>[], columnFilters) as unknown as AuditTrailItem[],
    [filterRows, columnFilters],
  )

  // ---- columns ----
  const allColumns = useMemo<ColumnDef<AuditTrailItem>[]>(() => {
    return [
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
        id: 'id',
        header: 'Id',
        cell: ({ row }) => <span className='font-semibold text-primary'>{row.original.id}</span>,
      }),
      columnHelper.display({
        id: 'event',
        header: 'Event',
        cell: ({ row }) => <p className='text-sm'>{row.original.event || '-'}</p>,
      }),
      columnHelper.display({
        id: 'eventType',
        header: 'Event Type',
        cell: ({ row }) => (
          <Badge variant={eventTypeBadge(row.original.eventTypeName)}>
            {row.original.eventTypeName || row.original.eventType}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'entityName',
        header: 'Entity',
        cell: ({ row }) => <p className='text-sm'>{row.original.entityName || '-'}</p>,
      }),
      columnHelper.display({
        id: 'entityId',
        header: 'Entity Id',
        cell: ({ row }) => <p className='text-sm'>{row.original.entityId || '-'}</p>,
      }),
      columnHelper.display({
        id: 'performedByName',
        header: 'Performed By',
        cell: ({ row }) => <p className='text-sm'>{row.original.performedByName || '-'}</p>,
      }),
      columnHelper.display({
        id: 'performedAt',
        header: 'Performed At',
        cell: ({ row }) => <p className='text-sm'>{formatDateTime(row.original.performedAt)}</p>,
      }),
      columnHelper.display({
        id: 'ipAddress',
        header: 'IP Address',
        cell: ({ row }) => <p className='text-sm'>{row.original.ipAddress || '-'}</p>,
      }),
      columnHelper.display({
        id: 'isSuccess',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isSuccess ? 'lightSuccess' : 'lightError'}>
            {row.original.isSuccess ? 'Success' : 'Failed'}
          </Badge>
        ),
      }),
    ] as ColumnDef<AuditTrailItem>[]
  }, [])

  // Filter columns based on visibility (expander always visible)
  const visibleColumns = useMemo(
    () => allColumns.filter((col) => (col.id === 'expander' ? true : col.id ? columnVisibility[col.id] : true)),
    [allColumns, columnVisibility],
  )

  // ---- API filter bar (Event, EventType, EntityName, PerformedByName, IpAddress, StartDate, EndDate) ----
  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams()
    if (event.trim()) params.set('event', event.trim())
    if (eventType && eventType !== 'all') params.set('eventType', eventType)
    if (entityName.trim()) params.set('entityName', entityName.trim())
    // Admins filter by the selected user; others are always scoped to themselves.
    if (!isAdmin) {
      params.set('performedByName', sessionUserName)
    } else if (performedByName && performedByName !== 'all') {
      params.set('performedByName', performedByName)
    }
    if (ipAddress.trim()) params.set('ipAddress', ipAddress.trim())
    if (startDate) params.set('startDate', startDate.toISOString())
    if (endDate) params.set('endDate', endDate.toISOString())
    return params.toString()
  }, [event, eventType, entityName, performedByName, ipAddress, startDate, endDate, isAdmin, sessionUserName])

  const handleSearch = () => {
    setFilterParams(buildFilterParams())
    setPageNumber(1)
  }

  const resetFilters = () => {
    setEvent('')
    setEventType('')
    setEntityName('')
    setPerformedByName('')
    setIpAddress('')
    setStartDate(undefined)
    setEndDate(undefined)
    // Reset restores the role scope too (non-admins keep their own-activity filter).
    setFilterParams(!isAdmin && sessionUserName ? `performedByName=${encodeURIComponent(sessionUserName)}` : '')
    setPageNumber(1)
  }

  const table = useReactTable({
    data: filteredData,
    columns: visibleColumns,
    state: { sorting, globalFilter, expanded },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  // ---- CSV export ----
  const visibleExportKeys = useMemo(
    () => visibleColumns
      .filter((col) => col.id && !['expander'].includes(col.id))
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
    const rows = tableData.map((row) =>
      visibleExportKeys.map((key) => {
        switch (key) {
          case 'id': return row.id
          case 'event': return row.event
          case 'eventType': return row.eventTypeName
          case 'entityName': return row.entityName
          case 'entityId': return row.entityId
          case 'performedByName': return row.performedByName
          case 'performedAt': return formatDateTime(row.performedAt)
          case 'ipAddress': return row.ipAddress
          case 'isSuccess': return row.isSuccess ? 'Success' : 'Failed'
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
    a.href = url; a.download = 'audit-trail.csv'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [tableData, visibleExportKeys, exportHeaders])

  return (
    <Card>
      <div>
        {/* ---- Toolbar ---- */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5'>
          <h3 className='text-lg font-semibold text-dark dark:text-white mb-4 md:mb-0'>
            Audit Trail
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
                aria-label='Search audit trail'
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
            {Object.values(columnFilters).some((v) => v !== null) && (
              <Button variant='secondary' onClick={handleClearAllFilters} size='sm' className='text-xs'>
                <Icon icon='solar:close-circle-outline' width={16} height={16} className='me-1' />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* ---- API-side filter bar (toggleable via the filter button in the toolbar) ---- */}
        {showFilters && (
          <div className='mb-4 rounded-lg border border-ld bg-lightprimary/10 p-4 dark:bg-darkinfo/5'>
            <div className='flex flex-wrap items-end gap-4'>
              <div className='min-w-[150px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Event</Label>
                <Input
                  placeholder='Filter by event'
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className='h-10'
                />
              </div>
              <div className='min-w-[150px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className='h-10' aria-label='Event type'>
                    <SelectValue placeholder='All' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    {eventTypes.map((et) => (
                      <SelectItem key={et.key} value={String(et.key)}>{et.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='min-w-[150px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Entity Name</Label>
                <Input
                  placeholder='Filter by entity'
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className='h-10'
                />
              </div>
              <div className='min-w-[150px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Performed By Name</Label>
                <Select
                  value={isAdmin ? performedByName : sessionUserName}
                  onValueChange={setPerformedByName}
                  disabled={!isAdmin}
                >
                  <SelectTrigger className='h-10' aria-label='Performed by name'>
                    <SelectValue placeholder='All' />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdmin && <SelectItem value='all'>All</SelectItem>}
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.userName}>{user.userName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='min-w-[150px] flex-1'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>IP Address</Label>
                <Input
                  placeholder='Filter by ip'
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className='h-10'
                />
              </div>
              <div className='flex-none w-[180px]'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>Start Date</Label>
                <Popover open={openStart} onOpenChange={setOpenStart}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='h-10 w-full justify-between font-normal text-ld border-ld'
                    >
                      {startDate ? format(startDate, 'dd/MM/yyyy') : <span className='text-darklink'>Pick date</span>}
                      <Icon icon='solar:calendar-linear' width={16} height={16} className='shrink-0 opacity-60' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={startDate}
                      onSelect={(date) => { setStartDate(date); setOpenStart(false) }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className='flex-none w-[180px]'>
                <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>End Date</Label>
                <Popover open={openEnd} onOpenChange={setOpenEnd}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='h-10 w-full justify-between font-normal text-ld border-ld'
                    >
                      {endDate ? format(endDate, 'dd/MM/yyyy') : <span className='text-darklink'>Pick date</span>}
                      <Icon icon='solar:calendar-linear' width={16} height={16} className='shrink-0 opacity-60' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={endDate}
                      onSelect={(date) => { setEndDate(date); setOpenEnd(false) }}
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
            Failed to load audit trail. Please ensure the backend API is reachable.
          </div>
        )}

        {/* ---- Table ---- */}
        <div className='overflow-x-auto'>
          <div className='border rounded-md border-ld'>
            <div>
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
                                {FILTERABLE_COLUMNS.includes(colId) && (
                                  <ColumnFilterInput
                                    columnData={colData as (string | number | undefined)[]}
                                    filterValue={columnFilters[colId] || undefined}
                                    onFilterChange={(value) => handleColumnFilterChange(colId, value)}
                                    columnName={String(header.column.columnDef.header || colId)}
                                    filterType={colId === 'performedAt' ? 'date' : undefined}
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
                        {isLoading ? 'Loading audit trail...' : 'No audit entries found.'}
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <FragmentRow key={row.id} row={row} index={index} />
                    ))
                  )}
                </AnimatedTableBody>
              </table>
            </div>
          </div>
        </div>

        {/* ---- Pagination (server-side: pageNumber / pageSize / totalCount / totalPages) ---- */}
        {totalCount > 0 ? (
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3'>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted dark:text-lightgray'>Show</p>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => { setPageSize(Number(value)); setPageNumber(1) }}
              >
                <SelectTrigger className='w-fit' aria-label='Select number of rows per page'>
                  <SelectValue placeholder='Rows per page' />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-sm text-muted dark:text-lightgray'>per page</p>
            </div>
            <div className='flex items-center gap-3'>
              <p className='text-sm font-normal text-muted dark:text-lightgray'>
                {`${(pageNumber - 1) * pageSize + 1}-${Math.min(pageNumber * pageSize, totalCount)} of ${totalCount}`}
              </p>
              <div className='flex items-center gap-1.5'>
                <Icon
                  icon='solar:arrow-left-line-duotone'
                  className={`text-dark dark:text-white hover:text-primary ${pageNumber <= 1 ? 'opacity-50 cursor-not-allowed!' : 'cursor-pointer'}`}
                  width={20} height={20}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                />
                {buildPageNumbers(pageNumber, totalPages).map((p, idx) =>
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
        ) : null}
      </div>
    </Card>
  )
}

/** Build a compact list of page numbers (with ellipses) for the pager, e.g. 1 … 4 [5] 6 … 14 */
const buildPageNumbers = (pageNumber: number, totalPages: number): (number | '…')[] => {
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
}

// ---- Expanded row detail (kept in its own component for readability) ----
function FragmentRow({ row, index }: { row: any; index: number }) {
  const item: AuditTrailItem = row.original
  const changesJson = prettyJson(item.changes)
  const metadataJson = prettyJson(item.metadata)

  return (
    <>
      <AnimatedTableRow
        index={index}
        className={`border-b last:border-b-0 border-ld transition-colors duration-200 ${
          item.isSuccess
            ? 'hover:bg-lightprimary'
            : 'bg-lighterror/20 hover:bg-lighterror/30 dark:bg-lighterror/10'
        }`}
      >
        {row.getVisibleCells().map((cell: any) => (
          <td key={cell.id} className='px-4 py-2 text-left'>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </AnimatedTableRow>
      {row.getIsExpanded() && (
        <tr className='bg-lightprimary/10'>
          <td colSpan={row.getVisibleCells().length} className='p-4'>
            <div className='rounded-lg border border-ld bg-white p-3 dark:bg-dark'>
              {/* ---- Description & session info ---- */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm'>
                <div>
                  <p className='text-xs font-semibold uppercase text-darklink dark:text-bodytext'>Description</p>
                  <p className='mt-1 text-ld dark:text-darklink'>{item.description || '—'}</p>
                </div>
                <div>
                  <p className='text-xs font-semibold uppercase text-darklink dark:text-bodytext'>Performed By</p>
                  <p className='mt-1 text-ld dark:text-darklink'>
                    {item.performedByName || '—'}
                    {item.performedById && item.performedById !== item.performedByName ? ` (${item.performedById})` : ''}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-semibold uppercase text-darklink dark:text-bodytext'>User Agent</p>
                  <p className='mt-1 break-words text-ld dark:text-darklink'>{item.userAgent || '—'}</p>
                </div>
                <div>
                  <p className='text-xs font-semibold uppercase text-darklink dark:text-bodytext'>Correlation Id</p>
                  <p className='mt-1 text-ld dark:text-darklink'>{item.correlationId || '—'}</p>
                </div>
              </div>
              {/* ---- Raw JSON payloads ---- */}
              <div className='mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2'>
                {changesJson && (
                  <div className='rounded-md border border-ld/60 p-3'>
                    <p className='mb-1.5 text-xs font-semibold uppercase text-darklink dark:text-bodytext'>Changes</p>
                    <pre className='max-h-64 overflow-auto text-xs whitespace-pre-wrap break-words text-ld dark:text-darklink'>
                      {changesJson}
                    </pre>
                  </div>
                )}
                {metadataJson && (
                  <div className='rounded-md border border-ld/60 p-3'>
                    <p className='mb-1.5 text-xs font-semibold uppercase text-darklink dark:text-bodytext'>Metadata</p>
                    <pre className='max-h-64 overflow-auto text-xs whitespace-pre-wrap break-words text-ld dark:text-darklink'>
                      {metadataJson}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
