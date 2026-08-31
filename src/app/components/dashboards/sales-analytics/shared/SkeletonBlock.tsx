'use client'

import { cn } from '@/lib/utils'

/**
 * Skeleton shimmer matching a widget's final dimensions (§2.4).
 * Sized from the parent so the layout doesn't jump when data arrives.
 */
export function SkeletonBlock({
  height = 280,
  className,
}: {
  height?: number | string
  className?: string
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className={cn('animate-pulse w-full rounded-lg bg-muted/70', className)}
      style={{ height }}
    />
  )
}

/** A card-shaped skeleton: title line + body block. */
export function SkeletonCard({
  height = 280,
  className,
}: {
  height?: number | string
  className?: string
}) {
  return (
    <div className={cn('animate-pulse space-y-4', className)} aria-busy="true">
      <div className="space-y-2">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted/60" />
      </div>
      <SkeletonBlock height={height} />
    </div>
  )
}

/** Row skeleton used for list-based widgets (low stock, dead stock). */
export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-muted" />
            <div className="space-y-1.5">
              <div className="h-3 w-36 rounded bg-muted" />
              <div className="h-2.5 w-20 rounded bg-muted/60" />
            </div>
          </div>
          <div className="h-3 w-14 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export default SkeletonBlock