'use client'

import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'

/**
 * Empty state — the call succeeded but returned nothing usable.
 * Distinct from the error state: this is quiet, not alarming (§2.4).
 */
export function EmptyState({
  message = 'No sales in this period',
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-10 text-center',
        className,
      )}
    >
      <Icon icon="solar:inbox-line-duotone" className="text-3xl text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export default EmptyState