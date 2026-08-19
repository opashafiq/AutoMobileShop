import React from 'react'

interface WheelIndicatorProps {
  lf: boolean
  rf: boolean
  lr: boolean
  rr: boolean
}

/**
 * Read-only car wheel position indicator.
 * Uses explicit fill/stroke hex colors for SVG paths (Tailwind utility classes
 * don't work reliably inside inline SVGs, which caused the all-black rendering).
 */
export default function WheelIndicator({ lf, rf, lr, rr }: WheelIndicatorProps) {
  return (
    <div className='flex flex-col items-center gap-1'>
      <h3 className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5'>
        Wheel Position
      </h3>

      {/* 3-col grid: left wheels | car | right wheels */}
      <div className='grid grid-cols-3 grid-rows-2 gap-x-3 gap-y-1 items-center'>
        {/* LF */}
        <div className='flex justify-end'>
          <WheelBadge label='LF' active={lf} />
        </div>
        {/* Car SVG (center, spans both rows) */}
        <svg
          viewBox='0 0 100 160'
          className='w-14 h-20 row-span-2 justify-self-center'
          aria-hidden='true'
        >
          {/* Body */}
          <path
            d='M18 30 Q18 8 50 8 Q82 8 82 30 L86 70 Q86 90 82 108 L82 130 Q82 152 50 152 Q18 152 18 130 L14 108 Q14 90 14 70 Z'
            fill='#f1f5f9'
            stroke='#cbd5e1'
            strokeWidth='1.5'
          />
          {/* Front windshield */}
          <path
            d='M30 34 Q30 22 50 22 Q70 22 70 34 L68 52 Q68 56 50 56 Q32 56 32 52 Z'
            fill='#e2e8f0'
          />
          {/* Rear window */}
          <path
            d='M32 108 Q32 104 50 104 Q68 104 68 108 L66 126 Q66 132 50 132 Q34 132 34 126 Z'
            fill='#e2e8f0'
          />
          {/* Center seam */}
          <line
            x1='50' y1='58' x2='50' y2='104'
            stroke='#cbd5e1'
            strokeWidth='0.7'
            strokeDasharray='2 2'
            opacity={0.4}
          />
        </svg>
        {/* RF */}
        <div className='flex justify-start'>
          <WheelBadge label='RF' active={rf} />
        </div>
        {/* LR */}
        <div className='flex justify-end'>
          <WheelBadge label='LR' active={lr} />
        </div>
        {/* RR */}
        <div className='flex justify-start'>
          <WheelBadge label='RR' active={rr} />
        </div>
      </div>
    </div>
  )
}

function WheelBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold border ${
        active
          ? 'bg-blue-600 border-blue-700 text-white'
          : 'bg-slate-100 border-slate-300 text-slate-400'
      }`}
      title={`${label} ${active ? '(selected)' : ''}`}
    >
      {label}
    </div>
  )
}
