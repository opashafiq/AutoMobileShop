import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const avatars = [
  '/images/profile/user-6.jpg',
  '/images/profile/user-7.jpg',
  '/images/profile/user-8.jpg',
  '/images/profile/user-5.jpg',
]

const ReviewsCard = () => {
  return (
    <Card className='lg:max-w-sm mx-auto p-7 flex flex-col gap-9 items-start text-center'>
      <div className='flex flex-col items-start gap-1'>
        <h3 className='font-semibold text-lg'>Reviews</h3>
        <p className='text-sm text-muted-foreground'>Overview of Review</p>
      </div>
      <div className='flex flex-col gap-1 items-start'>
        <div className='flex flex-col gap-1 items-start'>
          <h4 className='text-2xl text-ld font-semibold'>25426</h4>
          <p className='text-sm text-muted-foreground'>
            This month we got 346 New Reviews
          </p>
        </div>
        <div className='flex items-center gap-2 py-4'>
          {avatars?.map((value) => {
            return (
              <Image
                src={value}
                alt='avatar'
                width={45}
                height={45}
                className='rounded-full'
              />
            )
          })}
        </div>
        <div className='mt-3'>
          <Button size={'sm'}>Checkout All Reviews</Button>
        </div>
      </div>
    </Card>
  )
}

export default ReviewsCard
