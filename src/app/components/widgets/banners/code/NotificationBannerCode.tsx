import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const NotificationBannerCode = () => {
  return (
    <>
      <Card>
        <p className='text-sm text-darklink text-center mb-2'>LEVEL UP</p>
        <Image
          src='/images/backgrounds/gold.png'
          alt='banner'
          className='mx-auto w-[150px]'
          width={150}
          height={150}
        />
        <div className='text-center mx-auto mt-3'>
          <h5 className='text-lg'>You reach all Notifications</h5>
          <p className='text-darklink mt-2 md:px-12'>
            Congratulations, Tap to continue next task.
          </p>
          <div className='flex justify-center mt-3'>
            <Button>Yes,Got it!</Button>
          </div>
        </div>
      </Card>
    </>
  )
}

export default NotificationBannerCode
