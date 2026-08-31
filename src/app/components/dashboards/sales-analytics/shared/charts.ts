'use client'

import { useContext } from 'react'
import { CustomizerContext } from '@/app/context/CustomizerContext'

/**
 * The one categorical colour sequence for every chart on the dashboard.
 *
 * Multi-category charts (donut, grouped series) consume it in order so the
 * same rank always wears the same colour; single-series bar charts take the
 * first entry. Residual/"Other" buckets sit outside the sequence — see
 * NEUTRAL_COLOR. CSS vars so the Customizer's theme switch still applies.
 */
export const CHART_COLORS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-info)',
  'var(--color-error)',
  // Neutral slate for 7th+ categories — mid-gray that reads on light and dark.
  '#94a3b8',
  '#b6bac7',
] as const

/** Colour for residual/"Other" buckets — deliberately outside the sequence. */
export const NEUTRAL_COLOR = '#94a3b8'

/**
 * Shared ApexCharts theme helpers.
 *
 * Keeps every chart in the dashboard on the design system colours and matches
 * the templates' tooltip / gridline / font styling.
 */
export function useChartTheme() {
  const { activeMode } = useContext(CustomizerContext)
  const dark = activeMode === 'dark'

  return {
    dark,
    tooltipTheme: dark ? 'dark' : 'light',
    // Matches RevenueUpdate.tsx / Sales.tsx etc.
    foreColor: '#adb0bb',
    grid: {
      borderColor: 'rgba(0,0,0,0.1)',
      strokeDashArray: 3,
    },
    fontFamily: 'inherit',
  }
}

/** Generic tooltip config used across charts. */
export function chartTooltip(theme: 'dark' | 'light') {
  return {
    theme,
    fillSeriesColor: false,
  } as const
}

/**
 * Generic ApexCharts options bag.
 *
 * ApexCharts' own option typings are internally inconsistent — e.g. axis label
 * formatters are declared `(value: string, …)` yet the library invokes them with
 * numbers — which is why the entire repo threads chart options as
 * `Record<string, any>`. This alias keeps that deliberate `any` at a single,
 * documented boundary instead of scattering it across every chart file.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChartOptions = Record<string, any>

export type ChartTheme = ReturnType<typeof useChartTheme>
export default useChartTheme