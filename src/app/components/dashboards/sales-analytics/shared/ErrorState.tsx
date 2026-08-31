'use client'

import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Error state — the endpoint failed. Shows the real message plus a Retry button
 * that re-fires THIS widget only, never the whole page (§2.4).
 */
export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message?: string
  onRetry: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-10 text-center',
        className,
      )}
    >
      <Icon icon="solar:cloud-xmark-bold" className="text-3xl text-error" />
      <p className="max-w-sm text-sm text-muted-foreground">
        {message || 'Failed to load data.'}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <Icon icon="solar:restart-linear" className="text-base mr-1.5" />
        Retry
      </Button>
    </div>
  )
}

export default ErrorState