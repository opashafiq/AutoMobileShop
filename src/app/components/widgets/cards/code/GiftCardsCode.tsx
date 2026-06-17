'use client'

import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const GiftCards = () => {
  return (
    <>
      <div className='grid grid-cols-12 gap-6 lg:max-w-3/4 mx-auto'>
        <div className='sm:col-span-6 col-span-12'>
          <Card>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-lg font-semibold text-dark dark:text-white'>
                Andrew Grant
              </h3>
              <Icon
                icon='solar:gift-outline'
                className='text-primary'
                height={20}
              />
            </div>
            <Image
              src='/images/products/s1.jpg'
              alt='maaterialm'
              className='rounded-lg w-full object-cover h-[150px]'
              width={300}
              height={150}
            />
            <Button className='mt-4 w-full'>Gift to Friend ($50.00)</Button>
          </Card>
        </div>
        <div className='sm:col-span-6 col-span-12'>
          <Card>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-lg font-semibold text-dark dark:text-white'>
                Leo Pratt{' '}
              </h3>
              <Icon
                icon='solar:gift-outline'
                className='text-primary'
                height={20}
              />
            </div>
            <Image
              src='/images/products/s2.jpg'
              alt='maaterialm'
              className='rounded-lg w-full object-cover h-[150px]'
              width={300}
              height={150}
            />
            <Button className='mt-4 w-full'>Gift to Friend ($50.00)</Button>
          </Card>
        </div>
      </div>
    </>
  )
}

export default GiftCards
