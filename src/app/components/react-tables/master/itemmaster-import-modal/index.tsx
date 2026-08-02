'use client'

import React, { useState, useCallback, useMemo, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApiUrl, postFetcher } from '@/app/api/globalFetcher'
import { getUserName } from '@/app/api/auth'
import { getLocalISO } from '@/lib/time'
import { toast } from 'react-toastify'
import type { ItemMasterType } from '@/app/models/interfaces'

/* ── xlsx is dynamically imported and accessed via `any` to avoid ── */
/* ── requiring @types/xlsx. All usages are type-safe at runtime.   ── */

/* ── Constants ── */
const SYSTEM_FIELDS = [
  { key: 'tbim_ItemCategoryId', label: 'Category', required: true },
  { key: 'tbim_Size', label: 'Size', required: true },
  { key: 'tbim_Brand', label: 'Brand', required: true },
  { key: 'tbim_Qty', label: 'Qty', required: false },
  { key: 'tbim_HoleS', label: 'Holes', required: false },
  { key: 'tbim_Zone', label: 'Zone', required: false },
  { key: 'tbim_Series', label: 'Series', required: false },
  { key: 'tbim_Bolt', label: 'Bolt', required: false },
  { key: 'tbim_Code', label: 'Code', required: false },
  { key: 'tbim_CodeTOT', label: 'Code TOT', required: false },
  { key: 'tbim_OURP', label: 'OURP', required: false },
  { key: 'tbim_ourp', label: 'OURP TOT', required: false },
  { key: 'tbim_DistributorId', label: 'Distributor', required: false },
] as const

/* ── Types ── */
type MappedRow = Record<string, unknown> & { _rowIndex: number }

interface ImportResult {
  successCount: number
  errorCount: number
  errors: string[]
}

interface LookupEntry {
  id: number
  name: string
}

interface ItemBulkImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

/* ── Sample template download ── */
function downloadSampleTemplate() {
  import('xlsx').then((XLSXmod: any) => {
    const XLSX = XLSXmod.default ?? XLSXmod
    const headers = ['Category', 'Size', 'Brand', 'Qty', 'Holes', 'Zone', 'Series', 'Bolt', 'Code', 'Code TOT', 'OURP', 'OURP TOT', 'Distributor']
    const exampleRow = ['Tires', '235-50-17', 'MICHELIN PRIMACY 4', '10', '5', 'N 31', 'Series-A', 'Bolt-X', '1001', '4200.50', '530.00', '530.00', 'ABC Distributor']
    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Item Master')
    XLSX.writeFile(wb, 'ItemMaster_Import_Template.xlsx')
  }).catch((err) => {
    console.error('Failed to load xlsx library', err)
    toast.error('Failed to generate the sample template.')
  })
}

/* ── Duplicate key fields ── */
const DUPLICATE_KEY_FIELDS = ['tbim_ItemCategoryId', 'tbim_Size', 'tbim_Brand', 'tbim_Bolt', 'tbim_Series', 'tbim_HoleS'] as const

function deduplicateRows(rows: MappedRow[]): { unique: MappedRow[]; removedCount: number } {
  const seen = new Set<string>()
  const unique: MappedRow[] = []
  let removedCount = 0

  for (const row of rows) {
    // Build a composite key from the duplicate-key fields.
    // Use lowercased, trimmed string representation so minor differences in
    // casing or whitespace don't cause false negatives.
    const key = DUPLICATE_KEY_FIELDS
      .map(f => String(row[f] ?? '').trim().toLowerCase())
      .join('||')

    if (seen.has(key)) {
      removedCount++
      continue
    }
    seen.add(key)
    unique.push(row)
  }

  return { unique, removedCount }
}

/* ── Row validators ── */
function validateRow(row: MappedRow, categories: LookupEntry[], distributors: LookupEntry[]): string[] {
  const errors: string[] = []

  const catVal = row.tbim_ItemCategoryId
  if (catVal === null || catVal === undefined || catVal === '') {
    errors.push('Category is required')
  } else if (typeof catVal === 'string' && categories.length > 0 && !categories.some(c => c.name.toLowerCase() === String(catVal).toLowerCase())) {
    errors.push(`Category "${catVal}" not found`)
  }

  if (row.tbim_Size === null || row.tbim_Size === undefined || row.tbim_Size === '') {
    errors.push('Size is required')
  }

  if (row.tbim_Brand === null || row.tbim_Brand === undefined || row.tbim_Brand === '') {
    errors.push('Brand is required')
  }

  const codeVal = row.tbim_Code
  if (codeVal !== null && codeVal !== undefined && codeVal !== '') {
    const num = Number(codeVal)
    if (isNaN(num) || num < 0) {
      errors.push('Code must be a non-negative number')
    }
  }

  return errors
}

/* ── Resolve lookups ── */
function resolveCategoryId(value: unknown, categories: LookupEntry[]): number {
  if (typeof value === 'number') return value
  const str = String(value ?? '').trim()
  if (!str) return 0
  const match = categories.find(c => c.name.toLowerCase() === str.toLowerCase())
  return match ? match.id : 0
}

function resolveDistributorId(value: unknown, distributors: LookupEntry[]): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return value
  const str = String(value).trim()
  if (!str) return null
  const match = distributors.find(d => d.name.toLowerCase() === str.toLowerCase())
  return match ? match.id : null
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function ItemBulkImportModal({ open, onOpenChange, onImportComplete }: ItemBulkImportModalProps) {
  /* ── wizard step ── */
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  /* ── step 1 state ── */
  const [skipErrors, setSkipErrors] = useState(false)
  const [rawExcelHeaders, setRawExcelHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── step 2 state (column mapping) ── */
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})

  /* ── step 3 state (preview) ── */
  const [mappedRows, setMappedRows] = useState<MappedRow[]>([])
  const [cellErrors, setCellErrors] = useState<Record<string, string[]>>({})
  const [editingCell, setEditingCell] = useState<{ row: number; key: string } | null>(null)

  /* ── step 4 state (result) ── */
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  /* ── loading / lookup data ── */
  const [importing, setImporting] = useState(false)
  const [categories, setCategories] = useState<LookupEntry[]>([])
  const [distributors, setDistributors] = useState<LookupEntry[]>([])

  /* ── fetch lookup data on open ── */
  React.useEffect(() => {
    if (!open) return
    fetch(`${getApiUrl('/api/Departments')}`, {
      headers: (() => { const h: Record<string, string> = {}; const t = localStorage.getItem('NEXT_AUTH_TOKEN'); if (t) h['Authorization'] = `Bearer ${t}`; return h })()
    }).then(r => r.ok ? r.json() : []).then((d: unknown) => {
      if (Array.isArray(d)) {
        setCategories(d.map((c: any) => ({ id: c.id, name: c.tbid_DepartmentName })))
      }
    }).catch(() => {})
    fetch(`${getApiUrl('/api/Distributors')}`, {
      headers: (() => { const h: Record<string, string> = {}; const t = localStorage.getItem('NEXT_AUTH_TOKEN'); if (t) h['Authorization'] = `Bearer ${t}`; return h })()
    }).then(r => r.ok ? r.json() : []).then((d: unknown) => {
      if (Array.isArray(d)) {
        setDistributors(d.map((d: any) => ({ id: d.id, name: d.name })))
      }
    }).catch(() => {})
  }, [open])

  /* ── Reset on close ── */
  const reset = useCallback(() => {
    setStep(1)
    setRawExcelHeaders([])
    setRawRows([])
    setColumnMapping({})
    setMappedRows([])
    setCellErrors({})
    setEditingCell(null)
    setImportResult(null)
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    if (step === 4) onImportComplete()
    setTimeout(reset, 100)
  }, [onOpenChange, onImportComplete, step, reset])

  /* ── Step 1: Parse file ── */
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onerror = () => {
      toast.error('Failed to read the file. Please try again.')
    }
    reader.onload = (e) => {
      const result = e.target?.result
      if (!result) {
        toast.error('The file appears to be empty.')
        return
      }
      import('xlsx').then((XLSXmod: any) => {
        const XLSX = XLSXmod.default ?? XLSXmod
        try {
          // e.target.result is already an ArrayBuffer — do NOT re-wrap it.
          const data = result as ArrayBuffer
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          if (!sheetName) {
            toast.error('The workbook contains no sheets.')
            return
          }
          const sheet = workbook.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

          if (rows.length === 0) {
            toast.error('The file contains no data rows')
            return
          }

          const headers = Object.keys(rows[0])
          setRawExcelHeaders(headers)
          setRawRows(rows)

          // Auto-map columns based on header name similarity
          const autoMapping: Record<string, string> = {}
          SYSTEM_FIELDS.forEach(field => {
            const match = headers.find(h =>
              h.toLowerCase().trim() === field.label.toLowerCase() ||
              h.toLowerCase().trim().replace(/[\s_-]/g, '') === field.label.toLowerCase().replace(/[\s_-]/g, '')
            )
            if (match) autoMapping[field.key] = match
          })
          setColumnMapping(autoMapping)
          setStep(2)
        } catch (err) {
          console.error('Excel parse error', err)
          toast.error('Could not parse the file. Please ensure it is a valid Excel/CSV file.')
        }
      }).catch((err) => {
        console.error('Failed to load xlsx library', err)
        toast.error('Failed to load the Excel parser. Is "xlsx" installed?')
      })
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  /* ── Step 2 → Step 3: Apply mapping ── */
  const applyMapping = useCallback(() => {
    const mapped: MappedRow[] = rawRows.map((row, idx) => {
      const mappedRow: MappedRow = { _rowIndex: idx }

      SYSTEM_FIELDS.forEach(field => {
        const excelHeader = columnMapping[field.key]
        const rawValue = excelHeader && row[excelHeader] !== undefined ? row[excelHeader] : ''

        if (field.key === 'tbim_ItemCategoryId') {
          // Resolve the Excel text (category name) to its numeric id.
          // If lookup data hasn't loaded or no match, keep the raw text so the
          // validator can flag it and the user can fix it from the dropdown.
          const resolved = rawValue !== '' && rawValue !== null && rawValue !== undefined
            ? resolveCategoryId(rawValue, categories)
            : ''
          mappedRow[field.key] = resolved || rawValue
        } else if (field.key === 'tbim_DistributorId') {
          // Same for distributor — allow null (spec: distributor may be empty).
          if (rawValue === '' || rawValue === null || rawValue === undefined) {
            mappedRow[field.key] = null
          } else {
            const resolved = resolveDistributorId(rawValue, distributors)
            mappedRow[field.key] = resolved // number | null
          }
        } else {
          mappedRow[field.key] = rawValue
        }
      })

      return mappedRow
    })

    // Remove duplicate rows based on Size/Brand/Bolt/Series/Holes
    const { unique, removedCount } = deduplicateRows(mapped)
    if (removedCount > 0) {
      toast.info(`Removed ${removedCount} duplicate row(s) (same Category + Size + Brand + Bolt + Series + Holes)`)
    }

    setMappedRows(unique)

    // Validate all rows
    const errors: Record<string, string[]> = {}
    mapped.forEach((row) => {
      const rowErrors = validateRow(row, categories, distributors)
      if (rowErrors.length > 0) {
        errors[String(row._rowIndex)] = rowErrors
      }
    })
    setCellErrors(errors)
    setStep(3)
  }, [rawRows, columnMapping, categories, distributors])

  /* ── Step 3: Row operations ── */
  const deleteRow = useCallback((rowIndex: number) => {
    setMappedRows(prev => prev.filter(r => r._rowIndex !== rowIndex))
    setCellErrors(prev => {
      const next = { ...prev }
      delete next[String(rowIndex)]
      return next
    })
  }, [])

  const updateCell = useCallback((rowIndex: number, key: string, value: unknown) => {
    setMappedRows(prev => {
      const updated = prev.map(r => r._rowIndex === rowIndex ? { ...r, [key]: value } : r)
      // Re-validate this row
      const row = updated.find(r => r._rowIndex === rowIndex)
      if (row) {
        const errors = validateRow(row, categories, distributors)
        setCellErrors(prevErr => {
          const next = { ...prevErr }
          if (errors.length > 0) next[String(rowIndex)] = errors
          else delete next[String(rowIndex)]
          return next
        })
      }
      return updated
    })
  }, [categories, distributors])

  /* ── Step 3: Validation stats ── */
  const validationStats = useMemo(() => {
    const total = mappedRows.length
    const invalid = new Set(Object.keys(cellErrors)).size
    const valid = total - invalid
    return { total, valid, invalid }
  }, [mappedRows, cellErrors])

  const isRowValid = useCallback((rowIndex: number) => {
    return !cellErrors[String(rowIndex)] || cellErrors[String(rowIndex)].length === 0
  }, [cellErrors])

  /* ── Step 3 → Step 4: Submit import ── */
  const handleImport = useCallback(async () => {
    setImporting(true)
    try {
      const username = getUserName() ?? ''
      const now = getLocalISO()

      const payload: Partial<ItemMasterType>[] = mappedRows
        .filter(row => skipErrors ? isRowValid(row._rowIndex) : true)
        .map(row => ({
          id: 0,
          tbim_ItemCategoryId: resolveCategoryId(row.tbim_ItemCategoryId, categories),
          tbim_Size: String(row.tbim_Size ?? ''),
          tbim_Brand: String(row.tbim_Brand ?? ''),
          tbim_Series: row.tbim_Series ? String(row.tbim_Series) : null,
          tbim_Bolt: row.tbim_Bolt ? String(row.tbim_Bolt) : null,
          tbim_HoleS: row.tbim_HoleS ? String(row.tbim_HoleS) : null,
          tbim_Zone: row.tbim_Zone ? String(row.tbim_Zone) : null,
          tbim_Qty: Number(row.tbim_Qty) || 0,
          tbim_QtyOp: Number(row.tbim_Qty) || 0,
          tbim_Code: Number(row.tbim_Code) || 0,
          tbim_CodeTOT: Number(row.tbim_CodeTOT) || 0,
          tbim_DistributorId: resolveDistributorId(row.tbim_DistributorId, distributors),
          tbim_OURP: Number(row.tbim_OURP ?? row.tbim_ourp) || 0,
          tbim_LocationId: 1,
          tbim_ThrashDate: null,
          userName: username,
          setDate: now,
        }))

      if (!skipErrors && validationStats.invalid > 0) {
        toast.error(`Cannot import: ${validationStats.invalid} row(s) have validation errors. Enable "Skip Errors" or fix them.`)
        setImporting(false)
        return
      }

      const url = getApiUrl(`/api/ItemMaster/bulk-import?skipErrors=${skipErrors}`)
      const response = await postFetcher(url, payload)

      // Parse response — backend may return { successCount, errorCount, errors } or just a success indicator
      const result: ImportResult = {
        successCount: (response as any)?.successCount ?? payload.length,
        errorCount: (response as any)?.errorCount ?? 0,
        errors: Array.isArray((response as any)?.errors) ? (response as any).errors : [],
      }

      setImportResult(result)
      setStep(4)
      toast.success(`Import complete: ${result.successCount} item(s) imported`)
    } catch (err: any) {
      const msg = err?.serverMessage || err?.message || 'Import failed'
      setImportResult({ successCount: 0, errorCount: mappedRows.length, errors: [msg] })
      setStep(4)
      toast.error(msg)
    } finally {
      setImporting(false)
    }
  }, [mappedRows, skipErrors, categories, distributors, validationStats, isRowValid])

  /* ── Helpers ── */
  const stepTitle = useMemo(() => {
    switch (step) {
      case 1: return 'Upload File'
      case 2: return 'Column Mapping'
      case 3: return 'Preview & Validate'
      case 4: return 'Import Summary'
    }
  }, [step])

  const stepDescription = useMemo(() => {
    switch (step) {
      case 1: return 'Drop an Excel or CSV file to begin importing item master data.'
      case 2: return 'Map your spreadsheet columns to the system fields.'
      case 3: return 'Review the data below. Fix errors or remove invalid rows before importing.'
      case 4: return 'The import process has completed. Review the results below.'
    }
  }, [step])

  /* ════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v) }}>
      <DialogContent className='sm:max-w-4xl max-h-[85vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <IconUpload className='h-5 w-5' />
            Bulk Import — {stepTitle}
          </DialogTitle>
          <DialogDescription>{stepDescription}</DialogDescription>
        </DialogHeader>

        {/* ── Step indicator ── */}
        <div className='flex items-center gap-2 text-xs'>
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                  s < step
                    ? 'bg-green-500 text-white'
                    : s === step
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                {s < step ? '✓' : s}
              </span>
              {s < 4 && (
                <span className={`flex-1 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ════════════════ STEP 1: FILE UPLOAD ════════════════ */}
        {step === 1 && (
          <div className='flex flex-col gap-4 py-4'>
            {/* Download template button */}
            <div className='flex justify-end'>
              <Button variant='ghostprimary' size='sm' onClick={downloadSampleTemplate} type='button'>
                <IconDownload className='h-4 w-4 mr-1' />
                Download Sample Template
              </Button>
            </div>

            {/* Dropzone */}
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
              className='border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-primary hover:bg-lightprimary transition-colors'
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload className='h-10 w-10 mx-auto mb-3 text-muted-foreground' />
              <p className='text-sm font-medium text-muted-foreground'>
                Drag & drop your Excel file here, or click to browse
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Supports .xlsx, .xls, .csv
              </p>
              <input
                ref={fileInputRef}
                type='file'
                accept='.xlsx,.xls,.csv'
                className='hidden'
                onChange={onFileChange}
              />
            </div>

            {/* Import Strategy */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-medium'>Import Strategy</label>
              <div className='flex gap-4'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='radio'
                    name='strategy'
                    checked={!skipErrors}
                    onChange={() => setSkipErrors(false)}
                    className='accent-primary'
                  />
                  <div>
                    <span className='text-sm font-medium'>Strict</span>
                    <p className='text-xs text-muted-foreground'>Reject entire batch on any error</p>
                  </div>
                </label>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='radio'
                    name='strategy'
                    checked={skipErrors}
                    onChange={() => setSkipErrors(true)}
                    className='accent-primary'
                  />
                  <div>
                    <span className='text-sm font-medium'>Permissive</span>
                    <p className='text-xs text-muted-foreground'>Import valid rows, skip invalid ones</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ STEP 2: COLUMN MAPPING ════════════════ */}
        {step === 2 && (
          <div className='flex flex-col gap-4 py-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                Found <span className='font-semibold text-foreground'>{rawRows.length}</span> rows with{' '}
                <span className='font-semibold text-foreground'>{rawExcelHeaders.length}</span> columns.
                Select the Excel column that matches each system field.
              </p>
            </div>

            <div className='max-h-[45vh] overflow-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-2 px-3 font-medium'>System Field</th>
                    <th className='text-left py-2 px-3 font-medium'>Required</th>
                    <th className='text-left py-2 px-3 font-medium'>Excel Column</th>
                  </tr>
                </thead>
                <tbody>
                  {SYSTEM_FIELDS.map((field) => (
                    <tr key={field.key} className='border-b last:border-b-0 hover:bg-muted/30'>
                      <td className='py-2 px-3 font-medium'>{field.label}</td>
                      <td className='py-2 px-3'>
                        {field.required && (
                          <span className='text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded'>
                            Required
                          </span>
                        )}
                      </td>
                      <td className='py-2 px-3'>
                        <Select
                          value={columnMapping[field.key] ?? '__none__'}
                          onValueChange={(val) =>
                            setColumnMapping(prev => ({
                              ...prev,
                              [field.key]: val === '__none__' ? '' : val,
                            }))
                          }
                        >
                          <SelectTrigger className='w-full max-w-xs'>
                            <SelectValue placeholder='-- Select column --' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='__none__'>-- No mapping --</SelectItem>
                            {rawExcelHeaders.map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════ STEP 3: PREVIEW ════════════════ */}
        {step === 3 && (
          <div className='flex flex-col gap-3 py-2'>
            {/* Summary badges */}
            <div className='flex gap-3'>
              <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800'>
                Total: {validationStats.total}
              </span>
              <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'>
                Valid: {validationStats.valid}
              </span>
              {validationStats.invalid > 0 && (
                <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'>
                  Invalid: {validationStats.invalid}
                </span>
              )}
            </div>

            {/* Data grid — overflow-x-auto ensures horizontal scroll when columns overflow */}
            <div className='border rounded-md' style={{ maxHeight: '45vh', overflow: 'auto' }}>
              <table className='text-xs' style={{ minWidth: '1200px' }}>
                <thead>
                  <tr className='bg-muted/50 sticky top-0'>
                    <th className='text-left py-2 px-2 font-medium border-b w-8'>#</th>
                    {SYSTEM_FIELDS.map(f => (
                      <th key={f.key} className='text-left py-2 px-2 font-medium border-b whitespace-nowrap'>
                        {f.label}
                      </th>
                    ))}
                    <th className='py-2 px-2 border-b w-10'></th>
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.map((row) => {
                    const rowIdx = row._rowIndex
                    const valid = isRowValid(rowIdx)
                    return (
                      <tr
                        key={rowIdx}
                        className={`border-b ${valid ? '' : 'bg-red-50/50 dark:bg-red-950/20'}`}
                      >
                        <td className='py-1 px-2 text-muted-foreground'>{rowIdx + 1}</td>
                        {SYSTEM_FIELDS.map(field => {
                          const cellKey = `${rowIdx}-${field.key}`
                          const isEditing = editingCell?.row === rowIdx && editingCell?.key === field.key
                          const hasError = cellErrors[String(rowIdx)]?.some(e => {
                            if (field.key === 'tbim_ItemCategoryId') return e.includes('Category')
                            if (field.key === 'tbim_Brand') return e.includes('Brand')
                            if (field.key === 'tbim_Size') return e.includes('Size')
                            if (field.key === 'tbim_Code') return e.includes('Code')
                            return false
                          })

                          // Render category as dropdown
                          if (field.key === 'tbim_ItemCategoryId') {
                            return (
                              <td key={cellKey} className={`py-1 px-1 whitespace-nowrap ${hasError ? 'bg-red-100 dark:bg-red-900/20' : ''}`}>
                                <Select
                                  value={String(row.tbim_ItemCategoryId || '')}
                                  onValueChange={(val) => updateCell(rowIdx, 'tbim_ItemCategoryId', val)}
                                >
                                  <SelectTrigger className='h-7 text-xs w-[140px]'>
                                    <SelectValue placeholder='Select...' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map(cat => (
                                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                            )
                          }

                          // Render distributor as dropdown
                          if (field.key === 'tbim_DistributorId') {
                            return (
                              <td key={cellKey} className='py-1 px-1 whitespace-nowrap'>
                                <Select
                                  value={String(row.tbim_DistributorId || '__none__')}
                                  onValueChange={(val) => updateCell(rowIdx, 'tbim_DistributorId', val === '__none__' ? null : val)}
                                >
                                  <SelectTrigger className='h-7 text-xs w-[140px]'>
                                    <SelectValue placeholder='Select...' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='__none__'>None</SelectItem>
                                    {distributors.map(dist => (
                                      <SelectItem key={dist.id} value={String(dist.id)}>{dist.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                            )
                          }

                          // Render numeric fields
                          if (['tbim_Qty', 'tbim_Code', 'tbim_CodeTOT', 'tbim_OURP', 'tbim_ourp'].includes(field.key)) {
                            return (
                              <td key={cellKey} className={`py-1 px-1 whitespace-nowrap ${hasError ? 'bg-red-100 dark:bg-red-900/20' : ''}`}>
                                {isEditing ? (
                                  <Input
                                    type='number'
                                    className='h-7 text-xs w-full min-w-20'
                                    value={String(row[field.key] ?? '')}
                                    onChange={(e) => updateCell(rowIdx, field.key, Number(e.target.value))}
                                    onBlur={() => setEditingCell(null)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') setEditingCell(null) }}
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    className='block px-1 py-0.5 rounded cursor-pointer hover:bg-muted/20 min-h-6'
                                    onDoubleClick={() => setEditingCell({ row: rowIdx, key: field.key })}
                                    title={hasError ? cellErrors[String(rowIdx)]?.join(', ') : 'Double-click to edit'}
                                  >
                                    {row[field.key] ?? ''}
                                  </span>
                                )}
                              </td>
                            )
                          }

                          // Text fields
                          return (
                            <td key={cellKey} className={`py-1 px-1 whitespace-nowrap ${hasError ? 'bg-red-100 dark:bg-red-900/20' : ''}`}>
                              {isEditing ? (
                                <Input
                                  className='h-7 text-xs w-full min-w-[120px]'
                                  value={String(row[field.key] ?? '')}
                                  onChange={(e) => updateCell(rowIdx, field.key, e.target.value)}
                                  onBlur={() => setEditingCell(null)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') setEditingCell(null) }}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className='block px-1 py-0.5 rounded cursor-pointer hover:bg-muted/20 min-h-6'
                                  onDoubleClick={() => setEditingCell({ row: rowIdx, key: field.key })}
                                  title={hasError ? cellErrors[String(rowIdx)]?.join(', ') : 'Double-click to edit'}
                                >
                                  {row[field.key] ?? ''}
                                </span>
                              )}
                            </td>
                          )
                        })}
                        <td className='py-1 px-1'>
                          <button
                            type='button'
                            className='text-red-500 hover:text-red-700 p-0.5'
                            onClick={() => deleteRow(rowIdx)}
                            title='Remove row'
                          >
                            <IconTrash className='h-3.5 w-3.5' />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════ STEP 4: RESULT ════════════════ */}
        {step === 4 && importResult && (
          <div className='flex flex-col gap-4 py-6 items-center'>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${importResult.errorCount === 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
              {importResult.errorCount === 0 ? (
                <IconCheck className='h-8 w-8 text-green-600 dark:text-green-400' />
              ) : (
                <IconAlert className='h-8 w-8 text-yellow-600 dark:text-yellow-400' />
              )}
            </div>

            <div className='text-center'>
              <p className='text-lg font-semibold'>Import Complete</p>
              <p className='text-sm text-muted-foreground mt-1'>
                <span className='text-green-600 font-medium'>{importResult.successCount}</span> item(s) imported successfully
                {importResult.errorCount > 0 && (
                  <>, <span className='text-red-600 font-medium'>{importResult.errorCount}</span> failed</>
                )}
              </p>
            </div>

            {importResult.errors.length > 0 && (
              <div className='w-full max-w-lg'>
                <p className='text-sm font-medium mb-2'>Error Details:</p>
                <div className='max-h-[200px] border rounded-md p-3 bg-red-50/50 dark:bg-red-950/20 overflow-auto'>
                  <ul className='text-xs space-y-1'>
                    {importResult.errors.map((err, i) => (
                      <li key={i} className='text-red-700 dark:text-red-400 flex items-start gap-1'>
                        <span className='mt-0.5'>•</span>
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Footer actions ── */}
        <div className='flex justify-between items-center pt-2 border-t'>
          {/* Left side: back button */}
          <div>
            {step > 1 && step < 4 && (
              <Button
                variant='secondary'
                size='sm'
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                type='button'
              >
                Back
              </Button>
            )}
          </div>

          {/* Right side: primary action */}
          <div className='flex gap-2'>
            {step === 4 ? (
              <Button onClick={handleClose} type='button'>
                Close & Refresh Table
              </Button>
            ) : step === 3 ? (
              <Button
                onClick={handleImport}
                disabled={importing || mappedRows.length === 0 || (!skipErrors && validationStats.invalid > 0)}
                type='button'
              >
                {importing ? 'Importing...' : `Import ${skipErrors ? validationStats.valid : mappedRows.length} Item(s)`}
              </Button>
            ) : step === 2 ? (
              <Button onClick={applyMapping} type='button'>
                Continue to Preview
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Inline SVG icons (project uses @tabler/icons-react and lucide-react, but keeping these self-contained) ── */
function IconUpload({ className }: { className?: string }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' className={className} width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
      <polyline points='17 8 12 3 7 8' />
      <line x1='12' y1='3' x2='12' y2='15' />
    </svg>
  )
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' className={className} width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
      <polyline points='7 10 12 15 17 10' />
      <line x1='12' y1='15' x2='12' y2='3' />
    </svg>
  )
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' className={className} width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='3 6 5 6 21 6' />
      <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
      <line x1='10' y1='11' x2='10' y2='17' />
      <line x1='14' y1='11' x2='14' y2='17' />
    </svg>
  )
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' className={className} width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='20 6 9 17 4 12' />
    </svg>
  )
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' className={className} width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='8' x2='12' y2='12' />
      <line x1='12' y1='16' x2='12.01' y2='16' />
    </svg>
  )
}
