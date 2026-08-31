'use client'

/*
 * DashboardFilterContext — the one shared filter state driving every widget (§2, §5.2).
 *
 * Holds period / custom range / branch selection and mirrors it to the URL query
 * string so a filtered view can be bookmarked and shared. `refresh()` re-fires
 * every active query (manual refresh button); widgets include `refreshKey` in
 * their deps to listen to it.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { DashboardQuery, Period } from './types'

export interface DashboardFilter extends DashboardQuery {
  period: Period
}

export const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'wtd', label: 'This Week' },
  { value: 'mtd', label: 'This Month' },
  { value: 'lastmonth', label: 'Last Month' },
  { value: 'ytd', label: 'This Year' },
  { value: 'lastyear', label: 'Last Year' },
  { value: 'last12m', label: 'Last 12 Months' },
  { value: 'custom', label: 'Custom Range' },
]

export const DEFAULT_PERIOD: Period = 'mtd'

const PERIOD_VALUES: string[] = PERIODS.map((p) => p.value)

interface FilterContextValue {
  filter: DashboardFilter
  /** Serialised shared params, e.g. `period=mtd&locationId=1` — use as a hook dep. */
  filterKey: string
  /** Structured params to send to every endpoint (from/to only for `custom`). */
  sharedParams: Record<string, string | number>
  update: (patch: Partial<DashboardFilter>) => void
  refresh: () => void
  refreshKey: number
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined)

function localIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const todayIso = () => localIso(new Date())
const firstOfThisMonthIso = () => {
  const now = new Date()
  return localIso(new Date(now.getFullYear(), now.getMonth(), 1))
}

function readInitialFilter(params: URLSearchParams): DashboardFilter {
  const rawPeriod = params.get('period')
  const period = rawPeriod && PERIOD_VALUES.includes(rawPeriod) ? (rawPeriod as Period) : DEFAULT_PERIOD
  const filter: DashboardFilter = { period }

  if (period === 'custom') {
    filter.from = params.get('from') || firstOfThisMonthIso()
    filter.to = params.get('to') || todayIso()
  }
  const locationRaw = params.get('locationId')
  if (locationRaw && !Number.isNaN(Number(locationRaw)) && Number(locationRaw) > 0) {
    filter.locationId = Number(locationRaw)
  }
  return filter
}

function buildSharedParams(filter: DashboardFilter): Record<string, string | number> {
  const params: Record<string, string | number> = { period: filter.period }
  if (filter.period === 'custom') {
    if (filter.from) params.from = filter.from
    if (filter.to) params.to = filter.to
  }
  if (filter.locationId != null) params.locationId = filter.locationId
  return params
}

export function DashboardFilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState<DashboardFilter>(() =>
    readInitialFilter(searchParams),
  )
  const [refreshKey, setRefreshKey] = useState(0)

  const update = useCallback((patch: Partial<DashboardFilter>) => {
    setFilter((prev) => {
      const next: DashboardFilter = { ...prev, ...patch }
      // Non-custom periods must not carry a date range.
      if (patch.period && patch.period !== 'custom') {
        delete next.from
        delete next.to
      }
      // Switching to a custom range without explicit dates gives a sensible default.
      if (patch.period === 'custom') {
        if (!next.from) next.from = firstOfThisMonthIso()
        if (!next.to) next.to = todayIso()
      }
      return next
    })
  }, [])

  // Mirror the filter to the URL so the view is shareable/bookmarkable.
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('period', filter.period)
    if (filter.period === 'custom') {
      if (filter.from) params.set('from', filter.from)
      if (filter.to) params.set('to', filter.to)
    }
    if (filter.locationId != null) params.set('locationId', String(filter.locationId))
    const qs = params.toString()
    const target = `${pathname}?${qs}`
    if (searchParams.toString() !== qs) {
      router.replace(target, { scroll: false })
    }
  }, [filter, pathname, router, searchParams])

  const sharedParams = useMemo(() => buildSharedParams(filter), [filter])
  const filterKey = useMemo(() => JSON.stringify(sharedParams), [sharedParams])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const value = useMemo<FilterContextValue>(
    () => ({ filter, filterKey, sharedParams, update, refresh, refreshKey }),
    [filter, filterKey, sharedParams, update, refresh, refreshKey],
  )

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useDashboardFilter(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) {
    throw new Error('useDashboardFilter must be used within DashboardFilterProvider')
  }
  return ctx
}

export default DashboardFilterProvider