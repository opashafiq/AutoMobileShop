"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  DayPicker,
  useDayPicker,
  type DateRange,
  type DropdownProps,
  type Matcher,
} from "react-day-picker"
import { format, isValid, parse } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /** Grey out (and disable) every date after today. Per-picker rule. */
  disableFuture?: boolean
  /** Show quick range picks (Today, Last 7/30/90 days, This Month) — range mode only. */
  showPresets?: boolean
  /** Commit the drafted range: renders Apply/Cancel in the footer (range mode). */
  onApply?: (range: DateRange | undefined) => void
  /** Discard the drafted range: renders Cancel in the footer (range mode). */
  onCancel?: () => void
  /** Pair the calendar with a typeable "MM-DD-YYYY" input (single-date modes). */
  allowTyping?: boolean
}

/**
 * Year range shown in the header year dropdown. Kept to a sensible window so
 * the list stays short to scroll; a picker can override via `fromYear`/`toYear`
 * (e.g. birth-year pickers pass an older `fromYear`, and the year select also
 * accepts keyboard typing while focused).
 */
const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_FROM_YEAR = CURRENT_YEAR - 10
const DEFAULT_TO_YEAR = CURRENT_YEAR + 10

/**
 * Users' region (US): weeks start on Sunday. Each picker can override via the
 * `weekStartsOn` prop.
 */
const DEFAULT_WEEK_STARTS_ON = 0

/** Format used to display and parse manually typed dates. */
const DATE_DISPLAY_FORMAT = "MM-dd-yyyy"

/** Midnight of the day after today — `disableFuture` matcher so today stays selectable. */
function endOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
}

/**
 * Pick a representative date from a react-day-picker `selected` value so the
 * calendar can open on the selected date's month instead of always the current
 * month (the default when only `selected` is provided).
 */
function monthFromSelected(selected: unknown): Date | undefined {
  if (!selected) return undefined
  if (selected instanceof Date) return selected
  if (Array.isArray(selected)) {
    for (const item of selected) {
      const d = monthFromSelected(item)
      if (d) return d
    }
    return undefined
  }
  if (typeof selected === 'object') {
    const maybe = selected as { from?: Date; to?: Date }
    return maybe.from || maybe.to || undefined
  }
  return undefined
}

/**
 * Replacement for the library's default `Dropdown` element. The default one
 * stacks an accessibility label, the native <select> *and* a styled display
 * element that only the library's own stylesheet overlaps correctly. Without
 * it they all render visibly, which looked like three copies of the header.
 * We render a single compact native <select> instead (also accepts typing
 * while focused, for quick year jumps like "2019" + Enter).
 */
function CompactDropdown(props: DropdownProps) {
  const { classNames } = useDayPicker()
  return (
    <select
      name={props.name}
      aria-label={props['aria-label']}
      className={cn(props.className, classNames.dropdown)}
      style={props.style}
      value={props.value}
      onChange={props.onChange}
    >
      {props.children}
    </select>
  )
}

/** Footer that lets power users type a date instead of clicking days. */
function TypedDateFooter({
  selected,
  onSelect,
  disableFuture,
}: {
  selected?: Date | undefined
  onSelect?: ((date: Date | undefined) => void) | undefined
  disableFuture?: boolean
}) {
  const [value, setValue] = React.useState<string>("")
  const [hasError, setHasError] = React.useState(false)

  // Two-way sync: reflect externally changed selections into the input
  // (derived during render, per https://react.dev/learn/you-might-not-need-an-effect).
  const [prevSelected, setPrevSelected] = React.useState(selected)
  if (prevSelected !== selected) {
    setPrevSelected(selected)
    setValue(selected ? format(selected, DATE_DISPLAY_FORMAT) : "")
    setHasError(false)
  }

  const commit = () => {
    const raw = value.trim()
    if (!raw) return
    let parsed = parse(raw, DATE_DISPLAY_FORMAT, new Date())
    if (!isValid(parsed)) {
      parsed = parse(raw, 'yyyy-MM-dd', new Date())
    }
    if (!isValid(parsed) || (disableFuture && parsed > new Date())) {
      setHasError(true)
      return
    }
    onSelect?.(parsed)
    setHasError(false)
  }

  return (
    <div className="space-y-1 pt-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Type a date"
          placeholder="Type MM-DD-YYYY (or YYYY-MM-DD), then Enter"
          className={cn(
            "h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm",
            "text-dark dark:text-white placeholder:text-muted-foreground",
            "outline-none transition-colors",
            "focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
            hasError && "border-error focus-visible:ring-error"
          )}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setHasError(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
          }}
          onBlur={commit}
        />
      </div>
      {hasError && (
        <p className="text-xs text-error">Please type a valid date, e.g. 11-18-2026.</p>
      )}
    </div>
  )
}

/** Footer for range pickers: quick presets plus Apply/Cancel so data only reloads once. */
function RangeFooter({
  range,
  onApply,
  onCancel,
  onSelect,
  showPresets,
}: {
  range?: DateRange | undefined
  onApply?: (range: DateRange | undefined) => void
  onCancel?: (() => void) | undefined
  onSelect?: ((range: DateRange | undefined) => void) | undefined
  showPresets?: boolean
}) {
  const presets = React.useMemo(() => {
    const today = new Date()
    const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n)
    return [
      { label: 'Today', range: { from: daysAgo(0), to: daysAgo(0) } },
      { label: 'Last 7 days', range: { from: daysAgo(6), to: daysAgo(0) } },
      { label: 'Last 30 days', range: { from: daysAgo(29), to: daysAgo(0) } },
      { label: 'Last 90 days', range: { from: daysAgo(89), to: daysAgo(0) } },
      { label: 'This Month', range: { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today } },
    ]
  }, [])

  const canApply = Boolean(
    range?.from && range?.to && range.from.getTime() <= range.to.getTime()
  )

  return (
    <div className="space-y-2 pt-2">
      {showPresets && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              aria-label={`Set range to ${preset.label}`}
              onClick={() => onSelect?.(preset.range)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 rounded-full px-2.5 py-0 text-xs text-primary"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onCancel?.()}
          className={cn(buttonVariants({ variant: "ghost" }), "h-7 px-2.5 py-0 text-xs")}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canApply}
          onClick={() => onApply?.(range)}
          className={cn(buttonVariants({ variant: "default" }), "h-7 px-3 py-0 text-xs")}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown-buttons",
  fromYear = DEFAULT_FROM_YEAR,
  toYear = DEFAULT_TO_YEAR,
  weekStartsOn = DEFAULT_WEEK_STARTS_ON,
  disableFuture = false,
  showPresets = false,
  allowTyping = true,
  onApply,
  onCancel,
  footer: hostFooter,
  disabled: disabledProp,
  components: hostComponents,
  ...props
}: CalendarProps) {
  const isRange = props.mode === 'range'
  const isSingle = props.mode === undefined || props.mode === 'single' || props.mode === 'default'
  const { onSelect: hostOnSelect, selected: hostSelected } = props as {
    onSelect?: unknown
    selected?: unknown
  }

  const disabledList: Matcher[] = []
  if (disableFuture) {
    disabledList.push({ after: endOfToday() })
  }
  if (disabledProp !== undefined) {
    disabledList.push(
      ...((Array.isArray(disabledProp) ? disabledProp : [disabledProp]) as Matcher[])
    )
  }

  const footer = hostFooter ?? (isRange && (onApply || onCancel || showPresets)
    ? (
      <RangeFooter
        range={hostSelected as DateRange | undefined}
        onApply={onApply}
        onCancel={onCancel}
        onSelect={hostOnSelect as
          | ((range: DateRange | undefined, day?: Date) => void)
          | undefined}
        showPresets={showPresets}
      />
    )
    : null)

  const typedDateFooter = !isRange && isSingle && allowTyping ? (
    <TypedDateFooter
      selected={hostSelected as Date | undefined}
      onSelect={hostOnSelect as
        | ((date: Date | undefined, day?: Date) => void)
        | undefined}
      disableFuture={disableFuture}
    />
  ) : null

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-card border-border", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-1 sm:space-y-0",
        month: "space-y-2",
        caption: "flex justify-center pt-0 relative items-center text-dark dark:text-white pb-1",
        caption_label: "text-sm font-medium",
        caption_dropdowns: "flex items-center gap-1",
        /* The library renders a visible fallback label here when its own CSS
         * is not loaded; sr-only keeps it for screen readers only. */
        vhidden: "sr-only",
        /* Month & year are compact native selects, selectable separately so
         * users can jump straight to e.g. 3 years back instead of clicking
         * through the navigation one month at a time. */
        dropdown: cn(
          "h-8 cursor-pointer select-none rounded-md border border-transparent",
          "bg-transparent px-2 text-sm font-semibold text-dark dark:text-white",
          "outline-none transition-colors hover:bg-accent",
          "focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-accent"
        ),
        dropdown_month: "capitalize",
        dropdown_year: "",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-bodytext dark:text-bodytext rounded-md w-10 font-medium text-xs",
        row: "flex w-full mt-1.5",
        /* 40px cells so touch targets stay usable on mobile. */
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal text-dark dark:text-bodytext",
          "focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white focus-visible:bg-primary focus-visible:text-white ring-1 ring-primary",
        /* Today is marked with a dot underneath so the selected day remains
         * the only solid fill (the dot simply disappears when today is
         * selected). */
        day_today: cn(
          "relative",
          "after:content-[''] after:pointer-events-none after:absolute",
          "after:bottom-1 after:left-1/2 after:-translate-x-1/2",
          "after:h-1 after:w-1 after:rounded-full after:bg-primary"
        ),
        /* Days from neighbouring months are dimmed so they can't be mistaken
         * for current-month dates. They stay clickable and select the date in
         * that adjacent month. */
        day_outside:
          "day-outside text-muted-foreground opacity-40 dark:opacity-30 aria-selected:bg-primary aria-selected:text-white",
        day_disabled: "text-muted-foreground opacity-40 dark:opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: CompactDropdown,
        IconLeft: ({ className, ...iconProps }: React.ComponentPropsWithoutRef<'svg'>) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...iconProps} />
        ),
        IconRight: ({ className, ...iconProps }: React.ComponentPropsWithoutRef<'svg'>) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...iconProps} />
        ),
        ...hostComponents,
      }}
      captionLayout={captionLayout}
      fromYear={fromYear}
      toYear={toYear}
      weekStartsOn={weekStartsOn}
      disabled={disabledList.length ? disabledList : undefined}
      footer={footer ?? typedDateFooter}
      {...props}
      defaultMonth={props.month ?? props.defaultMonth ?? monthFromSelected(props.selected)}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
