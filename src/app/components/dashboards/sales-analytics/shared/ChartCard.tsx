'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/**
 * ChartCard — the standard card shell for every dashboard widget.
 * Uses card-title / card-subtitle from the design system and an optional
 * action slot (selector, tabs, …) in the header.
 */
export function ChartCard({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <Card className={cn('h-full', className)}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div>
            <h5 className="card-title">{title}</h5>
            {subtitle && <p className="card-subtitle mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        <div className="min-w-0 grow">{children}</div>
      </div>
    </Card>
  )
}

export default ChartCard