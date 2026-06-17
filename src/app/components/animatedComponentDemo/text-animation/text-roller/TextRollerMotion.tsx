'use client'

import { useEffect, useState } from 'react'

const greetings = [
  { text: 'Initializing ...', color: 'text-orange-400' },
  { text: 'Fetching Data...', color: 'text-green-500' },
  { text: 'Rendering...', color: 'text-purple-400' },
  { text: 'System Ready ', color: 'text-gray-400' },
]

export default function TextRollerMotion() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % greetings.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className=' flex items-center justify-start text-2xl'>
      <div className='flex gap-2'>
        <h2 className='text-lg text-forest-black'>Hello, Tailwind Admin</h2>
        <div className='overflow-hidden h-[1.5rem] text-center'>
          <div
            className='transition-transform duration-700 ease-in-out'
            style={{ transform: `translateY(-${index * 1.5}rem)` }}>
            {greetings.map((g, i) => (
              <h1
                key={i}
                className={`${g.color} h-[1.5rem] flex items-center justify-start text-lg `}>
                {g.text}
              </h1>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
