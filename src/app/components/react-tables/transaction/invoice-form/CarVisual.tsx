'use client'

import { cn } from '@/lib/utils'

interface CarVisualProps {
  lf: boolean
  rf: boolean
  lr: boolean
  rr: boolean
  onChange: (wheel: 'lf' | 'rf' | 'lr' | 'rr', value: boolean) => void
}

type WheelKey = 'lf' | 'rf' | 'lr' | 'rr'

// Fixed inline positions (percentages) so dynamic Tailwind classes are not needed.
const WHEEL_POSITIONS: Record<WheelKey, { top: string; left: string; label: string }> = {
  lf: { top: '20%', left: '-12px', label: 'LF' }, // left-front
  rf: { top: '20%', left: 'calc(100% - 20px)', label: 'RF' }, // right-front
  lr: { top: '66%', left: '-12px', label: 'LR' }, // left-rear
  rr: { top: '66%', left: 'calc(100% - 20px)', label: 'RR' }, // right-rear
}

/**
 * Top-down CSS car schematic with four interactive tire markers (LF/RF/LR/RR).
 * Each marker is a checkbox sitting on the car at the matching tire position.
 * When a tire is "checked", its marker highlights with the primary color —
 * mirroring the legacy app's car image with checkboxes.
 */
export function CarVisual({ lf, rf, lr, rr, onChange }: CarVisualProps) {
  const state: Record<WheelKey, boolean> = { lf, rf, lr, rr }

  return (
    <div className='flex flex-col items-center justify-center gap-3'>
      <div className='relative h-48 w-32'>
        {/* Car body — pure CSS top-down view */}
        <svg
          viewBox='0 0 100 160'
          className='absolute inset-0 h-full w-full overflow-visible'
          aria-hidden='true'
        >
          {/* Body */}
          <path
            d='M18 30 Q18 8 50 8 Q82 8 82 30 L86 70 Q86 90 82 108 L82 130 Q82 152 50 152 Q18 152 18 130 L14 108 Q14 90 14 70 Z'
            className='fill-primary/20 stroke-primary'
            strokeWidth='1.5'
          />
          {/* Front windshield */}
          <path
            d='M30 34 Q30 22 50 22 Q70 22 70 34 L68 52 Q68 56 50 56 Q32 56 32 52 Z'
            className='fill-primary/30'
          />
          {/* Rear window */}
          <path
            d='M32 108 Q32 104 50 104 Q68 104 68 108 L66 126 Q66 132 50 132 Q34 132 34 126 Z'
            className='fill-primary/25'
          />
          {/* Side mirrors */}
          <circle cx='8' cy='40' r='3.5' className='fill-primary/40' />
          <circle cx='92' cy='40' r='3.5' className='fill-primary/40' />
          {/* Center seam */}
          <line
            x1='50'
            y1='58'
            x2='50'
            y2='104'
            className='stroke-primary'
            strokeWidth='0.7'
            strokeDasharray='2 2'
            opacity={0.4}
          />
        </svg>

        {/* Interactive wheel markers (fixed inline positions) */}
        {(Object.keys(WHEEL_POSITIONS) as WheelKey[]).map((key) => {
          const pos = WHEEL_POSITIONS[key]
          const checked = state[key]
          return (
            <label
              key={key}
              style={{ top: pos.top, left: pos.left }}
              className={cn(
                'absolute flex h-9 w-9 cursor-pointer flex-col items-center justify-center rounded-full border-2 transition-all',
                checked
                  ? 'z-10 scale-110 border-primary bg-primary text-white shadow-md'
                  : 'z-10 border-darklink/40 bg-white text-darklink hover:border-primary hover:text-primary dark:bg-darkgray dark:text-bodytext'
              )}
              title={pos.label}
            >
              <input
                type='checkbox'
                checked={checked}
                onChange={(e) => onChange(key, e.target.checked)}
                className='sr-only'
              />
              <span className='text-[10px] font-bold leading-none'>{pos.label}</span>
            </label>
          )
        })}
      </div>
      <p className='text-center text-xs text-darklink dark:text-bodytext'>
        Tap a tire to mark its service
      </p>
    </div>
  )
}

export default CarVisual