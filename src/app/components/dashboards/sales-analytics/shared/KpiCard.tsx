'use client'

import { Card } from '@/components/ui/card'
import { Icon } from '@iconify/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { deltaTone, formatCurrency, formatSignedPercent, NULL_TEXT } from '../format'

/**
 * KpiCard §5.5 / §2.6.
 *
 * - Deltas are signed percentages with an up/down arrow.
 * - Green is not always up: `inverted` flips the colour (outstanding dues,
 *   discount given away, dead stock value).
 * - Optional sub line (e.g. "18.4% margin") and info tooltip (required on
 *   the Gross Profit card).
 */
export function KpiCard({
  label,
  value,
  delta,
  inverted = false,
  icon,
  iconColorClass = 'bg-lightprimary text-primary',
  sub,
  tooltip,
  formatValue = formatCurrency,
}: {
  label: string
  value: number | null | undefined
  delta?: number | null
  inverted?: boolean
  icon: string
  iconColorClass?: string
  sub?: string | null
  tooltip?: string
  formatValue?: (v: number) => string
}) {
  const tone = deltaTone(delta, inverted)
  const isUp = delta != null && Number(delta) > 0
  const arrowIcon = delta == null || Number(delta) === 0 ? '' : isUp ? 'solar:arrow-up-right-bold' : 'solar:arrow-down-right-bold'
  const deltaColor = tone === 'good' ? 'text-success' : tone === 'bad' ? 'text-error' : 'text-muted-foreground'

  return (
    <Card className="h-full min-w-[220px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <p className="card-subtitle">{label}</p>
            {tooltip && (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`About ${label}`}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Icon icon="solar:question-circle-bold" width={15} height={15} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs font-normal leading-relaxed">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div
            className={cn(
              'shrink-0 rounded-md p-2',
              iconColorClass,
            )}
          >
            <Icon icon={icon} className="text-xl" width={20} height={20} />
          </div>
        </div>

        <div>
          <h4 className="text-2xl font-semibold text-dark dark:text-white">
            {value == null ? NULL_TEXT : formatValue(Number(value))}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {delta != null && Number(delta) !== 0 && (
              <span
                className={cn('inline-flex items-center gap-0.5 text-sm font-medium', deltaColor)}
              >
                <Icon icon={arrowIcon} width={16} height={16} />
                {formatSignedPercent(delta)}
              </span>
            )}
            {(delta == null || Number(delta) === 0) && (
              <span className="text-sm text-muted-foreground">
                {delta == null ? NULL_TEXT : formatSignedPercent(delta)}
              </span>
            )}
            {sub && <span className="text-sm text-muted-foreground">{sub}</span>}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default KpiCard