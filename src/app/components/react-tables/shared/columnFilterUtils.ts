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
