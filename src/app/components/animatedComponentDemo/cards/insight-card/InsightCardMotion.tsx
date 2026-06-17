'use client'

import { useEffect, useState } from 'react'
import { ShoppingBasket } from 'lucide-react'
import { Card } from '@/components/ui/card'

// Replay Animation is optional , you should remove it while using the code

export default function InsightCardMotion({ replayAnimation = 0 }: any) {
  const [count, setCount] = useState(0)
  const [progressCount, setProgressCount] = useState(0)

  const target = 259
  const duration = 1500
  const progressTarget = 40

  useEffect(() => {
    const interval = setInterval(() => {
      setProgressCount((prev) => {
        if (prev < progressTarget) {
          return prev + 1
        } else {
          clearInterval(interval)
          return prev
        }
      })
    }, 30)

    return () => clearInterval(interval)
  }, [replayAnimation])

  useEffect(() => {
    if (replayAnimation) {
      setProgressCount(0)
    }
  }, [replayAnimation])

  useEffect(() => {
    let startTime: number | null = null

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentCount = Math.floor(progress * target)

      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [replayAnimation])

  return (
    <Card className='!p-4 max-w-md'>
      <div className='grid grid-cols-12 gap-4 items-center'>
        <div className='col-span-2'>
          <div className='bg-warning/10 text-warning rounded flex items-center justify-center p-2'>
            <ShoppingBasket className='w-7 h-7' />
          </div>
        </div>

        <div className='col-span-9 flex items-center justify-end text-right'>
          <div>
            <h4 className='text-xl font-semibold'>+{count}</h4>
            <h6 className='text-sm text-gray-500'>Sales Change</h6>
          </div>
        </div>
      </div>

      <div
        key={replayAnimation}
        className='w-full bg-gray-100 rounded-full h-2 mt-3'>
        <div
          className='bg-warning h-2 rounded-full'
          style={{ width: `${progressCount}%` }}
        />
      </div>
    </Card>
  )
}
