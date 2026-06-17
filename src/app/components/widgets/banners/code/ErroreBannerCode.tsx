import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ErroreBannerCode = () => {
  return (
    <>
      <Card>
        <Image
          src='/images/backgrounds/website-under-construction.svg'
          alt='banner'
          className='mx-auto w-48'
          width={192}
          height={192}
        />
        <div className='text-center mx-auto'>
          <h5 className='text-lg'>Oops something went wrong!</h5>
          <p className='text-darklink mt-2 md:px-12'>
            Trying again to bypasses these temporary error.
          </p>
          <div className='flex justify-center mt-3'>
            <Button variant={'error'}>Retry</Button>
          </div>
        </div>
      </Card>
    </>
  )
}

export default ErroreBannerCode
