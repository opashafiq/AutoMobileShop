import Image from 'next/image'
import { Button } from '@/components/ui/button'

const DownloaadBannerCode = () => {
  return (
    <>
      <div className='p-6 rounded-2xl bg-lightprimary dark:bg-lightprimary shadow-none pb-0 relative'>
        <div className='grid grid-cols-12 gap-6'>
          <div className='md:col-span-6 col-span-12'>
            <h5 className='text-lg mt-2 font-semibold'>
              Track your every Transaction Easily
            </h5>
            <p className='text-sm font-medium text-inherit opacity-75 py-5'>
              Track and record your every income and expence easily to control
              your balance
            </p>
            <Button>Download</Button>
          </div>
          <div className='md:col-span-6 col-span-12'>
            <Image
              src='/images/backgrounds/track-bg.png'
              alt='banner'
              className='ms-auto'
              width={168}
              height={195}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default DownloaadBannerCode
