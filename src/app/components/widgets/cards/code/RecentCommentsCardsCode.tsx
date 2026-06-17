'use client'

import Image from 'next/image'
import { format } from 'date-fns'
import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/card'
import { Badge, BadgeProps } from '@/components/ui/badge'

const RecentCommentData = [
  {
    profileimg: '/images/profile/user-3.jpg',
    name: 'James Anderson',
    descp:
      'Lorem Ipsum is simply dummy text of the printing and type etting industry',
    tag: 'Pending',
    tagVariant: 'lightSecondary',
    date: '2025-06-12',
  },
  {
    profileimg: '/images/profile/user-4.jpg',
    name: 'Michael Jorden',
    descp:
      'Lorem Ipsum is simply dummy text of the printing and type etting industry',
    tag: 'Approved',
    tagVariant: 'lightSuccess',
    date: '2025-03-24',
  },
  {
    profileimg: '/images/profile/user-5.jpg',
    name: 'Johnathan Doeting',
    descp:
      'Lorem Ipsum is simply dummy text of the printing and type etting industry',
    tag: 'Rejected',
    tagVariant: 'lightError',
    date: '2025-02-18',
  },
  {
    profileimg: '/images/profile/user-2.jpg',
    name: 'James Anderson',
    descp:
      'Lorem Ipsum is simply dummy text of the printing and type etting industry',
    tag: 'Pending',
    tagVariant: 'lightSecondary',
    date: '2025-02-01',
  },
]

const RecentCommentsCards = () => {
  return (
    <>
      <Card className='lg:max-w-2/4 mx-auto pb-4 p-0'>
        <h3 className='font-semibold text-lg text-inherit p-7'>
          Recent Comments
        </h3>
        <div className='h-[450px] overflow-y-auto'>
          {RecentCommentData.map((item, i) => {
            return (
              <div
                key={i}
                className='flex gap-3.5 p-4 not-last:border-b border-gray-200 dark:border-white/15'>
                <div>
                  <Image
                    src={item?.profileimg}
                    alt='profile-img'
                    width={50}
                    height={50}
                    className='rounded-full'
                  />
                </div>
                <div className='group flex flex-col gap-1'>
                  <h4 className='text-base'>{item?.name}</h4>
                  <p className='text-sm text-darklink'>{item?.descp}</p>
                  <div className='flex items-center gap-4 mt-2'>
                    <Badge
                      variant={item?.tagVariant as BadgeProps['variant']}
                      className='w-fit border-0 py-1'>
                      {item?.tag}
                    </Badge>
                    <div
                      className={`${
                        item?.tag == 'Approved'
                          ? 'flex'
                          : 'group-hover:flex hidden'
                      } items-center gap-4`}>
                      <Icon
                        icon='solar:pen-new-square-linear'
                        width='16'
                        height='16'
                        className='hover:text-primary cursor-pointer'
                      />
                      <Icon
                        icon='solar:unread-linear'
                        width='22'
                        height='22'
                        className='hover:text-primary cursor-pointer'
                      />
                      <Icon
                        icon='solar:heart-linear'
                        width='18'
                        height='18'
                        className={`${
                          item?.tag == 'Approved'
                            ? 'text-error'
                            : 'hover:text-primary'
                        } cursor-pointer`}
                      />
                    </div>
                  </div>
                  <p className='text-sm flex justify-end'>
                    {format(new Date(item?.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </>
  )
}

export default RecentCommentsCards
