'use client'

import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const UserInfoCards = () => {
  return (
    <Card className='lg:max-w-[450px] mx-auto p-0 flex flex-col items-center text-center'>
      <div className='p-6 flex flex-col items-center text-center'>
        <Avatar className='h-28 w-28'>
          <AvatarImage src='/images/profile/user-1.jpg' alt='Mathew Anderson' />
          <AvatarFallback>MA</AvatarFallback>
        </Avatar>

        <h3 className='mt-4 font-semibold text-lg'>Mathew Anderson</h3>
        <p className='text-sm text-muted-foreground'>
          danielkristeen@gmail.com
        </p>

        <div className='flex flex-wrap gap-2 mt-4'>
          <Badge variant='lightPrimary' className='border-0'>
            Dashboard
          </Badge>
          <Badge variant='lightPrimary' className='border-0'>
            UI
          </Badge>
          <Badge variant='lightPrimary' className='border-0'>
            UX
          </Badge>
          <Badge className='bg-blue-500 text-white hover:bg-blue-600'>+3</Badge>
        </div>
      </div>

      <div className='w-full border-t border-ld' />

      <div className='p-6 grid grid-cols-2 gap-4 w-full justify-around'>
        <Button variant='lightprimary' className='flex items-center gap-2'>
          <Icon icon='solar:chat-dots-linear' className='h-5 w-5' />
          Message
        </Button>
        <Button variant='lightprimary' className='flex items-center gap-2'>
          <Icon icon='solar:case-linear' className='h-5 w-5' />
          Portfolio
        </Button>
      </div>
    </Card>
  )
}

export default UserInfoCards
