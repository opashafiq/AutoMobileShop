'use client'

/*
 * useDashboardQuery — fetch + AbortController data hook for the dashboard.
 *
 * Requirements it satisfies (§2.3, §5.3):
 *  - Aborts in-flight requests when the filter changes, so a slow response
 *    can never overwrite a newer one.
 *  - Every widget gets four states: loading / loaded / empty / error (the
 *    caller renders these through <WidgetState />).
 *  - `reload` retries this single query only, not the whole page.
 *  - `loadedAt` stamps each successful response, for "updated at …" headers.
 *
 * `deps` must be an array of primitives (strings / numbers) — pass
 * `[filter.identifier]` or `[filter.identifier, threshold]`. The effect
 * re-runs (aborting the previous request) whenever a dependency changes.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface QueryState<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | undefined
  /** Timestamp of the last successful response (undefined until one lands). */
  loadedAt: Date | undefined
  reload: () => void
}

interface UseDashboardQueryOptions<T> {
  fetcher: (signal?: AbortSignal) => Promise<T>
  /** Primitive dependency values; a change aborts + re-runs the request. */
  deps?: unknown[]
  enabled?: boolean
}

export function useDashboardQuery<T>(options: UseDashboardQueryOptions<T>): QueryState<T> {
  const { enabled = true } = options
  const [reloadTick, setReloadTick] = useState(0)
  const [result, setResult] = useState<{
    data: T | undefined
    isLoading: boolean
    isError: boolean
    error: Error | undefined
    loadedAt: Date | undefined
  }>({
    data: undefined,
    isLoading: true,
    isError: false,
    error: undefined,
    loadedAt: undefined,
  })

  // Keep the latest fetcher without putting its (render-varying) identity in the
  // dep array. Written from an effect — never during render (react-hooks/refs).
  const fetcherRef = useRef(options.fetcher)
  useEffect(() => {
    fetcherRef.current = options.fetcher
  }, [options.fetcher])

  const depsKey = JSON.stringify(options.deps ?? [])

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    let active = true

    // Transition to "loading" inside the async chain, never synchronously in the
    // effect body (react-hooks/set-state-in-effect wants updates in callbacks).
    Promise.resolve().then(() => {
      if (!active) return
      setResult((prev) => ({ ...prev, isLoading: true, isError: false, error: undefined }))
    })

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!active) return
        setResult({ data, isLoading: false, isError: false, error: undefined, loadedAt: new Date() })
      })
      .catch((err: unknown) => {
        if (!active) return
        if (err instanceof Error && err.name === 'AbortError') return
        setResult({
          data: undefined,
          isLoading: false,
          isError: true,
          error: err instanceof Error ? err : new Error(String(err)),
          loadedAt: undefined,
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [enabled, reloadTick, depsKey])

  const reload = useCallback(() => {
    // Bump a tick so the effect re-runs (which aborts any in-flight request first).
    setReloadTick((t) => t + 1)
  }, [])

  return {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    loadedAt: result.loadedAt,
    reload,
  }
}

export default useDashboardQuery