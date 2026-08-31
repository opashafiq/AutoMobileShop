'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { SkeletonBlock } from './SkeletonBlock'

/**
 * LazyLoad — mounts its children only once they scroll near the viewport
 * (§2.3). Used for the six widgets that are NOT part of the overview response so
 * they are never fired on page load:
 *   heatmap · customer mix · vehicle makes · tire positions · low stock · dead stock
 *
 * When a child mounts it starts its own request; when the shared filter changes
 * the child's query re-runs because it stays mounted after first activation.
 */
export function LazyLoad({
  children,
  height = 260,
  rootMargin = '250px 0px',
}: {
  children: ReactNode
  height?: number | string
  rootMargin?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      // Very old environments: fall back to mounting immediately, but defer the
      // state update out of the effect body (react-hooks/set-state-in-effect).
      const t = window.setTimeout(() => setVisible(true), 0)
      return () => window.clearTimeout(t)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible, rootMargin])

  return <div ref={ref}>{visible ? children : <SkeletonBlock height={height} />}</div>
}

export default LazyLoad