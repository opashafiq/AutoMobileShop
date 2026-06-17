import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const SellingProducts = () => {
  return (
    <Card className='lg:max-w-1/3 md:max-w-2/4 mx-auto p-0 overflow-hidden'>
      <div className='bg-primary'>
        <div className='p-8 pb-0'>
          <h5 className='text-lg font-semibold text-white'>
            Best Selling Products
          </h5>
          <p className='text-sm text-white dark:text-white'>Overview 2023</p>
          <div className='flex justify-center  mt-3'>
            <Image
              src='/images/backgrounds/piggy.png'
              alt='pigggy-bg'
              width={251}
              height={162}
            />
          </div>
        </div>
        <div className='px-2 pb-2'>
          <div className='bg-white dark:dark:bg-dark-header p-6 rounded-[7px]'>
            <div className='mb-8'>
              <div className='flex justify-between items-center mb-3'>
                <div>
                  <h6 className='text-base mb-0.5 text-inherit'>MaterialPro</h6>
                  <p>$23,568</p>
                </div>
                <div>
                  <Badge
                    variant={'lightPrimary'}
                    className='text-sm rounded-md py-1.1'>
                    55%
                  </Badge>
                </div>
              </div>
              {/* Progress */}
              <Progress value={55} variant='primary' />
              {/* End Progress */}
            </div>
            <div>
              <div className='flex justify-between items-center mb-3'>
                <div>
                  <h6 className='text-base mb-0.5'>MaterialPro</h6>
                  <p>$23,568</p>
                </div>
                <div>
                  <Badge
                    color={'lightsecondary'}
                    className='text-sm rounded-md py-1.1'>
                    55%
                  </Badge>
                </div>
              </div>
              {/* Progress */}
              <Progress value={65} variant='secondary' />
              {/* End Progress */}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default SellingProducts
