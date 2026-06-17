'use client'

import Image from 'next/image'
import { Icon } from '@iconify/react'

const WelcomeCard = () => {
  return (
    <div className='p-6 rounded-2xl bg-lightprimary dark:bg-lightprimary overflow-hidden relative'>
      <div className='grid grid-cols-12'>
        <div className='lg:col-span-7 md:col-span-7 sm:col-span-12 col-span-12'>
          <div className='flex gap-3 items-center mb-9'>
            <div className='rounded-full overflow-hidden'>
              <Image
                src='/images/profile/user-1.jpg'
                className='h-10 w-10'
                alt='user-image'
                width={40}
                height={40}
              />
            </div>
            <h5 className='text-lg lg:whitespace-nowrap font-semibold'>
              Welcome back Natalia!
            </h5>
          </div>
          <div className='flex gap-6 items-center'>
            <div className='pe-6 rtl:pe-auto rtl:ps-6  border-e border-border border-opacity-20  dark:border-darkborder'>
              <h3 className='flex items-start mb-0 text-3xl font-semibold'>
                $2,340
                <Icon
                  icon='tabler:arrow-up-right'
                  className='text-base  text-success'
                />
              </h3>
              <p className='text-sm mt-1'>Today’s Sales</p>
            </div>
            <div className=''>
              <h3 className='flex items-start mb-0 text-3xl font-semibold'>
                35%
                <Icon
                  icon='tabler:arrow-up-right'
                  className='text-base  text-success'
                />
              </h3>
              <p className='text-sm mt-1'>Overall Performance</p>
            </div>
          </div>
        </div>
        <div className='lg:col-span-5 md:col-span-5 sm:col-span-12 col-span-12'>
          <div className='sm:absolute relative right-0 rtl:right-auto rtl:left-0 -bottom-8'>
            <Image
              src='/images/backgrounds/welcome-bg.svg'
              alt='background-image'
              className='w-full'
              width={271}
              height={165}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeCard
