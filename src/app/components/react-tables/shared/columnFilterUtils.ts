/**
 * Utility functions for column filtering
 * Provides smart detection of filter types and helper functions
 */

export type FilterType = 'text' | 'select' | 'date'


/**
 * Detect filter type based on sample data from a column
 * @param data Array of values from the column
 * @returns FilterType ('text', 'select', or 'date')
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

  // Check if we should use select (few unique values, < 50 unique values)
  const uniqueValues = new Set(validValues.map((v) => String(v)))
  if (uniqueValues.size <= 20) return 'select'

  return 'text'
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
 * Shape of a single column filter state.
 * - `null`  -> filter cleared / ignore this column
 * - `string` -> text (partial) match
 * - `string[]` -> multi-select (exact match against any of the values)
 */
export type ColumnFilterValue = string | string[] | null

/**
 * Apply a set of column filters to an array of rows.
 *
 * Generic over the row type so any datatable (TaxType, Contact, Product, …)
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

      if (Array.isArray(filterValue)) {
        // Multiple selection filter
        if (!selectFilter(cellValue, filterValue)) return false
      } else if (typeof filterValue === 'string') {
        // Text (partial match) filter
        if (!textFilter(cellValue, filterValue)) return false
      }
    }
    return true
  })
}



