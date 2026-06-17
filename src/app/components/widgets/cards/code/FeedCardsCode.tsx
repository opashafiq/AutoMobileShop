'use client'

import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'

const feeds = [
  {
    icon: 'solar:bell-linear',
    text: 'You have 4 pending tasks.',
    time: 'Just Now',
    color: 'text-primary',
    bg: 'bg-lightprimary',
    border: 'border-l-primary',
  },
  {
    icon: 'solar:database-linear',
    text: 'Server #1 overloaded',
    time: '2 Hr Ago',
    color: 'text-success',
    bg: 'bg-lightsuccess',
    border: 'border-l-success',
  },
  {
    icon: 'solar:map-point-linear',
    text: 'New order received.',
    time: '31 May',
    color: 'text-warning',
    bg: 'bg-lightwarning',
    border: 'border-l-warning',
  },
  {
    icon: 'solar:microphone-linear',
    text: 'New user registered.',
    time: '30 May',
    color: 'text-error',
    bg: 'bg-lighterror',
    border: 'border-l-error',
  },
  {
    icon: 'solar:home-wifi-linear',
    text: 'New Version just arrived.',
    time: '27 May',
    color: 'text-secondary',
    bg: 'bg-lightsecondary',
    border: 'border-l-secondary',
  },
]

const FeedsCard = () => {
  return (
    <Card className='lg:max-w-md mx-auto p-7 flex flex-col gap-6'>
      <h3 className='font-semibold text-lg mb-2'>Feeds</h3>

      <div className='flex flex-col gap-5'>
        {feeds.map((feed, index) => (
          <div
            key={index}
            className={`flex items-center justify-between border-l-2 ${feed.border} pl-3`}>
            <div className='flex items-center gap-3'>
              <span className={`p-2 rounded-full ${feed.bg}`}>
                <Icon
                  icon={feed.icon}
                  className={`${feed.color}`}
                  width='20'
                  height='20'
                />
              </span>
              <span className='text-sm'>{feed.text}</span>
            </div>
            <span className='text-xs text-gray-400 whitespace-nowrap'>
              {feed.time}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default FeedsCard
