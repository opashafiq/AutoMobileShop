'use client'

import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const UserProfileCards = () => {
  return (
    <Card className='lg:max-w-[450px] mx-auto p-0 flex flex-col items-center text-center'>
      <div className='p-6 flex items-center gap-6 w-full'>
        <Image
          src='/images/profile/user-7.jpg'
          alt='Profile'
          width={100}
          height={100}
          className='rounded-full'
        />
        <div className='flex flex-col gap-3 items-start'>
          <div className='flex flex-col items-start'>
            <h3 className='mt-3 font-semibold text-lg'>Daniel Kristeen</h3>
            <p className='text-sm text-gray-500'>UIUX Designer</p>
          </div>
          <Button size={'sm'} variant={'lightprimary'} className='text-base'>
            + Follow
          </Button>
        </div>
      </div>

      <div className='p-6 grid grid-cols-3 justify-around w-full'>
        <div className='flex flex-col items-center'>
          <p className='font-bold text-2xl text-ld mb-0.5'>14</p>
          <p className='text-xs text-gray-500'>Photos</p>
        </div>
        <div className='flex flex-col items-center'>
          <p className='font-bold text-2xl text-ld mb-0.5'>54</p>
          <p className='text-xs text-gray-500'>Videos</p>
        </div>
        <div className='flex flex-col items-center'>
          <p className='font-bold text-2xl text-ld mb-0.5'>145</p>
          <p className='text-xs text-gray-500'>Tasks</p>
        </div>
      </div>

      <div className='w-full border-t border-ld'></div>

      <div className='p-6'>
        <div className='text-sm text-gray-600 leading-relaxed'>
          Lorem ipsum dolor sit ametetur adipisicing elit, sed do eiusmod tempor
          incididunt adipisicing elit, sed do eiusmod tempor incididunLorem
          ipsum dolor sit ametetur adipisicing elit, sed do eiusmod tempor
          incididuntt
        </div>

        <div className='flex justify-center gap-6 py-4'>
          <Icon
            icon='mdi:web'
            className='text-2xl text-gray-600 hover:text-black cursor-pointer'
          />
          <Icon
            icon='mdi:twitter'
            className='text-2xl text-gray-600 hover:text-sky-500 cursor-pointer'
          />
          <Icon
            icon='mdi:facebook'
            className='text-2xl text-gray-600 hover:text-blue-600 cursor-pointer'
          />
        </div>
      </div>
    </Card>
  )
}

export default UserProfileCards
