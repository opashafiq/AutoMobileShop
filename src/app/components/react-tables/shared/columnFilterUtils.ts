/**
 * Utility functions for column filtering
 * Provides smart detection of filter types and helper functions
 */

export type FilterType = 'text' | 'select' | 'date' | 'numeric'

/** Range filter for numeric columns (min/max) */
export interface NumericRangeFilter {
  type: 'numeric'
  min?: number
  max?: number
}

/** Range filter for date columns (from/to) */
export interface DateRangeFilter {
  type: 'date'
  from?: string
  to?: string
}

/**
 * Detect filter type based on sample data from a column
 * @param data Array of values from the column
 * @returns FilterType ('text', 'select', 'date', or 'numeric')
 */
export function detectFilterType(data: (string | number | undefined)[]): FilterType {
  if (!data || data.length === 0) return 'text'

  // Filter out undefined/null values
  const validValues = data.filter((v) => v !== undefined && v !== null)
  if (validValues.length === 0) return 'text'

  // Check for date pattern (ISO date or common date formats)
  const datePattern =
    /^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{4}|^\d{1,2}-\d{1,2}-\d{4}/
  const dateCount = validValues.filter((v) => datePattern.test(String(v))).length

  if (dateCount / validValues.length > 0.5) return 'date'

  // Check if numeric (more than 50% of values are of type number)
  const numericCount = validValues.filter((v) => typeof v === 'number').length
  if (numericCount / validValues.length > 0.5) return 'numeric'

  // Check if we should use select (few unique values, < 50 unique values)
  const uniqueValues = new Set(validValues.map((v) => String(v)))
  if (uniqueValues.size <= 20) return 'select'

  return 'text'
}

/**
 * Type guard for NumericRangeFilter
 */
export function isNumericRangeFilter(value: unknown): value is NumericRangeFilter {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as NumericRangeFilter).type === 'numeric'
  )
}

/**
 * Type guard for DateRangeFilter
 */
export function isDateRangeFilter(value: unknown): value is DateRangeFilter {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as DateRangeFilter).type === 'date'
  )
}

/**
 * Extract unique values from column data for select filters
 * @param data Array of values from the column
 * @returns Sorted array of unique values
 */
export function getUniqueValues(
  data: (string | number | undefined)[]
): (string | number)[] {
  const unique = Array.from(
    new Set(data.filter((v) => v !== undefined && v !== null).map((v) => String(v)))
  )
  return unique.sort()
}

/**
 * Filter data by column value (text match)
 * @param value Column value to check
 * @param filterValue Filter input (partial match)
 * @returns true if value matches filter
 */
export function textFilter(
  value: string | number | undefined,
  filterValue: string
): boolean {
  if (!value) return false
  return String(value).toLowerCase().includes(filterValue.toLowerCase())
}

/**
 * Filter data by exact column value (for select filters)
 * @param value Column value to check
 * @param filterValues Array of selected filter values
 * @returns true if value is in filterValues
 */
export function selectFilter(
  value: string | number | undefined,
  filterValues: (string | number)[]
): boolean {
  if (!value) return false
  return filterValues.includes(String(value))
}

/**
 * Filter data by numeric range (min/max)
 * @param value Column value to check
 * @param filter Range with optional min and max
 * @returns true if value is within the range
 */
export function numericRangeFilter(
  value: string | number | undefined,
  filter: NumericRangeFilter
): boolean {
  // If value is undefined/null, only pass if no bounds are set
  if (value === undefined || value === null) {
    return filter.min === undefined && filter.max === undefined
  }

  const numValue = Number(value)
  if (isNaN(numValue)) return false

  if (filter.min !== undefined && numValue < filter.min) return false
  if (filter.max !== undefined && numValue > filter.max) return false

  return true
}

/**
 * Filter data by date range (from/to)
 * @param value Column value to check
 * @param filter Range with optional from and to date strings
 * @returns true if value is within the date range
 */
export function dateRangeFilter(
  value: string | number | undefined,
  filter: DateRangeFilter
): boolean {
  // If value is undefined/null, only pass if no bounds are set
  if (value === undefined || value === null) {
    return filter.from === undefined && filter.to === undefined
  }

  const dateValue = new Date(value)
  if (isNaN(dateValue.getTime())) return false

  if (filter.from) {
    const fromDate = new Date(filter.from)
    if (!isNaN(fromDate.getTime()) && dateValue < fromDate) return false
  }

  if (filter.to) {
    const toDate = new Date(filter.to)
    // Include the entire "to" day by setting to end of day
    toDate.setHours(23, 59, 59, 999)
    if (!isNaN(toDate.getTime()) && dateValue > toDate) return false
  }

  return true
}

/**
 * Shape of a single column filter state.
 * - `null`  -> filter cleared / ignore this column
 * - `string` -> text (partial) match
 * - `string[]` -> multi-select (exact match against any of the values)
 * - `NumericRangeFilter` -> numeric min/max range
 * - `DateRangeFilter` -> date from/to range
 */
export type ColumnFilterValue = string | string[] | NumericRangeFilter | DateRangeFilter | null

/**
 * Apply a set of column filters to an array of rows.
 *
 * Generic over the row type so any datatable (TaxType, DailyExpenseType, …)
 * can reuse it without depending on a concrete model.
 *
 * @param data          Rows to filter
 * @param columnFilters Map of column key -> filter value (see ColumnFilterValue)
 * @returns Rows that satisfy every active (non-null) filter
 */
export function applyColumnFilters<T extends Record<string, unknown>>(
  data: T[],
  columnFilters: Record<string, ColumnFilterValue>
): T[] {
  if (!columnFilters || Object.keys(columnFilters).length === 0) return data

  return data.filter((row) => {
    for (const [columnKey, filterValue] of Object.entries(columnFilters)) {
      if (filterValue === null) continue

      const cellValue = row[columnKey] as string | number | undefined

      if (isNumericRangeFilter(filterValue)) {
        if (!numericRangeFilter(cellValue, filterValue)) return false
      } else if (isDateRangeFilter(filterValue)) {
        if (!dateRangeFilter(cellValue, filterValue)) return false
      } else if (Array.isArray(filterValue)) {
        if (!selectFilter(cellValue, filterValue)) return false
      } else if (typeof filterValue === 'string') {
        if (!textFilter(cellValue, filterValue)) return false
      }
    }
    return true
  })
}
