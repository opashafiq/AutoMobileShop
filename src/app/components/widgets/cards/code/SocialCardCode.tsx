import Image from 'next/image'
import { Card } from '@/components/ui/card'

const SocialCards = () => {
  return (
    <Card className='lg:max-w-md mx-auto p-0 overflow-hidden'>
      <div className='relative'>
        <Image
          src={'/images/backgrounds/profile-bg.jpg'}
          alt='profile-bg'
          width={359}
          height={170}
          className='w-full h-[170px]'
        />
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
          <div className='flex flex-col gap-2 items-center '>
            <Image
              src={'/images/profile/user-5.jpg'}
              alt='profile-img'
              width={100}
              height={100}
              className='rounded-full'
            />
            <p className='text-white font-semibold'>John doe</p>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-3 text-center mt-4'>
        <div className='p-4'>
          <h3 className='font-bold text-lg'>12K</h3>
          <p className='text-xs text-gray-500'>Followers</p>
        </div>
        <div className='p-4'>
          <h3 className='font-bold text-lg'>420</h3>
          <p className='text-xs text-gray-500'>Following</p>
        </div>
        <div className='p-4'>
          <h3 className='font-bold text-lg'>128</h3>
          <p className='text-xs text-gray-500'>Tweets</p>
        </div>
      </div>
    </Card>
  )
}

export default SocialCards
