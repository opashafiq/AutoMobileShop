'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Icon } from '@iconify/react'

interface DateFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

/**
 * Report filter-bar date picker, designed to match the datepickers used in
 * transaction/Layaway: an outline button that shows the picked date (or a
 * "Pick a Date" placeholder) with a calendar icon, opening a Calendar popover.
 * The value/onChange contract stays as ISO `yyyy-MM-dd` strings so report
 * queries and the rest of the filter bar are unaffected.
 */
function toISO(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function DateField({ label, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? new Date(`${value}T00:00:00`) : undefined

  return (
    <div className='min-w-[160px] max-w-[240px]'>
      <Label className='mb-1.5 block text-sm font-medium text-ld dark:text-darklink'>
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className='h-10 w-full justify-start text-left font-normal text-ld border-ld'
            aria-label={label}>
            {selected ? (
              format(selected, 'dd/MM/yyyy')
            ) : (
              <span className='text-darklink'>Pick a Date</span>
            )}
            <Icon icon='solar:calendar-linear' width={16} height={16} className='ml-auto shrink-0 opacity-60' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={selected}
            onSelect={(date) => {
              onChange(date ? toISO(date) : '')
              setOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}