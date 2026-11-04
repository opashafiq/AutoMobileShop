'use client'

import React from 'react'
import { addDays, format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DateRange } from 'react-day-picker'

const DateRangePickerCode = () => {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  })
  // Draft selection: the calendar edits this, and only "Apply" commits it to
  // the displayed value — clicking days does not fire the change twice.
  const [draft, setDraft] = React.useState<DateRange | undefined>(date)

  return (
    <>
      <div className='flex flex-wrap items-center gap-3 max-w-sm'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id='date'
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}>
              <CalendarIcon />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'MM-dd-yyyy')} -{' '}
                    {format(date.to, 'MM-dd-yyyy')}
                  </>
                ) : (
                  format(date.from, 'MM-dd-yyyy')
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-full p-0' align='start'>
            <Calendar
              initialFocus
              mode='range'
              defaultMonth={draft?.from}
              selected={draft}
              onSelect={setDraft}
              onApply={(range) => {
                if (range?.from && range?.to) {
                  setDate(range)
                  setDraft(range)
                }
                setOpen(false)
              }}
              onCancel={() => {
                setDraft(date)
                setOpen(false)
              }}
              showPresets
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}

export default DateRangePickerCode
