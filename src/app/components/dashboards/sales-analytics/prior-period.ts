/*
 * previousPeriodQuery — the symmetric "previous period" window used for
 * per-position trend lines in the Tire Positions tooltip.
 *
 * Semantics and assumptions (documented, per CLAUDE.md pre-evaluation):
 *  - custom:    same-length window immediately before [from, to] — exact.
 *  - today:     the backend's named 'yesterday' period.
 *  - yesterday: a one-day custom range, two days back.
 *  - wtd:       same-day-length window 7 days earlier; the week is assumed to
 *               start on Sunday, matching the heatmap's 0=Sunday rows.
 *  - mtd:       the backend's named 'lastmonth' period.
 *  - lastmonth: the month before last month (custom range) — 'lastmonth' has
 *               no named predecessor.
 *  - ytd:       the backend's named 'lastyear' period.
 *  - lastyear:  a custom range covering the full year before last year.
 *  - last12m:   the trailing window 12–24 months back (365-day approximation).
 */

import type { DashboardFilter } from './filter-context'
import type { DashboardQuery } from './types'

const DAY_MS = 86_400_000

function parseIso(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

function toLocalIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function todayStart(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

export function previousPeriodQuery(filter: DashboardFilter): DashboardQuery | null {
  const today = todayStart()

  switch (filter.period) {
    case 'custom': {
      if (!filter.from || !filter.to) return null
      const from = parseIso(filter.from)
      const to = parseIso(filter.to)
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return null
      const lengthDays = Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1
      const prevTo = addDays(from, -1)
      const prevFrom = addDays(prevTo, -(lengthDays - 1))
      return { period: 'custom', from: toLocalIso(prevFrom), to: toLocalIso(prevTo) }
    }
    case 'today':
      return { period: 'yesterday' }
    case 'yesterday': {
      const day = addDays(today, -2)
      return { period: 'custom', from: toLocalIso(day), to: toLocalIso(day) }
    }
    case 'wtd': {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Sunday start
      return {
        period: 'custom',
        from: toLocalIso(addDays(weekStart, -7)),
        to: toLocalIso(addDays(today, -7)),
      }
    }
    case 'mtd':
      return { period: 'lastmonth' }
    case 'lastmonth': {
      // The month before last month, first..last day.
      const firstOfLast = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const start = new Date(firstOfLast.getFullYear(), firstOfLast.getMonth() - 1, 1)
      const end = new Date(firstOfLast.getFullYear(), firstOfLast.getMonth(), 0)
      return { period: 'custom', from: toLocalIso(start), to: toLocalIso(end) }
    }
    case 'ytd':
      return { period: 'lastyear' }
    case 'lastyear': {
      const year = today.getFullYear() - 2
      return { period: 'custom', from: `${year}-01-01`, to: `${year}-12-31` }
    }
    case 'last12m': {
      const prevTo = addDays(today, -365)
      const prevFrom = addDays(prevTo, -364)
      return { period: 'custom', from: toLocalIso(prevFrom), to: toLocalIso(prevTo) }
    }
    default:
      return null
  }
}

export default previousPeriodQuery
