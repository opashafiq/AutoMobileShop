'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import jsPDF from 'jspdf'
import { format as formatDateFn } from 'date-fns'
import {
  buildVectorReportPdf,
  VectorPdfTableSpec,
} from '@/app/components/react-tables/shared/vectorReportPdf'
import type { Styles } from 'jspdf-autotable'
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
    implemented: true,
    dateMode: 'range',
    pdfTitle: 'Daily Report (Date Range)',
    fileBase: 'Daily_Report_Range',
  },
  {
    key: 'weeklyMonthly',
    label: 'Weekly/Monthly Report',
    implemented: true,
    dateMode: 'range',
    pdfTitle: 'Weekly/Monthly Report',
    fileBase: 'Weekly_Report',
  },
  {
    key: 'checkRegister',
    label: 'Check Register',
    implemented: true,
    dateMode: 'range',
    pdfTitle: 'Check Register',
    fileBase: 'Check_Register',
  },
  {
    key: 'invoiceData',
    label: 'Invoice Data',
    implemented: true,
    dateMode: 'range',
    pdfTitle: 'Invoice Data',
    fileBase: 'Invoice_Data',
  },
  {
    key: 'onCredit',
    label: 'On Credit',
    implemented: true,
    dateMode: 'range',
    pdfTitle: 'Pending Amount Report',
    fileBase: 'Pending_Amount',
  },
]

/* ── Column configuration (data-driven so later reports can reuse it) ── */

interface ColumnConfig {
  key: string
  header: string
  type: 'text' | 'number' | 'currency' | 'date'
  /** Show the funnel column filter in the table header */
  filterable?: boolean
  /** Minimum width in pixels for the cell */
  minWidth?: number
}

const DAILY_COLUMNS: ColumnConfig[] = [
  { key: 'categoryName', header: 'Description', type: 'text', filterable: true, minWidth: 250 },
  { key: 'totalAmount', header: 'Amount', type: 'currency', filterable: true, minWidth: 120 },
  { key: 'paydate', header: 'Pay Date', type: 'text', filterable: true },
]

/* Same layout as the Daily Report: the selected date range is printed in the
   report header (and summary chips) instead of being repeated on every row. */
const DAILY_RANGE_COLUMNS: ColumnConfig[] = [
  { key: 'categoryName', header: 'Description', type: 'text', filterable: true, minWidth: 250 },
  { key: 'totalAmount', header: 'Amount', type: 'currency', filterable: true, minWidth: 120 },
  { key: 'paydate', header: 'Pay Date', type: 'text', filterable: true },
]

/* Weekly/Monthly Report — one row per day, one amount column per payment method.
   `Grand Total` is not returned by the API; it is computed client-side as the sum
   of the ten amount columns (WEEKLY_AMOUNT_KEYS) during data normalization. */
const WEEKLY_COLUMNS: ColumnConfig[] = [
  { key: 'date', header: 'Date', type: 'date', filterable: true, minWidth: 110 },
  { key: 'credit', header: 'Credit', type: 'currency', filterable: true },
  { key: 'cash', header: 'Cash', type: 'currency', filterable: true },
  { key: 'creditCardVisa', header: 'CreditCard Visa', type: 'currency', filterable: true, minWidth: 110 },
  { key: 'debitcard', header: 'DEBIT CARD', type: 'currency', filterable: true, minWidth: 105 },
  { key: 'checkElectReg', header: 'CHECKElect Reg', type: 'currency', filterable: true, minWidth: 115 },
  { key: 'creditCardMaster', header: 'CreditCard Master', type: 'currency', filterable: true, minWidth: 125 },
  { key: 'creditCardDisc', header: 'CreditCard Disc', type: 'currency', filterable: true, minWidth: 120 },
  { key: 'creditCardAmex', header: 'CreditCard Amex', type: 'currency', filterable: true, minWidth: 118 },
  { key: 'crestFinance', header: 'Finance 1-K', type: 'currency', filterable: true, minWidth: 95 },
  { key: 'progFinance', header: 'Finance 1-P', type: 'currency', filterable: true, minWidth: 95 },
  { key: 'grandTotal', header: 'Grand Total', type: 'currency', filterable: true, minWidth: 100 },
]

const WEEKLY_AMOUNT_KEYS = [
  'credit',
  'cash',
  'creditCardVisa',
  'debitcard',
  'checkElectReg',
  'creditCardMaster',
  'creditCardDisc',
  'creditCardAmex',
  'crestFinance',
  'progFinance',
] as const

/* Check Register — one flat row per payment (date + payment name + amount).
   The datatable shows these flat rows; the PDF groups them per date with a
   per-day subtotal, following the legacy CheckRegister.pdf layout. */
const CHECK_REGISTER_COLUMNS: ColumnConfig[] = [
  { key: 'tbip_Date', header: 'Date', type: 'date', filterable: true, minWidth: 110 },
  { key: 'tbpn_PaymentName', header: 'Description', type: 'text', filterable: true, minWidth: 220 },
  { key: 'tbip_PayAmt', header: 'Amount', type: 'currency', filterable: true, minWidth: 120 },
]

/* On Credit (Pending Amount Report) — one row per pending / partially paid invoice.
   `pendingAmount` (Total − Paid Amount) is not returned by the API; it is derived
   during data normalization, like the Weekly report's Grand Total. There is no
   legacy PDF for this report, so it renders the shared striped table with a
   totals footer row. */
const PENDING_COLUMNS: ColumnConfig[] = [
  { key: 'tbim_InvDate', header: 'Invoice Date', type: 'date', filterable: true, minWidth: 110 },
  { key: 'tbim_InvoiceIdRad', header: 'Invoice No', type: 'text', filterable: true, minWidth: 100 },
  { key: 'tbim_Name', header: 'Customer', type: 'text', filterable: true, minWidth: 150 },
  { key: 'tbti_ComName', header: 'Company', type: 'text', filterable: true, minWidth: 140 },
  { key: 'tbip_Paymentname', header: 'Payment Method(s)', type: 'text', filterable: true, minWidth: 150 },
  { key: 'tbim_Total', header: 'Total', type: 'currency', filterable: true, minWidth: 110 },
  { key: 'tbim_PaidAmt', header: 'Paid Amount', type: 'currency', filterable: true, minWidth: 110 },
  { key: 'pendingAmount', header: 'Pending Amount', type: 'currency', filterable: true, minWidth: 120 },
  { key: 'payInfo', header: 'Status', type: 'text', filterable: true },
]

/* Invoice Data — one row per invoice with customer, vehicle and payment details.
   Wide table with horizontal scroll; the PDF renders a legacy-style card layout
   (main row + vehicle / notes detail row) instead of this flat table. */
const INVOICE_DATA_COLUMNS: ColumnConfig[] = [
  { key: 'invoiceDate', header: 'Date', type: 'date', filterable: true, minWidth: 105 },
  { key: 'invoiceId', header: 'Transaction ID', type: 'text', filterable: true, minWidth: 110 },
  { key: 'name', header: 'Customer Name', type: 'text', filterable: true, minWidth: 150 },
  { key: 'total', header: 'Amount', type: 'currency', filterable: true, minWidth: 100 },
  { key: 'tbip_Paymentname', header: 'Payment Type', type: 'text', filterable: true, minWidth: 130 },
  { key: 'companyName', header: 'Company Name', type: 'text', filterable: true, minWidth: 130 },
  { key: 'vehicle', header: 'Vehicle Make', type: 'text', filterable: true, minWidth: 110 },
  { key: 'model', header: 'Model', type: 'text', filterable: true, minWidth: 110 },
  { key: 'year', header: 'Year', type: 'text', filterable: true },
  { key: 'license', header: 'License', type: 'text', filterable: true, minWidth: 110 },
  { key: 'phone', header: 'Phone', type: 'text', filterable: true, minWidth: 110 },
  { key: 'address', header: 'Address', type: 'text', filterable: true, minWidth: 140 },
  { key: 'odometer', header: 'Odometer', type: 'text', filterable: true, minWidth: 90 },
  { key: 'taxNumber', header: 'Tax Id', type: 'text', filterable: true, minWidth: 110 },
  { key: 'treadDepth', header: 'Tread Depth', type: 'text', filterable: true, minWidth: 90 },
  { key: 'notes', header: 'Note', type: 'text', filterable: true, minWidth: 220 },
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

/** Backend dotted date → ISO (`yyyy-mm-dd`) so sorting works.
 *  Auto-detects `dd.mm.yyyy` vs `mm.dd.yyyy`: when one component exceeds 12 it
 *  must be the day. `mode` resolves ambiguous dates (both ≤ 12): Daily/Weekly
 *  endpoints use `dd.mm.yyyy`; the Check Register / Pending Amount report
 *  responses are proven `mm.dd.yyyy` (e.g. `06.21.2025`, `04.13.2017`). */
function apiDottedDateToIso(
  value: string,
  mode: 'dmy' | 'mdy' = 'dmy'
): string {
  const parts = value.split('.')
  if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
    const [a, b, yyyy] = parts
    if (parseInt(a, 10) > 12) {
      return `${yyyy}-${b.padStart(2, '0')}-${a.padStart(2, '0')}` // a = day
    }
    if (parseInt(b, 10) > 12) {
      return `${yyyy}-${a.padStart(2, '0')}-${b.padStart(2, '0')}` // b = day
    }
    return mode === 'mdy'
      ? `${yyyy}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`
      : `${yyyy}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`
  }
  return value
}

/** Coerce an API numeric cell to a usable number. */
function numOrZero(value: string | number): number {
  return typeof value === 'number' ? value : Number(value ?? 0) || 0
}

/** ISO date → `dd-MMM-yyyy` (the format used in the legacy report PDFs). */
function formatReportDate(value: string | number): string {
  const s = String(value ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return formatDateFn(new Date(`${s}T00:00:00`), 'dd-MMM-yyyy')
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

/** Filename suffix for a report: single date or `from_to` for a date range. */
function fileSuffix(report: ReportDef, from: string, to: string): string {
  if (report.dateMode === 'range') {
    const parts = [from, to].filter(Boolean).map(toApiDate)
    return parts.length > 0 ? `_${parts.join('_')}` : ''
  }
  return from ? `_${toApiDate(from)}` : ''
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
    () => {
      switch (activeReport.key) {
        case 'daily':
          return DAILY_COLUMNS
        case 'dailyRange':
          return DAILY_RANGE_COLUMNS
        case 'weeklyMonthly':
          return WEEKLY_COLUMNS
        case 'checkRegister':
          return CHECK_REGISTER_COLUMNS
        case 'onCredit':
          return PENDING_COLUMNS
        case 'invoiceData':
          return INVOICE_DATA_COLUMNS
        default:
          return []
      }
    },
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
      case 'dailyRange': {
        const base = getApiUrl('/api/Reports/GetdailyReportRange')
        const params = new URLSearchParams()
        if (query.from) params.set('StartDate', toApiDate(query.from))
        if (query.to) params.set('EndDate', toApiDate(query.to))
        const qs = params.toString()
        return qs ? `${base}?${qs}` : base
      }
      case 'weeklyMonthly': {
        const base = getApiUrl('/api/Reports/GetdailyWeeklyReport')
        const params = new URLSearchParams()
        if (query.from) params.set('StartDate', toApiDate(query.from))
        if (query.to) params.set('EndDate', toApiDate(query.to))
        const qs = params.toString()
        return qs ? `${base}?${qs}` : base
      }
      case 'checkRegister': {
        const base = getApiUrl('/api/Reports/GetCheckRegisterReport')
        const params = new URLSearchParams()
        if (query.from) params.set('StartDate', toApiDate(query.from))
        if (query.to) params.set('EndDate', toApiDate(query.to))
        const qs = params.toString()
        return qs ? `${base}?${qs}` : base
      }
      case 'onCredit': {
        const base = getApiUrl('/api/Reports/GetPendingAmount')
        const params = new URLSearchParams()
        if (query.from) params.set('StartDate', toApiDate(query.from))
        if (query.to) params.set('EndDate', toApiDate(query.to))
        const qs = params.toString()
        return qs ? `${base}?${qs}` : base
      }
      case 'invoiceData': {
        const base = getApiUrl('/api/Reports/GetInvoiceData')
        const params = new URLSearchParams()
        if (query.from) params.set('StartDate', toApiDate(query.from))
        if (query.to) params.set('EndDate', toApiDate(query.to))
        const qs = params.toString()
        return qs ? `${base}?${qs}` : base
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

  const reportData = useMemo(() => {
    if (!Array.isArray(rawReportData)) return []
    if (activeReport.key === 'weeklyMonthly') {
      /* Normalize the Weekly Report rows: backend `dd.mm.yyyy` dates become
         ISO (sortable / displayable) and the per-row Grand Total is derived
         by summing the ten payment-method amounts. */
      return rawReportData.map((row) => {
        const grandTotal = WEEKLY_AMOUNT_KEYS.reduce(
          (sum, key) => sum + (typeof row[key] === 'number' ? (row[key] as number) : Number(row[key] ?? 0)),
          0
        )
        return { ...row, date: apiDottedDateToIso(String(row.date ?? '')), grandTotal }
      }) as ReportRow[]
    }
    if (activeReport.key === 'checkRegister') {
      /* Normalize the Check Register rows: backend `mm.dd.yyyy` dates (e.g.
         `06.21.2025`) become ISO so the date column sorts and prints correctly. */
      return rawReportData.map((row) => ({
        ...row,
        tbip_Date: apiDottedDateToIso(String(row.tbip_Date ?? ''), 'mdy'),
      })) as ReportRow[]
    }
    if (activeReport.key === 'onCredit') {
      /* Normalize the Pending Amount rows: backend `mm.dd.yyyy` invoice dates
         (e.g. `04.13.2017`) become ISO, and the pending amount is derived as
         Total − Paid Amount (not returned by the API). */
      return rawReportData.map((row) => ({
        ...row,
        tbim_InvDate: apiDottedDateToIso(String(row.tbim_InvDate ?? ''), 'mdy'),
        pendingAmount: numOrZero(row.tbim_Total) - numOrZero(row.tbim_PaidAmt),
      })) as ReportRow[]
    }
    if (activeReport.key === 'invoiceData') {
      /* Normalize the Invoice Data rows: backend `mm.dd.yyyy` invoice dates
         (e.g. `01.02.2025` = January 02 with `StartDate=01-Jan-2025`) become
         ISO so the date column sorts and prints correctly. */
      return rawReportData.map((row) => ({
        ...row,
        invoiceDate: apiDottedDateToIso(String(row.invoiceDate ?? ''), 'mdy'),
      })) as ReportRow[]
    }
    return rawReportData
  }, [rawReportData, activeReport])

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
            if (cfg.type === 'date') {
              return <p className='text-sm'>{dashIfEmpty(formatReportDate(value))}</p>
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

  /* ── Check Register PDF groups: filtered rows grouped per date (ascending)
     with a per-day subtotal, following the legacy CheckRegister.pdf layout. ── */
  const pdfCheckGroups = useMemo(() => {
    if (activeReport.key !== 'checkRegister') return null
    const byDate = new Map<string, ReportRow[]>()
    filteredData.forEach((row) => {
      const key = String(row.tbip_Date ?? '')
      if (!byDate.has(key)) byDate.set(key, [])
      byDate.get(key)?.push(row)
    })
    let grandTotal = 0
    const groups = Array.from(byDate.keys())
      .sort()
      .map((date) => {
        const rows = (byDate.get(date) ?? [])
          .map((row) => ({
            name: String(row.tbpn_PaymentName ?? ''),
            amount:
              typeof row.tbip_PayAmt === 'number'
                ? (row.tbip_PayAmt as number)
                : Number(row.tbip_PayAmt ?? 0),
          }))
          .sort((x, y) => x.name.localeCompare(y.name))
        const total = rows.reduce((sum, r) => sum + r.amount, 0)
        grandTotal += total
        return { date, rows, total }
      })
    return { groups, grandTotal }
  }, [filteredData, activeReport])

  /* ── Invoice Data PDF rows: filtered rows sorted per date (then ID) for the
     legacy-style chronological card layout. ── */
  const pdfInvoiceRows = useMemo(() => {
    if (activeReport.key !== 'invoiceData') return []
    return [...filteredData].sort((x, y) => {
      const dx = String(x.invoiceDate ?? '')
      const dy = String(y.invoiceDate ?? '')
      if (dx !== dy) return dx < dy ? -1 : 1
      return String(x.invoiceId ?? '').localeCompare(String(y.invoiceId ?? ''))
    })
  }, [filteredData, activeReport])

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
    let from = inputFrom
    let to = inputTo
    /* Guard against an inverted range coming from the two pickers */
    if (from && to && from > to) {
      ;[from, to] = [to, from]
      setInputFrom(from)
      setInputTo(to)
    }
    setQuery({ from, to })
  }

  /* ═══════════════════════════════════════════════════════════
     PDF HELPERS

     Vector PDF generation (shared `buildVectorReportPdf`): every
     page is drawn with jsPDF text/lines instead of a DOM
     screenshot, so exports stay fast and razor-sharp no matter
     how many rows the report carries (~870 in a full Check
     Register range). Each report key describes its table via a
     `VectorPdfTableSpec` — rows, colspan cells and per-column
     alignment/width — while the shared helper draws the company
     header block, title, date line and pagination.
     ═══════════════════════════════════════════════════════════ */

  const PDF_RIGHT: Partial<Styles> = { halign: 'right' }
  const PDF_BOLD_HEAD: Partial<Styles> = { fontStyle: 'bold', fillColor: [241, 245, 249] } // slate-100
  const PDF_BOLD_SUB: Partial<Styles> = { fontStyle: 'bold', fillColor: [248, 250, 252] } // slate-50
  const PDF_BOLD_RIGHT: Partial<Styles> = { fontStyle: 'bold', halign: 'right' }

  /** From/To (or single Date) line printed under the title. */
  const pdfDateLine = query && activeReport.dateMode !== 'none' && (query.from || query.to)
    ? activeReport.dateMode === 'range'
      ? `From: ${query.from ? toLongDate(query.from) : '—'}   To: ${query.to ? toLongDate(query.to) : '—'}`
      : `Date: ${toLongDate(query.from)}`
    : ''

  /** One cell of a vector PDF row: plain value or a wrapped colspan/style cell */
  type PdfCell = string | number | { content: string; colSpan?: number; styles?: Partial<Styles> }

  /* ── Check Register: rows grouped per date with day totals + grand total ── */
  const buildCheckRegisterTable = (): VectorPdfTableSpec => {
    const body: PdfCell[][] = []
    pdfCheckGroups?.groups.forEach((group) => {
      /* Date banner spans both columns */
      body.push([
        {
          content: `DATE : ${formatReportDate(group.date)}`,
          colSpan: 2,
          styles: PDF_BOLD_HEAD,
        },
      ])
      group.rows.forEach((r) =>
        body.push([r.name, { content: formatMoney(r.amount), styles: PDF_RIGHT }])
      )
      /* Per-day total closes the group */
      body.push([
        { content: 'Total', styles: PDF_BOLD_SUB },
        { content: formatMoney(group.total), styles: PDF_BOLD_RIGHT },
      ])
    })
    body.push([
      { content: 'GRAND TOTAL', styles: PDF_BOLD_HEAD },
      { content: formatMoney(pdfCheckGroups?.grandTotal ?? 0), styles: PDF_BOLD_RIGHT },
    ])
    return {
      head: [['Description of Transaction', 'Amount']],
      body,
      columnStyles: { 1: { cellWidth: 100, halign: 'right' } },
    }
  }

  /* ── Invoice Data: chronological rows plus a detail line per invoice ── */
  const buildInvoiceDataTable = (): VectorPdfTableSpec => {
    const body: PdfCell[][] = []
    pdfInvoiceRows.forEach((row) => {
      const meta = [
        row.vehicle || row.model || row.year
          ? `Vehicle: ${[row.vehicle, row.model, row.year].filter(Boolean).join(' ')}`
          : '',
        row.companyName ? `Company: ${row.companyName}` : '',
        row.taxNumber ? `Tax ID: ${row.taxNumber}` : '',
        row.license ? `License: ${row.license}` : '',
        row.odometer ? `Odometer: ${row.odometer}` : '',
        row.treadDepth ? `Tread Depth: ${row.treadDepth}` : '',
        row.address ? `Address: ${row.address}` : '',
      ]
        .filter(Boolean)
        .join('   •   ')
      body.push([
        String(row.invoiceId ?? '') || '—',
        formatReportDate(row.invoiceDate) || '—',
        row.name || '—',
        row.phone || '—',
        row.tbip_Paymentname || '—',
        typeof row.total === 'number' ? formatMoney(row.total) : '—',
      ])
      if (meta || row.notes) {
        body.push([
          {
            content: [meta, row.notes].filter(Boolean).join('\n'),
            colSpan: 6,
            styles: { fillColor: PDF_BOLD_SUB.fillColor },
          },
        ])
      }
    })
    return {
      head: [['Transaction ID', 'Date', 'Customer Name', 'Phone', 'Payment Type', 'Amount']],
      body,
    }
  }

  /* ── Default: one column per `activeColumns` entry (+ On Credit totals footer) ── */
  const buildGenericTable = (): VectorPdfTableSpec => {
    const body: PdfCell[][] = []
    filteredData.forEach((row) => {
      body.push(
        activeColumns.map((c): PdfCell => {
          const value = row[c.key]
          const isNumeric = c.type !== 'text' && c.type !== 'date'
          const text = c.type === 'date'
            ? formatReportDate(value) || '—'
            : c.type === 'text'
              ? String(value ?? '') || '—'
              : typeof value === 'number'
                ? formatMoney(value)
                : '—'
          return { content: text, styles: isNumeric ? PDF_RIGHT : undefined }
        })
      )
    })

    if (activeReport.key === 'onCredit' && filteredData.length > 0) {
      /* Pending Amount totals footer: summarize the amount columns */
      body.push([
        {
          content: `Totals (${filteredData.length} records)`,
          colSpan: 5,
          styles: PDF_BOLD_HEAD,
        },
        ...(['tbim_Total', 'tbim_PaidAmt', 'pendingAmount', 'payInfo'] as const).map(
          (key): PdfCell => ({
            content:
              activeColumns.find((c) => c.key === key)?.type === 'currency'
                ? formatMoney(filteredData.reduce((sum, row) => sum + numOrZero(row[key]), 0))
                : '',
            styles: PDF_BOLD_RIGHT,
          })
        ),
      ])
    }

    return {
      head: [activeColumns.map((c) => c.header)],
      body,
      /* Numeric columns hug the right edge like the print table */
      columnStyles: Object.fromEntries(
        activeColumns.map((c, i) => [
          i,
          c.type !== 'text' && c.type !== 'date'
            ? { halign: 'right', cellWidth: 70 }
            : {},
        ])
      ),
    }
  }

  const buildPdf = useCallback(async (): Promise<jsPDF | null> => {
    if (!activeReport.implemented) return null
    const table =
      activeReport.key === 'checkRegister' && pdfCheckGroups
        ? buildCheckRegisterTable()
        : activeReport.key === 'invoiceData'
          ? buildInvoiceDataTable()
          : buildGenericTable()

    return buildVectorReportPdf({ title: activeReport.pdfTitle ?? activeReport.label, dateLine: pdfDateLine, table })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReport, query, pdfCheckGroups, pdfInvoiceRows, filteredData, activeColumns])

  const handlePrint = async () => {
    const pdf = await buildPdf()
    if (!pdf) return
    const blobUrl = pdf.output('bloburl')
    window.open(blobUrl, '_blank')
  }

  const handleDownloadPdf = async () => {
    const pdf = await buildPdf()
    if (!pdf) return
    const suffix = query ? fileSuffix(activeReport, query.from, query.to) : ''
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
        if (c.type === 'date') return formatReportDate(value)
        /* Large numeric IDs exceed Excel's 11-digit display limit and render
           as scientific notation (e.g. 1.00939E+11). Export the Invoice Data
           Transaction ID as a text-formula cell so Excel shows it verbatim. */
        if (activeReport.key === 'invoiceData' && c.key === 'invoiceId') {
          return `="${String(value ?? '').replace(/"/g, '""')}"`
        }
        return typeof value === 'number' ? value : String(value ?? '')
      })
    )

    /* Range reports open with a header block carrying the selected period,
       mirroring the From/To line printed on their PDFs. */
    const headerLines: string[] = []
    if (activeReport.dateMode === 'range' && query) {
      headerLines.push(`"${activeReport.pdfTitle ?? activeReport.label}"`)
      if (query.from) headerLines.push(`"From","${toApiDate(query.from)}"`)
      if (query.to) headerLines.push(`"To","${toApiDate(query.to)}"`)
      headerLines.push('')
    }

    const BOM = '﻿'
    const csvContent =
      BOM +
      [
        ...headerLines,
        headers.join(','),
        ...rows.map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const suffix = query ? fileSuffix(activeReport, query.from, query.to) : ''
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
                  {activeReport.label} will be available in a future phase.
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
                        {activeReport.dateMode === 'range' ? 'From' : 'Date'}:{' '}
                        <strong className='text-dark dark:text-white'>{toLongDate(query.from)}</strong>
                      </span>
                    )}
                    {activeReport.dateMode === 'range' && query?.to && (
                      <span className='rounded-md bg-white border border-ld px-3 py-1 dark:bg-dark/40'>
                        To: <strong className='text-dark dark:text-white'>{toLongDate(query.to)}</strong>
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
                               as the right-aligned cell values (date columns
                               stay left-aligned like the legacy report) */
                            const colType = activeColumns.find((c) => c.key === columnKey)?.type
                            const isNumericHeader = colType === 'number' || colType === 'currency'

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
                            Select a date and press Search to load data.
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
                            {row.getVisibleCells().map((cell) => {
                              const cellConfig = activeColumns.find(
                                (c) => c.key === cell.column.id
                              )
                              return (
                                <td
                                  key={cell.id}
                                  className='px-4 py-2'
                                  style={
                                    cellConfig?.minWidth
                                      ? { minWidth: cellConfig.minWidth }
                                      : undefined
                                  }>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              )
                            })}
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

          {activeReport.implemented && query && (query.from || query.to) && (
            <div className='mb-3'>
              {activeReport.dateMode === 'range' ? (
                <p className='text-sm text-slate-900'>
                  <strong>From:</strong>
                  <strong className='ms-2'>
                    {query.from ? toLongDate(query.from) : '—'}
                  </strong>
                  <strong className='ms-6'>To:</strong>
                  <strong className='ms-2'>{query.to ? toLongDate(query.to) : '—'}</strong>
                </p>
              ) : (
                <p className='text-sm text-slate-900'>
                  <strong>Date:</strong> <strong className='ms-4'>{toLongDate(query.from)}</strong>
                </p>
              )}
            </div>
          )}

          {activeReport.key === 'invoiceData' ? (
            /* Invoice Data: legacy-style chronological card layout — a main
               row with the transaction essentials plus a detail row with the
               vehicle / contact metadata and the note, mirroring the legacy
               InvoiceData.pdf rich-row formatting. */
            <table className='w-full text-xs border-collapse'>
              <thead>
                <tr className='bg-slate-100'>
                  <th className='border border-slate-300 px-2 py-1.5 font-semibold text-left'>Transaction ID</th>
                  <th className='border border-slate-300 px-2 py-1.5 font-semibold text-left'>Date</th>
                  <th className='border border-slate-300 px-2 py-1.5 font-semibold text-left'>Customer Name</th>
                  <th className='border border-slate-300 px-2 py-1.5 font-semibold text-left'>Phone</th>
                  <th className='border border-slate-300 px-2 py-1.5 font-semibold text-left'>Payment Type</th>
                  <th className='border border-slate-300 px-2 py-1.5 font-semibold text-right'>Amount</th>
                </tr>
              </thead>
              <tbody>
                {pdfInvoiceRows.map((row, idx) => {
                  const meta = [
                    row.vehicle || row.model || row.year
                      ? `Vehicle: ${[row.vehicle, row.model, row.year].filter(Boolean).join(' ')}`
                      : '',
                    row.companyName ? `Company: ${row.companyName}` : '',
                    row.taxNumber ? `Tax ID: ${row.taxNumber}` : '',
                    row.license ? `License: ${row.license}` : '',
                    row.odometer ? `Odometer: ${row.odometer}` : '',
                    row.treadDepth ? `Tread Depth: ${row.treadDepth}` : '',
                    row.address ? `Address: ${row.address}` : '',
                  ]
                    .filter(Boolean)
                    .join('   •   ')
                  return (
                    <React.Fragment key={idx}>
                      <tr className='bg-white'>
                        <td className='border border-slate-300 px-2 py-1 font-medium'>{row.invoiceId || '—'}</td>
                        <td className='border border-slate-300 px-2 py-1'>
                          {formatReportDate(row.invoiceDate) || '—'}
                        </td>
                        <td className='border border-slate-300 px-2 py-1'>{row.name || '—'}</td>
                        <td className='border border-slate-300 px-2 py-1'>{row.phone || '—'}</td>
                        <td className='border border-slate-300 px-2 py-1'>{row.tbip_Paymentname || '—'}</td>
                        <td className='border border-slate-300 px-2 py-1 text-right'>
                          {typeof row.total === 'number' ? formatMoney(row.total) : '—'}
                        </td>
                      </tr>
                      {(meta || row.notes) && (
                        <tr className='pdf-detail-row bg-slate-50'>
                          <td colSpan={6} className='border border-slate-300 px-2 py-1'>
                            {meta && <div>{meta}</div>}
                            {row.notes && <div className='text-slate-500'>{row.notes}</div>}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          ) : activeReport.key === 'checkRegister' && pdfCheckGroups ? (
            /* Check Register: legacy layout — a `DISCRIPTION OF TRANSACTION /
               AMOUNT` table where rows are grouped per date, each group closed
               with its day total and the whole report with a grand total. */
            <table className='w-full text-xs border-collapse'>
              <thead>
                <tr className='bg-slate-100'>
                  <th className='border border-slate-300 px-2 py-1.5 font-semibold text-left'>
                    Description of Transaction
                  </th>
                  <th className='border border-slate-300 px-2 py-1.5 font-semibold text-right w-36'>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {pdfCheckGroups.groups.map((group) => (
                  <React.Fragment key={group.date}>
                    <tr className='pdf-group-header'>
                      <td colSpan={2} className='border border-slate-300 bg-slate-100 px-2 py-1 font-semibold'>
                        DATE : {formatReportDate(group.date)}
                      </td>
                    </tr>
                    {group.rows.map((r, i) => (
                      <tr key={i} className='bg-white'>
                        <td className='border border-slate-300 px-2 py-1'>{r.name}</td>
                        <td className='border border-slate-300 px-2 py-1 text-right'>{formatMoney(r.amount)}</td>
                      </tr>
                    ))}
                    <tr className='bg-slate-50'>
                      <td className='border border-slate-300 px-2 py-1 font-semibold'>Total</td>
                      <td className='border border-slate-300 px-2 py-1 text-right font-semibold'>
                        {formatMoney(group.total)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                <tr className='bg-slate-100'>
                  <td className='border border-slate-300 px-2 py-1.5 font-bold uppercase tracking-wide'>Grand Total</td>
                  <td className='border border-slate-300 px-2 py-1.5 text-right font-bold'>
                    {formatMoney(pdfCheckGroups.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className='w-full text-xs border-collapse'>
            <thead>
              <tr className='bg-slate-100'>
                {activeColumns.map((c) => (
                  <th
                    key={c.key}
                    className={`border border-slate-300 px-2 py-1.5 font-semibold ${c.type === 'text' || c.type === 'date' ? 'text-left' : 'text-right'}`}>
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
                        className={`border border-slate-300 px-2 py-1 ${c.type === 'text' || c.type === 'date' ? '' : 'text-right'} ${c.type === 'text' || c.type === 'date' ? 'font-medium' : ''}`}>
                        {c.type === 'date'
                          ? formatReportDate(value) || '—'
                          : c.type === 'text'
                            ? value || '—'
                            : typeof value === 'number'
                              ? formatMoney(value)
                              : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {activeReport.key === 'onCredit' && filteredData.length > 0 && (
                /* Pending Amount totals footer: summarize the amount columns */
                <tr className='bg-slate-100'>
                  {/* five label columns (date, invoice, customer, company,
                      payment methods) ahead of the amount columns */}
                  <td colSpan={5} className='border border-slate-300 px-2 py-1.5 font-bold uppercase tracking-wide'>
                    Totals ({filteredData.length} records)
                  </td>
                  {['tbim_Total', 'tbim_PaidAmt', 'pendingAmount', 'payInfo'].map((key) => (
                    <td key={key} className='border border-slate-300 px-2 py-1.5 font-bold'>
                      {activeColumns.find((c) => c.key === key)?.type === 'currency'
                        ? formatMoney(filteredData.reduce((sum, row) => sum + numOrZero(row[key]), 0))
                        : ''}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
          )}

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
