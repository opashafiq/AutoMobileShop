'use client'

import type { ReactNode } from 'react'
import type { QueryState } from '../useDashboardQuery'
import { SkeletonBlock } from './SkeletonBlock'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

/**
 * WidgetState — renders the four states of a widget (§2.4):
 *   1. Loading (skeleton of the widget's dimensions)
 *   2. Loaded with data (the chart/table)
 *   3. Empty (success but empty/all-zero → quiet message)
 *   4. Error (message + Retry that re-fires only this widget)
 *
 * Empty and error are NEVER collapsed into one state.
 */
interface WidgetStateProps<T> {
  query: QueryState<T>
  /** Optional: custom empty detection (e.g. all-zero arrays). Default covers empty arrays / zeroed objects. */
  isEmpty?: (data: T) => boolean
  height?: number | string
  /** Optional: a bespoke skeleton for this widget (defaults to a solid block of `height`). */
  loading?: ReactNode
  emptyMessage?: string
  children: (data: NonNullable<T>) => ReactNode
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/** Default empty detection: empty array, or an object whose fields are all zero/empty. */
export function isResultEmpty(data: unknown): boolean {
  if (data === null || data === undefined) return true
  if (Array.isArray(data)) return data.length === 0
  if (isRecord(data)) {
    const values = Object.values(data)
    if (values.length === 0) return true
    return values.every((v) => {
      if (typeof v === 'number') return v === 0
      if (Array.isArray(v)) return v.length === 0
      if (v === null || v === undefined) return true
      return false
    })
  }
  return false
}

/** true when every element of a numeric array is 0 (gap-filled series with no sales). */
export function isAllZeros(values: number[] | undefined | null): boolean {
  return !!values && values.length > 0 && values.every((v) => !v)
}

export function WidgetState<T>({
  query,
  isEmpty,
  height = 280,
  loading,
  emptyMessage = 'No sales in this period',
  children,
}: WidgetStateProps<T>) {
  if (query.isError && query.data === undefined) {
    return <ErrorState onRetry={query.reload} message={query.error?.message} />
  }

  if (query.data !== undefined) {
    const empty = isEmpty ? isEmpty(query.data) : isResultEmpty(query.data)
    if (empty) return <EmptyState message={emptyMessage} />
    return <>{children(query.data as NonNullable<T>)}</>
  }

  // First paint / retry in-flight — show a skeleton, never a centred spinner.
  return loading ?? <SkeletonBlock height={height} />
}

export default WidgetState