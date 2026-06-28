'use client'

import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Icon } from '@iconify/react/dist/iconify.js'
import {
  FilterType,
  ColumnFilterValue,
  NumericRangeFilter,
  DateRangeFilter,
  detectFilterType,
  getUniqueValues,
  isNumericRangeFilter,
  isDateRangeFilter,
} from './columnFilterUtils'

interface ColumnFilterInputProps {
  columnData: (string | number | undefined)[]
  filterValue?: ColumnFilterValue
  onFilterChange: (value: ColumnFilterValue) => void
  columnName: string
  filterType?: FilterType
}

/**
 * Smart column filter component
 * Renders:
 * - Text input for text columns
 * - Checkbox list for select columns
 * - Min/Max number inputs for numeric columns
 * - From/To date inputs for date columns
 */
export const ColumnFilterInput: React.FC<ColumnFilterInputProps> = ({
  columnData,
  filterValue,
  onFilterChange,
  columnName,
  filterType: propsFilterType,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localTextFilter, setLocalTextFilter] = useState<string>(
    typeof filterValue === 'string' ? filterValue : ''
  )
  const [localSelectFilter, setLocalSelectFilter] = useState<Set<string>>(
    new Set(Array.isArray(filterValue) ? filterValue.map((v) => String(v)) : [])
  )
  const [localNumericMin, setLocalNumericMin] = useState<string>(
    isNumericRangeFilter(filterValue) ? String(filterValue.min ?? '') : ''
  )
  const [localNumericMax, setLocalNumericMax] = useState<string>(
    isNumericRangeFilter(filterValue) ? String(filterValue.max ?? '') : ''
  )
  const [localDateFrom, setLocalDateFrom] = useState<string>(
    isDateRangeFilter(filterValue) ? filterValue.from ?? '' : ''
  )
  const [localDateTo, setLocalDateTo] = useState<string>(
    isDateRangeFilter(filterValue) ? filterValue.to ?? '' : ''
  )

  // Detect filter type if not provided
  const filterType = propsFilterType || detectFilterType(columnData)
  const uniqueValues = useMemo(
    () => (filterType === 'select' ? getUniqueValues(columnData) : []),
    [columnData, filterType]
  )

  // Reset local state when popover opens and filterValue changes
  React.useEffect(() => {
    if (isOpen) {
      if (filterType === 'text') {
        setLocalTextFilter(typeof filterValue === 'string' ? filterValue : '')
      } else if (filterType === 'select') {
        setLocalSelectFilter(
          new Set(Array.isArray(filterValue) ? filterValue.map((v) => String(v)) : [])
        )
      } else if (filterType === 'numeric') {
        setLocalNumericMin(isNumericRangeFilter(filterValue) ? String(filterValue.min ?? '') : '')
        setLocalNumericMax(isNumericRangeFilter(filterValue) ? String(filterValue.max ?? '') : '')
      } else if (filterType === 'date') {
        setLocalDateFrom(isDateRangeFilter(filterValue) ? filterValue.from ?? '' : '')
        setLocalDateTo(isDateRangeFilter(filterValue) ? filterValue.to ?? '' : '')
      }
    }
  }, [isOpen, filterValue, filterType])

  const handleTextFilterChange = (text: string) => {
    setLocalTextFilter(text)
    onFilterChange(text || null)
  }

  const handleSelectChange = (value: string, checked: boolean) => {
    const newSet = new Set(localSelectFilter)
    if (checked) {
      newSet.add(value)
    } else {
      newSet.delete(value)
    }
    setLocalSelectFilter(newSet)
    onFilterChange(newSet.size > 0 ? Array.from(newSet) : null)
  }

  const handleNumericMinChange = (value: string) => {
    setLocalNumericMin(value)
    const min = value !== '' ? Number(value) : undefined
    const max = localNumericMax !== '' ? Number(localNumericMax) : undefined
    if (min !== undefined || max !== undefined) {
      const range: NumericRangeFilter = { type: 'numeric', min, max }
      onFilterChange(range)
    } else {
      onFilterChange(null)
    }
  }

  const handleNumericMaxChange = (value: string) => {
    setLocalNumericMax(value)
    const min = localNumericMin !== '' ? Number(localNumericMin) : undefined
    const max = value !== '' ? Number(value) : undefined
    if (min !== undefined || max !== undefined) {
      const range: NumericRangeFilter = { type: 'numeric', min, max }
      onFilterChange(range)
    } else {
      onFilterChange(null)
    }
  }

  const handleDateFromChange = (value: string) => {
    setLocalDateFrom(value)
    if (value || localDateTo) {
      const range: DateRangeFilter = { type: 'date', from: value || undefined, to: localDateTo || undefined }
      onFilterChange(range)
    } else {
      onFilterChange(null)
    }
  }

  const handleDateToChange = (value: string) => {
    setLocalDateTo(value)
    if (localDateFrom || value) {
      const range: DateRangeFilter = { type: 'date', from: localDateFrom || undefined, to: value || undefined }
      onFilterChange(range)
    } else {
      onFilterChange(null)
    }
  }

  const handleClearFilter = () => {
    setLocalTextFilter('')
    setLocalSelectFilter(new Set())
    setLocalNumericMin('')
    setLocalNumericMax('')
    setLocalDateFrom('')
    setLocalDateTo('')
    onFilterChange(null)
    setIsOpen(false)
  }

  const handleSelectAll = () => {
    const newSet = new Set(uniqueValues.map((v) => String(v)))
    setLocalSelectFilter(newSet)
    onFilterChange(Array.from(newSet))
  }

  const handleDeselectAll = () => {
    setLocalSelectFilter(new Set())
    onFilterChange(null)
  }

  const isActive =
    (filterType === 'text' && localTextFilter.length > 0) ||
    (filterType === 'select' && localSelectFilter.size > 0) ||
    (filterType === 'numeric' && (localNumericMin !== '' || localNumericMax !== '')) ||
    (filterType === 'date' && (localDateFrom !== '' || localDateTo !== ''))

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center justify-center p-0 h-6 w-6 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            isActive ? 'text-primary' : 'text-gray-500'
          }`}
          title={`Filter ${columnName}`}
          aria-label={`Filter ${columnName}`}>
          <Icon
            icon={isActive ? 'solar:filter-line-duotone' : 'solar:filter-line-duotone'}
            width={16}
            height={16}
            className={isActive ? 'text-primary' : 'text-gray-500'}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side='bottom'
        align='end'
        sideOffset={18}
        className={`p-0 ${filterType === 'numeric' || filterType === 'date' ? 'w-64' : 'w-56'}`}>
        <div className='p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <h4 className='text-sm font-medium'>Filter {columnName}</h4>
            {isActive && (
              <button
                onClick={handleClearFilter}
                className='text-xs text-primary hover:underline'>
                Clear
              </button>
            )}
          </div>

          {filterType === 'text' ? (
            <Input
              placeholder={`Search ${columnName}...`}
              value={localTextFilter}
              onChange={(e) => handleTextFilterChange(e.target.value)}
              className='h-8 text-sm'
              autoFocus
            />
          ) : filterType === 'numeric' ? (
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <label className='text-xs text-muted-foreground w-8 shrink-0'>Min</label>
                <Input
                  type='number'
                  placeholder='Min value'
                  value={localNumericMin}
                  onChange={(e) => handleNumericMinChange(e.target.value)}
                  className='h-8 text-sm flex-1'
                  autoFocus
                />
              </div>
              <div className='flex items-center gap-2'>
                <label className='text-xs text-muted-foreground w-8 shrink-0'>Max</label>
                <Input
                  type='number'
                  placeholder='Max value'
                  value={localNumericMax}
                  onChange={(e) => handleNumericMaxChange(e.target.value)}
                  className='h-8 text-sm flex-1'
                />
              </div>
            </div>
          ) : filterType === 'date' ? (
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <label className='text-xs text-muted-foreground w-8 shrink-0'>From</label>
                <Input
                  type='date'
                  value={localDateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className='h-8 text-sm flex-1'
                  autoFocus
                />
              </div>
              <div className='flex items-center gap-2'>
                <label className='text-xs text-muted-foreground w-8 shrink-0'>To</label>
                <Input
                  type='date'
                  value={localDateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className='h-8 text-sm flex-1'
                />
              </div>
            </div>
          ) : (
            <>
              <div className='flex gap-2 text-xs'>
                <button
                  onClick={handleSelectAll}
                  className='text-primary hover:underline'>
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className='text-primary hover:underline'>
                  Deselect All
                </button>
              </div>

              <div className='h-56 border rounded p-2 overflow-y-auto'>
                <div className='space-y-2'>
                  {uniqueValues.map((value) => (
                    <div key={value} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`filter-${columnName}-${value}`}
                        checked={localSelectFilter.has(String(value))}
                        onCheckedChange={(checked) =>
                          handleSelectChange(String(value), checked === true)
                        }
                      />
                      <label
                        htmlFor={`filter-${columnName}-${value}`}
                        className='text-sm cursor-pointer flex-1'>
                        {value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ColumnFilterInput
