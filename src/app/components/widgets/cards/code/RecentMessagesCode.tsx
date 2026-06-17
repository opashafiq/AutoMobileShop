'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'

const messages = [
  {
    id: 1,
    name: 'Pavan Kumar',
    email: 'info@wrappixel.com',
    avatar: '/images/profile/user-1.jpg',
    status: 'online',
  },
  {
    id: 2,
    name: 'Els Idunn',
    email: 'pamela1987@gmail.com',
    avatar: '/images/profile/user-2.jpg',
    status: 'away',
  },
  {
    id: 3,
    name: 'Arijit Sinh',
    email: 'cruise1298.fplip@gmail.com',
    avatar: '/images/profile/user-3.jpg',
    status: 'away',
  },
  {
    id: 4,
    name: 'Micheal Doe',
    email: 'kat@gmail.com',
    avatar: '/images/profile/user-4.jpg',
    status: 'away',
  },
  {
    id: 5,
    name: 'Alexandra',
    email: 'pamela1987@gmail.com',
    avatar: '/images/profile/user-5.jpg',
    status: 'away',
  },
  {
    id: 6,
    name: 'James Smith',
    email: 'info@wrappixel.com',
    avatar: '/images/profile/user-6.jpg',
    status: 'online',
  },
]

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  away: 'bg-orange-500',
}

const RecentMessagess = () => {
  return (
    <Card className='lg:max-w-md mx-auto pb-4 p-0'>
      <h3 className='text-lg font-semibold text-dark dark:text-white p-7'>
        Messages
      </h3>
      <div className='h-[350px] overflow-y-auto'>
        <ul className='divide-y'>
          {messages.map((msg) => (
            <li key={msg.id} className='flex items-center gap-5 p-4 px-6'>
              <div className='relative'>
                <Image
                  src={msg.avatar}
                  alt={msg.name}
                  width={40}
                  height={40}
                  className='rounded-full'
                />
                <span
                  className={`absolute top-0.5 right-0.5 block h-1.5 w-1.5 rounded-full ring-2 ring-white ${
                    statusColors[msg.status]
                  }`}
                />
              </div>
              <div>
                <h4 className='text-base'>{msg.name}</h4>
                <p className='text-sm text-darklink'>{msg.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

export default RecentMessagess
