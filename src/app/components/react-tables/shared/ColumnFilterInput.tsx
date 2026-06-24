'use client'

import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Icon } from '@iconify/react/dist/iconify.js'
import { FilterType, detectFilterType, getUniqueValues } from './columnFilterUtils'

interface ColumnFilterInputProps {
  columnData: (string | number | undefined)[]
  filterValue?: string | string[]
  onFilterChange: (value: string | string[] | null) => void
  columnName: string
  filterType?: FilterType
}

/**
 * Smart column filter component
 * Renders text input for text columns, checkbox list for select columns
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

  // Detect filter type if not provided
  const filterType = propsFilterType || detectFilterType(columnData)
  const uniqueValues = useMemo(
    () => (filterType === 'select' ? getUniqueValues(columnData) : []),
    [columnData, filterType]
  )

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

  const handleClearFilter = () => {
    setLocalTextFilter('')
    setLocalSelectFilter(new Set())
    onFilterChange(null)
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
    (filterType === 'select' && localSelectFilter.size > 0)

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

      <PopoverContent className='w-56 p-0'>
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
