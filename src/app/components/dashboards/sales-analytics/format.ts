/*
 * Formatting helpers for the Sales & Inventory Dashboard (§2.5).
 *
 * - Currency: USD symbol, en-US locale, 2 decimals. Abbreviated ($1.2M / $450K)
 *   on chart axes only — never in tables or KPI cards.
 * - Percentages: one decimal, always signed on deltas (+12.4% / -3.1%).
 * - Dates: `dd MMM yyyy` in tables, `MMM yyyy` on the monthly axis.
 * - Nulls: rendered as "—", never `null`, `undefined`, `0` or an empty cell.
 */

export const NULL_TEXT = '—'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
})

const isBlank = (v: unknown): v is null | undefined => v === null || v === undefined

/** Full currency, e.g. "$1,284.00". Null → "—". */
export function formatCurrency(v: number | null | undefined): string {
  if (isBlank(v) || Number.isNaN(Number(v))) return NULL_TEXT
  return currencyFormatter.format(Number(v))
}

/** Plain number with thousands separators. Null → "—". */
export function formatNumber(v: number | null | undefined, digits = 0): string {
  if (isBlank(v) || Number.isNaN(Number(v))) return NULL_TEXT
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(v))
}

/** Abbreviated currency for chart axes only: $1.2M, $450K, $950. */
export function formatCurrencyAbbrev(v: number): string {
  const abs = Math.abs(v)
  if (!Number.isFinite(v)) return String(v)
  if (abs >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${Math.round(v / 1_000)}K`
  return `$${Math.round(v)}`
}

/** Abbreviated plain number for axes: 1.2M, 450K, 918. */
export function formatNumberAbbrev(v: number): string {
  const abs = Math.abs(v)
  if (!Number.isFinite(v)) return String(v)
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${Math.round(v / 1_000)}K`
  return `${Math.round(v)}`
}

/** Signed percentage with one decimal: "+12.4%" / "-3.1%". Null → "—". */
export function formatSignedPercent(v: number | null | undefined): string {
  if (isBlank(v) || Number.isNaN(Number(v))) return NULL_TEXT
  const n = Number(v)
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

/** Plain percentage with one decimal: "12.4%". Null → "—". */
export function formatPercent(v: number | null | undefined): string {
  if (isBlank(v) || Number.isNaN(Number(v))) return NULL_TEXT
  return `${Number(v).toFixed(1)}%`
}

/** ISO 8601 date → "14 Jun 2026". Null / invalid → "—". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return NULL_TEXT
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return NULL_TEXT
  return dateFormatter.format(d)
}

/** ISO 8601 datetime → "Jun 2026". Null / invalid → "—". */
export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return NULL_TEXT
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return NULL_TEXT
  return monthFormatter.format(d)
}

const shortDayFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
})

/** ISO 8601 datetime → "14 Jun" (chart axis). Null / invalid → "—". */
export function formatShortDay(iso: string | null | undefined): string {
  if (!iso) return NULL_TEXT
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return NULL_TEXT
  return shortDayFormatter.format(d)
}

/** A JS Date → "02:35 PM". Used for the last-refreshed stamp. */
export function formatTime(date: Date): string {
  return timeFormatter.format(date)
}

/** Delta cell: arrow icon + signed percentage, green for good, red for bad. */
export function deltaTone(delta: number | null | undefined, inverted = false): 'good' | 'bad' | 'neutral' {
  if (isBlank(delta) || Number.isNaN(Number(delta)) || Number(delta) === 0) return 'neutral'
  const positive = Number(delta) > 0
  // inverted: a rise is bad (outstanding dues, discount given away, dead stock value)
  return positive !== inverted ? 'good' : 'bad'
}

export const isNullish = isBlank